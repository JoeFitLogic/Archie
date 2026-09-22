import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
Deno.serve(async (req) => {
  const { tenant_id } = await req.json();
  const { data, error } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
  return new Response(JSON.stringify({ data, error }), { headers: { "Content-Type": "application/json" } });
});
