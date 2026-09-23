// archie-mcp v1 — Archie as an MCP server for GHL Managed Agents and Ask AI.
// URL: /functions/v1/archie-mcp/<tenant access_token>
// The token picks the tenant. Nothing from any other tenant is ever returned.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const TIERS = ["must", "high", "bonus"];

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
    description: "Add a task. Confirm the details with the user before calling.",
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
    description: "Mark a task done, by its number on today's list (rank) or by part of its title. Confirm with the user before calling.",
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
  for (const msg of batch) { const r = await handle(tenant, msg); if (r) out.push(r); }
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
      serverInfo: { name: "archie", version: "1.0.0" },
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
  const { data: cfg } = await supabase.from("tenant_config").select("timezone, mrr_target").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const { data: team } = await supabase.from("team_members").select("handle, name, gets_financials").eq("tenant_id", tid);
  const owner = (team ?? []).find((m) => m.gets_financials)?.handle ?? "owner";
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

  throw new Error(`Unknown tool: ${name}`);
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" };
function ok(id: unknown, result: unknown) { return { jsonrpc: "2.0", id, result }; }
function json(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } }); }
function unauth() { return json({ error: "Unauthorised" }, 401); }
function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }