// archie-screens v3.4 — data and actions for the Archie AI Studio pages.
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
// v1.8: Collected this month reads Stripe's revenue_mtd; pipeline days count from the last message (matches the brief).
// v1.9: money figures come from the latest day Stripe actually reported, not just the latest row.
// v2.0: skill runs call the Managed Agent directly (Agent Studio public API) in the background — no tags or workflow.
//       Per-tenant run_mode: 'api' (default) or 'workflow' (the old tag route, kept as a fallback). Pipeline and scraper stay on workflows for now.
// v2.1: brief_run — the morning brief via the API with a fresh session each day: brief-context → Brief agent → date check → brief-save → send.
// v2.2: brief_run gets the money summary straight from stripe-metrics (it isn't logged anywhere else).
// v2.3: plan_run — the Saturday content plan via the API: content agent → save → message the owner. Once a week unless forced.
// v2.4: Social Planner drafts go to the client's connected accounts with a GHL user attached (the API requires both); planner_accounts lists them.
// v2.5: 7D — Pipeline and Scraper via the API (buttons and mornings), and morning_run: sync → Stripe → context → Pipeline → Scraper → brief, all in the backend.
// v2.6: 7D part 2 — dispatch: one Supabase schedule runs every client's morning, evening, Saturday plan, renewals and monthly receipt at their own local times. evening_run, monthly_run, renewals_run.
// v2.7: 7D part 3 — Pipeline/Scraper format rules sent by the backend, every answer checked before saving, owner told when something's off; Agents health dot.
// v2.8: media_videos looks through the whole library (all pages and folders), newest first, grouped by month.
// v2.9: brain dump splits one line into several tasks at commas/semicolons when it's clearly a list ("A must 45m, B 15m, C").
// v3.4: talk knows today's drafts and proposals — "send the Jase message", "bin the second one", "give P2 to Sara". Team members can't send drafts.
// v3.3: talk — the backend does the actions. The agent answers with REPLY + ACTIONS_JSON; Archie runs each action
//       through the Archie toolbox itself, then (if anything ran) asks the agent for the final reply from the real results.
//       No more "Done" without anything happening.
// v3.2: talk logs which tools the agent actually used (toolsFired), so a "Done" without a tool call is visible.
// v3.1: Fathom calls — fathom_calls lists recent recorded calls; a skill run can carry a call (its summary and transcript go to the agent).
// v3.0: talk — Talk to Archie. A WhatsApp message goes to the Archie Assistant agent with today's context and a session per person per day; the reply goes back on WhatsApp.
// The token picks the tenant. Nothing from any other tenant is ever returned or changed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";
const TIERS = ["must", "high", "bonus"];
const RUN_KINDS = ["pipeline", "scraper", "skill", "video"];
const ZAPCAP = "https://api.zapcap.ai";
declare const EdgeRuntime: any;
// Agent names Archie looks for in each account (first match wins) — old names kept so nothing breaks while renaming
const AGENT_NAMES: Record<string, string[]> = {
  content: ["Archie Content", "Archie Content Writer"],
  sales: ["Archie Sales", "Archie Sales Writer"],
  ops: ["Archie Ops", "Operations Writer"],
  brief: ["Archie Brief", "Brief"],
  pipeline: ["Archie Pipeline", "Pipeline"],
  scraper: ["Archie Scraper", "Scraper"],
  assistant: ["Archie Assistant", "Archie"],
};
const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
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
      if (action === "dispatch") return j(await dispatch(p));
      if (!tenant_id) return j({ error: "tenant_id required" }, 400);
      if (action === "run_next") return j(await runNext(tenant_id, String(p.kind ?? "")));
      if (action === "run_finish") return j(await runFinish(tenant_id, p));
      if (action === "plan_context") return j(await planContext(tenant_id));
      if (action === "plan_save") return j(await planSave(tenant_id, p));
      if (action === "talk") { startInBackground(talk(tenant_id, p)); return j({ ok: true, started: true }); }
      if (action === "evening_run") { startInBackground(eveningRun(tenant_id)); return j({ ok: true, started: true }); }
      if (action === "monthly_run") { startInBackground(monthlyRun(tenant_id, p)); return j({ ok: true, started: true }); }
      if (action === "renewals_run") { startInBackground(renewalsRun(tenant_id)); return j({ ok: true, started: true }); }
      if (action === "morning_run") {
        startInBackground(morningRun(tenant_id, p));
        return j({ ok: true, started: true, step: String(p.step ?? "start") });
      }
      if (action === "plan_run") {
        startInBackground(planRun(tenant_id, p));
        return j({ ok: true, started: true });
      }
      if (action === "brief_run") {
        // Reply straight away (GHL webhooks don't wait long) and do the work in the background
        startInBackground(briefRun(tenant_id, p));
        return j({ ok: true, started: true });
      }
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
      case "planner_accounts": return j(await plannerAccounts(c));
      case "fathom_calls": return j(await fathomCalls(c));
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
    supabase.from("daily_metrics").select("*").eq("tenant_id", c.tid).not("mrr", "is", null).order("metric_date", { ascending: false }).limit(1).maybeSingle(),
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
  const summedPeriod = inPeriod.reduce((a, r) => a + (Number(r.cash_24h) || 0), 0);
  const summedMtd = (rows ?? []).filter((r) => r.metric_date >= monthStart).reduce((a, r) => a + (Number(r.cash_24h) || 0), 0);
  // Stripe's own month-to-date figure (written by stripe-metrics) is the source of truth; the sum is only a fallback
  const stripeMtd = latest.metric_date && String(latest.metric_date) >= monthStart ? num(latest.revenue_mtd) : null;
  const revenueMtd = stripeMtd ?? summedMtd;
  const revenue = period === "month" ? revenueMtd : summedPeriod;
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
      revenue_note: period === "month" ? "Collected this month, from Stripe" : "Cash collected in the period, from the daily Stripe snapshots",
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
  // One task per line — and a line typed as a list ("A must 45m, B 15m; C") becomes several tasks.
  // Only split at a comma/semicolon when the part before it ends like a task (a tier, a time or a day),
  // so a single task with a comma in its title ("Call Jase, ask about dates") stays whole.
  const ENDS_LIKE_TASK = /(\b(must|high|bonus)|\d+(?:\.\d+)?\s*(m|min|mins|minutes|h|hr|hrs|hours?)|\b(today|tomorrow|mon(day)?|tue(s|sday)?|wed(nesday)?|thu(r|rs|rsday)?|fri(day)?|sat(urday)?|sun(day)?))\s*$/i;
  const splitList = (line: string): string[] => {
    const parts = line.split(/\s*[;,]\s*/).map((x) => x.trim()).filter(Boolean);
    if (parts.length < 2) return [line];
    const out: string[] = [];
    let buf = "";
    for (let i = 0; i < parts.length; i++) {
      buf = buf ? `${buf}, ${parts[i]}` : parts[i];
      if (ENDS_LIKE_TASK.test(buf) || i === parts.length - 1) { out.push(buf); buf = ""; }
    }
    return out.length >= 2 ? out : [line];
  };
  const lines = String(p.text ?? "").split(/\n+/).map((s) => s.trim().replace(/^[-*•]\s*/, "")).filter(Boolean)
    .flatMap(splitList).map((s) => s.replace(/^(and|&)\s+/i, "").trim()).filter(Boolean).slice(0, 30);
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
    supabase.from("skills_catalog").select("key, name, category, description, input_label, enabled, options, needs_contact, uses_call, module").order("sort"),
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
    .insert({ tenant_id: c.tid, kind, skill, input, status: "queued", requested_by: c.resolve(p.handle), contact_id: contactId, contact_name: String(p.contact_name ?? "").slice(0, 120) || null, call_id: String(p.call_id ?? "").trim() || null, call_title: String(p.call_title ?? "").slice(0, 200) || null })
    .select("id, kind, skill, status, created_at").single();
  if (error) throw new Error(error.message);
  if ((await runMode(c.tid)) === "api") {
    if (kind === "skill") { startInBackground(executeRun(c.tid, row.id)); return { ok: true, run: row, route: "api" }; }
    if (kind === "pipeline" || kind === "scraper") { startInBackground(executeJobRun(c.tid, row.id, kind)); return { ok: true, run: row, route: "api" }; }
  }
  const tagged = await retag(c, kind);
  if (!tagged.ok) {
    await supabase.from("screen_runs").update({ status: "failed", error: tagged.error, finished_at: new Date().toISOString() }).eq("id", row.id);
    return { ok: false, run_id: row.id, error: tagged.error };
  }
  return { ok: true, run: row, route: "workflow" };
}

async function nudge(c: any, p: any) {
  const id = String(p.run_id ?? "");
  const { data: r } = await supabase.from("screen_runs").select("id, kind, status, started_at").eq("tenant_id", c.tid).eq("id", id).maybeSingle();
  if (!r) return { ok: false, error: "run not found" };
  const stuckRunning = r.status === "running" && r.started_at && Date.now() - Date.parse(r.started_at) > 5 * 60000;
  if ((await runMode(c.tid)) === "api" && (r.status === "queued" || stuckRunning)) {
    await supabase.from("screen_runs").update({ status: "queued", started_at: null }).eq("id", r.id);
    if (r.kind === "skill") startInBackground(executeRun(c.tid, r.id));
    else startInBackground(executeJobRun(c.tid, r.id, r.kind));
    return { ok: true, route: "api" };
  }
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
  let q = supabase.from("screen_runs").select("id, kind, skill, input, status, output, error, saved, created_at, finished_at, contact_name, call_title").eq("tenant_id", c.tid);
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

async function plannerAccounts(c: any) {
  const { loc } = await locOf(c);
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token", accounts: [] };
  const r = await ghl(c.ghlToken, `/social-media-posting/${loc}/accounts`, "GET", undefined, "2021-07-28");
  if (!r.ok) return { ok: false, error: `accounts ${r.status}: ${r.text.slice(0, 150)}`, accounts: [] };
  const list: any[] = r.json?.results?.accounts ?? r.json?.accounts ?? [];
  const accounts = list
    .filter((a) => !a.deleted && a.isExpired !== true)
    .map((a) => ({ id: String(a.id ?? a._id ?? ""), platform: String(a.platform ?? a.type ?? "").toLowerCase(), name: String(a.name ?? a.meta?.name ?? a.platform ?? "") }))
    .filter((a) => a.id);
  return { ok: true, accounts };
}

// A GHL user to post as — remembered once found
async function plannerUserId(c: any, loc: string): Promise<string | null> {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_user_id").eq("tenant_id", c.tid).maybeSingle();
  if (cfg?.ghl_user_id) return String(cfg.ghl_user_id);
  const r = await ghl(c.ghlToken, `/users/?locationId=${loc}`, "GET", undefined, "2021-07-28");
  const users: any[] = r.json?.users ?? [];
  const pick = users.find((u) => String(u.roles?.role ?? u.role ?? "").toLowerCase() === "admin") ?? users[0];
  const id = pick?.id ? String(pick.id) : null;
  if (id) await supabase.from("tenant_config").update({ ghl_user_id: id }).eq("tenant_id", c.tid);
  return id;
}

async function toPlanner(c: any, p: any) {
  const type = ["post", "story", "reel"].includes(String(p.type)) ? String(p.type) : "post";
  const text = String(p.text ?? "").trim();
  const mediaUrl = String(p.media_url ?? "").trim();
  if (!text && !mediaUrl) return { ok: false, error: "nothing to add" };
  const { loc } = await locOf(c);
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token" };

  // Which accounts: the ones asked for, otherwise every connected account that suits the type
  const acc = await plannerAccounts(c);
  if (!acc.ok) return { ok: false, error: acc.error };
  let accounts = acc.accounts as any[];
  if (Array.isArray(p.account_ids) && p.account_ids.length) accounts = accounts.filter((a) => p.account_ids.includes(a.id));
  if (type === "story" || type === "reel") accounts = accounts.filter((a) => /instagram|facebook|tiktok|youtube/.test(a.platform));
  if (!accounts.length) return { ok: false, error: type === "post" ? "no social accounts connected in Social Planner" : `no accounts that take ${type}s are connected in Social Planner` };

  const userId = await plannerUserId(c, loc);
  if (!userId) return { ok: false, error: "couldn't find a GHL user to post as — add the users scope to the token" };

  const body: Record<string, unknown> = { type, status: "draft", accountIds: accounts.map((a) => a.id), userId };
  // Stories can't carry a caption, so the text goes in as the follow-up comment instead
  if (type !== "story") body.summary = text.slice(0, 2200);
  if (mediaUrl) body.media = [{ url: mediaUrl, type: String(p.media_type ?? (type === "post" ? "image/jpeg" : "video/mp4")) }];
  if (type === "story" && text) body.followUpComment = text.slice(0, 500);

  const r = await ghl(c.ghlToken, `/social-media-posting/${loc}/posts`, "POST", body, "2021-07-28");
  if (!r.ok) return { ok: false, error: `Social Planner said ${r.status}: ${r.text.slice(0, 300)}` };
  const postId = r.json?.results?.post?._id ?? r.json?.post?._id ?? r.json?.results?._id ?? null;
  if (p.run_id) await supabase.from("screen_runs").update({ saved: true }).eq("tenant_id", c.tid).eq("id", String(p.run_id));
  return { ok: true, post_id: postId, accounts: accounts.map((a) => a.name), note: "Saved as a draft in Social Planner — add media, check the accounts, then schedule." };
}

async function mediaVideos(c: any) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_location_id").eq("tenant_id", c.tid).single();
  const { data: t } = await supabase.from("tenants").select("location_id").eq("id", c.tid).single();
  const loc = cfg?.ghl_location_id || t?.location_id;
  if (!loc || !c.ghlToken) return { ok: false, error: "no GHL location or token", videos: [], months: [] };

  const isVideo = (f: any) => /video|\.mp4|\.mov|\.webm|\.m4v/i.test(String(f.contentType ?? f.type ?? "") + " " + String(f.name ?? "") + " " + String(f.url ?? ""));
  const all: any[] = [];
  let firstError = "";

  // Files in one place (the top level, or one folder), several pages deep
  const pull = async (parentId: string | null) => {
    for (let page = 0; page < 5; page++) {
      const qs = `altId=${loc}&altType=location&type=file&sortBy=createdAt&sortOrder=desc&limit=100&offset=${page * 100}${parentId ? `&parentId=${parentId}` : ""}`;
      const r = await ghl(c.ghlToken, `/medias/files?${qs}`, "GET", undefined, "2021-07-28");
      if (!r.ok) { if (!firstError) firstError = `media library ${r.status}`; return; }
      const files: any[] = r.json?.files ?? r.json?.data ?? [];
      all.push(...files);
      if (files.length < 100) return;
    }
  };

  await pull(null);
  // Folders too — people often keep videos in them
  const fr = await ghl(c.ghlToken, `/medias/files?altId=${loc}&altType=location&type=folder&limit=100`, "GET", undefined, "2021-07-28");
  const folders: any[] = fr.ok ? (fr.json?.files ?? fr.json?.data ?? []) : [];
  for (const f of folders.slice(0, 15)) {
    const id = String(f._id ?? f.id ?? "");
    if (id) await pull(id);
  }
  if (!all.length && firstError) return { ok: false, error: `${firstError} — paste a video link instead`, videos: [], months: [] };

  const seen = new Set<string>();
  const videos = all
    .filter(isVideo)
    .map((f) => ({ name: String(f.name ?? "video"), url: String(f.url ?? f.fileUrl ?? ""), at: f.createdAt ?? f.updatedAt ?? null }))
    .filter((v) => v.url && !seen.has(v.url) && (seen.add(v.url), true))
    .sort((x, y) => String(y.at ?? "").localeCompare(String(x.at ?? "")))
    .slice(0, 150)
    .map((v) => {
      const d = v.at ? new Date(String(v.at)) : null;
      const month = d && !isNaN(d.getTime()) ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}` : "unknown";
      const month_label = d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }) : "Undated";
      return { ...v, month, month_label };
    });

  const months: { month: string; label: string; count: number }[] = [];
  for (const v of videos) {
    const m = months.find((x) => x.month === v.month);
    if (m) m.count++; else months.push({ month: v.month, label: v.month_label, count: 1 });
  }
  return { ok: true, videos, months };
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
  const opps: any[] = r.json?.opportunities ?? [];
  // Days since the last message with that contact (same measure as the brief); falls back to the deal's last change
  const lastMsg = new Map<string, number>();
  const ids = [...new Set(opps.map((o) => o.contactId ?? o.contact?.id).filter(Boolean))].slice(0, 25) as string[];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(6, ids.length) }, async () => {
    while (i < ids.length) {
      const cid = ids[i++];
      const cs = await ghl(c.ghlToken, `/conversations/search?locationId=${loc}&contactId=${cid}&limit=1`, "GET", undefined, "2021-04-15");
      const c0 = cs.ok ? (cs.json?.conversations ?? [])[0] : null;
      const at = c0 ? toMs(c0.lastMessageDate ?? c0.dateUpdated) : 0;
      if (at) lastMsg.set(cid, at);
    }
  }));
  const items = opps.map((o: any) => {
    const cidKey = o.contactId ?? o.contact?.id;
    const last = lastMsg.get(cidKey) ?? toMs(o.lastStageChangeAt ?? o.lastStatusChangeAt ?? o.updatedAt ?? o.createdAt);
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
  const agents = await agentsHealth(c);
  return {
    agents,
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

// ===================== v2.0: direct agent runs =====================
async function runMode(tid: string): Promise<string> {
  const { data } = await supabase.from("tenant_config").select("run_mode").eq("tenant_id", tid).maybeSingle();
  return String(data?.run_mode ?? "api") === "workflow" ? "workflow" : "api";
}

function startInBackground(p: Promise<unknown>) {
  try { if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) { EdgeRuntime.waitUntil(p); return; } } catch { /* fall through */ }
  p.catch((e) => console.error("background run failed", e));
}

// Find (and remember) the ID of this account's agent for content / sales / ops
async function agentIdFor(tid: string, agentKey: string, token: string, loc: string): Promise<string | null> {
  const { data: cfg } = await supabase.from("tenant_config").select("agent_ids").eq("tenant_id", tid).maybeSingle();
  const cache: Record<string, string> = (cfg?.agent_ids && typeof cfg.agent_ids === "object") ? cfg.agent_ids : {};
  if (cache[agentKey]) return cache[agentKey];
  const r = await ghl(token, `/agent-studio/managed-agents?locationId=${loc}&limit=100`, "GET", undefined, "v3");
  if (!r.ok) return null;
  const agents: any[] = r.json?.agents ?? [];
  const wanted = (AGENT_NAMES[agentKey] ?? []).map((n) => n.toLowerCase());
  let found: any = null;
  for (const name of wanted) { found = agents.find((a) => String(a.name ?? "").trim().toLowerCase() === name); if (found) break; }
  if (!found) return null;
  cache[agentKey] = found.id;
  await supabase.from("tenant_config").update({ agent_ids: cache }).eq("tenant_id", tid);
  return found.id;
}

async function executeRun(tid: string, runId: string) {
  const fail = async (error: string) => {
    await supabase.from("screen_runs").update({ status: "failed", error, finished_at: new Date().toISOString() }).eq("id", runId);
  };
  try {
    // Claim it (only if still queued), so a double nudge can't run it twice
    const { data: r } = await supabase.from("screen_runs").update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", runId).eq("status", "queued").select("id, skill, input, contact_id, call_id, call_title").maybeSingle();
    if (!r) return;

    const [{ data: cfg }, { data: t }, { data: s }] = await Promise.all([
      supabase.from("tenant_config").select("ghl_location_id, ghl_token").eq("tenant_id", tid).single(),
      supabase.from("tenants").select("location_id").eq("id", tid).single(),
      supabase.from("skills_catalog").select("*").eq("key", r.skill).maybeSingle(),
    ]);
    const loc = cfg?.ghl_location_id || t?.location_id;
    const token = cfg?.ghl_token || FALLBACK_TOKEN;
    if (!loc || !token) return fail("no GHL location or token");
    const agentKey = String((s as any)?.agent ?? "content");
    const agentId = await agentIdFor(tid, agentKey, token, loc);
    if (!agentId) return fail(`couldn't find the ${agentKey} agent — check it's published and named ${(AGENT_NAMES[agentKey] ?? [])[0]}`);

    // Build the message, keeping it under the API's 10,000-character limit
    const biz = await businessContext(tid);
    const who = r.contact_id ? await contactContext(tid, String(r.contact_id)) : "";
    const head = `Use the ${r.skill} skill.\n\nInput:\n${String(r.input || "(no input given — make sensible assumptions from the business context)").slice(0, 3000)}\n\nBusiness context:\n${biz}`;
    const tail = "\n\nReturn only the finished output, ready to copy. No preamble, no questions, no notes about what you did.";
    const room = 9800 - head.length - tail.length;
    // The picked Fathom call goes in first — it's what the skill is about
    const call = r.call_id ? await fathomCallText(tid, String(r.call_id)) : "";
    const callBlock = call ? `\n\nThe call (${r.call_title ?? "Fathom"}):\n${call.slice(0, Math.max(0, room - 400))}` : "";
    const room2 = room - callBlock.length;
    const whoBlock = who && room2 > 300 ? `\n\nContact context (everything Archie can see about them):\n${who.slice(0, room2 - 80)}` : "";
    const message = (head + callBlock + whoBlock + tail).slice(0, 9900);

    const body: Record<string, unknown> = { locationId: loc, message };
    if (r.contact_id) body.contactId = String(r.contact_id);

    let res = await agentExecute(token, agentId, body, runId);
    if (res.status === 429 || res.status >= 500) {
      const wait = Math.min(20, Number(res.retryAfter) || 8) * 1000;
      await new Promise((ok) => setTimeout(ok, wait));
      res = await agentExecute(token, agentId, body, runId);
    }
    if (res.status === 404) {
      // The cached agent ID is stale (agent replaced or renamed) — forget it so the next run looks it up again
      const { data: c2 } = await supabase.from("tenant_config").select("agent_ids").eq("tenant_id", tid).maybeSingle();
      const cache = (c2?.agent_ids && typeof c2.agent_ids === "object") ? { ...c2.agent_ids } : {};
      delete cache[agentKey];
      await supabase.from("tenant_config").update({ agent_ids: cache }).eq("tenant_id", tid);
      return fail("agent not found — it may have been renamed or unpublished; press Run again");
    }
    if (!res.ok || res.json?.success === false) return fail(`agent error ${res.status}: ${String(res.text).slice(0, 200)}`);

    const text = tidy(clean(String(res.json?.finalText ?? "")));
    if (!text || /^(null|undefined|\d{1,6})$/i.test(text)) return fail("the agent returned no text");
    await supabase.from("screen_runs").update({ status: "done", output: text.slice(0, 50000), error: null, finished_at: new Date().toISOString() }).eq("id", runId);
  } catch (e) {
    await fail(`run failed: ${String(e).slice(0, 200)}`);
  }
}

async function agentExecute(token: string, agentId: string, body: Record<string, unknown>, idem: string) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 140000);
  try {
    const r = await fetch(`${BASE}/agent-studio/managed-agents/${agentId}/execute`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Authorization": `Bearer ${token}`, "Version": "v3", "Accept": "application/json", "Content-Type": "application/json", "Idempotency-Key": idem },
      body: JSON.stringify(body),
    });
    const text = await r.text(); let js: any = null; try { js = JSON.parse(text); } catch { js = null; }
    return { ok: r.ok, status: r.status, json: js, text, retryAfter: r.headers.get("retry-after") };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e), retryAfter: null }; }
  finally { clearTimeout(tm); }
}

// ===================== v2.1: morning brief via the API =====================
async function briefRun(tid: string, p: any) {
  const SUPA = Deno.env.get("SUPABASE_URL")!;
  const log = async (status: string, summary: string, error: string | null = null) => {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "brief", trigger: "api", status, started_at: now, finished_at: now, summary, error });
  };
  try {
    const [{ data: cfg }, { data: t }, { data: team }] = await Promise.all([
      supabase.from("tenant_config").select("ghl_location_id, ghl_token, timezone, brief_channel").eq("tenant_id", tid).single(),
      supabase.from("tenants").select("location_id, status").eq("id", tid).single(),
      supabase.from("team_members").select("handle, name, gets_financials, ghl_contact_id").eq("tenant_id", tid),
    ]);
    if (t?.status !== "active") return;
    const tz = cfg?.timezone || "Europe/London";
    const today = localDate(Date.now(), tz);
    const loc = cfg?.ghl_location_id || t?.location_id;
    const token = cfg?.ghl_token || FALLBACK_TOKEN;
    if (!loc || !token) return log("failed", "", "no GHL location or token");

    // Already sent today? Don't send twice (unless forced)
    if (String(p.force ?? "") !== "yes") {
      const { count } = await supabase.from("briefs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("brief_date", today).eq("delivered", true);
      if ((count ?? 0) > 0) return log("done", "Brief already sent today — skipped");
    }

    // 1. Today's context from brief-context (rollover, lineup, money, playbooks)
    const bc = await fetch(`${SUPA}/functions/v1/brief-context`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET },
      body: JSON.stringify({ tenant_id: tid, referral_link: String(p.referral_link ?? "") }),
    });
    const bcj: any = await bc.json().catch(() => null);
    const ctx = String(bcj?.brief_context ?? "");
    if (!bc.ok || !ctx.includes("DAY:")) return log("failed", "", `brief-context failed: ${bc.status}`);
    const m = ctx.match(/DAY:\s*([A-Za-z]+)\s+(\d{1,2})\s+([A-Za-z]+)/);
    const expected = m ? `${m[1].slice(0, 3)} ${m[2]} ${m[3].slice(0, 3)}` : "";

    // 2. Today's pipeline, scraper and money summaries (saved earlier in the morning run)
    const { data: runsToday } = await supabase.from("agent_runs").select("agent, summary, started_at")
      .eq("tenant_id", tid).eq("status", "done").gte("started_at", `${today}T00:00:00`).order("started_at", { ascending: false }).limit(40);
    const latestOf = (names: string[]) => {
      const row = (runsToday ?? []).find((r: any) => names.includes(String(r.agent)) && r.summary);
      if (!row) return "not available";
      const txt = String(row.summary);
      const cut = txt.indexOf("===OWNER===");
      return (cut >= 0 ? txt.slice(0, cut) : txt).split("\n").filter((l) => !/^\s*(TASKS_JSON|ACTIONS_JSON|CLIENTS_TOUCHED|METRICS_JSON)\s*:/i.test(l)).join("\n").trim().slice(0, 2500) || "not available";
    };
    const pipelineTxt = latestOf(["pipeline"]);
    const scraperTxt = latestOf(["scraper"]);
    let moneyTxt = latestOf(["stripe", "stripe-metrics", "financials", "finance"]);
    let moneyNote = "";
    if (moneyTxt === "not available") {
      // stripe-metrics returns the money summary (MRR, new, MTD, failed payments to chase) — ask it directly
      try {
        const sm = await fetch(`${SUPA}/functions/v1/stripe-metrics`, {
          method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET },
          body: JSON.stringify({ tenant_id: tid }),
        });
        const smj: any = await sm.json().catch(() => null);
        const summary = String(smj?.summary ?? "").trim();
        if (sm.ok && summary) moneyTxt = summary.slice(0, 2500);
        else moneyNote = ` | stripe-metrics ${sm.status}${smj?.error ? `: ${String(smj.error).slice(0, 120)}` : ""}`;
      } catch (e) { moneyNote = ` | stripe-metrics unreachable`; }
    }

    // 3. The Brief agent, fresh session every day
    const agentId = await agentIdFor(tid, "brief", token, loc);
    if (!agentId) return log("failed", "", "couldn't find the Brief agent — check it's published and named Archie Brief");
    const message = [
      "Execute your instructions now. Use ONLY the data below. It is today's data. Ignore anything from earlier runs or conversations.",
      `The header date must be exactly: ${expected}.`,
      "Capacity comes from the OWNER CAPACITY line. The Today list is exactly the LINEUP lines, with their numbers. Never add a task that is not listed there. At risk comes only from the AT_RISK line.",
      "Return only the two briefs in the marker format.",
      "", "BRIEF CONTEXT:", ctx.slice(0, 6000),
      "", "FINANCIALS OUTPUT:", moneyTxt,
      "", "PIPELINE OUTPUT:", pipelineTxt,
      "", "SCRAPER OUTPUT:", scraperTxt,
    ].join("\n").slice(0, 9900);
    let res = await agentExecute(token, agentId, { locationId: loc, message }, `brief-${tid}-${today}-${Date.now()}`);
    if (res.status === 429 || res.status >= 500) {
      await new Promise((ok) => setTimeout(ok, Math.min(20, Number(res.retryAfter) || 8) * 1000));
      res = await agentExecute(token, agentId, { locationId: loc, message }, `brief-${tid}-${today}-${Date.now()}`);
    }
    if (!res.ok || res.json?.success === false) return log("failed", "", `Brief agent error ${res.status}: ${String(res.text).slice(0, 200)}`);

    // 4. Split and check the date
    const text = tidy(clean(String(res.json?.finalText ?? "")));
    const ownerRaw = text.includes("===OWNER===") ? text.split("===OWNER===")[1].split("===TEAM===")[0] : text;
    const teamRaw = text.includes("===TEAM===") ? text.split("===TEAM===")[1] : "";
    const tidyBrief = (x: string) => x.split(/\n---\n|\*\*Run complete|Run summary/i)[0].trim();
    const ownerText = tidyBrief(ownerRaw);
    const teamText = tidyBrief(teamRaw);
    const dated = (x: string) => !x || x.toUpperCase() === "QUIET" || !expected || x.includes(expected);
    if (!dated(ownerText) || !dated(teamText)) {
      await notifyOwner(tid, "⚠️ Brief blocked", `This morning's brief didn't carry today's date (${expected}), so it wasn't sent. Archie will try again tomorrow — or run it again from the Morning workflow.`, cfg);
      return log("failed", "", `stale brief blocked — expected ${expected}`);
    }

    // 5. Save (marks delivered, counts activity, referral date)
    await fetch(`${SUPA}/functions/v1/brief-save`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET },
      body: JSON.stringify({ tenant_id: tid, owner_text: ownerText, team_text: teamText, referral_offered: String(bcj?.referral ?? "no") }),
    });

    // 6. Send — owner, then the team member
    const channel = String(cfg?.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
    const owner = (team ?? []).find((x: any) => x.gets_financials);
    const other = (team ?? []).find((x: any) => !x.gets_financials && x.ghl_contact_id);
    const sent: string[] = [];
    const send = async (contactId: string, body: string, who: string) => {
      const r = await ghl(token, "/conversations/messages", "POST", { type: channel, contactId, message: body.slice(0, 3500) }, "2021-04-15");
      sent.push(`${who} ${r.ok ? "sent" : `failed ${r.status}`}`);
    };
    if (owner?.ghl_contact_id && ownerText && ownerText.toUpperCase() !== "QUIET") await send(owner.ghl_contact_id, ownerText, owner.handle);
    if (other?.ghl_contact_id && teamText && teamText.toUpperCase() !== "QUIET") await send(other.ghl_contact_id, teamText, other.handle);
    await log("done", `Brief for ${expected} via API | ${sent.join(" | ") || "nothing to send"}${moneyNote}`);
  } catch (e) {
    await log("failed", "", `brief_run crashed: ${String(e).slice(0, 200)}`);
  }
}

// ===================== v2.3: Saturday plan via the API =====================
async function planRun(tid: string, p: any) {
  const log = async (status: string, summary: string, error: string | null = null) => {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "plan", trigger: "api", status, started_at: now, finished_at: now, summary, error });
  };
  try {
    const [{ data: cfg }, { data: t }] = await Promise.all([
      supabase.from("tenant_config").select("ghl_location_id, ghl_token, timezone, brief_channel, modules").eq("tenant_id", tid).single(),
      supabase.from("tenants").select("location_id, status").eq("id", tid).single(),
    ]);
    if (t?.status !== "active") return;
    const loc = cfg?.ghl_location_id || t?.location_id;
    const token = cfg?.ghl_token || FALLBACK_TOKEN;
    if (!loc || !token) return log("failed", "", "no GHL location or token");

    // Once a week, unless forced
    if (String(p.force ?? "") !== "yes") {
      const since = new Date(Date.now() - 5 * 86400000).toISOString();
      const { count } = await supabase.from("content_plans").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", since);
      if ((count ?? 0) > 0) return log("done", "Plan already made this week — skipped");
    }

    const agentId = await agentIdFor(tid, "content", token, loc);
    if (!agentId) return log("failed", "", "couldn't find the content agent");

    const ctx = await planContext(tid);
    const message = [
      ctx.message,
      "",
      "Output rules (these override anything else): return ONLY a JSON array of 5–7 objects, Monday first, each exactly:",
      '{"day":"Mon","idea":"…","hook":"…","pillar":"…","angle":"story|belief shift|problem solving|objection|social proof","format":"post|reel|carousel|stories"}',
      "No text, headings or code fences before or after the array.",
    ].join("\n").slice(0, 9900);

    let res = await agentExecute(token, agentId, { locationId: loc, message }, `plan-${tid}-${Date.now()}`);
    if (res.status === 429 || res.status >= 500) {
      await new Promise((ok) => setTimeout(ok, Math.min(20, Number(res.retryAfter) || 8) * 1000));
      res = await agentExecute(token, agentId, { locationId: loc, message }, `plan-${tid}-${Date.now()}`);
    }
    if (!res.ok || res.json?.success === false) return log("failed", "", `content agent error ${res.status}: ${String(res.text).slice(0, 200)}`);

    const saved: any = await planSave(tid, { output: String(res.json?.finalText ?? "") });
    if (!saved?.ok) {
      await notifyOwner(tid, "⚠️ Content plan didn't work", "Archie couldn't turn this week's ideas into a plan. It'll try again next Saturday — or run content-strategy / the plan again from Skills.", cfg);
      return log("failed", "", String(saved?.error ?? "plan not saved"));
    }
    await log("done", `Plan for w/c ${saved.week_start}: ${saved.ideas} ideas | ${saved.notified ? "sent" : "not sent"}`);
  } catch (e) {
    await log("failed", "", `plan_run crashed: ${String(e).slice(0, 200)}`);
  }
}

// ===================== v2.5 (7D): Pipeline, Scraper and the morning run via the API =====================
async function internal(fn: string, body: Record<string, unknown>) {
  try {
    const r = await fetch(`${SUPA_URL}/functions/v1/${fn}`, { method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET }, body: JSON.stringify(body) });
    const js: any = await r.json().catch(() => null);
    return { ok: r.ok, status: r.status, json: js };
  } catch (e) { return { ok: false, status: 0, json: { error: String(e) } }; }
}

function extractArray(text: string, label: string) {
  const at = text.indexOf(label);
  if (at < 0) return { json: "[]", start: -1, end: -1 };
  const open = text.indexOf("[", at);
  if (open < 0) return { json: "[]", start: at, end: at + label.length };
  let depth = 0, inStr = false, esc = false;
  for (let i = open; i < text.length; i++) {
    const ch = text.charAt(i);
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (depth === 0) return { json: text.slice(open, i + 1), start: at, end: i + 1 }; }
  }
  return { json: "[]", start: at, end: text.length };
}
function safeArray(s: string): any[] { try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; } }

// Parse the Pipeline agent's reply the same way the workflow code step did
function parsePipeline(text: string) {
  const isError = /^ERROR:/i.test(text);
  const part = extractArray(text, "ACTIONS_JSON:");
  const actions = safeArray(part.json);
  let summary = text;
  if (part.start >= 0) summary = summary.slice(0, part.start) + summary.slice(part.end);
  summary = summary.replace(/\s+(?=STALE:)/, "\n").trim();
  return { isError, summary: isError ? text : summary, actions };
}

// Parse the Scraper agent's reply the same way the workflow code step did
function parseScraper(text: string) {
  const isError = /^ERROR:/i.test(text);
  const LABELS = "SCHEDULE|WAITING|COUNTS|PROPOSED|TASKS_JSON|CLIENTS_TOUCHED";
  const metricsRe = new RegExp("METRICS:\\s*([\\s\\S]*?)(?=\\s*(?:" + LABELS + "):|$)");
  const mm = text.match(metricsRe);
  const metrics: Record<string, number> = {};
  for (const pair of (mm ? mm[1] : "").split("|")) {
    const [k0, v0] = pair.split("=");
    const k = (k0 ?? "").trim(), v = (v0 ?? "").trim();
    if (k && v !== "" && !isNaN(Number(v))) metrics[k] = Number(v);
  }
  const tasksPart = extractArray(text, "TASKS_JSON:");
  const clientsPart = extractArray(text, "CLIENTS_TOUCHED:");
  const tasks = safeArray(tasksPart.json);
  const clients = safeArray(clientsPart.json);
  let summary = text;
  for (const part of [tasksPart, clientsPart].sort((a, b) => b.start - a.start)) {
    if (part.start >= 0) summary = summary.slice(0, part.start) + summary.slice(part.end);
  }
  summary = summary.replace(metricsRe, "").replace(new RegExp("\\s+(?=(?:" + LABELS + "):)", "g"), "\n").trim();
  return { isError, summary: isError ? text : summary, metrics, tasks, clients };
}

// Run the Pipeline or Scraper agent through the API and save what it finds (via agent-result, as before)
async function runAgentJob(tid: string, job: "pipeline" | "scraper", contextText?: string): Promise<{ ok: boolean; summary: string; error?: string }> {
  const [{ data: cfg }, { data: t }] = await Promise.all([
    supabase.from("tenant_config").select("ghl_location_id, ghl_token, customer_word, sale_word").eq("tenant_id", tid).single(),
    supabase.from("tenants").select("location_id").eq("id", tid).single(),
  ]);
  const loc = cfg?.ghl_location_id || t?.location_id;
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  if (!loc || !token) return { ok: false, summary: "", error: "no GHL location or token" };

  let ctx = contextText;
  if (!ctx) {
    const gc = await internal("ghl-context", { tenant_id: tid });
    ctx = String(job === "pipeline" ? gc.json?.pipeline_context ?? "" : gc.json?.scraper_context ?? "");
    if (!gc.ok || !ctx) return { ok: false, summary: "", error: `ghl-context failed (${gc.status})` };
  }
  const agentId = await agentIdFor(tid, job, token, loc);
  if (!agentId) return { ok: false, summary: "", error: `couldn't find the ${job} agent` };

  const cw = String(cfg?.customer_word ?? "client"), sw = String(cfg?.sale_word ?? "proposal");
  const rules = job === "pipeline" ? PIPELINE_RULES : SCRAPER_RULES;
  const head = job === "pipeline"
    ? `Execute your instructions now. Return only the output format. Customer word: ${cw} Sale word: ${sw}\n\n${rules}\n\nPIPELINE CONTEXT:\n`
    : `Execute your instructions now. Return only the output format. Customer word: ${cw}\n\n${rules}\n\nSCRAPER CONTEXT:\n`;
  const room = 9900 - head.length;
  const message = head + (ctx.length > room ? ctx.slice(0, room - 60) + "\n[trimmed — more activity than fits]" : ctx);

  let res = await agentExecute(token, agentId, { locationId: loc, message }, `${job}-${tid}-${Date.now()}`);
  if (res.status === 429 || res.status >= 500) {
    await new Promise((ok) => setTimeout(ok, Math.min(20, Number(res.retryAfter) || 8) * 1000));
    res = await agentExecute(token, agentId, { locationId: loc, message }, `${job}-${tid}-${Date.now()}`);
  }
  if (!res.ok || res.json?.success === false) return { ok: false, summary: "", error: `${job} agent error ${res.status}: ${String(res.text).slice(0, 160)}` };
  const text = tidy(clean(String(res.json?.finalText ?? "")));
  if (!text) return { ok: false, summary: "", error: `${job} agent returned no text` };

  // Check the answer has the shape Archie needs before anything is saved
  const problem = checkJobOutput(job, text);
  if (problem) {
    await flagOwnerOnce(tid, `${job}-format`, `⚠️ ${job === "pipeline" ? "Pipeline" : "Messages"} check skipped`, `Archie's ${job} agent didn't answer in the expected format this time (${problem}), so nothing was saved from it. If someone's edited that agent recently, its instructions may need resetting.`);
    return { ok: false, summary: "", error: `unusable ${job} output: ${problem}` };
  }

  if (job === "pipeline") {
    const pp = parsePipeline(text);
    await internal("agent-result", { tenant_id: tid, agent: "pipeline", summary: pp.summary, status: pp.isError ? "failed" : "done", actions: JSON.stringify(pp.actions) });
    return pp.isError ? { ok: false, summary: pp.summary, error: pp.summary.slice(0, 200) } : { ok: true, summary: pp.summary };
  }
  const sp = parseScraper(text);
  await internal("agent-result", { tenant_id: tid, agent: "scraper", summary: sp.summary, status: sp.isError ? "failed" : "done", metrics: JSON.stringify(sp.metrics), tasks: JSON.stringify(sp.tasks), clients_touched: JSON.stringify(sp.clients) });
  return sp.isError ? { ok: false, summary: sp.summary, error: sp.summary.slice(0, 200) } : { ok: true, summary: sp.summary };
}

// A Run Pipeline / Run Scraper button press
async function executeJobRun(tid: string, runId: string, kind: string) {
  const { data: r } = await supabase.from("screen_runs").update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", runId).eq("status", "queued").select("id").maybeSingle();
  if (!r) return;
  try {
    const out = await runAgentJob(tid, kind === "scraper" ? "scraper" : "pipeline");
    const shown = out.summary.split("\n").filter((l) => !/^\s*(TASKS_JSON|ACTIONS_JSON|CLIENTS_TOUCHED|METRICS_JSON)\s*:/i.test(l)).join("\n").trim();
    await supabase.from("screen_runs").update(out.ok
      ? { status: "done", output: shown.slice(0, 50000), error: null, finished_at: new Date().toISOString() }
      : { status: "failed", error: out.error ?? "failed", finished_at: new Date().toISOString() }).eq("id", runId);
  } catch (e) {
    await supabase.from("screen_runs").update({ status: "failed", error: String(e).slice(0, 200), finished_at: new Date().toISOString() }).eq("id", runId);
  }
}

// The whole morning, in steps so no single call runs too long:
// start: sync → Stripe → context → Pipeline → hand the scraper context to step 2
// scraper: Scraper → start the brief
async function morningRun(tid: string, p: any) {
  const step = String(p.step ?? "start");
  const notes: string[] = [];
  const log = async (status: string, summary: string, error: string | null = null) => {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "morning", trigger: "api", status, started_at: now, finished_at: now, summary, error });
  };
  try {
    const { data: t } = await supabase.from("tenants").select("status").eq("id", tid).single();
    if (t?.status !== "active") return;

    if (step === "start") {
      const sync = await internal("ghl-sync", { tenant_id: tid });
      notes.push(`sync ${sync.ok ? "ok" : sync.status}`);
      const stripe = await internal("stripe-metrics", { tenant_id: tid });
      notes.push(`stripe ${stripe.ok ? "ok" : stripe.status}`);
      const gc = await internal("ghl-context", { tenant_id: tid });
      notes.push(`context ${gc.ok ? "ok" : gc.status}`);
      const pipe = gc.ok ? await runAgentJob(tid, "pipeline", String(gc.json?.pipeline_context ?? "")) : { ok: false, summary: "", error: "no context" };
      notes.push(`pipeline ${pipe.ok ? "ok" : `failed: ${pipe.error}`}`);
      await log(pipe.ok && gc.ok ? "done" : "failed", `Morning step 1 | ${notes.join(" | ")}`);
      // Step 2 in its own call, carrying the scraper context
      await internal("archie-screens", { action: "morning_run", tenant_id: tid, step: "scraper", scraper_context: String(gc.json?.scraper_context ?? ""), referral_link: String(p.referral_link ?? "") });
      return;
    }

    if (step === "scraper") {
      const ctx = String(p.scraper_context ?? "");
      const scr = await runAgentJob(tid, "scraper", ctx || undefined);
      await log(scr.ok ? "done" : "failed", `Morning step 2 | scraper ${scr.ok ? "ok" : `failed: ${scr.error}`}`);
      // Step 3: the brief (it checks the date and won't send twice)
      await internal("archie-screens", { action: "brief_run", tenant_id: tid, referral_link: String(p.referral_link ?? "") });
      return;
    }
  } catch (e) {
    await log("failed", `Morning ${step}`, `crashed: ${String(e).slice(0, 200)}`);
    if (step === "start") await internal("archie-screens", { action: "morning_run", tenant_id: tid, step: "scraper", referral_link: String(p.referral_link ?? "") });
    else if (step === "scraper") await internal("archie-screens", { action: "brief_run", tenant_id: tid, referral_link: String(p.referral_link ?? "") });
  }
}

