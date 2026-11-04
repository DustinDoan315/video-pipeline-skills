---
name: prepublish-check
description: Use before publishing or updating a video. Blocks leftover template variables, placeholder text, off-topic tags, hashtags in the title, broken chapters and missing credit lines in the title, description and tags.
---

Fill `publish.json` with `title`, `description`, `tags`, `topicKeywords` and, if any, `requiredLines` (credits that must appear), then run:

```
node ${CLAUDE_SKILL_DIR}/scripts/prepublish-check.mjs publish.json
```

It fails on:
- placeholders: `{{...}}`, `[paste ...]`, TODO, TBD
- an empty description, a title over 100 characters, a hashtag in the title
- chapters that don't start at 0:00, fewer than 3, or less than 10 s apart
- a `requiredLines` entry missing from the description
- tags that contain none of `topicKeywords`, or tags over 500 characters

If it fails, fix every listed item and run it again. Never bypass a failure.

The plugin's `PreToolUse` hook runs the same check on every `vidiq_update_video` call. It reads `topicKeywords` and `requiredLines` from `publish.json` in the folder Claude Code runs in, and blocks the call if that file is missing. Publishing another way? Run the check by hand first. The hook needs Node.
