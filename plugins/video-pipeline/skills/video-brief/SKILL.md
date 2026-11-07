---
name: video-brief
description: Use at the start of a new video, after the title and thumbnail are picked and before any script or scene. Writes a brief (format, package, audience, outcome, hook, evidence, never list) and the data file every number must come from.
---

Take the format, title and thumbnail from `package.md` (load `package-first` if there is none) and the audience and never list from `channel.md`. Write `brief.md` in the project with exactly these parts (template: `${CLAUDE_SKILL_DIR}/../../templates/video-brief.md`):

- **FORMAT**: long (search how-to, build it, workflow, A vs B, tested it, fix, news hands-on) or Short (tip, fail and fix, A vs B, numbered list, before and after, news demo).
- **PACKAGE**: the chosen title and thumbnail. The video must deliver exactly what they promise, early.
- **AUDIENCE**: who it is for and what they already know.
- **OUTCOME**: the one thing they can do after watching. If you cannot write it in one sentence, ask the user.
- **HOOK**: what is on screen and what is said in the first 5 seconds (the first second for a Short). It shows the result, not a promise of it.
- **EVIDENCE**: the files allowed as sources. Usually only `src/data/video.json`, the screen recordings, and files the user names.
- **NEVER**: never invent a number; if a fact is missing, stop and ask. No intro, logo or greeting before the hook. No subscribe ask before the payoff. Method gets one line. Add the never list from `channel.md`.

Then create `src/data/video.json` with every figure the video will show, each with where it came from:

```json
{ "retention": { "durationSec": 290, "points": [[0,1],[0.09,0.5]], "source": "YouTube Analytics, 1 Oct-2 Nov 2026" } }
```

Scenes reference values as `"$retention.durationSec"`. `npm run collect` fails if a reference is missing.

If a number cannot be sourced, leave it out of the data file and tell the user. Do not estimate.
