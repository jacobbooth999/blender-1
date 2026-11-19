# Hunted in a Shopping Centre (74 s, 1920x1080, 24 fps)

Hand-drawn 2D characters in sketchy 3D sets, made with the Sketchbook Motion style. Final video: `hunted.mp4`.

- `engine.js`: the renderer (ink rig, costumes, IK props, 3D watercolour world, depth-sorted actors and sprites).
- `sets.js`: the 3D sets (mall corridor, clothing store, food court, escalator atrium, service corridor, car park, street).
- `shots.js`: 38 shots (cameras, poses, crowds, effects, sound cues).
- `film.html`: open in a browser to scrub or play the film live.
- `audio/make_voice.py`: Kokoro TTS voices (needs `pip install kokoro-onnx` + model files in `$TTS_DIR`).
- `audio/mix.py`: synthesized SFX and score, placed from the cue list -> `out/mix.wav`.

Rebuild:
```
node render.js cues out/cues.json && node render.js frames out/frames 1.2 24 4
python3 audio/mix.py
ffmpeg -framerate 24 -i out/frames/f%05d.jpg -i out/mix.wav -c:v libx264 -crf 25 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest hunted.mp4
```
