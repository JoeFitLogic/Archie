// stripe-metrics — MRR, revenue, cash, failed, chase state, recoveries, backfill
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return json({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id; const mode = p.mode;
    console.log("tenant_id:", tenant_id, "mode:", mode);
    if (!tenant_id) return json({ error: "tenant_id required" }, 400);

    const { data: t } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
    if (t?.status !== "active") return json({ ok: true, skipped: "tenant not active" });

    const { data: cfg } = await supabase.from("tenant_config")
      .select("stripe_key, currency, fx_rate, fx_base, timezone").eq("tenant_id", tenant_id).single();
    if (!cfg?.stripe_key) {
      await logRun(tenant_id, "financials", "done", "No Stripe connected");
      return json({ ok: true, skipped: "no stripe_key", summary: "No Stripe connected" });
    }

    const stripe = new Stripe(cfg.stripe_key, { apiVersion: "2024-06-20" });
    const baseCcy = (cfg.currency ?? "gbp").toLowerCase();
    const fx = Number(cfg.fx_rate ?? 0.79);
    const toBase = (minor: number, ccy: string) => ccy.toLowerCase() === baseCcy ? minor / 100 : (minor / 100) * fx;

    if (mode === "backfill") return await backfill(stripe, tenant_id, toBase);

    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86400;
    const monthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(addMonths(new Date(), -1));
    const fourteenDaysAgo = now - 14 * 86400;
    const today = new Date().toISOString().slice(0, 10);

    // ---- MRR ----
    let mrr = 0, mrrNew = 0, mrrNewLast = 0;
    const mrrByCust = new Map<string, number>();
    const pastDue = new Map<string, number>();
    for (const status of ["active", "past_due", "trialing"] as const) {
      for await (const sub of stripe.subscriptions.list({ status, limit: 100, expand: ["data.discounts"] })) {
        if (sub.pause_collection) continue;
        for (const item of sub.items.data) {
          const rec = item.price.recurring;
          if (!rec || rec.interval !== "month" || rec.interval_count !== 1) continue;
          let amt = (item.price.unit_amount ?? 0) * (item.quantity ?? 1);
          amt = applyDiscount(amt, sub.discounts as any[]);
          const val = toBase(amt, item.price.currency);
          mrr += val;
          const cust = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
          mrrByCust.set(cust, (mrrByCust.get(cust) ?? 0) + val);
          if (sub.created >= monthStart) mrrNew += val;
          else if (sub.created >= lastMonthStart) mrrNewLast += val;
          if (status === "past_due") pastDue.set(cust, val);
        }
      }
    }

    // ---- Charges ----
    let revenueMtd = 0, cash24h = 0, cash24hCount = 0;
    const failedByCust = new Map<string, { amount: number; reason: string; email: string | null; at: number }>();
    const lastPaid = new Map<string, number>();
    const isPlatform = (ch: Stripe.Charge) =>
      !!(ch.metadata as any)?.rechargeType ||
      /auto-recharge|3ds verification|phonenumberpurchase/i.test(ch.description ?? "");

    for await (const ch of stripe.charges.list({ created: { gte: Math.min(monthStart, fourteenDaysAgo) }, limit: 100 })) {
      if (isPlatform(ch)) continue;
      const cust = typeof ch.customer === "string" ? ch.customer : ch.customer?.id;
      if (ch.status === "succeeded" && ch.paid && !ch.refunded) {
        const val = toBase(ch.amount, ch.currency);
        if (ch.created >= monthStart) revenueMtd += val;
        if (ch.created >= dayAgo) { cash24h += val; cash24hCount++; }
        if (cust) lastPaid.set(cust, Math.max(lastPaid.get(cust) ?? 0, ch.created));
      }
      if (ch.status === "failed" && ch.created >= fourteenDaysAgo && cust) {
        const prev = failedByCust.get(cust);
        if (!prev || ch.created > prev.at)
          failedByCust.set(cust, { amount: toBase(ch.amount, ch.currency), reason: ch.failure_message ?? ch.failure_code ?? "declined", email: ch.billing_details?.email ?? null, at: ch.created });
      }
    }
    // Resolved: a successful charge after the latest failure
    for (const [cust, f] of failedByCust) if ((lastPaid.get(cust) ?? 0) > f.at) failedByCust.delete(cust);
    for (const [cust, val] of pastDue) if (!failedByCust.has(cust)) failedByCust.set(cust, { amount: val, reason: "past_due", email: null, at: now });

    // ---- Chase state ----
    const { data: clients } = await supabase.from("clients").select("id, email, chase_status, chase_first_failed").eq("tenant_id", tenant_id).eq("status", "active");
    const byEmail = new Map((clients ?? []).filter(c => c.email).map(c => [c.email!.toLowerCase(), c]));
    const chase: string[] = [], unmatched: string[] = [];
    let failedCount = 0, failedValue = 0;
    const failingEmails = new Set<string>();

    for (const [cust, f] of failedByCust) {
      if (!f.email) { try { const c = await stripe.customers.retrieve(cust); if (!("deleted" in c)) f.email = c.email ?? null; } catch {} }
      const client = f.email ? byEmail.get(f.email.toLowerCase()) : undefined;
      if (!client) { unmatched.push(`${f.email ?? cust} £${f.amount.toFixed(0)}`); failedCount++; failedValue += f.amount; continue; }
      failingEmails.add(f.email!.toLowerCase());
      if (["recovered", "unresponsive", "cancelled"].includes(client.chase_status ?? "")) continue;
      if (!client.chase_status) { await supabase.from("clients").update({ chase_status: "new", chase_first_failed: today }).eq("id", client.id); client.chase_first_failed = today; }
      chase.push(`${f.email} £${f.amount.toFixed(0)} ${f.reason} ${daysBetween(client.chase_first_failed ?? today, today)}d`);
      failedCount++; failedValue += f.amount;
    }
    // recovered: was chasing, no longer failing
    for (const c of clients ?? []) {
      if (["new", "chasing"].includes(c.chase_status ?? "") && c.email && !failingEmails.has(c.email.toLowerCase())) {
        const { data: last } = await supabase.from("daily_metrics").select("failed_value").eq("tenant_id", tenant_id).order("metric_date", { ascending: false }).limit(1).maybeSingle();
        const amt = Number(last?.failed_value ?? 0);
        await supabase.from("recoveries").insert({ tenant_id, client_id: c.id, amount: amt, failed_on: c.chase_first_failed, days_to_recover: daysBetween(c.chase_first_failed ?? today, today) });
        await supabase.from("clients").update({ chase_status: "recovered" }).eq("id", c.id);
      }
    }

    // ---- Write ----
    await supabase.from("daily_metrics").upsert({
      tenant_id, metric_date: today, mrr: r2(mrr), mrr_new: r2(mrrNew), revenue_mtd: r2(revenueMtd),
      cash_24h: r2(cash24h), failed_count: failedCount, failed_value: r2(failedValue),
    }, { onConflict: "tenant_id,metric_date" });

    const summary = `MRR £${r0(mrr)} | New £${r0(mrrNew)}/£${r0(mrrNewLast)} | MTD £${r0(revenueMtd)} | 24h £${r0(cash24h)}/${cash24hCount} | Failed ${failedCount}\nCHASE: ${chase.length ? chase.join("; ") : "none"}\nUNMATCHED: ${unmatched.length ? unmatched.join("; ") : "none"}\nINCOMPLETE: none`;
    await logRun(tenant_id, "financials", "done", summary);
    return json({ ok: true, summary, mrr: r2(mrr), mrr_new: r2(mrrNew), revenue_mtd: r2(revenueMtd), cash_24h: r2(cash24h), failed_count: failedCount });
  } catch (e) { return json({ error: String(e) }, 500); }
});

