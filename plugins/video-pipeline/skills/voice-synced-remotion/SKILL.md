---
name: voice-synced-remotion
description: Use when building a Remotion video with voiceover. Makes the audio set each scene's length, so re-recording one take re-times the whole video.
---

Record one audio file per take into `public/vo/<scene>.wav`. Never set scene lengths by hand.

Install `@remotion/media-parser` at the same version as the other Remotion packages.

In `src/Root.tsx`, read every take's length in `calculateMetadata`, add a 0.4 s tail, and pass the frames as props:

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

The composition renders a `<Series>` with one `<Series.Sequence durationInFrames={sceneFrames[i]}>` per scene, holding that scene's visuals plus an `<Audio>` for its take.

Build one scene at a time. After each, render a still at its midpoint (`npx remotion still <id> --frame=<mid>`) and check that text fits and nothing overlaps.
