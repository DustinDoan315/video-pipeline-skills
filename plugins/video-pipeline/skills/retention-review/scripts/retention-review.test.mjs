import assert from "node:assert/strict";
import { test } from "node:test";
import { lineAt, parseScript, report, steepestDrops } from "./retention-review.mjs";

test("srt parse", () => {
  const srt = "1\n00:00:00,000 --> 00:00:04,000\nHello there.\n\n2\n00:00:04,000 --> 00:00:09,500\nSecond line.\n";
  assert.deepEqual(parseScript(srt, "a.srt"), [{ start: 0, text: "Hello there." }, { start: 4, text: "Second line." }]);
});

test("youtube vtt rolling captions keep the newest line once", () => {
  const vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nfirst line\n\n00:00:03.000 --> 00:00:03.010\nfirst line\n\n00:00:03.010 --> 00:00:06.000\nfirst line\nsecond <c>line</c>\n";
  assert.deepEqual(parseScript(vtt, "a.vtt").map((c) => c.text), ["first line", "second line"]);
});

test("json script passes through", () => {
  assert.deepEqual(parseScript('[{"start":0,"text":"a"}]', "s.json"), [{ start: 0, text: "a" }]);
});

test("steepest drop wins and the line at it is found", () => {
  const drops = steepestDrops(100, [[0, 1], [0.1, 0.9], [0.2, 0.5], [1, 0.4]], 2);
  assert.equal(drops[0].from, 10);
  assert.equal(lineAt([{ start: 0, text: "a" }, { start: 15, text: "b" }], drops[0].to), "b");
  assert.match(report({ durationSec: 100, retention: [[0, 1], [0.2, 0.5], [1, 0.4]] }, [{ start: 0, text: "x" }]), /line: "x"/);
});
