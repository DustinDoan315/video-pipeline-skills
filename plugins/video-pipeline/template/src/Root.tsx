import React from 'react';
import {Audio, Composition, Sequence, Series, staticFile} from 'remotion';
import {parseMedia} from '@remotion/media-parser';
import S from './data/script.json';
import {FPS, computeTakes, type Take} from './timing-core.mjs';
import {Frame, TakeCtx} from './ui';
import {Meme} from './memes';
import {Visuals} from './visuals';
import {CUSTOM} from './custom';

type Props = {voiceSec: Record<string, number> | null};
const script = S as unknown as {timing?: 'text' | 'voice'; music?: string; musicVolume?: number; takes: {id: string}[]};

const TakeScene: React.FC<{t: Take; i: number; total: number}> = ({t, i, total}) => {
  const Custom = CUSTOM[t.id];
  return (
    <TakeCtx.Provider value={t.cues}>
      <Frame chapter={t.chapter} n={i + 1} total={total} stickers={t.stickers}>
        {Custom ? <Custom /> : <Visuals specs={t.visuals} />}
        {Object.entries(t.memes).map(([k, m]) => {
          const c = t.cues[Number(k)];
          return <Sequence key={k} from={c.from} durationInFrames={c.dur} layout="none"><Meme m={m} /></Sequence>;
        })}
      </Frame>
    </TakeCtx.Provider>
  );
};

const Video: React.FC<Props> = ({voiceSec}) => {
  const takes = computeTakes(S, voiceSec);
  return (
    <>
      {script.music && <Audio src={staticFile(script.music)} volume={script.musicVolume ?? 0.35} loop />}
      <Series>
        {takes.map((t, i) => (
          <Series.Sequence key={t.id} name={t.id} durationInFrames={t.frames}>
            <TakeScene t={t} i={i} total={takes.length} />
            {voiceSec && <Audio src={staticFile(`vo/${t.id}.wav`)} />}
          </Series.Sequence>
        ))}
      </Series>
    </>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Video"
    component={Video}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{voiceSec: null} as Props}
    calculateMetadata={async () => {
      // Voice mode: each take's audio file sets its length. Text mode: reading time does.
      const voiceSec = script.timing === 'voice'
        ? Object.fromEntries(await Promise.all(script.takes.map(async (t) => {
          const {durationInSeconds} = await parseMedia({src: staticFile(`vo/${t.id}.wav`), fields: {durationInSeconds: true}});
          return [t.id, durationInSeconds ?? 0];
        })))
        : null;
      const takes = computeTakes(S, voiceSec);
      return {durationInFrames: takes.reduce((a, t) => a + t.frames, 0), props: {voiceSec}};
    }}
  />
);
