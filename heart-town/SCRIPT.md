# Heart Town

This video is built entirely around the narration recording the user supplied, which plays untouched as the soundtrack.
- `audio/reference.m4a` is the original audio. It's local only and not committed.
- `voice/words.json` holds the word start times, measured from that audio with parakeet-tdt. They drive the captions and the cuts.

**Story beats:**
- The rule: a broken heart pays a million dollars, so the rich are the loneliest.
- Marlon's family is the poorest in town, because his parents have never broken up.
- **The heart meters:** one on every wall. A neighbour's meter cracks to 0% and money rains down. The family's meter has always been full.
- **Last night:** Mr. Vail ("dumped x1000") arrives in a golden limousine and puts a briefcase on the kitchen table: "$10,000,000. Break up with her tonight."
- **The meter falls:** Marlon watches from the stairs. Dad hesitates, and the meter drops 80%, 50%, 20%.
- **Dad's choice:** he throws the briefcase out of the window, "Get out of my house!", and the meter shoots back to full.
- **This morning:** Vail knocks again, this time holding a rose, asking how to fall in love.
- **End card:** "HELP HIM? YES or NO".

Render: `node render.mjs video out/parts/h1.mp4 0 939 1080 1920` and `... h2.mp4 939 1878`. Then concat the two parts and mux with `audio/reference.m4a`.

Setup: `ln -s ../lie-town/node_modules node_modules` (three.js and fonts are shared with lie-town).
