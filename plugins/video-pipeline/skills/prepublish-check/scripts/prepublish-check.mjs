// Blocks placeholders, off-topic tags, broken chapters and missing credit lines in YouTube metadata.
// File mode: node prepublish-check.mjs publish.json. Hook mode (no argument): checks the tool call on stdin.
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
  let meta;
  if (file) meta = readJson(file);
  else {
    const call = readJson(0).tool_input;
    let project;
    try { project = readJson("publish.json"); } catch {
      throw new Error("no publish.json in this folder. Create it (title, description, tags, topicKeywords) before setting metadata");
    }
    meta = { ...call, topicKeywords: project.topicKeywords, requiredLines: project.requiredLines };
  }
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
  if (title && /#\w/.test(title)) errors.push("title: has a hashtag (put hashtags in the description)");

  // Chapters: if the description has timestamp lines, YouTube needs 0:00 first, at least 3, ascending, 10 s apart.
  const stamps = (description ?? "").split("\n").map((l) => l.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s+\S/)).filter(Boolean)
    .map((m) => (m[3] !== undefined ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : (+m[1] * 60 + +m[2])));
  if (stamps.length) {
    if (stamps[0] !== 0) errors.push("chapters: first one must be 0:00");
    if (stamps.length < 3) errors.push(`chapters: ${stamps.length} found, YouTube needs at least 3`);
    stamps.forEach((s, i) => { if (i && s - stamps[i - 1] < 10) errors.push(`chapters: chapter ${i + 1} starts less than 10 s after the one before`); });
  }

  // Lines that must appear, e.g. a license credit: "requiredLines": ["Twemoji by Twitter/X, CC-BY 4.0"]
  for (const line of meta.requiredLines ?? []) {
    if (description !== undefined && !description.includes(line)) errors.push(`description: missing required line "${line}"`);
  }

  if (tags) {
    if (!meta.topicKeywords?.length) throw new Error("topicKeywords missing in publish.json");
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
