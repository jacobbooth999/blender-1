# In This Town, You Have to Fight an Animal to Earn Your Food

Narrated in the user's default **Adam** voice (a zero-shot ZipVoice clone, `voice/make_voice.py`). Each "HUS!" is one clean take, spliced in three times at rising pitch. The finished narration runs 68.2 s.

## Script (first person, about 165 words)
> In this town, you fight animals for food. Scarier animal, better meal.
> Chicken? **HUS! HUS! HUS!** Sandwich. Goat? Burger. Crocodile? Steak. Bear? **HUS! HUS! HUS!** A feast.
>
> Me? They gave me a worm. Everyone laughed. And the worm almost won. It dodged. It slapped me. I cried.
> I won. Barely. My prize? One tiny piece of bread.
>
> Only Grandma believed in me. "The time will come eventually."
> I promised her I'd fight the strongest animal.
>
> So I started training. Punched trees. **HUS! HUS! HUS!** The tree won.
> I ran mountains. Lifted boulders. Fought bigger animals.
> Grandma kept saying, "The time will come eventually."
>
> Then came the final challenge: a gorilla as big as a building.
> Nobody stepped up. Except me. Everyone laughed. Grandma smiled.
>
> The gorilla smashed me into the ground. Then I heard Grandma. "The time will come eventually."
> I got up. **HUS! HUS! HUS!** The gorilla flew out of town.
>
> The biggest feast ever. I took it all to Grandma. "I told you the time would come eventually."
> Then something tapped my shoulder. The worm. It had been training too.

**End card:** "REMATCH? YES or NO".

## Build
1. `python voice/make_voice.py` writes `voice/voice.wav` and `voice/words.json`.
2. `node render.mjs events out/events.json`, then `python audio/make_audio.py`, then loudnorm to −14 LUFS, giving `audio/mix.wav`.
3. Render the video in two halves with `node render.mjs video out/parts/pN.mp4 <start> <end> 1080 1920`, concat them, then mux with `audio/mix.wav`.

Setup: `ln -s ../lie-town/node_modules node_modules`. The models live in `lie-town/voice/models/`; see `voices/adam/README.md`.
