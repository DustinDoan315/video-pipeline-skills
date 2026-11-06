#!/usr/bin/env python3
"""Word-synced captions: writes "wordAt" (and "cueAt") into each take of src/data/script.json.

Input: out/words/<take id>.json, whisper output with word timestamps for public/vo/<take id>.wav:
  uvx --from mlx-whisper mlx_whisper public/vo/<id>.wav --word-timestamps True \
      --output-format json --output-dir out/words --language en
One file per call: passing several wavs to one mlx_whisper call wrote the wrong transcript under a take's name.
Caption text and speech may differ ("4.8" vs "4 .8", "/model" vs "slash model"), so tokens are
matched with difflib; unmatched caption words take the time of the spoken words they replace.
Usage: python3 scripts/align-words.py
"""
import difflib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src/data/script.json"
LEAD = 0.15  # caption appears this long before its first word


def norm(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())


def align(captions, spoken):
    """captions: list of caption strings. spoken: [(word, start)]. Returns per-caption lists of start seconds."""
    cap = [(ci, w) for ci, c in enumerate(captions) for w in c.split()]
    a, b = [norm(w) for _, w in cap], [norm(w) for w, _ in spoken]
    at = [None] * len(cap)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                at[i1 + k] = spoken[j1 + k][1]
        elif op == "replace":
            # spread the replaced spoken words over the caption words, in order
            for k in range(i2 - i1):
                at[i1 + k] = spoken[j1 + (k * (j2 - j1)) // (i2 - i1)][1]
    for k in range(len(at)):  # caption words never spoken: borrow the previous word's time
        if at[k] is None:
            at[k] = at[k - 1] if k else (spoken[0][1] if spoken else 0.0)
    for k in range(1, len(at)):  # times never go backwards
        at[k] = max(at[k], at[k - 1])
    out = [[] for _ in captions]
    for (ci, _), t in zip(cap, at):
        out[ci].append(round(t, 2))
    return out


def main():
    s = json.loads(SCRIPT.read_text())
    for t in s["takes"]:
        f = ROOT / "out/words" / f"{t['id']}.json"
        if not f.exists():
            sys.exit(f"missing {f.relative_to(ROOT)}: run whisper on public/vo/{t['id']}.wav first (see top of this file)")
        w = json.loads(f.read_text())
        spoken = [(x["word"].strip(), x["start"]) for seg in w["segments"] for x in seg.get("words", [])]
        t["wordAt"] = align(t["captions"], spoken)
        t["cueAt"] = [0.0] + [max(0.0, round(c[0] - LEAD, 2)) for c in t["wordAt"][1:]]
        print(t["id"], "cueAt", t["cueAt"])
    SCRIPT.write_text(json.dumps(s, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    if sys.argv[1:] == ["--test"]:
        r = align(["Opus 4.8 is out.", "Type /model now"], [("Opus", 0), ("4", 1), (".8", 1.5), ("is", 2), ("out.", 3),
                                                           ("Type", 4), ("slash", 5), ("model", 6), ("now", 7)])
        assert r == [[0, 1, 2, 3], [4, 6, 7]], r
        print("ok")
    else:
        main()
