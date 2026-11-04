---
name: remotion-scene-kit
description: Use when building the scenes of a video in Remotion. Copies the data-driven template (captions, visuals, memes, stickers, subscribe CTA, channel branding) and builds one take at a time.
---

**Start a project**

```bash
cp -R "${CLAUDE_SKILL_DIR}/../../template" my-video && cd my-video && npm install
```

Set `"channel": {"name", "tagline", "logo"}` in `src/data/script.json` (logo is a path in `public/`, optional).

**How a take is built** (all in `src/data/script.json`)
- `captions`: the narration on screen. Timing comes from them (see `voice-synced-remotion`).
- `visuals`: `{ "<caption index>": spec }`. A visual stays until the next one. Kinds: `title`, `big`, `steps`, `check`, `cards`, `stat`, `bars`, `curve`, `code`, `terminal`, `cmd`, `image`, `clip`. Optional `source` adds a small source line.
- `code`/`terminal` take `file`: a file in `src/data/files/` (real command output, real code). Capture real output; never type fake output.
- `bars`/`stat`/`curve` values use `"$path.in.video.json"`.
- `memes` and `stickers`: see `viewer-first-script`.
- A scene the kinds can't express: add a component to `src/custom.tsx` keyed by take id. Use `Beat`, `Center`, `Card`, `Code` from `src/ui.tsx`.

**Loop, one take at a time**
1. Edit the take.
2. `npm run collect` (fails on bad indexes, missing files, missing data keys, unknown kinds).
3. `npm run qa -- <take id>` and look at the sheet (load `scene-qa`).
4. Fix, repeat. Only then move to the next take.

Restyle everything by editing `C` (colors) in `src/ui.tsx`. Layout lives in `src/layout.ts`: `"format": "short"` in script.json switches to 1080x1920 with captions and memes kept out of the Shorts button area. To cut Shorts from a finished long video, load `shorts-from-long`.

**Troubleshooting**
- `Target closed` / `icudtl.dat not found` on macOS: Chrome can't run from inside `~/Documents`. Copy `node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64` to `~/.cache/remotion-chrome/` and set `REMOTION_CHROME` to the `chrome-headless-shell` binary inside it.
- `Error loading image`: a file in `public/` is missing. `npm run collect` names it.
