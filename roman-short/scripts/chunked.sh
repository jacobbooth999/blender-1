#!/bin/bash
# usage: COMP=.. FAST=.. DPR=.. scripts/chunked.sh <outdir> <scale> <totalFrames> <chunk> <conc>
# Renders resumable chunks (skips finished ones), then concatenates to <outdir>/video.mp4.
cd /home/user/blender-1/roman-short
OUT=$1; SCALE=$2; TOTAL=$3; CH=$4; CONC=$5
mkdir -p $OUT/chunks; : > $OUT/list.txt
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); ((b>=TOTAL)) && b=$((TOTAL-1))
  f=$(printf "$OUT/chunks/c%05d.mp4" $a)
  echo "file 'chunks/$(basename $f)'" >> $OUT/list.txt
  for try in 1 2 3; do
    [ -s "$f" ] && break
    echo "chunk $a-$b try $try $(date -u +%T)"
    node scripts/render.mjs "$f.tmp.mp4" $SCALE $a-$b $CONC > $OUT/chunk.log 2>&1 && mv "$f.tmp.mp4" "$f"
    pkill -f chrome-headless; rm -rf /tmp/remotion-webpack-bundle-*
  done
  [ -s "$f" ] || { echo "FAILED chunk $a"; exit 1; }
done
ffmpeg -y -loglevel error -f concat -safe 0 -i $OUT/list.txt -c copy $OUT/video.mp4 && echo "done $(date -u +%T)"
