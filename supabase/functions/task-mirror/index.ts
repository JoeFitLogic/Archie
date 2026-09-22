// task-mirror — Supabase DB webhook on tasks → create GHL task on owner's user + contact, write ghl_task_id back
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const GHL_KEY = Deno.env.get("GHL_AGENCY_API_KEY")!;
const H = { "Authorization": `Bearer ${GHL_KEY}`, "Version": "2021-07-28", "Content-Type": "application/json" };

Deno.serve(async (req) => {
  console.log("task-mirror v1 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const payload = await req.json();
    const row = payload.record ?? payload;
    if (!row?.id || !row.tenant_id) return j({ error: "no task row" }, 400);

    // Only mirror open/doing tasks with an owner and no mirror yet
    if (!row.owner || row.ghl_task_id || !["open", "doing", "waiting"].includes(row.status)) return j({ ok: true, skipped: "not eligible" });

    const { data: member } = await supabase.from("team_members").select("ghl_user_id, ghl_contact_id").eq("tenant_id", row.tenant_id).eq("handle", row.owner).maybeSingle();
    if (!member?.ghl_user_id || !member.ghl_contact_id) return j({ error: `team member ${row.owner} missing ghl ids` }, 400);

    let contactId = member.ghl_contact_id;
    if (row.client_id) {
      const { data: client } = await supabase.from("clients").select("ghl_contact_id").eq("id", row.client_id).maybeSingle();
      if (client?.ghl_contact_id) contactId = client.ghl_contact_id;
    }

    const desc = [row.detail, `Tier: ${row.tier}`, row.kind ? `Kind: ${row.kind}` : null, `Archie task ${row.id}`].filter(Boolean).join("\n");
    const body: any = { title: row.title, body: desc, assignedTo: member.ghl_user_id, completed: false };
    const due = row.due_date ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    body.dueDate = new Date(due + "T09:00:00Z").toISOString();

    const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tasks`, { method: "POST", headers: H, body: JSON.stringify(body) });
    const text = await r.text();
    if (!r.ok) return j({ error: `GHL ${r.status}: ${text.slice(0, 300)}` }, 502);
    const created = JSON.parse(text);
    const ghlTaskId = created.task?.id ?? created.id;
    if (!ghlTaskId) return j({ error: "no task id in GHL response", raw: text.slice(0, 300) }, 502);

    await supabase.from("tasks").update({ ghl_task_id: ghlTaskId }).eq("id", row.id);
    return j({ ok: true, ghl_task_id: ghlTaskId, contact: contactId, user: member.ghl_user_id });
  } catch (e) { return j({ error: String(e) }, 500); }
});
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }