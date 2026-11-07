---
name: viewer-first-script
description: Use when writing or rewriting a video script or captions, long or Short. Builds the script around the promise in the title, opens on the result, teaches step by step in a structure that fits the format, keeps jokes and memes where they help, and asks for subscribe only after value.
---

Read `package.md` and `brief.md` first: the script exists to deliver that title and thumbnail. Write it as `src/data/script.json` takes (see the template's example). Each take: `id`, `chapter`, `captions`, plus optional `visuals`, `memes`, `stickers` keyed by caption index.

**Long video: the first 30 seconds**
- 0-5 s: the result the title promised, on screen: the app running, the build passing, the number. The first frame looks like the thumbnail.
- By 10 s: what the viewer will be able to do ("By the end, your app is in Play Console internal testing.").
- Then one line of proof (the real repo, the real store listing, the real error) and straight into step 1. No logo, channel intro, greeting or "in this video" before the payoff.
- Open one loop early and close it later: "Step 4 is where most builds fail."

**Long video: the body, by format** (from `package.md`)
- Search how-to: numbered steps in the order the viewer does them. Each step: what to do, the real screen doing it, the one trap. Stop when the task is done.
- Build it: the finished app first, then the build as chapters that each end on a working milestone. Keep the real failures and how they got fixed; they are the story. End on the verdict: what the tool did well, where you had to step in.
- Workflow: the steps you actually run, in order, on the real project, with the files and commands to copy.
- A vs B: the task and the rules first, then both tools on it, side by side where you can. The verdict comes last, as a number from `video.json`.
- Tested it: the claim, the fair test (method in one line, details in the description), the result as a number from `video.json`, why, what to copy, the limits of the test.
- Fix: the visible failure, why it happens, the fix, proof it now works, what it still misses.
- Every chapter ends with something copyable: a command, a file, a setting. Name chapters with the words a viewer would search ("Upload the AAB to Play Console"), not jokes.
- Change what is on screen at each new idea: the next screen, a zoom into the line that changed, the result. Don't hold one picture through three ideas, and don't cut on a timer.
- Vary the structure from video to video. YouTube treats videos that feel repetitive in a row as templated content.
- End: a one-line recap, one sentence on the next video, then 10-20 s of calm picture with no new information, where the end screen goes.

**Short** (`"format": "short"`)
- First second: the result or the failure on screen, and a hook of 7 words or fewer, spoken and as the first caption ("Claude Code said done. It wasn't."). No logo, greeting or title card.
- One idea, usually 20-60 s, or the length that works in `channel.md`. Go longer only when every beat adds something new.
- Every caption adds something new: the next step, a zoom on the change, the result. Keep captions to 3-8 words, so each one is big and quick.
- Code: only the 5-10 lines that matter, big enough to read on a phone.
- Last ~5 s: point to the long video that goes deeper ("Full setup: related video"), or end on a line that leads back into the first one.

**Viewer first**
- Write "you", not "I". The creator's stats are one-line examples ("I once held the result until the end. Average view: 9 seconds."). Never a scoreboard chapter.
- Method gets one line. Details go in the description.

**Funny, where it helps**
- Jokes that fit the creator's tone in `channel.md`: an analogy ("Nobody tips the waiter before the food"), a self-roast, a callback. Never between a step and its result, and never in the first 5 s.
- Memes go on joke lines only: about one per minute of a long video, at most one per Short, and never over code or a terminal the viewer needs to read. Kinds: `classic` (emoji + top/bottom text), `nobody`, `nahyeah`, `expect`, `vs`, `pov`, `brain`, `fine`, `subscribe`.
- Stickers: 0-2 per take, 1-3 words in caps, for the one word that matters ("PAIN", "SHIP IT"). Positions x 1150-1500, y 120-200 or 560-700, so they stay off the main visual and the caption band.

**Subscribe**
- Long video: one `subscribe` meme right after the first big payoff, never before 0:30, a few seconds at most ("saved you an hour already?"), and one at the end ("you got the goods, now I'm allowed to ask").
- Short: none, or one on the last take when there is no long video to point to.

**Captions and voice**
- Long videos: the captions are the voice script. The creator records them (see `voice-synced-remotion`), so write them to be said.
- One idea per caption, under about 25 words (3-8 in a Short). Numbers as digits. Read each one out loud; reword anything you would not say to a friend.
- If a line claims something happened ("I tested it"), it must be true. Otherwise cut or soften it. Mark illustrative scenes as illustrative.

Show the user the full caption list for approval before building scenes.
