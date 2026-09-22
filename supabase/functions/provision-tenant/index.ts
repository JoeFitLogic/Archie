// provision-tenant — create tenant on signup, write custom values back, cancel on churn
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const GHL_KEY = Deno.env.get("GHL_AGENCY_API_KEY")!;

Deno.serve(async (req) => {
  console.log("provision-tenant v2 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const { location_id, plan, action, business_name, owner_name, owner_email, owner_phone } = p;
    if (!location_id) return j({ error: "location_id required" }, 400);

    const { data: existing } = await supabase.from("tenants").select("id, access_token, status").eq("location_id", location_id).maybeSingle();

    if (action === "cancel") {
      if (existing) {
        await supabase.from("tenants").update({ status: "churned", churned_at: new Date().toISOString() }).eq("id", existing.id);
        await supabase.from("agency_alerts").insert({ tenant_id: existing.id, kind: "cancel", detail: business_name ?? location_id });
      }
      return j({ ok: true, cancelled: true });
    }

    let tenant = existing;
    if (!tenant) {
      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const { data: used } = await supabase.from("tenants").select("schedule_offset");
      const taken = new Set((used ?? []).map(u => u.schedule_offset)); let offset = 0; while (taken.has(offset) && offset < 30) offset++;
      const { data: t } = await supabase.from("tenants").insert({ location_id, access_token: token, business_name: business_name ?? location_id, owner_name, owner_email, schedule_offset: offset, status: "active" }).select("id, access_token, status").single();
      tenant = t!;
      const tier = (plan ?? "").toLowerCase().includes("plus") ? 2 : 1;
      const features = tier === 2 ? { voice_ai: true, mentor_kb: true, precall_brief: true, weekly_review: true, monthly_report: true } : {};
      await supabase.from("tenant_config").insert({ tenant_id: tenant.id, tier, features, timezone: "Europe/London", currency: "GBP", ghl_location_id: location_id });
      await supabase.from("team_members").insert({ tenant_id: tenant.id, handle: "owner", name: owner_name ?? "Owner", phone: owner_phone, sees_all: true, gets_financials: true });
    } else if (existing.status !== "active") {
      await supabase.from("tenants").update({ status: "active", churned_at: null }).eq("id", existing.id);
    }

    const hdr = { "Authorization": `Bearer ${GHL_KEY}`, "Version": "2021-07-28", "Content-Type": "application/json" };
    const list = await fetch(`https://services.leadconnectorhq.com/locations/${location_id}/customValues`, { headers: hdr }).then(r => r.json()).catch(() => ({}));
    const cvs: any[] = list.customValues ?? [];
    const upsert = async (name: string, value: string) => {
      const found = cvs.find(c => c.name === name || c.fieldKey?.endsWith(name));
      const url = found ? `https://services.leadconnectorhq.com/locations/${location_id}/customValues/${found.id}` : `https://services.leadconnectorhq.com/locations/${location_id}/customValues`;
      await fetch(url, { method: found ? "PUT" : "POST", headers: hdr, body: JSON.stringify({ name, value }) });
    };
    await upsert("archie_tenant_id", tenant.id);
    await upsert("archie_token", tenant.access_token);
    const { data: full } = await supabase.from("tenants").select("schedule_offset").eq("id", tenant.id).single();
    return j({ ok: true, tenant_id: tenant.id, schedule_offset: full?.schedule_offset ?? 0 });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }