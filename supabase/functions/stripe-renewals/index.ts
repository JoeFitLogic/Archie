// stripe-renewals — expiring cards, ending subs, converting trials → tasks
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17?target=deno";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  console.log("stripe-renewals v2 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    const { data: t } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });
    const { data: cfg } = await supabase.from("tenant_config").select("stripe_key").eq("tenant_id", tenant_id).single();
    if (!cfg?.stripe_key) return j({ ok: true, skipped: "no stripe_key" });
    const stripe = new Stripe(cfg.stripe_key, { apiVersion: "2024-06-20" });
    const now = Math.floor(Date.now() / 1000), in30 = now + 30 * 86400, in7 = now + 7 * 86400;
    const { data: clients } = await supabase.from("clients").select("id,email").eq("tenant_id", tenant_id);
    const byEmail = new Map((clients ?? []).filter(c => c.email).map(c => [c.email!.toLowerCase(), c.id]));
    const { data: owner } = await supabase.from("team_members").select("handle").eq("tenant_id", tenant_id).eq("gets_financials", true).limit(1).single();
    const ownerHandle = owner?.handle ?? "owner";
    const items: { ref: string; title: string; detail: string; due: string; email: string | null }[] = [];

    for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.customer", "data.default_payment_method"] })) {
      const cust = sub.customer as Stripe.Customer; const email = cust.email ?? null; const name = cust.name ?? email ?? cust.id;
      const pm = sub.default_payment_method as Stripe.PaymentMethod | null;
      if (pm?.card) {
        const exp = new Date(pm.card.exp_year, pm.card.exp_month, 0).getTime() / 1000;
        if (exp <= in30) items.push({ ref: `renewal:card:${cust.id}`, title: `${name} card expires ${pm.card.exp_month}/${pm.card.exp_year}`, detail: `Card ending ${pm.card.last4} on subscription ${sub.id}. Ask them to update before it fails.`, due: iso(exp - 7 * 86400), email });
      }
      if (sub.cancel_at_period_end || (sub.cancel_at && sub.cancel_at <= in30)) {
        const end = sub.cancel_at ?? sub.current_period_end;
        items.push({ ref: `renewal:ending:${cust.id}`, title: `${name} subscription ends ${iso(end)}`, detail: `Set to cancel at period end. Amount at stake: £${((sub.items.data[0]?.price.unit_amount ?? 0) / 100).toFixed(0)}/mo. Reach out before it lapses.`, due: iso(end - 7 * 86400), email });
      }
    }
    for await (const sub of stripe.subscriptions.list({ status: "trialing", limit: 100, expand: ["data.customer"] })) {
      if (sub.trial_end && sub.trial_end <= in7) { const cust = sub.customer as Stripe.Customer; items.push({ ref: `renewal:trial:${cust.id}`, title: `${cust.name ?? cust.email} trial converts ${iso(sub.trial_end)}`, detail: `Trial ends soon. Confirm they want to continue and the card is valid.`, due: iso(sub.trial_end - 3 * 86400), email: cust.email ?? null }); }
    }

    let created = 0, skipped = 0;
    for (const it of items) {
      const { data: ex } = await supabase.from("tasks").select("id").eq("tenant_id", tenant_id).eq("source_ref", it.ref).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()).limit(1);
      if (ex?.length) { skipped++; continue; }
      await supabase.from("tasks").insert({ tenant_id, title: it.title, detail: it.detail, tier: "must", status: "open", source: "agent", source_ref: it.ref, due_date: it.due, client_id: it.email ? byEmail.get(it.email.toLowerCase()) ?? null : null, owner: ownerHandle });
      created++;
    }
    const summary = `Renewals: ${items.length} found | ${created} created | ${skipped} skipped`;
    const nowIso = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id, agent: "renewals", trigger: "schedule", status: "done", started_at: nowIso, finished_at: nowIso, summary });
    return j({ ok: true, summary });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function iso(s: number) { return new Date(s * 1000).toISOString().slice(0, 10); }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }