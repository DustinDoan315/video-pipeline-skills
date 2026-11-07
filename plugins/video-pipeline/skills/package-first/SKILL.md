---
name: package-first
description: Use when a video topic is chosen or needs choosing, before the brief or any script, for long videos and Shorts. Fits the topic to the channel, picks the format, checks what people search and what already ranks, and writes the title and thumbnail first, so the script is built to deliver them.
---

The title and thumbnail decide whether anyone starts the video; the first seconds decide whether they stay. Write them first and build the script to keep their promise. Save the result as `package.md` in the project.

**1. Fit the channel**
Read `channel.md` (load `channel-profile` if it is missing). The topic must fit its niche sentence. If it doesn't, offer the angle that does: "AI agents and documents" becomes "Claude Code on a real Expo app". YouTube matches a small channel to viewers by topic, so an off-niche video starts from zero.

**2. Pick the format**
Long video. Search formats grow slowly and steadily from search; browse formats can beat the channel's size but need a real build or a real story.
- **Search how-to** (search): one task the viewer types into YouTube ("publish expo app to google play"). Numbered steps on the real screen; it ends when the task is done, with no padding.
- **Build it** (browse): "I built X with Claude Code" or "Can the new model build a real app?" A real build from empty folder to working app, failures included. In the AI-coding niche this angle has the highest median views.
- **Workflow** (both): how you actually do a job end to end ("My app publishing workflow with Claude Code and Expo").
- **A vs B** (browse): two tools on the same task under the same rules, verdict last. Small channels beat their size with it.
- **Tested it** or **Fix** (both): a claim people repeat and a fair test with the result as a number; or a failure the viewer has hit, why it happens, the fix and proof.
- **News, hands-on**: only when you can run the new thing and show the result within days. News alone stops getting views fast.
- Length follows the format: a search how-to is as long as the task; build, workflow and A vs B videos usually need 8-25 minutes to show the real thing. Check what ranks for the topic.

Short: one tip, one failure and its fix, A vs B on one task (verdict at the end), a numbered list (3-5 settings, hooks or tools), one before and after, or one news item with a demo. One idea per Short.

**3. Check search and competition**
- Get YouTube's autocomplete phrases for the topic: start typing it into YouTube search in a browser, or ask the user to. The title and the first line of the description use those words.
- See what ranks: `yt-dlp --flat-playlist -J "ytsearch20:<phrase>" > ranks.json`, then list each result's title, views, length and channel. Look up the top 5 in full (`yt-dlp --skip-download -J <url>`) for upload date and subscriber count.
- It's an opening when the top results are old, thin, for an older version of the tool, or answer a different question. When they are all recent and from big channels, narrow the angle: tool plus framework plus the exact task or error.

**4. Write `package.md`**
- **Format** and **promise**: one sentence of what the viewer gets. A long video shows it on screen in the first 5 seconds; a Short in the first second.
- **3 titles**, each with one line on why:
  - Search: the task and the tool in the viewer's words ("React Native to Play Store in 3 Minutes (Expo EAS Build)").
  - Browse (build it, A vs B, tested it, fix): first person with a concrete stake or result, or a short claim that creates curiosity without lying ("I Let Claude Code Ship My App to the App Store", "Claude Code Can't See Your App"). In the AI-coding niche, titles that beat their channel use "I" and curiosity words about twice as often as the rest, and "how to" less than half as often.
  - Short: topic first, plain words, the tool name, often a number ("5 Claude Code Hooks for Expo Apps").
  - Name the tool. Under about 60 characters, so most phones show it whole. No clickbait the video doesn't pay off.
- **3 thumbnail concepts** for a long video, different enough to test against each other: one big subject (the phone screen, the failing terminal, the tool logos), at most 4 words that add to the title instead of repeating it, high contrast, readable at phone size. Use the patterns that work in `channel.md`, such as the creator's face with a clear reaction.
- **Short**: the hook line, spoken and on screen in the first second; the title; and the long video it will point to.

Show the user the options and let them pick before the brief. Then `video-brief` copies the pick into `brief.md`.
