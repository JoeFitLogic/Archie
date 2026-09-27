// archie-sales v2.1 — after-call scoring, quotes and won → invoice. API-first: one webhook in, everything else here.
// POST /functions/v1/archie-sales   header x-archie-secret   { action, tenant_id, ... }
//   after_call { contact_id, hint?, any_date? }  → (background) open deal? → After Call agent via API → score, note, tasks, draft estimate
//   won        { contact_id, opportunity_id? }   → (background) draft invoice, onboarding tasks, client tag, notify
//   context / call_save                          → the individual steps, kept for testing
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SECRET = Deno.env.get("ARCHIE_SECRET")!;
const FALLBACK_TOKEN = Deno.env.get("GHL_AGENCY_API_KEY") ?? "";
const BASE = "https://services.leadconnectorhq.com";
const FIELD_KEYS = { intent: "buyer_intent", chance: "chance_of_yes", next: "call_next_step" };
const AFTER_CALL_NAMES = ["Archie After Call"];
declare const EdgeRuntime: any;
function startInBackground(p: Promise<unknown>) {
  try { if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) { EdgeRuntime.waitUntil(p); return; } } catch { /* fall through */ }
  p.catch((e) => console.error("background failed", e));
}

Deno.serve(async (req) => {
  try {
    if (req.headers.get("x-archie-secret") !== SECRET) return j({ error: "unauthorized" }, 401);
    let raw: any = {};
    try { raw = await req.json(); } catch { return j({ error: "invalid JSON" }, 400); }
    const p = { ...raw, ...(raw.customData ?? {}) };
    const tenant_id = str(p.tenant_id);
    if (!tenant_id) return j({ error: "tenant_id required" }, 400);
    const c = await context(tenant_id);
    if (!c) return j({ ok: true, skipped: "tenant not active" });

    const action = str(p.action);
    if (action === "after_call") { startInBackground(afterCall(c, p)); return j({ ok: true, started: true }); }
    if (action === "won") { startInBackground(won(c, p).catch((e) => console.error(e))); return j({ ok: true, started: true }); }
    if (action === "won_now") return j(await won(c, p));
    if (action === "context") return j(await callContext(c, p));
    if (action === "call_save") return j(await callSave(c, p));
    return j({ error: `unknown action: ${action}` }, 400);
  } catch (e) { return j({ error: String(e) }, 500); }
});

// ===================== context =====================
async function context(tid: string) {
  const [{ data: t }, { data: cfg }, { data: owner }] = await Promise.all([
    supabase.from("tenants").select("status, location_id, business_name").eq("id", tid).single(),
    supabase.from("tenant_config").select("*").eq("tenant_id", tid).single(),
    supabase.from("team_members").select("handle, ghl_contact_id, quiet_until").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle(),
  ]);
  if (t?.status !== "active") return null;
  const tz = cfg?.timezone || "Europe/London";
  return {
    tid, cfg: cfg ?? {}, owner, tz,
    loc: cfg?.ghl_location_id || t?.location_id,
    token: cfg?.ghl_token || FALLBACK_TOKEN,
    business: t?.business_name ?? "",
    today: localDate(Date.now(), tz),
    currency: String(cfg?.currency ?? "GBP"),
  };
}

async function openOpportunity(c: any, contactId: string) {
  const r = await ghl(c.token, `/opportunities/search?location_id=${c.loc}&contact_id=${contactId}&status=open&limit=10`);
  const list: any[] = r.ok ? (r.json?.opportunities ?? []) : [];
  const pid = c.cfg.pipeline_id;
  return list.find((o) => !pid || o.pipelineId === pid) ?? list[0] ?? null;
}

async function contactOf(c: any, contactId: string) {
  const r = await ghl(c.token, `/contacts/${contactId}`);
  const x = r.json?.contact ?? {};
  return {
    id: contactId,
    name: [x.firstName, x.lastName].filter(Boolean).join(" ") || x.contactName || x.email || "Contact",
    email: x.email ?? "", phone: x.phone ?? "", company: x.companyName ?? "",
  };
}

// ===================== after-call: context for the agent =====================
async function callContext(c: any, p: any) {
  const contactId = str(p.contact_id);
  if (!contactId) return { ok: false, error: "contact_id required", has_open_opp: "no" };
  const opp = await openOpportunity(c, contactId);
  if (!opp) return { ok: true, has_open_opp: "no" };
  const who = await contactOf(c, contactId);
  const lookback = str(p.any_date) === "yes" ? "their most recent call (any date)" : `today's call (${c.today})`;
  const hint = str(p.hint);
  const message = [
    `Use Fathom to find ${lookback} with ${who.name}${who.email ? ` — email ${who.email}` : ""}.`,
    `They have an open deal: "${opp.name}"${Number(opp.monetaryValue) ? `, value ${c.currency} ${opp.monetaryValue}` : ""}.`,
    ...(hint ? [`They may appear in Fathom under a different name or meeting title — look for: ${hint.slice(0, 200)}.`] : []),
    "",
    "If there was no such call, return exactly: {\"found\": false}",
    "",
    "Otherwise use the call-score skill and return ONLY the JSON it describes — no text, no markdown, no code fences.",
    "Rules that override anything else: chance_of_yes is a whole number from 0 to 100 in steps of 10; buyer_intent is High, Medium or Low; quote amounts only if a price was actually said on the call, otherwise 0; include coaching {went_well, improve} — one specific sentence each about how the owner ran the call; never invent anything.",
  ].join("\n");
  return { ok: true, has_open_opp: "yes", opportunity_id: opp.id, message };
}

// ===================== after-call: save everything =====================
async function callSave(c: any, p: any) {
  const contactId = str(p.contact_id);
  const data = parseJsonObject(clean(String(p.output ?? "")));
  if (!data || data.found === false) return { ok: true, skipped: "no call found" };
  const who = await contactOf(c, contactId);
  const opp = await openOpportunity(c, contactId);
  const done: string[] = [];

  // --- score onto the opportunity ---
  const s = data.score ?? {};
  const intent = ["High", "Medium", "Low"].find((x) => x.toLowerCase() === String(s.buyer_intent ?? "").toLowerCase()) ?? null;
  const chanceNum = Math.max(0, Math.min(100, Math.round((Number(s.chance_of_yes) || 0) / 10) * 10));
  const dot = intent === "High" ? "🟢" : intent === "Medium" ? "🟠" : intent === "Low" ? "🔴" : "";
  if (opp && intent) {
    const ids = await fieldIds(c);
    const fields: any[] = [];
    if (ids.intent) fields.push({ id: ids.intent, field_value: `${dot} ${intent}` });
    if (ids.chance) fields.push({ id: ids.chance, field_value: `${chanceNum}%` });
    if (ids.next) fields.push({ id: ids.next, field_value: String(s.next_step ?? "").slice(0, 250) });
    if (fields.length) {
      const u = await ghl(c.token, `/opportunities/${opp.id}`, "PUT", { customFields: fields });
      done.push(u.ok ? "score saved" : `score not saved (${u.status})`);
    } else done.push("score fields missing — create them (see 7B.2)");
  }

  // --- the note on the contact ---
  const noteLines = [
    `[call] ${c.today}`,
    data.summary ? String(data.summary) : "",
    intent ? `\nBuyer intent: ${dot} ${intent} · Chance of yes: ${chanceNum}% (estimate)` : "",
    s.why ? `Why: ${s.why}` : "",
    s.tip ? `What would tip it: ${s.tip}` : "",
    s.watch ? `Watch out: ${s.watch}` : "",
    s.next_step ? `Next step: ${s.next_step}` : "",
    data.coaching?.went_well ? `\n👍 Went well: ${data.coaching.went_well}` : "",
    data.coaching?.improve ? `🔧 Next time: ${data.coaching.improve}` : "",
  ].filter(Boolean).join("\n");
  const n = await ghl(c.token, `/contacts/${contactId}/notes`, "POST", { body: noteLines.slice(0, 4000) });
  done.push(n.ok ? "note saved" : `note not saved (${n.status})`);

  // --- promises → proposed tasks ---
  const promises: any[] = Array.isArray(data.promises) ? data.promises.slice(0, 8) : [];
  if (promises.length) {
    const { data: client } = await supabase.from("clients").select("id").eq("tenant_id", c.tid).eq("ghl_contact_id", contactId).maybeSingle();
    const rows = promises.map((x, i) => ({
      tenant_id: c.tid, title: String(x?.title ?? "").slice(0, 200) || `Follow up with ${who.name}`,
      detail: `Promised on the call with ${who.name} (${c.today})`,
      tier: ["must", "high", "bonus"].includes(x?.tier) ? x.tier : "high", kind: "shallow",
      effort_minutes: Math.max(15, Math.round((Number(x?.minutes) || 30) / 15) * 15),
      status: "proposed", source: "call", source_ref: `call:${contactId}:${c.today}:${i}`, client_id: client?.id ?? null,
    }));
    const { data: existing } = await supabase.from("tasks").select("source_ref").eq("tenant_id", c.tid).in("source_ref", rows.map((r) => r.source_ref));
    const seen = new Set((existing ?? []).map((e) => e.source_ref));
    const fresh = rows.filter((r) => !seen.has(r.source_ref));
    if (fresh.length) await supabase.from("tasks").insert(fresh);
    done.push(`${fresh.length} proposed tasks`);
  }

  // --- quote → draft estimate, or a task to price it ---
  const q = data.quote ?? {};
  let estimateId: string | null = null;
  if (q.needed) {
    const items = (Array.isArray(q.items) ? q.items : []).map((i: any) => ({ name: String(i?.name ?? "").slice(0, 120), description: String(i?.description ?? "").slice(0, 500), amount: Number(i?.amount) || 0 })).filter((i: any) => i.name);
    const priced = items.length > 0 && items.every((i: any) => i.amount > 0);
    if (priced) {
      const biz = await businessDetails(c);
      const body = {
        altId: c.loc, altType: "location", name: String(q.title || `Quote for ${who.name}`).slice(0, 120),
        title: "ESTIMATE", businessDetails: biz, currency: c.currency,
        items: items.map((i: any) => ({ name: i.name, description: i.description, currency: c.currency, amount: i.amount, qty: 1, type: "one_time" })),
        discount: { value: 0, type: "percentage" },
        contactDetails: { id: contactId, name: who.name, email: who.email, phoneNo: who.phone, companyName: who.company },
        issueDate: c.today, expiryDate: addDays(c.today, 14),
        frequencySettings: { enabled: false }, liveMode: true,
        termsNotes: q.notes ? `<p>${escapeHtml(String(q.notes))}</p>` : undefined,
      };
      const e = await ghl(c.token, `/invoices/estimate`, "POST", body);
      estimateId = e.ok ? String(e.json?._id ?? "") || null : null;
      done.push(e.ok ? "estimate drafted" : `estimate not created (${e.status}: ${e.text.slice(0, 120)})`);
      await supabase.from("quotes").insert({ tenant_id: c.tid, contact_id: contactId, opportunity_id: opp?.id ?? null, estimate_id: estimateId, title: body.name, items, total: items.reduce((a: number, i: any) => a + i.amount, 0), status: estimateId ? "drafted" : "failed" });
    } else {
      await supabase.from("tasks").insert({
        tenant_id: c.tid, title: `Price up quote for ${who.name}`.slice(0, 200),
        detail: [String(q.title ?? ""), ...items.map((i: any) => `- ${i.name}${i.description ? `: ${i.description}` : ""}`), q.notes ? `Notes: ${q.notes}` : ""].filter(Boolean).join("\n").slice(0, 2000),
        tier: "must", kind: "shallow", effort_minutes: 30, status: "open", owner: c.owner?.handle ?? null,
        source: "call", source_ref: `quote:${contactId}:${c.today}`, due_date: c.today,
      });
      done.push("quote needs prices — task added");
    }
  }

  // --- one message to the owner ---
  if (intent || q.needed || data.coaching) {
    const lines = [
      intent ? `${dot} ${intent} · ${chanceNum}% chance of yes` : "",
      s.next_step ? `Next: ${s.next_step}` : "",
      estimateId ? "Quote drafted — check it in Payments → Estimates, then send." : q.needed ? "Quote needs prices — it's on your list." : "",
      data.coaching?.went_well ? `\n👍 ${data.coaching.went_well}` : "",
      data.coaching?.improve ? `🔧 ${data.coaching.improve}` : "",
    ].filter(Boolean).join("\n");
    await notifyOwner(c, `Call with ${who.name}`, lines);
  }

  await supabase.from("agent_runs").insert({ tenant_id: c.tid, agent: "aftercall", trigger: "workflow", status: "done", started_at: new Date().toISOString(), finished_at: new Date().toISOString(), summary: `${who.name}: ${done.join(" | ")}` });
  return { ok: true, done };
}

// ===================== won → invoice =====================
async function won(c: any, p: any) {
  const contactId = str(p.contact_id);
  if (!contactId) return { ok: false, error: "contact_id required" };
  const who = await contactOf(c, contactId);

  // Items: Archie's latest quote for this contact if there is one, otherwise the deal value
  const { data: quote } = await supabase.from("quotes").select("id, title, items, total").eq("tenant_id", c.tid).eq("contact_id", contactId).in("status", ["drafted", "sent"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  let items: any[] = [];
  let name = `Invoice for ${who.name}`;
  if (quote && Array.isArray(quote.items) && quote.items.length) {
    items = quote.items; name = String(quote.title || name);
  } else {
    let value = 0, oppName = "";
    if (p.opportunity_id) {
      const o = await ghl(c.token, `/opportunities/${str(p.opportunity_id)}`);
      value = Number(o.json?.opportunity?.monetaryValue ?? 0) || 0; oppName = String(o.json?.opportunity?.name ?? "");
    }
    if (value > 0) items = [{ name: oppName || name, description: "", amount: value }];
  }

  const done: string[] = [];
  let invoiceId: string | null = null;
  if (!items.length) {
    await supabase.from("tasks").insert({ tenant_id: c.tid, title: `Invoice ${who.name} — no value on the deal`, detail: "Won, but Archie had no quote or deal value to invoice from.", tier: "must", kind: "shallow", effort_minutes: 15, status: "open", owner: c.owner?.handle ?? null, source: "won", source_ref: `won:${contactId}:${c.today}`, due_date: c.today });
    done.push("no value — task added");
  } else {
    const biz = await businessDetails(c);
    const body = {
      altId: c.loc, altType: "location", name: name.slice(0, 120), title: "INVOICE",
      businessDetails: biz, currency: c.currency,
      items: items.map((i: any) => ({ name: String(i.name).slice(0, 120), description: String(i.description ?? "").slice(0, 500), currency: c.currency, amount: Number(i.amount) || 0, qty: 1, type: "one_time" })),
      discount: { value: 0, type: "percentage" },
      contactDetails: { id: contactId, name: who.name, email: who.email, phoneNo: who.phone, companyName: who.company },
      issueDate: c.today, dueDate: addDays(c.today, Number(c.cfg.invoice_due_days ?? 7) || 7),
      sentTo: { email: who.email ? [who.email] : [], phoneNo: who.phone ? [who.phone] : [] },
      liveMode: true,
    };
    const r = await ghl(c.token, `/invoices/`, "POST", body);
    invoiceId = r.ok ? String(r.json?._id ?? "") || null : null;
    done.push(r.ok ? "invoice drafted" : `invoice not created (${r.status}: ${r.text.slice(0, 120)})`);
    if (quote && invoiceId) await supabase.from("quotes").update({ status: "invoiced", invoice_id: invoiceId }).eq("id", quote.id);
  }

  // Onboarding tasks
  const steps: string[] = Array.isArray(c.cfg.onboarding_steps) && c.cfg.onboarding_steps.length
    ? c.cfg.onboarding_steps
    : ["Send {name} a welcome message", "Book a kick-off call with {name}", "Set {name} up in your systems"];
  const { data: existing } = await supabase.from("tasks").select("source_ref").eq("tenant_id", c.tid).like("source_ref", `onboard:${contactId}:%`);
  if (!(existing ?? []).length) {
    await supabase.from("tasks").insert(steps.slice(0, 8).map((s, i) => ({
      tenant_id: c.tid, title: s.replace(/\{name\}/g, who.name).slice(0, 200), detail: `Onboarding — won ${c.today}`,
      tier: i === 0 ? "must" : "high", kind: "shallow", effort_minutes: 30, status: "open", owner: c.owner?.handle ?? null,
      source: "won", source_ref: `onboard:${contactId}:${i}`, due_date: addDays(c.today, i),
    })));
    done.push(`${steps.length} onboarding tasks`);
  }

  // Make them a client in Archie
  if (c.cfg.won_adds_client_tag !== false && c.cfg.client_tag) {
    const t = await ghl(c.token, `/contacts/${contactId}/tags`, "POST", { tags: [c.cfg.client_tag] });
    done.push(t.ok ? "client tag added" : `tag not added (${t.status})`);
  }

  const total = items.reduce((a: number, i: any) => a + (Number(i.amount) || 0), 0);
  await notifyOwner(c, `🎉 ${who.name} — won`, invoiceId
    ? `Invoice for ${c.currency} ${total} drafted. Check it in Payments → Invoices, then send.\nOnboarding tasks are on your list.`
    : `No invoice drafted — see your list.\nOnboarding tasks are on your list.`);

  await supabase.from("agent_runs").insert({ tenant_id: c.tid, agent: "won", trigger: "workflow", status: "done", started_at: new Date().toISOString(), finished_at: new Date().toISOString(), summary: `${who.name}: ${done.join(" | ")}` });
  return { ok: true, invoice_id: invoiceId, done };
}

// ===================== v2: the whole after-call flow, API-first =====================
async function afterCall(c: any, p: any) {
  const contactId = str(p.contact_id);
  const log = async (status: string, summary: string, error: string | null = null) => {
    const now = new Date().toISOString();
    await supabase.from("agent_runs").insert({ tenant_id: c.tid, agent: "aftercall", trigger: "api", status, started_at: now, finished_at: now, summary, error });
  };
  if (!contactId) return log("failed", "", "contact_id required");

  // Once per contact per day, unless forced
  if (str(p.force) !== "yes") {
    const { error } = await supabase.from("schedule_log").insert({ tenant_id: c.tid, job: `aftercall:${contactId}`, period_key: c.today });
    if (error) return log("done", `After call for ${contactId} already done today — skipped`);
  }

  const ctx = await callContext(c, p);
  if (!ctx.ok) return log("failed", "", String(ctx.error ?? "context failed"));
  if (ctx.has_open_opp !== "yes") return log("done", `No open deal for ${contactId} — nothing to score`);

  const agentId = await afterCallAgentId(c);
  if (!agentId) return log("failed", "", "couldn't find the Archie After Call agent — check it's published with that exact name");

  let res = await agentExecute(c.token, agentId, { locationId: c.loc, message: String(ctx.message).slice(0, 9900), contactId }, `aftercall-${contactId}-${Date.now()}`);
  if (res.status === 429 || res.status >= 500) {
    await new Promise((ok) => setTimeout(ok, Math.min(20, Number(res.retryAfter) || 8) * 1000));
    res = await agentExecute(c.token, agentId, { locationId: c.loc, message: String(ctx.message).slice(0, 9900), contactId }, `aftercall-${contactId}-${Date.now()}`);
  }
  if (!res.ok || res.json?.success === false) return log("failed", "", `After Call agent error ${res.status}: ${String(res.text).slice(0, 200)}`);

  const text = String(res.json?.finalText ?? "");
  const data = parseJsonObject(clean(text));
  if (!data) return log("failed", "", `After Call answer wasn't JSON: ${text.slice(0, 150)}`);
  if (data.found === false) return log("done", `No call found for ${contactId}`);

  const saved = await callSave(c, { contact_id: contactId, output: JSON.stringify(data) });
  // callSave logs its own run summary
  return saved;
}

async function afterCallAgentId(c: any): Promise<string | null> {
  const cache: Record<string, string> = (c.cfg.agent_ids && typeof c.cfg.agent_ids === "object") ? { ...c.cfg.agent_ids } : {};
  if (cache.aftercall) return cache.aftercall;
  const r = await ghl(c.token, `/agent-studio/managed-agents?locationId=${c.loc}&limit=100`, "GET", undefined, "v3");
  const found = (r.json?.agents ?? []).find((a: any) => AFTER_CALL_NAMES.map((n) => n.toLowerCase()).includes(String(a.name ?? "").trim().toLowerCase()));
  if (!found) return null;
  cache.aftercall = found.id;
  await supabase.from("tenant_config").update({ agent_ids: cache }).eq("tenant_id", c.tid);
  return found.id;
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

// ===================== helpers =====================
async function fieldIds(c: any) {
  const r = await ghl(c.token, `/locations/${c.loc}/customFields?model=opportunity`);
  const list: any[] = r.json?.customFields ?? [];
  const find = (key: string) => list.find((f) => String(f.fieldKey ?? "").toLowerCase().endsWith(key) || String(f.name ?? "").toLowerCase().replace(/\s+/g, "_") === key)?.id ?? null;
  return { intent: find(FIELD_KEYS.intent), chance: find(FIELD_KEYS.chance), next: find(FIELD_KEYS.next) };
}

async function businessDetails(c: any) {
  const r = await ghl(c.token, `/locations/${c.loc}`);
  const l = r.json?.location ?? {};
  const address = [l.address, l.city, l.state, l.postalCode].filter(Boolean).join(", ");
  const biz: Record<string, unknown> = { name: l.name || c.business || "Business" };
  if (l.phone) biz.phoneNo = l.phone;
  if (address) biz.address = address;
  if (l.website) biz.website = l.website;
  if (l.logoUrl) biz.logoUrl = l.logoUrl;
  return biz;
}

async function notifyOwner(c: any, title: string, body: string) {
  const quiet = !!c.owner?.quiet_until && String(c.owner.quiet_until) >= c.today;
  const channel = String(c.cfg.brief_channel ?? "sms").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
  let sent = false, why: string | null = null;
  if (quiet) why = "quiet mode";
  else if (!c.owner?.ghl_contact_id) why = "owner contact not set";
  else {
    const r = await ghl(c.token, "/conversations/messages", "POST", { type: channel, contactId: c.owner.ghl_contact_id, message: `${title}\n\n${body}`.slice(0, 1500) }, "2021-04-15");
    sent = r.ok; if (!r.ok) why = `send failed ${r.status}`;
  }
  await supabase.from("notifications").insert({ tenant_id: c.tid, source: "sales", title, body, channel: channel.toLowerCase(), sent, error: why });
}

async function ghl(token: string, path: string, method = "GET", body?: unknown, version = "2021-07-28") {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(BASE + path, { method, signal: ctrl.signal, headers: { "Authorization": `Bearer ${token}`, "Version": version, "Accept": "application/json", "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text(); let js: any = null; try { js = JSON.parse(text); } catch { js = null; }
    return { ok: r.ok, status: r.status, json: js, text };
  } catch (e) { return { ok: false, status: 0, json: null, text: String(e) }; }
  finally { clearTimeout(tm); }
}

function parseJsonObject(s: string): any {
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}
function clean(s: string) {
  return s.replace(/```json|```/g, "")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/<br\s*\/?>/gi, "\n").trim();
}
function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function str(v: unknown) { return String(v ?? "").trim(); }
function j(b: unknown, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } }); }
function localDate(ms: number, tz: string) { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms)); }
function addDays(d: string, n: number) { const [y, m, dd] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd + n)).toISOString().slice(0, 10); }
