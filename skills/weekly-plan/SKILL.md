---
name: weekly-plan
description: Plan next week's content as 5–7 specific ideas spread across the business's pillars, angles and formats, returned as JSON for Archie. Use for the Saturday content plan.
---

# weekly-plan

Plan next week's content for the business in the context given.

## How to plan
- 5 to 7 ideas, one per day, Monday first.
- Spread them across the content pillars — no pillar more than twice.
- Rotate the angles: story, belief shift, problem solving, objection, social proof (social proof only if the business context mentions real results).
- Mix the formats: reels, carousels, posts and stories. At least one of each where there are 5+ ideas.
- Every idea must be specific enough to film or write today — "3 mistakes coaches make with check-ins", not "check-in tips".
- Don't repeat any of the recent ideas listed.
- The hook is the first line or first spoken sentence — under 12 words, no clickbait.

## Output

Return ONLY a JSON array, nothing before or after it:

```
[
  {"day": "Mon", "idea": "…", "hook": "…", "pillar": "…", "angle": "story", "format": "reel"},
  {"day": "Tue", "idea": "…", "hook": "…", "pillar": "…", "angle": "problem solving", "format": "carousel"}
]
```

- `format` is exactly one of: `post`, `reel`, `carousel`, `stories`
- `angle` is exactly one of: `story`, `belief shift`, `problem solving`, `objection`, `social proof`
- `pillar` is exactly one of the business's pillars
