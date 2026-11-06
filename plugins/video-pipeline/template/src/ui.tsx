import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import type {Cue, Sticker} from './timing-core.mjs';
import {ChannelLogo} from './channel';

// Palette and fonts. Change C to restyle every scene.
export const C = {
  bg: '#141414', panel: '#1f1f1f', side: '#181818', line: '#2b2b2b', text: '#e6e6e6', dim: '#8b8b8b',
  blue: '#0078d4', amber: '#f5a524', mint: '#3ddc97', red: '#f14c4c', purple: '#c586c0', kw: '#569cd6',
  str: '#ce9178', cmt: '#6a9955', num: '#b5cea8', fn: '#dcdcaa',
};
export const MONO = "'SF Mono', Menlo, Consolas, monospace";
export const SANS = "-apple-system, 'Segoe UI', Inter, Helvetica, Arial, sans-serif";

// Visual area sits above the caption band.
export {VIS} from './layout';
import {CAP, IS_SHORT, VIS, stickerXY} from './layout';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.out(Easing.cubic)});

// ---------- Take context: cue start frames ----------
export const TakeCtx = React.createContext<Cue[]>([]);
export const useCues = () => React.useContext(TakeCtx);
/** frame at which caption i starts (i may be past the end: returns take end-ish) */
export const useAt = () => {
  const cues = useCues();
  return (i: number) => (i < cues.length ? cues[i].from : cues[cues.length - 1].from + cues[cues.length - 1].dur);
};

// ---------- SFX ----------
export const Sfx: React.FC<{name: 'key' | 'tick' | 'whoosh' | 'pop' | 'ding' | 'buzz'; at: number; v?: number}> = ({name, at, v = 0.35}) => (
  <Sequence from={at} durationInFrames={45} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
  </Sequence>
);

// ---------- Beat: show children from caption a until caption b ----------
export const Beat: React.FC<{a: number; b?: number; children: React.ReactNode; sfx?: 'pop' | 'whoosh' | 'tick' | 'ding' | 'buzz'}> = ({a, b, children, sfx}) => {
  const off = React.useContext(BeatOffset); // nested beats: frames are relative to the enclosing beat
  const f = useCurrentFrame() + off;
  const at = useAt();
  const cues = useCues();
  const s = at(a);
  const e = b === undefined ? 1e9 : at(b);
  if (f < s - 1 || f > e + 10) return null;
  const o = Math.min(ease(f, s, s + 12), b === undefined ? 1 : interpolate(f, [e, e + 10], [1, 0], clamp));
  const y = ease(f, s, s + 14, 30, 0);
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateY(${y}px)`}}>
      <BeatOffset.Provider value={s}>
        <Sequence from={s - off} layout="none">{children}</Sequence>
      </BeatOffset.Provider>
      {sfx && a > 0 && a < cues.length && <Sfx name={sfx} at={s - off} />}
    </AbsoluteFill>
  );
};
const BeatOffset = React.createContext(0);

// ---------- Frame: background, chapter chip, logo, caption band ----------
const hl = (t: string) =>
  t.split(/(\d[\d,]*(?:\.\d+)?\s?%?|"[^"]*")/g).map((p, i) =>
    /^\d/.test(p) ? <span key={i} style={{color: '#b45309'}}>{p}</span> : /^"/.test(p) ? <span key={i} style={{color: '#047857'}}>{p}</span> : p,
  );

export const Frame: React.FC<{chapter: string; n: number; total: number; stickers?: Sticker[]; children: React.ReactNode}> = ({chapter, n, total, stickers = [], children}) => {
  const f = useCurrentFrame();
  const cues = useCues();
  const cur = [...cues].reverse().find((c) => f >= c.from);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #1c2330 0%, ${C.bg} 70%)`, fontFamily: SANS, color: C.text}}>
      {children}
      <div style={{position: 'absolute', left: 48, top: 40, display: 'flex', gap: 14, alignItems: 'center'}}>
        {!IS_SHORT && <div style={{fontWeight: 800, fontSize: 22, color: '#111', background: C.amber, padding: '6px 14px', borderRadius: 8}}>{n}/{total}</div>}
        <div style={{fontWeight: 800, fontSize: IS_SHORT ? 34 : 24, color: '#fff', background: 'rgba(0,120,212,.9)', padding: '6px 16px', borderRadius: 8}}>{chapter}</div>
      </div>
      <ChannelLogo size={60} style={{position: 'absolute', right: 48, top: 32, borderRadius: 14}} />
      {stickers.map((s, i) => <StickerPop key={i} s={s} from={cues[s.at]?.from ?? 0} dur={cues[s.at]?.dur ?? 60} />)}
      {cur && <Caption key={cur.from} cue={cur} />}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{cue: Cue}> = ({cue}) => {
  const f = useCurrentFrame() - cue.from;
  const o = Math.min(ease(f, 0, 6), interpolate(f, [cue.dur - 5, cue.dur], [1, 0.4], clamp));
  const y = ease(f, 0, 8, 14, 0);
  // Word-synced (voice mode + wordAt): highlight the word being spoken; otherwise color numbers and quotes.
  const now = cue.words ? cue.words.reduce((a, w, i) => (f >= w ? i : a), -1) : -1;
  const body = cue.words
    ? cue.text.split(/\s+/).map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          <span style={{borderRadius: 10, padding: '0 6px', margin: '0 -6px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
            background: i === now ? C.amber : 'transparent', color: i === now ? '#111' : i < now ? '#111' : 'rgba(17,17,17,.55)'}}>{w}</span>
        </React.Fragment>
      ))
    : hl(cue.text);
  return (
    <div style={{position: 'absolute', left: CAP.left, right: CAP.right, top: CAP.top, height: CAP.height, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o, transform: `translateY(${y}px)`}}>
      <div style={{fontSize: CAP.size, fontWeight: 750, lineHeight: 1.3, maxWidth: CAP.maxW, textAlign: 'center', textWrap: 'balance',
        background: 'rgba(255,255,255,.92)', color: '#111', padding: '14px 26px', borderRadius: 22, boxShadow: '0 10px 40px rgba(0,0,0,.45)'}}>
        {body}
      </div>
    </div>
  );
};

