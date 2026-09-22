// plan-tomorrow v1 — replaces the Plan-tomorrow agent. Pure code, zero agent runs.
// Spawns tomorrow's recurring tasks, previews each member's lineup against capacity,
// and warns about any day in the next week that is already over-committed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const TIERS = ["must", "high", "bonus"];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

Deno.serve(async (req) => {
  console.log("plan-tomorrow v1 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);

    const { data: t } = await supabase.from("tenants").select("status").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });

    const { data: cfg } = await supabase.from("tenant_config").select("timezone, default_capacity").eq("tenant_id", tenant_id).single();
    const tz = cfg?.timezone || "Europe/London";
    const defCap = parseJson(cfg?.default_capacity, {});
    const dayMs = 86400000;
    const dateAt = (offset: number) => localDate(Date.now() + offset * dayMs, tz);
    const wdAt = (offset: number) => localWeekday(Date.now() + offset * dayMs, tz);
    const tomorrow = dateAt(1);
    const tWd = wdAt(1);
    const tDom = Number(tomorrow.slice(8, 10));

    // ---------- RECURRING ----------
    const { data: recur } = await supabase.from("tasks")
      .select("id, title, detail, tier, kind, owner, project_id, client_id, recurrence, effort_minutes, status")
      .eq("tenant_id", tenant_id).not("recurrence", "is", null);
    const openTitles = new Set((recur ?? []).filter((x) => ["open", "doing", "waiting"].includes(x.status)).map((x) => `${x.title}|${x.recurrence}`));
    const spawn: any[] = [];
    const seenKeys = new Set<string>();
    for (const x of (recur ?? []).filter((y) => y.status === "done")) {
      const key = `${x.title}|${x.recurrence}`;
      if (openTitles.has(key) || seenKeys.has(key)) continue;
      const rule = String(x.recurrence).toLowerCase().trim();
      let due = false;
      if (rule === "daily") due = true;
      else if (rule === "weekdays") due = tWd >= 1 && tWd <= 5;
      else if (rule.startsWith("weekly:")) due = rule.slice(7).split(",").map((s) => s.trim().slice(0, 3)).includes(DAYS[tWd]);
      else if (rule.startsWith("monthly:")) due = Number(rule.slice(8)) === tDom;
      if (!due) continue;
      seenKeys.add(key);
      spawn.push({ tenant_id, title: x.title, detail: x.detail, tier: x.tier, kind: x.kind, owner: x.owner, project_id: x.project_id, client_id: x.client_id, recurrence: x.recurrence, effort_minutes: x.effort_minutes ?? 30, status: "open", due_date: tomorrow, source: "recurring", source_ref: `${x.id}:${tomorrow}` });
    }
    if (spawn.length) await supabase.from("tasks").insert(spawn);

    // ---------- PREVIEW ----------
    const [{ data: team }, { data: tasks }, { data: caps }] = await Promise.all([
      supabase.from("team_members").select("handle, name, gets_financials").eq("tenant_id", tenant_id),
      supabase.from("tasks").select("id, title, tier, status, owner, effort_minutes, rollover_count, sort_order, due_date, created_at").eq("tenant_id", tenant_id).in("status", ["open", "doing"]),
      supabase.from("capacity").select("handle, day, minutes").eq("tenant_id", tenant_id).gte("day", dateAt(1)).lte("day", dateAt(7)),
    ]);
    const capOn = (handle: string, offset: number) => {
      const d = dateAt(offset);
      const row = (caps ?? []).find((c) => c.handle === handle && c.day === d);
      return row ? Number(row.minutes) || 0 : Number(defCap[String(wdAt(offset))] ?? 240) || 0;
    };
    const eff = (x: any) => (Number(x.effort_minutes) > 0 ? Number(x.effort_minutes) : 30);
    const dayLabel = (offset: number) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date(Date.now() + offset * dayMs));

    let ownerText = "", teamText = "";
    for (const m of team ?? []) {
      const cap = capOn(m.handle, 1);
      const mine = (tasks ?? []).filter((x) => x.owner === m.handle);
      const sorted = (list: any[]) => list.sort((a, b) => (b.rollover_count ?? 0) - (a.rollover_count ?? 0) || num(a.sort_order, 1e9) - num(b.sort_order, 1e9) || String(a.due_date ?? "9999").localeCompare(String(b.due_date ?? "9999")) || String(a.created_at).localeCompare(String(b.created_at)));
      let used = 0;
      const lineup: Record<string, string[]> = { must: [], high: [], bonus: [] };
      for (const tier of TIERS) {
        for (const x of sorted(mine.filter((y) => y.tier === tier))) {
          if (lineup[tier].length >= 3) continue;
          if (used + eff(x) <= cap) { lineup[tier].push(x.title); used += eff(x); }
        }
      }
      const mustNeed = mine.filter((x) => x.tier === "must").reduce((a, x) => a + eff(x), 0);

      const over: string[] = [];
      for (let o = 1; o <= 7; o++) {
        const d = dateAt(o);
        const due = mine.filter((x) => x.due_date === d);
        const need = due.reduce((a, x) => a + eff(x), 0);
        const c = capOn(m.handle, o);
        if (need > c) over.push(`${dayLabel(o)} is ${need - c} min over (${due.length} due, ${c} min free)`);
      }

      const lines = [
        `Tomorrow (${dayLabel(1)}): ${cap} min free.`,
        mustNeed > cap ? `Must-dos need ${mustNeed} min, you have ${cap}. Something has to move.` : "",
        `Must: ${lineup.must.join(" · ") || "none"}`,
        `High: ${lineup.high.join(" · ") || "none"}`,
        `Bonus: ${lineup.bonus.join(" · ") || "none"}`,
        `Planned: ${used} of ${cap} min.`,
        over.length ? `Week ahead: ${over.join("; ")}.` : "",
        spawn.filter((s) => s.owner === m.handle).length ? `Recurring added: ${spawn.filter((s) => s.owner === m.handle).map((s) => s.title).join(" · ")}` : "",
        `Reply "task:" to add, "capacity:" to change tomorrow.`,
      ].filter(Boolean).join("\n");

      if (m.gets_financials && !ownerText) ownerText = lines;
      else if (!m.gets_financials && !teamText) teamText = lines;
    }

    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id, agent: "plantomorrow", trigger: "workflow", status: "done", started_at: now, finished_at: now, summary: `Spawned ${spawn.length} recurring | Previewed ${(team ?? []).length} members` });
    return j({ ok: true, spawned: spawn.length, owner_text: ownerText, team_text: teamText, has_team: !!teamText });
  } catch (e) { return j({ error: String(e) }, 500); }
});

function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
function localWeekday(ms: number, tz: string) { const d = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" }).format(new Date(ms)); return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d); }
function parseJson(v: unknown, f: any) { if (!v) return f; if (typeof v === "object") return v; try { return JSON.parse(String(v)); } catch { return f; } }
function num(v: unknown, f: number) { const n = Number(v); return Number.isFinite(n) && v !== null ? n : f; }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }