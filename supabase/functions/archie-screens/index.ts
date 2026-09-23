// archie-screens v1.1 — data and actions for the Archie AI Studio pages.
// Pages:     POST /functions/v1/archie-screens/<tenant access_token>   { action, ... }
// Workflows: POST /functions/v1/archie-screens   header x-archie-secret   { action: run_next | run_finish, tenant_id, ... }
// v1.1: brain dump reads trailing tier/time/day in any order; run_next returns the skill's agent.
// The token picks the tenant. Nothing from any other tenant is ever returned or changed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";
const TIERS = ["must", "high", "bonus"];
const RUN_KINDS = ["pipeline", "scraper", "skill"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return j({ error: "POST only" }, 405);
  try {
    let body: any = {};
    try { body = await req.json(); } catch { return j({ error: "invalid JSON" }, 400); }
    const p = { ...body, ...(body.customData ?? {}) };
    const action = String(p.action ?? "").trim();

    // ---------- workflow side ----------
    const secretHeader = req.headers.get("x-archie-secret");
    if (secretHeader !== null) {
      if (secretHeader !== SECRET) return j({ error: "unauthorized" }, 401);
      const tenant_id = String(p.tenant_id ?? "").trim();
      if (!tenant_id) return j({ error: "tenant_id required" }, 400);
      if (action === "run_next") return j(await runNext(tenant_id, String(p.kind ?? "")));
      if (action === "run_finish") return j(await runFinish(tenant_id, p));
      return j({ error: `unknown workflow action: ${action}` }, 400);
    }

    // ---------- page side ----------
    const token = new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";
    if (!token || token === "archie-screens") return j({ error: "Unauthorised" }, 401);
    const { data: tenant } = await supabase.from("tenants").select("id, status").eq("access_token", token).maybeSingle();
    if (!tenant || tenant.status !== "active") return j({ error: "Unauthorised" }, 401);
    const c = await context(tenant.id);

    switch (action) {
      case "week": return j(await week(c, p));
      case "done": return j(await setDone(c, p, true));
      case "undo": return j(await setDone(c, p, false));
      case "move": return j(await move(c, p));
      case "dump": return j(await dump(c, p));
      case "capacity": return j(await capacity(c, p));
      case "skills": return j(await skills());
      case "run": return j(await run(c, p));
      case "run_get": return j(await runGet(c, p));
      case "runs": return j(await runs(c, p));
      case "nudge": return j(await nudge(c, p));
      case "save": return j(await save(c, p));
      default: return j({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e) { return j({ error: String(e) }, 500); }
});

// ===================== context =====================
async function context(tid: string) {
  const [{ data: cfg }, { data: team }] = await Promise.all([
    supabase.from("tenant_config").select("timezone, default_capacity, ghl_token").eq("tenant_id", tid).single(),
    supabase.from("team_members").select("handle, name, gets_financials, ghl_contact_id").eq("tenant_id", tid),
  ]);
  const tz = cfg?.timezone || "Europe/London";
  const owner = (team ?? []).find((m) => m.gets_financials);
  const resolve = (h: unknown) => {
    const s = String(h ?? "").trim().toLowerCase();
    if (!s) return owner?.handle ?? "owner";
    const m = (team ?? []).find((x) => x.handle.toLowerCase() === s || String(x.name ?? "").toLowerCase().split(" ")[0] === s);
    if (!m) throw new Error(`No team member "${h}"`);
    return m.handle;
  };
  return {
    tid, tz, team: team ?? [], owner, resolve,
    today: localDate(Date.now(), tz),
    defCap: parseJson(cfg?.default_capacity, {}),
    ghlToken: cfg?.ghl_token || FALLBACK_TOKEN,
  };
}

// ===================== week =====================
async function week(c: any, p: any) {
  const h = c.resolve(p.handle);
  const start = isDate(p.start) ? String(p.start) : c.today;
  const horizon = addDays(start, 14);

  const { data: caps } = await supabase.from("capacity").select("day, minutes, note")
    .eq("tenant_id", c.tid).eq("handle", h).gte("day", start).lte("day", horizon);
  const capFor = (d: string) => {
    const row = (caps ?? []).find((x) => x.day === d);
    if (row) return { minutes: Number(row.minutes) || 0, note: row.note ?? "", override: true };
    return { minutes: Number(c.defCap[String(weekdayOf(d))] ?? 240) || 0, note: "", override: false };
  };

  // five working days from start; weekends only if you've set capacity for them
  const days: string[] = [];
  for (let i = 0; i <= 14 && days.length < 5; i++) {
    const d = addDays(start, i);
    const wd = weekdayOf(d);
    const cap = capFor(d);
    if ((wd === 0 || wd === 6) && !(cap.override && cap.minutes > 0)) continue;
    days.push(d);
  }
  const end = days[days.length - 1];

  const [{ data: open }, { data: done }] = await Promise.all([
    supabase.from("tasks").select("id, title, tier, effort_minutes, status, today, today_rank, rollover_count, due_date, kind")
      .eq("tenant_id", c.tid).eq("owner", h).in("status", ["open", "doing"]),
    supabase.from("tasks").select("id, title, tier, effort_minutes, completed_at")
      .eq("tenant_id", c.tid).eq("owner", h).eq("status", "done")
      .gte("completed_at", `${addDays(start, -1)}T00:00:00Z`).lte("completed_at", `${addDays(end, 1)}T23:59:59Z`),
  ]);

  const shape = (t: any) => ({
    id: t.id, title: t.title, tier: TIERS.includes(t.tier) ? t.tier : "high",
    effort: Number(t.effort_minutes) > 0 ? Number(t.effort_minutes) : 30,
    rank: t.today_rank ?? null, rolled: t.rollover_count ?? 0, due_date: t.due_date ?? null,
    deep: t.kind === "deep", overdue: !!t.due_date && t.due_date < c.today && !t.today,
  });
  const tierOrder = (a: any, b: any) =>
    TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || (a.rank ?? 999) - (b.rank ?? 999) || a.title.localeCompare(b.title);

  const placed = new Set<string>();
  const out = days.map((d) => {
    const isToday = d === c.today;
    const list = (open ?? []).filter((t) => isToday ? (t.today === true || t.due_date === d) : (t.due_date === d && t.today !== true));
    list.forEach((t) => placed.add(t.id));
    const doneHere = (done ?? []).filter((t) => t.completed_at && localDate(Date.parse(t.completed_at), c.tz) === d);
    const tasks = list.map(shape).sort(tierOrder);
    const cap = capFor(d);
    const used = tasks.reduce((a, t) => a + t.effort, 0) + doneHere.reduce((a, t) => a + (Number(t.effort_minutes) > 0 ? Number(t.effort_minutes) : 30), 0);
    return {
      date: d, label: dayLabel(d), is_today: isToday,
      capacity_min: cap.minutes, capacity_note: cap.note, used_min: used,
      over: used > cap.minutes,
      tasks,
      done: doneHere.map((t) => ({ id: t.id, title: t.title, tier: t.tier })),
    };
  });

  const backlog = (open ?? [])
    .filter((t) => !placed.has(t.id) && t.today !== true && (!t.due_date || t.due_date < c.today))
    .map(shape).sort(tierOrder);
  const later = (open ?? []).filter((t) => !placed.has(t.id) && t.due_date && t.due_date > end).length;

  return {
    ok: true, handle: h, today: c.today, start, end,
    prev_start: addDays(start, -7), next_start: addDays(start, 7),
    days: out, backlog, later_count: later,
    team: c.team.map((m: any) => ({ handle: m.handle, name: m.name })),
  };
}

// ===================== task actions =====================
async function setDone(c: any, p: any, done: boolean) {
  const id = String(p.task_id ?? "");
  if (!id) throw new Error("task_id required");
  const patch = done ? { status: "done", completed_at: new Date().toISOString() } : { status: "open", completed_at: null };
  const { data, error } = await supabase.from("tasks").update(patch).eq("tenant_id", c.tid).eq("id", id).select("title").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { ok: false, error: "task not found" };
  if (done) await supabase.rpc("bump_activity", { p_tenant: c.tid, p_day: c.today, p_field: "tasks_done", p_n: 1 });
  return { ok: true, title: data.title, status: done ? "done" : "open" };
}

async function move(c: any, p: any) {
  const id = String(p.task_id ?? "");
  if (!id) throw new Error("task_id required");
  const { data: t } = await supabase.from("tasks").select("id, title, owner").eq("tenant_id", c.tid).eq("id", id).maybeSingle();
  if (!t) return { ok: false, error: "task not found" };
  const date = isDate(p.date) ? String(p.date) : null;
  let patch: Record<string, unknown>;
  if (!date) patch = { due_date: null, today: false, today_rank: null };
  else if (date === c.today) {
    const { data: top } = await supabase.from("tasks").select("today_rank").eq("tenant_id", c.tid).eq("owner", t.owner)
      .eq("today", true).not("today_rank", "is", null).order("today_rank", { ascending: false }).limit(1).maybeSingle();
    patch = { due_date: date, today: true, today_set_on: date, today_rank: (top?.today_rank ?? 0) + 1 };
  } else patch = { due_date: date, today: false, today_rank: null };
  await supabase.from("tasks").update(patch).eq("tenant_id", c.tid).eq("id", id);
  return { ok: true, title: t.title, date: date ?? "backlog" };
}

async function dump(c: any, p: any) {
  const h = c.resolve(p.handle);
  const lines = String(p.text ?? "").split(/\n+/).map((s) => s.trim().replace(/^[-*•]\s*/, "")).filter(Boolean).slice(0, 30);
  if (!lines.length) return { ok: false, error: "nothing to add" };
  const DAY = "(today|tomorrow|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)";
  const rows: any[] = [];
  for (let rest of lines) {
    // Trailing words can come in any order: "task name bonus 15m fri", "task name fri 1h must"
    let tier: string | null = null, effort: number | null = null, due: string | null = null;
    for (let guard = 0; guard < 6; guard++) {
      const dueM = due ? null : rest.match(new RegExp(`\\s+(?:(?:by|on|before)\\s+)?${DAY}\\s*$`, "i"));
      if (dueM) { due = resolveDay(dueM[1], c.today); rest = rest.slice(0, dueM.index).trim(); continue; }
      const effM = effort !== null ? null : rest.match(/\s+(\d+(?:\.\d+)?)\s*(m|min|mins|minutes|h|hr|hrs|hours?)\s*$/i);
      if (effM) { const n = Number(effM[1]); effort = /^h/i.test(effM[2]) ? n * 60 : n; rest = rest.slice(0, effM.index).trim(); continue; }
      const tierM = tier ? null : rest.match(/\s+(must|high|bonus)\s*$/i);
      if (tierM) { tier = tierM[1].toLowerCase(); rest = rest.slice(0, tierM.index).trim(); continue; }
      break;
    }
    if (!rest) continue;
    const effortRounded = Math.max(15, Math.round((effort ?? 30) / 15) * 15);
    rows.push({
      tenant_id: c.tid, title: (rest.charAt(0).toUpperCase() + rest.slice(1)).slice(0, 200),
      detail: "Added from Forge", tier: tier ?? "high", kind: "shallow", effort_minutes: effortRounded,
      status: "open", owner: h, source: "screen", source_ref: `screen:${crypto.randomUUID()}`,
      due_date: due, ...(due === c.today ? { today: true, today_set_on: c.today } : {}),
    });
  }
  if (!rows.length) return { ok: false, error: "nothing to add" };
  const { error } = await supabase.from("tasks").insert(rows);
  if (error) throw new Error(error.message);
  return { ok: true, added: rows.map((r) => ({ title: r.title, tier: r.tier, effort: r.effort_minutes, due_date: r.due_date })) };
}

async function capacity(c: any, p: any) {
  const h = c.resolve(p.handle);
  if (!isDate(p.date)) throw new Error("date required (YYYY-MM-DD)");
  const minutes = Math.max(0, Math.min(1440, Math.round(Number(p.minutes) || 0)));
  const { error } = await supabase.from("capacity").upsert(
    { tenant_id: c.tid, handle: h, day: p.date, minutes, note: String(p.note ?? "").slice(0, 120) || null },
    { onConflict: "tenant_id,handle,day" });
  if (error) throw new Error(error.message);
  return { ok: true, date: p.date, minutes };
}

// ===================== skills and runs =====================
async function skills() {
  const { data } = await supabase.from("skills_catalog").select("key, name, category, description, input_label, enabled").order("sort");
  return { ok: true, skills: data ?? [] };
}

async function run(c: any, p: any) {
  const kind = String(p.kind ?? "").trim();
  if (!RUN_KINDS.includes(kind)) throw new Error("kind must be pipeline, scraper or skill");
  let skill: string | null = null;
  if (kind === "skill") {
    skill = String(p.skill ?? "").trim();
    const { data: s } = await supabase.from("skills_catalog").select("key, enabled").eq("key", skill).maybeSingle();
    if (!s) throw new Error(`unknown skill: ${skill}`);
    if (!s.enabled) return { ok: false, error: `${skill} isn't switched on yet` };
  }
  const input = String(p.input ?? "").slice(0, 8000) || null;
  const { data: row, error } = await supabase.from("screen_runs")
    .insert({ tenant_id: c.tid, kind, skill, input, status: "queued", requested_by: c.resolve(p.handle) })
    .select("id, kind, skill, status, created_at").single();
  if (error) throw new Error(error.message);
  const tagged = await retag(c, kind);
  if (!tagged.ok) {
    await supabase.from("screen_runs").update({ status: "failed", error: tagged.error, finished_at: new Date().toISOString() }).eq("id", row.id);
    return { ok: false, run_id: row.id, error: tagged.error };
  }
  return { ok: true, run: row };
}

async function nudge(c: any, p: any) {
  const id = String(p.run_id ?? "");
  const { data: r } = await supabase.from("screen_runs").select("id, kind, status").eq("tenant_id", c.tid).eq("id", id).maybeSingle();
  if (!r) return { ok: false, error: "run not found" };
  if (r.status !== "queued") return { ok: false, error: `run is ${r.status}` };
  const tagged = await retag(c, r.kind);
  return tagged.ok ? { ok: true } : { ok: false, error: tagged.error };
}

async function runGet(c: any, p: any) {
  const { data } = await supabase.from("screen_runs").select("id, kind, skill, input, status, output, error, saved, created_at, finished_at")
    .eq("tenant_id", c.tid).eq("id", String(p.run_id ?? "")).maybeSingle();
  return data ? { ok: true, run: data } : { ok: false, error: "run not found" };
}

async function runs(c: any, p: any) {
  const limit = Math.max(1, Math.min(50, Number(p.limit) || 20));
  let q = supabase.from("screen_runs").select("id, kind, skill, input, status, output, error, saved, created_at, finished_at").eq("tenant_id", c.tid);
  if (RUN_KINDS.includes(String(p.kind ?? ""))) q = q.eq("kind", p.kind);
  if (p.kinds && Array.isArray(p.kinds)) q = q.in("kind", p.kinds.filter((k: string) => RUN_KINDS.includes(k)));
  const { data } = await q.order("created_at", { ascending: false }).limit(limit);
  return { ok: true, runs: data ?? [] };
}

async function save(c: any, p: any) {
  const saved = p.saved === false ? false : true;
  const { data } = await supabase.from("screen_runs").update({ saved }).eq("tenant_id", c.tid).eq("id", String(p.run_id ?? "")).select("id").maybeSingle();
  return data ? { ok: true, saved } : { ok: false, error: "run not found" };
}

// ===================== workflow side =====================
async function runNext(tid: string, kind: string) {
  if (!RUN_KINDS.includes(kind)) return { ok: false, error: "kind must be pipeline, scraper or skill", has_run: "no" };
  const { data, error } = await supabase.rpc("claim_screen_run", { p_tenant: tid, p_kind: kind });
  if (error) return { ok: false, error: error.message, has_run: "no" };
  const r = Array.isArray(data) ? data[0] : data;
  if (!r) return { ok: true, has_run: "no" };
  let agent = kind;
  if (kind === "skill") {
    const { data: s } = await supabase.from("skills_catalog").select("*").eq("key", r.skill).maybeSingle();
    agent = String((s as any)?.agent ?? "content");
  }
  const message = kind === "skill"
    ? `Use the ${r.skill} skill.\n\nInput:\n${r.input || "(no input given — make sensible assumptions from the business context)"}\n\nReturn only the finished output, ready to copy. No preamble, no questions, no notes about what you did.`
    : "";
  return { ok: true, has_run: "yes", run_id: r.id, kind: r.kind, agent, skill: r.skill ?? "", input: r.input ?? "", message };
}

async function runFinish(tid: string, p: any) {
  const id = String(p.run_id ?? "");
  if (!id) return { ok: false, error: "run_id required" };
  const output = clean(String(p.output ?? ""));
  const failed = String(p.status ?? "") === "failed" || /^ERROR:/i.test(output) || !output;
  const { data } = await supabase.from("screen_runs").update({
    status: failed ? "failed" : "done",
    output: failed ? null : output.slice(0, 50000),
    error: failed ? (output || "no output returned") : null,
    finished_at: new Date().toISOString(),
  }).eq("tenant_id", tid).eq("id", id).select("id, status").maybeSingle();
  return data ? { ok: true, status: data.status } : { ok: false, error: "run not found" };
}

// ===================== GHL tag trigger =====================
async function retag(c: any, kind: string) {
  const contact = c.owner?.ghl_contact_id;
  if (!contact) return { ok: false, error: "owner contact not set — add ghl_contact_id to the owner in team_members" };
  if (!c.ghlToken) return { ok: false, error: "no GHL token for this account" };
  const tag = `archie-run-${kind}`;
  await ghl(c.ghlToken, `/contacts/${contact}/tags`, "DELETE", { tags: [tag] });
  const r = await ghl(c.ghlToken, `/contacts/${contact}/tags`, "POST", { tags: [tag] });
  return r.ok ? { ok: true } : { ok: false, error: `couldn't tag contact (${r.status})` };
}

async function ghl(token: string, path: string, method = "GET", body?: unknown) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, { method, signal: ctrl.signal, headers: { "Authorization": `Bearer ${token}`, "Version": "2021-07-28", "Accept": "application/json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let json: any = null; try { json = JSON.parse(text); } catch { json = null; }
    return { ok: r.ok, status: r.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}

// ===================== helpers =====================
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" };
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } }); }
function isDate(v: unknown) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")); }
function parseJson(v: unknown, f: any) { if (!v) return f; if (typeof v === "object") return v; try { return JSON.parse(String(v)); } catch { return f; } }
function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
function addDays(d: string, n: number) { const [y, m, dd] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd + n)).toISOString().slice(0, 10); }
function weekdayOf(d: string) { return new Date(`${d}T12:00:00Z`).getUTCDay(); }
function dayLabel(d: string) { return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`)); }
function resolveDay(s: string, today: string) {
  const t = s.toLowerCase();
  if (t === "today") return today;
  if (t === "tomorrow") return addDays(today, 1);
  const idx = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(t.slice(0, 3));
  if (idx < 0) return addDays(today, 1);
  let diff = (idx - weekdayOf(today) + 7) % 7;
  if (diff === 0) diff = 7;
  return addDays(today, diff);
}
function clean(s: string) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/<br\s*\/?>/gi, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}