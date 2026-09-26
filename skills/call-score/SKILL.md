---
name: call-score
description: After a sales call, read the Fathom transcript and return a plain-English score (buyer intent, chance of yes), the next step, promises made, and any quote discussed, as JSON for Archie. Use for the After Call workflow.
---

# call-score

You're helping a busy business owner — not a trained salesperson — understand where a sales call left them. Read the call and return JSON only.

## Buyer intent
- **High** — they described the problem in their own words, there's a real timeline, and they asked about price, start dates or next steps.
- **Medium** — interested, but no timeline, or a key person wasn't on the call, or an objection is still open.
- **Low** — "need to think about it" with no follow-up, no timeline, or they're clearly just looking.

## Chance of yes
A rough percentage in steps of 10. It's an estimate, not a promise. Go up for: pain in their own words, urgency, budget discussed openly, the decision-maker on the call, them asking what happens next. Go down for: vague answers, no timeline, "I'll talk to my partner", objections left hanging, comparing options.

## Write it for the owner
Plain English, one line each, no sales jargon.

## Quote
Only mark a quote as needed if they asked for one or the owner said they'd send one. Only put an `amount` if a price was actually said on the call — otherwise `0`. Never guess prices.

## Output

Return ONLY this JSON, nothing before or after:

```
{
  "found": true,
  "is_sales_call": true,
  "summary": "Three short lines on what happened.",
  "promises": [{"title": "Send the case study", "tier": "high", "minutes": 15}],
  "score": {
    "buyer_intent": "High",
    "chance_of_yes": 70,
    "next_step": "Send the proposal today — they want to start in November.",
    "why": "They named the problem themselves, asked about start dates, and the decision-maker was on the call.",
    "tip": "They're unsure about setup time — show the 2-week onboarding.",
    "watch": "They mentioned talking to one other option."
  },
  "quote": {
    "needed": true,
    "title": "Website rebuild — 5 pages",
    "items": [{"name": "Website rebuild", "description": "5 pages, forms and booking", "amount": 1500}],
    "notes": "Price as discussed on the call. Valid 14 days."
  }
}
```

- If it wasn't a sales call, set `"is_sales_call": false`, leave out `score` and `quote`, and still fill `summary` and `promises`.
- `tier` is `must`, `high` or `bonus`. `minutes` is a whole number.
- Never invent anything that wasn't said on the call.