// ---------- Basic blocks ----------
export const Center: React.FC<{children: React.ReactNode; top?: number; bottom?: number; gap?: number; row?: boolean}> = ({children, top = VIS.top, bottom = VIS.bottom, gap = 40, row}) => (
  <div style={{position: 'absolute', left: VIS.left, right: VIS.right, top, height: bottom - top, display: 'flex', flexDirection: row && !IS_SHORT ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap}}>{children}</div>
);

export const Card: React.FC<{children: React.ReactNode; w?: number; color?: string; style?: React.CSSProperties}> = ({children, w, color = C.line, style}) => (
  <div style={{width: w, background: 'rgba(31,31,31,.92)', border: `2px solid ${color}`, borderRadius: 20, padding: '28px 36px', boxShadow: '0 20px 60px rgba(0,0,0,.45)', ...style}}>{children}</div>
);

export const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 110, color = '#fff', style}) => (
  <div style={{fontSize: size, fontWeight: 900, color, letterSpacing: -1, lineHeight: 1.05, textAlign: 'center', ...style}}>{children}</div>
);

export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = C.dim, size = 26}) => (
  <div style={{fontSize: size, color, fontWeight: 600, letterSpacing: 0.5}}>{children}</div>
);

export const Source: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: VIS.bottom - 6, textAlign: 'center', fontSize: 20, color: C.dim}}>{children}</div>
);

// Pop-in with spring, delayed by d frames (relative to enclosing Sequence)
export const Pop: React.FC<{d?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({d = 0, children, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - d, fps, config: {damping: 13, stiffness: 160}});
  return <div style={{transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.5), ...style}}>{children}</div>;
};

export const Counter: React.FC<{to: number; d?: number; len?: number; prefix?: string; suffix?: string; dec?: number}> = ({to, d = 0, len = 30, prefix = '', suffix = '', dec = 0}) => {
  const f = useCurrentFrame();
  const v = ease(f, d, d + len, 0, to);
  return <>{prefix}{v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec})}{suffix}</>;
};

// ---------- Terminal panel (real captured output, revealed line by line) ----------
const termColor = (l: string) =>
  l.startsWith('$') ? C.fn : /FAIL|✘|exit 2/.test(l) ? C.red : /PASS|✔|^ok |exit 0|# pass/.test(l) ? C.mint : /^\s*-|❯|line:/.test(l) ? C.amber : C.text;

