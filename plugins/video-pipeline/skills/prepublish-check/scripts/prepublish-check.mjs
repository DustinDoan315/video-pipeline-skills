// scripts/prepublish-check.mjs
import { readFileSync } from "node:fs";

const PLACEHOLDERS = [
  /\{\{[^}]*\}\}/,
  /\[paste[^\]]*\]/i,
  /\bTODO\b/,
  /\bTBD\b/,
  /append to every description/i,
];

const readJson = (source) => JSON.parse(readFileSync(source, "utf8"));

function check() {
  const file = process.argv[2];
  // With a file: check that file. Without one: run as a PreToolUse hook and check the tool call.
  const meta = file
    ? readJson(file)
    : { ...readJson(0).tool_input, topicKeywords: readJson("publish.json").topicKeywords };
  const { title, description, tags } = meta;
  const errors = [];

  if (file && (title === undefined || description === undefined || !tags)) {
    errors.push("file: needs title, description and tags");
  }
  for (const [field, text] of [["title", title], ["description", description]]) {
    for (const re of PLACEHOLDERS) {
      const m = text?.match(re);
      if (m) errors.push(`${field}: placeholder "${m[0]}"`);
    }
  }
  if (description !== undefined && !description.trim()) errors.push("description: empty");
  if (title && title.length > 100) errors.push(`title: ${title.length} chars (max 100)`);

  if (tags) {
    const keywords = meta.topicKeywords.map((k) => k.toLowerCase());
    const offTopic = tags.filter((t) => !keywords.some((k) => t.toLowerCase().includes(k)));
    if (offTopic.length) errors.push(`off-topic tags: ${offTopic.join(", ")}`);
    const tagChars = tags.join(",").length;
    if (tagChars > 500) errors.push(`tags: ${tagChars} chars (max 500)`);
  }
  return errors;
}

// Only exit 2 blocks a hook call, so any crash must also exit 2.
try {
  const errors = check();
  if (errors.length) {
    console.error("FAIL pre-publish check\n" + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(2);
  }
  console.log("PASS pre-publish check");
} catch (err) {
  console.error(`FAIL pre-publish check could not run: ${err.message}`);
  process.exit(2);
}
