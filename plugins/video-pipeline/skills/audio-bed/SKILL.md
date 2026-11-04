---
name: audio-bed
description: Use when a video needs background music or its loudness fixed. Generates an original lo-fi bed (no copyright claims) and normalizes the final audio to -16 LUFS.
---

**Music bed**
1. `npm run chapters` prints the total length.
2. `npm run music -- <seconds>` writes `public/music/bed.mp3`: an original loop from `scripts/make-music.py` (no samples, so nothing for Content ID to match), stretched, warmed and faded.
3. In `src/data/script.json`, set `"music": "music/bed.mp3"` and `"musicVolume"` (0.35 sits under sound effects; use ~0.15 under a voice).

To change the feel, edit `prog` (chords), `BPM` or `melody` in `scripts/make-music.py`. Use a track from a library only if the user names it and its license allows YouTube use; put its credit in `requiredLines` (see `publish-package`).

**Loudness**
`npm run render` ends with `scripts/finish-audio.sh`, which normalizes to -16 LUFS without re-encoding the picture and prints the measured value. Report that number. Anything quieter than -20 LUFS sounds weak next to other videos.

You cannot hear the result. Say so, and ask the user to listen once.
