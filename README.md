# video-pipeline-skills

A Claude Code plugin for making YouTube videos with Claude Code and Remotion, from brief to upload-ready file. Built from 20 videos that failed, so yours don't have to.

## Install

```
/plugin marketplace add DustinDoan315/video-pipeline-skills
/plugin install video-pipeline@dustin-builds
```

Then ask Claude Code to "make a video about ..." and the `make-video` skill walks through every step.

## Skills

| Step | Skill | What it does |
|---|---|---|
| All | `make-video` | Runs the steps below in order |
| 1 | `video-brief` | 4-part brief and the data file every number comes from |
| 2 | `viewer-first-script` | Tutorial structure, jokes, meme and sticker slots, subscribe only after value |
| 3 | `assets-and-rights` | Real data, clips and screenshots; what not to use; credit tracking |
| 4 | `remotion-scene-kit` | Copies the template and builds one take at a time |
| 5 | `voice-synced-remotion` | Timing from voice files, or from caption reading time |
| 6 | `scene-qa` | Contact sheets of every caption's still before the full render |
| 7 | `audio-bed` | Original lo-fi music bed and -16 LUFS loudness |
| 9 | `publish-package` | Title, description, chapters from real timing, tags, pinned comment |
| 9 | `prepublish-check` | Blocks placeholders, bad tags, broken chapters, missing credits. Also a `PreToolUse` hook on `vidiq_update_video` |
| 10 | `shorts-from-long` | Cuts 2-3 vertical Shorts from a long video's takes, each pointing back to it |
| 11 | `retention-review` | Steepest audience drops and the script line at each one |

## The template

`plugins/video-pipeline/template` is a Remotion project you drive from JSON, in 16:9 or 9:16 (`"format": "short"`). Each take in `src/data/script.json` has captions, plus visuals, memes and stickers keyed by caption index. Numbers come from `src/data/video.json` as `"$path"` references.

```bash
cp -R plugins/video-pipeline/template my-video && cd my-video && npm install
npm run music -- 40   # original music bed, 40 s
npm run qa            # contact sheets in out/qa/
npm run chapters      # YouTube chapters from the real timing
npm run render        # out/video.mp4 at -16 LUFS
npm run short -- ../my-short 01-hook   # vertical 1080x1920 Short from chosen takes
```

It needs Node 22+, ffmpeg and python3. Emoji art is Twemoji (CC-BY 4.0). Credit it in your description:
`Emoji art: Twemoji by Twitter/X, CC-BY 4.0 (https://github.com/jdecked/twemoji)`.

## Tests

```bash
cd plugins/video-pipeline/skills/prepublish-check/scripts && node --test
cd plugins/video-pipeline/skills/retention-review/scripts && node --test
```

`examples/old-usage-limits.json` is a real published description that fails the check.

## Limits

- The hook only guards metadata set through vidIQ. If you publish another way, run the check yourself.
- In voice mode, captions are spread across each take's audio in proportion to their length. They are not synced word by word.
