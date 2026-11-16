# Progress — "The Empire Built With Shovels" (Roman cartoon 3D short)

Branch: `claude/3d-animation-videos-skill-lmxz82`. Skill: `.claude/skills/3d-animation-videos/SKILL.md`.

## Done
- Script approved (`SCRIPT.md`), placeholder espeak/MBROLA voice: `voice/voice.wav` + `voice/words.json`
  (`python3 tools/make_voice.py`; needs `apt-get install espeak-ng mbrola mbrola-us2`). User will replace the narration later:
  drop in a new voice.wav + words.json (same schema, words carry `s` = sentence index) and re-render; every shot is anchored to words.
- Remotion project (`npm i` in this folder), main code `src/videos/rome/` (story.ts timeline/cameras, sets.ts scenery,
  world.ts, cast.ts + toon.ts characters), composition `RomeShort` 1080x1920, 2816 frames @ 30 fps.
- Sound finished by the sound agent: `cd audio && python3 score.py` (~30 s) -> `audio/mix.wav` (+ stems, cues.md).

## In progress (when this file was written)
- Three agents improving the picture in sandboxes (each edits only its own files):
  - camera -> `src/videos/rome_cam/story.ts`
  - characters -> `src/videos/rome_char/toon.ts`, `cast.ts`
  - scenery -> `src/videos/rome_world/sets.ts`, `world.ts`, `build.ts`, `paint.ts`, `lights.ts`, `shade.ts`, `grade.ts`
  Test stills: `ENTRY=src/sandboxes/<n>/index.tsx flock /tmp/render.lock node scripts/stills.mjs RomeShort out/<n>/x_ <frames> 0.5`

## Render (current)
- `setsid nohup scripts/queue_all.sh &` renders the preview, then the final, in resumable 200-frame chunks (`scripts/chunked.sh`,
  finished chunks in out/*/chunks are skipped on restart), then muxes `out/preview/preview.mp4` and `out/final/rome_short_1080x1920.mp4`.
- Fixed crash at shot swaps: R3F `dispose={null}` overwrote InkPass.dispose (Rome.tsx).

## Paused (user: "leave the project for now")
- Preview done and sent (out/preview/preview.mp4, not in git). Final 1080x1920 paused with frames 0-299 done in out/final/chunks
  (local only, lost if the container is reset). Resume: `setsid nohup scripts/queue_final_only.sh &` (~40 s/frame on 4 CPUs, ~28 h left).
- Camp shot opening camera re-aimed after the preview.

## Next steps (older)
1. Merge sandboxes: `python3 scripts/merge.py cam,char,world` (backs up main to backup/), then `npx tsc --noEmit` (TS2322 null-element errors in Rome.tsx are harmless).
2. Add a fast preview mode (smaller character canvases in cast.ts `tier()`, shadow map 1024, no MSAA/lens) — software WebGL is slow.
3. Low-res preview: `DPR=0.3334 node scripts/render.mjs out/preview/video.mp4 0.3334 "" 2`, then mux:
   `ffmpeg -i out/preview/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest out/preview/preview.mp4` and send to the user.
4. Time a short full-res range, decide 1080x1920 vs 1440x2560 (`--scale 1.3333`), final render + mux + QA (`scripts/short_qa.py`), send the mp4.
