// brief-save v2 — stores the briefs the workflow just sent, marked delivered.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  console.log("brief-save v2 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);

    const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tenant_id).single();
    const tz = cfg?.timezone || "Europe/London";
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

    const { data: team } = await supabase.from("team_members").select("handle, gets_financials").eq("tenant_id", tenant_id);
    const owner = (team ?? []).find((m) => m.gets_financials)?.handle ?? "owner";
    const other = (team ?? []).find((m) => !m.gets_financials)?.handle ?? null;

    const rows: any[] = [];
    const ownerText = String(p.owner_text ?? "").trim();
    const teamText = String(p.team_text ?? "").trim();
    const focus = (ownerText.match(/Focus:\s*([\s\S]*)$/) || [])[1]?.trim() ?? null;
    if (ownerText && ownerText !== "QUIET") rows.push({ tenant_id, brief_date: today, audience: owner, body: ownerText, focus, delivered: true });
    if (teamText && teamText !== "QUIET" && other) rows.push({ tenant_id, brief_date: today, audience: other, body: teamText, focus: null, delivered: true });
    if (!rows.length) return j({ ok: true, saved: 0, note: "no brief text received" });

    const { error } = await supabase.from("briefs").upsert(rows, { onConflict: "tenant_id,brief_date,audience" });
    if (error) return j({ error: error.message }, 500);

    await supabase.rpc("bump_activity", { p_tenant: tenant_id, p_day: today, p_field: "briefs_sent", p_n: rows.length });
    if (String(p.referral_offered ?? "") === "yes") await supabase.from("tenant_config").update({ last_referral_ask: today }).eq("tenant_id", tenant_id);

    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id, agent: "brief", trigger: "workflow", status: "done", started_at: now, finished_at: now, summary: `Saved ${rows.length} briefs` });
    return j({ ok: true, saved: rows.length });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }