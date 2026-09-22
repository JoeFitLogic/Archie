// ghl-sync — batched. Contacts with client_tag → clients + client-projects; churn + reactivate.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";

Deno.serve(async (req) => {
  console.log("ghl-sync v8 start");
  const t0 = Date.now();
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    console.log("tenant_id:", tenant_id);
    const { data: t } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });
    const { data: cfg } = await supabase.from("tenant_config").select("client_tag, ghl_location_id, ghl_token").eq("tenant_id", tenant_id).single();
    if (!cfg?.client_tag || !cfg.ghl_location_id) return j({ error: "client_tag or ghl_location_id missing" }, 400);
    const token = cfg.ghl_token || FALLBACK_TOKEN;
    if (!token) return j({ error: "no GHL token for tenant" }, 400);
    const H = { "Authorization": `Bearer ${token}`, "Version": "2021-07-28", "Content-Type": "application/json" };

    // 1. Fetch tagged contacts (paged, 20s timeout per page)
    const tagged: { id: string; name: string; email: string | null }[] = [];
    let page = 1;
    while (page <= 20) {
      const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 20000);
      const r = await fetch("https://services.leadconnectorhq.com/contacts/search", {
        method: "POST", headers: H, signal: ctrl.signal,
        body: JSON.stringify({ locationId: cfg.ghl_location_id, page, pageLimit: 100, filters: [{ field: "tags", operator: "eq", value: cfg.client_tag }] }),
      }).finally(() => clearTimeout(tm));
      if (!r.ok) return j({ error: `GHL ${r.status}: ${(await r.text()).slice(0, 300)}` }, 502);
      const data = await r.json();
      const batch = data.contacts ?? [];
      for (const c of batch) tagged.push({ id: c.id, name: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.contactName || c.email || c.id, email: c.email ?? null });
      if (batch.length < 100) break;
      page++;
    }
    if (tagged.length === 0) return j({ ok: true, warning: "zero tagged contacts — nothing churned", synced: 0 });

    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    // 2. Existing clients
    const { data: existing } = await supabase.from("clients").select("id, ghl_contact_id, status, started_at").eq("tenant_id", tenant_id);
    const byGhl = new Map((existing ?? []).map(c => [c.ghl_contact_id, c]));
    const seen = new Set(tagged.map(c => c.id));

    // 3. One upsert for all tagged
    const rows = tagged.map(c => {
      const ex = byGhl.get(c.id);
      return { tenant_id, ghl_contact_id: c.id, name: c.name, email: c.email, status: "active", ended_at: null, started_at: ex?.started_at ?? today, synced_at: nowIso };
    });
    const created = tagged.filter(c => !byGhl.has(c.id)).length;
    const reactivated = tagged.filter(c => byGhl.get(c.id)?.status && byGhl.get(c.id)!.status !== "active").length;
    const noEmail = tagged.filter(c => !c.email).length;
    const { error: upErr } = await supabase.from("clients").upsert(rows, { onConflict: "tenant_id,ghl_contact_id" });
    if (upErr) return j({ error: `upsert: ${upErr.message}` }, 500);

    // 4. Churn: active in DB but not tagged
    const churnIds = (existing ?? []).filter(e => e.status === "active" && !seen.has(e.ghl_contact_id)).map(e => e.id);
    if (churnIds.length) {
      await supabase.from("clients").update({ status: "churned", ended_at: today }).in("id", churnIds);
      await supabase.from("projects").update({ status: "archived" }).in("client_id", churnIds);
      await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "client churned" }).in("client_id", churnIds).in("status", ["proposed", "open", "doing", "waiting"]);
    }

    // 5. Projects: one insert for all missing
    const { data: allClients } = await supabase.from("clients").select("id, name").eq("tenant_id", tenant_id).eq("status", "active");
    const { data: existingProjects } = await supabase.from("projects").select("client_id").eq("tenant_id", tenant_id).not("client_id", "is", null);
    const hasProject = new Set((existingProjects ?? []).map(p => p.client_id));
    const newProjects = (allClients ?? []).filter(c => !hasProject.has(c.id)).map(c => ({ tenant_id, client_id: c.id, name: c.name, kind: "client", status: "active" }));
    if (newProjects.length) await supabase.from("projects").insert(newProjects);
    // reactivate archived projects for reactivated clients
    await supabase.from("projects").update({ status: "active" }).eq("tenant_id", tenant_id).eq("status", "archived").in("client_id", (allClients ?? []).map(c => c.id));

    // 6. Metrics + run log
    await supabase.from("daily_metrics").upsert({ tenant_id, metric_date: today, clients_active: tagged.length }, { onConflict: "tenant_id,metric_date" });
    const summary = `Synced ${tagged.length} active | ${created} new | ${churnIds.length} churned | ${reactivated} reactivated | ${newProjects.length} projects created | ${noEmail} missing email`;
    await supabase.from("agent_runs").insert({ tenant_id, agent: "sync", trigger: "schedule", status: "done", started_at: nowIso, finished_at: new Date().toISOString(), summary });
    return j({ ok: true, summary, ms: Date.now() - t0 });
  } catch (e) { return j({ error: String(e), ms: Date.now() - t0 }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }