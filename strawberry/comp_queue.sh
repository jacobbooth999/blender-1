#!/bin/bash
# Render all compilation segments (resumable), then build the ASMR track and the final mp4.
cd "$(dirname "$0")"
for i in 0 1 2 3; do python3 short.py --index $i --scale 0.6667 --samples 16; done
python3 comp_audio.py
ffmpeg -y -loglevel error -framerate 24 -i out/comp/frames/f%04d.png -i out/comp/audio.wav \
  -vf "scale=720:1280:flags=lanczos" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \
  -af "loudnorm=I=-15:TP=-1.0:LRA=9" -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart \
  out/fruit_asmr_compilation.mp4
echo ALLDONE
