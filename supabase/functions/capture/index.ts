// capture — SMS "task:" / "capacity:" / "sara:" / "done:" → parsed, written, one-line reply returned
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const GHL_KEY = Deno.env.get("GHL_AGENCY_API_KEY")!;

Deno.serve(async (req) => {
  console.log("capture v3 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    console.log("customData:", JSON.stringify(raw.customData ?? {}));
    console.log("text type:", typeof p.text, JSON.stringify(p.text));
    const tenant_id: string = str(p.tenant_id);
    const text: string = str(p.text ?? p.message ?? p.body ?? raw.message?.body ?? "").trim();
    const senderPhone: string = str(p.sender ?? p.phone ?? raw.phone ?? "").replace(/\s+/g, "");
    const senderContact: string | null = str(p.contact_id ?? raw.contact_id ?? "") || null;
    if (!tenant_id || !text) return j({ error: "tenant_id and text required" }, 400);

    // Who sent it
    const { data: members } = await supabase.from("team_members").select("handle, name, phone, ghl_contact_id").eq("tenant_id", tenant_id);
    const me = (members ?? []).find(m => (senderContact && m.ghl_contact_id === senderContact) || (m.phone && m.phone.replace(/\s+/g, "") === senderPhone));
    if (!me) return j({ ok: true, reply: "", skipped: "sender not on team" });

    const cmd = text.match(/^(task|sara|capacity|done)\s*:\s*(.+)$/is);
    if (!cmd) return j({ ok: true, reply: "", skipped: "no command" });
    const [, kind, restRaw] = cmd; let rest = restRaw.trim();
    const today = new Date().toISOString().slice(0, 10);

    // ---- capacity: 90 | capacity: tomorrow 0 school trip | capacity: fri 120 ----
    if (kind.toLowerCase() === "capacity") {
      const m = rest.match(/^(today|tomorrow|mon|tue|wed|thu|fri|sat|sun|\d{4}-\d{2}-\d{2})?\s*(\d+)\s*(.*)$/i);
      if (!m) return j({ ok: true, reply: "Say: capacity: 90  or  capacity: tomorrow 0 reason" });
      const day = resolveDay(m[1] ?? "today");
      const minutes = parseInt(m[2], 10); const note = m[3]?.trim() || null;
      await supabase.from("capacity").upsert({ tenant_id, handle: me.handle, day, minutes, note }, { onConflict: "tenant_id,handle,day" });
      return jlog({ ok: true, reply: `Capacity ${day}: ${minutes} min${note ? " — " + note : ""}` });
    }

    // ---- done: <title fragment> ----
    if (kind.toLowerCase() === "done") {
      const { data: hits } = await supabase.from("tasks").select("id, title").eq("tenant_id", tenant_id).in("status", ["open", "doing", "waiting"]).ilike("title", `%${rest}%`).limit(2);
      if (!hits?.length) return j({ ok: true, reply: `No open task matching "${rest}"` });
      if (hits.length > 1) return j({ ok: true, reply: `Two matches: "${hits[0].title}" / "${hits[1].title}" — be more specific` });
      await supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", hits[0].id);
      return jlog({ ok: true, reply: `Done: ${hits[0].title}` });
    }

    // ---- task: / sara: ----
    let owner = me.handle;
    if (kind.toLowerCase() === "sara") owner = "sara";
    const forM = rest.match(/\s+for\s+([a-z]+)\s*$/i);
    if (forM && (members ?? []).some(m => m.handle === forM[1].toLowerCase())) { owner = forM[1].toLowerCase(); rest = rest.replace(forM[0], "").trim(); }

    let tier = "high";
    const tierM = rest.match(/\s+(must|high|bonus)\s*$/i);
    if (tierM) { tier = tierM[1].toLowerCase(); rest = rest.replace(tierM[0], "").trim(); }

    let kindCol = "shallow";
    if (/\s+deep\s*$/i.test(rest)) { kindCol = "deep"; rest = rest.replace(/\s+deep\s*$/i, "").trim(); }

    let due: string | null = null;
    const dueM = rest.match(/\b(by|on|before)\s+(today|tomorrow|mon|tue|wed|thu|fri|sat|sun|\d{4}-\d{2}-\d{2})\b/i);
    if (dueM) { due = resolveDay(dueM[2]); rest = rest.replace(dueM[0], "").trim(); }

    // client match by first-name-ish token
    let client_id: string | null = null, project_id: string | null = null;
    const { data: clients } = await supabase.from("clients").select("id, name").eq("tenant_id", tenant_id).eq("status", "active");
    for (const c of clients ?? []) { const first = c.name.split(" ")[0]; if (first.length > 2 && new RegExp(`\\b${escape(first)}\\b`, "i").test(rest)) { client_id = c.id; break; } }
    if (client_id) { const { data: pr } = await supabase.from("projects").select("id").eq("client_id", client_id).eq("status", "active").maybeSingle(); project_id = pr?.id ?? null; }

    const title = rest.charAt(0).toUpperCase() + rest.slice(1);
    const { error } = await supabase.from("tasks").insert({ tenant_id, title, detail: `${me.name} via SMS: ${text}`, tier, kind: kindCol, status: "open", owner, source: "capture", source_ref: p.message_id ?? `sms:${Date.now()}`, client_id, project_id, due_date: due });
    if (error) return j({ error: error.message }, 500);
    return jlog({ ok: true, reply: `Added: ${title} — ${tier}${owner !== me.handle ? ", for " + owner : ""}${due ? ", due " + due : ""}` });
  } catch (e) { return j({ error: String(e) }, 500); }
});

function resolveDay(s: string) {
  const t = s.toLowerCase(); const d = new Date();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  if (t === "tomorrow") d.setDate(d.getDate() + 1);
  else if (t !== "today") { const idx = ["sun","mon","tue","wed","thu","fri","sat"].indexOf(t.slice(0,3)); if (idx >= 0) { let diff = (idx - d.getDay() + 7) % 7; if (diff === 0) diff = 7; d.setDate(d.getDate() + diff); } }
  return d.toISOString().slice(0, 10);
}
function escape(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of ["body", "text", "message", "value", "content"]) if (typeof o[k] === "string") return o[k] as string;
  }
  return String(v);
}
function jlog(b: any, s = 200) { console.log("reply:", b.reply); return j(b, s); }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }