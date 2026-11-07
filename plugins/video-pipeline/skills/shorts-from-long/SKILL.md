---
name: shorts-from-long
description: Use when the user wants YouTube Shorts, vertical 9:16 videos, or to promote a long video. Cuts 3-5 Shorts from a long video's takes, each with its own hook and payoff, and points each one back to the long video.
---

Shorts bring most of a small channel's views, but Shorts viewers rarely click through to long videos on their own. So every Short stands alone, and every Short points back to the long video it came from. YouTube recommends Shorts and long videos separately, says Shorts don't hurt long videos, and carries a viewer's interest in a topic across both, so keep the Shorts on the channel's topics.

**Pick the takes** (3-5 Shorts per long video)
- One idea per Short: one tip with a visible result, one failure and its fix, one before and after, one surprising number. A take with a real failure or result on screen works best.
- Not a trailer. Give the payoff in the Short, then point to the long video for the rest.
- Usually 20-60 s, or the length that works in `channel.md`. Go longer only when every beat adds something new. Over 60 s, any copyright claim blocks a Short everywhere, so use only original music or the YouTube Audio Library.
- Formats that work for coding Shorts: A vs B on one task with the verdict at the end, a numbered list (3-5 settings, hooks or tools), one tip with a visible result.

**Cut it** in the long video's project:

```bash
npm run short -- ../short-<name> <take id> [take id ...]
```

This copies the project with `"format": "short"` (1080x1920, captions and memes clear of the Shorts buttons), keeps the chosen takes, and keeps at most one subscribe ask, on the last take.

**Then edit the Short's `src/data/script.json`** (rules in `viewer-first-script` under Short)
- Caption 1 is the hook: 7 words or fewer, readable in about 1 second, the result or the failure itself ("Claude Code said done. It wasn't."). The first frame shows it.
- Split captions to 3-8 words each. Drop "Step 3" style chapter names, since the chapter chip is the only label on screen.
- Every caption adds something new: the next step, a zoom on the change, the result.
- Keep at most one meme. Swap the subscribe meme on the last take for a pointer to the long video in the last ~5 s, said and on screen ("Full setup: related video"), or end on a line that leads back into the first.
- Stickers use the same 16:9 coordinates; they are mapped into the vertical frame for you.

Run `npm run qa` (load `scene-qa`) and `npm run render`.

**Publish**
- Title: plain and searchable, the tool and the outcome, under 50 characters ("Give Claude Code Eyes With One Hook"). 0-3 hashtags, at the end of the description; they bring little reach. No chapters.
- **Related video**: in YouTube Studio on desktop, set the Short's Related video to the long video. It is the only link in a Short that viewers can click; links in Shorts descriptions and comments are not clickable. Remind the user; Claude can't set it through vidIQ.
- A custom thumbnail, if the channel can set one, shows on the home and channel pages, not in the Shorts feed. Use the hook frame.
- Pace: 2-4 Shorts a week. One on the long video's release day, then one every 2-3 days.
- Don't delete or re-upload a Short that flops. Note it in `channel.md` instead.

**Judge it** at 7 days with `retention-review`: viewed vs swiped away (the hook), engaged views, subscribers gained, and views the long video got from it. Views now count every replay, so compare Shorts with Shorts of similar length, not with long videos.
