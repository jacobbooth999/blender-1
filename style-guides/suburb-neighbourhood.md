# Suburb neighbourhood set: "clean pastel low-poly town" style

Built from two reference frames the user supplied (a city street ending at a gold-domed city hall).
The look is kept and the city is swapped for a suburb. Code: `suburb-set/src/suburb.js` (`buildSuburb(scene)`),
preview harness `suburb-set/src/preview.js` (`PAGE=src/index.html node render.mjs stills out/s_ 0,1,2,3,4`).

## What defines the reference style
- **Light:** bright clean midday, sun high behind camera-left, soft short shadows, strong sky fill.
  No outlines, smooth shading, slight blue haze in the distance.
- **Sky:** mid-blue at the top fading to pale blue at the horizon; soft flat white clouds. Bright green rolling hills behind the town.
- **Buildings:** chunky low-poly boxes with crisp edges. Very pale pastel walls (lavender, mint, butter, icy blue, blush) with white trim:
  corner boards, bands, cornices, sills. Recessed windows with white frames and deep-blue glass with a pale diagonal reflection.
- **Street:** deep navy asphalt (not grey), yellow dashed centre line, thin white edge lines, pale grey kerbs, near-white sidewalks.
  Lumpy bright-green trees (clusters of faceted blobs, thin brown trunk), black street lamps with a curved arm and flat head,
  candy-coloured boxy cars.
- **Composition:** one-point perspective down the middle of the street to a centred white landmark with a gold dome and a flag.
  The camera is either high above the street or down at road level.

## Suburb version
- Two-storey houses (every 7th a single-storey ranch) with pitched shingle roofs (slate blue, brick red, teal, lilac, brown),
  lap siding, coloured shutters, porch with white columns, attached garage with a white panel door, chimney.
- Front lawns, white picket fences with gaps for the path and driveway, mailboxes, hedges and bushes, parked cars on driveways.
- Grass verge between the kerb and sidewalk holding street trees and lamps; fire hydrants.
- The street ends in a roundabout plaza with a fountain and a white school (Maple Grove School) with columns, a clock tower,
  a gold dome and a flag. Hills behind, with a faint pale city skyline far away in the haze.

## Key values
- Road `#29335a`, centre line `#f2d23a`, kerb `#d4d8e2`, sidewalk `#e9ebf1`, grass `#62c23e`, trees `#4fb33b` / `#6cc94a`.
- Walls `#d8d2f4 #cdeedd #f6efc4 #d6e6fb #f7d9de #e4f2c9 #fbe2c8 #cfe9ef`, trim `#ffffff`, glass gradient `#5a8df0`→`#2b4fb8`.
- Lights: hemisphere `#d6e8ff`/`#8fbf6a` 0.95, sun `#fff4e0` 3.6 from (-0.45, 0.85, 0.55), ACES, saturation ×1.1, contrast ×1.06, fog `#cfe3fa` 160–1100.
- Layout: road 11 wide, verge 2.2, sidewalk 2.6, front lawn 6, lots every 22 along -z, houses at 1.25× rig scale (characters about 2 tall).
