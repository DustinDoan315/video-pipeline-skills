// Renders one still at the end of each caption (its visual has fully arrived) and tiles each take into out/qa/sheet-<take>.png.
// Usage: npm run qa            (all takes)   |   npm run qa -- 03   (takes whose id starts with "03")
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeTakes } from "../src/timing-core.mjs";
import { voiceSeconds } from "./voice.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const S = JSON.parse(readFileSync(join(root, "src/data/script.json"), "utf8"));
const only = process.argv[2];
const dir = join(root, "out/qa");
mkdirSync(dir, { recursive: true });
execFileSync("npx", ["remotion", "bundle", "--out-dir", "out/bundle"], { cwd: root, stdio: "ignore" });
let start = 0;
for (const t of computeTakes(S, voiceSeconds(S, root))) {
  const from = start;
  start += t.frames;
  if (only && !t.id.startsWith(only)) continue;
  for (const old of readdirSync(dir)) if (old.startsWith(`${t.id}-`)) rmSync(join(dir, old));
  t.cues.forEach((c, i) => execFileSync("npx", ["remotion", "still", "out/bundle", "Video", `out/qa/${t.id}-${String(i).padStart(2, "0")}.png`,
    `--frame=${from + c.from + c.dur - 8}`, "--scale=0.5"], { cwd: root, stdio: "ignore" }));
  execFileSync("ffmpeg", ["-v", "error", "-y", "-pattern_type", "glob", "-i", `out/qa/${t.id}-*.png`, "-vf", `tile=${Math.min(4, t.cues.length)}x${Math.ceil(t.cues.length / 4)}:padding=6`, "-frames:v", "1", `out/qa/sheet-${t.id}.png`], { cwd: root });
  console.log(`out/qa/sheet-${t.id}.png  (${t.cues.length} stills)`);
}
