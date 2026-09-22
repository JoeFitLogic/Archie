import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    if (!p.tenant_id) return j({ error: "tenant_id required" }, 400);
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.from("briefs")
      .update({ delivered: true }).eq("tenant_id", p.tenant_id).eq("brief_date", today).select("audience");
    if (error) return j({ error: error.message }, 500);
    return j({ ok: true, marked: data?.length ?? 0 });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }