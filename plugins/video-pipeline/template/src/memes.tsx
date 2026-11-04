import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Sfx} from './ui';
import {CHANNEL, ChannelLogo} from './channel';
import {IS_SHORT, MEME} from './layout';

// Emoji art: Twemoji by Twitter/X, CC-BY 4.0 (credit in the description).
export const emojiFile = (e: string) =>
  [...e].map((c) => c.codePointAt(0)!.toString(16)).filter((h) => h !== 'fe0f').join('-');
export const Emo: React.FC<{e: string; size: number; style?: React.CSSProperties}> = ({e, size, style}) => (
  <Img src={staticFile(`emoji/${emojiFile(e)}.svg`)} style={{width: size, height: size, ...style}} />
);

const IMPACT = "Impact, 'Arial Black', sans-serif";
const MemeText: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 76, color = '#fff'}) => (
  <div style={{fontFamily: IMPACT, fontSize: size, color, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.05, letterSpacing: 1,
    WebkitTextStroke: `${Math.round(size / 18)}px #000`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #000'}}>{children}</div>
);

type Side = {e: string; text: string; label?: string};
export type MemeSpec =
  | {kind: 'classic'; e: string; top?: string; bottom?: string; fx?: 'bounce' | 'shake' | 'zoom' | 'spin' | 'float'}
  | {kind: 'nobody'; who: string; says: string; e: string}
  | {kind: 'nahyeah'; no: Side; yes: Side}
  | {kind: 'expect'; left: Side; right: Side}
  | {kind: 'brain'; levels: string[]}
  | {kind: 'pov'; text: string; e: string}
  | {kind: 'fine'; text: string}
  | {kind: 'vs'; a: Side; b: Side}
  | {kind: 'subscribe'; top: string; bottom?: string};

const fxT = (fx: string | undefined, f: number) => {
  switch (fx) {
    case 'shake': return `translate(${Math.sin(f * 2.1) * 10}px, ${Math.cos(f * 1.7) * 6}px) rotate(${Math.sin(f * 1.3) * 4}deg)`;
    case 'zoom': return `scale(${interpolate(f, [0, 90], [0.8, 1.15], {extrapolateRight: 'clamp'})})`;
    case 'spin': return `rotate(${interpolate(f, [0, 20], [-200, 0], {extrapolateRight: 'clamp'})}deg)`;
    case 'float': return `translateY(${Math.sin(f / 10) * 18}px)`;
    default: return `translateY(${-Math.abs(Math.sin(f / 7)) * 40}px)`;
  }
};

export const Meme: React.FC<{m: MemeSpec}> = ({m}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 170}});
  return (
    <AbsoluteFill style={{background: '#0e0e10'}}>
      <div style={{position: 'absolute', left: MEME.left, right: MEME.right, top: MEME.top, height: MEME.height, borderRadius: 26, background: '#1b1b20', border: '6px solid #fff',
        overflow: 'hidden', transform: `scale(${0.85 + 0.15 * s}) rotate(${(1 - s) * -3}deg)`, opacity: Math.min(1, s * 1.6), boxShadow: '0 30px 90px rgba(0,0,0,.6)'}}>
        <MemeBody m={m} f={f} />
      </div>
      <Sfx name="whoosh" at={0} v={0.25} />
    </AbsoluteFill>
  );
};

const Row: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{display: 'flex', alignItems: 'center', ...style}}>{children}</div>
);

const MemeBody: React.FC<{m: MemeSpec; f: number}> = ({m, f}) => {
  const fx = (d: number) => Math.min(1, Math.max(0, (f - d) / 10));
  switch (m.kind) {
    case 'classic':
      return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px'}}>
          <MemeText>{m.top ?? ''}</MemeText>
          <div style={{transform: fxT(m.fx, f)}}><Emo e={m.e} size={330} /></div>
          <div style={{opacity: fx(18)}}><MemeText>{m.bottom ?? ''}</MemeText></div>
        </div>
      );
    case 'nobody':
      return (
        <Row style={{height: '100%', padding: IS_SHORT ? '0 50px' : '0 80px', gap: 60, flexDirection: IS_SHORT ? 'column' : 'row', justifyContent: 'center'}}>
          <div style={{flex: IS_SHORT ? undefined : 1, fontFamily: "-apple-system, Helvetica, Arial", fontSize: 58, lineHeight: 1.5, color: '#fff'}}>
            <div><b>Nobody:</b></div>
            <div style={{opacity: fx(14)}}><b>{m.who}:</b> <span style={{color: C.amber}}>{m.says}</span></div>
          </div>
          <div style={{opacity: fx(14), transform: fxT('bounce', f)}}><Emo e={m.e} size={300} /></div>
        </Row>
      );
    case 'nahyeah':
      return (
        <div style={{height: '100%', display: 'grid', gridTemplateRows: '1fr 1fr'}}>
          {[m.no, m.yes].map((r, i) => (
            <Row key={i} style={{gap: 50, padding: '0 70px', background: i ? 'rgba(61,220,151,.12)' : 'rgba(241,76,76,.12)', borderTop: i ? '4px solid #fff' : undefined, opacity: i ? fx(20) : 1}}>
              <Emo e={r.e} size={250} style={{transform: `rotate(${i ? 0 : -8}deg)`}} />
              <div style={{fontSize: 60, fontWeight: 900, color: i ? C.mint : C.red, fontFamily: "-apple-system, Helvetica, Arial"}}>{r.text}</div>
            </Row>
          ))}
        </div>
      );
    case 'expect':
    case 'vs': {
      const [a, b] = m.kind === 'expect' ? [m.left, m.right] : [m.a, m.b];
      const labels = m.kind === 'expect' ? [a.label ?? 'Expectation', b.label ?? 'Reality'] : [a.label ?? '', b.label ?? ''];
      return (
        <div style={{height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative'}}>
          {[a, b].map((p, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '34px 30px', borderLeft: i ? '6px solid #fff' : undefined, opacity: i ? fx(22) : 1}}>
              <MemeText size={60} color={i ? C.red : C.mint}>{labels[i]}</MemeText>
              <div style={{transform: i ? fxT('shake', f) : fxT('float', f)}}><Emo e={p.e} size={280} /></div>
              <MemeText size={52}>{p.text}</MemeText>
            </div>
          ))}
          {m.kind === 'vs' && <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: C.red, borderRadius: 60, padding: '10px 26px', border: '5px solid #fff'}}><MemeText size={60}>VS</MemeText></div>}
        </div>
      );
    }
    case 'brain':
      return (
        <div style={{height: '100%', display: 'grid', gridTemplateRows: `repeat(${m.levels.length}, 1fr)`}}>
          {m.levels.map((t, i) => (
            <Row key={i} style={{gap: 40, padding: '0 60px', borderTop: i ? '4px solid #fff' : undefined, opacity: fx(i * 18), background: `rgba(255,200,80,${i * 0.07})`}}>
              <div style={{flex: 1, fontSize: 46, fontWeight: 800, color: '#fff', fontFamily: "-apple-system, Helvetica, Arial"}}>{t}</div>
              <Emo e="🧠" size={120 + i * 20} style={{filter: `drop-shadow(0 0 ${i * 14}px rgba(255,210,90,.95))`}} />
            </Row>
          ))}
        </div>
      );
    case 'pov':
      return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: 40}}>
          <MemeText size={70}>POV: {m.text}</MemeText>
          <div style={{transform: fxT('zoom', f), opacity: fx(10)}}><Emo e={m.e} size={340} /></div>
        </div>
      );
    case 'subscribe':
      return <SubscribeCTA top={m.top} bottom={m.bottom} f={f} />;
    case 'fine':
      return (
        <div style={{height: '100%', position: 'relative', background: 'linear-gradient(#3a1a08, #7a2c0a)'}}>
          {Array.from({length: 14}, (_, i) => (
            <Emo key={i} e="🔥" size={150} style={{position: 'absolute', left: (i % 7) * 230 - 20, top: i < 7 ? -30 + Math.sin(f / 5 + i) * 10 : 520 + Math.sin(f / 4 + i) * 12, opacity: 0.9}} />
          ))}
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
            <Emo e="🧑‍💻" size={260} /><Emo e="☕" size={140} style={{marginTop: 120}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, opacity: fx(15)}}><MemeText size={64}>{m.text}</MemeText></div>
        </div>
      );
  }
};

/** every emoji a meme spec uses, for copying the SVGs into public/ */
export const memeEmojis = (m: MemeSpec): string[] => {
  switch (m.kind) {
    case 'classic': case 'nobody': case 'pov': return [m.e];
    case 'nahyeah': return [m.no.e, m.yes.e];
    case 'expect': return [m.left.e, m.right.e];
    case 'vs': return [m.a.e, m.b.e];
    case 'brain': return ['🧠'];
    case 'fine': return ['🔥', '🧑‍💻', '☕'];
    case 'subscribe': return ['🔔'];
  }
};

// Cursor glides to the button, clicks, the button flips to "Subscribed" and the bell rings.
const SubscribeCTA: React.FC<{top: string; bottom?: string; f: number}> = ({top, bottom, f}) => {
  const click = 45;
  const done = f >= click;
  const p = interpolate(f, [8, click - 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glide = 1 - Math.pow(1 - p, 3);
  const press = f >= click - 4 && f < click + 4 ? 0.92 : 1;
  const ring = done ? Math.sin((f - click) / 2) * 22 * Math.max(0, 1 - (f - click) / 40) : 0;
  const font = "-apple-system, Helvetica, Arial";
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: IS_SHORT ? 60 : 40, padding: '0 30px'}}>
      <MemeText size={IS_SHORT ? 76 : 68}>{top}</MemeText>
      <div style={{display: 'flex', flexDirection: IS_SHORT ? 'column' : 'row', alignItems: 'center', gap: 34}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <ChannelLogo size={120} style={{borderRadius: 60, border: '4px solid #fff'}} />
          <div style={{fontFamily: font, color: '#fff'}}>
            <div style={{fontSize: 46, fontWeight: 900}}>{CHANNEL.name}</div>
            <div style={{fontSize: 26, color: '#aaa'}}>{CHANNEL.tagline ?? ''}</div>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{position: 'relative'}}>
            <div style={{transform: `scale(${press})`, background: done ? '#3a3a3f' : '#ff0033', color: '#fff', fontFamily: font, fontWeight: 900,
              fontSize: IS_SHORT ? 52 : 40, padding: IS_SHORT ? '26px 60px' : '20px 44px', borderRadius: 60}}>{done ? 'Subscribed ✓' : 'Subscribe'}</div>
            {f < click + 30 && (
              // the cursor glides in from the lower right and lands on the button
              <svg width={70} height={70} viewBox="0 0 24 24" style={{position: 'absolute', left: `calc(55% + ${(1 - glide) * 420}px)`, top: `calc(45% + ${(1 - glide) * 280}px)`,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.6))'}}>
                <path d="M4 2l14 9-6 1.5L15 20l-3 1.5-3-7.5L4 18z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div style={{transform: `rotate(${ring}deg)`, transformOrigin: '50% 10%', opacity: done ? 1 : 0.35}}><Emo e="🔔" size={90} /></div>
        </div>
      </div>
      <div style={{opacity: done ? 1 : 0}}><MemeText size={IS_SHORT ? 58 : 50} color={C.amber}>{bottom ?? ''}</MemeText></div>
      <Sfx name="tick" at={click} v={0.6} />
      <Sfx name="ding" at={click + 4} v={0.45} />
    </div>
  );
};
