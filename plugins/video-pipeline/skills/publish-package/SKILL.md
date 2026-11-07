---
name: publish-package
description: Use when a video is rendered and needs its title, thumbnail, description, chapters, tags, pinned comment and end screen. Builds publish.json from the real timing and the chosen package, and runs the pre-publish check.
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

- **Title**: the one picked in `package.md`. Check it against the finished video: under 60 characters, tool name first for a search video, no hashtags, and the first 10 seconds deliver it.
- **Description**: the first 2 lines say what the viewer gets, in the search words from `package.md`; they show in search results and above "...more". Then commands or links (repo, docs), the chapters from step 1, sources for every figure, credits, the creator's links, and at most 3 hashtags at the end.
- **Chapters**: named with the words a viewer would search. YouTube and Google index chapter titles, so "Upload the AAB to Play Console" beats "The fun part".
- **Tags**: 5-15, each containing one of `topicKeywords`, plus common misspellings of the tool name. YouTube says tags play a minimal role; their job is not to be wrong.
- **Pinned comment**: the main link or command, plus one question that is easy to answer ("Which step broke for you?").

3. Load `prepublish-check` and run it on `publish.json`. Fix every failure and run again until it passes.
4. **Thumbnail**: the pick from `package.md`, 1280x720. Look at it at 320x180, about phone size; anything unreadable goes. For a long video, give the user all 3 concepts for Test & Compare (YouTube Studio on desktop), which picks a winner by watch time over up to 2 weeks.
5. **End screen**: the last 5-20 s, up to 4 elements. Point to the best next video on the same topic (or the series playlist) and subscribe. Add the video to its series playlist.
6. **Shorts**: no chapters, a title under 50 characters, 0-3 hashtags at the end of the description, and the Related video set to the long video (see `shorts-from-long`).
7. **First 48 hours**: leave the title and thumbnail alone, answer comments, and post the first Short cut from the video.

The user uploads the video as private in YouTube Studio. Set metadata only after they say so.
