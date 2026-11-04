#!/bin/sh
# Builds public/music/bed.mp3: an original lo-fi loop (make-music.py) stretched to the video length, warmed, faded.
# Usage: sh scripts/music-bed.sh <seconds>
set -e
cd "$(dirname "$0")/.."
SECS=${1:?usage: music-bed.sh <seconds>}
mkdir -p public/music out
python3 scripts/make-music.py out/loop.wav
ffmpeg -v error -y -stream_loop -1 -i out/loop.wav -af "lowpass=f=4200,highpass=f=40,aecho=0.8:0.5:120:0.18,atrim=0:$SECS,afade=t=in:d=2,afade=t=out:st=$((SECS-4)):d=4,loudnorm=I=-20:TP=-2" -ar 44100 -ac 2 -b:a 160k public/music/bed.mp3
echo "public/music/bed.mp3 ($SECS s)"
