// ghl-context v2 — fetches location-wide CRM data for one tenant and hands it to agents as text.
// Agents invoked from a workflow can only see the enrolled contact, so the function does the looking.
// Also computes and writes the deterministic metrics (appointments, unread, unanswered, pipeline).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";

Deno.serve(async (req) => {
  console.log("ghl-context v2 start");
  const t0 = Date.now();
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    const debug = String(p.debug ?? "") === "true";
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);

    const { data: t } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });

    const { data: cfg } = await supabase.from("tenant_config")
      .select("ghl_location_id, ghl_token, pipeline_name, pipeline_id, stale_threshold_days, timezone")
      .eq("tenant_id", tenant_id).single();
    if (!cfg?.ghl_location_id) return j({ error: "ghl_location_id missing in tenant_config" }, 400);
    const token = cfg.ghl_token || FALLBACK_TOKEN;
    if (!token) return j({ error: "no GHL token for tenant" }, 400);
    const loc = cfg.ghl_location_id;
    const staleDays = Number(p.stale_days ?? cfg.stale_threshold_days ?? 7) || 7;
    const pipelineName = String(p.pipeline_name ?? cfg.pipeline_name ?? "").trim();

    const api = (path: string, version = "2021-07-28", method = "GET", body?: unknown) =>
      ghl(token, path, version, method, body);

    // Who is internal, who is a client
    const [{ data: team }, { data: clients }] = await Promise.all([
      supabase.from("team_members").select("ghl_contact_id").eq("tenant_id", tenant_id),
      supabase.from("clients").select("ghl_contact_id, name").eq("tenant_id", tenant_id).eq("status", "active"),
    ]);
    const internal = new Set((team ?? []).map((m) => m.ghl_contact_id).filter(Boolean));
    const clientSet = new Set((clients ?? []).map((c) => c.ghl_contact_id).filter(Boolean));

    const now = Date.now();
    const dayAgo = now - 24 * 3600 * 1000;
    const errors: string[] = [];

    // ---------------- CONVERSATIONS ----------------
    let fetched = 0;
    type Conv = { id: string; contactId: string; name: string; channel: string; unread: number; lastAt: number; client: boolean; messages: { dir: string; at: number; body: string }[] };
    const convs: Conv[] = [];
    const cRes = await api(`/conversations/search?locationId=${loc}&limit=40&sortBy=last_message_date&sort=desc`, "2021-04-15");
    if (!cRes.ok) errors.push(`conversations ${cRes.status}: ${cRes.text.slice(0, 160)}`);
    else {
      const list: any[] = cRes.json?.conversations ?? [];
      fetched = list.length;
      const recent = list.filter((c) => {
        const at = toMs(c.lastMessageDate ?? c.dateUpdated);
        return at >= dayAgo && c.contactId && !internal.has(c.contactId);
      });
      const withMsgs = await mapLimit(recent, 8, async (c) => {
        const m = await api(`/conversations/${c.id}/messages?limit=6`, "2021-04-15");
        const arr: any[] = m.ok ? (m.json?.messages?.messages ?? m.json?.messages ?? []) : [];
        const msgs = (Array.isArray(arr) ? arr : [])
          .map((x) => ({ dir: String(x.direction ?? "").toLowerCase(), at: toMs(x.dateAdded ?? x.dateUpdated), body: clean(x.body ?? x.message ?? "") }))
          .filter((x) => x.body)
          .sort((a, b) => a.at - b.at)
          .slice(-4);
        return {
          id: c.id,
          contactId: c.contactId,
          name: c.fullName || c.contactName || c.email || c.phone || "Unknown",
          channel: channelOf(c.lastMessageType ?? c.type),
          unread: Number(c.unreadCount ?? 0) || 0,
          lastAt: toMs(c.lastMessageDate ?? c.dateUpdated),
          client: clientSet.has(c.contactId),
          messages: msgs,
        } as Conv;
      });
      convs.push(...withMsgs);
    }

    let unread = 0, unanswered12 = 0;
    for (const c of convs) {
      if (c.unread > 0) unread++;
      const last = c.messages[c.messages.length - 1];
      if (last && last.dir === "inbound" && now - last.at > 12 * 3600 * 1000) unanswered12++;
    }

    // ---------------- CALENDAR ----------------
    const tz = cfg.timezone || "Europe/London";
    const { start: dayStart, end: dayEnd } = dayBounds(now, tz);
    const yStart = dayStart - 24 * 3600 * 1000;
    type Ev = { title: string; start: number; end: number; status: string; contactId: string };
    const events: Ev[] = [];
    const calList = await api(`/calendars/?locationId=${loc}`, "2021-04-15");
    if (!calList.ok) errors.push(`calendars ${calList.status}`);
    else {
      const cals: any[] = calList.json?.calendars ?? [];
      const evLists = await mapLimit(cals, 6, async (cal) => {
        const r = await api(`/calendars/events?locationId=${loc}&calendarId=${cal.id}&startTime=${yStart}&endTime=${dayEnd}`, "2021-04-15");
        return r.ok ? (r.json?.events ?? []) : [];
      });
      for (const list of evLists) for (const e of list) {
        events.push({ title: clean(e.title ?? "Appointment"), start: toMs(e.startTime), end: toMs(e.endTime), status: String(e.appointmentStatus ?? e.status ?? "").toLowerCase(), contactId: e.contactId ?? "" });
      }
    }
    const today = events.filter((e) => e.start >= dayStart && e.start < dayEnd && e.status !== "cancelled").sort((a, b) => a.start - b.start);
    const noShows = events.filter((e) => e.start >= yStart && e.start < dayEnd && (e.status === "noshow" || e.status === "no_show" || e.status === "no-show"));
    const gaps: string[] = [];
    for (let i = 1; i < today.length; i++) {
      const gap = today[i].start - today[i - 1].end;
      if (gap >= 2 * 3600 * 1000) gaps.push(`${hm(today[i - 1].end, tz)}–${hm(today[i].start, tz)}`);
    }

    // ---------------- PIPELINE ----------------
    type Opp = { id: string; contactId: string; name: string; value: number; stage: string; days: number; lastMsg: string; client: boolean; channel: string };
    const opps: Opp[] = [];
    let pipelineFound = false, pipelineNames: string[] = [];
    let pipelineValue = 0;
    if (pipelineName) {
      const pl = await api(`/opportunities/pipelines?locationId=${loc}`);
      if (!pl.ok) errors.push(`pipelines ${pl.status}`);
      else {
        const pipes: any[] = pl.json?.pipelines ?? [];
        pipelineNames = pipes.map((x) => x.name);
        const pipe = pipes.find((x) => x.id === cfg.pipeline_id) ?? pipes.find((x) => String(x.name).trim() === pipelineName);
        if (pipe) {
          pipelineFound = true;
          if (pipe.id !== cfg.pipeline_id) await supabase.from("tenant_config").update({ pipeline_id: pipe.id }).eq("tenant_id", tenant_id);
          const stageName = new Map((pipe.stages ?? []).map((s: any) => [s.id, s.name]));
          const os = await api(`/opportunities/search?location_id=${loc}&pipeline_id=${pipe.id}&status=open&limit=100`);
          if (!os.ok) errors.push(`opportunities ${os.status}: ${os.text.slice(0, 160)}`);
          else {
            const list: any[] = os.json?.opportunities ?? [];
            const enriched = await mapLimit(list, 8, async (o) => {
              const cid = o.contactId ?? o.contact?.id ?? "";
              let lastAt = 0, lastMsg = "", channel = "?";
              if (cid) {
                const cs = await api(`/conversations/search?locationId=${loc}&contactId=${cid}&limit=1`, "2021-04-15");
                const c0 = cs.ok ? (cs.json?.conversations ?? [])[0] : null;
                if (c0) { lastAt = toMs(c0.lastMessageDate ?? c0.dateUpdated); lastMsg = clean(c0.lastMessageBody ?? "").slice(0, 160); channel = channelOf(c0.lastMessageType ?? c0.type); }
              }
              if (!lastAt) lastAt = toMs(o.lastStageChangeAt ?? o.lastStatusChangeAt ?? o.updatedAt ?? o.createdAt);
              return {
                id: o.id, contactId: cid,
                name: clean(o.contact?.name ?? o.name ?? "Unknown"),
                value: Number(o.monetaryValue ?? 0) || 0,
                stage: String(stageName.get(o.pipelineStageId) ?? "Unknown"),
                days: lastAt ? Math.floor((now - lastAt) / 86400000) : 999,
                lastMsg, client: clientSet.has(cid), channel,
              } as Opp;
            });
            opps.push(...enriched);
            pipelineValue = opps.reduce((a, o) => a + o.value, 0);
          }
        } else errors.push(`pipeline "${pipelineName}" not found — pipelines: ${pipelineNames.join(", ")}`);
      }
    }
    const stale = opps.filter((o) => o.days > staleDays).sort((a, b) => b.days - a.days || b.value - a.value);

    // ---------------- WRITE METRICS ----------------
    const metricDate = new Date().toISOString().slice(0, 10);
    const metrics: Record<string, number> = { appointments: today.length, unread, unanswered_12h: unanswered12 };
    if (pipelineFound) { metrics.pipeline_value = round2(pipelineValue); metrics.pipeline_open = opps.length; metrics.stale_count = stale.length; metrics.stale_value = round2(stale.reduce((a, o) => a + o.value, 0)); }
    await supabase.from("daily_metrics").upsert({ tenant_id, metric_date: metricDate, ...metrics }, { onConflict: "tenant_id,metric_date" });

    // ---------------- BUILD TEXT FOR AGENTS ----------------
    const sLines: string[] = [];
    sLines.push(`NOW: ${fmt(now, tz)}`);
    sLines.push(`SCHEDULE: ${today.length} appts${today.length ? `, first ${hm(today[0].start, tz)}` : ""}, gaps ${gaps.length ? gaps.join(", ") : "none"}, no-shows ${noShows.length ? noShows.map((e) => e.title).join(", ") : "none"}`);
    for (const e of today) sLines.push(`  APPT ${hm(e.start, tz)}–${hm(e.end, tz)} ${e.title}`);
    sLines.push(`CONVERSATIONS: ${convs.length} active in last 24h (fetched ${fetched}, internal excluded)`);
    for (const c of convs) {
      const hrs = Math.round((now - c.lastAt) / 3600000);
      sLines.push(`--- conversation_id=${c.id} contact_id=${c.contactId} name="${c.name}" channel=${c.channel} category_hint=${c.client ? "client" : "non-client"} unread=${c.unread} last_activity=${hrs}h ago`);
      for (const m of c.messages) sLines.push(`  [${m.dir || "?"} ${Math.round((now - m.at) / 3600000)}h ago] ${m.body.slice(0, 240)}`);
    }
    const scraper_context = cap(sLines.join("\n"), 14000);

    const pLines: string[] = [];
    if (!pipelineName) pLines.push("ERROR: no pipeline name configured");
    else if (!pipelineFound) pLines.push(`ERROR: pipeline "${pipelineName}" not found — pipelines in this account: ${pipelineNames.join(", ") || "none"}`);
    else {
      pLines.push(`PIPELINE: "${pipelineName}" · £${round2(pipelineValue)} across ${opps.length} open · stale threshold ${staleDays} days · ${stale.length} stale`);
      for (const o of stale) pLines.push(`--- STALE contact_id=${o.contactId} opportunity_id=${o.id} name="${o.name}" value=£${o.value} stage="${o.stage}" days_since_contact=${o.days} channel=${o.channel} reactivate=${o.days > staleDays * 2 ? "yes" : "no"} client=${o.client ? "yes" : "no"} last_message="${o.lastMsg}"`);
      if (!stale.length) pLines.push("STALE: none");
      if (stale.length) {
        const pb = await playbooks(tenant_id, ["stale_proposal", "price_objection"]);
        if (pb) pLines.push("", pb);
      }
    }
    const pipeline_context = cap(pLines.join("\n"), 8000);

    const out: any = {
      ok: true,
      ms: Date.now() - t0,
      scraper_context, pipeline_context,
      metrics, stale_count: stale.length, conversations: convs.length, fetched,
      errors: errors.length ? errors.join(" | ") : "none",
    };
    if (debug) out.debug = { sampleConversation: convs[0] ?? null, sampleOpp: opps[0] ?? null, calendars: events.length };
    return j(out);
  } catch (e) { return j({ error: String(e), ms: Date.now() - t0 }, 500); }
});

