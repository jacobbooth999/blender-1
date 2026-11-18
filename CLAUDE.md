# Project preferences

## Default voiceover voice
Whenever the user asks for a voiceover or narration, use the **Casual YouTuber** voice unless they say otherwise:
- Kokoro TTS (`kokoro-onnx`, model files in `lie-town/voice/models/`), a 50/50 blend of `am_puck` and `am_liam`, speed 1.18, lang `en-us`:
  `style = .5 * k.get_voice_style('am_puck') + .5 * k.get_voice_style('am_liam')`
- Plain voice: no robotic effect, no emphasis gain. Normalize loudness only.
- Direction: young adult male, casual and natural, fast and punchy, lively without shouting, light natural emphasis
  on surprising words, slightly playful on absurd moments, like a storytime creator talking to the viewer.
- Reference demo: `lie-town/out/demos/3_casual_youtuber.mp3` (local only, not in git).
