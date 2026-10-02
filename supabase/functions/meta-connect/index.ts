// meta-connect v1 — "Connect Instagram" for Archie (Facebook Login for Business, your existing Meta app).
// GET ?code&state from Meta → long-lived user token → the Page that has an Instagram business account → its Page token
// (Page tokens from a long-lived user token don't expire) → saved per client in ig_connections → a simple "connected" page.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const APP_ID = Deno.env.get("META_APP_ID") ?? "";
const APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";
const REDIRECT = `${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-connect`;
const G = "https://graph.facebook.com/v21.0";

function page(title: string, msg: string, ok: boolean) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;background:#111;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.c{max-width:420px;padding:32px;text-align:center}.d{width:72px;height:72px;border-radius:50%;margin:0 auto 18px;background:${ok ? "#E0312B" : "#444"};display:flex;align-items:center;justify-content:center;font-size:36px}
h1{font-size:22px;margin:0 0 10px}p{color:#bbb;line-height:1.5}</style></head><body><div class="c"><div class="d">${ok ? "✓" : "!"}</div><h1>${title}</h1><p>${msg}</p><p style="font-size:13px;color:#888">You can close this tab and go back to Archie.</p></div></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

Deno.serve(async (req) => {
  console.log("meta-connect v1");
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state") ?? "";
  const err = u.searchParams.get("error_description") || u.searchParams.get("error");
  if (err) return page("Instagram wasn't connected", `Meta said: ${err}. Try again from Archie's Settings.`, false);
  if (!code || !state) return page("Something's missing", "Start the connection again from Archie's Settings.", false);

  // The state links this login to one Archie client (made when they tapped Connect; single use, 30 minutes)
  const { data: st } = await supabase.from("oauth_states").select("tenant_id, created_at, used").eq("state", state).maybeSingle();
  if (!st || st.used || Date.now() - Date.parse(st.created_at) > 30 * 60000) return page("That link has expired", "Tap Connect Instagram in Archie again.", false);
  await supabase.from("oauth_states").update({ used: true }).eq("state", state);
  const tid = st.tenant_id;

  try {
    const t1: any = await fetch(`${G}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${encodeURIComponent(REDIRECT)}&code=${encodeURIComponent(code)}`).then((r) => r.json());
    if (!t1.access_token) return page("Couldn't finish connecting", `Meta: ${t1.error?.message ?? "no token"}.`, false);
    const t2: any = await fetch(`${G}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${t1.access_token}`).then((r) => r.json());
    const userToken = t2.access_token ?? t1.access_token;

    // Every Page they manage, with its Instagram account — use the one that has Instagram (not just the first Page)
    const pages: any = await fetch(`${G}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,followers_count}&limit=50&access_token=${userToken}`).then((r) => r.json());
    const withIg = (pages.data ?? []).filter((p: any) => p.instagram_business_account?.id);
    if (!withIg.length) return page("No Instagram business account found", "Your Instagram needs to be a Business or Creator account linked to a Facebook Page, and you need to tick that Page when Meta asks. Then try again.", false);
    const chosen = withIg[0];
    const ig = chosen.instagram_business_account;
    await supabase.from("ig_connections").upsert({
      tenant_id: tid, page_id: chosen.id, page_name: chosen.name, page_token: chosen.access_token,
      ig_user_id: ig.id, ig_username: ig.username, followers: ig.followers_count ?? null,
      other_accounts: withIg.slice(1).map((p: any) => ({ page: p.name, ig: p.instagram_business_account?.username })),
      connected_at: new Date().toISOString(), last_error: null,
    }, { onConflict: "tenant_id" });
    await supabase.from("tenant_config").update({ instagram_handle: String(ig.username ?? "").toLowerCase() }).eq("tenant_id", tid);
    return page(`Connected @${ig.username}`, `Archie will pull your Instagram results every night — reach, saves, shares, views and followers — and show what's working in Content → See how it did.${withIg.length > 1 ? ` (You manage ${withIg.length} Instagram accounts; Archie is using @${ig.username}.)` : ""}`, true);
  } catch (e) {
    return page("Something went wrong", String(e).slice(0, 160), false);
  }
});
