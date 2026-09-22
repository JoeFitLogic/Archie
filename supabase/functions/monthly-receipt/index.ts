// monthly-receipt v1 — the "here's what Archie did for you" message on the 1st of each month.
// Pure code from stored data. No agent. Includes the referral link if the month was a good one.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  console.log("monthly-receipt v1 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);

    const { data: t } = await supabase.from("tenants").select("status, business_name").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });
    const { data: cfg } = await supabase.from("tenant_config").select("timezone, mrr_target, customer_word, revenue_model").eq("tenant_id", tenant_id).single();
    const tz = cfg?.timezone || "Europe/London";

    // Previous calendar month in the tenant's timezone (or ?month=YYYY-MM)
    const nowLocal = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit" }).format(new Date());
    let [y, m] = (String(p.month ?? "") || nowLocal).split("-").map(Number);
    if (!p.month) { m -= 1; if (m === 0) { m = 12; y -= 1; } }
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const endD = new Date(Date.UTC(y, m, 1)); const end = endD.toISOString().slice(0, 10);
    const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));

    const [{ data: act }, { data: rec }, { count: done }, { data: metrics }, { count: drafts }, { count: briefs }, { data: newClients }, { data: lostClients }] = await Promise.all([
      supabase.from("activity").select("*").eq("tenant_id", tenant_id).gte("day", start).lt("day", end),
      supabase.from("recoveries").select("amount").eq("tenant_id", tenant_id).gte("recovered_on", start).lt("recovered_on", end),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tenant_id).eq("status", "done").gte("completed_at", start).lt("completed_at", end),
      supabase.from("daily_metrics").select("metric_date, mrr, revenue_mtd").eq("tenant_id", tenant_id).gte("metric_date", start).lt("metric_date", end).order("metric_date", { ascending: true }),
      supabase.from("content_drafts").select("id", { count: "exact", head: true }).eq("tenant_id", tenant_id).gte("created_at", start).lt("created_at", end),
      supabase.from("briefs").select("id", { count: "exact", head: true }).eq("tenant_id", tenant_id).gte("brief_date", start).lt("brief_date", end),
      supabase.from("clients").select("id").eq("tenant_id", tenant_id).gte("started_at", start).lt("started_at", end),
      supabase.from("clients").select("id").eq("tenant_id", tenant_id).gte("ended_at", start).lt("ended_at", end),
    ]);

    const sum = (f: string) => (act ?? []).reduce((a, r) => a + Number((r as any)[f] ?? 0), 0);
    const recovered = (rec ?? []).reduce((a, r) => a + Number(r.amount ?? 0), 0);
    const mrrRows = (metrics ?? []).filter((r) => r.mrr !== null);
    const mrrStart = mrrRows[0]?.mrr, mrrEnd = mrrRows[mrrRows.length - 1]?.mrr;
    const revRows = (metrics ?? []).filter((r) => r.revenue_mtd !== null);
    const revenue = revRows.length ? Number(revRows[revRows.length - 1].revenue_mtd) : null;
    const cw = cfg?.customer_word || "client";

    const lines: string[] = [`Your Archie receipt — ${monthName}`, ""];
    if (recovered > 0) lines.push(`£${Math.round(recovered)} of failed payments recovered`);
    if (sum("notes_written")) lines.push(`${sum("notes_written")} stale leads chased with a next step`);
    if (sum("drafts_sent")) lines.push(`${sum("drafts_sent")} messages drafted and sent for you`);
    if (sum("tasks_proposed")) lines.push(`${sum("tasks_proposed")} things spotted in your messages that needed doing`);
    if (done) lines.push(`${done} tasks cleared`);
    if (drafts) lines.push(`${drafts} pieces of content drafted`);
    if (briefs) lines.push(`${briefs} morning briefs`);
    lines.push("");
    if (mrrStart !== undefined && mrrEnd !== undefined && cfg?.revenue_model !== "one-off") {
      const diff = Number(mrrEnd) - Number(mrrStart);
      lines.push(`MRR: £${Math.round(Number(mrrStart))} → £${Math.round(Number(mrrEnd))} (${diff >= 0 ? "+" : "-"}£${Math.abs(Math.round(diff))})`);
      if (cfg?.mrr_target) lines.push(`${Math.round((Number(mrrEnd) / Number(cfg.mrr_target)) * 100)}% of your £${Number(cfg.mrr_target).toLocaleString("en-GB")} target`);
    }
    if (revenue !== null) lines.push(`Revenue: £${Math.round(revenue).toLocaleString("en-GB")}`);
    if ((newClients ?? []).length || (lostClients ?? []).length) lines.push(`${cw.charAt(0).toUpperCase() + cw.slice(1)}s: +${(newClients ?? []).length} new, −${(lostClients ?? []).length} left`);

    const link = String(p.referral_link ?? "").trim();
    const good = recovered > 0 || (mrrEnd !== undefined && mrrStart !== undefined && Number(mrrEnd) > Number(mrrStart)) || sum("drafts_sent") >= 3;
    if (link && good) lines.push("", `Know another business owner who'd want this? Send them your link — you get a free month for every one that joins: ${link}`);

    const text = lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
    await supabase.from("briefs").upsert({ tenant_id, brief_date: localDate(Date.now(), tz), audience: "monthly", body: text, delivered: true }, { onConflict: "tenant_id,brief_date,audience" });
    if (link && good) await supabase.from("tenant_config").update({ last_referral_ask: localDate(Date.now(), tz) }).eq("tenant_id", tenant_id);
    return j({ ok: true, owner_text: text, month: `${y}-${String(m).padStart(2, "0")}` });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }