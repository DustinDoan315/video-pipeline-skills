---
name: voice-synced-remotion
description: Use when setting how long each scene of a Remotion video lasts. Lets the voice recording, or the caption text when there is no voice, decide the timing, so re-recording or rewording one take re-times the whole video.
---

Never set scene lengths by hand. The template (`remotion-scene-kit`) does this in `src/timing-core.mjs`, shared by the render, the QA stills and the chapter list, so they always agree.

**Text mode** (no voice), `"timing": "text"` in `script.json`
- Each caption lasts its reading time: words / 3 + 0.8 s, never under 2.5 s.
- Reword a caption and its take re-times.

**Voice mode**, `"timing": "voice"`
- Record one file per take: `public/vo/<take id>.wav`. Quiet room, mic 15-20 cm away, 1 s of silence at each end.
- `calculateMetadata` in `src/Root.tsx` reads each file's length with `@remotion/media-parser` (keep its version equal to the other Remotion packages). The take lasts that long plus a short tail, and captions share the time in proportion to their length.
- Re-record one take and only that take changes length; everything after it moves.
- Captions are spread proportionally, not word-synced. If they drift visibly, split the take into shorter takes.

Not using the template? The core is:

```tsx
calculateMetadata={async () => {
  const seconds = await Promise.all(SCENES.map(async (s) => {
    const {durationInSeconds} = await parseMedia({src: staticFile(`vo/${s}.wav`), fields: {durationInSeconds: true}});
    return durationInSeconds ?? 0;
  }));
  const sceneFrames = seconds.map((s) => Math.ceil((s + 0.4) * FPS));
  return {durationInFrames: sceneFrames.reduce((a, b) => a + b, 0), props: {sceneFrames}};
}}
```
