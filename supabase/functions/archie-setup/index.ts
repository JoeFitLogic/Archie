// archie-setup v1 — the onboarding form lands here. Configures the whole tenant in one call:
// tenant_config, team members, and the GHL custom values every chain reads.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";

// Form checkbox label → module key. Matching is by keyword, so exact label wording doesn't matter.
const MODULES: [string, string][] = [
  ["task", "tasks"], ["team member", "team"], ["stale lead", "leads"], ["chase stale", "leads"],
  ["triage", "triage"], ["message", "triage"], ["revenue", "stripe"], ["stripe", "stripe"],
  ["failed payment", "chase"], ["renewal", "renewals"], ["expiring", "renewals"],
  ["check-in", "checkins"], ["check in", "checkins"], ["going quiet", "health"], ["health", "health"],
  ["call note", "callnotes"], ["fathom", "callnotes"], ["content idea", "content"], ["interview", "content"],
  ["social", "drafts"], ["email", "drafts"], ["review", "reviews"], ["reactivat", "reactivate"],
  ["weekly", "weekly"], ["monthly", "monthly"],
];

Deno.serve(async (req) => {
  console.log("archie-setup v1 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = String(p.tenant_id ?? "");
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);

    const { data: tenant } = await supabase.from("tenants").select("id, location_id, business_name").eq("id", tenant_id).single();
    if (!tenant) return j({ error: "tenant not found — provision it first" }, 404);
    const { data: cfgNow } = await supabase.from("tenant_config").select("*").eq("tenant_id", tenant_id).single();

    // ---------- normalise form values ----------
    const list = (v: unknown) => (Array.isArray(v) ? v : String(v ?? "").split(/[,\n;]/)).map((s) => String(s).trim()).filter(Boolean);
    const moduleKeys = new Set<string>();
    for (const label of list(p.modules)) {
      const l = label.toLowerCase();
      for (const [kw, key] of MODULES) if (l.includes(kw)) moduleKeys.add(key);
    }
    moduleKeys.add("brief");
    const modules = [...moduleKeys].sort().join(",");

    const revenueMap: Record<string, string> = { recurring: "recurring", retainer: "recurring", subscription: "recurring", project: "project", "one-off": "one-off", "one off": "one-off", job: "one-off", mixed: "mixed" };
    const rm = String(p.revenue_model ?? "").toLowerCase();
    const revenue_model = Object.entries(revenueMap).find(([k]) => rm.includes(k))?.[1] ?? cfgNow?.revenue_model ?? "recurring";

    const channel = String(p.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "whatsapp" : "sms";
    const priorities = list(p.priorities);
    const tone = list(p.tone);
    const neverWords = String(p.never_words ?? "").trim();
    const voiceExtra = String(p.voice_notes ?? "").trim();
    const hours = Number(String(p.focus_hours ?? "").replace(/[^\d.]/g, ""));
    const focusMins = Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : null;
    const target = Number(String(p.revenue_target ?? "").replace(/[^\d.]/g, ""));
    const staleDays = Number(String(p.stale_days ?? "").replace(/[^\d]/g, ""));

    const brand_voice = [
      tone.length ? `Tone: ${tone.join(", ")}.` : "",
      neverWords ? `Never use: ${neverWords}.` : "",
      voiceExtra,
    ].filter(Boolean).join(" ") || cfgNow?.brand_voice || null;

    const update: Record<string, unknown> = {
      revenue_model,
      customer_word: str(p.customer_word) || cfgNow?.customer_word || "client",
      sale_word: str(p.sale_word) || cfgNow?.sale_word || "proposal",
      modules,
      brief_channel: channel,
      brief_max_chars: channel === "whatsapp" ? 1400 : 600,
      priorities_text: priorities.length ? priorities.join("; ") : cfgNow?.priorities_text ?? null,
      goals_text: str(p.goals) || cfgNow?.goals_text || null,
      brand_voice,
      brand_context: str(p.what_you_do) || cfgNow?.brand_context || null,
      icp: str(p.ideal_customer) || cfgNow?.icp || null,
      core_offer: str(p.core_offer) || cfgNow?.core_offer || null,
    };
    if (Number.isFinite(target) && target > 0) update.mrr_target = target;
    if (Number.isFinite(staleDays) && staleDays > 0) update.stale_threshold_days = staleDays;
    if (focusMins !== null) update.default_capacity = { "0": 0, "1": focusMins, "2": focusMins, "3": focusMins, "4": focusMins, "5": focusMins, "6": 0 };
    if (str(p.client_tag)) update.client_tag = str(p.client_tag);
    if (str(p.pipeline_name) && str(p.pipeline_name) !== cfgNow?.pipeline_name) { update.pipeline_name = str(p.pipeline_name); update.pipeline_id = null; }
    if (str(p.stripe_key).startsWith("rk_")) update.stripe_key = str(p.stripe_key);
    if (str(p.ghl_token)) update.ghl_token = str(p.ghl_token);

    const { error: cfgErr } = await supabase.from("tenant_config").update(update).eq("tenant_id", tenant_id);
    if (cfgErr) return j({ error: `config: ${cfgErr.message}` }, 500);
    if (str(p.business_name)) await supabase.from("tenants").update({ business_name: str(p.business_name) }).eq("id", tenant_id);

    // ---------- team members ----------
    const { data: team } = await supabase.from("team_members").select("id, handle, gets_financials").eq("tenant_id", tenant_id);
    const slug = (s: string) => s.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "") || "owner";
    const ownerRow = (team ?? []).find((m) => m.gets_financials);
    if (str(p.owner_name)) {
      const fields: Record<string, unknown> = { name: str(p.owner_name), sees_all: true, gets_financials: true };
      if (str(p.owner_phone)) fields.phone = str(p.owner_phone);
      if (str(p.owner_contact_id)) fields.ghl_contact_id = str(p.owner_contact_id);
      if (ownerRow) await supabase.from("team_members").update(fields).eq("id", ownerRow.id);
      else await supabase.from("team_members").insert({ tenant_id, handle: slug(str(p.owner_name)), ...fields });
    }
    const teamRow = (team ?? []).find((m) => !m.gets_financials);
    if (str(p.team_name)) {
      const fields: Record<string, unknown> = { name: str(p.team_name), sees_all: true, gets_financials: false };
      if (str(p.team_phone)) fields.phone = str(p.team_phone);
      if (teamRow) await supabase.from("team_members").update(fields).eq("id", teamRow.id);
      else await supabase.from("team_members").insert({ tenant_id, handle: slug(str(p.team_name)), ...fields });
    }

    // ---------- GHL custom values ----------
    const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tenant_id).single();
    const loc = cfg?.ghl_location_id || tenant.location_id;
    const token = cfg?.ghl_token || FALLBACK_TOKEN;
    const values: Record<string, string> = {
      archie_modules: modules,
      archie_revenue_model: String(cfg?.revenue_model ?? ""),
      archie_customer_word: String(cfg?.customer_word ?? ""),
      archie_sale_word: String(cfg?.sale_word ?? ""),
      archie_client_tag: String(cfg?.client_tag ?? ""),
      archie_pipeline_name: String(cfg?.pipeline_name ?? ""),
      archie_stale_days: String(cfg?.stale_threshold_days ?? 7),
    };
    let cvWritten = 0, cvErrors: string[] = [];
    if (loc && token) {
      const listRes = await ghl(token, `/locations/${loc}/customValues`, "GET");
      const existing: any[] = listRes.json?.customValues ?? [];
      for (const [name, value] of Object.entries(values)) {
        const found = existing.find((c) => c.name === name);
        const r = found
          ? await ghl(token, `/locations/${loc}/customValues/${found.id}`, "PUT", { name, value })
          : await ghl(token, `/locations/${loc}/customValues`, "POST", { name, value });
        if (r.ok) cvWritten++; else cvErrors.push(`${name} ${r.status}`);
      }
      if (str(p.owner_contact_id)) await ghl(token, `/contacts/${str(p.owner_contact_id)}/tags`, "POST", { tags: ["internal-team"] });
    } else cvErrors.push("no location or token — custom values not written");

    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id, agent: "setup", trigger: "form", status: cvErrors.length ? "failed" : "done", started_at: now, finished_at: now, summary: `Configured: ${revenue_model}, modules ${modules}`, error: cvErrors.length ? cvErrors.join(" | ") : null });

    return j({ ok: true, revenue_model, modules, custom_values_written: cvWritten, errors: cvErrors.length ? cvErrors.join(" | ") : "none" });
  } catch (e) { return j({ error: String(e) }, 500); }
});

async function ghl(token: string, path: string, method = "GET", body?: unknown) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, { method, signal: ctrl.signal, headers: { "Authorization": `Bearer ${token}`, "Version": "2021-07-28", "Accept": "application/json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let json: any = null; try { json = JSON.parse(text); } catch { json = null; }
    return { ok: r.ok, status: r.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}
function str(v: unknown) { return String(v ?? "").trim(); }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }