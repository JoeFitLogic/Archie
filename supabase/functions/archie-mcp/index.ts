// archie-mcp v1.8 — Archie as an MCP server for GHL Managed Agents and Ask AI.
// URL: /functions/v1/archie-mcp/<tenant access_token>
// The token picks the tenant. Nothing from any other tenant is ever returned.
// v1.1: archie_notify — scheduled tasks and agents can message the owner (WhatsApp/SMS) and log to the Archie feed.
// v1.2: Talk to Archie toolbox — move tasks, capacity, quiet mode, day off (blocks the calendar), back on, calls on a day, run a skill, remember.
// v1.3: add/complete just act (no confirm step) — Talk to Archie's rules decide; tasks due today go straight onto today's list.
// v1.4: drafts and proposals by voice — list/send/skip drafts, list proposals, add/give/wait/drop a proposal.
// v1.8: personal events go on each person's Personal calendar as a real event (so Google sync picks them up);
//       personal events are never counted as calls, clashes or rebooks.
// v1.7: booking by voice — archie_calendars, archie_free_slots, archie_book_call (a contact onto a GHL calendar),
//       archie_personal_event (coffee, dentist… onto your own calendar, synced to Google).
// v1.6: pipeline by voice — archie_move_deal adds someone to a stage, moves a deal between stages, or marks it won / lost / abandoned.
// v1.5.1: rebook messages use the client link for clients and the lead link for everyone else.
// v1.5: rebook messages — archie_rebook_drafts drafts a 'can we move our call?' message for each call booked on days off.
// v1.4.1: only the latest batch of drafts counts (older unsent ones are ignored), so numbers match today's brief.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";
const TIERS = ["must", "high", "bonus"];
const NOTIFY_DAILY_CAP = 20;

const TOOLS = [
  {
    name: "archie_today",
    description: "Today's numbered task list for one team member, plus what they're waiting on and how many proposals are waiting. Use for 'what's on my list', 'what's left today'.",
    inputSchema: { type: "object", properties: { handle: { type: "string", description: "Team member handle, e.g. joe or sara. Leave out for the owner." } } },
  },
  {
    name: "archie_tasks",
    description: "List tasks by status: open, waiting, proposed, or done (done = completed in the last 7 days).",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["open", "waiting", "proposed", "done"] },
        handle: { type: "string", description: "Only this team member's tasks. Leave out for everyone's." },
        limit: { type: "number", description: "Max tasks to return, default 20, max 50." },
      },
    },
  },
  {
    name: "archie_add_task",
    description: "Add a task when someone asks for one. Just do it — no need to confirm. Title is just the job; set tier, effort_minutes and due_date (YYYY-MM-DD, today's date for 'today') from what they said.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        tier: { type: "string", enum: ["must", "high", "bonus"] },
        effort_minutes: { type: "number" },
        due_date: { type: "string", description: "YYYY-MM-DD" },
        handle: { type: "string", description: "Who the task is for. Leave out for the owner." },
      },
      required: ["title"],
    },
  },
  {
    name: "archie_complete_task",
    description: "Mark a task done, by its number on today's list (rank) or by part of its title. Just do it when they say it's done; if more than one task matches, ask which.",
    inputSchema: {
      type: "object",
      properties: {
        rank: { type: "number", description: "The task's number on today's list." },
        title: { type: "string", description: "Part of the task title." },
        handle: { type: "string" },
      },
    },
  },
  {
    name: "archie_numbers",
    description: "Business numbers from Archie: MRR, new MRR, cash, pipeline, stale deals, failed payments, active clients, and MRR change over the period. Always use this for numbers, never guess.",
    inputSchema: { type: "object", properties: { days: { type: "number", description: "How many days back, default 7, max 60." } } },
  },
  {
    name: "archie_notify",
    description: "Send the business owner a short message on their phone (WhatsApp or SMS, whichever they chose) and save it to the Archie feed. Use at the end of every scheduled task to report what you found, and whenever something needs the owner's attention. Keep it short: a title and 1–5 lines.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short title, e.g. 'Call notes — 2 calls' or 'Midday check'." },
        message: { type: "string", description: "The summary, 1–5 short lines. Plain text." },
        urgent: { type: "boolean", description: "True only if it can't wait — sends even when the owner is in quiet mode." },
      },
      required: ["title", "message"],
    },
  },
  {
    name: "archie_drafts",
    description: "Message drafts waiting to be sent (the 'Ready to send' list in the brief), numbered.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "archie_send_draft",
    description: "Send one waiting draft to the customer — only when the owner has clearly said to send it (e.g. 'send the Jase message', 'send 1'). Find it by number or the person's name.",
    inputSchema: { type: "object", properties: { rank: { type: "number" }, name: { type: "string", description: "The person the draft is for." } } },
  },
  {
    name: "archie_skip_draft",
    description: "Bin a waiting draft without sending it. Find it by number or the person's name.",
    inputSchema: { type: "object", properties: { rank: { type: "number" }, name: { type: "string" } } },
  },
  {
    name: "archie_proposals",
    description: "Things Archie spotted in messages that might need doing, numbered P1, P2… (the 'From your messages' list).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "archie_proposal",
    description: "Decide on a proposal. action: add (task for the person talking), give (task for someone else — set to_handle, e.g. sara), wait (waiting on someone else), drop (bin it). Find it by P number or part of its title.",
    inputSchema: {
      type: "object",
      properties: {
        rank: { type: "number", description: "The P number (P2 → 2)." },
        title: { type: "string" },
        action: { type: "string", enum: ["add", "give", "wait", "drop"] },
        to_handle: { type: "string", description: "Who it's for when action is give." },
        tier: { type: "string", enum: ["must", "high", "bonus"] },
        waiting_for: { type: "string", description: "Who you're waiting on, for wait." },
        handle: { type: "string" },
      },
      required: ["action"],
    },
  },
  {
    name: "archie_move_task",
    description: "Move a task to another day (or back to 'not planned yet'). Find it by its number on today's list (rank) or part of its title. Just do it and say what you did.",
    inputSchema: {
      type: "object",
      properties: {
        rank: { type: "number", description: "The task's number on today's list." },
        title: { type: "string", description: "Part of the task title." },
        date: { type: "string", description: "YYYY-MM-DD, or 'backlog' for not planned yet." },
        handle: { type: "string", description: "Whose task. Leave out for the person talking." },
      },
      required: ["date"],
    },
  },
  {
    name: "archie_capacity",
    description: "Set how many minutes someone can work on a day (e.g. 'I've only got 2 hours tomorrow' → 120). Use archie_day_off for a whole day off.",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", description: "YYYY-MM-DD" }, minutes: { type: "number" }, handle: { type: "string" } },
      required: ["date", "minutes"],
    },
  },
  {
    name: "archie_quiet",
    description: "Quiet mode — Archie only messages if something is urgent. until = YYYY-MM-DD (quiet up to and including that day), or 'off'.",
    inputSchema: { type: "object", properties: { until: { type: "string" }, handle: { type: "string" } }, required: ["until"] },
  },
  {
    name: "archie_day_off",
    description: "Take a day (or part of a day, or several days) off: blocks the person's GHL calendar so nobody can book them, sets their capacity to 0, moves that day's tasks to the next working day, and lists any calls already booked that day. Use for 'I'm off Friday', 'block Thursday 2 till 4', 'I'm away Monday to Wednesday'.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "First day off, YYYY-MM-DD" },
        end_date: { type: "string", description: "Last day off, YYYY-MM-DD (leave out for one day)" },
        from: { type: "string", description: "Start time HH:MM for part of a day (leave out for the whole day)" },
        to: { type: "string", description: "End time HH:MM for part of a day" },
        handle: { type: "string" },
      },
      required: ["date"],
    },
  },
  {
    name: "archie_rebook_drafts",
    description: "When a day off clashes with calls already booked: draft a friendly 'can we move our call?' message for each person, saved as drafts to send. Use the same dates (and times for part days) as the day off. Then ask 'Send them?' and use archie_send_draft for each.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD" },
        end_date: { type: "string" },
        from: { type: "string", description: "HH:MM for part of a day" },
        to: { type: "string" },
        reason: { type: "string", description: "Optional short reason to mention, e.g. 'something's come up'." },
        handle: { type: "string" },
      },
      required: ["date"],
    },
  },
  {
    name: "archie_move_deal",
    description: "Pipeline by voice. Find a person's deal and: move it to a stage ('move Martin to proposal sent'), add them to a stage if they have no open deal ('add Ross McKenley to follow up'), or change its status — won, lost, abandoned or open ('move Jase to abandoned', 'mark Martin won'). For won/lost/abandoned, confirm with the owner first because won starts onboarding.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The person's name." },
        stage: { type: "string", description: "Stage name, e.g. 'follow up', 'proposal sent'." },
        status: { type: "string", enum: ["won", "lost", "abandoned", "open"] },
        reason: { type: "string", description: "Why (for lost/abandoned) — saved as a note." },
        value: { type: "number", description: "Deal value, if they said one (for a new deal)." },
      },
      required: ["name"],
    },
  },
  {
    name: "archie_calendars",
    description: "List the business's GHL calendars (e.g. Diagnostic Call, Support Call) with their length.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "archie_free_slots",
    description: "Next free times on a calendar, matched by name ('diagnostic', 'support'). Optional date (YYYY-MM-DD) to start from, and days to look ahead (default 5).",
    inputSchema: { type: "object", properties: { calendar: { type: "string" }, date: { type: "string" }, days: { type: "number" } }, required: ["calendar"] },
  },
  {
    name: "archie_book_call",
    description: "Book a contact onto a GHL calendar at a date and time. The contact gets the calendar's normal confirmation, so confirm with the owner first ('Book Martin, diagnostic call, Thursday 2pm? Yes?').",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The contact's name." },
        calendar: { type: "string", description: "Calendar name or word, e.g. diagnostic, support." },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM, 24-hour" },
      },
      required: ["name", "calendar", "date", "time"],
    },
  },
  {
    name: "archie_personal_event",
    description: "Put a personal event in the person's own calendar (coffee with Dave, dentist, school run) — it blocks that time so nobody books over it, and syncs to their Google Calendar. Just do it, no need to confirm.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        from: { type: "string", description: "HH:MM" },
        to: { type: "string", description: "HH:MM (default one hour after from)" },
        handle: { type: "string" },
      },
      required: ["title", "date", "from"],
    },
  },
  {
    name: "archie_back_on",
    description: "Undo a day off: removes the calendar blocks Archie made for those days and restores normal capacity. Use for 'actually I'm working Friday'.",
    inputSchema: { type: "object", properties: { date: { type: "string" }, end_date: { type: "string" }, handle: { type: "string" } }, required: ["date"] },
  },
  {
    name: "archie_calls",
    description: "Calls and appointments booked for someone on a day (default today).",
    inputSchema: { type: "object", properties: { date: { type: "string" }, handle: { type: "string" } } },
  },
  {
    name: "archie_run_skill",
    description: "Run one of Archie's skills and return the result, e.g. write-post, create-reel-script, create-carousel, hook-generator, stories, repurpose, write-proposal, reply-to-objection, write-sop, delegate-brief. Takes up to a minute. Put everything the skill needs in input.",
    inputSchema: { type: "object", properties: { skill: { type: "string" }, input: { type: "string" } }, required: ["skill", "input"] },
  },
  {
    name: "archie_remember",
    description: "Save a lasting fact about the business or how the owner likes things done ('remember that…'). Archie uses these in future conversations.",
    inputSchema: { type: "object", properties: { fact: { type: "string" } }, required: ["fact"] },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const token = new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";
  if (!token || token === "archie-mcp") return unauth();
  const { data: tenant } = await supabase.from("tenants").select("id, status, business_name").eq("access_token", token).maybeSingle();
  if (!tenant || tenant.status !== "active") return unauth();

  let body: any;
  try { body = await req.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); }

  const batch = Array.isArray(body) ? body : [body];
  const out: any[] = [];
  for (const msg of batch) { const r = await handle({ ...tenant, token }, msg); if (r) out.push(r); }
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return json(Array.isArray(body) ? out : out[0]);
});

