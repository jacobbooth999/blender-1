// "Lie Town" shot list. Times in seconds, cut ~2 frames before the word they illustrate (see voice/words.json).
// cam: orbit {tgt, d, yaw (deg, 0 = camera on +z of target), h, fov, push, dyaw, dh, tgt2} or {pos, pos2, tgt, tgt2, fov}.
// Character ry: 0 faces +z. A camera at yaw Y sees a character with ry = Y from the front.
export const WORDS_URL = '../voice/words.json';

export const CAST = {
  sam: { shirt: '#5fd03a', patch: '#3f8f2a', pants: '#3b5a8a', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0', sleeve: .45 },
  mayor: { shirt: '#1d1d24', longSleeve: true, jacketOpen: '#ffcc2e', chain: true, hat: 'top', pants: '#1d1d24', hair: 'grey', hairColor: '#9a9a9a', skin: '#e8b48a' },
  kid: { shirt: '#e53935', pants: '#2f5fa8', hat: 'cap', hatColor: '#1e88e5', hair: 'short', hairColor: '#2a1a10', skin: '#c98f5f' },
  teacher: { shirt: '#3a74d9', longSleeve: true, pants: '#4a4a4a', hair: 'bun', hairColor: '#7a4a2a', skin: '#f2c9a0' },
  husband: { shirt: '#4a7fd6', plaid: true, stripe: '#2f5fb0', pants: '#6b5a45', hair: 'short', hairColor: '#1a1a1a', skin: '#e8b48a' },
  wife: { shirt: '#ff6fae', apron: '#ffffff', pants: '#7a3a6a', hair: 'long', hairColor: '#c4602a', skin: '#f2c9a0' },
  lady: { shirt: '#b07ad9', longSleeve: true, pants: '#5a4a6a', hair: 'bun', hairColor: '#d8d8d8', skin: '#f2c9a0' },
  e1: { shirt: '#ffd43b', pants: '#3a3a3a', hair: 'short', hairColor: '#e0b040', skin: '#f2c9a0' },
  e2: { shirt: '#8e5be0', pants: '#2f2f4f', hair: 'long', hairColor: '#1a1a1a', skin: '#8d5a3b' },
  e3: { shirt: '#ff8a3d', pants: '#2f5fa8', hair: 'spiky', hairColor: '#2a1a10', skin: '#e8b48a' },
  e4: { shirt: '#26b5a5', pants: '#454545', hair: 'pony', hairColor: '#a0522d', skin: '#f2c9a0' },
  e5: { shirt: '#f0f0f0', pants: '#2b4a7a', hair: 'short', hairColor: '#3a2616', skin: '#6b4226', zip: true },
  e6: { shirt: '#ff5a5a', pants: '#3a3a3a', hair: 'bun', hairColor: '#ffcc66', skin: '#f2c9a0' },
  e7: { shirt: '#4fc3f7', pants: '#5a4030', hat: 'beanie', hatColor: '#ff6f91', hair: 'short', hairColor: '#2a1a10', skin: '#c98f5f' },
  e8: { shirt: '#9ccc65', pants: '#3e2723', hair: 'spiky', hairColor: '#b03020', skin: '#f2c9a0' },
  e9: { shirt: '#ffb74d', pants: '#263238', hair: 'long', hairColor: '#4a2a10', skin: '#8d5a3b' },
  e10: { shirt: '#7e57c2', pants: '#212121', hat: 'cap', hatColor: '#43a047', hair: 'short', hairColor: '#111', skin: '#e8b48a' },
  statue: { shirt: '#c9c5bd', patch: '#b9b5ad', pants: '#c9c5bd', hair: 'messy', hairColor: '#bdb9b1', skin: '#d4d0c8', badge: false, sleeve: .45 },
};

// ---------- helpers ----------
const F = (px, pz, qx, qz) => Math.atan2(qx - px, qz - pz) * 180 / Math.PI;     // ry that faces q
const groundY = (z) => z < -117 ? 14 : z < -40 ? 14 * (-40 - z) / 77 : 0;
const hillY = (x, z) => { const r = 1600 - (x + 105) ** 2 - (z / 1.2) ** 2; return r > 0 ? Math.max(0, -14 + .95 * Math.sqrt(r)) : 0; };
const tick = (a, b, t0, t1) => (t) => t < t0 ? a : t > t1 ? b : Math.round(a + (b - a) * (t - t0) / (t1 - t0));
const alt = (a, b, hz = 6) => (t) => Math.floor(t * hz) % 2 ? a : b;
const SW = .3;                              // sidewalk top
const SAM_SIT = [-16.5, -1.85, -22.6];      // Sam sitting by his box in the alley (ry 70)
const OFF = { mayor: [400, 0, 994.6], sam: [400, 0, 1001.2] };
const STAGE_SAM = [-55, 1.8, -3.3];
const HOUSE_SAM = [80, 0, -8.6], HOUSE_RY = 0;
const stoneCast = { c: 'statue', p: [72, 3, -5], ry: 0, pose: (t) => ({ armL: [.15, -.5], armR: [Math.PI * .8, .2], head: [0, -.1] }), face: 'smile', nobadge: true };

// the town crowd in the square (in front of the stage), all watching the stage
const CROWD_IDS = ['kid', 'teacher', 'husband', 'wife', 'lady', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10'];
function crowd({ faces = null, ry = 180, pose = 'idle', badge = true, skip = [], turn = null } = {}) {
  const out = []; let i = 0;
  for (const id of CROWD_IDS) {
    if (skip.includes(id)) { i++; continue; }
    const row = Math.floor(i / 5), col = i % 5;
    const x = -60 + col * 2.6 + (row % 2) * 1.2 + Math.sin(i * 3.7) * .4, z = 9 + row * 3.2 + Math.cos(i * 2.1) * .4;
    const r0 = turn ? turn[i % turn.length] : ry;
    out.push({ c: id, p: [x, 0, z], ry: turn ? (t) => (t < .35 ? r0 : r0 + (180 - r0) * Math.min(1, (t - .35) / .35)) : r0 + Math.sin(i) * 8, pose, ph: i * .37,
      face: faces ? faces[i % faces.length] : 'neutral', badge: badge ? 50 + ((i * 7919) % 900) : undefined });
    i++;
  }
  return out;
}
// crowd on the escape hill (west), facing the town (+x)
function hillCrowd(faces, pose = 'idle') {
  const out = []; let i = 0;
  for (const id of ['kid', 'teacher', 'husband', 'wife', 'lady', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8']) {
    const row = Math.floor(i / 5), col = i % 5;
    const x = -85 - row * 2.6 + Math.sin(i * 1.7) * .5, z = -5.5 + col * 2.6 + row * 1.1;
    out.push({ c: id, p: [x, hillY(x, z), z], ry: 90 + Math.sin(i * 2.3) * 14, pose, ph: i * .41, face: faces[i % faces.length] });
    i++;
  }
  return out;
}
// fx helpers
function plateAt(W) { W.plate.position.set(0, 2.9, 2.4); }
function burstChunks(W, t, t0) {
  const k = t - t0; if (k < 0) return;
  W.damWall.visible = false; W.crack.visible = false;
  W.chunks.forEach((c, i) => {
    const h = (n) => { const x = Math.sin((i + 1) * 91.7 + n * 13.3) * 43758.5; return x - Math.floor(x); };
    c.visible = true;
    const vx = (h(1) - .5) * 14, vy = 5 + h(2) * 9, vz = 10 + h(3) * 14;
    c.position.set(-30 + i * 2.4 + vx * k, -8 + (i % 5) * 4 + vy * k - 9 * k * k, 3 + vz * k);
    c.rotation.set(k * (2 + h(4) * 4), k * h(5) * 3, k * 2);
  });
}
function wave(W, zf, level = 3.5) {
  // water from the broken dam down the slope (spill) and through the town (flood plane + wave front)
  const zs = -117;
  W.spill.visible = true;
  const zEnd = Math.min(zf, -40), mid = (zs + zEnd) / 2, len = (zEnd - zs) / Math.cos(.18);
  W.spill.position.set(0, groundY(mid) + 2.6, mid); W.spill.rotation.set(-Math.PI / 2 + .18, 0, 0); W.spill.scale.set(1, Math.max(.1, len), 1);
  if (zf > -40) { W.flood.visible = true; const a = -40, b = zf; W.flood.position.set(20, level, (a + b) / 2); W.flood.scale.set(1, b - a, 1); }
  W.wave.visible = true; W.wave.position.set(0, groundY(zf) - 1.5 + (zf > -40 ? level - 3.5 : 0), zf);
}
function floatCoins(W, t, level, cx, cz, spread = 14) {
  W.floatCoins.forEach((c, i) => {
    const h = (n) => { const x = Math.sin((i + 1) * 57.1 + n * 7.7) * 43758.5; return x - Math.floor(x); };
    c.visible = true; c.position.set(cx + (h(1) - .5) * spread * 2 + t * (h(4) - .3) * 2, level + .08 + Math.sin(t * 3 + i) * .08, cz + (h(2) - .5) * spread * 2 + t * 2);
    c.rotation.set(Math.sin(t * 2 + i) * .3, i, Math.cos(t * 2 + i) * .3);
  });
}

// ---------- shots ----------
export const SHOTS = [
  // 1 "In this town," — golden street establishing, dam on the hill behind
  { a: 0, b: 1.0, set: 'town', light: 'golden', dof: 0, shadow: 45,
    cam: { pos: [46, 4.6, .5], pos2: [42, 4.4, .5], tgt: [0, 5.2, -1.5], fov: 44 },
    cast: [{ c: 'e1', p: (t) => [6 + t * 1.4, SW, -6.2], ry: 90, pose: 'walk' }, { c: 'e2', p: (t) => [-2 - t * 1.4, SW, 7.4], ry: -90, pose: 'walk', ph: .3 },
      { c: 'kid', p: [10, SW, -6.1], ry: 60, pose: 'talk', face: 'grin' }, { c: 'lady', p: [12.2, SW, -6.2], ry: -110, face: 'smile' },
      { c: 'e4', p: (t) => [-10 + t, SW, -6.2], ry: 90, pose: 'walk', ph: .6 }] },
  // 2 "every time you lie," — the kid fibbing to a lady
  { a: 1.0, b: 2.17, set: 'town', light: 'golden', dof: 11,
    cam: { tgt: [11.1, 4.2, -6.2], d: 10, yaw: 5, h: .4, fov: 32, push: .1 },
    cast: [{ c: 'kid', p: [10, SW, -6.1], ry: 45, pose: 'talk', face: (t) => t < .7 ? 'talk' : 'grin', badge: 12 },
      { c: 'lady', p: [12.4, SW, -6.2], ry: -65, face: 'smile', badge: 40 }] },
  // 3 "you earn money." — badge close-up ticks up, coins burst
  { a: 2.17, b: 3.33, set: 'town', light: 'golden', dof: 14,
    cam: { tgt: [10, 3.45, -5.5], d: 2.6, yaw: 0, h: .15, fov: 34, push: .14 },
    cast: [{ c: 'kid', p: [10, SW, -6.1], ry: 0, pose: 'idle', face: 'grin', badge: tick(12, 17, .5, .7) }],
    fx: (t, c) => c.FX.coins(t, .5, [10, 3.2, -5.4], 30, 1.3, 1),
    ov: (g, t, O) => O.pop(g, t, .5, '+$5', .5, .79, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 }) },
  // 4 "Tell your teacher" — classroom
  { a: 3.33, b: 4.33, set: 'inter', light: 'room', dof: 6, shadow: 18,
    cam: { tgt: [-2.5, 4.0, 994], d: 13, yaw: 35, h: 1.5, fov: 38, push: .08 },
    cast: [{ c: 'kid', p: [0, 0, 996.5], ry: -135, pose: 'talk', face: 'talk', badge: 17 },
      { c: 'teacher', p: [-5, 0, 991.3], ry: 45, pose: 'idle', face: 'neutral', badge: 120 },
      { c: 'e5', p: [-6, 0, 1001.5], ry: 180, face: 'smile', s: .82 }, { c: 'e7', p: [6, 0, 1001.5], ry: 200, face: 'neutral', s: .82 },
      { c: 'e8', p: [0, 0, 1006], ry: 180, face: 'smile', s: .82 }] },
  // 5 "the dog ate your homework?" — puppy eyes, then smug
  { a: 4.33, b: 5.65, set: 'inter', light: 'room', dof: 12, shadow: 12,
    cam: { tgt: [0, 4.6, 996.5], d: 5, yaw: -118, h: .1, fov: 32, push: .1 },
    cast: [{ c: 'kid', p: [0, 0, 996.5], ry: -135, pose: 'shrug', face: [[0, 'worried'], [.8, 'smug']], badge: 17 },
      { c: 'teacher', p: [-5, 0, 991.3], ry: 45, face: 'neutral' }] },
  // 6 "Five dollars." — +$5
  { a: 5.65, b: 6.87, set: 'inter', light: 'room', dof: 12, shadow: 12,
    cam: { tgt: [0, 3.2, 997], d: 4.4, yaw: 0, h: .2, fov: 36, push: .15 },
    cast: [{ c: 'kid', p: [0, 0, 996.5], ry: 0, pose: 'armsUp', face: 'grin', badge: tick(17, 22, .05, .25) }],
    fx: (t, c) => c.FX.coins(t, .05, [0, 3.0, 997.1], 30, 1.3, 2),
    ov: (g, t, O) => O.pop(g, t, .05, '+$5', .5, .79, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 }) },
  // 7 "Tell your wife you love" — kitchen, proud wife, green slop
  { a: 6.87, b: 7.73, set: 'inter', light: 'room', dof: 6, shadow: 14,
    cam: { tgt: [201.8, 3.6, 1004.2], d: 13, yaw: 200, h: 1.6, fov: 40, push: .08 },
    cast: [{ c: 'husband', p: [200, 0, 1005.6], ry: 180, face: 'neutral', badge: 40 },
      { c: 'wife', p: [203.6, 0, 1003.2], ry: -60, pose: 'armsOut', face: 'smile', badge: 75 }],
    fx: (t, c) => plateAt(c.W) },
  // 8 "her cooking?" — forced grin
  { a: 7.73, b: 8.68, set: 'inter', light: 'room', dof: 12, shadow: 10,
    cam: { tgt: [200, 4.4, 1005.6], d: 5.2, yaw: 192, h: -.5, fov: 32, push: .12 },
    cast: [{ c: 'husband', p: [200, 0, 1005.6], ry: 180, pose: 'eat', face: [[0, 'worried'], [.42, 'grin']], badge: 40 },
      { c: 'wife', p: [203.6, 0, 1003.2], ry: -60, pose: 'armsOut', face: 'smile' }],
    fx: (t, c) => plateAt(c.W) },
  // 9 "Fifty." — +$50
  { a: 8.68, b: 9.57, set: 'inter', light: 'room', dof: 12, shadow: 10,
    cam: { tgt: [200, 3.6, 1005], d: 4.2, yaw: 180, h: .2, fov: 36, push: .15 },
    cast: [{ c: 'husband', p: [200, 0, 1005.6], ry: 180, pose: 'wave', face: 'grin', badge: tick(40, 90, .05, .3) }],
    fx: (t, c) => { plateAt(c.W); c.FX.coins(t, .05, [200, 3.2, 1005], 36, 1.3, 3); },
    ov: (g, t, O) => O.pop(g, t, .05, '+$50', .5, .79, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 }) },
  // 10 "The mayor lies so much," — low angle at the gold gate
  { a: 9.57, b: 10.85, set: 'town', light: 'golden', dof: 7, shadow: 25,
    cam: { tgt: [52, 4.6, 7.5], d: 9, yaw: 180, h: -2.4, fov: 34, push: .1, dyaw: -6 },
    cast: [{ c: 'mayor', p: [52, SW, 7.5], ry: 180, pose: 'talk', face: 'smug', badge: 9999999 }] },
  // 11 "he lives in a" — laughing in a money shower
  { a: 10.85, b: 11.9, set: 'town', light: 'golden', dof: 12, shadow: 15,
    cam: { tgt: [52, 4.9, 7.5], d: 5.2, yaw: 196, h: -.9, fov: 32, push: .1 },
    cast: [{ c: 'mayor', p: [52, SW, 7.5], ry: 180, pose: 'armsUp', face: 'laugh', badge: 9999999 }],
    fx: (t, c) => c.FX.bills(t, [52, 1, 9.5], [12, 9, 4], 180) },
  // 12 "golden mansion." — low wide on the mansion
  { a: 11.9, b: 13.24, set: 'town', light: 'golden', dof: 0, shadow: 40,
    cam: { pos: [45, 1.2, 1], pos2: [46.5, 1.6, 3.2], tgt: [52, 11, 24], fov: 44 },
    fx: (t, c) => c.FX.bills(t, [52, 2, 14], [30, 18, 14], 120, 9),
    ov: (g, t, O) => O.pop(g, t, .5, '$9,999,999', .5, .64, 116, '#ffd43b', { stroke: '#4a3200', strokeW: 14 }) },
  // 13 "But Sam has never" — Sam walks toward camera
  { a: 13.24, b: 14.38, set: 'town', light: 'golden', dof: 10, shadow: 20,
    cam: { tgt: [-4, 4.3, -6.2], tgt2: [-4 + 1.5 * 1.14, 4.3, -6.2], d: 7.5, yaw: 55, h: .2, fov: 34, push: 0, ease: 'lin' },
    cast: [{ c: 'sam', p: (t) => [-4 + 1.5 * t, SW, -6.2], ry: 90, pose: 'walk', face: 'neutral', badge: '$0' },
      { c: 'e3', p: (t) => [-12 + t * 1.2, SW, -6.4], ry: 90, pose: 'walk', ph: .5, badge: 300 },
      { c: 'e6', p: (t) => [-16 - t * 1.3, SW, 6.8], ry: -90, pose: 'walk', ph: .2, badge: 210 }] },
  // 14 "told a single lie." — honest Sam among badge-rich neighbours
  { a: 14.38, b: 15.6, set: 'town', light: 'golden', dof: 9, shadow: 20,
    cam: { tgt: [0, 4.0, -6.2], d: 10, yaw: 12, h: .5, fov: 34, push: .08 },
    cast: [{ c: 'sam', p: [0, SW, -6.2], ry: 15, face: 'smile', badge: '$0' },
      { c: 'e3', p: [-3.2, SW, -6.4], ry: 40, face: 'smug', badge: 300 }, { c: 'e4', p: [3.4, SW, -6.4], ry: -20, face: 'smug', badge: 820, ph: 1 }] },
  // 15 "Not once." — $0
  { a: 15.6, b: 16.67, set: 'town', light: 'golden', dof: 14, shadow: 10,
    cam: { tgt: [0, 3.45, -5.6], d: 2.5, yaw: 0, h: .1, fov: 34, push: .15 },
    cast: [{ c: 'sam', p: [0, SW, -6.2], ry: 0, face: 'neutral', badge: '$0' }],
    ov: (g, t, O) => O.pop(g, t, .38, '$0', .5, .79, 190, '#ff3b3b', { stroke: '#3d0000', strokeW: 18 }) },
  // 16 "So Sam lives in a" — the bakery
  { a: 16.67, b: 17.86, set: 'town', light: 'golden', dof: 4, shadow: 25,
    cam: { pos: [-8, 5, 6], pos2: [-10, 5.2, 5], tgt: [-16.5, 5.4, -9], fov: 40 },
    cast: [{ c: 'sam', p: (t) => [-13.5 - 1.3 * t, SW, -6.0], ry: -90, pose: 'walk', face: 'neutral', badge: '$0' },
      { c: 'e9', p: (t) => [-24 + t * 1.2, SW, -6.3], ry: 90, pose: 'walk', badge: 140 }] },
  // 17 "cardboard box behind" — high angle on the box house
  { a: 17.86, b: 19.24, set: 'town', light: 'golden', dof: 5, shadow: 18, shadowAt: [-16.5, 0, -24],
    cam: { tgt: [-16.5, 1.5, -24.5], d: 14, yaw: 60, h: 6, fov: 40, push: .1 },
    cast: [{ c: 'sam', p: SAM_SIT, ry: 70, pose: 'sitSad', face: 'sad', badge: '$0' }] },
  // 18 "the bakery." — sad Sam
  { a: 19.24, b: 20.09, set: 'town', light: 'golden', dof: 12, shadow: 10, shadowAt: [-16.5, 0, -23],
    cam: { tgt: [-16.5, 2.75, -22.6], d: 5, yaw: 58, h: .4, fov: 32, push: .1 },
    cast: [{ c: 'sam', p: SAM_SIT, ry: 70, pose: 'sitSad', face: 'sad', badge: '$0' }] },
  // 19 "He eats bread crusts for" — crust close-up
  { a: 20.09, b: 21.75, set: 'town', light: 'golden', dof: 14, shadow: 8, shadowAt: [-16.5, 0, -23],
    cam: { tgt: [-15.9, 2.55, -22.4], d: 3.2, yaw: 70, h: .25, fov: 30, push: .12 },
    cast: [{ c: 'sam', p: SAM_SIT, ry: 70, pose: (t) => ({ armR: [Math.PI * .55, -.35], armL: [.9, .3], legL: Math.PI / 2, legR: Math.PI / 2, head: [0, .12], lean: .1 }), face: 'sad', badge: '$0' }],
    fx: (t, c) => { const w = c.W.crust; w.visible = true; w.position.set(-15.6, 1.85 + Math.sin(t * 2) * .05, -22.3); w.rotation.set(.2, 70 * Math.PI / 180, .3); },
    focus: [-15.6, 1.9, -22.3] },
  // 20 "and everyone laughs at him." — the town laughs (Sam's POV, low)
  { a: 21.75, b: 22.9, set: 'town', light: 'golden', dof: 6, shadow: 14, shadowAt: [-10, 0, -22],
    cam: { pos: [-15.6, 2.4, -22.4], pos2: [-15.2, 2.5, -22.4], tgt: [-10, 5, -22.3], fov: 42 },
    cast: [{ c: 'kid', p: [-10.6, 0, -20.6], ry: F(-10.6, -20.6, -16.5, -22.6), pose: 'laughPoint', face: 'laugh', badge: 22 },
      { c: 'husband', p: [-9.6, 0, -22.5], ry: -90, pose: 'laughPoint', face: 'laugh', badge: 90, ph: .3 },
      { c: 'teacher', p: [-10.4, 0, -24.5], ry: F(-10.4, -24.5, -16.5, -22.6), pose: 'laughPoint', face: 'laugh', badge: 120, ph: .6 },
      { c: 'wife', p: [-7.8, 0, -21], ry: -100, pose: 'laughPoint', face: 'laugh', badge: 75, ph: .9 },
      { c: 'e1', p: [-7.6, 0, -24], ry: -80, pose: 'laughPoint', face: 'laugh', badge: 60, ph: 1.2 }] },
  // 21 Sam cries
  { a: 22.9, b: 23.75, set: 'town', light: 'golden', dof: 14, shadow: 8, shadowAt: [-16.5, 0, -23],
    cam: { tgt: [-16.4, 2.9, -22.5], d: 5.2, yaw: 70, h: .3, fov: 32, push: .14 },
    cast: [{ c: 'sam', p: SAM_SIT, ry: 70, pose: 'sitSad', face: 'cry', badge: '$0' }] },
  // 22 "Then one night," — rainy night street
  { a: 23.75, b: 24.95, set: 'town', light: 'night', dof: 0, shadow: 30,
    cam: { pos: [12, 6.5, 2.5], pos2: [9, 5.5, 2.8], tgt: [-10, 4, -1], fov: 44 },
    cast: [{ c: 'sam', p: (t) => [-6 + t * 1.2, SW, 6.8], ry: 90, pose: 'walk', face: 'sad', badge: '$0' }],
    fx: (t, c) => { c.FX.rain(t); if (t > .85 && t < .95) c.OV.flash = .55; } },
  // 23 "Sam saw a" — looks up
  { a: 24.95, b: 25.6, set: 'town', light: 'night', dof: 12, shadow: 12,
    cam: { tgt: [0, 4.4, 6.8], d: 5.5, yaw: 160, h: -1.1, fov: 34, push: .12 },
    cast: [{ c: 'sam', p: [0, SW, 6.8], ry: 160, pose: (t) => ({ head: [0, -.3], armL: [0, -.06], armR: [0, .06] }), face: [[0, 'worried'], [.35, 'shock']], badge: '$0' }],
    fx: (t, c) => c.FX.rain(t) },
  // 24 "giant crack in the dam" — the crack spurts
  { a: 25.6, b: 26.9, set: 'town', light: 'night', dof: 0, shadow: 30, shadowAt: [3, 27, -117],
    cam: { pos: [9, 21, -94], pos2: [6.5, 23, -100], tgt: [3, 27, -117], fov: 40 },
    kicks: [[.1, .25]],
    fx: (t, c) => { c.FX.rain(t); c.W.jets.forEach((j, i) => { j.visible = true; j.scale.z = 1 + Math.sin(t * 20 + i) * .3; }); if (t > .08 && t < .16) c.OV.flash = .6; } },
  // 25 "above the town." — from the dam down onto the town lights
  { a: 26.9, b: 27.62, set: 'town', light: 'night', dof: 0, shadow: 60, shadowAt: [0, 10, -40],
    cam: { pos: [-22, 42, -110], pos2: [-21, 41, -106], tgt: [0, 4, 0], fov: 46 },
    fx: (t, c) => { c.FX.rain(t); c.W.jets.forEach((j) => j.visible = true); } },
  // 26 "He ran straight to the mayor." — running in the rain
  { a: 27.62, b: 29.2, set: 'town', light: 'night', dof: 8, shadow: 20,
    cam: { tgt: [-10, 4.0, 1], tgt2: [-10 + 6.5 * 1.58, 4.0, 1], d: 8, yaw: 105, h: 0, fov: 36, push: 0, ease: 'lin' },
    cast: [{ c: 'sam', p: (t) => [-10 + 6.5 * t, 0, 1], ry: 90, pose: 'run', face: 'determined', badge: '$0' }],
    fx: (t, c) => c.FX.rain(t) },
  // 27 "But fixing it would cost" — mayor's office, over Sam's shoulder
  { a: 29.2, b: 30.35, set: 'inter', light: 'officeNight', dof: 9, shadow: 14, focus: [400, 4.7, 994.6],
    cam: { pos: [401.8, 5.4, 1005], pos2: [401.6, 5.3, 1004.2], tgt: [400, 4.6, 994.8], fov: 36 },
    cast: [{ c: 'sam', p: OFF.sam, ry: 180, pose: 'talk', face: 'worried', badge: '$0' },
      { c: 'mayor', p: OFF.mayor, ry: 0, pose: 'idle', face: [[0, 'neutral'], [.6, 'worried']], badge: 9999999 }] },
  // 28 "the mayor his gold." — hugging the gold
  { a: 30.35, b: 31.7, set: 'inter', light: 'officeNight', dof: 9, shadow: 12,
    cam: { tgt: [394.6, 3.4, 999], d: 8, yaw: 40, h: 1, fov: 36, push: .1 },
    cast: [{ c: 'mayor', p: [395.9, 0, 1000], ry: -123, pose: 'hug', face: 'greedy', badge: 9999999 }] },
  // 29 "So he smiled," — smug
  { a: 31.7, b: 32.68, set: 'inter', light: 'officeNight', dof: 13, shadow: 10,
    cam: { tgt: [400, 4.8, 994.6], d: 4.5, yaw: 0, h: -.35, fov: 32, push: .12 },
    cast: [{ c: 'mayor', p: OFF.mayor, ry: 0, pose: 'idle', face: [[0, 'neutral'], [.35, 'smug']], badge: 9999999 }] },
  // 30 "and wrote Sam a cheque" — pen on the cheque
  { a: 32.68, b: 33.9, set: 'inter', light: 'officeNight', dof: 12, shadow: 6, focus: [400, 3.36, 997.3],
    cam: { pos: [400, 8.2, 1001.6], pos2: [400, 7.6, 1000.9], tgt: [400, 3.36, 997.3], fov: 40 },
    fx: (t, c) => { const q = c.W.cheque; q.visible = true; q.position.set(400, 3.36, 997.3); q.rotation.set(0, .55, 0);
      const p = c.W.pen; p.visible = true; p.position.set(400.2 + Math.sin(t * 9) * .55, 3.9, 997.35 + Math.cos(t * 17) * .08); p.rotation.set(.5, 0, -.5); } },
  // 31 "for one million dollars." — Sam stunned, cheque in the foreground
  { a: 33.9, b: 35.3, set: 'inter', light: 'officeNight', dof: 12, shadow: 10,
    cam: { tgt: [400, 4.55, 1001.2], d: 5.2, yaw: 180, h: -.1, fov: 32, push: .12 },
    cast: [{ c: 'sam', p: OFF.sam, ry: 180, pose: 'scared', face: 'shock', badge: '$0' }],
    fx: (t, c) => { const q = c.W.cheque; q.visible = true; q.position.set(400.8, 3.55, 997.6); q.rotation.set(-Math.PI / 2 + .25, Math.PI, .1); },
    ov: (g, t, O) => O.pop(g, t, .3, '$1,000,000', .5, .79, 118, '#3ee870', { stroke: '#0b3d1a', strokeW: 14 }) },
  // 32 "Tell everyone the dam is safe." — low angle mayor
  { a: 35.3, b: 37.65, set: 'inter', light: 'officeNight', dof: 9, shadow: 12,
    cam: { tgt: [400, 4.6, 994.6], d: 7, yaw: -15, h: -1.2, fov: 34, push: .14, dyaw: 6 },
    cast: [{ c: 'mayor', p: OFF.mayor, ry: 0, pose: 'talk', face: alt('talk', 'smug', 5), badge: 9999999 }] },
  // 33 "One lie," — the cheque slides across the desk
  { a: 37.65, b: 38.75, set: 'inter', light: 'officeNight', dof: 12, shadow: 8,
    cam: { pos: [400, 4.3, 1000.4], pos2: [400, 4.1, 1000], tgt: [400, 3.5, 997.2], fov: 36 },
    cast: [{ c: 'mayor', p: OFF.mayor, ry: 0, pose: 'holdOne', face: 'smug', badge: 9999999 }],
    fx: (t, c) => { const q = c.W.cheque; q.visible = true; const k = Math.min(1, t / .6); q.position.set(400, 3.36, 996.3 + 1.4 * (1 - (1 - k) ** 3)); q.rotation.set(0, Math.sin(t) * .05, 0); },
    focus: [400, 3.4, 997.6] },
  // 34 "and you'll never be poor again." — leaning in
  { a: 38.75, b: 40.3, set: 'inter', light: 'officeNight', dof: 13, shadow: 10,
    cam: { tgt: [400, 4.6, 994.9], d: 4.2, yaw: 8, h: .1, fov: 32, push: .2 },
    cast: [{ c: 'mayor', p: OFF.mayor, ry: 0, pose: (t) => ({ lean: .22, armL: [.5, .2], armR: [.5, -.2], head: [0, -.1] }), face: [[0, 'talk'], [.4, 'smug'], [.9, 'grin']], badge: 9999999 }] },
  // 35 "Sam looked at the cheque." — over his shoulder onto the cheque
  { a: 40.3, b: 41.65, set: 'inter', light: 'officeNight', dof: 11, shadow: 8, focus: [400, 3.6, 999.85],
    cam: { pos: [402.4, 7.3, 1003.2], pos2: [402.2, 7.0, 1002.7], tgt: [400, 3.6, 999.8], fov: 38 },
    cast: [{ c: 'sam', p: OFF.sam, ry: 180, pose: 'hold', face: 'worried', badge: '$0' }],
    fx: (t, c) => { const q = c.W.cheque; q.visible = true; q.position.set(400, 3.65, 999.85); q.rotation.set(.9, 0, 0); } },
  // 36 "Then at his" — the soggy box in the rain
  { a: 41.65, b: 42.95, set: 'town', light: 'night', dof: 4, shadow: 14, shadowAt: [-16.5, 0, -25],
    cam: { pos: [-9, 5, -19.8], pos2: [-10.5, 4.4, -20.6], tgt: [-16.5, 1.8, -25.5], fov: 40 },
    fx: (t, c) => { c.FX.rain(t); c.W.alleyLamp.material.emissiveIntensity = 2; } },
  // 37 "cardboard box." — torn
  { a: 42.95, b: 43.73, set: 'inter', light: 'officeNight', dof: 13, shadow: 8,
    cam: { tgt: [400, 4.7, 1001.2], d: 4, yaw: 180, h: 0, fov: 30, push: .1 },
    cast: [{ c: 'sam', p: OFF.sam, ry: 180, pose: 'hold', face: 'worried', badge: '$0' }] },
  // 38 "The next morning," — the square, stage, crowd
  { a: 43.73, b: 45.0, set: 'town', light: 'day', dof: 0, shadow: 30, shadowAt: [-55, 0, 6],
    cam: { pos: [-40, 9, 23], pos2: [-42, 8.5, 21], tgt: [-55, 5, -2], fov: 44 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, face: 'worried', badge: '$0' }, { c: 'mayor', p: [-50.5, 1.8, -4.5], ry: -20, face: 'smug', badge: 9999999 }, ...crowd()],
    ov: (g, t, O) => O.pop(g, t, .05, 'THE NEXT MORNING', .5, .12, 74, '#ffffff', { stroke: '#111', strokeW: 12 }) },
  // 39 "the whole town was watching." — from the stage onto the crowd
  { a: 45.0, b: 46.4, set: 'town', light: 'day', dof: 4, shadow: 25, shadowAt: [-55, 0, 10],
    cam: { pos: [-51.2, 8.8, -6.6], pos2: [-51.8, 8.5, -6.0], tgt: [-56, 3, 12], fov: 46 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, face: 'worried', badge: '$0' }, ...crowd({ faces: ['neutral', 'worried', 'smug', 'neutral'] })] },
  // 40 "Sam looked into the camera," — the lens
  { a: 46.4, b: 47.35, set: 'town', light: 'day', dof: 9, shadow: 14, focus: [-55, 6.4, -3.3],
    cam: { pos: [-53.6, 6.0, 9.2], pos2: [-53.9, 6.0, 8.4], tgt: [-55, 5.6, -3.3], fov: 34 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, face: 'worried', badge: '$0' }] },
  // 41 "and said," — Sam at the mic
  { a: 47.35, b: 48.4, set: 'town', light: 'day', dof: 9, shadow: 12,
    cam: { pos: [-55, 6.0, 3.2], pos2: [-55, 6.1, 1.9], tgt: [-55, 6.3, -3.3], fov: 36 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, pose: 'idle', face: [[0, 'worried'], [.6, 'determined']], badge: '$0' }],
    ov: (g, t, O) => O.live(g, t) },
  // 42 "The dam is breaking." — close-up, LIVE
  { a: 48.4, b: 49.4, set: 'town', light: 'day', dof: 13, shadow: 8,
    cam: { tgt: [-55, 6.45, -3.3], d: 4, yaw: 0, h: 0, fov: 30, push: .14 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, pose: 'talk', face: alt('talk', 'determined', 6), badge: '$0' }],
    ov: (g, t, O) => O.live(g, t) },
  // 43 "Run to the hill." — points west
  { a: 49.4, b: 50.3, set: 'town', light: 'day', dof: 9, shadow: 12,
    cam: { tgt: [-55, 5.6, -3.3], d: 7.5, yaw: -12, h: 0, fov: 36, push: .08 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: -48, pose: 'point', face: 'determined', badge: '$0' }],
    ov: (g, t, O) => O.live(g, t) },
  // 44 "Now." — punch in
  { a: 50.3, b: 50.88, set: 'town', light: 'day', dof: 15, shadow: 8, kicks: [[.03, .05]],
    cam: { tgt: [-55, 6.55, -3.3], d: 2.9, yaw: 0, h: 0, fov: 28, push: .12 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, pose: 'idle', face: 'determined', badge: '$0' }],
    ov: (g, t, O) => O.live(g, t) },
  // 45 "Nobody in town believed" — husband and wife distrust each other
  { a: 50.88, b: 52.4, set: 'town', light: 'day', dof: 10, shadow: 12,
    cam: { pos: [-55.3, 5.0, 20.6], pos2: [-55.3, 5.0, 19.8], tgt: [-55.3, 4.4, 12.2], fov: 34 },
    cast: [{ c: 'husband', p: [-56.5, 0, 12], ry: 70, pose: 'idle', face: 'worried', badge: 90 }, { c: 'wife', p: [-54, 0, 12.3], ry: -80, pose: 'idle', face: 'smug', badge: 75 }] },
  // 46 "each other anymore." — kid and teacher side-eye
  { a: 52.4, b: 53.83, set: 'town', light: 'day', dof: 10, shadow: 12,
    cam: { pos: [-59.6, 4.9, 19.0], pos2: [-59.6, 4.9, 18.2], tgt: [-59.6, 4.3, 10.8], fov: 34 },
    cast: [{ c: 'kid', p: [-58.4, 0, 10.6], ry: -55, face: 'worried', badge: 22 }, { c: 'teacher', p: [-60.8, 0, 11], ry: 60, face: 'smug', badge: 120 }],
    ov: (g, t, O) => { O.pop(g, t, .3, '?', .3, .2, 170, '#ffd43b', { stroke: '#3a2a00', strokeW: 14 }); O.pop(g, t, .55, '?', .72, .22, 170, '#ffd43b', { stroke: '#3a2a00', strokeW: 14 }); } },
  // 47 "But everyone knew one thing." — every head turns to the stage
  { a: 53.83, b: 55.45, set: 'town', light: 'day', dof: 0, shadow: 30, shadowAt: [-55, 0, 6],
    cam: { pos: [-50, 7.4, 25], pos2: [-51, 6.8, 22.5], tgt: [-55, 5, -1], fov: 40 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, face: 'determined', badge: '$0' }, ...crowd({ turn: [100, 260, 120, 240, 90, 270] })] },
  // 48 "Sam never lies." — low hero angle
  { a: 55.45, b: 56.85, set: 'town', light: 'day', dof: 8, shadow: 12,
    cam: { tgt: [-55, 6.2, -3.3], d: 6.5, yaw: 12, h: -2.4, fov: 34, push: .1, dyaw: -5 },
    cast: [{ c: 'sam', p: STAGE_SAM, ry: 0, face: 'determined', badge: '$0' }] },
  // 49 "So they ran." — the crowd runs for the hill
  { a: 56.85, b: 58.0, set: 'town', light: 'day', dof: 3, shadow: 25, shadowAt: [-55, 0, 1],
    cam: { pos: [-64, 4.2, 3], pos2: [-65.4, 4.5, 3], tgt: [-48, 3.6, 1], fov: 40 },
    cast: CROWD_IDS.slice(0, 12).map((id, i) => ({ c: id, p: (t) => [-46 - (i % 4) * 2.5 - t * (5 + (i % 3)), 0, -3.5 + Math.floor(i / 4) * 2.6 + (i % 2) * .8], ry: -90, pose: i % 3 === 1 ? (t) => ({ ...{ armL: [Math.PI * .9, -.3], armR: [Math.PI * .9, .3] }, legL: -Math.sin(t * 12) * 1, legR: Math.sin(t * 12) * 1, bob: Math.abs(Math.sin(t * 12)) * .3 }) : 'run', ph: i * .21, face: i % 2 ? 'shock' : 'worried' }))
      .concat([{ c: 'sam', p: (t) => [-51 - t * 5.5, 0, 4], ry: -90, pose: 'run', face: 'determined', badge: '$0' }]) },
  // 50 "Minutes later," — the crack spreads
  { a: 58.0, b: 58.95, set: 'town', light: 'day', dof: 0, shadow: 40, shadowAt: [3, 27, -117], kicks: [[.45, .12]],
    cam: { pos: [16, 21, -80], pos2: [13, 22.5, -85], tgt: [3, 27, -117], fov: 42 },
    fx: (t, c) => { c.W.crack.scale.set(1 + t * 1.2, 1 + t * .8, 1); c.W.jets.forEach((j, i) => { j.visible = true; j.scale.set(1 + t, 1 + t, 1.5 + t * 2 + Math.sin(t * 25 + i) * .3); }); },
    ov: (g, t, O) => O.pop(g, t, .05, 'MINUTES LATER', .5, .12, 74, '#ffffff', { stroke: '#111', strokeW: 12 }) },
  // 51 "the dam burst." — it blows
  { a: 58.95, b: 60.05, set: 'town', light: 'day', dof: 0, shadow: 60, shadowAt: [0, 20, -100], kicks: [[.55, .35], [.75, .15]],
    cam: { pos: [42, 32, -45], pos2: [40, 31, -48], tgt: [0, 22, -112], fov: 46 },
    fx: (t, c) => { if (t < .55) { c.W.jets.forEach((j) => { j.visible = true; j.scale.set(2, 2, 4); }); c.W.crack.scale.set(2.3, 1.8, 1); } else { burstChunks(c.W, t, .55); wave(c.W, -117 + (t - .55) * 70); } } },
  // 52 "The golden mansion washed away." — the wave takes the mansion
  { a: 60.05, b: 61.95, set: 'town', light: 'day', dof: 0, shadow: 45, shadowAt: [52, 0, 20], kicks: [[.42, .2]],
    cam: { pos: [95, 16, 62], pos2: [92, 16, 59], tgt: [50, 5, 16], fov: 46 },
    fx: (t, c) => {
      const zf = -10 + t * 70, lv = Math.min(6.5, Math.max(0, (zf - 5) * .4)); burstChunks(c.W, 3, 0); c.W.chunks.forEach((k) => k.visible = false);
      wave(c.W, Math.min(zf, 60), Math.max(1, lv));
      const hit = Math.max(0, t - .3); const m = c.W.mansion;
      m.position.set(52 + hit * 1.5, -hit * 1.4, 24 + hit * 5.5); m.rotation.set(hit * .12, Math.PI + hit * .35, -hit * .18);
      if (hit > 0) floatCoins(c.W, hit, lv, 52, 22 + hit * 4, 12);
    } },
  // 53 "But every single" — from behind the crowd on the hill, the flooded town
  { a: 61.95, b: 63.0, set: 'town', light: 'day', dof: 9, shadow: 30, shadowAt: [-86, 18, 0], focus: [-40, 6, 6],
    cam: { pos: [-99, 33, -2], pos2: [-98, 32.4, -1.5], tgt: [-30, 2, 8], fov: 44 },
    cast: hillCrowd(['neutral', 'worried', 'smile']).concat([{ c: 'sam', p: [-83, hillY(-83, 1), 1], ry: 90, face: 'neutral', badge: '$0' }]),
    fx: (t, c) => { c.W.damWall.visible = false; c.W.crack.visible = false; c.W.mansion.visible = false; c.W.flood.visible = true; c.W.flood.position.set(20, 5, 0); c.W.flood.scale.set(1, 240, 1); c.W.spill.visible = true; c.W.spill.position.set(0, groundY(-78) + 2.6, -78); c.W.spill.rotation.set(-Math.PI / 2 + .18, 0, 0); c.W.spill.scale.set(1, 78, 1); floatCoins(c.W, t + 3, 5, 40, 30, 25); } },
  // 54 "person was safe." — relieved faces
  { a: 63.0, b: 64.15, set: 'town', light: 'day', dof: 8, shadow: 15, shadowAt: [-84, 18, 1],
    cam: { pos: [-73.5, 19.5, 3.5], pos2: [-74.5, 19.6, 3.2], tgt: [-84, hillY(-84, 1) + 4.2, 1], fov: 36 },
    cast: hillCrowd(['smile', 'happycry', 'smile', 'grin'], 'idle').concat([{ c: 'sam', p: [-81.5, hillY(-81.5, 1.5), 1.5], ry: 100, face: 'smile', badge: '$0' }]),
    fx: (t, c) => { c.W.mansion.visible = false; } },
  // 55 "The town built Sam a real house," — sunny, new house
  { a: 64.15, b: 65.95, set: 'town', light: 'day', dof: 4, shadow: 30, shadowAt: [78, 0, -8],
    cam: { tgt: [78.5, 4.5, -8], d: 17, yaw: -8, h: 1.5, fov: 40, push: .1, dyaw: 6 },
    cast: [{ c: 'sam', p: HOUSE_SAM, ry: HOUSE_RY, pose: 'wave', face: 'grin', badge: '$0' }, stoneCast,
      { c: 'wife', p: [84.5, 0, -4.5], ry: -40, pose: 'cheer', face: 'grin' }, { c: 'kid', p: [83, 0, -2.5], ry: -25, pose: 'cheer', face: 'grin', ph: .4 },
      { c: 'husband', p: [76.5, 0, -3], ry: 30, pose: 'cheer', face: 'grin', ph: .8 }],
    fx: (t, c) => { c.W.newHouse.visible = true; c.W.statue.visible = true; c.W.mansion.visible = false; } },
  // 56 "with a statue out front." — low angle on Sam's statue
  { a: 65.95, b: 68.0, set: 'town', light: 'day', dof: 3, shadow: 20, shadowAt: [72, 0, -5],
    cam: { tgt: [72, 6.0, -5], d: 13, yaw: -15, h: -3, fov: 40, push: .12, dyaw: 10 },
    cast: [stoneCast],
    fx: (t, c) => { c.W.newHouse.visible = true; c.W.statue.visible = true; c.W.mansion.visible = false; } },
  // 57 "He's still the poorest man in town." — tilt from $0 badge to a smile
  { a: 68.0, b: 70.0, set: 'town', light: 'day', dof: 13, shadow: 10, shadowAt: [80, 0, -8],
    cam: { tgt: [80, 3.25, -8.0], tgt2: [80, 4.75, -8.6], d: 2.8, yaw: 0, h: 0, fov: 32, push: -.25 },
    cast: [{ c: 'sam', p: HOUSE_SAM, ry: HOUSE_RY, face: 'smile', badge: '$0' }],
    fx: (t, c) => { c.W.newHouse.visible = true; c.W.statue.visible = true; c.W.mansion.visible = false; } },
  // 58 "But he's the only one" — the town cheers for Sam
  { a: 70.0, b: 71.2, set: 'town', light: 'day', dof: 5, shadow: 22, shadowAt: [80, 0, -8],
    cam: { tgt: [80, 4, -8.6], d: 18, yaw: 0, h: -.5, fov: 40, push: .1 },
    cast: [{ c: 'sam', p: HOUSE_SAM, ry: HOUSE_RY, pose: 'armsOut', face: 'happycry', badge: '$0' }, stoneCast,
      ...['kid', 'teacher', 'husband', 'wife', 'lady', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'].map((id, i) => {
        const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
        const a = (HOUSE_RY + side * (52 + k * 9)) * Math.PI / 180, r = 4 + (k % 3) * 1.6;
        const x = HOUSE_SAM[0] + Math.sin(a) * r, z = HOUSE_SAM[2] + Math.cos(a) * r;
        return { c: id, p: [x, 0, z], ry: F(x, z, HOUSE_SAM[0], HOUSE_SAM[2]), pose: 'cheer', ph: i * .3, face: i % 2 ? 'grin' : 'laugh' };
      })],
    fx: (t, c) => { c.W.newHouse.visible = true; c.W.statue.visible = true; c.W.mansion.visible = false; } },
  // 59 "everybody trusts." — TOWN HERO
  { a: 71.2, b: 72.75, set: 'town', light: 'day', dof: 13, shadow: 10, shadowAt: [80, 0, -8],
    cam: { tgt: [80, 4.7, -8.6], d: 4.4, yaw: 6, h: .1, fov: 32, push: .12 },
    cast: [{ c: 'sam', p: HOUSE_SAM, ry: HOUSE_RY, face: 'happycry', badge: '$0' }],
    fx: (t, c) => { c.W.newHouse.visible = true; c.W.statue.visible = true; c.W.mansion.visible = false; },
    ov: (g, t, O) => O.stamp(g, t, .85, 'TOWN HERO', .5, .64, 110, '#ffcc2e', -.16) },
  // 60 end card
  { a: 72.75, b: 74.96, set: 'town', light: 'day', dof: 8, shadow: 22, shadowAt: [80, 0, -8], nocap: true,
    cam: { tgt: [78, 4.2, -8.6], d: 13, yaw: -10, h: .5, fov: 40, push: .08 },
    cast: [{ c: 'sam', p: HOUSE_SAM, ry: HOUSE_RY, pose: 'wave', face: 'grin', badge: '$0' }, stoneCast],
    fx: (t, c) => { c.W.newHouse.visible = true; c.W.statue.visible = true; c.W.mansion.visible = false; },
    ov: (g, t, O) => {
      g.save(); g.fillStyle = `rgba(0,0,0,${Math.min(.5, t * 2)})`; g.fillRect(0, 0, O.W, O.H); g.restore();
      O.pop(g, t, .1, 'WOULD YOU', .5, .28, 120, '#ffffff', { stroke: '#111', strokeW: 14 });
      O.pop(g, t, .2, 'TELL THE LIE?', .5, .36, 120, '#ffffff', { stroke: '#111', strokeW: 14 });
      O.pop(g, t, .55, 'YES', .32, .5, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 });
      O.pop(g, t, .65, 'or', .5, .505, 90, '#ffffff', { stroke: '#111', strokeW: 10 });
      O.pop(g, t, .75, 'NO', .68, .5, 150, '#ff3b3b', { stroke: '#3d0000', strokeW: 16 });
    } },
];
