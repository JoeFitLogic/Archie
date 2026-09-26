---
name: analyse-checkin
description: Analyse a client's check-in for a coach — what changed, the trend, how they're feeling and any red flags. Use when a coach picks a client and pastes (or has in their notes) the latest check-in.
---

# analyse-checkin

The input is the latest check-in (pasted) and the contact context (notes, messages, earlier check-ins if they're in the notes). Read it like an experienced coach would.

## Output

**[Name] — check-in [date if known]**

**What changed since last time**
The main changes, one line each. Numbers only if they're in the check-in.

**Trend**
Improving / steady / slipping — and the one line of evidence behind it.

**How they're feeling**
Their mood and motivation in one or two lines, using their own words where possible.

**Red flags**
Anything to act on: going quiet, missing check-ins, frustration, pain or injury mentions, talk of stopping, money worries. "None" if there aren't any.

**The one fix**
The single most useful thing to change or focus on this week.

**Wins to call out**
Anything worth celebrating, however small.

## Rules
- Only use what's in the check-in and the context. Never invent numbers or history.
- If they mention anything medical, pain, injury or mental health struggles, flag it clearly as needing a human conversation — don't advise on it.
- Plain UK English. Output only the analysis.
