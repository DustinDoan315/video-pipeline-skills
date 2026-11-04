---
name: publish-package
description: Use when a video is rendered and needs a title, description, chapters, tags and pinned comment. Builds publish.json from the real timing and runs the pre-publish check.
---

1. `npm run chapters`: chapter lines from the real timing, written to `out/chapters.txt`. Never type chapter times by hand.
2. Write `publish.json` in the project:

```json
{
  "title": "...",
  "description": "...",
  "tags": ["..."],
  "topicKeywords": ["claude", "remotion"],
  "requiredLines": ["Emoji art: Twemoji by Twitter/X, CC-BY 4.0 (https://github.com/jdecked/twemoji)"]
}
```

- **Title**: under 70 characters. Search words first, then the promise. No hashtags. Offer the user 3 options with one line on why.
- **Description**: line 1 says what the viewer gets. Then install commands or links, the chapters from step 1, sources for every figure, credits, the creator's links, and at most 3 hashtags at the end.
- **Tags**: 8-15, each containing one of `topicKeywords`. Tags matter little for discovery; their job is not to be wrong.
- **Pinned comment**: one question that invites a reply, plus the main link.

3. Load `prepublish-check` and run it on `publish.json`. Fix every failure and run again until it passes.
4. Shorts: no chapters, title under 50 characters, and remind the user to set the Related video in Studio (see `shorts-from-long`).
5. Thumbnail: at most 3 words, one big number or face, readable at phone size.

The user uploads the video as private in YouTube Studio. Set metadata only after they say so.
