// capture v6.6 — everything the owner or team texts (or voice-notes) to Archie.
// Quick commands (instant, free) — as v5:
// task: / <handle>: / capacity: / done: <text>
// done 2  ·  done 1 3            — tick off today's numbered tasks
// move 3 friday  ·  snooze 2     — push a task to another day (snooze = tomorrow)
// send 1  ·  skip 1              — send or bin one of today's message drafts
// add P1 · wait P1 · sara P1 · drop P1 · inbox — handle what Archie found in your messages
// 👍 / good [note]  ·  👎 / bad [note] — rate this morning's brief
// quiet today · quiet till fri · quiet off
// help
// v6: anything that isn't a quick command goes to Talk to Archie (archie-screens "talk"), which replies itself.
// v6.1: talk_mode per person — 'all' (every non-command goes to Archie), 'wake' (only messages starting "Archie…"), 'off'.
//       Default: owner 'all', team 'wake' — so normal chat between the owner and the team is left alone.
// v6.2: voice notes — if the message has no text, Archie finds the latest voice note from that person in GHL,
//       transcribes it (OpenAI), and handles the words exactly like a typed message.
// v6.3: voice notes found more ways (audio link in the text, attachments in the payload, the latest inbound message),
//       clear logging of each step, and plain-English help.
// v6.4: a message that's just the placeholder (e.g. "🔈 Voice Note") counts as a voice note.
// v6.6: forgiving shortcuts ("1 done", "done with 2", "tick 3", "finished 2") and a voice-first help.
// v6.5: the audio's real format is read from the file itself (WhatsApp voice notes are often Ogg/Opus even when the link says .mp3).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const TRANSCRIBE_MODEL = Deno.env.get("TRANSCRIBE_MODEL") ?? "gpt-4o-mini-transcribe";

const HELP = [
  "🎙️ Just talk to me — type or send a voice note. For example:",
  "• \"what's on today?\"",
  "• \"done the Lhea one\" · \"push the content one to Friday\"",
  "• \"send Jase's message\" · \"bin that draft\"",
  "• \"what did you spot in my messages?\" · \"give P2 to Sara\"",
  "• \"I'm off Friday\" · \"how's money this month?\"",
  "• \"write me a post about systems over hustle\"",
  "",
  "Quick shortcuts still work if you like them: done 1 · move 2 fri · send 1 · add P1 · quiet till fri · 👍 / 👎",
].join("\n");

