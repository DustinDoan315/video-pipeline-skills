---
name: scene-qa
description: Use after building or changing any video scene, and before every full render. Renders a still at the end of each caption into contact sheets and checks layout, overlaps and readability.
---

Run `npm run qa` (all takes) or `npm run qa -- <take id>` in the video project. It writes `out/qa/sheet-<take>.png`: one still per caption, taken when that caption's visual has fully arrived.

Open every sheet and check each still:
- Text fits inside its card or panel; no line runs off screen; code lines are not cut.
- Stickers do not cover the main visual, a meme's text or the caption band.
- The caption at the bottom matches the visual above it.
- Nothing is empty that should show something (a blank frame usually means a visual index is off by one).
- Numbers match `src/data/video.json`.

Fix, re-run that take, and look again. A sheet you did not open does not count as checked.

Stills can't judge pacing or sound. After the full render:
- Grab 3-4 frames from the final mp4 with `ffmpeg -ss <sec> -i out/video.mp4 -frames:v 1 x.png` and look at them.
- Ask the user to watch it once at 1x, and the first 15 seconds on a phone with sound off. Say plainly that you cannot hear the audio.
