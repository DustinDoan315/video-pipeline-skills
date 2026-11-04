// Finds the steepest drops in a retention curve and prints the script line playing at each one.
// Usage: node retention-review.mjs retention.json script.(srt|vtt|json) [topN]
import { readFileSync } from "node:fs";

const [retFile, scriptFile, topArg] = process.argv.slice(2);
if (!retFile || !scriptFile) {
  console.error("usage: node retention-review.mjs retention.json script.(srt|vtt|json) [topN]");
  process.exit(1);
}

const toSec = (ts) => {
  const [h, m, s] = ts.replace(",", ".").split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

export function parseScript(text, name) {
  if (name.endsWith(".json")) return JSON.parse(text);
  const cues = [];
  const re = /(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})[^\n]*\n([\s\S]*?)(?:\n\n|$)/g;
  for (const m of text.matchAll(re)) {
    const line = m[3].replace(/<[^>]+>/g, "").trim().split("\n").at(-1).trim();
    if (line && cues.at(-1)?.text !== line) cues.push({ start: toSec(m[1]), text: line });
  }
  return cues;
}

export function steepestDrops(durationSec, retention, topN = 3) {
  const drops = [];
  for (let i = 1; i < retention.length; i++) {
    const [x0, y0] = retention[i - 1];
    const [x1, y1] = retention[i];
    const secs = (x1 - x0) * durationSec;
    if (y1 < y0 && secs > 0) drops.push({ from: x0 * durationSec, to: x1 * durationSec, lost: y0 - y1, perSec: (y0 - y1) / secs, after: y1 });
  }
  return drops.sort((a, b) => b.perSec - a.perSec).slice(0, topN);
}

const lineAt = (cues, sec) => cues.filter((c) => c.start <= sec).at(-1)?.text ?? "(no line)";

const { durationSec, retention } = JSON.parse(readFileSync(retFile, "utf8"));
const cues = parseScript(readFileSync(scriptFile, "utf8"), scriptFile);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

console.log(`Steepest drops (${retention.length} points, ${durationSec}s video)\n`);
steepestDrops(durationSec, retention, Number(topArg) || 3).forEach((d, i) => {
  console.log(`${i + 1}. ${fmt(d.from)}-${fmt(d.to)}  -${Math.round(d.lost * 100)} pts  (${(d.perSec * 100).toFixed(1)} pts/s)  ${Math.round(d.after * 100)}% left`);
  console.log(`   line: "${lineAt(cues, d.to)}"`);
});
console.log("\nPlaces to look, not causes. Small samples bend easily.");
