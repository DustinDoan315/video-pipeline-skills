---
name: shorts-from-long
description: Use when the user wants YouTube Shorts, vertical 9:16 videos, or to promote a long video. Cuts 2-3 Shorts from a long video's takes and points each one back to the long video.
---

Shorts bring reach and subscribers cheaply, but their viewers rarely click through to long videos on their own. So every Short gets made from a long video and points back to it.

**Pick the takes** (2-3 Shorts per long video)
- One idea per Short: one tip, one fail, one before/after. A take with a meme or a real failure on screen works best.
- Aim for 20-45 s. Shorts can run to 3 min, but short ones loop and hold better.

**Cut it** in the long video's project:

```bash
npm run short -- ../short-<name> <take id> [take id ...]
```

This copies the project with `"format": "short"` (1080x1920, captions and memes clear of the Shorts buttons), keeps the chosen takes, and keeps at most one subscribe ask, on the last take.

**Then edit the Short's `src/data/script.json`**
- Caption 1 is the hook, readable in about 1 second: the result or the fail itself ("I published {{N}} on YouTube.").
- Trim captions; one idea each. Drop the "Step 3" style chapter names, since the chapter chip is the only label on screen.
- End on a line that loops back to the hook, or on the subscribe meme.
- Stickers use the same 16:9 coordinates; they are mapped into the vertical frame for you.

Run `npm run qa` (load `scene-qa`) and `npm run render`.

**Publish**
- Title: the hook in under 50 characters. No chapters.
- In YouTube Studio, set the Short's **Related video** to the long video. This is the step that sends Short viewers to the long video. Remind the user; Claude can't set it through vidIQ.
- Stagger them: one on the long video's release day, then one every 2 days.
