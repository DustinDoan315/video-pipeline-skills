# video-pipeline-skills

Three Claude Code skills from a Claude Code + Remotion video pipeline, built from 20 videos that failed.

- **prepublish-check**: blocks leftover template variables (`{{N}}`), placeholder text and off-topic tags before a title, description or tags go live. Ships with a `PreToolUse` hook on `vidiq_update_video`, so the check runs even if Claude forgets.
- **retention-review**: takes a retention curve and a timestamped script, and prints the steepest drops with the line playing at each one. It gives places to look, not causes.
- **voice-synced-remotion**: the `calculateMetadata` pattern that lets each voice take set its scene's length.

## Install

```
/plugin marketplace add DustinDoan315/video-pipeline-skills
/plugin install video-pipeline@dustin-builds
```

## Use

```
node plugins/video-pipeline/skills/prepublish-check/scripts/prepublish-check.mjs examples/publish.json
```

`examples/old-usage-limits.json` is a real published description that fails the check.
Run the check's tests with `node --test` from `plugins/video-pipeline/skills/prepublish-check/scripts/`.

The hook only guards metadata set through vidIQ. If you publish another way, run the check yourself first. It needs Node.

The brief template is in `plugins/video-pipeline/templates/video-brief.md`.
