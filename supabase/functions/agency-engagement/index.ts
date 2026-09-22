// agency-engagement v1 — watches YOUR clients. Flags anyone going quiet on Archie before they cancel.
// Runs weekly from your own account. Pushes a summary to your Alert workflow.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  console.log("agency-engagement v1 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const since7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const since14 = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);

    const { data: tenants } = await supabase.from("tenants").select("id, business_name, created_at").eq("status", "active");
    const { data: act } = await supabase.from("activity").select("tenant_id, day, commands, tasks_done, drafts_sent, feedback_up, feedback_down, briefs_sent").gte("day", since14);
    const { data: fails } = await supabase.from("agent_runs").select("tenant_id").eq("status", "failed").gte("started_at", since7);

    const rows: { name: string; level: string; why: string }[] = [];
    for (const t of tenants ?? []) {
      const mine = (act ?? []).filter((a) => a.tenant_id === t.id);
      const last7 = mine.filter((a) => a.day >= since7);
      const prev7 = mine.filter((a) => a.day < since7);
      const s = (list: any[], f: string) => list.reduce((x, r) => x + Number(r[f] ?? 0), 0);
      const used7 = s(last7, "commands") + s(last7, "tasks_done") + s(last7, "drafts_sent");
      const usedPrev = s(prev7, "commands") + s(prev7, "tasks_done") + s(prev7, "drafts_sent");
      const briefs7 = s(last7, "briefs_sent");
      const down = s(mine, "feedback_down"), up = s(mine, "feedback_up");
      const failCount = (fails ?? []).filter((f) => f.tenant_id === t.id).length;
      const ageDays = Math.floor((Date.now() - Date.parse(t.created_at)) / 86400000);

      const why: string[] = [];
      let level = "ok";
      if (briefs7 > 0 && used7 === 0) { level = "at risk"; why.push("getting briefs but hasn't replied, ticked or sent anything in 7 days"); }
      else if (usedPrev > 0 && used7 < usedPrev / 2) { level = "watch"; why.push(`usage halved (${usedPrev} → ${used7})`); }
      if (down > up && down >= 2) { level = level === "ok" ? "watch" : level; why.push(`${down} thumbs down vs ${up} up`); }
      if (failCount >= 3) { level = level === "ok" ? "watch" : level; why.push(`${failCount} failed runs this week`); }
      if (briefs7 === 0 && ageDays > 3) { level = "at risk"; why.push("no briefs delivered this week"); }
      if (level !== "ok") rows.push({ name: t.business_name ?? t.id, level, why: why.join("; ") });
    }

    const total = (tenants ?? []).length;
    const message = rows.length
      ? `Archie clients to check on (${rows.length} of ${total}):\n` + rows.sort((a, b) => (a.level === "at risk" ? -1 : 1) - (b.level === "at risk" ? -1 : 1)).map((r) => `${r.level === "at risk" ? "🔴" : "🟠"} ${r.name} — ${r.why}`).join("\n")
      : `All ${total} Archie clients active this week.`;

    const hook = Deno.env.get("HEALTH_WEBHOOK_URL");
    if (hook) await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    return j({ ok: true, flagged: rows.length, total, message });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }