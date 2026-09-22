const GHL_KEY = Deno.env.get("GHL_AGENCY_API_KEY")!;
Deno.serve(async () => {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch("https://services.leadconnectorhq.com/contacts/search", {
      method: "POST", signal: ctrl.signal,
      headers: { "Authorization": `Bearer ${GHL_KEY}`, "Version": "2021-07-28", "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: "9qyiAfgwpRRcns6kP332", page: 1, pageLimit: 5, filters: [{ field: "tags", operator: "eq", value: "active user" }] }),
    });
    clearTimeout(tm);
    const text = await r.text();
    return new Response(JSON.stringify({ status: r.status, ms: Date.now() - t0, keyPresent: !!GHL_KEY, body: text.slice(0, 400) }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), ms: Date.now() - t0, keyPresent: !!GHL_KEY }), { headers: { "Content-Type": "application/json" } });
  }
});
