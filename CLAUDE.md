# Project preferences

## Voiceover
The user's own reference recording is the voiceover. Use the audio they supply exactly as it is: don't clone it, re-voice it or synthesize a narrator.
- Build the video around that recording. Take word timings from the audio itself with sherpa-onnx parakeet-tdt-0.6b-v2 (GitHub releases, `asr-models/`), and write the script from what is actually said.
- Mux the original audio track untouched. It already carries its own music, so don't add a score over it.
- Current reference: the "heart meter" TikTok narration, used in `heart-town/` (`heart-town/audio/reference.m4a`, local only, not in git).
- If the user asks for narration but gives no recording, ask them for one instead of generating a voice.
