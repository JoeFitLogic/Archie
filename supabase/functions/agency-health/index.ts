// agency-health — failed/hung runs, missing briefs → alerts + SMS text
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  console.log("agency-health v3 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const alerts: { tenant_id: string; kind: string; detail: string }[] = [];

    const { data: failed } = await supabase.from("agent_runs").select("tenant_id, agent, error").eq("status", "failed").gte("started_at", since);
    for (const r of failed ?? []) alerts.push({ tenant_id: r.tenant_id, kind: "failed_run", detail: `${r.agent}: ${(r.error ?? "no error text").slice(0, 80)}` });

    const twoH = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const { data: hung } = await supabase.from("agent_runs").select("id, tenant_id, agent").eq("status", "running").lt("started_at", twoH);
    for (const r of hung ?? []) {
      alerts.push({ tenant_id: r.tenant_id, kind: "hung_run", detail: r.agent });
      await supabase.from("agent_runs").update({ status: "failed", finished_at: new Date().toISOString(), error: "hung, closed by health check" }).eq("id", r.id);
    }

    if (new Date().getUTCHours() >= 7) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: active } = await supabase.from("tenants").select("id, business_name").eq("status", "active");
      const { data: briefed } = await supabase.from("briefs").select("tenant_id").eq("brief_date", today).eq("delivered", true);
      const done = new Set((briefed ?? []).map(b => b.tenant_id));
      for (const t of active ?? []) if (!done.has(t.id)) alerts.push({ tenant_id: t.id, kind: "no_brief", detail: t.business_name });
    }

    const { data: existing } = await supabase.from("agency_alerts").select("tenant_id, kind, detail").is("acked_at", null).gte("created_at", since);
    const seen = new Set((existing ?? []).map(a => `${a.tenant_id}|${a.kind}|${a.detail}`));
    const fresh = alerts.filter(a => !seen.has(`${a.tenant_id}|${a.kind}|${a.detail}`));
    if (fresh.length) await supabase.from("agency_alerts").insert(fresh);

    const { data: names } = await supabase.from("tenants").select("id, business_name");
    const nm = new Map((names ?? []).map(n => [n.id, n.business_name]));
    const lines = fresh.map(a => `${nm.get(a.tenant_id) ?? a.tenant_id}: ${a.kind} — ${a.detail}`);
    const message = lines.length ? `Archie alerts:\n${lines.join("\n")}` : "";

    // Push to GHL inbound webhook → SMS, only when there is something to say
    const hook = Deno.env.get("HEALTH_WEBHOOK_URL");
    if (hook && fresh.length) {
      await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    }
    return j({ ok: true, count: fresh.length, message, pushed: !!(hook && fresh.length) });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }