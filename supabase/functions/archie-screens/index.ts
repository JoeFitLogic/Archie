// archie-screens v1.7 — data and actions for the Archie AI Studio pages.
// Pages:     POST /functions/v1/archie-screens/<tenant access_token>   { action, ... }
// Workflows: POST /functions/v1/archie-screens   header x-archie-secret   { action: run_next | run_finish, tenant_id, ... }
// v1.1: brain dump reads trailing tier/time/day in any order; run_next returns the skill's agent.
// v1.2: overview (money, clients, new leads, calls booked, brief) and feed (what Archie did lately).
// v1.3: content — pillars, skill options, business context for skills, Saturday plan, Social Planner drafts, Polish my reel (ZapCap).
// v1.4: month period + revenue target, stale flags, pipeline list, status dots, client flags, contact search and contact-aware skill runs.
// v1.5: run_finish re-triggers the workflow when more runs of that kind are queued, so back-to-back button presses all get done;
//       junk output (empty, "null", a lone number) is marked failed instead of done.
// v1.6: run_finish tidies agent output — escaped line breaks become real ones, a number glued to the end is removed.
// v1.7: today's date in every skill's business context; pipeline/scraper outputs keep only the human-readable part.
// The token picks the tenant. Nothing from any other tenant is ever returned or changed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";
const TIERS = ["must", "high", "bonus"];
const RUN_KINDS = ["pipeline", "scraper", "skill", "video"];
const ZAPCAP = "https://api.zapcap.ai";
const ZAPCAP_KEY = Deno.env.get("ZAPCAP_API_KEY") ?? "";
const ZAPCAP_TEMPLATE = Deno.env.get("ZAPCAP_TEMPLATE_ID") ?? "";

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
      if (action === "plan_context") return j(await planContext(tenant_id));
      if (action === "plan_save") return j(await planSave(tenant_id, p));
      return j({ error: `unknown workflow action: ${action}` }, 400);
    }

    // ---------- page side ----------
    const token = new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";
    if (!token || token === "archie-screens") return j({ error: "Unauthorised" }, 401);
    const { data: tenant } = await supabase.from("tenants").select("id, status").eq("access_token", token).maybeSingle();
    if (!tenant || tenant.status !== "active") return j({ error: "Unauthorised" }, 401);
    const c = await context(tenant.id);

    switch (action) {
      case "overview": return j(await overview(c, p));
      case "feed": return j({ ok: true, items: await feed(c, Number(p.limit) || 15) });
      case "week": return j(await week(c, p));
      case "done": return j(await setDone(c, p, true));
      case "undo": return j(await setDone(c, p, false));
      case "move": return j(await move(c, p));
      case "dump": return j(await dump(c, p));
      case "capacity": return j(await capacity(c, p));
      case "skills": return j(await skills(c));
      case "health": return j({ ok: true, ...(await health(c)) });
      case "run": return j(await run(c, p));
      case "run_get": return j(await runGet(c, p));
      case "runs": return j(await runs(c, p));
      case "nudge": return j(await nudge(c, p));
      case "save": return j(await save(c, p));
      case "pillars": return j(await pillars(c, p));
      case "pillars_from_run": return j(await pillarsFromRun(c, p));
      case "plan": return j(await latestPlan(c));
      case "to_planner": return j(await toPlanner(c, p));
      case "media_videos": return j(await mediaVideos(c));
      case "polish": return j(await polish(c, p));
      case "polish_status": return j(await polishStatus(c, p));
      case "pipeline": return j(await pipelineList(c));
      case "contacts": return j(await contactSearch(c, p));
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

// ===================== overview =====================
async function overview(c: any, p: any) {
  const period = ["today", "7d", "30d", "month"].includes(String(p.period)) ? String(p.period) : "month";
  const back = period === "today" ? 0 : period === "7d" ? 6 : 29;
  const monthStart = `${c.today.slice(0, 7)}-01`;
  const startDate = period === "month" ? monthStart : addDays(c.today, -back);
  const startMs = localMidnightMs(startDate, c.tz);
  const now = Date.now();
  const errors: string[] = [];

  const [{ data: latestRow }, { data: rows }, { data: cfg }, { data: tenantRow }, { data: activeClients }, { data: brief }, { count: newClients }, { count: churned }] = await Promise.all([
    supabase.from("daily_metrics").select("*").eq("tenant_id", c.tid).order("metric_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("daily_metrics").select("metric_date, mrr, cash_24h").eq("tenant_id", c.tid).gte("metric_date", addDays(startDate < monthStart ? startDate : monthStart, -1)).order("metric_date", { ascending: true }),
    supabase.from("tenant_config").select("mrr_target, revenue_target, pipeline_id, pipeline_name, ghl_location_id").eq("tenant_id", c.tid).single(),
    supabase.from("tenants").select("location_id").eq("id", c.tid).single(),
    supabase.from("clients").select("ghl_contact_id").eq("tenant_id", c.tid).eq("status", "active"),
    supabase.from("briefs").select("brief_date, body, focus").eq("tenant_id", c.tid).eq("audience", c.owner?.handle ?? "owner").order("brief_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", c.tid).gte("started_at", startDate),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", c.tid).eq("status", "churned").gte("ended_at", startDate),
  ]);

  // ---------- money ----------
  const latest: any = latestRow ?? {};
  const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
  const inPeriod = (rows ?? []).filter((r) => r.metric_date >= startDate);
  const baseRow = (rows ?? []).find((r) => r.metric_date < startDate && r.mrr !== null) ?? (rows ?? []).find((r) => r.mrr !== null);
  const mrr = num(latest.mrr);
  const target = num(cfg?.mrr_target);
  const revenue = inPeriod.reduce((a, r) => a + (Number(r.cash_24h) || 0), 0);
  const revenueMtd = (rows ?? []).filter((r) => r.metric_date >= monthStart).reduce((a, r) => a + (Number(r.cash_24h) || 0), 0);
  const revTarget = num(cfg?.revenue_target);
  const staleDays = latest.metric_date ? Math.max(0, Math.round((Date.parse(c.today) - Date.parse(String(latest.metric_date))) / 86400000)) : null;

  // ---------- live from GHL: new leads (pipeline) and calls booked ----------
  const loc = cfg?.ghl_location_id || tenantRow?.location_id;
  const clientSet = new Set((activeClients ?? []).map((x) => x.ghl_contact_id).filter(Boolean));
  let leads: any = { count: null, recent: [] as string[] };
  let calls: any = { booked: null, booked_clients: null, booked_other: null, upcoming: null, upcoming_clients: null, upcoming_other: null, next: [] as any[] };

  if (!loc || !c.ghlToken) errors.push("no GHL location or token");
  else {
    // new leads = opportunities added to the Archie pipeline in the period
    let pipelineId = cfg?.pipeline_id ?? null;
    if (!pipelineId && cfg?.pipeline_name) {
      const pl = await ghl(c.ghlToken, `/opportunities/pipelines?locationId=${loc}`, "GET", undefined, "2021-07-28");
      pipelineId = (pl.json?.pipelines ?? []).find((x: any) => String(x.name).trim() === String(cfg.pipeline_name).trim())?.id ?? null;
    }
    if (!pipelineId) errors.push("pipeline not found — check archie_pipeline_name");
    else {
      const found: any[] = [];
      for (let page = 1; page <= 5; page++) {
        const r = await ghl(c.ghlToken, `/opportunities/search?location_id=${loc}&pipeline_id=${pipelineId}&status=all&limit=100&page=${page}`, "GET", undefined, "2021-07-28");
        if (!r.ok) { errors.push(`opportunities ${r.status}`); break; }
        const batch: any[] = r.json?.opportunities ?? [];
        found.push(...batch);
        if (batch.length < 100) break;
      }
      const fresh = found
        .map((o) => ({ name: String(o.contact?.name ?? o.name ?? "Unknown"), at: toMs(o.createdAt ?? o.dateAdded) }))
        .filter((o) => o.at >= startMs)
        .sort((a, b) => b.at - a.at);
      leads = { count: fresh.length, recent: fresh.slice(0, 5).map((o) => o.name) };
    }

    // calls: booked in the period (by date booked) and coming up in the next 7 days
    const cl = await ghl(c.ghlToken, `/calendars/?locationId=${loc}`, "GET", undefined, "2021-04-15");
    if (!cl.ok) errors.push(`calendars ${cl.status}`);
    else {
      const cals: any[] = cl.json?.calendars ?? [];
      const from = Math.min(startMs, now);
      const to = now + 60 * 86400000;
      const events: any[] = [];
      for (const cal of cals.slice(0, 20)) {
        const r = await ghl(c.ghlToken, `/calendars/events?locationId=${loc}&calendarId=${cal.id}&startTime=${from}&endTime=${to}`, "GET", undefined, "2021-04-15");
        if (r.ok) events.push(...(r.json?.events ?? []));
      }
      const live = events.filter((e) => {
        const st = String(e.appointmentStatus ?? e.status ?? "").toLowerCase();
        return st !== "cancelled" && st !== "canceled" && st !== "invalid";
      });
      const booked = live.filter((e) => toMs(e.dateAdded ?? e.createdAt) >= startMs);
      const upcoming = live.filter((e) => { const s = toMs(e.startTime); return s >= now && s < now + 7 * 86400000; }).sort((a, b) => toMs(a.startTime) - toMs(b.startTime));
      const isClient = (e: any) => clientSet.has(e.contactId);
      calls = {
        booked: booked.length,
        booked_clients: booked.filter(isClient).length,
        booked_other: booked.filter((e) => !isClient(e)).length,
        upcoming: upcoming.length,
        upcoming_clients: upcoming.filter(isClient).length,
        upcoming_other: upcoming.filter((e) => !isClient(e)).length,
        next: upcoming.slice(0, 5).map((e) => ({ title: String(e.title ?? "Appointment"), at: new Date(toMs(e.startTime)).toISOString(), client: isClient(e) })),
      };
    }
  }

  return {
    ok: true, period, start: startDate, today: c.today,
    money: {
      mrr, mrr_change: mrr !== null && baseRow?.mrr !== undefined && baseRow?.mrr !== null ? Math.round((mrr - Number(baseRow.mrr)) * 100) / 100 : null,
      mrr_target: target, mrr_pct: mrr !== null && target ? Math.round((mrr / target) * 100) : null,
      new_mrr_month: num(latest.mrr_new),
      revenue: Math.round(revenue * 100) / 100,
      revenue_note: "Cash collected, from the daily Stripe snapshots",
      revenue_mtd: Math.round(revenueMtd * 100) / 100,
      revenue_target: revTarget,
      revenue_pct: revTarget ? Math.round((revenueMtd / revTarget) * 100) : null,
      revenue_gap: revTarget ? Math.max(0, Math.round(revTarget - revenueMtd)) : null,
      mrr_gap: mrr !== null && target ? Math.max(0, Math.round(target - mrr)) : null,
      stale_days: staleDays,
      stale: staleDays === null ? true : staleDays > 1,
      failed_count: num(latest.failed_count), failed_value: num(latest.failed_value),
      pipeline_value: num(latest.pipeline_value), stale_count: num(latest.stale_count),
      as_of: latest.metric_date ?? null,
    },
    clients: { active: num(latest.clients_active) ?? (activeClients ?? []).length, new: newClients ?? 0, churned: churned ?? 0 },
    leads, calls,
    brief: brief ? { date: brief.brief_date, focus: brief.focus, body: brief.body } : null,
    pipeline: await pipelineList(c),
    health: await health(c),
    client_flags: await clientFlags(c),
    feed: await feed(c, 10),
    errors: errors.length ? errors : null,
  };
}

// ===================== feed: what Archie did lately =====================
async function feed(c: any, limit = 15) {
  const since = new Date(Date.now() - 3 * 86400000).toISOString();
  const lim = Math.max(1, Math.min(50, limit));
  const [{ data: notes }, { data: runsDone }, { data: briefs }] = await Promise.all([
    supabase.from("notifications").select("title, body, sent, error, created_at").eq("tenant_id", c.tid).gte("created_at", since).order("created_at", { ascending: false }).limit(lim),
    supabase.from("screen_runs").select("kind, skill, status, output, error, created_at, finished_at").eq("tenant_id", c.tid).in("status", ["done", "failed"]).gte("created_at", since).order("created_at", { ascending: false }).limit(lim),
    supabase.from("briefs").select("brief_date, audience, body, created_at").eq("tenant_id", c.tid).gte("created_at", since).order("created_at", { ascending: false }).limit(lim),
  ]);
  const cut = (s: unknown, n = 600) => { const t = String(s ?? ""); return t.length > n ? t.slice(0, n) + "…" : t; };
  const items = [
    ...(notes ?? []).map((n) => ({ type: "notification", title: n.title, body: cut(n.body), status: n.sent ? "sent" : "saved", at: n.created_at })),
    ...(runsDone ?? []).map((r) => ({ type: "run", title: r.kind === "skill" ? `Skill: ${r.skill}` : `Run: ${r.kind}`, body: cut(r.status === "done" ? r.output : r.error), status: r.status, at: r.finished_at ?? r.created_at })),
    ...(briefs ?? []).map((b) => ({ type: "brief", title: `Morning brief — ${b.audience}`, body: cut(b.body), status: "sent", at: b.created_at })),
  ];
  return items.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, lim);
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
async function skills(c: any) {
  const [{ data }, { data: cfg }] = await Promise.all([
    supabase.from("skills_catalog").select("key, name, category, description, input_label, enabled, options, needs_contact, module").order("sort"),
    supabase.from("tenant_config").select("modules").eq("tenant_id", c.tid).maybeSingle(),
  ]);
  const mods = new Set(String(cfg?.modules ?? "").split(",").map((x) => x.trim()).filter(Boolean));
  // Skills tied to a module only show for businesses that use that module (e.g. check-in skills for coaches)
  const list = (data ?? []).filter((k: any) => !k.module || mods.has(k.module)).map(({ module: _m, ...rest }: any) => rest);
  return { ok: true, skills: list };
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
  const contactId = String(p.contact_id ?? "").trim() || null;
  if (kind === "skill") {
    const { data: s2 } = await supabase.from("skills_catalog").select("needs_contact").eq("key", skill).maybeSingle();
    if (s2?.needs_contact && !contactId) return { ok: false, error: "pick a contact first" };
  }
  const { data: row, error } = await supabase.from("screen_runs")
    .insert({ tenant_id: c.tid, kind, skill, input, status: "queued", requested_by: c.resolve(p.handle), contact_id: contactId, contact_name: String(p.contact_name ?? "").slice(0, 120) || null })
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
  let q = supabase.from("screen_runs").select("id, kind, skill, input, status, output, error, saved, created_at, finished_at, contact_name").eq("tenant_id", c.tid);
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

// ===================== content (v1.3) =====================
async function businessContext(tid: string) {
  const [{ data: t }, { data: cfg }] = await Promise.all([
    supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle(),
    supabase.from("tenant_config").select("brand_context, icp, core_offer, brand_voice, customer_word, sale_word, content_pillars").eq("tenant_id", tid).maybeSingle(),
  ]);
  const pillarsList = Array.isArray(cfg?.content_pillars) ? cfg!.content_pillars : [];
  const { data: tzRow } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const todayLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tzRow?.timezone || "Europe/London" }).format(new Date());
  return [
    `Today: ${todayLong}`,
    `Business: ${t?.business_name ?? "not set"}`,
    `What they do: ${cfg?.brand_context ?? "not set"}`,
    `Ideal ${cfg?.customer_word ?? "client"}: ${cfg?.icp ?? "not set"}`,
    `Core offer: ${cfg?.core_offer ?? "not set"}`,
    `Voice: ${cfg?.brand_voice ?? "not set"}`,
    `Content pillars: ${pillarsList.length ? pillarsList.join(", ") : "not set yet"}`,
    `Words: say "${cfg?.customer_word ?? "client"}" and "${cfg?.sale_word ?? "proposal"}"`,
  ].join("\n");
}

async function pillars(c: any, p: any) {
  if (Array.isArray(p.set)) {
    const clean = p.set.map((x: unknown) => String(x ?? "").trim()).filter(Boolean).slice(0, 6);
    if (!clean.length) return { ok: false, error: "give 1–6 pillars" };
    await supabase.from("tenant_config").update({ content_pillars: clean }).eq("tenant_id", c.tid);
    return { ok: true, pillars: clean };
  }
  const { data } = await supabase.from("tenant_config").select("content_pillars").eq("tenant_id", c.tid).maybeSingle();
  return { ok: true, pillars: Array.isArray(data?.content_pillars) ? data!.content_pillars : [] };
}

async function pillarsFromRun(c: any, p: any) {
  const { data: r } = await supabase.from("screen_runs").select("output").eq("tenant_id", c.tid).eq("id", String(p.run_id ?? "")).maybeSingle();
  const m = String(r?.output ?? "").match(/PILLARS:\s*(.+)/i);
  if (!m) return { ok: false, error: "no PILLARS line in that output" };
  const list = m[1].split(/[|,;]/).map((x) => x.replace(/[*_`]/g, "").trim()).filter(Boolean).slice(0, 6);
  return pillars(c, { set: list });
}

async function latestPlan(c: any) {
  const { data } = await supabase.from("content_plans").select("id, week_start, items, created_at").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { ok: true, plan: data ?? null };
}

async function toPlanner(c: any, p: any) {
  const type = ["post", "story", "reel"].includes(String(p.type)) ? String(p.type) : "post";
  const text = String(p.text ?? "").trim();
  const mediaUrl = String(p.media_url ?? "").trim();
  if (!text && !mediaUrl) return { ok: false, error: "nothing to add" };
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_location_id").eq("tenant_id", c.tid).single();
  const { data: t } = await supabase.from("tenants").select("location_id").eq("id", c.tid).single();
  const loc = cfg?.ghl_location_id || t?.location_id;
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token" };
  const body: Record<string, unknown> = { type, status: "draft" };
  // Stories can't carry a caption, so the text goes in as the follow-up note for the owner instead
  if (type !== "story") body.summary = text.slice(0, 2200);
  if (mediaUrl) body.media = [{ url: mediaUrl, type: String(p.media_type ?? (type === "post" ? "image/jpeg" : "video/mp4")) }];
  if (type === "story" && text) body.followUpComment = text.slice(0, 500);
  const r = await ghl(c.ghlToken, `/social-media-posting/${loc}/posts`, "POST", body, "2021-07-28");
  if (!r.ok) return { ok: false, error: `Social Planner said ${r.status}: ${r.text.slice(0, 200)}` };
  const postId = r.json?.results?.post?._id ?? r.json?.post?._id ?? null;
  if (p.run_id) await supabase.from("screen_runs").update({ saved: true }).eq("tenant_id", c.tid).eq("id", String(p.run_id));
  return { ok: true, post_id: postId, note: "Saved as a draft in Social Planner — add media and pick accounts there, then schedule." };
}

async function mediaVideos(c: any) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_location_id").eq("tenant_id", c.tid).single();
  const { data: t } = await supabase.from("tenants").select("location_id").eq("id", c.tid).single();
  const loc = cfg?.ghl_location_id || t?.location_id;
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token", videos: [] };
  const r = await ghl(c.ghlToken, `/medias/files?altId=${loc}&altType=location&type=file&sortBy=createdAt&sortOrder=desc&limit=40`, "GET", undefined, "2021-07-28");
  if (!r.ok) return { ok: false, error: `media library ${r.status} — paste a video link instead`, videos: [] };
  const files: any[] = r.json?.files ?? r.json?.data ?? [];
  const videos = files
    .filter((f) => /video|\.mp4|\.mov|\.webm/i.test(String(f.contentType ?? f.type ?? f.url ?? f.name ?? "")))
    .slice(0, 20)
    .map((f) => ({ name: String(f.name ?? "video"), url: String(f.url ?? f.fileUrl ?? ""), at: f.createdAt ?? null }))
    .filter((f) => f.url);
  return { ok: true, videos };
}

async function polish(c: any, p: any) {
  if (!ZAPCAP_KEY || !ZAPCAP_TEMPLATE) return { ok: false, error: "reel polishing isn't set up yet" };
  const url = String(p.video_url ?? "").trim();
  if (!/^https?:\/\//.test(url)) return { ok: false, error: "a video link is needed" };
  const { data: cfg } = await supabase.from("tenant_config").select("video_monthly_cap").eq("tenant_id", c.tid).single();
  const cap = Number(cfg?.video_monthly_cap ?? 30) || 30;
  const monthStart = `${c.today.slice(0, 7)}-01T00:00:00Z`;
  const { count: used } = await supabase.from("screen_runs").select("id", { count: "exact", head: true }).eq("tenant_id", c.tid).eq("kind", "video").neq("status", "failed").gte("created_at", monthStart);
  if ((used ?? 0) >= cap) return { ok: false, error: `You've polished ${used} reels this month — the limit is ${cap}. It resets on the 1st.` };

  const up = await zap("/videos/url", "POST", { url });
  const videoId = up.json?.id;
  if (!up.ok || !videoId) return { ok: false, error: `couldn't send the video (${up.status})` };
  const taskBody: Record<string, unknown> = { templateId: ZAPCAP_TEMPLATE, autoApprove: true, language: "en" };
  if (p.cut_silences !== false) taskBody.autoCutSettings = { silenceRemoval: 0.4 };
  const tk = await zap(`/videos/${videoId}/task`, "POST", taskBody);
  const taskId = tk.json?.taskId ?? tk.json?.id;
  if (!tk.ok || !taskId) return { ok: false, error: `couldn't start the edit (${tk.status})` };

  const { data: row } = await supabase.from("screen_runs").insert({
    tenant_id: c.tid, kind: "video", skill: "polish-reel", input: url, status: "running",
    requested_by: c.resolve(p.handle), started_at: new Date().toISOString(), ext_id: String(videoId), ext_task: String(taskId),
  }).select("id, status").single();
  return { ok: true, run_id: row?.id, status: "running" };
}

async function polishStatus(c: any, p: any) {
  const { data: r } = await supabase.from("screen_runs").select("id, status, output, ext_id, ext_task").eq("tenant_id", c.tid).eq("id", String(p.run_id ?? "")).maybeSingle();
  if (!r) return { ok: false, error: "run not found" };
  if (r.status !== "running") return { ok: true, status: r.status, url: r.output };
  const st = await zap(`/videos/${r.ext_id}/task/${r.ext_task}`, "GET");
  const status = String(st.json?.status ?? "");
  if (status === "completed" && st.json?.downloadUrl) {
    let finalUrl = String(st.json.downloadUrl);
    const kept = await keepInMedia(c, finalUrl, `archie-reel-${String(r.id).slice(0, 8)}.mp4`);
    if (kept) finalUrl = kept;
    await supabase.from("screen_runs").update({ status: "done", output: finalUrl, finished_at: new Date().toISOString() }).eq("id", r.id);
    return { ok: true, status: "done", url: finalUrl, kept_in_media: !!kept };
  }
  if (status === "failed") {
    await supabase.from("screen_runs").update({ status: "failed", error: String(st.json?.error ?? "edit failed"), finished_at: new Date().toISOString() }).eq("id", r.id);
    return { ok: true, status: "failed" };
  }
  return { ok: true, status: "running", stage: status || "processing" };
}

// Copy the finished reel into the client's GHL media library so the link doesn't expire
async function keepInMedia(c: any, fileUrl: string, name: string): Promise<string | null> {
  try {
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_location_id").eq("tenant_id", c.tid).single();
    const { data: t } = await supabase.from("tenants").select("location_id").eq("id", c.tid).single();
    const loc = cfg?.ghl_location_id || t?.location_id;
    if (!loc || !c.ghlToken) return null;
    const form = new FormData();
    form.append("hosted", "true");
    form.append("fileUrl", fileUrl);
    form.append("name", name);
    form.append("altId", loc);
    form.append("altType", "location");
    const r = await fetch(`${BASE}/medias/upload-file`, { method: "POST", headers: { "Authorization": `Bearer ${c.ghlToken}`, "Version": "2021-07-28", "Accept": "application/json" }, body: form });
    const text = await r.text(); let js: any = null; try { js = JSON.parse(text); } catch { js = null; }
    return r.ok ? String(js?.url ?? js?.fileUrl ?? "") || null : null;
  } catch { return null; }
}

async function zap(path: string, method: string, body?: unknown) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(ZAPCAP + path, { method, signal: ctrl.signal, headers: { "x-api-key": ZAPCAP_KEY, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let js: any = null; try { js = JSON.parse(text); } catch { js = null; }
    return { ok: r.ok, status: r.status, json: js, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}

// ----- Saturday plan (workflow side) -----
async function planContext(tid: string) {
  const biz = await businessContext(tid);
  const { data: last } = await supabase.from("content_plans").select("items").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(2);
  const recent = (last ?? []).flatMap((r: any) => (Array.isArray(r.items) ? r.items : []).map((i: any) => i.idea)).filter(Boolean).slice(0, 14);
  const message = [
    "Use the weekly-plan skill.",
    "",
    "Business context:",
    biz,
    "",
    `Don't repeat these recent ideas: ${recent.length ? recent.join(" ; ") : "none yet"}`,
    "",
    "Return ONLY the JSON array the skill describes. No other text.",
  ].join("\n");
  return { ok: true, message };
}

async function planSave(tid: string, p: any) {
  const raw = clean(String(p.output ?? ""));
  const start = raw.indexOf("["), end = raw.lastIndexOf("]");
  let items: any[] = [];
  try { items = JSON.parse(raw.slice(start, end + 1)); } catch { items = []; }
  items = (Array.isArray(items) ? items : []).slice(0, 7).map((i: any, n: number) => ({
    n: n + 1,
    day: String(i?.day ?? ""),
    idea: String(i?.idea ?? "").slice(0, 200),
    hook: String(i?.hook ?? "").slice(0, 200),
    pillar: String(i?.pillar ?? ""),
    angle: String(i?.angle ?? ""),
    format: ["post", "reel", "carousel", "stories"].includes(String(i?.format)) ? String(i.format) : "post",
  })).filter((i) => i.idea);
  if (!items.length) return { ok: false, error: "no ideas found in the agent's reply" };

  const { data: cfg } = await supabase.from("tenant_config").select("timezone, ghl_token, brief_channel").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const daysToMonday = (8 - weekdayOf(today)) % 7 || 7;
  const weekStart = addDays(today, daysToMonday);
  await supabase.from("content_plans").insert({ tenant_id: tid, week_start: weekStart, items });

  const title = `Your content plan for next week — ${items.length} ideas`;
  const body = items.map((i) => `${i.n}. ${i.idea} (${i.format})`).join("\n") + "\n\nOpen Skills to turn any of them into a post.";
  const sent = await notifyOwner(tid, title, body, cfg);
  return { ok: true, week_start: weekStart, ideas: items.length, notified: sent };
}

async function notifyOwner(tid: string, title: string, body: string, cfg: any): Promise<boolean> {
  const { data: owner } = await supabase.from("team_members").select("ghl_contact_id, quiet_until").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const quiet = !!owner?.quiet_until && String(owner.quiet_until) >= localDate(Date.now(), tz);
  const channel = String(cfg?.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
  let sent = false, why: string | null = null;
  if (quiet) why = "quiet mode";
  else if (!owner?.ghl_contact_id) why = "owner contact not set";
  else {
    const r = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, "/conversations/messages", "POST", { type: channel, contactId: owner.ghl_contact_id, message: `${title}\n\n${body}`.slice(0, 1500) }, "2021-04-15");
    sent = r.ok; if (!r.ok) why = `send failed ${r.status}`;
  }
  await supabase.from("notifications").insert({ tenant_id: tid, source: "workflow", title, body, channel: channel.toLowerCase(), sent, error: why });
  return sent;
}

// ===================== v1.4: pipeline, health, flags, contacts =====================
async function locOf(c: any) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_location_id, pipeline_id, pipeline_name, stale_threshold_days").eq("tenant_id", c.tid).single();
  const { data: t } = await supabase.from("tenants").select("location_id").eq("id", c.tid).single();
  return { loc: cfg?.ghl_location_id || t?.location_id, cfg };
}

async function pipelineList(c: any) {
  const { loc, cfg } = await locOf(c);
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token", items: [], open: null, need_action: null, urgent: null };
  let pipelineId = cfg?.pipeline_id ?? null;
  const pl = await ghl(c.ghlToken, `/opportunities/pipelines?locationId=${loc}`, "GET", undefined, "2021-07-28");
  const pipes: any[] = pl.json?.pipelines ?? [];
  const pipe = pipes.find((x) => x.id === pipelineId) ?? pipes.find((x) => String(x.name).trim() === String(cfg?.pipeline_name ?? "").trim());
  if (!pipe) return { ok: false, error: "pipeline not found — check archie_pipeline_name", items: [], open: null, need_action: null, urgent: null };
  pipelineId = pipe.id;
  const stageName = new Map((pipe.stages ?? []).map((s: any) => [s.id, s.name]));
  const r = await ghl(c.ghlToken, `/opportunities/search?location_id=${loc}&pipeline_id=${pipelineId}&status=open&limit=100`, "GET", undefined, "2021-07-28");
  if (!r.ok) return { ok: false, error: `opportunities ${r.status}`, items: [], open: null, need_action: null, urgent: null };
  const staleAfter = Number(cfg?.stale_threshold_days ?? 7) || 7;
  const now = Date.now();
  const items = (r.json?.opportunities ?? []).map((o: any) => {
    const last = toMs(o.lastStageChangeAt ?? o.lastStatusChangeAt ?? o.updatedAt ?? o.createdAt);
    const days = last ? Math.floor((now - last) / 86400000) : 0;
    const urgent = days >= staleAfter;
    const needsAction = urgent || days >= 2;
    return { id: o.id, name: String(o.contact?.name ?? o.name ?? "Unknown"), contact_id: o.contactId ?? o.contact?.id ?? null, stage: String(stageName.get(o.pipelineStageId) ?? ""), value: Number(o.monetaryValue ?? 0) || 0, days, urgent, needs_action: needsAction };
  }).sort((a: any, b: any) => Number(b.urgent) - Number(a.urgent) || Number(b.needs_action) - Number(a.needs_action) || b.days - a.days);
  return {
    ok: true, items: items.slice(0, 12),
    open: items.length,
    need_action: items.filter((i: any) => i.needs_action).length,
    urgent: items.filter((i: any) => i.urgent).length,
    value: items.reduce((a: number, i: any) => a + i.value, 0),
  };
}

async function health(c: any) {
  const now = Date.now();
  const [{ data: sync }, { data: stripeRow }, { data: brief }] = await Promise.all([
    supabase.from("agent_runs").select("finished_at").eq("tenant_id", c.tid).eq("agent", "sync").eq("status", "done").order("finished_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("daily_metrics").select("metric_date").eq("tenant_id", c.tid).not("mrr", "is", null).order("metric_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("briefs").select("brief_date, created_at").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const hoursSince = (iso: unknown) => iso ? Math.round((now - Date.parse(String(iso))) / 3600000) : null;
  const ghlH = hoursSince(sync?.finished_at);
  const stripeDays = stripeRow?.metric_date ? Math.round((Date.parse(c.today) - Date.parse(String(stripeRow.metric_date))) / 86400000) : null;
  return {
    ghl: { ok: ghlH !== null && ghlH <= 30, last: sync?.finished_at ?? null },
    stripe: { ok: stripeDays !== null && stripeDays <= 1, last: stripeRow?.metric_date ?? null },
    archie: { ok: brief?.brief_date === c.today, last: brief?.created_at ?? null },
  };
}

async function clientFlags(c: any) {
  const since = new Date(Date.now() - 8 * 86400000).toISOString();
  const { data } = await supabase.from("client_analysis").select("client_id").eq("tenant_id", c.tid).eq("risk_level", "high").gte("analysed_at", since);
  return new Set((data ?? []).map((x) => x.client_id)).size;
}

async function contactSearch(c: any, p: any) {
  const q = String(p.q ?? "").trim();
  if (q.length < 2) return { ok: true, contacts: [] };
  const { loc } = await locOf(c);
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token", contacts: [] };
  const r = await ghl(c.ghlToken, `/contacts/?locationId=${loc}&query=${encodeURIComponent(q)}&limit=10`, "GET", undefined, "2021-07-28");
  if (!r.ok) return { ok: false, error: `contacts ${r.status}`, contacts: [] };
  const { data: clients } = await supabase.from("clients").select("ghl_contact_id").eq("tenant_id", c.tid).eq("status", "active");
  const clientSet = new Set((clients ?? []).map((x) => x.ghl_contact_id));
  const contacts = (r.json?.contacts ?? []).map((x: any) => ({
    id: x.id, name: [x.firstName, x.lastName].filter(Boolean).join(" ") || x.contactName || x.email || "Contact",
    email: x.email ?? "", client: clientSet.has(x.id),
  }));
  return { ok: true, contacts };
}

// Everything Archie can see about one contact, as text for a skill run
async function contactContext(tid: string, contactId: string): Promise<string> {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_location_id, ghl_token, timezone").eq("tenant_id", tid).single();
  const { data: t } = await supabase.from("tenants").select("location_id").eq("id", tid).single();
  const loc = cfg?.ghl_location_id || t?.location_id;
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  if (!loc || !token) return "";
  const cut = (s: unknown, n: number) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
  const [ct, notes, convs, opps, appts] = await Promise.all([
    ghl(token, `/contacts/${contactId}`, "GET", undefined, "2021-07-28"),
    ghl(token, `/contacts/${contactId}/notes`, "GET", undefined, "2021-07-28"),
    ghl(token, `/conversations/search?locationId=${loc}&contactId=${contactId}&limit=1`, "GET", undefined, "2021-04-15"),
    ghl(token, `/opportunities/search?location_id=${loc}&contact_id=${contactId}&limit=5`, "GET", undefined, "2021-07-28"),
    ghl(token, `/contacts/${contactId}/appointments`, "GET", undefined, "2021-07-28"),
  ]);
  const x = ct.json?.contact ?? {};
  const lines: string[] = [];
  lines.push(`Name: ${[x.firstName, x.lastName].filter(Boolean).join(" ") || x.contactName || "Unknown"} | Email: ${x.email ?? "-"} | Phone: ${x.phone ?? "-"} | Company: ${x.companyName ?? "-"}`);
  lines.push(`Tags: ${(x.tags ?? []).join(", ") || "none"} | Added: ${String(x.dateAdded ?? "").slice(0, 10) || "-"}`);
  const { data: client } = await supabase.from("clients").select("id, status, started_at, last_contact_at").eq("tenant_id", tid).eq("ghl_contact_id", contactId).maybeSingle();
  if (client) {
    lines.push(`Client: ${client.status}, since ${client.started_at ?? "-"}, last contact ${String(client.last_contact_at ?? "-").slice(0, 10)}`);
    const { data: tasks } = await supabase.from("tasks").select("title, status, due_date").eq("tenant_id", tid).eq("client_id", client.id).in("status", ["open", "doing", "waiting", "proposed"]).limit(10);
    if (tasks?.length) lines.push(`Open tasks for them: ${tasks.map((k) => `${k.title} (${k.status}${k.due_date ? `, due ${k.due_date}` : ""})`).join(" ; ")}`);
  } else lines.push("Client: not a current client");
  for (const o of (opps.json?.opportunities ?? []).slice(0, 3)) lines.push(`Deal: ${o.name} | ${o.status} | value ${o.monetaryValue ?? 0}`);
  const ap: any[] = appts.json?.events ?? appts.json?.appointments ?? [];
  for (const a of ap.slice(-3)) lines.push(`Appointment: ${String(a.startTime ?? "").slice(0, 16)} ${cut(a.title, 80)} (${a.appointmentStatus ?? a.status ?? "-"})`);
  const nl: any[] = notes.json?.notes ?? [];
  nl.sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded)));
  for (const n of nl.slice(0, 8)) lines.push(`Note ${String(n.dateAdded ?? "").slice(0, 10)}: ${cut(n.body, 500)}`);
  const conv = (convs.json?.conversations ?? [])[0];
  if (conv?.id) {
    const m = await ghl(token, `/conversations/${conv.id}/messages?limit=15`, "GET", undefined, "2021-04-15");
    const arr: any[] = m.json?.messages?.messages ?? m.json?.messages ?? [];
    const msgs = (Array.isArray(arr) ? arr : []).map((mm) => ({ at: String(mm.dateAdded ?? ""), dir: String(mm.direction ?? ""), body: cut(mm.body ?? mm.message, 300) })).filter((mm) => mm.body).sort((a, b) => a.at.localeCompare(b.at));
    for (const mm of msgs.slice(-15)) lines.push(`[${mm.at.slice(0, 10)} ${mm.dir}] ${mm.body}`);
  }
  return lines.join("\n").slice(0, 12000);
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
  let message = "";
  if (kind === "skill") {
    const biz = await businessContext(tid);
    const who = r.contact_id ? await contactContext(tid, String(r.contact_id)) : "";
    message = `Use the ${r.skill} skill.\n\nInput:\n${r.input || "(no input given — make sensible assumptions from the business context)"}\n\nBusiness context:\n${biz}${who ? `\n\nContact context (everything Archie can see about them):\n${who}` : ""}\n\nReturn only the finished output, ready to copy. No preamble, no questions, no notes about what you did.`;
  }
  return { ok: true, has_run: "yes", run_id: r.id, kind: r.kind, agent, skill: r.skill ?? "", input: r.input ?? "", message };
}

async function runFinish(tid: string, p: any) {
  const id = String(p.run_id ?? "");
  if (!id) return { ok: false, error: "run_id required" };
  const { data: runRow } = await supabase.from("screen_runs").select("kind").eq("tenant_id", tid).eq("id", id).maybeSingle();
  let output = tidy(clean(String(p.output ?? "")));
  // Pipeline and scraper summaries carry machine lines for agent-result; the page only needs the human part
  if (runRow?.kind === "pipeline" || runRow?.kind === "scraper") {
    output = output.split("\n").filter((l) => !/^\s*(TASKS_JSON|ACTIONS_JSON|CLIENTS_TOUCHED|METRICS_JSON)\s*:/i.test(l)).join("\n").trim();
  }
  const junk = !output || /^(null|undefined|\d{1,6})$/i.test(output.trim());
  const failed = String(p.status ?? "") === "failed" || /^ERROR:/i.test(output) || junk;
  const { data } = await supabase.from("screen_runs").update({
    status: failed ? "failed" : "done",
    output: failed ? null : output.slice(0, 50000),
    error: failed ? (junk ? `no real output came back (got "${output || "nothing"}") — check the workflow's output mapping` : output) : null,
    finished_at: new Date().toISOString(),
  }).eq("tenant_id", tid).eq("id", id).select("id, status, kind").maybeSingle();
  if (!data) return { ok: false, error: "run not found" };

  // More of the same kind waiting? Tag the owner again so the workflow runs again and picks up the next one.
  let next = "none";
  const { count: waiting } = await supabase.from("screen_runs").select("id", { count: "exact", head: true })
    .eq("tenant_id", tid).eq("kind", data.kind).eq("status", "queued");
  if ((waiting ?? 0) > 0) {
    const c = await context(tid);
    const r = await retag(c, data.kind);
    next = r.ok ? `retriggered for ${waiting} queued` : `couldn't retrigger: ${r.error}`;
  }
  return { ok: true, status: data.status, next };
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

async function ghl(token: string, path: string, method = "GET", body?: unknown, version = "2021-07-28") {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, { method, signal: ctrl.signal, headers: { "Authorization": `Bearer ${token}`, "Version": version, "Accept": "application/json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
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

function toMs(v: unknown): number { if (v === null || v === undefined || v === "") return 0; if (typeof v === "number") return v < 1e12 ? v * 1000 : v; const n = Number(v); if (Number.isFinite(n) && n > 0) return n < 1e12 ? n * 1000 : n; const d = Date.parse(String(v)); return Number.isFinite(d) ? d : 0; }
function tzOffsetMs(ms: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date(ms));
  const g = (t: string) => Number(parts.find((x) => x.type === t)?.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"), g("second"));
  return asUtc - Math.floor(ms / 1000) * 1000;
}
function localMidnightMs(d: string, tz: string) { const guess = Date.parse(`${d}T00:00:00Z`); return guess - tzOffsetMs(guess, tz); }

// Agent output sometimes arrives escaped more than once, or with a stray number glued on the end by the workflow.
function tidy(s: string) {
  let out = String(s ?? "");
  for (let i = 0; i < 3 && /\\+n/.test(out); i++) {
    out = out.replace(/\\+r\\+n|\\+n/g, "\n").replace(/\\+t/g, "  ").replace(/\\+"/g, '"').replace(/\\+'/g, "'");
  }
  out = out.replace(/\\{2,}/g, "\\");
  out = out.trim().replace(/([^\s\d])\d{1,3}$/, "$1");
  return out.trim();
}