Deno.serve(async (req) => {
  console.log("capture v6.6 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = str(p.tenant_id);
    let text = str(p.text ?? p.message ?? p.body ?? raw.message?.body ?? "").trim();
    const senderPhone = str(p.sender ?? p.phone ?? raw.phone ?? "").replace(/\s+/g, "");
    const senderContact = str(p.contact_id ?? raw.contact_id ?? "") || null;
    if (!tenant_id) return j({ ok: true, reply: "" });

    const { data: cfg } = await supabase.from("tenant_config").select("timezone, ghl_token, ghl_location_id").eq("tenant_id", tenant_id).single();

    // Voice note → find the audio and transcribe it. It can arrive as: no text, a placeholder like "Voice message",
    // an audio link in the text, attachments in the payload, or only in GHL's copy of the message.
    let heard = "";
    const AUDIO_URL = /(https?:\/\/\S+\.(?:ogg|oga|opus|mp3|m4a|aac|wav|webm|amr)(?:\?\S*)?)/i;
    const payloadAtts: any[] = [p.attachments, raw.attachments, raw.message?.attachments, p.message?.attachments].flatMap((x) => {
      if (!x) return [];
      if (Array.isArray(x)) return x;
      if (typeof x === "string") { try { const v = JSON.parse(x); return Array.isArray(v) ? v : [x]; } catch { return x.split(/[\s,]+/); } }
      return [x];
    });
    const attUrl = payloadAtts.map((a) => (typeof a === "string" ? a : a?.url ?? "")).find((u) => /^https?:/.test(u) && (AUDIO_URL.test(u) || /audio|voice/i.test(u)));
    const inText = text.match(AUDIO_URL)?.[1] ?? "";
    const plain = text.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().toLowerCase();
    // Only the placeholder itself counts ("Voice Note", "🔈 Voice Note", "[audio]") — not a sentence that mentions voice
    const looksLikeVoice = !text || /^(?:(?:voice|audio)(?: (?:note|message|memo|clip|file))?|ptt|attachment|media)$/.test(plain) || !!inText || !!attUrl;
    console.log("voice check:", JSON.stringify({ textLen: text.length, textStart: text.slice(0, 40), inText: !!inText, attUrl: !!attUrl, looksLikeVoice }));
    if (looksLikeVoice) {
      const audioUrl = attUrl || inText || (senderContact ? await latestAudio(cfg?.ghl_token || FALLBACK_TOKEN, cfg?.ghl_location_id, senderContact, str(p.message_id)) : null);
      console.log("voice audio url found:", audioUrl ? audioUrl.slice(0, 80) : "none");
      if (audioUrl) {
        heard = await transcribe(audioUrl);
        console.log("voice heard:", heard ? heard.slice(0, 80) : "(nothing)");
        if (heard) text = heard;
      }
      if (!heard) {
        // Couldn't hear it — say so plainly rather than passing a placeholder to Archie
        return j({ ok: true, reply: "🎙️ I couldn't hear that voice note — try again, or type it for now.", has_reply: "yes" });
      }
    }
    if (!text) return j({ ok: true, reply: "" });
    const tz = cfg?.timezone || "Europe/London";
    const today = localDate(Date.now(), tz);

    const { data: members } = await supabase.from("team_members").select("handle, name, phone, ghl_contact_id, gets_financials, talk_mode").eq("tenant_id", tenant_id);
    const me = (members ?? []).find((m) => (senderContact && m.ghl_contact_id === senderContact) || (m.phone && m.phone.replace(/\s+/g, "") === senderPhone));
    if (!me) return j({ ok: true, reply: "", skipped: "sender not on team" });

    const bump = (field: string, n = 1) => supabase.rpc("bump_activity", { p_tenant: tenant_id, p_day: today, p_field: field, p_n: n });
    const lower = text.toLowerCase();
    await bump("commands");

    // Anything that isn't a quick command → Talk to Archie (it replies on WhatsApp itself).
    // Team members must start with "Archie" so their normal chat with the owner is left alone.
    const mode = String(me.talk_mode ?? (me.gets_financials ? "all" : "wake")).toLowerCase();
    const WAKE = /^(?:hey\s+|hi\s+|ok\s+)?@?archie\b[\s,:!.-]*/i;
    const toTalk = async () => {
      if (mode === "off") return j({ ok: true, reply: "", skipped: "talk off for this person" });
      let said = text;
      if (mode === "wake") {
        if (!WAKE.test(text)) return j({ ok: true, reply: "", skipped: "no wake word" });
        said = text.replace(WAKE, "").trim();
        if (!said) return reply("Yes? Ask me anything — e.g. \"Archie, what's on my list?\"");
      }
      const contactId = me.ghl_contact_id || senderContact;
      if (!contactId) return j({ ok: true, reply: "", skipped: "no contact id for talk" });
      try {
        await fetch(`${SUPA_URL}/functions/v1/archie-screens`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-archie-secret": SECRET },
          body: JSON.stringify({ action: "talk", tenant_id, contact_id: contactId, text: heard ? `(voice note) ${said}` : said }),
        });
      } catch (e) { console.log("talk hand-off failed", String(e)); }
      await bump("talk");
      return j({ ok: true, reply: "", has_reply: "no", handed_to: "talk" });
    };

    // ---------- help ----------
    if (lower === "help" || lower === "?") return reply(HELP);

    // ---------- feedback ----------
    const fb = text.match(/^(👍[\u{1F3FB}-\u{1F3FF}]?|👎[\u{1F3FB}-\u{1F3FF}]?|good|bad|great|useful|not useful|meh)(?=$|[\s:,.!-])[\s:,.!-]*([\s\S]*)$/iu);
    // Emoji feedback always counts; word feedback only when it's clearly feedback ("good", "bad: too long")
    // so "good morning, what's on today?" goes to Talk to Archie instead.
    const wordFeedback = /^(good|bad|great|useful|not useful|meh)\s*(?:$|[:\-–—])/i.test(text);
    if (fb && (fb[1].startsWith("👍") || fb[1].startsWith("👎") || wordFeedback)) {
      const positive = /^(👍|good|great|useful)/iu.test(fb[1]);
      const note = str(fb[2]) || null;
      await supabase.from("brief_feedback").insert({ tenant_id, handle: me.handle, created_on: today, rating: positive ? 1 : -1, note });
      await bump(positive ? "feedback_up" : "feedback_down");
      return reply(positive ? "Noted — more like that." : note ? "Noted — I'll adjust." : "Noted. Reply with why and I'll adjust.");
    }

    // ---------- quiet ----------
    const q = lower.match(/^quiet\s+(today|tomorrow|off|till\s+\S+|until\s+\S+)$/);
    if (q) {
      const arg = q[1];
      if (arg === "off") { await supabase.from("team_members").update({ quiet_until: null }).eq("tenant_id", tenant_id).eq("handle", me.handle); return reply("Quiet mode off. Normal briefs from tomorrow."); }
      const until = arg === "today" ? today : arg === "tomorrow" ? resolveDay("tomorrow", tz) : resolveDay(arg.split(/\s+/)[1], tz);
      await supabase.from("team_members").update({ quiet_until: until }).eq("tenant_id", tenant_id).eq("handle", me.handle);
      return reply(`Quiet until ${until}. You'll only hear from me if something's urgent.`);
    }

    // ---------- done 2 / done 1 3 ----------
    const DONE_WORDS = "done|did|✅|✔️|tick|ticked|finished|complete|completed";
    const dn = lower.match(new RegExp(`^(?:${DONE_WORDS})(?:\\s+with)?(?:\\s+(?:number|no\\.?|#))?\\s*([\\d\\s,&and]+)$`, "u"))
      ?? lower.match(new RegExp(`^(?:number\\s+|#)?([\\d\\s,&and]+?)\\s+(?:is\\s+)?(?:${DONE_WORDS})$`, "u"));
    if (dn) {
      const ranks = (dn[1].match(/\d+/g) ?? []).map(Number);
      const { data: hits } = await supabase.from("tasks").select("id, title, today_rank").eq("tenant_id", tenant_id).eq("owner", me.handle).eq("today", true).in("today_rank", ranks);
      if (!hits?.length) return reply(`No task numbered ${ranks.join(", ")} on today's list.`);
      await supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).in("id", hits.map((h) => h.id));
      await bump("tasks_done", hits.length);
      const left = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tenant_id).eq("owner", me.handle).eq("today", true).in("status", ["open", "doing"]);
      return reply(`Done: ${hits.map((h) => h.title).join(" · ")}. ${left.count ? `${left.count} left today.` : "Today's list is clear."}`);
    }

    // ---------- move 3 friday / snooze 2 ----------
    const mv = lower.match(/^(move|snooze|push)\s+(\d+)(?:\s+(?:to\s+)?(\S+))?$/);
    if (mv) {
      const rank = Number(mv[2]);
      const target = mv[1] === "snooze" || !mv[3] ? resolveDay("tomorrow", tz) : resolveDay(mv[3], tz);
      const { data: hit } = await supabase.from("tasks").select("id, title").eq("tenant_id", tenant_id).eq("owner", me.handle).eq("today", true).eq("today_rank", rank).maybeSingle();
      if (!hit) return reply(`No task numbered ${rank} on today's list.`);
      await supabase.from("tasks").update({ due_date: target, today: false, today_rank: null }).eq("id", hit.id);
      return reply(`Moved "${hit.title}" to ${target}.`);
    }

    // ---------- send 1 / skip 1 ----------
    const sd = lower.match(/^(send|skip|bin)\s+(\d+)$/);
    if (sd) {
      const rank = Number(sd[2]);
      const { data: d } = await supabase.from("message_drafts").select("*").eq("tenant_id", tenant_id).eq("status", "pending").eq("rank", rank).order("created_on", { ascending: false }).limit(1).maybeSingle();
      if (!d) return reply(`No draft numbered ${rank} waiting.`);
      if (sd[1] !== "send") {
        await supabase.from("message_drafts").update({ status: "dismissed" }).eq("id", d.id);
        return reply(`Binned draft ${rank} to ${d.name}.`);
      }
      const type = ({ WA: "WhatsApp", SMS: "SMS", IG: "IG", FB: "FB", Chat: "Live_Chat" } as Record<string, string>)[d.channel];
      if (!type) return reply(`Draft ${rank} is for ${d.channel} — send that one from GHL. Text: ${d.body}`);
      const token = cfg?.ghl_token || FALLBACK_TOKEN;
      const r = await ghl(token, "/conversations/messages", "POST", { type, contactId: d.contact_id, message: d.body });
      if (!r.ok) return reply(`Couldn't send draft ${rank} (${r.status}). Send it from GHL: ${d.body}`);
      await supabase.from("message_drafts").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", d.id);
      await bump("drafts_sent");
      return reply(`Sent to ${d.name} on ${type}.`);
    }

    // ---------- proposals: inbox / add P1 / wait P1 [name] / <handle> P1 / drop P1 ----------
    const handleList = (members ?? []).map((m) => m.handle.toLowerCase());
    if (lower === "inbox" || lower === "proposals") {
      const { data: props } = await supabase.from("tasks").select("id, title, proposal_rank, created_at").eq("tenant_id", tenant_id).eq("status", "proposed").order("created_at", { ascending: false }).limit(10);
      if (!props?.length) return reply("Nothing new from your messages.");
      await supabase.from("tasks").update({ proposal_rank: null }).eq("tenant_id", tenant_id).not("proposal_rank", "is", null);
      for (let i = 0; i < props.length; i++) await supabase.from("tasks").update({ proposal_rank: i + 1 }).eq("id", props[i].id);
      return reply(props.map((x, i) => `P${i + 1} ${x.title}`).join("\n") + "\n\nadd P1 · wait P1 · drop P1");
    }
    const pm = lower.match(/^([a-z]+)\s+((?:p\d+[\s,]*)+)(.*)$/);
    if (pm && (["add", "accept", "yes", "wait", "drop", "no", "bin"].includes(pm[1]) || handleList.includes(pm[1]))) {
      const verb = pm[1];
      const ranks = (pm[2].match(/\d+/g) ?? []).map(Number);
      const extra = str(text.slice(text.toLowerCase().indexOf(pm[2].trim()) + pm[2].trim().length)).trim();
      const { data: hits } = await supabase.from("tasks").select("id, title, client_id, proposal_rank").eq("tenant_id", tenant_id).eq("status", "proposed").in("proposal_rank", ranks);
      if (!hits?.length) return reply(`No proposal ${ranks.map((r) => "P" + r).join(", ")} — reply "inbox" to see the current list.`);
      const now = new Date().toISOString();
      const titles = hits.map((h) => h.title).join(" · ");
      if (verb === "drop" || verb === "no" || verb === "bin") {
        await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "dropped by text", proposal_rank: null }).in("id", hits.map((h) => h.id));
        return reply(`Dropped: ${titles}`);
      }
      if (verb === "wait") {
        for (const h of hits) {
          let who = extra;
          if (!who && h.client_id) { const { data: c } = await supabase.from("clients").select("name").eq("id", h.client_id).maybeSingle(); who = c?.name ?? ""; }
          await supabase.from("tasks").update({ status: "waiting", owner: me.handle, waiting_for: who || "them", waiting_since: today, accepted_by: me.handle, accepted_at: now, proposal_rank: null }).eq("id", h.id);
        }
        return reply(`Waiting on it: ${titles}. I'll nudge you after 5 days.`);
      }
      const owner = handleList.includes(verb) ? verb : me.handle;
      const tierM = extra.match(/\b(must|high|bonus)\b/i);
      const patch: Record<string, unknown> = { status: "open", owner, accepted_by: me.handle, accepted_at: now, proposal_rank: null };
      if (tierM) patch.tier = tierM[1].toLowerCase();
      await supabase.from("tasks").update(patch).in("id", hits.map((h) => h.id));
      return reply(`Added${owner !== me.handle ? ` for ${owner}` : ""}: ${titles}`);
    }

    // ---------- prefixed commands ----------
    const handles = (members ?? []).map((m) => m.handle.toLowerCase());
    const cmd = text.match(/^([a-z]+)\s*:\s*([\s\S]+)$/i);
    if (!cmd) return await toTalk();
    const kind = cmd[1].toLowerCase(); let rest = cmd[2].trim();

    if (kind === "capacity") {
      const m = rest.match(/^(today|tomorrow|mon|tue|wed|thu|fri|sat|sun|\d{4}-\d{2}-\d{2})?\s*(\d+)\s*(.*)$/i);
      if (!m) return reply("Say: capacity: 90  or  capacity: tomorrow 0 reason");
      const day = resolveDay(m[1] ?? "today", tz);
      const minutes = parseInt(m[2], 10); const note = m[3]?.trim() || null;
      await supabase.from("capacity").upsert({ tenant_id, handle: me.handle, day, minutes, note }, { onConflict: "tenant_id,handle,day" });
      return reply(`Capacity ${day}: ${minutes} min${note ? " — " + note : ""}`);
    }

    if (kind === "done") {
      const { data: hits } = await supabase.from("tasks").select("id, title").eq("tenant_id", tenant_id).in("status", ["open", "doing", "waiting"]).ilike("title", `%${rest}%`).limit(2);
      if (!hits?.length) return reply(`No open task matching "${rest}"`);
      if (hits.length > 1) return reply(`Two matches: "${hits[0].title}" / "${hits[1].title}" — be more specific`);
      await supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).eq("id", hits[0].id);
      await bump("tasks_done");
      return reply(`Done: ${hits[0].title}`);
    }

    if (kind !== "task" && !handles.includes(kind)) return await toTalk();

    let owner = kind === "task" ? me.handle : kind;
    const forM = rest.match(/\s+for\s+([a-z]+)\s*$/i);
    if (forM && handles.includes(forM[1].toLowerCase())) { owner = forM[1].toLowerCase(); rest = rest.replace(forM[0], "").trim(); }

    let tier = "high";
    const tierM = rest.match(/\s+(must|high|bonus)\s*$/i);
    if (tierM) { tier = tierM[1].toLowerCase(); rest = rest.replace(tierM[0], "").trim(); }

    let kindCol = "shallow";
    if (/\s+deep\s*$/i.test(rest)) { kindCol = "deep"; rest = rest.replace(/\s+deep\s*$/i, "").trim(); }

    let effort = 30;
    const effM = rest.match(/\s+(\d+)\s*(m|min|mins|h|hr|hrs)\s*$/i);
    if (effM) { const n = Number(effM[1]); effort = /^h/i.test(effM[2]) ? n * 60 : n; rest = rest.replace(effM[0], "").trim(); }

    let due: string | null = null;
    const dueM = rest.match(/\b(by|on|before)\s+(today|tomorrow|mon|tue|wed|thu|fri|sat|sun|\d{4}-\d{2}-\d{2})\b/i);
    if (dueM) { due = resolveDay(dueM[2], tz); rest = rest.replace(dueM[0], "").trim(); }

    let client_id: string | null = null, project_id: string | null = null;
    const { data: clients } = await supabase.from("clients").select("id, name").eq("tenant_id", tenant_id).eq("status", "active");
    for (const c of clients ?? []) { const first = String(c.name).split(" ")[0]; if (first.length > 2 && new RegExp(`\\b${escape(first)}\\b`, "i").test(rest)) { client_id = c.id; break; } }
    if (client_id) { const { data: pr } = await supabase.from("projects").select("id").eq("client_id", client_id).eq("status", "active").maybeSingle(); project_id = pr?.id ?? null; }

    const title = rest.charAt(0).toUpperCase() + rest.slice(1);
    const { error } = await supabase.from("tasks").insert({ tenant_id, title, detail: `${me.name} via text: ${text}`, tier, kind: kindCol, effort_minutes: effort, status: "open", owner, source: "capture", source_ref: str(p.message_id) || `sms:${Date.now()}`, client_id, project_id, due_date: due });
    if (error) return j({ error: error.message }, 500);
    return reply(`Added: ${title} — ${tier}, ${effort} min${owner !== me.handle ? ", for " + owner : ""}${due ? ", due " + due : ""}`);
  } catch (e) { return j({ error: String(e) }, 500); }
});

let HEARD_PREFIX = "";
function reply(text: string) { const out = text ? HEARD_PREFIX + text : text; console.log("reply:", out); return j({ ok: true, reply: out, has_reply: out ? "yes" : "no" }); }
// The newest voice note/audio this contact sent (optionally the exact message), from GHL
async function latestAudio(token: string, loc: string | undefined, contactId: string, messageId: string): Promise<string | null> {
  const isAudio = (u: string) => /\.(ogg|oga|opus|mp3|m4a|aac|wav|webm|amr)(\?|$)/i.test(u) || /audio|voice/i.test(u);
  if (messageId) {
    const m = await ghl(token, `/conversations/messages/${messageId}`, "GET");
    const atts: any[] = m.json?.message?.attachments ?? m.json?.attachments ?? [];
    const hit = atts.map((a) => (typeof a === "string" ? a : a?.url ?? "")).find((u) => u && isAudio(u));
    if (hit) return hit;
  }
  if (!loc) return null;
  const cs = await ghl(token, `/conversations/search?locationId=${loc}&contactId=${contactId}&limit=1`, "GET");
  const conv = (cs.json?.conversations ?? [])[0];
  if (!conv?.id) return null;
  const ms = await ghl(token, `/conversations/${conv.id}/messages?limit=5`, "GET");
  const list: any[] = ms.json?.messages?.messages ?? ms.json?.messages ?? [];
  const since = Date.now() - 15 * 60 * 1000;
  console.log("latestAudio: checking", Array.isArray(list) ? list.length : 0, "recent messages");
  for (const m of Array.isArray(list) ? list : []) {
    if (String(m.direction ?? "").toLowerCase() !== "inbound") continue;
    console.log("latestAudio msg:", JSON.stringify({ type: m.messageType ?? m.type, contentType: m.contentType, atts: (m.attachments ?? []).length, body: String(m.body ?? "").slice(0, 40) }));
    if (m.dateAdded && Date.parse(m.dateAdded) < since) continue;
    const atts: any[] = m.attachments ?? [];
    const hit = atts.map((a) => (typeof a === "string" ? a : a?.url ?? "")).find((u) => u && isAudio(u));
    if (hit) return hit;
    if (atts.length && /audio|voice/i.test(String(m.contentType ?? m.messageType ?? ""))) return typeof atts[0] === "string" ? atts[0] : atts[0]?.url ?? null;
  }
  return null;
}

// Speech to text (OpenAI). Returns "" if it can't.
// The file type is taken from the audio's own first bytes, not the link — WhatsApp notes are usually Ogg/Opus
// even when the link ends in .mp3, and a wrong name makes the transcription fail.
async function transcribe(url: string): Promise<string> {
  if (!OPENAI_KEY) { console.log("no OPENAI_API_KEY — can't transcribe"); return ""; }
  try {
    const a = await fetch(url);
    if (!a.ok) { console.log("audio download failed", a.status); return ""; }
    const buf = new Uint8Array(await a.arrayBuffer());
    const head = Array.from(buf.slice(0, 12));
    const ascii = String.fromCharCode(...head.map((b) => (b >= 32 && b < 127 ? b : 46)));
    console.log("audio file:", JSON.stringify({ bytes: buf.length, contentType: a.headers.get("content-type"), starts: ascii }));
    if (buf.length < 500) { console.log("audio too small — probably not audio"); return ""; }
    if (buf.length > 24 * 1024 * 1024) return "";
    let ext = "mp3", mime = "audio/mpeg";
    if (ascii.startsWith("OggS")) { ext = "ogg"; mime = "audio/ogg"; }
    else if (ascii.startsWith("RIFF")) { ext = "wav"; mime = "audio/wav"; }
    else if (ascii.slice(4, 8) === "ftyp") { ext = "m4a"; mime = "audio/mp4"; }
    else if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) { ext = "webm"; mime = "audio/webm"; }
    else if (ascii.startsWith("#!AMR")) { ext = "amr"; mime = "audio/amr"; }
    else if (ascii.startsWith("ID3") || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0)) { ext = "mp3"; mime = "audio/mpeg"; }
    else if (ascii.startsWith("<") || ascii.startsWith("{")) { console.log("got a web page, not audio"); return ""; }
    if (ext === "amr") { console.log("AMR audio isn't supported for transcription"); return ""; }
    const form = new FormData();
    form.append("file", new File([buf], `voice.${ext}`, { type: mime }));
    form.append("model", TRANSCRIBE_MODEL);
    form.append("language", "en");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_KEY}` }, body: form });
    const js: any = await r.json().catch(() => null);
    if (!r.ok) console.log("transcription error", r.status, JSON.stringify(js).slice(0, 200));
    return String(js?.text ?? "").trim();
  } catch (e) { console.log("transcribe failed", String(e)); return ""; }
}

function resolveDay(s: string, tz: string) {
  const t = String(s ?? "").toLowerCase();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const base = Date.now();
  if (t === "today" || !t) return localDate(base, tz);
  if (t === "tomorrow") return localDate(base + 86400000, tz);
  const idx = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(t.slice(0, 3));
  if (idx < 0) return localDate(base + 86400000, tz);
  const now = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" }).format(new Date(base));
  const cur = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(now);
  let diff = (idx - cur + 7) % 7; if (diff === 0) diff = 7;
  return localDate(base + diff * 86400000, tz);
}
function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
async function ghl(token: string, path: string, method = "GET", body?: unknown) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, { method, signal: ctrl.signal, headers: { "Authorization": `Bearer ${token}`, "Version": "2021-04-15", "Accept": "application/json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let json: any = null; try { json = JSON.parse(text); } catch { json = null; }
    return { ok: r.ok, status: r.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}
function escape(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") { const o = v as Record<string, unknown>; for (const k of ["body", "text", "message", "value", "content"]) if (typeof o[k] === "string") return o[k] as string; }
  return String(v);
}
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }
