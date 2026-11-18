# Letter Town — script

Style: `style-guides/blocky-what-if-shorts.md`. The voice is the default Casual YouTuber voice (`CLAUDE.md`).
Characters use the Roblox Dummy body (`lie-town/src/rig.js`) with clothes, hair and swappable faces.

1. In this town, every morning, everyone gets a letter from their future self.
2. "Buy gold today." / "Don't eat the fish on Tuesday." / "Do not marry Kevin."
3. Nobody here ever makes a mistake. Except Max. Max has never gotten a single letter. Every morning, his mailbox is empty.
4. He buys the wrong stocks, he eats the bad fish, and everyone thinks he's cursed.
5. **Twist:** Then one morning, his mailbox exploded. Hundreds of letters. All from future Max. And every single one
   said the same thing: "Do not let the mayor do what he's about to do."
6. So that night, Max sneaked into the mayor's mansion. He crawled past the guards, hid behind the curtains, and
   watched the mayor open his own letter. It said: "Burn the town to the ground." And the mayor always does what his letter says.
7. **Hardship:** Max ran to warn everyone. But who believes the cursed kid with no letters? The guards caught him and
   locked him in the basement. No letter could tell him what to do now. So for the first time, someone in this town
   had to figure it out alone.
8. **Climax:** He stacked the boxes, squeezed through the tiny window, and sprinted to the square. The mayor was striking
   the first match. Max dove. The match landed in a puddle. And the mayor's letter fell out of his pocket. The whole town read it.
9. **Resolution:** The mayor got the basement. Max got a parade. And the next morning, there was finally one letter
   in Max's mailbox. It said: "Told you."
10. End card: WOULD YOU OPEN YOUR LETTER? YES or NO

## Voice v2: cloned reference voice
At the user's request, the narration was re-voiced to match a reference TikTok narrator. This version uses zero-shot ZipVoice through sherpa-onnx, run by `voice/make_voice_clone.py`.
- **Prompt:** the first 8.46 s of the reference clip. This clip is local only, in `voice/models/zipvoice/ref_prompt.wav`.
- **Tokenizer fix:** the packaged lexicon only covers Chinese, so the script writes espeak en-us IPA entries for every English word.
- **Timing:** every line keeps its Kokoro start time and is only compressed (up to 1.19×) when it would run into the next line.
- **Captions:** they are re-timed from the new `words.json`.
- **Check:** the speaker-embedding (WeSpeaker) similarity between the clone and the held-out reference is 0.90. Kokoro's best blend reached 0.65.
The Kokoro timings are kept in `voice/words_kokoro.json`.