export const Terminal: React.FC<{text: string; w?: number; h?: number; title?: string; d?: number; speed?: number; size?: number}> = ({text, w = 1500, h, title = 'zsh', d = 0, speed = 4, size = 24}) => {
  const f = useCurrentFrame();
  const lines = text.split('\n');
  const cmdLen = lines[0].length;
  const typed = Math.max(0, Math.floor((f - d) * 1.4));
  return (
    <div style={{width: w, height: h, background: '#0d0d0d', borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.6)'}}>
      <div style={{height: 40, background: C.side, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: `1px solid ${C.line}`}}>
        {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
        <div style={{flex: 1, textAlign: 'center', fontSize: 16, color: C.dim, fontFamily: MONO}}>{title}</div>
      </div>
      <div style={{padding: '18px 26px', fontFamily: MONO, fontSize: size, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
        {lines.map((l, i) => {
          if (i === 0) {
            const t = l.slice(0, Math.min(typed, cmdLen));
            return <div key={i} style={{color: C.fn}}>{t}{typed < cmdLen ? '▌' : ''}</div>;
          }
          const show = f - d - cmdLen / 1.4 - 6 > i * speed;
          return show ? <div key={i} style={{color: termColor(l), minHeight: '1em'}}>{l}</div> : null;
        })}
      </div>
    </div>
  );
};

// ---------- Code panel ----------
const TOK = /("[^"]*"|'[^']*'|`[^`]*`|\b(?:const|let|return|import|from|export|async|await|type)\b|\b\d+(?:\.\d+)?\b)/g;
const HlLine: React.FC<{line: string}> = ({line}) => {
  if (/^\s*(\/\/|#)/.test(line)) return <span style={{color: /^#/.test(line) ? C.kw : C.cmt}}>{line}</span>;
  return (
    <>
      {line.split(TOK).map((p, i) => {
        const col = /^["'`]/.test(p) ? C.str : /^(const|let|return|import|from|export|async|await|type)$/.test(p) ? C.purple : /^\d/.test(p) ? C.num : undefined;
        return <span key={i} style={col ? {color: col} : undefined}>{p}</span>;
      })}
    </>
  );
};

export const Code: React.FC<{text: string; title: string; w?: number; size?: number; hl?: [number, number][]; hlFrom?: number; scroll?: number; maxH?: number}> = ({text, title, w = 1400, size = 22, hl = [], hlFrom = 0, scroll = 0, maxH = 640}) => {
  const f = useCurrentFrame();
  const ho = ease(f, hlFrom, hlFrom + 12);
  const lines = text.split('\n');
  return (
    <div style={{width: w, background: C.panel, borderRadius: 16, border: `1px solid ${C.line}`, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.6)'}}>
      <div style={{height: 42, background: C.side, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${C.line}`, fontSize: 17, color: '#fff', fontFamily: MONO}}>
        <span style={{borderTop: `2px solid ${C.blue}`, padding: '9px 4px'}}>{title}</span>
      </div>
      <div style={{maxHeight: maxH, overflow: 'hidden', fontFamily: MONO, fontSize: size, lineHeight: 1.5}}>
        <div style={{transform: `translateY(${-scroll}px)`, padding: '14px 0'}}>
          {lines.map((l, i) => {
            const on = hl.some(([a, b]) => i >= a && i <= b);
            return (
              <div key={i} style={{display: 'flex', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: on ? `rgba(245,165,36,${0.18 * ho})` : undefined, boxShadow: on ? `inset 4px 0 0 rgba(245,165,36,${ho})` : undefined}}>
                <span style={{width: 60, textAlign: 'right', paddingRight: 22, color: '#6e7681', flexShrink: 0}}>{i + 1}</span>
                <span style={{color: C.text}}><HlLine line={l} /></span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// <bars>
export const Bars: React.FC<{items: {label: string; value: number; color: string}[]; max: number; d?: number}> = ({items, max, d = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: IS_SHORT ? 50 : 120, alignItems: 'flex-end', height: IS_SHORT ? 640 : 520}}>
      {items.map((it, i) => {
        const p = ease(f, d + i * 8, d + i * 8 + 40);
        return (
          <div key={it.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
            <div style={{fontSize: 64, fontWeight: 900, color: it.color}}>{Math.round(it.value * p).toLocaleString('en-US')}</div>
            <div style={{width: IS_SHORT ? 200 : 260, height: Math.max(6, (it.value / max) * (IS_SHORT ? 500 : 380) * p), background: it.color, borderRadius: 12}} />
            <div style={{fontSize: 32, fontWeight: 700}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};
// </bars>

// ---------- Retention curve ----------
export const Curve: React.FC<{pts: number[][]; dur: number; w?: number; h?: number; d?: number; marks?: {x: number; label: string; color?: string; d: number}[]}> = ({pts, dur, w = 1300, h = 520, d = 0, marks = []}) => {
  const f = useCurrentFrame();
  const p = ease(f, d, d + 75);
  const X = (x: number) => 70 + x * (w - 100);
  const Y = (y: number) => 20 + (1 - y) * (h - 80);
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x)},${Y(y)}`).join(' ');
  const yAt = (x: number) => {
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
    return pts[pts.length - 1][1];
  };
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={70} x2={w - 30} y1={Y(g)} y2={Y(g)} stroke={C.line} strokeWidth={2} />
          <text x={56} y={Y(g) + 8} fill={C.dim} fontSize={22} textAnchor="end" fontFamily={SANS}>{g * 100}%</text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <text key={g} x={X(g)} y={h - 22} fill={C.dim} fontSize={22} textAnchor="middle" fontFamily={SANS}>
          {`${Math.floor((g * dur) / 60)}:${String(Math.round((g * dur) % 60)).padStart(2, '0')}`}
        </text>
      ))}
      <clipPath id="reveal"><rect x={0} y={0} width={70 + p * (w - 100)} height={h} /></clipPath>
      <path d={`${path} L${X(1)},${Y(0)} L${X(0)},${Y(0)} Z`} fill="rgba(0,120,212,.18)" clipPath="url(#reveal)" />
      <path d={path} fill="none" stroke={C.blue} strokeWidth={6} strokeLinejoin="round" clipPath="url(#reveal)" />
      {marks.map((m) => {
        const o = ease(f, m.d, m.d + 10);
        const y = yAt(m.x);
        return (
          <g key={m.label} opacity={o}>
            <line x1={X(m.x)} x2={X(m.x)} y1={Y(1)} y2={Y(0)} stroke={m.color ?? C.red} strokeWidth={3} strokeDasharray="8 8" />
            <circle cx={X(m.x)} cy={Y(y)} r={11} fill={m.color ?? C.red} />
            <rect x={X(m.x) + 18} y={Y(y) - 64} width={m.label.length * 17 + 30} height={50} rx={10} fill={m.color ?? C.red} />
            <text x={X(m.x) + 33} y={Y(y) - 30} fill="#111" fontWeight={900} fontSize={28} fontFamily={SANS}>{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- Step row (pipeline, loop) ----------
export const Steps: React.FC<{items: string[]; active?: number; d?: number; loop?: boolean; size?: number}> = ({items, active = -1, d = 0, loop, size = 40}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center'}}>
      {items.map((s, i) => {
        const o = ease(f, d + i * 7, d + i * 7 + 12);
        const on = i === active;
        return (
          <React.Fragment key={s}>
            <div style={{opacity: o, transform: `translateY(${(1 - o) * 20}px)`, fontSize: size, fontWeight: 800, padding: '20px 32px', borderRadius: 16, background: on ? C.amber : C.panel, color: on ? '#111' : '#fff', border: `2px solid ${on ? C.amber : C.line}`}}>{s}</div>
            {(i < items.length - 1 || loop) && <div style={{opacity: o, fontSize: size, color: C.dim}}>{i < items.length - 1 ? '→' : '↺'}</div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------- Checklist ----------
export const Check: React.FC<{items: {text: string; at: number}[]; size?: number}> = ({items, size = 38}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      {items.map((it, i) => {
        const o = ease(f, it.at, it.at + 12);
        return (
          <div key={i} style={{opacity: o, transform: `translateX(${(1 - o) * -30}px)`, display: 'flex', gap: 22, alignItems: 'center', fontSize: size, fontWeight: 700}}>
            <svg width={size + 8} height={size + 8} viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="6" fill={C.mint} /><path d="M6 12.5l4 4 8-9" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {it.text}
          </div>
        );
      })}
    </div>
  );
};

export const Thumb: React.FC<{id: string; w?: number; style?: React.CSSProperties}> = ({id, w = 480, style}) => (
  <Img src={staticFile(`thumbs/${id}.jpg`)} style={{width: w, height: (w * 9) / 16, objectFit: 'cover', borderRadius: 14, border: `2px solid ${C.line}`, ...style}} />
);

// ---------- Sticker: tilted label that springs in, wobbles, and pops out ----------
const STICKER_BG: Record<string, string> = {amber: C.amber, mint: C.mint, red: C.red, blue: '#3aa0ff'};
const StickerPop: React.FC<{s: Sticker; from: number; dur: number}> = ({s, from, dur}) => {
  const {fps} = useVideoConfig();
  const len = Math.min(dur - 4, 240);
  return (
    <Sequence from={from + 8} durationInFrames={len} layout="none">
      <StickerInner s={s} fps={fps} len={len} />
      <Sfx name="pop" at={0} v={0.5} />
    </Sequence>
  );
};
const StickerInner: React.FC<{s: Sticker; fps: number; len: number}> = ({s, fps, len}) => {
  const f = useCurrentFrame();
  const sc = spring({frame: f, fps, config: {damping: 8, stiffness: 200}});
  const spin = interpolate(sc, [0, 1], [-25, 0]);
  const out = interpolate(f, [len - 8, len], [1, 0], clamp);
  const wob = Math.sin(f / 6) * 2;
  return (
    <div style={{
      position: 'absolute', left: stickerXY(s.x, s.y).x, top: stickerXY(s.x, s.y).y, transform: `scale(${sc * (1 - (1 - out) * 0.4)}) rotate(${s.rot + wob + spin}deg)`, opacity: out,
      background: STICKER_BG[s.color] ?? C.amber, color: '#111', fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: 1,
      padding: '12px 26px', borderRadius: 14, border: '5px solid #fff', boxShadow: '0 12px 30px rgba(0,0,0,.55)', whiteSpace: 'nowrap', zIndex: 5,
    }}>{s.text}</div>
  );
};
