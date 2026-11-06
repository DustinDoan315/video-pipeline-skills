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
- Captions are spread proportionally, not word-synced. If they drift visibly, add `"cueAt": [0, 5.2, 8.3]` to the take: one start time in seconds per caption, measured in that take's wav.
- To find the start times, list the pauses: `ffmpeg -i public/vo/<id>.wav -af silencedetect=noise=-35dB:d=0.25 -f null - 2>&1 | grep silence_end`. Start each caption about 0.15 s before the speech after a pause.
- **Word-synced captions** (the spoken word lights up): transcribe each take with word timestamps, one wav per call:
  `uvx --from mlx-whisper mlx_whisper public/vo/<id>.wav --word-timestamps True --output-format json --output-dir out/words --language en`
  then `npm run words`. It matches the spoken words to the caption words (so "4.8" lines up with "four point eight") and writes `wordAt` and `cueAt` into each take. Re-run it after you change a caption or re-record a take.
- One long voice file? Cut it into takes at the longest pauses (`ffmpeg -i full.mp3 -ss <a> -to <b> public/vo/<id>.wav`) before setting cueAt.

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
