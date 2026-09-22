// brief-context v2 — does every deterministic part of the brief in code:
// rollover, capacity-bound lineup per team member, waiting-on, stuck, inbox, MRR trend/target/anomalies.
// Returns one text block for the Brief agent, which only writes the words and the Focus line.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const TIERS = ["must", "high", "bonus"];

Deno.serve(async (req) => {
  console.log("brief-context v2 start");
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    const raw = await req.json();
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = p.tenant_id;
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);

    const { data: t } = await supabase.from("tenants").select("status, business_name").eq("id", tenant_id).single();
    if (t?.status !== "active") return j({ ok: true, skipped: "tenant not active" });

    const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tenant_id).single();
    const tz = cfg?.timezone || "Europe/London";
    const today = localDate(Date.now(), tz);
    const yesterday = localDate(Date.now() - 86400000, tz);
    const weekday = localWeekday(Date.now(), tz);
    const dayOfMonth = Number(today.slice(8, 10));

    // ---------- ROLLOVER (idempotent per day) ----------
    const { data: flagged } = await supabase.from("tasks")
      .select("id, rollover_count, status, today_set_on")
      .eq("tenant_id", tenant_id).eq("today", true);
    const toRoll = (flagged ?? []).filter((x) => !["done", "dismissed"].includes(x.status) && (!x.today_set_on || x.today_set_on < today));
    for (const x of toRoll) {
      await supabase.from("tasks").update({ rollover_count: (x.rollover_count ?? 0) + 1, last_rolled: today }).eq("id", x.id);
    }
    if ((flagged ?? []).length) await supabase.from("tasks").update({ today: false }).eq("tenant_id", tenant_id).eq("today", true);

    // ---------- DATA ----------
    const weekAgo = localDate(Date.now() - 7 * 86400000, tz);
    const twoWeeksAgo = localDate(Date.now() - 14 * 86400000, tz);
    const [{ data: team }, { data: tasks }, { data: caps }, { data: hist }, { data: risk }, { count: briefCount }, { data: recov }, { data: doneY }, { data: fb }, { data: drafts }, { data: actY }] = await Promise.all([
      supabase.from("team_members").select("handle, name, gets_financials, quiet_days, quiet_until").eq("tenant_id", tenant_id),
      supabase.from("tasks").select("id, title, tier, kind, status, owner, effort_minutes, rollover_count, sort_order, due_date, created_at, waiting_for, waiting_since").eq("tenant_id", tenant_id).in("status", ["open", "doing", "waiting", "proposed"]),
      supabase.from("capacity").select("handle, minutes, note").eq("tenant_id", tenant_id).eq("day", today),
      supabase.from("daily_metrics").select("metric_date, mrr, mrr_new, cash_24h").eq("tenant_id", tenant_id).order("metric_date", { ascending: false }).limit(40),
      supabase.from("client_analysis").select("client_id, summary, recommended_action, analysed_at").eq("tenant_id", tenant_id).eq("risk_level", "high").order("analysed_at", { ascending: false }).limit(10),
      supabase.from("briefs").select("id", { count: "exact", head: true }).eq("tenant_id", tenant_id),
      supabase.from("recoveries").select("amount, recovered_on").eq("tenant_id", tenant_id).gte("recovered_on", weekAgo),
      supabase.from("tasks").select("title, owner").eq("tenant_id", tenant_id).eq("status", "done").gte("completed_at", yesterday).lt("completed_at", today),
      supabase.from("brief_feedback").select("rating, note, created_on").eq("tenant_id", tenant_id).gte("created_on", twoWeeksAgo).order("created_on", { ascending: false }).limit(20),
      supabase.from("message_drafts").select("rank, name, channel, body, created_on").eq("tenant_id", tenant_id).eq("status", "pending").gte("created_on", yesterday).order("rank", { ascending: true }).limit(5),
      supabase.from("activity").select("drafts_sent, tasks_done").eq("tenant_id", tenant_id).eq("day", yesterday).maybeSingle(),
    ]);

    const defCap = parseJson(cfg?.default_capacity, {});
    const capFor = (handle: string) => {
      const row = (caps ?? []).find((c) => c.handle === handle);
      if (row) return { minutes: Number(row.minutes) || 0, note: row.note ?? "" };
      return { minutes: Number(defCap[String(weekday)] ?? 240) || 0, note: "" };
    };

    const all = tasks ?? [];
    const inbox = all.filter((x) => x.status === "proposed").length;

    // ---------- LINEUP PER MEMBER ----------
    const members = (team ?? []).length ? team! : [{ handle: "owner", name: "Owner", gets_financials: true }];
    const sections: string[] = [];
    let ownerName = "", teamName = "";
    const selectedIds: string[] = [];

    const rankUpdates: { id: string; rank: number }[] = [];
    for (const m of members as any[]) {
      const cap = capFor(m.handle);
      const quietDays = String(m.quiet_days ?? "").split(",").map((x: string) => x.trim()).filter(Boolean).map(Number);
      const quiet = quietDays.includes(weekday) || (!!m.quiet_until && String(m.quiet_until) >= today);
      const mine = all.filter((x) => x.owner === m.handle && (x.status === "open" || x.status === "doing"));
      const sorted = (list: any[]) => list.sort((a, b) =>
        (b.rollover_count ?? 0) - (a.rollover_count ?? 0) ||
        num(a.sort_order, 1e9) - num(b.sort_order, 1e9) ||
        String(a.due_date ?? "9999").localeCompare(String(b.due_date ?? "9999")) ||
        String(a.created_at).localeCompare(String(b.created_at)));

      let used = 0;
      const lineup: Record<string, any[]> = { must: [], high: [], bonus: [] };
      const overflow: any[] = [];
      for (const tier of TIERS) {
        for (const x of sorted(mine.filter((y) => y.tier === tier))) {
          if (lineup[tier].length >= 3) { if (tier === "must") overflow.push(x); continue; }
          const eff = Number(x.effort_minutes) > 0 ? Number(x.effort_minutes) : 30;
          if (used + eff <= cap.minutes) { lineup[tier].push({ ...x, eff }); used += eff; selectedIds.push(x.id); }
          else if (tier === "must") overflow.push({ ...x, eff });
        }
      }
      const mustNeed = mine.filter((x) => x.tier === "must").reduce((a, x) => a + (Number(x.effort_minutes) > 0 ? Number(x.effort_minutes) : 30), 0);
      const stuck = [...lineup.must, ...lineup.high, ...lineup.bonus].filter((x) => (x.rollover_count ?? 0) >= 3);
      const waiting = all.filter((x) => x.status === "waiting" && x.owner === m.handle).map((x) => {
        const d = x.waiting_since ? daysBetween(x.waiting_since, today) : 0;
        return `${x.waiting_for ?? "someone"}: ${x.title}, ${d} days${d > 5 ? " (nudge)" : ""}`;
      });

      let r = 0;
      for (const tier of TIERS) for (const x of lineup[tier]) { x.rank = ++r; rankUpdates.push({ id: x.id, rank: r }); }
      const fmtList = (list: any[]) => list.length ? list.map((x) => `#${x.rank} ${x.title} [${x.eff} min${(x.rollover_count ?? 0) > 0 ? `, rolled ${x.rollover_count}x` : ""}${x.kind === "deep" ? ", deep" : ""}]`).join(" ; ") : "none";
      const label = m.gets_financials ? "OWNER" : "TEAM";
      if (m.gets_financials && !ownerName) ownerName = m.name; else if (!m.gets_financials && !teamName) teamName = m.name;

      sections.push([
        `=== ${label}: ${m.name} (handle ${m.handle}) ===`,
        `QUIET: ${quiet ? "yes" : "no"}`,
        `CAPACITY: ${cap.minutes} min${cap.note ? ` (${cap.note})` : ""}`,
        `LINEUP_MUST: ${fmtList(lineup.must)}`,
        `LINEUP_HIGH: ${fmtList(lineup.high)}`,
        `LINEUP_BONUS: ${fmtList(lineup.bonus)}`,
        `USED: ${used} of ${cap.minutes} min`,
        `MUST_NEEDED: ${mustNeed} min${mustNeed > cap.minutes ? " — MORE THAN CAPACITY" : ""}`,
        `MUST_NOT_FITTING: ${overflow.length ? overflow.map((x) => `${x.title} [${x.eff ?? 30} min]`).join(" ; ") : "none"}`,
        `STUCK: ${stuck.length ? stuck.map((x) => `${x.title} (${x.rollover_count}x)`).join(" ; ") : "none"}`,
        `WAITING_ON_OTHERS: ${waiting.length ? waiting.join(" ; ") : "none"}`,
      ].join("\n"));
    }

    await supabase.from("tasks").update({ today_rank: null }).eq("tenant_id", tenant_id).not("today_rank", "is", null);
    if (selectedIds.length) await supabase.from("tasks").update({ today: true, today_set_on: today }).in("id", selectedIds);
    for (const u of rankUpdates) await supabase.from("tasks").update({ today_rank: u.rank }).eq("id", u.id);

    // ---------- FINANCE SYNTHESIS ----------
    const rows = (hist ?? []).filter((r) => r.mrr !== null && r.mrr !== undefined);
    const todayRow = rows.find((r) => r.metric_date === today);
    const yRow = rows.find((r) => r.metric_date === yesterday) ?? rows.find((r) => r.metric_date < today);
    let fin = "FINANCE_SYNTHESIS: no MRR today";
    if (todayRow) {
      const mrr = Number(todayRow.mrr);
      const change = yRow ? mrr - Number(yRow.mrr) : null;
      const target30 = localDate(Date.now() - 30 * 86400000, tz);
      const r30 = rows.filter((r) => r.metric_date <= target30)[0] ?? null;
      const trend = rows.length < 7 ? "building history" : r30 ? signed(mrr - Number(r30.mrr)) : "building history";
      let dir = 0, streak = 0;
      for (let i = 0; i < rows.length - 1 && i < 10; i++) {
        const d = Number(rows[i].mrr) - Number(rows[i + 1].mrr);
        const s = d > 0 ? 1 : d < 0 ? -1 : 0;
        if (s === 0) break;
        if (dir === 0) dir = s;
        if (s !== dir) break;
        streak++;
      }
      const tgt = Number(cfg?.mrr_target) || 0;
      const newM = Number(todayRow.mrr_new) || 0;
      const pct = tgt ? Math.round((mrr / tgt) * 100) : null;
      const gap = tgt ? Math.max(0, tgt - mrr) : null;
      const pace = tgt && newM > 0 && gap ? (gap / newM).toFixed(1) : null;
      const anomalies: string[] = [];
      const cashRows = (hist ?? []).filter((r) => r.metric_date !== today && r.cash_24h !== null).slice(0, 30);
      const avg = cashRows.length ? cashRows.reduce((a, r) => a + Number(r.cash_24h), 0) / cashRows.length : 0;
      const cashToday = Number(todayRow.cash_24h ?? 0);
      if (avg > 0 && cashToday > avg * 2) anomalies.push(`cash in last 24h £${round(cashToday)} is more than double the daily average £${round(avg)}`);
      if (avg > 0 && cashToday < avg / 2 && cashRows.length >= 7) anomalies.push(`cash in last 24h £${round(cashToday)} is under half the daily average £${round(avg)}`);
      if (newM === 0 && dayOfMonth > 10) anomalies.push("no new MRR this month and it is past the 10th");
      if (dir === -1 && streak >= 3) anomalies.push(`MRR has fallen ${streak} days running`);
      fin = [
        `FINANCE_SYNTHESIS: mrr_today=${round(mrr)} | change_vs_yesterday=${change === null ? "first run" : signed(change)} | trend_30d=${trend} | direction=${streak >= 3 ? `${dir > 0 ? "up" : "down"} ${streak} days` : "mixed"}`,
        `TARGET: mrr_target=${tgt || "not set"} | pct=${pct ?? "n/a"} | gap=${gap ?? "n/a"} | months_at_current_pace=${pace ?? (tgt ? "not currently approaching" : "n/a")}`,
        `ANOMALIES: ${anomalies.length ? anomalies.slice(0, 2).join(" ; ") : "none"}`,
      ].join("\n");
    }

    // ---------- DEAD MONEY ----------
    const todayM = (hist ?? []).find((r) => r.metric_date === today);
    const { data: todayFull } = await supabase.from("daily_metrics").select("failed_value, stale_value, stale_count, failed_count").eq("tenant_id", tenant_id).eq("metric_date", today).maybeSingle();
    const { data: renew } = await supabase.from("tasks").select("title").eq("tenant_id", tenant_id).like("source_ref", "renewal:%").in("status", ["open", "doing"]);
    const failedV = Number(todayFull?.failed_value ?? 0), staleV = Number(todayFull?.stale_value ?? 0);
    const deadTotal = failedV + staleV;
    const deadLine = `DEAD_MONEY: total=£${round(deadTotal)} | failed_payments=£${round(failedV)} (${todayFull?.failed_count ?? 0}) | stale_pipeline=£${round(staleV)} (${todayFull?.stale_count ?? 0}) | renewals_at_risk=${(renew ?? []).length}`;
    const firstBrief = (briefCount ?? 0) === 0;

    // ---------- WINS ----------
    const wins: string[] = [];
    const recWeek = (recov ?? []).reduce((a, r) => a + Number(r.amount ?? 0), 0);
    const recY = (recov ?? []).filter((r) => r.recovered_on >= yesterday).reduce((a, r) => a + Number(r.amount ?? 0), 0);
    if (recY > 0) wins.push(`£${round(recY)} of failed payments recovered since yesterday`);
    if ((doneY ?? []).length) wins.push(`${(doneY ?? []).length} tasks cleared yesterday`);
    if (Number(actY?.drafts_sent ?? 0) > 0) wins.push(`${actY?.drafts_sent} Archie drafts sent yesterday`);
    if (todayM && (hist ?? []).length > 1) {
      const prev = (hist ?? []).find((r) => r.metric_date < today && r.mrr !== null);
      if (prev && Number(todayM.mrr) > Number(prev.mrr)) wins.push(`MRR up £${round(Number(todayM.mrr) - Number(prev.mrr))}`);
    }

    // ---------- FEEDBACK ----------
    const up = (fb ?? []).filter((f) => f.rating > 0).length, down = (fb ?? []).filter((f) => f.rating < 0).length;
    const notes = (fb ?? []).filter((f) => f.note).slice(0, 5).map((f) => `${f.rating > 0 ? "liked" : "disliked"}: ${f.note}`);
    const fbLine = `FEEDBACK_14D: ${up} up, ${down} down${notes.length ? ` | ${notes.join(" ; ")}` : ""}`;

    // ---------- REFERRAL MOMENT ----------
    const lastAsk = cfg?.last_referral_ask ? String(cfg.last_referral_ask) : null;
    const askGap = lastAsk ? daysBetween(lastAsk, today) : 999;
    const happy = recWeek > 0 || up >= 2 || (wins.length >= 2);
    const referralLink = String(p.referral_link ?? "").trim();
    const referral = referralLink && happy && askGap >= 30 && !firstBrief;

    // ---------- PLAYBOOKS ----------
    const situations: string[] = [];
    if (failedV > 0) situations.push("failed_payment");
    if ((risk ?? []).length) situations.push("customer_quiet");
    if (fin.includes("under half") || fin.includes("fallen") || fin.includes("no new MRR")) situations.push("slow_month");
    if (fin.includes("direction=up")) situations.push("growing");
    let pbText = "";
    if (situations.length) {
      const { data: pbs } = await supabase.from("playbooks").select("tenant_id, situation, title, principles, examples").in("situation", situations).eq("active", true).or(`tenant_id.eq.${tenant_id},tenant_id.is.null`);
      const chosen = new Map<string, any>();
      for (const r of pbs ?? []) { const cur = chosen.get(r.situation); if (!cur || (r.tenant_id && !cur.tenant_id)) chosen.set(r.situation, r); }
      pbText = [...chosen.values()].map((r) => `PLAYBOOK ${r.situation} — ${r.title}\nPRINCIPLES: ${r.principles}\nEXAMPLES: ${r.examples ?? "none"}`).join("\n\n");
    }

    const draftLines = (drafts ?? []).map((d) => `#${d.rank} ${d.name} (${d.channel}): "${String(d.body).slice(0, 220)}"`);

    const riskLine = (risk ?? []).length ? (risk ?? []).map((r) => `${r.summary ?? "at risk"} → ${r.recommended_action ?? ""}`).join(" ; ") : "none";

    const context = [
      `DAY: ${new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(new Date())}`,
      `PROFILE: business=${t?.business_name ?? ""} | revenue_model=${cfg?.revenue_model ?? "recurring"} | customer_word=${cfg?.customer_word ?? "client"} | sale_word=${cfg?.sale_word ?? "proposal"} | brief_max_chars=${cfg?.brief_max_chars ?? 1200}`,
      `PRIORITIES: ${cfg?.priorities_text ?? "not set"}`,
      `GOALS: ${cfg?.goals_text ?? "not set"}`,
      fin,
      `AT_RISK: ${riskLine}`,
      `INBOX: ${inbox} proposals waiting`,
      `FIRST_BRIEF: ${firstBrief ? "yes" : "no"}`,
      deadLine,
      `WINS: ${wins.length ? wins.join(" ; ") : "none"}`,
      fbLine,
      `DRAFTS_READY: ${draftLines.length ? draftLines.join(" ; ") : "none"}`,
      `REFERRAL: ${referral ? `yes | link=${referralLink}` : "no"}`,
      "",
      ...sections,
      ...(pbText ? ["", pbText] : []),
    ].join("\n");

    return j({ ok: true, brief_context: context, owner_name: ownerName, team_name: teamName, has_team: !!teamName, selected: selectedIds.length, rolled: toRoll.length, referral: referral ? "yes" : "no", dead_money: round(deadTotal) });
  } catch (e) { return j({ error: String(e) }, 500); }
});

function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
function localWeekday(ms: number, tz: string) { const d = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" }).format(new Date(ms)); return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d); }
function daysBetween(a: string, b: string) { return Math.round((Date.parse(b) - Date.parse(String(a).slice(0, 10))) / 86400000); }
function parseJson(v: unknown, f: any) { if (!v) return f; if (typeof v === "object") return v; try { return JSON.parse(String(v)); } catch { return f; } }
function num(v: unknown, f: number) { const n = Number(v); return Number.isFinite(n) && v !== null ? n : f; }
function round(n: number) { return Math.round(n); }
function signed(n: number) { const r = Math.round(n); return (r >= 0 ? "+£" : "-£") + Math.abs(r); }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }