// Shared by the Remotion project and the node scripts, so stills, chapters and the render agree on timing.
export const FPS = 30;
const LEAD = 0.5; // s before the first caption
const TAIL = 0.8; // s after the last caption

// Reading time: about 3 words per second, never under 2.5 s.
export const readSec = (text) => Math.max(2.5, text.split(/\s+/).length / 3 + 0.8);

/**
 * Text mode (voiceSec null): each caption's reading time sets its length.
 * Voice mode: each take lasts as long as its public/vo/<id>.wav; captions share that time in proportion to their length.
 * shortcut: voice-mode captions are proportional, not word-synced. Upgrade with word timestamps if drift shows.
 */
export function computeTakes(script, voiceSec = null) {
  return script.takes.map((t) => {
    const base = t.captions.map(readSec);
    const sum = base.reduce((a, b) => a + b, 0);
    const scale = voiceSec && sum ? Math.max(0.05, ((voiceSec[t.id] ?? 0) - LEAD) / sum) : 1;
    let at = Math.round(LEAD * FPS);
    const cues = t.captions.map((text, i) => {
      const dur = Math.max(15, Math.round(base[i] * scale * FPS));
      const c = {from: at, dur, text};
      at += dur;
      return c;
    });
    return {id: t.id, chapter: t.chapter, frames: at + Math.round(TAIL * FPS), cues,
      stickers: t.stickers ?? [], memes: t.memes ?? {}, visuals: t.visuals ?? {}};
  });
}

/** "m:ss Chapter" lines: the start of the first take of each chapter. */
export function chapterLines(takes) {
  const out = [];
  let at = 0;
  const seen = new Set();
  for (const t of takes) {
    if (!seen.has(t.chapter)) {
      seen.add(t.chapter);
      const s = Math.floor(at / FPS);
      out.push(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} ${t.chapter}`);
    }
    at += t.frames;
  }
  return out;
}

/** Look up "$a.b.c" in the data file; anything else is returned as is. */
export function resolve(data, v) {
  if (typeof v !== 'string' || !v.startsWith('$')) return v;
  const val = v.slice(1).split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);
  if (val === undefined) throw new Error(`data file has no ${v}`);
  return val;
}
