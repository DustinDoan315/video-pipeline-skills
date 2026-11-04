// Voice-mode helper for node scripts: each take's wav length via ffprobe (null in text mode).
import { execFileSync } from "node:child_process";
export function voiceSeconds(script, root) {
  if (script.timing !== "voice") return null;
  return Object.fromEntries(script.takes.map((t) => [t.id,
    Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `${root}/public/vo/${t.id}.wav`]).toString().trim())]));
}
