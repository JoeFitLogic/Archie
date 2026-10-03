// provision-tenant v3.1 — create a tenant on signup, write custom values back, cancel on churn.
// v3.1: proper offboarding — action "cancel" switches everything off and locks every door (new access token so old links
//       and the toolbox stop working, workflow secret cleared, Instagram disconnected, schedules/coach/auto-prep off);
//       action "pause" does the same but keeps it ready to come back; reactivating gives fresh links and secrets.
// v3: each client gets their OWN workflow secret (custom value archie_secret — use it in their workflow headers, never the
//     master secret); starter settings so Archie works straight away; owner handle from their first name; page + toolbox
//     links returned; cancel also switches schedules off.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const GHL_KEY = Deno.env.get("GHL_AGENCY_API_KEY")!;
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;

const randomHex = (bytes: number) => [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");

Deno.serve(async (req) => {
  console.log("provision-tenant v3.1 start");
  try {
    // Provisioning is an agency action — master secret only
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const { location_id, plan, action, business_name, owner_name, owner_email, owner_phone } = p;
    if (!location_id) return j({ error: "location_id required" }, 400);

    const { data: existing } = await supabase.from("tenants").select("id, access_token, status").eq("location_id", location_id).maybeSingle();

    if (action === "cancel" || action === "pause") {
      if (existing) {
        const status = action === "cancel" ? "churned" : "paused";
        await supabase.from("tenants").update({ status, churned_at: action === "cancel" ? new Date().toISOString() : null, access_token: randomHex(24) }).eq("id", existing.id);
        await supabase.from("tenant_config").update({ schedules_on: false, coach_on: false, auto_prep: false, forge_auto: false, workflow_secret: null, page_pin_required: true }).eq("tenant_id", existing.id);
        await supabase.from("page_sessions").delete().eq("tenant_id", existing.id);
        await supabase.from("ig_connections").delete().eq("tenant_id", existing.id);
        await supabase.from("agency_alerts").insert({ tenant_id: existing.id, kind: action, detail: business_name ?? location_id });
      }
      return j({
        ok: true, [action === "cancel" ? "cancelled" : "paused"]: true,
        next: [
          "GHL: switch their sub-account to the non-Archie SaaS plan (or CMS) so Agent Studio / AI stop.",
          "GHL: remove the 'Archie' custom menu link and the Archie connector in Ask AI.",
          "Their data is kept (memory, history, content) — delete after 90 days unless they come back.",
        ],
      });
    }

    let tenant = existing;
    let created = false;
    if (!tenant) {
      const token = randomHex(24);
      const { data: used } = await supabase.from("tenants").select("schedule_offset");
      const taken = new Set((used ?? []).map((u: any) => u.schedule_offset));
      let offset = 0; while (taken.has(offset) && offset < 30) offset++;
      const { data: t, error: te } = await supabase.from("tenants").insert({
        location_id, access_token: token, business_name: business_name ?? location_id, owner_name, owner_email, schedule_offset: offset, status: "active",
      }).select("id, access_token, status").single();
      if (te || !t) return j({ error: `tenant: ${te?.message ?? "not created"}` }, 500);
      tenant = t;
      created = true;
      const tier = String(plan ?? "").toLowerCase().includes("plus") ? 2 : 1;
      const features = tier === 2 ? { voice_ai: true, mentor_kb: true, precall_brief: true, weekly_review: true, monthly_report: true } : {};
      // Starter settings — schedules stay OFF until the install call is done (runbook B5)
      const { error: ce } = await supabase.from("tenant_config").insert({
        tenant_id: tenant.id, tier, features, timezone: "Europe/London", currency: "GBP", ghl_location_id: location_id,
        brief_channel: "whatsapp", schedules_on: false, run_mode: "api", routing_auto: true,
        show_rate: 0.7, close_rate: 0.45, workflow_secret: randomHex(24),
      });
      if (ce) return j({ error: `config: ${ce.message}` }, 500);
      const first = String(owner_name ?? "owner").trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "owner";
      await supabase.from("team_members").insert({
        tenant_id: tenant.id, handle: first, name: owner_name ?? "Owner", phone: owner_phone,
        sees_all: true, gets_financials: true, talk_mode: "all", active: true,
      });
    } else if (existing.status !== "active") {
      // Coming back: fresh links and secrets, everything they built is still there
      const fresh = randomHex(24);
      await supabase.from("tenants").update({ status: "active", churned_at: null, access_token: fresh }).eq("id", existing.id);
      await supabase.from("tenant_config").update({ workflow_secret: randomHex(24) }).eq("tenant_id", existing.id);
      tenant = { ...existing, access_token: fresh, status: "active" };
    }

    // Make sure an existing tenant has its own secret too
    const { data: cfg } = await supabase.from("tenant_config").select("workflow_secret").eq("tenant_id", tenant!.id).maybeSingle();
    let ws = cfg?.workflow_secret as string | undefined;
    if (!ws) { ws = randomHex(24); await supabase.from("tenant_config").update({ workflow_secret: ws }).eq("tenant_id", tenant!.id); }

    // Write the custom values their workflows and pages use
    const hdr = { "Authorization": `Bearer ${GHL_KEY}`, "Version": "2021-07-28", "Content-Type": "application/json" };
    const list = await fetch(`https://services.leadconnectorhq.com/locations/${location_id}/customValues`, { headers: hdr }).then((r) => r.json()).catch(() => ({}));
    const cvs: any[] = list.customValues ?? [];
    const failed: string[] = [];
    const upsert = async (name: string, value: string) => {
      const found = cvs.find((c) => c.name === name || c.fieldKey?.endsWith(name));
      const url = found ? `https://services.leadconnectorhq.com/locations/${location_id}/customValues/${found.id}` : `https://services.leadconnectorhq.com/locations/${location_id}/customValues`;
      const r = await fetch(url, { method: found ? "PUT" : "POST", headers: hdr, body: JSON.stringify({ name, value }) });
      if (!r.ok) failed.push(name);
    };
    await upsert("archie_tenant_id", tenant!.id);
    await upsert("archie_token", tenant!.access_token);
    await upsert("archie_secret", ws);

    const { data: full } = await supabase.from("tenants").select("schedule_offset").eq("id", tenant!.id).single();
    return j({
      ok: true, created, tenant_id: tenant!.id, schedule_offset: full?.schedule_offset ?? 0,
      custom_values_failed: failed,
      page_url: `${SUPA_URL}/functions/v1/archie-screens/${tenant!.access_token}`,
      toolbox_url: `${SUPA_URL}/functions/v1/archie-mcp/${tenant!.access_token}`,
      next: [
        "Workflows: use {{custom_values.archie_secret}} in every Archie webhook header (x-archie-secret) — never the master secret.",
        "AI Studio: set ARCHIE_SCREENS_URL to page_url for this client's app.",
        "Agent Studio: connect the Archie app on Archie Assistant with toolbox_url.",
        "Then runbook B3 onwards: connections, team, settings, groups, first brief.",
      ],
    });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }
