---
name: viewer-first-script
description: Use when writing or rewriting a video script or captions. Makes the script a tutorial for the viewer, funny, with meme and sticker slots, and subscribe asks only after value.
---

Write the script as `src/data/script.json` takes (see the template's example). Each take: `id`, `chapter`, `captions`, plus optional `visuals`, `memes`, `stickers` keyed by caption index.

**Structure**
- 0:00-0:10: say what the viewer gets. Show the result, not a promise of it.
- Then numbered steps. Every chapter ends with something copyable: a command, a template, a file.
- End with a recap list and one next-video tease.

**Viewer first**
- Write "you", not "I". The creator's stats are one-line examples ("I once held the result until the end. Average view: 9 seconds."). Never a scoreboard chapter.
- Method gets one line. Details go in the description.

**Funny**
- At least one joke per take: an analogy ("Nobody tips the waiter before the food"), self-roast, or callback.
- Put a meme on roughly 1 in 3 captions, on the joke lines. Kinds: `classic` (emoji + top/bottom text), `nobody`, `nahyeah`, `expect`, `vs`, `pov`, `brain`, `fine`, `subscribe`.
- Put 2-4 stickers per take on captions without a meme: 1-3 words, caps, punchy ("PAIN", "SHIP IT"). Positions x 1150-1500, y 120-200 or 560-700, so they stay off the main visual and the caption band.

**Subscribe**
- One `subscribe` meme mid-video, right after the first big payoff ("saved you an hour already?").
- One at the end ("you got the goods, now I'm allowed to ask"). Never before 0:30.

**Captions**
- One idea per caption, under about 25 words. Numbers as digits. Read each one out loud; reword anything you would not say to a friend.
- If a line claims something happened ("I tested it"), it must be true. Otherwise cut or soften it.

Show the user the full caption list for approval before building scenes.
