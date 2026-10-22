// archie-screens v9.9.8 — data and actions for the Archie AI Studio pages.
// v9.9.8: Forge — a task left on a past day (not done, not moved) rolls onto Today with carried=true and carried_from,
//         instead of disappearing from every list. The planner rolls any unfinished task to the next working day only
//         (Mon not done → Tue → Wed…), pinned there, even when the day is full — it never jumps to next week.
// v9.9.7: YouTube editor (Archie Plus) — one long video → pauses, fillers and retakes cut, chapters, hook lower-third and
//         end screen, 16:9 render (ArchieLong), 3 titles, description with chapters, tags, captions file, 3 thumbnails
//         (ArchieThumb, best face picked from 6 frames). split=true also renders each chapter as its own video.
//         Page: yt_upload_url, yt_start, yt_list, yt_get. Workflow: yt_start, yt_run, yt_thumbs, yt_check.
// v9.9.6: Waiting on you buttons read the button from "act" (the page route uses "action" for the route name itself,
//         so a page call could never say skip/post/send before). Status check —  — one workflow call (action "status") reports what's actually live: this version, which secrets
//         are set (yes/no only), which database tables and columns exist, which edge functions are deployed, whether
//         the GHL agents are there, the last run of every daily job, recent reels, and which app buttons have ever
//         reached the server (so a button that never shows up isn't wired).
// v9.9.5: bulk group links by contact ID; first-name-only groups never guessed.
// v9.9.4: tasks the Scraper spots in your messages (1:1s and groups) go straight into the Forge Inbox (held, no day)
//         instead of Waiting on you — schedule them when you're ready. "Add" on any older proposal does the same.
//         The morning brief says how many landed in the Inbox instead of listing P1/P2.
//         No duplicates: the Scraper is told what's already tracked (last 45 days, any status — done and skipped
//         included), and anything it still repeats (same message, or the same task worded differently) is archived
//         as a duplicate instead of landing in the Inbox.
//         Group links use the "wa group" tag: only tagged contacts are treated as group chats (even quiet ones),
//         and tagged groups with no name match are listed so you can say which client they belong to. A first-name-only
//         group that could be two clients is never guessed. Bulk linking by contact ID (groups_link with pairs), and
//         groups_suggest / groups_link / groups_list on the workflow route.
// v9.9.3: brain-dumped tasks are HELD in the Inbox (Forge doesn't auto-plan them) until you give each a day — moving,
//         pinning or adding with a date releases them.
// v9.9.2: broll_add — photos/clips from WhatsApp (or the app) are kept in Archie's storage, described, given a proper
//         file name, uploaded into GHL Media → B-roll, and added to the B-roll library; a summary is sent back.
// v9.9.1: the morning brief in the app — the short version is saved with each brief (and made for anyone who
//         doesn't get WhatsApp), brief_today returns it (short, full, focus, 3 things, waiting count, voice note, read
//         state), "Go" in the app (brief_go), and brief_channel "app" skips WhatsApp (brief lives in the app; email optional).
// v9.9: Launchpad numbers (revenue, MRR, cash, clients, leads, booked/showed/no-show calls, offers, new clients,
//       churn, new MRR, pipeline — this month or this week), Inbox brain dump (one ramble → tasks, organised), capacity
//       per day in Next 7 Days, "Save all as drafts" for a reel's content pack, and second-opinion history.
// v9.8.1: tasks_list for a TickTick-style Forge — every open task with its planned day (or none = Inbox), priority
//         and pinned day, in one plain call.
// v9.8: simple Forge actions for the app — task_add (type a task, it's saved straight away and Forge places it),
//       task_done (tick), task_remove — each one plain and instant, then Forge re-plans.
// v9.7.9: Waiting on you tidies itself — reels drop off after 3 days, drafts and spotted tasks after 5; "Clear all"
//         (app: waiting_clear; WhatsApp: "clear waiting") empties it in one go; every page call is logged.
// v9.7.8: Forge "today" behaves like a checklist — moving a task pins it to that day (so it can't come back into today),
//         forge_plan_get returns today's list in order, what's left, and day_complete; WhatsApp "move X to tomorrow"
//         does the same pin.
// v9.7.7: the content pack lives with each reel in the app — edit_list returns each reel's carousel + story (slides,
//         status), email and LinkedIn post; "Give to Sara" hands the pack to a team member as a Forge task (+ WhatsApp);
//         failed reels show plain words and can be dismissed.
// v9.7.6: B-roll variety — own clips used in the last 3 days aren't offered again (stock fills in instead), and the
//         last-resort picker never repeats a recent clip.
// v9.7.5: every reel always sends its own hook text (the plan's, else a short version of its own title or first line)
//         and its own arrays, so template sample text can never appear.
// v9.7.4: drafts that are really notes for the owner ("[TASK FOR …]") show as tasks (Done / Skip) and can never be sent;
//         old waiting items (over 5 days) drop off on their own; a workflow route for Waiting on you actions (testing).
// v9.7.3: Forge week view — pin a task to a day ("this has to happen Thursday") and Forge plans around it; the week
//         comes back as a 3:3:3 board per day. Waiting on you logs every call that reaches it (to prove app taps).
// v9.7.2: B-roll and motion graphics are guaranteed — the B-roll folder is read automatically before an edit if it
//         hasn't been (or is over a day old); if the plan has no B-roll/graphics (agent skipped them, or an old plan
//         is reused) a quick second pass adds them; and if that still gives nothing, Archie places them itself
//         (B-roll by matching words to clip descriptions; logos for brands mentioned; icons for key ideas; underlines).
// v9.7.1: long reel steps (re-cuts, retries, final checks, week-of-content parts, hook versions) each start in a FRESH
//         request with its own time allowance (they were being cut off inside one long request and stalling), the
//         render watcher hands over after 5 minutes, and a stuck-reel sweep restarts anything that hasn't moved in
//         12 minutes once (then fails with a message).
// v9.7: button parity — app actions for everything you can say: lock in the plan, running late (push), send all, draft
//       check-ins for reds/yellows, upcoming calls + prep, this month, post as a draft, report a problem, what's new,
//       and who sees what in More (nav_access). WhatsApp: change working hours / 3:3:3 by voice.
// v9.6.3: edit_list returns reels already sorted for the app — in_progress, ready (to post), posted, failed — with a plain
//         status line, thumbnail (cover) and video link for each.
// v9.6.2: Waiting on you — "undo" for a skip (puts it back), and a clear error when the app sends nothing usable.
// v9.6.1: scripts written from the app are also sent on WhatsApp when ready (or a clear message if it failed), and
//         every failure is logged — no more silent "writing…".
// v9.6: Forge 3:3:3 — each working day holds at most 3 Must, 3 To-do and 3 Bonus (changeable). Anything not done rolls
//       over and slots into the next free space in its own tier (carried-over first, then due date, then oldest);
//       To-dos and Bonuses due today/tomorrow are lifted into a free Must slot. Forge shows today as a 3:3:3 board.
// v9.5.3: Forge is back as the name for the action hub (tasks, Waiting on you, the plan) in Archie's replies.
// v9.5.2: Waiting on you actions accept any wording/case (Skip, skip, dismiss, bin, remove…), work out the kind from the
//         id if it's missing, and log every call so a failed tap is visible.
// v9.5.1: a reel started from the app (teleprompter / upload) gets a WhatsApp straight away ("editing your reel from
//         N clips — I'll send it here"), and edit_list includes reels being checked or delivered.
// v9.5: simplicity — "Waiting on you" (one inbox for every draft, proposal and reel ready to post: Send / Skip / Edit /
//       Post), a short brief (focus, 3 things, what's waiting, "reply go"; "full brief" for everything), a 5pm evening
//       wrap, one Sunday recap (money, clients, content, next week), a monthly win-back offer, a Numbers headline
//       sentence, and the onboarding coach rebuilt as a 14-day path to first wins.
// v9.4: script writing runs in the background (the page no longer times out — it polls "script_get"); a guided
//       "make a reel" on WhatsApp (pick an idea or give a topic → the script → film each line → "edit these" → post it).
// v9.3: "write me a reel about…" — Archie writes the script (create-reel-script skill, short lines to film one at a time)
//       and puts it at the top of the filming list, ready for the teleprompter.
// v9.2.1: stock B-roll also from Pixabay (free, commercial use, instant key) — used when there's no Pexels key or Pexels
//         has nothing; vertical clips preferred, landscape cropped to fit.
// v9.2: teleprompter (an idea's script as short lines, hook first, for filming one line at a time — the page can record
//       each line and send them all as one multi-clip edit) and a consistency coach (weekly reel target, streak, a
//       Thursday nudge with the next idea to film if behind, and a Sunday recap).
// v9.1: content team — captions spell their names right (custom words), "post it" schedules at their best time
//       (from their own Instagram), comment-to-DM call to action (keyword + offer), every reel becomes a content
//       stack (carousel, story, email, LinkedIn post), hook A/B versions on request ("hooks"), a weekly learning loop
//       (what works for THIS account, fed back into every edit), and the brand kit read from their website.
// v9.0: premium edits — motion graphics (brand logos, icons, hand-drawn underline/circle, emoji) on their cue words, a
//       built-in sound pack (pop/whoosh/tick + music beds by style), multi-clip edits (send several clips, one per
//       sentence/scene → one reel, a new angle each line), a cover for every reel, face tracking through the clip, a
//       Studio layout, and custom styles from any reel ("match the vibe", Plus) — "use @creator style".
// v8.5: B-roll falls back to Pexels (free stock, commercial use, vertical clips) when a client has no B-roll folder or
//       nothing of theirs fits a moment — their own clips always come first.
// v8.4: B-roll from the client's own clips — a "B-roll" folder in GHL Media is synced and each clip/photo described once
//       (Gemini); the edit plan picks 2–4 matching moments (never the hook or the call to action, no repeats) and the
//       reel cuts away to them while the voice and captions carry on. "Refresh my B-roll" re-syncs.
// v8.3: reel style presets (from studying top reels; our own design) — Minimal (serif, word-by-word highlight, snap
//       punch-ins, warm grade), Clean (persistent hook header + step counter, karaoke captions mid-frame, dark cards, no
//       zooms), Energetic (rounded font, alternating colours, bouncy pops, snap zooms every sentence, sound on cuts, pastel
//       cards), plus the original Archie style. Plan adds an on-screen hook and where each new point starts.
//       Setting: reel_style; per reel: "edit in energetic style" / "try it in clean style".
// v8.2: punchy edits (default) — every gap over 0.18s cut, filler phrases removed (um/uh/erm, "you know", "I mean",
//       "basically", filler "like,"), the plan drops waffle (aim 20–45s), and alternate cuts get a small punch-in on the
//       face to hide jump cuts. "Make it more natural" / "make it punchier" switch pace on a re-edit.
// v8.1: reliable, faster, honest edits — every clip is copied into Archie's own storage first (WhatsApp/GHL links can be
//       too slow for the renderer), renders get a longer frame timeout, a failed render retries once by itself, Archie
//       watches each render every 20 seconds (no waiting for the 5-minute check), and if a reel, week of content or
//       carousel/story still fails, the person gets a WhatsApp saying so in plain English with what to do.
// v8.0.2: Edit v2 for everyone — the old editor no longer makes reels (every edit, re-edit and week-of-content reel
//         uses v2).
// v8.0.1: screenshots — the image type is read from the file itself (WhatsApp links often say "octet-stream", which
//         Gemini rejects with a 400); every model's error is kept so failures are clear.
// v8.0: cost alert — each client's projected cost this month (AI runs + reels, carousels, stories, ideas, screenshots,
//       voice) against their budget (default £105 = £297 − £175 profit − £17 hosting); amber at 70%, red at 100%, on the
//       Clients page and a WhatsApp to you once per level per month.
// v7.9: Edit v2 polish — cards start on their cue word and stay 2–3s, a natural 0.8s hold at the end, optional soft card
//       sound + licensed music bed (Settings), the cut check also catches doubled words, and the final check scores the
//       reel out of 100 against the editing rules.
// v7.8: plans — Archie (£297, monthly limits) and Archie Plus (£397, unlimited, fair use). One allowance check for every
//       limited feature, a friendly message + upgrade line when a limit is reached, usage on Settings and the Clients page.
// v7.7.1: style breakdown — give Archie reel links; it fetches each reel (Apify), Gemini studies the edit (captions,
//         pacing, zooms, hook, graphics, sound, colour) and saves a precise style spec (the base for style presets and
//         "match the vibe"). WhatsApp: "break down these reels: <links>".
// v7.7: Archie Edit v2 (per client: edit_engine = v2) — a designed card for most sentences, caption styles (karaoke /
//       bold / single word), framing and zooms centred on the face (face check on a frame), clean audio (ElevenLabs voice
//       isolator), a no-chopped-words check after rendering (re-transcribe; widen the cuts and re-render once if needed)
//       and a final quality check (Gemini watches the finished reel) before it's sent.
// v7.6.2: cancelled or paused clients are refused on every workflow route too (WhatsApp, edits, screenshots,
//         scheduled jobs) — not just the pages and the toolbox.
// v7.6.1: screenshots work in the background — WhatsApp gets "reading that now" straight away and the result is messaged
//         when it's ready (GHL was giving up waiting, so no reply arrived).
// v7.6: one engine — captions, client messages (follow-ups, check-ins, chases), win-back, call prep, carousel/story copy
//       and "make it yours" now run through their skills (caption, client-message, win-back, pre-call-brief,
//       create-carousel editorial mode, create-reel-script make-it-yours mode). The code sends the facts and the answer
//       format only; the skill holds the writing rules — so improving a skill improves it everywhere.
// v7.5.2: carousel/story photos fall back to OpenAI's image model when Gemini can't make one (quota, billing or a
//         renamed model), and every model's error is recorded so it's clear which one failed and why.
// v7.5.1: forgiving JSON reader for agent replies (line breaks and stray characters inside text no longer break
//         carousels, edit plans, dumps or win-back); carousels retry the copy once if it still can't be read.
// v7.5: drop 2 — one ramble → a week of content (several reels + a carousel from one long video), screenshot anything
//       (Archie reads the picture and acts: lead, task, reply draft), the morning brief as a voice note, and "win back
//       everyone who left" (personal drafts for every cancelled client, from Stripe and their history).
// v7.4: drop 1 — IG story builder (9:16 frames, same pipeline as carousels), "what Archie did for you" in £ and hours
//       (monthly receipt + "your month in 30 seconds" video), quiet alerts for every client, activation numbers per client.
// v7.3: feature usage + feedback — every skill and feature used (page, WhatsApp, voice) is logged; thumbs up/down and
//       comments on anything Archie made (page or "that caption was too salesy"); a feature report across all clients:
//       most and least used, never used (removal candidates), feedback and comments.
// v7.2: carousel builder — a topic (or your own copy) → a 7-slide editorial campaign: Archie writes each slide (counter,
//       headline, supporting copy, a photo brief), Gemini makes each photo with NO text, Remotion sets the typography on a
//       fixed 12-column grid (always crisp, same position every slide), slides go to GHL Media; "post it" → Social Planner.
// v7.1: Forge auto-scheduling (Motion-style) — reads each person's calendar, finds the free time inside their working
//       hours, and places tasks into slots (carried-over first, then due date, then must/high/bonus; deep work in the
//       mornings); re-plans before the brief, every hour when tasks or calendar change, and on "replan my day"; optional
//       task blocks on their personal calendar (syncs to Google); today's plan in the brief; "won't fit" warnings.
// v7.0: content loop + auto call prep — "Upload my take" / "edit, this is idea 2": Archie Edit gets the idea's hook and
//       script, titles the reel, starts from the idea's caption and marks the idea filmed; page uploads also go into GHL
//       Media. Call prep arrives on WhatsApp ~30 minutes before each booked call (not personal events).
// v6.9: onboarding coach — for the first 30 days Archie sends the owner one short tip a day (14 tips, then weekly), skipping
//       anything they've already used; the control panel shows days since they last talked to Archie and alerts you (and
//       Sara) when a client in their first 30 days goes quiet for 2+ days.
// v6.8: Instagram insights — Connect Instagram (your Meta app, via meta-connect), nightly sync of every post's reach,
//       views, saves, shares, likes, comments, interactions and reel watch time + followers; "See how it did" (vs your
//       normal, winners, plain-English summary); your winners get "why it worked" + a follow-up idea; by voice too.
// v6.7.2: captions you can see and change — "write a caption" shows it, "make the caption shorter / add a question"
//         rewrites it, "caption: …" uses your own words; "post it" uses the latest caption; the page can edit it too.
// v6.7.1: "post it" on WhatsApp → your latest reel goes into Social Planner as a draft (Instagram/Facebook/TikTok/YouTube
//         accounts), with a caption; the reel-ready message says so.
// v6.7: your control panel — agency_overview (every client: checkup status, last brief, cost this month, reds, failed
//       runs) for the agency account only; every 3 hours Archie checks all clients and WhatsApps you when one goes red.
// v6.6.6: fresh ideas every week — each account's top 3 recent posts (vs their own normal) are worked up every check,
//         as well as any big standouts; two worked on at a time so a batch is ready faster.
// v6.6.5: standout posts from the whole 60 days count (was 30), so strong older posts aren't skipped.
// v6.6.4: Find ideas fixes — weekly limit raised to 12 and a "Find new ideas" tap always gets its own batch; the page
//         stops spinning when nothing's being worked on; a plain note when a check finds nothing new.
// v6.6.3: ideas_list also says what Archie's doing right now (accounts being checked, posts being worked on, last checked)
//         so the page can show live progress after "Find new ideas".
// v6.6.2: see the original — each outlier's video (and thumbnail) is kept privately for reference so it plays on the
//         Content page (Instagram's own links expire); private links only, cleared after 60 days.
// v6.6.1: Find ideas fixes — tries the current Gemini models in turn, records why a video couldn't be watched, and asks
//         for the idea as simple labelled lines (much more reliable than JSON).
// v6.6: Find ideas (native SMAI) — watched Instagram accounts scraped weekly (Apify), each post scored against that
//       account's normal (outliers = 3x+), Gemini watches the outliers ("see why it worked"), Archie turns each into an idea
//       in your voice ("make it yours") with a hook, script and filming note; Monday WhatsApp with the best ones.
// v6.5: Archie Edit from WhatsApp — capture starts edits for videos sent with "edit"; Talk to Archie handles reel changes
//       ("make it shorter", "different hook") and "how many edits have I got left?".
// v6.4: Archie Edit — upload a raw clip → Deepgram transcript with word timings → Archie's edit plan (best takes, hook,
//       emphasis, overlays, zooms) → captions and cuts worked out exactly → Remotion Lambda render in the client's brand →
//       MP4 into their GHL media → "📹 Your reel's ready". Monthly allowance per client. Schedule days accept mon,tue… too.
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
      // Cancelled or paused clients get nothing (the agency's own checks still run through dispatch, which only sees active clients)
      {
        const { data: tst } = await supabase.from("tenants").select("status").eq("id", tenant_id).maybeSingle();
        if (!tst || tst.status !== "active") return j({ ok: true, skipped: `client is ${tst?.status ?? "unknown"}` });
      }
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
      if (action === "edit_start") {
        startInBackground(logFeature(tenant_id, "edit_start", "whatsapp", String(p.handle ?? "") || null));
        const { data: own } = await supabase.from("team_members").select("handle").eq("tenant_id", tenant_id).eq("gets_financials", true).maybeSingle();
        return j(await editStart(tenant_id, String(p.handle ?? own?.handle ?? "owner"), p));
      }
      if (action === "ideas_run") return j(await ideasFindNow(tenant_id));
      if (action === "ig_sync_run") return j(await igSync(tenant_id));
      if (action === "coach_run") return j(await coachRun(tenant_id, p));
      if (action === "broll_sync_run") return j(await brollSync(tenant_id));
      if (action === "content_learn_run") return j(await contentLearn(tenant_id, false));
      if (action === "evening_wrap_run") return j(await eveningWrap(tenant_id));
      if (action === "sunday_recap_run") return j(await sundayRecap(tenant_id));
      if (action === "winback_offer_run") return j(await winbackOffer(tenant_id));
      if (action === "content_nudge_run") return j(await contentNudge(tenant_id));
      if (action === "content_week_run") return j(await contentWeek(tenant_id, true));
      if (action === "forge_plan") return j(await forgePlan(tenant_id, { force: true }));
      if (action === "waiting_act") return j(await waitingAct(tenant_id, String(p.kind ?? ""), String(p.id ?? ""), String(p.act ?? p.do ?? ""), p));
      if (action === "waiting_list") return j(await waitingList(tenant_id));
      if (action === "status") return j(await statusCheck(tenant_id));
      if (action === "app_selftest") return j(await appSelftest(tenant_id));
      if (action === "yt_start") return j(await ytStart(tenant_id, p.handle ? String(p.handle) : null, p));
      if (action === "yt_run") { startInBackground(ytRun(tenant_id, String(p.id ?? ""))); return j({ ok: true }); }
      if (action === "yt_thumbs") { startInBackground(ytThumbs(tenant_id, String(p.id ?? ""))); return j({ ok: true }); }
      if (action === "faces_set") return j(await facesSet(tenant_id, p));
      if (action === "capacity_check") return j(await capacityCheck(tenant_id, String(p.handle ?? ""), p));
      if (action === "week_split") return j(await weekSplit(tenant_id, String(p.handle ?? "")));
      if (action === "client_time") return j(await clientTime(tenant_id, Number(p.days ?? 30) || 30));
      if (action === "mrr_pace") return j(await mrrPace(tenant_id));
      if (action === "faces_list") return j(await facesList(tenant_id));
      if (action === "yt_check") { await ytCheck(tenant_id, String(p.id ?? "")); return j(await ytGet(tenant_id, String(p.id ?? ""))); }
      if (action === "groups_suggest") return j(await groupsSuggest(tenant_id));
      if (action === "groups_link") return j(await groupsLink(tenant_id, p));
      if (action === "groups_list") return j(await groupsList(tenant_id));
      if (action === "waiting_clear") return j(await waitingClear(tenant_id));
      if (action === "broll_add") {
        const items = (Array.isArray(p.urls) ? p.urls : []).map((x: any) => typeof x === "string" ? { url: x, kind: /\.(mp4|mov|m4v|3gp|mkv)(\?|$)/i.test(x) ? "video" : "image" } : x).filter((x: any) => /^https?:/.test(String(x?.url ?? ""))).slice(0, 20);
        if (!items.length) return j({ ok: false, text: "Send the photos or clips first, then say \"add these to my B-roll\"." });
        startInBackground(brollAdd(tenant_id, items, true));
        return j({ ok: true, text: `🎞️ Got ${items.length === 1 ? "it" : `all ${items.length}`} — naming ${items.length === 1 ? "it" : "them"} and adding to your B-roll now. I'll message you when ${items.length === 1 ? "it's" : "they're"} in.` });
      }
      if (action === "edit_run") {
        // A fresh request for one pipeline run (so it gets its own time allowance)
        const { data: jb } = await supabase.from("edit_jobs").select("plan").eq("id", String(p.id ?? "")).maybeSingle();
        const plan = p.plan ?? (p.use_plan ? jb?.plan ?? null : null);
        startInBackground(editPipeline(tenant_id, String(p.id ?? ""), p.replan === true, plan));
        return j({ ok: true });
      }
      if (action === "edit_check_run") {
        const { data: jb } = await supabase.from("edit_jobs").select("*").eq("id", String(p.id ?? "")).maybeSingle();
        if (jb) startInBackground(v2Check(tenant_id, jb, String(p.url ?? jb.output_url ?? "")));
        return j({ ok: true });
      }
      if (action === "screenshot") {
        startInBackground(logFeature(tenant_id, "screenshot", "whatsapp", String(p.handle ?? "") || null));
        // Answer straight away; read the picture in the background and message the result (GHL won't wait 30s+)
        startInBackground((async () => {
          const handle = String(p.handle ?? "");
          let r: any;
          try { r = await screenshotAct(tenant_id, handle, String(p.image_url ?? ""), String(p.instruction ?? "")); }
          catch (e) { r = { ok: false, text: `I couldn't read that screenshot (${String(e).slice(0, 80)}). Try again, or say "save" to keep it in your media.` }; }
          const { data: m } = await supabase.from("team_members").select("ghl_contact_id").eq("tenant_id", tenant_id).eq("handle", handle).maybeSingle();
          const { data: c2 } = await supabase.from("tenant_config").select("ghl_token, brief_channel").eq("tenant_id", tenant_id).single();
          if (m?.ghl_contact_id) await ghl(c2?.ghl_token || FALLBACK_TOKEN, "/conversations/messages", "POST", { type: String(c2?.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS", contactId: m.ghl_contact_id, message: String(r?.text ?? "Done.") }, "2021-04-15");
        })());
        return j({ ok: true, text: "📸 Reading that now — give me a moment." });
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
    console.log("page action", action);
    // Forge re-slots as soon as a task changes (done, removed, added, moved) — not just on the hourly check
    if (/task|waiting_act|forge_hours/.test(action) && !/_get$|_list$/.test(action)) startInBackground((async () => { await new Promise((ok) => setTimeout(ok, 1500)); await forgePlanIfNeeded(tenant.id); })());
    // Usage log for anything that does something (reads aren't counted)
    if (!/^(overview|.*_list|.*_get|.*_status|settings_get|usage|agency_overview|pin_login|logout|runs|run_get|pick_.*|ideas_accounts|feature_report|groups_list|memory_list)$/.test(action)) {
      startInBackground(logFeature(tenant.id, action === "run" ? `skill:${String(p.skill ?? p.key ?? "unknown")}` : action, p.session ? "page" : "toolbox", c.owner?.handle ?? null));
    }

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
      case "ig_connect_url": return j(await igConnectUrl(c.tid));
      case "ig_status": { const { data } = await supabase.from("ig_connections").select("ig_username, page_name, followers, connected_at, last_sync_at, last_error, other_accounts").eq("tenant_id", c.tid).maybeSingle(); return j({ ok: true, connected: !!data, ...(data ?? {}) }); }
      case "ig_disconnect": { await supabase.from("ig_connections").delete().eq("tenant_id", c.tid); return j({ ok: true, text: "Instagram disconnected." }); }
      case "ig_sync": return j(await igSync(c.tid));
      case "coach_status": return j(await coachStatus(c.tid));
      case "forge_plan": return j(await forgePlan(c.tid, { force: true }));
      case "carousel_start": return j(await carouselStart(c.tid, c.owner?.handle ?? "owner", p));
      case "carousel_get": return j(await carouselGet(c.tid, String(p.id ?? "")));
      case "carousel_list": { const { data } = await supabase.from("carousels").select("id, topic, status, slides, created_at, planner_post_id, caption").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(20); return j({ ok: true, carousels: data ?? [] }); }
      case "carousel_redo_slide": return j(await carouselRedoSlide(c.tid, String(p.id ?? ""), Number(p.n ?? 0), p));
      case "carousel_post": return j(await carouselPost(c.tid, String(p.id ?? "")));
      case "feedback": return j(await saveFeedback(c.tid, c.owner?.handle ?? null, p));
      case "plan_usage": return j(await planUsage(c.tid));
      case "launchpad": return j(await launchpad(c, String(p.period ?? "month")));
      case "broll_add": { const items = (Array.isArray(p.urls) ? p.urls : []).map((x: any) => typeof x === "string" ? { url: x, kind: /\.(mp4|mov|m4v)(\?|$)/i.test(x) ? "video" : "image" } : x).slice(0, 20); for (const pth of Array.isArray(p.paths) ? p.paths : []) { const { data } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(String(pth), 86400); if (data?.signedUrl) items.push({ url: data.signedUrl, kind: /\.(mp4|mov|m4v|webm)$/i.test(String(pth)) ? "video" : "image" }); } startInBackground(brollAdd(c.tid, items, true)); return j({ ok: true, text: `Adding ${items.length} to your B-roll — named and ready in a minute or two.` }); }
      case "brief_today": return j(await briefToday(c));
      case "brief_go": {
        const tz = (await supabase.from("tenant_config").select("timezone").eq("tenant_id", c.tid).maybeSingle()).data?.timezone || "Europe/London";
        await supabase.from("briefs").update({ read_at: new Date().toISOString() }).eq("tenant_id", c.tid).eq("brief_date", localDate(Date.now(), tz)).eq("audience", c.owner?.handle ?? "");
        startInBackground(logFeature(c.tid, "plan_go", "page", c.owner?.handle ?? null));
        return j({ ok: true, text: "👍 Plan's locked in. Have a good one." });
      }
      case "inbox_dump": {
        const text = String(p.text ?? "").trim();
        if (text.length < 3) return j({ ok: false, text: "Type or say what's on your mind first." });
        const before = new Date().toISOString();
        const d: any = await dumpAnything(c.tid, c.owner, text);
        // Brain-dumped tasks land in the Inbox (no day yet) — you date them as you go
        const { data: made } = await supabase.from("tasks").select("id, title, tier").eq("tenant_id", c.tid).gte("created_at", before).in("status", ["open", "proposed"]);
        if ((made ?? []).length) await supabase.from("tasks").update({ status: "open", hold: true, pinned_date: null, scheduled_start: null, scheduled_end: null }).in("id", (made ?? []).map((t: any) => t.id));
        return j({ ok: true, tasks: made ?? [], text: (made ?? []).length ? `Sorted into ${(made ?? []).length} task${(made ?? []).length === 1 ? "" : "s"} in your Inbox — give each one a day when you're ready.` : (d?.text ?? "Saved as a note.") });
      }
      case "pack_drafts": return j(await packDrafts(c.tid, String(p.id ?? "")));
      case "tasks_list": {
        const { data: cfgT } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", c.tid).maybeSingle();
        const tz = cfgT?.timezone || "Europe/London";
        const today = localDate(Date.now(), tz);
        const { data } = await selNewCols((cols) => supabase.from("tasks").select(cols).eq("tenant_id", c.tid).eq("owner", c.owner?.handle ?? "").in("status", ["open", "doing"]).order("created_at", { ascending: true }).limit(300), "id, title, tier, plan_slot, due_date, pinned_date, scheduled_start, scheduled_end, effort_minutes, owner, created_at, hold, detail, kind, block_event_id, area, client_id, critical, move_count, project_id, checklist, waiting_on, moves_acked");
        // v9.11.3: client names for the task sheet
        const tlIds = [...new Set((data ?? []).map((t: any) => t.client_id).filter(Boolean))];
        const tlNames: Record<string, string> = {};
        if (tlIds.length) { const { data: cs } = await supabase.from("clients").select("id, name").eq("tenant_id", c.tid).in("id", tlIds); for (const cl of cs ?? []) tlNames[cl.id] = cl.name; }
        const tasks = (data ?? []).map((t: any) => {
          const rawDay = t.scheduled_start ? localDate(Date.parse(t.scheduled_start), tz) : t.pinned_date ?? null;
          // v9.9.8: anything left on a past day rolls onto today (it used to fall out of every list)
          const carried = !!rawDay && rawDay < today;
          const day = carried ? today : rawDay;
          return { id: t.id, title: t.title, held: !!t.hold, carried, carried_from: carried ? rawDay : null, priority: t.plan_slot ?? t.tier ?? "high", day: t.hold ? null : day, time: t.scheduled_start ? new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(t.scheduled_start)) : null, pinned: !!t.pinned_date, due: t.due_date ?? null, overdue: !!t.due_date && t.due_date < today, notes: t.detail ?? "", area: ["growth", "clients", "admin"].includes(t.area) ? t.area : null, client_id: t.client_id ?? null, client_name: t.client_id ? tlNames[t.client_id] ?? null : null, tier: t.tier ?? "high", critical: !!t.critical, move_count: Number(t.move_count) || 0, moves_since: (Number(t.move_count) || 0) - (Number(t.moves_acked) || 0), project_id: t.project_id ?? null, checklist: Array.isArray(t.checklist) ? t.checklist : [], waiting_on: t.waiting_on ?? null, minutes: Math.max(15, Number(t.effort_minutes) || 30), kind: t.kind === "deep" ? "deep" : "shallow", end_time: t.scheduled_end ? new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(t.scheduled_end)) : null, on_calendar: !!t.block_event_id };
        });
        const days: string[] = []; for (let i = 0; i < 7; i++) days.push(addDays(today, i));
        // Capacity per day: planned task time vs the hours set for tasks (max_task_hours), only on working days
        const { data: me } = await supabase.from("team_members").select("max_task_hours, work_days").eq("tenant_id", c.tid).eq("handle", c.owner?.handle ?? "").maybeSingle();
        const capMin = Math.round((Number(me?.max_task_hours ?? 6) || 6) * 60);
        const workDays = String(me?.work_days ?? "1,2,3,4,5").split(",").map(Number);
        const effortOf = new Map((data ?? []).map((t: any) => [t.id, Math.max(15, Number(t.effort_minutes) || 30)]));
        const capacity = Object.fromEntries(days.map((d) => {
          const planned = tasks.filter((t: any) => t.day === d).reduce((a: number, t: any) => a + Number(effortOf.get(t.id) ?? 30), 0);
          const working = workDays.includes(new Date(d + "T12:00:00Z").getUTCDay());
          const cap = working ? capMin : 0;
          return [d, { planned_min: planned, capacity_min: cap, free_min: Math.max(0, cap - planned), label: working ? `${Math.round((planned / 60) * 10) / 10}h of ${Math.round((cap / 60) * 10) / 10}h` : "Day off", full: working && planned >= cap }];
        }));
        return j({ ok: true, today, days, capacity, today_tasks: tasks.filter((t: any) => t.day === today), inbox: tasks.filter((t: any) => !t.day || t.day > days[6]), by_day: Object.fromEntries(days.map((d) => [d, tasks.filter((t: any) => t.day === d)])) });
      }
      case "task_add": {
        const title = String(p.title ?? p.text ?? "").trim();
        if (!title) return j({ ok: false, text: "Type the task first." });
        const tier = ["must", "high", "bonus"].includes(String(p.tier ?? "")) ? String(p.tier) : "high";
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(p.date ?? "")) ? String(p.date) : null;
        const notes = String(p.notes ?? "").trim().slice(0, 2000);
        const due = /^\d{4}-\d{2}-\d{2}$/.test(String(p.due ?? p.due_date ?? "")) ? String(p.due ?? p.due_date) : null;
        // v9.10: no time given → Archie estimates how long it takes and whether it needs focus
        const est: any = Number(p.minutes) > 0 ? { ...(await taskEstimate(c.tid, title, notes, true)), minutes: Number(p.minutes), kind: p.kind === "deep" ? "deep" : (p.kind === "shallow" ? "shallow" : "shallow") } : await taskEstimate(c.tid, title, notes);
        const minutes = Math.max(15, Math.min(480, Math.round(est.minutes / 15) * 15 || 30));
        const { data: row, error } = await supabase.from("tasks").insert({ tenant_id: c.tid, title: title.slice(0, 200), detail: notes || null, due_date: due, tier, kind: est.kind, ...(p.critical === true || String(p.critical) === "true" ? { critical: true } : {}), ...(p.project_id ? { project_id: String(p.project_id) } : {}), ...(Array.isArray(p.checklist) ? { checklist: cleanChecklist(p.checklist) } : {}), area: ["growth", "clients", "admin"].includes(String(p.area)) ? String(p.area) : est.area, client_id: p.client_id ? String(p.client_id) : est.client_id, effort_minutes: minutes, status: "open", owner: c.owner?.handle ?? null, source: "forge", source_ref: `forge:${crypto.randomUUID()}`, pinned_date: date, accepted_by: c.owner?.handle ?? null, accepted_at: new Date().toISOString() }).select("id").single();
        if (error) return j({ ok: false, text: `Couldn't add it: ${error.message}` });
        await forgePlan(c.tid, { force: true, from_now: true });
        return j(await taskLanded(c.tid, c.owner?.handle ?? "", row!.id, date));
      }
      case "task_update": {
        // v9.10: edit a task's detail — anything left out stays as it is
        const upd: Record<string, unknown> = {};
        if (p.title !== undefined) upd.title = String(p.title).trim().slice(0, 200);
        if (p.notes !== undefined) upd.detail = String(p.notes ?? "").trim().slice(0, 2000) || null;
        if (["growth", "clients", "admin"].includes(String(p.area ?? ""))) upd.area = String(p.area);
        if (p.client_id !== undefined) upd.client_id = p.client_id ? String(p.client_id) : null;
        if (p.minutes !== undefined) upd.effort_minutes = Math.max(15, Math.min(480, Math.round((Number(p.minutes) || 30) / 15) * 15));
        if (p.critical !== undefined) upd.critical = p.critical === true || String(p.critical) === "true";
        // v9.14: project, checklist (subtasks), waiting on the client
        if (p.project_id !== undefined) upd.project_id = p.project_id ? String(p.project_id) : null;
        if (p.checklist !== undefined) upd.checklist = cleanChecklist(p.checklist);
        if (p.waiting !== undefined) {
          if (p.waiting === true || String(p.waiting) === "true") { upd.status = "waiting"; upd.scheduled_start = null; upd.scheduled_end = null; upd.today = false; }
          else { const { data: cur } = await supabase.from("tasks").select("status").eq("tenant_id", c.tid).eq("id", String(p.id ?? "")).maybeSingle(); if (cur?.status === "waiting") upd.status = "open"; }
        }
        if (p.waiting_on !== undefined) upd.waiting_on = String(p.waiting_on ?? "").trim().slice(0, 200) || null;
        if (p.kind !== undefined) upd.kind = p.kind === "deep" ? "deep" : "shallow";
        if (["must", "high", "bonus"].includes(String(p.tier ?? ""))) upd.tier = String(p.tier);
        if (p.due !== undefined || p.due_date !== undefined) { const d = String(p.due ?? p.due_date ?? ""); upd.due_date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
        if (p.date !== undefined) { const d = String(p.date ?? ""); upd.pinned_date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; if (upd.pinned_date) upd.hold = false; }
        if (!Object.keys(upd).length) return j({ ok: false, text: "Nothing to change." });
        const { error } = await supabase.from("tasks").update(upd).eq("tenant_id", c.tid).eq("id", String(p.id ?? ""));
        if (error) return j({ ok: false, text: error.message });
        if (upd.tier !== undefined || upd.pinned_date !== undefined || upd.status !== undefined) await ackMoves(c.tid, String(p.id ?? ""));
        await forgePlan(c.tid, { force: true, from_now: true });
        return j(await taskLanded(c.tid, c.owner?.handle ?? "", String(p.id ?? ""), typeof upd.pinned_date === "string" ? upd.pinned_date : null, "Saved"));
      }
      case "task_estimate": return j({ ok: true, ...(await taskEstimate(c.tid, String(p.title ?? ""), String(p.notes ?? ""))) });
      case "capacity_check": return j(await capacityCheck(c.tid, c.owner?.handle ?? "", p));
      case "week_split": return j(await weekSplit(c.tid, c.owner?.handle ?? ""));
      case "client_time": return j(await clientTime(c.tid, Number(p.days ?? 30) || 30));
      case "client_value_set": { const v = Number(String(p.monthly_value ?? "").replace(/[£,\s]/g, "")); const { error } = await supabase.from("clients").update({ monthly_value: v > 0 ? v : null }).eq("tenant_id", c.tid).eq("id", String(p.client_id ?? "")); return j(error ? { ok: false, text: error.message } : { ok: true, text: "Saved." }); }
      case "mrr_pace": return j(await mrrPace(c.tid));
      case "clients_pick": { const { data } = await supabase.from("clients").select("id, name").eq("tenant_id", c.tid).eq("status", "active").order("name").limit(400); return j({ ok: true, clients: data ?? [] }); }
      case "task_done": {
        const { data: t, error } = await supabase.from("tasks").update({ status: "done", updated_at: new Date().toISOString() }).eq("tenant_id", c.tid).eq("id", String(p.id ?? "")).select("title").maybeSingle();
        if (error || !t) return j({ ok: false, text: "Couldn't tick that one off." });
        startInBackground(forgePlan(c.tid, { force: true, from_now: true }));
        return j({ ok: true, text: `Done: ${t.title} ✅` });
      }
      case "task_undone": {
        await supabase.from("tasks").update({ status: "open" }).eq("tenant_id", c.tid).eq("id", String(p.id ?? ""));
        startInBackground(forgePlan(c.tid, { force: true, from_now: true }));
        return j({ ok: true, text: "Put back." });
      }
      case "task_remove": {
        const { data: t } = await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "removed in Forge" }).eq("tenant_id", c.tid).eq("id", String(p.id ?? "")).select("title").maybeSingle();
        startInBackground(forgePlan(c.tid, { force: true, from_now: true }));
        return j({ ok: !!t, text: t ? `Removed: ${t.title}` : "Couldn't remove that one." });
      }
      case "waiting_list": return j(await waitingList(c.tid));
      case "waiting_clear": { console.log("waiting_clear page call"); return j(await waitingClear(c.tid)); }
      case "task_move": return j(await taskMove(c.tid, String(p.id ?? ""), String(p.to ?? "tomorrow"), c.owner?.handle ?? null));
      case "edit_dismiss": { await supabase.from("edit_jobs").update({ error: `dismissed: ${new Date().toISOString()}` }).eq("tenant_id", c.tid).eq("id", String(p.id ?? "")).eq("status", "failed"); return j({ ok: true, text: "Cleared." }); }
      case "pack_handoff": return j(await packHandoff(c.tid, String(p.id ?? ""), String(p.handle ?? "")));
      case "team_list": { const { data } = await supabase.from("team_members").select("handle, name, gets_financials").eq("tenant_id", c.tid).neq("active", false); return j({ ok: true, team: (data ?? []).map((m: any) => ({ handle: m.handle, name: m.name || m.handle, owner: !!m.gets_financials })) }); }
      case "task_pin": {
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(p.date ?? "")) ? String(p.date) : null;
        // v9.9.9: inbox:true (a task dragged into the Inbox) takes it off every day and holds it there
        const toInbox = p.inbox === true || p.inbox === "true";
        const upd: Record<string, unknown> = { pinned_date: toInbox ? null : date, ...(toInbox ? { hold: true, scheduled_start: null, scheduled_end: null } : date ? { hold: false } : {}) };
        if (["must", "high", "bonus"].includes(String(p.tier ?? ""))) upd.tier = String(p.tier);
        const { error } = await supabase.from("tasks").update(upd).eq("tenant_id", c.tid).eq("id", String(p.id ?? ""));
        if (error) return j({ ok: false, text: error.message });
        await ackMoves(c.tid, String(p.id ?? ""));
        await forgePlan(c.tid, { force: true, from_now: true });
        if (toInbox) return j({ ok: true, text: "Back in your Inbox." });
        return j({ ok: true, text: date ? `Pinned to ${new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long" })}. Forge has planned around it.` : "Unpinned — Forge will place it." });
      }
      case "task_add_on": {
        // Pre-plan: add a task straight onto a day
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(p.date ?? "")) ? String(p.date) : null;
        const title = String(p.title ?? "").trim(); if (!title) return j({ ok: false, text: "What's the task?" });
        const tier = ["must", "high", "bonus"].includes(String(p.tier ?? "")) ? String(p.tier) : "high";
        const { error } = await supabase.from("tasks").insert({ tenant_id: c.tid, title: title.slice(0, 200), tier, kind: "shallow", effort_minutes: Math.max(15, Number(p.minutes) || 30), status: "open", owner: c.owner?.handle ?? null, source: "forge_week", source_ref: `week:${crypto.randomUUID()}`, pinned_date: date, accepted_by: c.owner?.handle ?? null, accepted_at: new Date().toISOString() });
        if (error) return j({ ok: false, text: error.message });
        await forgePlan(c.tid, { force: true, from_now: true });
        return j({ ok: true, text: `Added${date ? ` to ${new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long" })}` : ""}.` });
      }
      case "plan_go": { const g: any = await forgePlanGet(c.tid, c.owner?.handle ?? "", 1); startInBackground(logFeature(c.tid, "plan_go", "page", c.owner?.handle ?? null)); return j({ ok: true, text: "👍 Plan's locked in for today.", today_text: g?.today_text }); }
      case "plan_push": { const mins = Math.max(15, Math.min(240, Number(p.minutes ?? 30))); const x: any = await forgePlan(c.tid, { force: true, from_now: true, delay_minutes: mins }); const g: any = await forgePlanGet(c.tid, c.owner?.handle ?? "", 1); return j({ ok: !!x.ok, text: x.ok ? `Pushed everything back ${mins} minutes.` : x.text, today_text: g?.today_text }); }
      case "send_all": return j(await sendAllDrafts(c.tid));
      case "checkins_draft": return j(await checkinsDraft(c.tid, String(p.which ?? "both")));
      case "upcoming_calls": return j(await upcomingCalls(c.tid, c.owner?.handle ?? ""));
      case "month_stats": { const st: any = await monthStats(c.tid); return j(st); }
      case "month_video": { const st: any = await monthStats(c.tid); startInBackground(monthVideo(c.tid, st)); return j({ ok: true, text: "🎬 Making your month video — it'll arrive on WhatsApp in a few minutes." }); }
      case "report_problem": return j(await reportProblem(c.tid, c.owner?.handle ?? null, String(p.text ?? ""), String(p.screen ?? "")));
      case "whats_new": return j({ ok: true, items: WHATS_NEW });
      case "nav_access": { const { data: cf } = await supabase.from("tenant_config").select("is_agency").eq("tenant_id", c.tid).maybeSingle(); const fin = c.owner?.gets_financials !== false; return j({ ok: true, show_numbers: fin, show_clients: fin, show_winback: fin, show_month: fin, show_agency: !!cf?.is_agency, role: fin ? "owner" : "team" }); }
      case "waiting_act": { console.log("waiting_act page call", JSON.stringify(p).slice(0, 300)); return j(await waitingAct(c.tid, String(p.kind ?? ""), String(p.id ?? ""), String(p.act ?? p.button ?? p.action_name ?? p.choice ?? ""), p)); }
      case "numbers_headline": return j(await numbersHeadline(c.tid));
      case "brief_full": { const { data } = await supabase.from("briefs").select("body, brief_date").eq("tenant_id", c.tid).eq("audience", c.owner?.handle ?? "owner").order("brief_date", { ascending: false }).limit(1).maybeSingle(); return j({ ok: true, text: data?.body ?? "No brief yet today." }); }
      case "teleprompter_get": return j(await teleprompter(c.tid, p));
      case "script_write": {
        // Answer at once; write in the background (it takes 20–40s)
        const { data: ph } = await supabase.from("content_posts").insert({ tenant_id: c.tid, handle: "archie", source: "archie", pick: "script", shortcode: `script_${crypto.randomUUID()}`, idea: { title: String(p.topic ?? "Your reel").slice(0, 120), writing: true }, score: 0, status: "writing", updated_at: new Date().toISOString() }).select("id").single();
        if (!ph?.id) return j({ ok: false, error: "Couldn't start the script." });
        startInBackground((async () => {
          const r: any = await writeScript(c.tid, c.owner?.handle ?? "owner", String(p.topic ?? ""), String(p.notes ?? ""), ph.id).catch((e: any) => ({ ok: false, text: String(e) }));
          console.log("script_write", JSON.stringify({ id: ph.id, ok: !!r?.ok, text: String(r?.text ?? "").slice(0, 160) }));
          if (!r?.ok) {
            await supabase.from("content_posts").update({ status: "failed", idea: { title: String(p.topic ?? "Your reel").slice(0, 120), error: r?.text ?? "failed" } }).eq("id", ph.id);
            await sendToMember(c.tid, c.owner?.handle ?? null, `⚠️ I couldn't write the script about "${String(p.topic ?? "").slice(0, 60)}": ${String(r?.text ?? "something went wrong").slice(0, 160)} Try again in a minute, or say "write me a reel about…" here.`);
          } else {
            await sendToMember(c.tid, c.owner?.handle ?? null, r.text);
          }
        })());
        return j({ ok: true, id: ph.id, status: "writing", text: "Writing your script — about 30 seconds." });
      }
      case "script_get": { const { data } = await supabase.from("content_posts").select("id, status, idea").eq("tenant_id", c.tid).eq("id", String(p.id ?? "")).maybeSingle(); if (!data) return j({ ok: false, error: "not found" }); return j({ ok: true, id: data.id, status: data.status === "to_film" ? "ready" : data.status, idea: data.idea, lines: data.status === "to_film" ? [data.idea?.hook, ...(data.idea?.script ?? [])].filter(Boolean) : [] }); }
      case "content_streak": return j(await contentWeek(c.tid, false));
      case "brand_from_site": return j(await brandFromSite(c.tid, String(p.url ?? ""), p.force === true));
      case "content_learn": return j(await contentLearn(c.tid, false));
      case "hook_versions": return j(await hookVersions(c.tid, p.id ? String(p.id) : undefined));
      case "content_stack_get": { const { data } = await supabase.from("content_stacks").select("*").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(10); return j({ ok: true, stacks: data ?? [] }); }
      case "styles_list": { const { data } = await supabase.from("custom_styles").select("id, name, base, created_at").eq("tenant_id", c.tid).order("created_at", { ascending: false }); const { data: cf } = await supabase.from("tenant_config").select("reel_style").eq("tenant_id", c.tid).maybeSingle(); return j({ ok: true, current: cf?.reel_style ?? "clean", presets: [{ key: "minimal", name: "Minimal", about: "Serif captions, word-by-word highlight, subtle snaps, warm grade" }, { key: "clean", name: "Clean", about: "Hook box + step counter, karaoke captions, no zooms" }, { key: "energetic", name: "Energetic", about: "Bouncy colour captions, snap zooms, sound on every cut, emojis" }, { key: "studio", name: "Studio", about: "Your face in a card on a branded background, visuals above" }], custom: data ?? [] }); }
      case "style_use": return j(await useStyle(c.tid, String(p.name ?? p.key ?? "")));
      case "broll_sync": { startInBackground(brollSync(c.tid, true)); return j({ ok: true, text: "Checking your B-roll folder — new clips are described in a few minutes." }); }
      case "broll_list": { const { data } = await supabase.from("broll_library").select("id, name, kind, url, description, last_used_at").eq("tenant_id", c.tid).eq("active", true).order("created_at", { ascending: false }).limit(100); return j({ ok: true, items: data ?? [] }); }
      case "style_breakdown": { const urls = (Array.isArray(p.urls) ? p.urls : String(p.urls ?? "").split(/\s+/)).filter((u: string) => /instagram\.com\/(reel|p)\//.test(u)).slice(0, 6); startInBackground(styleBreakdown(c.tid, urls, true)); return j({ ok: true, text: `Breaking down ${urls.length} reel${urls.length === 1 ? "" : "s"} — about 2–4 minutes.` }); }
      case "style_specs": { const { data } = await supabase.from("style_specs").select("id, url, spec, created_at").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(20); return j({ ok: true, specs: data ?? [] }); }
      case "screenshot": return j(await screenshotAct(c.tid, c.owner?.handle ?? "owner", String(p.image_url ?? ""), String(p.instruction ?? "")));
      case "winback": return j(await winBack(c.tid, Number(p.months ?? 12)));
      case "feature_report": return j(await featureReport(c.tid, Number(p.days ?? 30)));
      case "forge_plan_get": return j(await forgePlanGet(c.tid, String(p.handle ?? ""), Number(p.days ?? 5)));
      case "forge_hours_save": return j(await forgeHoursSave(c.tid, p));
      case "ig_results": return j(await igResults(c.tid, Number(p.days ?? 60)));
      case "agency_overview": return j(await agencyOverview(c.tid));
      case "ideas_accounts": { const { data } = await supabase.from("watched_accounts").select("handle, platform, followers, median_views, last_scraped_at, active").eq("tenant_id", c.tid).eq("active", true).order("handle"); return j({ ok: true, accounts: data ?? [] }); }
      case "ideas_account_add": return j(await ideasAccountAdd(c.tid, String(p.handle ?? "")));
      case "ideas_account_remove": { await supabase.from("watched_accounts").update({ active: false }).eq("tenant_id", c.tid).eq("handle", String(p.handle ?? "").replace(/^@/, "").toLowerCase()); return j({ ok: true }); }
      case "ideas_find_now": return j(await ideasFindNow(c.tid));
      case "ideas_list": return j(await ideasList(c.tid, String(p.status ?? "")));
      case "idea_update": return j(await ideaUpdate(c.tid, String(p.id ?? ""), String(p.status ?? "")));
      case "edit_upload_url": return j(await editUploadUrl(c.tid, String(p.filename ?? "clip.mp4")));
      case "yt_upload_url": return j(await editUploadUrl(c.tid, String(p.filename ?? "youtube.mp4")));
      case "yt_start": return j(await ytStart(c.tid, c.owner?.handle ?? null, p));
      case "yt_list": return j(await ytList(c.tid));
      case "faces_upload_url": return j(await editUploadUrl(c.tid, `face-${String(p.filename ?? "face.png")}`));
      case "faces_set": return j(await facesSet(c.tid, p));
      case "faces_list": return j(await facesList(c.tid));
      case "yt_get": { const g: any = await ytGet(c.tid, String(p.id ?? "")); if (g.ok && ["rendering", "thumbs"].includes(g.job.status)) { await ytCheck(c.tid, String(p.id)); return j(await ytGet(c.tid, String(p.id))); } return j(g); }
      case "edit_start": {
        const r: any = await editStart(c.tid, c.owner?.handle ?? "owner", p);
        // Started from the app: confirm on WhatsApp so they know where it'll arrive
        if (r?.ok) {
          const n = (Array.isArray(p.paths) ? p.paths.length : 0) + (Array.isArray(p.video_urls) ? p.video_urls.length : 0);
          startInBackground(sendToMember(c.tid, c.owner?.handle ?? null, `🎬 Got your ${n > 1 ? `${n} clips` : "clip"} — editing your reel now. It takes about ${n > 1 ? "6–10" : "5–8"} minutes and I'll send it here when it's ready. (You can close the app.)`));
        }
        return j(r);
      }
      case "edit_status": return j(await editStatus(c.tid, String(p.id ?? "")));
      case "edit_list": {
        const { data } = await supabase.from("edit_jobs").select("id, title, status, progress, output_url, ghl_media_url, cover_url, error, created_at, caption, planner_post_id, scheduled_for, parent_id, kind, variant").eq("tenant_id", c.tid).or("kind.is.null,kind.neq.month").order("created_at", { ascending: false }).limit(40);
        const label: Record<string, string> = { transcribing: "Listening to your clips…", planning: "Choosing the best takes…", rendering: "Putting it together…", checking: "Final checks…", delivering: "Almost there…" };
        const item = (r: any) => ({ id: r.id, title: r.title || "Your reel", status: r.status, status_text: r.status === "done" ? (r.planner_post_id && r.planner_post_id !== "skipped" ? (r.scheduled_for ? `Scheduled ${new Date(r.scheduled_for).toLocaleString("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "In Social Planner") : "Ready to post") : r.status === "failed" ? "Didn't work" : (label[r.status] ?? "Being made…"), progress: r.progress ?? null, video_url: r.ghl_media_url || r.output_url || null, cover_url: r.cover_url ?? null, caption: r.caption ?? null, created_at: r.created_at, error: r.error ? plainErr(String(r.error)) : null, is_version: !!r.parent_id && !!r.variant, pack: r.status === "done" ? packOf(r.id) : null });
        const rows = (data ?? []).filter((r: any) => !(r.error && String(r.error).startsWith("dismissed:")));
        const recent = (r: any) => Date.now() - Date.parse(r.created_at) < 14 * 86400000;
        // Each finished reel's content pack (carousel, story, email, LinkedIn)
        const doneIds = rows.filter((r: any) => r.status === "done").map((r: any) => r.id);
        const { data: stacks } = doneIds.length ? await supabase.from("content_stacks").select("job_id, carousel_id, story_id, email, linkedin, handed_to").eq("tenant_id", c.tid).in("job_id", doneIds) : { data: [] as any[] };
        const carIds = (stacks ?? []).flatMap((x: any) => [x.carousel_id, x.story_id]).filter(Boolean);
        const { data: cars } = carIds.length ? await supabase.from("carousels").select("id, format, status, caption, planner_post_id, slides").in("id", carIds) : { data: [] as any[] };
        const carOut = (id: string | null) => { const cr: any = (cars ?? []).find((x: any) => x.id === id); return cr ? { id: cr.id, status: cr.status, posted: !!cr.planner_post_id, caption: cr.caption ?? null, images: (cr.slides ?? []).map((sl: any) => sl.image_url).filter(Boolean) } : null; };
        const packOf = (jobId: string) => { const st: any = (stacks ?? []).find((x: any) => x.job_id === jobId); return st ? { carousel: carOut(st.carousel_id), story: carOut(st.story_id), email: st.email ?? null, linkedin: st.linkedin ?? null, handed_to: st.handed_to ?? null } : null; };
        const plainErr = (e: string) => /delayRender|Render failed|timeout/i.test(e) ? "The video wouldn't render — try again." : /speech|hear/i.test(e) ? "Couldn't hear any speech in it." : /stalled/i.test(e) ? "It stalled while being made — try again." : "Something went wrong — try again.";
        return j({
          ok: true,
          in_progress: rows.filter((r: any) => !["done", "failed"].includes(r.status) && Date.now() - Date.parse(r.created_at) < 2 * 86400000).map(item),
          ready: rows.filter((r: any) => r.status === "done" && (!r.planner_post_id) && recent(r)).map(item),
          posted: rows.filter((r: any) => r.status === "done" && r.planner_post_id && r.planner_post_id !== "skipped").slice(0, 10).map(item),
          failed: rows.filter((r: any) => r.status === "failed" && Date.now() - Date.parse(r.created_at) < 3 * 86400000).map(item),
          jobs: rows,
        });
      }
      case "edit_redo": return j(await editRedo(c.tid, String(p.id ?? ""), String(p.change ?? "")));
      case "reel_caption": return j(await reelCaption(c.tid, p));
      case "reel_post": return j(await reelToPlanner(c.tid, p.id ? String(p.id) : undefined));
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
      case "council": {
        const r: any = await councilRun(c.tid, p);
        const asking = /^Before I run the council/i.test(String(r?.text ?? ""));
        const { data: row } = await supabase.from("council_sessions").upsert({ ...(p.session_id ? { id: String(p.session_id) } : {}), tenant_id: c.tid, question: String(p.question ?? "").slice(0, 600), answers: String(p.answers ?? "").slice(0, 1200) || null, result: String(r?.text ?? ""), status: asking ? "asking" : "done", updated_at: new Date().toISOString() }).select("id").single();
        return j({ ...r, session_id: row?.id ?? null, asking });
      }
      case "council_list": { const { data } = await supabase.from("council_sessions").select("id, question, answers, result, status, created_at, updated_at").eq("tenant_id", c.tid).order("updated_at", { ascending: false }).limit(30); return j({ ok: true, sessions: data ?? [] }); }
      case "council_delete": { await supabase.from("council_sessions").delete().eq("tenant_id", c.tid).eq("id", String(p.id ?? "")); return j({ ok: true, text: "Deleted." }); }
      case "call_prep": return j(await callPrep(c.tid, p));
      case "ask_data": return j(await askData(c.tid, String(p.question ?? "")));
      case "dump_anything": return j(await dumpAnything(c.tid, { handle: c.owner?.handle ?? "owner", gets_financials: true }, String(p.text ?? "")));
      case "dumps": { const { data } = await supabase.from("dumps").select("id, handle, clean, summary, created_at").eq("tenant_id", c.tid).order("created_at", { ascending: false }).limit(20); return j({ ok: true, dumps: data ?? [] }); }
      case "member_health": return j(await memberHealthList(c.tid, String(p.status ?? "")));
      case "member_touch": return j(await memberTouch(c.tid, p));
      // v9.14 (Forge Phase 2): projects, the client request inbox, the Overview
      case "projects_list": return j(await projectsList(c.tid, p));
      case "project_get": return j(await projectGet(c.tid, String(p.id ?? "")));
      case "project_save": return j(await projectSave(c.tid, c.owner?.handle ?? "", p));
      case "requests_list": return j(await requestsList(c.tid));
      case "request_add": return j(await requestAdd(c.tid, c.owner?.handle ?? "", p));
      case "request_accept": return j(await requestAccept(c.tid, c.owner?.handle ?? "", p));
      case "request_decline": { const { data: t } = await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "declined request", proposal_rank: null }).eq("tenant_id", c.tid).eq("id", String(p.id ?? "")).eq("status", "proposed").select("title").maybeSingle(); return j({ ok: !!t, text: t ? `Declined: ${t.title}` : "That request has already been dealt with." }); }
      case "forge_overview": return j(await forgeOverview(c.tid, c.owner?.handle ?? ""));
      case "voice_add": return j(await voiceAdd(c.tid, p));
      case "voice_list": return j(await voiceList(c.tid));
      case "voice_remove": { const { error } = await supabase.from("voice_examples").update({ active: false }).eq("tenant_id", c.tid).eq("id", String(p.id ?? "")); return j(error ? { ok: false, text: error.message } : { ok: true, text: "Removed." }); }
      case "voice_feedback": return j(await voiceFeedback(c.tid, p));
      case "member_health_run": { startInBackground(memberHealthRun(c.tid)); return j({ ok: true, text: "Re-scoring your clients — give it a minute, then refresh." }); }
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
    await voiceBlock(tid),
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

  const body: Record<string, unknown> = { type, status: p.schedule_at ? "scheduled" : "draft", accountIds: accounts.map((a) => a.id), userId };
  if (p.schedule_at) body.scheduleDate = String(p.schedule_at);
  // Stories can't carry a caption, so the text goes in as the follow-up comment instead
  if (type !== "story") body.summary = text.slice(0, 2200);
  const many: string[] = Array.isArray(p.media_urls) ? p.media_urls.map(String).filter(Boolean).slice(0, 10) : [];
  if (many.length) body.media = many.map((u) => ({ url: u, type: String(p.media_type ?? "image/png") }));
  else if (mediaUrl) body.media = [{ url: mediaUrl, type: String(p.media_type ?? (type === "post" ? "image/jpeg" : "video/mp4")) }];
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
      supabase.from("team_members").select("handle, name, gets_financials, ghl_contact_id, brief_voice").eq("tenant_id", tid).neq("active", false),
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
    try { const mp: any = await mrrPace(tid); if (mp.line) weekLine = `${mp.line}${weekLine ? ` | ${weekLine}` : ""}`; } catch { /* no pace line */ }
    try {
      const dowB = new Date(localDate(Date.now(), "Europe/London") + "T12:00:00Z").getUTCDay();
      if (dowB === 5) { const ws: any = await weekSplit(tid, ""); if (ws.line) weekLine = `${weekLine}${weekLine ? " | " : ""}${ws.line}`; }
    } catch { /* no split line */ }
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

    // Time-blocked plan for today (Forge auto-scheduling) — fresh plan first
    let planLinesOwner = "", planLinesTeam = "";
    try {
      await forgePlan(tid, { force: true });
      const { data: tmP } = await supabase.from("team_members").select("handle, gets_financials").eq("tenant_id", tid).neq("active", false);
      for (const m of tmP ?? []) {
        const g: any = await forgePlanGet(tid, m.handle, 1);
        if (!g.ok || !g.today_text || /^No /.test(g.today_text)) continue;
        if (m.gets_financials) planLinesOwner = g.today_text.replace(/\n/g, " | ");
        else planLinesTeam += `${m.handle}: ${g.today_text.replace(/\n/g, " | ")} `;
      }
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
    // v9.9.4: tasks spotted in messages are already in the Forge Inbox — say how many, never list them as proposals
    const { count: inboxNew } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "open").eq("hold", true).gte("created_at", new Date(Date.now() - 86400000).toISOString());
    const message = [
      "Execute your instructions now. Use ONLY the data below. It is today's data. Ignore anything from earlier runs or conversations.",
      `The header date must be exactly: ${expected}.`,
      "Capacity comes from the OWNER CAPACITY line. The Today list is exactly the LINEUP lines, with their numbers. Never add a task that is not listed there. At risk comes only from the AT_RISK line.",
      "Voice-first footer (overrides your instructions): do NOT include the command lines 'add P1 · wait P1 · drop P1', 'Reply SEND 1 · SKIP 1' or 'done 1 · move 2 fri · 👍/👎'. Keep the numbers on the lists (1, 2… and P1, P2…) so people can refer to them. End the OWNER brief with exactly one line: 🎙️ Just reply or send a voice note — e.g. \"done the first one\", \"send Jase's message\", \"give P2 to Sara\". End the TEAM brief with exactly one line: 🎙️ Just reply starting with \"Archie\" — e.g. \"Archie, done the first one\".",
      weekLine ? `Weekly pace (OWNER brief only, never the TEAM brief): add this as one line under Money, exactly: 📊 ${weekLine}` : "",
      [speedLine, waitingLine, pipeLine, healthLine].filter(Boolean).length ? `OWNER brief only — add these under Money/Pipeline as short lines, exactly as facts are given: ${[speedLine, waitingLine, pipeLine, healthLine].filter(Boolean).join(" ")}` : "",
      "FOCUS LINE (owner brief): one action, one name, the highest value first — someone waiting on a reply right now beats a proposal waiting, which beats the top must task. E.g. \"Reply to Steph — she's waited 6 hours.\" Never a generic focus.",
      planLinesOwner ? `Today's plan (OWNER brief — show as the time-blocked list, in this order, replacing the plain task list where they overlap): ${planLinesOwner}` : "",
      planLinesTeam ? `Today's plan (TEAM brief — each person's own blocks only): ${planLinesTeam}` : "",
      taskLinesOwner ? `Task check (OWNER brief, short lines near the task list, exactly these facts): ${taskLinesOwner}` : "",
      taskLinesTeam ? `Task check (TEAM brief — each line only in that person's brief): ${taskLinesTeam}` : "",
      csmLines ? `Client success (TEAM brief for the person named, near the top — they own client check-ins; no money totals): ${csmLines}` : "",
      repeatLine ? `Repeating issue (OWNER brief only): mention this in one short line near the Focus, e.g. "Third week in a row: …": ${repeatLine}` : "",
      `Tasks spotted in messages are already in each person's Forge Inbox to schedule — never list them as proposals (no P1, P2 or "add P1"). ${inboxNew ? `OWNER brief: one line, exactly: 📥 ${inboxNew} new in your Forge Inbox — give them a day when you're ready.` : "Don't mention the Inbox."}`,
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
    const shortOn = String(cfg?.brief_style ?? "short") !== "full";
    const appOnly = String(cfg?.brief_channel ?? "").toLowerCase() === "app";
    const today0 = localDate(Date.now(), cfg?.timezone || "Europe/London");
    // Make the short version once, save it with the brief (the app shows it), then send it unless the brief lives in the app
    const deliver = async (m: any, text: string) => {
      if (!m || !text || text.toUpperCase() === "QUIET") return;
      const short = await shortBrief(tid, text, m.handle).catch(() => text);
      await supabase.from("briefs").update({ short_body: short }).eq("tenant_id", tid).eq("brief_date", today0).eq("audience", m.handle);
      if (!appOnly && m.ghl_contact_id) await send(m.ghl_contact_id, shortOn ? short : text, m.handle);
      if (m.brief_voice) startInBackground(briefVoice(tid, m, text));
    };
    await deliver(owner, ownerText);
    await deliver(other, teamText);
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
    // v9.9.4: what's already tracked (any status), so the same request isn't proposed twice
    const { data: known } = await supabase.from("tasks").select("title").eq("tenant_id", tid).gte("created_at", new Date(Date.now() - 45 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(60);
    const knownTxt = [...new Set((known ?? []).map((k: any) => String(k.title ?? "").slice(0, 70)))].join(" | ").slice(0, 1400);
    if (knownTxt) rules += `\n\nALREADY TRACKED (open, done or skipped) — never propose these again, even reworded, even if the message is still in the chat. Only add something genuinely new:\n${knownTxt}`;
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
  const spotFrom = new Date(Date.now() - 10000).toISOString();
  await internal("agent-result", { tenant_id: tid, agent: "scraper", summary: sp.summary, status: sp.isError ? "failed" : "done", metrics: JSON.stringify(sp.metrics), tasks: JSON.stringify(sp.tasks), clients_touched: JSON.stringify(sp.clients) });
  // v9.9.4: spotted tasks go straight to each person's Forge Inbox (held until given a day), not Waiting on you
  if (!sp.isError) await inboxSpotted(tid, spotFrom);
  return sp.isError ? { ok: false, summary: sp.summary, error: sp.summary.slice(0, 200) } : { ok: true, summary: sp.summary };
}

// v9.9.4: tasks the Scraper just spotted → duplicates archived, the rest into each person's Forge Inbox
const TASK_STOP = new Set(["the", "and", "for", "with", "from", "about", "their", "them", "they", "this", "that", "your", "you", "can", "will", "please", "just", "into", "onto", "over", "re", "to", "of", "a", "an", "on", "in", "at", "by", "is", "it", "be", "up"]);
function taskWords(t: string) { return new Set(String(t ?? "").toLowerCase().replace(/[^a-z0-9£ ]+/g, " ").split(/\s+/).filter((w) => w.length > 1 && !TASK_STOP.has(w)).map((w) => w.replace(/(ing|ed|s)$/, ""))); }
function sameTask(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return false;
  let hit = 0; for (const w of a) if (b.has(w)) hit++;
  return hit / (a.size + b.size - hit) >= 0.6;
}
async function inboxSpotted(tid: string, since: string) {
  const [{ data: fresh }, { data: older }] = await Promise.all([
    supabase.from("tasks").select("id, title, source_ref").eq("tenant_id", tid).eq("status", "proposed").gte("created_at", since).order("created_at", { ascending: true }),
    supabase.from("tasks").select("id, title, source_ref").eq("tenant_id", tid).lt("created_at", since).gte("created_at", new Date(Date.now() - 45 * 86400000).toISOString()).limit(1000),
  ]);
  const seen = (older ?? []).map((t: any) => ({ title: String(t.title ?? ""), ref: String(t.source_ref ?? ""), w: taskWords(t.title) }));
  const keep: string[] = [];
  for (const t of fresh ?? []) {
    const w = taskWords(t.title), ref = String(t.source_ref ?? "");
    const dup = seen.find((o) => (ref && o.ref && o.ref === ref) || sameTask(w, o.w));
    if (dup) {
      await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: `duplicate of: ${dup.title.slice(0, 120)}`, proposal_rank: null }).eq("id", t.id);
    } else {
      keep.push(t.id);
      seen.push({ title: String(t.title ?? ""), ref, w }); // also catches repeats within the same run
    }
  }
  if (keep.length) await supabase.from("tasks").update({ status: "open", hold: true, proposal_rank: null, pinned_date: null, scheduled_start: null, scheduled_end: null, today: false }).in("id", keep);
  return { added: keep.length, duplicates: (fresh ?? []).length - keep.length };
}

// ===================== v9.9.7: YouTube editor (Archie Plus) =====================
// One long video in → silences, fillers and retakes cut → chapters, hook and end screen → 16:9 render,
// plus 3 titles, a description with chapters, tags, a captions file and 3 thumbnails. With split on, every chapter
// is also rendered as its own short video (one long walkthrough → a day-by-day library).
// Steps run as a state machine, each in a fresh call: copying → transcribing → planning → rendering → thumbs → done.
const YT_FPS = 30;
const YT_OUTRO = 10;
const YT_FILLERS = new Set(["um", "uh", "erm", "er", "uhm", "hmm", "mm", "ah"]);
const ytLambda = () => Deno.env.get("REMOTION_LONG_FUNCTION") || Deno.env.get("REMOTION_FUNCTION")!;
const ytRegion = () => (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any;
const ytMaxLambdas = () => Math.max(2, Number(Deno.env.get("YT_MAX_LAMBDAS") ?? 8) || 8);

function ytDirect(u: string) {
  const g = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=download&)?id=)([\w-]{20,})/);
  if (g) return `https://drive.usercontent.google.com/download?id=${g[1]}&export=download&confirm=t`;
  if (/dropbox\.com\//.test(u)) return /[?&]dl=0/.test(u) ? u.replace(/([?&])dl=0/, "$1dl=1") : u + (u.includes("?") ? "&dl=1" : "?dl=1");
  return u;
}
const ytClock = (sec: number) => { const s = Math.max(0, Math.floor(sec)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`; };
const srtTime = (sec: number) => { const ms = Math.max(0, Math.round(sec * 1000)); const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), x = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(x).padStart(3, "0")}`; };

async function ytSave(id: string, upd: Record<string, unknown>) {
  await supabase.from("yt_jobs").update({ ...upd, updated_at: new Date().toISOString() }).eq("id", id);
}
async function ytFail(id: string, msg: string) {
  await ytSave(id, { status: "failed", error: msg.slice(0, 500) });
  try {
    const { data: job } = await supabase.from("yt_jobs").select("tenant_id, handle, title").eq("id", id).maybeSingle();
    if (job) await sendToMember(job.tenant_id, job.handle, `⚠️ Sorry — your YouTube edit${job.title ? ` "${job.title}"` : ""} didn't work: ${msg.slice(0, 200)}. Try again, or upload the file in the app if you sent a link.`);
  } catch { /* best effort */ }
}

async function ytStart(tid: string, handle: string | null, p: any) {
  const gate: any = await allowance(tid, "youtube");
  if (!gate.ok) return { ok: false, error: gate.text, text: gate.text };
  let src = String(p.video_url ?? p.url ?? "").trim();
  const path = String(p.path ?? "").trim();
  if (!src && path) { const { data } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 7 * 86400); src = data?.signedUrl ?? ""; }
  if (!/^https?:\/\//.test(src)) return { ok: false, error: "No video — upload it in the app or send a Google Drive or Dropbox link.", text: "No video — upload it in the app or send a Google Drive or Dropbox link." };
  src = ytDirect(src);
  const { data: job, error } = await supabase.from("yt_jobs").insert({
    tenant_id: tid, handle, source_url: src, source_path: path || null, status: "copying",
    title: String(p.title ?? "").slice(0, 150) || null, brief: String(p.brief ?? "").slice(0, 800) || null,
    split: p.split === true || String(p.split) === "true",
  }).select("id").single();
  if (error || !job) return { ok: false, error: error?.message ?? "couldn't start" };
  startInBackground(runFresh("yt_run", { tenant_id: tid, id: job.id }));
  return { ok: true, id: job.id, text: `Got it — editing your YouTube video${p.split ? " (and a short video for every chapter)" : ""}. Long videos take 10–30 minutes; I'll message you when it's ready.` };
}

async function ytList(tid: string) {
  const { data } = await supabase.from("yt_jobs").select("id, title, status, progress, error, outputs, thumbs, created_at").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(20);
  return { ok: true, jobs: data ?? [] };
}
async function ytGet(tid: string, id: string) {
  const { data } = await supabase.from("yt_jobs").select("id, title, status, progress, error, split, plan, renders, thumbs, outputs, created_at").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!data) return { ok: false, error: "not found" };
  return { ok: true, job: data };
}

// v9.9.10: copy the source into our storage and say exactly what went wrong if it can't
async function ytCopy(tid: string, id: string, url: string): Promise<{ ok: true; url: string } | { ok: false; why: string }> {
  if (url.includes("/storage/v1/object/")) return { ok: true, url };
  let src: Response;
  try { src = await fetch(url, { redirect: "follow" }); } catch (e) { return { ok: false, why: `Couldn't reach that link (${String(e).slice(0, 80)}).` }; }
  const type = (src.headers.get("content-type") ?? "").toLowerCase();
  const size = Number(src.headers.get("content-length") ?? 0);
  console.log("yt copy", src.status, type, size);
  if (src.status === 403 || src.status === 401 || src.status === 404) return { ok: false, why: `The link said ${src.status} — it isn't public. In Google Drive: Share → General access → "Anyone with the link".` };
  if (!src.ok || !src.body) return { ok: false, why: `The link answered ${src.status}. Try the link again or upload the file in the app.` };
  if (type.includes("text/html")) {
    const html = (await src.text()).slice(0, 4000).toLowerCase();
    const why = /sign in|accounts\.google|servicelogin/.test(html) ? "Google wants a sign-in, so the file isn't shared publicly. Share → General access → \"Anyone with the link\"."
      : /quota|too many users/.test(html) ? "Google Drive says the download limit for this file has been hit. Wait an hour or upload the file in the app."
      : "That link opens a web page, not the video file. Use the file's own Share link (drive.google.com/file/d/…), or upload it in the app.";
    return { ok: false, why };
  }
  const path = `sources/${tid}/yt-${id}.mp4`;
  const { data: up, error: upErr } = await supabase.storage.from(CLIPS_BUCKET).createSignedUploadUrl(path);
  if (!up?.signedUrl) return { ok: false, why: `Storage wouldn't take the upload: ${upErr?.message ?? "no upload URL"}.` };
  const put = await fetch(up.signedUrl, { method: "PUT", headers: { "Content-Type": type.startsWith("video/") ? type : "video/mp4", "x-upsert": "true" }, body: src.body, duplex: "half" } as any);
  if (!put.ok) {
    const msg = (await put.text()).slice(0, 200);
    console.log("yt copy put", put.status, msg);
    if (put.status === 413 || /too large|exceeded the maximum|payload/i.test(msg)) return { ok: false, why: `The video${size ? ` (${Math.round(size / 1048576)} MB)` : ""} is bigger than your storage upload limit. Raise it in Supabase: Storage → Settings → Upload file size limit, and the archie-clips bucket's limit.` };
    return { ok: false, why: `Storage refused the file (${put.status}): ${msg}` };
  }
  const { data: signed } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 7 * 86400);
  if (!signed?.signedUrl) return { ok: false, why: "Copied the video but couldn't make a link to it." };
  return { ok: true, url: signed.signedUrl };
}

// One step of the state machine; each step ends by calling the next in a fresh request
async function ytRun(tid: string, id: string) {
  const { data: job } = await supabase.from("yt_jobs").select("*").eq("id", id).maybeSingle();
  if (!job) return;
  try {
    if (job.status === "copying") {
      const cp = await ytCopy(tid, id, job.source_url);
      if (!cp.ok) return ytFail(id, cp.why);
      await ytSave(id, { source_url: cp.url, status: "transcribing", progress: 10 });
      return runFresh("yt_run", { tenant_id: tid, id });
    }
    if (job.status === "transcribing") {
      const key = Deno.env.get("DEEPGRAM_API_KEY");
      if (!key) return ytFail(id, "Transcription isn't set up (DEEPGRAM_API_KEY missing)");
      const terms = await deepgramTerms(tid);
      const r = await fetch(`https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&filler_words=true&language=en${terms}`, { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ url: job.source_url }) });
      const js: any = await r.json().catch(() => null);
      if (!r.ok) return ytFail(id, `Transcription failed (${r.status})`);
      const alt = js?.results?.channels?.[0]?.alternatives?.[0];
      const words = (alt?.words ?? []).map((x: any) => ({ w: String(x.punctuated_word ?? x.word), s: Number(x.start), e: Number(x.end) }));
      if (!words.length) return ytFail(id, "I couldn't hear any speech in it");
      await ytSave(id, { transcript: { words, duration: Number(js?.metadata?.duration ?? words[words.length - 1].e) }, status: "planning", progress: 25 });
      return runFresh("yt_run", { tenant_id: tid, id });
    }
    if (job.status === "planning") return ytPlanAndRender(tid, job);
  } catch (e) { return ytFail(id, `Edit failed: ${String(e).slice(0, 200)}`); }
}

async function ytPlanAndRender(tid: string, job: any) {
  const id = job.id;
  const words: { w: string; s: number; e: number }[] = job.transcript?.words ?? [];
  // 1. Sentences
  const sentences: { id: number; text: string; s: number; e: number; from: number; to: number; gap: number }[] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    const gap = i + 1 < words.length ? words[i + 1].s - w.e : 9;
    if (/[.!?]$/.test(w.w) || gap > 1.5 || cur.length >= 40) {
      const prevEnd = sentences.length ? sentences[sentences.length - 1].e : 0;
      sentences.push({ id: sentences.length + 1, text: cur.map((k) => words[k].w).join(" "), s: words[cur[0]].s, e: words[cur[cur.length - 1]].e, from: cur[0], to: cur[cur.length - 1], gap: Math.max(0, words[cur[0]].s - prevEnd) });
      cur = [];
    }
  });
  // 2. The plan (retakes to drop, chapters, titles, description, thumbnails)
  const { data: cfg } = await supabase.from("tenant_config").select("brand_primary, brand_accent, brand_text, brand_logo_url, business_name").eq("tenant_id", tid).maybeSingle();
  const prompt = [
    "You are editing a long-form YouTube video from its transcript. Below are its sentences with ids, times and the pause before each.",
    "1) DROP: list sentence ids to cut — false starts, sentences that are re-said straight after (keep the LAST complete take, drop the earlier ones), \"sorry/hang on/let me start that again\" asides, recording checks at the start or end (\"is this recording?\"). Do NOT drop real content, do not reorder, do not shorten the explanation.",
    "2) CHAPTERS: where each new section starts (sentence id) with a short title. If the speaker says \"Day N\", start a chapter there titled \"Day N: <topic>\". The first chapter is at the first kept sentence. 4–15 chapters for a long video, none shorter than about 30 seconds.",
    "3) TITLES: 3 YouTube titles under 60 characters (one plain, one curiosity, one with a number or result). HOOK: the on-screen opener, max 7 words.",
    "4) DESCRIPTION: 2 short paragraphs in plain UK English (no chapters, no hashtags). TAGS: 8–12. THUMBS: 3 thumbnail texts, 2–4 words each, styles bold, question, number (number only if a real number was said; otherwise another bold). END: what to watch next or a call to action, max 8 words, and a sub line.",
    job.title ? `The owner's working title: ${job.title}` : "",
    job.brief ? `The owner's brief: ${job.brief}` : "",
    cfg?.business_name ? `Business: ${cfg.business_name}` : "",
    'Return ONLY JSON: {"drop":[ids],"chapters":[{"at":id,"title":"…"}],"titles":["…","…","…"],"hook":"…","description":"…","tags":["…"],"thumbs":[{"text":"…","style":"bold|question|number"}],"end":{"text":"…","sub":"…"}}',
    "",
    "SENTENCES:",
    ...sentences.map((x) => `${x.id} [${ytClock(x.s)}${x.gap > 2 ? ` · pause ${x.gap.toFixed(0)}s` : ""}] ${x.text}`),
  ].filter(Boolean).join("\n").slice(0, 300000);
  const r = await openai("chat/completions", { model: "gpt-4.1-mini", response_format: { type: "json_object" }, temperature: 0.2, messages: [{ role: "user", content: prompt }] });
  const js: any = await r.json().catch(() => null);
  let plan: any = null;
  try { plan = looseJson(String(js?.choices?.[0]?.message?.content ?? "")); } catch { plan = null; }
  if (!plan) return ytFail(id, `I couldn't work out the edit (${r.status})`);
  const drop = new Set<number>((Array.isArray(plan.drop) ? plan.drop : []).map(Number));
  // 3. Segments: kept words minus fillers; cut any pause over 0.6s down to ~0.3s
  const PAD = 0.15;
  type Seg = { s: number; e: number; first: number; last: number };
  const segs: Seg[] = [];
  let prevK = -9;
  for (const st of sentences) {
    if (drop.has(st.id)) continue;
    for (let k = st.from; k <= st.to; k++) {
      const w = words[k];
      if (YT_FILLERS.has(w.w.toLowerCase().replace(/[^a-z]/g, ""))) continue;
      const last = segs[segs.length - 1];
      if (last && k === prevK + 1 && w.s - words[prevK].e <= 0.6) { last.e = w.e + PAD; last.last = k; }
      else segs.push({ s: Math.max(last ? last.e : 0, w.s - PAD), e: w.e + PAD, first: k, last: k });
      prevK = k;
    }
  }
  if (!segs.length) return ytFail(id, "the edit came out empty");
  // Output timeline: where each kept word lands
  const outAt = new Map<number, number>();
  let tOut = 0;
  for (const g of segs) { for (let k = g.first; k <= g.last; k++) outAt.set(k, tOut + Math.max(0, words[k].s - g.s)); tOut += g.e - g.s; }
  const body = tOut;
  const firstKept = (sid: number) => { const st = sentences.find((x) => x.id === sid); if (!st) return null; for (let k = st.from; k <= st.to; k++) if (outAt.has(k)) return outAt.get(k)!; return null; };
  // Chapters (YouTube rules: first at 0:00, at least 3, each 10s+)
  let chapters: { t: number; title: string; sid: number }[] = [];
  for (const c of Array.isArray(plan.chapters) ? plan.chapters : []) {
    let sid = Number(c.at); let t = firstKept(sid);
    while (t === null && sid < sentences.length) { sid++; t = firstKept(sid); }
    if (t !== null && String(c.title ?? "").trim()) chapters.push({ t, title: String(c.title).slice(0, 80), sid });
  }
  chapters.sort((a, b) => a.t - b.t);
  chapters = chapters.filter((c, i, a) => i === 0 || c.t - a[i - 1].t >= 10);
  if (chapters.length) chapters[0].t = 0; else chapters = [{ t: 0, title: "Intro", sid: 1 }];
  // Captions file
  const kept: { w: string; t: number; d: number }[] = [];
  for (const g of segs) for (let k = g.first; k <= g.last; k++) kept.push({ w: words[k].w, t: outAt.get(k)!, d: words[k].e - words[k].s });
  const lines: string[] = []; let buf: typeof kept = []; let n = 0;
  const flush = () => { if (!buf.length) return; n++; const a = buf[0].t, b = buf[buf.length - 1].t + buf[buf.length - 1].d; lines.push(`${n}\n${srtTime(a)} --> ${srtTime(b)}\n${buf.map((x) => x.w).join(" ")}\n`); buf = []; };
  for (const w of kept) { const txt = [...buf, w].map((x) => x.w).join(" "); if (buf.length && (txt.length > 42 || w.t - buf[0].t > 3.5)) flush(); buf.push(w); if (/[.!?]$/.test(w.w)) flush(); }
  flush();
  const srt = lines.join("\n");
  const srtPath = `yt/${tid}/${id}.srt`;
  await supabase.storage.from(CLIPS_BUCKET).upload(srtPath, new Blob([srt], { type: "text/plain" }), { upsert: true, contentType: "text/plain" });
  const { data: srtSigned } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(srtPath, 60 * 86400);
  const description = `${String(plan.description ?? "").trim()}\n\nChapters\n${chapters.map((c) => `${ytClock(c.t)} ${c.title}`).join("\n")}`;
  const brand = { primary: cfg?.brand_primary || "#E0312B", accent: cfg?.brand_accent || "#FFFFFF", text: cfg?.brand_text || "#FFFFFF", logoUrl: cfg?.brand_logo_url || undefined };
  const mainProps = {
    videoUrl: job.source_url, segments: segs.map((g) => ({ s: Number(g.s.toFixed(3)), e: Number(g.e.toFixed(3)) })),
    hook: String(plan.hook ?? "").slice(0, 60) || undefined, chapters: chapters.map((c) => ({ t: Number(c.t.toFixed(2)), title: c.title })),
    outro: { text: String(plan.end?.text ?? "Thanks for watching").slice(0, 60), sub: String(plan.end?.sub ?? "").slice(0, 80) || undefined }, brand, outroSeconds: YT_OUTRO,
  };
  // Parts (split): one short video per chapter, from that chapter's segments
  const parts: any[] = [];
  if (job.split && chapters.length > 1) {
    for (let i = 0; i < chapters.length; i++) {
      const a = chapters[i].t, b = i + 1 < chapters.length ? chapters[i + 1].t : body;
      const ps: { s: number; e: number }[] = []; let acc = 0;
      for (const g of segs) { const len = g.e - g.s; const gs = acc, ge = acc + len; acc = ge; if (ge <= a || gs >= b) continue; ps.push({ s: g.s + Math.max(0, a - gs), e: g.s + Math.min(len, b - gs) }); }
      if (ps.reduce((x, y) => x + (y.e - y.s), 0) < 15) continue;
      const next = chapters[i + 1]?.title;
      parts.push({ key: `part-${i + 1}`, title: chapters[i].title, status: "queued", props: { videoUrl: job.source_url, segments: ps.map((x) => ({ s: Number(x.s.toFixed(3)), e: Number(x.e.toFixed(3)) })), hook: chapters[i].title, chapters: [], outro: { text: next ? `Next: ${next.slice(0, 40)}` : "That's the set", sub: next ? "Watch it tomorrow" : "Thanks for watching" }, brand, outroSeconds: 5 } });
    }
  }
  const renders = [{ key: "main", title: String(plan.titles?.[0] ?? job.title ?? "YouTube video"), status: "queued", props: mainProps }, ...parts];
  await ytSave(id, {
    status: "rendering", progress: 35, renders,
    title: job.title || String(plan.titles?.[0] ?? "").slice(0, 150) || null,
    plan: { ...plan, chapters, body_seconds: Math.round(body), source_seconds: Math.round(job.transcript?.duration ?? 0) },
    outputs: { titles: plan.titles ?? [], description, tags: plan.tags ?? [], captions_url: srtSigned?.signedUrl ?? null, cut_seconds: Math.round((job.transcript?.duration ?? 0) - body) },
  });
  await ytKick(tid, id);
  startInBackground(ytWatch(tid, id));
}

// Start queued renders while there's room (new AWS accounts run ~10 Lambdas at once)
async function ytKick(tid: string, id: string) {
  const { data: job } = await supabase.from("yt_jobs").select("renders").eq("id", id).maybeSingle();
  const renders: any[] = Array.isArray(job?.renders) ? job!.renders : [];
  let busy = renders.filter((x) => x.status === "rendering").reduce((a, x) => a + Number(x.lambdas ?? 2), 0);
  const cap = ytMaxLambdas() + 2;
  let changed = false;
  for (const rd of renders) {
    if (rd.status !== "queued") continue;
    const secs = (rd.props.segments ?? []).reduce((a: number, x: any) => a + (x.e - x.s), 0) + Number(rd.props.outroSeconds ?? YT_OUTRO);
    const frames = Math.max(30, Math.round(secs * YT_FPS));
    // v9.9.11: spread the work — ~30s of video per Lambda (a Lambda renders 1080p at roughly 5–8 frames a second),
    // up to YT_MAX_LAMBDAS at once. The long function is only the safety net for very long videos, not a reason to use fewer Lambdas.
    const perLambda = 900;
    const chunks = Math.min(rd.key === "main" ? ytMaxLambdas() : 3, Math.max(1, Math.ceil(frames / perLambda)));
    if (busy + chunks + 1 > cap && busy > 0) break;
    try {
      const out: any = await renderMediaOnLambda({ region: ytRegion(), functionName: ytLambda(), serveUrl: Deno.env.get("REMOTION_SERVE_URL")!, composition: "ArchieLong", inputProps: rd.props, codec: "h264", privacy: "no-acl", timeoutInMilliseconds: Deno.env.get("REMOTION_LONG_FUNCTION") ? 870000 : 230000, framesPerLambda: Math.max(240, Math.ceil(frames / chunks)), outName: `yt-${tid.slice(0, 8)}-${id.slice(0, 8)}-${rd.key}.mp4` } as any);
      rd.status = "rendering"; rd.render_id = out.renderId; rd.bucket = out.bucketName; rd.lambdas = chunks + 1; rd.started_at = new Date().toISOString();
      busy += chunks + 1; changed = true;
    } catch (e) { rd.status = "failed"; rd.error = String(e).slice(0, 200); changed = true; }
  }
  if (changed) await ytSave(id, { renders });
}

// Check renders; when the main one is done make thumbnails; when everything's done, deliver
async function ytCheck(tid: string, id: string) {
  const { data: job } = await supabase.from("yt_jobs").select("*").eq("id", id).maybeSingle();
  if (!job || !["rendering", "thumbs"].includes(job.status)) return;
  const renders: any[] = Array.isArray(job.renders) ? job.renders : [];
  for (const rd of renders) {
    if (rd.status !== "rendering") continue;
    try {
      const pr: any = await getRenderProgress({ renderId: rd.render_id, bucketName: rd.bucket, functionName: ytLambda(), region: ytRegion() } as any);
      if (pr.fatalErrorEncountered) { if (!rd.retried) { rd.status = "queued"; rd.retried = true; } else { rd.status = "failed"; rd.error = String(pr.errors?.[0]?.message ?? "render failed").slice(0, 200); } }
      else if (pr.done) { rd.status = "done"; rd.url = String(pr.outputFile ?? ""); }
      else rd.progress = Math.round((pr.overallProgress ?? 0) * 100);
    } catch (e) { rd.error = String(e).slice(0, 120); }
  }
  const main = renders.find((x) => x.key === "main");
  const doneN = renders.filter((x) => x.status === "done" || x.status === "failed").length;
  await ytSave(id, { renders, progress: Math.min(95, 35 + Math.round((doneN / Math.max(1, renders.length)) * 55) + Math.round((main?.progress ?? 0) / 20)) });
  if (main?.status === "failed") return ytFail(id, `the video wouldn't render (${main.error ?? "unknown"})`);
  await ytKick(tid, id);
  if (main?.status === "done" && !job.thumbs) {
    const { data: claim } = await supabase.from("yt_jobs").update({ thumbs: { status: "making" } }).eq("id", id).is("thumbs", null).select("id");
    if (claim?.length) await runFresh("yt_thumbs", { tenant_id: tid, id });
  }
  const { data: j2 } = await supabase.from("yt_jobs").select("thumbs, status").eq("id", id).maybeSingle();
  const allDone = renders.every((x) => x.status === "done" || x.status === "failed");
  if (allDone && j2?.thumbs?.status === "done" && j2.status !== "done") await ytDeliver(tid, id);
}

async function ytWatch(tid: string, id: string) {
  for (let i = 0; i < 11; i++) {
    await new Promise((ok) => setTimeout(ok, 30000));
    const { data: job } = await supabase.from("yt_jobs").select("status").eq("id", id).maybeSingle();
    if (!job || !["rendering", "thumbs"].includes(job.status)) return;
    await ytCheck(tid, id);
  }
}

// Thumbnails: 6 plain frames → pick the 3 best faces → 3 designed thumbnails
// v9.9.12: reusable cut-out photos of the owner for thumbnails (transparent PNGs), each tagged with a mood
const FACE_MOODS = ["point", "think", "smile", "shock"];
async function facesSet(tid: string, p: any) {
  const list = (Array.isArray(p.faces) ? p.faces : []).slice(0, 12).map((f: any) => ({
    path: f?.path ? String(f.path) : (String(f?.url ?? "").match(/\/object\/sign\/archie-clips\/([^?]+)/)?.[1] ? decodeURIComponent(String(f.url).match(/\/object\/sign\/archie-clips\/([^?]+)/)![1]) : null),
    url: f?.path || /\/object\/sign\/archie-clips\//.test(String(f?.url ?? "")) ? null : (f?.url ? String(f.url) : null),
    mood: FACE_MOODS.includes(String(f?.mood)) ? String(f.mood) : "smile",
  })).filter((f: any) => f.path || /^https?:\/\//.test(String(f.url ?? "")));
  const mode = String(p.mode ?? "replace");
  let faces = list;
  if (mode === "add") { const { data } = await supabase.from("tenant_config").select("thumb_faces").eq("tenant_id", tid).maybeSingle(); faces = [...(Array.isArray(data?.thumb_faces) ? data!.thumb_faces : []), ...list].slice(-12); }
  const { error } = await supabase.from("tenant_config").update({ thumb_faces: faces }).eq("tenant_id", tid);
  if (error) return { ok: false, text: error.message };
  return { ok: true, count: faces.length, text: faces.length ? `Saved ${faces.length} photo${faces.length === 1 ? "" : "s"} for your thumbnails.` : "Thumbnail photos cleared — I'll use frames from the video." };
}
async function facesSigned(tid: string): Promise<{ url: string; mood: string; path: string | null }[]> {
  const { data } = await supabase.from("tenant_config").select("thumb_faces").eq("tenant_id", tid).maybeSingle();
  const out: { url: string; mood: string; path: string | null }[] = [];
  for (const f of Array.isArray(data?.thumb_faces) ? data!.thumb_faces : []) {
    if (f?.path) { const { data: sg } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(String(f.path), 7 * 86400); if (sg?.signedUrl) out.push({ url: sg.signedUrl, mood: String(f.mood ?? "smile"), path: String(f.path) }); }
    else if (f?.url) out.push({ url: String(f.url), mood: String(f.mood ?? "smile"), path: null });
  }
  return out;
}
async function facesList(tid: string) { return { ok: true, faces: await facesSigned(tid) }; }
// Which photo suits which thumbnail style (falls back to any photo, rotating so the three thumbnails differ)
function faceFor(faces: { url: string; mood: string }[], style: string, i: number) {
  if (!faces.length) return null;
  const want: Record<string, string[]> = { bold: ["point", "smile"], question: ["think", "shock"], number: ["shock", "smile", "point"] };
  const fits = faces.filter((f) => (want[style] ?? []).includes(f.mood));
  const pool = fits.length ? fits : faces;
  return pool[i % pool.length].url;
}

async function ytThumbs(tid: string, id: string) {
  const { data: job } = await supabase.from("yt_jobs").select("*").eq("id", id).maybeSingle();
  if (!job) return;
  const main = (job.renders ?? []).find((x: any) => x.key === "main");
  const segs: { s: number; e: number }[] = main?.props?.segments ?? [];
  const brand = main?.props?.brand;
  try {
    const long = segs.filter((g) => g.e - g.s > 2.5);
    const pickFrom = long.length ? long : segs;
    const times = Array.from({ length: 6 }, (_, i) => { const g = pickFrom[Math.floor(((i + 0.5) / 6) * pickFrom.length)]; return Number(((g.s + g.e) / 2).toFixed(2)); });
    const still = (props: any) => renderStillOnLambda({ region: ytRegion(), functionName: ytLambda(), serveUrl: Deno.env.get("REMOTION_SERVE_URL")!, composition: "ArchieThumb", imageFormat: "jpeg", privacy: "no-acl", inputProps: props } as any) as any;
    const faces = await facesSigned(tid);
    const frames = faces.length ? [] : await Promise.all(times.map((at) => still({ videoUrl: job.source_url, at, text: "", brand }).then((x: any) => String(x.url ?? x.outputFile ?? "")).catch(() => "")));
    // Which frames show the face best?
    let order = [0, 1, 2, 3, 4, 5];
    if (!faces.length) try {
      const vr = await openai("chat/completions", { model: "gpt-4.1-mini", response_format: { type: "json_object" }, messages: [{ role: "user", content: [{ type: "text", text: "These are 6 frames from a YouTube video (numbered 0-5 in order). Pick the 3 best for a thumbnail: face clearly visible, eyes open, expressive, looking at the camera, not mid-blink or mid-word. Return ONLY JSON {\"best\":[n,n,n]} best first." }, ...frames.filter(Boolean).map((u) => ({ type: "image_url", image_url: { url: u, detail: "low" } }))] }] });
      const vj: any = await vr.json().catch(() => null);
      const best = looseJson(String(vj?.choices?.[0]?.message?.content ?? ""))?.best;
      if (Array.isArray(best) && best.length) order = [...best.map(Number), ...order].filter((v, i, a) => v >= 0 && v < 6 && a.indexOf(v) === i);
    } catch { /* keep the default order */ }
    const texts: any[] = (Array.isArray(job.plan?.thumbs) ? job.plan.thumbs : []).slice(0, 3);
    while (texts.length < 3) texts.push({ text: String(job.plan?.hook ?? job.title ?? "Watch this").split(/\s+/).slice(0, 4).join(" "), style: "bold" });
    const made = await Promise.all(texts.map((t, i) => still({ videoUrl: job.source_url, at: times[order[i] ?? i], text: String(t.text ?? "").slice(0, 40), style: ["bold", "question", "number"].includes(t.style) ? t.style : "bold", brand, faceUrl: faceFor(faces, String(t.style ?? "bold"), i) ?? undefined }).then((x: any) => String(x.url ?? x.outputFile ?? "")).catch(() => "")));
    await ytSave(id, { status: "rendering", thumbs: { status: "done", urls: made.filter(Boolean), texts } });
  } catch (e) {
    await ytSave(id, { thumbs: { status: "done", urls: [], error: String(e).slice(0, 200) } });
  }
  await ytCheck(tid, id);
}

async function ytDeliver(tid: string, id: string) {
  const { data: claim } = await supabase.from("yt_jobs").update({ status: "delivering" }).eq("id", id).in("status", ["rendering", "thumbs"]).select("*");
  const job = claim?.[0];
  if (!job) return;
  const renders: any[] = job.renders ?? [];
  const main = renders.find((x) => x.key === "main");
  const parts = renders.filter((x) => x.key !== "main" && x.status === "done");
  // Into their GHL media library (by link)
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const toMedia = async (url: string, name: string) => {
    try { const fd = new FormData(); fd.append("hosted", "true"); fd.append("fileUrl", url); fd.append("name", name); await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${cfg?.ghl_location_id}`, { method: "POST", headers: { Authorization: `Bearer ${cfg?.ghl_token || FALLBACK_TOKEN}`, Version: "2021-07-28" }, body: fd }); } catch { /* best effort */ }
  };
  const day = new Date().toISOString().slice(0, 10);
  if (main?.url) await toMedia(main.url, `${(job.title || "YouTube video").slice(0, 80)} (YouTube ${day}).mp4`);
  for (const pt of parts) await toMedia(pt.url, `${String(pt.title).slice(0, 80)} (${day}).mp4`);
  const thumbs: string[] = job.thumbs?.urls ?? [];
  const out = job.outputs ?? {};
  await ytSave(id, { status: "done", progress: 100, outputs: { ...out, video_url: main?.url ?? null, parts: parts.map((x) => ({ title: x.title, url: x.url })), thumbnails: thumbs } });
  const mins = (s: number) => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const msg = [
    `🎬 Your YouTube video is ready${job.title ? `: "${job.title}"` : ""}`,
    out.cut_seconds ? `Cut ${mins(out.cut_seconds)} of pauses, fillers and retakes.` : "",
    main?.url ? `Video: ${main.url}` : "",
    (out.titles ?? []).length ? `\nTitle ideas:\n${(out.titles as string[]).map((t, i) => `${i + 1}. ${t}`).join("\n")}` : "",
    thumbs.length ? `\nThumbnails (put them in YouTube's Test & compare):\n${thumbs.join("\n")}` : "",
    parts.length ? `\nPlus ${parts.length} chapter videos — they're in your media library and the app.` : "",
    out.captions_url ? `\nCaptions file (upload in YouTube Studio → Subtitles): ${out.captions_url}` : "",
    "\nThe description with chapters is in the next message.",
  ].filter(Boolean).join("\n");
  await sendToMember(tid, job.handle, msg.slice(0, 3900));
  if (out.description) await sendToMember(tid, job.handle, String(out.description).slice(0, 3900));
}

// Scheduler sweep: anything still rendering gets checked (renders can outlast one request)
async function ytFinishPending(tid: string) {
  const { data } = await supabase.from("yt_jobs").select("id, status, updated_at").eq("tenant_id", tid).in("status", ["rendering", "thumbs", "copying", "transcribing", "planning"]).limit(5);
  for (const j of data ?? []) {
    if (["rendering", "thumbs"].includes(j.status)) await ytCheck(tid, j.id);
    else if (Date.now() - Date.parse(j.updated_at) > 15 * 60000) await ytFail(j.id, "it got stuck part-way — please send it again");
  }
}

// ===================== v9.9.6: status check — what's actually live =====================
const ARCHIE_VERSION = "9.14.2";
async function statusCheck(tid: string) {
  const out: Record<string, unknown> = { version: ARCHIE_VERSION, checked_at: new Date().toISOString() };
  // 1. Secrets: set or not (never the values)
  const keys = ["ARCHIE_SECRET", "GHL_AGENCY_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY", "DEEPGRAM_API_KEY", "ELEVENLABS_API_KEY", "APIFY_API_TOKEN", "PIXABAY_API_KEY", "PEXELS_API_KEY", "REMOTION_FUNCTION", "REMOTION_REGION", "REMOTION_SERVE_URL", "REMOTION_LONG_FUNCTION", "META_APP_ID", "SFX_POP_URL", "SFX_WHOOSH_URL", "SFX_TICK_URL"];
  const secrets: Record<string, boolean> = {}; for (const k of keys) secrets[k] = !!Deno.env.get(k);
  out.secrets = secrets;
  // 2. Database: each table and the columns later versions added
  const schema: [string, string][] = [
    ["tasks", "id, hold, plan_slot, pinned_date, proposal_rank, area, client_id, critical, block_start, block_end, project_id, checklist, waiting_on, moves_acked"], ["forge_projects", "id, status, major, deadline, waiting_on, archived"], ["briefs", "id, short_body, read_at"], ["council_sessions", "id"],
    ["broll_library", "id"], ["content_stacks", "id, handed_to"], ["custom_styles", "id"], ["style_specs", "id"],
    ["edit_jobs", "id, engine, sources, cover_url, render_retried, scheduled_for"], ["feature_events", "id"], ["feature_feedback", "id"],
    ["client_groups", "conversation_id, client_id"], ["yt_jobs", "id, renders, thumbs, outputs, split"], ["agent_runs", "id"], ["carousels", "id, source"],
    ["team_members", "id, forge_caps, brief_voice, buffer_minutes, block_days, growth_start, growth_end, personal_blocks, personal_block_ids, work_hours, growth_windows, forge_unplaced, forge_days_cache, forge_calendar_ok, forge_calendar_error"], ["clients", "id, monthly_value"],
    ["tenant_config", "tenant_id, thumb_faces, forge_caps, forge_lock_until, max_major_builds, broll_synced_at, evening_wrap, cost_budget_gbp, plan, reel_style, cta_keyword, brief_style, group_suggestions"],
  ];
  const db: Record<string, string> = {};
  for (const [t, cols] of schema) {
    const { error } = await supabase.from(t).select(cols).limit(1);
    db[t] = error ? `MISSING: ${error.message.slice(0, 120)}` : "ok";
  }
  out.database = db;
  // 3. Edge functions deployed (a CORS preflight: 404 = not deployed; nothing runs)
  const fns = ["archie-screens", "capture", "provision-tenant", "agent-result", "ghl-context", "ghl-sync", "archie-mcp", "meta-connect"];
  const functions: Record<string, string> = {};
  await Promise.all(fns.map(async (f) => {
    try { const r = await fetch(`${SUPA_URL}/functions/v1/${f}`, { method: "OPTIONS" }); functions[f] = r.status === 404 ? "NOT DEPLOYED" : `deployed (${r.status})`; }
    catch (e) { functions[f] = `unreachable: ${String(e).slice(0, 60)}`; }
  }));
  out.functions = functions;
  // 4. GHL agents present and published
  try {
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_token").eq("tenant_id", tid).maybeSingle();
    out.agents = await agentsHealth({ tid, ghlToken: cfg?.ghl_token || FALLBACK_TOKEN });
  } catch (e) { out.agents = { ok: false, error: String(e).slice(0, 120) }; }
  // 5. Daily jobs: last run of each
  const jobs: Record<string, unknown> = {};
  for (const a of ["morning", "sync", "scraper", "pipeline", "brief", "plan"]) {
    const { data } = await supabase.from("agent_runs").select("status, summary, error, finished_at").eq("tenant_id", tid).eq("agent", a).order("finished_at", { ascending: false }).limit(1).maybeSingle();
    jobs[a] = data ? { status: data.status, at: data.finished_at, note: String(data.error ?? data.summary ?? "").slice(0, 100) } : "never run";
  }
  out.jobs = jobs;
  // 6. Reels: the last five
  const { data: reels } = await supabase.from("edit_jobs").select("status, engine, created_at, error").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(5);
  out.reels = (reels ?? []).map((r: any) => ({ status: r.status, engine: r.engine, at: r.created_at, error: r.error ? String(r.error).slice(0, 80) : undefined }));
  // 7. App buttons that have reached the server (last 30 days) vs the ones that should
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: ev } = await supabase.from("feature_events").select("feature, channel, created_at").eq("tenant_id", tid).in("channel", ["page", "toolbox"]).gte("created_at", since).limit(5000);
  const seen: Record<string, { count: number; last: string }> = {};
  for (const e of ev ?? []) { const k = String(e.feature); const x = seen[k] ?? { count: 0, last: "" }; x.count++; if (String(e.created_at) > x.last) x.last = String(e.created_at); seen[k] = x; }
  const expected = ["waiting_act", "waiting_clear", "task_add", "task_done", "task_undone", "task_remove", "task_pin", "task_move", "inbox_dump", "plan_go", "brief_go", "script_write", "edit_start", "edit_dismiss", "pack_handoff", "broll_add", "send_all", "checkins_draft", "month_video", "report_problem", "council"];
  out.app_buttons = { reached_server: seen, never_seen: expected.filter((k) => !Object.keys(seen).some((s2) => s2 === k || s2.startsWith(k))) };
  // 8. Scraper → Forge Inbox
  const { count: inboxHeld } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "open").eq("hold", true);
  const { count: dupes } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).like("dismissed_reason", "duplicate of:%");
  const { count: stillProposed } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "proposed");
  const { count: groups } = await supabase.from("client_groups").select("id", { count: "exact", head: true }).eq("tenant_id", tid);
  out.forge = { inbox_held: inboxHeld ?? 0, duplicates_blocked: dupes ?? 0, still_proposed: stillProposed ?? 0, groups_linked: groups ?? 0 };
  // Plain summary of anything that needs fixing
  const problems: string[] = [];
  for (const [k, v] of Object.entries(secrets)) if (!v && !["PEXELS_API_KEY", "REMOTION_LONG_FUNCTION", "SFX_POP_URL", "SFX_WHOOSH_URL", "SFX_TICK_URL", "META_APP_ID"].includes(k)) problems.push(`secret not set: ${k}`);
  for (const [k, v] of Object.entries(db)) if (v !== "ok") problems.push(`database ${k}: ${v}`);
  for (const [k, v] of Object.entries(functions)) if (!v.startsWith("deployed")) problems.push(`function ${k}: ${v}`);
  if ((out.agents as any)?.ok === false) problems.push(`agents missing: ${((out.agents as any).missing ?? []).join(", ") || (out.agents as any).error}`);
  for (const [k, v] of Object.entries(jobs)) if (v === "never run" || (v as any).status === "failed") problems.push(`job ${k}: ${v === "never run" ? "never run" : "last run failed"}`);
  if ((out.app_buttons as any).never_seen.length) problems.push(`app buttons never reached the server in 30 days: ${(out.app_buttons as any).never_seen.join(", ")}`);
  out.problems = problems;
  out.text = problems.length ? `Archie ${ARCHIE_VERSION}: ${problems.length} things to look at:\n- ${problems.join("\n- ")}` : `Archie ${ARCHIE_VERSION}: everything checked is live.`;
  return out;
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
    try { await editFinishPending(t.id); } catch { /* never block the scheduler */ }
    try { await ytFinishPending(t.id); } catch { /* never block the scheduler */ }
    try { startInBackground(ideasTick(t.id)); } catch { /* never block the scheduler */ }
    try { if (cfg?.schedules_on && cfg?.auto_prep !== false) startInBackground(autoPrep(t.id, cfg)); } catch { /* never block the scheduler */ }
    try {
      if (cfg?.schedules_on && cfg?.forge_auto !== false) {
        const tzF = cfg?.timezone || "Europe/London";
        const hourKey = `${localDate(Date.now(), tzF)}-${new Intl.DateTimeFormat("en-GB", { timeZone: tzF, hour: "2-digit", hour12: false }).format(new Date())}`;
        if (await claim(t.id, "forge_plan", hourKey)) startInBackground(forgePlanIfNeeded(t.id));
      }
    } catch { /* never block the scheduler */ }
    try {
      if (cfg?.is_agency) {
        const slot = `${new Date().toISOString().slice(0, 10)}-${Math.floor(new Date().getUTCHours() / 3)}`;
        if (await claim(t.id, "agency_sweep", slot)) startInBackground(agencySweep(t.id));
      }
    } catch { /* never block the scheduler */ }
    if (!cfg || cfg.schedules_on !== true) continue; // opt-in per client, so nothing double-runs alongside GHL workflows
    const tz = cfg.timezone || "Europe/London";
    const now = localNow(tz);
    const DAYN: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const days = (v: unknown, fb: string) => String(v || fb).split(",").map((x) => { const k = x.trim().toLowerCase(); return k.slice(0, 3) in DAYN ? DAYN[k.slice(0, 3)] : Number(k); }).filter((x) => !isNaN(x));
    const jobs: { job: string; due: boolean; key: string; action: string; body?: Record<string, unknown> }[] = [
      { job: "renewals", due: dueNow(now.minutes, hhmm(cfg.sched_renewals, "04:15")), key: now.date, action: "renewals_run" },
      { job: "morning", due: days(cfg.sched_morning_days, "0,1,2,3,4,5,6").includes(now.weekday) && dueNow(now.minutes, hhmm(cfg.sched_morning, "04:30")), key: now.date, action: "morning_run", body: { referral_link: String(cfg.referral_link ?? "") } },
      { job: "evening", due: days(cfg.sched_evening_days, "0,1,2,3,4").includes(now.weekday) && dueNow(now.minutes, hhmm(cfg.sched_evening, "20:00")), key: now.date, action: "evening_run" },
      { job: "plan", due: now.weekday === Number(cfg.sched_plan_day ?? 6) && dueNow(now.minutes, hhmm(cfg.sched_plan, "08:00")), key: now.date, action: "plan_run" },
      { job: "ideas", due: now.weekday === Number(cfg.sched_ideas_day ?? 1) && dueNow(now.minutes, hhmm(cfg.sched_ideas, "05:00")), key: now.date, action: "ideas_run" },
      { job: "ig_sync", due: dueNow(now.minutes, hhmm(cfg.sched_ig, "04:30")), key: now.date, action: "ig_sync_run" },
      { job: "coach", due: !!cfg.coach_on && dueNow(now.minutes, hhmm(cfg.sched_coach, "12:30")), key: now.date, action: "coach_run" },
      { job: "content_nudge", due: now.weekday === Number(cfg.sched_nudge_day ?? 4) && dueNow(now.minutes, hhmm(cfg.sched_nudge, "10:00")), key: now.date, action: "content_nudge_run" },
      { job: "evening_wrap", due: cfg.evening_wrap !== false && (cfg.work_days ? String(cfg.work_days).split(",").map(Number).includes(now.weekday) : now.weekday >= 1 && now.weekday <= 5) && dueNow(now.minutes, hhmm(cfg.sched_wrap, "17:00")), key: now.date, action: "evening_wrap_run" },
      { job: "sunday_recap", due: now.weekday === 0 && dueNow(now.minutes, hhmm(cfg.sched_week_recap, "18:00")), key: now.date, action: "sunday_recap_run" },
      { job: "winback_offer", due: Number(now.date.slice(8, 10)) >= 3 && Number(now.date.slice(8, 10)) <= 9 && now.weekday === 2 && dueNow(now.minutes, hhmm(cfg.sched_winback_offer, "10:30")), key: now.date.slice(0, 7), action: "winback_offer_run" },
      { job: "content_learn", due: now.weekday === 0 && dueNow(now.minutes, hhmm(cfg.sched_learn, "17:30")), key: now.date, action: "content_learn_run" },
      { job: "broll_sync", due: dueNow(now.minutes, hhmm(cfg.sched_broll, "03:45")), key: now.date, action: "broll_sync_run" },
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
  // What Archie did for you last month — in £ and hours — plus the 30-second video
  let extra = "";
  try { const prev = new Date(); prev.setUTCDate(0); const st: any = await monthStats(tid, prev.toISOString().slice(0, 7)); extra = `\n\n${st.text}`; startInBackground(monthVideo(tid, st)); } catch { /* bonus */ }
  await sendToTeam(tid, String(r.json?.owner_text ?? "") + extra, "", "monthly");
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
  "- archie_feedback {rating: 1|-1, comment, feature} — when they react to something Archie just made or did ('that caption was rubbish, too salesy', 'love that reel', '👎 that summary was wrong'): rating 1 or -1, their words as the comment; feature only if obvious (e.g. 'caption', 'reel', 'brief', 'carousel'), otherwise leave it out. Then thank them in a few words and, if negative, offer to redo it.",
  "- archie_carousel {action: make|post, topic, slides, format: carousel|story} — 'make me a carousel about planning your week' → make (7 slides unless they say). 'Make me a story about…' → format 'story' (3 frames unless they say). 'Post the carousel' / 'post the story' → post (Social Planner drafts). 'Send it here' / 'send me the carousel' / 'let me see it' → send (the slides as images in this chat).",
  "- archie_clear_waiting {} — 'clear waiting' / 'clear my waiting list' / 'none of those are relevant' → empties Waiting on you (drafts binned, spotted tasks dropped, reels taken off the list but kept).",
  "- archie_move_task {title, to} — 'move the offer task to tomorrow' / 'push the Elise one to Friday' → to = 'tomorrow', a weekday name, or YYYY-MM-DD. It pins the task to that day in Forge.",
  "- archie_projects {action: list|add|update|status, name, client, deadline (YYYY-MM-DD), status (inbox|scheduled|in_progress|waiting|complete), major, waiting_on} — client projects. 'What projects have I got on?' / 'what do I owe each client?' → list. 'New project: funnel for Sarah, due 30 Nov, it's a big build' → add with deadline as YYYY-MM-DD (major true for big builds). 'Mark the MTN build as waiting on David' → update status waiting, waiting_on. If adding a third major build returns a warning, read it to them and only add it if they say yes (then call again with override true).",
  "- archie_when_can_i {title, hours, by, client} — capacity and realistic deadlines from their REAL Forge plan and calendar. 'When could I realistically deliver a 10 hour build for Sarah?' → hours 10. 'Can I take on X by Friday?' → title X, by = that date (YYYY-MM-DD). 'What deadline should I give them for the funnel?' → title. Never guess dates or capacity yourself; use what this returns, and say the promise date with the reason.",
  "- archie_voice {verdict, kind, text, reason} — they're teaching you how they write. 'This caption is spot on, write like this: …' → verdict good. 'That's too generic / I'd never say that / no emojis like this' → verdict bad, with reason in their words; text = the draft they rejected (or the line they quoted). kind: script, caption, email, post or message. Use this whenever they paste writing they love or hate.",
  "- archie_set_hours {work_start, work_end, lunch_start, lunch_end, work_days, caps} — 'change my hours to 8 till 4' → work_start 08:00, work_end 16:00. 'Lunch 12 till 1'. 'I don't work Fridays' → work_days '1,2,3,4'. '2 musts a day is enough' / 'make it 2 3 3' → caps '2,3,3' (Must,To-do,Bonus; keep the others as they are, default 2,3,2). Only pass what they changed.",
  "- archie_waiting {} — 'what's waiting?' / 'what do I need to do?' / 'anything to send?' → the Waiting on you list (drafts, proposals, reels ready). To act on items use archie_send_draft / archie_skip_draft / archie_proposal as before.",
  "- archie_full_brief {} — 'full brief' / 'show me everything' / 'the long version' → today's full brief.",
  "- When they reply just \"go\" to the morning brief: treat it as 'yes to the plan' — confirm in one line (\"👍 Plan's set. I'll nudge you before your first block.\") and, if drafts are waiting, add \"Reply 'send all' to send the N drafted messages.\"",
  "- archie_make_reel {topic, idea_number} — 'make a reel' / 'I want to film something' / 'help me make a reel' with no topic → no args (it offers ideas). If they reply with just a number right after that, use idea_number. If they say what it's about, topic.",
  "- archie_write_script {topic, notes} — 'create me a reel about…' / 'write me a script on…' / 'give me a reel script for…' → Archie writes it and adds it to the top of their filming list (for the teleprompter). topic = what it's about; notes = any angle, offer or story they mention.",
  "- archie_streak {} — 'how am I doing this week?' / 'what's my streak?' / 'how many reels this week?' → reels made vs their weekly target, and their streak.",
  "- archie_script {number} — 'give me the script for idea 2' / 'what do I say for idea 1' / 'I'm filming now' → the lines to film one at a time (number = filming-list number, default 1).",
  "- archie_hooks {} — 'hooks' / 'give me other hooks' / 'A/B test the hook' → makes 2 alternative-opening versions of their latest reel.",
  "- archie_brand {url, force} — 'get my brand from my website' / 'use my website colours' (url if they give one; force true if they say replace/overwrite/update my brand) → reads their site for colours, logo and font.",
  "- archie_learn {} — 'what's working in my reels?' / 'what should I post more of?' → their reel results by style, length and hook.",
  "- archie_use_style {name} — 'use the energetic style' / 'make clean my default' / 'use @nick_saraev style' → name as said (minimal, clean, energetic, studio, or a saved @creator style).",
  "- archie_broll {} — 'refresh my B-roll' / 'I've added B-roll' / 'check my B-roll folder' → re-sync their GHL Media B-roll folder.",
  "- archie_plan_usage {} — 'how many reels have I got left?' / 'what's my plan?' / 'what have I used this month?' → their plan and this month's usage. Give it as it is.",
  "- archie_style {urls} — 'break down these reels' / 'study the edit style of these' with Instagram reel links → pass the links. Archie studies the editing style and reports back.",
  "- archie_winback {months} — 'win back everyone who left this year' / 'message my old clients' → months 12 unless they say (e.g. 'since January' → months to then). Shows the drafted messages; they send with 'send them' / 'send 2' (archie_send_draft per number).",
  "- archie_month {} — 'what did Archie do for me this month?' / 'send me my month video' → this month so far, in £ and hours, plus the 30-second video. Give the result as it is.",
  "- archie_plan {action: show|replan|push, minutes} — their time-blocked day in Forge (Forge = where all their tasks, drafts and actions live): 'what's my plan today?' → show. 'Replan my day' / 'I've lost the morning, redo my day' → replan (from now). 'I'm running 30 minutes late' / 'push everything an hour' → {action:'push', minutes}. Give the result as it is.",
  "- archie_instagram {action: results|sync, days} — their own Instagram: 'how did my posts do?', 'what's my best post this month?', 'how are my reels doing?' → results (days 30 by default). 'Refresh my Instagram' → sync. Give the answer as it is.",
  "- archie_ideas {action: list|find|film|skip, numbers, status} — content ideas: 'what's working?' / 'any ideas this week?' → list (numbered). 'Find me ideas now' → find. 'Film 1 and 3' → {action:'film', numbers:[1,3]}. 'Skip 2' → skip. 'What do I need to film?' → {action:'list', status:'to_film'}.",
  "- archie_reel {action: redo|left|status|post, change} — 'post it' / 'schedule the reel' → {action:'post'} (adds the latest reel to Social Planner as a draft). — reels from Archie Edit: 'make that reel shorter' / 'different hook' / 'drop the list' → {action:'redo', change: what they said}. 'How many edits have I got left?' → {action:'left'}. 'Is my reel ready?' → {action:'status'}. To edit a NEW video they just send it on WhatsApp with 'edit'.",
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
    // v9.12.1: what Archie sent them on its own recently (these never went through the chat, so you won't remember them)
    const { data: recentSent } = await supabase.from("talk_messages").select("text, created_at").eq("tenant_id", tid).eq("handle", member.handle).eq("channel", "notify").gte("created_at", new Date(Date.now() - 12 * 3600000).toISOString()).order("created_at", { ascending: false }).limit(4);
    const { data: lastUserBefore } = await supabase.from("talk_messages").select("created_at").eq("tenant_id", tid).eq("handle", member.handle).eq("role", "user").order("created_at", { ascending: false }).range(1, 1).maybeSingle();
    const hhmm = (iso: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date(iso));
    const sentBlock = (recentSent ?? []).length
      ? `MESSAGES YOU SENT THEM ON YOUR OWN (newest first; these are real, you sent them, even if they're not in your chat memory):\n${(recentSent ?? []).map((x: any) => `- ${hhmm(x.created_at)}: ${String(x.text).slice(0, 400).replace(/\s+/g, " ")}`).join("\n")}\n` +
        `RULE: if their message is short or vague ("send it here", "this one", "post it", "yes", "looks good", "change the hook") and doesn't name something else, it's about the NEWEST message above${lastUserBefore?.created_at && (recentSent ?? [])[0] && String((recentSent ?? [])[0].created_at) > String(lastUserBefore.created_at) ? " (it arrived after their last message, so it's almost certainly what they mean)" : ""}. Only switch to an older topic if they name it.`
      : "";
    const ctx = [
      sentBlock,
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
      const rb = { type: channel, contactId, message: msg.slice(0, 3500) }; NO_TALK_LOG.add(rb);
      return ghl(token, "/conversations/messages", "POST", rb, "2021-04-15");
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
      startInBackground(logFeature(tid, "dump", isVoice ? "voice" : "whatsapp", member.handle));
      const d: any = await dumpAnything(tid, member, dumpMatch ? dumpMatch[1] : plainText);
      const sentD = await reply(d.text);
      return log(sentD.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${d.text.slice(0, 80)} | actions: dump`, sentD.ok ? null : `reply not sent (${sentD.status})`);
    }

    // Captions for the latest reel: "caption: my own words" · "write a caption" · "make the caption shorter"
    if (member.gets_financials) {
      const own = plainText.match(/^\s*caption\s*[:\-]\s*([\s\S]{5,})$/i);
      const write = /^\s*(?:write|give me|draft|do)\s+(?:me\s+)?(?:a\s+)?caption\b/i.test(plainText);
      const change = plainText.match(/^\s*(?:make|change|rewrite|redo)\s+the\s+caption\s*(.*)$/i);
      if (own || write || change) {
        startInBackground(logFeature(tid, "reel_caption", "whatsapp", member.handle));
        const r3: any = await reelCaption(tid, own ? { own: own[1] } : { change: change ? change[1] || "a fresh version" : "" });
        const sentC = await reply(r3.text);
        return log(sentC.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${r3.text.slice(0, 80)} | actions: caption`, sentC.ok ? null : `reply not sent (${sentC.status})`);
      }
    }

    // "Post it" → the latest finished reel becomes a Social Planner draft
    if (/^\s*(?:please\s+)?(?:post|schedule|queue)\s*(?:it|that|this|the reel|my reel)?\s*(?:please)?[.!]?\s*$/i.test(plainText) && member.gets_financials) {
      startInBackground(logFeature(tid, "reel_post", "whatsapp", member.handle));
      const r2: any = await reelToPlanner(tid, undefined, { draft: /draft/i.test(text) });
      const sentP = await reply(r2.text);
      return log(sentP.ok ? "done" : "failed", `${member.handle}: "${text.slice(0, 60)}" → ${r2.text.slice(0, 80)} | actions: post reel`, sentP.ok ? null : `reply not sent (${sentP.status})`);
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
      const NO_HANDLE = ["archie_projects", "archie_when_can_i", "archie_voice", "archie_numbers", "archie_week", "archie_set_goals", "archie_draft_followups", "archie_remember", "archie_run_skill", "archie_drafts", "archie_send_draft", "archie_skip_draft", "archie_proposals", "archie_move_deal", "archie_calendars", "archie_free_slots", "archie_book_call", "archie_recurring", "archie_pause_recurring", "archie_save_sequence", "archie_checkup", "archie_memory", "archie_member_health", "archie_groups", "archie_set_trial", "archie_council", "archie_call_prep", "archie_data", "archie_reel", "archie_ideas", "archie_instagram", "archie_plan", "archie_carousel", "archie_month", "archie_winback", "archie_style", "archie_plan_usage", "archie_broll", "archie_use_style", "archie_hooks", "archie_brand", "archie_learn", "archie_streak", "archie_script", "archie_write_script", "archie_make_reel", "archie_waiting", "archie_full_brief", "archie_set_hours", "archie_move_task", "archie_clear_waiting"];
      if (!args.handle && !NO_HANDLE.includes(act.tool)) args.handle = member.handle;
      if (!member.gets_financials && args.handle && String(args.handle).toLowerCase() !== String(member.handle).toLowerCase()) args.handle = member.handle;
      const OWNER_ONLY = ["archie_data", "archie_call_prep", "archie_council", "archie_set_trial", "archie_groups", "archie_numbers", "archie_week", "archie_set_goals", "archie_draft_followups", "archie_save_sequence", "archie_send_draft", "archie_skip_draft", "archie_drafts", "archie_proposals", "archie_proposal"];
      // The CSM can draft, send and bin their OWN client check-ins and chases
      const isCsm = !member.gets_financials && String(cfg?.csm_handle ?? "").toLowerCase() === String(member.handle).toLowerCase();
      if (isCsm && ["archie_draft_followups", "archie_send_draft", "archie_skip_draft", "archie_drafts"].includes(act.tool)) {
        const r2 = await csmDraftAction(tid, member.handle, act.tool, args, accessToken);
        ran.push(`${act.tool}${r2.ok ? "" : " (failed)"}`);
        startInBackground(logFeature(tid, act.tool, text.startsWith("(voice note)") ? "voice" : "whatsapp", member.handle, r2.ok));
        results.push(`${act.tool} → ${r2.ok ? "OK" : "FAILED"}: ${r2.text.slice(0, 800)}`);
        continue;
      }
      if (!member.gets_financials && OWNER_ONLY.includes(act.tool)) { results.push(`${act.tool}: not available for team members`); continue; }
      const r = act.tool === "archie_clear_waiting"
        ? await (async () => { const x: any = await waitingClear(tid); return { ok: true, text: x.text }; })()
        : act.tool === "archie_move_task"
        ? await (async () => {
            const q = String(args.title ?? "").trim().toLowerCase();
            const { data: opts } = await supabase.from("tasks").select("id, title").eq("tenant_id", tid).in("status", ["open", "doing"]).ilike("title", `%${q.split(/\s+/).slice(0, 4).join("%")}%`).limit(3);
            if (!opts?.length) return { ok: false, text: `I can't find a task like "${args.title}".` };
            if (opts.length > 1 && !opts.some((o: any) => o.title.toLowerCase() === q)) return { ok: false, text: `Which one?\n${opts.map((o: any, i: number) => `${i + 1}. ${o.title}`).join("\n")}` };
            const x: any = await taskMove(tid, opts[0].id, String(args.to ?? "tomorrow"), member.handle);
            return { ok: !!x.ok, text: x.text };
          })()
        : act.tool === "archie_voice"
        ? await (String(args.verdict ?? "good") === "bad"
            ? voiceFeedback(tid, { kind: args.kind, text: args.text, reason: args.reason })
            : voiceAdd(tid, { kind: args.kind, verdict: "good", body: args.text, note: args.reason, source: "chat" }))
        : act.tool === "archie_projects"
        ? await (async () => {
            const a2 = String(args.action ?? "list");
            if (a2 === "list") { const x: any = await projectsList(tid); return { ok: !!x.ok, text: x.text }; }
            let clientId: string | null = null;
            if (args.client) { const { data: cl } = await supabase.from("clients").select("id, name").eq("tenant_id", tid).eq("status", "active").ilike("name", `%${String(args.client).trim()}%`).limit(2); if ((cl ?? []).length === 1) clientId = cl![0].id; }
            let id: string | null = null;
            if (a2 !== "add" && args.name) { const { data: pr } = await supabase.from("forge_projects").select("id").eq("tenant_id", tid).eq("archived", false).ilike("name", `%${String(args.name).trim()}%`).limit(2); if ((pr ?? []).length === 1) id = pr![0].id; else return { ok: false, text: (pr ?? []).length ? "Which project? More than one matches." : `I can't find a project like "${args.name}".` }; }
            let st = String(args.status ?? "").toLowerCase().trim().replace(/\s+/g, "_");
            st = ({ done: "complete", completed: "complete", finished: "complete", started: "in_progress", active: "in_progress", on_hold: "waiting", paused: "waiting", blocked: "waiting", planned: "scheduled" } as Record<string, string>)[st] ?? st;
            const dl = /^\d{4}-\d{2}-\d{2}$/.test(String(args.deadline ?? "")) ? String(args.deadline) : undefined;
            const x: any = await projectSave(tid, member.handle, { id, name: a2 === "add" ? args.name : undefined, client_id: clientId ?? undefined, deadline: dl, status: PROJECT_STATUSES.includes(st) ? st : (a2 === "add" ? "scheduled" : undefined), major: args.major, waiting_on: args.waiting_on, override: args.override });
            return { ok: !!x.ok, text: x.text };
          })()
        : act.tool === "archie_when_can_i"
        ? await (async () => {
            const x: any = await capacityCheck(tid, member.handle, { title: args.title, hours: args.hours, minutes: args.minutes, by: args.by, notes: args.client ? `For ${args.client}` : "" });
            return { ok: !!x.ok, text: x.text };
          })()
        : act.tool === "archie_set_hours"
        ? await (async () => {
            const upd: Record<string, unknown> = {};
            const t = (x: any) => /^\d{1,2}(:\d{2})?$/.test(String(x ?? "")) ? (String(x).includes(":") ? String(x).padStart(5, "0") : `${String(x).padStart(2, "0")}:00`) : null;
            if (t(args.work_start)) upd.work_start = t(args.work_start);
            if (t(args.work_end)) upd.work_end = t(args.work_end);
            if (t(args.lunch_start)) upd.lunch_start = t(args.lunch_start);
            if (t(args.lunch_end)) upd.lunch_end = t(args.lunch_end);
            if (args.work_days) upd.work_days = String(args.work_days);
            if (args.caps && /^\d+,\d+,\d+$/.test(String(args.caps).replace(/\s/g, ""))) upd.forge_caps = String(args.caps).replace(/\s/g, "");
            if (!Object.keys(upd).length) return { ok: false, text: "What should I change — your hours (e.g. 8 till 4) or your daily Must / To-do / Bonus numbers (e.g. 2,3,3)?" };
            await supabase.from("team_members").update(upd).eq("tenant_id", tid).eq("handle", member.handle);
            startInBackground(forgePlan(tid, { force: true, from_now: true }));
            return { ok: true, text: `Done — ${[upd.work_start && upd.work_end ? `hours ${upd.work_start}–${upd.work_end}` : upd.work_start ? `start ${upd.work_start}` : upd.work_end ? `finish ${upd.work_end}` : "", upd.lunch_start ? `lunch ${upd.lunch_start}${upd.lunch_end ? `–${upd.lunch_end}` : ""}` : "", upd.work_days ? "working days updated" : "", upd.forge_caps ? `${String(upd.forge_caps).split(",").join(":")} a day in Forge` : ""].filter(Boolean).join(", ")}. I'm re-planning your week now.` };
          })()
        : act.tool === "archie_waiting"
        ? await (async () => { const x: any = await waitingList(tid); return { ok: true, text: x.text }; })()
        : act.tool === "archie_full_brief"
        ? await (async () => { const { data } = await supabase.from("briefs").select("body").eq("tenant_id", tid).eq("audience", member.handle).order("brief_date", { ascending: false }).limit(1).maybeSingle(); return { ok: true, text: data?.body ?? "No brief yet today." }; })()
        : act.tool === "archie_make_reel"
        ? await (async () => {
            const n = Number(args.idea_number);
            if (args.topic) { const x: any = await writeScript(tid, member.handle, String(args.topic), ""); return { ok: !!x.ok, text: x.ok ? `${x.text}\n\nWhen you've sent all the clips, say "edit these" — then "post it" when the reel comes back.` : x.text }; }
            if (n > 0) { const t: any = await teleprompter(tid, { idea_number: n }); return { ok: !!t.ok, text: t.ok ? `🎬 "${t.title}"\n\nStep 1 — film each line as its own clip (fluffs are fine, I keep your last clean take):\n${t.lines.map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}\n\nStep 2 — send me all the clips, then say "edit these".\nStep 3 — when the reel comes back, say "post it".` : t.text }; }
            const { data: ideas } = await supabase.from("content_posts").select("idea").eq("tenant_id", tid).in("status", ["to_film", "ready"]).order("status", { ascending: false }).order("score", { ascending: false }).limit(3);
            const list = (ideas ?? []).filter((x: any) => x.idea?.title);
            return { ok: true, text: `Let's make a reel 🎬\n\n${list.length ? `Pick one:\n${list.map((x: any, i: number) => `${i + 1}. ${x.idea.title}`).join("\n")}\n\nReply with a number — or ` : ""}tell me what it's about ("a reel about…") and I'll write the script.` };
          })()
        : act.tool === "archie_write_script"
        ? await (async () => { const x: any = await writeScript(tid, member.handle, String(args.topic ?? text), String(args.notes ?? "")); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_streak"
        ? await (async () => { const x: any = await contentWeek(tid, false); return { ok: true, text: x.text }; })()
        : act.tool === "archie_script"
        ? await (async () => { const x: any = await teleprompter(tid, { idea_number: args.number }); return { ok: !!x.ok, text: x.ok ? `🎬 ${x.title}\n\nFilm one line at a time (pause, then the next — fluffs are fine, I keep your last clean take):\n\n${x.lines.map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}\n\nThen send all the clips and say "edit these".` : x.text }; })()
        : act.tool === "archie_hooks"
        ? await (async () => { const x: any = await hookVersions(tid); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_brand"
        ? await (async () => { const x: any = await brandFromSite(tid, String(args.url ?? ""), args.force === true); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_learn"
        ? await (async () => { const x: any = await contentLearn(tid, false); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_use_style"
        ? await (async () => { const x: any = await useStyle(tid, String(args.name ?? "")); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_broll"
        ? await (async () => { const x: any = await brollSync(tid, true); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_plan_usage"
        ? await (async () => { const x: any = await planUsage(tid); return { ok: true, text: x.text }; })()
        : act.tool === "archie_style"
        ? await (async () => { const urls = String(args.urls ?? text).match(/https?:\/\/(www\.)?instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+/g) ?? []; if (!urls.length) return { ok: false, text: "Send me the Instagram reel links you want me to study." }; startInBackground(styleBreakdown(tid, urls.slice(0, 6), true)); return { ok: true, text: `🔍 Studying ${urls.length} reel${urls.length === 1 ? "" : "s"} — I'll send you the breakdown in a few minutes.` }; })()
        : act.tool === "archie_winback"
        ? await (async () => { const x: any = await winBack(tid, Number(args.months ?? 12)); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_month"
        ? await (async () => { const st: any = await monthStats(tid); startInBackground(monthVideo(tid, st)); return { ok: true, text: `${st.text}\n\n🎬 Making your 30-second month video now — it'll arrive in a few minutes.` }; })()
        : act.tool === "archie_feedback"
        ? await (async () => { const x: any = await saveFeedback(tid, member.handle, { ...args, channel: "whatsapp" }); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_carousel"
        ? await (async () => {
            const a2 = String(args.action ?? "make");
            const fmt = String(args.format ?? "carousel") === "story" ? "story" : "carousel";
            if (a2 === "send") {
              const { data: last } = await supabase.from("carousels").select("id, topic, slides, format").eq("tenant_id", tid).eq("status", "done").eq("format", fmt).order("created_at", { ascending: false }).limit(1).maybeSingle();
              if (!last) return { ok: false, text: `I don't have a finished ${fmt} yet.` };
              const urls = (last.slides ?? []).filter((x: any) => x.status === "done").sort((a: any, b: any) => a.n - b.n).map((x: any) => x.media_url || x.image_url).filter(Boolean).slice(0, 10);
              if (!urls.length || !member.ghl_contact_id) return { ok: false, text: "I couldn't send the slides here. Open Content → Carousels to see them." };
              let sentN = 0;
              for (let i = 0; i < urls.length; i++) {
                const sb = { type: channel, contactId: member.ghl_contact_id, message: i === 0 ? `${fmt === "story" ? "Story" : "Carousel"}: ${last.topic ?? ""} (${urls.length} ${fmt === "story" ? "frames" : "slides"})` : `${i + 1}/${urls.length}`, attachments: [urls[i]] };
                NO_TALK_LOG.add(sb);
                const rs = await ghl(token, "/conversations/messages", "POST", sb, "2021-04-15"); if (rs.ok) sentN++;
                await new Promise((ok) => setTimeout(ok, 600));
              }
              return { ok: sentN > 0, text: sentN ? `That's all ${sentN} above. Reply "post the ${fmt}" to put it in Social Planner as a draft, or tell me what to change.` : "WhatsApp wouldn't take the images. Open Content → Carousels to see them." };
            }
            if (a2 === "post") { const { data: last } = await supabase.from("carousels").select("id").eq("tenant_id", tid).eq("status", "done").eq("format", fmt).order("created_at", { ascending: false }).limit(1).maybeSingle(); if (!last) return { ok: false, text: `No finished ${fmt} yet.` }; const x: any = await carouselPost(tid, last.id); return { ok: !!x.ok, text: x.text }; }
            const x: any = await carouselStart(tid, member.handle, { topic: args.topic ?? text, slides_count: args.slides ?? (fmt === "story" ? 3 : 7), format: fmt });
            return { ok: !!x.ok, text: x.text ?? x.error };
          })()
        : act.tool === "archie_plan"
        ? await (async () => {
            const a2 = String(args.action ?? "show");
            if (a2 === "replan") { const x: any = await forgePlan(tid, { force: true, from_now: true }); if (!x.ok) return { ok: false, text: x.text }; }
            if (a2 === "push") { const mins = Math.max(15, Math.min(240, Number(args.minutes ?? 60))); const x: any = await forgePlan(tid, { force: true, from_now: true, delay_minutes: mins }); if (!x.ok) return { ok: false, text: x.text }; }
            const g: any = await forgePlanGet(tid, member.handle, 1);
            return { ok: true, text: g.today_text };
          })()
        : act.tool === "archie_instagram"
        ? await (async () => { const x: any = String(args.action ?? "results") === "sync" ? await igSync(tid) : await igResults(tid, Number(args.days ?? 30)); return { ok: !!x.ok, text: x.text }; })()
        : act.tool === "archie_ideas"
        ? await (async () => {
            const a2 = String(args.action ?? "list");
            if (a2 === "find") { const x: any = await ideasFindNow(tid); return { ok: !!x.ok, text: x.text }; }
            if (a2 === "film" || a2 === "skip") {
              const { data: ready } = await supabase.from("content_posts").select("id").eq("tenant_id", tid).eq("status", "ready").order("score", { ascending: false }).limit(10);
              const nums: number[] = (Array.isArray(args.numbers) ? args.numbers : String(args.numbers ?? "").split(/[\s,&and]+/)).map(Number).filter(Boolean);
              for (const n of nums) { const it = (ready ?? [])[n - 1]; if (it) await ideaUpdate(tid, it.id, a2 === "film" ? "to_film" : "skipped"); }
              return { ok: true, text: `${a2 === "film" ? "Added to your filming list" : "Skipped"}: ${nums.join(", ")}.` };
            }
            const x: any = await ideasList(tid, String(args.status ?? "ready"));
            return { ok: true, text: x.text };
          })()
        : act.tool === "archie_reel"
        ? await (async () => {
            const a2 = String(args.action ?? "redo");
            if (a2 === "left") { const x = await editAllowanceLeft(tid); return { ok: true, text: `${x.left} of ${x.allowance} reel edits left this month.` }; }
            const { data: last } = await supabase.from("edit_jobs").select("id, title, status").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(1).maybeSingle();
            if (!last) return { ok: false, text: "No reels yet — send me a video with \"edit\"." };
            if (a2 === "status") return { ok: true, text: `Latest reel${last.title ? ` (${last.title})` : ""}: ${last.status}.` };
            if (a2 === "post") { const x: any = await reelToPlanner(tid); return { ok: !!x.ok, text: x.text }; }
            const x: any = await editRedo(tid, last.id, String(args.change ?? text));
            return { ok: !!x.ok, text: x.ok ? x.text : String(x.error) };
          })()
        : act.tool === "archie_data"
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
      startInBackground(logFeature(tid, act.tool, text.startsWith("(voice note)") ? "voice" : "whatsapp", member.handle, r.ok));
      results.push(`${act.tool} ${JSON.stringify(args)} → ${r.ok ? "OK" : "FAILED"}: ${r.text.slice(0, act.tool === "archie_run_skill" ? 6000 : 800)}`);
    }

    // Some results go straight back as they are (no rewrite): the council and the checkup
    if (plan.actions.length === 1 && ["archie_council", "archie_checkup", "archie_call_prep", "archie_data", "archie_instagram", "archie_plan", "archie_month"].includes(plan.actions[0].tool) && results[0]) {
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
      `Use your client-message skill to write one message to each person below. Purpose: ${purpose}. Their pipeline stage is shown in brackets.`,
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

// v9.11.4: "I've spoken to them, they're all good" — resets the quiet clock now and on every nightly re-score
async function memberTouch(tid: string, p: any) {
  let clientId = String(p.client_id ?? "").trim();
  if (!clientId && p.name) {
    const { data: hit } = await supabase.from("member_health").select("client_id").eq("tenant_id", tid).ilike("name", String(p.name).trim()).limit(1).maybeSingle();
    clientId = hit?.client_id ?? "";
  }
  if (!clientId) return { ok: false, text: "Couldn't find that client." };
  const nowIso = new Date().toISOString();
  const { error } = await supabase.from("clients").update({ last_contact_at: nowIso }).eq("tenant_id", tid).eq("id", clientId);
  if (error) return { ok: false, text: error.message };
  const { data: row } = await supabase.from("member_health").select("name, reasons").eq("tenant_id", tid).eq("client_id", clientId).maybeSingle();
  // Keep anything talking can't fix (failed card, at-risk tag); clear the quiet / waiting-on-reply reasons
  const keep = ((row?.reasons ?? []) as string[]).filter((r) => /card failed|tagged/i.test(r));
  const { data: cfgT } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const day = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: cfgT?.timezone || "Europe/London" });
  await supabase.from("member_health").update({
    status: keep.length ? "red" : "green",
    reasons: keep.length ? keep : [`you spoke to them ${day}`],
    last_contact: nowIso,
  }).eq("tenant_id", tid).eq("client_id", clientId);
  const who = row?.name ?? "them";
  return { ok: true, status: keep.length ? "red" : "green", text: keep.length ? `Noted you've spoken to ${who}, so the clock's reset. Still flagged: ${keep.join("; ")}.` : `Noted you've spoken to ${who}. They're back to all good and the clock's reset.` };
}

// ===================== v9.12: voice library — learn from writing they love and hate =====================
const VOICE_KINDS = ["script", "caption", "email", "post", "message"];
const vKind = (k: unknown) => VOICE_KINDS.includes(String(k ?? "").toLowerCase()) ? String(k).toLowerCase() : "post";

async function voiceAdd(tid: string, p: any) {
  const list: any[] = Array.isArray(p.items) ? p.items : [p];
  const rows = list.map((x) => ({
    tenant_id: tid, kind: vKind(x.kind), verdict: String(x.verdict ?? "good") === "bad" ? "bad" : "good",
    body: String(x.body ?? x.text ?? "").trim().slice(0, 4000), note: x.note ? String(x.note).trim().slice(0, 300) : null,
    source: String(x.source ?? p.source ?? "page").slice(0, 20), active: true,
  })).filter((r) => r.body.length >= 20);
  if (!rows.length) return { ok: false, text: "Paste the full piece (at least a sentence or two) so I can learn from it." };
  const { error } = await supabase.from("voice_examples").insert(rows.slice(0, 30));
  if (error) return { ok: false, text: error.message };
  // Keep the library tidy: newest 40 good, 30 bad
  for (const [v, cap] of [["good", 40], ["bad", 30]] as const) {
    const { data: old } = await supabase.from("voice_examples").select("id").eq("tenant_id", tid).eq("verdict", v).eq("active", true).order("created_at", { ascending: false }).range(cap, cap + 200);
    if (old?.length) await supabase.from("voice_examples").update({ active: false }).in("id", old.map((o: any) => o.id));
  }
  const g = rows.filter((r) => r.verdict === "good").length, b = rows.length - g;
  return { ok: true, text: `Got it. ${g ? `${g} example${g === 1 ? "" : "s"} of how you write` : ""}${g && b ? " and " : ""}${b ? `${b} example${b === 1 ? "" : "s"} of what you don't want` : ""} saved. Everything I write from now on uses ${g && !b ? "them" : "it"}.` };
}

async function voiceList(tid: string) {
  const { data } = await supabase.from("voice_examples").select("id, kind, verdict, body, note, source, created_at").eq("tenant_id", tid).eq("active", true).order("created_at", { ascending: false }).limit(80);
  const { data: rules } = await supabase.from("business_memory").select("id, value").eq("tenant_id", tid).eq("kind", "voice").eq("key", "avoid").eq("status", "active").order("updated_at", { ascending: false }).limit(30);
  const items = data ?? [];
  return { ok: true, good: items.filter((x: any) => x.verdict === "good"), bad: items.filter((x: any) => x.verdict === "bad"), rules: (rules ?? []).map((r: any) => ({ id: r.id, text: r.value })), text: `${items.filter((x: any) => x.verdict === "good").length} good examples, ${items.filter((x: any) => x.verdict === "bad").length} to avoid, ${(rules ?? []).length} rules learned.` };
}

// They rejected a draft: keep it as a "don't", and turn their reason into a short rule every writer sees
async function voiceFeedback(tid: string, p: any) {
  const text = String(p.text ?? p.body ?? "").trim(), reason = String(p.reason ?? p.note ?? "").trim();
  if (!text && !reason) return { ok: false, text: "Tell me what you didn't like about it." };
  if (text.length >= 20) await supabase.from("voice_examples").insert({ tenant_id: tid, kind: vKind(p.kind), verdict: "bad", body: text.slice(0, 4000), note: reason.slice(0, 300) || null, source: String(p.source ?? "feedback").slice(0, 20), active: true });
  let rule = "";
  try {
    const r = await openai("chat/completions", { model: "gpt-4.1-mini", temperature: 0.2, max_tokens: 60, messages: [
      { role: "system", content: "Turn a business owner's feedback on a draft into ONE short writing rule (max 18 words) for future drafts. Start with 'Never' or 'Always'. British English. No quotes. If the feedback is too vague, describe the pattern in the draft that most likely caused it." },
      { role: "user", content: `Kind: ${vKind(p.kind)}\nTheir feedback: ${reason || "(none, they just rejected it)"}\nThe draft they rejected:\n${text.slice(0, 1500)}` },
    ] });
    const jr = await r.json(); rule = String(jr?.choices?.[0]?.message?.content ?? "").trim().replace(/^["']|["']$/g, "").slice(0, 160);
  } catch { /* fall back below */ }
  if (!rule && reason) rule = `Avoid: ${reason.slice(0, 140)}`;
  if (rule) {
    const { data: dup } = await supabase.from("business_memory").select("id, weeks_seen").eq("tenant_id", tid).eq("kind", "voice").eq("key", "avoid").eq("status", "active").ilike("value", rule.slice(0, 60) + "%").maybeSingle();
    if (dup) await supabase.from("business_memory").update({ weeks_seen: (Number(dup.weeks_seen) || 1) + 1, updated_at: new Date().toISOString() }).eq("id", dup.id);
    else await supabase.from("business_memory").insert({ tenant_id: tid, kind: "voice", key: "avoid", value: rule, source: "feedback", status: "active", weeks_seen: 1, updated_at: new Date().toISOString() });
  }
  return { ok: true, rule, text: rule ? `Noted. From now on: ${rule.replace(/^Avoid: /, "avoid ")}` : "Noted. I'll steer away from that." };
}

// What every writer sees: their real writing to match, and what they've rejected
async function voiceBlock(tid: string): Promise<string> {
  const { data } = await supabase.from("voice_examples").select("kind, verdict, body, note").eq("tenant_id", tid).eq("active", true).order("created_at", { ascending: false }).limit(60);
  if (!data?.length) return "";
  const good = data.filter((x: any) => x.verdict === "good"), bad = data.filter((x: any) => x.verdict === "bad");
  // A mix of kinds, newest first, inside a budget
  const picked: any[] = []; let used = 0;
  for (const k of VOICE_KINDS) for (const x of good.filter((g: any) => g.kind === k).slice(0, 2)) { const b = String(x.body).slice(0, 700); if (used + b.length > 3200) break; picked.push({ ...x, body: b }); used += b.length; }
  const out: string[] = [];
  if (picked.length) out.push(`HOW THEY ACTUALLY WRITE (real examples they approved; match the rhythm, sentence length, word choice and directness, never copy lines):\n${picked.map((x) => `[${x.kind}${x.note ? `, ${x.note}` : ""}]\n${x.body}`).join("\n---\n")}`);
  if (bad.length) out.push(`WRITING THEY REJECTED (don't write like this):\n${bad.slice(0, 5).map((x: any) => `- [${x.kind}] "${String(x.body).slice(0, 220).replace(/\s+/g, " ")}"${x.note ? ` — why: ${x.note}` : ""}`).join("\n")}`);
  return out.join("\n\n");
}

async function memberHealthList(tid: string, status: string) {
  let q = supabase.from("member_health").select("client_id, name, status, reasons, last_contact, next_booking, computed_at").eq("tenant_id", tid);
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
function normName(s: string) { return String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\b(x|and|the|fitlogic|systems|group|chat|support|team|coaching|fitness|ltd|limited|wa|whatsapp)\b/g, " ").replace(/\s+/g, " ").trim(); }
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

// v9.9.4: WhatsApp group chats are the GHL contacts tagged "wa group"
const GROUP_TAG = "wa group";
const hasGroupTag = (tags: any) => Array.isArray(tags) && tags.some((t: any) => String(t).trim().toLowerCase() === GROUP_TAG);
async function groupContacts(tid: string): Promise<{ id: string; name: string }[] | null> {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const out: { id: string; name: string }[] = [];
  for (const filter of [{ field: "tags", operator: "contains", value: [GROUP_TAG] }, { field: "tags", operator: "eq", value: GROUP_TAG }]) {
    out.length = 0;
    let okAll = true;
    for (let page = 1; page <= 5; page++) {
      const r = await ghl(token, `/contacts/search`, "POST", { locationId: loc, page, pageLimit: 100, filters: [filter] });
      if (!r.ok) { okAll = false; break; }
      const cs: any[] = r.json?.contacts ?? [];
      for (const c of cs) if (hasGroupTag(c.tags) || filter.operator === "eq") out.push({ id: c.id, name: String(c.contactName || [c.firstName, c.lastName].filter(Boolean).join(" ") || c.companyName || "").trim() });
      if (cs.length < 100) break;
    }
    if (okAll && out.length) return out;
  }
  return out.length ? out : null;
}

// All group chats: tagged contacts' conversations (from recent chats, or looked up if quiet)
async function groupConversations(tid: string) {
  const [convs, tagged] = await Promise.all([recentConversations(tid), groupContacts(tid)]);
  if (!tagged) return { list: convs.filter((cv: any) => hasGroupTag(cv.tags)).length ? convs.filter((cv: any) => hasGroupTag(cv.tags)) : convs, tagged: false };
  const byContact = new Map<string, any>();
  for (const cv of convs) if (cv.contactId) byContact.set(cv.contactId, cv);
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const list: any[] = [];
  for (const g of tagged.slice(0, 80)) {
    let cv = byContact.get(g.id);
    if (!cv) {
      const r = await ghl(token, `/conversations/search?locationId=${loc}&contactId=${g.id}&limit=1`, "GET", undefined, "2021-04-15");
      cv = r.json?.conversations?.[0];
    }
    if (cv) list.push({ ...cv, fullName: cv.fullName || cv.contactName || g.name });
  }
  return { list, tagged: true };
}

async function groupsSuggest(tid: string) {
  const [{ data: clients }, { data: linked }, gc] = await Promise.all([
    supabase.from("clients").select("id, name, ghl_contact_id").eq("tenant_id", tid).eq("status", "active").limit(300),
    supabase.from("client_groups").select("conversation_id, client_id").eq("tenant_id", tid),
    groupConversations(tid),
  ]);
  const taken = new Set((linked ?? []).map((l: any) => l.conversation_id));
  const own = new Set((clients ?? []).map((c: any) => c.ghl_contact_id));
  const sugg: any[] = []; const unmatched: string[] = [];
  for (const cv of gc.list) {
    if (taken.has(cv.id) || own.has(cv.contactId)) continue; // already linked, or a client's own 1:1 chat
    const gname = String(cv.fullName ?? cv.contactName ?? cv.companyName ?? "").trim();
    if (!gname) continue;
    let best: any = null, bestScore = 0, tie = false;
    for (const cl of clients ?? []) {
      const sc = nameScore(gname, cl.name ?? "");
      if (sc > bestScore) { bestScore = sc; best = cl; tie = false; }
      else if (sc === bestScore && sc > 0 && best && cl.id !== best.id) tie = true; // e.g. "Ross" with two clients called Ross
    }
    if (best && !tie && bestScore >= (gc.tagged ? 0.34 : 0.5)) sugg.push({ conversation_id: cv.id, group: gname, client_id: best.id, client: best.name, score: Math.round(bestScore * 100) });
    else if (gc.tagged) unmatched.push(gname);
  }
  sugg.sort((a, b) => b.score - a.score);
  const list = sugg.slice(0, 30).map((x, i) => ({ n: i + 1, ...x }));
  await supabase.from("tenant_config").update({ group_suggestions: list }).eq("tenant_id", tid);
  const more = unmatched.length ? `\n\nTagged "${GROUP_TAG}" but I can't tell whose they are:\n${unmatched.slice(0, 20).map((g) => `• ${g}`).join("\n")}\nSay "link the [group] group to [client]" for each.` : "";
  const text = list.length
    ? `Group chats that look like they belong to a client (my read — check before linking):\n${list.map((x) => `${x.n}. "${x.group}" → ${x.client}`).join("\n")}\n\nSay "link all", "link 1, 3 and 4", or "link the [group] group to [client]".${more}`
    : (more ? more.trim() : (gc.tagged ? `All your "${GROUP_TAG}" chats are already linked, or none are tagged yet.` : "I couldn't find any unlinked group chats that match a client's name. You can link one directly: \"link the [group] group to [client]\"."));
  return { ok: true, suggestions: list, unmatched, text };
}

async function groupsLink(tid: string, p: any) {
  const made: string[] = []; const missed: string[] = [];
  const save = async (conversation_id: string, client_id: string, group: string, client: string) => {
    const { error } = await supabase.from("client_groups").upsert({ tenant_id: tid, conversation_id, client_id, group_name: group, linked_by: "owner" }, { onConflict: "tenant_id,conversation_id" });
    error ? missed.push(`${group} (${error.message})`) : made.push(`"${group}" → ${client}`);
  };
  if (Array.isArray(p.pairs) && p.pairs.length) {
    // Bulk: [{ contact_id, client }] — the group contact's ID (from a GHL export) and the client's name
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
    const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
    const { data: clients } = await supabase.from("clients").select("id, name").eq("tenant_id", tid).eq("status", "active");
    for (const pr of p.pairs.slice(0, 100)) {
      const cid = String(pr.contact_id ?? "").trim(), want = String(pr.client ?? "").trim();
      if (!cid || !want) continue;
      const ranked = (clients ?? []).map((c: any) => ({ c, sc: String(c.name ?? "").trim().toLowerCase() === want.toLowerCase() ? 2 : nameScore(want, c.name ?? "") })).sort((a, b) => b.sc - a.sc);
      if (!ranked[0] || ranked[0].sc < 1 || (ranked[1] && ranked[1].sc === ranked[0].sc && ranked[0].sc < 2)) { missed.push(`${pr.group ?? cid} (no active client called "${want}")`); continue; }
      const r = await ghl(token, `/conversations/search?locationId=${loc}&contactId=${cid}&limit=1`, "GET", undefined, "2021-04-15");
      const cv = r.json?.conversations?.[0];
      if (!cv) { missed.push(`${pr.group ?? cid} (no chat found for that contact)`); continue; }
      await save(cv.id, ranked[0].c.id, String(pr.group ?? cv.fullName ?? cv.contactName ?? "group"), ranked[0].c.name);
    }
  } else if (p.conversation_id && p.client_id) {
    await save(String(p.conversation_id), String(p.client_id), String(p.group ?? "group"), String(p.client ?? "client"));
  } else if (p.all === true || String(p.all) === "true" || Array.isArray(p.numbers) || p.numbers) {
    const { data: cfg } = await supabase.from("tenant_config").select("group_suggestions").eq("tenant_id", tid).maybeSingle();
    const list: any[] = Array.isArray(cfg?.group_suggestions) ? cfg!.group_suggestions : [];
    if (!list.length) return { ok: false, text: "No suggestions to link — ask me to \"suggest group links\" first." };
    const nums = (p.all === true || String(p.all) === "true") ? list.map((x) => x.n) : (Array.isArray(p.numbers) ? p.numbers : String(p.numbers).split(/[\s,&and]+/)).map(Number).filter(Boolean);
    for (const n of nums) { const x = list.find((y) => y.n === n); if (x) await save(x.conversation_id, x.client_id, x.group, x.client); else missed.push(`#${n}`); }
  } else if (p.group && p.client) {
    const [{ data: clients }, gcv] = await Promise.all([supabase.from("clients").select("id, name").eq("tenant_id", tid).eq("status", "active"), groupConversations(tid)]);
    const convs = gcv.list;
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
  if (!p.lens && !p.answers) { const gate: any = await allowance(tid, "council"); if (!gate.ok) return { ok: false, text: gate.text }; }
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
  let contactId = String(p.contact_id ?? ""), eventTitle = String(p.event_title ?? ""), eventTime = String(p.event_time ?? "");
  if (userId && !contactId) {
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
    "Use your pre-call-brief skill — the SHORT version (WhatsApp, under ~18 lines). Use ONLY the facts below.",
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
  try { const m = outText.match(/\{[\s\S]*\}/); parsed = m ? looseJson(m[0]) : null; } catch { parsed = null; }
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
  brand_primary: "text", brand_accent: "text", brand_text: "text", brand_logo_url: "text", caption_style: "text",
  outro_text: "text", outro_sub: "text", edit_allowance: "int", instagram_handle: "text", sched_ideas: "time", sched_ideas_day: "int", sched_ig: "time",
  coach_on: "bool", onboarding_started_at: "text", sched_coach: "time", auto_prep: "bool", prep_calendars: "json", forge_auto: "bool", forge_days: "int",
  carousel_accent: "text", carousel_wordmark: "text", voice_name: "text", vocab: "text", post_mode: "text", cta_keyword: "text", cta_offer: "text", cta_link: "text", website_url: "text", content_stack: "bool", auto_style: "bool", reels_per_week: "int", brief_style: "text", evening_wrap: "bool", sched_wrap: "time", forge_caps: "text", edit_engine: "text", caption_style2: "text", sfx_on: "bool", sfx_url: "text", music_url: "text", edit_pace: "text", reel_style: "text",
};
const SECRET_FIELDS = ["stripe_key", "fathom_api_key", "ghl_token"];

// v9.11.1: run what the app's screens call, server-side, and say what each returns — proves whether a blank screen is the app or Archie
async function appSelftest(tid: string) {
  const { data: owner } = await supabase.from("team_members").select("handle, name").eq("tenant_id", tid).eq("gets_financials", true).neq("active", false).limit(1).maybeSingle();
  const c = { tid, owner };
  const out: Record<string, string> = {};
  const run = async (name: string, f: () => Promise<any>, summary: (r: any) => string) => {
    try { const r = await f(); out[name] = r?.ok === false ? `NOT OK: ${r.error ?? r.text ?? "no detail"}` : summary(r); }
    catch (e) { out[name] = `ERROR: ${String(e).slice(0, 120)}`; }
  };
  await run("brief_today", () => briefToday(c), (r) => r.has_brief ? `brief from ${r.date}${r.is_today ? " (today)" : " (NOT today)"} · full ${String(r.full ?? "").length} chars · short ${String(r.short ?? "").length} chars` : `no brief: ${r.text}`);
  await run("forge_plan_get", () => forgePlanGet(tid, owner?.handle ?? "", 5), (r) => r.hours ? `hours ${r.hours.work_start}–${r.hours.work_end}, ${r.hours.max_task_hours}h tasks, days ${r.hours.work_days}` : "no hours returned");
  await run("pick_users", () => pickUsers(tid), (r) => `${(r.users ?? []).length} users`);
  await run("pick_calendars", () => pickCalendars(tid), (r) => `${(r.calendars ?? []).length} calendars`);
  await run("pick_stages", () => pickStages(tid), (r) => `${(r.pipelines ?? []).length} pipelines, ${(r.pipelines ?? []).reduce((a: number, x: any) => a + (x.stages ?? []).length, 0)} stages`);
  await run("member_health", () => memberHealthList(tid, ""), (r) => { const list = r.members ?? r.clients ?? r.items ?? r.rows ?? []; return `${Array.isArray(list) ? list.length : "?"} clients (keys: ${Object.keys(r).slice(0, 8).join(", ")})`; });
  await run("settings_get", () => settingsGet(tid), (r) => `team ${(r.team ?? []).length} · ${r.team?.[0]?.ghl_user_id ? "user set" : "no CRM user"} · ${r.team?.[0]?.personal_calendar_id ? "calendar set" : "no personal calendar"} · trial stage ${r.settings?.trial_stage_name || r.settings?.trial_stage ? "set" : "not set"}`);
  return { ok: true, owner: owner?.handle ?? null, results: out };
}

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
    trial: { stage_id: cfg?.trial_stage ?? null, stage_name: cfg?.trial_stage_name ?? null, pipeline_id: cfg?.trial_pipeline ?? null },
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
  // v9.11.1: the app's stage picker sends the stage id — exact, even when two pipelines share a stage name
  if (src.trial_stage_id) {
    const ps: any = await pickStages(tid);
    let hit: any = null;
    for (const pp of ps.pipelines ?? []) for (const st of pp.stages ?? []) if (st.id === String(src.trial_stage_id)) hit = { pp, st };
    if (hit) await supabase.from("tenant_config").update({ trial_stage: hit.st.id, trial_pipeline: hit.pp.id, trial_stage_name: hit.st.name }).eq("tenant_id", tid);
    else bad.push("trial stage: not found");
    delete patch.trial_stage_id;
  } else if (src.trial_stage_name !== undefined && src.trial_stage_name) { const r: any = await setTrialStage(tid, { stage: src.trial_stage_name }); if (!r.ok) bad.push(`trial stage: ${r.text}`); delete patch.trial_stage_name; }
  // Switching schedules on for the first time starts the onboarding coach (day 1 = today)
  if (patch.schedules_on === true) {
    const { data: ob } = await supabase.from("tenant_config").select("onboarding_started_at, is_agency").eq("tenant_id", tid).maybeSingle();
    if (!ob?.onboarding_started_at && !ob?.is_agency) { patch.onboarding_started_at = new Date().toISOString(); if (!("coach_on" in patch)) patch.coach_on = true; }
  }
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

// ===================== v6.4: Archie Edit =====================
import { renderMediaOnLambda, getRenderProgress, renderStillOnLambda } from "npm:@remotion/lambda-client@4.0.532";
const CLIPS_BUCKET = "archie-clips";

async function editUploadUrl(tid: string, filename: string) {
  const safe = filename.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").slice(-60) || "clip.mp4";
  const path = `${tid}/${Date.now()}-${safe}`;
  const { data, error } = await supabase.storage.from(CLIPS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "couldn't create upload link" };
  return { ok: true, path, upload_url: data.signedUrl, token: data.token, how: "PUT the file to upload_url with Content-Type video/mp4 (or the file's type), then call edit_start with this path." };
}

async function editAllowanceLeft(tid: string) {
  const a: any = await allowance(tid, "reels");
  return { allowance: a.limit ?? 9999, used: a.used, left: a.left ?? 9999 };
}

async function editStart(tid: string, handle: string, p: any) {
  const isWeek = p.multi === true || String(p.multi) === "true";
  const gate: any = await allowance(tid, isWeek ? "weeks" : "reels");
  if (!gate.ok) return { ok: false, error: gate.text };
  const cap = await editAllowanceLeft(tid);
  // Several clips (one line/scene each) → one reel
  const many: string[] = [];
  for (const u of Array.isArray(p.video_urls) ? p.video_urls : []) if (/^https?:\/\//.test(String(u))) many.push(String(u));
  for (const pth of Array.isArray(p.paths) ? p.paths : []) { const { data } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(String(pth), 60 * 60 * 24 * 3); if (data?.signedUrl) many.push(data.signedUrl); }
  let sourceUrl = String(p.video_url ?? "").trim() || many[0] || "";
  const path = String(p.path ?? "").trim();
  if (!sourceUrl && path) {
    const { data, error } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 3);
    if (error || !data) return { ok: false, error: `can't read the upload: ${error?.message ?? "not found"}` };
    sourceUrl = data.signedUrl;
  }
  if (!/^https?:\/\//.test(sourceUrl)) return { ok: false, error: "No video — upload a clip or pick one from your media." };
  // Which idea is this a take of? (from the page's idea_id, or "idea 2" on WhatsApp = number 2 on the filming list)
  let idea: any = null;
  if (p.idea_id) idea = (await supabase.from("content_posts").select("id, idea").eq("tenant_id", tid).eq("id", String(p.idea_id)).maybeSingle()).data;
  else if (p.idea_number) {
    const n = Number(p.idea_number);
    const { data: fl } = await supabase.from("content_posts").select("id, idea").eq("tenant_id", tid).eq("status", "to_film").order("score", { ascending: false }).limit(20);
    const { data: rd } = !fl?.length ? await supabase.from("content_posts").select("id, idea").eq("tenant_id", tid).eq("status", "ready").order("score", { ascending: false }).limit(20) : { data: null };
    idea = (fl?.length ? fl : rd ?? [])[n - 1] ?? null;
  }
  const ideaBrief = idea?.idea ? `This is a take of a planned idea. Title: ${idea.idea.title ?? ""}. The hook they meant to open with: "${idea.idea.hook ?? ""}". Their script: ${(idea.idea.script ?? []).join(" / ")}. Keep the strongest version of that hook first.` : "";
  // "edit in @creator style" → one of their saved custom styles
  let customStyleId: string | null = null;
  const at = String(p.brief ?? "").match(/@([a-z0-9_.]+)/i)?.[1];
  if (at) { const { data: cs } = await supabase.from("custom_styles").select("id, name").eq("tenant_id", tid); const hit = (cs ?? []).find((x: any) => String(x.name).toLowerCase().includes(at.toLowerCase())); if (hit) customStyleId = `custom:${hit.id}`; }
  const { data: job, error } = await supabase.from("edit_jobs").insert({
    tenant_id: tid, handle, source_url: sourceUrl, source_path: path || null, status: "transcribing",
    title: (String(p.title ?? "").slice(0, 120) || idea?.idea?.title || null),
    brief: [String(p.brief ?? "").slice(0, 600), ideaBrief].filter(Boolean).join("\n") || null,
    idea_id: idea?.id ?? null, caption: idea?.idea?.caption ?? null,
    multi: p.multi === true || String(p.multi) === "true",
    sources: many.length > 1 ? many.slice(0, 15).map((u) => ({ url: u })) : null,
    style: (String(p.brief ?? "").match(/\b(minimal|clean|energetic|studio)\b/i)?.[1] ?? "").toLowerCase() || customStyleId || null,
  }).select("id").single();
  if (idea?.id) await supabase.from("content_posts").update({ status: "filmed", updated_at: new Date().toISOString() }).eq("id", idea.id);
  // Raw clip uploaded on the page → also into GHL Media
  if (path && !p.video_url) startInBackground((async () => {
    const { data: cf } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
    const fd = new FormData();
    fd.append("hosted", "true"); fd.append("fileUrl", sourceUrl); fd.append("name", `${(String(p.title ?? "") || idea?.idea?.title || "Raw clip").slice(0, 80)} (raw ${new Date().toISOString().slice(0, 10)}).mp4`);
    await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${cf?.ghl_location_id}`, { method: "POST", headers: { Authorization: `Bearer ${cf?.ghl_token || FALLBACK_TOKEN}`, Version: "2021-07-28" }, body: fd }).catch(() => null);
  })());
  if (error || !job) return { ok: false, error: error?.message ?? "couldn't start" };
  startInBackground(editPipeline(tid, job.id));
  return { ok: true, id: job.id, used: cap.used + 1, allowance: cap.allowance, idea_title: idea?.idea?.title ?? null, text: `Got it — transcribing and editing now${idea?.idea?.title ? ` (your take on "${idea.idea.title}")` : ""}. Usually ready in 2–4 minutes.` };
}

async function editRedo(tid: string, id: string, change: string) {
  const { data: job } = await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!job) return { ok: false, error: "edit not found" };
  const pace = /more natural|less punchy|slower|breath|too tight|too fast/i.test(change) ? "natural" : /punch|tighter|faster|snappier|cut the pauses/i.test(change) ? "punchy" : job.pace ?? null;
  const style = (change.match(/\b(minimal|clean|energetic|archie|studio)\b/i)?.[1] ?? "").toLowerCase() || job.style || null;
  await supabase.from("edit_jobs").update({ status: "planning", change_request: change.slice(0, 600), render_id: null, output_url: null, error: null, checked_at: null, render_retried: false, pace, style, updated_at: new Date().toISOString() }).eq("id", id);
  startInBackground(editPipeline(tid, id, true));
  return { ok: true, id, text: "Re-editing with your changes — a couple of minutes." };
}

async function editFail(id: string, msg: string) {
  await supabase.from("edit_jobs").update({ status: "failed", error: msg.slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
  // Tell them — nobody should sit waiting on a reel that isn't coming
  try {
    const { data: job } = await supabase.from("edit_jobs").select("tenant_id, handle, title, parent_id, kind").eq("id", id).maybeSingle();
    if (!job || job.kind === "month") return;
    const plain = /speech|hear/i.test(msg) ? "I couldn't hear any speech in it."
      : /Transcription/i.test(msg) ? "I couldn't listen to the video."
      : /plan came back empty|Content agent/i.test(msg) ? "I couldn't work out the edit."
      : /Render|delayRender|timeout/i.test(msg) ? "the video wouldn't render."
      : "something went wrong.";
    await sendToMember(job.tenant_id, job.handle, `⚠️ Sorry — ${job.parent_id ? "one of the reels from your week of content" : `your reel${job.title ? ` "${job.title}"` : ""}`} didn't work: ${plain} Send the clip again with "edit" (sending it as a Document keeps it full quality), or tell me if it keeps happening.`);
  } catch { /* best effort */ }
}

async function sendToMember(tid: string, handle: string | null, message: string) {
  const { data: m } = handle ? await supabase.from("team_members").select("ghl_contact_id").eq("tenant_id", tid).eq("handle", handle).maybeSingle() : await supabase.from("team_members").select("ghl_contact_id").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  const { data: c2 } = await supabase.from("tenant_config").select("ghl_token, brief_channel").eq("tenant_id", tid).single();
  if (m?.ghl_contact_id) await ghl(c2?.ghl_token || FALLBACK_TOKEN, "/conversations/messages", "POST", { type: String(c2?.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS", contactId: m.ghl_contact_id, message }, "2021-04-15");
}

// Copy a clip into Archie's own storage (streamed, never held in memory) so the renderer always reads it fast
async function copyClipToStorage(tid: string, id: string, url: string): Promise<string> {
  if (url.includes("/storage/v1/object/")) return url;
  try {
    const src = await fetch(url);
    if (!src.ok || !src.body) return url;
    const path = `sources/${tid}/${id}.mp4`;
    const { data: up } = await supabase.storage.from(CLIPS_BUCKET).createSignedUploadUrl(path);
    if (!up?.signedUrl) return url;
    const put = await fetch(up.signedUrl, { method: "PUT", headers: { "Content-Type": "video/mp4", "x-upsert": "true" }, body: src.body, duplex: "half" } as any);
    if (!put.ok) { console.log("copy clip", put.status, (await put.text()).slice(0, 200)); return url; }
    const { data: signed } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 7 * 86400);
    return signed?.signedUrl ?? url;
  } catch (e) { console.log("copy clip failed", String(e).slice(0, 120)); return url; }
}

// Watch a render every 20 seconds (up to 12 minutes) instead of waiting for the 5-minute scheduler
async function watchRender(tid: string, id: string) {
  for (let i = 0; i < 15; i++) {
    await new Promise((ok) => setTimeout(ok, 20000));
    const { data: job } = await supabase.from("edit_jobs").select("*").eq("id", id).maybeSingle();
    if (!job || job.status !== "rendering") return;
    await editCheck(tid, job);
  }
}

// Transcribe → plan → build props → start the render
async function editPipeline(tid: string, id: string, replan = false, presetPlan: any = null) {
  try {
    const { data: job0 } = await supabase.from("edit_jobs").select("*").eq("id", id).single();
    // Our own copy of every clip, so every later step reads them quickly
    if (job0 && Array.isArray(job0.sources) && job0.sources.length > 1) {
      const copied = [];
      for (let n = 0; n < job0.sources.length; n++) copied.push({ url: await copyClipToStorage(tid, `${id}-${n}`, String(job0.sources[n].url)) });
      await supabase.from("edit_jobs").update({ sources: copied, source_url: copied[0].url }).eq("id", id);
    } else if (job0 && !String(job0.source_url).includes("/storage/v1/object/")) {
      const fast = await copyClipToStorage(tid, id, job0.source_url);
      if (fast !== job0.source_url) await supabase.from("edit_jobs").update({ source_url: fast }).eq("id", id);
    }
    const { data: job } = await supabase.from("edit_jobs").select("*").eq("id", id).single();
    const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
    const engineV2 = true; // v2 for everyone — the old editor is retired
    const punchy = String(job.pace ?? cfg?.edit_pace ?? "punchy") !== "natural";
    // The style: a preset, or a custom style ("custom:<id>") made from a reel they love
    const styleKey = String(job.style ?? cfg?.reel_style ?? "clean");
    let reelStyle = ["archie", "minimal", "clean", "energetic", "studio"].includes(styleKey) ? styleKey : "clean";
    let presetConfig: any = undefined;
    if (styleKey.startsWith("custom:")) {
      const { data: cs } = await supabase.from("custom_styles").select("base, config").eq("tenant_id", tid).eq("id", styleKey.slice(7)).maybeSingle();
      if (cs) { reelStyle = cs.base || "clean"; presetConfig = cs.config; }
    }
    const sources: string[] = Array.isArray(job.sources) && job.sources.length > 1 ? job.sources.map((x: any) => String(x.url)) : [];
    const terms = await deepgramTerms(tid);
    const { data: learnRow } = await supabase.from("business_memory").select("value").eq("tenant_id", tid).eq("kind", "content_learning").eq("status", "active").order("updated_at", { ascending: false }).limit(1).maybeSingle();
    const contentLearning = String(learnRow?.value ?? "").slice(0, 600);
    const multi = sources.length > 1;
    // 1. Transcript with word timings (Deepgram reads the video straight from its link)
    let words: { w: string; s: number; e: number; src?: number }[] = job.transcript?.words ?? [];
    let duration = Number(job.transcript?.duration ?? 0);
    let durations: number[] = job.transcript?.durations ?? [];
    if (multi && (!replan || !words.length)) {
      const key = Deno.env.get("DEEPGRAM_API_KEY");
      if (!key) return editFail(id, "Transcription isn't set up (DEEPGRAM_API_KEY missing).");
      words = []; durations = [];
      for (let n = 0; n < sources.length; n++) {
        const r = await fetch(`https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&language=en${terms}`, { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ url: sources[n] }) });
        const js: any = await r.json().catch(() => null);
        const alt = js?.results?.channels?.[0]?.alternatives?.[0];
        const ws = (alt?.words ?? []).map((x: any) => ({ w: String(x.punctuated_word ?? x.word), s: Number(x.start), e: Number(x.end), src: n }));
        durations.push(Number(js?.metadata?.duration ?? (ws.length ? ws[ws.length - 1].e : 0)));
        // each clip ends a sentence
        if (ws.length && !/[.!?]$/.test(ws[ws.length - 1].w)) ws[ws.length - 1].w += ".";
        words.push(...ws);
      }
      duration = Math.max(...durations, 0);
      if (!words.length) return editFail(id, "I couldn't hear any speech in those clips.");
      await supabase.from("edit_jobs").update({ transcript: { words, duration, durations }, status: "planning", updated_at: new Date().toISOString() }).eq("id", id);
    }
    if (!multi && (!replan || !words.length)) {
      const key = Deno.env.get("DEEPGRAM_API_KEY");
      if (!key) return editFail(id, "Transcription isn't set up (DEEPGRAM_API_KEY missing).");
      const r = await fetch(`https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&language=en${terms}`, {
        method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ url: job.source_url }),
      });
      const js: any = await r.json().catch(() => null);
      if (!r.ok) return editFail(id, `Transcription failed (${r.status}): ${JSON.stringify(js).slice(0, 200)}`);
      const alt = js?.results?.channels?.[0]?.alternatives?.[0];
      words = (alt?.words ?? []).map((x: any) => ({ w: String(x.punctuated_word ?? x.word), s: Number(x.start), e: Number(x.end) }));
      duration = Number(js?.metadata?.duration ?? (words.length ? words[words.length - 1].e : 0));
      if (!words.length) return editFail(id, "I couldn't hear any speech in that clip.");
      await supabase.from("edit_jobs").update({ transcript: { words, duration }, status: "planning", updated_at: new Date().toISOString() }).eq("id", id);
    }

    // 2. Sentences with ids (the plan refers to these, never to raw times)
    const sentences: { id: number; text: string; s: number; e: number; from: number; to: number; src: number }[] = [];
    let cur: number[] = [];
    words.forEach((w, i) => {
      cur.push(i);
      const nextOtherClip = i + 1 < words.length && (words[i + 1].src ?? 0) !== (w.src ?? 0);
      const gap = i + 1 < words.length && !nextOtherClip ? words[i + 1].s - w.e : 9;
      if (/[.!?]$/.test(w.w) || gap > 1.2 || cur.length >= 30 || nextOtherClip) {
        sentences.push({ id: sentences.length + 1, text: cur.map((k) => words[k].w).join(" "), s: words[cur[0]].s, e: words[cur[cur.length - 1]].e, from: cur[0], to: cur[cur.length - 1], src: words[cur[0]].src ?? 0 });
        cur = [];
      }
    });

    // 3. Archie's edit plan
    const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
    const agentId = await agentIdFor(tid, "content", token, loc);
    if (!agentId) return editFail(id, "Couldn't find the Archie Content agent.");
    // Read their B-roll folder now if it's never been read (or not for a day) — so this reel can use it
    if (engineV2) {
      const { data: lastB } = await supabase.from("broll_library").select("created_at").eq("tenant_id", tid).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { data: cfgB } = await supabase.from("tenant_config").select("broll_synced_at").eq("tenant_id", tid).maybeSingle();
      const last = Date.parse(cfgB?.broll_synced_at ?? lastB?.created_at ?? "1970-01-01");
      if (Date.now() - last > 24 * 3600000) {
        await supabase.from("tenant_config").update({ broll_synced_at: new Date().toISOString() }).eq("tenant_id", tid);
        await brollSync(tid, false).catch(() => null);
      }
    }
    // The client's own B-roll library (described once, from their GHL Media "B-roll" folder)
    const { data: brollAll } = engineV2 ? await supabase.from("broll_library").select("id, kind, description, seconds, last_used_at").eq("tenant_id", tid).eq("active", true).not("description", "is", null).order("last_used_at", { ascending: true, nullsFirst: true }).limit(60) : { data: [] as any[] };
    // Variety: anything used in the last 3 days sits out (stock fills the gap)
    const recentCut = Date.now() - 3 * 86400000;
    const brollLib = (brollAll ?? []).filter((b: any) => !b.last_used_at || Date.parse(b.last_used_at) < recentCut).slice(0, 40);
    const brollList = (brollLib ?? []).map((b: any, n: number) => `B${n + 1} [${b.kind}${b.seconds ? `, ${Math.round(b.seconds)}s` : ""}] ${String(b.description).slice(0, 120)}`);
    const msg = [
      "You are editing a short vertical talking-head reel (Instagram/TikTok). Below are the sentences of the raw clip with ids and times.",
      punchy
        ? "Make it PUNCHY: keep the last clean take of anything said twice, drop false starts, warm-up lines (\"so today…\", \"okay so…\"), repeats and any sentence that doesn't move the point forward. Put the strongest line first as the hook. Aim for 20–45 seconds; shorter is better if nothing is lost."
        : "Choose the strongest version: keep the best take of anything repeated, drop false starts, filler and dead air, and put the best hook first if a later sentence is a stronger opener. Keep a natural, conversational feel. Aim for 20–60 seconds unless the content needs more.",
      job.brief ? `The owner's brief: ${job.brief}` : "",
      multi ? `This reel is made from ${sources.length} separate clips (one line or scene each, in the order sent, marked [clip N]). Keep them in that order unless another order clearly tells the story better; if the same line was filmed in two clips, keep the better take.` : "",
      job.change_request ? `CHANGES REQUESTED to the last edit: ${job.change_request}` : "",
      "Return ONLY JSON:",
      '{"title":"short title","keep":[3,1,4,5],"emphasis":{"3":["word","word"]},"overlays":[{"type":"title|callout|stat|list|card","at":3,"text":"…","value":"for stat e.g. 3x","items":["for list"],"position":"top|middle|bottom","seconds":2.5}],"zooms":[4],"outro":{"text":"…","sub":"…"}}',
      engineV2 ? `ALSO add "broll": 2–4 moments to cut away to B-roll while they keep talking. ${brollList.length ? `Use the owner's OWN B-roll first — ONLY where an item clearly matches: {"at":id,"cue":"word","item":"B3","seconds":2}. If none of theirs fits a moment that needs a visual, use stock instead: {"at":id,"cue":"word","stock":"3-6 word search for a real, vertical stock clip (e.g. person typing on laptop at night)","seconds":2}. Their B-roll:\n${brollList.join("\n")}` : `They have no B-roll of their own yet, so use stock: {"at":id,"cue":"word","stock":"3-6 word search for a real, vertical stock clip (e.g. person typing on laptop at night)","seconds":2}.`} Never on the first sentence (the hook) or the last (the call to action), never the same item twice, at most one every 8 seconds. Stock searches must describe ordinary real-life scenes (people, places, objects) — no logos, no text, no specific brands.` : "",
      engineV2 ? `ALSO add "graphics": ${ (presetConfig?.graphics ?? ({ energetic: "lots", studio: "some", clean: "some", minimal: "few", archie: "some" } as any)[reelStyle]) === "lots" ? "5–8" : (presetConfig?.graphics ?? ({ energetic: "lots", studio: "some", clean: "some", minimal: "few", archie: "some" } as any)[reelStyle]) === "few" ? "1–3" : "3–5"} small motion graphics that land on the word they show: [{"at":id,"cue":"word","type":"logo|icon|underline|circle${reelStyle === "energetic" ? "|emoji" : ""}","value":"…"}]. logo = ONLY when they name a real app/brand (value = its name, e.g. "Instagram", "WhatsApp", "Stripe"); icon = one of: ${["clock","money","check","warning","growth","down","calendar","message","people","fast","target","heart","gym","brain","idea","launch","phone","email","star","no","magic","ai","mobile","video","camera","chart","safe","gift"].join(", ")}; underline/circle = on the single most important word of a line (value = that word)${reelStyle === "energetic" ? "; emoji = one fitting emoji character" : ""}. Not on the same sentence as a card.` : "",
      engineV2 ? "ALSO add \"hook_variants\": 2 alternative openings for A/B testing — [{\"hook_text\":\"…\",\"first\":id}] where first is a DIFFERENT kept sentence that could open the reel instead, and hook_text is a different angle (curiosity, bold claim, question)." : "",
      contentLearning ? `WHAT'S WORKING FOR THIS ACCOUNT (from their own Instagram results — lean into it): ${contentLearning}` : "",
      engineV2 ? "ALSO add \"hook_text\": the on-screen hook, max 6 words, punchy, from what they actually say (e.g. \"Stop doing admin at 10pm\"), and \"points\": the sentence ids where each new point or step starts (for a step counter)." : "",
      engineV2 ? "Each card also gets \"cue\": the one word in that sentence the card shows (it appears on that word). One idea per card; it stays up for the whole sentence. ALSO add \"cards\": a designed on-screen card for MOST kept sentences (skip ones where the face alone is stronger, e.g. the hook and personal moments). Each card: {\"at\":id,\"type\":\"number|list|steps|quote|compare|keyword|callout\",\"value\":12,\"prefix\":\"£\",\"suffix\":\"%\",\"label\":\"…\",\"title\":\"…\",\"items\":[\"…\"],\"text\":\"…\",\"before\":\"…\",\"after\":\"…\"} — only the fields its type needs. Use ONLY facts actually said. number = a figure they said; list/steps = 2–4 short items they named; compare = a before/after they described; quote = a punchy line of theirs; keyword = one word to slam on screen; callout = a short phrase (under 6 words). Vary the types." : "",
      "keep = sentence ids in the order to play them. emphasis = 1–2 key words per kept sentence to colour. overlays: 2–4 max, short punchy text (under 6 words), only facts actually said. zooms = sentence ids to push in on (1–3). outro optional: a short call to action.",
      "",
      "SENTENCES:",
      ...sentences.map((x) => `${x.id} ${multi ? `[clip ${x.src + 1}] ` : ""}[${x.s.toFixed(1)}–${x.e.toFixed(1)}s] ${x.text}`),
    ].filter(Boolean).join("\n").slice(0, 9400);
    let plan: any = presetPlan;
    if (!plan && job.multi) {
      // One long ramble → several standalone reels (+ a carousel from the same ideas)
      const multiMsg = [
        "This is a long, unscripted video. Find the 3–5 strongest STANDALONE moments — each one becomes its own 20–60 second vertical reel with its own hook (the best opening line from that moment first). Moments must not overlap.",
        job.brief ? `The owner's brief: ${job.brief}` : "",
        "Return ONLY JSON: {\"clips\":[{\"title\":\"…\",\"keep\":[ids in play order],\"emphasis\":{\"id\":[\"word\"]},\"overlays\":[{\"type\":\"title|callout|stat|list|card\",\"at\":id,\"text\":\"…\",\"position\":\"top|middle|bottom\",\"seconds\":2.5}],\"zooms\":[ids],\"outro\":{\"text\":\"…\",\"sub\":\"…\"}}],\"carousel_topic\":\"one line: the main idea, for a carousel\"}",
        "",
        "SENTENCES:",
        ...sentences.map((x) => `${x.id} ${multi ? `[clip ${x.src + 1}] ` : ""}[${x.s.toFixed(1)}–${x.e.toFixed(1)}s] ${x.text}`),
      ].filter(Boolean).join("\n").slice(0, 9400);
      const mres = await agentExecute(token, agentId, { locationId: loc, message: multiMsg }, `edit-${tid}-${Date.now()}`);
      let mp: any = null;
      try { const mm = tidy(clean(String(mres.json?.finalText ?? ""))).match(/\{[\s\S]*\}/); mp = mm ? looseJson(mm[0]) : null; } catch { mp = null; }
      const clips: any[] = Array.isArray(mp?.clips) ? mp.clips.filter((c: any) => Array.isArray(c?.keep) && c.keep.length).slice(0, 5) : [];
      if (clips.length) {
        plan = clips[0];
        for (const clip of clips.slice(1)) {
          const { data: child } = await supabase.from("edit_jobs").insert({
            tenant_id: tid, handle: job.handle, source_url: job.source_url, source_path: job.source_path, status: "planning",
            title: String(clip.title ?? "").slice(0, 120) || null, transcript: { words, duration }, parent_id: id, brief: job.brief,
          }).select("id").single();
          if (child?.id) await runFresh("edit_run", { tenant_id: tid, id: child.id, replan: true, plan: clip });
        }
        await supabase.from("edit_jobs").update({ title: String(clips[0].title ?? job.title ?? "").slice(0, 120) || null }).eq("id", id);
        if (mp?.carousel_topic) startInBackground(carouselStart(tid, job.handle ?? "owner", { topic: String(mp.carousel_topic), brief: `Built from the owner's own video. What they said: ${words.map((w) => w.w).join(" ").slice(0, 400)}` }));
        await sendToTeam(tid, `🎬 Found ${clips.length} reels in your video${mp?.carousel_topic ? " and a carousel idea" : ""} — editing them all now. They'll arrive one by one.`, "", "edit");
      }
    }
    if (!plan) {
      const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `edit-${tid}-${Date.now()}`);
      try { const m = tidy(clean(String(res.json?.finalText ?? ""))).match(/\{[\s\S]*\}/); plan = m ? looseJson(m[0]) : null; } catch { plan = null; }
    }
    const keep: number[] = (Array.isArray(plan?.keep) ? plan.keep : sentences.map((x) => x.id)).map(Number).filter((n: number) => sentences.some((x) => x.id === n));
    if (!keep.length) return editFail(id, "The edit plan came back empty — try again.");

    // Make sure the plan has B-roll and graphics (agents sometimes skip them; old plans don't have them)
    if (engineV2 && plan && (!Array.isArray(plan.graphics) || !plan.graphics.length || !Array.isArray(plan.broll) || !plan.broll.length)) {
      try {
        const kept = (Array.isArray(plan.keep) ? plan.keep : []).map(Number);
        const list = sentences.filter((x) => kept.includes(x.id));
        const ask = [
          "Add on-screen extras to this reel plan. Return ONLY JSON {\"broll\":[…],\"graphics\":[…]}.",
          `broll: 2–4 moments to cut away while they keep talking — never the first or last sentence. ${brollList.length ? `Prefer their own B-roll when it clearly matches: {"at":id,"cue":"word","item":"B3","seconds":2}; otherwise stock: {"at":id,"cue":"word","stock":"3-6 word search for a real vertical clip","seconds":2}.\nTheir B-roll:\n${brollList.join("\n")}` : `Use stock: {"at":id,"cue":"word","stock":"3-6 word search for a real vertical clip","seconds":2}.`}`,
          `graphics: ${reelStyle === "energetic" ? "5–8" : reelStyle === "minimal" ? "1–3" : "3–5"} small motion graphics on the word they show: {"at":id,"cue":"word","type":"logo|icon|underline|circle${reelStyle === "energetic" ? "|emoji" : ""}","value":"…"}. logo only for a real app/brand they name; icon one of clock, money, check, warning, growth, down, calendar, message, people, fast, target, heart, gym, brain, idea, launch, phone, email, star, no, magic, ai, mobile, video, camera, chart, safe, gift; underline/circle = the key word${reelStyle === "energetic" ? "; emoji = one emoji character" : ""}.`,
          "", "SENTENCES:", ...list.map((x) => `${x.id} ${x.text}`),
        ].join("\n").slice(0, 8000);
        const r2 = await agentExecute(token, agentId, { locationId: loc, message: ask }, `extras-${tid}-${Date.now()}`);
        const m2 = tidy(clean(String(r2.json?.finalText ?? ""))).match(/\{[\s\S]*\}/);
        const ex = m2 ? looseJson(m2[0]) : null;
        if (ex) {
          if ((!Array.isArray(plan.broll) || !plan.broll.length) && Array.isArray(ex.broll)) plan.broll = ex.broll;
          if ((!Array.isArray(plan.graphics) || !plan.graphics.length) && Array.isArray(ex.graphics)) plan.graphics = ex.graphics;
        }
      } catch (e) { console.log("extras pass failed", String(e).slice(0, 120)); }
    }

    // 4. Cuts and captions worked out exactly from the word timings (pauses over 0.45s inside a sentence are cut too)
    const cuts: { start: number; end: number; src?: number }[] = [];
    const captions: { text: string; start: number; end: number; emphasis: string[] }[] = [];
    const groups2: { words: { w: string; start: number; end: number }[]; emphasis: string[] }[] = [];
    const sentStart = new Map<number, number>();
    const sentEnd = new Map<number, number>();
    const sentWords = new Map<number, { w: string; start: number }[]>();
    let t = 0;
    let prevSid: number | null = null;
    for (const sid of keep) {
      const snt = sentences.find((x) => x.id === sid)!;
      if (prevSid !== null) sentEnd.set(prevSid, t);
      prevSid = sid;
      sentStart.set(sid, t);
      const emph: string[] = (plan?.emphasis?.[String(sid)] ?? []).map(String);
      // Fillers (um, uh, erm…) are cut out completely
      const FILLER = /^(u+m+|u+h+|e+r+m*|a+h+|hmm+)[,.!?]?$/i;
      const idx: number[] = [];
      const lw = (k: number) => normWord(words[k]?.w ?? "");
      for (let k = snt.from; k <= snt.to; k++) {
        if (FILLER.test(words[k].w)) continue;
        if (punchy) {
          // Filler phrases: "you know", "I mean", "basically", and "like," used as filler
          if ((lw(k) === "you" && lw(k + 1) === "know" && k + 1 <= snt.to && !/what|how|that|the|this|why/.test(lw(k + 2))) || (lw(k - 1) === "you" && lw(k) === "know" && k - 1 >= snt.from && idx[idx.length - 1] !== k - 1)) continue;
          if (lw(k) === "i" && lw(k + 1) === "mean" && /[,]$/.test(words[k + 1]?.w ?? "") ) { k++; continue; }
          if (lw(k) === "basically" || (lw(k) === "like" && /,$/.test(words[k].w))) continue;
        }
        idx.push(k);
      }
      if (!idx.length) continue;
      const PRE = (punchy ? 0.04 : 0.06) + Number(job.pad_extra ?? 0), POST = (punchy ? 0.06 : 0.08) + Number(job.pad_extra ?? 0);
      let segStart = Math.max(0, words[idx[0]].s - PRE), groupStart = t, group: string[] = [], groupWords: { w: string; start: number; end: number }[] = [];
      for (let q = 0; q < idx.length; q++) {
        const k = idx[q];
        const w = words[k];
        const next = q + 1 < idx.length ? words[idx[q + 1]] : undefined;
        const skipped = next ? idx[q + 1] - k > 1 : false; // a filler sat between these two words
        const pause = next ? next.s - w.e : 0;
        const segEndHere = !next || pause > (punchy ? 0.18 : 0.45) || skipped;
        group.push(w.w);
        groupWords.push({ w: w.w.replace(/[.]$/, ""), start: Number((t + (w.s - segStart)).toFixed(3)), end: Number((t + (w.e - segStart)).toFixed(3)) });
        (sentWords.get(sid) ?? sentWords.set(sid, []).get(sid)!).push({ w: w.w, start: Number((t + (w.s - segStart)).toFixed(3)) });
        const wordEndOut = t + (w.e + (segEndHere ? POST : 0) - segStart);
        if (group.length >= 4 || segEndHere || /[,.!?]$/.test(w.w)) {
          captions.push({ text: group.join(" ").replace(/[.]$/, ""), start: groupStart, end: wordEndOut, emphasis: emph });
          groups2.push({ words: groupWords, emphasis: emph });
          group = []; groupWords = []; groupStart = wordEndOut;
        }
        if (segEndHere) {
          const lastOfAll = !next && sid === keep[keep.length - 1];
          const srcDur = multi ? (durations[w.src ?? 0] || w.e + 0.1) : (duration || w.e + 0.1);
          const segEnd = Math.min(srcDur, w.e + (lastOfAll && engineV2 ? 0.8 : POST));
          cuts.push({ start: Number(segStart.toFixed(3)), end: Number(segEnd.toFixed(3)), ...(multi ? { src: w.src ?? 0 } : {}) });
          t += segEnd - segStart;
          if (next) { segStart = Math.max(0, next.s - PRE); groupStart = t; }
        }
      }
    }
    const total = t;
    if (prevSid !== null) sentEnd.set(prevSid, total);
    const overlays = (Array.isArray(plan?.overlays) ? plan.overlays : []).slice(0, 4).map((o: any) => {
      const at = sentStart.get(Number(o.at)) ?? 0;
      return { type: ["title", "callout", "stat", "list", "card"].includes(o.type) ? o.type : "callout", text: String(o.text ?? "").slice(0, 60), value: o.value ? String(o.value).slice(0, 10) : undefined, items: Array.isArray(o.items) ? o.items.map(String).slice(0, 4) : undefined, start: at + 0.2, end: Math.min(total, at + 0.2 + (Number(o.seconds) || 2.5)), position: ["top", "middle", "bottom"].includes(o.position) ? o.position : "top" };
    }).filter((o: any) => o.text || o.value);
    const zooms = (Array.isArray(plan?.zooms) ? plan.zooms : []).slice(0, 3).map((zid: any) => { const st = sentStart.get(Number(zid)); return st === undefined ? null : { start: st, end: Math.min(total, st + 2.2), scale: 1.12 }; }).filter(Boolean);
    const outroSecs = 2.5;
    const props = {
      videoUrl: job.source_url, cuts, captions, overlays, zooms,
      brand: { primary: cfg?.brand_primary || "#E0312B", accent: cfg?.brand_accent || "#FFFFFF", text: cfg?.brand_text || "#FFFFFF", logoUrl: cfg?.brand_logo_url || undefined },
      progressBar: true, captionStyle: cfg?.caption_style === "clean" ? "clean" : "bold",
      ...(cfg?.cta_keyword ? { outro: { text: `Comment ${String(cfg.cta_keyword).toUpperCase()}`, sub: `for ${String(cfg.cta_offer || "the details").slice(0, 50)}`, seconds: outroSecs } }
        : plan?.outro?.text || cfg?.outro_text ? { outro: { text: String(cfg?.outro_text || plan.outro.text).slice(0, 40), sub: String(cfg?.outro_sub || plan?.outro?.sub || "").slice(0, 60), seconds: outroSecs } } : {}),
    };

    // v2: face check, clean audio, a card per sentence, caption styles
    let composition = "ArchieReel", inputProps: any = props;
    if (engineV2) {
      // Face: through the clip (3 looks) for one clip, or one look per clip for multi-clip
      let focusTimeline: { t: number; x: number; y: number }[] | undefined;
      let focusList: { x: number; y: number }[] | undefined;
      let audioUrls: string[] | undefined;
      let focus: { x: number; y: number };
      if (multi) {
        focusList = job.focus?.list ?? await Promise.all(sources.map((u: string, n: number) => faceFocus(u, durations[n] || 4)));
        focus = focusList![0];
        audioUrls = job.clean_audio_urls ?? await Promise.all(sources.map((u: string, n: number) => cleanAudio(tid, `${id}-${n}`, u)));
        if ((audioUrls ?? []).some((u) => !u)) audioUrls = undefined; // all or nothing so levels match
      } else {
        focusTimeline = job.focus?.timeline ?? (await Promise.all([0.2, 0.5, 0.8].map(async (f) => ({ t: duration * f, ...(await faceFocus(job.source_url, duration, f)) }))));
        focus = focusTimeline![1] ?? { x: 0.5, y: 0.38 };
      }
      const audioUrl = multi ? "" : (job.clean_audio_url ?? await cleanAudio(tid, id, job.source_url));
      // v9.12.2: which clips are screen recordings (cached on the job so re-renders don't re-check)
      const looks: ClipLook[] = Array.isArray(job.focus?.screens) ? job.focus.screens
        : multi ? await Promise.all(sources.map((u: string, n: number) => clipLook(u, durations[n] || 4)))
        : [await clipLook(job.source_url, duration)];
      const screens = looks.map((l, n) => l?.kind === "screen" ? { src: n, aspect: l.aspect, bubble: l.bubble } : null).filter(Boolean) as { src: number; aspect: number; bubble: ClipLook["bubble"] }[];
      const screenSrc = new Set(screens.map((x) => x.src));
      const screenRanges: { start: number; end: number }[] = [];
      { let tt = 0; for (const c of cuts as any[]) { const len = Math.max(0, c.end - c.start); if (screenSrc.has(Number(c.src ?? 0))) { const last = screenRanges[screenRanges.length - 1]; if (last && Math.abs(last.end - tt) < 0.01) last.end = tt + len; else screenRanges.push({ start: tt, end: tt + len }); } tt += len; } }
      const onScreen = (a: number, b: number) => screenRanges.some((r) => a < r.end && b > r.start);
      const cards = (Array.isArray(plan?.cards) ? plan.cards : []).map((c: any) => {
        const st0 = sentStart.get(Number(c.at)); if (st0 === undefined) return null;
        // Land on the word it shows (the cue word), and stay up for the sentence — at least 2 seconds
        const cue = normWord(String(c.cue ?? ""));
        const hit = cue ? (sentWords.get(Number(c.at)) ?? []).find((x) => normWord(x.w) === cue) : undefined;
        const st = hit ? Math.max(st0, hit.start - 0.1) : st0 + 0.15;
        const en = Math.min(total, Math.max(st + 2.0, (sentEnd.get(Number(c.at)) ?? st + 2.5) - 0.1));
        const base = { start: Number(st.toFixed(2)), end: Number(en.toFixed(2)) };
        const ty = String(c.type);
        if (ty === "number" && Number.isFinite(Number(c.value))) return { ...base, type: "number", value: Number(c.value), prefix: c.prefix ? String(c.prefix).slice(0, 3) : undefined, suffix: c.suffix ? String(c.suffix).slice(0, 6) : undefined, label: String(c.label ?? "").slice(0, 40) };
        if ((ty === "list" || ty === "steps") && Array.isArray(c.items) && c.items.length) return { ...base, type: ty, title: c.title ? String(c.title).slice(0, 30) : undefined, items: c.items.map((x: any) => String(x).slice(0, 34)).slice(0, 4) };
        if (ty === "compare" && c.before && c.after) return { ...base, type: "compare", before: String(c.before).slice(0, 50), after: String(c.after).slice(0, 50) };
        if (["quote", "keyword", "callout", "title"].includes(ty) && c.text) return { ...base, type: ty, text: String(c.text).slice(ty === "keyword" ? 0 : 0, ty === "keyword" ? 16 : 80) };
        return null;
      }).filter(Boolean);
      // B-roll picks → timed cutaways (skip the hook and the call to action; no overlaps; no repeats)
      const used = new Set<string>();
      const firstId = keep[0], lastId = keep[keep.length - 1];
      const brollPicks: { start: number; end: number; url: string; kind: string }[] = [];
      for (const b of (Array.isArray(plan?.broll) ? plan.broll : []).slice(0, 4)) {
        const sid = Number(b.at); if (sid === firstId || sid === lastId) continue;
        const st0 = sentStart.get(sid); if (st0 === undefined) continue;
        let item: any = null;
        if (b.item) { const n = Number(String(b.item).replace(/\D/g, "")) - 1; item = (brollLib ?? [])[n] ?? null; if (item && used.has(item.id)) item = null; }
        if (!item && b.stock) {
          const stock = (await pexelsClip(String(b.stock), used)) ?? (await pixabayClip(String(b.stock), used));
          if (stock) item = { id: `pexels:${stock.id}`, kind: "video", url: stock.url, stock: true };
        }
        if (!item) continue;
        const cue = normWord(String(b.cue ?? "")); const hit = cue ? (sentWords.get(sid) ?? []).find((x) => normWord(x.w) === cue) : undefined;
        const start = Math.max(1.5, hit ? hit.start - 0.05 : st0 + 0.2);
        const end = Math.min(total - 1, start + Math.max(1.4, Math.min(3, Number(b.seconds) || 2)));
        if (end - start < 1 || brollPicks.some((x) => start < x.end + 4 && end > x.start - 4)) continue;
        let url = item.url as string | undefined;
        if (!item.stock) { const { data: full } = await supabase.from("broll_library").select("url").eq("id", item.id).maybeSingle(); url = full?.url; }
        if (!url) continue;
        used.add(item.id); brollPicks.push({ start: Number(start.toFixed(2)), end: Number(end.toFixed(2)), url, kind: item.kind === "image" ? "image" : "video" });
      }
      // Motion graphics on their cue words (not on top of a card)
      const graphicsOut: any[] = [];
      for (const g of (Array.isArray(plan?.graphics) ? plan.graphics : []).slice(0, 10)) {
        const sid = Number(g.at); const st0 = sentStart.get(sid); if (st0 === undefined) continue;
        const ty = String(g.type); if (!["logo", "icon", "underline", "circle", "emoji"].includes(ty)) continue;
        if (ty === "emoji" && reelStyle !== "energetic") continue;
        const cue = normWord(String(g.cue ?? g.value ?? "")); const hit = cue ? (sentWords.get(sid) ?? []).find((x) => normWord(x.w) === cue) : undefined;
        const start = Math.max(0.3, hit ? hit.start - 0.05 : st0 + 0.3);
        const end = Math.min(total - 0.2, start + (ty === "underline" || ty === "circle" ? 1.2 : 1.6));
        if (end - start < 0.6 || graphicsOut.some((x) => start < x.end + 0.8 && end > x.start - 0.8)) continue;
        graphicsOut.push({ start: Number(start.toFixed(2)), end: Number(end.toFixed(2)), type: ty, value: String(g.value ?? "").slice(0, 30) });
      }
      // Last resort — Archie places them itself so every reel has some
      if (!brollPicks.length && (brollLib ?? []).length) {
        const midIds = keep.slice(1, -1);
        for (const sid of midIds) {
          if (brollPicks.length >= 2) break;
          const snt = sentences.find((x) => x.id === sid); const st = sentStart.get(sid); if (!snt || st === undefined) continue;
          const words = new Set(snt.text.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
          let best: any = null, bestScore = 0;
          for (const it of brollLib ?? []) { if (used.has(it.id)) continue; const sc = String(it.description ?? "").toLowerCase().split(/\W+/).filter((w) => words.has(w)).length; if (sc > bestScore) { best = it; bestScore = sc; } }
          if (!best) best = (brollLib ?? []).find((it: any) => !used.has(it.id));
          if (!best) break;
          const start = Math.max(1.5, st + 0.3), end = Math.min(total - 1, start + 2);
          if (end - start < 1 || brollPicks.some((x) => start < x.end + 4 && end > x.start - 4)) continue;
          const { data: full } = await supabase.from("broll_library").select("url").eq("id", best.id).maybeSingle();
          if (!full?.url) continue;
          used.add(best.id); brollPicks.push({ start: Number(start.toFixed(2)), end: Number(end.toFixed(2)), url: full.url, kind: best.kind === "image" ? "image" : "video" });
        }
      }
      if (graphicsOut.length < 2) {
        const BRANDS = ["Instagram", "WhatsApp", "Stripe", "Google", "YouTube", "TikTok", "Facebook", "Claude", "Notion", "Zapier", "Shopify", "Gmail", "Calendly", "Zoom", "Spotify", "Apple", "Meta"];
        const ICON_WORDS: Record<string, string> = { time: "clock", hours: "clock", minutes: "clock", money: "money", revenue: "money", pounds: "money", clients: "people", people: "people", team: "people", ai: "ai", automation: "ai", growth: "growth", grow: "growth", fast: "fast", quick: "fast", goal: "target", goals: "target", idea: "idea", ideas: "idea", message: "message", messages: "message", calendar: "calendar", phone: "phone", email: "email", video: "video", content: "video", numbers: "chart", data: "chart", mistake: "warning", problem: "warning", gym: "gym", training: "gym" };
        for (const sid of keep.slice(1)) {
          if (graphicsOut.length >= (reelStyle === "energetic" ? 5 : 3)) break;
          const ws = sentWords.get(sid) ?? [];
          let pick: any = null;
          for (const w of ws) { const b = BRANDS.find((x) => normWord(x) === normWord(w.w)); if (b) { pick = { type: "logo", value: b, start: w.start }; break; } }
          if (!pick) for (const w of ws) { const ic = ICON_WORDS[normWord(w.w)]; if (ic) { pick = { type: "icon", value: ic, start: w.start }; break; } }
          if (!pick) continue;
          const start = Math.max(0.3, pick.start - 0.05), end = Math.min(total - 0.2, start + 1.6);
          if (graphicsOut.some((x) => start < x.end + 0.8 && end > x.start - 0.8) || brollPicks.some((x) => start < x.end && end > x.start)) continue;
          graphicsOut.push({ start: Number(start.toFixed(2)), end: Number(end.toFixed(2)), type: pick.type, value: pick.value });
        }
        // an underline on the hook's key word
        const hookWords = (sentWords.get(keep[0]) ?? []).filter((w) => w.w.replace(/\W/g, "").length > 4);
        const hw = hookWords[Math.floor(hookWords.length / 2)];
        if (hw && !graphicsOut.some((x) => x.type === "underline")) graphicsOut.push({ start: Number(Math.max(0.3, hw.start).toFixed(2)), end: Number(Math.min(total, hw.start + 1.2).toFixed(2)), type: "underline", value: hw.w });
      }
      const ownUsed = [...used].filter((x) => !x.startsWith("pexels:"));
      if (ownUsed.length) await supabase.from("broll_library").update({ last_used_at: new Date().toISOString() }).in("id", ownUsed);
      // cards don't sit on top of B-roll
      for (let ci = cards.length - 1; ci >= 0; ci--) { const c: any = cards[ci]; if (brollPicks.some((x) => c.start < x.end && c.end > x.start)) cards.splice(ci, 1); }
      for (let gi = graphicsOut.length - 1; gi >= 0; gi--) { const g = graphicsOut[gi]; if (g.type !== "underline" && g.type !== "circle" && (cards as any[]).some((c: any) => g.start < c.end && g.end > c.start)) graphicsOut.splice(gi, 1); }
      // v9.12.2: nothing covers a screen demo — no cards, B-roll, graphics or zooms on screen sections
      if (screenRanges.length) {
        for (let ci = cards.length - 1; ci >= 0; ci--) { const c: any = cards[ci]; if (onScreen(c.start, c.end)) cards.splice(ci, 1); }
        for (let bi = brollPicks.length - 1; bi >= 0; bi--) if (onScreen(brollPicks[bi].start, brollPicks[bi].end)) brollPicks.splice(bi, 1);
        for (let gi = graphicsOut.length - 1; gi >= 0; gi--) if (onScreen(graphicsOut[gi].start, graphicsOut[gi].end)) graphicsOut.splice(gi, 1);
        for (let zi = zooms.length - 1; zi >= 0; zi--) { const z: any = zooms[zi]; if (onScreen(z.start, z.end)) zooms.splice(zi, 1); }
      }

      const style = ["karaoke", "bold", "single"].includes(String(cfg?.caption_style2)) ? String(cfg?.caption_style2) : "karaoke";
      // The sound pack (pop / whoosh / tick) and a music bed that suits the style — their own track wins; "none" = no music
      const sounds = { pop: Deno.env.get("SFX_POP_URL") || cfg?.sfx_url || undefined, whoosh: Deno.env.get("SFX_WHOOSH_URL") || undefined, tick: Deno.env.get("SFX_TICK_URL") || undefined };
      const styleMusic = ({ minimal: "MUSIC_CALM_URL", studio: "MUSIC_CALM_URL", clean: "MUSIC_UPBEAT_URL", archie: "MUSIC_UPBEAT_URL", energetic: "MUSIC_ENERGETIC_URL" } as any)[reelStyle] ?? "MUSIC_UPBEAT_URL";
      const musicUrl = cfg?.music_url === "none" ? undefined : (cfg?.music_url || Deno.env.get(styleMusic) || undefined);
      inputProps = { videoUrl: job.source_url, audioUrl: audioUrl || undefined, sfxUrl: cfg?.sfx_on === false ? undefined : (cfg?.sfx_url || undefined), musicUrl, sounds: cfg?.sfx_on === false ? {} : sounds, graphics: graphicsOut, presetConfig,
        ...(multi ? { videoUrls: sources, audioUrls, focusList } : { focusTimeline }),
        cuts, captions: groups2, captionStyle: style, cards, zooms, focus, jumpZoom: punchy, preset: reelStyle,
        hookText: (() => {
          const h = String(plan?.hook_text ?? "").trim();
          if (h) return h.slice(0, 60);
          const t = String(plan?.title ?? job.title ?? "").trim();
          if (t && t.split(/\s+/).length <= 8) return t.slice(0, 60);
          const first = (sentences.find((x) => x.id === keep[0])?.text ?? "").replace(/[.!?]+$/, "").split(/\s+/).slice(0, 7).join(" ");
          return first;
        })(),
        sentenceStarts: keep.map((k: number) => sentStart.get(k)).filter((x: any) => typeof x === "number").map((x: number) => Number(x.toFixed(2))),
        points: (Array.isArray(plan?.points) ? plan.points : []).map((k: any) => sentStart.get(Number(k))).filter((x: any) => typeof x === "number").map((x: number) => Number(x.toFixed(2))),
        broll: brollPicks,
        ...(screens.length ? { screens } : {}),
        brand: props.brand, progressBar: true, ...(props as any).outro ? { outro: (props as any).outro } : {} };
      composition = "ArchieReel2";
      await supabase.from("edit_jobs").update({ focus: multi ? { ...focus, list: focusList, screens: looks } : { ...focus, timeline: focusTimeline, screens: looks }, clean_audio_url: audioUrl || null, clean_audio_urls: audioUrls ?? null, engine: "v2" }).eq("id", id);
    }

    // 5. Render on Remotion Lambda (few chunks — new AWS accounts allow ~10 at once)
    const frames = Math.max(30, Math.round(total * 30));
    const render = await renderMediaOnLambda({
      region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any,
      functionName: Deno.env.get("REMOTION_FUNCTION")!,
      serveUrl: Deno.env.get("REMOTION_SERVE_URL")!,
      composition, inputProps, codec: "h264", privacy: "no-acl", timeoutInMilliseconds: 120000,
      framesPerLambda: Math.max(90, Math.ceil(frames / 4)),
      outName: `archie-${tid.slice(0, 8)}-${id.slice(0, 8)}${job.pad_extra ? "-fix" : ""}.mp4`,
    } as any);
    await supabase.from("edit_jobs").update({
      status: "rendering", plan, props: inputProps, render_id: render.renderId, bucket: render.bucketName,
      title: job.title || String(plan?.title ?? "").slice(0, 120) || null, seconds: Math.round(total), updated_at: new Date().toISOString(),
    }).eq("id", id);
    startInBackground(watchRender(tid, id));
  } catch (e) {
    await editFail(id, `Edit failed: ${String(e).slice(0, 300)}`);
  }
}

// Check a render; when it's done, save the MP4 into their GHL media and tell them
async function editStatus(tid: string, id: string) {
  const { data: job } = await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!job) return { ok: false, error: "edit not found" };
  if (job.status === "rendering" && job.render_id) await editCheck(tid, job);
  const { data: now } = await supabase.from("edit_jobs").select("id, title, status, output_url, ghl_media_url, error, seconds, progress, caption, planner_post_id").eq("id", id).single();
  return { ok: true, job: now };
}

async function editCheck(tid: string, job: any) {
  try {
    const pr: any = await getRenderProgress({ renderId: job.render_id, bucketName: job.bucket, functionName: Deno.env.get("REMOTION_FUNCTION")!, region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any } as any);
    if (pr.fatalErrorEncountered) {
      const why = String(pr.errors?.[0]?.message ?? "unknown").slice(0, 300);
      if (!job.render_retried) {
        // One automatic retry before telling anyone
        await supabase.from("edit_jobs").update({ status: "planning", render_retried: true, render_id: null, updated_at: new Date().toISOString(), error: `retrying after: ${why.slice(0, 200)}` }).eq("id", job.id);
        await runFresh("edit_run", { tenant_id: tid, id: job.id, replan: true, use_plan: true });
        return;
      }
      return editFail(job.id, `Render failed: ${why}`);
    }
    if (!pr.done) { await supabase.from("edit_jobs").update({ progress: Math.round((pr.overallProgress ?? 0) * 100) }).eq("id", job.id); return; }
    const url = String(pr.outputFile ?? "");
    // v2: check before it goes out (no chopped words; a quick quality look) — runs once, in the background
    if (job.engine === "v2" && !job.checked_at) {
      // Only one checker may claim it (the 20-second watcher and the scheduler can both arrive here)
      const { data: claimed } = await supabase.from("edit_jobs").update({ status: "checking", checked_at: new Date().toISOString(), output_url: url, progress: 99 }).eq("id", job.id).eq("status", "rendering").select("id");
      if (!claimed?.length) return;
      await runFresh("edit_check_run", { tenant_id: tid, id: job.id, url });
      return;
    }
    // Only one delivery
    { const { data: mine } = await supabase.from("edit_jobs").update({ status: "delivering" }).eq("id", job.id).eq("status", "rendering").select("id"); if (!mine?.length) return; }
    // Into their GHL media library (by link, so nothing is downloaded here)
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
    let mediaUrl = "";
    try {
      const fd = new FormData();
      fd.append("hosted", "true"); fd.append("fileUrl", url); fd.append("name", `${job.title || "Archie reel"} (${new Date().toISOString().slice(0, 10)}).mp4`);
      const up = await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${cfg?.ghl_location_id}`, { method: "POST", headers: { Authorization: `Bearer ${cfg?.ghl_token || FALLBACK_TOKEN}`, Version: "2021-07-28" }, body: fd });
      const uj: any = await up.json().catch(() => null);
      mediaUrl = String(uj?.url ?? uj?.fileUrl ?? "");
    } catch { /* the S3 link still works */ }
    await supabase.from("edit_jobs").update({ status: "done", output_url: url, ghl_media_url: mediaUrl || null, progress: 100, updated_at: new Date().toISOString() }).eq("id", job.id);
    // One reel → a content stack (carousel, story, email, LinkedIn) — not for hook versions, week-of-content parts or the month video
    if (!job.parent_id && job.kind !== "month") startInBackground(contentStack(tid, job.id));
    const { data: m } = await supabase.from("team_members").select("ghl_contact_id").eq("tenant_id", tid).eq("handle", job.handle).maybeSingle();
    if (job.kind === "month") { await sendToTeam(tid, `🎬 Your month in 30 seconds:\n${mediaUrl || url}\n\nShare it on your story if you're proud of it 👊`, "", "month"); return; }
    if (m?.ghl_contact_id) {
      const { data: c2 } = await supabase.from("tenant_config").select("ghl_token, brief_channel").eq("tenant_id", tid).single();
      await ghl(c2?.ghl_token || FALLBACK_TOKEN, "/conversations/messages", "POST", { type: String(c2?.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS", contactId: m.ghl_contact_id, message: `📹 Your reel's ready${job.title ? `: ${job.title}` : ""} (${job.seconds ?? "?"}s)\n${mediaUrl || url}${job.cover_url ? `\n🖼️ Cover: ${job.cover_url}` : ""}${!job.parent_id && (job.plan?.hook_variants ?? []).length ? `\n🔁 Reply "hooks" for ${(job.plan.hook_variants as any[]).length} other openings (post them as Trial Reels to test which hook wins).` : ""}${(job.qa?.notes ?? []).length ? `\n\n${(job.qa.notes as string[]).join("\n")}` : ""}\n\nReply "post it" to add it to Social Planner as a draft (I'll write the caption), "write a caption" to see it first, or tell me what to change ("shorter", "different hook", "no list").` }, "2021-04-15");
    }
  } catch (e) { await supabase.from("edit_jobs").update({ error: `progress check: ${String(e).slice(0, 200)}` }).eq("id", job.id); }
}

async function editFinishPending(tid: string) {
  // Stuck reels: nothing has moved for 12 minutes → restart once, then give up with a message
  const stale = new Date(Date.now() - 12 * 60000).toISOString();
  const { data: stuck } = await supabase.from("edit_jobs").select("id, status, render_retried, transcript").eq("tenant_id", tid).in("status", ["transcribing", "planning"]).lt("updated_at", stale).limit(5);
  for (const sj of stuck ?? []) {
    if (!sj.render_retried) {
      await supabase.from("edit_jobs").update({ render_retried: true, updated_at: new Date().toISOString() }).eq("id", sj.id);
      await runFresh("edit_run", { tenant_id: tid, id: sj.id, replan: !!sj.transcript?.words?.length, use_plan: !!sj.transcript?.words?.length });
    } else await editFail(sj.id, "It stalled twice while being made.");
  }
  // A v2 check that got stuck (over 10 minutes) — deliver the reel anyway
  await supabase.from("edit_jobs").update({ status: "rendering" }).eq("tenant_id", tid).eq("status", "checking").lt("checked_at", new Date(Date.now() - 10 * 60000).toISOString());
  const { data: jobs } = await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("status", "rendering").limit(5);
  for (const j of jobs ?? []) await editCheck(tid, j);
}

// ===================== v6.6: Find ideas (native SMAI) =====================
const APIFY = "https://api.apify.com/v2";
const apifyToken = () => Deno.env.get("APIFY_API_TOKEN") ?? "";

async function ideasAccountAdd(tid: string, raw: string) {
  const gate: any = await allowance(tid, "accounts");
  if (!gate.ok) return { ok: false, error: gate.text };
  const handle = raw.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9._]{2,30}$/.test(handle)) return { ok: false, error: "That doesn't look like an Instagram handle." };
  const { error } = await supabase.from("watched_accounts").upsert({ tenant_id: tid, handle, platform: "instagram", active: true }, { onConflict: "tenant_id,handle" });
  return error ? { ok: false, error: error.message } : { ok: true, text: `Watching @${handle}.` };
}

// Start a scrape of every watched account (Apify runs in the background; ideasTick collects the results)
async function ideasFindNow(tid: string) {
  if (!apifyToken()) return { ok: false, text: "Finding ideas isn't set up yet (APIFY_API_TOKEN missing)." };
  const { data: accounts } = await supabase.from("watched_accounts").select("handle").eq("tenant_id", tid).eq("active", true).limit(12);
  const { data: cfg } = await supabase.from("tenant_config").select("instagram_handle").eq("tenant_id", tid).maybeSingle();
  const handles = [...(accounts ?? []).map((a: any) => ({ h: a.handle, own: false })), ...(cfg?.instagram_handle ? [{ h: String(cfg.instagram_handle).replace(/^@/, "").toLowerCase(), own: true }] : [])];
  if (!handles.length) return { ok: false, text: "Add some accounts to watch first (Content → Find ideas → Accounts I learn from)." };
  const since = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
  let started = 0;
  for (const { h, own } of handles) {
    const r = await fetch(`${APIFY}/acts/apify~instagram-scraper/runs?token=${apifyToken()}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directUrls: [`https://www.instagram.com/${h}/`], resultsType: "posts", resultsLimit: 40, onlyPostsNewerThan: since, addParentData: false }),
    });
    const js: any = await r.json().catch(() => null);
    if (r.ok && js?.data?.id) {
      await supabase.from("apify_runs").insert({ tenant_id: tid, handle: h, own, run_id: js.data.id, dataset_id: js.data.defaultDatasetId, status: "running" });
      started++;
    }
  }
  if (started) await supabase.from("tenant_config").update({ ideas_manual_at: new Date().toISOString(), ideas_note: null }).eq("tenant_id", tid);
  return { ok: started > 0, text: started ? `Looking at ${started} account${started === 1 ? "" : "s"} now — ideas will be ready in about 10–20 minutes.` : "Couldn't start — check the Apify key." };
}

// Every 5 minutes (from the scheduler): collect finished scrapes, score posts, and work on one outlier
async function ideasTick(tid: string) {
  if (!apifyToken()) return;
  // 1. Finished scrapes → posts with scores
  let newOutliers = 0;
  const { data: runs } = await supabase.from("apify_runs").select("*").eq("tenant_id", tid).eq("status", "running").limit(12);
  for (const run of runs ?? []) {
    const st = await fetch(`${APIFY}/actor-runs/${run.run_id}?token=${apifyToken()}`).then((r) => r.json()).catch(() => null);
    const status = String(st?.data?.status ?? "");
    if (["RUNNING", "READY"].includes(status)) continue;
    if (status !== "SUCCEEDED") { await supabase.from("apify_runs").update({ status: "failed" }).eq("id", run.id); continue; }
    const items: any[] = await fetch(`${APIFY}/datasets/${run.dataset_id}/items?token=${apifyToken()}&clean=true&limit=100`).then((r) => r.json()).catch(() => []);
    const reels = (Array.isArray(items) ? items : []).filter((x) => x?.videoUrl && Number(x?.videoPlayCount ?? x?.videoViewCount ?? 0) > 0);
    const views = reels.map((x) => Number(x.videoPlayCount ?? x.videoViewCount ?? 0)).sort((a, b) => a - b);
    const median = views.length ? views[Math.floor(views.length / 2)] : 0;
    const cutoff = Date.now() - 60 * 86400000;
    const rows = reels.map((x) => {
      const v = Number(x.videoPlayCount ?? x.videoViewCount ?? 0);
      const score = median ? Math.round((v / median) * 10) / 10 : 0;
      const recent = Date.parse(String(x.timestamp ?? "")) >= cutoff;
      const outlier = recent && views.length >= 5 && score >= (run.own ? 2 : 3);
      return {
        tenant_id: tid, handle: run.handle, source: run.own ? "own" : "watched", shortcode: String(x.shortCode ?? x.id ?? x.url),
        url: x.url, video_url: x.videoUrl, thumb_url: x.displayUrl ?? x.thumbnailUrl ?? null, caption: String(x.caption ?? "").slice(0, 2000),
        views: v, likes: Number(x.likesCount ?? 0), comments: Number(x.commentsCount ?? 0), posted_at: x.timestamp ?? null,
        score, status: outlier ? "queued" : "seen", updated_at: new Date().toISOString(),
      };
    });
    if (rows.length) {
      // Don't reset posts we've already worked on
      const { data: known } = await supabase.from("content_posts").select("shortcode, status").eq("tenant_id", tid).in("shortcode", rows.map((r) => r.shortcode));
      const done = new Map((known ?? []).map((k: any) => [k.shortcode, k.status]));
      const fresh = rows.map((r) => (done.has(r.shortcode) && done.get(r.shortcode) !== "seen" ? { ...r, status: done.get(r.shortcode) } : r));
      await supabase.from("content_posts").upsert(fresh, { onConflict: "tenant_id,shortcode" });
      newOutliers += fresh.filter((r) => r.status === "queued" && !done.has(r.shortcode)).length;
      // Fresh ideas every week: this account's top 3 recent posts (last 14 days, above their normal) not yet worked on
      if (!run.own) {
        const recentCut = Date.now() - 14 * 86400000;
        const picks = fresh
          .filter((r) => r.status === "seen" && Date.parse(String(r.posted_at ?? "")) >= recentCut && r.score >= 1.2)
          .sort((a, b) => b.score - a.score)
          .slice(0, Math.max(0, 3 - fresh.filter((r) => r.status === "queued" && Date.parse(String(r.posted_at ?? "")) >= recentCut).length));
        if (picks.length) {
          await supabase.from("content_posts").update({ status: "queued", pick: "top" }).eq("tenant_id", tid).in("shortcode", picks.map((p) => p.shortcode));
          newOutliers += picks.length;
        }
      }
    }
    await supabase.from("watched_accounts").update({ median_views: median, last_scraped_at: new Date().toISOString(), followers: Number(items?.[0]?.ownerFollowersCount ?? 0) || null }).eq("tenant_id", tid).eq("handle", run.handle);
    await supabase.from("apify_runs").update({ status: "done" }).eq("id", run.id);
  }
  if ((runs ?? []).length) {
    const { count: stillRunning } = await supabase.from("apify_runs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "running");
    if (!stillRunning) {
      const { count: q } = await supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "queued");
      const note = newOutliers ? null : q ? null : `Checked your accounts ${new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} — no new standout posts since last time. Try adding a few more accounts to learn from.`;
      await supabase.from("tenant_config").update({ ideas_note: note }).eq("tenant_id", tid);
    }
  }

  // 2. One outlier at a time: see why it worked → make it yours (best score first; 12 a week, and a "Find new ideas" tap always gets its own batch)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count: doneThisWeek } = await supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).in("status", ["ready", "to_film", "filmed", "skipped"]).gte("updated_at", weekAgo);
  const { data: ic } = await supabase.from("tenant_config").select("ideas_manual_at").eq("tenant_id", tid).maybeSingle();
  const manualRecent = ic?.ideas_manual_at && Date.now() - Date.parse(ic.ideas_manual_at) < 6 * 3600000;
  let manualDone = 0;
  if (manualRecent) {
    const { count } = await supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).in("status", ["ready", "failed"]).gte("updated_at", ic.ideas_manual_at);
    manualDone = count ?? 0;
  }
  if ((doneThisWeek ?? 0) < 24 || (manualRecent && manualDone < 12)) {
    const { data: nexts } = await supabase.from("content_posts").select("*").eq("tenant_id", tid).eq("status", "queued").order("score", { ascending: false }).limit(2);
    const claimed: any[] = [];
    for (const n of nexts ?? []) {
      const { data: got } = await supabase.from("content_posts").update({ status: "analysing" }).eq("id", n.id).eq("status", "queued").select("id");
      if (got?.length) claimed.push(n);
    }
    await Promise.all(claimed.map((n) => analyseOutlier(tid, n)));
  }
  // Tidy up: kept copies older than 60 days are removed (the post and idea stay)
  if (Math.random() < 0.02) {
    const { data: old } = await supabase.from("content_posts").select("id, ref_path, thumb_path").eq("tenant_id", tid).not("ref_path", "is", null).lt("updated_at", new Date(Date.now() - 60 * 86400000).toISOString()).limit(50);
    const paths = (old ?? []).flatMap((o: any) => [o.ref_path, o.thumb_path].filter(Boolean));
    if (paths.length) { await supabase.storage.from(CLIPS_BUCKET).remove(paths); await supabase.from("content_posts").update({ ref_path: null, thumb_path: null }).in("id", (old ?? []).map((o: any) => o.id)); }
  }

  // 3. When the week's batch is ready, one WhatsApp
  const { count: running } = await supabase.from("apify_runs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "running");
  const { count: queued } = await supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).in("status", ["queued", "analysing"]);
  if (!running && !queued) {
    const { data: ready } = await supabase.from("content_posts").select("handle, score, idea, source").eq("tenant_id", tid).eq("status", "ready").gte("updated_at", weekAgo).order("score", { ascending: false }).limit(5);
    if (ready?.length) {
      const wk = `${new Date().getUTCFullYear()}-w${Math.ceil(((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)}`;
      if (await claim(tid, "ideas_msg", wk)) {
        const lines = ready.map((r: any, i: number) => `${i + 1}. ${r.idea?.title ?? "Idea"} — from @${r.handle}${r.source === "own" ? " (one of yours)" : ""}, ${r.score}x their normal`);
        await sendToTeam(tid, `💡 ${ready.length} idea${ready.length === 1 ? "" : "s"} that are working right now:\n${lines.join("\n")}\n\nReply "film 1 and 3" to add them to your filming list, or open Content to see why each one worked.`, "", "ideas");
      }
    }
  }
}

// Gemini watches the video → plain-English breakdown; then Archie makes it yours
async function analyseOutlier(tid: string, post: any) {
  const key = Deno.env.get("GEMINI_API_KEY") ?? "";
  const debug: string[] = [];
  try {
    let breakdown: any = null;
    if (!key) debug.push("no GEMINI_API_KEY");
    else {
      const vid = await fetch(post.video_url, { headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148" } });
      if (!vid.ok) debug.push(`video download ${vid.status} (Instagram links expire — will re-scrape next week)`);
      else {
        const buf = new Uint8Array(await vid.arrayBuffer());
        const mime = vid.headers.get("content-type")?.split(";")[0] || "video/mp4";
        debug.push(`video ${Math.round(buf.length / 1024)}KB ${mime}`);
        // Keep a private copy so the original plays on the Content page (reference only — never reposted)
        try {
          const refPath = `refs/${tid}/${String(post.shortcode).replace(/[^a-zA-Z0-9_-]/g, "")}.mp4`;
          const { error: ue } = await supabase.storage.from(CLIPS_BUCKET).upload(refPath, buf, { contentType: mime, upsert: true });
          if (!ue) await supabase.from("content_posts").update({ ref_path: refPath }).eq("id", post.id);
          if (post.thumb_url) {
            const th = await fetch(post.thumb_url);
            if (th.ok) {
              const thPath = refPath.replace(/\.mp4$/, ".jpg");
              const { error: te } = await supabase.storage.from(CLIPS_BUCKET).upload(thPath, new Uint8Array(await th.arrayBuffer()), { contentType: th.headers.get("content-type") || "image/jpeg", upsert: true });
              if (!te) await supabase.from("content_posts").update({ thumb_path: thPath }).eq("id", post.id);
            }
          }
        } catch (e) { debug.push(`keeping a copy failed: ${String(e).slice(0, 60)}`); }
        const up = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${key}`, {
          method: "POST",
          headers: { "X-Goog-Upload-Command": "start, upload, finalize", "X-Goog-Upload-Header-Content-Length": String(buf.length), "X-Goog-Upload-Header-Content-Type": mime, "Content-Type": mime },
          body: buf,
        });
        const uj: any = await up.json().catch(() => null);
        const fileName = uj?.file?.name, fileUri = uj?.file?.uri;
        if (!fileName) debug.push(`gemini upload ${up.status}: ${JSON.stringify(uj).slice(0, 150)}`);
        else {
          let state = "";
          for (let i = 0; i < 30; i++) {
            const f: any = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${key}`).then((r) => r.json()).catch(() => null);
            state = String(f?.state ?? "");
            if (state === "ACTIVE" || state === "FAILED") break;
            await new Promise((ok) => setTimeout(ok, 3000));
          }
          if (state !== "ACTIVE") debug.push(`gemini file state ${state || "unknown"}`);
          const ask = [
            "Watch this short video. Explain in plain English why it did so well. Return ONLY JSON:",
            '{"hook":"what happens in the first 3 seconds, with the exact opening words if spoken","format":"e.g. talking head, screen recording, list, story","steps":["the structure in 3-6 short steps"],"why_it_worked":["3 short reasons people watched to the end"],"payoff":"what the viewer gets at the end","spoken_summary":"2-3 sentences on what was said"}',
            `Caption: ${String(post.caption ?? "").slice(0, 600)}`,
          ].join("\n");
          // Try the current Flash models in turn (Google renames them often)
          const models = [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-2.5-flash"].filter(Boolean) as string[])];
          for (const model of models) {
            const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ file_data: { mime_type: mime, file_uri: fileUri } }, { text: ask }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.4 } }),
            });
            const gj: any = await g.json().catch(() => null);
            if (!g.ok) { debug.push(`${model}: ${g.status} ${String(gj?.error?.message ?? "").slice(0, 80)}`); continue; }
            const txt = gj?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "";
            try { breakdown = JSON.parse(txt.replace(/^```(?:json)?|```$/g, "").trim()); breakdown.model = model; break; }
            catch { debug.push(`${model}: answer wasn't JSON`); }
          }
        }
      }
    }
    if (!breakdown) breakdown = { hook: String(post.caption ?? "").split("\n")[0].slice(0, 160), format: "unknown", steps: [], why_it_worked: [], payoff: "", spoken_summary: "", from: "caption only" };
    breakdown.debug = debug;

    // Make it yours — asked for as simple labelled lines (more reliable than JSON)
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
    const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
    const agentId = await agentIdFor(tid, "content", token, loc);
    let idea: any = null;
    if (!agentId) debug.push("no Archie Content agent");
    else {
      const msg = [
        post.source === "own"
          ? "Use your create-reel-script skill in \"make it yours\" mode. This is the OWNER'S OWN post and it did better than their normal — write the follow-up idea."
          : "Use your create-reel-script skill in \"make it yours\" mode. This is someone else's post that's working — write an ORIGINAL idea for this business.",
        `It got ${post.views} views — ${post.score}x that account's normal (@${post.handle}).`,
        `Why it worked: ${JSON.stringify({ hook: breakdown.hook, format: breakdown.format, steps: breakdown.steps, why_it_worked: breakdown.why_it_worked, payoff: breakdown.payoff, said: breakdown.spoken_summary }).slice(0, 2500)}`,
        "",
        await businessContext(tid),
        "",
        "Reply in EXACTLY this format, plain English, nothing else:",
        "TITLE: short name for the idea",
        "PILLAR: which of their content pillars",
        "WHY: one line — the reason the original worked, in plain words",
        "HOOK: the exact first line to say on camera",
        "SCRIPT:",
        "- line 1 to say",
        "- line 2 to say",
        "- (4 to 8 lines in total)",
        "FILMING: one line — where and how to film it",
        "CAPTION: a short caption with a call to action",
      ].join("\n");
      const res = await agentExecute(token, agentId, { locationId: loc, message: msg.slice(0, 9500) }, `ideas-${tid}-${Date.now()}`);
      const out = tidy(clean(String(res.json?.finalText ?? "")));
      if (!res.ok) debug.push(`content agent ${res.status}`);
      const grab = (label: string) => out.match(new RegExp(`^\\s*\\**${label}\\**\\s*:\\s*(.+)$`, "im"))?.[1]?.replace(/\*+/g, "").trim() ?? "";
      const scriptBlock = out.split(/^\s*\**SCRIPT\**\s*:?\s*$/im)[1]?.split(/^\s*\**(FILMING|CAPTION)\**\s*:/im)[0] ?? "";
      const script = scriptBlock.split("\n").map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim()).filter((l) => l.length > 2).slice(0, 10);
      if (grab("TITLE") && grab("HOOK")) idea = { title: grab("TITLE"), pillar: grab("PILLAR"), why: grab("WHY"), hook: grab("HOOK"), script, filming_note: grab("FILMING"), caption: grab("CAPTION") };
      else debug.push(`idea not in the expected format: ${out.slice(0, 120)}`);
    }
    await supabase.from("content_posts").update({ breakdown, idea, status: idea ? "ready" : "failed", updated_at: new Date().toISOString() }).eq("id", post.id);
  } catch (e) {
    await supabase.from("content_posts").update({ status: "failed", breakdown: { error: String(e).slice(0, 200), debug }, updated_at: new Date().toISOString() }).eq("id", post.id);
  }
}

async function ideasList(tid: string, status: string) {
  const st = ["ready", "to_film", "filmed", "skipped", "queued"].includes(status) ? status : "ready";
  const { data } = await supabase.from("content_posts").select("id, handle, source, pick, url, thumb_url, ref_path, thumb_path, views, likes, comments, score, posted_at, breakdown, idea, status").eq("tenant_id", tid).eq("status", st).order("score", { ascending: false }).limit(20);
  // Private, short-lived links to the kept copies so the originals play on the page
  const items = await Promise.all((data ?? []).map(async (x: any) => {
    let video = "", thumb = x.thumb_url ?? "";
    if (x.ref_path) { const { data: sv } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(x.ref_path, 60 * 60 * 24); video = sv?.signedUrl ?? ""; }
    if (x.thumb_path) { const { data: st2 } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(x.thumb_path, 60 * 60 * 24); thumb = st2?.signedUrl ?? thumb; }
    return { ...x, video_play_url: video, thumb_play_url: thumb };
  }));
  const { count: waiting } = await supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).in("status", ["queued", "analysing"]);
  const { count: checking } = await supabase.from("apify_runs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "running");
  const { data: lastRun } = await supabase.from("watched_accounts").select("last_scraped_at").eq("tenant_id", tid).not("last_scraped_at", "is", null).order("last_scraped_at", { ascending: false }).limit(1).maybeSingle();
  const text = items.length
    ? `${st === "to_film" ? "Your filming list" : "Ideas that are working"}:\n${items.slice(0, 8).map((x: any, i: number) => `${i + 1}. ${x.idea?.title ?? "Idea"} — @${x.handle}, ${x.score}x their normal\n   Hook: "${x.idea?.hook ?? ""}"`).join("\n")}`
    : waiting ? `Archie's still working through ${waiting} post${waiting === 1 ? "" : "s"} — ideas soon.` : st === "to_film" ? "Nothing on your filming list yet." : "No new ideas yet — say \"find me ideas\" to look now.";
  // Only "busy" if something is actually being worked on right now (not posts parked by the weekly limit)
  const { count: analysing } = await supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "analysing");
  const { data: tc } = await supabase.from("tenant_config").select("ideas_manual_at, ideas_note").eq("tenant_id", tid).maybeSingle();
  const manualRecent = tc?.ideas_manual_at && Date.now() - Date.parse(tc.ideas_manual_at) < 6 * 3600000;
  const busy = !!(checking || analysing || (waiting && manualRecent));
  const progress = checking ? `Checking ${checking} account${checking === 1 ? "" : "s"} for posts that are working…` : busy ? `Working out why ${waiting} post${waiting === 1 ? "" : "s"} did so well — one every few minutes.` : "";
  return { ok: true, items, waiting: waiting ?? 0, checking: checking ?? 0, busy, progress, note: tc?.ideas_note ?? null, last_checked: lastRun?.last_scraped_at ?? null, text };
}

async function ideaUpdate(tid: string, id: string, status: string) {
  if (!["to_film", "filmed", "skipped", "ready"].includes(status)) return { ok: false, error: "status must be to_film, filmed, skipped or ready" };
  const { error } = await supabase.from("content_posts").update({ status, updated_at: new Date().toISOString() }).eq("tenant_id", tid).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ===================== v6.7: your control panel =====================
async function agencyOverview(agencyTid: string) {
  const { data: me } = await supabase.from("tenant_config").select("is_agency").eq("tenant_id", agencyTid).maybeSingle();
  if (!me?.is_agency) return { ok: false, error: "Only the agency account can see this." };
  const { data: ts } = await supabase.from("tenants").select("id, business_name, status, created_at").in("status", ["active", "paused"]).order("business_name");
  const month = new Date().toISOString().slice(0, 7);
  const rows = await Promise.all((ts ?? []).map(async (t: any) => {
    const [{ data: last }, { data: brief }, u, { data: mh }, { count: fails }, { data: cfg }] = await Promise.all([
      supabase.from("agency_checks").select("status, problems, checked_at").eq("tenant_id", t.id).maybeSingle(),
      supabase.from("briefs").select("brief_date").eq("tenant_id", t.id).order("brief_date", { ascending: false }).limit(1).maybeSingle(),
      usage(t.id, month) as Promise<any>,
      supabase.from("member_health").select("status").eq("tenant_id", t.id),
      supabase.from("agent_runs").select("id", { count: "exact", head: true }).eq("tenant_id", t.id).eq("status", "failed").gte("finished_at", new Date(Date.now() - 24 * 3600000).toISOString()),
      supabase.from("tenant_config").select("schedules_on, is_agency").eq("tenant_id", t.id).maybeSingle(),
    ]);
    return {
      tenant_id: t.id, business: t.business_name, since: String(t.created_at ?? "").slice(0, 10), agency: !!cfg?.is_agency,
      status: last?.status ?? "unknown", problems: last?.problems ?? [], checked_at: last?.checked_at ?? null,
      last_brief: brief?.brief_date ?? null, schedules_on: !!cfg?.schedules_on,
      runs_month: u.runs, cost_month_gbp: u.est_cost_gbp, projected_gbp: u.projected_month_gbp,
      clients_red: (mh ?? []).filter((m: any) => m.status === "red").length, clients_yellow: (mh ?? []).filter((m: any) => m.status === "yellow").length,
      failed_24h: fails ?? 0,
      ...(await quietInfo(t.id)),
      ...(await activationInfo(t.id)),
      plan: String((await supabase.from("tenant_config").select("plan").eq("tenant_id", t.id).maybeSingle()).data?.plan ?? "archie"),
      ...(await costInfo(t.id)),
    };
  }));
  const total = rows.reduce((a, r) => a + (r.cost_month_gbp || 0), 0);
  return { ok: true, month, tenants: rows, totals: { clients: rows.filter((r) => !r.agency).length, red: rows.filter((r) => r.status === "red").length, amber: rows.filter((r) => r.status === "amber").length, cost_month_gbp: Math.round(total * 100) / 100 } };
}

// Every 3 hours: check every client; WhatsApp the agency owner when a client turns red (once a day per client)
async function agencySweep(agencyTid: string) {
  const { data: ts } = await supabase.from("tenants").select("id, business_name").eq("status", "active");
  const alerts: string[] = [];
  const quiet: string[] = [];
  for (const t of ts ?? []) {
    try {
      const r: any = await checkup(t.id);
      const prev = await supabase.from("agency_checks").select("status").eq("tenant_id", t.id).maybeSingle();
      await supabase.from("agency_checks").upsert({ tenant_id: t.id, status: r.status, problems: r.problems ?? [], text: String(r.text ?? "").slice(0, 4000), checked_at: new Date().toISOString() }, { onConflict: "tenant_id" });
      // A new client gone quiet (first 30 days, no message to Archie for 2+ days)
      const q = await quietInfo(t.id);
      if (q.in_first_30 && q.quiet_days !== null && q.quiet_days >= 2 && (await claim(agencyTid, `quiet:${t.id}`, new Date().toISOString().slice(0, 10)))) {
        quiet.push(`🤫 ${t.business_name}: hasn't talked to Archie for ${q.quiet_days} days (day ${q.onboarding_day} of onboarding) — worth a nudge.`);
      } else if (!q.in_first_30 && q.quiet_days !== null && q.quiet_days >= 4 && t.id !== agencyTid) {
        // Everyone else: 4+ quiet days is an early churn sign — once a week per client
        const wk = `${new Date().getUTCFullYear()}-w${Math.ceil(((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)}`;
        if (await claim(agencyTid, `quiet-any:${t.id}`, wk)) quiet.push(`🤫 ${t.business_name}: quiet for ${q.quiet_days} days — check in with something useful.`);
      }
      // Cost alert: projected spend vs budget — once per level per month
      if (t.id !== agencyTid) {
        const ci = await costInfo(t.id);
        if (ci.cost_level !== "green" && (await claim(agencyTid, `cost-${ci.cost_level}:${t.id}`, new Date().toISOString().slice(0, 7)))) {
          quiet.push(`${ci.cost_level === "red" ? "🔴" : "🟠"} ${t.business_name}: on track to cost £${ci.cost_projected_gbp} this month (${ci.cost_pct}% of the £${ci.cost_budget_gbp} budget). Biggest: ${ci.cost_top}.`);
        }
      }
      if (r.status === "red" && (await claim(agencyTid, `alert:${t.id}`, new Date().toISOString().slice(0, 10)))) {
        alerts.push(`🔴 ${t.business_name}: ${(r.problems ?? []).slice(0, 3).join(" · ")}${prev.data?.status && prev.data.status !== "red" ? " (was " + prev.data.status + ")" : ""}`);
      }
    } catch (e) { alerts.push(`⚠️ ${t.business_name}: checkup couldn't run (${String(e).slice(0, 60)})`); }
  }
  if (alerts.length) await sendToTeam(agencyTid, `Archie client check:\n${alerts.join("\n")}\n\nOpen the control panel for details.`, "", "agency");
  if (quiet.length) { const m = `New clients gone quiet:\n${quiet.join("\n")}`; await sendToTeam(agencyTid, m, m, "agency"); }
}

// ===================== v6.7.1: post the latest reel to Social Planner =====================
async function latestReel(tid: string) {
  const { data: job } = await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("status", "done").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return job;
}

// Write (or rewrite) the caption for a reel, in the owner's voice, from what they actually said
async function reelCaption(tid: string, p: any) {
  const job = p.id ? (await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("id", String(p.id)).maybeSingle()).data : await latestReel(tid);
  if (!job) return { ok: false, text: "I don't have a finished reel yet — send me a video with \"edit\" first." };
  // Their own words: use as-is
  if (String(p.own ?? "").trim()) {
    const own = String(p.own).trim().slice(0, 2200);
    await supabase.from("edit_jobs").update({ caption: own }).eq("id", job.id);
    return { ok: true, id: job.id, caption: own, text: `Caption saved:\n\n${own}\n\nSay "post it" when you're ready.` };
  }
  const { data: cf } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id, cta_keyword, cta_offer").eq("tenant_id", tid).single();
  const token = cf?.ghl_token || FALLBACK_TOKEN;
  const agentId = await agentIdFor(tid, "content", token, cf?.ghl_location_id);
  const said = (job.transcript?.words ?? []).map((w: any) => w.w).join(" ").slice(0, 2500);
  if (!agentId || !said) return { ok: false, text: "I couldn't write a caption for that one — send me your own with \"caption: …\"." };
  const change = String(p.change ?? "").trim();
  const msg = [
    "Use your caption skill to write the caption for this reel.",
    cf?.cta_keyword ? `End with this call to action, word for word: "💬 Comment ${String(cf.cta_keyword).toUpperCase()} and I'll send you ${cf.cta_offer || "the details"}."` : "",
    job.caption && change ? `THE CURRENT CAPTION:\n${job.caption}\n\nCHANGE IT LIKE THIS: ${change}` : change ? `Also: ${change}` : "",
    "Only the caption.",
    "",
    `WHAT THEY SAID IN THE REEL:\n${said}`,
    "",
    await businessContext(tid),
  ].filter(Boolean).join("\n");
  const res = await agentExecute(token, agentId, { locationId: cf?.ghl_location_id, message: msg }, `caption-${tid}-${Date.now()}`);
  const caption = tidy(clean(String(res.json?.finalText ?? ""))).replace(/^caption:\s*/i, "").trim().slice(0, 2200);
  if (!caption) return { ok: false, text: "The caption didn't come back — try again in a minute." };
  await supabase.from("edit_jobs").update({ caption }).eq("id", job.id);
  return { ok: true, id: job.id, caption, text: `Here's the caption:\n\n${caption}\n\nSay "post it" to add the reel to Social Planner with this, "make it shorter" (or any change), or send your own with "caption: …".` };
}

async function reelToPlanner(tid: string, id?: string, opts: { draft?: boolean } = {}) {
  const job = id ? (await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle()).data : await latestReel(tid);
  if (!job) return { ok: false, text: "I don't have a finished reel yet — send me a video with \"edit\" first." };
  if (job.planner_post_id) return { ok: true, text: `That reel's already in Social Planner as a draft${job.title ? ` (${job.title})` : ""}. Open Social Planner to pick the time and post it.` };
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token").eq("tenant_id", tid).single();
  const c = { tid, ghlToken: cfg?.ghl_token || FALLBACK_TOKEN };
  let caption = String(job.caption ?? "").trim();
  if (!caption) { const cap: any = await reelCaption(tid, { id: job.id }); caption = cap.ok ? cap.caption : ""; }
  // Post at their best time (from their own Instagram), unless they asked for a draft
  const { data: pm } = await supabase.from("tenant_config").select("post_mode").eq("tenant_id", tid).maybeSingle();
  const when = opts.draft || pm?.post_mode === "draft" ? null : await bestPostTime(tid);
  let r: any = await toPlanner(c, { type: "reel", text: caption || job.title || "", media_url: job.ghl_media_url || job.output_url, media_type: "video/mp4", schedule_at: when?.iso });
  if (!r.ok && when) r = await toPlanner(c, { type: "reel", text: caption || job.title || "", media_url: job.ghl_media_url || job.output_url, media_type: "video/mp4" });
  if (!r.ok) return { ok: false, text: `I couldn't add it to Social Planner: ${r.error}` };
  await supabase.from("edit_jobs").update({ planner_post_id: r.post_id ?? "added", scheduled_for: when && r.ok ? when.iso : null }).eq("id", job.id);
  return { ok: true, text: when ? `✅ Scheduled for ${when.label}${r.accounts?.length ? ` on ${r.accounts.join(", ")}` : ""} — ${when.why}.${caption ? `\n\nCaption:\n${caption}` : ""}\n\nWant a different time? Change it in Social Planner, or say "post it as a draft" next time.` : `✅ Added to Social Planner as a draft${r.accounts?.length ? ` for ${r.accounts.join(", ")}` : ""}.${caption ? `\n\nCaption:\n${caption}` : ""}\n\nOpen Social Planner to check it, pick a time and schedule it.` };
}

// ===================== v6.8: Instagram insights (Meta app) =====================
const IG_G = "https://graph.facebook.com/v21.0";

async function igConnectUrl(tid: string) {
  const appId = Deno.env.get("META_APP_ID"), config = Deno.env.get("META_LOGIN_CONFIG_ID");
  if (!appId || !config) return { ok: false, error: "Instagram connect isn't set up yet (META_APP_ID / META_LOGIN_CONFIG_ID)." };
  const state = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  await supabase.from("oauth_states").insert({ state, tenant_id: tid, provider: "meta" });
  const redirect = encodeURIComponent(`${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-connect`);
  return { ok: true, url: `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirect}&config_id=${config}&response_type=code&state=${state}` };
}

function igType(m: any): "REEL" | "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM" | "OTHER" {
  if (m.media_product_type === "REELS") return "REEL";
  return ["VIDEO", "IMAGE", "CAROUSEL_ALBUM"].includes(m.media_type) ? m.media_type : "OTHER";
}

async function igSync(tid: string) {
  const { data: con } = await supabase.from("ig_connections").select("*").eq("tenant_id", tid).maybeSingle();
  if (!con) return { ok: false, text: "Instagram isn't connected — Settings → Content → Connect Instagram." };
  const tok = encodeURIComponent(con.page_token);
  const mr = await fetch(`${IG_G}/${con.ig_user_id}/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${tok}`);
  const mj: any = await mr.json().catch(() => null);
  if (!mr.ok) {
    const msg = String(mj?.error?.message ?? mr.status);
    await supabase.from("ig_connections").update({ last_error: msg.slice(0, 300) }).eq("tenant_id", tid);
    return { ok: false, text: `Instagram sync failed: ${msg.slice(0, 160)}${/expired|session|OAuth/i.test(msg) ? " — reconnect Instagram in Settings." : ""}` };
  }
  const media: any[] = mj?.data ?? [];
  const rows: any[] = [];
  for (let i = 0; i < media.length; i += 8) {
    const batch = media.slice(i, i + 8);
    const got = await Promise.all(batch.map(async (m) => {
      const t = igType(m);
      const metrics = t === "REEL" ? "reach,likes,comments,saved,shares,views,total_interactions,ig_reels_avg_watch_time"
        : t === "VIDEO" ? "reach,likes,comments,saved,shares,views,total_interactions"
        : "reach,likes,comments,saved,shares,total_interactions";
      const ir = await fetch(`${IG_G}/${m.id}/insights?metric=${metrics}&access_token=${tok}`);
      const ij: any = await ir.json().catch(() => null);
      const v: Record<string, number> = {};
      for (const it of ij?.data ?? []) v[it.name] = Number(it.values?.[0]?.value ?? it.total_value?.value ?? 0);
      return {
        tenant_id: tid, media_id: m.id, kind: t, caption: String(m.caption ?? "").slice(0, 2200), permalink: m.permalink, media_url: m.media_url ?? null,
        thumb_url: m.thumbnail_url ?? m.media_url ?? null, posted_at: m.timestamp,
        reach: v.reach ?? null, views: v.views ?? null, likes: v.likes ?? m.like_count ?? null, comments: v.comments ?? m.comments_count ?? null,
        saves: v.saved ?? null, shares: v.shares ?? null, interactions: v.total_interactions ?? null,
        avg_watch_ms: v.ig_reels_avg_watch_time ?? null, insights_ok: ir.ok, synced_at: new Date().toISOString(),
      };
    }));
    rows.push(...got);
  }
  if (rows.length) await supabase.from("ig_posts").upsert(rows, { onConflict: "tenant_id,media_id" });
  // Followers today
  const ar: any = await fetch(`${IG_G}/${con.ig_user_id}?fields=followers_count,media_count&access_token=${tok}`).then((r) => r.json()).catch(() => null);
  if (ar?.followers_count !== undefined) {
    await supabase.from("ig_daily").upsert({ tenant_id: tid, day: new Date().toISOString().slice(0, 10), followers: ar.followers_count }, { onConflict: "tenant_id,day" });
  }
  await supabase.from("ig_connections").update({ last_sync_at: new Date().toISOString(), last_error: null, followers: ar?.followers_count ?? con.followers }).eq("tenant_id", tid);

  // Your winners (reels doing 2x+ your normal reach in the last 30 days) → "why it worked" + a follow-up idea
  try {
    const reels = rows.filter((r) => (r.kind === "REEL" || r.kind === "VIDEO") && r.reach);
    const med = median(reels.map((r) => r.reach));
    const cut = Date.now() - 30 * 86400000;
    const winners = reels.filter((r) => med && r.reach / med >= 2 && Date.parse(r.posted_at) >= cut && r.media_url);
    for (const w of winners.slice(0, 3)) {
      await supabase.from("content_posts").upsert({
        tenant_id: tid, handle: con.ig_username, source: "own", pick: "own_winner", shortcode: `ig_${w.media_id}`, url: w.permalink,
        video_url: w.media_url, thumb_url: w.thumb_url, caption: w.caption, views: w.views ?? w.reach, likes: w.likes, comments: w.comments,
        posted_at: w.posted_at, score: Math.round((w.reach / med) * 10) / 10, status: "queued", updated_at: new Date().toISOString(),
      }, { onConflict: "tenant_id,shortcode", ignoreDuplicates: true });
    }
  } catch { /* winners are a bonus */ }
  return { ok: true, synced: rows.length, text: `Instagram refreshed — ${rows.length} posts, ${ar?.followers_count ?? "?"} followers.` };
}

function median(xs: number[]) { const a = xs.filter((x) => Number.isFinite(x) && x > 0).sort((p, q) => p - q); return a.length ? a[Math.floor(a.length / 2)] : 0; }

async function igResults(tid: string, days = 60) {
  const { data: con } = await supabase.from("ig_connections").select("ig_username, last_sync_at, followers").eq("tenant_id", tid).maybeSingle();
  if (!con) return { ok: false, connected: false, text: "Instagram isn't connected yet — Settings → Content → Connect Instagram." };
  const since = new Date(Date.now() - Math.max(7, Math.min(365, days)) * 86400000).toISOString();
  const { data: posts } = await supabase.from("ig_posts").select("*").eq("tenant_id", tid).gte("posted_at", since).order("posted_at", { ascending: false }).limit(100);
  const list = posts ?? [];
  const { data: all } = await supabase.from("ig_posts").select("kind, reach, saves, shares").eq("tenant_id", tid).order("posted_at", { ascending: false }).limit(60);
  const normal = { reach: median((all ?? []).map((p: any) => p.reach)), saves: median((all ?? []).map((p: any) => p.saves)), shares: median((all ?? []).map((p: any) => p.shares)) };
  const scored = list.map((p: any) => ({
    ...p, vs_normal: normal.reach && p.reach ? Math.round((p.reach / normal.reach) * 10) / 10 : null,
    watch_seconds: p.avg_watch_ms ? Math.round(p.avg_watch_ms / 100) / 10 : null,
  }));
  const best = [...scored].filter((p) => p.vs_normal).sort((a, b) => (b.vs_normal ?? 0) - (a.vs_normal ?? 0)).slice(0, 3);
  const { data: fol } = await supabase.from("ig_daily").select("day, followers").eq("tenant_id", tid).gte("day", since.slice(0, 10)).order("day");
  const fFirst = fol?.[0]?.followers, fLast = fol?.[fol.length - 1]?.followers;
  const growth = fFirst !== undefined && fLast !== undefined ? fLast - fFirst : null;
  const byKind = ["REEL", "CAROUSEL_ALBUM", "IMAGE"].map((k) => { const xs = scored.filter((p) => p.kind === k); return { kind: k, posts: xs.length, avg_reach: xs.length ? Math.round(xs.reduce((a, p) => a + (p.reach ?? 0), 0) / xs.length) : 0 }; }).filter((k) => k.posts);
  const label = (k: string) => k === "REEL" ? "reels" : k === "CAROUSEL_ALBUM" ? "carousels" : "photos";
  const text = !scored.length ? `No posts in the last ${days} days on @${con.ig_username} yet.` : [
    `@${con.ig_username}, last ${days} days: ${scored.length} posts${growth !== null ? ` · followers ${growth >= 0 ? "+" : ""}${growth} (now ${fLast})` : con.followers ? ` · ${con.followers} followers` : ""}.`,
    `Your normal: ~${normal.reach} reach, ${normal.saves} saves, ${normal.shares} shares a post.`,
    best.length ? `Best:\n${best.map((b, i) => `${i + 1}. "${String(b.caption ?? "").split("\n")[0].slice(0, 60)}" — ${b.vs_normal}x your normal reach (${b.reach} reach, ${b.saves ?? 0} saves, ${b.shares ?? 0} shares)`).join("\n")}` : "",
    byKind.length > 1 ? `By type: ${byKind.map((k) => `${label(k.kind)} ~${k.avg_reach} reach (${k.posts})`).join(" · ")}.` : "",
    `(From Instagram insights, synced ${con.last_sync_at ? String(con.last_sync_at).slice(0, 16).replace("T", " ") : "not yet"}.)`,
  ].filter(Boolean).join("\n");
  return { ok: true, connected: true, username: con.ig_username, last_sync_at: con.last_sync_at, normal, followers_now: fLast ?? con.followers, followers_change: growth, by_kind: byKind, best, posts: scored, text };
}

// ===================== v6.9: onboarding coach =====================
type Tip = { key: string; title: string; text: string; try: string; used?: (tid: string, since: string) => Promise<boolean> };
const usedJob = (job: string) => async (tid: string, since: string) => { const { count } = await supabase.from("agent_usage").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("job", job).gte("created_at", since); return (count ?? 0) > 0; };
const usedRows = (table: string, extra?: (q: any) => any) => async (tid: string, since: string) => { let q = supabase.from(table).select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", since); if (extra) q = extra(q); const { count } = await q; return (count ?? 0) > 0; };
const COACH_TIPS: Tip[] = [
  // The 14-day path to first wins — one thing a day, skipped if they've already done it
  { key: "reply_brief", title: "Reply to your brief", text: "Every morning Archie plans your day. Reply \"go\" to lock it in — or say what you'd change, voice notes are fine.", try: "Reply \"go\" to tomorrow's brief",
    used: async (tid, since) => { const { count } = await supabase.from("talk_messages").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("role", "user").gte("created_at", since); return (count ?? 0) >= 3; } },
  { key: "first_send", title: "Send your first drafted message", text: "Archie's already written follow-ups for you. Check one, send it — that's a conversation restarted in 10 seconds.", try: "\"What's waiting?\" then \"send 1\"",
    used: async (tid, since) => { const { count } = await supabase.from("message_drafts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "sent").gte("sent_at", since); return (count ?? 0) > 0; } },
  { key: "screenshot", title: "Send Archie a screenshot", text: "A DM, a booking request, a message from a client — screenshot it and send it here. Archie adds the lead or task and drafts your reply.", try: "Send any screenshot, no words needed",
    used: async (tid, since) => { const { count } = await supabase.from("feature_events").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("feature", "screenshot").gte("created_at", since); return (count ?? 0) > 0; } },
  { key: "money", title: "Get paid what you're owed", text: "Archie keeps an eye on payments that didn't go through. One reply and the chases go out.", try: "\"Chase my overdue payments\"" },
  { key: "first_reel", title: "Make a reel in 10 minutes", text: "Tap 🎬 Make a reel. Archie writes the script, the teleprompter shows you each line, and you get back a finished, captioned reel.", try: "\"Make a reel\" (or tap 🎬 in the app)", used: usedRows("edit_jobs") },
  { key: "post", title: "Post it at your best time", text: "When a reel's ready, just say \"post it\" — Archie writes the caption and schedules it for when your audience is most active.", try: "\"Post it\"", used: async (tid, since) => { const { count } = await supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).not("planner_post_id", "is", null).gte("created_at", since); return (count ?? 0) > 0; } },
  { key: "sunday", title: "Your week in one message", text: "Tonight you'll get your week: money, clients and content in one message. Two minutes, and you know exactly where you stand.", try: "Read Sunday's message, reply \"go\"" },
  { key: "risk", title: "Keep a client from drifting", text: "Archie scores every client green, yellow or red. The yellows are the ones to catch now — the check-in is already written.", try: "\"Check in with the yellows\"" },
  { key: "council", title: "Get a second opinion", text: "Stuck on a decision — prices, hiring, a new offer? Ask it straight. Archie asks a question or two, then gives you a clear call with your real numbers.", try: "\"Should I raise my prices?\"", used: usedJob("council") },
  { key: "delegate", title: "Hand something off", text: "Anything on your list can go to your team in one line. Archie sends it with the details and tracks it.", try: "\"Give the invoices task to Sara\"" },
  { key: "dump", title: "Empty your head", text: "After a call or at the end of the day, just ramble in a voice note. Archie turns it into tasks, notes and reminders.", try: "Send a long voice note", used: usedRows("dumps") },
  { key: "multi", title: "Film it in scenes", text: "Film one line per clip, in different spots. Send them all and say \"edit these\" — Archie makes one reel with a new scene every line.", try: "Send 3–5 clips, then \"edit these\"" },
  { key: "prep", title: "Walk into calls prepared", text: "30 minutes before every booked call, Archie sends you who they are, what they said and what to ask. Nothing to do — just read it.", try: "Check the prep before your next call", used: usedJob("prep") },
  { key: "receipt", title: "See what Archie's done", text: "Two weeks in. Ask Archie what it's done for you — time saved, money chased, content made.", try: "\"What did Archie do for me this month?\"" },
  // weekly after day 14
  { key: "data", title: "Ask your numbers anything", text: "Any question about your clients, money or leads — answered from your real data.", try: "\"Who are my top 10 clients this year?\"", used: usedJob("data") },
  { key: "review", title: "Your first month", text: "You're a month in. Tell Archie what's been useful and what's noise — it adjusts.", try: "\"What have I used you for most this month?\"" },
];

async function quietInfo(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("onboarding_started_at").eq("tenant_id", tid).maybeSingle();
  const start = cfg?.onboarding_started_at ? Date.parse(cfg.onboarding_started_at) : null;
  const day = start ? Math.floor((Date.now() - start) / 86400000) + 1 : null;
  const { data: last } = await supabase.from("talk_messages").select("created_at").eq("tenant_id", tid).eq("role", "user").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const quiet = last?.created_at ? Math.floor((Date.now() - Date.parse(last.created_at)) / 86400000) : (day ?? null);
  return { onboarding_day: day, in_first_30: day !== null && day <= 30, last_talked_at: last?.created_at ?? null, quiet_days: quiet };
}

async function coachRun(tid: string, _p: any) {
  const { data: cfg } = await supabase.from("tenant_config").select("coach_on, onboarding_started_at, coach_sent").eq("tenant_id", tid).maybeSingle();
  if (!cfg?.coach_on || !cfg.onboarding_started_at) return { ok: true, skipped: "coach off" };
  const day = Math.floor((Date.now() - Date.parse(cfg.onboarding_started_at)) / 86400000) + 1;
  if (day < 1 || day > 30) {
    if (day > 30) await supabase.from("tenant_config").update({ coach_on: false }).eq("tenant_id", tid);
    return { ok: true, skipped: `day ${day}` };
  }
  // Daily for 14 days, then days 21 and 28
  if (day > 14 && ![21, 28].includes(day)) return { ok: true, skipped: `day ${day} (weekly after day 14)` };
  const sent: string[] = Array.isArray(cfg.coach_sent) ? cfg.coach_sent : [];
  const pool = day <= 14 ? COACH_TIPS.slice(0, 14) : COACH_TIPS.slice(14);
  let tip: Tip | null = null;
  for (const t of pool) {
    if (sent.includes(t.key)) continue;
    if (t.used && (await t.used(tid, cfg.onboarding_started_at))) { sent.push(t.key); continue; } // already using it — skip
    tip = t; break;
  }
  if (!tip) { await supabase.from("tenant_config").update({ coach_sent: sent }).eq("tenant_id", tid); return { ok: true, skipped: "nothing new to suggest" }; }
  const n = sent.length + 1;
  await sendToTeam(tid, `💡 Archie tip${day <= 14 ? ` (${Math.min(n, 14)} of 14)` : ""}: ${tip.title}\n${tip.text}\n\nTry it now: ${tip.try}`, "", "coach");
  sent.push(tip.key);
  await supabase.from("tenant_config").update({ coach_sent: sent }).eq("tenant_id", tid);
  return { ok: true, sent: tip.key, day };
}

async function coachStatus(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("coach_on, onboarding_started_at, coach_sent").eq("tenant_id", tid).maybeSingle();
  const q = await quietInfo(tid);
  return { ok: true, coach_on: !!cfg?.coach_on, started: cfg?.onboarding_started_at ?? null, day: q.onboarding_day, sent: cfg?.coach_sent ?? [], quiet_days: q.quiet_days, tips: COACH_TIPS.map((t) => ({ key: t.key, title: t.title })) };
}

// ===================== v7.0: auto call prep =====================
async function autoPrep(tid: string, cfg: any) {
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const tz = cfg?.timezone || "Europe/London";
  const { data: owner } = await supabase.from("team_members").select("ghl_user_id, personal_calendar_id").eq("tenant_id", tid).eq("gets_financials", true).limit(1).maybeSingle();
  const userId = owner?.ghl_user_id || cfg?.ghl_user_id;
  if (!userId) return;
  const from = Date.now() + 20 * 60000, to = Date.now() + 45 * 60000;
  const ev = await ghl(token, `/calendars/events?locationId=${loc}&userId=${userId}&startTime=${from}&endTime=${to}`, "GET", undefined, "2021-04-15");
  const only: string[] = Array.isArray(cfg?.prep_calendars) ? cfg.prep_calendars : [];
  const events: any[] = (ev.json?.events ?? []).filter((e: any) =>
    !e.isBlockSlot && e.contactId && e.calendarId !== owner?.personal_calendar_id &&
    !["cancelled", "invalid"].includes(String(e.appointmentStatus ?? "").toLowerCase()) &&
    (!only.length || only.includes(e.calendarId)) &&
    Date.parse(e.startTime) >= from && Date.parse(e.startTime) <= to);
  for (const e of events.slice(0, 3)) {
    if (!(await claim(tid, `prep:${e.id}`, String(e.startTime).slice(0, 10)))) continue;
    const at = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(e.startTime));
    const r: any = await callPrep(tid, { contact_id: e.contactId, event_title: String(e.title ?? ""), event_time: at });
    if (r.ok) await sendToTeam(tid, `📋 Your ${at} call — ready when you are:\n\n${r.text}`, "", "prep");
  }
}

// ===================== v7.1: Forge auto-scheduling =====================
type Slot = { start: number; end: number; g?: boolean };
const TIER_RANK: Record<string, number> = { must: 0, high: 1, bonus: 2 };

function hm(v: unknown, fb: string) { const m = String(v ?? fb).match(/^(\d{1,2}):(\d{2})/); return m ? `${m[1].padStart(2, "0")}:${m[2]}` : fb; }

// v9.10: how long will this take, and does it need focus? (one quick, cheap call; falls back to 30 min)
async function taskEstimate(tid: string, title: string, notes = "", areaOnly = false): Promise<{ minutes: number; kind: string; area: string; client_id: string | null; why?: string }> {
  // Which client is it for? A client's full name (or a unique first name) in the title or notes
  let client_id: string | null = null;
  try {
    const { data: cl } = await supabase.from("clients").select("id, name").eq("tenant_id", tid).eq("status", "active").limit(400);
    const hay = ` ${title} ${notes} `.toLowerCase();
    const full = (cl ?? []).filter((c: any) => c.name && hay.includes(String(c.name).toLowerCase()));
    if (full.length === 1) client_id = full[0].id;
    else if (!full.length) {
      const firsts = (cl ?? []).filter((c: any) => { const f = String(c.name ?? "").split(/\s+/)[0].toLowerCase(); return f.length > 2 && new RegExp(`\\b${f.replace(/[^a-z]/g, "")}\\b`).test(hay); });
      if (firsts.length === 1) client_id = firsts[0].id;
    }
  } catch { /* no client link */ }
  try {
    const { data: past } = areaOnly ? { data: [] } : await supabase.from("tasks").select("title, effort_minutes").eq("tenant_id", tid).eq("status", "done").order("updated_at", { ascending: false }).limit(25);
    const r = await openai("chat/completions", { model: "gpt-4.1-mini", response_format: { type: "json_object" }, messages: [
      { role: "system", content: 'Size up one task for a small-business owner. minutes: realistic, not optimistic (include setup and checking), rounded to 15, between 15 and 240. kind: "deep" = needs uninterrupted focus (building, writing, strategy, filming, editing); "shallow" = quick admin, messages, calls, small fixes. area: "growth" = brings in NEW revenue (content, marketing, sales calls, outreach, offers, funnels, building something to sell); "clients" = delivering for existing paying clients (their builds, fixes, support, check-ins, onboarding); "admin" = running the business (finance, invoices, tools, tidying, personal). Return ONLY JSON {"minutes":n,"kind":"deep|shallow","area":"growth|clients|admin","why":"a few words"}.' },
      { role: "user", content: `Task: ${title.slice(0, 300)}${notes ? `\nDetail: ${notes.slice(0, 800)}` : ""}${client_id ? "\n(This is for an existing client.)" : ""}${(past ?? []).length ? `\nTheir recent tasks for reference:\n${(past ?? []).map((x: any) => `- ${x.title} (${x.effort_minutes ?? 30} min)`).join("\n")}` : ""}` }] });
    const jn: any = await r.json().catch(() => null);
    const o = looseJson(String(jn?.choices?.[0]?.message?.content ?? "")) ?? {};
    const minutes = Math.max(15, Math.min(240, Math.round((Number(o.minutes) || 30) / 15) * 15));
    const area = ["growth", "clients", "admin"].includes(o.area) ? o.area : (client_id ? "clients" : "admin");
    return { minutes, kind: o.kind === "deep" ? "deep" : "shallow", area: client_id && area === "admin" ? "clients" : area, client_id, why: String(o.why ?? "").slice(0, 80) };
  } catch { return { minutes: 30, kind: "shallow", area: client_id ? "clients" : "admin", client_id }; }
}

// v9.11: where the hours went this week — growth vs clients vs admin (done + still planned this week)
async function weekSplit(tid: string, handle: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const dow = new Date(today + "T12:00:00Z").getUTCDay() || 7;
  const monday = addDays(today, 1 - dow);
  const since = isoAtTz(monday, "00:00", tz), until = isoAtTz(addDays(monday, 7), "00:00", tz);
  const own = (q: any) => handle ? q.eq("owner", handle) : q;
  const { data: done } = await own(supabase.from("tasks").select("effort_minutes, area").eq("tenant_id", tid).eq("status", "done").gte("updated_at", since).lt("updated_at", until)).limit(500);
  const { data: planned } = await own(supabase.from("tasks").select("effort_minutes, area").eq("tenant_id", tid).in("status", ["open", "doing"]).gte("scheduled_start", isoAtTz(today, "00:00", tz)).lt("scheduled_start", until)).limit(500);
  const sum = (rows: any[]) => { const o: Record<string, number> = { growth: 0, clients: 0, admin: 0 }; for (const r of rows ?? []) o[["growth", "clients", "admin"].includes(r.area) ? r.area : "admin"] += Math.max(15, Number(r.effort_minutes) || 30); return o; };
  const d = sum(done ?? []), pl = sum(planned ?? []);
  const total = d.growth + d.clients + d.admin;
  const growthPct = total ? Math.round((d.growth / total) * 100) : 0;
  const line = total ? `This week so far: ${hrs(d.growth)} growth · ${hrs(d.clients)} clients · ${hrs(d.admin)} admin (${growthPct}% growth${growthPct < 30 ? " — below 30%, protect your growth time" : ""})` : "";
  return { ok: true, week_start: monday, done: d, planned: pl, growth_pct: growthPct, line };
}

// v9.11: hours per client over the last 30 days vs what they pay
async function clientTime(tid: string, days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: rows } = await supabase.from("tasks").select("client_id, effort_minutes").eq("tenant_id", tid).eq("status", "done").not("client_id", "is", null).gte("updated_at", since).limit(2000);
  const mins = new Map<string, number>();
  for (const r of rows ?? []) mins.set(r.client_id, (mins.get(r.client_id) ?? 0) + Math.max(15, Number(r.effort_minutes) || 30));
  if (!mins.size) return { ok: true, clients: [], text: "No client time logged yet — link tasks to clients and tick them off, and this fills in." };
  const { data: cl } = await supabase.from("clients").select("id, name, monthly_value").in("id", [...mins.keys()]);
  const list = (cl ?? []).map((c: any) => {
    const m = mins.get(c.id) ?? 0, h = m / 60, val = Number(c.monthly_value ?? 0) || null;
    const monthH = h * (30 / days);
    return { client_id: c.id, name: c.name, hours: Math.round(h * 10) / 10, monthly_value: val, per_hour: val && monthH ? Math.round(val / monthH) : null };
  }).sort((a: any, b: any) => (a.per_hour ?? 1e9) - (b.per_hour ?? 1e9) || b.hours - a.hours);
  const worst = list.filter((x: any) => x.per_hour !== null).slice(0, 3);
  const text = worst.length ? `Lowest £ per hour: ${worst.map((x: any) => `${x.name} £${x.per_hour}/h (${x.hours}h)`).join(" · ")}` : `Most time: ${list.slice(0, 3).map((x: any) => `${x.name} ${x.hours}h`).join(" · ")} — add what each client pays to see £ per hour.`;
  return { ok: true, days, clients: list, text };
}

// v9.11: MRR against the goal, as one line for the brief
async function mrrPace(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("mrr_target, goal_date, timezone").eq("tenant_id", tid).maybeSingle();
  const goal = Number(cfg?.mrr_target ?? 0) || 0;
  if (!goal) return { ok: true, line: "" };
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const goalDate = /^\d{4}-\d{2}-\d{2}$/.test(String(cfg?.goal_date ?? "")) ? String(cfg!.goal_date) : addDays(today, 182);
  const { data: last } = await supabase.from("daily_metrics").select("mrr").eq("tenant_id", tid).not("mrr", "is", null).order("metric_date", { ascending: false }).limit(1).maybeSingle();
  const { data: monthStartRow } = await supabase.from("daily_metrics").select("mrr").eq("tenant_id", tid).not("mrr", "is", null).lt("metric_date", today.slice(0, 8) + "01").order("metric_date", { ascending: false }).limit(1).maybeSingle();
  const now = Number(last?.mrr ?? 0) || 0;
  const monthsLeft = Math.max(1, Math.round((Date.parse(goalDate) - Date.parse(today)) / (30.44 * 86400000)));
  const need = Math.max(0, Math.ceil((goal - now) / monthsLeft));
  const thisMonth = monthStartRow?.mrr != null ? Math.round(now - Number(monthStartRow.mrr)) : null;
  const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
  const by = new Date(goalDate + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const line = now >= goal ? `MRR ${gbp(now)} — goal of ${gbp(goal)} hit 🎉` : `MRR ${gbp(now)} of ${gbp(goal)} · need +${gbp(need)} a month to hit ${by}${thisMonth !== null ? ` · this month ${thisMonth >= 0 ? "+" : "−"}${gbp(Math.abs(thisMonth))}` : ""}`;
  return { ok: true, mrr: now, goal, goal_date: goalDate, need_per_month: need, this_month: thisMonth, months_left: monthsLeft, line };
}

// Load per day for one person: planned task minutes vs their task hours (working days only)
async function dayLoads(tid: string, handle: string, fromDate: string, n = 10) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const { data: m } = handle ? await supabase.from("team_members").select("*").eq("tenant_id", tid).eq("handle", handle).maybeSingle()
    : await supabase.from("team_members").select("*").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  // v9.13: the planner's real free time per day (after meetings, lunch and personal blocks) beats the flat task-hours limit
  const cache: Record<string, any> = {}; for (const c of Array.isArray(m?.forge_days_cache) ? m.forge_days_cache : []) if (c?.date) cache[c.date] = c;
  const capMin = Math.round((Number(m?.max_task_hours ?? 6) || 6) * 60);
  const workDays = String(m?.work_days ?? "1,2,3,4,5").split(",").map(Number);
  const { data: off } = await supabase.from("days_off").select("day").eq("tenant_id", tid).eq("handle", m?.handle ?? handle).gte("day", fromDate).limit(30);
  const offSet = new Set((off ?? []).map((o: any) => String(o.day)));
  const { data: tasks } = await supabase.from("tasks").select("id, effort_minutes, scheduled_start, pinned_date, hold").eq("tenant_id", tid).eq("owner", m?.handle ?? handle).in("status", ["open", "doing"]).limit(400);
  const out: { date: string; planned: number; cap: number; free: number; working: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    const d = addDays(fromDate, i);
    const working = workDays.includes(new Date(d + "T12:00:00Z").getUTCDay()) && !offSet.has(d);
    const planned = (tasks ?? []).filter((t: any) => !t.hold && (t.scheduled_start ? localDate(Date.parse(t.scheduled_start), tz) : t.pinned_date) === d).reduce((a: number, t: any) => a + Math.max(15, Number(t.effort_minutes) || 30), 0);
    const wh = dayWindows(m?.work_hours)[new Date(d + "T12:00:00Z").getUTCDay()];
    const dayLen = wh ? (Number(wh[1].slice(0, 2)) * 60 + Number(wh[1].slice(3))) - (Number(wh[0].slice(0, 2)) * 60 + Number(wh[0].slice(3))) : capMin;
    const cap = cache[d] ? Number(cache[d].cap) || 0 : (working ? Math.min(capMin, dayLen) : 0);
    out.push({ date: d, planned, cap, free: Math.max(0, cap - planned), working: working || !!cache[d] });
  }
  return { tz, capMin, days: out };
}
const dayName = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
const hrs = (min: number) => `${Math.round((min / 60) * 10) / 10}h`;

// After adding/changing a task: say where it landed, and warn (with a better day) if that day is now over
async function taskLanded(tid: string, handle: string, id: string, pinned: string | null, verb = "Added") {
  const { data: t } = await supabase.from("tasks").select("title, effort_minutes, scheduled_start, scheduled_end, pinned_date, kind").eq("id", id).maybeSingle();
  if (!t) return { ok: true, id, text: `${verb} ✅` };
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const L = await dayLoads(tid, handle, today, 14);
  const day = t.scheduled_start ? localDate(Date.parse(t.scheduled_start), tz) : (t.pinned_date ?? null);
  const time = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const mins = Math.max(15, Number(t.effort_minutes) || 30);
  const load = day ? L.days.find((x) => x.date === day) : null;
  let text = `${verb} ✅ "${t.title}" — ${hrs(mins)}${t.kind === "deep" ? " of focus time" : ""}`;
  if (t.scheduled_start && day) text += `, ${dayName(day)} ${time(t.scheduled_start)}–${time(t.scheduled_end)}`;
  else if (day) text += `, ${dayName(day)}`;
  else text += ". It's in your Inbox until there's room";
  let over = false, suggest: string | null = null;
  if (load && load.planned > load.cap) {
    over = true;
    const next = L.days.find((x) => x.date > (pinned ?? day!) && x.working && x.free >= mins);
    suggest = next?.date ?? null;
    text += `\n⚠️ ${dayName(day!)} is now ${hrs(load.planned)} of your ${hrs(load.cap)}.${suggest ? ` First day with room: ${dayName(suggest)}.` : ""}`;
  } else if (load) text += ` (${dayName(day!).split(" ")[0]}: ${hrs(load.planned)} of ${hrs(load.cap)})`;
  return { ok: true, id, text, day, over, suggest_date: suggest, minutes: mins };
}

// "Can I take this on by Friday?" — free task hours between now and a date vs what it needs
async function capacityCheck(tid: string, handle: string, p: any) {
  // v9.13: answers from the real plan — free time after meetings, personal blocks and work already planned —
  // and gives a date to PROMISE (with breathing room), not just the earliest possible finish.
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const est = (!Number(p.hours) && !Number(p.minutes) && p.title) ? await taskEstimate(tid, String(p.title), String(p.notes ?? "")) : null;
  const raw = Math.round((Number(p.hours) || 0) * 60) || Number(p.minutes) || 0;
  const need = raw ? Math.max(15, raw) : (est?.minutes ?? 60);
  const askedBy = /^\d{4}-\d{2}-\d{2}$/.test(String(p.by ?? "")) ? String(p.by) : null;
  const by = askedBy;
  const L = await dayLoads(tid, handle, today, 45);
  const until = (n: number) => { let run = 0; for (const d of L.days) { run += d.free; if (run >= n) return d.date; } return null; };
  const finish = until(need);
  // Breathing room: +20% on anything half a day or more, then one more working day before promising
  const padded = until(Math.round(need * (need >= 240 ? 1.2 : 1.1)));
  const promise = padded ? (L.days.find((d) => d.date > padded && d.working)?.date ?? padded) : null;
  const weekOut = addDays(today, 7);
  const freeBy = L.days.filter((d) => d.date <= (by ?? weekOut)).reduce((a, d) => a + d.free, 0);
  const fits = by ? (freeBy ?? 0) >= need : !!finish;
  const nextWeek = L.days.slice(0, 7).reduce((a, d) => a + d.free, 0);
  const sized = est ? ` (Archie's estimate: ${hrs(need)}${est.why ? `, ${est.why}` : ""})` : "";
  let text: string;
  if (!finish) text = `Not in the next 6 weeks without moving other work. It needs about ${hrs(need)}${sized} and your plan is full. Something has to move or come off.`;
  else if (by && fits) text = `Yes. You've ${hrs(freeBy!)} free before ${dayName(by)} and it needs about ${hrs(need)}${sized}. Earliest finish: ${dayName(finish)}. Safe date to promise: ${dayName(promise ?? finish)}.`;
  else if (by) text = `Not by ${dayName(by)} without moving other work. You've only ${hrs(freeBy ?? 0)} free before then and it needs about ${hrs(need)}${sized}. Earliest finish: ${dayName(finish)}. Safe date to promise: ${dayName(promise ?? finish)}.`;
  else text = `It needs about ${hrs(need)}${sized}. With what's already planned, the earliest you'd finish is ${dayName(finish)}. Safe date to promise the client: ${dayName(promise ?? finish)} (includes breathing room). You've ${hrs(nextWeek)} free in the next 7 days.`;
  return { ok: true, fits, need_minutes: need, free_minutes: freeBy, by: by ?? weekOut, earliest: finish, promise, text, days: L.days.filter((d) => d.date <= (by ?? weekOut)).slice(0, 14).map((d) => ({ date: d.date, free: d.free, planned: d.planned, cap: d.cap })) };
}

// [{label:"Gym", start:"07:00", end:"08:30", days:"1,3,5"}] → clean list (max 8)
function cleanBlocks(v: unknown): { label: string; start: string; end: string; days: number[]; active: boolean }[] {
  const arr = Array.isArray(v) ? v : [];
  return arr.slice(0, 8).map((b: any) => ({
    label: String(b?.label ?? "Personal").trim().slice(0, 40) || "Personal",
    start: hm(b?.start, "07:00"), end: hm(b?.end, "08:00"),
    days: String(b?.days ?? "1,2,3,4,5").split(",").map((x) => Number(x.trim())).filter((x) => x >= 0 && x <= 6),
    active: b?.active !== false && String(b?.active) !== "false",   // v9.13: a block can be saved but switched off (e.g. boxing, not started yet)
  })).filter((b) => b.end > b.start && b.days.length);
}

async function forgeHoursSave(tid: string, p: any) {
  const handle = String(p.handle ?? "").toLowerCase();
  const patch: Record<string, unknown> = {};
  for (const k of ["work_start", "work_end", "lunch_start", "lunch_end"]) if (p[k] !== undefined) patch[k] = hm(p[k], "09:00");
  if (p.work_days !== undefined) patch.work_days = String(p.work_days);
  if (p.calendar_blocks !== undefined) patch.calendar_blocks = p.calendar_blocks === true || String(p.calendar_blocks) === "true";
  if (p.max_task_hours !== undefined) patch.max_task_hours = Math.max(1, Math.min(10, Number(p.max_task_hours) || 6));
  if (p.buffer_minutes !== undefined) patch.buffer_minutes = Math.max(0, Math.min(30, Number(p.buffer_minutes) || 0));
  if (p.block_days !== undefined) patch.block_days = Math.max(1, Math.min(7, Number(p.block_days) || 2));
  if (p.growth_start !== undefined) patch.growth_start = p.growth_start ? hm(p.growth_start, "09:00") : null;
  if (p.growth_end !== undefined) patch.growth_end = p.growth_end ? hm(p.growth_end, "11:00") : null;
  if (p.growth_days !== undefined) patch.growth_days = p.growth_days ? String(p.growth_days) : null;
  if (p.personal_blocks !== undefined) patch.personal_blocks = cleanBlocks(p.personal_blocks).map((b) => ({ ...b, days: b.days.join(",") }));
  // v9.13: different hours per weekday, and growth windows per weekday — {"1":["09:30","17:00"], ...}; null clears
  if (p.work_hours !== undefined) patch.work_hours = p.work_hours ? Object.fromEntries(Object.entries(dayWindows(p.work_hours)).map(([k, v]) => [k, v])) : null;
  if (p.growth_windows !== undefined) patch.growth_windows = p.growth_windows ? Object.fromEntries(Object.entries(dayWindows(p.growth_windows)).map(([k, v]) => [k, v])) : null;
  if (p.forge_caps !== undefined && /^\d+,\d+,\d+$/.test(String(p.forge_caps).replace(/\s/g, ""))) patch.forge_caps = String(p.forge_caps).replace(/\s/g, "");
  const q = supabase.from("team_members").update(patch).eq("tenant_id", tid);
  const { error } = handle ? await q.eq("handle", handle) : await q.eq("gets_financials", true);
  if (!error) await forgePlan(tid, { force: true });
  return error ? { ok: false, error: error.message } : { ok: true, text: "Working hours saved — your plan's been redone." };
}

// Re-plan only if something changed since the last plan (tasks edited/added, or a new hour on a work day)
async function forgePlanIfNeeded(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("forge_planned_at").eq("tenant_id", tid).maybeSingle();
  const since = cfg?.forge_planned_at ?? "1970-01-01";
  const { count } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gt("updated_at", since);
  const stale = Date.now() - Date.parse(since) > 3 * 3600000; // calendars change too — at least every 3 hours
  if ((count ?? 0) > 0 || stale) await forgePlan(tid, { from_now: true });
}

// v9.13 (Forge Phase 1): one plan at a time per business. Callers wait their turn (up to ~30s), so a task added
// while a plan is running still lands in the next plan and its reply shows where it went.
async function forgePlan(tid: string, opt: { force?: boolean; from_now?: boolean; delay_minutes?: number } = {}) {
  for (let i = 0; i < 20; i++) {
    const nowIso = new Date().toISOString(), until = new Date(Date.now() + 180000).toISOString();
    const { data: got, error } = await supabase.from("tenant_config").update({ forge_lock_until: until }).eq("tenant_id", tid).or(`forge_lock_until.is.null,forge_lock_until.lt."${nowIso}"`).select("tenant_id");
    if (error && /forge_lock_until/.test(error.message)) return await forgePlanRun(tid, opt); // column not added yet — plan without the lock
    if (got?.length) {
      try { return await forgePlanRun(tid, opt); }
      finally { await supabase.from("tenant_config").update({ forge_lock_until: null }).eq("tenant_id", tid).eq("forge_lock_until", until); }
    }
    if (i === 0) { const { data: row } = await supabase.from("tenant_config").select("tenant_id").eq("tenant_id", tid).maybeSingle(); if (!row) return await forgePlanRun(tid, opt); }
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  return { ok: false, text: "Forge is busy re-planning — try again in a minute." };
}

// v9.14.1: you made a call on this task (moved it, parked it, re-prioritised it) — "keeps moving" resets from here
async function ackMoves(tid: string, id: string) {
  try {
    const { data: t } = await supabase.from("tasks").select("move_count").eq("tenant_id", tid).eq("id", id).maybeSingle();
    if (t) await supabase.from("tasks").update({ moves_acked: Number(t.move_count) || 0 }).eq("tenant_id", tid).eq("id", id);
  } catch { /* column not added yet — harmless */ }
}

// v9.13: a select that still works if the new task columns haven't been added yet
async function selNewCols(run: (cols: string) => PromiseLike<{ data: any; error: any }>, cols: string) {
  const optional = ["critical", "block_start", "block_end", "project_id", "checklist", "waiting_on", "moves_acked"];
  let r = await run(cols);
  for (let i = 0; i < optional.length && r.error; i++) {
    const msg = String(r.error.message ?? "");
    const missing = optional.find((c) => new RegExp(`\\b${c}\\b`).test(msg) && new RegExp(`,\\s*${c}\\b`).test(cols));
    if (!missing) break;
    cols = cols.replace(new RegExp(`,\\s*${missing}\\b`), "");
    r = await run(cols);
  }
  return r;
}

// "09:30"-style pairs per weekday: {"1":["09:30","17:00"], ...} or {"1":{"start":"09:30","end":"17:00"}}
function dayWindows(v: unknown): Record<number, [string, string]> {
  const o = typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return null; } })() : v;
  const out: Record<number, [string, string]> = {};
  if (!o || typeof o !== "object") return out;
  for (const [k, raw] of Object.entries(o as Record<string, any>)) {
    const d = Number(k); if (!(d >= 0 && d <= 6) || !raw) continue;
    const s = Array.isArray(raw) ? raw[0] : raw.start, e = Array.isArray(raw) ? raw[1] : raw.end;
    if (!s || !e) continue;
    const a = hm(s, ""), b = hm(e, "");
    if (a && b && b > a) out[d] = [a, b];
  }
  return out;
}

const TIER_WORD: Record<string, string> = { must: "Must", high: "To-do", bonus: "Bonus" };
const hrsTxt = (min: number) => min >= 60 ? `${Math.round((min / 60) * 10) / 10}h` : `${Math.round(min)}m`;

async function forgePlanRun(tid: string, opt: { force?: boolean; from_now?: boolean; delay_minutes?: number } = {}) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id, timezone, forge_days, forge_caps").eq("tenant_id", tid).single();
  const fcfg = cfg;
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const tz = cfg?.timezone || "Europe/London";
  const horizon = Math.max(1, Math.min(10, Number(cfg?.forge_days ?? 5)));
  const today = localDate(Date.now(), tz);
  const now = Date.now() + (opt.delay_minutes ?? 0) * 60000;
  const dayLabel = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const { data: team } = await supabase.from("team_members").select("*").eq("tenant_id", tid).neq("active", false);
  const summary: string[] = [];
  for (const m of team ?? []) {
    const workDays = String(m.work_days ?? "1,2,3,4,5").split(",").map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    const ws0 = hm(m.work_start, "09:00"), we0 = hm(m.work_end, "17:30");
    const perDay = dayWindows(m.work_hours);                       // v9.13: different hours per weekday
    const ls = m.lunch_start ? hm(m.lunch_start, "12:30") : null, le = m.lunch_end ? hm(m.lunch_end, "13:15") : null;
    const maxMin = Math.round((Number(m.max_task_hours ?? 6) || 6) * 60);
    const buf = Math.max(0, Math.min(30, Number(m.buffer_minutes ?? 10))) * 60000;
    // Protected growth time — per weekday (growth_windows) or one window on chosen days (growth_start/end/days)
    const growthPerDay = dayWindows(m.growth_windows);
    const gs = m.growth_start ? hm(m.growth_start, "09:00") : null, ge = m.growth_end ? hm(m.growth_end, "11:00") : null;
    const growthDays = m.growth_days ? String(m.growth_days).split(",").map((x: string) => Number(x.trim())) : null;
    const growthFor = (dow: number): [string, string] | null => Object.keys(growthPerDay).length ? (growthPerDay[dow] ?? null) : (gs && ge && (!growthDays || growthDays.includes(dow)) ? [gs, ge] : null);
    const personalBlocks = cleanBlocks(m.personal_blocks).filter((b) => b.active);   // inactive blocks (e.g. boxing, not started yet) are ignored
    // 2:3:2 by default — how many Must / To-do / Bonus a day can hold
    const capsRaw = String(m.forge_caps ?? fcfg?.forge_caps ?? "2,3,2").split(",").map((x: string) => Math.max(0, Number(x.trim()) || 0));
    const caps: Record<string, number> = { must: capsRaw[0] ?? 2, high: capsRaw[1] ?? 3, bonus: capsRaw[2] ?? 2 };
    const { data: off } = await supabase.from("days_off").select("day").eq("tenant_id", tid).eq("handle", m.handle).gte("day", today).limit(30);
    const offSet = new Set((off ?? []).map((o: any) => String(o.day)));
    // Calendar busy times (their GHL calendars incl. the personal one that syncs Google) — minus Archie's own blocks.
    // v9.13: if the calendar can't be read, say so loudly instead of quietly planning as if the day were empty.
    const busy: Slot[] = [];
    let calOk = true, calErr: string | null = null, calFetchFailed = false;
    const { data: myBlocks } = await supabase.from("tasks").select("block_event_id").eq("tenant_id", tid).eq("owner", m.handle).not("block_event_id", "is", null);
    const ownBlockIds = new Set((myBlocks ?? []).map((b: any) => b.block_event_id));
    for (const pbId of Array.isArray(m.personal_block_ids) ? m.personal_block_ids : []) ownBlockIds.add(typeof pbId === "string" ? pbId : pbId?.id);
    if (!m.ghl_user_id) { calOk = false; calErr = "No CRM user is set for this person, so Forge can't see their calendar. Pick one in Settings → Team."; }
    else {
      const from = Date.parse(isoAtTz(today, "00:00", tz)), to = from + (horizon + 9) * 86400000;
      const ev = await ghl(token, `/calendars/events?locationId=${loc}&userId=${m.ghl_user_id}&startTime=${from}&endTime=${to}`, "GET", undefined, "2021-04-15");
      if (!ev.ok || !Array.isArray(ev.json?.events)) { calOk = false; calFetchFailed = true; calErr = `Forge couldn't read the calendar (${ev.status || "no response"}), so the plan may clash with appointments.`; }
      for (const e of ev.json?.events ?? []) {
        if (ownBlockIds.has(e.id) || String(e.title ?? "").startsWith("🔨") || String(e.title ?? "").startsWith("🔒")) continue;
        if (["cancelled", "invalid"].includes(String(e.appointmentStatus ?? "").toLowerCase())) continue;
        busy.push({ start: Date.parse(e.startTime) - 5 * 60000, end: Date.parse(e.endTime) + 5 * 60000 });
      }
    }
    // Free slots per working day
    const days: { date: string; slots: Slot[]; used: number; free: number; growthFree: number; count: Record<string, number> }[] = [];
    let d = today, guard = 0;
    while (days.length < horizon && guard++ < 21) {
      const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
      if (workDays.includes(dow) && !offSet.has(d)) {
        const [ws, we] = perDay[dow] ?? [ws0, we0];
        let slots: Slot[] = [{ start: Date.parse(isoAtTz(d, ws, tz)), end: Date.parse(isoAtTz(d, we, tz)) }];
        const dayBusy: Slot[] = [...busy];
        if (ls && le) dayBusy.push({ start: Date.parse(isoAtTz(d, ls, tz)), end: Date.parse(isoAtTz(d, le, tz)) });
        for (const pb of personalBlocks) if (pb.days.includes(dow)) dayBusy.push({ start: Date.parse(isoAtTz(d, pb.start, tz)), end: Date.parse(isoAtTz(d, pb.end, tz)) });
        if (d === today) slots = slots.map((sl) => ({ start: Math.max(sl.start, Math.ceil(now / 900000) * 900000), end: sl.end })).filter((sl) => sl.end - sl.start >= 15 * 60000);
        for (const b of dayBusy) {
          const next: Slot[] = [];
          for (const sl of slots) {
            if (b.end <= sl.start || b.start >= sl.end) { next.push(sl); continue; }
            if (b.start > sl.start) next.push({ start: sl.start, end: b.start });
            if (b.end < sl.end) next.push({ start: b.end, end: sl.end });
          }
          slots = next.filter((sl) => sl.end - sl.start >= 15 * 60000);
        }
        const gw = growthFor(dow);
        if (gw) {
          const g0 = Date.parse(isoAtTz(d, gw[0], tz)), g1 = Date.parse(isoAtTz(d, gw[1], tz));
          const split: Slot[] = [];
          for (const sl of slots) {
            if (sl.end <= g0 || sl.start >= g1) { split.push(sl); continue; }
            if (sl.start < g0) split.push({ start: sl.start, end: g0 });
            split.push({ start: Math.max(sl.start, g0), end: Math.min(sl.end, g1), g: true });
            if (sl.end > g1) split.push({ start: g1, end: sl.end });
          }
          slots = split.filter((sl) => sl.end - sl.start >= 15 * 60000);
        }
        const free = slots.reduce((a, sl) => a + (sl.end - sl.start) / 60000, 0);
        const growthFree = slots.filter((sl) => sl.g).reduce((a, sl) => a + (sl.end - sl.start) / 60000, 0);
        days.push({ date: d, slots, used: 0, free: Math.round(free), growthFree: Math.round(growthFree), count: { must: 0, high: 0, bonus: 0 } });
      }
      d = addDays(d, 1);
    }
    // Tasks to place: critical first, then pinned, then Must (and urgent), then carried-over, soonest due, oldest
    const { data: tasks } = await selNewCols((cols) => supabase.from("tasks").select(cols).eq("tenant_id", tid).eq("owner", m.handle).in("status", ["open", "doing"]).limit(200),
      "id, title, tier, kind, effort_minutes, due_date, scheduled_start, scheduled_end, created_at, move_count, block_event_id, pinned_date, hold, area, critical, block_start, block_end, project_id");
    // v9.14: a task in a project with no deadline of its own works to the project's deadline
    const projDeadline: Record<string, string> = {};
    { const pIds = [...new Set((tasks ?? []).map((t: any) => t.project_id).filter(Boolean))]; if (pIds.length) { const { data: ps } = await supabase.from("forge_projects").select("id, deadline").eq("tenant_id", tid).in("id", pIds).neq("status", "complete").eq("archived", false); for (const x of ps ?? []) if (x.deadline) projDeadline[x.id] = String(x.deadline); } }
    const startOfToday = Date.parse(isoAtTz(today, "00:00", tz));
    const soon = addDays(today, 1);
    // v9.13.1: once today's working hours are used up (or it's after finish time), "today" isn't somewhere a task can go —
    // anything pinned to today or carried over rolls to the first day that still has free time.
    const firstOpen = days.find((dd) => dd.slots.length)?.date ?? days.find((dd) => dd.date > today)?.date ?? days[0]?.date ?? today;
    const todayOver = !days.some((dd) => dd.date === today && dd.slots.length);
    const list = (tasks ?? []).filter((t: any) => !t.hold).map((t0: any) => {
      const t = { ...t0, due_date: t0.due_date ?? (t0.project_id ? projDeadline[t0.project_id] ?? null : null) };
      const tier = ["must", "high", "bonus"].includes(t.tier) ? t.tier : "high";
      const critical = !!t.critical;
      const urgent = !critical && !!t.due_date && String(t.due_date) <= soon && tier !== "must";
      // Anything not done on its day (past pin, or planned on a past day) rolls to the NEXT working day — never further
      const carried = !!t.scheduled_start && Date.parse(t.scheduled_start) < startOfToday;
      const rolled = (!!t.pinned_date && String(t.pinned_date) < today) || (carried && !t.pinned_date) || (todayOver && String(t.pinned_date ?? "") === today);
      const pin = rolled ? firstOpen : (t.pinned_date ?? null);
      return { ...t, tier, critical, urgent, carried, rolled, pin };
    })
      .sort((a: any, b: any) =>
        (a.critical ? 0 : 1) - (b.critical ? 0 : 1) ||
        (a.pin ? 0 : 1) - (b.pin ? 0 : 1) ||
        (TIER_RANK[a.urgent ? "must" : a.tier] ?? 1) - (TIER_RANK[b.urgent ? "must" : b.tier] ?? 1) ||
        (b.carried ? 1 : 0) - (a.carried ? 1 : 0) ||
        String(a.due_date ?? "9999").localeCompare(String(b.due_date ?? "9999")) ||
        String(a.created_at).localeCompare(String(b.created_at)));
    const placed: { id: string; start: number; end: number; date: string; slot: string }[] = [];
    const wontFit: string[] = [];
    const unplaced: { id: string; title: string; minutes: number; due: string | null; tier: string; reason: string; earliest: string | null; kind: "no_room" | "late" | "pinned_full" }[] = [];
    const failed: { t: any; need: number; why: string[] }[] = [];
    for (const t of list) {
      const need = Math.max(15, Number(t.effort_minutes) || 30) * 60000;
      const deadline = t.due_date ? String(t.due_date) : null;
      const why: string[] = [];
      let done = false;
      for (const day of days) {
        // Pinned to a day → only that day (it can go over the caps there — they chose it). Critical tasks ignore the caps.
        if (t.pin && day.date !== t.pin) continue;
        const slotTier = t.critical ? "must" : (t.urgent && day.count.must < caps.must ? "must" : t.tier);
        const free = t.critical || (t.pin && day.date === t.pin);
        if (day.count[slotTier] >= caps[slotTier] && !free) { why.push("cap"); continue; }
        if (day.used + need / 60000 > maxMin && slotTier !== "must" && !free) { why.push("daycap"); continue; }
        const isGrowth = t.area === "growth";
        const order = day.slots.filter((x) => isGrowth || !x.g).sort((a, b) => (isGrowth ? (a.g ? 0 : 1) - (b.g ? 0 : 1) : 0) || (t.kind === "deep" ? a.start - b.start : b.start - a.start));
        const sl = order.find((x) => x.end - x.start >= need);
        if (!sl) { why.push("noslot"); continue; }
        const start = t.kind === "deep" ? sl.start : sl.end - need;
        const end = start + need;
        const i = day.slots.indexOf(sl);
        const rest: Slot[] = [];
        if (start - buf - sl.start >= 15 * 60000) rest.push({ start: sl.start, end: start - buf, g: sl.g });
        if (sl.end - (end + buf) >= 15 * 60000) rest.push({ start: end + buf, end: sl.end, g: sl.g });
        day.slots.splice(i, 1, ...rest);
        day.slots.sort((a, b) => a.start - b.start);
        day.used += need / 60000;
        day.count[slotTier]++;
        placed.push({ id: t.id, start, end, date: day.date, slot: slotTier });
        if (deadline && day.date > deadline) {
          wontFit.push(`"${t.title}" (due ${deadline})`);
          unplaced.push({ id: t.id, title: t.title, minutes: need / 60000, due: deadline, tier: t.tier, reason: `Planned for ${dayLabel(day.date)}, after its deadline (${dayLabel(deadline)}). Move something off an earlier day or change the deadline.`, earliest: day.date, kind: "late" });
        }
        done = true; break;
      }
      if (!done) failed.push({ t, need, why });
    }
    // Why each one didn't fit, and the earliest day it realistically could (after everything else is placed)
    for (const f of failed) {
      if (f.t.pin && !days.some((dd) => dd.date === f.t.pin)) continue;   // pinned past the plan window — it's planned when that day comes into view
      const t = f.t, needMin = f.need / 60000, deadline = t.due_date ? String(t.due_date) : null;
      const longest = Math.max(0, ...days.flatMap((dd) => dd.slots.filter((x) => t.area === "growth" || !x.g).map((x) => (x.end - x.start) / 60000)));
      const roomDay = days.find((dd) => dd.slots.some((x) => (t.area === "growth" || !x.g) && x.end - x.start >= f.need));
      let reason: string, kind: "no_room" | "pinned_full" = "no_room";
      if (t.pin) { kind = "pinned_full"; reason = `Pinned to ${dayLabel(t.pin)}, but there's no ${hrsTxt(needMin)} gap left that day.`; }
      else if (f.why.length && f.why.every((w) => w === "cap")) reason = `Every day's ${TIER_WORD[t.tier]} spaces are full (${caps[t.tier]} a day) for the next ${days.length} working days.`;
      else if (f.why.length && f.why.every((w) => w === "daycap")) reason = `Your task hours (${hrsTxt(maxMin)} a day) are full for the next ${days.length} working days.`;
      else if (longest < needMin) reason = `It needs ${hrsTxt(needMin)} in one go, and your longest free gap in the next ${days.length} working days is ${hrsTxt(longest)}.`;
      else reason = `No day in the next ${days.length} working days has both a free ${TIER_WORD[t.tier]} space and a ${hrsTxt(needMin)} gap.`;
      if (!calOk) reason += " (Calendar not readable — check Settings.)";
      wontFit.push(`"${t.title}"${deadline ? ` (due ${deadline})` : ""}`);
      unplaced.push({ id: t.id, title: t.title, minutes: needMin, due: deadline, tier: t.tier, reason, earliest: roomDay?.date ?? null, kind });
    }
    // A day pinned past your hours gets flagged, so you see it before you promise more
    for (const day of days) if (day.used > maxMin + 1) wontFit.unshift(`${new Date(day.date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long" })} is over your ${Math.round(maxMin / 6) / 10}h by ${Math.round((day.used - maxMin) / 6) / 10}h`);
    // Save: scheduled times; today's list = today's blocks; carried-over tasks count as a move
    const carriedIds = new Set(list.filter((t: any) => t.carried).map((t: any) => t.id));
    for (const pl of placed) {
      const upd: Record<string, unknown> = { scheduled_start: new Date(pl.start).toISOString(), scheduled_end: new Date(pl.end).toISOString(), today: pl.date === today, plan_slot: pl.slot };
      if (pl.date === today) upd.today_set_on = today;
      if (carriedIds.has(pl.id)) { const t = list.find((x: any) => x.id === pl.id); upd.move_count = (Number(t?.move_count) || 0) + 1; }
      await supabase.from("tasks").update(upd).eq("id", pl.id);
    }
    for (const t of list.filter((x: any) => x.rolled)) {
      await supabase.from("tasks").update({ pinned_date: t.pin, hold: false, move_count: (Number(t.move_count) || 0) + (carriedIds.has(t.id) ? 0 : 1) }).eq("id", t.id);
    }
    const placedIds = new Set(placed.map((p) => p.id));
    const unplacedIds = list.filter((t: any) => !placedIds.has(t.id)).map((t: any) => t.id);
    if (unplacedIds.length) await supabase.from("tasks").update({ scheduled_start: null, scheduled_end: null }).in("id", unplacedIds);
    // v9.13: calendar blocks — only touch what changed (new → create, moved → update, gone → delete). Skipped if the calendar can't be read.
    if (!calFetchFailed && m.calendar_blocks && m.personal_calendar_id) {
      const horizonEnd = Date.parse(isoAtTz(addDays(today, Math.max(1, Math.min(7, Number(m.block_days ?? 2)))), "00:00", tz));
      for (const t of list) {
        const pl = placed.find((x) => x.id === t.id);
        const want = pl && pl.start < horizonEnd ? pl : null;
        const bs = t.block_start !== undefined ? t.block_start : t.scheduled_start, be = t.block_end !== undefined ? t.block_end : t.scheduled_end;
        const same = !!want && !!t.block_event_id && !!bs && Date.parse(bs) === want.start && Date.parse(be ?? "") === want.end;
        if (same || (!want && !t.block_event_id)) continue;
        let blockId: string | null = t.block_event_id ?? null;
        const body = want ? { locationId: loc, calendarId: m.personal_calendar_id, title: `🔨 ${String(t.title).slice(0, 80)}`, startTime: new Date(want.start).toISOString(), endTime: new Date(want.end).toISOString(), assignedUserId: m.ghl_user_id } : null;
        if (!want) { await ghl(token, `/calendars/events/${blockId}`, "DELETE", undefined, "2021-04-15").catch(() => null); blockId = null; }
        else if (blockId) {
          const r = await ghl(token, `/calendars/events/block-slots/${blockId}`, "PUT", body, "2021-04-15");
          if (!r.ok) { await ghl(token, `/calendars/events/${blockId}`, "DELETE", undefined, "2021-04-15").catch(() => null); const c2 = await ghl(token, "/calendars/events/block-slots", "POST", body, "2021-04-15"); blockId = c2.json?.id ?? c2.json?.event?.id ?? null; }
        } else { const c2 = await ghl(token, "/calendars/events/block-slots", "POST", body, "2021-04-15"); blockId = c2.json?.id ?? c2.json?.event?.id ?? null; }
        const bUpd = { block_event_id: blockId, block_start: blockId && want ? new Date(want.start).toISOString() : null, block_end: blockId && want ? new Date(want.end).toISOString() : null };
        const { error: bErr } = await supabase.from("tasks").update(bUpd).eq("id", t.id);
        if (bErr) await supabase.from("tasks").update({ block_event_id: blockId }).eq("id", t.id);
      }
      // Blocks for tasks that were finished or removed come off the calendar
      const { data: stale1 } = await supabase.from("tasks").select("id, block_event_id").eq("tenant_id", tid).eq("owner", m.handle).in("status", ["done", "dismissed", "waiting"]).not("block_event_id", "is", null).limit(100);
      const { data: stale2 } = await supabase.from("tasks").select("id, block_event_id").eq("tenant_id", tid).eq("owner", m.handle).eq("hold", true).not("block_event_id", "is", null).limit(100);
      const stale = [...(stale1 ?? []), ...(stale2 ?? [])];
      for (const s of stale) { await ghl(token, `/calendars/events/${s.block_event_id}`, "DELETE", undefined, "2021-04-15").catch(() => null); await supabase.from("tasks").update({ block_event_id: null }).eq("id", s.id); }
      // Personal blocks (gym etc.): keep the ones still wanted, add new, remove old — stable ids
      const prev: any[] = Array.isArray(m.personal_block_ids) ? m.personal_block_ids : [];
      const wantPb: { key: string; label: string; st: number; en: number }[] = [];
      const ahead = Math.max(1, Math.min(7, Number(m.block_days ?? 2)));
      for (let i = 0; i < ahead && personalBlocks.length; i++) {
        const dd = addDays(today, i), dw = new Date(`${dd}T12:00:00Z`).getUTCDay();
        if (offSet.has(dd)) continue;
        for (const pb of personalBlocks) {
          if (!pb.days.includes(dw)) continue;
          const st = Date.parse(isoAtTz(dd, pb.start, tz)), en = Date.parse(isoAtTz(dd, pb.end, tz));
          if (en < Date.now()) continue;
          wantPb.push({ key: `${pb.label}|${dd}|${pb.start}|${pb.end}`, label: pb.label, st, en });
        }
      }
      const keep: { id: string; key: string }[] = [];
      for (const p of prev) {
        const pid = typeof p === "string" ? p : p?.id, pkey = typeof p === "string" ? "" : String(p?.key ?? "");
        if (pid && pkey && wantPb.some((w) => w.key === pkey) && !keep.some((k) => k.key === pkey)) keep.push({ id: pid, key: pkey });
        else if (pid) await ghl(token, `/calendars/events/${pid}`, "DELETE", undefined, "2021-04-15").catch(() => null);
      }
      for (const w of wantPb) {
        if (keep.some((k) => k.key === w.key)) continue;
        const r = await ghl(token, "/calendars/events/block-slots", "POST", { locationId: loc, calendarId: m.personal_calendar_id, title: `🔒 ${w.label}`, startTime: new Date(w.st).toISOString(), endTime: new Date(w.en).toISOString() }, "2021-04-15").catch(() => null) as any;
        const bid = r?.json?.id ?? r?.json?.event?.id; if (bid) keep.push({ id: bid, key: w.key });
      }
      const { error: pbErr } = await supabase.from("team_members").update({ personal_block_ids: keep }).eq("tenant_id", tid).eq("handle", m.handle);
      if (pbErr) await supabase.from("team_members").update({ personal_block_ids: keep.map((k) => k.id) }).eq("tenant_id", tid).eq("handle", m.handle);
    }
    // v9.13: real capacity per day (free calendar time after meetings, lunch, personal blocks, growth window), for every capacity answer
    // (growth-window time only counts for growth work, so it's left out of the general capacity; no cache when the calendar couldn't be read)
    const daysCache = calOk ? days.map((dd) => ({ date: dd.date, free: dd.free, cap: Math.min(maxMin, Math.max(0, dd.free - dd.growthFree)), planned: Math.round(dd.used), growth_free: dd.growthFree })) : [];
    const memberUpd: Record<string, unknown> = { forge_wont_fit: wontFit.slice(0, 10), forge_unplaced: unplaced.slice(0, 30), forge_days_cache: daysCache, forge_calendar_ok: calOk, forge_calendar_error: calErr };
    const { error: mErr } = await supabase.from("team_members").update(memberUpd).eq("tenant_id", tid).eq("handle", m.handle);
    if (mErr) await supabase.from("team_members").update({ forge_wont_fit: wontFit.slice(0, 10) }).eq("tenant_id", tid).eq("handle", m.handle); // new columns not added yet
    summary.push(`${m.handle}: ${placed.length} placed${unplaced.length ? `, ${unplaced.length} need attention` : ""}${calOk ? "" : " (calendar not readable)"}`);
  }
  await supabase.from("tenant_config").update({ forge_planned_at: new Date().toISOString() }).eq("tenant_id", tid);
  return { ok: true, text: `Plan updated — ${summary.join(" · ")}.` };
}

// ===================== v9.14 (Forge Phase 2): projects, the client request inbox, and the Overview =====================
// [{text, done}] — a task's own subtasks (a checklist; they aren't planned separately)
function cleanChecklist(v: unknown): { text: string; done: boolean }[] {
  return (Array.isArray(v) ? v : []).slice(0, 40).map((x: any) => ({ text: String(typeof x === "string" ? x : x?.text ?? "").trim().slice(0, 200), done: typeof x === "object" && (x?.done === true || String(x?.done) === "true") })).filter((x) => x.text);
}

const PROJECT_STATUSES = ["inbox", "scheduled", "in_progress", "waiting", "complete"];
const ACTIVE_PROJECT = ["scheduled", "in_progress", "waiting"];
const PROJECT_WORD: Record<string, string> = { inbox: "Inbox", scheduled: "Scheduled", in_progress: "In progress", waiting: "Waiting", complete: "Complete" };

async function clientNames(tid: string, ids: (string | null | undefined)[]) {
  const uniq = [...new Set(ids.filter(Boolean) as string[])];
  const out: Record<string, string> = {};
  if (!uniq.length) return out;
  const { data } = await supabase.from("clients").select("id, name").eq("tenant_id", tid).in("id", uniq);
  for (const c of data ?? []) out[c.id] = c.name;
  return out;
}

// Progress (done ÷ all, dismissed left out), hours left (unfinished tasks), next action (the next planned task, else the most important open one)
function projectStats(tasks: any[], today: string) {
  const live = tasks.filter((t) => t.status !== "dismissed" && t.status !== "proposed");
  const done = live.filter((t) => t.status === "done");
  const open = live.filter((t) => ["open", "doing", "waiting"].includes(t.status));
  const minutesLeft = open.reduce((a, t) => a + Math.max(15, Number(t.effort_minutes) || 30), 0);
  const actionable = open.filter((t) => t.status === "open" || t.status === "doing");
  const next = [...actionable].sort((a, b) =>
    (a.scheduled_start ? 0 : 1) - (b.scheduled_start ? 0 : 1) ||
    String(a.scheduled_start ?? "").localeCompare(String(b.scheduled_start ?? "")) ||
    (TIER_RANK[a.tier] ?? 1) - (TIER_RANK[b.tier] ?? 1) ||
    String(a.created_at).localeCompare(String(b.created_at)))[0] ?? null;
  return {
    total: live.length, done: done.length, open: open.length,
    progress: live.length ? Math.round((done.length / live.length) * 100) : 0,
    minutes_left: minutesLeft,
    waiting: open.filter((t) => t.status === "waiting").length,
    overdue_tasks: actionable.filter((t) => t.due_date && String(t.due_date) < today).length,
    next_action: next ? { id: next.id, title: next.title, when: next.scheduled_start ?? null, tier: next.tier } : null,
  };
}

async function projectsList(tid: string, p: any = {}) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  let q = supabase.from("forge_projects").select("*").eq("tenant_id", tid).eq("archived", false);
  if (PROJECT_STATUSES.includes(String(p.status ?? ""))) q = q.eq("status", String(p.status));
  else if (String(p.status ?? "") !== "all") q = q.neq("status", "complete");
  const { data: projects, error } = await q.order("deadline", { ascending: true, nullsFirst: false }).limit(200);
  if (error) return { ok: false, text: /forge_projects/.test(error.message) ? "Projects aren't set up yet — run the Phase 2 SQL." : error.message, projects: [] };
  const ids = (projects ?? []).map((x: any) => x.id);
  const { data: tasks } = ids.length ? await supabase.from("tasks").select("id, title, status, tier, effort_minutes, due_date, scheduled_start, created_at, project_id").eq("tenant_id", tid).in("project_id", ids).limit(2000) : { data: [] as any[] };
  const names = await clientNames(tid, (projects ?? []).map((x: any) => x.client_id));
  const rank: Record<string, number> = { in_progress: 0, waiting: 1, scheduled: 2, inbox: 3, complete: 4 };
  const out = (projects ?? []).map((pr: any) => {
    const st = projectStats((tasks ?? []).filter((t: any) => t.project_id === pr.id), today);
    const overdue = !!pr.deadline && String(pr.deadline) < today && pr.status !== "complete";
    return { id: pr.id, name: pr.name, description: pr.description ?? "", client_id: pr.client_id ?? null, client_name: pr.client_id ? names[pr.client_id] ?? null : null,
      status: pr.status, status_label: PROJECT_WORD[pr.status] ?? pr.status, priority: pr.priority ?? "high", deadline: pr.deadline ?? null, major: !!pr.major,
      waiting_on: pr.waiting_on ?? null, notes: pr.notes ?? "", overdue, no_next_action: ACTIVE_PROJECT.includes(pr.status) && !st.next_action, ...st, hours_left: Math.round((st.minutes_left / 60) * 10) / 10 };
  }).sort((a: any, b: any) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || String(a.deadline ?? "9999").localeCompare(String(b.deadline ?? "9999")));
  const active = out.filter((x: any) => ACTIVE_PROJECT.includes(x.status));
  return { ok: true, projects: out, active_count: active.length, major_active: active.filter((x: any) => x.major).length,
    text: !active.length ? (out.length ? `No active projects (${out.length} in Inbox).` : "No projects yet.") : out.length ? `${active.length} active project${active.length === 1 ? "" : "s"}:\n${active.slice(0, 10).map((x: any) => `• ${x.name}${x.client_name ? ` (${x.client_name})` : ""}: ${x.status_label}, ${x.progress}% done, ${x.hours_left}h left${x.deadline ? `, due ${dayName(x.deadline)}` : ""}${x.next_action ? `. Next: ${x.next_action.title}` : ". No next action"}`).join("\n")}` : "No projects yet." };
}

async function projectGet(tid: string, id: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const { data: pr } = await supabase.from("forge_projects").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!pr) return { ok: false, text: "I can't find that project." };
  const { data: tasks } = await supabase.from("tasks").select("id, title, status, tier, effort_minutes, due_date, scheduled_start, scheduled_end, pinned_date, created_at, detail, checklist, area, waiting_on, move_count").eq("tenant_id", tid).eq("project_id", id).neq("status", "dismissed").order("created_at").limit(500);
  const names = await clientNames(tid, [pr.client_id]);
  const st = projectStats(tasks ?? [], today);
  const order: Record<string, number> = { doing: 0, open: 1, waiting: 2, proposed: 3, done: 4 };
  return { ok: true, project: { ...pr, client_name: pr.client_id ? names[pr.client_id] ?? null : null, status_label: PROJECT_WORD[pr.status] ?? pr.status, overdue: !!pr.deadline && String(pr.deadline) < today && pr.status !== "complete", ...st, hours_left: Math.round((st.minutes_left / 60) * 10) / 10 },
    tasks: (tasks ?? []).map((t: any) => ({ ...t, notes: t.detail ?? "", checklist: Array.isArray(t.checklist) ? t.checklist : [], minutes: Math.max(15, Number(t.effort_minutes) || 30) }))
      .sort((a: any, b: any) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || String(a.scheduled_start ?? "9").localeCompare(String(b.scheduled_start ?? "9"))) };
}

// Create or update. Starting a third major build warns first (limit per business, default 2) unless override: true.
async function projectSave(tid: string, handle: string, p: any) {
  const id = p.id ? String(p.id) : null;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (p.name !== undefined) row.name = String(p.name).trim().slice(0, 120);
  if (p.description !== undefined) row.description = String(p.description ?? "").trim().slice(0, 2000) || null;
  if (p.client_id !== undefined) row.client_id = p.client_id ? String(p.client_id) : null;
  if (p.status !== undefined && PROJECT_STATUSES.includes(String(p.status))) row.status = String(p.status);
  if (["must", "high", "bonus"].includes(String(p.priority ?? ""))) row.priority = String(p.priority);
  if (p.deadline !== undefined) { if (p.deadline === null || p.deadline === "") row.deadline = null; else if (/^\d{4}-\d{2}-\d{2}$/.test(String(p.deadline))) row.deadline = String(p.deadline); }
  if (p.major !== undefined) row.major = p.major === true || String(p.major) === "true";
  if (p.notes !== undefined) row.notes = String(p.notes ?? "").slice(0, 8000) || null;
  if (p.waiting_on !== undefined) row.waiting_on = String(p.waiting_on ?? "").trim().slice(0, 200) || null;
  if (row.status === "complete") row.completed_at = new Date().toISOString();
  else if (row.status) row.completed_at = null;
  if (!id && !row.name) return { ok: false, text: "Give the project a name." };
  // The two-major-builds rule
  const prev = id ? (await supabase.from("forge_projects").select("status, major, name").eq("tenant_id", tid).eq("id", id).maybeSingle()).data : null;
  const willBeMajor = row.major !== undefined ? !!row.major : !!prev?.major;
  const willStatus = String(row.status ?? prev?.status ?? "inbox");
  const becomingActive = willBeMajor && ACTIVE_PROJECT.includes(willStatus) && !(prev && prev.major && ACTIVE_PROJECT.includes(prev.status));
  if (becomingActive && !(p.override === true || String(p.override) === "true")) {
    const { data: lim } = await supabase.from("tenant_config").select("max_major_builds").eq("tenant_id", tid).maybeSingle();
    const max = Math.max(1, Number(lim?.max_major_builds ?? 2) || 2);
    let q = supabase.from("forge_projects").select("id, name, deadline").eq("tenant_id", tid).eq("archived", false).eq("major", true).in("status", ACTIVE_PROJECT);
    if (id) q = q.neq("id", id);
    const { data: majors } = await q;
    // When the first of the current major builds is due to finish — the earliest a new one could start properly
    const ends = (majors ?? []).map((m: any) => m.deadline).filter(Boolean).sort();
    const earliest_start = ends.length ? addDays(String(ends[0]), 1) : null;
    if ((majors ?? []).length >= max) return { ok: false, needs_override: true, active_majors: majors, earliest_start, text: `You've already got ${(majors ?? []).length} major build${(majors ?? []).length === 1 ? "" : "s"} on (${(majors ?? []).map((m: any) => m.name).join(" and ")}). Starting another usually means all of them slip. Start it anyway?` };
  }
  if (id) {
    const { error } = await supabase.from("forge_projects").update(row).eq("tenant_id", tid).eq("id", id);
    if (error) return { ok: false, text: error.message };
    if (row.status === "complete") await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "project completed" }).eq("tenant_id", tid).eq("project_id", id).eq("status", "proposed");
    if (row.deadline !== undefined || row.status !== undefined) startInBackground(forgePlan(tid, { force: true, from_now: true }));
    return { ok: true, id, text: `Saved "${row.name ?? prev?.name ?? "project"}".` };
  }
  const { data: made, error } = await supabase.from("forge_projects").insert({ tenant_id: tid, owner: handle || null, status: "inbox", priority: "high", major: false, archived: false, ...row }).select("id").maybeSingle();
  if (error) return { ok: false, text: /forge_projects/.test(error.message) ? "Projects aren't set up yet — run the Phase 2 SQL." : error.message };
  return { ok: true, id: made?.id, text: `Project "${row.name}" created.` };
}

// ---------- the client request inbox (requests are tasks with status "proposed", so Waiting on you and WhatsApp keep working) ----------
async function requestsList(tid: string) {
  const { data: rows, error } = await supabase.from("tasks").select("id, title, detail, client_id, project_id, source, tier, effort_minutes, due_date, created_at, proposal_rank, area, kind").eq("tenant_id", tid).eq("status", "proposed").order("created_at", { ascending: false }).limit(100);
  if (error) return { ok: false, text: error.message, requests: [] };
  // Fill in the client and a time estimate for a few new ones each look (Archie's guess, shown as such)
  let budget = 4;
  for (const r of rows ?? []) {
    if (budget <= 0) break;
    if (Number(r.effort_minutes) > 0) continue;   // estimated once; the client match is best-effort
    budget--;
    const est = await taskEstimate(tid, String(r.title ?? ""), String(r.detail ?? ""));
    const upd: Record<string, unknown> = { effort_minutes: est.minutes, kind: est.kind };
    r.effort_minutes = est.minutes;
    if (!r.area) upd.area = est.area;
    if (!r.client_id && est.client_id) { upd.client_id = est.client_id; r.client_id = est.client_id; }
    await supabase.from("tasks").update(upd).eq("tenant_id", tid).eq("id", r.id);
  }
  const names = await clientNames(tid, (rows ?? []).map((r: any) => r.client_id));
  const { data: projs } = await supabase.from("forge_projects").select("id, name").eq("tenant_id", tid).eq("archived", false).neq("status", "complete").limit(200);
  const pName: Record<string, string> = {}; for (const x of projs ?? []) pName[x.id] = x.name;
  const srcWord = (s: string) => /whatsapp|wa/i.test(s) ? "WhatsApp" : /email|gmail/i.test(s) ? "Email" : /manual|page/i.test(s) ? "Added by you" : /call|fathom/i.test(s) ? "Call notes" : s ? "Messages" : "Messages";
  const requests = (rows ?? []).map((r: any) => ({ id: r.id, title: r.title, description: r.detail ?? "", client_id: r.client_id ?? null, client_name: r.client_id ? names[r.client_id] ?? null : null,
    source: srcWord(String(r.source ?? "")), priority: ["must", "high", "bonus"].includes(r.tier) ? r.tier : "high", minutes: Math.max(15, Number(r.effort_minutes) || 30), deadline: r.due_date ?? null,
    project_id: r.project_id ?? null, project_name: r.project_id ? pName[r.project_id] ?? null : null, received: r.created_at, status: "new" }));
  return { ok: true, requests, count: requests.length, text: requests.length ? `${requests.length} request${requests.length === 1 ? "" : "s"} to sort:\n${requests.slice(0, 8).map((r: any, i: number) => `${i + 1}. ${r.title}${r.client_name ? ` (${r.client_name})` : ""}`).join("\n")}` : "No client requests waiting." };
}

async function requestAdd(tid: string, handle: string, p: any) {
  const title = String(p.title ?? "").trim(); if (!title) return { ok: false, text: "What's the request?" };
  const { data: row, error } = await supabase.from("tasks").insert({ tenant_id: tid, owner: handle || null, title: title.slice(0, 200), detail: String(p.description ?? p.notes ?? "").trim().slice(0, 2000) || null,
    client_id: p.client_id ? String(p.client_id) : null, project_id: p.project_id ? String(p.project_id) : null, tier: ["must", "high", "bonus"].includes(String(p.priority ?? "")) ? String(p.priority) : "high",
    effort_minutes: Number(p.minutes) > 0 ? Math.max(15, Math.min(480, Math.round(Number(p.minutes) / 15) * 15)) : null, due_date: /^\d{4}-\d{2}-\d{2}$/.test(String(p.deadline ?? "")) ? String(p.deadline) : null,
    status: "proposed", source: String(p.source ?? "manual").slice(0, 40), kind: "shallow" }).select("id").maybeSingle();
  if (error) return { ok: false, text: error.message };
  return { ok: true, id: row?.id, text: "Request added to your inbox." };
}

// Accept → a real task (optionally on a day, in a project, with a priority/length/deadline); decline → dismissed
async function requestAccept(tid: string, handle: string, p: any) {
  const id = String(p.id ?? "");
  const { data: r } = await supabase.from("tasks").select("id, title, detail, effort_minutes, area, kind").eq("tenant_id", tid).eq("id", id).eq("status", "proposed").maybeSingle();
  if (!r) return { ok: false, text: "That request has already been dealt with." };
  const upd: Record<string, unknown> = { status: "open", proposal_rank: null, owner: handle || undefined };
  if (["must", "high", "bonus"].includes(String(p.priority ?? p.tier ?? ""))) upd.tier = String(p.priority ?? p.tier);
  if (Number(p.minutes) > 0) upd.effort_minutes = Math.max(15, Math.min(480, Math.round(Number(p.minutes) / 15) * 15));
  if (p.deadline !== undefined || p.due !== undefined) { const d = String(p.deadline ?? p.due ?? ""); upd.due_date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
  if (p.project_id !== undefined) upd.project_id = p.project_id ? String(p.project_id) : null;
  if (p.client_id !== undefined) upd.client_id = p.client_id ? String(p.client_id) : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(p.date ?? "")) ? String(p.date) : null;
  if (date) { upd.pinned_date = date; upd.hold = false; }
  if (p.inbox === true || String(p.inbox) === "true") { upd.hold = true; upd.pinned_date = null; }
  if ((!r.effort_minutes && !upd.effort_minutes) || !r.area) {
    const est = await taskEstimate(tid, String(r.title), String(r.detail ?? ""));
    if (!r.effort_minutes && !upd.effort_minutes) upd.effort_minutes = est.minutes;
    if (!r.area) upd.area = est.area;
    if (!r.kind || r.kind === "shallow") upd.kind = est.kind;
  }
  if (upd.owner === undefined) delete upd.owner;
  const { error } = await supabase.from("tasks").update(upd).eq("tenant_id", tid).eq("id", id);
  if (error) return { ok: false, text: error.message };
  await forgePlan(tid, { force: true, from_now: true });
  return await taskLanded(tid, handle, id, date, "Accepted");
}

// ---------- the Overview: workload at a glance ----------
async function forgeOverview(tid: string, handle: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const { data: m } = handle ? await supabase.from("team_members").select("*").eq("tenant_id", tid).eq("handle", handle).maybeSingle()
    : await supabase.from("team_members").select("*").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  if (!m) return { ok: false, text: "No such person." };
  const dow = new Date(today + "T12:00:00Z").getUTCDay();
  const monday = dow === 6 ? addDays(today, 2) : dow === 0 ? addDays(today, 1) : addDays(today, -((dow + 6) % 7));
  const week = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));
  const [{ data: open }, { data: doneWeek }, L, projects, requests] = await Promise.all([
    selNewCols((cols) => supabase.from("tasks").select(cols).eq("tenant_id", tid).eq("owner", m.handle).in("status", ["open", "doing", "waiting"]).limit(500), "id, title, status, tier, effort_minutes, due_date, scheduled_start, area, move_count, hold, critical, client_id, project_id, waiting_on, moves_acked"),
    supabase.from("tasks").select("effort_minutes, area, updated_at").eq("tenant_id", tid).eq("owner", m.handle).eq("status", "done").gte("updated_at", isoAtTz(monday, "00:00", tz)).limit(500),
    dayLoads(tid, m.handle, monday, 5),
    projectsList(tid),
    requestsList(tid),
  ]);
  const tasks = open ?? [];
  const actionable = tasks.filter((t: any) => t.status !== "waiting");
  const dayOf = (t: any) => t.scheduled_start ? localDate(Date.parse(t.scheduled_start), tz) : null;
  const unplaced: any[] = Array.isArray(m.forge_unplaced) ? m.forge_unplaced : [];
  // Weekly capacity, Monday to Friday, with the growth / clients / admin split
  const days = week.map((d) => {
    const load = L.days.find((x) => x.date === d);
    const past = d < today;
    // Past days show what got done; today and later show what's planned (plus anything already done today)
    const planned = past ? [] : actionable.filter((t: any) => dayOf(t) === d);
    const done = (doneWeek ?? []).filter((t: any) => localDate(Date.parse(t.updated_at), tz) === d);
    const split = { growth: 0, clients: 0, admin: 0 } as Record<string, number>;
    for (const t of [...planned, ...done]) split[["growth", "clients", "admin"].includes(t.area) ? t.area : "admin"] += Math.max(15, Number(t.effort_minutes) || 30);
    const allocated = planned.reduce((a: number, t: any) => a + Math.max(15, Number(t.effort_minutes) || 30), 0);
    const cached = (Array.isArray(m.forge_days_cache) ? m.forge_days_cache : []).find((x: any) => x?.date === d);
    // The day's task-hours limit applies to growth work too (the planner never goes past it), so available = min(limit, free time)
    const maxMin = Math.round((Number(m.max_task_hours ?? 6) || 6) * 60);
    const available = past ? 0 : (cached ? Math.min(maxMin, Number(cached.free ?? 0)) : Number(load?.cap ?? 0));
    return { date: d, past, today: d === today, available, allocated, remaining: Math.max(0, available - allocated), done: done.reduce((a: number, t: any) => a + Math.max(15, Number(t.effort_minutes) || 30), 0), split, over: !past && allocated > available && available > 0 };
  });
  const ahead = days.filter((d) => !d.past);
  const weekAvail = ahead.reduce((a, d) => a + d.available, 0), weekAlloc = ahead.reduce((a, d) => a + d.allocated, 0);
  const warnings: string[] = [];
  for (const d of days) if (d.over) warnings.push(`${dayName(d.date)} has ${hrs(d.allocated)} planned but only ${hrs(d.available)} free.`);
  if (weekAlloc > weekAvail && weekAvail > 0) warnings.push(`This week has ${hrs(weekAlloc)} of work planned and ${hrs(weekAvail)} free. Something needs to move.`);
  if (m.forge_calendar_ok === false && m.forge_calendar_error) warnings.unshift(m.forge_calendar_error);
  // Needs attention
  const attention: { kind: string; id: string; title: string; text: string; project?: boolean }[] = [];
  for (const t of actionable) if (t.due_date && String(t.due_date) < today) attention.push({ kind: "overdue", id: t.id, title: t.title, text: `Overdue since ${dayName(t.due_date)}` });
  for (const pr of (projects.projects ?? []) as any[]) {
    if (pr.overdue) attention.push({ kind: "project_overdue", id: pr.id, title: pr.name, text: `Project deadline was ${dayName(pr.deadline)}`, project: true });
    if (pr.no_next_action) attention.push({ kind: "no_next_action", id: pr.id, title: pr.name, text: "No next action. What's the next step?", project: true });
  }
  for (const t of actionable) { const since = (Number(t.move_count) || 0) - (Number(t.moves_acked) || 0); if (!t.hold && since >= 3) attention.push({ kind: "carried", id: t.id, title: t.title, text: `Moved ${since} times${Number(t.moves_acked) ? " since you last decided" : ""}. Do it, delegate it, or drop it?` }); }
  for (const u of unplaced) attention.push({ kind: u.kind === "late" ? "late" : "no_room", id: u.id, title: u.title, text: u.reason });
  for (const t of tasks.filter((x: any) => x.status === "waiting")) attention.push({ kind: "waiting", id: t.id, title: t.title, text: t.waiting_on ? `Waiting on ${t.waiting_on}` : "Waiting on the client" });
  const rank: Record<string, number> = { overdue: 0, project_overdue: 1, late: 2, no_room: 3, no_next_action: 4, carried: 5, waiting: 6 };
  attention.sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9));
  const metrics = {
    due_today: actionable.filter((t: any) => String(t.due_date ?? "") === today).length,
    overdue: actionable.filter((t: any) => t.due_date && String(t.due_date) < today).length,
    active_projects: projects.active_count ?? 0,
    waiting_on_clients: tasks.filter((t: any) => t.status === "waiting").length,
    hours_free_this_week: Math.round((days.reduce((a, d) => a + d.remaining, 0) / 60) * 10) / 10,
    wont_fit: unplaced.length,
    requests: requests.count ?? 0,
  };
  const text = `This week: ${hrs(weekAlloc)} planned of ${hrs(weekAvail)} free. ${metrics.overdue} overdue, ${metrics.due_today} due today, ${metrics.active_projects} active projects, ${metrics.waiting_on_clients} waiting on clients, ${metrics.wont_fit} won't fit.${warnings.length ? `\n⚠️ ${warnings[0]}` : ""}`;
  return { ok: true, today, metrics, projects: (projects.projects ?? []).filter((x: any) => x.status !== "complete"), week: days, warnings, attention: attention.slice(0, 30), requests: (requests.requests ?? []).slice(0, 5), text };
}

// v9.13: what needs attention — overdue, carried over 3+ times, landing after its deadline, didn't fit
async function forgeAttention(tid: string, handle: string, today: string, unplaced: any[]) {
  const { data: open } = await selNewCols((cols) => supabase.from("tasks").select(cols).eq("tenant_id", tid).eq("owner", handle).in("status", ["open", "doing"]).limit(300), "id, title, due_date, move_count, hold, critical, moves_acked");
  const out: { id: string; title: string; kind: string; text: string }[] = [];
  for (const t of open ?? []) {
    if (t.critical) out.push({ id: t.id, title: t.title, kind: "critical", text: "Critical" });
    if (t.due_date && String(t.due_date) < today) out.push({ id: t.id, title: t.title, kind: "overdue", text: `Overdue since ${new Date(t.due_date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}` });
    const since = (Number(t.move_count) || 0) - (Number(t.moves_acked) || 0);
    if (!t.hold && since >= 3) out.push({ id: t.id, title: t.title, kind: "carried", text: `Moved ${since} times${Number(t.moves_acked) ? " since you last decided" : ""}. Do it, delegate it, or drop it?` });
  }
  for (const u of unplaced) out.push({ id: u.id, title: u.title, kind: u.kind === "late" ? "late" : "no_room", text: u.reason });
  const rank: Record<string, number> = { critical: 0, overdue: 1, late: 2, no_room: 3, carried: 4 };
  return out.sort((a, b) => (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9)).slice(0, 25);
}

async function forgePlanGet(tid: string, handle: string, days = 5) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone, ghl_token, ghl_location_id, forge_caps").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const { data: m } = handle
    ? await supabase.from("team_members").select("*").eq("tenant_id", tid).eq("handle", handle).maybeSingle()
    : await supabase.from("team_members").select("*").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  if (!m) return { ok: false, error: "no such person" };
  const until = Date.parse(isoAtTz(addDays(today, Math.max(1, Math.min(10, days))), "00:00", tz));
  const { data: tasks } = await selNewCols((cols) => supabase.from("tasks").select(cols).eq("tenant_id", tid).eq("owner", m.handle).in("status", ["open", "doing"]).not("scheduled_start", "is", null).lt("scheduled_start", new Date(until).toISOString()).order("scheduled_start"), "id, title, tier, plan_slot, kind, effort_minutes, due_date, scheduled_start, scheduled_end, move_count, pinned_date, detail, area, client_id, critical, project_id, checklist, moves_acked");
  // v9.11.3: client names for the task sheet
  const cIds = [...new Set((tasks ?? []).map((t: any) => t.client_id).filter(Boolean))];
  const cName: Record<string, string> = {};
  if (cIds.length) { const { data: cs } = await supabase.from("clients").select("id, name").eq("tenant_id", tid).in("id", cIds); for (const c of cs ?? []) cName[c.id] = c.name; }
  const pIds = [...new Set((tasks ?? []).map((t: any) => t.project_id).filter(Boolean))];
  const pNm: Record<string, string> = {};
  if (pIds.length) { const { data: ps } = await supabase.from("forge_projects").select("id, name").eq("tenant_id", tid).in("id", pIds); for (const x of ps ?? []) pNm[x.id] = x.name; }
  const sheet = (b: any) => ({ project_id: b.project_id ?? null, project_name: b.project_id ? pNm[b.project_id] ?? null : null, checklist: Array.isArray(b.checklist) ? b.checklist : [], critical: !!b.critical, move_count: Number(b.move_count) || 0, moves_since: (Number(b.move_count) || 0) - (Number(b.moves_acked) || 0), tier: b.tier ?? "high", notes: b.detail ?? "", area: ["growth", "clients", "admin"].includes(b.area) ? b.area : null, client_id: b.client_id ?? null, client_name: b.client_id ? cName[b.client_id] ?? null : null, minutes: Math.max(15, Number(b.effort_minutes) || 30) });
  // Calendar events for the same days (to show around the blocks)
  let events: any[] = [];
  if (m.ghl_user_id) {
    const from = Date.parse(isoAtTz(today, "00:00", tz));
    const ev = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/calendars/events?locationId=${cfg?.ghl_location_id}&userId=${m.ghl_user_id}&startTime=${from}&endTime=${until}`, "GET", undefined, "2021-04-15");
    events = (ev.json?.events ?? []).filter((e: any) => !String(e.title ?? "").startsWith("🔨") && !["cancelled", "invalid"].includes(String(e.appointmentStatus ?? "").toLowerCase()))
      .map((e: any) => ({ title: e.title, start: e.startTime, end: e.endTime, personal: e.calendarId === m.personal_calendar_id }));
  }
  const t2 = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
  const byDay: Record<string, any> = {};
  for (const t of tasks ?? []) { const dd = localDate(Date.parse(t.scheduled_start), tz); (byDay[dd] ??= { date: dd, blocks: [], events: [] }).blocks.push({ ...t, from: t2(t.scheduled_start), to: t2(t.scheduled_end) }); }
  for (const e of events) { const dd = localDate(Date.parse(e.start), tz); (byDay[dd] ??= { date: dd, blocks: [], events: [] }).events.push({ ...e, from: t2(e.start), to: t2(e.end) }); }
  const todays = byDay[today];
  // Today as a 3:3:3 board
  const board: Record<string, any[]> = { must: [], high: [], bonus: [] };
  for (const b of todays?.blocks ?? []) (board[b.plan_slot ?? b.tier] ?? board.high).push({ id: b.id, title: b.title, from: b.from, to: b.to, effort_minutes: b.effort_minutes, moved: Number(b.move_count) || 0, lifted: !!b.plan_slot && b.plan_slot !== b.tier, ...sheet(b) });
  const { data: doneToday } = await supabase.from("tasks").select("title, tier, plan_slot").eq("tenant_id", tid).eq("owner", m.handle).eq("status", "done").gte("updated_at", isoAtTz(today, "00:00", tz));
  const items = todays ? [...todays.events.map((e: any) => ({ at: e.from, line: `${e.from}–${e.to} ${e.title} (calendar)` })), ...todays.blocks.map((b: any) => ({ at: b.from, line: `${b.from}–${b.to} ${b.title}${b.tier === "must" ? " (must)" : ""}${Number(b.move_count) >= 2 ? ` (moved ${b.move_count}x)` : ""}` }))].sort((a, b) => a.at.localeCompare(b.at)) : [];
  const wont: string[] = Array.isArray(m.forge_wont_fit) ? m.forge_wont_fit : [];
  const boardText = ["must", "high", "bonus"].map((k) => { const lab = k === "must" ? "🔴 Must" : k === "high" ? "🟠 To-do" : "🟢 Bonus"; return board[k].length ? `${lab}\n${board[k].map((x: any) => `• ${x.from} ${x.title}`).join("\n")}` : ""; }).filter(Boolean).join("\n\n");
  const today_text = boardText ? `Today in Forge (3:3:3):\n\n${boardText}${(doneToday ?? []).length ? `\n\n✅ Done: ${(doneToday ?? []).length}` : ""}${wont.length ? `\n\nWon't fit this week: ${wont.slice(0, 3).join(", ")} — move one, give it away, or drop it?` : ""}` : items.length ? `Today's plan:\n${items.map((x) => x.line).join("\n")}${wont.length ? `\n\nWon't fit this week: ${wont.slice(0, 3).join(", ")} — move one, give it away, or drop it?` : ""}` : `No tasks planned for today${wont.length ? ` — and these won't fit this week: ${wont.slice(0, 3).join(", ")}` : "."}`;
  return {
    ok: true, handle: m.handle, today, board, done_today: (doneToday ?? []).length,
    today_list: [...board.must.map((x: any) => ({ ...x, slot: "must" })), ...board.high.map((x: any) => ({ ...x, slot: "high" })), ...board.bonus.map((x: any) => ({ ...x, slot: "bonus" }))],
    remaining_today: board.must.length + board.high.length + board.bonus.length,
    day_complete: board.must.length + board.high.length + board.bonus.length === 0 && (doneToday ?? []).length > 0,
    days: Object.values(byDay).sort((a: any, b: any) => a.date.localeCompare(b.date)).map((d: any) => {
      const bd: Record<string, any[]> = { must: [], high: [], bonus: [] };
      for (const b of d.blocks ?? []) (bd[b.plan_slot ?? b.tier] ?? bd.high).push({ id: b.id, title: b.title, from: b.from, to: b.to, effort_minutes: b.effort_minutes, pinned: !!b.pinned_date, lifted: !!b.plan_slot && b.plan_slot !== b.tier, ...sheet(b) });
      return { ...d, board: bd };
    }),
    wont_fit: wont, today_text,
    // v9.13: what didn't fit (with why + earliest day), calendar health, real capacity per day, and what needs attention
    unplaced: Array.isArray(m.forge_unplaced) ? m.forge_unplaced : [],
    calendar: { ok: m.forge_calendar_ok !== false, error: m.forge_calendar_error ?? null },
    capacity: Array.isArray(m.forge_days_cache) ? m.forge_days_cache : [],
    caps: (() => { const c = String(m.forge_caps ?? cfg?.forge_caps ?? "2,3,2").split(",").map((x: string) => Number(x) || 0); return { must: c[0] ?? 2, high: c[1] ?? 3, bonus: c[2] ?? 2 }; })(),
    attention: await forgeAttention(tid, m.handle, today, Array.isArray(m.forge_unplaced) ? m.forge_unplaced : []),
    hours: { work_start: hm(m.work_start, "09:00"), work_end: hm(m.work_end, "17:30"), lunch_start: m.lunch_start ?? null, lunch_end: m.lunch_end ?? null, work_days: m.work_days ?? "1,2,3,4,5", calendar_blocks: !!m.calendar_blocks, max_task_hours: Number(m.max_task_hours ?? 6), buffer_minutes: Number(m.buffer_minutes ?? 10), block_days: Number(m.block_days ?? 2), personal_calendar_set: !!m.personal_calendar_id, growth_start: m.growth_start ?? null, growth_end: m.growth_end ?? null, growth_days: m.growth_days ?? null, personal_blocks: cleanBlocks(m.personal_blocks).map((b) => ({ ...b, days: b.days.join(",") })), work_hours: dayWindows(m.work_hours), growth_windows: dayWindows(m.growth_windows) },
  };
}

// ===================== v7.2: carousel builder =====================
const CAROUSEL_STYLE = [
  "Premium editorial software campaign photography for a vertical 4:5 social post.",
  "Charcoal-black, dark room, soft directional window light from one side, realistic shadows, subtle film grain, natural skin texture, candid and real — editorial art direction, not advertising.",
  "Minimal, restrained, sophisticated. One restrained red accent (#E53935) only if it appears naturally in the scene; otherwise none.",
  "ABSOLUTELY NO TEXT, letters, numbers, logos, watermarks, captions or interface copy anywhere in the image. Any screens must be abstract, precise and minimal with no readable text.",
  "No icons, badges, emojis, neon, glow, gradients, sparks, smoke, robots, AI brains, buttons, decorative elements, clutter or fake dashboards.",
  "A single photograph — never a collage, contact sheet, split panels or multiple frames.",
].join(" ");

async function geminiImage(prompt: string, aspect = "4:5"): Promise<{ ok: boolean; bytes?: Uint8Array; mime?: string; error?: string; model?: string }> {
  const key = Deno.env.get("GEMINI_API_KEY") ?? "";
  if (!key) return { ok: false, error: "GEMINI_API_KEY missing" };
  const models = [...new Set([Deno.env.get("GEMINI_IMAGE_MODEL"), "gemini-3.1-flash-image", "gemini-3.1-flash-image-preview", "gemini-2.5-flash-image"].filter(Boolean) as string[])];
  let lastErr = "";
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } } }),
    });
    const js: any = await r.json().catch(() => null);
    if (!r.ok) { lastErr += `${lastErr ? " | " : ""}${model}: ${r.status} ${String(js?.error?.message ?? "").slice(0, 80)}`; continue; }
    const part = (js?.candidates?.[0]?.content?.parts ?? []).find((pp: any) => pp.inlineData?.data || pp.inline_data?.data);
    const d = part?.inlineData ?? part?.inline_data;
    if (!d?.data) { lastErr += `${lastErr ? " | " : ""}${model}: no image returned`; continue; }
    const bin = atob(d.data); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { ok: true, bytes, mime: d.mimeType ?? d.mime_type ?? "image/png", model };
  }
  // Fallback: OpenAI's image model (portrait; the template crops to fit)
  const oKey = Deno.env.get("OPENAI_API_KEY");
  if (oKey) {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST", headers: { Authorization: `Bearer ${oKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1", prompt: prompt.slice(0, 3900), size: aspect === "16:9" ? "1536x1024" : "1024x1536", quality: "medium", n: 1 }),
    });
    const js: any = await r.json().catch(() => null);
    const b64 = js?.data?.[0]?.b64_json;
    if (r.ok && b64) {
      const bin = atob(b64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return { ok: true, bytes, mime: "image/png", model: Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1" };
    }
    lastErr += ` | openai: ${r.status} ${String(js?.error?.message ?? "").slice(0, 100)}`;
  }
  return { ok: false, error: lastErr };
}

async function carouselStart(tid: string, handle: string, p: any) {
  const topic = String(p.topic ?? "").trim().slice(0, 600);
  const given: any[] = Array.isArray(p.slides) ? p.slides : [];
  if (!topic && !given.length) return { ok: false, error: "What's the carousel about?" };
  if (p.source !== "stack") { const gateC: any = await allowance(tid, "carousels"); if (!gateC.ok) return { ok: false, error: gateC.text, text: gateC.text }; }
  const format = String(p.format ?? "carousel") === "story" ? "story" : "carousel";
  const n = Math.max(format === "story" ? 1 : 3, Math.min(10, Number(p.slides_count ?? (given.length || (format === "story" ? 3 : 7)))));
  const { data: row, error } = await supabase.from("carousels").insert({ tenant_id: tid, handle, format, source: p.source === "stack" ? "stack" : null, topic: topic || String(given[0]?.headline ?? "Carousel"), status: "writing", slides: given.length ? given : null, brief: String(p.brief ?? "").slice(0, 600) || null }).select("id").single();
  if (error || !row) return { ok: false, error: error?.message ?? "couldn't start" };
  startInBackground(carouselPipeline(tid, row.id, n));
  return { ok: true, id: row.id, text: `On it — writing and designing ${given.length || n} ${format === "story" ? "story frames" : "slides"}. Usually ready in 3–5 minutes; I'll message you when it's done.` };
}

async function carouselPipeline(tid: string, id: string, n: number) {
  try {
    const { data: car } = await supabase.from("carousels").select("*").eq("id", id).single();
    const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
    const { data: t } = await supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle();
    let slides: any[] = Array.isArray(car.slides) ? car.slides : [];
    // 1. Write the campaign (unless they gave their own copy)
    if (!slides.length) {
      const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
      const agentId = await agentIdFor(tid, "content", token, loc);
      if (!agentId) throw new Error("Archie Content agent not found");
      const msg = [
        `Use your create-carousel skill in EDITORIAL MODE (Archie's carousel builder). Write a ${n}-${car.format === "story" ? "frame Instagram STORY sequence" : "slide Instagram carousel"} about: ${car.topic}`,
        car.brief ? `Notes from the owner: ${car.brief}` : "",
        "Return ONLY JSON: {\"slides\":[{\"headline\":[\"LINE\",\"LINE\"],\"support\":\"SHORT LINE\",\"accent_word\":\"WORD or empty\",\"photo\":\"the photo brief\"}],\"caption\":\"the caption, written with your caption skill\"}",
        "",
        await businessContext(tid),
      ].filter(Boolean).join("\n");
      let parsed: any = null;
      for (let attempt = 0; attempt < 2 && !parsed?.slides?.length; attempt++) {
        const res = await agentExecute(token, agentId, { locationId: loc, message: (attempt ? "Reply with VALID JSON only — no line breaks inside any text value.\n\n" : "") + msg.slice(0, 9400) }, `carousel-${tid}-${Date.now()}`);
        const m = tidy(clean(String(res.json?.finalText ?? ""))).match(/\{[\s\S]*\}/);
        try { parsed = m ? looseJson(m[0]) : null; } catch { parsed = null; }
      }
      slides = (parsed?.slides ?? []).slice(0, n);
      if (!slides.length) throw new Error("the copy didn't come back — try again");
      await supabase.from("carousels").update({ caption: String(parsed?.caption ?? "").slice(0, 2200) || null }).eq("id", id);
    }
    const total = slides.length;
    slides = slides.map((sl: any, i: number) => ({
      n: i + 1, counter: car.format === "story" ? `${i + 1}/${total}` : `${String(i + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`,
      headline: (Array.isArray(sl.headline) ? sl.headline : String(sl.headline ?? "").split(/\n|\s*\/\s*/)).map((x: string) => String(x).toUpperCase().trim()).filter(Boolean).slice(0, 5),
      support: String(sl.support ?? "").toUpperCase().slice(0, 80), accent_word: String(sl.accent_word ?? sl.accentWord ?? "").trim(),
      photo: String(sl.photo ?? sl.visual ?? ""), status: "queued",
    }));
    await supabase.from("carousels").update({ slides, status: "designing", updated_at: new Date().toISOString() }).eq("id", id);
    // 2. Each slide: photo (no text) → typography on the grid
    for (const sl of slides) await carouselMakeSlide(tid, id, sl, cfg, t?.business_name, car.format);
    const { data: fin } = await supabase.from("carousels").select("slides").eq("id", id).single();
    const okCount = (fin?.slides ?? []).filter((x: any) => x.status === "done").length;
    await supabase.from("carousels").update({ status: okCount ? "done" : "failed", updated_at: new Date().toISOString() }).eq("id", id);
    if (!okCount) await sendToMember(tid, car.handle, `⚠️ Sorry — your ${car.format === "story" ? "story" : "carousel"} about "${String(car.topic ?? "").slice(0, 60)}" didn't work: none of the pictures could be made. Try again in a few minutes, or tell me if it keeps happening.`);
    else if (okCount < slides.length) await sendToMember(tid, car.handle, `Heads up: ${slides.length - okCount} of the ${slides.length} ${car.format === "story" ? "frames" : "slides"} didn't work. Open Content → Carousels and tap "Redo photo" on the missing ones.`);
    if (okCount) await sendToTeam(tid, car.format === "story" ? `📱 Your story's ready: "${(slides[0]?.headline ?? []).join(" ")}" (${okCount} frames). Open Content to check it, or reply "post the story" to put the frames in Social Planner as drafts.` : `🖼️ Your carousel's ready: "${(slides[0]?.headline ?? []).join(" ")}" (${okCount} slides). Open Content → Carousels to check it, or reply "post the carousel" to put it in Social Planner as a draft.`, "", "carousel");
  } catch (e) {
    await supabase.from("carousels").update({ status: "failed", error: String(e).slice(0, 300), updated_at: new Date().toISOString() }).eq("id", id);
    try { const { data: c0 } = await supabase.from("carousels").select("handle, topic, format").eq("id", id).maybeSingle(); await sendToMember(tid, c0?.handle ?? null, `⚠️ Sorry — your ${c0?.format === "story" ? "story" : "carousel"} didn't work: I couldn't write it this time. Try again in a minute.`); } catch { /* best effort */ }
  }
}

async function carouselMakeSlide(tid: string, id: string, sl: any, cfg: any, businessName?: string, format = "carousel") {
  const save = async (patch: any) => {
    const { data: cur } = await supabase.from("carousels").select("slides").eq("id", id).single();
    const arr = (cur?.slides ?? []).map((x: any) => (x.n === sl.n ? { ...x, ...patch } : x));
    await supabase.from("carousels").update({ slides: arr, updated_at: new Date().toISOString() }).eq("id", id);
  };
  try {
    await save({ status: "photo" });
    const img = format === "story"
      ? await geminiImage(`${CAROUSEL_STYLE.replace("vertical 4:5 social post", "vertical 9:16 Instagram story")}\n\nSCENE: ${sl.photo || "a business owner at a desk early in the morning, laptop open, coffee beside them"}.\nCompose for a 4:5 frame: subject centred, nothing important at the very top or bottom.`, "4:5")
      : await geminiImage(`${CAROUSEL_STYLE}\n\nSCENE: ${sl.photo || "a business owner at a desk early in the morning, laptop open, coffee beside them, quietly focused"}.\nCompose with the subject entirely in the RIGHT third of the frame; keep the left two-thirds dark and mostly empty.`);
    if (!img.ok || !img.bytes) throw new Error(`photo: ${img.error}`);
    const path = `carousels/${tid}/${id}/${sl.n}-photo.${(img.mime ?? "").includes("jpeg") ? "jpg" : "png"}`;
    const up = await supabase.storage.from(CLIPS_BUCKET).upload(path, img.bytes, { contentType: img.mime, upsert: true });
    if (up.error) throw new Error(`storage: ${up.error.message}`);
    const { data: signed } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 3600);
    await save({ status: "typesetting", photo_path: path });
    const brandAccent = cfg?.carousel_accent || "#E53935";
    const still: any = await renderStillOnLambda({
      region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any, functionName: Deno.env.get("REMOTION_FUNCTION")!, serveUrl: Deno.env.get("REMOTION_SERVE_URL")!,
      composition: format === "story" ? "ArchieStory" : "ArchieSlide", imageFormat: "png", privacy: "no-acl",
      inputProps: { imageUrl: signed?.signedUrl, counter: sl.counter, headline: sl.headline, support: sl.support, wordmark: String(cfg?.carousel_wordmark || businessName || "ARCHIE"), accent: brandAccent, accentWord: sl.accent_word, imageSide: "right" },
    } as any);
    const url = String(still?.url ?? "");
    if (!url) throw new Error("typesetting returned no image");
    // Into GHL Media (by link)
    let mediaUrl = "";
    try {
      const fd = new FormData();
      fd.append("hosted", "true"); fd.append("fileUrl", url); fd.append("name", `Carousel ${sl.counter.replace("/", " of ")} — ${(sl.headline ?? []).join(" ").slice(0, 40)}.png`);
      const r = await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${cfg?.ghl_location_id}`, { method: "POST", headers: { Authorization: `Bearer ${cfg?.ghl_token || FALLBACK_TOKEN}`, Version: "2021-07-28" }, body: fd });
      const js: any = await r.json().catch(() => null);
      mediaUrl = String(js?.url ?? js?.fileUrl ?? "");
    } catch { /* the S3 link still works */ }
    await save({ status: "done", image_url: url, media_url: mediaUrl || null, model: img.model, error: null });
  } catch (e) {
    await save({ status: "failed", error: String(e).slice(0, 200) });
  }
}

async function carouselGet(tid: string, id: string) {
  const { data } = await supabase.from("carousels").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
  return data ? { ok: true, carousel: data } : { ok: false, error: "not found" };
}

// Redo one slide: new photo, or new words ({headline:[], support, accent_word, photo})
async function carouselRedoSlide(tid: string, id: string, n: number, p: any) {
  const { data: car } = await supabase.from("carousels").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!car) return { ok: false, error: "not found" };
  const sl = (car.slides ?? []).find((x: any) => x.n === n);
  if (!sl) return { ok: false, error: "no such slide" };
  const next = {
    ...sl,
    headline: Array.isArray(p.headline) ? p.headline.map((x: string) => String(x).toUpperCase()) : sl.headline,
    support: p.support !== undefined ? String(p.support).toUpperCase() : sl.support,
    accent_word: p.accent_word !== undefined ? String(p.accent_word) : sl.accent_word,
    photo: p.photo ? String(p.photo) : sl.photo,
  };
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const { data: t } = await supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle();
  await supabase.from("carousels").update({ slides: (car.slides ?? []).map((x: any) => (x.n === n ? next : x)), planner_post_id: null }).eq("id", id);
  startInBackground(carouselMakeSlide(tid, id, next, cfg, t?.business_name, car.format));
  return { ok: true, text: `Redoing slide ${n} — about a minute.` };
}

async function carouselPost(tid: string, id: string) {
  const { data: car } = await supabase.from("carousels").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!car) return { ok: false, text: "Carousel not found." };
  if (car.planner_post_id) return { ok: true, text: "That carousel's already in Social Planner as a draft." };
  const urls = (car.slides ?? []).filter((x: any) => x.status === "done").sort((a: any, b: any) => a.n - b.n).map((x: any) => x.media_url || x.image_url);
  if (urls.length < (car.format === "story" ? 1 : 2)) return { ok: false, text: "It isn't finished yet." };
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token").eq("tenant_id", tid).single();
  if (car.format === "story") {
    let made = 0, lastErr = "", accs: string[] = [];
    for (const u of urls) { const rs: any = await toPlanner({ tid, ghlToken: cfg?.ghl_token || FALLBACK_TOKEN }, { type: "story", media_url: u, media_type: "image/png" }); if (rs.ok) { made++; accs = rs.accounts ?? accs; } else lastErr = rs.error; }
    if (!made) return { ok: false, text: `I couldn't add the story to Social Planner: ${lastErr}` };
    await supabase.from("carousels").update({ planner_post_id: "story" }).eq("id", id);
    return { ok: true, text: `✅ ${made} story frame${made === 1 ? "" : "s"} added to Social Planner as drafts${accs.length ? ` for ${accs.join(", ")}` : ""}. Schedule them a few minutes apart, in order.` };
  }
  const r: any = await toPlanner({ tid, ghlToken: cfg?.ghl_token || FALLBACK_TOKEN }, { type: "post", text: car.caption || car.topic, media_urls: urls, media_type: "image/png" });
  if (!r.ok) return { ok: false, text: `I couldn't add it to Social Planner: ${r.error}` };
  await supabase.from("carousels").update({ planner_post_id: r.post_id ?? "added" }).eq("id", id);
  return { ok: true, text: `✅ Carousel added to Social Planner as a draft (${urls.length} slides)${r.accounts?.length ? ` for ${r.accounts.join(", ")}` : ""}. Open Social Planner to pick the time.` };
}

// ===================== v7.3: feature usage + feedback =====================
async function logFeature(tid: string, feature: string, channel: string, handle: string | null, ok = true) {
  try { await supabase.from("feature_events").insert({ tenant_id: tid, feature: String(feature).slice(0, 80), channel, handle, ok }); } catch { /* never block */ }
}

async function saveFeedback(tid: string, handle: string | null, p: any) {
  const rating = Number(p.rating) > 0 ? 1 : Number(p.rating) < 0 ? -1 : 0;
  let feature = String(p.feature ?? "").trim();
  if (!feature) {
    // What were they reacting to? Their last feature used in the past 2 hours
    const { data: last } = await supabase.from("feature_events").select("feature").eq("tenant_id", tid).gte("created_at", new Date(Date.now() - 2 * 3600000).toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
    feature = last?.feature ?? "general";
  }
  const { error } = await supabase.from("feature_feedback").insert({ tenant_id: tid, handle, feature, rating, comment: String(p.comment ?? "").slice(0, 1000) || null, ref_id: p.ref_id ? String(p.ref_id) : null, channel: String(p.channel ?? "page") });
  return error ? { ok: false, text: "Couldn't save that feedback." } : { ok: true, feature, text: rating < 0 ? "Thanks — noted. Want me to redo it?" : "Thanks — noted." };
}

// Across all clients (agency account) or just this one: what's used, what isn't, what people think
async function featureReport(tid: string, days = 30) {
  const { data: me } = await supabase.from("tenant_config").select("is_agency").eq("tenant_id", tid).maybeSingle();
  const all = !!me?.is_agency;
  const since = new Date(Date.now() - Math.max(7, Math.min(365, days)) * 86400000).toISOString();
  let q = supabase.from("feature_events").select("tenant_id, feature, channel, handle, created_at").gte("created_at", since).limit(50000);
  if (!all) q = q.eq("tenant_id", tid);
  const { data: ev } = await q;
  let fq = supabase.from("feature_feedback").select("tenant_id, feature, rating, comment, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(2000);
  if (!all) fq = fq.eq("tenant_id", tid);
  const { data: fb } = await fq;
  // Skill runs live in screen_runs too
  let sq = supabase.from("screen_runs").select("tenant_id, skill, created_at").gte("created_at", since).not("skill", "is", null).limit(20000);
  if (!all) sq = sq.eq("tenant_id", tid);
  const { data: runs } = await sq;
  const rows = new Map<string, { feature: string; uses: number; tenants: Set<string>; people: Set<string>; channels: Record<string, number>; last: string; up: number; down: number; comments: string[] }>();
  const get = (f: string) => { let r = rows.get(f); if (!r) { r = { feature: f, uses: 0, tenants: new Set(), people: new Set(), channels: {}, last: "", up: 0, down: 0, comments: [] }; rows.set(f, r); } return r; };
  for (const e of ev ?? []) { const r = get(e.feature); r.uses++; r.tenants.add(e.tenant_id); if (e.handle) r.people.add(`${e.tenant_id}:${e.handle}`); r.channels[e.channel] = (r.channels[e.channel] ?? 0) + 1; if (e.created_at > r.last) r.last = e.created_at; }
  for (const s of runs ?? []) { const f = `skill:${s.skill}`; if ((ev ?? []).some((e: any) => e.feature === f && e.tenant_id === s.tenant_id && Math.abs(Date.parse(e.created_at) - Date.parse(s.created_at)) < 60000)) continue; const r = get(f); r.uses++; r.tenants.add(s.tenant_id); r.channels["skill run"] = (r.channels["skill run"] ?? 0) + 1; if (s.created_at > r.last) r.last = s.created_at; }
  for (const f of fb ?? []) { const r = get(f.feature); if (f.rating > 0) r.up++; else if (f.rating < 0) r.down++; if (f.comment && r.comments.length < 5) r.comments.push(f.comment); }
  // Skills that exist but nobody used = candidates to cut
  const { data: catalog } = await supabase.from("skills_catalog").select("key, name, enabled").eq("enabled", true);
  const unused = (catalog ?? []).filter((k: any) => !rows.has(`skill:${k.key}`)).map((k: any) => k.key);
  const list = [...rows.values()].map((r) => ({ feature: r.feature, uses: r.uses, clients: r.tenants.size, people: r.people.size, channels: r.channels, last_used: r.last || null, thumbs_up: r.up, thumbs_down: r.down, comments: r.comments }))
    .sort((a, b) => b.uses - a.uses);
  const top = list.slice(0, 5).map((x) => `${x.feature} (${x.uses})`).join(", ");
  const low = list.filter((x) => x.uses <= 2).map((x) => x.feature).slice(0, 8).join(", ");
  const disliked = list.filter((x) => x.thumbs_down > x.thumbs_up && x.thumbs_down >= 2).map((x) => `${x.feature} (${x.thumbs_down} 👎)`).join(", ");
  return {
    ok: true, scope: all ? "all clients" : "this account", days, features: list, unused_skills: unused,
    text: [`Last ${days} days${all ? " across all clients" : ""}:`, top ? `Most used: ${top}.` : "No usage yet.", low ? `Barely used: ${low}.` : "", unused.length ? `Never used: ${unused.slice(0, 10).join(", ")}.` : "", disliked ? `Needs work (more 👎 than 👍): ${disliked}.` : ""].filter(Boolean).join("\n"),
  };
}

// ===================== v7.4: activation, "what Archie did for you", month video =====================
async function activationInfo(tid: string) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [{ data: msgs }, { data: feats }, { count: reels }, { count: ig }] = await Promise.all([
    supabase.from("talk_messages").select("created_at").eq("tenant_id", tid).eq("role", "user").gte("created_at", since).limit(500),
    supabase.from("feature_events").select("feature").eq("tenant_id", tid).gte("created_at", since).limit(2000),
    supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "done"),
    supabase.from("ig_connections").select("tenant_id", { count: "exact", head: true }).eq("tenant_id", tid),
  ]);
  return {
    active_days_7: new Set((msgs ?? []).map((m: any) => String(m.created_at).slice(0, 10))).size,
    features_7: new Set((feats ?? []).map((f: any) => f.feature)).size,
    first_reel: (reels ?? 0) > 0, instagram_connected: (ig ?? 0) > 0,
  };
}

// What Archie did this month — in pounds and hours. Hours use fixed, conservative minutes per job (shown in the text).
const MINUTES_SAVED: Record<string, number> = { brief: 15, checkin: 5, reel: 45, carousel: 60, story: 20, dump: 10, prep: 10, draft: 5, plan: 10 };
async function monthStats(tid: string, month?: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("stripe_key, timezone").eq("tenant_id", tid).maybeSingle();
  const m = /^\d{4}-\d{2}$/.test(String(month ?? "")) ? String(month) : new Date().toISOString().slice(0, 7);
  const [y, mo] = m.split("-").map(Number);
  const from = new Date(Date.UTC(y, mo - 1, 1)).toISOString(), to = new Date(Date.UTC(y, mo, 1)).toISOString();
  const between = (q: any, col = "created_at") => q.gte(col, from).lt(col, to);
  const [briefs, checkins, reels, posted, carousels, dumps, preps, drafts, tasksDone, plans] = await Promise.all([
    between(supabase.from("briefs").select("brief_date", { count: "exact", head: true }).eq("tenant_id", tid), "brief_date").then((r: any) => r.count ?? 0),
    between(supabase.from("message_drafts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "sent"), "sent_at").then((r: any) => r.count ?? 0),
    between(supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "done").or("kind.is.null,kind.neq.month")).then((r: any) => r.count ?? 0),
    between(supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).not("planner_post_id", "is", null)).then((r: any) => r.count ?? 0),
    between(supabase.from("carousels").select("format").eq("tenant_id", tid).eq("status", "done")).then((r: any) => r.data ?? []),
    between(supabase.from("dumps").select("id", { count: "exact", head: true }).eq("tenant_id", tid)).then((r: any) => r.count ?? 0),
    between(supabase.from("agent_usage").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("job", "prep")).then((r: any) => r.count ?? 0),
    between(supabase.from("message_drafts").select("id", { count: "exact", head: true }).eq("tenant_id", tid)).then((r: any) => r.count ?? 0),
    between(supabase.from("tasks").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "done"), "updated_at").then((r: any) => r.count ?? 0),
    between(supabase.from("feature_events").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("feature", "archie_plan")).then((r: any) => r.count ?? 0),
  ]);
  const carCount = carousels.filter((c: any) => c.format !== "story").length, storyCount = carousels.filter((c: any) => c.format === "story").length;
  // Money recovered: Stripe invoices that failed at least once and were then paid this month
  let recovered = 0, recoveredCount = 0;
  if (cfg?.stripe_key) {
    try {
      const page: any = await stripeGet(cfg.stripe_key, `invoices?status=paid&limit=100&created[gte]=${Math.floor(Date.parse(from) / 1000) - 45 * 86400}`);
      for (const inv of page?.data ?? []) {
        const paidAt = Number(inv.status_transitions?.paid_at ?? 0) * 1000;
        if (Number(inv.attempt_count ?? 1) > 1 && paidAt >= Date.parse(from) && paidAt < Date.parse(to)) { recovered += Number(inv.amount_paid ?? 0) / 100; recoveredCount++; }
      }
    } catch { /* optional */ }
  }
  const minutes = briefs * MINUTES_SAVED.brief + checkins * MINUTES_SAVED.checkin + reels * MINUTES_SAVED.reel + carCount * MINUTES_SAVED.carousel + storyCount * MINUTES_SAVED.story + dumps * MINUTES_SAVED.dump + preps * MINUTES_SAVED.prep + Math.max(0, drafts - checkins) * MINUTES_SAVED.draft + plans * MINUTES_SAVED.plan;
  const hours = Math.round(minutes / 60);
  const monthName = new Date(Date.UTC(y, mo - 1, 15)).toLocaleDateString("en-GB", { month: "long" });
  const lines = [
    `What Archie did for you in ${monthName}:`,
    recovered ? `£${Math.round(recovered).toLocaleString("en-GB")} recovered from ${recoveredCount} failed payment${recoveredCount === 1 ? "" : "s"}` : "",
    `About ${hours} hours saved`,
    checkins ? `${checkins} check-ins and follow-ups sent` : "",
    reels ? `${reels} reel${reels === 1 ? "" : "s"} edited${posted ? `, ${posted} posted` : ""}` : "",
    carCount || storyCount ? `${carCount ? `${carCount} carousel${carCount === 1 ? "" : "s"}` : ""}${carCount && storyCount ? " and " : ""}${storyCount ? `${storyCount} stor${storyCount === 1 ? "y" : "ies"}` : ""} designed` : "",
    briefs ? `${briefs} morning briefs` : "",
    tasksDone ? `${tasksDone} tasks done` : "",
    `(Hours are worked out at ${MINUTES_SAVED.brief} min a brief, ${MINUTES_SAVED.reel} min a reel, ${MINUTES_SAVED.carousel} min a carousel, ${MINUTES_SAVED.checkin} min a check-in.)`,
  ].filter(Boolean);
  const stats = [
    recovered ? { value: Math.round(recovered), prefix: "£", label: "RECOVERED", sub: `from ${recoveredCount} failed payment${recoveredCount === 1 ? "" : "s"}` } : null,
    { value: hours, suffix: " HRS", label: "SAVED", sub: "admin Archie did for you" },
    checkins ? { value: checkins, label: "CHECK-INS SENT", sub: "to clients who needed one" } : null,
    reels ? { value: reels, label: "REELS EDITED", sub: posted ? `${posted} posted` : "" } : null,
    tasksDone ? { value: tasksDone, label: "TASKS DONE", sub: "" } : null,
  ].filter(Boolean).slice(0, 5);
  return { ok: true, month: m, month_name: monthName, recovered, recovered_count: recoveredCount, hours, checkins, reels, posted, carousels: carCount, stories: storyCount, briefs, tasks_done: tasksDone, stats, text: lines.join("\n") };
}

async function monthVideo(tid: string, st: any) {
  if (!st?.stats?.length) return;
  const { data: cfg } = await supabase.from("tenant_config").select("carousel_wordmark, carousel_accent, brand_primary").eq("tenant_id", tid).maybeSingle();
  const { data: t } = await supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle();
  const { data: owner } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  const nextMonth = new Date(Date.UTC(Number(st.month.slice(0, 4)), Number(st.month.slice(5, 7)), 15)).toLocaleDateString("en-GB", { month: "long" }).toUpperCase();
  const props = { month: String(st.month_name).toUpperCase(), business: t?.business_name ?? "", wordmark: cfg?.carousel_wordmark || "ARCHIE", accent: cfg?.carousel_accent || "#E53935", stats: st.stats, closing: `HERE'S TO ${nextMonth}.` };
  const render: any = await renderMediaOnLambda({
    region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any, functionName: Deno.env.get("REMOTION_FUNCTION")!, serveUrl: Deno.env.get("REMOTION_SERVE_URL")!,
    composition: "ArchieMonth", inputProps: props, codec: "h264", privacy: "no-acl", framesPerLambda: 300, outName: `month-${tid.slice(0, 8)}-${st.month}.mp4`,
  } as any);
  await supabase.from("edit_jobs").insert({ tenant_id: tid, handle: owner?.handle ?? "owner", kind: "month", title: `${st.month_name} with Archie`, status: "rendering", render_id: render.renderId, bucket: render.bucketName, source_url: "month", seconds: Math.round((3 + st.stats.length * 4 + 3)) });
}

// ===================== v7.5: voice brief, screenshot anything, win back =====================
async function openai(path: string, body: unknown) {
  const key = Deno.env.get("OPENAI_API_KEY") ?? "";
  return await fetch(`https://api.openai.com/v1/${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

// The brief as a ~60–90 second voice note (Archie's own voice — never a clone of anyone's)
async function briefVoice(tid: string, member: any, briefText: string) {
  try {
    const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, brief_channel, voice_name, timezone").eq("tenant_id", tid).single();
    const sr = await openai("chat/completions", { model: "gpt-4o-mini", temperature: 0.5, messages: [
      { role: "system", content: "Turn this WhatsApp morning brief into a spoken script for a 60–90 second voice note from Archie, a friendly, direct assistant. Speak to them by first name. Lead with the one focus, then the 3–4 things that matter most, then one line to close. No lists, no emojis, no symbols, no URLs — just natural spoken sentences. Say amounts like 'two hundred and ninety-seven pounds'. Under 220 words." },
      { role: "user", content: `Name: ${member.name ?? member.handle}\n\n${briefText.slice(0, 4000)}` },
    ] });
    const sj: any = await sr.json().catch(() => null);
    const script = String(sj?.choices?.[0]?.message?.content ?? "").trim();
    if (!script) return;
    const ar = await openai("audio/speech", { model: "gpt-4o-mini-tts", voice: cfg?.voice_name || "onyx", input: script, response_format: "mp3", instructions: "Warm, upbeat, clear British-friendly delivery, like a capable assistant giving a morning rundown." });
    if (!ar.ok) return;
    const bytes = new Uint8Array(await ar.arrayBuffer());
    const path = `voice/${tid}/${new Date().toISOString().slice(0, 10)}-${member.handle}.mp3`;
    const up = await supabase.storage.from(CLIPS_BUCKET).upload(path, bytes, { contentType: "audio/mpeg", upsert: true });
    if (up.error) return;
    const { data: signed } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 7 * 86400);
    const channel = String(cfg?.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WhatsApp" : "SMS";
    await ghl(cfg?.ghl_token || FALLBACK_TOKEN, "/conversations/messages", "POST", { type: channel, contactId: member.ghl_contact_id, message: "🎧 Your brief as a voice note", attachments: [signed?.signedUrl] }, "2021-04-15");
  } catch { /* the text brief already went */ }
}

// Screenshot anything: Archie reads the picture and acts — lead, tasks, a reply draft
async function screenshotAct(tid: string, handle: string, imageUrl: string, instruction: string) {
  { const gate: any = await allowance(tid, "screenshots"); if (!gate.ok) return { ok: false, text: gate.text }; }
  const key = Deno.env.get("GEMINI_API_KEY") ?? "";
  if (!key) return { ok: false, text: "I can't read screenshots yet (GEMINI_API_KEY missing)." };
  const img = await fetch(imageUrl);
  if (!img.ok) return { ok: false, text: "I couldn't open that image — try sending it again." };
  const buf = new Uint8Array(await img.arrayBuffer());
  let bin = ""; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192));
  // Work out the real image type from the file's first bytes (WhatsApp links often say application/octet-stream)
  const b = buf;
  const mime = b[0] === 0xff && b[1] === 0xd8 ? "image/jpeg"
    : b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 ? "image/png"
    : b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 ? "image/webp"
    : b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 ? "image/heic"
    : b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 ? "image/gif"
    : "image/jpeg";
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id, timezone").eq("tenant_id", tid).single();
  const today = localDate(Date.now(), cfg?.timezone || "Europe/London");
  const ask = [
    "You are Archie, a business owner's assistant. They've sent you a screenshot (a DM, a WhatsApp, an email, a booking request, a spreadsheet, a note…). Work out what it is and what they need doing.",
    instruction ? `What they said with it: ${instruction}` : "They sent it with no message — decide the useful action yourself.",
    `Today is ${today}.`,
    "Only use what's actually in the image. Don't invent names, numbers or dates.",
    "Return ONLY JSON:",
    '{"what":"one line: what this is","person":{"name":"","phone":"","email":"","instagram":""},"is_new_lead":true|false,"they_want":"one line","reply":"a short reply in a warm, direct, human tone the owner can send (empty if none needed)","tasks":[{"title":"","due_date":"YYYY-MM-DD or empty","tier":"must|high|bonus","minutes":15}],"note":"anything worth remembering about this person (empty if none)"}',
    "",
    await businessContext(tid),
  ].join("\n");
  const models = [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"].filter(Boolean) as string[])];
  let out: any = null, lastErr = "";
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: mime, data: btoa(bin) } }, { text: ask }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.3 } }) });
    const js: any = await r.json().catch(() => null);
    if (!r.ok) { lastErr += `${lastErr ? " | " : ""}${model} ${r.status} ${String(js?.error?.message ?? "").slice(0, 80)}`; console.log("screenshot gemini", model, r.status, JSON.stringify(js?.error ?? {}).slice(0, 300)); continue; }
    try { out = looseJson(String(js?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "")); break; } catch { lastErr += `${lastErr ? " | " : ""}${model}: not JSON`; }
  }
  if (!out) { console.log("screenshot failed", lastErr); return { ok: false, text: `I couldn't read that one — try again in a minute. (${lastErr.slice(0, 160)})` }; }
  const done: string[] = [];
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  // New lead → into GHL contacts (only with something real to go on)
  const pr = out.person ?? {};
  if (out.is_new_lead && (pr.phone || pr.email || pr.instagram || pr.name)) {
    const [first, ...rest] = String(pr.name ?? "").trim().split(/\s+/);
    const r = await ghl(token, "/contacts/upsert", "POST", { locationId: loc, firstName: first || undefined, lastName: rest.join(" ") || undefined, phone: pr.phone || undefined, email: pr.email || undefined, source: "Screenshot via Archie", tags: ["archie-lead"] }, "2021-07-28");
    const cid = r.json?.contact?.id;
    if (cid) {
      done.push(`added ${pr.name || pr.instagram || "them"} to your contacts as a lead`);
      const noteBody = [out.they_want ? `Wants: ${out.they_want}` : "", pr.instagram ? `Instagram: ${pr.instagram}` : "", out.note || ""].filter(Boolean).join(" · ");
      if (noteBody) await ghl(token, `/contacts/${cid}/notes`, "POST", { body: `[from a screenshot] ${today} — ${noteBody}` }, "2021-07-28");
    }
  }
  // Tasks
  for (const t of (Array.isArray(out.tasks) ? out.tasks : []).slice(0, 5)) {
    const title = String(t?.title ?? "").trim(); if (!title) continue;
    const due = /^\d{4}-\d{2}-\d{2}$/.test(String(t?.due_date ?? "")) ? String(t.due_date) : null;
    const { error } = await supabase.from("tasks").insert({ tenant_id: tid, title: title.slice(0, 200), tier: ["must", "high", "bonus"].includes(t?.tier) ? t.tier : "high", kind: "shallow", effort_minutes: Math.max(15, Number(t?.minutes) || 15), status: "open", owner: handle || null, source: "screenshot", source_ref: `shot:${crypto.randomUUID()}`, due_date: due, accepted_by: handle || null, accepted_at: new Date().toISOString() });
    if (!error) done.push(`task: ${title}${due ? ` (${due === today ? "today" : due})` : ""}`);
  }
  const reply = String(out.reply ?? "").trim();
  return {
    ok: true, read: out,
    text: [`📸 ${out.what ?? "Got it"}.`, done.length ? `Done: ${done.join("; ")}.` : "", reply ? `\nReply you can send:\n${reply}` : "", `\nSay "save it" if you want the screenshot kept in your media too.`].filter(Boolean).join("\n"),
  };
}

// Win back everyone who left: cancelled Stripe subscriptions → personal drafts for each, in their voice
async function winBack(tid: string, months = 12) {
  { const gate: any = await allowance(tid, "winback"); if (!gate.ok) return { ok: false, text: gate.text }; }
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  if (!cfg?.stripe_key) return { ok: false, text: "I need Stripe connected to find who's left (Settings → Connections)." };
  const since = Math.floor((Date.now() - Math.max(1, Math.min(36, months)) * 30 * 86400000) / 1000);
  const page: any = await stripeGet(cfg.stripe_key, `subscriptions?status=canceled&limit=100&expand[]=data.customer`);
  const subs: any[] = (page?.data ?? []).filter((sb: any) => Number(sb.canceled_at ?? sb.ended_at ?? 0) >= since);
  if (!subs.length) return { ok: true, text: `Nobody cancelled in the last ${months} months — nice.` };
  // One per person (latest cancellation), with how long they stayed and what they paid
  const people = new Map<string, any>();
  for (const sb of subs) {
    const c = sb.customer ?? {}; const email = String(c.email ?? "").toLowerCase(); if (!email || people.has(email)) continue;
    const amt = (sb.items?.data ?? []).reduce((a: number, it: any) => a + Number(it.price?.unit_amount ?? 0) / 100 * Number(it.quantity ?? 1), 0);
    people.set(email, { email, name: c.name ?? "", started: new Date(Number(sb.start_date) * 1000).toISOString().slice(0, 10), ended: new Date(Number(sb.canceled_at ?? sb.ended_at) * 1000).toISOString().slice(0, 10), months: Math.max(1, Math.round((Number(sb.canceled_at ?? sb.ended_at) - Number(sb.start_date)) / (30 * 86400))), amount: Math.round(amt), reason: sb.cancellation_details?.feedback ?? sb.cancellation_details?.comment ?? "" });
  }
  const token = cfg.ghl_token || FALLBACK_TOKEN, loc = cfg.ghl_location_id;
  const found: any[] = [];
  for (const pp of [...people.values()].slice(0, 25)) {
    const r = await ghl(token, `/contacts/?locationId=${loc}&query=${encodeURIComponent(pp.email)}&limit=1`, "GET", undefined, "2021-07-28");
    const ct = r.json?.contacts?.[0];
    if (!ct?.id) continue;
    const nt = await ghl(token, `/contacts/${ct.id}/notes`, "GET", undefined, "2021-07-28");
    const notes = (nt.json?.notes ?? []).slice(0, 3).map((n: any) => String(n.body ?? "").replace(/\s+/g, " ").slice(0, 200)).join(" | ");
    found.push({ ...pp, id: ct.id, first: ct.firstName || String(pp.name).split(" ")[0] || "there", name: [ct.firstName, ct.lastName].filter(Boolean).join(" ") || pp.name, phone: ct.phone, notes });
  }
  if (!found.length) return { ok: true, text: `${people.size} people cancelled, but I couldn't match them to contacts in GHL (by email).` };
  const agentId = await agentIdFor(tid, "sales", token, loc) || await agentIdFor(tid, "content", token, loc);
  if (!agentId) return { ok: false, text: "Couldn't find the Sales agent to write the messages." };
  const msg = [
    "Use your win-back skill to write one message to each past client below.",
    'Return ONLY JSON: {"messages":[{"email":"","message":""}]}',
    "",
    "PAST CLIENTS:",
    ...found.map((f) => `- ${f.name} (${f.email}): with us ${f.months} month${f.months === 1 ? "" : "s"} (${f.started} to ${f.ended}), £${f.amount}/month${f.reason ? `, reason given: ${f.reason}` : ""}${f.notes ? `. Notes: ${f.notes}` : ""}`),
    "",
    await businessContext(tid),
  ].join("\n").slice(0, 9500);
  const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `winback-${tid}-${Date.now()}`);
  let written: any[] = [];
  try { const mm = tidy(clean(String(res.json?.finalText ?? ""))).match(/\{[\s\S]*\}/); written = mm ? looseJson(mm[0]).messages ?? [] : []; } catch { written = []; }
  const today = localDate(Date.now(), cfg.timezone || "Europe/London");
  const { data: existing } = await supabase.from("message_drafts").select("rank").eq("tenant_id", tid).eq("status", "pending").eq("created_on", today);
  let rank = Math.max(0, ...(existing ?? []).map((r: any) => Number(r.rank) || 0));
  const channel = String(cfg.brief_channel ?? "").toLowerCase().includes("whatsapp") ? "WA" : "SMS";
  const made: string[] = [];
  for (const f of found) {
    const w = written.find((x: any) => String(x?.email ?? "").toLowerCase() === f.email);
    const body = String(w?.message ?? "").trim();
    if (!body) continue;
    rank++;
    const { error } = await supabase.from("message_drafts").insert({ tenant_id: tid, created_on: today, rank, status: "pending", source: "winback", contact_id: f.id, name: f.name, channel, body: body.slice(0, 1000) });
    if (error) rank--; else made.push(`${rank}. ${f.name} (left ${f.ended}): ${body.slice(0, 110)}…`);
  }
  return { ok: true, count: made.length, text: made.length ? `💌 ${made.length} past client${made.length === 1 ? "" : "s"} to win back — each message written for them:\n${made.join("\n")}\n\nSay "send them" to send all, "send 2" for one, or "bin 3".` : "I found them but the messages didn't come back — try again in a minute." };
}

// Read JSON from an agent reply, forgiving the usual mistakes: real line breaks / tabs inside strings, smart quotes,
// trailing commas, and text before or after the object.
function looseJson(raw: string): any {
  const text = String(raw ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(text); } catch { /* fix it below */ }
  let out = "", inStr = false, esc = false;
  for (const ch of text) {
    if (inStr) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === "\\") { out += ch; esc = true; continue; }
      if (ch === '"') { out += ch; inStr = false; continue; }
      if (ch === "\n") { out += "\\n"; continue; }
      if (ch === "\r") { continue; }
      if (ch === "\t") { out += "\\t"; continue; }
      if (ch.charCodeAt(0) < 32) { continue; }
      out += ch;
    } else {
      if (ch === '"') inStr = true;
      out += ch;
    }
  }
  out = out.replace(/[\u201C\u201D]/g, '\\"').replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(out);
}

// ===================== v7.7: Archie Edit v2 checks =====================
// Where is the face? Render one frame of the raw clip, ask Gemini for the face centre (0..1).
// v9.12.2: is this clip a screen recording? If so, its shape and where the camera bubble sits (fractions of the screen image)
type ClipLook = { kind: "screen" | "face"; aspect: number; bubble: { x: number; y: number; r: number } | null };
async function clipLook(videoUrl: string, duration: number): Promise<ClipLook> {
  const fallback: ClipLook = { kind: "face", aspect: 16 / 9, bubble: null };
  try {
    const still: any = await renderStillOnLambda({ region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any, functionName: Deno.env.get("REMOTION_FUNCTION")!, serveUrl: Deno.env.get("REMOTION_SERVE_URL")!, composition: "ArchieFrameWide", imageFormat: "jpeg", privacy: "no-acl", inputProps: { videoUrl, at: Math.max(0.3, Math.min((duration || 10) - 0.3, (duration || 10) * 0.4)) } } as any);
    const img = await fetch(String(still?.url ?? "")); if (!img.ok) return fallback;
    const buf = new Uint8Array(await img.arrayBuffer()); let bin = ""; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192));
    const key = Deno.env.get("GEMINI_API_KEY") ?? "";
    const ask = 'This is one frame from a video clip, shown uncropped (black bars may be padding). Is it mainly a SCREEN RECORDING (a computer or phone screen, an app, a website, slides) or a TALKING HEAD (a person filmed by a camera)? If it is a screen recording, give its shape (width divided by height, ignoring black bars) and, if there is a small circular or rounded camera bubble of a person overlaid on it, where that bubble is, measured inside the screen image itself (ignore black bars). Return ONLY JSON: {"kind":"screen","aspect":1.78,"bubble":{"x":0.1,"y":0.85,"r":0.08}} or {"kind":"face"}. x and y are the bubble centre as fractions of the screen image width and height; r is its radius as a fraction of the screen image width; use "bubble":null if there is no camera bubble.';
    for (const model of [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"].filter(Boolean) as string[])]) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: "image/jpeg", data: btoa(bin) } }, { text: ask }] }], generationConfig: { temperature: 0 } }) });
      if (!r.ok) continue;
      const js: any = await r.json().catch(() => null);
      const o = looseJson(String(js?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "{}"));
      if (!o || (o.kind !== "screen" && o.kind !== "face")) continue;
      if (o.kind === "face") return fallback;
      const a = Number(o.aspect); const aspect = a >= 1.2 && a <= 2.4 ? Math.round(a * 1000) / 1000 : 16 / 9;
      const b = o.bubble; let bubble: ClipLook["bubble"] = null;
      if (b && Number(b.x) >= 0 && Number(b.x) <= 1 && Number(b.y) >= 0 && Number(b.y) <= 1 && Number(b.r) > 0) bubble = { x: Math.round(Number(b.x) * 1000) / 1000, y: Math.round(Number(b.y) * 1000) / 1000, r: Math.min(0.3, Math.max(0.02, Math.round(Number(b.r) * 1000) / 1000)) };
      return { kind: "screen", aspect, bubble };
    }
  } catch { /* fallback */ }
  return fallback;
}

async function faceFocus(videoUrl: string, duration: number, frac = 0.3): Promise<{ x: number; y: number }> {
  const fallback = { x: 0.5, y: 0.38 };
  try {
    const still: any = await renderStillOnLambda({ region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any, functionName: Deno.env.get("REMOTION_FUNCTION")!, serveUrl: Deno.env.get("REMOTION_SERVE_URL")!, composition: "ArchieFrame", imageFormat: "jpeg", privacy: "no-acl", inputProps: { videoUrl, at: Math.max(0.3, Math.min((duration || 10) - 0.3, (duration || 10) * frac)) } } as any);
    const img = await fetch(String(still?.url ?? "")); if (!img.ok) return fallback;
    const buf = new Uint8Array(await img.arrayBuffer()); let bin = ""; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192));
    const key = Deno.env.get("GEMINI_API_KEY") ?? "";
    for (const model of [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"].filter(Boolean) as string[])]) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ inline_data: { mime_type: "image/jpeg", data: btoa(bin) } }, { text: 'Find the main person\'s face in this vertical video frame. Return ONLY JSON {"x":0.5,"y":0.4} — the face centre as fractions of width and height (0 to 1). If there is no face, return {"x":0.5,"y":0.4}.' }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }) });
      if (!r.ok) continue;
      const js: any = await r.json().catch(() => null);
      const o = looseJson(String(js?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "{}"));
      const x = Number(o?.x), y = Number(o?.y);
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
    }
  } catch { /* fallback */ }
  return fallback;
}

// Clean audio: ElevenLabs voice isolator on the raw clip (skipped for very large files or if no key)
async function cleanAudio(tid: string, id: string, videoUrl: string): Promise<string> {
  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) return "";
  try {
    const head = await fetch(videoUrl, { method: "HEAD" });
    const size = Number(head.headers.get("content-length") ?? 0);
    if (size && size > 90 * 1024 * 1024) return "";
    const vid = await fetch(videoUrl); if (!vid.ok) return "";
    const blob = await vid.blob();
    const fd = new FormData(); fd.append("audio", blob, "clip.mp4");
    const r = await fetch("https://api.elevenlabs.io/v1/audio-isolation", { method: "POST", headers: { "xi-api-key": key }, body: fd });
    if (!r.ok) { console.log("audio isolation", r.status, (await r.text()).slice(0, 200)); return ""; }
    const bytes = new Uint8Array(await r.arrayBuffer());
    const path = `clean/${tid}/${id}.mp3`;
    const up = await supabase.storage.from(CLIPS_BUCKET).upload(path, bytes, { contentType: "audio/mpeg", upsert: true });
    if (up.error) return "";
    const { data: signed } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(path, 3 * 86400);
    return signed?.signedUrl ?? "";
  } catch { return ""; }
}

const normWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

// After rendering: no chopped words (re-transcribe and compare) + a quick quality look, then deliver
async function v2Check(tid: string, job: any, url: string) {
  const notes: string[] = [];
  try {
    // 1. No chopped words
    const expected = (job.props?.captions ?? []).flatMap((g: any) => (g.words ?? []).map((w: any) => normWord(w.w))).filter(Boolean);
    const key = Deno.env.get("DEEPGRAM_API_KEY");
    if (key && expected.length) {
      const r = await fetch(`https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&language=en${await deepgramTerms(tid)}`, { method: "POST", headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const js: any = await r.json().catch(() => null);
      const heard = (js?.results?.channels?.[0]?.alternatives?.[0]?.words ?? []).map((w: any) => normWord(String(w.punctuated_word ?? w.word))).filter(Boolean);
      const bag = new Map<string, number>(); for (const h of heard) bag.set(h, (bag.get(h) ?? 0) + 1);
      let missing = 0; const missed: string[] = [];
      for (const e of expected) { const n = bag.get(e) ?? 0; if (n > 0) bag.set(e, n - 1); else { missing++; if (missed.length < 5) missed.push(e); } }
      const doubled = [...bag.values()].reduce((a, n) => a + n, 0) - Math.max(0, heard.length - expected.length - [...bag.values()].reduce((a, n) => a + n, 0));
      const extra = Math.max(0, heard.length - (expected.length - missing));
      const rate = missing / expected.length;
      if (rate > (Array.isArray(job.sources) && job.sources.length > 1 ? 0.1 : 0.04) && !(Number(job.pad_extra) > 0)) {
        // Widen every cut slightly and re-render once
        await supabase.from("edit_jobs").update({ status: "planning", pad_extra: 0.06, checked_at: null, render_id: null, output_url: null, updated_at: new Date().toISOString(), qa: { cut_check: `re-cut: ${missing} words looked clipped (${missed.join(", ")})` } }).eq("id", job.id);
        await runFresh("edit_run", { tenant_id: tid, id: job.id, replan: true, use_plan: true });
        return;
      }
      void doubled;
      notes.push(missing ? `Cut check: ${missing} word${missing === 1 ? "" : "s"} may be soft (${missed.join(", ")}).` : extra > 2 ? `Cut check: every word's there, but ${extra} extra word${extra === 1 ? "" : "s"} (a repeat?) slipped in.` : "Cut check: every word's there.");
    }
    // 2. Quick quality look (Gemini watches the finished reel)
    const gkey = Deno.env.get("GEMINI_API_KEY");
    if (gkey) {
      const vid = await fetch(url);
      if (vid.ok) {
        const buf = new Uint8Array(await vid.arrayBuffer());
        if (buf.length < 60 * 1024 * 1024) {
          const up = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${gkey}`, { method: "POST", headers: { "X-Goog-Upload-Command": "start, upload, finalize", "X-Goog-Upload-Header-Content-Length": String(buf.length), "X-Goog-Upload-Header-Content-Type": "video/mp4", "Content-Type": "video/mp4" }, body: buf });
          const uj: any = await up.json().catch(() => null);
          if (uj?.file?.name) {
            for (let i = 0; i < 20; i++) { const f: any = await fetch(`https://generativelanguage.googleapis.com/v1beta/${uj.file.name}?key=${gkey}`).then((x) => x.json()).catch(() => null); if (f?.state === "ACTIVE" || f?.state === "FAILED") break; await new Promise((ok) => setTimeout(ok, 3000)); }
            for (const model of [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"].filter(Boolean) as string[])]) {
              const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gkey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ file_data: { mime_type: "video/mp4", file_uri: uj.file.uri } }, { text: 'You are checking a finished vertical reel before it goes to the owner. Score it out of 100 against these rules: captions are ONE line and match the speech; nothing covers the speaker\'s face; on-screen text is short, readable and spelled right; each card shows one idea and stays up 2-3 seconds (not flickering); cards appear on the word they show; no empty, blank or frozen frames; key text sits between roughly 15% and 78% of the height (clear of Instagram\'s buttons); audio clear and even; the first second has a hook; the ending is not cut off. Return ONLY JSON {"score":0,"ok":true|false,"issues":["short plain-English issue"]} (max 3 issues, only real ones).' }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }) });
              if (!g.ok) continue;
              const gj: any = await g.json().catch(() => null);
              const q = looseJson(String(gj?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "{}"));
              const issues: string[] = Array.isArray(q?.issues) ? q.issues.map(String).slice(0, 3) : [];
              const score = Number(q?.score);
              notes.push(`${Number.isFinite(score) ? `Archie's check: ${Math.round(score)}/100` : "Archie's check"}${issues.length ? ` — spotted: ${issues.join("; ")}. Say "change something" to fix it.` : " — looks good."}`);
              break;
            }
          }
        }
      }
    }
  } catch (e) { notes.push(`(Check skipped: ${String(e).slice(0, 60)})`); }
  // The cover: a strong frame from the hook line + the hook text in the reel's style
  let coverUrl: string | null = null;
  try {
    const pr: any = job.props ?? {};
    const firstCut = (pr.cuts ?? [])[0];
    const vUrl = pr.videoUrls?.[firstCut?.src ?? 0] ?? pr.videoUrl ?? job.source_url;
    const hook = String(pr.hookText ?? job.title ?? "").slice(0, 60);
    if (firstCut && hook) {
      const still: any = await renderStillOnLambda({ region: (Deno.env.get("REMOTION_REGION") ?? "eu-west-2") as any, functionName: Deno.env.get("REMOTION_FUNCTION")!, serveUrl: Deno.env.get("REMOTION_SERVE_URL")!, composition: "ArchieCover", imageFormat: "jpeg", privacy: "no-acl", inputProps: { videoUrl: vUrl, at: Number(firstCut.start) + 0.6, hookText: hook, preset: pr.preset ?? "clean", focus: pr.focusList?.[firstCut?.src ?? 0] ?? pr.focus, brand: pr.brand } } as any);
      coverUrl = String(still?.url ?? "") || null;
      if (coverUrl) {
        const { data: c3 } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
        const saved: any = await ghlMediaFromUrl(c3?.ghl_token || FALLBACK_TOKEN, c3?.ghl_location_id, coverUrl, `Cover — ${job.title ?? "reel"}.jpg`).catch(() => null);
        if (saved?.url) coverUrl = saved.url;
      }
    }
  } catch (e) { console.log("cover failed", String(e).slice(0, 120)); }
  await supabase.from("edit_jobs").update({ status: "rendering", qa: { notes }, cover_url: coverUrl }).eq("id", job.id);
  // Hand back to the normal delivery (GHL Media + WhatsApp), now marked as checked
  const { data: fresh } = await supabase.from("edit_jobs").select("*").eq("id", job.id).single();
  if (fresh) await editCheck(tid, fresh);
}

// ===================== v7.7.1: style breakdown =====================
const STYLE_ASK = [
  "You are a senior short-form video editor. Study ONLY the editing style of this reel (not the topic) so another editor can recreate the look exactly. Be precise and measurable.",
  "Return ONLY JSON:",
  '{"vibe":"3-6 words","captions":{"style":"karaoke|word-by-word|2-4 word groups|full sentences|none","words_per_screen":0,"position":"top|middle|lower-third|bottom","size":"small|medium|large|huge","weight":"regular|bold|black","case":"upper|sentence|mixed","font_feel":"e.g. condensed sans, rounded, serif, handwritten","colours":"text colour, highlight colour, outline/shadow/box","animation":"how words appear (pop, slide, fade, typewriter, bounce) and how the highlight moves","emphasis":"how key words are treated"},"pacing":{"avg_shot_seconds":0,"jump_cuts":"none|some|constant","silences":"kept|trimmed|removed completely","speed_feel":"calm|steady|fast|frantic"},"zooms":{"per_10_seconds":0,"scale":"subtle 5-10%|medium 10-20%|punchy 20%+","style":"smooth push|snap punch-in|whip","triggers":"what makes it zoom"},"hook":{"on_screen_text":"yes/no + style","seconds":0,"position":"","tricks":"pattern interrupts in the first 2s"},"graphics":[{"type":"e.g. emoji, icon, number, list card, arrow, screenshot, b-roll, sticker","how_often":"","style":""}],"sound":{"music":"none|soft bed|prominent","sfx":"none|on cuts|on zooms|on text","voice":"raw|cleaned|compressed"},"look":{"colour_grade":"","framing":"tight face|chest up|wide|mixed","background":""},"cover":"","replicate":["5-8 concrete instructions to recreate this style in a template: e.g. captions 2-3 words, white 900 weight uppercase, yellow highlight on keyword, pop scale 0.8→1 over 6 frames; snap zoom 1.18 on every key claim; whoosh SFX on zooms"]}',
].join("\n");

async function styleBreakdown(tid: string, urls: string[], notify: boolean) {
  { const gate: any = await allowance(tid, "styles"); if (!gate.ok) { if (notify) await sendToTeam(tid, gate.text, "", "style"); return; } }
  const token = Deno.env.get("APIFY_API_TOKEN"), gkey = Deno.env.get("GEMINI_API_KEY");
  if (!token || !gkey || !urls.length) return;
  const done: string[] = [];
  for (const url of urls) {
    try {
      const r = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=240`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ directUrls: [url.split("?")[0]], resultsType: "posts", resultsLimit: 1 }) });
      const items: any[] = await r.json().catch(() => []);
      const it = Array.isArray(items) ? items.find((x) => x?.videoUrl) : null;
      if (!it?.videoUrl) { done.push(`${url.split("?")[0]} — couldn't fetch the video`); continue; }
      const vid = await fetch(it.videoUrl); if (!vid.ok) { done.push(`${url.split("?")[0]} — video download failed`); continue; }
      const buf = new Uint8Array(await vid.arrayBuffer());
      const up = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${gkey}`, { method: "POST", headers: { "X-Goog-Upload-Command": "start, upload, finalize", "X-Goog-Upload-Header-Content-Length": String(buf.length), "X-Goog-Upload-Header-Content-Type": "video/mp4", "Content-Type": "video/mp4" }, body: buf });
      const uj: any = await up.json().catch(() => null);
      if (!uj?.file?.name) { done.push(`${url.split("?")[0]} — upload to Gemini failed`); continue; }
      for (let i = 0; i < 30; i++) { const f: any = await fetch(`https://generativelanguage.googleapis.com/v1beta/${uj.file.name}?key=${gkey}`).then((x) => x.json()).catch(() => null); if (f?.state === "ACTIVE" || f?.state === "FAILED") break; await new Promise((ok) => setTimeout(ok, 3000)); }
      let spec: any = null;
      for (const model of [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"].filter(Boolean) as string[])]) {
        const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gkey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ file_data: { mime_type: "video/mp4", file_uri: uj.file.uri } }, { text: STYLE_ASK }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }) });
        if (!g.ok) continue;
        const gj: any = await g.json().catch(() => null);
        try { spec = looseJson(String(gj?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "")); spec.model = model; break; } catch { spec = null; }
      }
      if (!spec) { done.push(`${url.split("?")[0]} — couldn't read the style`); continue; }
      spec.creator = it.ownerUsername ?? null; spec.views = it.videoPlayCount ?? it.videoViewCount ?? null;
      const { data: specRow } = await supabase.from("style_specs").insert({ tenant_id: tid, url: url.split("?")[0], spec }).select("id").single();
      // Save it as a reel style they can switch on ("use @creator style")
      const st = specToStyle(spec);
      await supabase.from("custom_styles").insert({ tenant_id: tid, name: `${spec.creator ? "@" + spec.creator : "Custom"} style`, base: st.base, config: st.config, spec_id: specRow?.id ?? null });
      done.push(`${spec.creator ? "@" + spec.creator + " — " : ""}${spec.vibe ?? "studied"}: captions ${spec.captions?.style ?? "?"} (${spec.captions?.case ?? ""}, ${spec.captions?.position ?? ""}), ${spec.pacing?.speed_feel ?? "?"} pace, zooms ${spec.zooms?.style ?? "?"}`);
    } catch (e) { done.push(`${url.split("?")[0]} — ${String(e).slice(0, 60)}`); }
  }
  if (notify) await sendToTeam(tid, `🔍 Style breakdown done:\n${done.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\nEach one is saved as a reel style. Say "use @name style" to make it your default, or "edit in @name style" with a clip to try it once.`, "", "style");
}

// ===================== v7.8: plans and allowances =====================
// Archie = monthly limits on the heavier "wow" features; Plus = unlimited (fair use). Daily essentials are never limited.
const PLAN_LIMITS: Record<string, Record<string, number | null>> = {
  archie: { reels: 12, weeks: 2, carousels: 8, accounts: 6, screenshots: 30, winback: 1, council: 4, styles: 0, youtube: 0 },
  plus:   { reels: null, weeks: null, carousels: null, accounts: 15, screenshots: null, winback: null, council: null, styles: 3, youtube: null },
};
const ALLOW_LABEL: Record<string, string> = { youtube: "YouTube edits", reels: "reel edits", weeks: "weeks of content", carousels: "carousels and stories", accounts: "accounts to learn from", screenshots: "screenshots", winback: "win-back campaigns", council: "second opinions", styles: "custom reel styles" };

async function allowanceUsed(tid: string, key: string): Promise<number> {
  const monthStart = `${new Date().toISOString().slice(0, 7)}-01T00:00:00Z`;
  const cnt = async (q: any) => ((await q).count ?? 0);
  switch (key) {
    case "reels": return cnt(supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", monthStart).neq("status", "failed").is("parent_id", null).or("multi.is.null,multi.eq.false").or("kind.is.null,kind.neq.month"));
    case "weeks": return cnt(supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", monthStart).eq("multi", true));
    case "carousels": return cnt(supabase.from("carousels").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", monthStart).neq("status", "failed").or("source.is.null,source.neq.stack"));
    case "accounts": return cnt(supabase.from("watched_accounts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("active", true));
    case "screenshots": return cnt(supabase.from("feature_events").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("feature", "screenshot").gte("created_at", monthStart));
    case "winback": return cnt(supabase.from("agent_usage").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("job", "winback").gte("created_at", monthStart));
    case "council": return cnt(supabase.from("agent_usage").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("job", "council").gte("created_at", monthStart));
    case "styles": return cnt(supabase.from("style_specs").select("id", { count: "exact", head: true }).eq("tenant_id", tid));
  }
  return 0;
}

async function allowance(tid: string, key: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("plan, is_agency").eq("tenant_id", tid).maybeSingle();
  if (cfg?.is_agency) return { ok: true, plan: "agency", used: 0, limit: null, left: null };
  const plan = String(cfg?.plan ?? "archie") === "plus" ? "plus" : "archie";
  const limit = PLAN_LIMITS[plan][key];
  if (limit === null || limit === undefined) return { ok: true, plan, used: 0, limit: null, left: null };
  const used = await allowanceUsed(tid, key);
  const left = Math.max(0, limit - used);
  if (left > 0) return { ok: true, plan, used, limit, left };
  const reset = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const text = limit === 0
    ? `${ALLOW_LABEL[key][0].toUpperCase()}${ALLOW_LABEL[key].slice(1)} come with Archie Plus — upgrade any time for unlimited reels, carousels and more.`
    : key === "accounts"
      ? `You're learning from ${limit} accounts — the most on your plan. Remove one to add another, or upgrade to Archie Plus for up to 15.`
      : `That's all ${limit} ${ALLOW_LABEL[key]} for this month — great going! They reset on ${reset}, or upgrade to Archie Plus for unlimited.`;
  return { ok: false, plan, used, limit, left: 0, text };
}

async function planUsage(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("plan, is_agency").eq("tenant_id", tid).maybeSingle();
  const plan = cfg?.is_agency ? "agency" : String(cfg?.plan ?? "archie") === "plus" ? "plus" : "archie";
  const rows: any[] = [];
  for (const key of Object.keys(PLAN_LIMITS.archie)) {
    const limit = plan === "agency" ? null : PLAN_LIMITS[plan][key];
    rows.push({ key, label: ALLOW_LABEL[key], used: await allowanceUsed(tid, key), limit });
  }
  const name = plan === "plus" ? "Archie Plus" : plan === "agency" ? "Agency (no limits)" : "Archie";
  const text = `Your plan: ${name}.\nThis month: ${rows.filter((r) => r.limit !== 0).map((r) => `${r.label} ${r.used}${r.limit === null ? "" : ` of ${r.limit}`}`).join(" · ")}.\n${plan === "archie" ? "Archie Plus makes these unlimited." : ""}`.trim();
  return { ok: true, plan, rows, text };
}

// ===================== v8.0: cost alert =====================
// Rough unit costs (£) for the non-chat work — tune these once real bills are in.
const UNIT_COST: Record<string, number> = { reel_v1: 0.06, reel_v2: 0.18, carousel_slide: 0.05, story_frame: 0.05, idea: 0.03, screenshot: 0.01, voice_brief: 0.02, style: 0.05 };
async function costInfo(tid: string) {
  const month = new Date().toISOString().slice(0, 7);
  const from = `${month}-01T00:00:00Z`;
  const { data: cfg } = await supabase.from("tenant_config").select("cost_budget_gbp").eq("tenant_id", tid).maybeSingle();
  const budget = Number(cfg?.cost_budget_gbp ?? 105) || 105;
  const u: any = await usage(tid, month);                     // AI agent runs (rate per run from tenant_config)
  const cnt = async (q: any) => ((await q).count ?? 0);
  const [r1, r2, cars, ideas, shots, voice, styles] = await Promise.all([
    cnt(supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", from).or("engine.is.null,engine.neq.v2").neq("status", "failed")),
    cnt(supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", from).eq("engine", "v2").neq("status", "failed")),
    supabase.from("carousels").select("format, slides").eq("tenant_id", tid).gte("created_at", from).then((r: any) => r.data ?? []),
    cnt(supabase.from("content_posts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).in("status", ["ready", "to_film", "filmed", "skipped", "failed"]).gte("updated_at", from)),
    cnt(supabase.from("feature_events").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("feature", "screenshot").gte("created_at", from)),
    cnt(supabase.from("team_members").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("brief_voice", true)),
    cnt(supabase.from("style_specs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).gte("created_at", from)),
  ]);
  const frames = (cars as any[]).reduce((a, c) => a + (Array.isArray(c.slides) ? c.slides.length : 0), 0);
  const day = new Date().getUTCDate(), days = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0)).getUTCDate();
  const parts: Record<string, number> = {
    "AI runs": Number(u.est_cost_gbp ?? 0),
    reels: r1 * UNIT_COST.reel_v1 + r2 * UNIT_COST.reel_v2,
    "carousels/stories": frames * UNIT_COST.carousel_slide,
    ideas: ideas * UNIT_COST.idea,
    screenshots: shots * UNIT_COST.screenshot,
    "voice briefs": voice * day * UNIT_COST.voice_brief,
    styles: styles * UNIT_COST.style,
  };
  const soFar = Object.values(parts).reduce((a, b) => a + b, 0);
  const projected = Math.round((soFar / Math.max(1, day)) * days * 100) / 100;
  const pct = Math.round((projected / budget) * 100);
  const top = Object.entries(parts).sort((a, b) => b[1] - a[1])[0];
  return {
    cost_so_far_gbp: Math.round(soFar * 100) / 100, cost_projected_gbp: projected, cost_budget_gbp: budget, cost_pct: pct,
    cost_level: pct >= 100 ? "red" : pct >= 70 ? "amber" : "green",
    cost_top: top ? `${top[0]} (£${Math.round(top[1] * 100) / 100} so far)` : "—",
    cost_parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Math.round(v * 100) / 100])),
  };
}

// ===================== v8.4: B-roll from the client's own clips =====================
async function brollSync(tid: string, notify = false) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const list = async (q: string) => { const r = await ghl(token, `/medias/files?altId=${loc}&altType=location&sortBy=createdAt&sortOrder=desc&limit=100${q}`, "GET", undefined, "2021-07-28"); return (r.json?.files ?? r.json?.medias ?? []) as any[]; };
  const folders = (await list("&type=folder")).filter((f: any) => /^b[\s_-]*roll$/i.test(String(f.name ?? "").trim()));
  if (!folders.length) return { ok: false, text: "I can't find a folder called \"B-roll\" in your GHL Media. Make one, drop in short clips and photos, then say \"refresh my B-roll\"." };
  const files: any[] = [];
  for (const f of folders) files.push(...(await list(`&type=file&parentId=${f._id ?? f.id}`)));
  const media = files.filter((f: any) => /\.(mp4|mov|m4v|webm|jpe?g|png|webp)(\?|$)/i.test(String(f.url ?? f.name ?? "")) || /video|image/i.test(String(f.contentType ?? f.type ?? "")));
  const { data: known } = await supabase.from("broll_library").select("media_id").eq("tenant_id", tid);
  const knownIds = new Set((known ?? []).map((k: any) => k.media_id));
  const fresh = media.filter((m: any) => !knownIds.has(String(m._id ?? m.id)));
  // retire ones removed from the folder
  const liveIds = new Set(media.map((m: any) => String(m._id ?? m.id)));
  const gone = (known ?? []).map((k: any) => k.media_id).filter((id: string) => !liveIds.has(id));
  if (gone.length) await supabase.from("broll_library").update({ active: false }).eq("tenant_id", tid).in("media_id", gone);
  let described = 0;
  for (const m of fresh.slice(0, 12)) {
    const url = String(m.url ?? "");
    const isImg = /\.(jpe?g|png|webp)(\?|$)/i.test(url) || /image/i.test(String(m.contentType ?? m.type ?? ""));
    const desc = await describeBroll(url, isImg);
    await supabase.from("broll_library").insert({ tenant_id: tid, media_id: String(m._id ?? m.id), name: String(m.name ?? "").slice(0, 200), url, kind: isImg ? "image" : "video", description: desc?.description ?? null, tags: desc?.tags ?? null, seconds: desc?.seconds ?? null, active: true });
    if (desc?.description) described++;
  }
  const text = fresh.length ? `🎞️ B-roll: found ${fresh.length} new item${fresh.length === 1 ? "" : "s"}${fresh.length > 12 ? " (described the first 12 — the rest follow tomorrow)" : ""}. Archie will start using them in your reels.` : `🎞️ B-roll is up to date (${media.length} item${media.length === 1 ? "" : "s"}).`;
  if (notify) { const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle(); await sendToMember(tid, o?.handle ?? null, text); }
  return { ok: true, found: media.length, fresh: fresh.length, described, text };
}

async function describeBroll(url: string, isImg: boolean): Promise<{ description: string; tags: string[]; seconds?: number } | null> {
  const key = Deno.env.get("GEMINI_API_KEY"); if (!key || !url) return null;
  try {
    const res = await fetch(url); if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length > 80 * 1024 * 1024) return null;
    const ask = 'Describe this B-roll for a video editor in one plain sentence (what is shown, the setting, the mood), then tags. Return ONLY JSON {"description":"…","tags":["…"],"seconds":0} (seconds = length for video, 0 for a photo).';
    let parts: any[];
    if (isImg) {
      let bin = ""; for (let i = 0; i < buf.length; i += 8192) bin += String.fromCharCode(...buf.subarray(i, i + 8192));
      const mime = buf[0] === 0x89 ? "image/png" : buf[0] === 0x52 ? "image/webp" : "image/jpeg";
      parts = [{ inline_data: { mime_type: mime, data: btoa(bin) } }, { text: ask }];
    } else {
      const up = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${key}`, { method: "POST", headers: { "X-Goog-Upload-Command": "start, upload, finalize", "X-Goog-Upload-Header-Content-Length": String(buf.length), "X-Goog-Upload-Header-Content-Type": "video/mp4", "Content-Type": "video/mp4" }, body: buf });
      const uj: any = await up.json().catch(() => null); if (!uj?.file?.name) return null;
      for (let i = 0; i < 20; i++) { const f: any = await fetch(`https://generativelanguage.googleapis.com/v1beta/${uj.file.name}?key=${key}`).then((x) => x.json()).catch(() => null); if (f?.state === "ACTIVE" || f?.state === "FAILED") break; await new Promise((ok) => setTimeout(ok, 3000)); }
      parts = [{ file_data: { mime_type: "video/mp4", file_uri: uj.file.uri } }, { text: ask }];
    }
    for (const model of [...new Set([Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"].filter(Boolean) as string[])]) {
      const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }) });
      if (!g.ok) continue;
      const gj: any = await g.json().catch(() => null);
      const o = looseJson(String(gj?.candidates?.[0]?.content?.parts?.map((x: any) => x.text ?? "").join("") ?? "{}"));
      if (o?.description) return { description: String(o.description).slice(0, 300), tags: Array.isArray(o.tags) ? o.tags.map(String).slice(0, 10) : [], seconds: Number(o.seconds) || undefined };
    }
  } catch { /* skip */ }
  return null;
}

// Free stock B-roll from Pexels (commercial use allowed, no credit needed) — vertical clips only
async function pexelsClip(query: string, used: Set<string>): Promise<{ id: string; url: string } | null> {
  const key = Deno.env.get("PEXELS_API_KEY"); if (!key || !query.trim()) return null;
  try {
    const r = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query.slice(0, 80))}&orientation=portrait&size=medium&per_page=8`, { headers: { Authorization: key } });
    if (!r.ok) return null;
    const js: any = await r.json();
    for (const v of js?.videos ?? []) {
      if (used.has(`pexels:${v.id}`) || Number(v.duration) < 3) continue;
      const files = (v.video_files ?? []).filter((f: any) => Number(f.height) > Number(f.width) && Number(f.height) >= 1280 && /mp4/i.test(String(f.file_type ?? "")))
        .sort((a: any, b: any) => Math.abs(Number(a.height) - 1920) - Math.abs(Number(b.height) - 1920));
      if (files[0]?.link) return { id: String(v.id), url: String(files[0].link) };
    }
  } catch { /* none */ }
  return null;
}

// ===================== v9.0: helpers + custom styles ("match the vibe") =====================
async function ghlMediaFromUrl(token: string, loc: string, fileUrl: string, name: string) {
  const fd = new FormData();
  fd.append("hosted", "true"); fd.append("fileUrl", fileUrl); fd.append("name", name);
  const up = await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${loc}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28" }, body: fd });
  const uj: any = await up.json().catch(() => null);
  return { url: String(uj?.url ?? uj?.fileUrl ?? "") };
}

// Turn a style breakdown into a reel style (no AI needed — a straight mapping of what was measured)
const COLOUR_WORDS: Record<string, string> = { green: "#7CF29A", yellow: "#FFD43B", pink: "#FF6FB5", red: "#FF4D4D", blue: "#4DA3FF", orange: "#FF9F43", purple: "#B57BFF", teal: "#2DD4BF", lime: "#B8F24A", gold: "#F5C542" };
function specToStyle(spec: any): { base: string; config: any } {
  const cap = spec?.captions ?? {}, z = spec?.zooms ?? {}, hk = spec?.hook ?? {}, snd = spec?.sound ?? {}, look = spec?.look ?? {};
  const font = /serif/i.test(String(cap.font_feel)) && !/sans/i.test(String(cap.font_feel)) ? "serif" : /round/i.test(String(cap.font_feel)) ? "rounded" : "sans";
  const colourText = `${cap.colours ?? ""} ${cap.emphasis ?? ""}`.toLowerCase();
  const colours = Object.keys(COLOUR_WORDS).filter((w) => colourText.includes(w)).map((w) => COLOUR_WORDS[w]);
  const hex = (colourText.match(/#[0-9a-f]{6}/gi) ?? []);
  const cols = [...hex, ...colours].slice(0, 2);
  const highlight = cols.length > 1 ? "alternate" : /karaoke/i.test(String(cap.style) + String(cap.animation)) ? "karaoke" : /word/i.test(String(cap.style)) ? "moving" : "karaoke";
  const pos = String(cap.position).toLowerCase();
  const snapScale = /punchy|20/i.test(String(z.scale)) ? [1, 1.18, 1.09] : /medium|10-20/i.test(String(z.scale)) ? [1, 1.12, 1.06] : [1, 1.07];
  const gradeBits: string[] = [];
  const g = String(look.colour_grade).toLowerCase();
  if (/warm/.test(g)) gradeBits.push("sepia(0.06)");
  if (/high contrast|contrast/.test(g)) gradeBits.push("contrast(1.1)");
  if (/saturated|vibrant|bright/.test(g)) gradeBits.push("saturate(1.2)");
  if (/desaturat|muted/.test(g)) gradeBits.push("saturate(0.88)");
  const gfx = (spec?.graphics ?? []).map((x: any) => `${x.style ?? ""} ${x.how_often ?? ""}`).join(" ").toLowerCase();
  const config = {
    captionFont: font, captionWeight: font === "serif" ? 400 : /regular/i.test(String(cap.weight)) ? 600 : /black/i.test(String(cap.weight)) ? 900 : 800,
    captionCase: /upper/i.test(String(cap.case)) ? "upper" : /sentence/i.test(String(cap.case)) ? "sentence" : "mixed",
    wordsPerScreen: Math.max(1, Math.min(4, Number(cap.words_per_screen) || 3)),
    captionY: /middle|center|centre/.test(pos) ? 1020 : /top/.test(pos) ? 640 : /bottom/.test(pos) ? 1450 : 1380,
    highlight, colours: cols.length ? cols : ["brand"],
    snap: /snap|punch/i.test(String(z.style)) ? snapScale : [],
    hook: /box|header|static|permanent/i.test(`${hk.tricks ?? ""} ${hk.on_screen_text ?? ""}`) ? "header" : /center|centre|middle/i.test(String(hk.position)) ? "center" : "top",
    grade: gradeBits.join(" ") || "none",
    cardStyle: /pastel|sticker|hand-drawn/.test(gfx) ? "pastel" : /dark/.test(gfx) ? "dark" : /float|rounded|shadow|glass/.test(gfx) ? "float" : "panel",
    sfxOn: /cut/i.test(String(snd.sfx)) ? "cuts" : /none/i.test(String(snd.sfx)) ? "none" : "cards",
    musicLevel: /prominent/i.test(String(snd.music)) ? 0.13 : /none/i.test(String(snd.music)) ? 0 : 0.07,
    graphics: /every 1|every 2|constant|frequent/.test(gfx) ? "lots" : /every 5|rare|occasional/.test(gfx) ? "few" : "some",
  };
  const base = config.cardStyle === "pastel" ? "energetic" : config.hook === "header" ? "clean" : config.captionFont === "serif" ? "minimal" : "clean";
  return { base, config };
}

async function useStyle(tid: string, name: string) {
  const n = name.trim().toLowerCase().replace(/^@/, "").replace(/\s*style$/, "");
  if (["minimal", "clean", "energetic", "studio", "archie"].includes(n)) {
    await supabase.from("tenant_config").update({ reel_style: n }).eq("tenant_id", tid);
    return { ok: true, text: `Done — your reels now use the ${n[0].toUpperCase() + n.slice(1)} style.` };
  }
  const gate: any = await allowance(tid, "styles");
  if (!gate.ok && gate.limit === 0) return { ok: false, text: gate.text };
  const { data: list } = await supabase.from("custom_styles").select("id, name").eq("tenant_id", tid);
  const hit = (list ?? []).find((x: any) => String(x.name).toLowerCase().replace(/^@/, "").replace(/\s*style$/, "").includes(n));
  if (!hit) return { ok: false, text: `I don't have a style called "${name}". Your styles: Minimal, Clean, Energetic, Studio${(list ?? []).length ? `, ${(list ?? []).map((x: any) => x.name).join(", ")}` : ""}.` };
  await supabase.from("tenant_config").update({ reel_style: `custom:${hit.id}` }).eq("tenant_id", tid);
  return { ok: true, text: `Done — your reels now use ${hit.name}.` };
}

// ===================== v9.1: content team =====================
// Words Deepgram should spell right: business, team, offers, tools, plus their own list (Settings → vocab)
async function deepgramTerms(tid: string): Promise<string> {
  try {
    const [{ data: t }, { data: cfg }, { data: team }] = await Promise.all([
      supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle(),
      supabase.from("tenant_config").select("vocab, brand_name, carousel_wordmark, instagram_handle").eq("tenant_id", tid).maybeSingle(),
      supabase.from("team_members").select("name").eq("tenant_id", tid),
    ]);
    const words = new Set<string>(["Archie"]);
    for (const v of [t?.business_name, cfg?.brand_name, cfg?.carousel_wordmark, ...(team ?? []).map((m: any) => m.name)]) if (v) for (const part of String(v).split(/[,&]/)) if (part.trim().length > 1) words.add(part.trim());
    for (const v of String(cfg?.vocab ?? "").split(/[,\n]/)) if (v.trim().length > 1) words.add(v.trim());
    return [...words].slice(0, 40).map((w) => `&keyterm=${encodeURIComponent(w.slice(0, 50))}`).join("");
  } catch { return ""; }
}

// Their best time to post, from their own Instagram (reach by weekday + hour, last 90 days); sensible default if no data
async function bestPostTime(tid: string): Promise<{ iso: string; label: string; why: string } | null> {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const { data: posts } = await supabase.from("ig_posts").select("posted_at, reach, views").eq("tenant_id", tid).gte("posted_at", new Date(Date.now() - 90 * 86400000).toISOString()).limit(300);
  const parts = (d: Date) => { const f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(d); return { wd: f.find((x) => x.type === "weekday")?.value ?? "", h: Number(f.find((x) => x.type === "hour")?.value ?? 0) }; };
  const score = new Map<string, number[]>();
  for (const p of posts ?? []) { if (!p.posted_at) continue; const { wd, h } = parts(new Date(p.posted_at)); const k = `${wd}|${h}`; const v = Number(p.reach || p.views || 0); if (!score.has(k)) score.set(k, []); score.get(k)!.push(v); }
  const ranked = [...score.entries()].filter(([, v]) => v.length >= 2).map(([k, v]) => ({ k, avg: v.reduce((a, b) => a + b, 0) / v.length })).sort((a, b) => b.avg - a.avg).slice(0, 5);
  const allAvg = (posts ?? []).length ? (posts ?? []).reduce((a: number, p: any) => a + Number(p.reach || p.views || 0), 0) / (posts ?? []).length : 0;
  const earliest = Date.now() + 90 * 60000;
  // Walk the next 7 days hour by hour; take the first slot that matches a top slot (or 18:00 on a weekday as the default)
  for (let i = 0; i < 7 * 24; i++) {
    const d = new Date(Math.ceil(earliest / 3600000) * 3600000 + i * 3600000);
    const { wd, h } = parts(d);
    const top = ranked.find((r) => r.k === `${wd}|${h}`);
    const fallback = !ranked.length && h === 18 && !["Sat", "Sun"].includes(wd);
    if (top || fallback) {
      const label = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", hour: "numeric", minute: "2-digit", hour12: true }).format(d).replace(":00", "");
      const why = top && allAvg ? `your posts at that time reach about ${Math.max(1, Math.round((top.avg / allAvg) * 10) / 10)}× your normal` : "a strong default slot until I've learned your best times";
      return { iso: d.toISOString(), label, why };
    }
  }
  return null;
}

// One reel → a content stack: a carousel and a story (designed), plus an email and a LinkedIn post (written)
async function contentStack(tid: string, jobId: string) {
  try {
    const { data: cfg } = await supabase.from("tenant_config").select("content_stack, ghl_token, ghl_location_id").eq("tenant_id", tid).single();
    if (cfg?.content_stack === false) return;
    const { data: job } = await supabase.from("edit_jobs").select("*").eq("id", jobId).single();
    if (!job) return;
    const said = (job.transcript?.words ?? []).map((w: any) => w.w).join(" ").slice(0, 3000);
    if (said.length < 60) return;
    const topic = String(job.props?.hookText || job.title || said.slice(0, 80));
    const car: any = await carouselStart(tid, job.handle ?? "owner", { topic, brief: `Built from the owner's reel. What they said: ${said.slice(0, 500)}`, source: "stack" });
    const story: any = await carouselStart(tid, job.handle ?? "owner", { topic, brief: `Built from the owner's reel. What they said: ${said.slice(0, 400)}`, format: "story", slides_count: 3, source: "stack" });
    const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
    const agentId = await agentIdFor(tid, "content", token, loc);
    let email: any = null, linkedin = "";
    if (agentId) {
      const msg = [
        "Use your repurpose skill. Turn what the owner said in this reel into: (1) a short email to their list (subject + body, 120–200 words, one clear call to action), and (2) a LinkedIn post (120–220 words, hook first line, short paragraphs, no hashtag spam).",
        'Return ONLY JSON: {"email":{"subject":"…","body":"…"},"linkedin":"…"}',
        "", `WHAT THEY SAID:\n${said}`, "", await businessContext(tid),
      ].join("\n").slice(0, 9000);
      const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `stack-${tid}-${Date.now()}`);
      try { const m = tidy(clean(String(res.json?.finalText ?? ""))).match(/\{[\s\S]*\}/); const o = m ? looseJson(m[0]) : null; email = o?.email ?? null; linkedin = String(o?.linkedin ?? ""); } catch { /* skip */ }
    }
    await supabase.from("content_stacks").insert({ tenant_id: tid, job_id: jobId, carousel_id: car?.id ?? null, story_id: story?.id ?? null, email, linkedin: linkedin || null });
    const lines = [`📦 From "${job.title ?? topic}" I'm also making you a carousel and a story (they'll arrive in a few minutes).`];
    if (email?.subject) lines.push(`\n✉️ EMAIL\nSubject: ${email.subject}\n\n${email.body}`);
    if (linkedin) lines.push(`\n💼 LINKEDIN\n${linkedin}`);
    await sendToMember(tid, job.handle ?? null, lines.join("\n").slice(0, 3800));
  } catch (e) { console.log("content stack failed", String(e).slice(0, 120)); }
}

// Hook A/B: two versions of the latest reel with a different opening (post as Instagram Trial Reels)
async function hookVersions(tid: string, id?: string) {
  const job = id ? (await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle()).data : (await supabase.from("edit_jobs").select("*").eq("tenant_id", tid).eq("status", "done").is("parent_id", null).or("kind.is.null,kind.neq.month").order("created_at", { ascending: false }).limit(1).maybeSingle()).data;
  if (!job) return { ok: false, text: "I don't have a finished reel to test hooks on yet." };
  const variants: any[] = Array.isArray(job.plan?.hook_variants) ? job.plan.hook_variants.slice(0, 2) : [];
  if (!variants.length) return { ok: false, text: "That reel doesn't have other openings saved — re-edit it and I'll suggest some." };
  let made = 0;
  for (const [i, v] of variants.entries()) {
    const first = Number(v.first);
    const keep = (job.plan?.keep ?? []).map(Number);
    const order = keep.includes(first) ? [first, ...keep.filter((k: number) => k !== first)] : keep;
    const plan = { ...job.plan, keep: order, hook_text: String(v.hook_text ?? job.plan?.hook_text ?? ""), hook_variants: [] };
    const { data: child } = await supabase.from("edit_jobs").insert({
      tenant_id: tid, handle: job.handle, source_url: job.source_url, sources: job.sources, status: "planning", parent_id: job.id, variant: i + 2,
      title: `${job.title ?? "Reel"} (hook ${String.fromCharCode(66 + i)})`, transcript: job.transcript, style: job.style, pace: job.pace, focus: job.focus, clean_audio_url: job.clean_audio_url, clean_audio_urls: job.clean_audio_urls, engine: "v2",
    }).select("id").single();
    if (child?.id) { await runFresh("edit_run", { tenant_id: tid, id: child.id, replan: true, plan }); made++; }
  }
  return { ok: true, text: `🔁 Making ${made} version${made === 1 ? "" : "s"} with a different opening — they'll arrive in a few minutes. Post them as Trial Reels in the Instagram app (they show to non-followers first), and the one that wins tells us your best hook style.` };
}

// The learning loop: how THEIR reels did, by style, length and hook — saved for every future edit
async function contentLearn(tid: string, weekly: boolean) {
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const [{ data: jobs }, { data: posts }, { data: cfg }] = await Promise.all([
    supabase.from("edit_jobs").select("id, title, caption, style, seconds, props, planner_post_id, created_at").eq("tenant_id", tid).eq("status", "done").gte("created_at", since).not("caption", "is", null).limit(200),
    supabase.from("ig_posts").select("caption, reach, views, avg_watch_ms, shares, saves, kind, posted_at").eq("tenant_id", tid).gte("posted_at", since).limit(400),
    supabase.from("tenant_config").select("reel_style, auto_style").eq("tenant_id", tid).maybeSingle(),
  ]);
  const norm = (x: string) => String(x ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 50);
  const rows: { style: string; len: string; hook: boolean; reach: number; watch: number; shares: number }[] = [];
  for (const j of jobs ?? []) {
    const key = norm(j.caption); if (key.length < 15) continue;
    const post = (posts ?? []).find((p: any) => norm(p.caption).startsWith(key.slice(0, 35)));
    if (!post) continue;
    rows.push({ style: String(j.style ?? cfg?.reel_style ?? "clean"), len: Number(j.seconds) < 30 ? "under 30s" : Number(j.seconds) <= 45 ? "30–45s" : "over 45s", hook: !!j.props?.hookText, reach: Number(post.reach || post.views || 0), watch: Number(post.avg_watch_ms || 0), shares: Number(post.shares || 0) + Number(post.saves || 0) });
  }
  if (rows.length < 4) return { ok: true, text: `I've matched ${rows.length} of your Archie reels to their Instagram results so far — I need about 4 to start spotting patterns. Keep posting and I'll report back.` };
  const overall = rows.reduce((a, r) => a + r.reach, 0) / rows.length;
  const by = (f: (r: any) => string) => { const m = new Map<string, number[]>(); for (const r of rows) { const k = f(r); if (!m.has(k)) m.set(k, []); m.get(k)!.push(r.reach); } return [...m.entries()].filter(([, v]) => v.length >= 2).map(([k, v]) => ({ k, n: v.length, avg: v.reduce((a, b) => a + b, 0) / v.length })).sort((a, b) => b.avg - a.avg); };
  const styles = by((r) => r.style), lens = by((r) => r.len);
  const notes: string[] = [];
  if (styles.length >= 2 && styles[0].avg >= styles[1].avg * 1.25) notes.push(`${styles[0].k[0].toUpperCase() + styles[0].k.slice(1)} style reels reach ${Math.round((styles[0].avg / overall) * 10) / 10}× your normal`);
  if (lens.length >= 2 && lens[0].avg >= lens[1].avg * 1.25) notes.push(`reels ${lens[0].k} do best (${Math.round((lens[0].avg / overall) * 10) / 10}× normal)`);
  const topShares = [...rows].sort((a, b) => b.shares - a.shares)[0];
  const text = notes.length ? `What's working in your reels (${rows.length} matched): ${notes.join("; ")}.` : `I've matched ${rows.length} reels — no clear winner yet between styles or lengths. Keep mixing them up.`;
  await supabase.from("business_memory").update({ status: "archived" }).eq("tenant_id", tid).eq("kind", "content_learning");
  if (notes.length) await supabase.from("business_memory").insert({ tenant_id: tid, kind: "content_learning", key: "reels", value: notes.join("; "), source: "archie", status: "active", weeks_seen: 1, updated_at: new Date().toISOString() });
  // Switch their default style to the clear winner (unless they've turned that off)
  let switched = "";
  if (cfg?.auto_style !== false && styles.length >= 2 && styles[0].n >= 3 && styles[0].avg >= styles[1].avg * 1.3 && ["minimal", "clean", "energetic", "studio"].includes(styles[0].k) && cfg?.reel_style !== styles[0].k && !String(cfg?.reel_style ?? "").startsWith("custom:")) {
    await supabase.from("tenant_config").update({ reel_style: styles[0].k }).eq("tenant_id", tid);
    switched = ` I've switched your default to ${styles[0].k} — say "use the ${cfg?.reel_style ?? "clean"} style" to switch back.`;
  }
  const out = `📈 ${text}${switched}${topShares?.shares ? "" : ""}`;
  if (weekly && notes.length) { const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle(); await sendToMember(tid, o?.handle ?? null, out); }
  return { ok: true, text: out, matched: rows.length };
}

// Brand kit from their website: colours, logo and font feel
async function brandFromSite(tid: string, url: string, force = false) {
  const { data: cfg } = await supabase.from("tenant_config").select("website_url, brand_primary, brand_accent, brand_logo_url, ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  let site = (url || cfg?.website_url || "").trim();
  if (!site) return { ok: false, text: "What's your website address? Say \"get my brand from mysite.com\"." };
  if (!/^https?:\/\//.test(site)) site = `https://${site}`;
  let html = "";
  try { const r = await fetch(site, { headers: { "User-Agent": "Mozilla/5.0 ArchieBrandReader" } }); html = (await r.text()).slice(0, 600000); } catch { return { ok: false, text: `I couldn't open ${site}.` }; }
  const abs = (u: string) => { try { return new URL(u, site).toString(); } catch { return ""; } };
  // CSS: inline + up to 2 stylesheets
  let css = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).join(" ");
  for (const href of (html.match(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi) ?? []).map((l) => l.match(/href=["']([^"']+)["']/i)?.[1] ?? "").filter(Boolean).slice(0, 2)) {
    try { css += " " + (await (await fetch(abs(href))).text()).slice(0, 250000); } catch { /* skip */ }
  }
  const theme = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-f]{3,8})["']/i)?.[1];
  const counts = new Map<string, number>();
  for (const m of (css + " " + html).matchAll(/#([0-9a-f]{6})\b/gi)) { const h = `#${m[1].toUpperCase()}`; counts.set(h, (counts.get(h) ?? 0) + 1); }
  const sat = (h: string) => { const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return { s: mx === 0 ? 0 : (mx - mn) / mx, l: (mx + mn) / 510 }; };
  const colourful = [...counts.entries()].filter(([h]) => { const v = sat(h); return v.s > 0.35 && v.l > 0.15 && v.l < 0.85; }).sort((a, b) => b[1] - a[1]).map(([h]) => h);
  const primary = (theme && sat(theme.length === 7 ? theme.toUpperCase() : "#000000").s > 0.35 ? theme.toUpperCase() : null) || colourful[0] || null;
  const accent = colourful.find((h) => h !== primary) || null;
  const logo = abs(html.match(/<img[^>]+(?:class|id|alt|src)=["'][^"']*logo[^"']*["'][^>]*>/i)?.[0].match(/src=["']([^"']+)["']/i)?.[1] ?? "")
    || abs(html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? "")
    || abs(html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "");
  const fontFam = (html.match(/fonts\.googleapis\.com\/css2?\?family=([^"'&:]+)/i)?.[1] ?? css.match(/font-family:\s*["']?([A-Za-z0-9 ]+)/i)?.[1] ?? "").replace(/\+/g, " ").trim();
  const feel = /serif|playfair|lora|merriweather|garamond|cormorant|dm serif|libre baskerville/i.test(fontFam) && !/sans/i.test(fontFam) ? "minimal" : /nunito|fredoka|quicksand|baloo|poppins|rounded|comfortaa/i.test(fontFam) ? "energetic" : "clean";
  const upd: any = { website_url: site };
  if (primary && (force || !cfg?.brand_primary)) { upd.brand_primary = primary; upd.carousel_accent = primary; }
  if (accent && (force || !cfg?.brand_accent)) upd.brand_accent = "#FFFFFF";
  if (logo && (force || !cfg?.brand_logo_url)) {
    const saved: any = await ghlMediaFromUrl(cfg?.ghl_token || FALLBACK_TOKEN, cfg?.ghl_location_id, logo, "Logo (from website)").catch(() => null);
    upd.brand_logo_url = saved?.url || logo;
  }
  await supabase.from("tenant_config").update(upd).eq("tenant_id", tid);
  return { ok: true, primary, accent, logo: upd.brand_logo_url ?? null, font: fontFam || null, suggested_style: feel,
    text: `🎨 From ${site.replace(/^https?:\/\//, "")}: ${primary ? `main colour ${primary}` : "no clear brand colour"}${accent ? `, second colour ${accent}` : ""}${upd.brand_logo_url ? ", your logo" : ""}${fontFam ? `, font ${fontFam}` : ""}. ${Object.keys(upd).length > 1 ? "Saved to your brand." : "Your existing brand settings were kept (say \"replace my brand from my website\" to overwrite)."} Your font suits the ${feel[0].toUpperCase() + feel.slice(1)} reel style — say "use the ${feel} style" to switch.` };
}

// ===================== v9.2: teleprompter + consistency coach =====================
// An idea's script as short lines to read one at a time (hook first). idea_id from the page, or the filming-list number.
async function teleprompter(tid: string, p: any) {
  let idea: any = null;
  if (p.idea_id) idea = (await supabase.from("content_posts").select("id, idea").eq("tenant_id", tid).eq("id", String(p.idea_id)).maybeSingle()).data;
  else {
    const n = Math.max(1, Number(p.idea_number) || 1);
    const { data: fl } = await supabase.from("content_posts").select("id, idea").eq("tenant_id", tid).eq("status", "to_film").order("score", { ascending: false }).limit(20);
    const { data: rd } = !fl?.length ? await supabase.from("content_posts").select("id, idea").eq("tenant_id", tid).eq("status", "ready").order("score", { ascending: false }).limit(20) : { data: null };
    idea = (fl?.length ? fl : rd ?? [])[n - 1] ?? null;
  }
  if (!idea?.idea) return { ok: false, text: "I can't find that idea — check your filming list (Content → Create)." };
  const parts: string[] = [];
  if (idea.idea.hook) parts.push(String(idea.idea.hook));
  for (const x of Array.isArray(idea.idea.script) ? idea.idea.script : String(idea.idea.script ?? "").split(/\n+/)) if (String(x).trim()) parts.push(String(x).trim());
  // Split into short lines (one breath each, ~14 words max), never mid-sentence where avoidable
  const lines: string[] = [];
  for (const block of parts) {
    for (const sent of block.replace(/^[-•\d.)\s]+/, "").split(/(?<=[.!?])\s+/)) {
      const words = sent.trim().split(/\s+/).filter(Boolean);
      for (let i = 0; i < words.length; i += 14) lines.push(words.slice(i, i + 14).join(" "));
    }
  }
  const clean = lines.filter((l) => l.length > 1).slice(0, 25);
  if (clean[0] && idea.idea.hook && clean[0] !== String(idea.idea.hook)) { /* hook already first */ }
  return { ok: true, idea_id: idea.id, title: String(idea.idea.title ?? "Your reel"), filming: idea.idea.filming ?? null, lines: clean };
}

// Reels made this week vs their target, and the streak of weeks they hit it
async function contentWeek(tid: string, notify: boolean) {
  const { data: cfg } = await supabase.from("tenant_config").select("reels_per_week, timezone").eq("tenant_id", tid).maybeSingle();
  const target = Math.max(1, Number(cfg?.reels_per_week ?? 3) || 3);
  const tz = cfg?.timezone || "Europe/London";
  // Monday 00:00 local, as UTC
  const local = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const offset = new Date().getTime() - local.getTime();
  const monday = new Date(local); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekStart = new Date(monday.getTime() + offset);
  const count = async (from: Date, to: Date) => ((await supabase.from("edit_jobs").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "done").is("parent_id", null).or("kind.is.null,kind.neq.month").gte("created_at", from.toISOString()).lt("created_at", to.toISOString())).count ?? 0);
  const thisWeek = await count(weekStart, new Date(Date.now() + 60000));
  let streak = 0;
  for (let w = 1; w <= 26; w++) {
    const from = new Date(weekStart.getTime() - w * 7 * 86400000), to = new Date(weekStart.getTime() - (w - 1) * 7 * 86400000);
    if ((await count(from, to)) >= target) streak++; else break;
  }
  if (thisWeek >= target) streak++;
  const text = thisWeek >= target
    ? `🔥 ${thisWeek}/${target} reels this week — target hit.${streak > 1 ? ` That's ${streak} weeks in a row.` : ""}`
    : `📅 ${thisWeek}/${target} reels this week.${streak ? ` Streak: ${streak} week${streak === 1 ? "" : "s"} — keep it going.` : ""}`;
  if (notify) {
    const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
    await sendToMember(tid, o?.handle ?? null, thisWeek >= target ? text : `${text} New week tomorrow — your ideas will be ready in the morning.`);
  }
  return { ok: true, this_week: thisWeek, target, streak, text };
}

// Thursday nudge if they're behind: the next idea to film, with its script ready
async function contentNudge(tid: string) {
  const wk: any = await contentWeek(tid, false);
  if (wk.this_week >= wk.target) return { ok: true, skipped: "on target" };
  const left = wk.target - wk.this_week;
  const tp: any = await teleprompter(tid, { idea_number: 1 });
  const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  const msg = tp.ok
    ? `🎬 ${wk.this_week}/${wk.target} reels this week — ${left} more to hit your target${wk.streak ? ` and keep your ${wk.streak}-week streak` : ""}.\n\nIdea ready to film: "${tp.title}"\n${tp.lines.slice(0, 4).map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}${tp.lines.length > 4 ? "\n…" : ""}\n\nSay "script for idea 1" for the full lines, or open Content → Create → Teleprompter. 10 minutes is all it takes.`
    : `🎬 ${wk.this_week}/${wk.target} reels this week — ${left} more to hit your target. Say "find me ideas" and I'll line some up.`;
  await sendToMember(tid, o?.handle ?? null, msg);
  return { ok: true, sent: true };
}

// Free stock B-roll from Pixabay (commercial use, no credit needed) — portrait first, landscape is cropped to fit
async function pixabayClip(query: string, used: Set<string>): Promise<{ id: string; url: string } | null> {
  const key = Deno.env.get("PIXABAY_API_KEY"); if (!key || !query.trim()) return null;
  try {
    const r = await fetch(`https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(query.slice(0, 90))}&safesearch=true&per_page=15`);
    if (!r.ok) return null;
    const js: any = await r.json();
    const pick = (v: any) => { const f = v.videos?.large?.url ? v.videos.large : v.videos?.medium; return f?.url ? { w: Number(f.width), h: Number(f.height), url: String(f.url) } : null; };
    const hits = (js?.hits ?? []).filter((v: any) => !used.has(`pexels:pb${v.id}`) && Number(v.duration) >= 3).map((v: any) => ({ v, f: pick(v) })).filter((x: any) => x.f);
    const best = hits.find((x: any) => x.f.h > x.f.w) ?? hits[0];
    return best ? { id: `pb${best.v.id}`, url: best.f.url } : null;
  } catch { return null; }
}

// "Write me a reel about…" → a script in short lines, at the top of the filming list (ready for the teleprompter)
async function writeScript(tid: string, handle: string, topic: string, notes = "", rowId?: string) {
  topic = topic.replace(/^(please\s+)?(create|write|make|give)( me)?( a)?( reel| script| reel script)?( about| on| for)?\s*/i, "").trim();
  if (topic.length < 3) return { ok: false, text: "What should the reel be about?" };
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id, cta_keyword, cta_offer").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  const agentId = await agentIdFor(tid, "content", token, loc);
  if (!agentId) return { ok: false, text: "I couldn't find the Content agent to write it." };
  const msg = [
    `Use your create-reel-script skill to write a talking-to-camera reel script about: ${topic}`,
    notes ? `Their notes: ${notes}` : "",
    "It will be read from a teleprompter and filmed ONE LINE AT A TIME, so: 6–10 lines, each one sentence they can say in one breath (under 14 words), in their natural spoken voice. Line 1 is the hook. The last line is the call to action.",
    cfg?.cta_keyword ? `The call to action is: "Comment ${String(cfg.cta_keyword).toUpperCase()} and I'll send you ${cfg.cta_offer || "the details"}."` : "",
    'Return ONLY JSON: {"title":"…","pillar":"…","hook":"line 1","script":["line 2","line 3","…","last line (call to action)"],"filming":"where/how to film it, one sentence","caption":"the Instagram caption"}',
    "", await businessContext(tid),
  ].filter(Boolean).join("\n").slice(0, 9000);
  const res = await agentExecute(token, agentId, { locationId: loc, message: msg }, `script-${tid}-${Date.now()}`);
  let o: any = null;
  try { const m = tidy(clean(String(res.json?.finalText ?? ""))).match(/\{[\s\S]*\}/); o = m ? looseJson(m[0]) : null; } catch { o = null; }
  if (!o?.hook || !Array.isArray(o?.script)) { console.log("script agent reply", res.status, String(res.json?.finalText ?? JSON.stringify(res.json ?? {})).slice(0, 400)); return { ok: false, text: "The script didn't come back properly — try again in a minute." }; }
  const idea = { title: String(o.title ?? topic).slice(0, 120), pillar: o.pillar ?? null, why: "Written by Archie for you", hook: String(o.hook), script: o.script.map(String).slice(0, 14), filming: o.filming ?? null, caption: o.caption ?? null };
  // Top of the filming list: highest score
  const { data: top } = await supabase.from("content_posts").select("score").eq("tenant_id", tid).eq("status", "to_film").order("score", { ascending: false }).limit(1).maybeSingle();
  const { data: row, error } = rowId
    ? await supabase.from("content_posts").update({ idea, score: Math.max(99, Number(top?.score ?? 0) + 1), status: "to_film", updated_at: new Date().toISOString() }).eq("id", rowId).select("id").single()
    : await supabase.from("content_posts").insert({
      tenant_id: tid, handle: "archie", source: "archie", pick: "script", shortcode: `script_${crypto.randomUUID()}`,
      idea, score: Math.max(99, Number(top?.score ?? 0) + 1), status: "to_film", updated_at: new Date().toISOString(),
    }).select("id").single();
  if (error) return { ok: false, text: `Couldn't save the script: ${error.message}` };
  const lines = [idea.hook, ...idea.script];
  return { ok: true, id: row?.id, idea,
    text: `✍️ "${idea.title}" — it's #1 on your filming list.\n\n${lines.map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}${idea.filming ? `\n\n🎥 ${idea.filming}` : ""}\n\nOpen Content → Create → Teleprompter to film it line by line, or film these and send the clips with "edit these".` };
}

// ===================== v9.5: simplicity =====================
// The short brief: focus, 3 things, what's waiting, one next step (the full brief is saved and one word away)
async function shortBrief(tid: string, full: string, handle: string): Promise<string> {
  try {
    const w: any = await waitingList(tid);
    const r = await openai("chat/completions", { model: "gpt-4o-mini", temperature: 0.2, messages: [
      { role: "system", content: "Rewrite this morning brief for WhatsApp, SHORT. Keep the first line (the greeting with the date) exactly as it is. Then: 'Focus: …' (one line), then the 3 most important things as '1.', '2.', '3.' (one line each, keep real names, times and £). Nothing else from the brief. Never invent anything. Plain text, no markdown, at most 6 lines in total." },
      { role: "user", content: full.slice(0, 6000) },
    ] });
    const j2: any = await r.json().catch(() => null);
    const body = String(j2?.choices?.[0]?.message?.content ?? "").trim();
    if (!body || body.length > full.length) return full;
    const waitLine = w.count ? `\n📥 ${w.count} waiting on you (${w.summary})` : "";
    return `${body}${waitLine}\n\nReply "go" — or "full brief" for everything.`;
  } catch { return full; }
}

// Waiting on you: every draft, proposal and reel ready to post — one inbox, numbered the same everywhere
async function waitingList(tid: string) {
  const since = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
  const [{ data: drafts }, { data: props }, { data: reels }] = await Promise.all([
    supabase.from("message_drafts").select("id, rank, name, channel, body, source, created_on").eq("tenant_id", tid).eq("status", "pending").gte("created_on", since).order("created_on", { ascending: false }).order("rank").limit(20),
    supabase.from("tasks").select("id, title, proposal_rank, created_at").eq("tenant_id", tid).eq("status", "proposed").gte("created_at", new Date(Date.now() - 5 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(10),
    supabase.from("edit_jobs").select("id, title, output_url, ghl_media_url, cover_url, created_at").eq("tenant_id", tid).eq("status", "done").is("planner_post_id", null).is("parent_id", null).or("kind.is.null,kind.neq.month").gte("created_at", new Date(Date.now() - 3 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(5),
  ]);
  const why = (src: string) => src === "winback" ? "win back" : src?.startsWith("by:") ? "check-in" : src === "focus" ? "follow-up" : src === "rebook" ? "rebook" : "message";
  const items = [
    ...(drafts ?? []).map((d: any) => {
      const body = String(d.body ?? "");
      const note = /^\s*\[?\s*task for\b/i.test(body) || /^\s*\[[A-Z ]{4,}[—–-]/.test(body);
      return note
        ? { kind: "draft", id: d.id, title: `To do: ${d.name}`, why: "a job for you (not a message)", preview: body.replace(/^\s*\[[^\]]*\]\s*/, "").slice(0, 220), channel: d.channel, actions: ["done", "skip"], is_note: true }
        : { kind: "draft", id: d.id, title: `Message to ${d.name}`, why: why(String(d.source ?? "")), preview: body.slice(0, 220), channel: d.channel, actions: ["send", "edit", "skip"] };
    }),
    ...(props ?? []).map((t: any) => ({ kind: "proposal", id: t.id, title: t.title, why: "spotted in your messages", preview: "", actions: ["add", "skip"] })),
    ...(reels ?? []).map((r: any) => ({ kind: "reel", id: r.id, title: `Reel: ${r.title ?? "ready to post"}`, why: "ready to post", preview: r.ghl_media_url || r.output_url, cover: r.cover_url, actions: ["post", "skip"] })),
  ];
  const counts = { messages: (drafts ?? []).length, tasks: (props ?? []).length, reels: (reels ?? []).length };
  const summary = [counts.messages ? `${counts.messages} message${counts.messages === 1 ? "" : "s"}` : "", counts.tasks ? `${counts.tasks} task${counts.tasks === 1 ? "" : "s"} to confirm` : "", counts.reels ? `${counts.reels} reel${counts.reels === 1 ? "" : "s"} to post` : ""].filter(Boolean).join(", ");
  const text = items.length
    ? `📥 Waiting on you:\n${items.slice(0, 8).map((x, i) => `${i + 1}. ${x.title}${x.kind === "draft" ? ` — "${x.preview.slice(0, 80)}${x.preview.length > 80 ? "…" : ""}"` : ""}`).join("\n")}\n\nReply "send all" for the messages, or tell me which to send or skip.`
    : "Nothing waiting on you. 👌";
  return { ok: true, count: items.length, summary, items, text };
}

async function waitingAct(tid: string, kind: string, id: string, action: string, p: any) {
  // Be forgiving about how the app names things
  action = String((action && action !== "waiting_act" ? action : "") || p.act || p.button || p.action_name || p.choice || "").trim().toLowerCase();
  if (["dismiss", "bin", "remove", "ignore", "no", "not now", "skipped"].includes(action)) action = "skip";
  if (["approve", "yes", "confirm", "send it"].includes(action)) action = kind === "proposal" ? "add" : kind === "reel" ? "post" : "send";
  kind = String(kind || p.type || "").trim().toLowerCase().replace(/s$/, "");
  id = String(id || p.item_id || p.itemId || "").trim();
  if (!kind && id) {
    if ((await supabase.from("message_drafts").select("id").eq("tenant_id", tid).eq("id", id).maybeSingle()).data) kind = "draft";
    else if ((await supabase.from("tasks").select("id").eq("tenant_id", tid).eq("id", id).maybeSingle()).data) kind = "proposal";
    else if ((await supabase.from("edit_jobs").select("id").eq("tenant_id", tid).eq("id", id).maybeSingle()).data) kind = "reel";
  }
  if (kind === "message") kind = "draft";
  if (kind === "task") kind = "proposal";
  console.log("waiting_act", JSON.stringify({ kind, id, action, raw: { kind: p.kind, id: p.id, action: p.action } }));
  if (action === "undo") {
    if (kind === "draft") await supabase.from("message_drafts").update({ status: "pending" }).eq("tenant_id", tid).eq("id", id).eq("status", "dismissed");
    else if (kind === "proposal") await supabase.from("tasks").update({ status: "proposed", dismissed_reason: null }).eq("tenant_id", tid).eq("id", id).eq("status", "dismissed");
    else if (kind === "reel") await supabase.from("edit_jobs").update({ planner_post_id: null }).eq("tenant_id", tid).eq("id", id).eq("planner_post_id", "skipped");
    return { ok: true, text: "Put back." };
  }
  if (!["send", "skip", "edit", "add", "post", "done"].includes(action)) return { ok: false, text: `Unknown action "${action}".` };
  if (!id) return { ok: false, text: "Missing the item id." };
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN;
  if (kind === "draft") {
    const { data: d } = await supabase.from("message_drafts").select("*").eq("tenant_id", tid).eq("id", id).maybeSingle();
    if (!d) return { ok: false, text: "That message isn't waiting any more." };
    if (action === "skip") { await supabase.from("message_drafts").update({ status: "dismissed" }).eq("id", id); return { ok: true, text: `Skipped the message to ${d.name}.` }; }
    if (action === "edit") { const body = String(p.body ?? "").trim(); if (!body) return { ok: false, text: "Nothing to save." }; await supabase.from("message_drafts").update({ body: body.slice(0, 1500) }).eq("id", id); return { ok: true, text: "Saved." }; }
    if (action === "done") { await supabase.from("message_drafts").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id); return { ok: true, text: "Marked as done. ✅" }; }
    if (action === "send") {
      if (/^\s*\[?\s*task for\b/i.test(String(d.body ?? "")) || /^\s*\[[A-Z ]{4,}[—–-]/.test(String(d.body ?? ""))) return { ok: false, text: "That one's a note for you, not a message — tap Done when you've done it." };
      const type = ({ WA: "WhatsApp", SMS: "SMS", IG: "IG", FB: "FB", Chat: "Live_Chat" } as Record<string, string>)[d.channel];
      if (!type) return { ok: false, text: `This one's for ${d.channel}, which Archie can't send — copy it into GHL.` };
      const r = await ghl(token, "/conversations/messages", "POST", { type, contactId: d.contact_id, message: String(p.body ?? d.body) }, "2021-04-15");
      if (!r.ok) return { ok: false, text: `Couldn't send it (${r.status}). Try again, or send it from GHL.` };
      await supabase.from("message_drafts").update({ status: "sent", sent_at: new Date().toISOString(), body: String(p.body ?? d.body) }).eq("id", id);
      return { ok: true, text: `Sent to ${d.name}. ✅` };
    }
  }
  if (kind === "proposal") {
    if (action === "add") { await supabase.from("tasks").update({ status: "open", hold: true, proposal_rank: null, pinned_date: null, scheduled_start: null, scheduled_end: null }).eq("tenant_id", tid).eq("id", id); return { ok: true, text: "Added to your Forge Inbox — give it a day when you're ready." }; }
    if (action === "skip") { await supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "skipped from Waiting on you", proposal_rank: null }).eq("tenant_id", tid).eq("id", id); return { ok: true, text: "Skipped." }; }
  }
  if (kind === "reel") {
    if (action === "post") { const r: any = await reelToPlanner(tid, id, { draft: p.draft === true || String(p.mode ?? "") === "draft" }); return { ok: !!r.ok, text: r.text }; }
    if (action === "skip") { await supabase.from("edit_jobs").update({ planner_post_id: "skipped" }).eq("tenant_id", tid).eq("id", id); return { ok: true, text: "Taken off the list." }; }
  }
  return { ok: false, text: "I didn't understand that." };
}

// Numbers in one sentence + the one action
async function numbersHeadline(tid: string) {
  const wr: any = await weeklyReport(tid, { week: "this" }).catch(() => null);
  const { data: cfg } = await supabase.from("tenant_config").select("stripe_key").eq("tenant_id", tid).maybeSingle();
  let overdue = 0, overdueCount = 0;
  if (cfg?.stripe_key) {
    try {
      const page: any = await stripeGet(cfg.stripe_key, "invoices?status=open&limit=100");
      for (const inv of page?.data ?? []) if (Number(inv.due_date ?? inv.created) * 1000 < Date.now() - 86400000) { overdue += Number(inv.amount_remaining ?? 0) / 100; overdueCount++; }
    } catch { /* optional */ }
  }
  const p2 = wr?.pace ?? {};
  const parts: string[] = [];
  if (p2.calls_booked_per_week) parts.push(p2.on_pace ? "You're on pace for your goal this week" : `You're behind pace — ${p2.expected_booked_so_far} calls booked needed by now, ${wr?.numbers?.calls_booked ?? 0} so far`);
  else parts.push("You've hit your MRR goal — time to set a new one");
  if (overdue > 0) parts.push(`£${Math.round(overdue).toLocaleString("en-GB")} overdue from ${overdueCount} payment${overdueCount === 1 ? "" : "s"}`);
  const action = overdue > 0 ? { label: "Chase it", say: "chase my overdue payments" } : !p2.on_pace && p2.calls_booked_per_week ? { label: "Fill the gap", say: "draft follow-ups for my warm leads" } : { label: "Keep going", say: "what should I focus on?" };
  return { ok: true, sentence: `${parts.join(". ")}.`, overdue: Math.round(overdue), overdue_count: overdueCount, on_pace: !!p2.on_pace, action };
}

// 5pm wrap: done today, what moved, tomorrow's first thing
async function eveningWrap(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz), tomorrow = localDate(Date.now() + 86400000, tz);
  const startIso = new Date(Date.now() - 14 * 3600000).toISOString();
  const [{ data: done }, { count: sent }, { data: tmr }, w] = await Promise.all([
    supabase.from("tasks").select("title").eq("tenant_id", tid).eq("status", "done").gte("updated_at", startIso).limit(20),
    supabase.from("message_drafts").select("id", { count: "exact", head: true }).eq("tenant_id", tid).eq("status", "sent").gte("sent_at", startIso),
    supabase.from("tasks").select("title, scheduled_start").eq("tenant_id", tid).eq("status", "open").gte("scheduled_start", `${tomorrow}T00:00:00`).order("scheduled_start").limit(1),
    waitingList(tid),
  ]);
  const nDone = (done ?? []).length;
  if (!nDone && !sent && !w.count && !(tmr ?? []).length) return { ok: true, skipped: "nothing to say" };
  const lines = [
    `Evening 🌙 ${nDone ? `${nDone} thing${nDone === 1 ? "" : "s"} done today` : "Quiet day"}${sent ? `, ${sent} message${sent === 1 ? "" : "s"} sent` : ""}.`,
    w.count ? `📥 Still waiting: ${w.summary}.` : "",
    (tmr ?? [])[0] ? `Tomorrow starts with: ${tmr![0].title}.` : "",
    w.count ? `Reply "waiting" to clear them now, or open Forge — or leave it till tomorrow.` : "Switch off — tomorrow's planned in Forge. 👊",
  ].filter(Boolean);
  const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  await sendToMember(tid, o?.handle ?? null, lines.join("\n"));
  return { ok: true, sent: true, date: today };
}

// Sunday: one message — money, clients, content, next week's focus
async function sundayRecap(tid: string) {
  const [wr, wk, learn, health] = await Promise.all([
    weeklyReport(tid, { week: "this" }).catch(() => null) as Promise<any>,
    contentWeek(tid, false),
    contentLearn(tid, false).catch(() => null) as Promise<any>,
    supabase.from("member_health").select("status").eq("tenant_id", tid).then((r: any) => r.data ?? []).catch(() => []),
  ]);
  const n = wr?.numbers ?? {};
  const reds = (health as any[]).filter((h) => h.status === "red").length, yellows = (health as any[]).filter((h) => h.status === "yellow").length;
  const lines = [
    "Your week 📊",
    `💷 ${n.sales_count ?? 0} sale${(n.sales_count ?? 0) === 1 ? "" : "s"}${n.new_income ? `, £${Math.round(n.new_income).toLocaleString("en-GB")} in` : ""}${n.calls_booked !== undefined ? ` · ${n.calls_booked} calls booked` : ""}${wr?.pace?.on_pace === false ? " · behind pace" : wr?.pace?.on_pace ? " · on pace" : ""}`,
    reds || yellows ? `👥 ${reds} red, ${yellows} yellow — check-ins are drafted for them` : "👥 Clients all looking healthy",
    `🎬 ${wk.text}`,
    learn?.matched >= 4 && learn?.text ? learn.text : "",
    "",
    "Next week: your ideas and plan land Monday morning. Reply \"go\" to lock it in.",
  ].filter((x) => x !== undefined && x !== null && x !== false as any);
  const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  await sendToMember(tid, o?.handle ?? null, lines.join("\n").replace(/\n{3,}/g, "\n\n"));
  return { ok: true, sent: true };
}

// Once a month: offer the win-back (only if there are people worth messaging)
async function winbackOffer(tid: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("stripe_key").eq("tenant_id", tid).maybeSingle();
  if (!cfg?.stripe_key) return { ok: true, skipped: "no stripe" };
  const since = Math.floor((Date.now() - 365 * 86400000) / 1000);
  const page: any = await stripeGet(cfg.stripe_key, "subscriptions?status=canceled&limit=100").catch(() => null);
  const n = new Set((page?.data ?? []).filter((x: any) => Number(x.canceled_at ?? 0) >= since).map((x: any) => x.customer)).size;
  if (n < 2) return { ok: true, skipped: "too few" };
  const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  await sendToMember(tid, o?.handle ?? null, `💌 ${n} people left in the last year. A personal message brings a few back every time. Reply "win them back" and I'll write one for each — you check them before anything sends.`);
  return { ok: true, sent: true, n };
}

// ===================== v9.7: button parity =====================
const WHATS_NEW = [
  { date: "2026-10-05", title: "Forge 3:3:3", text: "Every day holds 2 Musts, 3 To-dos and 2 Bonuses. Anything not done slots into the next free space." },
  { date: "2026-10-05", title: "Make a reel, start to finish", text: "Tap 🎬 Make a reel: Archie writes the script, you film with the teleprompter, Archie edits and posts at your best time." },
  { date: "2026-10-05", title: "Waiting on you", text: "Every message Archie drafted, every task it spotted and every reel ready to post — in one place, with Undo." },
];

async function sendAllDrafts(tid: string) {
  const w: any = await waitingList(tid);
  const drafts = (w.items ?? []).filter((x: any) => x.kind === "draft");
  let sent = 0; const failed: string[] = [];
  for (const d of drafts) { const r: any = await waitingAct(tid, "draft", d.id, "send", {}); if (r.ok) sent++; else failed.push(d.title.replace("Message to ", "")); }
  return { ok: sent > 0 || !drafts.length, sent, text: drafts.length ? `Sent ${sent} message${sent === 1 ? "" : "s"}.${failed.length ? ` Couldn't send: ${failed.join(", ")} (check them in GHL).` : " ✅"}` : "Nothing to send." };
}

async function checkinsDraft(tid: string, which: string) {
  const { data: mh } = await supabase.from("member_health").select("name, status").eq("tenant_id", tid).in("status", which === "red" ? ["red"] : which === "yellow" ? ["yellow"] : ["red", "yellow"]).limit(8);
  const names = (mh ?? []).map((m: any) => m.name).filter(Boolean);
  if (!names.length) return { ok: true, text: "No reds or yellows right now — everyone's looking healthy. 👌" };
  const r: any = await draftFollowups(tid, { names, purpose: "check in on how they're getting on" });
  return { ok: !!r.ok, text: r.ok ? `✍️ Check-ins drafted for ${names.length} client${names.length === 1 ? "" : "s"} — they're in Waiting on you.` : r.text };
}

// Booked calls in the next 24 hours (for a "Prep" button on each)
async function upcomingCalls(tid: string, handle: string) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id, timezone").eq("tenant_id", tid).single();
  const { data: m } = handle ? await supabase.from("team_members").select("ghl_user_id, personal_calendar_id").eq("tenant_id", tid).eq("handle", handle).maybeSingle() : await supabase.from("team_members").select("ghl_user_id, personal_calendar_id").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle();
  if (!m?.ghl_user_id) return { ok: true, calls: [] };
  const from = Date.now(), to = from + 24 * 3600000;
  const ev = await ghl(cfg?.ghl_token || FALLBACK_TOKEN, `/calendars/events?locationId=${cfg?.ghl_location_id}&userId=${m.ghl_user_id}&startTime=${from}&endTime=${to}`, "GET", undefined, "2021-04-15");
  const tz = cfg?.timezone || "Europe/London";
  const calls = (ev.json?.events ?? []).filter((e: any) => e.contactId && e.calendarId !== m.personal_calendar_id && !String(e.title ?? "").startsWith("🔨") && !["cancelled", "invalid"].includes(String(e.appointmentStatus ?? "").toLowerCase()))
    .map((e: any) => ({ id: e.id, title: e.title, contact_id: e.contactId, start: e.startTime, time: new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(e.startTime)) }));
  return { ok: true, calls };
}

// Beta: "Report a problem" → you and Sara on WhatsApp, saved with the screen they were on
async function reportProblem(tid: string, handle: string | null, text: string, screen: string) {
  if (text.trim().length < 3) return { ok: false, text: "Tell us what happened in a few words." };
  const { data: t } = await supabase.from("tenants").select("business_name").eq("id", tid).maybeSingle();
  await supabase.from("feature_feedback").insert({ tenant_id: tid, handle, feature: `report:${screen || "app"}`, rating: -1, comment: text.slice(0, 1000), channel: "page" });
  const { data: agency } = await supabase.from("tenant_config").select("tenant_id").eq("is_agency", true).limit(1).maybeSingle();
  if (agency?.tenant_id) await sendToTeam(agency.tenant_id, `🐞 ${t?.business_name ?? "A client"}${handle ? ` (${handle})` : ""} reported a problem${screen ? ` on ${screen}` : ""}:\n"${text.slice(0, 500)}"`, "", "report");
  return { ok: true, text: "Thanks — that's gone straight to the team. We'll be in touch." };
}

// Start a step in a fresh request (its own time allowance) instead of inside a long-running one
async function runFresh(action: string, body: Record<string, unknown>) {
  try {
    await fetch(`${SUPA_URL}/functions/v1/archie-screens`, { method: "POST", headers: { "Content-Type": "application/json", "x-archie-secret": SECRET }, body: JSON.stringify({ action, ...body }) });
  } catch (e) { console.log("runFresh failed", action, String(e).slice(0, 120)); }
}

// Hand a reel's content pack to a team member: a Forge task with every link + a WhatsApp to them
async function packHandoff(tid: string, jobId: string, handle: string) {
  const { data: job } = await supabase.from("edit_jobs").select("id, title, ghl_media_url, output_url, caption").eq("tenant_id", tid).eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, text: "I can't find that reel." };
  const { data: m } = await supabase.from("team_members").select("handle, name").eq("tenant_id", tid).eq("handle", handle).maybeSingle();
  if (!m) return { ok: false, text: "Who should it go to?" };
  const { data: st } = await supabase.from("content_stacks").select("id, carousel_id, story_id, email, linkedin").eq("tenant_id", tid).eq("job_id", jobId).maybeSingle();
  const ids = [st?.carousel_id, st?.story_id].filter(Boolean);
  const { data: cars } = ids.length ? await supabase.from("carousels").select("id, format, slides").in("id", ids) : { data: [] as any[] };
  const imgs = (fmt: string) => ((cars ?? []).find((x: any) => (fmt === "story" ? x.format === "story" : x.format !== "story"))?.slides ?? []).map((sl: any) => sl.image_url).filter(Boolean);
  const detail = [
    `Reel: ${job.ghl_media_url || job.output_url}`,
    imgs("carousel").length ? `Carousel (${imgs("carousel").length} slides) — post from the app (Content → this reel → Carousel → Post), or:\n${imgs("carousel").join("\n")}` : "",
    imgs("story").length ? `Story (${imgs("story").length} frames):\n${imgs("story").join("\n")}` : "",
    st?.email?.subject ? `Email — subject: ${st.email.subject}\n${st.email.body}` : "",
    st?.linkedin ? `LinkedIn post:\n${st.linkedin}` : "",
  ].filter(Boolean).join("\n\n");
  const { error } = await supabase.from("tasks").insert({ tenant_id: tid, title: `Post the content pack: ${job.title ?? "reel"}`.slice(0, 200), detail: detail.slice(0, 8000), tier: "high", kind: "shallow", effort_minutes: 30, status: "open", owner: m.handle, source: "pack", source_ref: `pack:${jobId}`, accepted_by: m.handle, accepted_at: new Date().toISOString() });
  if (error) return { ok: false, text: error.message };
  if (st?.id) await supabase.from("content_stacks").update({ handed_to: m.handle }).eq("id", st.id);
  await sendToMember(tid, m.handle, `📦 New content pack for you: "${job.title ?? "reel"}" — carousel, story, email and LinkedIn post are ready. It's in your Forge list with everything you need.`);
  startInBackground(forgePlan(tid, { force: true, from_now: true }));
  return { ok: true, text: `Sent to ${m.name || m.handle} — it's in their Forge list.` };
}

// Move a task to a day — pinned there so Forge won't put it back into today
async function taskMove(tid: string, id: string, to: string, handle: string | null) {
  const { data: cfg } = await supabase.from("tenant_config").select("timezone").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const { data: m } = handle ? await supabase.from("team_members").select("work_days").eq("tenant_id", tid).eq("handle", handle).maybeSingle() : { data: null };
  const workDays = String(m?.work_days ?? "1,2,3,4,5").split(",").map(Number);
  const nextWork = (from: string) => { let d = addDays(from, 1); for (let i = 0; i < 7 && !workDays.includes(new Date(d + "T12:00:00Z").getUTCDay()); i++) d = addDays(d, 1); return d; };
  let date = /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : "";
  const t = to.toLowerCase().trim();
  if (!date) {
    if (t === "tomorrow" || t === "next") date = nextWork(today);
    else if (t === "next week") { let d = today; for (let i = 0; i < 7; i++) { d = addDays(d, 1); if (new Date(d + "T12:00:00Z").getUTCDay() === 1) break; } date = d; }
    else {
      const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const idx = names.findIndex((n) => n.startsWith(t.slice(0, 3)));
      if (idx >= 0) { let d = today; for (let i = 0; i < 7; i++) { d = addDays(d, 1); if (new Date(d + "T12:00:00Z").getUTCDay() === idx) break; } date = d; }
      else date = nextWork(today);
    }
  }
  const { data: task } = await supabase.from("tasks").select("title, move_count, due_date").eq("tenant_id", tid).eq("id", id).maybeSingle();
  if (!task) return { ok: false, text: "I can't find that task." };
  const upd: Record<string, unknown> = { pinned_date: date, hold: false, move_count: (Number(task.move_count) || 0) + 1, scheduled_start: null, scheduled_end: null };
  if (task.due_date && task.due_date < date) upd.due_date = date;
  await supabase.from("tasks").update(upd).eq("tenant_id", tid).eq("id", id);
  await ackMoves(tid, id);
  await forgePlan(tid, { force: true, from_now: true });
  const label = new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  return { ok: true, date, text: `Moved "${task.title}" to ${label}.` };
}

async function waitingClear(tid: string) {
  const [a, b, c2] = await Promise.all([
    supabase.from("message_drafts").update({ status: "dismissed" }).eq("tenant_id", tid).eq("status", "pending").select("id"),
    supabase.from("tasks").update({ status: "dismissed", dismissed_reason: "cleared from Waiting on you", proposal_rank: null }).eq("tenant_id", tid).eq("status", "proposed").gte("created_at", new Date(Date.now() - 5 * 86400000).toISOString()).or("source.is.null,source.neq.manual").select("id"),
    supabase.from("edit_jobs").update({ planner_post_id: "skipped" }).eq("tenant_id", tid).eq("status", "done").is("planner_post_id", null).select("id"),
  ]);
  const n = (a.data?.length ?? 0) + (b.data?.length ?? 0) + (c2.data?.length ?? 0);
  return { ok: true, cleared: n, text: n ? `Cleared ${n} item${n === 1 ? "" : "s"} from Waiting on you. (Reels are still in Content.)` : "Nothing to clear." };
}

// ===================== v9.9 =====================
// Launchpad: the numbers that matter, one call. period = "month" (default) or "week".
async function launchpad(c: any, period: string) {
  const tid = c.tid;
  const { data: cfg } = await supabase.from("tenant_config").select("*").eq("tenant_id", tid).single();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  const monthStart = today.slice(0, 8) + "01";
  const prevMonthStart = (() => { const d = new Date(monthStart + "T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 10); })();
  // Calls + sales from the weekly numbers (each week cached) — this week, or every week touching this month
  const weeks: string[] = [];
  if (period === "week") weeks.push(mondayOf(today));
  else { let w = mondayOf(monthStart); while (w <= today) { weeks.push(w); w = addDays(w, 7); } }
  const nums = await Promise.all(weeks.map((w) => weekNumbers(tid, cfg, w, w === mondayOf(today), false).catch(() => ({}))));
  const sum = (k: string) => nums.reduce((a: number, n: any) => a + (Number(n?.[k]) || 0), 0);
  const booked = sum("calls_booked"), held = sum("calls_held"), noshow = sum("calls_noshow"), sales = sum("sales_count");
  const latest: any = nums[nums.length - 1] ?? {};
  // Stripe: MRR, clients, cash collected, one-time cash, churn, new MRR
  let mrr = Number(latest.mrr ?? 0) || 0, clients = 0, collected = 0, oneTime = 0, churnN = 0, churnLost = 0, newMrr = 0, prevNewMrr = 0;
  if (cfg?.stripe_key) {
    try {
      const subs: any = await stripeGet(cfg.stripe_key, "subscriptions?status=active&limit=100");
      const monthly = (sb: any) => (sb.items?.data ?? []).reduce((a: number, it: any) => { const pr = it.price ?? {}; const amt = Number(pr.unit_amount ?? 0) / 100 * Number(it.quantity ?? 1); const iv = pr.recurring?.interval; const ic = Number(pr.recurring?.interval_count ?? 1); return a + (iv === "year" ? amt / 12 / ic : iv === "week" ? amt * 52 / 12 / ic : amt / ic); }, 0);
      mrr = Math.round((subs?.data ?? []).reduce((a: number, sb: any) => a + monthly(sb), 0));
      clients = new Set((subs?.data ?? []).map((sb: any) => sb.customer)).size;
      const ms = Math.floor(Date.parse(monthStart + "T00:00:00Z") / 1000), pms = Math.floor(Date.parse(prevMonthStart + "T00:00:00Z") / 1000);
      newMrr = Math.round((subs?.data ?? []).filter((sb: any) => Number(sb.start_date) >= ms).reduce((a: number, sb: any) => a + monthly(sb), 0));
      const charges: any = await stripeGet(cfg.stripe_key, `charges?limit=100&created[gte]=${ms}`);
      for (const ch of charges?.data ?? []) { if (ch.status !== "succeeded" || ch.refunded) continue; const amt = (Number(ch.amount) - Number(ch.amount_refunded ?? 0)) / 100; collected += amt; if (!ch.invoice) oneTime += amt; }
      const canc: any = await stripeGet(cfg.stripe_key, "subscriptions?status=canceled&limit=100");
      for (const sb of canc?.data ?? []) { if (Number(sb.canceled_at ?? 0) >= ms) { churnN++; churnLost += monthly(sb); } if (Number(sb.start_date) >= pms && Number(sb.start_date) < ms) prevNewMrr += monthly(sb); }
      prevNewMrr += (subs?.data ?? []).filter((sb: any) => Number(sb.start_date) >= pms && Number(sb.start_date) < ms).reduce((a: number, sb: any) => a + monthly(sb), 0);
    } catch { /* optional */ }
  }
  // GHL: open pipeline value, offers made (opportunities in a proposal/offer stage), new leads this period
  let pipelineValue = 0, offers = 0, leads = 0;
  try {
    const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
    const pl = await ghl(token, `/opportunities/pipelines?locationId=${loc}`, "GET", undefined, "2021-07-28");
    const pipe = (pl.json?.pipelines ?? []).find((x: any) => x.id === cfg?.pipeline_id) ?? (pl.json?.pipelines ?? []).find((x: any) => String(x.name).trim() === String(cfg?.pipeline_name ?? "").trim()) ?? (pl.json?.pipelines ?? [])[0];
    if (pipe) {
      const offerStages = new Set((pipe.stages ?? []).filter((st: any) => /proposal|offer|quote|pitch/i.test(String(st.name))).map((st: any) => st.id));
      const from = period === "week" ? Date.parse(mondayOf(today) + "T00:00:00Z") : Date.parse(monthStart + "T00:00:00Z");
      for (let page = 1; page <= 3; page++) {
        const r = await ghl(token, `/opportunities/search?location_id=${loc}&pipeline_id=${pipe.id}&status=all&limit=100&page=${page}`, "GET", undefined, "2021-07-28");
        const batch: any[] = r.json?.opportunities ?? [];
        for (const o of batch) {
          if (o.status === "open") pipelineValue += Number(o.monetaryValue ?? 0);
          if (Date.parse(o.createdAt ?? o.dateAdded ?? 0) >= from) leads++;
          if (offerStages.has(o.pipelineStageId) && Date.parse(o.lastStageChangeAt ?? o.updatedAt ?? 0) >= from) offers++;
        }
        if (batch.length < 100) break;
      }
    }
  } catch { /* optional */ }
  const showRate = held + noshow ? Math.round((held / (held + noshow)) * 100) : null;
  const closeRate = held ? Math.round((sales / held) * 100) : null;
  const conv = leads ? Math.round((sales / leads) * 100) : null;
  const mrrDelta = prevNewMrr ? Math.round(((newMrr - prevNewMrr) / prevNewMrr) * 100) : null;
  const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
  const label = period === "week" ? "this week" : "this month";
  return {
    ok: true, period, label,
    headline: [
      { key: "revenue", label: "Total revenue", value: gbp(collected) },
      { key: "mrr", label: "Current MRR", value: gbp(mrr) },
      { key: "clients", label: "Total clients", value: String(clients) },
      { key: "conversion", label: "Conversion rate", value: conv === null ? "—" : `${conv}%` },
    ],
    cards: [
      { key: "mrr", label: "MRR", value: gbp(mrr), sub: "Monthly recurring" },
      { key: "new_cash", label: "New cash", value: gbp(oneTime), sub: "One-time payments" },
      { key: "collected", label: "Total collected", value: gbp(collected), sub: `All cash ${label}` },
      { key: "leads", label: "Inbound leads", value: String(leads), sub: `New ${label}` },
      { key: "booked", label: "Booked calls", value: String(booked), sub: label },
      { key: "showed", label: "Showed calls", value: String(held), sub: `Show rate: ${showRate === null ? "—" : showRate + "%"}` },
      { key: "noshow", label: "No-shows", value: String(noshow), sub: noshow ? "Worth a rebook message" : "None 👌", warn: noshow > 0 },
      { key: "offers", label: "Offers made", value: String(offers), sub: label },
      { key: "new_clients", label: "New clients", value: String(sales), sub: `Close rate: ${closeRate === null ? "—" : closeRate + "%"}` },
      { key: "churn", label: "Churn", value: clients + churnN ? `${Math.round((churnN / (clients + churnN)) * 100)}%` : "0%", sub: `${churnN} cancelled · ${gbp(churnLost)} lost`, warn: churnN > 0 },
      { key: "new_mrr", label: "New MRR added", value: gbp(newMrr), sub: mrrDelta === null ? "vs last month" : `${mrrDelta >= 0 ? "+" : ""}${mrrDelta}% vs last month`, good: (mrrDelta ?? 0) > 0 },
      { key: "pipeline", label: "Pipeline value", value: gbp(pipelineValue), sub: "Open opportunities" },
    ],
  };
}

// Save a reel's whole content pack as drafts (reel, carousel, story) for a VA to schedule
async function packDrafts(tid: string, jobId: string) {
  const done: string[] = [], skipped: string[] = [];
  const { data: job } = await supabase.from("edit_jobs").select("id, planner_post_id").eq("tenant_id", tid).eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, text: "I can't find that reel." };
  if (!job.planner_post_id || job.planner_post_id === "skipped") { const r: any = await reelToPlanner(tid, jobId, { draft: true }); r.ok ? done.push("reel") : skipped.push(`reel (${r.text})`); } else skipped.push("reel (already in Social Planner)");
  const { data: st } = await supabase.from("content_stacks").select("carousel_id, story_id").eq("tenant_id", tid).eq("job_id", jobId).maybeSingle();
  for (const [name, id] of [["carousel", st?.carousel_id], ["story", st?.story_id]] as const) {
    if (!id) continue;
    const { data: cr } = await supabase.from("carousels").select("status, planner_post_id").eq("id", id).maybeSingle();
    if (cr?.status !== "done") { skipped.push(`${name} (still being made)`); continue; }
    if (cr?.planner_post_id) { skipped.push(`${name} (already in Social Planner)`); continue; }
    const r: any = await carouselPost(tid, id); r.ok ? done.push(name) : skipped.push(`${name} (${r.text})`);
  }
  return { ok: done.length > 0, saved: done, skipped, text: done.length ? `Saved as drafts in Social Planner: ${done.join(", ")}.${skipped.length ? ` Not saved: ${skipped.join("; ")}.` : ""} The email and LinkedIn post are ready to copy.` : `Nothing new to save${skipped.length ? `: ${skipped.join("; ")}` : ""}.` };
}

// Today's brief for the app: short + full + the pieces to lay it out
async function briefToday(c: any) {
  const tid = c.tid, handle = c.owner?.handle ?? "";
  const { data: cfg } = await supabase.from("tenant_config").select("timezone, brief_style").eq("tenant_id", tid).maybeSingle();
  const tz = cfg?.timezone || "Europe/London";
  const today = localDate(Date.now(), tz);
  let { data: b } = await supabase.from("briefs").select("brief_date, body, short_body, read_at, created_at").eq("tenant_id", tid).eq("audience", handle).order("brief_date", { ascending: false }).limit(1).maybeSingle();
  if (!b) return { ok: true, has_brief: false, text: "Your first brief arrives tomorrow morning." };
  // No short version saved yet (older brief / app-only) → make it now and keep it
  if (!b.short_body && b.body) { const short = await shortBrief(tid, String(b.body), handle).catch(() => ""); if (short) { await supabase.from("briefs").update({ short_body: short }).eq("tenant_id", tid).eq("brief_date", b.brief_date).eq("audience", handle); b = { ...b, short_body: short }; } }
  const short = String(b.short_body ?? b.body ?? "");
  const lines = short.split("\n").map((x) => x.trim()).filter(Boolean);
  const greeting = lines[0] ?? "";
  const focus = (lines.find((l) => /^focus\b|^🎯/i.test(l)) ?? "").replace(/^(🎯\s*)?(your\s+)?focus\s*[:—-]\s*/i, "");
  const things = lines.filter((l) => /^\d[.)]\s/.test(l)).map((l) => l.replace(/^\d[.)]\s*/, "")).slice(0, 3);
  const w: any = await waitingList(tid).catch(() => ({ count: 0, summary: "" }));
  const { data: voice } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(`voice/${tid}/${b.brief_date}-${handle}.mp3`, 3600).catch(() => ({ data: null })) as any;
  return {
    ok: true, has_brief: true, date: b.brief_date, is_today: b.brief_date === today,
    greeting, focus, things, short, full: String(b.body ?? ""), waiting_count: w.count ?? 0, waiting_summary: w.summary ?? "",
    voice_url: voice?.signedUrl ?? null, read: !!b.read_at,
  };
}

// Add photos/clips to B-roll: our own copy → described → named → GHL Media (B-roll folder) → library
async function brollAdd(tid: string, items: { url: string; kind: string }[], notify: boolean) {
  const { data: cfg } = await supabase.from("tenant_config").select("ghl_token, ghl_location_id").eq("tenant_id", tid).single();
  const token = cfg?.ghl_token || FALLBACK_TOKEN, loc = cfg?.ghl_location_id;
  // Find the B-roll folder (it's in the snapshot; we only upload into it, never create folders)
  let folderId: string | null = null;
  try {
    const r = await ghl(token, `/medias/files?altId=${loc}&altType=location&type=folder&limit=100`, "GET", undefined, "2021-07-28");
    const f = (r.json?.files ?? r.json?.medias ?? []).find((x: any) => /^b[\s_-]*roll$/i.test(String(x.name ?? "").trim()));
    folderId = f?._id ?? f?.id ?? null;
  } catch { /* upload to the root instead */ }
  const saved: string[] = [], failed: string[] = [];
  const used = new Set<string>();
  for (const it of items) {
    try {
      // 1. Our own lasting copy (WhatsApp links expire)
      const src = await fetch(it.url); if (!src.ok || !src.body) { failed.push("one file couldn't be downloaded"); continue; }
      const ext = it.kind === "video" ? "mp4" : (/png/i.test(src.headers.get("content-type") ?? "") ? "png" : "jpg");
      const tmpPath = `broll/${tid}/${crypto.randomUUID()}.${ext}`;
      const { data: up } = await supabase.storage.from(CLIPS_BUCKET).createSignedUploadUrl(tmpPath);
      if (!up?.signedUrl) { failed.push("storage"); continue; }
      const put = await fetch(up.signedUrl, { method: "PUT", headers: { "Content-Type": it.kind === "video" ? "video/mp4" : `image/${ext === "png" ? "png" : "jpeg"}`, "x-upsert": "true" }, body: src.body, duplex: "half" } as any);
      if (!put.ok) { failed.push("storage upload"); continue; }
      const { data: signed } = await supabase.storage.from(CLIPS_BUCKET).createSignedUrl(tmpPath, 60 * 60 * 24 * 365);
      const ourUrl = signed?.signedUrl ?? "";
      // 2. Describe it, and name it from the description
      const desc = await describeBroll(ourUrl, it.kind === "image");
      let base = String(desc?.description ?? (it.kind === "video" ? "b-roll clip" : "b-roll photo")).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w && !["a", "an", "the", "of", "and", "with", "in", "on", "at", "is", "to"].includes(w)).slice(0, 6).join("-") || "b-roll";
      let name = `${base}.${ext}`; let n = 2; while (used.has(name)) name = `${base}-${n++}.${ext}`; used.add(name);
      // 3. Into GHL Media → B-roll
      const fd = new FormData();
      fd.append("hosted", "true"); fd.append("fileUrl", ourUrl); fd.append("name", name);
      if (folderId) fd.append("parentId", folderId);
      const g = await fetch(`https://services.leadconnectorhq.com/medias/upload-file?altType=location&altId=${loc}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28" }, body: fd });
      const gj: any = await g.json().catch(() => null);
      const mediaId = String(gj?.fileId ?? gj?._id ?? gj?.id ?? `archie:${tmpPath}`);
      const url = String(gj?.url ?? gj?.fileUrl ?? ourUrl);
      // 4. The library (ready for the next reel)
      await supabase.from("broll_library").insert({ tenant_id: tid, media_id: mediaId, name, url, kind: it.kind === "video" ? "video" : "image", description: desc?.description ?? null, tags: desc?.tags ?? null, seconds: desc?.seconds ?? null, active: true });
      saved.push(name);
    } catch (e) { failed.push(String(e).slice(0, 60)); }
  }
  await supabase.from("tenant_config").update({ broll_synced_at: new Date().toISOString() }).eq("tenant_id", tid);
  const text = saved.length
    ? `🎞️ Added ${saved.length} to your B-roll${folderId ? "" : " (saved in Media — there's no B-roll folder, so they're in the main list)"}:\n${saved.map((x) => `• ${x}`).join("\n")}${failed.length ? `\n\n${failed.length} didn't work — send ${failed.length === 1 ? "it" : "them"} again.` : ""}\n\nThey'll start showing up in your next reels.`
    : `I couldn't add those to B-roll (${failed.slice(0, 2).join("; ")}). Try sending them again.`;
  if (notify) { const { data: o } = await supabase.from("team_members").select("handle").eq("tenant_id", tid).eq("gets_financials", true).maybeSingle(); await sendToMember(tid, o?.handle ?? null, text); }
  return { ok: saved.length > 0, saved, failed, text };
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

// v9.12.1: anything Archie sends a team member on its own (carousel ready, reel done, brief, nudges) goes into
// their chat thread too, so when they reply "send it here" / "post it" Archie knows what "it" is.
const NO_TALK_LOG = new WeakSet<object>();
async function logNotify(body: any) {
  try {
    const cid = String(body?.contactId ?? ""), msg = String(body?.message ?? "").trim();
    if (!cid || !msg) return;
    const { data: m } = await supabase.from("team_members").select("tenant_id, handle").eq("ghl_contact_id", cid).limit(1).maybeSingle();
    if (m?.handle) await supabase.from("talk_messages").insert({ tenant_id: m.tenant_id, handle: m.handle, role: "archie", text: msg.slice(0, 4000), channel: "notify" });
  } catch { /* never block a send */ }
}

async function ghl(token: string, path: string, method = "GET", body?: unknown, version = "2021-07-28") {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 15000);
  try {
    if (method === "POST" && path === "/conversations/messages" && body && typeof body === "object" && !NO_TALK_LOG.has(body as object)) {
      const b = body as object; queueMicrotask(() => { void (async () => { await new Promise((ok) => setTimeout(ok, 50)); await logNotify(b); })(); });
    }
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
