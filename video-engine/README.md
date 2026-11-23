# Matchday Chronicle video engine

Turns a story file (`story.json`) into a 1920×1080 newspaper-style video, with narration, captions, music and sound effects.

## Pipeline
1. **Write `story.json`.** It holds a list of scenes, and each scene has:
   - a `type`: `stat`, `clip`, `front`, `file`, `quote`, `map`, `title`, `chapter` or `verdict`;
   - the narration line `vo`;
   - its content, where `[[id|text]]` marks text to highlight;
   - `cues`, which map each highlight id to the spoken phrase that triggers it.
2. `python3 photos.py`: assigns the downloaded Wikimedia photos to scene slots and writes `credits.js` and `CREDITS.md`.
3. `python3 voice.py`: generates the narration with Piper and writes `timeline.json`/`timeline.js` (scene starts, cue times and per-word timings for captions).
4. `node maps.mjs`: precomputes the route maps from Natural Earth data via `world-atlas`.
5. `node stills.js 0 12.5 40`: renders preview stills at those times, in seconds.
6. `for i in 0 1 2 3; do node render.js $i 4 & done`: renders the frames to `frames/`.
7. `python3 audio.py`: builds the music (changing mood per chapter), the sound effects and the ducked narration into `mix.wav`.
8. Encode:
   `ffmpeg -framerate 30 -i frames/f%05d.jpg -i mix.wav -c:v libx264 -crf 22 -tune grain -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out.mp4`

## Built in (from the retention review)
- Frame 0 is always a finished image: the first card shows with no drop-in or fade.
- The hook comes first, then the title card.
- Burned-in captions, 3 words at a time, with key words in yellow.
- A punch zoom on every highlight, and full-screen photo moments.
- Count-up stats, an animated route map, and chapter cards with a progress label.
- Risers into reveals, and music that changes with each chapter.

To change the voice, set the `VOICE` environment variable to another Piper `.onnx` model. You can also replace `vo_full.wav` with your own recording; if you do, re-time it in `voice.py`.
