import assert from "node:assert/strict";
import { test } from "node:test";
import { classify, median, report, summarize } from "./channel-stats.mjs";

const v = (id, type, date, views, extra = {}) => ({
  id, upload_date: date, view_count: views, title: `t-${id}`, channel: "Chan", channel_follower_count: 34,
  duration: type === "short" ? 40 : 240, media_type: type === "short" ? "short" : "video", ...extra,
});

test("media_type decides, frame shape is the fallback", () => {
  assert.equal(classify({ media_type: "short" }), "short");
  assert.equal(classify({ media_type: "video", width: 1920, height: 1080 }), "long");
  assert.equal(classify({ width: 1080, height: 1920 }), "short");
  assert.equal(classify({ media_type: "livestream" }), "live");
});

test("median of odd and even lists", () => {
  assert.equal(median([5, 1, 3]), 3);
  assert.equal(median([1, 2, 3, 10]), 3);
  assert.equal(median([]), null);
});

test("young videos are listed but left out of the median", () => {
  const asOf = new Date("2026-11-07T00:00:00Z");
  const sum = summarize([
    v("a", "short", "20261001", 700), v("b", "short", "20261010", 100), v("c", "short", "20261106", 5),
    v("d", "long", "20261020", 200), v("e", "long", "20261025", 10),
  ], asOf, 7);
  assert.equal(sum.byType.short.all.length, 3);
  assert.equal(sum.byType.short.young, 1);
  assert.equal(sum.byType.short.medianViews, 400);
  assert.equal(sum.byType.long.top[0].id, "d");
  const text = report(sum, asOf, 7);
  assert.match(text, /Shorts: 3 videos, 805 views \(79%\)/);
  assert.match(text, /Too new to judge \(under 7 days\): 1/);
});