// ---------- helpers ----------
async function playbooks(tenant_id: string, situations: string[]) {
  const { data } = await supabase.from("playbooks").select("tenant_id, situation, title, principles, examples")
    .in("situation", situations).eq("active", true).or(`tenant_id.eq.${tenant_id},tenant_id.is.null`);
  const chosen = new Map<string, any>();
  for (const r of data ?? []) { const cur = chosen.get(r.situation); if (!cur || (r.tenant_id && !cur.tenant_id)) chosen.set(r.situation, r); }
  if (!chosen.size) return "";
  return [...chosen.values()].map((r) => `PLAYBOOK ${r.situation} — ${r.title}\nPRINCIPLES: ${r.principles}\nEXAMPLES: ${r.examples ?? "none"}`).join("\n\n");
}
async function ghl(token: string, path: string, version: string, method = "GET", body?: unknown) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, {
      method, signal: ctrl.signal,
      headers: { "Authorization": `Bearer ${token}`, "Version": version, "Accept": "application/json", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await r.text();
    let json: any = null; try { json = JSON.parse(text); } catch { json = null; }
    return { ok: r.ok, status: r.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}
async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length); let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } });
  await Promise.all(workers); return out;
}
function toMs(v: unknown): number { if (v === null || v === undefined || v === "") return 0; if (typeof v === "number") return v < 1e12 ? v * 1000 : v; const n = Number(v); if (Number.isFinite(n) && n > 0) return n < 1e12 ? n * 1000 : n; const d = Date.parse(String(v)); return Number.isFinite(d) ? d : 0; }
function clean(s: unknown): string { return String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/"/g, "'").trim(); }
function channelOf(t: unknown): string { const s = String(t ?? "").toUpperCase(); if (s.includes("WHATSAPP")) return "WA"; if (s.includes("SMS")) return "SMS"; if (s.includes("EMAIL")) return "Email"; if (s.includes("IG") || s.includes("INSTAGRAM")) return "IG"; if (s.includes("FB") || s.includes("FACEBOOK")) return "FB"; if (s.includes("CALL")) return "Call"; if (s.includes("LIVE_CHAT") || s.includes("WEBCHAT")) return "Chat"; return s ? s.replace("TYPE_", "") : "?"; }
function cap(s: string, n: number) { return s.length > n ? s.slice(0, n - 40) + "\n[truncated — more activity than fits]" : s; }
function round2(n: number) { return Math.round(n * 100) / 100; }
function hm(ms: number, tz: string) { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(ms)); }
function fmt(ms: number, tz: string) { return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(ms)); }
function dayBounds(ms: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(ms));
  const g = (t: string) => Number(parts.find((x) => x.type === t)?.value);
  const localAsUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
  const offset = localAsUtc - Math.floor(ms / 60000) * 60000;
  const start = Date.UTC(g("year"), g("month") - 1, g("day")) - offset;
  return { start, end: start + 24 * 3600 * 1000 };
}
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }