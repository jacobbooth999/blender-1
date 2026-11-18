# Project preferences

## Voiceover
Whenever the user asks for a voiceover or narration, use the **Adam** voice they supplied, unless they say otherwise. The sample is `voices/adam/voice-adam.m4a`, and `voices/adam/transcript.txt` holds what it says.
- The sample is only 4.3 s, so narration is a zero-shot clone of it. Follow the pipeline in `voices/adam/README.md`: full-precision ZipVoice, 32 steps, an espeak English lexicon, one sentence at a time, and an ASR check of every line.
- Plain voice: no effects. Normalize loudness only.
- Previous voices are no longer the default: Casual YouTuber (Kokoro) and the heart-meter TikTok narrator.

## Character faces
Characters use the user's template face set by default: the 24 faces from their face sheet, `t1`–`t24` in
`fight-town/src/tex.js` (`templateFaceTex`, numbered like the sheet). Named expressions map onto them through `FACE_MAP`
(neutral 4, smile 1, grin 3, laugh 21, shock 15, sad/cry 16, happycry 21, worried 2, angry 9, determined 8, smug 12,
tongue 17, talk 6; cry/happycry add tears). Only `sick` (X eyes) and `greedy` ($ eyes) keep their own drawings; `classic:<name>`
gives the old face. Copy `tex.js` from the latest project when starting a new one. Preview: `PAGE=src/faces.html node render.mjs stills ...`.
