# Project preferences

## Default voiceover voice
Whenever the user asks for a voiceover or narration, use the **Reference voice** (a clone of the narrator in the user's reference TikTok) unless they say otherwise:
- Zero-shot ZipVoice through sherpa-onnx. See `letter-town/voice/make_voice_clone.py` for the working pipeline.
  - Models and the prompt clip are in `lie-town/voice/models/zipvoice/` (local only, not in git). The prompt is `ref_prompt.wav`, the first 8.46 s of the reference.
  - Prompt text: "In this town, every time your heart gets broken, you get a million dollars. That's why the richest people here are the loneliest. And my family, we're the poorest in town."
  - `num_steps=4` and `speed=1.0`. The speed option breaks on short lines, so time-stretch instead (compress only).
  - The packaged lexicon covers only Chinese. Write espeak en-us IPA entries for every English word into `lexicon_en.txt`, as the script does.
- If the models are missing, download them from the k2-fsa/sherpa-onnx GitHub releases:
  - `tts-models/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia.tar.bz2`
  - `vocoder-models/vocos_24khz.onnx`
  The reference clip itself is the user's upload.
- Plain voice, with no effects. Normalize loudness only.
- Previous default: "Casual YouTuber", Kokoro 50/50 `am_puck` + `am_liam` at speed 1.18 (see `lie-town/voice/make_voice.py`).