async function backfill(stripe: Stripe, tenant_id: string, toBase: (m: number, c: string) => number) {
  const subs: { created: number; ended: number | null; monthly: number }[] = [];
  for (const status of ["active", "past_due", "trialing", "canceled"] as const) {
    for await (const s of stripe.subscriptions.list({ status, limit: 100 })) {
      for (const it of s.items.data) {
        const r = it.price.recurring; if (!r || r.interval !== "month" || r.interval_count !== 1) continue;
        subs.push({ created: s.created, ended: s.ended_at ?? s.canceled_at ?? null, monthly: toBase((it.price.unit_amount ?? 0) * (it.quantity ?? 1), it.price.currency) });
      }
    }
  }
  const rows = [];
  for (let d = 90; d >= 1; d--) {
    const day = new Date(Date.now() - d * 86400000); const ts = Math.floor(day.getTime() / 1000);
    const mrr = subs.filter(s => s.created <= ts && (!s.ended || s.ended > ts)).reduce((a, s) => a + s.monthly, 0);
    rows.push({ tenant_id, metric_date: day.toISOString().slice(0, 10), mrr: r2(mrr) });
  }
  await supabase.from("daily_metrics").upsert(rows, { onConflict: "tenant_id,metric_date", ignoreDuplicates: true });
  return json({ ok: true, backfilled: rows.length });
}
async function logRun(tenant_id: string, agent: string, status: string, summary: string) {
  const now = new Date().toISOString();
  await supabase.from("agent_runs").insert({ tenant_id, agent, trigger: "schedule", status, started_at: now, finished_at: now, summary });
}
function applyDiscount(amt: number, discounts: any[] | undefined) {
  if (!discounts?.length) return amt;
  for (const d of discounts) { const c = typeof d === "string" ? null : d.coupon; if (!c) continue; if (c.percent_off) amt = amt * (1 - c.percent_off / 100); else if (c.amount_off) amt = Math.max(0, amt - c.amount_off); }
  return amt;
}
function startOfMonth(d: Date) { return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000); }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function daysBetween(a: string, b: string) { return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000); }
function r2(n: number) { return Math.round(n * 100) / 100; }
function r0(n: number) { return Math.round(n); }
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }