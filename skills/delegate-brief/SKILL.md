---
name: delegate-brief
description: Turn a rough task into a clear brief for a team member (usually Sara), plus a short message to send them. Use when the owner wants to hand something off or delegate a task.
---

# delegate-brief

The input is a rough task, often a line or two. Turn it into a brief clear enough that the team member can do it without coming back with questions.

## Output

**Brief**

- **Task:** a clear title.
- **Outcome:** what "done" looks like, specifically.
- **Why it matters:** one line.
- **Steps:** numbered, one action each. Keep them high level if the person already knows how, detailed if it's new to them.
- **Deadline:** from the input, or `[CHECK: deadline]`.
- **You'll need:** access, links, files. `[CHECK: …]` for anything mentioned but not given.
- **Check with me first if:** the one or two situations where they should ask before acting (e.g. anything client-facing that isn't templated, anything involving money).
- **Send back when done:** exactly what to send the owner (a link, a screenshot, a one-line update).

**Message to send**
A short WhatsApp-style message in the owner's voice handing it over: what, by when, and "the full brief's below". 2–3 sentences.

## Rules
- Plain UK English. Friendly and clear, never bossy.
- Never invent deadlines, links, prices or client details — mark gaps with `[CHECK: …]`.
- Output only the brief and the message.
