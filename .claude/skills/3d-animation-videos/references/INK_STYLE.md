# 2D "ink explainer" style: study notes (2026-11-24)

Private style study of a popular long-form history explainer channel. Sources: 8 video thumbnails and ~270 storyboard
frames (one every 5 s) from two videos, viewed through YouTube's public thumbnail and storyboard images.
Copy the LOOK only. Never reuse their protagonist design, scripts, jokes, thumbnails, title cards or channel name.
Our characters, stories and wording are always our own.

## Format
- Landscape 16:9 long-form, 6-21 min (median ~11 min). Topics: ancient humans, evolution, "how would YOU survive".
- Second-person narration ("you") with a recurring modern stick-figure protagonist dropped into past eras,
  plus third-person scenes of ancient people.
- The image changes at almost every 5 s storyboard sample, so a new drawing appears every ~3-5 s. Mostly static
  framing (any motion is small: limbs, effects, slow push).

## Characters
- Stick figures. A big round WHITE head (diameter ~0.25-0.3 of the figure's height). A single black ink line for the
  spine, arms and legs, with no hands or feet drawn (a modern character gets filled sneakers).
- Face: two small dot eyes, short brows that carry the emotion, small line mouth (open D-shape when shouting).
  Big expressions: squeezed eyes (> <), sweat drops, gritted teeth.
- Ancient people: messy scribbled dark-brown hair (many loose strokes), fur pelts as flat brown shapes with ragged
  edges and short ink fur marks. Modern protagonist: filled clothes over the stick body.
- Line: thin near-black ink (~0.5-0.7 % of frame height), slightly wobbly and hand-drawn, round caps, no line weight
  drama.

## Backgrounds
- Digitally painted illustrations: flat fills with soft gradients (sky top-to-horizon, ground) and light texture,
  thin ink outlines on main forms (trees, rocks, huts, animals), fine detail strokes (grass tufts, bark lines).
- Natural, slightly muted palette: savanna ochre/yellow, pale cyan sky, snow grey-white, dusk orange, night navy,
  cave grey-brown, interior beige wall + brown floor.
- Animals are drawn more naturally than the people (real proportions, flat colour, ink outline, a few texture strokes).

## Cards (between scenes)
- Off-white paper (#fbfaf5) with hand-lettered all-caps text in black, accents in red (#d0453a) and blue (#3d6fb6).
- Big one-word title cards in a bold condensed hand-lettered face ending with a period ("THE COLD." style), sometimes
  with a small colour icon.
- Infographics: simple icons in rounded boxes, ✓ / ✗ marks, dashed dividers, arrows, hourglass counters, flat-colour
  maps with a red pin, a horizontal timeline arrow.

## Effects
- Wind lines, dashed "cold" outline arrows around a body, motion arcs, smoke curls, sweat drops, stars when dazed,
  red X marks.

## Thumbnails
- One character close-up with an extreme expression, a bright painted background, 1-3 huge words in yellow or white
  with a thick black outline, often ending in "?".

## Our implementation
- `roman-short/src/videos/ink/`: ink2d.ts (wobbly ink lines, fills, fur, hair, text), figure.ts (stick people),
  dog2d.ts (ink-style dogs, side and face-on), scenes.ts (painted backgrounds and shots), render script
  `scripts/ink-stills.mjs`.
- Fonts (npm @fontsource, OFL): Patrick Hand (card text), Gochi Hand (labels), Bangers (titles/thumbnails).