// ===================== v2.6 (7D part 2): schedules in Supabase =====================
function localNow(tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(new Date());
  const g = (k: string) => parts.find((x) => x.type === k)?.value ?? "";
  const date = `${g("year")}-${g("month")}-${g("day")}`;
  const minutes = (Number(g("hour")) % 24) * 60 + Number(g("minute"));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
  return { date, minutes, weekday, day: Number(g("day")) };
}
function hhmm(v: unknown, fallback: string) {
  const m = String(v ?? fallback).match(/^(\d{1,2}):(\d{2})/);
  const [h, mi] = m ? [Number(m[1]), Number(m[2])] : fallback.split(":").map(Number);
  return h * 60 + mi;
}
function dueNow(nowMin: number, targetMin: number) { return nowMin >= targetMin && nowMin < targetMin + 90; }

// Claim a job for a period — the unique key means it can only ever run once per period
async function claim(tid: string, job: string, periodKey: string): Promise<boolean> {
  const { error } = await supabase.from("schedule_log").insert({ tenant_id: tid, job, period_key: periodKey });
  return !error;
}

async function dispatch(_p: any) {
  const { data: tenants } = await supabase.from("tenants").select("id").eq("status", "active");
  const started: string[] = [];
  for (const t of tenants ?? []) {
    const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", t.id).maybeSingle();
    if (!cfg || cfg.schedules_on !== true) continue; // opt-in per client, so nothing double-runs alongside GHL workflows
    const tz = cfg.timezone || "Europe/London";
    const now = localNow(tz);
    const days = (v: unknown, fb: string) => String(v ?? fb).split(",").map((x) => Number(x.trim())).filter((x) => !isNaN(x));
    const jobs: { job: string; due: boolean; key: string; action: string; body?: Record<string, unknown> }[] = [
      { job: "renewals", due: dueNow(now.minutes, hhmm(cfg.sched_renewals, "04:15")), key: now.date, action: "renewals_run" },
      { job: "morning", due: days(cfg.sched_morning_days, "0,1,2,3,4,5,6").includes(now.weekday) && dueNow(now.minutes, hhmm(cfg.sched_morning, "04:30")), key: now.date, action: "morning_run", body: { referral_link: String(cfg.referral_link ?? "") } },
      { job: "evening", due: days(cfg.sched_evening_days, "0,1,2,3,4").includes(now.weekday) && dueNow(now.minutes, hhmm(cfg.sched_evening, "20:00")), key: now.date, action: "evening_run" },
      { job: "plan", due: now.weekday === Number(cfg.sched_plan_day ?? 6) && dueNow(now.minutes, hhmm(cfg.sched_plan, "08:00")), key: now.date, action: "plan_run" },
      { job: "monthly", due: now.day === Number(cfg.sched_monthly_day ?? 1) && dueNow(now.minutes, hhmm(cfg.sched_monthly, "09:00")), key: now.date.slice(0, 7), action: "monthly_run", body: { referral_link: String(cfg.referral_link ?? "") } },
    ];
    for (const jb of jobs) {
      if (!jb.due) continue;
      if (!(await claim(t.id, jb.job, jb.key))) continue;
      await internal("archie-screens", { action: jb.action, tenant_id: t.id, ...(jb.body ?? {}) });
      started.push(`${t.id.slice(0, 8)}:${jb.job}`);
    }
  }
  return { ok: true, started };
}

async function sendToTeam(tid: string, ownerText: string, teamText: string, label: string) {
  const [{ data: cfg }, { data: team }] = await Promise.all([
    supabase.from("tenant_config").select("ghl_token, brief_channel").eq("tenant_id", tid).single(),
    supabase.from("team_members").select("handle, gets_financials, ghl_contact_id").eq("tenant_id", tid),
  ]);
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  const channel = String(cfg?.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
  const owner = (team ?? []).find((x: any) => x.gets_financials);
  const other = (team ?? []).find((x: any) => !x.gets_financials && x.ghl_contact_id);
  const sent: string[] = [];
  const send = async (contactId: string, body: string, who: string) => {
    const r = await ghl(token, "/conversations/messages", "POST", { type: channel, contactId, message: body.slice(0, 3500) }, "2021-04-15");
    sent.push(`${who} ${r.ok ? "sent" : `failed ${r.status}`}`);
  };
  const usable = (x: string) => x && x.trim() && x.trim().toUpperCase() !== "QUIET";
  if (owner?.ghl_contact_id && usable(ownerText)) await send(owner.ghl_contact_id, ownerText, owner.handle);
  if (other?.ghl_contact_id && usable(teamText)) await send(other.ghl_contact_id, teamText, other.handle);
  const now = new Date().toISOString();
  await supabase.from("agent_runs").insert({ tenant_id: tid, agent: label, trigger: "api", status: "done", started_at: now, finished_at: now, summary: `${label} | ${sent.join(" | ") || "nothing to send"}` });
}

async function eveningRun(tid: string) {
  const r = await internal("plan-tomorrow", { tenant_id: tid });
  if (!r.ok) {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "evening", trigger: "api", status: "failed", started_at: now, finished_at: now, error: `plan-tomorrow ${r.status}` });
    return;
  }
  await sendToTeam(tid, String(r.json?.owner_text ?? ""), String(r.json?.team_text ?? ""), "evening");
}

async function monthlyRun(tid: string, p: any) {
  const r = await internal("monthly-receipt", { tenant_id: tid, referral_link: String(p.referral_link ?? "") });
  if (!r.ok) {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "monthly", trigger: "api", status: "failed", started_at: now, finished_at: now, error: `monthly-receipt ${r.status}` });
    return;
  }
  await sendToTeam(tid, String(r.json?.owner_text ?? ""), "", "monthly");
}

async function renewalsRun(tid: string) {
  const r = await internal("stripe-renewals", { tenant_id: tid });
  if (!r.ok) {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "renewals", trigger: "api", status: "failed", started_at: now, finished_at: now, error: `stripe-renewals ${r.status}` });
  }
}

// ===================== v2.7 (7D part 3): format rules, checks, agents health =====================
const PIPELINE_RULES = [
  "Output rules (these override anything else):",
  '- Line 1 exactly: "Pipeline £[total] / [n] open | Stale [n] | Reactivate [n]"',
  '- Then one line per stale deal: "STALE: [name] £[value] [days]d — [the one next action]"',
  '- Then, if there are actions: "ACTIONS_JSON: " followed by a JSON array of {"contact_id","opportunity_id","name","note","draft","channel","reactivate"}',
  "- Notes describe what Archie found or drafted. Never say a message was sent — drafts are only sent when the owner approves them.",
  "- Never invent names, values or dates that aren't in the context.",
].join("\n");

const SCRAPER_RULES = [
  "Output rules (these override anything else):",
  '- "METRICS: key=value | key=value" (numbers only)',
  '- "SCHEDULE: …", "WAITING: …", "COUNTS: …", "PROPOSED: …" — one line each',
  '- "TASKS_JSON: " followed by a JSON array of {"title","detail","tier","kind","effort_minutes","due_date","source_ref","contact_id"} — tier is must, high or bonus',
  '- "CLIENTS_TOUCHED: " followed by a JSON array of contact IDs',
  "- Only propose tasks for real requests, promises or problems in the messages. Never invent anything.",
].join("\n");

function checkJobOutput(job: string, text: string): string | null {
  const t = text.trim();
  if (!t || /^(null|undefined|\d{1,6})$/i.test(t)) return "empty reply";
  if (/^ERROR:/i.test(t)) return null; // the agent's own error — parsed and logged as failed as before
  if (job === "pipeline") {
    if (!/Pipeline\s*£?[\d,.]+/i.test(t) && !/STALE:/i.test(t) && !/no open/i.test(t)) return "no pipeline summary line";
    if (t.includes("ACTIONS_JSON:") && extractArray(t, "ACTIONS_JSON:").json === "[]" && !/ACTIONS_JSON:\s*\[\s*\]/.test(t)) return "ACTIONS_JSON isn't valid JSON";
  } else {
    if (!/(SCHEDULE|WAITING|COUNTS|PROPOSED):/i.test(t)) return "no SCHEDULE/WAITING/COUNTS lines";
    if (t.includes("TASKS_JSON:") && extractArray(t, "TASKS_JSON:").json === "[]" && !/TASKS_JSON:\s*\[\s*\]/.test(t)) return "TASKS_JSON isn't valid JSON";
  }
  return null;
}

