// agent-result v5.1 — agents report here (from the backend or a workflow).
// agent-result v5.1: accepts each client's own workflow secret as well as the master secret.
// Logs the run, upserts whitelisted metrics, inserts proposed tasks (deduped), updates client last contact,
// and carries out CRM actions (notes, tags) and message drafts.
// v5: routing — tasks the Scraper assigns to a team member (e.g. Sara), or that match the routing rules
//     (payments, card updates…), go straight onto that person's list as open tasks; the owner's stay as proposals.
//     Older unsent drafts are dismissed when a new day's drafts arrive.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";

const ALLOWED_METRICS = ["pipeline_value", "pipeline_open", "stale_count", "stale_value", "appointments", "unread", "unanswered_12h", "clients_at_risk"];
const TIERS = ["must", "high", "bonus"];
const KINDS = ["deep", "shallow"];

// Master secret (you, the scheduler) or this client's own workflow secret
async function secretOk(header: string | null, tenantId: string): Promise<boolean> {
  if (!header) return false;
  if (header === SECRET) return true;
  if (!tenantId) return false;
  const { data } = await supabase.from("tenant_config").select("workflow_secret").eq("tenant_id", tenantId).maybeSingle();
  return !!data?.workflow_secret && data.workflow_secret === header;
}

Deno.serve(async (req) => {
  console.log("agent-result v5 start");
  try {
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    if (!(await secretOk(req.headers.get("x-archie-secret"), String(p.tenant_id ?? "")))) return j({ error: "unauthorized" }, 401);
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

    // ---- client lookup ----
    const { data: clients } = await supabase.from("clients").select("id, ghl_contact_id").eq("tenant_id", tenant_id).eq("status", "active");
    const clientByContact = new Map((clients ?? []).map((c) => [c.ghl_contact_id, c.id]));

    // ---- last contact ----
    let touched = 0;
    const contacts: string[] = parseJson(p.clients_touched, []);
    if (!isError && Array.isArray(contacts) && contacts.length) {
      const ids = contacts.map((c) => clientByContact.get(String(c))).filter(Boolean) as string[];
      if (ids.length) { await supabase.from("clients").update({ last_contact_at: now }).in("id", ids); touched = ids.length; }
    }

    // ---- routing: who gets what ----
    const [{ data: team }, { data: rcfg }] = await Promise.all([
      supabase.from("team_members").select("handle, gets_financials").eq("tenant_id", tenant_id),
      supabase.from("tenant_config").select("routing_auto, routing_rules").eq("tenant_id", tenant_id).maybeSingle(),
    ]);
    const ownerHandle = String((team ?? []).find((m: any) => m.gets_financials)?.handle ?? "");
    const teamHandles = new Set((team ?? []).map((m: any) => String(m.handle).toLowerCase()));
    const routingOn = rcfg?.routing_auto !== false;
    const rules: { handle: string; match: string }[] = Array.isArray(rcfg?.routing_rules) ? rcfg!.routing_rules : [];
    const routeTo = (x: any): string | null => {
      if (!routingOn) return null;
      const hinted = String(x?.owner ?? "").trim().toLowerCase();
      if (hinted && teamHandles.has(hinted) && hinted !== ownerHandle.toLowerCase()) return hinted;
      if (hinted && hinted === ownerHandle.toLowerCase()) return null;
      const text = `${x?.title ?? ""} ${x?.detail ?? ""}`;
      for (const r of rules) {
        try {
          if (r?.handle && r?.match && teamHandles.has(String(r.handle).toLowerCase()) && new RegExp(r.match, "i").test(text)) {
            return String(r.handle).toLowerCase() === ownerHandle.toLowerCase() ? null : String(r.handle).toLowerCase();
          }
        } catch { /* bad pattern — ignore */ }
      }
      return null;
    };

    // ---- proposed tasks ----
    let inserted = 0, routed = 0, skipped = 0, invalid = 0;
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
        const to = routeTo(x);
        if (to) routed++;
        rows.push({
          tenant_id,
          title: title.slice(0, 200),
          detail: String(x?.detail ?? "").slice(0, 2000),
          tier: TIERS.includes(x?.tier) ? x.tier : "high",
          kind: KINDS.includes(x?.kind) ? x.kind : "shallow",
          effort_minutes: Number.isFinite(effort) && effort > 0 ? Math.max(15, Math.round(effort / 15) * 15) : 30,
          due_date: /^\d{4}-\d{2}-\d{2}$/.test(String(x?.due_date ?? "")) ? x.due_date : null,
          // Routed work goes straight onto that person's list; the owner's stays as a proposal to decide on
          status: to ? "open" : "proposed", source: agent, source_ref: ref,
          client_id, project_id: client_id ? projectByClient.get(client_id) ?? null : null, owner: to,
          ...(to ? { accepted_by: "routing", accepted_at: now } : {}),
        });
      }
      if (rows.length) {
        const { error } = await supabase.from("tasks").insert(rows);
        if (error) return j({ error: `tasks: ${error.message}` }, 500);
        inserted = rows.length;
      }
    }

    // ---- CRM actions: notes and tags ----
    let notesWritten = 0, notesSkipped = 0, tagsAdded = 0, actionErrors = 0, draftsCreated = 0, draftsExpired = 0;
    const actions: any[] = parseJson(p.actions, []);
    if (!isError && Array.isArray(actions) && actions.length) {
      const { data: cfg } = await supabase.from("tenant_config").select("ghl_token").eq("tenant_id", tenant_id).single();
      const token = cfg?.ghl_token || FALLBACK_TOKEN;
      if (!token) actionErrors = actions.length;
      else {
        for (const a of actions.slice(0, 50)) {
          const cid = String(a?.contact_id ?? "").trim();
          if (!cid) { actionErrors++; continue; }
          const note = String(a?.note ?? "").trim();
          if (note) {
            const existing = await ghl(token, `/contacts/${cid}/notes`, "GET");
            const list: any[] = existing.ok ? (existing.json?.notes ?? []) : [];
            const prefix = `[auto] ${today}`;
            if (list.some((n) => String(n?.body ?? "").startsWith(prefix))) notesSkipped++;
            else {
              const w = await ghl(token, `/contacts/${cid}/notes`, "POST", { body: `${prefix} — ${note.slice(0, 900)}` });
              if (w.ok) notesWritten++; else actionErrors++;
            }
          }
          if (a?.reactivate === true || String(a?.reactivate) === "true" || String(a?.reactivate) === "yes") {
            const tg = await ghl(token, `/contacts/${cid}/tags`, "POST", { tags: ["archie-reactivate"] });
            if (tg.ok) tagsAdded++; else actionErrors++;
          }
        }
      }

      // message drafts — ranked per day, sent only when the owner says so
      const drafts = actions.filter((a) => String(a?.draft ?? "").trim() && String(a?.contact_id ?? "").trim());
      if (drafts.length) {
        // Yesterday's unsent drafts are out of date once today's arrive
        const { count } = await supabase.from("message_drafts").update({ status: "dismissed" }, { count: "exact" })
          .eq("tenant_id", tenant_id).eq("status", "pending").lt("created_on", today);
        draftsExpired = count ?? 0;
        const { data: todays } = await supabase.from("message_drafts").select("rank, contact_id").eq("tenant_id", tenant_id).eq("created_on", today);
        const already = new Set((todays ?? []).map((d) => d.contact_id));
        let rank = (todays ?? []).reduce((m, d) => Math.max(m, d.rank ?? 0), 0);
        const rows = drafts.filter((a) => !already.has(String(a.contact_id))).map((a) => ({
          tenant_id, created_on: today, rank: ++rank, status: "pending", source: agent,
          contact_id: String(a.contact_id), name: String(a?.name ?? "").slice(0, 120),
          channel: String(a?.channel ?? "?").slice(0, 20), body: String(a.draft).slice(0, 1000),
        }));
        if (rows.length) { await supabase.from("message_drafts").insert(rows); draftsCreated = rows.length; }
      }
    }

    // ---- activity counters (for the monthly receipt) ----
    const bumps: [string, number][] = [["notes_written", notesWritten], ["tags_added", tagsAdded], ["tasks_proposed", inserted - routed], ["drafts_created", draftsCreated]];
    for (const [field, n] of bumps) if (n > 0) await supabase.rpc("bump_activity", { p_tenant: tenant_id, p_day: today, p_field: field, p_n: n });

    // ---- run log ----
    await supabase.from("agent_runs").insert({
      tenant_id, agent, trigger: "workflow",
      status: isError ? "failed" : "done",
      started_at: now, finished_at: now,
      summary: isError ? null : summary,
      error: isError ? summary : null,
    });

    return j({
      ok: true, agent, status: isError ? "failed" : "done",
      metrics_written: Object.keys(cleanMetrics),
      tasks_inserted: inserted, tasks_routed: routed, tasks_skipped: skipped, tasks_invalid: invalid,
      clients_touched: touched,
      notes_written: notesWritten, notes_skipped: notesSkipped, tags_added: tagsAdded,
      drafts_created: draftsCreated, drafts_expired: draftsExpired, action_errors: actionErrors,
    });
  } catch (e) { return j({ error: String(e) }, 500); }
});

async function ghl(token: string, path: string, method = "GET", body?: unknown) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, {
      method, signal: ctrl.signal,
      headers: { "Authorization": `Bearer ${token}`, "Version": "2021-07-28", "Accept": "application/json", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await r.text(); let json: any = null; try { json = JSON.parse(text); } catch { json = null; }
    return { ok: r.ok, status: r.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}
function parseJson(v: unknown, fallback: any) {
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v === "object") return v;
  try { return JSON.parse(String(v)); } catch { return fallback; }
}
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }
