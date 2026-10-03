// capture v7.1 — everything the owner or team texts (or voice-notes) to Archie.
// v7.1: screenshots/photos with no "save" → Archie reads them and acts; videos with "a week of content" / "cut into reels" → several reels + a carousel.
// v7.0: "edit, this is idea 2" links the video to number 2 on the filming list.
// v6.9: videos and photos sent on WhatsApp are saved into GHL Media; say "edit" with a video and Archie Edit makes it a reel.
// capture v6.8: accepts each client's own workflow secret as well as the master secret.
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
// v6.7: conversation window for wake-word people (e.g. Sara) — say "Archie" once and the next messages go to Archie
//       for 10 minutes (each message resets it); "that's all" / "thanks Archie" / "Archie off" closes it.
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

// Master secret (you, the scheduler) or this client's own workflow secret
async function secretOk(header: string | null, tenantId: string): Promise<boolean> {
  if (!header) return false;
  if (header === SECRET) return true;
  if (!tenantId) return false;
  const { data } = await supabase.from("tenant_config").select("workflow_secret").eq("tenant_id", tenantId).maybeSingle();
  return !!data?.workflow_secret && data.workflow_secret === header;
}

Deno.serve(async (req) => {
  console.log("capture v7.1 start");
  try {
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    if (!(await secretOk(req.headers.get("x-archie-secret"), String(p.tenant_id ?? "")))) return j({ error: "unauthorized" }, 401);
    const tenant_id = str(p.tenant_id);
    let text = str(p.text ?? p.message ?? p.body ?? raw.message?.body ?? "").trim();
    const senderPhone = str(p.sender ?? p.phone ?? raw.phone ?? "").replace(/\s+/g, "");
    const senderContact = str(p.contact_id ?? raw.contact_id ?? "") || null;
    if (!tenant_id) return j({ ok: true, reply: "" });

    const { data: cfg } = await supabase.from("tenant_config").select("timezone, ghl_token, ghl_location_id").eq("tenant_id", tenant_id).single();

    // Videos and photos → save to GHL Media (and "edit" → Archie Edit). Checked only when the message could be media.
    const MEDIA_HINT = /^\s*$|^[^a-z]*\b(video|image|photo|picture|document|file|attachment|media)\b[^a-z]*$|\b(save|media|edit|upload|store|keep)\b/i;
    if (MEDIA_HINT.test(text) && senderContact) {
      const media = await latestMedia(cfg?.ghl_token || FALLBACK_TOKEN, cfg?.ghl_location_id, senderContact, str(p.message_id), [p.attachments, raw.attachments, raw.message?.attachments]);
      console.log("media check:", JSON.stringify({ found: media?.kind ?? null, text: text.slice(0, 40) }));
      if (media) {
        const { data: team } = await supabase.from("team_members").select("handle, ghl_contact_id, phone, talk_mode, talk_until, gets_financials").eq("tenant_id", tenant_id).neq("active", false);
        const who = (team ?? []).find((m: any) => m.ghl_contact_id === senderContact || (m.phone && m.phone.replace(/\s+/g, "") === senderPhone));
        if (!who) return j({ ok: true, reply: "", skipped: "sender not on team" });
        const wmode = String(who.talk_mode ?? (who.gets_financials ? "all" : "wake")).toLowerCase();
        const open = who.talk_until && Date.parse(String(who.talk_until)) > Date.now();
        if (wmode === "off" || (wmode === "wake" && !/^(?:hey\s+|hi\s+|ok\s+)?@?archie\b/i.test(text) && !open)) return j({ ok: true, reply: "", skipped: "media from team member without wake word" });
        const caption = text.replace(/^(?:hey\s+|hi\s+|ok\s+)?@?archie\b[\s,:!.-]*/i, "").trim();
        const named = caption.match(/\b(?:as|call it|name it|called)\s+["']?(.+?)["']?\s*$/i)?.[1];
        const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
        const name = `${(named || (media.kind === "video" ? "WhatsApp video" : media.kind === "image" ? "WhatsApp photo" : "WhatsApp file")).slice(0, 80)} (${stamp})${media.ext ? `.${media.ext}` : ""}`;
        // A picture without "save" → Archie reads it and acts (lead, tasks, reply draft)
        const wantsSave = /\b(save|keep|store|upload|media)\b/i.test(caption) || !!named;
        if (media.kind === "image" && !wantsSave) {
          const r = await fetch(`${SUPA_URL}/functions/v1/archie-screens`, {
            method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET },
            body: JSON.stringify({ action: "screenshot", tenant_id, handle: who.handle, image_url: media.url, instruction: caption }),
          });
          const rj: any = await r.json().catch(() => null);
          return j({ ok: true, reply: String(rj?.text ?? "I couldn't read that one — try again, or say \"save\" to keep it in your media."), has_reply: "yes" });
        }
        const saved = await saveToMedia(cfg?.ghl_token || FALLBACK_TOKEN, cfg?.ghl_location_id, media.url, name);
        const wantsMulti = media.kind === "video" && /week of content|a week|several reels|multiple reels|cut (it|this) (up|into)|into reels|lots of reels/i.test(caption);
        const wantsEdit = media.kind === "video" && (wantsMulti || /\bedit\b|\breel\b|\bcut\b/i.test(caption));
        if (wantsEdit) {
          const r = await fetch(`${SUPA_URL}/functions/v1/archie-screens`, {
            method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET },
            body: JSON.stringify({ action: "edit_start", tenant_id, handle: who.handle, multi: wantsMulti, video_url: saved.url || media.url, title: named || "", idea_number: Number(caption.match(/\bidea\s*(?:number\s*|no\.?\s*|#)?(\d{1,2})\b/i)?.[1] ?? 0) || undefined, brief: caption.replace(/\b(please|edit( this| it)?|make (this|it) a reel)\b/gi, "").replace(/\b(?:this is\s+)?idea\s*(?:number\s*|no\.?\s*|#)?\d{1,2}\b/gi, "").trim() }),
          });
          const rj: any = await r.json().catch(() => null);
          if (!rj?.ok) return j({ ok: true, reply: `📁 Saved to your media${saved.ok ? "" : " (or tried to)"} — but I couldn't start the edit: ${rj?.error ?? r.status}`, has_reply: "yes" });
          return j({ ok: true, reply: wantsMulti ? `🎬 Got it — saved to your media. I'm finding the best moments to turn into several reels (and a carousel). They'll arrive one by one over the next 10 minutes.` : `🎬 Got it — saved to your media and editing now${rj.idea_title ? ` (your take on "${rj.idea_title}")` : ""}. I'll send the reel back in a few minutes.${rj.allowance ? ` (${rj.allowance - rj.used} edits left this month)` : ""}`, has_reply: "yes" });
        }
        return j({ ok: true, reply: saved.ok ? `📁 Saved to your media: ${name}${media.kind === "video" ? `\nWant a reel from it? Send a video with "edit" and Archie edits it for you.` : ""}` : `I couldn't save that to your media just now (${saved.error}). Try again in a minute.`, has_reply: "yes" });
      }
    }

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

    const { data: members } = await supabase.from("team_members").select("handle, name, phone, ghl_contact_id, gets_financials, talk_mode, talk_until, talk_window_minutes").eq("tenant_id", tenant_id);
    const me = (members ?? []).find((m) => (senderContact && m.ghl_contact_id === senderContact) || (m.phone && m.phone.replace(/\s+/g, "") === senderPhone));
    if (!me) return j({ ok: true, reply: "", skipped: "sender not on team" });

    const bump = (field: string, n = 1) => supabase.rpc("bump_activity", { p_tenant: tenant_id, p_day: today, p_field: field, p_n: n });
    const lower = text.toLowerCase();
    await bump("commands");

    // Anything that isn't a quick command → Talk to Archie (it replies on WhatsApp itself).
    // Team members must start with "Archie" so their normal chat with the owner is left alone.
    const mode = String(me.talk_mode ?? (me.gets_financials ? "all" : "wake")).toLowerCase();
    const WAKE = /^(?:hey\s+|hi\s+|ok\s+)?@?archie\b[\s,:!.-]*/i;
    // Conversation window (wake-word people only): open after "Archie…", reset by every message, closed by exit words or 10 quiet minutes
    const windowMins = Math.max(1, Number(me.talk_window_minutes ?? 10) || 10);
    const windowOpen = mode === "wake" && me.talk_until && Date.parse(String(me.talk_until)) > Date.now();
    const setWindow = async (open: boolean) => {
      await supabase.from("team_members").update({ talk_until: open ? new Date(Date.now() + windowMins * 60000).toISOString() : null })
        .eq("tenant_id", tenant_id).eq("handle", me.handle);
    };
    const toTalk = async () => {
      if (mode === "off") return j({ ok: true, reply: "", skipped: "talk off for this person" });
      let said = text;
      let opening = false;
      if (mode === "wake") {
        if (WAKE.test(text)) {
          said = text.replace(WAKE, "").trim();
          opening = !windowOpen;
          await setWindow(true);
          if (!said) return reply(`🟢 I'm listening — go ahead. Say "that's all" when you're done.`);
        } else if (windowOpen) {
          await setWindow(true); // each message keeps the window open
        } else {
          return j({ ok: true, reply: "", skipped: "no wake word" });
        }
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
      if (opening) return j({ ok: true, reply: `🟢 I'm listening for the next ${windowMins} minutes — say "that's all" when you're done.`, has_reply: "yes", handed_to: "talk" });
      return j({ ok: true, reply: "", has_reply: "no", handed_to: "talk" });
    };

    // ---------- closing a conversation window ----------
    const EXIT = /^(?:that'?s all|that is all|thats it|that's it|thanks archie|thank you archie|cheers archie|archie off|bye archie|done archie|ok thanks archie)[\s!.]*$/i;
    if (mode === "wake" && EXIT.test(text)) {
      if (windowOpen) { await setWindow(false); return reply("👋 Back to normal — start with \"Archie\" when you need me."); }
      return j({ ok: true, reply: "", skipped: "exit word with no window open" });
    }

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

// Find a video, photo or file in this message (payload, the GHL message, or their latest message). Voice notes are left alone.
async function latestMedia(token: string, loc: string | undefined, contactId: string, messageId: string, payload: any[]): Promise<{ url: string; kind: "video" | "image" | "file"; ext: string } | null> {
  const classify = (u: string, hint = ""): { kind: "video" | "image" | "file"; ext: string } | null => {
    const ext = (u.split("?")[0].match(/\.([a-z0-9]{2,5})$/i)?.[1] ?? "").toLowerCase();
    if (["mp4", "mov", "m4v", "3gp", "mkv", "avi"].includes(ext) || /video/i.test(hint)) return { kind: "video", ext: ext || "mp4" };
    if (["jpg", "jpeg", "png", "webp", "heic", "gif"].includes(ext) || /image|photo/i.test(hint)) return { kind: "image", ext: ext || "jpg" };
    if (["ogg", "oga", "opus", "mp3", "m4a", "aac", "wav", "amr"].includes(ext) || /audio|voice/i.test(hint)) return null; // a voice note
    if (["pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx", "zip"].includes(ext)) return { kind: "file", ext };
    return null;
  };
  const urls = (atts: any[]) => (atts ?? []).flatMap((a) => (Array.isArray(a) ? a : [a])).map((a) => (typeof a === "string" ? a : a?.url ?? "")).filter((u) => /^https?:/.test(u));
  for (const u of urls(payload.flatMap((x) => (x ? (Array.isArray(x) ? x : [x]) : [])))) { const c = classify(u); if (c) return { url: u, ...c }; }
  if (messageId) {
    const m = await ghl(token, `/conversations/messages/${messageId}`, "GET");
    const msg = m.json?.message ?? m.json ?? {};
    for (const u of urls(msg.attachments ?? [])) { const c = classify(u, String(msg.contentType ?? msg.messageType ?? "")); if (c) return { url: u, ...c }; }
  }
  if (!loc) return null;
  const cs = await ghl(token, `/conversations/search?locationId=${loc}&contactId=${contactId}&limit=1`, "GET");
  const conv = (cs.json?.conversations ?? [])[0];
  if (!conv?.id) return null;
  const ms = await ghl(token, `/conversations/${conv.id}/messages?limit=5`, "GET");
  const list: any[] = ms.json?.messages?.messages ?? ms.json?.messages ?? [];
  const since = Date.now() - 10 * 60 * 1000;
  for (const m of Array.isArray(list) ? list : []) {
    if (String(m.direction ?? "").toLowerCase() !== "inbound") continue;
    if (m.dateAdded && Date.parse(m.dateAdded) < since) continue;
    for (const u of urls(m.attachments ?? [])) { const c = classify(u, String(m.contentType ?? m.messageType ?? "")); if (c) return { url: u, ...c }; }
  }
  return null;
}

// Save a file into GHL Media by its link (GHL fetches it — nothing is downloaded here)
async function saveToMedia(token: string, loc: string | undefined, url: string, name: string): Promise<{ ok: boolean; url: string; error?: string }> {
  try {
    const fd = new FormData();
    fd.append("hosted", "true"); fd.append("fileUrl", url); fd.append("name", name);
    const r = await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${loc}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28" }, body: fd });
    const js: any = await r.json().catch(() => null);
    if (!r.ok) return { ok: false, url: "", error: `${r.status} ${JSON.stringify(js).slice(0, 120)}` };
    return { ok: true, url: String(js?.url ?? js?.fileUrl ?? "") };
  } catch (e) { return { ok: false, url: "", error: String(e).slice(0, 120) }; }
}
