import React from 'react';
import {Img, staticFile} from 'remotion';
import S from './data/script.json';

// Channel identity from script.json "channel": {name, tagline, logo (path in public/, optional)}.
export const CHANNEL = ((S as {channel?: {name: string; tagline?: string; logo?: string}}).channel) ?? {name: 'Your Channel'};

export const ChannelLogo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) =>
  CHANNEL.logo
    ? <Img src={staticFile(CHANNEL.logo)} style={{width: size, height: size, ...style}} />
    : <div style={{width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0078d4', color: '#fff',
        fontFamily: 'Helvetica, Arial', fontWeight: 900, fontSize: size * 0.42, ...style}}>
        {CHANNEL.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
      </div>;
