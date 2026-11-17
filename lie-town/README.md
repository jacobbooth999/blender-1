# Lie Town (blocky "what if" short)

A 75 s vertical short (1080x1920, 30 fps) in the style of `style-guides/blocky-what-if-shorts.md`:
blocky Roblox-style characters, one-word pop captions, hard cuts about every 1.25 s (60 shots), saturated colours,
neck badges that show each person's lie money, title cards, and an end question card.

Story: in this town every lie earns money. Sam has never lied, so he is broke and laughed at. He spots a crack in the
dam; the mayor offers him $1,000,000 to tell the town it is safe. Sam goes live and tells the truth, and because
he never lies, everyone believes him and runs to the hill. The dam bursts, the mayor's gold mansion washes away, nobody is hurt,
and the town builds Sam a house and a statue. Script: `SCRIPT.md`.

## Pipeline
1. **Voice:** `python3 voice/make_voice.py` writes `voice/voice.wav` and `voice/words.json`. It uses the Kokoro neural
   TTS, with the narrator am_michael, the mayor bm_george and Sam am_adam. Before running it, download the model files
   into `voice/models/`. They come from the kokoro-onnx GitHub releases `model-files-v1.0`: kokoro-v1.0.onnx →
   kokoro.onnx, and voices-v1.0.bin → voices.bin. Each phrase is synthesized separately, and word times are estimated
   inside each phrase.
2. **Picture:** `src/`, plain three.js rendered frame by frame in headless Chromium.
   - `rig.js`: blocky rigs (box limbs on shoulder/hip pivots, a cylinder head with a canvas face decal, hair/hats,
     the money badge) and a pose library.
   - `tex.js`: canvas textures (13 faces, badges, signs, cheque, chalkboard, crack, plaque).
   - `sets.js`: the town (street, bakery alley + box house, gold mansion, dam above town, square with stage + TV camera,
     new house + statue at the east end), the interiors (classroom, kitchen, office), and the flood/dam-burst props.
   - `story.js`: the cast and the 60-shot timeline (cameras, poses, faces, badges, FX, overlays). Cut times come from `words.json`.
   - `main.js`: lights per shot, sky, shadows, depth of field + ACES + grade pass, coins/bills/rain, culling of props in
     the camera's sight line, captions, and title cards.
3. **Render:**
   - Stills: `node render.mjs stills out/x_ 15,300,900 540 960`
   - Video: `node render.mjs video out/parts/p1.mp4 0 1125 1080 1920` (about 2-5 s/frame on 4 CPUs; run two halves in parallel)
4. **Audio:** `python3 audio/make_audio.py` builds an original synthesized score that follows the story sections, plus
   SFX and voice ducking. Then normalize loudness:
   `ffmpeg -i audio/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 audio/mix.wav`
5. **Mux:** `ffmpeg -i video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest final.mp4`

Setup: `npm i`, then link the preinstalled Playwright: `ln -s /opt/node22/lib/node_modules/playwright node_modules/playwright`.
