---
name: video-brief
description: Use at the start of a new video, before any script or scene. Writes a 4-part brief (audience, outcome, evidence, never list) and the data file every number must come from.
---

Write `brief.md` in the project with exactly these parts (template: `${CLAUDE_SKILL_DIR}/../../templates/video-brief.md`):

- **AUDIENCE**: who it is for and what they already know.
- **OUTCOME**: the one thing they can do after watching. If you cannot write it in one sentence, ask the user.
- **EVIDENCE**: the files allowed as sources. Usually only `src/data/video.json` plus files the user names.
- **NEVER**: never invent a number; if a fact is missing, stop and ask. No subscribe ask before the payoff. Result in the first 10 seconds. Method gets one line.

Then create `src/data/video.json` with every figure the video will show, each with where it came from:

```json
{ "retention": { "durationSec": 290, "points": [[0,1],[0.09,0.5]], "source": "YouTube Analytics, 1 Oct-2 Nov 2026" } }
```

Scenes reference values as `"$retention.durationSec"`. `npm run collect` fails if a reference is missing.

If a number cannot be sourced, leave it out of the data file and tell the user. Do not estimate.
