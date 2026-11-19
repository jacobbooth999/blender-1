# Sketchbook Motion — prototype

A simple, hand-drawn 2D character placed in a sketchy **3D** world.

- **Open `index.html`** in a browser to watch it play. It cycles through 5 activities; the buttons pick one.
- **Stills:** `stills/` (3200x1800). Re-render with `node render_stills.js [dpr]` (uses Playwright + Chromium).

## How the look is built
- **Character (2D rig):** bean body, noodle limbs, dot eyes. Ink outlines are tapered brush ribbons that don't quite close.
  The colour fill is printed slightly off the line, and there's a cel-shade crescent.
- **Line boil:** every drawing re-jitters every line, so the figure feels alive even when holding a pose.
- **Sharp motion:** the animation runs on 12s (each drawing held 2 frames). It moves pose-to-pose with long holds and 1-3 frame snaps,
  using overshoot easing. Smear and speed lines are traced automatically from the in-between positions, and impact bursts land on the hit frames.
- **Background (3D):** a real perspective camera with painter's-sorted geometry. It's painted as watercolour washes with
  pigment-pooled edges, pencil edges that overshoot the corners, cross-hatching on shadow faces, and atmospheric fog. Paper grain is multiplied over everything.
