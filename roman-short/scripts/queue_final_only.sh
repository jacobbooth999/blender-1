#!/bin/bash
cd /home/user/blender-1/roman-short
FIRST=200 scripts/chunked.sh out/final 1 2816 100 3 >> out/final/log.txt 2>&1
ffmpeg -y -loglevel error -i out/final/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/final/rome_short_1080x1920.mp4
