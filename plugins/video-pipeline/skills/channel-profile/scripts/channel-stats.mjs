// Turns a channel's yt-dlp metadata into a performance table, Shorts and long videos apart.
// Usage: node channel-stats.mjs <folder of .info.json files> [--as-of YYYY-MM-DD] [--min-age 7]
// Get the folder with:
//   yt-dlp --skip-download --write-info-json --no-write-playlist-metafiles -o "<folder>/%(id)s.%(ext)s" \
//     https://www.youtube.com/@<handle>/videos https://www.youtube.com/@<handle>/shorts
import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = 86_400_000;

/** "short", "long" or "live". yt-dlp sets media_type; older versions don't, so fall back to the frame shape. */
export function classify(info) {
  if (info.media_type === "short") return "short";
  if (info.media_type === "livestream" || info.was_live) return "live";
  if (info.media_type === "video") return "long";
  if (info.height > info.width) return "short";
  return "long";
}

const dateOf = (yyyymmdd) => new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00Z`);

export const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

/** One row per video, newest age last. asOf is a Date; minAge is in days. */
export function summarize(infos, asOf, minAge = 7) {
  const rows = infos.filter((i) => i.id && i.upload_date).map((i) => {
    const age = Math.max(0, Math.floor((asOf - dateOf(i.upload_date)) / DAY));
    const views = i.view_count ?? 0;
    return {
      id: i.id, type: classify(i), title: i.title ?? "", uploaded: `${i.upload_date.slice(0, 4)}-${i.upload_date.slice(4, 6)}-${i.upload_date.slice(6, 8)}`,
      age, sec: i.duration ?? 0, views, perDay: views / Math.max(age, 1), likes: i.like_count ?? null, comments: i.comment_count ?? null,
    };
  });
  const byType = {};
  for (const type of ["short", "long", "live"]) {
    const all = rows.filter((r) => r.type === type).sort((a, b) => b.views - a.views);
    if (!all.length) continue;
    const judged = all.filter((r) => r.age >= minAge);
    byType[type] = {
      all, judged, young: all.length - judged.length,
      views: all.reduce((a, r) => a + r.views, 0),
      medianViews: median(judged.map((r) => r.views)),
      top: judged.slice(0, 3), bottom: judged.slice(-3).reverse(),
    };
  }
  const subs = Math.max(0, ...infos.map((i) => i.channel_follower_count ?? 0));
  return { channel: infos.find((i) => i.channel)?.channel ?? "?", subs, rows, byType };
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
const n = (x) => (x == null ? "-" : x.toLocaleString("en-US"));
const NAMES = { short: "Shorts", long: "Long videos", live: "Live streams" };

export function report(sum, asOf, minAge = 7) {
  const total = Object.values(sum.byType).reduce((a, t) => a + t.views, 0) || 1;
  const out = [`# Channel stats: ${sum.channel} (${n(sum.subs)} subscribers), as of ${asOf.toISOString().slice(0, 10)}`, ""];
  out.push(Object.entries(sum.byType).map(([k, t]) => `${NAMES[k]}: ${t.all.length} videos, ${n(t.views)} views (${Math.round((t.views / total) * 100)}%)`).join(". ") + ".");
  for (const [k, t] of Object.entries(sum.byType)) {
    out.push("", `## ${NAMES[k]} (${t.all.length}), most viewed first`, "", "| Uploaded | Age (days) | Length | Views | Views/day | Likes | Comments | Title |", "|---|---|---|---|---|---|---|---|");
    for (const r of t.all) out.push(`| ${r.uploaded} | ${r.age} | ${mmss(r.sec)} | ${n(r.views)} | ${r.perDay.toFixed(1)} | ${n(r.likes)} | ${n(r.comments)} | ${r.title.replace(/\|/g, "/")} |`);
    out.push("");
    if (t.judged.length) {
      out.push(`Median views, ${NAMES[k].toLowerCase()} at least ${minAge} days old (n=${t.judged.length}): ${n(t.medianViews)}`);
      out.push(`Top: ${t.top.map((r) => `"${r.title}" (${n(r.views)})`).join("; ")}`);
      if (t.judged.length > 3) out.push(`Bottom: ${t.bottom.map((r) => `"${r.title}" (${n(r.views)})`).join("; ")}`);
    }
    if (t.young) out.push(`Too new to judge (under ${minAge} days): ${t.young}`);
  }
  out.push("", "Views are a snapshot. Compare videos of similar age, and treat a handful of videos as a hint, not a rule.");
  return out.join("\n");
}

function main(argv) {
  const dir = argv[0];
  if (!dir) {
    console.error("usage: node channel-stats.mjs <folder of .info.json files> [--as-of YYYY-MM-DD] [--min-age 7]");
    process.exit(1);
  }
  const opt = (name, d) => { const i = argv.indexOf(name); return i > 0 ? argv[i + 1] : d; };
  const asOf = new Date(`${opt("--as-of", new Date().toISOString().slice(0, 10))}T00:00:00Z`);
  const minAge = Number(opt("--min-age", 7));
  const infos = readdirSync(dir).filter((f) => f.endsWith(".info.json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")))
    .filter((i) => i._type !== "playlist");
  if (!infos.length) {
    console.error(`no .info.json files in ${dir}`);
    process.exit(1);
  }
  console.log(report(summarize(infos, asOf, minAge), asOf, minAge));
}

// Run only when called directly (realpath, so a symlinked plugin folder still runs), so tests can import the functions.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
