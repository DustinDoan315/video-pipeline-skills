#!/bin/sh
# Normalizes a rendered video's audio to -16 LUFS (YouTube-friendly) without re-encoding the picture.
# Usage: sh scripts/finish-audio.sh out/raw.mp4 out/video.mp4
set -e
ffmpeg -v error -y -i "$1" -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k "$2"
ffmpeg -v info -i "$2" -af ebur128 -f null - 2>&1 | grep -E " I:" | tail -1
