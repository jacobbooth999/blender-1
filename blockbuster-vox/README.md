# The Rise and Fall of Blockbuster Video (paper-collage documentary)

A 5 minute, 16:9 documentary in an editorial paper-collage style: aged newsprint,
halftone photo cutouts with scissor-cut borders, torn headline strips, typewriter
slips, rubber stamps, masking tape and red thread. Every beat (about 4 s, one line of
narration) builds itself in stop-motion steps on a locked camera, then holds as a
living poster. Sound is paper SFX and faint room tone only, with no music.

## Layout
- `narration/narration.txt`: full script (767 words, written for a TTS voice)
- `narration/beats.json`: 78 beats B001 to B078 with timecodes and exact lines
- `src/lib.py`: collage engine (textures, halftone, cut edges, icons, animation)
- `src/scenes.py`: one scene function per beat
- `src/render.py`: renders beats in parallel (`sheet`, `beats N..`, `all`)
- `src/tts.py`: per-beat narration with Kokoro, writes `build/durations.json`
- `src/audio.py`: synthesizes SFX, mixes voice, muxes `out/blockbuster_vox.mp4`
- `assets/`: source photos, fonts (OFL), Natural Earth outlines

## Build
```
pip install kokoro-onnx soundfile pyshp
python3 src/tts.py /path/to/kokoro-models am_michael   # optional: real timing
python3 src/render.py all
python3 src/audio.py
```
Without `tts.py`, beats are timed at 2.5 words per second and the video has SFX only.
To use your own voice-over, put one WAV per beat in `narration/voice/B001.wav` and so on,
write the beat lengths to `build/durations.json`, then re-render.
