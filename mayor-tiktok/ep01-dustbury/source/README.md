Source for Dustbury EP.1. Built with lemo-opuscar (github.com/lemomo-ai/lemo-opuscar): copy this folder to `films/dustbury/` in a clone, then
`node core/render/events.mjs films/dustbury --size 1080x1920`, `.venv/bin/python films/dustbury/mix.py`,
`node core/render/video.mjs films/dustbury --fps 24 --workers 3 --size 1080x1920 --out films/dustbury/out/video24.mp4`,
`sh core/render/mux.sh films/dustbury/out/video24.mp4 films/dustbury/mix.wav dustbury-ep1.mp4 24 0`.
Voice: Kokoro am_adam (`core/tts/tts.py lines.json voices`), word timings from `timing.py`.
