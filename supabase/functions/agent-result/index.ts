// agent-result v2 — GHL-only agents report here via the workflow.
// Logs the run, upserts whitelisted metrics, inserts proposed tasks (deduped), updates client last contact.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

const ALLOWED_METRICS = ["pipeline_value", "pipeline_open", "stale_count", "appointments", "unread", "unanswered_12h", "clients_at_risk"];
const TIERS = ["must", "high", "bonus"];
const KINDS = ["deep", "shallow"];

Deno.serve(async (req) => {
  console.log("agent-result v2 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    const agent = p.agent;
    if (!tenant_id || !agent) return j({ error: "tenant_id and agent required" }, 400);

    const { data: t } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });

    const summary = String(p.summary ?? "").trim();
    const isError = /^ERROR:/i.test(summary) || String(p.status ?? "") === "failed";
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // ---- metrics ----
    const metrics = parseJson(p.metrics, {});
    const cleanMetrics: Record<string, number> = {};
    for (const k of ALLOWED_METRICS) {
      if (k in metrics) { const v = Number(metrics[k]); if (Number.isFinite(v)) cleanMetrics[k] = v; }
    }
    if (!isError && Object.keys(cleanMetrics).length) {
      const { error } = await supabase.from("daily_metrics").upsert({ tenant_id, metric_date: today, ...cleanMetrics }, { onConflict: "tenant_id,metric_date" });
      if (error) return j({ error: `metrics: ${error.message}` }, 500);
    }

    // ---- client lookup (shared) ----
    const { data: clients } = await supabase.from("clients").select("id, ghl_contact_id").eq("tenant_id", tenant_id).eq("status", "active");
    const clientByContact = new Map((clients ?? []).map((c) => [c.ghl_contact_id, c.id]));

    // ---- last contact ----
    let touched = 0;
    const contacts: string[] = parseJson(p.clients_touched, []);
    if (!isError && Array.isArray(contacts) && contacts.length) {
      const ids = contacts.map((c) => clientByContact.get(String(c))).filter(Boolean) as string[];
      if (ids.length) {
        await supabase.from("clients").update({ last_contact_at: now }).in("id", ids);
        touched = ids.length;
      }
    }

    // ---- proposed tasks ----
    let inserted = 0, skipped = 0, invalid = 0;
    const proposed: any[] = parseJson(p.tasks, []);
    if (!isError && Array.isArray(proposed) && proposed.length) {
      const refs = proposed.map((x) => String(x?.source_ref ?? "")).filter(Boolean);
      const { data: existing } = refs.length
        ? await supabase.from("tasks").select("source_ref").eq("tenant_id", tenant_id).in("source_ref", refs)
        : { data: [] as any[] };
      const seen = new Set((existing ?? []).map((e) => e.source_ref));

      const clientIds = [...new Set(proposed.map((x) => clientByContact.get(String(x?.contact_id ?? ""))).filter(Boolean))] as string[];
      const { data: projects } = clientIds.length
        ? await supabase.from("projects").select("id, client_id").eq("tenant_id", tenant_id).eq("status", "active").in("client_id", clientIds)
        : { data: [] as any[] };
      const projectByClient = new Map((projects ?? []).map((pr) => [pr.client_id, pr.id]));

      const rows: any[] = [];
      for (const x of proposed) {
        const title = String(x?.title ?? "").trim();
        const ref = String(x?.source_ref ?? "").trim();
        if (!title || !ref) { invalid++; continue; }
        if (seen.has(ref)) { skipped++; continue; }
        seen.add(ref);
        const client_id = clientByContact.get(String(x?.contact_id ?? "")) ?? null;
        const effort = Number(x?.effort_minutes);
        rows.push({
          tenant_id,
          title: title.slice(0, 200),
          detail: String(x?.detail ?? "").slice(0, 2000),
          tier: TIERS.includes(x?.tier) ? x.tier : "high",
          kind: KINDS.includes(x?.kind) ? x.kind : "shallow",
          effort_minutes: Number.isFinite(effort) && effort > 0 ? Math.round(effort / 15) * 15 || 15 : 30,
          due_date: /^\d{4}-\d{2}-\d{2}$/.test(String(x?.due_date ?? "")) ? x.due_date : null,
          status: "proposed",
          source: agent,
          source_ref: ref,
          client_id,
          project_id: client_id ? projectByClient.get(client_id) ?? null : null,
          owner: null,
        });
      }
      if (rows.length) {
        const { error } = await supabase.from("tasks").insert(rows);
        if (error) return j({ error: `tasks: ${error.message}` }, 500);
        inserted = rows.length;
      }
    }

    // ---- run log ----
    await supabase.from("agent_runs").insert({
      tenant_id, agent, trigger: "workflow",
      status: isError ? "failed" : "done",
      started_at: now, finished_at: now,
      summary: isError ? null : summary,
      error: isError ? summary : null,
    });

    return j({ ok: true, agent, status: isError ? "failed" : "done", metrics_written: Object.keys(cleanMetrics), tasks_inserted: inserted, tasks_skipped: skipped, tasks_invalid: invalid, clients_touched: touched });
  } catch (e) { return j({ error: String(e) }, 500); }
});

function parseJson(v: unknown, fallback: any) {
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v === "object") return v;
  try { return JSON.parse(String(v)); } catch { return fallback; }
}
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }