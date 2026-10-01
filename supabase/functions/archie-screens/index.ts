// archie-screens v6.3 — data and actions for the Archie AI Studio pages.
// v6.3: usage + costs — every agent run is logged (job, time, size); usage action shows runs per job and an estimated
//       cost per client per month (rate set by you); in the checkup and for all clients.
// v6.2: security — each client can have its own workflow secret (the master secret still works for you and the scheduler);
//       page login: PIN checked by the backend with lockout after 5 wrong tries, 12-hour sessions, only when switched on.
// v6.1: Settings — everything that was set by SQL is now readable/saveable from a Settings page: business, goals, links,
//       team, routing, schedules, sales, connections (secrets masked), plus pickers for contacts, GHL users and calendars.
// v6.0: ad-hoc data questions — "top 20 clients", "how did last week compare to the month before", "who paid the most this
//       year" → Archie pulls the relevant live data (Stripe, GHL, weekly history, clients, health, pipeline) and answers from it.
// v5.9: dump anything — "dump: …", "brain dump …" or a long rambling voice note becomes a clean note, tasks (for the right
//       person), notes on the right contacts, and things to remember. Saved in Archie; the page shows recent dumps.
// v5.8: call prep — "I've got Sarah at 10" → who they are, the last thing they asked, what's open (deal, tasks, drafts),
//       their form/quiz answers, call notes, client health, and 3 questions to ask. Built from GHL + Archie's own data.
// v5.7: second opinion (council) — big decisions run past a Chair and the lenses that fit (Money, Members, Operations,
//       Growth, Content) with the owner's real numbers; hot-seat questions first if vague; "ask Money more" follow-ups.
// v5.6: Sara as CSM — her brief gets client health (reds/yellows with reasons), clients waiting on a reply, and her
//       check-in prompts; she can draft, send and bin her own check-ins/chases; Monday she gets a client-numbers review (no money).
// v5.5: task upgrades — slip counter ("third move"), stalled tasks, waiting-on items with day counts and a drafted chase,
//       and "you're the blocker" when a team member is waiting on you; in each person's brief and by voice.
// v5.4.1: Talk to Archie fix — their message now goes first and the context is trimmed to fit (it was being cut off the
//         end of long prompts, so Archie replied "your message didn't come through"); talk rules tightened.
// v5.4: trial-to-member — set which pipeline stage means "trial / intro offer"; the weekly report counts trials started,
//       and for trials started 2–5 weeks ago: how many showed up and how many became members.
// v5.3: WhatsApp groups — clients linked to their group chats (Archie suggests matches, you confirm); member health reads
//       the group (last message, and whether the client's side is waiting on us) as well as the 1:1 chat.
// v5.2: member health — every active client scored Green / Yellow / Red nightly with the reasons and dates (last contact,
//       waiting on our reply, failed payment, paused/cancel tags, next booking); drafted check-ins; in the brief and by voice.
// v5.1: speed-to-lead (enquiries, slow replies, median first reply, who's waiting now), honest pipeline check
//       ("14 open, 3 real"), and a sharper Focus line in the brief (one action, one name, highest value first).
// v5.0: business memory — definitions, voice rules and corrections, what worked, services, facts, baselines ("normal week"),
//       and findings history ("third week in a row"). Fed to skills, Talk to Archie, the brief and the weekly focus;
//       set by voice ("remember…", "a member means…", "that doesn't sound like me…") or the pages.
// v4.9.2: Scraper/Pipeline timeouts (524) — smaller context by default for the Scraper, and a retry with a trimmed context
//         if GHL's agent times out, so the morning run finishes instead of failing.
// v4.9.1: Joe's full ARCHIE RULES on every agent run (short version when the message is long; exact output formats kept).
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
// v4.9: Archie rules on every agent run (no made-up numbers — [NEED: …], flag bad data, label the source, archive never delete,
//       answer first); /checkup — one plain report on everything Archie depends on, for you, clients and the agency view.
// v4.8: Archie spots email gaps — no nurture for new leads, lots of quiet leads, past clients with no win-back — and offers
//       the right sequence in 'where to focus'; 'do N' writes it and asks to save it to GHL.
// v4.7.2: skills know the owner's first name and the booking links (lead / client), so emails and posts don't need [CHECK] for them.
// v4.7.1: saving works even when the JSON block is missing or broken — reads the emails from the written sequence instead.
// v4.7: email sequences → GHL — save_sequence turns each email in a sequence into its own GHL email template (never sent);
//       the EMAILS_JSON block is hidden from the pages; 'save that sequence to GHL' by voice.
// v4.6.1: events on anyone's Personal calendar never count as calls in the weekly report.
// v4.6: recurring tasks — repeats (daily, weekdays, weekly, fortnightly, monthly) put on the right list each morning,
//       never doubled, skipped on days off, missed ones noted once; managed from Forge and by voice.
// v4.5: booking by voice — calls onto GHL calendars (confirmed first) and personal events straight into your calendar.
// v4.4.1: 'do 1/2/3' runs exactly that focus item (no guessing), and follow-up drafts know each person's pipeline stage
//         (only mention a proposal if they're at a proposal stage).
// v4.4: where to focus this week — Archie finds the weakest link against pace and picks 3 actions with real names;
//       'do 1' drafts the messages (archie_draft_followups) or starts the skill/task. In Monday's WhatsApp, talk and the pages.
// v4.3: goals you can change — by voice ('set my MRR goal to £30k by June') and from the pages (goals / set_goals).
// v4.2: 'how's this week looking?' in Talk to Archie (week report, owner only) and a week-so-far pace line in the owner's brief.
// v4.1: weekly report on the schedule — nightly save (23:30) and Monday 07:00 WhatsApp review of last week.
// v4.0.1: messages count shows its working (fetched / outbound / automated / to the team) so any gap is visible.
// v4.0: weekly report — report action: messages sent, calls booked/held/no-show, sales, new income, revenue and MRR vs goals,
//       pace to the goal, any week vs the week before; this week cached for an hour; finished weeks saved.
// v3.9: pipeline by voice — 'add Ross to follow up', 'move Jase to abandoned', 'mark Martin won' (won/lost/abandoned confirmed first).
// v3.8: Sara's routing — the Scraper assigns an owner to each task using the business's routing; failed payments become
//       tasks for the payments person each morning; the owner can ask what a team member has on.
// v3.7.1: rebook messages must come from archie_rebook_drafts (never written freehand), and any 'Send it?' only after they're saved as drafts.
// v3.7: rebook flow — day off clashes → 'draft rebook messages?' → archie_rebook_drafts → 'send them?' → archie_send_draft each.
// v3.6: the orb on Home is the same chat — talk_page (reply on screen) and talk_history (today's thread, WhatsApp and page together).
// v3.5: voice-first brief — the command lines at the bottom are replaced by one "just reply or send a voice note" line.
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
      const tenant_id = String(p.tenant_id ?? "").trim();
      const master = secretHeader === SECRET;
      if (!master) {
        // A client's own workflow secret only works for that client, and never for the all-clients actions
        if (!tenant_id || ["dispatch", "checkup_all", "usage_all"].includes(action)) return j({ error: "unauthorized" }, 401);
        const { data: ws } = await supabase.from("tenant_config").select("workflow_secret").eq("tenant_id", tenant_id).maybeSingle();
        if (!ws?.workflow_secret || ws.workflow_secret !== secretHeader) return j({ error: "unauthorized" }, 401);
      }
      if (action === "dispatch") return j(await dispatch(p));
      if (!tenant_id) return j({ error: "tenant_id required" }, 400);
      if (action === "run_next") return j(await runNext(tenant_id, String(p.kind ?? "")));
      if (action === "run_finish") return j(await runFinish(tenant_id, p));
      if (action === "plan_context") return j(await planContext(tenant_id));
      if (action === "plan_save") return j(await planSave(tenant_id, p));
      if (action === "talk") { startInBackground(talk(tenant_id, p)); return j({ ok: true, started: true }); }
      if (action === "checkup") return j(await checkup(tenant_id));
      if (action === "checkup_all") {
        const { data: ts } = await supabase.from("tenants").select("id, business_name").eq("status", "active");
        const out: any[] = [];
        for (const t of ts ?? []) { const r: any = await checkup(t.id); out.push({ tenant_id: t.id, business: t.business_name, status: r.status, problems: r.problems }); }
        return j({ ok: true, tenants: out });
      }
      if (action === "usage") return j(await usage(tenant_id, String(p.month ?? "")));
      if (action === "usage_all") {
        if (!master) return j({ error: "unauthorized" }, 401);
        const { data: ts } = await supabase.from("tenants").select("id, business_name").eq("status", "active");
        const out: any[] = [];
        for (const t of ts ?? []) { const u: any = await usage(t.id, String(p.month ?? "")); out.push({ business: t.business_name, runs: u.runs, est_cost_gbp: u.est_cost_gbp }); }
        return j({ ok: true, month: String(p.month ?? "") || new Date().toISOString().slice(0, 7), tenants: out, total_gbp: Math.round(out.reduce((a, x) => a + (x.est_cost_gbp || 0), 0) * 100) / 100 });
      }
      if (action === "recurring_run") { const r = await recurringRun(tenant_id); return j({ ok: true, ...r }); }
      if (action === "health_run") { startInBackground(memberHealthRun(tenant_id)); return j({ ok: true, started: true }); }
      if (action === "report_nightly_run") { startInBackground(weeklyReport(tenant_id, { week: "this", refresh: "yes" })); return j({ ok: true, started: true }); }
      if (action === "report_weekly_run") { startInBackground(reportWeeklyRun(tenant_id)); return j({ ok: true, started: true }); }
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
    // Page login (only when switched on for this client): PIN → 12-hour session; 5 wrong tries → 15-minute lockout
    const { data: sec } = await supabase.from("tenant_config").select("page_pin_hash, page_pin_required, pin_fails, pin_locked_until").eq("tenant_id", tenant.id).maybeSingle();
    if (action === "pin_login") return j(await pinLogin(tenant.id, sec, String(p.pin ?? ""), String(p.who ?? "")));
    // The Archie toolbox (MCP) calls "run" and "runs" server-to-server with the token — those don't need a page login
    if (sec?.page_pin_required && !["run", "runs"].includes(action)) {
      const sess = String(p.session ?? "");
      const { data: ok } = sess ? await supabase.from("page_sessions").select("token").eq("tenant_id", tenant.id).eq("token", sess).gt("expires_at", new Date().toISOString()).maybeSingle() : { data: null };
      if (!ok) return j({ ok: false, error: "login_required" }, 401);
    }
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
      case "report": return j(await weeklyReport(c.tid, p));
      case "goals": return j(await getGoals(c.tid));
      case "checkup": return j(await checkup(c.tid));
      case "settings_get": return j(await settingsGet(c.tid));
      case "usage": return j(await usage(c.tid, String(p.month ?? "")));
      case "pin_set": return j(await pinSet(c.tid, p));
      case "logout": { if (p.session) await supabase.from("page_sessions").delete().eq("tenant_id", c.tid).eq("token", String(p.session)); return j({ ok: true }); }
      case "settings_save": return j(await settingsSave(c.tid, p));
      case "team_save": return j(await teamSave(c.tid, p));
      case "team_archive": return j(await teamArchive(c.tid, p));
      case "pick_contacts": return j(await pickContacts(c.tid, String(p.query ?? "")));
      case "pick_users": return j(await pickUsers(c.tid));
      case "pick_calendars": return j(await pickCalendars(c.tid));
      case "pick_stages": return j(await pickStages(c.tid));
      case "council": return j(await councilRun(c.tid, p));
      case "call_prep": return j(await callPrep(c.tid, p));
      case "ask_data": return j(await askData(c.tid, String(p.question ?? "")));
      case "dump_anything": return j(await dumpAnything(c.tid, { handle: c.owner?.handle ?? "owner", gets_financials: true }, String(p.text ?? "")));
      case "dumps": { const { data } = await supabase.from("dumps").select("id, handle, clean, summary, created_at").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(20); return j({ ok: true, dumps: data ?? [] }); }
      case "member_health": return j(await memberHealthList(c.tid, String(p.status ?? "")));
      case "groups_suggest": return j(await groupsSuggest(c.tid));
      case "groups_link": return j(await groupsLink(c.tid, p));
      case "groups_list": return j(await groupsList(c.tid));
      case "memory_list": return j(await memoryList(c.tid, String(p.kind ?? "")));
      case "memory_save": return j(await memoryAction(c.tid, { handle: c.owner?.handle ?? "owner", gets_financials: true }, { ...p, action: "save" }));
      case "memory_archive": return j(await memoryAction(c.tid, { handle: c.owner?.handle ?? "owner", gets_financials: true }, { ...p, action: "archive" }));
      case "save_sequence": return j(await saveSequence(c.tid, p));
      case "recurring_list": return j(await recurringList(c.tid, p.handle ? c.resolve(p.handle) : ""));
      case "recurring_add": return j(await recurringAdd(c.tid, { ...p, handle: c.resolve(p.handle) }));
      case "recurring_update": return j(await recurringUpdate(c.tid, p));
      case "recurring_delete": { await supabase.from("recurring_tasks").delete().eq("tenant_id", c.tid).eq("id", String(p.id ?? "")); return j({ ok: true }); }
      case "focus": return j(await getFocus(c.tid, String(p.refresh ?? "") === "yes"));
      case "set_goals": return j(await setGoals(c.tid, p));
      case "talk_page": {
        const text = String(p.text ?? "").trim();
        if (!text) return j({ ok: false, error: "nothing to say" });
        let answer = "";
        await talk(c.tid, { text }, { handle: c.resolve(p.handle), onReply: (m: string) => { answer = m; } });
        return j({ ok: !!answer, reply: answer || "Sorry — I couldn't process that just now." });
      }
      case "talk_history": {
        const h = c.resolve(p.handle);
        const since = new Date(Date.now() - 24 * 3600000).toISOString();
        const { data } = await supabase.from("talk_messages").select("role, text, channel, created_at").eq("tenant_id", c.tid).eq("handle", h).gte("created_at", since).order("created_at", { ascending: true }).limit(60);
        return j({ ok: true, messages: data ?? [] });
      }
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
  return data ? { ok: true, run: showRun(data) } : { ok: false, error: "run not found" };
}

// Pages never show the machine-readable EMAILS_JSON block — they get has_emails instead
function showRun(r: any) {
  if (!r || typeof r.output !== "string") return r;
  const i = r.output.indexOf("EMAILS_JSON:");
  return i < 0 ? r : { ...r, output: r.output.slice(0, i).trim(), has_emails: true };
}

async function runs(c: any, p: any) {
  const limit = Math.max(1, Math.min(50, Number(p.limit) || 20));
  let q = supabase.from("screen_runs").select("id, kind, skill, input, status, output, error, saved, created_at, finished_at, contact_name, call_title").eq("tenant_id", c.tid);
  if (RUN_KINDS.includes(String(p.kind ?? ""))) q = q.eq("kind", p.kind);
  if (p.kinds && Array.isArray(p.kinds)) q = q.in("kind", p.kinds.filter((k: string) => RUN_KINDS.includes(k)));
  const { data } = await q.order("created_at", { ascending: false }).limit(limit);
  return { ok: true, runs: (data ?? []).map(showRun) };
}

async function save(c: any, p: any) {
  const saved = p.saved === false ? false : true;
  const { data } = await supabase.from("screen_runs").update({ saved }).eq("tenant_id", c.tid).eq("id", String(p.run_id ?? "")).select("id").maybeSingle();
  return data ? { ok: true, saved } : { ok: false, error: "run not found" };
}

