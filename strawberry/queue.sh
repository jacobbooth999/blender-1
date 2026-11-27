#!/bin/bash
# Waits for the running strawberry render, then encodes it and renders/encodes the other fruits in turn.
cd "$(dirname "$0")"
while kill -0 ${WAITPID:-0} 2>/dev/null; do sleep 30; done
python3 anim.py --scale 0.6667 --samples 16 --out out/frames   # fills any gaps (resumable)
./make_video.sh strawberry
for f in peach watermelon kiwi; do
  python3 anim.py --fruit "$f" --scale 0.6667 --samples 16
  ./make_video.sh "$f"
done
echo ALLDONE
