---
name: make-video
description: Use when the user wants to make a YouTube video with Claude Code and Remotion, long-form or a vertical Short, from idea to upload-ready file. Runs the whole pipeline in order, from what fits the channel to the review after publishing, and says which skill handles each step.
---

Work through these steps in order. Each step names the skill to load. Do not skip a step; if the user asks you to, say what skipping it risks.

1. **Channel.** Find `channel.md` in this folder or a parent. If it is missing or over 30 days old, load `channel-profile`.
2. **Package first.** Load `package-first`. Fit the topic to the channel, pick the format, check what people search, and write 3 titles and 3 thumbnail concepts. The user picks before anything else is written.
3. **Brief.** Load `video-brief`. Write `brief.md` and the data file. Stop and ask if a number is missing.
4. **Script.** Load `viewer-first-script`. Write `src/data/script.json`. Show the user the captions before building.
5. **Assets.** Load `assets-and-rights`. Real screen recordings first, then data, screenshots and credits.
6. **Scenes.** Load `remotion-scene-kit`. Copy the template, then build and check one take at a time.
7. **Timing.** Load `voice-synced-remotion`. Long videos use the creator's recorded voice; text mode is for drafts and caption-only Shorts.
8. **Check.** Load `scene-qa`. Contact sheets for every take; fix every overlap before the full render.
9. **Audio.** Load `audio-bed`. Music bed, then loudness to -16 LUFS.
10. **Render.** `npm run render` in the project. Look at the first frame and 3-4 others from the final mp4.
11. **Publish package.** Load `publish-package`, then `prepublish-check`. Never hand over metadata that fails the check.
12. **Shorts.** After a long video, load `shorts-from-long` and cut 3-5 Shorts that stand alone, each pointing back to it.
13. **After publishing.** For the first 48 hours change nothing. At 7 and 28 days, load `retention-review` and add what you learn to `channel.md`.

**A Short made on its own** follows the same steps with `"format": "short"` in `script.json`, the Shorts rules in `viewer-first-script` and `publish-package`, and no chapters. In step 12, point it at the long video it fits best.

Rules for the whole run:
- The video keeps the title's promise, and the first seconds show it.
- Every number on screen comes from `src/data/video.json`. Never type a figure into a scene.
- Teach the viewer. The creator's own stats appear only as one-line examples, never as a chapter.
- Ask for subscribe only after a payoff: at most once mid-video, once at the end.
- Make it look made by a person: real screen recordings, the creator's voice, a structure chosen for this topic. YouTube does not pay for templated or scrolling-text videos with little narration.
- Report what you could not verify (audio you cannot hear, hooks you could not trigger).
