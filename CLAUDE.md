# Project preferences

## Voiceover
Whenever the user asks for a voiceover or narration, use the **Adam** voice they supplied, unless they say otherwise. The sample is `voices/adam/voice-adam.m4a`, and `voices/adam/transcript.txt` holds what it says.
- The sample is only 4.3 s, so narration is a zero-shot clone of it. Follow the pipeline in `voices/adam/README.md`: full-precision ZipVoice, 32 steps, an espeak English lexicon, one sentence at a time, and an ASR check of every line.
- Plain voice: no effects. Normalize loudness only.
- Previous voices are no longer the default: Casual YouTuber (Kokoro) and the heart-meter TikTok narrator.
