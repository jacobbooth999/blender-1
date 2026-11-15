#!/bin/bash
cd /home/user/blender-1/roman-short
COMP=RomePreview FAST=1 DPR=0.3334 scripts/chunked.sh out/preview 0.3334 1408 200 3 > out/preview/log.txt 2>&1
ffmpeg -y -loglevel error -i out/preview/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/preview/preview.mp4
scripts/chunked.sh out/final 1 2816 200 3 > out/final/log.txt 2>&1
ffmpeg -y -loglevel error -i out/final/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/final/rome_short_1080x1920.mp4
