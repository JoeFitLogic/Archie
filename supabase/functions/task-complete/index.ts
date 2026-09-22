// task-complete v2 — CRM "task completed" webhook → mark Supabase task done. Logs payload for mapping.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;

Deno.serve(async (req) => {
  console.log("task-complete v2 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const p = await req.json();
    console.log("payload:", JSON.stringify(p));

    // Pull identifiers from wherever they turn up
    const c = p.customData ?? {};
    const taskId = c.task_id ?? p.task_id ?? p.taskId ?? null;
    const title = c.task_title ?? p.task_title ?? p.task?.title ?? null;
    const contactId = c.contact_id ?? p.contact_id ?? null;
    console.log("parsed:", JSON.stringify({ taskId, title, contactId }));

    let q = supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).in("status", ["open", "doing", "waiting"]);

    if (taskId) {
      q = q.eq("ghl_task_id", taskId);
    } else if (title && contactId) {
      const { data: client } = await supabase.from("clients").select("id").eq("ghl_contact_id", contactId).maybeSingle();
      if (client) q = q.eq("client_id", client.id).eq("title", title);
      else {
        const { data: member } = await supabase.from("team_members").select("handle").eq("ghl_contact_id", contactId).maybeSingle();
        if (!member) return j({ error: "contact not recognised", contactId }, 400);
        q = q.eq("owner", member.handle).eq("title", title);
      }
    } else if (title) {
      q = q.eq("title", title);
    } else {
      return j({ error: "need task_id or title", received: Object.keys(p) }, 400);
    }

    const { data, error } = await q.select("id, title");
    if (error) return j({ error: error.message }, 500);
    console.log("updated:", data?.length ?? 0);
    return j({ ok: true, updated: data?.length ?? 0, matched: data ?? [], usedTaskId: !!taskId, usedTitle: !taskId });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }