---
name: prepublish-check
description: Use before publishing or updating a video. Blocks leftover template variables, placeholder text and off-topic tags in the title, description and tags.
---

Fill publish.json with title, description, tags and topicKeywords, then run:

node ${CLAUDE_SKILL_DIR}/scripts/prepublish-check.mjs publish.json

If it fails, fix every listed item and run it again. Never bypass a failure.
