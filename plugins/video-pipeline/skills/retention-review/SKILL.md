---
name: retention-review
description: Use 7 and 28 days after a video is published, or when a published video or Short is underperforming. Reads the Studio numbers that matter for each format, finds the steepest audience drops in a long video's retention curve with the script line at each one, and records lessons in channel.md.
---

**When**
- First 48 hours: change nothing. YouTube keeps testing a new upload with new viewers and doesn't judge it on its first moments.
- Day 7 and day 28: run this review. Compare a video only with the channel's own videos of the same format and similar age.

**Ask the user for these, from YouTube Studio**
- Long video: impressions and click-through rate; the share still watching at 0:30, next to Studio's "typical" for the channel (there is no universal target); average view duration; traffic sources (search, browse, suggested); the retention curve.
- Short: viewed vs swiped away (the hook); engaged views; subscribers gained; how many views the linked long video got from it.

**Read them**
- Low click-through but good retention: the package lost, not the video. Run Test & Compare with new titles or thumbnails (long videos only).
- A steep drop before 0:30: the opening didn't show what the title promised fast enough.
- A Short swiped away more than the channel's other Shorts: the first second didn't show the result or the failure.
- Views mostly from search and still growing: make more of that format.

**Find the drops** (long videos)
Inputs:
- A JSON file with `durationSec` and `retention`: an array of `[fractionOfVideo, fractionOfViewers]` pairs.
- A timestamped script: SRT, WebVTT (YouTube auto-captions work), or JSON `[{"start": seconds, "text": "..."}]`.

Run:

```
node ${CLAUDE_SKILL_DIR}/scripts/retention-review.mjs retention.json script.vtt [topN]
```

Report the drops it prints, steepest first, with the line at each one.
Do not guess why viewers left. The script gives places to look, not causes.
With a few dozen viewers, a couple of people can bend the curve. Say so, and look for the same pattern across several videos before changing anything.

**Record it**
Add one line per finding to the Lessons section of `channel.md`: date, video, what happened, where you saw it. When the same lesson shows up in 2 videos, move it into the matching section of `channel.md` as a rule. When a rule keeps helping, put it into the skill it belongs to.
