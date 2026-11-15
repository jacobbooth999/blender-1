#!/bin/bash
# waits for the preview to finish, then renders the final 1080x1920 (detached so it survives the shell)
cd /home/user/blender-1/roman-short
until grep -q "^done\|rror" out/preview/log.txt; do sleep 30; done
pkill -f chrome-headless; rm -rf /tmp/remotion-webpack-bundle-*
node scripts/render.mjs out/final/video.mp4 1 "" 3 > out/final/log.txt 2>&1
