# Voice: Adam (the default voiceover)

This is the user's chosen narrator voice, saved on 2026-11-18. Use it for every voiceover unless they say otherwise.
- `voice-adam.m4a` is the user's sample: 4.3 s, mono 48 kHz, clean (no music), median pitch about 116 Hz.
- `transcript.txt` holds the exact words spoken in the sample. It's the prompt text the cloning model needs.

## How to narrate in this voice
Use a zero-shot clone with ZipVoice through sherpa-onnx (`pip install sherpa-onnx phonemizer espeakng-loader soundfile librosa`).
- **Models:** download from the k2-fsa/sherpa-onnx GitHub releases. HuggingFace is blocked here.
  - `tts-models/sherpa-onnx-zipvoice-zh-en-emilia.tar.bz2`: use the full-precision `text_encoder.onnx` and `fm_decoder.onnx`. The int8 or distilled models sound croaky.
  - `tts-models/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia.tar.bz2`: only for its `lexicon.txt`.
  - `vocoder-models/vocos_24khz.onnx`.
- **Prompt:** this sample resampled to 24 kHz mono, with `transcript.txt` as `prompt_text`.
- **Settings:** `num_steps=32`, `guidance_scale=1.0`, `speed=1.0`.
- **English lexicon:** the packaged lexicon only covers Chinese, so English words are silently skipped. Before generating, write an espeak en-us IPA entry for every word in the script, keeping only characters that appear in `tokens.txt`, and prepend these to `lexicon.txt`. Map "a" to `ə`, or it gets read as the letter name.
- **Script:** generate one sentence at a time. ZipVoice can drop a line's last word; if it does, regenerate that line with `speed=0.9`.
- **Retiming:** don't use the `speed` option on short lines (it breaks). Time-stretch with librosa instead.
- **Check every line:** read it back with parakeet-tdt (sherpa-onnx `asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8`) and redo any line with missing or wrong words.
