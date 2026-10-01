---
name: email-sequence
description: Write an email sequence in the owner's voice — nurture, launch, re-engagement, onboarding or win-back. Use when asked to write emails, an email sequence, a nurture, a launch sequence or follow-up emails.
---

# email-sequence

Write a short sequence of emails the owner can load into their CRM and send as they are. Use Archie Voice for tone and the business context for the offer, the audience and their problems. Every email has one job and one call to action.

## Sequence types

| Type | Emails | Spacing (days after start) | Job |
|---|---|---|---|
| **nurture** | 5 | 0, 2, 4, 7, 10 | New leads who haven't booked: build trust, handle the main doubt, invite a call |
| **launch** | 6 | 0, 2, 4, 5, 6, 7 | A new offer or intake with a close date: announce, explain, prove, answer objections, last call |
| **re-engagement** | 3 | 0, 3, 7 | Old leads gone quiet: a friendly check-in, one useful idea, a simple yes/no |
| **onboarding** | 4 | 0, 1, 3, 7 | New clients: welcome, what happens next, how to get the most from it, first win |
| **win-back** | 3 | 0, 4, 10 | Past clients: what's new, a reason to come back, an easy way to start again |

If the request doesn't say which type, pick the one that fits best and say which at the top.

## Each email

- **Subject:** under 45 characters, plain and specific, no clickbait, no ALL CAPS, at most one emoji.
- **Preview text:** under 90 characters, adds to the subject rather than repeating it.
- **Body:** 80–180 words. Short paragraphs (1–3 sentences). Written to one person. Uses `{{contact.first_name}}` for their name.
- **One call to action**, the same kind through the sequence (book a call, reply, or join). Use the booking link from the business context if there is one, otherwise `[CHECK: booking link]`.
- Signed off with the owner's first name only.

## Rules
- Plain UK English. No hype, no fake urgency, no invented results, testimonials, prices or dates — use `[CHECK: …]` for anything missing.
- Launch close dates and prices only if they're in the request or the business context.
- No discounts unless the request asks for one.
- Each email must make sense on its own — people won't read them all.

## Output

First, the sequence for a person to read:

**[Type] sequence — [what it's for]**

**Email 1 · day 0**
Subject: …
Preview: …

[body]

(and so on for each email)

Then, on its own line at the very end, the same emails for saving into the CRM:

EMAILS_JSON: [{"day":0,"subject":"…","preview":"…","body":"…"}, …]

The body in the JSON is the same text as above, with paragraphs separated by \n\n. Nothing after the JSON.
