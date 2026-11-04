---
name: make-video
description: Use when the user wants to make a YouTube video (long-form or a Short) with Claude Code and Remotion, from idea to upload-ready file. Runs the whole pipeline in order and says which skill handles each step.
---

Work through these steps in order. Each step names the skill to load. Do not skip a step; say so if the user asks you to.

1. **Brief.** Load `video-brief`. Write `brief.md` and the data file. Stop and ask if a number is missing.
2. **Script.** Load `viewer-first-script`. Write `src/data/script.json` (captions, visuals, memes, stickers). Show the user the captions before building.
3. **Assets.** Load `assets-and-rights`. Collect real data, screenshots, clips and credits.
4. **Scenes.** Load `remotion-scene-kit`. Copy the template, then build and check one take at a time.
5. **Timing.** Load `voice-synced-remotion`. Text mode (no voice) or voice mode (one wav per take).
6. **Check.** Load `scene-qa`. Contact sheets for every take; fix every overlap before the full render.
7. **Audio.** Load `audio-bed`. Music bed, then loudness to -16 LUFS.
8. **Render.** `npm run render` in the project. Spot-check 3-4 frames from the final mp4.
9. **Publish package.** Load `publish-package`, then `prepublish-check`. Never hand over metadata that fails the check.
10. **After 48 hours.** Load `retention-review`. Add one line per failure to `lessons.md`.

Rules for the whole run:
- Every number on screen comes from `src/data/video.json`. Never type a figure into a scene.
- Teach the viewer. The creator's own stats appear only as one-line examples, never as a chapter.
- Ask for subscribe only after a payoff: once mid-video, once at the end.
- Report what you could not verify (audio you cannot hear, hooks you could not trigger).
