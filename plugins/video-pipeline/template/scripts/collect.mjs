// Checks script.json, bundles src/data/files/* into files.json, and copies the Twemoji SVGs the memes use.
// Run before every render: npm run collect. Exits 1 with a list of problems.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "../src/timing-core.mjs";

const here = fileURLToPath(new URL("..", import.meta.url));
const S = JSON.parse(readFileSync(join(here, "src/data/script.json"), "utf8"));
const DATA = JSON.parse(readFileSync(join(here, "src/data/video.json"), "utf8"));
const errors = [];

const KINDS = ["title", "big", "steps", "check", "cards", "stat", "bars", "curve", "code", "terminal", "cmd", "image", "clip"];
const MEMES = ["classic", "nobody", "nahyeah", "expect", "brain", "pov", "fine", "vs", "subscribe"];
const filesDir = join(here, "src/data/files");
const files = existsSync(filesDir) ? Object.fromEntries(readdirSync(filesDir).map((f) => [f, readFileSync(join(filesDir, f), "utf8").replace(/\n$/, "")])) : {};

const walkDollars = (o, where) => {
  if (typeof o === "string" && o.startsWith("$")) { try { resolve(DATA, o); } catch (e) { errors.push(`${where}: ${e.message}`); } }
  else if (o && typeof o === "object") for (const v of Object.values(o)) walkDollars(v, where);
};

const ids = new Set();
S.takes.forEach((t) => {
  if (ids.has(t.id)) errors.push(`duplicate take id ${t.id}`);
  ids.add(t.id);
  const n = t.captions?.length ?? 0;
  if (!n) errors.push(`${t.id}: no captions`);
  for (const [k, v] of Object.entries(t.visuals ?? {})) {
    if (+k >= n) errors.push(`${t.id}: visual at caption ${k}, but only ${n} captions`);
    if (!KINDS.includes(v.kind)) errors.push(`${t.id}: unknown visual kind "${v.kind}"`);
    if (v.file && !(v.file in files)) errors.push(`${t.id}: src/data/files/${v.file} missing`);
    if (v.src && !existsSync(join(here, "public", v.src))) errors.push(`${t.id}: public/${v.src} missing`);
    walkDollars(v, `${t.id} visual ${k}`);
  }
  for (const [k, m] of Object.entries(t.memes ?? {})) {
    if (+k >= n) errors.push(`${t.id}: meme at caption ${k}, but only ${n} captions`);
    if (!MEMES.includes(m.kind)) errors.push(`${t.id}: unknown meme kind "${m.kind}"`);
  }
  for (const s of t.stickers ?? []) if (s.at >= n) errors.push(`${t.id}: sticker "${s.text}" at caption ${s.at}, but only ${n} captions`);
  if (S.timing === "voice" && !existsSync(join(here, `public/vo/${t.id}.wav`))) errors.push(`${t.id}: voice mode needs public/vo/${t.id}.wav`);
});
if (S.channel?.logo && !existsSync(join(here, "public", S.channel.logo))) errors.push(`channel logo public/${S.channel.logo} missing`);
if (S.music && !existsSync(join(here, "public", S.music))) errors.push(`music file public/${S.music} missing (npm run music)`);

// Twemoji for memes (credit: Twemoji by Twitter/X, CC-BY 4.0)
const emojis = new Set(["🧠", "🔥", "🧑‍💻", "☕", "🔔"]);
const walk = (o) => { if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) k === "e" ? emojis.add(v) : walk(v); };
S.takes.forEach((t) => walk(t.memes ?? {}));
mkdirSync(join(here, "public/emoji"), { recursive: true });
const tw = join(here, "node_modules/@twemoji/svg");
for (const e of emojis) {
  const all = [...e].map((c) => c.codePointAt(0).toString(16));
  const code = all.filter((h) => h !== "fe0f").join("-");
  const src = [code, all.join("-")].map((x) => join(tw, `${x}.svg`)).find(existsSync);
  if (!src) errors.push(`no Twemoji image for ${e} (${code})`);
  else copyFileSync(src, join(here, `public/emoji/${code}.svg`));
}

writeFileSync(join(here, "src/data/files.json"), JSON.stringify(files, null, 1));
if (errors.length) {
  console.error("collect found problems:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`collect ok: ${S.takes.length} takes, ${Object.keys(files).length} files, ${emojis.size} emoji`);
