# Style guide: blocky "what if" story shorts

Based on a frame-by-frame study of three reference TikToks (Nov 2026): 4.6 min total and about 190 shots.

| | Ref 1 | Ref 2 | Ref 3 |
|---|---|---|---|
| Length | 87 s | 63 s | 124 s |
| Shots | 67 | 43 | 81 |
| **Average shot** | **1.3 s** | **1.5 s** | **1.5 s** |
| Premise | A town where you pay for every breath of air | A town where your love shows as a "heart meter" | A town where a dead grandpa comes back to visit once a year |
| Look | Roblox characters, shiny realistic lighting | Simpler, chunkier Roblox look, cartoon lighting | Lego-style yellow heads, soft lighting |

All three were 576×1024 vertical at 30 fps. For our renders, use 1080×1920 at 30 fps.

## 1. Story formula
- **The premise is a "what if" rule about the world** that can be shown visually, like paying to breathe or love you can measure.
- **The cast is small:** a hero family, one villain who profits from the rule, and a few background extras.
- **Story beats:**
  - **0–3 s, hook.** State the rule over a striking image (money raining down, a sunset street, a badge close-up). The first spoken words are something like "In this town…".
  - **Everyday life under the rule.** Show how it shapes home, school and the shop.
  - **Crisis.** The family hits zero (account empty, someone collapses, a plan gets cancelled).
  - **Villain reveal.** A fast montage of charts, screens and smug faces.
  - **Emotional climax.** Tears, a sacrifice or a reunion.
  - **Ending.** A twist, or an interactive question card ("HELP HIM? YES or NO").
- **Running time:** 60–125 s.

## 2. Characters
- **Roblox-style bodies:** a cube torso, rectangular arms and legs, and a cylinder head. Hair, hats and beanies are separate chunky pieces stuck on top. A Lego-style yellow-head version also works.
- **Faces are flat drawings on the head**, and they carry all the emotion. Swap face textures for each expression:
  - **Shock:** huge white eyes with tiny pupils and an open black "O" mouth
  - **Joy:** squinty closed eyes and a wide toothy grin
  - **Smug villain:** half-lidded eyes, one raised brow and a crooked smirk
  - **Sad:** worried brows and big cartoon blue tears (all three references use these)
  - **Worried:** a small frown and eyes looking off to the side
- **Bodies move very little.** Walks are a stiff arm-and-leg swing.
  - The main poses are arms up in panic, arms out wide, a hand to the face, holding up a prop, and slumping.
  - Acting comes from changing the face, not from body animation.
- **Each character has one flat outfit colour so you can tell them apart:**
  - hero: lime green
  - villain: black suit, or purple coat with a top hat
  - mum: red
  - little sister: pink
- **The story's rule is something you can see on the character**, like a neck badge showing a balance ("AIR R$ 250") that turns red at zero, or a wall meter. Cut to close-ups of it often, because it works like on-screen data.

## 3. Camera
- **About 60% are tight shots:** face close-ups at chest height, and extreme close-ups on props (badge, phone screen, test paper, meter, briefcase).
- **Open each new location with a 1–2 s wide shot** (street, school, company building at sunset, house at night).
- **Use over-the-shoulder shots for conversations.**
- **The camera is never fully still.** Every shot has a slow push-in, a pull-back or a tracking move.
  - Walks: the camera backs away in front of the character at walking pace.
  - Vehicles: pan with them as they go past.
- **Angle shows status:** low angle for villains and the rich, high or straight-on for the poor and sad.
- **Add a phone-camera feel:** subtle handheld wobble, an occasional whip-pan or motion-blur transition, and quick push-ins on reaction faces.
- **Use shallow depth of field everywhere:** soft background and a sharp subject.

## 4. Editing and pacing
- **Cut roughly every 1.3–1.5 s on average, often every 2–4 spoken words.** Many shots last under 1 s, and reaction cuts can be 0.2–0.8 s.
- **Hard cuts only. No crossfades.**
- **Cut on the key noun.** A new image appears as the narrator says it ("oxygen" → air tank, "profits" → chart, "ten million dollars" → briefcase).
- **Speed up into the crisis and villain montages**, with bursts of cuts about 0.6 s apart.
- **End on the channel end slate.**

## 5. Colour and lighting
- **Saturated, primary colours throughout:** lime green, fire-engine red, sky blue, hot pink, yellow and orange, against clean pastel buildings.
- **Give each scene or mood its own light:**
  - golden-hour orange for streets and sunsets
  - deep blue and purple for night, with rain, wet roads that reflect light, and glowing windows
  - warm lamp-lit interiors
  - snowy blue-white for grief or winter
- **Add a soft glow around bright things** like signs, headlights, money, meters and screens. Keep shadows soft.
- **Let the weather and particles carry the mood:** money confetti for wealth, rain for loneliness, snow for grief, and floating hearts for love.
- **On-screen graphics:** chunky glowing UI boards (price signs like "1 R$ / BREATH", a green profit chart climbing with a "RECORD YEAR" arrow) and big glowing numbers ("100%", "42%", "$10,000,000").

## 6. Captions
- **One word at a time**, matched to the narration's word timings.
- **Position:** centred horizontally, about 30–35% down from the top of the frame, just above the middle.
- **Each word pops in.** Scale it from about 60% to 100% over 2–3 frames (an ease-out with a tiny overshoot is fine). Hold it until the next word, with no fade-out.
- **Pick one style per channel and keep it:**
  - **A, clean:** white, bold rounded font (Montserrat or Poppins ExtraBold), soft dark drop shadow, all lowercase
  - **B, cartoon:** yellow, heavy cartoon font (like Lilita One), dark outline
  - **C, storybook:** white with an outline, normal capitalisation
- **Use separate title cards for key ideas** (not the subtitles), shown together with the word captions:
  - a time jump at the top of the frame ("LAST NIGHT")
  - a stamp ("DUMPED x1000" in red)
  - a big number ("20 YEARS")
  - a calendar with the key date circled
- **Leave the bottom-right corner clear for the platform watermark.**

## 7. Audio
- **Default narrator voice:** the "Reference voice", a ZipVoice clone of the narrator in the user's reference TikTok (see `CLAUDE.md` and `letter-town/voice/make_voice_clone.py`).
- **Narration runs non-stop** from the first frame to the last, in an intimate storytelling tone.
- **Music:** quiet, emotional piano or soft beats, ducked under the voice.
- **Small sound effects on the key beats** (cash, a heartbeat, rain, a stamp hit).
- **Loudness:** about −14 to −15 LUFS overall (two of the references measured −14.7 and −14.8).

## 8. Quick checklist
- [ ] The hook image and the rule are both in the first 3 s
- [ ] Average shot length is 1.3–1.5 s, with hard cuts only
- [ ] Every shot has camera motion
- [ ] Faces change for every emotional beat, and tears appear at the climax
- [ ] The story's rule is visible on screen (badge or meter) and gets close-ups
- [ ] Each scene has its own lighting
- [ ] Captions are one word at a time, pop in, and sit about 30–35% down from the top
- [ ] There's at least one title card or stamp graphic
- [ ] The ending has a twist or an interactive question
