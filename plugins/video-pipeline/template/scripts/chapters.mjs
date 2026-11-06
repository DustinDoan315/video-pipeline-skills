// Prints YouTube chapter lines from the real timing and writes out/chapters.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chapterLines, computeTakes, FPS } from "../src/timing-core.mjs";
import { voiceSeconds } from "./voice.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const S = JSON.parse(readFileSync(join(root, "src/data/script.json"), "utf8"));
const takes = computeTakes(S, voiceSeconds(S, root));
const lines = chapterLines(takes);
const total = Math.round(takes.reduce((a, t) => a + t.frames, 0) / FPS);
if (lines.length < 3) console.warn("note: YouTube needs at least 3 chapters to show them");
mkdirSync(join(root, "out"), { recursive: true });
writeFileSync(join(root, "out/chapters.txt"), lines.join("\n") + "\n");
console.log(lines.join("\n") + `\n(total ${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")})`);
