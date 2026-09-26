-- Archie Playbooks v2 — Joe's real playbooks for the FitLogic tenant.
-- Tenant rows override the global starters automatically. Safe to run twice.
delete from playbooks where tenant_id = '3040c498-0395-4749-b7d9-22b16f9cc37f';

insert into playbooks (tenant_id, situation, title, principles, examples, active) values
('3040c498-0395-4749-b7d9-22b16f9cc37f', 'stale_proposal', 'Deals gone quiet',
$$Three steps, no pressure. 1) 24 hours after the call or proposal with no reply, Joe sends a voice note — Archie cannot send voice notes, so propose a task for Joe to record one, never a text draft for this step. 2) Still nothing: a short text message picking up exactly where they left off. 3) Still nothing: a close-the-loop message that makes "not now" easy to say. After that, move them to a monthly follow-up, not weekly chasing. Direct, friendly, Scottish, human.$$,
$$"Hey mate, if now's not the right time, no worries — just let me know and I'll stop hassling you." / "Listen, if now's not the right time, that's totally fine. We can circle back to this."$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'price_objection', 'When price is the sticking point',
$$If it's too expensive, it's too expensive — let them go. Never discount. Don't push payment plans or split payments onto people. The only move is a smaller scope: offer X, Y and Z instead of the full project, framed around saving them time or making them money, with the rest added later. Never put pressure on.$$,
$$"Totally get it. We could start with just [X and Y] — that's the bit that'll save you the most time. We can add the rest whenever you're ready." / "No worries at all mate. If things change, you know where I am."$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'failed_payment', 'Failed payments',
$$Never blame the person — blame the bank or the card, and say it happens all the time. Sara sends the link to update card details or pay while Stripe keeps retrying in the background. Only pause the service if the payment has been failing for around two weeks.$$,
$$"Hey [name], looks like the bank's knocked back this month's payment — happens all the time, no stress. Sara will send you a link to sort it." / "Hey [name], just a nudge on the payment link — shout if the bank's giving you any grief."$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'customer_quiet', 'A client going quiet',
$$Human first: check they're OK before anything about work. A quiet client is usually either flat out with work (talking to the tech guy isn't a priority) or dealing with a big life event. Assume one of those, never that they're unhappy. Never open with the renewal, the invoice or the system.$$,
$$"Hey mate, not heard from you in a wee while — everything alright?" / "Hey [name], just checking in on you, not the system. How's things?"$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'slow_month', 'A slow month',
$$Run a mini offer: a quick, specific tool Joe can build in about four hours for around £500 — often a piece of Archie sold on its own. Offer it to people who already know him first.$$,
$$"Quick one — I've got space to build [tool] this week. Four hours, done for you, £500. Anyone want it?" / "Hey mate, I've got a wee tool that does [result]. Thought of you — want me to set it up?"$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'growing', 'A growing month',
$$Joe's habit in a good month is to stop — push against that. Keep doing exactly what's working and don't change the plan mid-momentum. Then refine from the numbers: of the things done, which actually moved the business? Suggest cutting what didn't, so the workload doesn't grow with the business.$$,
$$"Good month. Don't change anything this week — keep doing [what worked]." / "You did [A, B, C]. The numbers moved after [A]. Worth dropping [C]?"$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'weak_offer', 'An offer that isn''t landing',
$$Signs: nobody wants it, nobody asks about it, nobody messages about it. Stop looking at it as the builder. Look at it as the buyer: does it solve a real problem, which one, and how big is that problem for them? Rework it from there.$$,
$$"What problem does this solve, in the buyer's words?" / "How much does that problem cost them right now?" / "Would they notice if it disappeared tomorrow?"$$, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'raising_prices', 'Raising prices',
$$Never raise prices for existing clients — they're grandfathered in as a loyalty bonus. A client who leaves and comes back pays the new price. No public announcement: when someone new asks, just give the new price.$$,
null, true),

('3040c498-0395-4749-b7d9-22b16f9cc37f', 'referrals', 'Referrals',
$$Joe doesn't ask for referrals yet: long-term clients mostly only talk to him when something needs fixing, so an ask would feel like a cash grab. Build back-and-forth first — check-ins, sharing wins, a community feel, contact that isn't about bugs. Only suggest a referral ask right after a client gets a clear result and there's been recent friendly contact.$$,
null, true);

select situation, title from playbooks
where tenant_id = '3040c498-0395-4749-b7d9-22b16f9cc37f'
order by situation;