async function handle(tenant: any, msg: any) {
  const id = msg?.id;
  if (id === undefined || id === null) return null; // notification
  const method = String(msg?.method ?? "");
  if (method === "initialize") {
    return ok(id, {
      protocolVersion: msg?.params?.protocolVersion ?? "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "archie", version: "1.8.0" },
    });
  }
  if (method === "ping") return ok(id, {});
  if (method === "tools/list") return ok(id, { tools: TOOLS });
  if (method === "tools/call") {
    const name = String(msg?.params?.name ?? "");
    const args = msg?.params?.arguments ?? {};
    try {
      const text = await run(tenant, name, args);
      return ok(id, { content: [{ type: "text", text }] });
    } catch (e) {
      return ok(id, { content: [{ type: "text", text: `Error: ${String(e)}` }], isError: true });
    }
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}

async function run(tenant: any, name: string, a: any): Promise<string> {
  const tid = tenant.id;
  const { data: cfg } = await supabase.from("tenant_config").select("timezone, mrr_target, brief_channel, ghl_token, ghl_location_id, ghl_user_id").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const { data: team } = await supabase.from("team_members").select("handle, name, gets_financials, ghl_contact_id, quiet_until").eq("tenant_id", tid);
  const ownerRow = (team ?? []).find((m) => m.gets_financials);
  const owner = ownerRow?.handle ?? "owner";
  const resolve = (h: unknown) => {
    const s = String(h ?? "").trim().toLowerCase();
    if (!s) return owner;
    const m = (team ?? []).find((x) => x.handle.toLowerCase() === s || String(x.name ?? "").toLowerCase().split(" ")[0] === s);
    if (!m) throw new Error(`No team member "${h}". Team: ${(team ?? []).map((x) => x.handle).join(", ")}`);
    return m.handle;
  };

  if (name === "archie_today") {
    const h = resolve(a.handle);
    const [{ data: list }, { data: waiting }, { count: proposals }, { count: doneToday }, { count: otherOpen }] = await Promise.all([
      supabase.from("tasks").select("title, tier, effort_minutes, today_rank, rollover_count").eq("tenant_id", tid).eq("owner", h).eq("today", true).in("status", ["open", "doing"]).order("today_rank", { ascending: true }),
      supabase.from("tasks").select("title, waiting_for, waiting_since").eq("tenant_id", tid).eq("owner", h).eq("status", "waiting"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "proposed"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("owner", h).eq("status", "done").gte("completed_at", `${today}T00:00:00`),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("owner", h).eq("today", false).in("status", ["open", "doing"]),
    ]);
    const lines = [`Today (${today}) for ${h}:`];
    if (!list?.length) lines.push("Nothing left on today's list.");
    for (const t of list ?? []) lines.push(`#${t.today_rank ?? "-"} ${t.title} [${t.tier}, ${t.effort_minutes ?? 30} min${(t.rollover_count ?? 0) > 0 ? `, rolled ${t.rollover_count}x` : ""}]`);
    lines.push(`Done today: ${doneToday ?? 0}`);
    if (waiting?.length) lines.push(`Waiting on others: ${waiting.map((w) => `${w.waiting_for ?? "someone"} — ${w.title}${w.waiting_since ? ` (since ${w.waiting_since})` : ""}`).join("; ")}`);
    lines.push(`Other open tasks not on today's list: ${otherOpen ?? 0}`);
    lines.push(`Proposals waiting: ${proposals ?? 0}`);
    return lines.join("\n");
  }

  if (name === "archie_tasks") {
    const status = String(a.status ?? "open");
    const limit = Math.max(1, Math.min(50, Number(a.limit) || 20));
    let q = supabase.from("tasks").select("title, tier, status, owner, effort_minutes, due_date, today_rank, completed_at, waiting_for").eq("tenant_id", tid);
    if (status === "open") q = q.in("status", ["open", "doing"]);
    else if (status === "done") q = q.eq("status", "done").gte("completed_at", new Date(Date.now() - 7 * 86400000).toISOString());
    else if (status === "waiting" || status === "proposed") q = q.eq("status", status);
    else throw new Error("status must be open, waiting, proposed or done");
    if (a.handle) q = q.eq("owner", resolve(a.handle));
    const { data } = await q.order("created_at", { ascending: false }).limit(limit);
    if (!data?.length) return `No ${status} tasks.`;
    return data.map((t) => `- ${t.title} [${t.tier}${t.owner ? `, ${t.owner}` : ""}${t.due_date ? `, due ${t.due_date}` : ""}${t.today_rank ? `, today #${t.today_rank}` : ""}${t.waiting_for ? `, waiting on ${t.waiting_for}` : ""}${t.completed_at ? `, done ${String(t.completed_at).slice(0, 10)}` : ""}]`).join("\n");
  }

  if (name === "archie_add_task") {
    const title = String(a.title ?? "").trim();
    if (!title) throw new Error("title required");
    const h = resolve(a.handle);
    const tier = TIERS.includes(a.tier) ? a.tier : "high";
    const eff = Number(a.effort_minutes);
    const effort = Number.isFinite(eff) && eff > 0 ? Math.max(15, Math.round(eff / 15) * 15) : 30;
    const due = /^\d{4}-\d{2}-\d{2}$/.test(String(a.due_date ?? "")) ? a.due_date : null;
    const { error } = await supabase.from("tasks").insert({
      tenant_id: tid, title: title.slice(0, 200), detail: "Added via Archie MCP", tier, kind: "shallow",
      effort_minutes: effort, status: "open", owner: h, source: "mcp", source_ref: `mcp:${crypto.randomUUID()}`, due_date: due,
      ...(due === today ? { today: true, today_set_on: today } : {}),
    });
    if (error) throw new Error(error.message);
    return `Added: ${title} — ${tier}, ${effort} min, for ${h}${due ? `, due ${due}` : ""}`;
  }

  if (name === "archie_complete_task") {
    const h = resolve(a.handle);
    let hits: any[] = [];
    if (a.rank !== undefined && a.rank !== null && a.rank !== "") {
      const { data } = await supabase.from("tasks").select("id, title").eq("tenant_id", tid).eq("owner", h).eq("today", true).eq("today_rank", Number(a.rank)).in("status", ["open", "doing"]);
      hits = data ?? [];
      if (!hits.length) return `No task numbered ${a.rank} on ${h}'s list today.`;
    } else if (String(a.title ?? "").trim()) {
      const { data } = await supabase.from("tasks").select("id, title").eq("tenant_id", tid).in("status", ["open", "doing", "waiting"]).ilike("title", `%${String(a.title).trim()}%`).limit(3);
      hits = data ?? [];
      if (!hits.length) return `No open task matching "${a.title}".`;
      if (hits.length > 1) return `More than one match: ${hits.map((x) => `"${x.title}"`).join(" / ")}. Ask which one.`;
    } else throw new Error("rank or title required");
    await supabase.from("tasks").update({ status: "done", completed_at: new Date().toISOString() }).in("id", hits.map((x) => x.id));
    await supabase.rpc("bump_activity", { p_tenant: tid, p_day: today, p_field: "tasks_done", p_n: hits.length });
    return `Done: ${hits.map((x) => x.title).join(" · ")}`;
  }

  if (name === "archie_numbers") {
    const days = Math.max(1, Math.min(60, Number(a.days) || 7));
    const { data: rows } = await supabase.from("daily_metrics").select("*").eq("tenant_id", tid).order("metric_date", { ascending: false }).limit(days);
    if (!rows?.length) return "No numbers recorded yet.";
    const latest = rows[0];
    const oldest = rows[rows.length - 1];
    const g = (k: string) => (latest[k] === null || latest[k] === undefined ? null : Number(latest[k]));
    const lines = [`Numbers as of ${latest.metric_date}:`];
    const add = (label: string, k: string, money = true) => { const v = g(k); if (v !== null) lines.push(`${label}: ${money ? "£" : ""}${Math.round(v * 100) / 100}`); };
    add("MRR", "mrr"); add("New MRR this month", "mrr_new"); add("Cash in last 24h", "cash_24h");
    add("Pipeline value", "pipeline_value"); add("Open deals", "pipeline_open", false); add("Stale deals", "stale_count", false); add("Stale value", "stale_value");
    add("Failed payments", "failed_count", false); add("Failed value", "failed_value"); add("Active clients", "clients_active", false);
    add("Appointments today", "appointments", false); add("Unread conversations", "unread", false);
    if (latest.mrr !== null && oldest.mrr !== null && oldest !== latest) {
      const d = Number(latest.mrr) - Number(oldest.mrr);
      lines.push(`MRR change since ${oldest.metric_date}: ${d >= 0 ? "+" : "-"}£${Math.abs(Math.round(d))}`);
    }
    if (cfg?.mrr_target && latest.mrr !== null) lines.push(`Target: £${cfg.mrr_target} (${Math.round((Number(latest.mrr) / Number(cfg.mrr_target)) * 100)}%)`);
    return lines.join("\n");
  }

  if (name === "archie_notify") {
    const title = String(a.title ?? "").trim().slice(0, 120);
    const message = String(a.message ?? "").trim().slice(0, 1200);
    if (!title || !message) throw new Error("title and message required");
    const urgent = a.urgent === true || String(a.urgent) === "true";

    const { count: sentToday } = await supabase.from("notifications").select("id", { count: "exact", head: true })
      .eq("tenant_id", tid).eq("sent", true).gte("created_at", `${today}T00:00:00`);
    const quiet = !!ownerRow?.quiet_until && String(ownerRow.quiet_until) >= today;
    const channel = String(cfg?.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";

    let sent = false, why = "";
    if (quiet && !urgent) why = "owner in quiet mode — saved to the feed only";
    else if ((sentToday ?? 0) >= NOTIFY_DAILY_CAP) why = "daily message limit reached — saved to the feed only";
    else if (!ownerRow?.ghl_contact_id) why = "owner contact not set — saved to the feed only";
    else {
      const ghlToken = cfg?.ghl_token || FALLBACK_TOKEN;
      const r = await ghl(ghlToken, "/conversations/messages", "POST", { type: channel, contactId: ownerRow.ghl_contact_id, message: `${title}\n\n${message}` });
      sent = r.ok;
      if (!r.ok) why = `couldn't send (${r.status}) — saved to the feed only`;
    }

    await supabase.from("notifications").insert({
      tenant_id: tid, source: "mcp", title, body: message, channel: channel.toLowerCase(), urgent, sent, error: sent ? null : why,
    });
    return sent ? `Sent to the owner on ${channel} and saved to the Archie feed.` : `Not sent: ${why}.`;
  }


  const ghlToken = cfg?.ghl_token || FALLBACK_TOKEN;
  const isDate = (v: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? ""));
  const addDays = (d: string, n: number) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const weekday = (d: string) => new Date(`${d}T12:00:00Z`).getUTCDay();
  const findTask = async (h: string, rank: unknown, title: unknown) => {
    if (rank !== undefined && rank !== null && rank !== "") {
      const { data } = await supabase.from("tasks").select("id, title").eq("tenant_id", tid).eq("owner", h).eq("today", true).eq("today_rank", Number(rank)).in("status", ["open", "doing"]);
      return data ?? [];
    }
    if (String(title ?? "").trim()) {
      const { data } = await supabase.from("tasks").select("id, title").eq("tenant_id", tid).in("status", ["open", "doing", "waiting"]).ilike("title", `%${String(title).trim()}%`).limit(3);
      return data ?? [];
    }
    throw new Error("rank or title required");
  };

  // Drafts: only the newest batch (the one in today's brief) — older unsent drafts are ignored
  const latestDrafts = async () => {
    const { data: newest } = await supabase.from("message_drafts").select("created_on").eq("tenant_id", tid).eq("status", "pending").order("created_on", { ascending: false }).limit(1).maybeSingle();
    if (!newest?.created_on) return [] as any[];
    const { data } = await supabase.from("message_drafts").select("*").eq("tenant_id", tid).eq("status", "pending").eq("created_on", newest.created_on).order("rank", { ascending: true }).limit(10);
    return data ?? [];
  };

  if (name === "archie_drafts") {
    const data = await latestDrafts();
    if (!data.length) return "No drafts waiting.";
    return data.map((d: any) => `${d.rank}. ${d.name} (${d.channel}): ${String(d.body ?? "").slice(0, 160)}`).join("\n");
  }

  if (name === "archie_send_draft" || name === "archie_skip_draft") {
    const byRank = a.rank !== undefined && a.rank !== null && a.rank !== "";
    const batch = await latestDrafts();
    let hits: any[];
    if (byRank) hits = batch.filter((d: any) => Number(d.rank) === Number(a.rank));
    else if (String(a.name ?? "").trim()) hits = batch.filter((d: any) => String(d.name ?? "").toLowerCase().includes(String(a.name).trim().toLowerCase()));
    else throw new Error("rank or name required");
    if (!hits?.length) return "No matching draft waiting.";
    if (hits.length > 1 && !byRank) return `More than one draft matches: ${hits.map((d: any) => `${d.rank}. ${d.name}`).join(" / ")}. Ask which one.`;
    const d: any = hits[0];
    if (name === "archie_skip_draft") {
      await supabase.from("message_drafts").update({ status: "dismissed" }).eq("id", d.id);
      return `Binned draft ${d.rank} to ${d.name}.`;
    }
    const type = ({ WA: "WhatsApp", SMS: "SMS", IG: "IG", FB: "FB", Chat: "Live_Chat" } as Record<string, string>)[d.channel];
    if (!type) return `Draft ${d.rank} is for ${d.channel}, which Archie can't send — send it from GHL: ${d.body}`;
    const r = await ghl(ghlToken, "/conversations/messages", "POST", { type, contactId: d.contact_id, message: d.body });
    if (!r.ok) return `Couldn't send draft ${d.rank} (${r.status}). Send it from GHL: ${d.body}`;
    await supabase.from("message_drafts").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", d.id);
    return `Sent to ${d.name} on ${type}.`;
  }

  if (name === "archie_proposals") {
    // Same numbering as the brief and inbox: keep existing P numbers; number any new ones after them
    const { data: props } = await supabase.from("tasks").select("id, title, proposal_rank, created_at").eq("tenant_id", tid).eq("status", "proposed").order("created_at", { ascending: false }).limit(10);
    if (!props?.length) return "Nothing new from your messages.";
    let next = Math.max(0, ...props.map((p: any) => Number(p.proposal_rank) || 0));
    for (const p of props as any[]) {
      if (!p.proposal_rank) { next++; p.proposal_rank = next; await supabase.from("tasks").update({ proposal_rank: next }).eq("id", p.id); }
    }
    return (props as any[]).sort((x, y) => x.proposal_rank - y.proposal_rank).map((p) => `P${p.proposal_rank} ${p.title}`).join("\n");
  }

  if (name === "archie_proposal") {
    const h = resolve(a.handle);
    let hits: any[] = [];
    if (a.rank !== undefined && a.rank !== null && a.rank !== "") {
      const { data } = await supabase.from("tasks").select("id, title, client_id").eq("tenant_id", tid).eq("status", "proposed").eq("proposal_rank", Number(a.rank));
      hits = data ?? [];
    } else if (String(a.title ?? "").trim()) {
      const { data } = await supabase.from("tasks").select("id, title, client_id").eq("tenant_id", tid).eq("status", "proposed").ilike("title", `%${String(a.title).trim()}%`).limit(3);
      hits = data ?? [];
    } else throw new Error("rank or title required");
    if (!hits.length) return "No matching proposal — the list may have changed. Ask 'what did you spot in my messages?' to see the current list.";
    if (hits.length > 1) return `More than one proposal matches: ${hits.map((x) => `"${x.title}"`).join(" / ")}. Ask which one.`;
    const p = hits[0];
    const now = new Date().toISOString();
    const action = String(a.action ?? "").toLowerCase();
    if (action === "drop") {
      await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "dropped via Archie", proposal_rank: null }).eq("id", p.id);
      return `Dropped: ${p.title}`;
    }
    if (action === "wait") {
      let who = String(a.waiting_for ?? "").trim();
      if (!who && p.client_id) { const { data: cl } = await supabase.from("clients").select("name").eq("id", p.client_id).maybeSingle(); who = cl?.name ?? ""; }
      await supabase.from("tasks").update({ status: "waiting", owner: h, waiting_for: who || "them", waiting_since: today, accepted_by: h, accepted_at: now, proposal_rank: null }).eq("id", p.id);
      return `Waiting on ${who || "them"}: ${p.title}. I'll nudge after 5 days.`;
    }
    if (action === "add" || action === "give") {
      if (action === "give" && !String(a.to_handle ?? "").trim()) throw new Error("to_handle required for give");
      const owner = action === "give" ? resolve(a.to_handle) : h;
      const patch: Record<string, unknown> = { status: "open", owner, accepted_by: h, accepted_at: now, proposal_rank: null };
      if (["must", "high", "bonus"].includes(String(a.tier ?? ""))) patch.tier = a.tier;
      await supabase.from("tasks").update(patch).eq("id", p.id);
      return `Added${owner !== h ? ` for ${owner}` : ""}: ${p.title}`;
    }
    throw new Error("action must be add, give, wait or drop");
  }

  if (name === "archie_move_task") {
    const h = resolve(a.handle);
    const hits = await findTask(h, a.rank, a.title);
    if (!hits.length) return "No matching open task.";
    if (hits.length > 1) return `More than one match: ${hits.map((x) => `"${x.title}"`).join(" / ")}. Ask which one.`;
    const date = String(a.date ?? "").toLowerCase();
    if (date === "backlog") {
      await supabase.from("tasks").update({ due_date: null, today: false, today_rank: null }).eq("id", hits[0].id);
      return `Moved "${hits[0].title}" to not planned yet.`;
    }
    if (!isDate(date)) throw new Error("date must be YYYY-MM-DD or backlog");
    await supabase.from("tasks").update({ due_date: date, today: date === today, today_rank: null, ...(date === today ? { today_set_on: today } : {}) }).eq("id", hits[0].id);
    return `Moved "${hits[0].title}" to ${date}.`;
  }

  if (name === "archie_capacity") {
    const h = resolve(a.handle);
    if (!isDate(a.date)) throw new Error("date required (YYYY-MM-DD)");
    const minutes = Math.max(0, Math.min(1440, Math.round(Number(a.minutes) || 0)));
    const { error } = await supabase.from("capacity").upsert({ tenant_id: tid, handle: h, day: a.date, minutes, note: "set via Archie" }, { onConflict: "tenant_id,handle,day" });
    if (error) throw new Error(error.message);
    return `${h}'s capacity on ${a.date} set to ${minutes} min.`;
  }

  if (name === "archie_quiet") {
    const h = resolve(a.handle);
    const until = String(a.until ?? "").toLowerCase();
    if (until === "off") { await supabase.from("team_members").update({ quiet_until: null }).eq("tenant_id", tid).eq("handle", h); return "Quiet mode off."; }
    if (!isDate(until)) throw new Error("until must be YYYY-MM-DD or off");
    await supabase.from("team_members").update({ quiet_until: until }).eq("tenant_id", tid).eq("handle", h);
    return `Quiet until the end of ${until} — only urgent messages until then.`;
  }

  if (name === "archie_calls") {
    const h = resolve(a.handle);
    const date = isDate(a.date) ? String(a.date) : today;
    const calls = await callsOn(tid, ghlToken, cfg, h, date, tz);
    if (calls.error) return `Couldn't read the calendar: ${calls.error}`;
    return calls.items.length ? `Calls on ${date}: ${calls.items.map((x) => `${x.time} ${x.title}`).join("; ")}` : `No calls booked on ${date}.`;
  }

  if (name === "archie_day_off") {
    const h = resolve(a.handle);
    if (!isDate(a.date)) throw new Error("date required (YYYY-MM-DD)");
    const end = isDate(a.end_date) ? String(a.end_date) : String(a.date);
    const partDay = /^\d{1,2}:\d{2}$/.test(String(a.from ?? "")) && /^\d{1,2}:\d{2}$/.test(String(a.to ?? ""));
    const days: string[] = [];
    for (let d = String(a.date); d <= end && days.length < 14; d = addDays(d, 1)) days.push(d);
    const lines: string[] = [];

    // 1. Block the calendar
    const userId = await ghlUserId(tid, ghlToken, cfg, h);
    let blocked = 0; const blockErrors: string[] = [];
    for (const d of days) {
      const start = partDay ? String(a.from) : "00:00";
      const finish = partDay ? String(a.to) : "23:59";
      if (!userId) { blockErrors.push(`no GHL user set for ${h} — add their ghl_user_id in team_members`); break; }
      const r = await ghl(ghlToken, "/calendars/events/block-slots", "POST", {
        locationId: cfg?.ghl_location_id, assignedUserId: userId, title: "Off — set by Archie",
        startTime: isoAt(d, start, tz), endTime: isoAt(d, finish, tz),
      });
      const eventId = r.json?.id ?? r.json?.event?.id ?? r.json?._id ?? null;
      if (r.ok && eventId) {
        blocked++;
        await supabase.from("archie_blocks").insert({ tenant_id: tid, handle: h, day: d, event_id: String(eventId) });
      } else blockErrors.push(`${d}: ${r.status} ${r.text.slice(0, 120)}`);
    }
    lines.push(blocked ? `📅 Calendar blocked (${blocked} day${blocked > 1 ? "s" : ""}) — no new bookings` : `📅 Couldn't block the calendar (${blockErrors[0] ?? "unknown"})`);

    // 2. Capacity and 3. tasks (whole days only)
    if (!partDay) {
      for (const d of days) await supabase.from("capacity").upsert({ tenant_id: tid, handle: h, day: d, minutes: 0, note: "Day off (Archie)" }, { onConflict: "tenant_id,handle,day" });
      let next = addDays(end, 1);
      for (let i = 0; i < 7 && (weekday(next) === 0 || weekday(next) === 6); i++) next = addDays(next, 1);
      const { data: moving } = await supabase.from("tasks").select("id").eq("tenant_id", tid).eq("owner", h).in("status", ["open", "doing"]).gte("due_date", String(a.date)).lte("due_date", end);
      if (moving?.length) await supabase.from("tasks").update({ due_date: next, today: next === today, today_rank: null }).in("id", moving.map((x) => x.id));
      lines.push(`✅ ${moving?.length ?? 0} task${(moving?.length ?? 0) === 1 ? "" : "s"} moved to ${next}`);
    } else {
      lines.push(`⏱ ${a.from}–${a.to} blocked; the rest of the day stays as planned`);
    }

    // 4. Calls already booked
    const booked: string[] = [];
    for (const d of days) {
      const calls = await callsOn(tid, ghlToken, cfg, h, d, tz);
      for (const x of calls.items) {
        if (partDay && (x.time < String(a.from) || x.time >= String(a.to))) continue;
        booked.push(`${d} ${x.time} ${x.title}`);
      }
    }
    if (booked.length) lines.push(`⚠️ Already booked: ${booked.join("; ")} — ask if they want rebook messages drafted`);
    return lines.join("\n");
  }

  if (name === "archie_rebook_drafts") {
    const h = resolve(a.handle);
    if (!isDate(a.date)) throw new Error("date required (YYYY-MM-DD)");
    const end = isDate(a.end_date) ? String(a.end_date) : String(a.date);
    const partDay = /^\d{1,2}:\d{2}$/.test(String(a.from ?? "")) && /^\d{1,2}:\d{2}$/.test(String(a.to ?? ""));
    const { data: link } = await supabase.from("tenant_config").select("booking_link, booking_link_client, booking_link_lead, brief_channel").eq("tenant_id", tid).maybeSingle();
    const { data: activeClients } = await supabase.from("clients").select("ghl_contact_id").eq("tenant_id", tid).eq("status", "active");
    const clientIds = new Set((activeClients ?? []).map((c: any) => String(c.ghl_contact_id)));
    const clashes: any[] = [];
    for (let d = String(a.date); d <= end && clashes.length < 20; d = addDays(d, 1)) {
      const calls = await callsOn(tid, ghlToken, cfg, h, d, tz);
      for (const x of calls.items) {
        if (partDay && (x.time < String(a.from) || x.time >= String(a.to))) continue;
        if (x.contactId) clashes.push(x);
      }
    }
    if (!clashes.length) return "No booked calls with contacts on those days — nothing to rebook.";
    // Add to today's drafts, numbered after anything already waiting
    const { data: existing } = await supabase.from("message_drafts").select("rank").eq("tenant_id", tid).eq("status", "pending").eq("created_on", today);
    let rank = Math.max(0, ...(existing ?? []).map((r: any) => Number(r.rank) || 0));
    const made: string[] = []; const failed: string[] = [];
    const channel = String(link?.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WA" : "SMS";
    for (const x of clashes) {
      const c = await ghl(ghlToken, `/contacts/${x.contactId}`, "GET");
      const first = String(c.json?.contact?.firstName ?? c.json?.contact?.contactName ?? "there").split(" ")[0] || "there";
      const full = [c.json?.contact?.firstName, c.json?.contact?.lastName].filter(Boolean).join(" ") || x.title;
      const when = new Date(`${x.date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
      const isClient = clientIds.has(String(x.contactId));
      const bookUrl = (isClient ? link?.booking_link_client : link?.booking_link_lead) || link?.booking_link || "";
      const body = `Hi ${first}, ${String(a.reason ?? "").trim() || "something's come up"} and I can't make our call on ${when} at ${x.time} — sorry about that. Can we move it?${bookUrl ? ` Grab a new time that suits you here: ${bookUrl}` : " Let me know a couple of times that work for you."}`;
      rank++;
      const { error } = await supabase.from("message_drafts").insert({ tenant_id: tid, rank, name: full, channel, body, contact_id: x.contactId, status: "pending", created_on: today });
      if (error) { failed.push(`${full} (${error.message})`); rank--; } else made.push(`${rank}. ${full} (${isClient ? "client" : "lead"}) — ${when} ${x.time}`);
    }
    return [made.length ? `Drafted rebook messages:\n${made.join("\n")}` : "", failed.length ? `Couldn't draft: ${failed.join("; ")}` : "", made.length ? "Ask if they want them sent (archie_send_draft for each number)." : ""].filter(Boolean).join("\n");
  }

  if (name === "archie_move_deal") {
    const who = String(a.name ?? "").trim();
    if (!who) throw new Error("name required");
    const loc = cfg?.ghl_location_id;
    const V = "2021-07-28";
    // The person
    const cs = await ghl(ghlToken, `/contacts/?locationId=${loc}&query=${encodeURIComponent(who)}&limit=5`, "GET", undefined, V);
    const people: any[] = cs.json?.contacts ?? [];
    const nameOf = (c: any) => [c.firstName, c.lastName].filter(Boolean).join(" ") || c.contactName || c.email || "Contact";
    if (!people.length) return `I can't find anyone called ${who} in your contacts.`;
    const exact = people.filter((c) => nameOf(c).toLowerCase() === who.toLowerCase());
    const pick = exact.length === 1 ? exact : people;
    if (pick.length > 1) return `More than one match: ${pick.slice(0, 4).map((c) => `${nameOf(c)}${c.email ? ` (${c.email})` : ""}`).join(" / ")}. Ask which one.`;
    const person = pick[0];
    const personName = nameOf(person);
    // The pipeline and its stages
    const { data: pc } = await supabase.from("tenant_config").select("pipeline_id, pipeline_name").eq("tenant_id", tid).maybeSingle();
    const pl = await ghl(ghlToken, `/opportunities/pipelines?locationId=${loc}`, "GET", undefined, V);
    const pipes: any[] = pl.json?.pipelines ?? [];
    const pipe = pipes.find((x) => x.id === pc?.pipeline_id) ?? pipes.find((x) => String(x.name).trim() === String(pc?.pipeline_name ?? "").trim()) ?? pipes[0];
    if (!pipe) return "I couldn't find your pipeline.";
    const stages: any[] = pipe.stages ?? [];
    const want = String(a.stage ?? "").trim().toLowerCase();
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const stage = want ? (stages.find((s) => norm(s.name) === norm(want)) ?? stages.find((s) => norm(s.name).includes(norm(want)) || norm(want).includes(norm(s.name)))) : null;
    if (want && !stage) return `No stage called "${a.stage}". Your stages are: ${stages.map((s) => s.name).join(", ")}.`;
    // Their deal in this pipeline
    const os = await ghl(ghlToken, `/opportunities/search?location_id=${loc}&pipeline_id=${pipe.id}&contact_id=${person.id}&limit=10`, "GET", undefined, V);
    const opps: any[] = (os.json?.opportunities ?? []).filter((o: any) => (o.contactId ?? o.contact?.id) === person.id);
    const openOpps = opps.filter((o) => String(o.status) === "open");
    let opp: any = openOpps[0] ?? (a.status ? opps[0] : null);
    if (openOpps.length > 1) return `${personName} has ${openOpps.length} open deals: ${openOpps.map((o) => o.name).join(" / ")}. Ask which one.`;
    const done: string[] = [];
    // No deal yet → add them to the pipeline
    if (!opp) {
      if (!stage) return `${personName} isn't in your pipeline yet — which stage should I add them to? (${stages.map((s) => s.name).join(", ")})`;
      const cr = await ghl(ghlToken, `/opportunities/`, "POST", {
        pipelineId: pipe.id, locationId: loc, name: personName, pipelineStageId: stage.id, status: "open", contactId: person.id,
        ...(Number(a.value) > 0 ? { monetaryValue: Number(a.value) } : {}),
      }, V);
      if (!cr.ok) return `Couldn't add ${personName} to the pipeline (${cr.status}): ${cr.text.slice(0, 150)}`;
      opp = cr.json?.opportunity ?? cr.json;
      done.push(`Added ${personName} to ${stage.name}`);
    } else if (stage && opp.pipelineStageId !== stage.id) {
      const up = await ghl(ghlToken, `/opportunities/${opp.id}`, "PUT", { pipelineStageId: stage.id, pipelineId: pipe.id }, V);
      if (!up.ok) return `Couldn't move ${personName} (${up.status}): ${up.text.slice(0, 150)}`;
      done.push(`Moved ${personName} to ${stage.name}`);
    }
    // Status change (won / lost / abandoned / open)
    const status = String(a.status ?? "").toLowerCase();
    if (["won", "lost", "abandoned", "open"].includes(status) && opp?.id && String(opp.status) !== status) {
      const st = await ghl(ghlToken, `/opportunities/${opp.id}/status`, "PUT", { status }, V);
      if (!st.ok) return `${done.length ? done.join(". ") + ". " : ""}Couldn't mark ${personName} as ${status} (${st.status}): ${st.text.slice(0, 150)}`;
      done.push(`Marked ${personName} as ${status}${status === "won" ? " — onboarding will start" : ""}`);
    }
    if (String(a.reason ?? "").trim()) {
      await ghl(ghlToken, `/contacts/${person.id}/notes`, "POST", { body: `[deal ${status || "update"}] ${today} — ${String(a.reason).trim().slice(0, 500)}` }, V);
      done.push("reason saved as a note");
    }
    return done.length ? done.join(". ") + "." : `${personName} is already there — nothing to change.`;
  }

  if (name === "archie_calendars" || name === "archie_free_slots" || name === "archie_book_call") {
    const loc = cfg?.ghl_location_id;
    const cl = await ghl(ghlToken, `/calendars/?locationId=${loc}`, "GET");
    const cals: any[] = (cl.json?.calendars ?? []).filter((c: any) => c.isActive !== false);
    if (!cals.length) return `I couldn't read your calendars (${cl.status}).`;
    if (name === "archie_calendars") return cals.map((c) => `${c.name}${c.slotDuration ? ` (${c.slotDuration} min)` : ""}`).join("\n");
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const want = norm(String(a.calendar ?? ""));
    const matches = cals.filter((c) => norm(c.name) === want).length ? cals.filter((c) => norm(c.name) === want) : cals.filter((c) => norm(c.name).includes(want) || want.includes(norm(c.name)));
    if (!matches.length) return `No calendar matching "${a.calendar}". Your calendars: ${cals.map((c) => c.name).join(", ")}.`;
    if (matches.length > 1) return `More than one calendar matches "${a.calendar}": ${matches.map((c) => c.name).join(" / ")}. Ask which one.`;
    const cal = matches[0];
    const slotsFor = async (from: string, days: number) => {
      const start = Date.parse(isoAt(from, "00:00", tz)), end = Date.parse(isoAt(addDays(from, days), "00:00", tz));
      const r = await ghl(ghlToken, `/calendars/${cal.id}/free-slots?startDate=${start}&endDate=${end}&timezone=${encodeURIComponent(tz)}`, "GET");
      const out: { date: string; time: string; iso: string }[] = [];
      for (const [k, v] of Object.entries(r.json ?? {})) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
        for (const iso of ((v as any)?.slots ?? [])) {
          out.push({ date: k, time: new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)), iso });
        }
      }
      return out.sort((x, y) => x.iso.localeCompare(y.iso));
    };
    const dayName = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    if (name === "archie_free_slots") {
      const from = isDate(a.date) ? String(a.date) : today;
      const slots = (await slotsFor(from, Math.min(14, Math.max(1, Number(a.days) || 5)))).filter((s) => Date.parse(s.iso) > Date.now());
      if (!slots.length) return `No free ${cal.name} slots from ${dayName(from)} for the next few days.`;
      const byDay = new Map<string, string[]>();
      for (const s of slots) { const l = byDay.get(s.date) ?? []; if (l.length < 4) l.push(s.time); byDay.set(s.date, l); }
      return `${cal.name} — free times:\n${[...byDay.entries()].slice(0, 4).map(([d, t]) => `${dayName(d)}: ${t.join(", ")}`).join("\n")}`;
    }
    // archie_book_call
    if (!isDate(a.date) || !/^\d{1,2}:\d{2}$/.test(String(a.time ?? ""))) throw new Error("date (YYYY-MM-DD) and time (HH:MM) required");
    const time = String(a.time).padStart(5, "0");
    const cs = await ghl(ghlToken, `/contacts/?locationId=${loc}&query=${encodeURIComponent(String(a.name ?? "").trim())}&limit=5`, "GET", undefined, "2021-07-28");
    const people: any[] = cs.json?.contacts ?? [];
    const nameOf = (c: any) => [c.firstName, c.lastName].filter(Boolean).join(" ") || c.contactName || c.email || "Contact";
    const exact = people.filter((c) => nameOf(c).toLowerCase() === String(a.name).trim().toLowerCase());
    const pick = exact.length === 1 ? exact : people;
    if (!pick.length) return `I can't find ${a.name} in your contacts.`;
    if (pick.length > 1) return `More than one match: ${pick.slice(0, 4).map((c) => `${nameOf(c)}${c.email ? ` (${c.email})` : ""}`).join(" / ")}. Ask which one.`;
    const person = pick[0];
    const free = await slotsFor(String(a.date), 1);
    if (free.length && !free.some((s) => s.time === time)) {
      return `${time} on ${dayName(String(a.date))} isn't free on ${cal.name}. Free that day: ${free.slice(0, 6).map((s) => s.time).join(", ") || "none"}.`;
    }
    const startIso = isoAt(String(a.date), time, tz);
    const mins = Number(cal.slotDuration) || 30;
    const endIso = new Date(Date.parse(startIso) + mins * 60000).toISOString();
    const assigned = cal.teamMembers?.[0]?.userId ?? (await ghlUserId(tid, ghlToken, cfg, resolve(a.handle)));
    const r = await ghl(ghlToken, "/calendars/events/appointments", "POST", {
      calendarId: cal.id, locationId: loc, contactId: person.id, startTime: startIso, endTime: endIso,
      title: `${cal.name} — ${nameOf(person)}`, appointmentStatus: "confirmed", ...(assigned ? { assignedUserId: assigned } : {}), toNotify: true,
    });
    if (!r.ok) return `Couldn't book it (${r.status}): ${r.text.slice(0, 160)}`;
    return `Booked: ${nameOf(person)} — ${cal.name}, ${dayName(String(a.date))} at ${time} (${mins} min). They'll get the usual confirmation.`;
  }

  if (name === "archie_personal_event") {
    const h = resolve(a.handle);
    if (!isDate(a.date) || !/^\d{1,2}:\d{2}$/.test(String(a.from ?? ""))) throw new Error("date (YYYY-MM-DD) and from (HH:MM) required");
    const from = String(a.from).padStart(5, "0");
    const to = /^\d{1,2}:\d{2}$/.test(String(a.to ?? "")) ? String(a.to).padStart(5, "0") : (() => { const [hh, mm] = from.split(":").map(Number); return `${String(Math.min(23, hh + 1)).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; })();
    const userId = await ghlUserId(tid, ghlToken, cfg, h);
    if (!userId) return `No GHL user set for ${h} — add their ghl_user_id in team_members.`;
    const title = String(a.title ?? "Personal").trim().slice(0, 100) || "Personal";
    const when = new Date(`${a.date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
    // A real event on their Personal calendar syncs to Google; a block slot doesn't
    const { data: me } = await supabase.from("team_members").select("personal_calendar_id, ghl_contact_id").eq("tenant_id", tid).eq("handle", h).maybeSingle();
    if (me?.personal_calendar_id && me?.ghl_contact_id) {
      const ap = await ghl(ghlToken, "/calendars/events/appointments", "POST", {
        calendarId: me.personal_calendar_id, locationId: cfg?.ghl_location_id, contactId: me.ghl_contact_id, assignedUserId: userId,
        startTime: isoAt(String(a.date), from, tz), endTime: isoAt(String(a.date), to, tz),
        title, appointmentStatus: "confirmed", toNotify: false, ignoreFreeSlotValidation: true, ignoreDateRange: true,
      });
      if (ap.ok) return `In your calendar: ${title} — ${when}, ${from}–${to}. It'll show in Google too, and that time's blocked for bookings.`;
      // fall through to a block slot if the calendar rejected it
    }
    const r = await ghl(ghlToken, "/calendars/events/block-slots", "POST", {
      locationId: cfg?.ghl_location_id, assignedUserId: userId, title,
      startTime: isoAt(String(a.date), from, tz), endTime: isoAt(String(a.date), to, tz),
    });
    if (!r.ok) return `Couldn't add it (${r.status}): ${r.text.slice(0, 160)}`;
    return `In your calendar: ${title} — ${when}, ${from}–${to}. That time's blocked for bookings${me?.personal_calendar_id ? "" : " (it won't show in Google until a Personal calendar is set up)"}.`;
  }

  if (name === "archie_back_on") {
    const h = resolve(a.handle);
    if (!isDate(a.date)) throw new Error("date required (YYYY-MM-DD)");
    const end = isDate(a.end_date) ? String(a.end_date) : String(a.date);
    const { data: blocks } = await supabase.from("archie_blocks").select("id, event_id").eq("tenant_id", tid).eq("handle", h).gte("day", String(a.date)).lte("day", end);
    let removed = 0;
    for (const b of blocks ?? []) {
      const r = await ghl(ghlToken, `/calendars/events/${b.event_id}`, "DELETE");
      if (r.ok || r.status === 404) { removed++; await supabase.from("archie_blocks").delete().eq("id", b.id); }
    }
    await supabase.from("capacity").delete().eq("tenant_id", tid).eq("handle", h).gte("day", String(a.date)).lte("day", end).eq("note", "Day off (Archie)");
    return `Back on: ${removed} calendar block${removed === 1 ? "" : "s"} removed and normal capacity restored for ${a.date}${end !== a.date ? `–${end}` : ""}. Moved tasks stay where they are — move any back if you want.`;
  }

  if (name === "archie_run_skill") {
    const skill = String(a.skill ?? "").trim();
    const input = String(a.input ?? "").trim();
    if (!skill || !input) throw new Error("skill and input required");
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/archie-screens/${tenant.token}`;
    const call = async (body: unknown) => { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.json().catch(() => null); };
    const started: any = await call({ action: "run", kind: "skill", skill, input });
    const runId = started?.run?.id;
    if (!runId) return `Couldn't start ${skill}: ${started?.error ?? "unknown error"}`;
    for (let i = 0; i < 18; i++) {
      await new Promise((ok) => setTimeout(ok, 5000));
      const r: any = await call({ action: "runs", kind: "skill", limit: 5 });
      const run = (r?.runs ?? []).find((x: any) => x.id === runId);
      if (run?.status === "done") return String(run.output ?? "").slice(0, 6000);
      if (run?.status === "failed") return `The ${skill} run failed: ${run.error ?? "no reason given"}`;
    }
    return `Still writing — it'll be on the Skills page under Recent outputs in a minute.`;
  }

  if (name === "archie_remember") {
    const fact = String(a.fact ?? "").trim().slice(0, 500);
    if (!fact) throw new Error("fact required");
    const { error } = await supabase.from("memories").insert({ tenant_id: tid, fact });
    if (error) throw new Error(error.message);
    return `Remembered: ${fact}`;
  }

  throw new Error(`Unknown tool: ${name}`);
}

// The GHL user to block time for — remembered once found
async function ghlUserId(tid: string, token: string, cfg: any, handle?: string): Promise<string | null> {
  // Each person's own GHL user first (team_members.ghl_user_id), then the owner's
  if (handle) {
    const { data: tm } = await supabase.from("team_members").select("ghl_user_id, gets_financials").eq("tenant_id", tid).eq("handle", handle).maybeSingle();
    if (tm?.ghl_user_id) return String(tm.ghl_user_id);
    if (tm && !tm.gets_financials) return null; // a team member without their own GHL user — never block the owner's calendar by mistake
  }
  if (cfg?.ghl_user_id) return String(cfg.ghl_user_id);
  const r = await ghl(token, `/users/?locationId=${cfg?.ghl_location_id}`, "GET");
  const users: any[] = r.json?.users ?? [];
  const pick = users.find((u) => String(u.roles?.role ?? u.role ?? "").toLowerCase() === "admin") ?? users[0];
  const id = pick?.id ? String(pick.id) : null;
  if (id) await supabase.from("tenant_config").update({ ghl_user_id: id }).eq("tenant_id", tid);
  return id;
}

// Calls booked for a user on one local day
async function callsOn(tid: string, token: string, cfg: any, h: string, date: string, tz: string) {
  const userId = await ghlUserId(tid, token, cfg, h);
  if (!userId) return { items: [] as { time: string; title: string; contactId: string; date: string }[], error: "no GHL user found" };
  const start = Date.parse(isoAt(date, "00:00", tz)), end = Date.parse(isoAt(date, "23:59", tz));
  const r = await ghl(token, `/calendars/events?locationId=${cfg?.ghl_location_id}&userId=${userId}&startTime=${start}&endTime=${end}`, "GET");
  if (!r.ok) return { items: [], error: `${r.status}` };
  const events: any[] = r.json?.events ?? [];
  const { data: pcs } = await supabase.from("team_members").select("personal_calendar_id").eq("tenant_id", tid);
  const personal = new Set((pcs ?? []).map((x: any) => x.personal_calendar_id).filter(Boolean));
  const items = events
    .filter((e) => String(e.appointmentStatus ?? e.status ?? "").toLowerCase() !== "cancelled" && !String(e.title ?? "").startsWith("Off — set by Archie") && !e.isBlockSlot && e.type !== "block" && !personal.has(e.calendarId))
    .map((e) => ({ time: new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(e.startTime)), title: String(e.title ?? "Appointment"), contactId: String(e.contactId ?? e.contact_id ?? ""), date }))
    .sort((x, y) => x.time.localeCompare(y.time));
  return { items, error: null };
}

// "2026-10-02" + "14:00" in Europe/London → ISO with the right offset for that date
function isoAt(date: string, hhmm: string, tz: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const guess = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(guess);
  const g = (k: string) => Number(parts.find((p) => p.type === k)?.value);
  const shown = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
  const offsetMin = Math.round((shown - guess.getTime()) / 60000);
  const sign = offsetMin >= 0 ? "+" : "-";
  const oh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0"), om = String(Math.abs(offsetMin) % 60).padStart(2, "0");
  return `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00${sign}${oh}:${om}`;
}

async function ghl(token: string, path: string, method = "GET", body?: unknown, version = "2021-04-15") {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(BASE + path, { method, signal: ctrl.signal, headers: { "Authorization": `Bearer ${token}`, "Version": version, "Accept": "application/json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let j: any = null; try { j = JSON.parse(text); } catch { j = null; }
    return { ok: r.ok, status: r.status, json: j, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" };
function ok(id: unknown, result: unknown) { return { jsonrpc: "2.0", id, result }; }
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } }); }
function unauth() { return json({ error: "Unauthorised" }, 401); }
function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
