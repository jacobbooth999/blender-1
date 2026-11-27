#!/bin/bash
# Encode one fruit's frames + synthesized ASMR audio into an mp4.  Usage: ./make_video.sh <fruit>
set -e
cd "$(dirname "$0")"
f=${1:-strawberry}
if [ "$f" = strawberry ]; then d=out; else d=out/$f; fi
python3 audio.py "$f"
ffmpeg -y -loglevel error -framerate 24 -i "$d/frames/f%04d.png" -i "$d/audio.wav" \
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 256k -ar 48000 \
  -shortest -movflags +faststart "out/${f}_asmr.mp4"
echo "VIDEO out/${f}_asmr.mp4"
