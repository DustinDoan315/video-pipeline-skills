import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import DATA from './data/video.json';
import FILES from './data/files.json';
import {resolve} from './timing-core.mjs';
import {IS_SHORT, fit} from './layout';
import {Bars, Beat, Big, C, Card, Center, Check, Code, Curve, Label, MONO, Pop, Source, Steps, Terminal} from './ui';

const COLORS: Record<string, string> = {amber: C.amber, mint: C.mint, red: C.red, blue: C.blue, white: '#fff', dim: C.dim};
const col = (c?: string) => (c ? COLORS[c] ?? c : '#fff');

// Values starting with "$" come from src/data/video.json, so no number is typed into a scene.
const val = (v: unknown) => resolve(DATA, v);
const fileText = (s: {text?: string; file?: string}) => {
  if (s.file) {
    const t = (FILES as Record<string, string>)[s.file];
    if (t === undefined) throw new Error(`src/data/files/${s.file} not collected; run npm run collect`);
    return t;
  }
  return s.text ?? '';
};

export type VisualSpec = {source?: string} & (
  | {kind: 'title'; text: string; sub?: string; color?: string}
  | {kind: 'big'; text: string; color?: string}
  | {kind: 'steps'; items: string[]; active?: number; loop?: boolean}
  | {kind: 'check'; items: string[]}
  | {kind: 'cards'; items: {title: string; sub?: string; color?: string}[]}
  | {kind: 'stat'; items: {value: string | number; label: string; color?: string}[]}
  | {kind: 'bars'; items: {label: string; value: string | number; color?: string}[]}
  | {kind: 'curve'; points: string | number[][]; durationSec: string | number; marks?: {x: number; label: string}[]; title?: string}
  | {kind: 'code'; title: string; text?: string; file?: string; hl?: [number, number][]; size?: number}
  | {kind: 'terminal'; title?: string; text?: string; file?: string; size?: number}
  | {kind: 'cmd'; lines: string[]}
  | {kind: 'image'; src: string; caption?: string}
  | {kind: 'clip'; src: string; startSec?: number; caption?: string}
);

const One: React.FC<{s: VisualSpec}> = ({s}) => {
  switch (s.kind) {
    case 'title':
      return <Center gap={24}><Big size={IS_SHORT ? 96 : 110} color={col(s.color)}>{s.text}</Big>{s.sub && <Label size={38}>{s.sub}</Label>}</Center>;
    case 'big':
      return <Center><Big size={IS_SHORT ? 88 : 96} color={col(s.color)}>{s.text}</Big></Center>;
    case 'steps':
      return <Center><Steps items={s.items} active={s.active} loop={s.loop} size={s.items.length > 6 ? 34 : 44} /></Center>;
    case 'check':
      return <Center><Check size={44} items={s.items.map((text, i) => ({text, at: i * 12}))} /></Center>;
    case 'cards':
      return (
        <Center row gap={40}>
          {s.items.map((c, i) => (
            <Pop key={c.title} d={i * 8}><Card w={IS_SHORT ? fit(900) : Math.min(620, 1600 / s.items.length - 40)} color={col(c.color)} style={{textAlign: 'center'}}>
              <Big size={64} color={col(c.color)}>{c.title}</Big>{c.sub && <Label size={30}>{c.sub}</Label>}
            </Card></Pop>
          ))}
        </Center>
      );
    case 'stat':
      return (
        <Center row gap={50}>
          {s.items.map((c, i) => {
            const v = val(c.value);
            return (
              <Pop key={c.label} d={i * 8}><Card w={IS_SHORT ? fit(900) : Math.min(520, 1600 / s.items.length - 50)} color={col(c.color)} style={{textAlign: 'center'}}>
                <Big size={110} color={col(c.color)}>{typeof v === 'number' ? v.toLocaleString('en-US') : String(v)}</Big><Label size={30}>{c.label}</Label>
              </Card></Pop>
            );
          })}
        </Center>
      );
    case 'bars': {
      const items = s.items.map((b, i) => ({label: b.label, value: Number(val(b.value)), color: col(b.color ?? [C.amber, C.blue, C.mint, C.red][i % 4])}));
      return <Center><Bars items={items} max={Math.max(...items.map((b) => b.value))} d={10} /></Center>;
    }
    case 'curve':
      return (
        <Center gap={10}>
          {s.title && <Label size={30} color="#fff">{s.title}</Label>}
          <Curve pts={val(s.points)} dur={Number(val(s.durationSec))} w={fit(1400)} h={IS_SHORT ? 620 : 560} marks={(s.marks ?? []).map((m) => ({...m, d: 40}))} />
        </Center>
      );
    case 'code':
      return <Center><Code text={fileText(s)} title={s.title} size={s.size ?? (IS_SHORT ? 24 : 26)} w={fit(1600)} maxH={IS_SHORT ? 860 : 640} hl={s.hl} hlFrom={20} /></Center>;
    case 'terminal':
      return <Center><Terminal text={fileText(s)} title={s.title} w={fit(1600)} size={s.size ?? (IS_SHORT ? 24 : 26)} /></Center>;
    case 'cmd':
      return (
        <Center>
          <Card w={IS_SHORT ? fit(1000) : undefined} style={{fontFamily: MONO, fontSize: IS_SHORT ? 34 : 44, lineHeight: 1.7, padding: '26px 44px', wordBreak: 'break-all'}}>
            {s.lines.map((l) => <div key={l}><span style={{color: C.dim}}>$ </span><span style={{color: C.fn}}>{l}</span></div>)}
          </Card>
        </Center>
      );
    case 'image':
      return <Center gap={16}><Pop><Img src={staticFile(s.src)} style={{maxWidth: fit(1500), maxHeight: IS_SHORT ? 860 : 620, borderRadius: 16, border: `3px solid ${C.line}`}} /></Pop>{s.caption && <Label size={28}>{s.caption}</Label>}</Center>;
    case 'clip':
      return (
        <Center gap={16}>
          <OffthreadVideo src={staticFile(s.src)} startFrom={Math.round((s.startSec ?? 0) * 30)} muted style={{maxWidth: fit(1400), maxHeight: IS_SHORT ? 860 : 620, borderRadius: 16}} />
          {s.caption && <Label size={28}>{s.caption}</Label>}
        </Center>
      );
  }
};

/** Each visual shows from its caption index until the next visual's index. */
export const Visuals: React.FC<{specs: Record<string, VisualSpec>}> = ({specs}) => {
  const keys = Object.keys(specs).map(Number).sort((a, b) => a - b);
  return (
    <>
      {keys.map((k, i) => (
        <Beat key={k} a={k} b={keys[i + 1]} sfx={i ? 'pop' : undefined}>
          <One s={specs[String(k)]} />
          {specs[String(k)].source && <Source>{specs[String(k)].source}</Source>}
        </Beat>
      ))}
    </>
  );
};
