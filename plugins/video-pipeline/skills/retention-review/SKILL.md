---
name: retention-review
description: Use when a published video is underperforming and you have its retention curve. Finds the steepest audience drops and shows the script line playing at each one.
---

Inputs:
- A JSON file with `durationSec` and `retention`: an array of `[fractionOfVideo, fractionOfViewers]` pairs.
- A timestamped script: SRT, WebVTT (YouTube auto-captions work), or JSON `[{"start": seconds, "text": "..."}]`.

Run:

```
node ${CLAUDE_SKILL_DIR}/scripts/retention-review.mjs retention.json script.vtt [topN]
```

Report the drops it prints, steepest first, with the line at each one.
Do not guess why viewers left. The skill gives places to look, not causes.
With a few dozen viewers, a couple of people can bend the curve. Say so, and look for the same pattern across several videos before changing anything.

Then add one line per finding to `lessons.md`: what happened and where you saw it. When the same line shows up twice, turn it into a rule in the brief. When a rule keeps helping, make it a skill.
