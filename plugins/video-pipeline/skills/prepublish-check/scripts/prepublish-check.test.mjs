// scripts/prepublish-check.test.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const script = join(dirname(fileURLToPath(import.meta.url)), "prepublish-check.mjs");
const dir = mkdtempSync(join(tmpdir(), "prepublish-"));
const good = { title: "Claude Code", description: "Fine.", tags: ["claude code"], topicKeywords: ["claude"] };
writeFileSync(join(dir, "publish.json"), JSON.stringify(good));

const fileRun = (meta) => {
  writeFileSync(join(dir, "meta.json"), JSON.stringify(meta));
  return spawnSync("node", [script, "meta.json"], { cwd: dir }).status;
};
const hookRun = (input, cwd = dir) => spawnSync("node", [script], { cwd, input }).status;

test("file mode", () => {
  assert.equal(fileRun(good), 0);
  assert.equal(fileRun({ ...good, description: "{{N}} runs" }), 2);
  assert.equal(fileRun({ ...good, tags: ["play movies"] }), 2);
  assert.equal(fileRun({ title: "t" }), 2);
  assert.equal(spawnSync("node", [script, "missing.json"], { cwd: dir }).status, 2);
  assert.equal(fileRun({ ...good, title: "Claude Code #shorts" }), 2);
});

test("chapters and required lines", () => {
  const ch = (lines) => ({ ...good, description: `Intro.\n\n${lines}` });
  assert.equal(fileRun(ch("0:00 Start\n0:40 Middle\n2:10 End")), 0);
  assert.equal(fileRun(ch("0:05 Start\n0:40 Middle\n2:10 End")), 2);
  assert.equal(fileRun(ch("0:00 Start\n0:40 Middle")), 2);
  assert.equal(fileRun(ch("0:00 Start\n0:05 Middle\n2:10 End")), 2);
  assert.equal(fileRun(ch("0:00 Start\n1:02:00 Late\n1:05:00 End")), 0);
  const credit = "Twemoji by Twitter/X, CC-BY 4.0";
  assert.equal(fileRun({ ...good, requiredLines: [credit] }), 2);
  assert.equal(fileRun({ ...good, description: `Fine. ${credit}`, requiredLines: [credit] }), 0);
});

test("hook mode checks the tool call", () => {
  const call = (tool_input) => JSON.stringify({ tool_input });
  assert.equal(hookRun(call({ description: "Fine." })), 0);
  assert.equal(hookRun(call({ privacyStatus: "private" })), 0);
  assert.equal(hookRun(call({ description: "{{N}} runs" })), 2);
  assert.equal(hookRun(call({ tags: ["ai law"] })), 2);
  assert.equal(hookRun("not json"), 2);
  assert.equal(hookRun(call({ description: "Fine." }), tmpdir()), 2);
});