// Tell the owner about a problem at most once a day per kind of problem
async function flagOwnerOnce(tid: string, key: string, title: string, body: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone, ghl_token, brief_channel").eq("tenant_id", tid).maybeSingle();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  if (!(await claim(tid, `flag:${key}`, today))) return;
  await notifyOwner(tid, title, body, cfg);
}

// Are all of Archie's agents there and published?
async function agentsHealth(c: any) {
  const { loc } = await locOf(c);
  if (!loc || !c.ghlToken) return { ok: false, missing: ["no GHL location or token"] };
  const r = await ghl(c.ghlToken, `/agent-studio/managed-agents?locationId=${loc}&limit=100`, "GET", undefined, "v3");
  if (!r.ok) return { ok: false, missing: [`can't list agents (${r.status}) — check the Managed Agents scopes`] };
  const names = new Set((r.json?.agents ?? []).map((a: any) => String(a.name ?? "").trim().toLowerCase()));
  const missing = Object.entries(AGENT_NAMES)
    .filter(([, options]) => !options.some((n) => names.has(n.toLowerCase())))
    .map(([key, options]) => `${key} (${options[0]})`);
  return { ok: missing.length === 0, missing };
}

// ===================== v3.0: Talk to Archie =====================
const TALK_RULES = [
  "You are Archie, talking to a member of this business on WhatsApp. Reply like a sharp, friendly colleague: short, plain UK English, no markdown headings, no bullet walls, under about 8 lines unless returning written content.",
  "DO NOT call any tools or apps yourself. Instead, list the actions Archie should take in ACTIONS_JSON — Archie's backend runs them and tells you the results.",
  "Output format, exactly:",
  "REPLY: <what to say to them now — if you listed actions, keep this to a short holding line like 'On it.'>",
  'ACTIONS_JSON: [{"tool":"archie_add_task","args":{"title":"…","tier":"bonus","effort_minutes":15,"due_date":"YYYY-MM-DD"}}]',
  "Use ACTIONS_JSON: [] when nothing needs doing (just chat or a question you can answer from the CONTEXT).",
  "Rules for actions:",
  "- Internal actions (add/complete/move tasks, capacity, quiet mode, day off, back on) — just do them, no 'are you sure?'.",
  "- Tasks: the title is just the job; set tier (must/high/bonus), effort_minutes and due_date from what they said; 'today' = today's date from the CONTEXT. Never put the tier or time in the title.",
  "- 'I'm off Friday' / 'block Thursday 2 till 4' / 'away Mon–Wed' → archie_day_off with real dates. 'Actually I'm working Friday' → archie_back_on.",
  "- Numbers or money → archie_numbers (never guess). Calls on a day → archie_calls. Writing (posts, reels, carousels, stories, proposals, objection replies, SOPs, briefs) → archie_run_skill.",
  "- 'Remember that…' → archie_remember.",
  "- Drafts waiting (the 'Ready to send' list): 'send the Jase message' / 'send 1' → archie_send_draft (rank or name). 'Bin that' / 'skip 2' → archie_skip_draft. 'What drafts are waiting?' → archie_drafts. Sending a waiting draft IS allowed when the owner clearly says send — that's their yes.",
  "- Proposals (P1, P2… things spotted in messages): 'add P1' / 'add the Niamh one' → archie_proposal action add. 'Give P2 to Sara' → action give, to_handle sara. 'I'm waiting on Seve for that' → action wait, waiting_for. 'Drop P3' / 'bin that one' → action drop. 'What did you spot?' → archie_proposals.",
  "- Anything new that goes to a customer (not an existing draft): never send it. Draft it in REPLY and ask 'Send it?'.",
  "- Team members (not the owner) never get money figures.",
  "- If it's unclear which task they mean, ask one short question and use ACTIONS_JSON: [].",
  "- Never invent tasks, names, numbers, dates or results.",
].join("\n");

const TALK_FOLLOWUP = [
  "RESULTS from Archie's backend are below — this is what actually happened.",
  "Now write the final message to send them. Base it only on these results: say what was done in one line each; if something failed, say so plainly and what to do instead; if a result contains written content (a post, script, proposal), give it to them.",
  "Output format, exactly:",
  "REPLY: <the message>",
  "ACTIONS_JSON: []",
].join("\n");

// Run one Archie tool through the Archie MCP, the same toolbox Ask AI and the agents use
async function runArchieTool(accessToken: string, name: string, args: Record<string, unknown>): Promise<{ ok: boolean; text: string }> {
  try {
    const r = await fetch(`${SUPA_URL}/functions/v1/archie-mcp/${accessToken}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    });
    const js: any = await r.json().catch(() => null);
    if (js?.error) return { ok: false, text: String(js.error.message ?? "error") };
    const text = (js?.result?.content ?? []).map((x: any) => x?.text ?? "").join("\n").trim();
    return { ok: !js?.result?.isError, text: text || "(no result)" };
  } catch (e) { return { ok: false, text: String(e) }; }
}

function parseTalk(text: string) {
  const t = String(text ?? "");
  const part = extractArray(t, "ACTIONS_JSON:");
  const actions = safeArray(part.json).filter((x: any) => x && typeof x.tool === "string" && x.tool.startsWith("archie_")).slice(0, 6);
  let reply = part.start >= 0 ? t.slice(0, part.start) : t;
  reply = reply.replace(/^\s*REPLY:\s*/i, "").trim();
  return { reply, actions };
}

async function talk(tid: string, p: any) {
  const contactId = String(p.contact_id ?? "").trim();
  const text = String(p.text ?? p.message ?? "").trim().slice(0, 4000);
  const log = async (status: string, summary: string, error: string | null = null) => {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "talk", trigger: "api", status, started_at: now, finished_at: now, summary, error });
  };
  try {
    if (!contactId || !text) return log("failed", "", "contact_id and text required");
    const [{ data: cfg }, { data: t }, { data: team }] = await Promise.all([
      supabase.from("tenant_config").select("ghl_location_id, ghl_token, timezone, brief_channel").eq("tenant_id", tid).single(),
      supabase.from("tenants").select("location_id, status, business_name").eq("id", tid).single(),
      supabase.from("team_members").select("handle, name, gets_financials, ghl_contact_id").eq("tenant_id", tid),
    ]);
    if (t?.status !== "active") return;
    const member = (team ?? []).find((m: any) => m.ghl_contact_id === contactId);
    if (!member) return log("failed", "", `message from a contact who isn't on the team (${contactId})`);
    const loc = cfg?.ghl_location_id || t?.location_id;
    const token = cfg?.ghl_token || FALLBACK_TOKEN;
    const tz = cfg?.timezone || "Europe/London";
    const today = localDate(Date.now(), tz);
    const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(new Date());
    const timeNow = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date());

    const agentId = await agentIdFor(tid, "assistant", token, loc);
    if (!agentId) return log("failed", "", "couldn't find the Archie Assistant agent — check it's published");

    // What's in front of them
    // Today's drafts (newest batch) — owner only
    let drafts: any[] = [];
    if (member.gets_financials) {
      const { data: newest } = await supabase.from("message_drafts").select("created_on").eq("tenant_id", tid).eq("status", "pending").order("created_on", { ascending: false }).limit(1).maybeSingle();
      if (newest?.created_on) {
        const { data: dr } = await supabase.from("message_drafts").select("rank, name, channel, body").eq("tenant_id", tid).eq("status", "pending").eq("created_on", newest.created_on).order("rank", { ascending: true }).limit(10);
        drafts = dr ?? [];
      }
    }
    const [{ data: list }, { data: proposals }, { data: memories }] = await Promise.all([
      supabase.from("tasks").select("title, tier, effort_minutes, today_rank").eq("tenant_id", tid).eq("owner", member.handle).eq("today", true).in("status", ["open", "doing"]).order("today_rank", { ascending: true }),
      member.gets_financials
        ? supabase.from("tasks").select("title, owner, proposal_rank").eq("tenant_id", tid).eq("status", "proposed").not("proposal_rank", "is", null).order("proposal_rank", { ascending: true }).limit(10)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("memories").select("fact").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(20),
    ]);
    const ctx = [
      `Today: ${dayName}, ${timeNow} (${today}). Business: ${t?.business_name ?? ""}.`,
      `You're talking to ${member.name ?? member.handle} (handle: ${member.handle}${member.gets_financials ? ", the owner" : ", a team member — no money figures"}).`,
      `Their list today: ${(list ?? []).length ? (list ?? []).map((x: any) => `#${x.today_rank ?? "-"} ${x.title} [${x.tier}, ${x.effort_minutes ?? 30}m]`).join("; ") : "empty"}.`,
      (proposals ?? []).length ? `Proposals waiting (as numbered in the brief/inbox): ${(proposals ?? []).map((x: any) => `P${x.proposal_rank} ${x.title}`).join("; ")}. To add/wait/drop one, tell them to text e.g. "add P1" — or do it for them by adding the task with archie_add_task.` : "",
      drafts.length ? `Drafts waiting to send: ${drafts.map((d: any) => `${d.rank}. ${d.name} (${d.channel}): "${String(d.body ?? "").slice(0, 80)}…"`).join("; ")}.` : "",
      (memories ?? []).length ? `Things to remember: ${(memories ?? []).map((m: any) => m.fact).join(" | ")}` : "",
    ].filter(Boolean).join("\n");

    // One conversation per person per day
    const { data: sess } = await supabase.from("talk_sessions").select("session_id").eq("tenant_id", tid).eq("handle", member.handle).eq("day", today).maybeSingle();
    const { data: tok } = await supabase.from("tenants").select("access_token").eq("id", tid).single();
    const accessToken = String(tok?.access_token ?? "");
    const channel = String(cfg?.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
    const reply = async (msg: string) => ghl(token, "/conversations/messages", "POST", { type: channel, contactId, message: msg.slice(0, 3500) }, "2021-04-15");

    let sessionId = sess?.session_id ?? "";
    const ask = async (message: string) => {
      const body: Record<string, unknown> = { locationId: loc, message: message.slice(0, 9900), contactId };
      if (sessionId) body.sessionId = sessionId;
      let res = await agentExecute(token, agentId, body, `talk-${tid}-${Date.now()}`);
      if (res.status === 429 || res.status >= 500) {
        await new Promise((ok) => setTimeout(ok, Math.min(20, Number(res.retryAfter) || 8) * 1000));
        res = await agentExecute(token, agentId, body, `talk-${tid}-${Date.now()}`);
      }
      const sid = String(res.json?.sessionId ?? "");
      if (sid && sid !== sessionId) {
        sessionId = sid;
        await supabase.from("talk_sessions").upsert({ tenant_id: tid, handle: member.handle, day: today, session_id: sid }, { onConflict: "tenant_id,handle,day" });
      }
      return res;
    };

    // Round 1: what do they want?
    const first = await ask(`${TALK_RULES}\n\nCONTEXT\n${ctx}\n\nTHEIR MESSAGE\n${text}`);
    if (!first.ok || first.json?.success === false) {
      await reply("Sorry — I couldn't process that just now. Try again in a minute, or use a quick command like done 1.");
      return log("failed", "", `Archie Assistant error ${first.status}: ${String(first.text).slice(0, 200)}`);
    }
    const plan = parseTalk(tidy(clean(String(first.json?.finalText ?? ""))));

    // Nothing to do → send the reply as it is
    if (!plan.actions.length || !accessToken) {
      const answer = plan.reply.replace(/^#+\s*/gm, "").trim() || "👍";
      const sent = await reply(answer);
      return log(sent.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${answer.slice(0, 80)} | actions: none`, sent.ok ? null : `reply not sent (${sent.status})`);
    }

    // Round 2: Archie does the actions itself
    const results: string[] = [];
    const ran: string[] = [];
    for (const act of plan.actions) {
      const args: Record<string, unknown> = { ...(act.args ?? {}) };
      // Default to the person talking; the owner can still give work to someone else by naming them
      const NO_HANDLE = ["archie_numbers", "archie_remember", "archie_run_skill", "archie_drafts", "archie_send_draft", "archie_skip_draft", "archie_proposals"];
      if (!args.handle && !NO_HANDLE.includes(act.tool)) args.handle = member.handle;
      const OWNER_ONLY = ["archie_numbers", "archie_send_draft", "archie_skip_draft", "archie_drafts", "archie_proposals", "archie_proposal"];
      if (!member.gets_financials && OWNER_ONLY.includes(act.tool)) { results.push(`${act.tool}: not available for team members`); continue; }
      const r = await runArchieTool(accessToken, act.tool, args);
      ran.push(`${act.tool}${r.ok ? "" : " (failed)"}`);
      results.push(`${act.tool} ${JSON.stringify(args)} → ${r.ok ? "OK" : "FAILED"}: ${r.text.slice(0, act.tool === "archie_run_skill" ? 6000 : 800)}`);
    }

    // Round 3: the final reply, from what actually happened
    const second = await ask(`${TALK_FOLLOWUP}\n\nTHEIR MESSAGE\n${text}\n\nRESULTS\n${results.join("\n\n")}`);
    let answer = "";
    if (second.ok && second.json?.success !== false) answer = parseTalk(tidy(clean(String(second.json?.finalText ?? "")))).reply;
    if (!answer) answer = results.map((x) => x.replace(/^archie_\w+ \{[^}]*\} → /, "")).join("\n");
    answer = answer.replace(/^#+\s*/gm, "").trim();
    const sent = await reply(answer);
    await log(sent.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${answer.slice(0, 80)} | actions: ${ran.join(", ")}`, sent.ok ? null : `reply not sent (${sent.status})`);
  } catch (e) {
    await log("failed", "", `talk crashed: ${String(e).slice(0, 200)}`);
  }
}

// ===================== v3.1: Fathom calls =====================
const FATHOM = "https://api.fathom.ai/external/v1";
async function fathomKey(tid: string): Promise<string | null> {
  const { data } = await supabase.from("tenant_config").select("fathom_api_key").eq("tenant_id", tid).maybeSingle();
  return data?.fathom_api_key ? String(data.fathom_api_key) : null;
}
async function fathomGet(key: string, path: string) {
  try {
    const r = await fetch(`${FATHOM}${path}`, { headers: { "X-Api-Key": key, "Accept": "application/json" } });
    const text = await r.text(); let json: any = null; try { json = JSON.parse(text); } catch { json = null; }
    return { ok: r.ok, status: r.status, json, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
}

// Recent recorded calls for the picker
async function fathomCalls(c: any) {
  const key = await fathomKey(c.tid);
  if (!key) return { ok: false, error: "Fathom isn't connected — add your Fathom API key", calls: [] };
  const calls: any[] = [];
  let cursor = "";
  for (let page = 0; page < 3 && calls.length < 30; page++) {
    const r = await fathomGet(key, `/meetings${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
    if (!r.ok) return { ok: false, error: `Fathom ${r.status}`, calls };
    for (const m of r.json?.items ?? []) {
      const invitees: any[] = m.calendar_invitees ?? m.invitees ?? [];
      const others = invitees.filter((x) => x.is_external !== false).map((x) => x.name || x.email).filter(Boolean);
      calls.push({
        id: String(m.recording_id ?? m.id ?? ""),
        title: String(m.title ?? m.meeting_title ?? "Call"),
        at: m.recording_start_time ?? m.scheduled_start_time ?? m.created_at ?? null,
        with: others.slice(0, 4).join(", "),
        url: m.share_url ?? m.url ?? null,
      });
    }
    cursor = String(r.json?.next_cursor ?? "");
    if (!cursor) break;
  }
  return { ok: true, calls: calls.filter((x) => x.id).slice(0, 30) };
}

// A call's summary (and as much transcript as fits) as plain text for a skill run
async function fathomCallText(tid: string, recordingId: string): Promise<string> {
  const key = await fathomKey(tid);
  if (!key) return "";
  const [sum, tr] = await Promise.all([
    fathomGet(key, `/recordings/${encodeURIComponent(recordingId)}/summary`),
    fathomGet(key, `/recordings/${encodeURIComponent(recordingId)}/transcript`),
  ]);
  const summary = String(sum.json?.summary?.markdown_formatted ?? sum.json?.summary?.markdown ?? sum.json?.summary ?? sum.json?.markdown_formatted ?? "").trim();
  const lines: any[] = tr.json?.transcript ?? tr.json?.items ?? [];
  const transcript = (Array.isArray(lines) ? lines : [])
    .map((l) => `${l.speaker?.display_name ?? l.speaker_name ?? l.speaker ?? "?"}: ${l.text ?? ""}`)
    .join("\n");
  return [summary ? `SUMMARY\n${summary}` : "", transcript ? `TRANSCRIPT\n${transcript}` : ""].filter(Boolean).join("\n\n");
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