// ===================== content (v1.3) =====================
async function businessContext(tid: string) {
  const [{ data: t }, { data: cfg }, { data: owner }] = await Promise.all([
    supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle(),
    supabase.from("tenant_config").select("brand_context, icp, core_offer, brand_voice, customer_word, sale_word, content_pillars, booking_link, booking_link_lead, booking_link_client").eq("tenant_id", tid).maybeSingle(),
    supabase.from("team_members").select("name").eq("tenant_id", tid).eq("gets_financials", true).limit(1).maybeSingle(),
  ]);
  const ownerFirst = String(owner?.name ?? "").trim().split(/\s+/)[0] || "";
  const leadLink = cfg?.booking_link_lead || cfg?.booking_link || "";
  const clientLink = cfg?.booking_link_client || cfg?.booking_link || "";
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
    ownerFirst ? `Owner's first name (for sign-offs): ${ownerFirst}` : "",
    leadLink ? `Booking link for leads / new people: ${leadLink}` : "",
    clientLink ? `Booking link for existing clients: ${clientLink}` : "",
    await memoryText(tid, ["definition", "voice", "worked", "service", "fact"], 1800),
  ].filter(Boolean).join("\n");
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
  const stageOrder = new Map((pipe.stages ?? []).map((s: any, i: number) => [s.id, i]));
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
    // "Real" = touched in the last 14 days and past the first stage (my read, not a GHL field)
    const real = days < 14 && Number(stageOrder.get(o.pipelineStageId) ?? 0) > 0;
    return { id: o.id, name: String(o.contact?.name ?? o.name ?? "Unknown"), contact_id: o.contactId ?? o.contact?.id ?? null, stage: String(stageName.get(o.pipelineStageId) ?? ""), value: Number(o.monetaryValue ?? 0) || 0, days, urgent, needs_action: needsAction, real };
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

    let res = await agentExecute(token, agentId, body, `skill-${tid}-${runId}`);
    if (res.status === 429 || res.status >= 500) {
      const wait = Math.min(20, Number(res.retryAfter) || 8) * 1000;
      await new Promise((ok) => setTimeout(ok, wait));
      res = await agentExecute(token, agentId, body, `skill-${tid}-${runId}-retry`);
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

// Rules every agent follows — added to every message Archie sends to an agent (backend-owned, clients can't edit them out)
const ARCHIE_RULES = [
  "ARCHIE RULES — these override everything else in these instructions",
  "",
  "1. NEVER MAKE ANYTHING UP",
  "Only use numbers, names, dates and facts that appear in the context you were given. If something you need is missing, write [NEED: what's missing] or say plainly \"I don't have that\" and name what would answer it (e.g. \"I can't see attendance — that would need your booking system connected\"). Never estimate, round up, or fill a gap with a typical figure. A wrong number is worse than no number.",
  "",
  "2. FLAG BAD DATA",
  "If the data looks wrong — duplicates, missing days or weeks, totals that don't add up, a contact with no name, a payment with no amount — say so in one short line and name the record. Do not quietly drop it, average around it or work past it.",
  "",
  "3. LABEL THE SOURCE",
  "Make it clear what comes from their data and what is your judgement. Facts: state them with where they came from (\"Stripe shows 3 failed payments this week\"). Judgement: say it's your view (\"My read: Sarah is at risk\"). Never present an opinion as a fact.",
  "",
  "4. ARCHIVE, NEVER DELETE",
  "Never recommend deleting a contact, lead, member, task or document. Anything finished, lost or no longer used gets archived or marked with a reason (e.g. \"lost – price\", \"retired – replaced by new SOP\"). Old records are future reactivation and learning.",
  "",
  "5. ANSWER FIRST, PLAIN ENGLISH",
  "Lead with the answer or the action, then the reason, then any detail. Write like a sharp business friend texting: short sentences, no jargon, no filler, no motivational fluff. No markdown — no asterisks, no hashes, no bold. Use line breaks and numbers only.",
  "",
  "If the task below asks for an exact output format (markers, labels, JSON, sections), keep that format exactly — these rules govern the words inside it.",
].join("\n");
const ARCHIE_RULES_SHORT = "ARCHIE RULES (override everything): 1) Never make anything up — only facts in the context; missing → [NEED: what's missing]; no estimates. 2) Flag bad data in one line, naming the record. 3) Label the source: their data vs \"My read:\". 4) Archive, never delete — mark with a reason. 5) Answer first, plain English, short sentences, no markdown (no asterisks, hashes or bold). Keep any exact output format the task asks for.";
function withRules(body: Record<string, unknown>) {
  const m = body?.message;
  if (typeof m !== "string" || m.includes("ARCHIE RULES")) return body;
  // Full rules when there's room; the short version when the message is already long (never cut the task or its data)
  const full = `${ARCHIE_RULES}\n\n${m}`;
  if (full.length <= 9990) return { ...body, message: full };
  const short = `${ARCHIE_RULES_SHORT}\n\n${m}`;
  return { ...body, message: short.length <= 9990 ? short : m };
}

async function agentExecute(token: string, agentId: string, body: Record<string, unknown>, idem: string) {
  body = withRules(body);
  const started = Date.now();
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 140000);
  let out: any;
  try {
    const r = await fetch(`${BASE}/agent-studio/managed-agents/${agentId}/execute`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Authorization": `Bearer ${token}`, "Version": "v3", "Accept": "application/json", "Content-Type": "application/json", "Idempotency-Key": idem },
      body: JSON.stringify(body),
    });
    const text = await r.text(); let js: any = null; try { js = JSON.parse(text); } catch { js = null; }
    out = { ok: r.ok, status: r.status, json: js, text, retryAfter: r.headers.get("retry-after") };
  } catch (e) { out = { ok: false, status: 0, json: null, text: String(e), retryAfter: null }; }
  finally { clearTimeout(tm); }
  // Usage log — every agent run, for cost tracking (tenant and job come from the idempotency key)
  try {
    const tid = String(idem).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] ?? null;
    const job = String(idem).split("-")[0] || "agent";
    await supabase.from("agent_usage").insert({
      tenant_id: tid, job, ok: !!out.ok && out.json?.success !== false, status: out.status, ms: Date.now() - started,
      chars_in: String((body as any)?.message ?? "").length, chars_out: String(out.json?.finalText ?? "").length,
    });
  } catch { /* never block a run on logging */ }
  return out;
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
      supabase.from("tenant_config").select("ghl_location_id, ghl_token, timezone, brief_channel, csm_handle").eq("tenant_id", tid).single(),
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
    // Week so far (cached for an hour) → one pace line in the owner's brief
    let weekLine = "";
    try {
      const wr: any = await weeklyReport(tid, { week: "this" });
      const n = wr.numbers ?? {};
      weekLine = wr.is_current && wr.day_of_week > 1
        ? `Week so far: ${n.calls_booked ?? 0} booked · ${n.calls_held ?? 0} held · ${n.sales_count ?? 0} sale${(n.sales_count ?? 0) === 1 ? "" : "s"} — ${wr.pace?.on_pace ? "on pace" : "behind pace"} (need ~${wr.pace?.calls_booked_per_week ?? "?"} booked a week)`
        : `This week's pace: ~${wr.pace?.calls_booked_per_week ?? "?"} calls booked, ${wr.pace?.sales_per_week ?? "?"} sales, £${wr.pace?.new_mrr_per_week ?? "?"} new MRR`;
    } catch { weekLine = ""; }
    // Speed-to-lead, who's waiting now, and an honest pipeline count → one Focus that matters most
    let speedLine = "", waitingLine = "", pipeLine = "";
    try {
      const wr: any = await weeklyReport(tid, { week: "this" });
      const n = wr.numbers ?? {};
      if (n.enquiries) speedLine = `Speed to lead this week (from your messages): ${n.enquiries} new enquir${n.enquiries === 1 ? "y" : "ies"}, ${n.reply_slow ?? 0} waited 4+ hours${n.reply_median_min !== null && n.reply_median_min !== undefined ? `, typical first reply ${n.reply_median_min < 60 ? `${n.reply_median_min} min` : `${Math.round(n.reply_median_min / 60)}h`}` : ""}.`;
      const waiting: any[] = (n.awaiting ?? []).slice(0, 3);
      if (waiting.length) {
        const names: string[] = [];
        for (const w of waiting) {
          const c = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/contacts/${w.contactId}`, "GET", undefined, "2021-07-28");
          const nm = [c.json?.contact?.firstName, c.json?.contact?.lastName].filter(Boolean).join(" ") || "a contact";
          names.push(`${nm} (${w.hours}h)`);
        }
        waitingLine = `Waiting on a reply right now: ${names.join(", ")}.`;
      }
      const pl: any = await pipelineList({ tid, ghlToken: cfg?.ghl_token || FALLBACK_TOKEN });
      const its: any[] = pl?.items ?? [];
      if (its.length) pipeLine = `Pipeline check (my read): ${its.length} open, ${its.filter((x) => x.real).length} real — touched in the last 14 days and past first contact.`;
    } catch { /* lines are a bonus */ }

    // Client health → one line for the owner
    let healthLine = "";
    try {
      const { data: mh } = await supabase.from("member_health").select("name, status, reasons").eq("tenant_id", tid).in("status", ["red", "yellow"]).order("status", { ascending: true });
      const reds = (mh ?? []).filter((m: any) => m.status === "red"), yellows = (mh ?? []).filter((m: any) => m.status === "yellow");
      if (reds.length || yellows.length) healthLine = `Client health (Archie's scoring): ${reds.length} red, ${yellows.length} yellow.${reds.length ? ` Red: ${reds.slice(0, 3).map((m: any) => `${m.name} (${(m.reasons ?? [])[0] ?? ""})`).join("; ")}.` : ""}`;
    } catch { /* bonus */ }

    // Task upgrades: slips, stalled, waiting-on, blockers — per person
    let taskLinesOwner = "", taskLinesTeam = "";
    try {
      const { data: open } = await supabase.from("tasks").select("title, owner, status, move_count, created_at, waiting_for, waiting_since")
        .eq("tenant_id", tid).in("status", ["open", "doing", "waiting"]).limit(400);
      const { data: tm } = await supabase.from("team_members").select("handle, name, gets_financials").eq("tenant_id", tid);
      const ownerH = String((tm ?? []).find((m: any) => m.gets_financials)?.handle ?? "");
      const ownerNames = new Set([ownerH, ...String((tm ?? []).find((m: any) => m.gets_financials)?.name ?? "").toLowerCase().split(/\s+/)].filter(Boolean).map((x) => x.toLowerCase()));
      const today0 = Date.parse(today);
      const daysSince = (d: unknown) => Math.max(0, Math.floor((today0 - Date.parse(String(d ?? "").slice(0, 10))) / 86400000));
      const linesFor = (h: string) => {
        const mine = (open ?? []).filter((t: any) => String(t.owner ?? ownerH) === h);
        const out: string[] = [];
        const slips = mine.filter((t: any) => Number(t.move_count) >= 3 && t.status !== "waiting").sort((a: any, b: any) => b.move_count - a.move_count).slice(0, 2);
        for (const t of slips) out.push(`Moved ${t.move_count} times: "${t.title}" — do it today, give it to someone, or drop it?`);
        const stalled = mine.filter((t: any) => t.status !== "waiting" && daysSince(t.created_at) >= 14);
        if (stalled.length >= 3) out.push(`${stalled.length} tasks have been open 14+ days — worth a 10-minute clear-out.`);
        const waiting = mine.filter((t: any) => t.status === "waiting").map((t: any) => ({ who: String(t.waiting_for ?? "them"), what: t.title, d: daysSince(t.waiting_since ?? t.created_at) })).filter((w: any) => w.d >= 3).sort((a: any, b: any) => b.d - a.d).slice(0, 3);
        if (waiting.length) out.push(`Waiting on: ${waiting.map((w: any) => `${w.who} (${w.d} days — ${String(w.what).slice(0, 40)})`).join("; ")}. Say "chase ${waiting[0].who.split(" ")[0]}" for a drafted chase.`);
        // Someone on the team waiting on this person
        const blocked = (open ?? []).filter((t: any) => t.status === "waiting" && String(t.owner ?? "") !== h && (h === ownerH ? ownerNames.has(String(t.waiting_for ?? "").toLowerCase().split(/\s+/)[0]) : String(t.waiting_for ?? "").toLowerCase().startsWith(h)));
        if (blocked.length) out.push(`You're the blocker: ${blocked.slice(0, 3).map((t: any) => `${t.owner} is waiting on you for "${String(t.title).slice(0, 40)}" (${daysSince(t.waiting_since ?? t.created_at)} days)`).join("; ")}.`);
        return out.join(" ");
      };
      taskLinesOwner = linesFor(ownerH);
      const teamH = (tm ?? []).filter((m: any) => !m.gets_financials).map((m: any) => m.handle);
      taskLinesTeam = teamH.map((h: string) => { const l = linesFor(h); return l ? `${h}: ${l}` : ""; }).filter(Boolean).join(" ");
    } catch { /* bonus */ }

    // CSM lines for the client success person's brief
    let csmLines = "";
    try {
      const csm = String(cfg?.csm_handle ?? "");
      if (csm) {
        const { data: mh } = await supabase.from("member_health").select("name, status, reasons").eq("tenant_id", tid).in("status", ["red", "yellow"]);
        const reds = (mh ?? []).filter((m: any) => m.status === "red"), yellows = (mh ?? []).filter((m: any) => m.status === "yellow");
        const waiting = (mh ?? []).filter((m: any) => (m.reasons ?? []).some((r: string) => /for our reply/.test(r)));
        const parts: string[] = [];
        if (reds.length || yellows.length) parts.push(`Client health: ${reds.length} red, ${yellows.length} yellow.${reds.length ? ` Red: ${reds.slice(0, 4).map((m: any) => `${m.name} — ${(m.reasons ?? [])[0]}`).join("; ")}.` : ""}${yellows.length ? ` Yellow: ${yellows.slice(0, 4).map((m: any) => `${m.name} — ${(m.reasons ?? [])[0]}`).join("; ")}.` : ""}`);
        if (waiting.length) parts.push(`Clients waiting on a reply: ${waiting.slice(0, 5).map((m: any) => `${m.name} (${((m.reasons ?? []).find((r: string) => /for our reply/.test(r)) ?? "").replace(/ for our reply.*$/, "")})`).join(", ")}.`);
        if (reds.length || yellows.length) parts.push(`Say "Archie, check in with the reds" (or a name) and I'll draft the messages for you to send.`);
        if (parts.length) csmLines = `${csm}: ${parts.join(" ")}`;
      }
    } catch { /* bonus */ }

    // Findings that keep coming back → one "Nth week in a row" line
    const { data: reps } = await supabase.from("business_memory").select("value, weeks_seen").eq("tenant_id", tid).eq("kind", "finding").eq("status", "active").gte("weeks_seen", 2).order("weeks_seen", { ascending: false }).limit(1);
    const repeatLine = reps?.[0] ? `${["", "", "Second", "Third", "Fourth", "Fifth"][Math.min(5, Number(reps[0].weeks_seen))] || `${reps[0].weeks_seen}th`} week running — ${String(reps[0].value).slice(0, 160)}` : "";
    const message = [
      "Execute your instructions now. Use ONLY the data below. It is today's data. Ignore anything from earlier runs or conversations.",
      `The header date must be exactly: ${expected}.`,
      "Capacity comes from the OWNER CAPACITY line. The Today list is exactly the LINEUP lines, with their numbers. Never add a task that is not listed there. At risk comes only from the AT_RISK line.",
      "Voice-first footer (overrides your instructions): do NOT include the command lines 'add P1 · wait P1 · drop P1', 'Reply SEND 1 · SKIP 1' or 'done 1 · move 2 fri · 👍/👎'. Keep the numbers on the lists (1, 2… and P1, P2…) so people can refer to them. End the OWNER brief with exactly one line: 🎙️ Just reply or send a voice note — e.g. \"done the first one\", \"send Jase's message\", \"give P2 to Sara\". End the TEAM brief with exactly one line: 🎙️ Just reply starting with \"Archie\" — e.g. \"Archie, done the first one\".",
      weekLine ? `Weekly pace (OWNER brief only, never the TEAM brief): add this as one line under Money, exactly: 📊 ${weekLine}` : "",
      [speedLine, waitingLine, pipeLine, healthLine].filter(Boolean).length ? `OWNER brief only — add these under Money/Pipeline as short lines, exactly as facts are given: ${[speedLine, waitingLine, pipeLine, healthLine].filter(Boolean).join(" ")}` : "",
      "FOCUS LINE (owner brief): one action, one name, the highest value first — someone waiting on a reply right now beats a proposal waiting, which beats the top must task. E.g. \"Reply to Steph — she's waited 6 hours.\" Never a generic focus.",
      taskLinesOwner ? `Task check (OWNER brief, short lines near the task list, exactly these facts): ${taskLinesOwner}` : "",
      taskLinesTeam ? `Task check (TEAM brief — each line only in that person's brief): ${taskLinesTeam}` : "",
      csmLines ? `Client success (TEAM brief for the person named, near the top — they own client check-ins; no money totals): ${csmLines}` : "",
      repeatLine ? `Repeating issue (OWNER brief only): mention this in one short line near the Focus, e.g. "Third week in a row: …": ${repeatLine}` : "",
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
  let rules = job === "pipeline" ? PIPELINE_RULES : SCRAPER_RULES;
  if (job === "scraper") {
    const [{ data: tm }, { data: rc }] = await Promise.all([
      supabase.from("team_members").select("handle, name, gets_financials").eq("tenant_id", tid),
      supabase.from("tenant_config").select("routing_text").eq("tenant_id", tid).maybeSingle(),
    ]);
    const ownerH = (tm ?? []).find((m: any) => m.gets_financials)?.handle ?? "owner";
    const people = (tm ?? []).map((m: any) => `${m.handle}${m.gets_financials ? " (owner)" : ""}`).join(", ");
    rules += `\n\nWHO DOES WHAT (set "owner" on every task):\nTeam: ${people}.\n${String(rc?.routing_text ?? "").trim() || `Everything goes to ${ownerH}.`}\nIf unsure, use ${ownerH}.`;
  }
  const head = job === "pipeline"
    ? `Execute your instructions now. Return only the output format. Customer word: ${cw} Sale word: ${sw}\n\n${rules}\n\nPIPELINE CONTEXT:\n`
    : `Execute your instructions now. Return only the output format. Customer word: ${cw}\n\n${rules}\n\nSCRAPER CONTEXT:\n`;
  // Keep the job small enough to finish inside GHL's time limit (long contexts → 524 timeouts)
  const build = (limit: number) => {
    const room = Math.min(limit, 9900) - head.length;
    return head + (ctx.length > room ? ctx.slice(0, room - 60) + "\n[trimmed — more activity than fits]" : ctx);
  };
  const message = build(job === "scraper" ? 7500 : 9900);

  let res = await agentExecute(token, agentId, { locationId: loc, message }, `${job}-${tid}-${Date.now()}`);
  if (res.status === 429 || res.status >= 500) {
    const timedOut = res.status === 524 || res.status === 504 || res.status === 0;
    await new Promise((ok) => setTimeout(ok, Math.min(20, Number(res.retryAfter) || 8) * 1000));
    // A timeout means too much to get through — retry with about half the context
    const retryMsg = timedOut ? build(job === "scraper" ? 5000 : 6500) : message;
    res = await agentExecute(token, agentId, { locationId: loc, message: retryMsg }, `${job}-${tid}-${Date.now()}`);
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
      if (stripe.ok) notes.push(`payment tasks ${await paymentTasks(tid, String(stripe.json?.summary ?? ""))}`);
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
      { job: "recurring", due: dueNow(now.minutes, hhmm(cfg.sched_recurring, "04:00")), key: now.date, action: "recurring_run" },
      { job: "health", due: dueNow(now.minutes, hhmm(cfg.sched_health, "03:30")), key: now.date, action: "health_run" },
      { job: "report_nightly", due: dueNow(now.minutes, hhmm(cfg.sched_report_nightly, "23:30")), key: now.date, action: "report_nightly_run" },
      { job: "report_weekly", due: now.weekday === Number(cfg.sched_report_day ?? 1) && dueNow(now.minutes, hhmm(cfg.sched_report, "07:00")), key: now.date, action: "report_weekly_run" },
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
    supabase.from("team_members").select("handle, gets_financials, ghl_contact_id").eq("tenant_id", tid).neq("active", false),
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
  '- "TASKS_JSON: " followed by a JSON array of {"title","detail","tier","kind","effort_minutes","due_date","source_ref","contact_id","owner"} — tier is must, high or bonus; owner is the handle of who should do it (see WHO DOES WHAT)',
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
  "You are Archie, a member of this business's team, on WhatsApp. Short, plain UK English, like a sharp colleague texting. No markdown. Under ~8 lines unless returning written content.",
  "Never call tools yourself. List what Archie should do in ACTIONS_JSON — the backend runs it and gives you the results.",
  "Output exactly:",
  "REPLY: <what to say now — a short holding line like 'On it.' if you listed actions>",
  'ACTIONS_JSON: [{"tool":"archie_add_task","args":{"title":"…","tier":"bonus","effort_minutes":15,"due_date":"YYYY-MM-DD"}}]',
  "Use ACTIONS_JSON: [] when nothing needs doing.",
  "TOOLS (tool → when):",
  "- archie_add_task {title, tier must|high|bonus, effort_minutes, due_date, handle} · archie_complete_task · archie_move_task · archie_today {handle} — tasks. Title is just the job. 'today' = today's date in the CONTEXT. Just do it.",
  "- archie_capacity · archie_quiet · archie_day_off {date, end_date, from, to} · archie_back_on — just do it. If a day off clashes with booked calls, ask 'Draft messages to rebook them?' → yes → archie_rebook_drafts (same dates) → show drafts → 'Send them?' → archie_send_draft for each.",
  "- archie_drafts · archie_send_draft {rank|name} (owner saying 'send' IS the yes) · archie_skip_draft. archie_proposals · archie_proposal {rank|title, action add|give|wait|drop, to_handle, waiting_for}.",
  "- archie_week {week this|last} — 'how's this week looking?', 'am I on pace?', 'how are trials converting?'. archie_set_goals {mrr_goal, revenue_goal, goal_date, avg_sale_value, show_rate, close_rate} — just do it, read back the new pace. archie_numbers — money (never guess).",
  "- Focus: 'what should I focus on?' → the FOCUS list in the CONTEXT. 'do 1' → that item: draft → archie_draft_followups {names, purpose}; skill → archie_run_skill; task → archie_add_task.",
  "- archie_run_skill {skill, input} — any writing (posts, reels, carousels, stories, proposals, objection replies, SOPs). Email sequences: skill email-sequence, input starts 'Type: Nurture.' (or Launch, Re-engagement, Onboarding, Win-back); show the emails, ask 'Save them to GHL as templates?' → archie_save_sequence.",
  "- archie_book_call {name, calendar, date, time} — confirm first ('Book Martin, diagnostic call, Thu 1 Oct 14:00? Yes?'). No time → archie_free_slots {calendar, date}, offer 3. archie_calendars. archie_personal_event {title, date, from, to} — personal plans, just do it. archie_calls — calls on a day.",
  "- archie_move_deal {name, stage | status won|lost|abandoned, reason} — stage moves just happen; won/lost/abandoned: ask 'Mark Jase as abandoned? Yes?' first.",
  "- archie_add_recurring {title, pattern daily|weekdays|weekly|fortnightly|monthly|monthly_last, days [\"mon\",…], month_day, tier, effort_minutes, handle} · archie_recurring · archie_pause_recurring {title, until | stop | resume}.",
  "- Chasing: 'chase Seve' / 'nudge Jacob about the logo' → archie_draft_followups {names:[who], purpose:'chase — we're waiting on <what>'} (the CONTEXT/brief says what we're waiting on), then 'Send it?'. A task moved 3+ times: offer do it today / give it to someone / drop it.",
  "- archie_member_health {status red|yellow|green|''} — 'who's at risk?'. Check-ins → archie_draft_followups {names, purpose:'check in with a client'}, then 'Send them?'.",
  "- archie_groups {action suggest | link (numbers / all / group+client) | list} — link client WhatsApp groups.",
  "- archie_set_trial {stage} — 'our trial stage is X'.",
  "- archie_memory {action save|list|archive, kind definition|voice|worked|service|fact, key, value} — 'remember…', 'a client means…', 'that doesn't sound like me…', 'forget the … one'. archie_remember also works for plain facts.",
  "- archie_checkup — 'is everything working?'; give the report as it is.",
  "- 'Show my last dump' → the LAST DUMP in the CONTEXT (give the clean note as it is). Dumps themselves are handled before you see them.",
  "- archie_data {question} — any question about their numbers or lists that isn't covered above: 'top 20 clients', 'who paid the most this year', 'how did last week compare to the month before', 'which clients joined in January', 'how many leads came from Instagram'. Pass their question as it is; give the answer as it is.",
  "- archie_call_prep {name, time} — 'I've got Sarah at 10', 'prep me for my 2pm', 'what do I need to know before the Martin call?'. Give the result as it is.",
  "- archie_council {question, answers, lens} — big decisions ('second opinion: should I raise prices to £75?', 'should I hire a coach?'). If it comes back with QUESTIONS, ask them and, when they answer, run archie_council again with the same question + answers. 'Ask Money more about that' → {lens:'Money', question: what they want to know}. Give the result as it is.",
  "RULES: Only send to customers what exists as a waiting draft — never freehand. New customer messages: draft in REPLY and ask 'Send it?'. Team members never get money figures and only see their own list. Unclear which item? Ask one short question with ACTIONS_JSON: []. Never invent tasks, names, numbers, dates or results.",
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

async function talk(tid: string, p: any, opts: { handle?: string; onReply?: (m: string) => void } = {}) {
  let contactId = String(p.contact_id ?? "").trim();
  const text = String(p.text ?? p.message ?? "").trim().slice(0, 4000);
  const log = async (status: string, summary: string, error: string | null = null) => {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "talk", trigger: "api", status, started_at: now, finished_at: now, summary, error });
  };
  try {
    if ((!contactId && !opts.handle) || !text) return log("failed", "", "contact_id (or handle) and text required");
    const [{ data: cfg }, { data: t }, { data: team }] = await Promise.all([
      supabase.from("tenant_config").select("ghl_location_id, ghl_token, timezone, brief_channel, csm_handle").eq("tenant_id", tid).single(),
      supabase.from("tenants").select("location_id, status, business_name").eq("id", tid).single(),
      supabase.from("team_members").select("handle, name, gets_financials, ghl_contact_id").eq("tenant_id", tid),
    ]);
    if (t?.status !== "active") return;
    const member = opts.handle
      ? (team ?? []).find((m: any) => m.handle === opts.handle)
      : (team ?? []).find((m: any) => m.ghl_contact_id === contactId);
    if (!member) return log("failed", "", `message from someone who isn't on the team (${contactId || opts.handle})`);
    if (!contactId) contactId = String(member.ghl_contact_id ?? "");
    const via = opts.onReply ? "page" : "whatsapp";
    await supabase.from("talk_messages").insert({ tenant_id: tid, handle: member.handle, role: "user", text: text.slice(0, 4000), channel: via });
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
    const { data: lastDump } = await supabase.from("dumps").select("clean, created_at").eq("tenant_id", tid).eq("handle", member.handle).order("created_at", { ascending: false }).limit(1).maybeSingle();
    let focusLine = "";
    if (member.gets_financials) {
      const { data: fc } = await supabase.from("weekly_focus").select("items").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const items: any[] = Array.isArray(fc?.items) ? fc!.items : [];
      if (items.length) focusLine = `FOCUS this week: ${items.map((x: any, i: number) => `${i + 1}. ${x.title} [${x.do}${x.names?.length ? ` · names: ${x.names.join(", ")}` : ""}${x.purpose ? ` · purpose: ${x.purpose}` : ""}${x.skill ? ` · skill: ${x.skill}` : ""}]`).join("; ")}.`;
    }
    const [{ data: list }, { data: proposals }, { data: memories }] = await Promise.all([
      supabase.from("tasks").select("title, tier, effort_minutes, today_rank").eq("tenant_id", tid).eq("owner", member.handle).eq("today", true).in("status", ["open", "doing"]).order("today_rank", { ascending: true }),
      member.gets_financials
        ? supabase.from("tasks").select("title, owner, proposal_rank").eq("tenant_id", tid).eq("status", "proposed").not("proposal_rank", "is", null).order("proposal_rank", { ascending: true }).limit(10)
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("memories").select("fact").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(20),
    ]);
    const bizMemory = await memoryText(tid, ["definition", "voice", "worked", "service", "fact", "baseline", "finding"], 2200);
    const ctx = [
      `Today: ${dayName}, ${timeNow} (${today}). Business: ${t?.business_name ?? ""}.`,
      `You're talking to ${member.name ?? member.handle} (handle: ${member.handle}${member.gets_financials ? ", the owner" : ", a team member — no money figures"}).`,
      `Their list today: ${(list ?? []).length ? (list ?? []).map((x: any) => `#${x.today_rank ?? "-"} ${x.title} [${x.tier}, ${x.effort_minutes ?? 30}m]`).join("; ") : "empty"}.`,
      (proposals ?? []).length ? `Proposals waiting (as numbered in the brief/inbox): ${(proposals ?? []).map((x: any) => `P${x.proposal_rank} ${x.title}`).join("; ")}. To add/wait/drop one, tell them to text e.g. "add P1" — or do it for them by adding the task with archie_add_task.` : "",
      focusLine,
      lastDump ? `LAST DUMP (${String(lastDump.created_at).slice(0, 10)}): ${String(lastDump.clean).slice(0, 1200)}` : "",
      drafts.length ? `Drafts waiting to send: ${drafts.map((d: any) => `${d.rank}. ${d.name} (${d.channel}): "${String(d.body ?? "").slice(0, 80)}…"`).join("; ")}.` : "",
      (memories ?? []).length ? `Things to remember: ${(memories ?? []).map((m: any) => m.fact).join(" | ")}` : "",
      bizMemory,
    ].filter(Boolean).join("\n");

    // One conversation per person per day
    const { data: sess } = await supabase.from("talk_sessions").select("session_id").eq("tenant_id", tid).eq("handle", member.handle).eq("day", today).maybeSingle();
    const { data: tok } = await supabase.from("tenants").select("access_token").eq("id", tid).single();
    const accessToken = String(tok?.access_token ?? "");
    const channel = String(cfg?.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
    const reply = async (msg: string) => {
      await supabase.from("talk_messages").insert({ tenant_id: tid, handle: member.handle, role: "archie", text: msg.slice(0, 8000), channel: via });
      if (opts.onReply) { opts.onReply(msg); return { ok: true, status: 200 }; }
      return ghl(token, "/conversations/messages", "POST", { type: channel, contactId, message: msg.slice(0, 3500) }, "2021-04-15");
    };

    let sessionId = sess?.session_id ?? "";
    const ask = async (message: string) => {
      const body: Record<string, unknown> = { locationId: loc, message: message.slice(0, 9900) };
      if (contactId) body.contactId = contactId;
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

    // "do 1" / "do 2" / "do 3" → run exactly that focus item, no guessing
    // Dump anything: "dump: …", "brain dump …", or a long voice note → note + tasks + contact notes + memory
    const isVoice = text.startsWith("(voice note)");
    const plainText = text.replace(/^\(voice note\)\s*/, "");
    const dumpMatch = plainText.match(/^\s*(?:brain\s*dump|dump(?:\s+this)?|note this|capture this)[:,\-\s]+([\s\S]+)/i);
    if (dumpMatch || (isVoice && plainText.split(/\s+/).length >= 90)) {
      const d: any = await dumpAnything(tid, member, dumpMatch ? dumpMatch[1] : plainText);
      const sentD = await reply(d.text);
      return log(sentD.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${d.text.slice(0, 80)} | actions: dump`, sentD.ok ? null : `reply not sent (${sentD.status})`);
    }

    const doN = text.trim().match(/^(?:do|start|go with|run)\s+(?:number\s+|no\.?\s*|#)?([1-3])\b/i);
    if (doN && member.gets_financials) {
      const { data: fc } = await supabase.from("weekly_focus").select("items").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const item: any = (Array.isArray(fc?.items) ? fc!.items : [])[Number(doN[1]) - 1];
      if (item) {
        let answer = "";
        if (item.do === "draft") {
          const d: any = await draftFollowups(tid, { names: item.names, purpose: item.purpose });
          answer = d.ok ? `${d.text.replace(/\nAsk if they want them sent.*$/s, "")}\n\nSend them? (or "bin 2", "send 1")` : d.text;
        } else if (item.do === "skill" && item.skill) {
          const r = await runArchieTool(accessToken, "archie_run_skill", { skill: item.skill, input: item.input || item.title });
          answer = r.text.split("EMAILS_JSON:")[0].trim();
          if (item.skill === "email-sequence" && r.ok) answer += `\n\nSave them to GHL as templates? (say "save that sequence to GHL")`;
        } else {
          const r = await runArchieTool(accessToken, "archie_add_task", { title: item.title, tier: "high", handle: member.handle });
          answer = r.ok ? `Added to your list: ${item.title}` : r.text;
        }
        const sent = await reply(answer);
        return log(sent.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${answer.slice(0, 80)} | actions: focus ${doN[1]} (${item.do})`, sent.ok ? null : `reply not sent (${sent.status})`);
      }
    }

    // Round 1: what do they want?
    // Their message goes first and the context is trimmed to fit — never the other way round
    const headPart = `THEIR MESSAGE\n${text.slice(0, 1500)}\n\n${TALK_RULES}\n\nCONTEXT\n`;
    const room = 9300 - headPart.length;
    const first = await ask(headPart + (ctx.length > room ? ctx.slice(0, Math.max(0, room - 40)) + "\n[context trimmed]" : ctx));
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
      const NO_HANDLE = ["archie_numbers", "archie_week", "archie_set_goals", "archie_draft_followups", "archie_remember", "archie_run_skill", "archie_drafts", "archie_send_draft", "archie_skip_draft", "archie_proposals", "archie_move_deal", "archie_calendars", "archie_free_slots", "archie_book_call", "archie_recurring", "archie_pause_recurring", "archie_save_sequence", "archie_checkup", "archie_memory", "archie_member_health", "archie_groups", "archie_set_trial", "archie_council", "archie_call_prep", "archie_data"];
      if (!args.handle && !NO_HANDLE.includes(act.tool)) args.handle = member.handle;
      if (!member.gets_financials && args.handle && String(args.handle).toLowerCase() !== String(member.handle).toLowerCase()) args.handle = member.handle;
      const OWNER_ONLY = ["archie_data", "archie_call_prep", "archie_council", "archie_set_trial", "archie_groups", "archie_numbers", "archie_week", "archie_set_goals", "archie_draft_followups", "archie_save_sequence", "archie_send_draft", "archie_skip_draft", "archie_drafts", "archie_proposals", "archie_proposal"];
      // The CSM can draft, send and bin their OWN client check-ins and chases
      const isCsm = !member.gets_financials && String(cfg?.csm_handle ?? "").toLowerCase() === String(member.handle).toLowerCase();
      if (isCsm && ["archie_draft_followups", "archie_send_draft", "archie_skip_draft", "archie_drafts"].includes(act.tool)) {
        const r2 = await csmDraftAction(tid, member.handle, act.tool, args, accessToken);
        ran.push(`${act.tool}${r2.ok ? "" : " (failed)"}`);
        results.push(`${act.tool} → ${r2.ok ? "OK" : "FAILED"}: ${r2.text.slice(0, 800)}`);
        continue;
      }
      if (!member.gets_financials && OWNER_ONLY.includes(act.tool)) { results.push(`${act.tool}: not available for team members`); continue; }
      const r = act.tool === "archie_data"
        ? await (async () => { const x: any = await askData(tid, String(args.question ?? text)); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_call_prep"
        ? await (async () => { const x: any = await callPrep(tid, args); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_council"
        ? await (async () => { const x: any = await councilRun(tid, args); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_set_trial"
        ? await (async () => { const x: any = await setTrialStage(tid, args); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_groups"
        ? await (async () => {
            const a2 = String(args.action ?? "suggest");
            const x: any = a2 === "list" ? await groupsList(tid) : a2 === "link" ? await groupsLink(tid, args) : await groupsSuggest(tid);
            return { ok: !!x.ok, text: x.text };
          })()
        : act.tool === "archie_member_health"
        ? await (async () => { const x: any = await memberHealthList(tid, String(args.status ?? "")); return { ok: true, text: x.text }; })()
        : act.tool === "archie_memory"
        ? await (async () => { const x: any = await memoryAction(tid, member, args); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_checkup"
        ? await (async () => { const x: any = await checkup(tid); return { ok: true, text: x.text }; })()
        : act.tool === "archie_save_sequence"
        ? await (async () => { const x: any = await saveSequence(tid, args); return { ok: !!x.ok, text: x.ok ? x.text : String(x.error) }; })()
        : act.tool === "archie_add_recurring"
        ? await (async () => { const x: any = await recurringAdd(tid, { ...args, handle: args.handle || member.handle }); return { ok: !!x.ok, text: x.ok ? x.text : String(x.error) }; })()
        : act.tool === "archie_recurring"
        ? await (async () => { const x: any = await recurringList(tid, member.gets_financials ? String(args.handle ?? "") : member.handle); return { ok: true, text: x.text }; })()
        : act.tool === "archie_pause_recurring"
        ? await (async () => { const x: any = await recurringPauseByTitle(tid, member.gets_financials ? String(args.handle ?? "") : member.handle, args); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_draft_followups"
        ? await (async () => { const d: any = await draftFollowups(tid, args); return { ok: !!d.ok, text: d.text }; })()
        : act.tool === "archie_set_goals"
        ? await (async () => { const g: any = await setGoals(tid, args); return { ok: !!g.ok, text: g.ok ? `Goals now: ${g.summary}` : String(g.error) }; })()
        : act.tool === "archie_week"
        ? await (async () => {
            try { const wr: any = await weeklyReport(tid, { week: String(args.week ?? "this") === "last" ? "last" : "this" }); return { ok: true, text: reportMessage(wr) }; }
            catch (e) { return { ok: false, text: String(e).slice(0, 120) }; }
          })()
        : await runArchieTool(accessToken, act.tool, args);
      ran.push(`${act.tool}${r.ok ? "" : " (failed)"}`);
      results.push(`${act.tool} ${JSON.stringify(args)} → ${r.ok ? "OK" : "FAILED"}: ${r.text.slice(0, act.tool === "archie_run_skill" ? 6000 : 800)}`);
    }

    // Some results go straight back as they are (no rewrite): the council and the checkup
    if (plan.actions.length === 1 && ["archie_council", "archie_checkup", "archie_call_prep", "archie_data"].includes(plan.actions[0].tool) && results[0]) {
      const direct = results[0].replace(/^archie_\w+ \{[^\n]*?\} → (OK|FAILED): /, "").trim();
      const sentD = await reply(direct);
      return log(sentD.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${direct.slice(0, 80)} | actions: ${ran.join(", ")}`, sentD.ok ? null : `reply not sent (${sentD.status})`);
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

// ===================== v3.8: failed payments → tasks for the payments person =====================
async function paymentTasks(tid: string, summary: string): Promise<string> {
  const { data: cfg } = await supabase.from("tenant_config").select("payments_owner, timezone").eq("tenant_id", tid).maybeSingle();
  const { data: tm } = await supabase.from("team_members").select("handle, gets_financials").eq("tenant_id", tid);
  const owner = String(cfg?.payments_owner || (tm ?? []).find((m: any) => m.gets_financials)?.handle || "");
  if (!owner) return "no owner";
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const line = (label: string) => (summary.split("\n").find((l) => l.trim().toUpperCase().startsWith(label)) ?? "").replace(/^[^:]*:/, "").trim();
  const pairs = (txt: string) => [...txt.matchAll(/([\w.+'-]+@[\w.-]+\.\w+)\s*£\s*([\d,]+(?:\.\d+)?)/g)].map((m) => ({ email: m[1], amount: m[2] }));
  const chase = /^none$/i.test(line("CHASE")) ? [] : pairs(line("CHASE"));
  const unmatched = /^none$/i.test(line("UNMATCHED")) ? [] : pairs(line("UNMATCHED"));
  const rows: any[] = [];
  for (const c of chase) rows.push({
    title: `Chase ${c.email} — failed payment £${c.amount}, send card update link`, tier: "must",
    detail: `Stripe shows a failed payment of £${c.amount} for ${c.email}. Send them the card update link, then check it's gone through.`,
    ref: `stripe-chase:${c.email}:${today}`,
  });
  for (const u of unmatched) rows.push({
    title: `Check who ${u.email} is — £${u.amount} payment not matched to a client`, tier: "high",
    detail: `A £${u.amount} payment from ${u.email} isn't linked to a client in Archie. Find the contact and link them.`,
    ref: `stripe-unmatched:${u.email}:${today.slice(0, 7)}`,
  });
  if (!rows.length) return "0";
  const { data: existing } = await supabase.from("tasks").select("source_ref").eq("tenant_id", tid).in("source_ref", rows.map((r) => r.ref));
  const seen = new Set((existing ?? []).map((e: any) => e.source_ref));
  const fresh = rows.filter((r) => !seen.has(r.ref)).map((r) => ({
    tenant_id: tid, title: r.title.slice(0, 200), detail: r.detail, tier: r.tier, kind: "shallow", effort_minutes: 15,
    status: "open", owner, source: "stripe", source_ref: r.ref, due_date: today, accepted_by: "routing", accepted_at: new Date().toISOString(),
  }));
  if (fresh.length) await supabase.from("tasks").insert(fresh);
  return String(fresh.length);
}

// ===================== v4.0: weekly report =====================
function isoAtTz(date: string, hhmm: string, tz: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const guess = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(guess);
  const g = (k: string) => Number(parts.find((x) => x.type === k)?.value);
  const shown = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
  return new Date(guess.getTime() - (shown - guess.getTime())).toISOString();
}
function mondayOf(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(date, -dow);
}

async function weeklyReport(tid: string, p: any) {
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const thisMonday = mondayOf(today);
  const which = String(p.week ?? "this");
  const weekStart = which === "last" ? addDays(thisMonday, -7) : /^\d{4}-\d{2}-\d{2}$/.test(which) ? mondayOf(which) : thisMonday;
  const current = weekStart === thisMonday;

  const cur = await weekNumbers(tid, cfg, weekStart, current, String(p.refresh ?? "") === "yes");
  const prev = await weekNumbers(tid, cfg, addDays(weekStart, -7), false, false);

  // Pace to the goal
  const mrrGoal = Number(cfg?.mrr_target ?? 0) || 0;
  const revGoal = Number(cfg?.revenue_target ?? 0) || 0;
  const goalDate = /^\d{4}-\d{2}-\d{2}$/.test(String(cfg?.goal_date ?? "")) ? String(cfg.goal_date) : addDays(today, 182);
  const weeksLeft = Math.max(1, Math.round((Date.parse(goalDate) - Date.parse(today)) / (7 * 86400000)));
  const avgSale = Number(cfg?.avg_sale_value ?? 0) || 297;
  const showRate = Number(cfg?.show_rate ?? 0) || 0.7;
  const closeRate = Number(cfg?.close_rate ?? 0) || 0.45;
  const mrrNow = cur.mrr ?? prev.mrr ?? 0;
  const newMrrNeeded = mrrGoal > mrrNow ? Math.ceil((mrrGoal - mrrNow) / weeksLeft) : 0;
  const salesNeeded = newMrrNeeded ? Math.max(1, Math.ceil(newMrrNeeded / avgSale)) : 0;
  const heldNeeded = salesNeeded ? Math.ceil(salesNeeded / closeRate) : 0;
  const bookedNeeded = heldNeeded ? Math.ceil(heldNeeded / showRate) : 0;
  const dayOfWeek = current ? Math.min(7, Math.round((Date.parse(today) - Date.parse(weekStart)) / 86400000) + 1) : 7;
  const expectedBooked = Math.round(bookedNeeded * dayOfWeek / 7);
  const onPace = !bookedNeeded || (cur.calls_booked ?? 0) >= expectedBooked;

  return {
    ok: true,
    week_start: weekStart, week_end: addDays(weekStart, 6), is_current: current, day_of_week: dayOfWeek,
    numbers: cur, previous: prev,
    goals: { mrr_goal: mrrGoal, revenue_goal: revGoal, goal_date: goalDate, avg_sale_value: avgSale, show_rate: showRate, close_rate: closeRate },
    pace: {
      weeks_left: weeksLeft, new_mrr_per_week: newMrrNeeded, sales_per_week: salesNeeded, calls_held_per_week: heldNeeded, calls_booked_per_week: bookedNeeded,
      expected_booked_so_far: expectedBooked, on_pace: onPace,
      line: bookedNeeded
        ? `Need ~${bookedNeeded} calls booked, ${heldNeeded} held, ${salesNeeded} sale${salesNeeded === 1 ? "" : "s"} and £${newMrrNeeded} new MRR a week. ${current ? `So far: ${cur.calls_booked ?? 0} booked, ${cur.sales_count ?? 0} sale${(cur.sales_count ?? 0) === 1 ? "" : "s"} — ${onPace ? "on pace" : "behind pace"}.` : ""}`
        : "MRR goal reached — set a new one.",
    },
    updated_at: cur.updated_at,
  };
}

// The seven numbers for one week (Mon–Sun, local time). This week is cached for an hour; finished weeks are saved for good.
async function weekNumbers(tid: string, cfg: any, weekStart: string, current: boolean, refresh: boolean): Promise<any> {
  const { data: cached } = await supabase.from("weekly_reports").select("data, is_final, updated_at").eq("tenant_id", tid).eq("week_start", weekStart).maybeSingle();
  if (cached?.is_final) return cached.data;
  if (cached && current && !refresh && Date.now() - Date.parse(cached.updated_at) < 60 * 60000) return cached.data;

  const tz = cfg?.timezone || "Europe/London";
  const loc = cfg?.ghl_location_id;
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  const weekEnd = addDays(weekStart, 7); // exclusive
  const fromIso = isoAtTz(weekStart, "00:00", tz), toIso = isoAtTz(weekEnd, "00:00", tz);
  const fromMs = Date.parse(fromIso), toMs = Date.parse(toIso), nowMs = Date.now();
  const inWeek = (v: unknown) => { const t = Date.parse(String(v ?? "")); return !isNaN(t) && t >= fromMs && t < toMs; };
  const out: any = { week_start: weekStart, errors: [] as string[] };

  const { data: team } = await supabase.from("team_members").select("handle, ghl_contact_id, ghl_user_id, gets_financials, personal_calendar_id").eq("tenant_id", tid);
  const teamContacts = new Set((team ?? []).map((m: any) => m.ghl_contact_id).filter(Boolean));

  // 1. Messages sent — outbound, by a person or Archie on their behalf (not workflows/campaigns), not to the team
  try {
    let cursor = "", sent = 0, pages = 0, fetched = 0, outbound = 0, automated = 0, toTeam = 0, total: number | null = null;
    const all: { c: string; d: string; t: number; s: string }[] = [];
    const startQ = fromIso.replace(/\.\d{3}Z$/, "Z"), endQ = toIso.replace(/\.\d{3}Z$/, "Z");
    do {
      const r = await ghl(token, `/conversations/messages/export?locationId=${loc}&startDate=${startQ}&endDate=${endQ}&limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`, "GET", undefined, "2021-04-15");
      if (!r.ok) { out.errors.push(`messages ${r.status}: ${r.text.slice(0, 80)}`); break; }
      const msgs: any[] = r.json?.messages ?? [];
      if (total === null && r.json?.total !== undefined) total = Number(r.json.total);
      fetched += msgs.length;
      for (const m of msgs) all.push({ c: String(m.contactId ?? ""), d: String(m.direction ?? ""), t: Date.parse(String(m.dateAdded ?? "")), s: String(m.source ?? m.meta?.source ?? "").toLowerCase() });
      for (const m of msgs) {
        if (String(m.direction) !== "outbound") continue;
        outbound++;
        const src = String(m.source ?? m.meta?.source ?? "").toLowerCase();
        if (["workflow", "campaign", "bulk_actions"].includes(src)) { automated++; continue; }
        if (teamContacts.has(m.contactId)) { toTeam++; continue; }
        sent++;
      }
      cursor = String(r.json?.nextCursor ?? "");
      pages++;
    } while (cursor && pages < 30);
    out.messages_sent = sent;
    out.messages_detail = { fetched, total, outbound, automated, to_team: toTeam, pages };
    Object.assign(out, speedToLead(all, teamContacts as Set<string>, nowMs));
  } catch (e) { out.errors.push(`messages: ${String(e).slice(0, 80)}`); }

  // 2. Calls — booked (created this week), held (happened this week, not no-show/cancelled), no-shows
  try {
    const owner = (team ?? []).find((m: any) => m.gets_financials);
    const userId = owner?.ghl_user_id || cfg?.ghl_user_id;
    if (!userId) out.errors.push("calls: no GHL user for the owner");
    else {
      const r = await ghl(token, `/calendars/events?locationId=${loc}&userId=${userId}&startTime=${fromMs - 60 * 86400000}&endTime=${toMs + 90 * 86400000}`, "GET", undefined, "2021-04-15");
      if (!r.ok) out.errors.push(`calls ${r.status}`);
      else {
        const personal = new Set((team ?? []).map((m: any) => m.personal_calendar_id).filter(Boolean));
        const ev: any[] = (r.json?.events ?? []).filter((e: any) => !e.isBlockSlot && e.type !== "block" && !String(e.title ?? "").startsWith("Off — set by Archie") && !personal.has(e.calendarId));
        const st = (e: any) => String(e.appointmentStatus ?? e.status ?? "").toLowerCase();
        out.calls_booked = ev.filter((e) => inWeek(e.dateAdded) && st(e) !== "cancelled").length;
        const thisWeek = ev.filter((e) => inWeek(e.startTime) && Date.parse(e.startTime) <= nowMs);
        out.calls_noshow = thisWeek.filter((e) => st(e) === "noshow" || st(e) === "no_show").length;
        out.noshow_names = thisWeek.filter((e) => st(e) === "noshow" || st(e) === "no_show").map((e) => String(e.title ?? "")).slice(0, 10);
        out.calls_held = thisWeek.filter((e) => !["cancelled", "noshow", "no_show", "invalid"].includes(st(e))).length;
        const scheduled = out.calls_held + out.calls_noshow;
        out.show_rate = scheduled ? Math.round((out.calls_held / scheduled) * 100) : null;
      }
    }
  } catch (e) { out.errors.push(`calls: ${String(e).slice(0, 80)}`); }

  // 3. Sales — deals marked won this week
  try {
    let page = 1, count = 0, value = 0; const names: string[] = [];
    while (page <= 5) {
      const r = await ghl(token, `/opportunities/search?location_id=${loc}&status=won&limit=100&page=${page}`, "GET", undefined, "2021-07-28");
      if (!r.ok) { out.errors.push(`sales ${r.status}`); break; }
      const opps: any[] = r.json?.opportunities ?? [];
      for (const o of opps) if (inWeek(o.lastStatusChangeAt ?? o.updatedAt)) { count++; value += Number(o.monetaryValue ?? 0) || 0; names.push(String(o.name ?? "")); }
      if (opps.length < 100) break;
      page++;
    }
    out.sales_count = count; out.sales_value = Math.round(value); out.sales_names = names.slice(0, 10);
  } catch (e) { out.errors.push(`sales: ${String(e).slice(0, 80)}`); }

  // 3b. Trials → members (only if a trial stage is set)
  if (cfg?.trial_stage) {
    try { Object.assign(out, await trialNumbers(tid, cfg, token, loc, fromMs, toMs)); }
    catch (e) { out.errors.push(`trials: ${String(e).slice(0, 80)}`); }
  }

  // 4. Money — from the daily Stripe snapshots
  try {
    const { data: rows } = await supabase.from("daily_metrics").select("metric_date, mrr, mrr_new, revenue_mtd, cash_24h")
      .eq("tenant_id", tid).gte("metric_date", addDays(weekStart, -1)).lt("metric_date", weekEnd).order("metric_date", { ascending: true });
    const days = (rows ?? []).filter((r: any) => r.metric_date >= weekStart);
    out.new_income = Math.round(days.reduce((a: number, r: any) => a + (Number(r.cash_24h) || 0), 0));
    const withMrr = (rows ?? []).filter((r: any) => r.mrr !== null && r.mrr !== undefined);
    const last = withMrr[withMrr.length - 1];
    const before = withMrr.find((r: any) => r.metric_date < weekStart) ?? withMrr[0];
    out.mrr = last ? Math.round(Number(last.mrr)) : null;
    out.revenue_mtd = last && last.revenue_mtd !== null ? Math.round(Number(last.revenue_mtd)) : null;
    // New MRR this week: growth in the month's new-MRR figure (resets on the 1st)
    if (last && before) {
      const sameMonth = String(last.metric_date).slice(0, 7) === String(before.metric_date).slice(0, 7);
      const a = Number(before.mrr_new ?? 0) || 0, b = Number(last.mrr_new ?? 0) || 0;
      out.new_mrr = Math.max(0, Math.round(sameMonth ? b - a : b));
      out.mrr_change = Math.round(Number(last.mrr) - Number(before.mrr));
    }
  } catch (e) { out.errors.push(`money: ${String(e).slice(0, 80)}`); }

  out.updated_at = new Date().toISOString();
  if (!out.errors.length) delete out.errors;
  const finished = Date.now() >= toMs;
  await supabase.from("weekly_reports").upsert({ tenant_id: tid, week_start: weekStart, data: out, is_final: finished && !out.errors, updated_at: out.updated_at }, { onConflict: "tenant_id,week_start" });
  return out;
}

// ===================== v4.1: Monday WhatsApp review =====================
function reportMessage(r: any): string {
  const n = r.numbers ?? {}, p = r.previous ?? {}, g = r.goals ?? {};
  const f = (v: unknown) => (v === null || v === undefined ? "—" : Number(v).toLocaleString("en-GB"));
  const money = (v: unknown) => (v === null || v === undefined ? "—" : `£${Math.round(Number(v)).toLocaleString("en-GB")}`);
  const arrow = (a: unknown, b: unknown) => {
    if (a === null || a === undefined || b === null || b === undefined) return "";
    const d = Number(a) - Number(b);
    return d > 0 ? ` (▲${d.toLocaleString("en-GB")})` : d < 0 ? ` (▼${Math.abs(d).toLocaleString("en-GB")})` : " (=)";
  };
  const range = `${new Date(`${r.week_start}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}–${new Date(`${r.week_end}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}`;
  const pct = (a: unknown, b: unknown) => (Number(b) > 0 && a !== null && a !== undefined ? ` (${Math.round((Number(a) / Number(b)) * 100)}%)` : "");
  // Biggest change vs the week before
  const cands = [
    ["calls booked", n.calls_booked, p.calls_booked], ["calls held", n.calls_held, p.calls_held],
    ["sales", n.sales_count, p.sales_count], ["messages sent", n.messages_sent, p.messages_sent], ["new income", n.new_income, p.new_income],
  ].filter(([, a, b]) => a !== null && a !== undefined && b !== null && b !== undefined) as [string, number, number][];
  let biggest = "";
  let best = 0;
  for (const [label, a, b] of cands) {
    const change = b ? (a - b) / b : a ? 1 : 0;
    if (Math.abs(change) > Math.abs(best)) { best = change; biggest = `${label} ${change > 0 ? "up" : "down"} ${Math.round(Math.abs(change) * 100)}% on the week before`; }
  }
  return [
    `📊 *Week in review* · ${range}`,
    "",
    `✉️ Messages sent: ${f(n.messages_sent)}${arrow(n.messages_sent, p.messages_sent)}`,
    `📅 Calls booked: ${f(n.calls_booked)}${arrow(n.calls_booked, p.calls_booked)} · held ${f(n.calls_held)}${n.show_rate !== null && n.show_rate !== undefined ? ` · show rate ${n.show_rate}%` : ""}`,
    n.enquiries !== undefined ? `⏱️ Enquiries: ${f(n.enquiries)} · ${f(n.reply_slow)} waited 4h+${n.reply_median_min !== null && n.reply_median_min !== undefined ? ` · typical reply ${n.reply_median_min < 60 ? `${n.reply_median_min} min` : `${Math.round(n.reply_median_min / 60)}h`}` : ""}` : "",
    n.trials_started !== undefined ? `🧪 Trials started: ${f(n.trials_started)}${arrow(n.trials_started, p.trials_started)}${n.cohort_trials ? ` · of ${n.cohort_trials} trials from 2–5 weeks ago: ${n.cohort_showed} showed, ${n.cohort_joined} joined (${Math.round((n.cohort_joined / n.cohort_trials) * 100)}%)` : ""}` : "",
    `🤝 Sales: ${f(n.sales_count)}${arrow(n.sales_count, p.sales_count)} · ${money(n.sales_value)}`,
    `💰 New income: ${money(n.new_income)}${arrow(n.new_income, p.new_income)}`,
    `📈 Revenue this month: ${money(n.revenue_mtd)}${g.revenue_goal ? ` of ${money(g.revenue_goal)}${pct(n.revenue_mtd, g.revenue_goal)}` : ""}`,
    `🔁 MRR: ${money(n.mrr)}${g.mrr_goal ? ` of ${money(g.mrr_goal)}${pct(n.mrr, g.mrr_goal)}` : ""} · new MRR ${money(n.new_mrr)}`,
    "",
    `🎯 ${r.pace?.line ?? ""}`.trim(),
    biggest ? `👉 Biggest change: ${biggest}.` : "",
    "",
    `Ask me "how's this week looking?" anytime.`,
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
}

async function reportWeeklyRun(tid: string) {
  const now = new Date().toISOString();
  try {
    const r: any = await weeklyReport(tid, { week: "last", refresh: "yes" });
    await updateBaselines(tid);
    let msg = reportMessage(r);
    try {
      const f: any = await getFocus(tid, true);
      if (f.items?.length) msg += `\n\n🧭 *Where to focus this week*\n${f.items.map((x: any, i: number) => `${i + 1}. ${x.title} — ${x.why}`).join("\n")}\n\nReply "do 1" (or 2, 3) and I'll get it started.`;
    } catch { /* focus is a bonus — the report still goes */ }
    await sendToTeam(tid, msg, await csmWeekly(tid, r.week_start, r.week_end), "report");
  } catch (e) {
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "report", trigger: "api", status: "failed", started_at: now, finished_at: now, error: String(e).slice(0, 200) });
  }
}

// ===================== v4.3: goals =====================
async function getGoals(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("mrr_target, revenue_target, goal_date, avg_sale_value, show_rate, close_rate").eq("tenant_id", tid).maybeSingle();
  return {
    ok: true,
    goals: {
      mrr_goal: Number(cfg?.mrr_target ?? 0) || null, revenue_goal: Number(cfg?.revenue_target ?? 0) || null,
      goal_date: cfg?.goal_date ?? null, avg_sale_value: Number(cfg?.avg_sale_value ?? 0) || null,
      show_rate: cfg?.show_rate !== null && cfg?.show_rate !== undefined ? Math.round(Number(cfg.show_rate) * 100) : 70,
      close_rate: cfg?.close_rate !== null && cfg?.close_rate !== undefined ? Math.round(Number(cfg.close_rate) * 100) : 45,
    },
  };
}

async function setGoals(tid: string, p: any) {
  const patch: Record<string, unknown> = {};
  const money = (v: unknown) => { const n = Number(String(v ?? "").replace(/[£,\s]/g, "").replace(/k$/i, "000")); return Number.isFinite(n) && n > 0 ? Math.round(n) : null; };
  const rate = (v: unknown) => { let n = Number(String(v ?? "").replace(/[%\s]/g, "")); if (!Number.isFinite(n) || n <= 0) return null; if (n > 1) n = n / 100; return Math.min(1, Math.round(n * 100) / 100); };
  if (p.mrr_goal !== undefined) { const v = money(p.mrr_goal); if (!v) return { ok: false, error: "MRR goal must be a number, e.g. 20000" }; patch.mrr_target = v; }
  if (p.revenue_goal !== undefined) { const v = money(p.revenue_goal); if (!v) return { ok: false, error: "revenue goal must be a number" }; patch.revenue_target = v; }
  if (p.avg_sale_value !== undefined) { const v = money(p.avg_sale_value); if (!v) return { ok: false, error: "average sale must be a number" }; patch.avg_sale_value = v; }
  if (p.show_rate !== undefined) { const v = rate(p.show_rate); if (!v) return { ok: false, error: "show rate must be a percentage" }; patch.show_rate = v; }
  if (p.close_rate !== undefined) { const v = rate(p.close_rate); if (!v) return { ok: false, error: "close rate must be a percentage" }; patch.close_rate = v; }
  if (p.goal_date !== undefined) {
    const d = String(p.goal_date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Date.parse(d) < Date.now()) return { ok: false, error: "goal date must be a future date (YYYY-MM-DD)" };
    patch.goal_date = d;
  }
  if (!Object.keys(patch).length) return { ok: false, error: "nothing to change" };
  const { error } = await supabase.from("tenant_config").update(patch).eq("tenant_id", tid);
  if (error) return { ok: false, error: error.message };
  // This week's cached numbers use the old pace — refresh them next time
  await supabase.from("weekly_reports").delete().eq("tenant_id", tid).eq("is_final", false);
  const g = (await getGoals(tid)).goals;
  const wr: any = await weeklyReport(tid, { week: "this" });
  const summary = `MRR £${(g.mrr_goal ?? 0).toLocaleString("en-GB")} · revenue £${(g.revenue_goal ?? 0).toLocaleString("en-GB")}/month · by ${g.goal_date ?? "—"} · average sale £${g.avg_sale_value ?? "—"} · show ${g.show_rate}% · close ${g.close_rate}%. ${wr.pace?.line ?? ""}`.trim();
  return { ok: true, goals: g, pace: wr.pace, summary };
}

// ===================== v4.4: where to focus this week =====================
async function getFocus(tid: string, refresh: boolean) {
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const weekStart = mondayOf(today);
  if (!refresh) {
    const { data: fc } = await supabase.from("weekly_focus").select("items, created_at").eq("tenant_id", tid).eq("week_start", weekStart).maybeSingle();
    if (fc?.items) return { ok: true, week_start: weekStart, items: fc.items, created_at: fc.created_at };
  }
  // The facts: this week and last week against pace, the pipeline, no-shows
  const thisW: any = await weeklyReport(tid, { week: "this" });
  const lastW: any = await weeklyReport(tid, { week: "last" });
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  const pl: any = await pipelineList({ tid, ghlToken: token });
  const items: any[] = pl?.items ?? [];
  const stale = items.filter((x) => x.urgent || x.needs_action).slice(0, 8).map((x) => `${x.name} (${x.stage}, ${x.days}d${x.value ? `, £${x.value}` : ""})`);
  const proposals = items.filter((x) => /proposal|quote/i.test(String(x.stage)) && x.days >= 3).map((x) => x.name).slice(0, 6);
  const early = items.filter((x) => /conversation|lead|follow/i.test(String(x.stage)) && x.days >= 5).map((x) => x.name).slice(0, 8);
  const noShows = [...(thisW.numbers?.noshow_names ?? []), ...(lastW.numbers?.noshow_names ?? [])].slice(0, 6);
  const { data: memories } = await supabase.from("memories").select("fact").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(10);
  // Email gaps: which sequences exist (saved to GHL), how many quiet leads and past clients there are
  const { data: seqRuns } = await supabase.from("screen_runs").select("input, saved").eq("tenant_id", tid).eq("skill", "email-sequence").eq("status", "done").order("created_at", { ascending: false }).limit(30);
  const savedTypes = new Set((seqRuns ?? []).filter((r: any) => r.saved).map((r: any) => (String(r.input ?? "").match(/type:\s*([a-z-]+)/i)?.[1] ?? "").toLowerCase()).filter(Boolean));
  const quietLong = items.filter((x) => /conversation|lead|follow/i.test(String(x.stage)) && x.days >= 30).length;
  const { count: pastClients } = await supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tid).neq("status", "active");

  const facts = [
    `Goals: £${cfg?.mrr_target ?? "?"} MRR, £${cfg?.revenue_target ?? "?"} revenue a month, by ${cfg?.goal_date ?? "?"}. Average sale £${cfg?.avg_sale_value ?? "?"}.`,
    `Pace needed a week: ${thisW.pace?.line ?? ""}`,
    `Last week: ${JSON.stringify({ messages_sent: lastW.numbers?.messages_sent, calls_booked: lastW.numbers?.calls_booked, calls_held: lastW.numbers?.calls_held, show_rate: lastW.numbers?.show_rate, sales: lastW.numbers?.sales_count, new_mrr: lastW.numbers?.new_mrr })}`,
    `This week so far (day ${thisW.day_of_week}): ${JSON.stringify({ messages_sent: thisW.numbers?.messages_sent, calls_booked: thisW.numbers?.calls_booked, calls_held: thisW.numbers?.calls_held, sales: thisW.numbers?.sales_count })}`,
    `Deals needing action: ${stale.join("; ") || "none"}`,
    `Proposals waiting 3+ days: ${proposals.join(", ") || "none"}`,
    `Early-stage leads quiet 5+ days: ${early.join(", ") || "none"}`,
    `No-shows (this week and last): ${noShows.join(", ") || "none"}`,
    `Email sequences saved to GHL: ${savedTypes.size ? [...savedTypes].join(", ") : "none"}. Leads quiet 30+ days: ${quietLong}. Past clients: ${pastClients ?? 0}. Open leads in early stages: ${early.length}.`,
    (memories ?? []).length ? `Things to remember: ${(memories ?? []).map((m: any) => m.fact).join(" | ")}` : "",
    await memoryText(tid, ["baseline", "finding", "definition", "worked"], 1500),
  ].filter(Boolean).join("\n");

  const rules = [
    "You are a sales coach for this business. From the FACTS, find the weakest link against the weekly pace (not enough leads / not enough calls booked / people not showing / calls not closing / sales but low new MRR) and pick exactly 3 actions for this week that would move it most.",
    "Use real names from the FACTS. Never invent people, numbers or results. If a FINDING has come up 2+ weeks running, say so in the why (e.g. \"third week in a row\") — and prefer fixing the cause. Compare with the baselines (normal week) where it helps. Prefer actions Archie can start:",
    "- do: \"draft\" — Archie drafts a short message to each named person (names from the FACTS; purpose: follow up on proposal / re-open quiet lead / rebook no-show / ask for referral / check in).",
    "- do: \"skill\" — Archie runs one of: write-post, create-reel-script, create-carousel, stories, reply-to-objection, email-sequence (skill + input).",
    "Email gaps: if there's no nurture sequence and new leads keep coming in, or lots of leads are quiet 30+ days with no re-engagement sequence, or there are past clients and no win-back sequence, one of the 3 actions can be to write that sequence: do \"skill\", skill \"email-sequence\", input starting \"Type: Nurture.\" (or Re-engagement, Win-back, Onboarding) then who it's for. Only suggest a type that isn't already saved.",
    "- do: \"task\" — something only the owner can do (title).",
    "Return ONLY a JSON array of 3 objects, no other text:",
    '[{"title":"short action, under 60 chars","why":"one line tied to the numbers","do":"draft|skill|task","names":["…"],"purpose":"…","skill":"…","input":"…"}]',
  ].join("\n");

  let focus: any[] = [];
  try {
    const loc = cfg?.ghl_location_id;
    const agentId = await agentIdFor(tid, "sales", token, loc);
    if (agentId) {
      const res = await agentExecute(token, agentId, { locationId: loc, message: `${rules}\n\nFACTS\n${facts}`.slice(0, 9900) }, `focus-${tid}-${Date.now()}`);
      const txt = tidy(clean(String(res.json?.finalText ?? "")));
      const arr = safeArray(extractArray(`X: ${txt}`, "X:").json);
      focus = arr.filter((x: any) => x && x.title && ["draft", "skill", "task"].includes(String(x.do))).slice(0, 3)
        .map((x: any) => ({ title: String(x.title).slice(0, 80), why: String(x.why ?? "").slice(0, 160), do: String(x.do), names: Array.isArray(x.names) ? x.names.map(String).slice(0, 8) : [], purpose: String(x.purpose ?? "").slice(0, 80), skill: String(x.skill ?? ""), input: String(x.input ?? "").slice(0, 400) }));
    }
  } catch { /* fall back below */ }
  // Fallback if the agent didn't answer usefully — simple rules on the same facts
  if (!focus.length) {
    if (proposals.length) focus.push({ title: `Chase ${proposals.length} open proposal${proposals.length > 1 ? "s" : ""}`, why: "Proposals waiting 3+ days are the quickest sales this week.", do: "draft", names: proposals, purpose: "follow up on proposal", skill: "", input: "" });
    if (early.length) focus.push({ title: `Re-open ${early.length} quiet lead${early.length > 1 ? "s" : ""}`, why: "More conversations → more calls booked.", do: "draft", names: early, purpose: "re-open quiet lead", skill: "", input: "" });
    if (noShows.length) focus.push({ title: `Rebook ${noShows.length} no-show${noShows.length > 1 ? "s" : ""}`, why: "They already wanted a call.", do: "draft", names: noShows, purpose: "rebook no-show", skill: "", input: "" });
    if (focus.length < 3 && !savedTypes.has("nurture") && early.length) focus.push({ title: "Set up a nurture email sequence for new leads", why: "New leads get nothing after the first reply — a 5-email nurture keeps them warm until they book.", do: "skill", names: [], purpose: "", skill: "email-sequence", input: "Type: Nurture. For new leads who messaged but haven't booked a call yet." });
    if (focus.length < 3 && !savedTypes.has("re-engagement") && quietLong >= 5) focus.push({ title: `Re-engage ${quietLong} leads gone quiet`, why: "They were interested once — a short 3-email check-in brings some back.", do: "skill", names: [], purpose: "", skill: "email-sequence", input: "Type: Re-engagement. For leads who went quiet 30+ days ago." });
    if (focus.length < 3) focus.push({ title: "Post one piece that invites a call", why: "Top up leads for next week.", do: "skill", names: [], purpose: "", skill: "write-post", input: "Purpose: Sell. A post that invites people to book a call." });
    focus = focus.slice(0, 3);
  }
  await supabase.from("weekly_focus").upsert({ tenant_id: tid, week_start: weekStart, items: focus, created_at: new Date().toISOString() }, { onConflict: "tenant_id,week_start" });
  for (const f of focus) await recordFinding(tid, weekStart, f.title, f.why);
  return { ok: true, week_start: weekStart, items: focus };
}

// Draft a short message to each named person for a purpose, saved as waiting drafts (sent only on a yes)
async function draftFollowups(tid: string, p: any) {
  const names: string[] = (Array.isArray(p.names) ? p.names : String(p.names ?? "").split(",")).map((x: any) => String(x).trim()).filter(Boolean).slice(0, 8);
  const purpose = String(p.purpose ?? "follow up").slice(0, 80);
  if (!names.length) return { ok: false, text: "No names to draft for." };
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  const loc = cfg?.ghl_location_id;
  // Find each contact
  const found: { name: string; id: string; first: string }[] = [];
  const missing: string[] = [];
  for (const n of names) {
    const r = await ghl(token, `/contacts/?locationId=${loc}&query=${encodeURIComponent(n.replace(/\s*\|.*$/, "").slice(0, 60))}&limit=3`, "GET", undefined, "2021-07-28");
    const c = (r.json?.contacts ?? [])[0];
    if (c?.id) found.push({ name: [c.firstName, c.lastName].filter(Boolean).join(" ") || n, id: c.id, first: String(c.firstName ?? n.split(" ")[0]) });
    else missing.push(n);
  }
  if (!found.length) return { ok: false, text: `Couldn't find ${missing.join(", ")} in your contacts.` };
  // Where each person is in the pipeline, so the message fits (no "proposal" unless they have one)
  const pl: any = await pipelineList({ tid, ghlToken: token });
  const stageOf = (f: { name: string; id: string }) => {
    const hit = (pl?.items ?? []).find((x: any) => x.contact_id === f.id) ?? (pl?.items ?? []).find((x: any) => String(x.name).toLowerCase().includes(f.name.toLowerCase().split(" ")[0]));
    return hit ? `${hit.stage}, quiet ${hit.days} days` : "not in the pipeline";
  };
  // One agent call writes them all, in the owner's voice
  const agentId = await agentIdFor(tid, "sales", token, loc);
  let written: any[] = [];
  if (agentId) {
    const msg = [
      `Write a short WhatsApp message (2–4 sentences) from the owner to each person below. Purpose: ${purpose}.`,
      "Friendly, plain, in the owner's voice (Archie Voice). One easy thing to reply to. No discounts, no pressure. Never invent details.",
      "Fit each message to where the person is (shown in brackets): only mention a proposal or quote if their stage is a proposal/quote stage; for early-stage leads, re-open the conversation and invite a quick call instead.",
      `Booking link if useful: ${/check.?in|client|renew/i.test(purpose) ? (cfg?.booking_link_client || cfg?.booking_link || "none") : (cfg?.booking_link_lead || cfg?.booking_link || "none")}.`,
      'Return ONLY a JSON array: [{"name":"…","message":"…"}]',
      "",
      found.map((f) => `- ${f.name} (first name ${f.first}; ${stageOf(f)})`).join("\n"),
    ].join("\n");
    const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `followups-${tid}-${Date.now()}`);
    written = safeArray(extractArray(`X: ${tidy(clean(String(res.json?.finalText ?? "")))}`, "X:").json);
  }
  const { data: existing } = await supabase.from("message_drafts").select("rank").eq("tenant_id", tid).eq("status", "pending").eq("created_on", today);
  let rank = Math.max(0, ...(existing ?? []).map((r: any) => Number(r.rank) || 0));
  const channel = String(cfg?.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WA" : "SMS";
  const made: string[] = [];
  for (const f of found) {
    const w = written.find((x: any) => String(x?.name ?? "").toLowerCase().includes(f.first.toLowerCase()));
    const body = String(w?.message ?? `Hi ${f.first}, just checking in — are you still keen to move things forward? Happy to jump on a quick call if that helps.`).slice(0, 1000);
    rank++;
    const { error } = await supabase.from("message_drafts").insert({ tenant_id: tid, created_on: today, rank, status: "pending", source: p.by ? `by:${p.by}` : "focus", contact_id: f.id, name: f.name, channel, body });
    if (error) rank--; else made.push(`${rank}. ${f.name}: ${body.slice(0, 90)}…`);
  }
  return { ok: true, text: `Drafted ${made.length} message${made.length === 1 ? "" : "s"} (${purpose}):\n${made.join("\n")}${missing.length ? `\nCouldn't find: ${missing.join(", ")}` : ""}\nAsk if they want them sent (archie_send_draft for each number).` };
}

// ===================== v4.6: recurring tasks =====================
const DOW = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
function dowOf(date: string) { return (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7; } // Mon=0
function daysArr(v: unknown): number[] {
  const raw = Array.isArray(v) ? v : String(v ?? "").split(/[\s,]+/);
  return [...new Set(raw.map((x: any) => {
    if (typeof x === "number") return x;
    const k = String(x).toLowerCase().slice(0, 3);
    const i = DOW.indexOf(k);
    return i >= 0 ? i : Number.isFinite(Number(x)) ? Number(x) : -1;
  }).filter((n: number) => n >= 0 && n <= 6))].sort();
}
function repeatMatches(r: any, date: string): boolean {
  const dow = dowOf(date);
  const days: number[] = Array.isArray(r.days) ? r.days : [];
  const dom = Number(date.slice(8, 10));
  const lastDom = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).getUTCDate();
  switch (r.pattern) {
    case "daily": return true;
    case "weekdays": return dow < 5;
    case "weekly": return days.includes(dow);
    case "fortnightly": {
      if (!days.includes(dow)) return false;
      const anchor = String(r.anchor_date ?? date);
      const weeks = Math.round((Date.parse(mondayOf(date)) - Date.parse(mondayOf(anchor))) / (7 * 86400000));
      return weeks % 2 === 0;
    }
    case "monthly": { const md = Number(r.month_day) || 1; return dom === Math.min(md, lastDom); }
    case "monthly_last": return days.includes(dow) && dom + 7 > lastDom;
    default: return false;
  }
}
function describeRepeat(r: any): string {
  const names = (Array.isArray(r.days) ? r.days : []).map((d: number) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d]).join(", ");
  switch (r.pattern) {
    case "daily": return "every day";
    case "weekdays": return "every weekday";
    case "weekly": return `every ${names}`;
    case "fortnightly": return `every other ${names}`;
    case "monthly": { const n = Number(r.month_day) || 1; const suf = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"; return `on the ${n}${suf} of each month`; }
    case "monthly_last": return `last ${names} of each month`;
    default: return r.pattern;
  }
}

async function recurringAdd(tid: string, p: any) {
  const title = String(p.title ?? "").trim().slice(0, 200);
  if (!title) return { ok: false, error: "title required" };
  let pattern = String(p.pattern ?? "").toLowerCase().replace(/[\s-]/g, "_");
  if (pattern === "every_weekday" || pattern === "weekday") pattern = "weekdays";
  if (pattern === "biweekly" || pattern === "every_other_week") pattern = "fortnightly";
  if (!["daily", "weekdays", "weekly", "fortnightly", "monthly", "monthly_last"].includes(pattern)) return { ok: false, error: "pattern must be daily, weekdays, weekly, fortnightly, monthly or monthly_last" };
  const days = daysArr(p.days);
  if (["weekly", "fortnightly", "monthly_last"].includes(pattern) && !days.length) return { ok: false, error: "which day(s)?" };
  const monthDay = Math.min(31, Math.max(1, Number(p.month_day) || 1));
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const tier = ["must", "high", "bonus"].includes(String(p.tier)) ? String(p.tier) : "high";
  const effort = Number(p.effort_minutes) > 0 ? Math.max(15, Math.round(Number(p.effort_minutes) / 15) * 15) : 30;
  const handle = String(p.handle ?? "").toLowerCase() || null;
  const { data: row, error } = await supabase.from("recurring_tasks").insert({
    tenant_id: tid, owner: handle, title, detail: String(p.detail ?? "").slice(0, 1000), tier, effort_minutes: effort,
    pattern, days, month_day: pattern === "monthly" ? monthDay : null, anchor_date: today, active: true,
  }).select("*").single();
  if (error) return { ok: false, error: error.message };
  // If it's due today, put today's one on the list now
  let now = "";
  if (repeatMatches(row, today)) { const n = await createRecurringInstance(tid, row, today); if (n) now = " Today's one is on the list."; }
  return { ok: true, item: row, text: `On repeat: ${title} — ${describeRepeat(row)}${handle ? ` (${handle})` : ""}, ${tier}, ${effort}m.${now}` };
}

async function createRecurringInstance(tid: string, r: any, date: string): Promise<boolean> {
  const ref = `rec:${r.id}:${date}`;
  const { data: exists } = await supabase.from("tasks").select("id").eq("tenant_id", tid).eq("source_ref", ref).maybeSingle();
  if (exists) return false;
  const { error } = await supabase.from("tasks").insert({
    tenant_id: tid, title: r.title, detail: r.detail || null, tier: r.tier, kind: "shallow", effort_minutes: r.effort_minutes,
    status: "open", owner: r.owner, source: "recurring", source_ref: ref, due_date: date, today: true, today_set_on: date,
    accepted_by: "recurring", accepted_at: new Date().toISOString(),
  });
  if (error) return false;
  await supabase.from("recurring_tasks").update({ last_created: date }).eq("id", r.id);
  return true;
}

async function recurringRun(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const { data: reps } = await supabase.from("recurring_tasks").select("*").eq("tenant_id", tid).eq("active", true);
  const { data: offs } = await supabase.from("archie_blocks").select("handle").eq("tenant_id", tid).eq("day", today);
  const offToday = new Set((offs ?? []).map((o: any) => String(o.handle)));
  let created = 0, missed = 0;
  // Last time's unfinished repeats: marked missed (not carried over, so they never pile up)
  const { data: old } = await supabase.from("tasks").select("id, title, owner").eq("tenant_id", tid).eq("source", "recurring").eq("status", "open").lt("due_date", today);
  for (const t of old ?? []) {
    await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "missed (recurring)" }).eq("id", t.id);
    missed++;
  }
  for (const r of reps ?? []) {
    if (r.paused_until && String(r.paused_until) >= today) continue;
    if (r.owner && offToday.has(String(r.owner))) continue;
    if (!repeatMatches(r, today)) continue;
    if (await createRecurringInstance(tid, r, today)) created++;
  }
  return { created, missed };
}

async function recurringList(tid: string, handle: string) {
  let q = supabase.from("recurring_tasks").select("*").eq("tenant_id", tid).order("created_at", { ascending: true });
  if (handle) q = q.eq("owner", handle);
  const { data } = await q;
  const items = (data ?? []).map((r: any) => ({ ...r, describe: describeRepeat(r), state: !r.active ? "stopped" : r.paused_until ? `paused until ${r.paused_until}` : "on" }));
  const text = items.length ? items.map((r: any, i: number) => `${i + 1}. ${r.title} — ${r.describe}${r.owner ? ` (${r.owner})` : ""} · ${r.state}`).join("\n") : "Nothing on repeat yet.";
  return { ok: true, items, text };
}

async function recurringUpdate(tid: string, p: any) {
  const id = String(p.id ?? "");
  if (!id) return { ok: false, error: "id required" };
  const patch: Record<string, unknown> = {};
  if (p.title !== undefined) patch.title = String(p.title).slice(0, 200);
  if (p.tier !== undefined && ["must", "high", "bonus"].includes(String(p.tier))) patch.tier = p.tier;
  if (p.effort_minutes !== undefined && Number(p.effort_minutes) > 0) patch.effort_minutes = Math.max(15, Math.round(Number(p.effort_minutes) / 15) * 15);
  if (p.owner !== undefined) patch.owner = String(p.owner || "").toLowerCase() || null;
  if (p.pattern !== undefined) patch.pattern = String(p.pattern);
  if (p.days !== undefined) patch.days = daysArr(p.days);
  if (p.month_day !== undefined) patch.month_day = Number(p.month_day) || null;
  if (p.active !== undefined) patch.active = p.active === true || String(p.active) === "true";
  if (p.paused_until !== undefined) patch.paused_until = /^\d{4}-\d{2}-\d{2}$/.test(String(p.paused_until)) ? p.paused_until : null;
  const { error } = await supabase.from("recurring_tasks").update(patch).eq("tenant_id", tid).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

async function recurringPauseByTitle(tid: string, handle: string, p: any) {
  const want = String(p.title ?? "").trim().toLowerCase();
  let q = supabase.from("recurring_tasks").select("*").eq("tenant_id", tid);
  if (handle) q = q.eq("owner", handle);
  const { data } = await q;
  const hits = (data ?? []).filter((r: any) => !want || String(r.title).toLowerCase().includes(want) || want.split(/\s+/).every((w) => `${r.title} ${describeRepeat(r)}`.toLowerCase().includes(w)));
  if (!hits.length) return { ok: false, text: `Nothing on repeat matches "${p.title}".` };
  if (hits.length > 1) return { ok: false, text: `More than one matches: ${hits.map((r: any) => `${r.title} (${describeRepeat(r)})`).join(" / ")}. Ask which one.` };
  const r = hits[0];
  if (p.stop === true || String(p.stop) === "true") { await supabase.from("recurring_tasks").update({ active: false }).eq("id", r.id); return { ok: true, text: `Stopped: ${r.title} (${describeRepeat(r)}).` }; }
  if (p.resume === true || String(p.resume) === "true") { await supabase.from("recurring_tasks").update({ active: true, paused_until: null }).eq("id", r.id); return { ok: true, text: `Back on: ${r.title} (${describeRepeat(r)}).` }; }
  const until = /^\d{4}-\d{2}-\d{2}$/.test(String(p.until ?? "")) ? String(p.until) : null;
  if (!until) return { ok: false, text: "Until when? (a date)" };
  await supabase.from("recurring_tasks").update({ paused_until: until }).eq("id", r.id);
  return { ok: true, text: `Paused until ${until}: ${r.title} (${describeRepeat(r)}).` };
}

// ===================== v4.7: email sequences → GHL templates =====================
function emailHtml(body: string): string {
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const link = (t: string) => t.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#E0312B">$1</a>');
  const paras = String(body ?? "").replace(/\r/g, "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px">${link(esc(p)).replace(/\n/g, "<br>")}</p>`).join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#222222;max-width:560px;margin:0 auto;padding:8px">${paras}</div>`;
}

async function saveSequence(tid: string, p: any) {
  // Which sequence: a given run, or the latest email-sequence run
  let q = supabase.from("screen_runs").select("id, input, output, status, created_at").eq("tenant_id", tid);
  q = p.run_id ? q.eq("id", String(p.run_id)) : q.eq("skill", "email-sequence").eq("status", "done");
  const { data: run } = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!run?.output) return { ok: false, error: "No finished email sequence found to save." };
  const part = extractArray(String(run.output), "EMAILS_JSON:");
  let emails = safeArray(part.json).filter((e: any) => e && String(e.body ?? "").trim()).slice(0, 12);
  if (!emails.length) emails = parseEmailsFromText(String(run.output));
  if (!emails.length) return { ok: false, error: "That sequence doesn't have the emails in a form I can save — run it again." };
  const type = (String(run.input ?? "").match(/type:\s*([a-z-]+)/i)?.[1] ?? "Sequence").replace(/^\w/, (c: string) => c.toUpperCase());

  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  const loc = cfg?.ghl_location_id;
  const made: string[] = []; const failed: string[] = [];
  for (let i = 0; i < emails.length; i++) {
    const e: any = emails[i];
    const subject = String(e.subject ?? "").trim().slice(0, 120);
    const name = `${type} ${i + 1}/${emails.length} · day ${Number(e.day) || 0} · ${subject || "email"}`.slice(0, 120);
    const cr = await ghl(token, "/emails/builder", "POST", { locationId: loc, title: name, type: "html", builderVersion: "2" }, "2021-07-28");
    const id = cr.json?.id ?? cr.json?.redirect;
    if (!cr.ok || !id) { failed.push(`${i + 1} (${cr.status})`); continue; }
    const up = await ghl(token, "/emails/builder/data", "POST", {
      locationId: loc, templateId: id, updatedBy: "archie", editorType: "html",
      previewText: String(e.preview ?? "").slice(0, 150), html: emailHtml(String(e.body)),
      dnd: { elements: [], attrs: {}, templateSettings: {} },
    }, "2021-07-28");
    if (up.ok) made.push(name); else failed.push(`${i + 1} (content ${up.status})`);
  }
  await supabase.from("screen_runs").update({ saved: true }).eq("id", run.id);
  return {
    ok: made.length > 0, saved: made.length, failed,
    text: made.length
      ? `Saved ${made.length} email${made.length === 1 ? "" : "s"} to GHL as templates (Marketing → Emails → Templates):\n${made.map((n) => `• ${n}`).join("\n")}${failed.length ? `\nCouldn't save: ${failed.join(", ")}` : ""}\nThe subject lines are in the template names — add them when you drop each email into a workflow.`
      : `Couldn't save the emails to GHL: ${failed.join(", ")}`,
    error: made.length ? undefined : `Couldn't save: ${failed.join(", ")}`,
  };
}

// Fallback: read the emails from the human-readable sequence ("Email 1 · day 0", "Subject:", "Preview:", body)
function parseEmailsFromText(out: string): any[] {
  const text = out.split("EMAILS_JSON:")[0].replace(/\r/g, "");
  const heads = [...text.matchAll(/^[#*\s]*Email\s+(\d+)\s*[·•\-–—|,:]*\s*(?:day\s*(\d+))?[*\s]*$/gim)];
  const emails: any[] = [];
  for (let i = 0; i < heads.length; i++) {
    const start = (heads[i].index ?? 0) + heads[i][0].length;
    const end = i + 1 < heads.length ? (heads[i + 1].index ?? text.length) : text.length;
    let block = text.slice(start, end).trim();
    const subject = block.match(/^[*\s]*Subject:?[*\s]*:?\s*(.+)$/im)?.[1]?.replace(/\*+/g, "").trim() ?? "";
    const preview = block.match(/^[*\s]*Preview(?: text)?:?[*\s]*:?\s*(.+)$/im)?.[1]?.replace(/\*+/g, "").trim() ?? "";
    block = block.replace(/^[*\s]*Subject:?.*$/im, "").replace(/^[*\s]*Preview(?: text)?:?.*$/im, "");
    const body = block.replace(/^\s*(?:-{3,}|\*{3,})\s*$/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").trim();
    if (body) emails.push({ day: Number(heads[i][2] ?? 0) || 0, subject, preview, body });
  }
  return emails.slice(0, 12);
}

// ===================== v4.9: /checkup — everything Archie depends on, in one plain report =====================
async function checkup(tid: string) {
  const lines: string[] = [];
  const problems: string[] = [];
  const ok = (m: string) => lines.push(`✅ ${m}`);
  const warn = (m: string) => { lines.push(`⚠️ ${m}`); problems.push(m); };
  const bad = (m: string) => { lines.push(`❌ ${m}`); problems.push(m); };
  const { data: t } = await supabase.from("tenants").select("business_name, status, access_token").eq("id", tid).maybeSingle();
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const yesterday = addDays(today, -1);
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  const loc = cfg?.ghl_location_id;
  if (!t) return { ok: false, status: "red", problems: ["tenant not found"], text: "❌ This business isn't set up in Archie." };
  t.status === "active" ? ok("Archie is switched on") : bad(`Archie is ${t.status}`);

  // GHL connection
  const g = await ghl(token, `/locations/${loc}`, "GET", undefined, "2021-07-28");
  g.ok ? ok("GHL connected") : bad(`GHL connection failing (${g.status}) — the token may have expired or lost access`);

  // Archie toolbox (MCP)
  try {
    const m = await fetch(`${SUPA_URL}/functions/v1/archie-mcp/${t.access_token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) });
    const mj: any = await m.json().catch(() => null);
    const n = mj?.result?.tools?.length ?? 0;
    n ? ok(`Archie toolbox reachable (${n} tools)`) : bad("Archie toolbox not answering");
  } catch { bad("Archie toolbox not answering"); }

  // Agents
  const jobs = ["brief", "pipeline", "scraper", "content", "sales", "assistant"];
  const missing: string[] = [];
  for (const job of jobs) { const id = await agentIdFor(tid, job, token, loc); if (!id) missing.push(job); }
  missing.length ? bad(`Agents not found: ${missing.join(", ")} — check they're published with the right names`) : ok("All agents found");

  // Morning brief
  const { data: brief } = await supabase.from("briefs").select("brief_date").eq("tenant_id", tid).order("brief_date", { ascending: false }).limit(1).maybeSingle();
  const bd = String(brief?.brief_date ?? "");
  bd === today ? ok("Today's brief sent") : bd === yesterday ? warn(`Last brief was yesterday (${bd}) — today's may not have run yet`) : bad(`No brief since ${bd || "ever"}`);

  // Schedules
  if (cfg?.schedules_on) {
    const { data: logs } = await supabase.from("schedule_log").select("job, created_at").eq("tenant_id", tid).gte("created_at", new Date(Date.now() - 36 * 3600000).toISOString());
    const ran = new Set((logs ?? []).map((l: any) => l.job));
    ran.size ? ok(`Schedules running (last 36h: ${[...ran].join(", ")})`) : bad("No scheduled jobs have run in the last 36 hours");
  } else warn("Schedules are switched off for this business");

  // Money (Stripe)
  const { data: dm } = await supabase.from("daily_metrics").select("metric_date, mrr").eq("tenant_id", tid).not("mrr", "is", null).order("metric_date", { ascending: false }).limit(1).maybeSingle();
  dm?.metric_date && String(dm.metric_date) >= yesterday ? ok(`Stripe numbers fresh (MRR £${Math.round(Number(dm.mrr)).toLocaleString("en-GB")})`) : warn(`Stripe numbers not updated since ${dm?.metric_date ?? "ever"}`);

  // Failed agent runs
  const { data: fails } = await supabase.from("agent_runs").select("agent, error").eq("tenant_id", tid).eq("status", "failed").gte("finished_at", new Date(Date.now() - 24 * 3600000).toISOString()).limit(20);
  (fails ?? []).length ? warn(`${fails!.length} failed run${fails!.length === 1 ? "" : "s"} in the last 24h (${[...new Set(fails!.map((f: any) => f.agent))].join(", ")})`) : ok("No failed runs in the last 24h");

  // Team & channels
  const { data: team } = await supabase.from("team_members").select("handle, ghl_contact_id, ghl_user_id, personal_calendar_id").eq("tenant_id", tid);
  const noContact = (team ?? []).filter((m: any) => !m.ghl_contact_id).map((m: any) => m.handle);
  noContact.length ? warn(`No WhatsApp contact linked for: ${noContact.join(", ")}`) : ok(`Team linked (${(team ?? []).length})`);
  const noCal = (team ?? []).filter((m: any) => !m.ghl_user_id).map((m: any) => m.handle);
  if (noCal.length) warn(`No GHL user (calendar) for: ${noCal.join(", ")} — days off can't block their calendar`);
  if (!cfg?.fathom_api_key) warn("Fathom not connected — call scoring and the call picker won't work");
  if (!cfg?.booking_link_lead && !cfg?.booking_link) warn("No booking link set — messages will say [CHECK: booking link]");

  const status = problems.some((p) => lines.find((l) => l.startsWith("❌") && l.includes(p))) ? "red" : problems.length ? "amber" : "green";
  const head = status === "green" ? "🟢 Everything's working." : status === "amber" ? "🟡 Working, with a few things to look at." : "🔴 Something needs fixing.";
  return { ok: true, status, problems, text: `Archie checkup — ${t.business_name ?? "this business"} · ${today}\n${head}\n\n${lines.join("\n")}` };
}

// ===================== v5.0: business memory =====================
const MEMORY_KINDS = ["definition", "voice", "worked", "service", "fact", "baseline", "finding"];
const KIND_LABEL: Record<string, string> = {
  definition: "Definitions (use these meanings)", voice: "Voice rules and corrections (follow these when writing)", worked: "What's worked before",
  service: "Services they offer", fact: "Facts about the business", baseline: "Normal week (baselines)", finding: "Things Archie keeps noticing",
};

async function memoryText(tid: string, kinds: string[], max: number): Promise<string> {
  const { data } = await supabase.from("business_memory").select("kind, key, value, weeks_seen, last_seen")
    .eq("tenant_id", tid).eq("status", "active").in("kind", kinds).order("updated_at", { ascending: false }).limit(80);
  if (!data?.length) return "";
  const parts: string[] = [];
  for (const k of kinds) {
    const rows = data.filter((r: any) => r.kind === k);
    if (!rows.length) continue;
    const lines = rows.slice(0, k === "finding" ? 8 : 15).map((r: any) => k === "finding"
      ? `- ${r.value}${Number(r.weeks_seen) > 1 ? ` (${Number(r.weeks_seen)} weeks running)` : ""}`
      : `- ${r.key}: ${r.value}`);
    parts.push(`${KIND_LABEL[k] ?? k}:\n${lines.join("\n")}`);
  }
  const txt = `BUSINESS MEMORY\n${parts.join("\n")}`;
  return txt.length > max ? txt.slice(0, max - 20) + "\n[more in memory]" : txt;
}

function memKey(v: unknown) { return String(v ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

async function memoryAction(tid: string, member: any, a: any) {
  const action = String(a.action ?? "save").toLowerCase();
  if (action === "list") {
    const r = await memoryList(tid, String(a.kind ?? ""));
    return { ok: true, text: r.text };
  }
  const kind = MEMORY_KINDS.includes(String(a.kind)) ? String(a.kind) : "fact";
  const key = memKey(a.key || a.value);
  if (!key) return { ok: false, text: "What should I remember?" };
  if (action === "archive" || action === "forget") {
    let q = supabase.from("business_memory").update({ status: "archived", reason: String(a.reason ?? "archived by owner").slice(0, 200), updated_at: new Date().toISOString() })
      .eq("tenant_id", tid).eq("status", "active");
    q = a.kind ? q.eq("kind", kind).eq("key", key) : q.ilike("key", `%${key}%`);
    const { data } = await q.select("key");
    return data?.length ? { ok: true, text: `Archived: ${data.map((d: any) => d.key).join(", ")} (kept on file, not used any more).` } : { ok: false, text: `Nothing in memory matches "${a.key}".` };
  }
  const value = String(a.value ?? "").trim().slice(0, 600);
  if (!value) return { ok: false, text: "What's the detail to remember?" };
  if (!member.gets_financials && /£|\$|€|\b(mrr|revenue|profit|margin|income|salary)\b/i.test(value)) return { ok: false, text: "Money details can only be saved by the owner." };
  const now = new Date().toISOString();
  const { error } = await supabase.from("business_memory").upsert({
    tenant_id: tid, kind, key, value, source: member.handle ? `said by ${member.handle}` : "owner", status: "active", updated_at: now,
  }, { onConflict: "tenant_id,kind,key" });
  if (error) return { ok: false, text: `Couldn't save that: ${error.message}` };
  const label = { definition: "Definition saved", voice: "Voice note saved — I'll write that way from now on", worked: "Noted as something that worked", service: "Service saved", fact: "Remembered" }[kind] ?? "Saved";
  return { ok: true, text: `${label}: ${key} — ${value}` };
}

async function memoryList(tid: string, kind: string) {
  let q = supabase.from("business_memory").select("id, kind, key, value, source, weeks_seen, updated_at").eq("tenant_id", tid).eq("status", "active");
  if (MEMORY_KINDS.includes(kind)) q = q.eq("kind", kind);
  const { data } = await q.order("kind").order("updated_at", { ascending: false }).limit(150);
  const items = data ?? [];
  const text = items.length
    ? MEMORY_KINDS.filter((k) => items.some((r: any) => r.kind === k)).map((k) => `${KIND_LABEL[k]}\n${items.filter((r: any) => r.kind === k).slice(0, 12).map((r: any) => `- ${r.kind === "finding" ? r.value : `${r.key}: ${r.value}`}${Number(r.weeks_seen) > 1 ? ` (${r.weeks_seen} weeks)` : ""}`).join("\n")}`).join("\n\n")
    : "Nothing saved yet. Tell me things like \"a member means anyone on a paid plan\" or \"remember we don't do refunds after 14 days\".";
  return { ok: true, items, text };
}

// Findings: things Archie flags; seen again in a later week → weeks_seen goes up ("third week in a row")
async function recordFinding(tid: string, weekStart: string, title: string, why: string) {
  const key = memKey(String(title).replace(/\b\d+\b/g, "").replace(/\b(chase|re-?open|re-?engage|follow up|rebook)\b/gi, (m) => m.toLowerCase())).slice(0, 50);
  if (!key) return;
  const { data: ex } = await supabase.from("business_memory").select("id, weeks_seen, last_seen").eq("tenant_id", tid).eq("kind", "finding").eq("key", key).maybeSingle();
  const value = `${title}${why ? ` — ${why}` : ""}`.slice(0, 400);
  if (!ex) {
    await supabase.from("business_memory").insert({ tenant_id: tid, kind: "finding", key, value, source: "archie", status: "active", weeks_seen: 1, last_seen: weekStart, updated_at: new Date().toISOString() });
    return;
  }
  if (String(ex.last_seen) === weekStart) return; // already counted this week
  const consecutive = ex.last_seen && addDays(String(ex.last_seen), 7) === weekStart;
  await supabase.from("business_memory").update({ value, status: "active", weeks_seen: consecutive ? Number(ex.weeks_seen || 1) + 1 : 1, last_seen: weekStart, updated_at: new Date().toISOString() }).eq("id", ex.id);
}

// Baselines: what a normal week looks like, from the last 8 finished weeks
async function updateBaselines(tid: string) {
  const { data: weeks } = await supabase.from("weekly_reports").select("data").eq("tenant_id", tid).eq("is_final", true).order("week_start", { ascending: false }).limit(8);
  const rows = (weeks ?? []).map((w: any) => w.data ?? {});
  if (rows.length < 2) return;
  const avg = (k: string) => { const v = rows.map((r: any) => Number(r[k])).filter((n: number) => Number.isFinite(n)); return v.length ? Math.round(v.reduce((a: number, b: number) => a + b, 0) / v.length) : null; };
  const set: [string, string][] = [];
  const add = (key: string, label: string, v: number | null, money = false) => { if (v !== null) set.push([key, `${label}: about ${money ? "£" : ""}${v.toLocaleString("en-GB")} a week (average of the last ${rows.length} weeks)`]); };
  add("messages-sent", "Messages sent", avg("messages_sent"));
  add("calls-booked", "Calls booked", avg("calls_booked"));
  add("calls-held", "Calls held", avg("calls_held"));
  add("sales", "Sales", avg("sales_count"));
  add("new-income", "New income", avg("new_income"), true);
  for (const [key, value] of set) {
    await supabase.from("business_memory").upsert({ tenant_id: tid, kind: "baseline", key, value, source: "data (weekly reports)", status: "active", updated_at: new Date().toISOString() }, { onConflict: "tenant_id,kind,key" });
  }
}

// ===================== v5.1: speed to lead =====================
// An enquiry = an inbound message after 12h+ of quiet with that contact (or the first we see). Reply = the next outbound
// sent by a person/Archie (not a workflow or campaign). Slow = 4+ hours. Waiting now = latest message is theirs, 2h+ ago.
function speedToLead(all: { c: string; d: string; t: number; s: string }[], team: Set<string>, nowMs: number) {
  const byC = new Map<string, { d: string; t: number; s: string }[]>();
  for (const m of all) {
    if (!m.c || team.has(m.c) || !Number.isFinite(m.t)) continue;
    const l = byC.get(m.c) ?? []; l.push(m); byC.set(m.c, l);
  }
  let enquiries = 0, slow = 0;
  const delays: number[] = [];
  const awaiting: { contactId: string; hours: number }[] = [];
  const human = (m: { d: string; s: string }) => m.d === "outbound" && !["workflow", "campaign", "bulk_actions"].includes(m.s);
  for (const [c, list] of byC) {
    list.sort((a, b) => a.t - b.t);
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (m.d !== "inbound") continue;
      const prev = list[i - 1];
      if (prev && m.t - prev.t < 12 * 3600000) continue; // part of an ongoing chat
      enquiries++;
      const reply = list.slice(i + 1).find(human);
      if (reply) { const mins = Math.round((reply.t - m.t) / 60000); delays.push(mins); if (mins >= 240) slow++; }
      else if (nowMs - m.t >= 4 * 3600000) slow++;
    }
    const last = list[list.length - 1];
    if (last && last.d === "inbound" && nowMs - last.t >= 2 * 3600000 && nowMs - last.t < 7 * 86400000) awaiting.push({ contactId: c, hours: Math.round((nowMs - last.t) / 3600000) });
  }
  delays.sort((a, b) => a - b);
  const median = delays.length ? delays[Math.floor(delays.length / 2)] : null;
  awaiting.sort((a, b) => b.hours - a.hours);
  return { enquiries, reply_slow: slow, reply_median_min: median, awaiting: awaiting.slice(0, 10) };
}

// ===================== v5.2: member health =====================
// Green / Yellow / Red per active client, with reasons and dates. Rules (plain and explainable):
//   Red    — failed payment open · paused / cancel / at-risk tag · no contact 21+ days · their message unanswered 48h+
//   Yellow — no contact 10–20 days · their message unanswered 24–48h · no contact 7+ days and nothing booked in the next 30 days
//   Green  — none of the above
async function memberHealthRun(tid: string) {
  const started = new Date().toISOString();
  try {
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id, timezone").eq("tenant_id", tid).single();
    const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
    const tz = cfg?.timezone || "Europe/London";
    const nowMs = Date.now();
    const { data: clients } = await supabase.from("clients").select("id, name, ghl_contact_id, started_at, last_contact_at").eq("tenant_id", tid).eq("status", "active").limit(300);
    const { data: chase } = await supabase.from("tasks").select("source_ref, created_at").eq("tenant_id", tid).eq("source", "stripe").in("status", ["open", "doing"]).like("source_ref", "stripe-chase:%");
    const failedByEmail = new Map((chase ?? []).map((t: any) => [String(t.source_ref).split(":")[1]?.toLowerCase(), String(t.created_at).slice(0, 10)]));
    const fmt = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: tz });
    const rows: any[] = [];
    const { data: links } = await supabase.from("client_groups").select("client_id, conversation_id").eq("tenant_id", tid);
    const groupsByClient = new Map<string, string[]>();
    for (const l of links ?? []) { const a = groupsByClient.get(l.client_id) ?? []; a.push(l.conversation_id); groupsByClient.set(l.client_id, a); }
    for (const cl of clients ?? []) {
      if (!cl.ghl_contact_id) continue;
      const reasons: string[] = []; let level = 0; // 0 green, 1 yellow, 2 red
      const [cv, ct, ap] = await Promise.all([
        ghl(token, `/conversations/search?locationId=${loc}&contactId=${cl.ghl_contact_id}&limit=1`, "GET", undefined, "2021-04-15"),
        ghl(token, `/contacts/${cl.ghl_contact_id}`, "GET", undefined, "2021-07-28"),
        ghl(token, `/contacts/${cl.ghl_contact_id}/appointments`, "GET", undefined, "2021-07-28"),
      ]);
      const conv = cv.json?.conversations?.[0];
      // Their WhatsApp group(s) count too — often that's where the real conversation is
      const groups = groupsByClient.get(cl.id) ?? [];
      const convs: { ms: number; dir: string }[] = [{ ms: Number(conv?.lastMessageDate ?? 0) || 0, dir: String(conv?.lastMessageDirection ?? "").toLowerCase() }];
      for (const gid of groups) {
        const g = await ghl(token, `/conversations/${gid}`, "GET", undefined, "2021-04-15");
        const gc = g.json?.conversation ?? g.json ?? {};
        convs.push({ ms: Number(gc.lastMessageDate ?? 0) || Date.parse(String(gc.dateUpdated ?? "")) || 0, dir: String(gc.lastMessageDirection ?? "").toLowerCase() });
      }
      const latest = convs.sort((a, b) => b.ms - a.ms)[0];
      const lastMs = Math.max(latest?.ms || 0, Date.parse(String(cl.last_contact_at ?? "")) || 0);
      const lastDir = latest?.ms && latest.ms >= lastMs - 60000 ? latest.dir : "";
      const contact = ct.json?.contact ?? {};
      const tags: string[] = (contact.tags ?? []).map((t: string) => String(t).toLowerCase());
      const email = String(contact.email ?? "").toLowerCase();
      const name = cl.name || [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Client";
      const daysQuiet = lastMs ? Math.floor((nowMs - lastMs) / 86400000) : null;
      const hoursWaiting = lastDir === "inbound" && lastMs ? Math.floor((nowMs - lastMs) / 3600000) : 0;
      const upcoming = (ap.json?.events ?? ap.json?.appointments ?? []).filter((e: any) => Date.parse(e.startTime) > nowMs && Date.parse(e.startTime) < nowMs + 30 * 86400000 && String(e.appointmentStatus ?? e.status ?? "").toLowerCase() !== "cancelled");
      const red = (r: string) => { reasons.push(r); level = 2; };
      const yellow = (r: string) => { reasons.push(r); if (level < 1) level = 1; };
      if (email && failedByEmail.has(email)) red(`card failed (since ${fmt(Date.parse(String(failedByEmail.get(email))))})`);
      const flagTag = tags.find((t) => /pause|cancel|at.?risk|churn|downgrade/.test(t));
      if (flagTag) red(`tagged "${flagTag}"`);
      if (hoursWaiting >= 48) red(`waiting ${Math.round(hoursWaiting / 24)} days for our reply (since ${fmt(lastMs)})`);
      else if (hoursWaiting >= 24) yellow(`waiting ${hoursWaiting}h for our reply`);
      if (daysQuiet === null) yellow("no messages on record");
      else if (daysQuiet >= 21) red(`no contact for ${daysQuiet} days (last ${fmt(lastMs)})`);
      else if (daysQuiet >= 10) yellow(`no contact for ${daysQuiet} days (last ${fmt(lastMs)})`);
      else if (daysQuiet >= 7 && !upcoming.length) yellow(`quiet ${daysQuiet} days and nothing booked`);
      rows.push({
        tenant_id: tid, client_id: cl.id, contact_id: cl.ghl_contact_id, name,
        status: ["green", "yellow", "red"][level], reasons: reasons.length ? reasons : ["all good"],
        last_contact: lastMs ? new Date(lastMs).toISOString() : null,
        next_booking: upcoming[0]?.startTime ?? null, computed_at: new Date().toISOString(),
      });
      await new Promise((ok) => setTimeout(ok, 250)); // stay well inside GHL's rate limit
    }
    if (rows.length) await supabase.from("member_health").upsert(rows, { onConflict: "tenant_id,client_id" });
    const counts = { red: rows.filter((r) => r.status === "red").length, yellow: rows.filter((r) => r.status === "yellow").length, green: rows.filter((r) => r.status === "green").length };
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "health", trigger: "api", status: "done", started_at: started, finished_at: new Date().toISOString(), summary: `${rows.length} clients: ${counts.red} red, ${counts.yellow} yellow, ${counts.green} green` });
    return { ok: true, ...counts };
  } catch (e) {
    await supabase.from("agent_runs").insert({ tenant_id: tid, agent: "health", trigger: "api", status: "failed", started_at: started, finished_at: new Date().toISOString(), error: String(e).slice(0, 200) });
    return { ok: false };
  }
}

async function memberHealthList(tid: string, status: string) {
  let q = supabase.from("member_health").select("name, status, reasons, last_contact, next_booking, computed_at").eq("tenant_id", tid);
  if (["red", "yellow", "green"].includes(status)) q = q.eq("status", status);
  const { data } = await q.order("status", { ascending: true }).order("name").limit(300);
  const items = (data ?? []).sort((a: any, b: any) => ["red", "yellow", "green"].indexOf(a.status) - ["red", "yellow", "green"].indexOf(b.status));
  if (!items.length) return { ok: true, items, text: "No client health scores yet — they're worked out overnight (or run it now from the pages)." };
  const dot: Record<string, string> = { red: "🔴", yellow: "🟡", green: "🟢" };
  const counts = ["red", "yellow", "green"].map((k) => `${items.filter((i: any) => i.status === k).length} ${k}`).join(", ");
  const shown = items.filter((i: any) => i.status !== "green" || status === "green").slice(0, 15);
  const text = `Client health (Archie's scoring, ${new Date(items[0].computed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}): ${counts}.\n${shown.map((i: any) => `${dot[i.status]} ${i.name} — ${(i.reasons ?? []).join("; ")}`).join("\n")}`;
  return { ok: true, items, text };
}

// ===================== v5.3: WhatsApp groups linked to clients =====================
function normName(s: string) { return String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\b(x|and|the|fitlogic|systems|group|chat|support|team|coaching|fitness|ltd|limited)\b/g, " ").replace(/\s+/g, " ").trim(); }
function nameScore(a: string, b: string) {
  const A = new Set(normName(a).split(" ").filter((w) => w.length > 1)), B = new Set(normName(b).split(" ").filter((w) => w.length > 1));
  if (!A.size || !B.size) return 0;
  let hit = 0; for (const w of A) if (B.has(w)) hit++;
  return hit / Math.min(A.size, B.size);
}

async function recentConversations(tid: string, pages = 3) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const out: any[] = [];
  let startAfter = "";
  for (let i = 0; i < pages; i++) {
    const r = await ghl(token, `/conversations/search?locationId=${loc}&limit=100&sort=desc&sortBy=last_message_date${startAfter ? `&startAfterDate=${startAfter}` : ""}`, "GET", undefined, "2021-04-15");
    const cs: any[] = r.json?.conversations ?? [];
    out.push(...cs);
    if (cs.length < 100) break;
    startAfter = String(cs[cs.length - 1]?.lastMessageDate ?? "");
    if (!startAfter) break;
  }
  return out;
}

async function groupsSuggest(tid: string) {
  const [{ data: clients }, { data: linked }, convs] = await Promise.all([
    supabase.from("clients").select("id, name, ghl_contact_id").eq("tenant_id", tid).eq("status", "active").limit(300),
    supabase.from("client_groups").select("conversation_id, client_id").eq("tenant_id", tid),
    recentConversations(tid),
  ]);
  const taken = new Set((linked ?? []).map((l: any) => l.conversation_id));
  const own = new Set((clients ?? []).map((c: any) => c.ghl_contact_id));
  const sugg: any[] = [];
  for (const cv of convs) {
    if (taken.has(cv.id) || own.has(cv.contactId)) continue; // already linked, or a client's own 1:1 chat
    const gname = String(cv.fullName ?? cv.contactName ?? cv.companyName ?? "").trim();
    if (!gname) continue;
    let best: any = null, bestScore = 0;
    for (const cl of clients ?? []) { const sc = nameScore(gname, cl.name ?? ""); if (sc > bestScore) { bestScore = sc; best = cl; } }
    if (best && bestScore >= 0.5) sugg.push({ conversation_id: cv.id, group: gname, client_id: best.id, client: best.name, score: Math.round(bestScore * 100) });
  }
  sugg.sort((a, b) => b.score - a.score);
  const list = sugg.slice(0, 30).map((x, i) => ({ n: i + 1, ...x }));
  await supabase.from("tenant_config").update({ group_suggestions: list }).eq("tenant_id", tid);
  const text = list.length
    ? `Group chats that look like they belong to a client (my read — check before linking):\n${list.map((x) => `${x.n}. "${x.group}" → ${x.client}`).join("\n")}\n\nSay "link all", "link 1, 3 and 4", or "link the [group] group to [client]".`
    : "I couldn't find any unlinked group chats that match a client's name. You can link one directly: \"link the [group] group to [client]\".";
  return { ok: true, suggestions: list, text };
}

async function groupsLink(tid: string, p: any) {
  const made: string[] = []; const missed: string[] = [];
  const save = async (conversation_id: string, client_id: string, group: string, client: string) => {
    const { error } = await supabase.from("client_groups").upsert({ tenant_id: tid, conversation_id, client_id, group_name: group, linked_by: "owner" }, { onConflict: "tenant_id,conversation_id" });
    error ? missed.push(`${group} (${error.message})`) : made.push(`"${group}" → ${client}`);
  };
  if (p.conversation_id && p.client_id) {
    await save(String(p.conversation_id), String(p.client_id), String(p.group ?? "group"), String(p.client ?? "client"));
  } else if (p.all === true || String(p.all) === "true" || Array.isArray(p.numbers) || p.numbers) {
    const { data: cfg } = await supabase.from("tenant_config").select("group_suggestions").eq("tenant_id", tid).maybeSingle();
    const list: any[] = Array.isArray(cfg?.group_suggestions) ? cfg!.group_suggestions : [];
    if (!list.length) return { ok: false, text: "No suggestions to link — ask me to \"suggest group links\" first." };
    const nums = (p.all === true || String(p.all) === "true") ? list.map((x) => x.n) : (Array.isArray(p.numbers) ? p.numbers : String(p.numbers).split(/[\s,&and]+/)).map(Number).filter(Boolean);
    for (const n of nums) { const x = list.find((y) => y.n === n); if (x) await save(x.conversation_id, x.client_id, x.group, x.client); else missed.push(`#${n}`); }
  } else if (p.group && p.client) {
    const [{ data: clients }, convs] = await Promise.all([supabase.from("clients").select("id, name").eq("tenant_id", tid).eq("status", "active"), recentConversations(tid)]);
    const cl = (clients ?? []).map((c: any) => ({ c, sc: nameScore(String(p.client), c.name ?? "") })).sort((a, b) => b.sc - a.sc)[0];
    const gv = convs.map((cv: any) => ({ cv, sc: nameScore(String(p.group), String(cv.fullName ?? cv.contactName ?? "")) })).sort((a, b) => b.sc - a.sc)[0];
    if (!cl || cl.sc < 0.5) return { ok: false, text: `I can't find an active client called "${p.client}".` };
    if (!gv || gv.sc < 0.5) return { ok: false, text: `I can't find a recent group chat called "${p.group}".` };
    await save(gv.cv.id, cl.c.id, String(gv.cv.fullName ?? gv.cv.contactName ?? p.group), cl.c.name);
  } else return { ok: false, text: "Which group and which client?" };
  return { ok: made.length > 0, text: `${made.length ? `Linked:\n${made.join("\n")}` : ""}${missed.length ? `\nCouldn't link: ${missed.join(", ")}` : ""}\nClient health will use these chats from tonight.`.trim() };
}

async function groupsList(tid: string) {
  const { data } = await supabase.from("client_groups").select("group_name, client_id, created_at").eq("tenant_id", tid);
  const { data: clients } = await supabase.from("clients").select("id, name").eq("tenant_id", tid);
  const nameOf = new Map((clients ?? []).map((c: any) => [c.id, c.name]));
  const text = (data ?? []).length ? `Linked group chats:\n${(data ?? []).map((g: any) => `"${g.group_name}" → ${nameOf.get(g.client_id) ?? "client"}`).join("\n")}` : "No group chats linked yet. Say \"suggest group links\".";
  return { ok: true, items: data ?? [], text };
}

// ===================== v5.4: trial → member =====================
async function setTrialStage(tid: string, p: any) {
  const want = String(p.stage ?? "").trim();
  if (!want) return { ok: false, text: "Which pipeline stage means someone's started a trial or intro offer?" };
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const r = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/opportunities/pipelines?locationId=${cfg?.ghl_location_id}`, "GET", undefined, "2021-07-28");
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hits: { pipe: any; stage: any }[] = [];
  for (const pipe of r.json?.pipelines ?? []) for (const st of pipe.stages ?? []) if (norm(st.name) === norm(want) || norm(st.name).includes(norm(want))) hits.push({ pipe, stage: st });
  if (!hits.length) return { ok: false, text: `No pipeline stage called "${want}".` };
  if (hits.length > 1 && !hits.some((h) => norm(h.stage.name) === norm(want))) return { ok: false, text: `More than one stage matches: ${hits.map((h) => `${h.stage.name} (${h.pipe.name})`).join(" / ")}. Which one?` };
  const h = hits.find((x) => norm(x.stage.name) === norm(want)) ?? hits[0];
  await supabase.from("tenant_config").update({ trial_stage: h.stage.id, trial_pipeline: h.pipe.id, trial_stage_name: h.stage.name }).eq("tenant_id", tid);
  await supabase.from("weekly_reports").delete().eq("tenant_id", tid).eq("is_final", false);
  return { ok: true, text: `Trial stage set: "${h.stage.name}" in ${h.pipe.name}. The weekly report will show trials started and how many show up and join.` };
}

// Trials = deals that entered the trial stage. Showed = had a booking held after they started. Joined = deal won or now an active client.
async function trialNumbers(tid: string, cfg: any, token: string, loc: string, fromMs: number, toMs: number) {
  const opps: any[] = [];
  for (let page = 1; page <= 5; page++) {
    const r = await ghl(token, `/opportunities/search?location_id=${loc}&pipeline_id=${cfg.trial_pipeline}&limit=100&page=${page}`, "GET", undefined, "2021-07-28");
    const list: any[] = r.json?.opportunities ?? [];
    opps.push(...list);
    if (list.length < 100) break;
  }
  // When did each deal reach the trial stage? GHL keeps the last stage change; for deals still in (or past) the stage that's our best date.
  const trialStart = (o: any) => Date.parse(String(o.lastStageChangeAt ?? o.updatedAt ?? o.createdAt ?? ""));
  const stageIdx = new Map<string, number>();
  const { data: pc } = await supabase.from("tenant_config").select("trial_stage").eq("tenant_id", tid).maybeSingle();
  const inTrialOrPast = (o: any) => o.pipelineStageId === pc?.trial_stage || String(o.status) === "won";
  const started = opps.filter((o) => o.pipelineStageId === cfg.trial_stage && trialStart(o) >= fromMs && trialStart(o) < toMs);
  // Cohort: trials started 2–5 weeks before this week
  const cFrom = fromMs - 35 * 86400000, cTo = fromMs - 14 * 86400000;
  const cohort = opps.filter((o) => inTrialOrPast(o) && trialStart(o) >= cFrom && trialStart(o) < cTo).slice(0, 40);
  const { data: active } = await supabase.from("clients").select("ghl_contact_id").eq("tenant_id", tid).eq("status", "active");
  const activeSet = new Set((active ?? []).map((c: any) => c.ghl_contact_id));
  let showed = 0, joined = 0;
  for (const o of cohort) {
    const cid = o.contactId ?? o.contact?.id;
    if (String(o.status) === "won" || activeSet.has(cid)) joined++;
    const ap = await ghl(token, `/contacts/${cid}/appointments`, "GET", undefined, "2021-07-28");
    const evs: any[] = ap.json?.events ?? ap.json?.appointments ?? [];
    if (evs.some((e) => Date.parse(e.startTime) >= trialStart(o) && Date.parse(e.startTime) <= Date.now() && !["cancelled", "noshow", "no_show", "invalid"].includes(String(e.appointmentStatus ?? e.status ?? "").toLowerCase()))) showed++;
  }
  void stageIdx;
  return { trials_started: started.length, cohort_trials: cohort.length, cohort_showed: showed, cohort_joined: joined };
}

// ===================== v5.6: Sara as CSM =====================
async function csmDraftAction(tid: string, handle: string, tool: string, args: any, accessToken: string): Promise<{ ok: boolean; text: string }> {
  const mine = async () => {
    const { data: newest } = await supabase.from("message_drafts").select("created_on").eq("tenant_id", tid).eq("status", "pending").eq("source", `by:${handle}`).order("created_on", { ascending: false }).limit(1).maybeSingle();
    if (!newest?.created_on) return [] as any[];
    const { data } = await supabase.from("message_drafts").select("*").eq("tenant_id", tid).eq("status", "pending").eq("source", `by:${handle}`).eq("created_on", newest.created_on).order("rank");
    return data ?? [];
  };
  if (tool === "archie_draft_followups") {
    const purpose = String(args.purpose ?? "check in with a client");
    if (!/check|chase|follow|welcome|onboard|renew|support|reply/i.test(purpose)) return { ok: false, text: "Team members can draft client check-ins, chases and follow-ups." };
    const d: any = await draftFollowups(tid, { ...args, purpose, by: handle });
    return { ok: !!d.ok, text: d.text };
  }
  const list = await mine();
  if (tool === "archie_drafts") return { ok: true, text: list.length ? list.map((d: any) => `${d.rank}. ${d.name}: ${String(d.body).slice(0, 140)}`).join("\n") : "No drafts of yours waiting." };
  const byRank = args.rank !== undefined && args.rank !== null && args.rank !== "";
  const hits = byRank ? list.filter((d: any) => Number(d.rank) === Number(args.rank)) : list.filter((d: any) => String(d.name ?? "").toLowerCase().includes(String(args.name ?? "").toLowerCase()));
  if (!hits.length) return { ok: false, text: "That isn't one of your drafts." };
  if (hits.length > 1) return { ok: false, text: `More than one matches: ${hits.map((d: any) => `${d.rank}. ${d.name}`).join(" / ")}.` };
  const r = await runArchieTool(accessToken, tool, { rank: hits[0].rank });
  return { ok: r.ok, text: r.text };
}

async function csmWeekly(tid: string, weekStart: string, weekEnd: string): Promise<string> {
  const { data: cfg } = await supabase.from("tenant_config").select("csm_handle").eq("tenant_id", tid).maybeSingle();
  const csm = String(cfg?.csm_handle ?? "");
  if (!csm) return "";
  const [{ count: active }, { data: mh }, { count: sent }] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "active"),
    supabase.from("member_health").select("name, status, reasons").eq("tenant_id", tid),
    supabase.from("message_drafts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("source", `by:${csm}`).eq("status", "sent").gte("sent_at", weekStart).lte("sent_at", `${weekEnd}T23:59:59Z`),
  ]);
  const by = (k: string) => (mh ?? []).filter((m: any) => m.status === k);
  const reds = by("red");
  return [
    `🤝 Client week · ${weekStart} to ${weekEnd}`,
    "",
    `Active clients: ${active ?? 0}`,
    `Health now: ${reds.length} red · ${by("yellow").length} yellow · ${by("green").length} green`,
    `Check-ins and chases sent through Archie: ${sent ?? 0}`,
    reds.length ? `\nReds to start the week with:\n${reds.slice(0, 6).map((m: any) => `- ${m.name}: ${(m.reasons ?? []).join("; ")}`).join("\n")}` : "",
    "",
    `Say "Archie, check in with the reds" and I'll draft them for you.`,
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
}

// ===================== v5.7: second opinion (council) =====================
async function councilRun(tid: string, p: any) {
  const question = String(p.question ?? "").trim().slice(0, 600);
  const answers = String(p.answers ?? "").trim().slice(0, 1200);
  const lens = String(p.lens ?? "").trim();
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const agentId = await agentIdFor(tid, "ops", token, loc) || await agentIdFor(tid, "sales", token, loc);
  if (!agentId) return { ok: false, text: "I can't find the Archie Ops agent to run the council." };

  // Follow-up on one lens
  if (lens) {
    const last: any = cfg?.last_council ?? null;
    if (!last?.output) return { ok: false, text: "There's no recent second opinion to follow up on — ask me the decision first." };
    const msg = `Second-opinion follow-up. The owner wants the ${lens} lens to go deeper.\nTheir question: ${question || "go deeper"}\n\nEARLIER COUNCIL ON: ${last.question}\n${String(last.output).slice(0, 3500)}\n\nFACTS\n${String(last.facts ?? "").slice(0, 3000)}\n\nAnswer as the ${lens} lens only: a deeper view (do the maths where the facts allow), what you'd watch, and 2 actions for this week. Plain English, short lines, [NEED: …] for anything missing.`;
    const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `council-${tid}-${Date.now()}`);
    const out = tidy(clean(String(res.json?.finalText ?? ""))).trim();
    return out ? { ok: true, text: out } : { ok: false, text: "The council didn't answer — try again in a minute." };
  }
  if (!question) return { ok: false, text: "What's the decision?" };

  // The owner's real numbers
  const [thisW, lastW, pl, mh] = await Promise.all([
    weeklyReport(tid, { week: "this" }) as Promise<any>,
    weeklyReport(tid, { week: "last" }) as Promise<any>,
    pipelineList({ tid, ghlToken: token }) as Promise<any>,
    supabase.from("member_health").select("status").eq("tenant_id", tid),
  ]);
  const { count: activeClients } = await supabase.from("clients").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "active");
  const health = ["red", "yellow", "green"].map((k) => `${(mh.data ?? []).filter((m: any) => m.status === k).length} ${k}`).join(", ");
  const items: any[] = pl?.items ?? [];
  const n = lastW.numbers ?? {};
  const facts = [
    `Goals: £${cfg?.mrr_target ?? "?"} MRR and £${cfg?.revenue_target ?? "?"} revenue a month by ${cfg?.goal_date ?? "?"} · average sale £${cfg?.avg_sale_value ?? "?"} · show rate ${Math.round(Number(cfg?.show_rate ?? 0.7) * 100)}% · close rate ${Math.round(Number(cfg?.close_rate ?? 0.45) * 100)}%.`,
    `MRR now (Stripe): £${n.mrr ?? thisW.numbers?.mrr ?? "?"}. Revenue this month so far: £${thisW.numbers?.revenue_mtd ?? n.revenue_mtd ?? "?"}.`,
    `Last week: ${n.messages_sent ?? "?"} messages sent, ${n.calls_booked ?? "?"} calls booked, ${n.calls_held ?? "?"} held, ${n.sales_count ?? "?"} sales (£${n.sales_value ?? "?"}), new income £${n.new_income ?? "?"}, new MRR £${n.new_mrr ?? "?"}.`,
    `Pace needed: ${thisW.pace?.line ?? "?"}`,
    `Active clients: ${activeClients ?? "?"} · client health: ${health}.`,
    `Pipeline: ${items.length} open, ${items.filter((x) => x.real).length} real (touched in 14 days, past first contact), value of open deals £${items.reduce((a, x) => a + (Number(x.value) || 0), 0)}.`,
    await memoryText(tid, ["definition", "service", "fact", "worked", "baseline", "finding"], 2500),
  ].filter(Boolean).join("\n");
  const msg = `Use your second-opinion skill.\n\nDECISION: ${question}${answers ? `\n\nTHEIR ANSWERS TO YOUR QUESTIONS:\n${answers}\n(Don't ask more questions now — give the council.)` : ""}\n\nFACTS (their real numbers)\n${facts}`;
  const res = await agentExecute(token, agentId, { locationId: loc, message: msg.slice(0, 9500) }, `council-${tid}-${Date.now()}`);
  if (!res.ok || res.json?.success === false) return { ok: false, text: `The council couldn't run just now (${res.status}). Try again in a minute.` };
  const out = tidy(clean(String(res.json?.finalText ?? ""))).trim();
  if (!out) return { ok: false, text: "The council didn't answer — try again in a minute." };
  if (!/^\s*QUESTIONS:/i.test(out)) await supabase.from("tenant_config").update({ last_council: { question, output: out.slice(0, 6000), facts: facts.slice(0, 4000), at: new Date().toISOString() } }).eq("tenant_id", tid);
  return { ok: true, text: /^\s*QUESTIONS:/i.test(out) ? `Before I run the council, a couple of questions:\n${out.replace(/^\s*QUESTIONS:\s*/i, "")}` : out };
}

// ===================== v5.8: call prep =====================
async function callPrep(tid: string, p: any) {
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const V = "2021-07-28";
  const want = String(p.name ?? "").trim().toLowerCase();
  const time = String(p.time ?? "").trim();

  // 1. Who: today's/tomorrow's booked calls first (match name or time), then contact search
  const { data: owner } = await supabase.from("team_members").select("ghl_user_id, personal_calendar_id").eq("tenant_id", tid).eq("gets_financials", true).limit(1).maybeSingle();
  const userId = owner?.ghl_user_id || cfg?.ghl_user_id;
  let contactId = "", eventTitle = "", eventTime = "";
  if (userId) {
    const from = Date.parse(isoAtTz(today, "00:00", tz)), to = from + 2 * 86400000;
    const ev = await ghl(token, `/calendars/events?locationId=${loc}&userId=${userId}&startTime=${from}&endTime=${to}`, "GET", undefined, "2021-04-15");
    const events: any[] = (ev.json?.events ?? []).filter((e: any) => !e.isBlockSlot && e.calendarId !== owner?.personal_calendar_id && String(e.appointmentStatus ?? "").toLowerCase() !== "cancelled" && Date.parse(e.endTime ?? e.startTime) > Date.now());
    const hhmm = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
    const tWant = time.replace(/\s*(am|pm)$/i, (m) => m).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    const timeMatch = (e: any) => {
      if (!tWant) return false;
      let h = Number(tWant[1]); const mm = Number(tWant[2] ?? 0); const ap = (tWant[3] ?? "").toLowerCase();
      if (ap === "pm" && h < 12) h += 12; if (!ap && h < 8) h += 12;
      return hhmm(e.startTime) === `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    };
    const hit = events.find((e) => (want && String(e.title ?? "").toLowerCase().includes(want)) || timeMatch(e)) ?? (!want && !time ? events[0] : null);
    if (hit) { contactId = hit.contactId; eventTitle = String(hit.title ?? ""); eventTime = `${hhmm(hit.startTime)}${localDate(Date.parse(hit.startTime), tz) !== today ? " tomorrow" : ""}`; }
  }
  if (!contactId && want) {
    const cs = await ghl(token, `/contacts/?locationId=${loc}&query=${encodeURIComponent(String(p.name))}&limit=3`, "GET", undefined, V);
    const list: any[] = cs.json?.contacts ?? [];
    if (list.length > 1 && !list.some((c) => [c.firstName, c.lastName].filter(Boolean).join(" ").toLowerCase() === want)) return { ok: false, text: `More than one ${p.name}: ${list.map((c) => [c.firstName, c.lastName].filter(Boolean).join(" ")).join(" / ")}. Which one?` };
    contactId = (list.find((c) => [c.firstName, c.lastName].filter(Boolean).join(" ").toLowerCase() === want) ?? list[0])?.id ?? "";
  }
  if (!contactId) return { ok: false, text: want || time ? `I can't find a call or contact for "${p.name || time}".` : "Who's the call with?" };

  // 2. Everything we know about them
  const [ct, cv, nt, fields, opp] = await Promise.all([
    ghl(token, `/contacts/${contactId}`, "GET", undefined, V),
    ghl(token, `/conversations/search?locationId=${loc}&contactId=${contactId}&limit=1`, "GET", undefined, "2021-04-15"),
    ghl(token, `/contacts/${contactId}/notes`, "GET", undefined, V),
    ghl(token, `/locations/${loc}/customFields`, "GET", undefined, V),
    ghl(token, `/opportunities/search?location_id=${loc}&contact_id=${contactId}&limit=5`, "GET", undefined, V),
  ]);
  const c = ct.json?.contact ?? {};
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.contactName || "them";
  const fieldName = new Map((fields.json?.customFields ?? []).map((f: any) => [f.id, f.name]));
  const answers = (c.customFields ?? c.customField ?? []).map((f: any) => {
    const v = Array.isArray(f.value) ? f.value.join(", ") : String(f.value ?? f.fieldValue ?? "");
    return v && v.length < 400 ? `${fieldName.get(f.id) ?? f.id}: ${v}` : "";
  }).filter(Boolean).slice(0, 25);
  let lastMessages: string[] = [];
  const convId = cv.json?.conversations?.[0]?.id;
  const { data: grp } = await supabase.from("client_groups").select("conversation_id, client_id").eq("tenant_id", tid);
  const { data: client } = await supabase.from("clients").select("id, name, started_at").eq("tenant_id", tid).eq("ghl_contact_id", contactId).maybeSingle();
  const convIds = [convId, ...(grp ?? []).filter((g: any) => client && g.client_id === client.id).map((g: any) => g.conversation_id)].filter(Boolean);
  for (const id of convIds.slice(0, 2)) {
    const ms = await ghl(token, `/conversations/${id}/messages?limit=12`, "GET", undefined, "2021-04-15");
    const raw = ms.json?.messages?.messages ?? ms.json?.messages ?? [];
    lastMessages.push(...(Array.isArray(raw) ? raw : []).filter((m: any) => String(m.body ?? "").trim()).map((m: any) => `${String(m.dateAdded ?? "").slice(0, 10)} ${m.direction === "inbound" ? "THEM" : "US"}: ${String(m.body).replace(/\s+/g, " ").slice(0, 220)}`));
  }
  lastMessages = lastMessages.sort().slice(-14);
  const notes = (nt.json?.notes ?? []).slice(0, 6).map((n: any) => `${String(n.dateAdded ?? "").slice(0, 10)}: ${String(n.body ?? "").replace(/\s+/g, " ").slice(0, 400)}`);
  const deals = (opp.json?.opportunities ?? []).map((o: any) => `${o.name} — ${o.status}${o.monetaryValue ? `, £${o.monetaryValue}` : ""}${o.lastStageChangeAt ? `, last moved ${String(o.lastStageChangeAt).slice(0, 10)}` : ""}`);
  const { data: tasks } = await supabase.from("tasks").select("title, status, owner, due_date").eq("tenant_id", tid).in("status", ["open", "doing", "waiting", "proposed"]).or(client ? `client_id.eq.${client.id},title.ilike.%${(c.firstName ?? name).replace(/[%,]/g, "")}%` : `title.ilike.%${(c.firstName ?? name).replace(/[%,]/g, "")}%`).limit(8);
  const { data: health } = client ? await supabase.from("member_health").select("status, reasons").eq("tenant_id", tid).eq("client_id", client.id).maybeSingle() : { data: null };

  const facts = [
    `CALL: ${eventTitle || "(not on the calendar)"}${eventTime ? ` at ${eventTime}` : ""}`,
    `CONTACT: ${name}${c.email ? ` · ${c.email}` : ""}${c.companyName ? ` · ${c.companyName}` : ""}${(c.tags ?? []).length ? ` · tags: ${(c.tags ?? []).join(", ")}` : ""}${c.source ? ` · source: ${c.source}` : ""}`,
    client ? `CLIENT since ${String(client.started_at ?? "?").slice(0, 10)}${health ? ` · health ${health.status}: ${(health.reasons ?? []).join("; ")}` : ""}` : "Not a client yet (lead).",
    deals.length ? `DEALS: ${deals.join(" | ")}` : "DEALS: none",
    answers.length ? `THEIR FORM / QUIZ ANSWERS (custom fields):\n${answers.join("\n")}` : "THEIR FORM / QUIZ ANSWERS: none on record",
    notes.length ? `NOTES (newest first):\n${notes.join("\n")}` : "NOTES: none",
    lastMessages.length ? `RECENT MESSAGES (oldest → newest):\n${lastMessages.join("\n")}` : "RECENT MESSAGES: none",
    (tasks ?? []).length ? `OPEN TASKS: ${(tasks ?? []).map((t: any) => `${t.title} (${t.status}${t.owner ? `, ${t.owner}` : ""})`).join("; ")}` : "OPEN TASKS: none",
  ].join("\n\n");

  const agentId = await agentIdFor(tid, "sales", token, loc);
  if (!agentId) return { ok: false, text: "I can't find the Archie Sales agent." };
  const msg = [
    "Prepare the owner for this call. Use ONLY the facts below. Plain English, short lines, no markdown symbols. Under ~18 lines.",
    "Output exactly these parts:",
    `CALL PREP — ${name}${eventTime ? `, ${eventTime}` : ""}`,
    "Who: one line (client or lead, how long, where they came from).",
    "Last thing they asked or said: one or two lines, with the date.",
    "What's open: deals, tasks, anything promised or waiting.",
    "Their answers: the 2–4 most useful form/quiz answers (if any).",
    "Watch out for: one or two lines (health flags, objections, anything unanswered) — label judgement \"My read:\".",
    "Ask them: 3 questions that move this forward.",
    "",
    `FACTS\n${facts}`,
  ].join("\n");
  const res = await agentExecute(token, agentId, { locationId: loc, message: msg.slice(0, 9500) }, `prep-${tid}-${Date.now()}`);
  const out = tidy(clean(String(res.json?.finalText ?? ""))).trim();
  return out ? { ok: true, text: out } : { ok: false, text: "Couldn't put the prep together just now — try again in a minute." };
}

// ===================== v5.9: dump anything =====================
async function dumpAnything(tid: string, member: any, raw: string) {
  const text = String(raw ?? "").trim().slice(0, 8000);
  if (text.length < 10) return { ok: false, text: "What do you want to dump?" };
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const { data: team } = await supabase.from("team_members").select("handle, name").eq("tenant_id", tid);
  const agentId = await agentIdFor(tid, "ops", token, loc) || await agentIdFor(tid, "assistant", token, loc);
  if (!agentId) return { ok: false, text: "I can't find the Archie Ops agent to sort that." };
  const msg = [
    `Turn this ${member.handle}'s brain dump into something useful. Today is ${today} (${new Date(`${today}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" })}). Team: ${(team ?? []).map((m: any) => `${m.handle} (${m.name ?? ""})`).join(", ")}.`,
    "Only use what they actually said. Don't invent tasks, dates, names or numbers. If a date is vague ('next week'), pick the obvious date and keep the wording in the title only if needed.",
    "Return ONLY this JSON, nothing else:",
    '{"note":"the dump rewritten as a clean, short note — plain sentences, grouped by topic, no markdown symbols","summary":"one line","tasks":[{"title":"just the job","tier":"must|high|bonus","effort_minutes":30,"due_date":"YYYY-MM-DD or empty","owner":"a team handle or empty for the person dumping"}],"contact_notes":[{"name":"the person mentioned","note":"what was said about them"}],"remember":[{"kind":"fact|definition|worked|service|voice","key":"short-key","value":"the detail"}]}',
    "Tasks only for clear actions. contact_notes only for real people/clients/leads they talked about. remember only for lasting facts about the business (not one-off tasks). Empty arrays are fine.",
    "",
    `THE DUMP:\n${text}`,
  ].join("\n");
  const res = await agentExecute(token, agentId, { locationId: loc, message: msg.slice(0, 9500) }, `dump-${tid}-${Date.now()}`);
  const outText = tidy(clean(String(res.json?.finalText ?? "")));
  let parsed: any = null;
  try { const m = outText.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; } catch { parsed = null; }
  if (!parsed) {
    await supabase.from("dumps").insert({ tenant_id: tid, handle: member.handle, raw: text, clean: text, summary: "saved as it was" });
    return { ok: true, text: "Saved your note as it was — I couldn't sort it into tasks this time. Say \"show my last dump\" to see it, or tell me the tasks." };
  }
  const handles = new Set((team ?? []).map((m: any) => String(m.handle).toLowerCase()));
  // Tasks
  const added: string[] = [];
  for (const t of (Array.isArray(parsed.tasks) ? parsed.tasks : []).slice(0, 12)) {
    const title = String(t?.title ?? "").trim().slice(0, 200);
    if (!title) continue;
    let owner = String(t?.owner ?? "").toLowerCase();
    if (!handles.has(owner) || (!member.gets_financials && owner !== member.handle)) owner = member.handle;
    const due = /^\d{4}-\d{2}-\d{2}$/.test(String(t?.due_date ?? "")) ? String(t.due_date) : null;
    const effort = Number(t?.effort_minutes) > 0 ? Math.max(15, Math.round(Number(t.effort_minutes) / 15) * 15) : 30;
    const { error } = await supabase.from("tasks").insert({
      tenant_id: tid, title, tier: ["must", "high", "bonus"].includes(t?.tier) ? t.tier : "high", kind: "shallow", effort_minutes: effort,
      status: "open", owner, source: "dump", source_ref: `dump:${crypto.randomUUID()}`, due_date: due,
      ...(due === today ? { today: true, today_set_on: today } : {}), accepted_by: member.handle, accepted_at: new Date().toISOString(),
    });
    if (!error) added.push(`${title}${owner !== member.handle ? ` (${owner})` : ""}${due ? ` — ${due === today ? "today" : due}` : ""}`);
  }
  // Notes on contacts
  const noted: string[] = [];
  for (const cn of (Array.isArray(parsed.contact_notes) ? parsed.contact_notes : []).slice(0, 6)) {
    const nm = String(cn?.name ?? "").trim(), note = String(cn?.note ?? "").trim();
    if (!nm || !note) continue;
    const cs = await ghl(token, `/contacts/?locationId=${loc}&query=${encodeURIComponent(nm)}&limit=2`, "GET", undefined, "2021-07-28");
    const list: any[] = cs.json?.contacts ?? [];
    if (list.length !== 1) continue; // only when we're sure who it is
    const w = await ghl(token, `/contacts/${list[0].id}/notes`, "POST", { body: `[note from ${member.handle}] ${today} — ${note.slice(0, 900)}` }, "2021-07-28");
    if (w.ok) noted.push([list[0].firstName, list[0].lastName].filter(Boolean).join(" ") || nm);
  }
  // Things to remember
  const remembered: string[] = [];
  for (const r of (Array.isArray(parsed.remember) ? parsed.remember : []).slice(0, 5)) {
    const x: any = await memoryAction(tid, member, { action: "save", kind: r?.kind, key: r?.key, value: r?.value });
    if (x.ok) remembered.push(String(r?.value ?? "").slice(0, 60));
  }
  await supabase.from("dumps").insert({ tenant_id: tid, handle: member.handle, raw: text, clean: String(parsed.note ?? "").slice(0, 6000), summary: String(parsed.summary ?? "").slice(0, 300) });
  return {
    ok: true,
    text: [
      `Got it — ${String(parsed.summary ?? "note saved").replace(/\.$/, "")}.`,
      added.length ? `Added ${added.length} task${added.length === 1 ? "" : "s"}:\n${added.map((a) => `- ${a}`).join("\n")}` : "No tasks in that.",
      noted.length ? `Notes added to: ${noted.join(", ")}.` : "",
      remembered.length ? `Remembered: ${remembered.join("; ")}.` : "",
      `Say "show my last dump" for the clean note.`,
    ].filter(Boolean).join("\n"),
  };
}

// ===================== v6.0: ad-hoc data questions =====================
async function stripeGet(key: string, path: string) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${key}` } });
  return r.ok ? await r.json() : null;
}

async function askData(tid: string, question: string) {
  const q = question.trim().slice(0, 500);
  if (!q) return { ok: false, text: "What do you want to know?" };
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const want = (re: RegExp) => re.test(q);
  const sections: string[] = [];
  const sources: string[] = [];

  // Money: Stripe customers, charges, subscriptions
  if (want(/paid|pay|revenue|income|money|spend|top|biggest|best|mrr|subscri|plan|price|charge|refund|£|customer|client/i) && cfg?.stripe_key) {
    const since = Math.floor(Date.parse(`${today.slice(0, 4)}-01-01T00:00:00Z`) / 1000) - (want(/last year|12 months|year/i) ? 365 * 86400 : 0);
    const totals = new Map<string, { name: string; email: string; paid: number; count: number; last: number }>();
    let starting = "";
    for (let i = 0; i < 6; i++) {
      const page: any = await stripeGet(cfg.stripe_key, `charges?limit=100&created[gte]=${since}${starting ? `&starting_after=${starting}` : ""}`);
      const list: any[] = page?.data ?? [];
      for (const ch of list) {
        if (!ch.paid || ch.refunded) continue;
        const email = String(ch.billing_details?.email ?? ch.receipt_email ?? ch.customer ?? "unknown").toLowerCase();
        const t = totals.get(email) ?? { name: String(ch.billing_details?.name ?? ""), email, paid: 0, count: 0, last: 0 };
        t.paid += (Number(ch.amount) - Number(ch.amount_refunded ?? 0)) / 100; t.count++; t.last = Math.max(t.last, Number(ch.created));
        if (!t.name && ch.billing_details?.name) t.name = ch.billing_details.name;
        totals.set(email, t);
      }
      if (!page?.has_more || !list.length) break;
      starting = list[list.length - 1].id;
    }
    const ranked = [...totals.values()].sort((a, b) => b.paid - a.paid);
    if (ranked.length) {
      sections.push(`STRIPE — paid by customer since ${new Date(since * 1000).toISOString().slice(0, 10)} (paid charges, refunds removed), highest first:\n${ranked.slice(0, 40).map((t, i) => `${i + 1}. ${t.name || t.email} (${t.email}) — £${t.paid.toFixed(0)} across ${t.count} payment${t.count === 1 ? "" : "s"}, last ${new Date(t.last * 1000).toISOString().slice(0, 10)}`).join("\n")}\nTotal: £${ranked.reduce((a, t) => a + t.paid, 0).toFixed(0)} from ${ranked.length} customers.`);
      sources.push("Stripe");
    }
    const subs: any = await stripeGet(cfg.stripe_key, `subscriptions?status=active&limit=100&expand[]=data.customer`);
    const sl: any[] = subs?.data ?? [];
    if (sl.length) {
      const rows = sl.map((sb: any) => {
        const amt = (sb.items?.data ?? []).reduce((a: number, it: any) => a + (Number(it.price?.unit_amount ?? 0) * Number(it.quantity ?? 1)) / 100 * (it.price?.recurring?.interval === "year" ? 1 / 12 : 1), 0);
        return { who: String(sb.customer?.name ?? sb.customer?.email ?? "customer"), amt, since: new Date(Number(sb.start_date) * 1000).toISOString().slice(0, 10) };
      }).sort((a, b) => b.amt - a.amt);
      sections.push(`STRIPE — active subscriptions (monthly value), highest first:\n${rows.slice(0, 40).map((r, i) => `${i + 1}. ${r.who} — £${r.amt.toFixed(0)}/month since ${r.since}`).join("\n")}`);
    }
  }
  // Trends: weekly history + daily metrics
  if (want(/week|month|compare|trend|last|before|since|up|down|growth|pace|calls|sales|messages|booked|show/i)) {
    const { data: weeks } = await supabase.from("weekly_reports").select("week_start, data").eq("tenant_id", tid).order("week_start", { ascending: false }).limit(12);
    if (weeks?.length) {
      sections.push(`WEEKLY HISTORY (Archie's weekly reports, newest first):\n${weeks.map((w: any) => { const d = w.data ?? {}; return `${w.week_start}: messages ${d.messages_sent ?? "?"}, booked ${d.calls_booked ?? "?"}, held ${d.calls_held ?? "?"}, sales ${d.sales_count ?? "?"} (£${d.sales_value ?? "?"}), new income £${d.new_income ?? "?"}, MRR £${d.mrr ?? "?"}, new MRR £${d.new_mrr ?? "?"}${d.enquiries !== undefined ? `, enquiries ${d.enquiries}, slow replies ${d.reply_slow}` : ""}`; }).join("\n")}`);
      sources.push("weekly reports");
    }
    const { data: dm } = await supabase.from("daily_metrics").select("metric_date, mrr, revenue_mtd, cash_24h").eq("tenant_id", tid).order("metric_date", { ascending: false }).limit(90);
    if (dm?.length) {
      const monthly = new Map<string, { rev: number; mrr: number }>();
      for (const r of dm) { const m = String(r.metric_date).slice(0, 7); const cur = monthly.get(m); if (!cur) monthly.set(m, { rev: Number(r.revenue_mtd ?? 0), mrr: Number(r.mrr ?? 0) }); }
      sections.push(`MONTHS (Stripe daily snapshots — revenue to date as of the latest day we have in each month, and MRR then):\n${[...monthly.entries()].map(([m, v]) => `${m}: revenue £${Math.round(v.rev)}, MRR £${Math.round(v.mrr)}`).join("\n")}`);
      sources.push("Stripe daily snapshots");
    }
  }
  // Clients
  if (want(/client|member|joined|started|churn|left|cancel|health|risk|red|yellow|active|top|longest/i)) {
    const { data: cl } = await supabase.from("clients").select("name, status, started_at, ended_at, last_contact_at").eq("tenant_id", tid).order("started_at", { ascending: true }).limit(300);
    if (cl?.length) {
      sections.push(`CLIENTS (Archie's client list, oldest first):\n${cl.map((c: any) => `${c.name ?? "?"} — ${c.status}, started ${String(c.started_at ?? "?").slice(0, 10)}${c.ended_at ? `, ended ${String(c.ended_at).slice(0, 10)}` : ""}`).join("\n")}`);
      sources.push("Archie clients");
    }
    const { data: mh } = await supabase.from("member_health").select("name, status, reasons").eq("tenant_id", tid);
    if (mh?.length) sections.push(`CLIENT HEALTH (Archie's scoring):\n${mh.map((m: any) => `${m.name}: ${m.status} — ${(m.reasons ?? []).join("; ")}`).join("\n")}`);
  }
  // Pipeline and leads
  if (want(/lead|pipeline|deal|proposal|prospect|source|instagram|facebook|referral|won|lost|open|stage/i)) {
    const pl: any = await pipelineList({ tid, ghlToken: token });
    const items: any[] = pl?.items ?? [];
    if (items.length) { sections.push(`OPEN PIPELINE (GHL):\n${items.slice(0, 50).map((x) => `${x.name} — ${x.stage}${x.value ? `, £${x.value}` : ""}, quiet ${x.days} days${x.real ? "" : " (not real yet)"}`).join("\n")}`); sources.push("GHL pipeline"); }
    const won = await ghl(token, `/opportunities/search?location_id=${loc}&status=won&limit=50`, "GET", undefined, "2021-07-28");
    const wl: any[] = won.json?.opportunities ?? [];
    if (wl.length) sections.push(`WON DEALS (GHL, latest 50):\n${wl.map((o: any) => `${o.name} — £${o.monetaryValue ?? 0}, won ${String(o.lastStatusChangeAt ?? o.updatedAt ?? "").slice(0, 10)}${o.source ? `, source ${o.source}` : ""}`).join("\n")}`);
    if (want(/source|instagram|facebook|referral|google|where.*from/i)) {
      const cs = await ghl(token, `/contacts/?locationId=${loc}&limit=100`, "GET", undefined, "2021-07-28");
      const bySource = new Map<string, number>();
      for (const c of cs.json?.contacts ?? []) { const k = String(c.source ?? "unknown").toLowerCase() || "unknown"; bySource.set(k, (bySource.get(k) ?? 0) + 1); }
      sections.push(`LEAD SOURCES (GHL, latest 100 contacts):\n${[...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join("\n")}`);
    }
  }
  if (!sections.length) return { ok: true, text: `I don't have data that answers that yet. I can see: Stripe payments and subscriptions, weekly numbers, clients and their health, the pipeline and won deals, lead sources. [NEED: tell me which of those it's about, or what's missing.]` };

  const agentId = await agentIdFor(tid, "ops", token, loc) || await agentIdFor(tid, "sales", token, loc);
  if (!agentId) return { ok: false, text: "I can't find an agent to answer that." };
  const pack = sections.join("\n\n").slice(0, 8200);
  const msg = `Answer the owner's question using ONLY the data below. Answer first (the number or the list), then one line on what stands out. Show your working briefly if you calculated anything. If the data can't answer it, say exactly what's missing. Plain English, no markdown symbols. Lists as numbered lines. Today is ${today}.\n\nQUESTION: ${q}\n\nDATA\n${pack}`;
  const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `data-${tid}-${Date.now()}`);
  const out = tidy(clean(String(res.json?.finalText ?? ""))).trim();
  return out ? { ok: true, text: `${out}\n\n(From: ${[...new Set(sources)].join(", ") || "Archie's data"})` } : { ok: false, text: "Couldn't work that out just now — try again in a minute." };
}

// ===================== v6.1: Settings =====================
// Only these settings can be read/changed from the page. Secrets are never sent back — just whether they're set.
const SETTINGS_FIELDS: Record<string, "text" | "int" | "bool" | "num" | "time" | "json"> = {
  timezone: "text", brief_channel: "text", customer_word: "text", sale_word: "text",
  icp: "text", core_offer: "text", brand_voice: "text", brand_context: "text", content_pillars: "json",
  booking_link_lead: "text", booking_link_client: "text", referral_link: "text",
  mrr_target: "num", revenue_target: "num", goal_date: "text", avg_sale_value: "num", show_rate: "num", close_rate: "num",
  routing_auto: "bool", routing_text: "text", csm_handle: "text", payments_owner: "text", onboarding_owner: "text",
  schedules_on: "bool",
  sched_morning: "time", sched_morning_days: "text", sched_evening: "time", sched_evening_days: "text",
  sched_plan: "time", sched_plan_day: "int", sched_monthly: "time", sched_monthly_day: "int",
  sched_renewals: "time", sched_report: "time", sched_report_day: "int", sched_report_nightly: "time",
  sched_recurring: "time", sched_health: "time",
  won_creates_invoice: "bool", stale_threshold_days: "int", pipeline_name: "text", trial_stage_name: "text",
};
const SECRET_FIELDS = ["stripe_key", "fathom_api_key", "ghl_token"];

async function settingsGet(tid: string) {
  const [{ data: t }, { data: cfg }, { data: team }] = await Promise.all([
    supabase.from("tenants").select("business_name, status").eq("id", tid).maybeSingle(),
    supabase.from("tenant_config").select("*").eq("tenant_id", tid).maybeSingle(),
    supabase.from("team_members").select("*").eq("tenant_id", tid).order("gets_financials", { ascending: false }),
  ]);
  const settings: Record<string, unknown> = {};
  for (const k of Object.keys(SETTINGS_FIELDS)) settings[k] = cfg?.[k] ?? null;
  const connections: Record<string, boolean> = {};
  for (const k of SECRET_FIELDS) connections[k] = !!cfg?.[k];
  return {
    ok: true, business_name: t?.business_name ?? "", status: t?.status ?? "", settings, connections,
    team: (team ?? []).filter((m: any) => m.active !== false).map((m: any) => ({
      handle: m.handle, name: m.name, phone: m.phone, ghl_contact_id: m.ghl_contact_id, ghl_user_id: m.ghl_user_id,
      personal_calendar_id: m.personal_calendar_id, talk_mode: m.talk_mode, talk_window_minutes: m.talk_window_minutes, gets_financials: !!m.gets_financials,
    })),
  };
}

async function settingsSave(tid: string, p: any) {
  const patch: Record<string, unknown> = {};
  const bad: string[] = [];
  const src = p.settings ?? p;
  for (const [k, type] of Object.entries(SETTINGS_FIELDS)) {
    if (!(k in src)) continue;
    const v = src[k];
    if (v === null || v === "") { patch[k] = null; continue; }
    if (type === "bool") patch[k] = v === true || String(v) === "true";
    else if (type === "int") { const n = parseInt(String(v), 10); Number.isFinite(n) ? patch[k] = n : bad.push(k); }
    else if (type === "num") { const n = Number(String(v).replace(/[£,%\s]/g, "")); if (!Number.isFinite(n)) bad.push(k); else patch[k] = (k === "show_rate" || k === "close_rate") && n > 1 ? n / 100 : n; }
    else if (type === "time") /^\d{1,2}:\d{2}$/.test(String(v)) ? patch[k] = String(v).padStart(5, "0") : bad.push(k);
    else if (type === "json") { try { patch[k] = typeof v === "string" ? JSON.parse(v) : v; } catch { bad.push(k); } }
    else patch[k] = String(v).slice(0, 4000);
  }
  if (patch.goal_date && !/^\d{4}-\d{2}-\d{2}$/.test(String(patch.goal_date))) { bad.push("goal_date"); delete patch.goal_date; }
  // Secrets: write-only
  if (String(src.stripe_key ?? "").startsWith("rk_")) patch.stripe_key = String(src.stripe_key).trim();
  else if (src.stripe_key) bad.push("stripe_key (must be a restricted key starting rk_)");
  if (String(src.fathom_api_key ?? "").trim().length > 10) patch.fathom_api_key = String(src.fathom_api_key).trim();
  if (src.business_name) await supabase.from("tenants").update({ business_name: String(src.business_name).slice(0, 120) }).eq("id", tid);
  if (src.trial_stage_name !== undefined && src.trial_stage_name) { const r: any = await setTrialStage(tid, { stage: src.trial_stage_name }); if (!r.ok) bad.push(`trial stage: ${r.text}`); delete patch.trial_stage_name; }
  if (Object.keys(patch).length) {
    const { error } = await supabase.from("tenant_config").update(patch).eq("tenant_id", tid);
    if (error) return { ok: false, error: error.message };
  }
  if (["mrr_target", "revenue_target", "goal_date", "avg_sale_value", "show_rate", "close_rate"].some((k) => k in patch)) await supabase.from("weekly_reports").delete().eq("tenant_id", tid).eq("is_final", false);
  return { ok: bad.length === 0, saved: Object.keys(patch).filter((k) => !SECRET_FIELDS.includes(k)), secrets_saved: Object.keys(patch).filter((k) => SECRET_FIELDS.includes(k)), problems: bad };
}

async function teamSave(tid: string, p: any) {
  const handle = String(p.handle ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
  if (!handle) return { ok: false, error: "handle required (e.g. sara)" };
  const row: Record<string, unknown> = { tenant_id: tid, handle, active: true };
  for (const k of ["name", "phone", "ghl_contact_id", "ghl_user_id", "personal_calendar_id", "talk_mode"]) if (p[k] !== undefined) row[k] = p[k] === "" ? null : String(p[k]).slice(0, 200);
  if (p.talk_window_minutes !== undefined) row.talk_window_minutes = Math.max(1, Math.min(60, parseInt(String(p.talk_window_minutes), 10) || 10));
  if (p.gets_financials !== undefined) row.gets_financials = p.gets_financials === true || String(p.gets_financials) === "true";
  if (row.talk_mode && !["all", "wake", "off"].includes(String(row.talk_mode))) return { ok: false, error: "talk_mode must be all, wake or off" };
  const { error } = await supabase.from("team_members").upsert(row, { onConflict: "tenant_id,handle" });
  return error ? { ok: false, error: error.message } : { ok: true };
}

async function teamArchive(tid: string, p: any) {
  const handle = String(p.handle ?? "").toLowerCase();
  const { data: m } = await supabase.from("team_members").select("gets_financials").eq("tenant_id", tid).eq("handle", handle).maybeSingle();
  if (!m) return { ok: false, error: "no such team member" };
  if (m.gets_financials) return { ok: false, error: "The owner can't be archived." };
  const { error } = await supabase.from("team_members").update({ active: false, talk_mode: "off" }).eq("tenant_id", tid).eq("handle", handle);
  return error ? { ok: false, error: error.message } : { ok: true, text: `${handle} archived — kept on file, Archie stops messaging them.` };
}

async function pickContacts(tid: string, query: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  if (!query.trim()) return { ok: true, contacts: [] };
  const r = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/contacts/?locationId=${cfg?.ghl_location_id}&query=${encodeURIComponent(query)}&limit=8`, "GET", undefined, "2021-07-28");
  return { ok: true, contacts: (r.json?.contacts ?? []).map((c: any) => ({ id: c.id, name: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.contactName || "", phone: c.phone ?? "", email: c.email ?? "" })) };
}
async function pickUsers(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const r = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/users/?locationId=${cfg?.ghl_location_id}`, "GET", undefined, "2021-07-28");
  return { ok: true, users: (r.json?.users ?? []).map((u: any) => ({ id: u.id, name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" "), email: u.email })) };
}
async function pickCalendars(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const r = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/calendars/?locationId=${cfg?.ghl_location_id}`, "GET", undefined, "2021-04-15");
  return { ok: true, calendars: (r.json?.calendars ?? []).map((c: any) => ({ id: c.id, name: c.name })) };
}
async function pickStages(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const r = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/opportunities/pipelines?locationId=${cfg?.ghl_location_id}`, "GET", undefined, "2021-07-28");
  return { ok: true, pipelines: (r.json?.pipelines ?? []).map((pp: any) => ({ id: pp.id, name: pp.name, stages: (pp.stages ?? []).map((st: any) => ({ id: st.id, name: st.name })) })) };
}

// ===================== v6.2: page login =====================
async function sha256(t: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
async function pinLogin(tid: string, sec: any, pin: string, who: string) {
  if (!sec?.page_pin_hash) return { ok: false, error: "No PIN set for this business yet." };
  if (sec.pin_locked_until && Date.parse(sec.pin_locked_until) > Date.now()) return { ok: false, error: "Too many wrong tries — locked for a few minutes." };
  if ((await sha256(`${tid}:${pin.trim()}`)) !== sec.page_pin_hash) {
    const fails = Number(sec.pin_fails ?? 0) + 1;
    await supabase.from("tenant_config").update({ pin_fails: fails >= 5 ? 0 : fails, pin_locked_until: fails >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null }).eq("tenant_id", tid);
    return { ok: false, error: fails >= 5 ? "Too many wrong tries — locked for 15 minutes." : "Wrong PIN." };
  }
  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
  await supabase.from("page_sessions").insert({ tenant_id: tid, token, who: who.slice(0, 60) || null, expires_at: new Date(Date.now() + 12 * 3600000).toISOString() });
  await supabase.from("tenant_config").update({ pin_fails: 0, pin_locked_until: null }).eq("tenant_id", tid);
  await supabase.from("page_sessions").delete().eq("tenant_id", tid).lt("expires_at", new Date().toISOString());
  return { ok: true, session: token, expires_in_hours: 12 };
}
async function pinSet(tid: string, p: any) {
  const pin = String(p.pin ?? "").trim();
  if (!/^\d{4,8}$/.test(pin)) return { ok: false, error: "PIN must be 4–8 digits." };
  await supabase.from("tenant_config").update({ page_pin_hash: await sha256(`${tid}:${pin}`), page_pin_required: p.required === undefined ? true : (p.required === true || String(p.required) === "true"), pin_fails: 0, pin_locked_until: null }).eq("tenant_id", tid);
  await supabase.from("page_sessions").delete().eq("tenant_id", tid); // everyone logs in again with the new PIN
  return { ok: true, text: "PIN saved — everyone will need it next time they open the pages." };
}

// ===================== v6.3: usage and costs =====================
// Estimated cost uses your rate per agent run (agency setting: est_cost_per_run_gbp, default 0.03) — update it once you see GHL's real bill.
async function usage(tid: string, month: string) {
  const m = /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
  const from = `${m}-01T00:00:00Z`;
  const [y, mm] = m.split("-").map(Number);
  const to = new Date(Date.UTC(y, mm, 1)).toISOString();
  const { data: rows } = await supabase.from("agent_usage").select("job, ok, ms, chars_in, chars_out").eq("tenant_id", tid).gte("created_at", from).lt("created_at", to).limit(20000);
  const { data: cfg } = await supabase.from("tenant_config").select("est_cost_per_run_gbp").eq("tenant_id", tid).maybeSingle();
  const rate = Number(cfg?.est_cost_per_run_gbp ?? 0) || 0.03;
  const byJob = new Map<string, { runs: number; failed: number; ms: number; chars: number }>();
  for (const r of rows ?? []) {
    const k = String(r.job); const v = byJob.get(k) ?? { runs: 0, failed: 0, ms: 0, chars: 0 };
    v.runs++; if (!r.ok) v.failed++; v.ms += Number(r.ms) || 0; v.chars += (Number(r.chars_in) || 0) + (Number(r.chars_out) || 0);
    byJob.set(k, v);
  }
  const runs = (rows ?? []).length;
  const jobs = [...byJob.entries()].sort((a, b) => b[1].runs - a[1].runs).map(([job, v]) => ({ job, runs: v.runs, failed: v.failed, avg_seconds: Math.round(v.ms / Math.max(1, v.runs) / 1000), chars: v.chars }));
  const est = Math.round(runs * rate * 100) / 100;
  const daysSoFar = m === new Date().toISOString().slice(0, 7) ? new Date().getUTCDate() : new Date(Date.UTC(y, mm, 0)).getUTCDate();
  const daysInMonth = new Date(Date.UTC(y, mm, 0)).getUTCDate();
  const projected = Math.round((est / Math.max(1, daysSoFar)) * daysInMonth * 100) / 100;
  return {
    ok: true, month: m, runs, est_cost_gbp: est, projected_month_gbp: projected, rate_per_run_gbp: rate, jobs,
    text: `Agent runs in ${m}: ${runs} (estimate £${est.toFixed(2)} so far, about £${projected.toFixed(2)} for the month at £${rate} a run).\n${jobs.slice(0, 10).map((j) => `${j.job}: ${j.runs} runs${j.failed ? `, ${j.failed} failed` : ""}, ~${j.avg_seconds}s each`).join("\n")}\n(Estimate — the real figure is on GHL's Agent Studio billing.)`,
  };
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
