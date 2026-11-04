# Generates an original lo-fi loop (no samples, no copyright): soft chords, bass, kick/snare/hat.
# Usage: python3 make-music.py out.wav   (writes a 32-bar loop at 84 BPM)
import math, random, struct, sys, wave

SR = 32000
BPM = 84
BEAT = 60 / BPM
BARS = 16
random.seed(7)
n_total = int(SR * BEAT * 4 * BARS)
L = [0.0] * n_total

def add(start_s, samples, gain=1.0):
    i0 = int(start_s * SR)
    for i, v in enumerate(samples):
        j = i0 + i
        if j >= n_total: break
        L[j] += v * gain

def note_hz(n): return 440 * 2 ** ((n - 69) / 12)

def pad(freqs, dur):
    n = int(dur * SR); out = []
    for i in range(n):
        t = i / SR
        env = min(1, t / 0.35) * min(1, (dur - t) / 0.5)
        v = 0.0
        for k, f in enumerate(freqs):
            det = 1 + 0.002 * math.sin(2 * math.pi * 0.3 * t + k)
            v += math.sin(2 * math.pi * f * det * t) + 0.25 * math.sin(4 * math.pi * f * t)
        out.append(env * v / len(freqs))
    return out

def pluck(f, dur=0.5):
    n = int(dur * SR)
    return [math.exp(-6 * i / SR) * (math.sin(2 * math.pi * f * i / SR) + 0.3 * math.sin(6 * math.pi * f * i / SR)) for i in range(n)]

def bass(f, dur):
    n = int(dur * SR)
    return [min(1, i / 200) * math.exp(-1.5 * i / SR) * math.sin(2 * math.pi * f * i / SR) for i in range(n)]

def kick():
    n = int(0.35 * SR); out = []; ph = 0
    for i in range(n):
        t = i / SR; f = 50 + 90 * math.exp(-t * 30); ph += 2 * math.pi * f / SR
        out.append(math.exp(-t * 9) * math.sin(ph))
    return out

def noise(dur, decay, lp):
    n = int(dur * SR); out = []; y = 0
    for i in range(n):
        y += lp * (random.uniform(-1, 1) - y)
        out.append(math.exp(-decay * i / SR) * y)
    return out

# Cmaj7 - Am7 - Fmaj7 - G6 (two bars each), voiced low and warm
prog = [[48, 52, 55, 59], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 59]]
K, SN, HAT = kick(), noise(0.25, 18, 0.5), noise(0.06, 60, 0.9)
melody = [72, 74, 76, 79, 76, 74, 72, 69]
for bar in range(BARS):
    t0 = bar * 4 * BEAT
    ch = prog[(bar // 2) % 4]
    if bar % 2 == 0:
        add(t0, pad([note_hz(n) for n in ch], 8 * BEAT), 0.16)
        add(t0, bass(note_hz(ch[0] - 12), 2 * BEAT), 0.35)
        add(t0 + 4 * BEAT, bass(note_hz(ch[0] - 12), 2 * BEAT), 0.3)
    for b in range(4):
        tb = t0 + b * BEAT
        swing = 0.06 * BEAT
        if b in (0, 2): add(tb, K, 0.55)
        if b == 2 and bar % 4 == 3: add(tb + BEAT / 2 + swing, K, 0.35)
        if b in (1, 3): add(tb, SN, 0.18)
        add(tb, HAT, 0.07); add(tb + BEAT / 2 + swing, HAT, 0.05)
    if bar % 4 in (1, 3):
        for k in range(4):
            if random.random() < 0.7:
                add(t0 + k * BEAT + (BEAT / 2 if k % 2 else 0), pluck(note_hz(random.choice(melody))), 0.12)

peak = max(abs(v) for v in L) or 1
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(32000 * 0.9 * v / peak)) for v in L))
print('loop seconds', round(n_total / SR, 1))
