// Cuts a vertical Short from this (long) video project: copies the project, keeps the chosen takes, sets "format": "short".
// Usage: npm run short -- <new-folder> <take id> [take id ...]
// Example: npm run short -- ../short-hook 01-hook 08-prepublish
import { cpSync, existsSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeTakes, FPS } from "../src/timing-core.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const [outArg, ...ids] = process.argv.slice(2);
if (!outArg || !ids.length) {
  console.error("usage: npm run short -- <new-folder> <take id> [take id ...]");
  process.exit(1);
}
const out = resolve(root, outArg);
if (existsSync(out)) { console.error(`${out} already exists`); process.exit(1); }

const S = JSON.parse(readFileSync(join(root, "src/data/script.json"), "utf8"));
const takes = ids.map((id) => {
  const t = S.takes.find((x) => x.id === id);
  if (!t) { console.error(`no take "${id}". Takes: ${S.takes.map((x) => x.id).join(", ")}`); process.exit(1); }
  return structuredClone(t);
});
// One subscribe ask at most, on the last take only.
takes.forEach((t, i) => {
  if (i === takes.length - 1) return;
  for (const [k, m] of Object.entries(t.memes ?? {})) if (m.kind === "subscribe") delete t.memes[k];
});

const skip = new Set(["node_modules", "out"]);
cpSync(root, out, { recursive: true, filter: (src) => !skip.has(basename(src)) || src === root });
if (existsSync(join(root, "node_modules"))) symlinkSync(join(root, "node_modules"), join(out, "node_modules"), "dir");
const short = { ...S, format: "short", takes };
writeFileSync(join(out, "src/data/script.json"), JSON.stringify(short, null, 2) + "\n");

const sec = computeTakes(short).reduce((a, t) => a + t.frames, 0) / FPS;
console.log(`Short project: ${out}\n${takes.length} takes, ${sec.toFixed(1)} s`);
if (sec > 180) console.warn("warning: over 3 minutes. YouTube will not treat this as a Short.");
else if (sec > 60) console.warn("note: over 60 s. Keep it only if every beat adds something new; over 60 s any copyright claim blocks the Short. Trim captions that repeat.");
console.log("Next: cd into it, make caption 1 the hook (7 words or fewer), npm run qa, then npm run render.");
console.log("After upload: in YouTube Studio, set the Short's Related video to the long video.");
