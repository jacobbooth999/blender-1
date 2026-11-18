// "Letter Town" shot list (times in seconds from voice/words.json, cuts ~2 frames before their word).
// cam: orbit {tgt, d, yaw, h, fov, push, dyaw, tgt2} or {pos, pos2, tgt, tgt2, fov}. Character ry 0 faces +z.
export const WORDS_URL = '../voice/words.json';

const base = {
  max: { shirt: '#ffb627', longSleeve: true, zip: true, pants: '#34568b', shoes: '#f0f0f0', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0' },
  mayor: { shirt: '#1d1d24', longSleeve: true, jacketOpen: '#ffcc2e', chain: true, hat: 'top', pants: '#1d1d24', shoes: '#0a0a0a', hair: 'grey', hairColor: '#9a9a9a', skin: '#e8b48a' },
  guard1: { shirt: '#141418', longSleeve: true, jacketOpen: '#141418', pants: '#141418', shoes: '#0a0a0a', hair: 'short', hairColor: '#111', skin: '#8d5a3b', sunglasses: true, earpiece: true },
  guard2: { shirt: '#141418', longSleeve: true, jacketOpen: '#141418', pants: '#141418', shoes: '#0a0a0a', hair: 'short', hairColor: '#3a2616', skin: '#e8b48a', sunglasses: true, earpiece: true },
  kid: { shirt: '#e53935', pants: '#2f5fa8', hat: 'cap', hatColor: '#1e88e5', hair: 'short', hairColor: '#2a1a10', skin: '#c98f5f', shoes: '#ffffff' },
  husband: { shirt: '#4a7fd6', stripe: '#2f5fb0', pants: '#6b5a45', hair: 'short', hairColor: '#1a1a1a', skin: '#e8b48a', shoes: '#3a2a1a' },
  lady: { shirt: '#b07ad9', longSleeve: true, pants: '#5a4a6a', hair: 'bun', hairColor: '#d8d8d8', skin: '#f2c9a0' },
  wife: { shirt: '#ff6fae', pants: '#7a3a6a', hair: 'long', hairColor: '#c4602a', skin: '#f2c9a0', shoes: '#ffffff' },
  kevin: { shirt: '#ff8a3d', pants: '#2f5fa8', hair: 'spiky', hairColor: '#2a1a10', skin: '#e8b48a', shoes: '#222' },
  bride: { shirt: '#26b5a5', pants: '#454545', hair: 'pony', hairColor: '#a0522d', skin: '#f2c9a0', shoes: '#ffffff' },
  e1: { shirt: '#ffd43b', pants: '#3a3a3a', hair: 'short', hairColor: '#e0b040', skin: '#f2c9a0' },
  e2: { shirt: '#8e5be0', pants: '#2f2f4f', hair: 'long', hairColor: '#1a1a1a', skin: '#8d5a3b' },
  e5: { shirt: '#f0f0f0', pants: '#2b4a7a', hair: 'short', hairColor: '#3a2616', skin: '#6b4226', zip: true },
  e6: { shirt: '#ff5a5a', pants: '#3a3a3a', hair: 'bun', hairColor: '#ffcc66', skin: '#f2c9a0' },
  e7: { shirt: '#4fc3f7', pants: '#5a4030', hat: 'beanie', hatColor: '#ff6f91', hair: 'short', hairColor: '#2a1a10', skin: '#c98f5f' },
  e8: { shirt: '#9ccc65', pants: '#3e2723', hair: 'spiky', hairColor: '#b03020', skin: '#f2c9a0' },
  e9: { shirt: '#ffb74d', pants: '#263238', hair: 'long', hairColor: '#4a2a10', skin: '#8d5a3b' },
  e10: { shirt: '#7e57c2', pants: '#212121', hat: 'cap', hatColor: '#43a047', hair: 'short', hairColor: '#111', skin: '#e8b48a' },
};
export const CAST = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, { ...v, badge: false }]));

// ---------- helpers ----------
const F = (px, pz, qx, qz) => Math.atan2(qx - px, qz - pz) * 180 / Math.PI;
const alt = (a, b, hz = 6) => (t) => Math.floor(t * hz) % 2 ? a : b;
const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
const SW = .3;
const BLUE = '#1d2c6b', RED = '#c0001a';
const L = {
  gold: { k: 'letter', key: 'gold', lines: ['Buy GOLD', 'today!'], sign: '- Future Dave', color: BLUE },
  fish: { k: 'letter', key: 'fish', lines: ["Don't eat", 'the fish on', 'Tuesday.'], sign: '- Future You', color: BLUE },
  kevin: { k: 'letter', key: 'kevin', lines: ['Do NOT', 'marry', 'Kevin.'], sign: '- Future You', color: '#a0003a' },
  socks: { k: 'letter', key: 'socks', lines: ['Wear the', 'blue socks.'], sign: '- Future You', color: BLUE },
  umb: { k: 'letter', key: 'umb', lines: ['Bring an', 'umbrella!'], sign: '- Future You', color: BLUE },
  job: { k: 'letter', key: 'job', lines: ['Say YES', 'to the job.'], sign: '- Future You', color: BLUE },
  warn: { k: 'letter', key: 'warn', lines: ['DO NOT LET', 'THE MAYOR', "DO WHAT HE'S", 'ABOUT TO DO'], sign: '- Future Max', color: RED, marker: true },
  burn: { k: 'letter', key: 'burn', lines: ['BURN THE', 'TOWN TO', 'THE GROUND.'], sign: '- Future Mayor', color: '#8a0000', marker: true },
  told: { k: 'letter', key: 'told', lines: ['Told you.', ';)'], sign: '- Future Max', color: BLUE },
};
const P = (spec, extra = {}) => ({ ...spec, ...extra });
// over-the-shoulder camera onto a letter held by a character at p facing ry (deg)
// the reader holds the letter up to the camera
function show(p, ry, dist = 3.3) {
  const a = ry * Math.PI / 180, f = [Math.sin(a), Math.cos(a)];
  const L0 = [p[0] + f[0] * 1.45, p[1] + 3.45, p[2] + f[1] * 1.45];
  return { pos: [L0[0] + f[0] * dist, L0[1] + .25, L0[2] + f[1] * dist], pos2: [L0[0] + f[0] * (dist - .5), L0[1] + .22, L0[2] + f[1] * (dist - .5)], tgt: [L0[0], L0[1] + .25, L0[2]], fov: 38 };
}
const showF = (p, ry) => { const a = ry * Math.PI / 180; return [p[0] + Math.sin(a) * 1.45, p[1] + 3.45, p[2] + Math.cos(a) * 1.45]; };
function ots(p, ry, side = 1, back = 1.6, up = 6.4, drift = .25) {
  const a = ry * Math.PI / 180, f = [Math.sin(a), Math.cos(a)], r = [Math.cos(a), -Math.sin(a)];
  const pos = [p[0] - f[0] * back + r[0] * 1.9 * side, p[1] + up, p[2] - f[1] * back + r[1] * 1.9 * side];
  const pos2 = [pos[0] + f[0] * drift, pos[1] - .15, pos[2] + f[1] * drift];
  const tgt = [p[0] + f[0] * 1.45, p[1] + 3.4, p[2] + f[1] * 1.45];
  return { pos, pos2, tgt, fov: 40 };
}
const ENV = (key, to, from) => ({ k: 'env', key, to, from });
const MAXH = [77.2, 0, -3.9];          // Max standing at his mailbox (facing it, ry 180)
const BOXIN = [77.2, 3.58, -6.1];      // inside Max's mailbox
const SQ = [-55, 0, 1.8];              // mayor at the square
const BAS = [600, 0, 1000];
const pv = (p) => [p[0], p[1], p[2]];
function openBox(W, b, k = 1) { b.door.rotation.x = Math.PI / 2 * k; }
function flagUp(W, b) { b.flag.rotation.x = 0; }
function fishOn(W, dz = 0) { W.slop.visible = false; W.fish.visible = true; W.fish.position.set(200, 3.12, 1001.8 + dz); W.plate.position.z = .8 + dz; }
function fireTown(c, t) {
  for (let i = 0; i < 8; i++) { const x = -38.5 + i * 11; c.FX.flame([x, 11.5, -14], 5, t, i + 1, 14); c.FX.flame([x - 3, 11, -11], 3.6, t, i + 20, 10); }
  for (let i = 0; i < 7; i++) { const x = -33.5 + i * 11; c.FX.flame([x, 11, 14], 4.6, t, i + 40, 12); }
}
// crowd helpers
function ring(ids, cx, cz, r0, facing, opts = {}) {
  return ids.map((id, i) => {
    const a = (opts.a0 || 0) + (i / ids.length) * (opts.span || Math.PI * 2), r = r0 + (i % 2) * (opts.dr ?? .9);
    const x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r;
    return { c: id, p: [x, opts.y || 0, z], ry: facing === 'in' ? F(x, z, cx, cz) : facing, ph: i * .37, ...opts.each?.(i, x, z) };
  });
}

export const SHOTS = [
  // 1 "In this town, every morning," — golden street, mailbox flags up, neighbours at their mailboxes
  { a: 0, b: 1.35, set: 'town', light: 'golden', dof: 0, shadow: 45,
    cam: { pos: [44, 4.8, .8], pos2: [40, 4.6, .8], tgt: [0, 5, -1.5], fov: 44 },
    fx: (t, c) => { for (const b of c.W.boxes) flagUp(c.W, b); },
    cast: [{ c: 'lady', p: [-27, 0, -3.9], ry: 180, pose: 'grab' }, { c: 'e1', p: [17, 0, -3.9], ry: 180, pose: 'grab', ph: .4 }, { c: 'e6', p: [6, 0, 3.9], ry: 0, pose: 'grab' },
      { c: 'e2', p: (t) => [26 - t, SW, 6.6], ry: -90, pose: 'walk' }] },
  // 2 "everyone gets a" — mailbox close-up: the door drops open, a letter inside
  { a: 1.35, b: 2.2, set: 'town', light: 'golden', dof: 12, shadow: 8, focus: [-5, 3.8, -5.4],
    cam: { pos: [-2.4, 4.9, -1.2], pos2: [-2.7, 4.75, -1.7], tgt: [-5, 3.8, -5.4], fov: 36 },
    fx: (t, c) => { const b = c.W.boxes[1]; flagUp(c.W, b); openBox(c.W, b, Math.min(1, Math.max(0, (t - .15) / .3))); c.FX.paper('env', 'n1', null, [-5, 3.62, -5.0], [-Math.PI / 2, 0, .1], .7, { to: 'Mrs. Lee', from: 'Future Mrs. Lee' }); } },
  // 3 "letter from their future self." — neighbours reading, delighted
  { a: 2.2, b: 3.74, set: 'town', light: 'golden', dof: 8, shadow: 20,
    cam: { tgt: [-5, 4.0, -5.8], d: 14, yaw: 0, h: .8, fov: 36, push: .08 },
    cast: [{ c: 'lady', p: [-8, SW, -6.3], ry: 25, pose: 'read', face: 'smile', props: [P(L.socks)] },
      { c: 'husband', p: [-2, SW, -6.4], ry: -20, pose: 'read', face: [[0, 'neutral'], [.6, 'grin']], props: [P(L.umb)], ph: .5 },
      { c: 'kid', p: [-5, 0, -4.3], ry: 10, pose: 'read', face: 'grin', props: [P(L.job)], ph: 1 }] },
  // 4 "Buy gold today." — over the shoulder
  { a: 3.74, b: 4.88, set: 'town', light: 'golden', dof: 11, shadow: 10, focus: showF([-2, SW, -6.4], 0),
    cam: show([-2, SW, -6.4], 0),
    cast: [{ c: 'husband', p: [-2, SW, -6.4], ry: 0, pose: 'read', face: 'grin', props: [P(L.gold, { out: true })] }],
    fx: (t, c) => c.FX.coins(t, .75, [-2, 4.4, -4.6], 26, 1.1, 5) },
  // 5 "Don't eat the fish" — kitchen, over the shoulder
  { a: 4.88, b: 5.75, set: 'inter', light: 'room', dof: 10, shadow: 10, focus: showF([200, 0, 1005.6], 180),
    cam: show([200, 0, 1005.6], 180),
    cast: [{ c: 'e1', p: [200, 0, 1005.6], ry: 180, pose: 'read', props: [P(L.fish, { out: true })] }],
    fx: (t, c) => fishOn(c.W) },
  // 6 "on Tuesday." — plate pushed away, relief
  { a: 5.75, b: 6.43, set: 'inter', light: 'room', dof: 10, shadow: 10,
    cam: { tgt: [200, 3.9, 1005.6], d: 5.4, yaw: 186, h: -.3, fov: 34, push: .1 },
    cast: [{ c: 'e1', p: [200, 0, 1005.6], ry: 180, pose: 'serve', face: [[0, 'worried'], [.35, 'smile']] }],
    fx: (t, c) => fishOn(c.W, -Math.min(1.6, t * 4)) },
  // 7 "Do not marry" — the bride reads, Kevin waits with a ring
  { a: 6.43, b: 7.1, set: 'town', light: 'golden', dof: 11, shadow: 10, focus: showF([21.5, 0, -2.6], 120),
    cam: show([21.5, 0, -2.6], 120),
    cast: [{ c: 'bride', p: [21.5, 0, -2.6], ry: 120, pose: 'read', face: 'shock', props: [P(L.kevin, { out: true })] }] },
  // 8 "Kevin." — she walks off, Kevin's face drops
  { a: 7.1, b: 7.73, set: 'town', light: 'golden', dof: 10, shadow: 12,
    cam: { tgt: [24.4, 4.4, -2.6], d: 6.6, yaw: -52, h: 0, fov: 34, push: .1 },
    cast: [{ c: 'kevin', p: [24.6, 0, -2.6], ry: -90, pose: 'holdOne', face: [[0, 'smile'], [.3, 'sad']], props: [{ k: 'ring' }] },
      { c: 'bride', p: (t) => [21.5 - Math.max(0, t - .15) * 3.2, 0, -2.6 + Math.max(0, t - .15) * 1.2], ry: (t) => t < .15 ? 90 : -110, pose: (t) => t < .15 ? 'idle' : 'walk', face: 'neutral' }] },
  // 9 "Nobody here ever makes a mistake." — confident town, everyone reading
  { a: 7.73, b: 9.66, set: 'town', light: 'golden', dof: 0, shadow: 40,
    cam: { pos: [30, 8, 4], pos2: [25, 6.5, 3.5], tgt: [0, 3.5, -2], fov: 42 },
    cast: [{ c: 'e5', p: (t) => [10 - t * 1.3, SW, -6.4], ry: -90, pose: 'walk', props: [P(L.socks)] }, { c: 'e7', p: (t) => [4 + t * 1.2, SW, 6.6], ry: 90, pose: 'walk', ph: .3 },
      { c: 'e8', p: (t) => [-4 + t * 1.3, SW, -6.6], ry: 90, pose: 'walk', ph: .6 }, { c: 'e9', p: [14, SW, 6.4], ry: -150, pose: 'read', face: 'smile', props: [P(L.job)] },
      { c: 'e10', p: (t) => [20 - t * 1.4, SW, 6.8], ry: -90, pose: 'walk', ph: .2 }, { c: 'wife', p: [8, SW, -6.4], ry: 20, pose: 'read', face: 'grin', props: [P(L.umb)] }] },
  // 10 "Except Max." — meet Max
  { a: 9.66, b: 10.7, set: 'town', light: 'golden', dof: 11, shadow: 10,
    cam: { tgt: [78.6, 4.5, -3.6], d: 5.2, yaw: 4, h: .1, fov: 34, push: .1 },
    cast: [{ c: 'max', p: [78.6, 0, -3.6], ry: 0, pose: 'wave', face: [[0, 'smile'], [.6, 'worried']] }] },
  // 11 "Max has never gotten a single letter." — POV from inside the empty mailbox
  { a: 10.7, b: 12.59, set: 'town', light: 'golden', dof: 6, shadow: 8, focus: [77.2, 4.7, -3.9],
    cam: { pos: [77.2, 3.74, -6.66], pos2: [77.2, 3.74, -6.58], tgt: [77.2, 4.55, -3.0], fov: 80 },
    cast: [{ c: 'max', p: [77.2, 0, -3.7], ry: 180, pose: (t) => ({ lean: .08, armR: [Math.PI / 2.2, .1], head: [0, .05] }), face: [[0, 'neutral'], [.9, 'sad']] }],
    fx: (t, c) => { openBox(c.W, c.W.maxBox); c.W.maxBox.liner.visible = false; } },
  // 12 "Every morning," — Max at his mailbox again
  { a: 12.59, b: 13.6, set: 'town', light: 'golden', dof: 4, shadow: 18,
    cam: { pos: [84, 4.6, 4.2], pos2: [83, 4.5, 3.6], tgt: [77.6, 3.6, -4.8], fov: 40 },
    cast: [{ c: 'max', p: MAXH, ry: 180, pose: 'grab', face: 'sad' }],
    fx: (t, c) => openBox(c.W, c.W.maxBox, Math.min(1, t * 3)) },
  // 13 "his mailbox is empty." — empty
  { a: 13.6, b: 14.71, set: 'town', light: 'golden', dof: 8, shadow: 6, focus: [77.2, 3.7, -6.2],
    cam: { tgt: [77.2, 4.55, -3.9], d: 4.6, yaw: 160, h: .1, fov: 34, push: .12 },
    cast: [{ c: 'max', p: MAXH, ry: 160, pose: 'idle', face: 'sad' }],
    fx: (t, c) => openBox(c.W, c.W.maxBox),
    ov: (g, t, O) => O.pop(g, t, .5, '0 LETTERS', .5, .78, 120, '#ff3b3b', { stroke: '#3d0000', strokeW: 14 }) },
  // 14 "He buys the wrong stocks," — his stocks crash on the big screen
  { a: 14.71, b: 15.75, set: 'town', light: 'day', dof: 3, shadow: 20, shadowAt: [-55, 0, 2],
    cam: { pos: [-52.4, 5.4, 10.5], pos2: [-52.8, 5.6, 9.6], tgt: [-55, 8, -6], fov: 44 },
    cast: [{ c: 'max', p: [-55.4, 0, 4], ry: 185, pose: 'facepalm', face: 'shock' }],
    fx: (t, c) => { c.W.stockScreen.visible = true; c.W.screen.visible = false; } },
  // 15 "he eats the bad fish," — green
  { a: 15.75, b: 16.63, set: 'inter', light: 'room', dof: 11, shadow: 10,
    cam: { tgt: [200, 4.2, 1005.6], d: 4.8, yaw: 182, h: -.2, fov: 34, push: .12 },
    cast: [{ c: 'max', p: [200, 0, 1005.6], ry: 180, pose: 'eat', face: [[0, 'neutral'], [.35, 'sick']] }],
    fx: (t, c) => fishOn(c.W) },
  // 16 "and everyone thinks he's cursed." — the town points and laughs (Max's view)
  { a: 16.63, b: 18.64, set: 'town', light: 'golden', dof: 6, shadow: 18, shadowAt: [34, 0, -6],
    cam: { pos: [34, 3.0, 2.8], pos2: [34, 3.1, 2.2], tgt: [34, 4.6, -6.4], fov: 40 },
    cast: [{ c: 'kid', p: [30.8, SW, -6.2], ry: 10, pose: 'laughPoint', face: 'laugh' }, { c: 'lady', p: [33, SW, -6.6], ry: 0, pose: 'laughPoint', face: 'smug', ph: .3 },
      { c: 'husband', p: [35.4, SW, -6.3], ry: -8, pose: 'laughPoint', face: 'laugh', ph: .6 }, { c: 'e2', p: [37.6, SW, -6.6], ry: -18, pose: 'laughPoint', face: 'laugh', ph: .9 }],
    ov: (g, t, O) => O.stamp(g, t, 1.25, 'CURSED', .5, .74, 130, '#ff3b3b', -.14) },
  // 17 "Then one morning," — the mailbox starts to rattle
  { a: 18.64, b: 19.85, set: 'town', light: 'golden', dof: 5, shadow: 18,
    cam: { tgt: [77.6, 3.6, -4.8], d: 10, yaw: -38, h: .6, fov: 40, push: .1 },
    cast: [{ c: 'max', p: (t) => [lerp(80.2, 77.2, t / .8), 0, lerp(-.8, -3.9, t / .8)], ry: (t) => t < .8 ? -136 : 180, pose: (t) => t < .8 ? 'walk' : 'idle', face: [[0, 'neutral'], [.75, 'worried']] }],
    fx: (t, c) => { const b = c.W.maxBox; const k = Math.max(0, t - .55); b.bx.rotation.z = Math.sin(t * 45) * .05 * Math.min(1, k * 3); b.bx.position.y = 3.2 + Math.abs(Math.sin(t * 38)) * .06 * Math.min(1, k * 3); } },
  // 18 "his mailbox exploded." — BOOM
  { a: 19.85, b: 20.86, set: 'town', light: 'golden', dof: 4, shadow: 18, kicks: [[.3, .35], [.42, .15]],
    cam: { pos: [72.2, 4.6, 3.8], pos2: [71.6, 4.8, 4.5], tgt: [77.4, 3.8, -4.8], fov: 42 },
    cast: [{ c: 'max', p: (t) => [77.2, 0, -3.9 + Math.max(0, t - .3) * 1.6], ry: 180, pose: 'scared', face: [[0, 'worried'], [.3, 'shock']] }],
    fx: (t, c) => { const b = c.W.maxBox; if (t < .3) { b.bx.rotation.z = Math.sin(t * 60) * .08; } else { openBox(c.W, b); b.bx.rotation.z = Math.sin(t * 30) * .1 * Math.max(0, 1 - (t - .3) * 2); flagUp(c.W, b); }
      c.FX.envBurst(t, .3, [77.2, 4.0, -5.1], 380, 1, 1, .02); } },
  // 19 "Hundreds of letters." — buried
  { a: 20.86, b: 21.9, set: 'town', light: 'golden', dof: 0, shadow: 20,
    cam: { pos: [81.5, 11.5, 2.5], pos2: [81, 11, 2], tgt: [77.3, 1.2, -3.6], fov: 40 },
    cast: [{ c: 'max', p: [77.6, 0, -3.2], ry: 20, pose: 'armsUp', face: 'shock' }],
    fx: (t, c) => { openBox(c.W, c.W.maxBox); flagUp(c.W, c.W.maxBox); c.FX.envPile([77.4, .02, -3.4], 4.6, 560, 4, 1.7); c.FX.envRain(t, [77.4, 0, -3.2], [9, 12, 9], 120); } },
  // 20 "All from future Max." — the envelope
  { a: 21.9, b: 23.03, set: 'town', light: 'golden', dof: 12, shadow: 8, focus: [77.6, 2.2, -1.4],
    cam: { pos: [77.6, 3.25, .1], pos2: [77.6, 3.05, -.2], tgt: [77.6, 2.1, -1.5], fov: 34 },
    fx: (t, c) => { c.FX.envPile([77.4, .02, -3.0], 4.6, 420, 4, 1.7); c.FX.paper('env', 'maxenv', null, [77.6, 2.15, -1.45], [-1.0, 0, -.06], .95, { to: 'Max', from: 'Future Max' }); } },
  // 21 "And every single one" — tearing them open
  { a: 23.03, b: 24.1, set: 'town', light: 'golden', dof: 10, shadow: 10,
    cam: { tgt: [77.6, 4.1, -3.2], d: 5.6, yaw: 8, h: .3, fov: 36, push: .1 },
    cast: [{ c: 'max', p: [77.6, 0, -3.2], ry: 0, pose: 'read', face: alt('worried', 'shock', 5), props: (t) => [Math.floor(t * 5) % 2 ? ENV('a', 'Max', 'Future Max') : P(L.warn)] }],
    fx: (t, c) => { c.FX.envPile([77.4, .02, -3.0], 4.6, 420, 4, 1.7); c.FX.envBurst(t, 0, [77.6, 3.6, -2.6], 14, .45, 7, 1.2); } },
  // 22 "said the same thing." — every letter, the same words
  { a: 24.1, b: 25.18, set: 'town', light: 'golden', dof: 9, shadow: 8, focus: [77.6, 1.8, -1.6],
    cam: { pos: [77.6, 4.9, .4], pos2: [77.6, 4.6, .1], tgt: [77.6, 1.7, -1.7], fov: 38 },
    fx: (t, c) => { c.FX.envPile([77.4, .02, -3.0], 4.6, 420, 4, 1.7);
      [[-0.55, .1, -.25], [.5, -.05, .2], [0, .2, 0]].forEach(([dx, dz, r], i) => c.FX.paper('letter', 'warn', L.warn.lines, [77.6 + dx, 1.75 + i * .03, -1.7 + dz], [-Math.PI / 2 + .25, 0, r], .9, { color: RED, sign: '- Future Max', marker: true })); } },
  // 23 "Do not let the mayor do what he's about to do." — the message
  { a: 25.18, b: 26.55, set: 'town', light: 'golden', dof: 12, shadow: 8, focus: [77.6, 4.2, -1.0],
    cam: { pos: [77.6, 4.45, 2.3], pos2: [77.6, 4.4, 1.6], tgt: [77.6, 4.45, -1.0], fov: 38 },
    fx: (t, c) => c.FX.paper('letter', 'warn', L.warn.lines, [77.6, 4.1, -1.0], [0, 0, -.03], 1, { color: RED, sign: '- Future Max', marker: true }) },
  // 24 Max looks toward the mansion
  { a: 26.55, b: 27.56, set: 'town', light: 'golden', dof: 12, shadow: 8,
    cam: { tgt: [77.6, 4.6, -3.2], d: 4.4, yaw: 0, h: 0, fov: 32, push: .14 },
    cast: [{ c: 'max', p: [77.6, 0, -3.2], ry: 0, pose: (t) => ({ armL: [.2, -.05], armR: [.2, .05], head: [Math.min(1, t * 2) * -.6, 0] }), face: [[0, 'shock'], [.45, 'determined']] }] },
  // 25 "So that night," — the gold mansion at night
  { a: 27.56, b: 28.9, set: 'town', light: 'night', dof: 0, shadow: 40, shadowAt: [52, 0, 18],
    cam: { pos: [67, 3, -9], pos2: [65.5, 3.2, -8.4], tgt: [52, 9, 20], fov: 46 },
    ov: (g, t, O) => O.pop(g, t, .05, 'THAT NIGHT', .5, .12, 80, '#ffffff', { stroke: '#111', strokeW: 12 }) },
  // 26 "Max sneaked into the mayor's mansion." — tiptoe along the gold fence
  { a: 28.9, b: 30.16, set: 'town', light: 'night', dof: 8, shadow: 15,
    cam: { tgt: [59.5, 3.4, 7.8], tgt2: [59.5 - 1.3 * 1.26, 3.4, 7.8], d: 9, yaw: -112, h: 0, fov: 38, push: 0, ease: 'lin' },
    cast: [{ c: 'max', p: (t) => [59.5 - 1.3 * t, SW, 7.8], ry: -90, pose: 'sneak', face: 'worried' }] },
  // 27 "He crawled past the guards," — floor level in the mansion
  { a: 30.16, b: 31.3, set: 'inter', light: 'officeNight', dof: 7, shadow: 14, focus: [393, 1.0, 1001],
    cam: { pos: [389.4, 1.5, 996.8], pos2: [389.5, 1.48, 996.6], tgt: [394, 1.4, 1001.6], fov: 48 },
    cast: [{ c: 'max', p: (t) => [399 - 1.3 * t, .5, 1001], ry: -90, rx: 90, pose: 'crawl', face: 'determined' },
      { c: 'guard1', p: [397, 0, 1006.6], ry: 80, pose: 'talk', face: 'smug' }, { c: 'guard2', p: [400.4, 0, 1006.9], ry: -100, pose: 'idle', face: 'laugh', ph: .7 }],
    fx: (t, c) => { c.W.goldPile.visible = false; } },
  // 28 "hid behind the curtains," — peeking out
  { a: 31.3, b: 32.45, set: 'inter', light: 'officeNight', dof: 9, shadow: 12,
    cam: { pos: [395.5, 5.0, 1001.8], pos2: [395, 4.9, 1002.1], tgt: [388.9, 4.5, 1003.4], fov: 36 },
    cast: [{ c: 'max', p: [388.3, 0, 1003.9], ry: 90, pose: 'peek', face: 'worried' }] },
  // 29 "and watched the mayor" — over Max's head to the desk
  { a: 32.45, b: 33.42, set: 'inter', light: 'officeNight', dof: 9, shadow: 14, focus: [400, 4.6, 994.6],
    cam: { pos: [389.8, 5.3, 1005.4], pos2: [390.2, 5.2, 1005], tgt: [400, 4.3, 994.8], fov: 38 },
    cast: [{ c: 'max', p: [388.3, 0, 1003.9], ry: 90, pose: 'peek', face: 'worried' },
      { c: 'mayor', p: [400, 0, 994.6], ry: 0, pose: 'read', face: 'neutral', props: [ENV('gold', 'Mayor', 'Future Mayor')] }] },
  // 30 "open his own letter." — reads it, grins
  { a: 33.42, b: 34.87, set: 'inter', light: 'officeNight', dof: 13, shadow: 10,
    cam: { tgt: [400, 4.6, 994.6], d: 4.6, yaw: 14, h: 0, fov: 32, push: .12 },
    cast: [{ c: 'mayor', p: [400, 0, 994.6], ry: 0, pose: 'read', face: [[0, 'neutral'], [.6, 'smug'], [1.1, 'grin']], props: (t) => [t < .4 ? ENV('gold', 'Mayor', 'Future Mayor') : P(L.burn)] }] },
  // 31 "It said: burn the town to the ground."
  { a: 34.87, b: 36.3, set: 'inter', light: 'officeNight', dof: 12, shadow: 8, focus: [400, 4.15, 997.6],
    cam: { pos: [400, 4.45, 1000.8], pos2: [400, 4.4, 1000.1], tgt: [400, 4.45, 997.6], fov: 38 },
    fx: (t, c) => c.FX.paper('letter', 'burn', L.burn.lines, [400, 4.1, 997.6], [0, 0, .03], 1, { color: '#8a0000', sign: '- Future Mayor', marker: true }) },
  // 32 "ground." — what that would look like
  { a: 36.3, b: 36.86, set: 'town', light: 'fire', dof: 0, shadow: 50, kicks: [[.05, .2]],
    cam: { pos: [22, 5, 2], pos2: [20, 5.4, 2], tgt: [-10, 7, -6], fov: 44 },
    fx: (t, c) => { fireTown(c, t); c.OV.flash = Math.max(0, .5 - t * 2); } },
  // 33 "And the mayor always does what his letter says." — evil laugh
  { a: 36.86, b: 38.25, set: 'inter', light: 'officeNight', dof: 12, shadow: 10,
    cam: { tgt: [400, 4.8, 994.6], d: 5, yaw: -6, h: -1.4, fov: 34, push: .12, dyaw: 6 },
    cast: [{ c: 'mayor', p: [400, 0, 994.6], ry: 0, pose: 'armsUp', face: [[0, 'smug'], [.4, 'laugh']] }] },
  // 34 Max, horrified
  { a: 38.25, b: 39.29, set: 'inter', light: 'officeNight', dof: 12, shadow: 8,
    cam: { tgt: [388.4, 4.65, 1003.9], d: 4.4, yaw: 90, h: 0, fov: 32, push: .14 },
    cast: [{ c: 'max', p: [388.3, 0, 1003.9], ry: 90, pose: 'peek', face: 'shock' }] },
  // 35 "Max ran to warn everyone." — running through the night
  { a: 39.29, b: 40.79, set: 'town', light: 'night', dof: 8, shadow: 20,
    cam: { tgt: [-20, 4.0, 1], tgt2: [-20 - 6.5 * 1.5, 4.0, 1], d: 8, yaw: -100, h: 0, fov: 36, push: 0, ease: 'lin' },
    cast: [{ c: 'max', p: (t) => [-20 - 6.5 * t, 0, 1], ry: -90, pose: 'run', face: 'determined' }] },
  // 36 "But who believes" — Max yelling in the square
  { a: 40.79, b: 42.0, set: 'town', light: 'night', dof: 8, shadow: 15, shadowAt: [-55, 0, 9],
    cam: { pos: [-50, 4.8, 10.2], pos2: [-50.3, 4.7, 9.7], tgt: [-55, 4.3, 7], fov: 40 },
    cast: [{ c: 'max', p: [-55, 0, 6.5], ry: 0, pose: 'armsUp', face: alt('shock', 'worried', 4) },
      ...['lady', 'husband', 'wife', 'kid', 'e1', 'e5'].map((id, i) => ({ c: id, p: [-58.5 + i * 1.5 + (i % 2) * .4, 0, 11.4 + (i % 3) * 1.1], ry: 180 + (i - 2.5) * 8, face: 'neutral', ph: i * .3 }))] },
  // 37 "the cursed kid with no letters?" — they laugh it off (Max's view)
  { a: 42.0, b: 43.26, set: 'town', light: 'night', dof: 6, shadow: 15, shadowAt: [-55, 0, 12],
    cam: { pos: [-55, 4.5, 6.8], pos2: [-55, 4.4, 7.3], tgt: [-56, 4.4, 12], fov: 44 },
    cast: ['lady', 'husband', 'wife', 'kid', 'e1', 'e5'].map((id, i) => ({ c: id, p: [-58.5 + i * 1.5 + (i % 2) * .4, 0, 11.4 + (i % 3) * 1.1], ry: 180 + (i - 2.5) * 8, ph: i * .3,
      pose: ['laughPoint', 'shrug', 'laughPoint', 'read', 'shrug', 'laughPoint'][i], face: ['laugh', 'smug', 'laugh', 'smug', 'smug', 'laugh'][i], props: i === 3 ? [P(L.job, { out: false })] : [] })) },
  // 38 "The guards caught him," — carried off
  { a: 43.26, b: 44.13, set: 'town', light: 'night', dof: 8, shadow: 15,
    cam: { tgt: [-55, 4.4, 6.2], d: 9.5, yaw: 6, h: .4, fov: 38, push: .08 },
    cast: [{ c: 'max', p: (t) => [-55 - t * .8, 1.0, 6.2], ry: 0, pose: 'carried', face: 'shock' },
      { c: 'guard1', p: (t) => [-57.2 - t * .8, 0, 6.2], ry: 90, pose: 'grab', face: 'smug' }, { c: 'guard2', p: (t) => [-52.8 - t * .8, 0, 6.2], ry: -90, pose: 'grab', face: 'smug' }] },
  // 39 "and locked him in the basement." — door slam
  { a: 44.13, b: 45.75, set: 'inter', light: 'basement', dof: 6, shadow: 14, kicks: [[.55, .2]], shadowAt: [602, 0, 1003],
    cam: { pos: [599.6, 3.6, 997], pos2: [599.8, 3.5, 997.4], tgt: [603.2, 2.6, 1005], fov: 42 },
    cast: [{ c: 'max', p: (t) => [lerp(603.6, 601.8, t / .6), 0, lerp(1005.6, 1002.6, t / .6)], ry: 200, pose: 'scared', face: [[0, 'shock'], [.7, 'sad']] }],
    fx: (t, c) => { c.W.basLight.intensity = 22; c.W.bulb.position.x = Math.sin(t * 5) * .4 * Math.max(0, 1 - Math.max(0, t - .55) * .5); } },
  // 40 "No letter could tell him what to do now." — alone in the dark
  { a: 45.75, b: 47.72, set: 'inter', light: 'basement', dof: 5, shadow: 14, shadowAt: [600, 0, 1001],
    cam: { tgt: [600, 2.2, 998], d: 7.5, yaw: 25, h: 3.2, fov: 40, push: .1 },
    cast: [{ c: 'max', p: [600, -1.85, 998], ry: 20, pose: 'sitSad', face: 'sad' }],
    fx: (t, c) => { c.W.basLight.intensity = 22; c.W.bulb.position.x = Math.sin(t * 2 + 1) * .12; } },
  // 41 "So for the first time, someone in this town" — he looks up
  { a: 47.72, b: 49.78, set: 'inter', light: 'basement', dof: 12, shadow: 8, shadowAt: [600, 0, 1001],
    cam: { tgt: [600, 2.85, 998], d: 4.4, yaw: 20, h: .2, fov: 32, push: .14 },
    cast: [{ c: 'max', p: [600, -1.85, 998], ry: 20, pose: (t) => ({ armL: [.9, .3], armR: [.9, -.3], legL: Math.PI / 2, legR: Math.PI / 2, lean: .1, head: [t > 1.2 ? .35 : 0, t > 1.2 ? -.35 : .25] }), face: [[0, 'sad'], [.9, 'worried'], [1.5, 'determined']] }],
    fx: (t, c) => { c.W.basLight.intensity = 22; } },
  // 42 "had to figure it out alone." — the crates, the tiny window
  { a: 49.78, b: 51.04, set: 'inter', light: 'basement', dof: 4, shadow: 12, shadowAt: [597, 0, 995],
    cam: { pos: [600.4, 3.0, 1000.4], pos2: [599.8, 3.4, 999.4], tgt: [597.4, 5.8, 993.4], fov: 42 },
    fx: (t, c) => { c.W.basLight.intensity = 22; c.W.crates[2].visible = false; },
    ov: (g, t, O) => O.pop(g, t, .08, '!', .5, .2, 220, '#ffd43b', { stroke: '#3a2a00', strokeW: 16 }) },
  // 43 "He stacked the boxes," — climbing up
  { a: 51.04, b: 52.05, set: 'inter', light: 'basement', dof: 6, shadow: 12, shadowAt: [597, 0, 995],
    cam: { tgt: [597.8, 3.6, 995.6], d: 8, yaw: 32, h: 1, fov: 42, push: .1 },
    cast: [{ c: 'max', p: [598.4, 0, 996.8], ry: 195, pose: 'stack', face: 'determined' }],
    fx: (t, c) => { c.W.basLight.intensity = 22; const cr = c.W.crates[2]; cr.visible = t > .3; cr.position.y = 2.7 + Math.max(0, .6 - t) * 3; } },
  // 44 "squeezed through the tiny window," — out the mansion wall
  { a: 52.05, b: 53.5, set: 'town', light: 'night', dof: 8, shadow: 12, shadowAt: [40, 0, 22],
    cam: { pos: [36.4, 1.7, 25.4], pos2: [36.8, 1.6, 25], tgt: [40, .9, 22], fov: 40 },
    cast: [{ c: 'max', p: (t) => [41 + 4.4 - Math.min(1, t / 1.3) * 2.2 + Math.sin(t * 14) * .05, .28, 22], ry: -90, rx: 90, pose: 'crawl', face: 'determined' }] },
  // 45 "and sprinted to the square." — full speed
  { a: 53.5, b: 54.86, set: 'town', light: 'night', dof: 8, shadow: 20,
    cam: { tgt: [-24, 4.0, 1.4], tgt2: [-24 - 7 * 1.36, 4.0, 1.4], d: 7.5, yaw: -72, h: -.2, fov: 36, push: 0, ease: 'lin' },
    cast: [{ c: 'max', p: (t) => [-24 - 7 * t, 0, 1.4], ry: -90, pose: 'run', face: 'determined' }] },
  // 46 "The mayor was striking" — gas cans all around the square
  { a: 54.86, b: 55.85, set: 'town', light: 'night', dof: 0, shadow: 30, shadowAt: [-55, 0, 2],
    cam: { pos: [-43.5, 7.2, 16.5], pos2: [-44.5, 6.8, 15.5], tgt: [-55, 3, 0], fov: 42 },
    cast: [{ c: 'mayor', p: SQ, ry: 20, pose: 'strike', face: 'smug', props: [{ k: 'match' }] }],
    fx: (t, c) => { for (const g of c.W.gas) g.visible = true; c.W.puddle.visible = true; } },
  // 47 "the first match." — it lights
  { a: 55.85, b: 56.81, set: 'town', light: 'night', dof: 12, shadow: 10,
    cam: { tgt: [-53.8, 4.6, 3.1], d: 4.6, yaw: 30, h: -.2, fov: 34, push: .14 },
    cast: [{ c: 'mayor', p: SQ, ry: 20, pose: 'strike', face: [[0, 'smug'], [.55, 'laugh']], props: [{ k: 'match', lit: true, litAt: .5 }] }],
    fx: (t, c) => { for (const g of c.W.gas) g.visible = true; c.W.puddle.visible = true; } },
  // 48 "Max dove." — flying tackle
  { a: 56.81, b: 57.88, set: 'town', light: 'night', dof: 4, shadow: 18, kicks: [[.78, .3]],
    cam: { pos: [-50.5, 3.2, 12], pos2: [-51, 3.0, 11.4], tgt: [-52, 2.6, 2], fov: 42 },
    cast: [{ c: 'max', p: (t) => [-44.5 - Math.min(1, t / .85) * 8.6, 1.7 - Math.min(1, t / .85) * .7, 2.0], ry: -90, rx: 90, pose: 'dive', face: 'determined' },
      { c: 'mayor', p: SQ, ry: (t) => t < .78 ? 60 : 60, rx: (t) => t < .78 ? 0 : -Math.min(80, (t - .78) * 400), pose: (t) => t < .7 ? 'strike' : 'scared', face: (t) => t < .55 ? 'smug' : 'shock', props: (t) => t < .78 ? [{ k: 'match', lit: true }] : [] }],
    fx: (t, c) => { for (const g of c.W.gas) g.visible = true; c.W.puddle.visible = true; } },
  // 49 "The match landed in a puddle." — tssss
  { a: 57.88, b: 59.48, set: 'town', light: 'night', dof: 10, shadow: 8, focus: [-54, .2, 4],
    cam: { pos: [-52.4, .95, 6.4], pos2: [-52.6, .85, 6.1], tgt: [-54, .25, 4], fov: 38 },
    fx: (t, c) => { for (const g of c.W.gas) g.visible = true; c.W.puddle.visible = true;
      const k = Math.min(1, t / .55), m = c.W.wmatch; m.visible = true;
      m.position.set(lerp(-53.1, -54, k), lerp(3.6, .06, k * k), lerp(3.1, 4.0, k)); m.rotation.set(k * 6, 0, k < 1 ? k * 9 : Math.PI / 2);
      if (k < 1) c.FX.flame([m.position.x, m.position.y + .35, m.position.z], .25, t, 9, 6); else c.FX.steam(t, .55, [-54, .1, 4], 12); } },
  // 50 "And the mayor's letter" — the mayor flat on his back, the letter slips out
  { a: 59.48, b: 60.33, set: 'town', light: 'night', dof: 6, shadow: 14,
    cam: { tgt: [-56, 1.6, 1.8], d: 10, yaw: 22, h: 3.2, fov: 38, push: .08 },
    cast: [{ c: 'mayor', p: [-52.8, .5, 1.8], ry: 90, rx: -90, pose: 'lying', face: 'shock' }, { c: 'max', p: [-50.6, 0, 2.6], ry: -100, pose: 'idle', face: 'determined' }],
    fx: (t, c) => { c.W.puddle.visible = true; for (const g of c.W.gas) g.visible = true; c.FX.paper('letter', 'burn', L.burn.lines, [-55.6 + t * .3, 1.2 + t * 2.4, 1.8 + Math.sin(t * 6) * .3], [Math.sin(t * 5) * .6 - .6, t * 2, Math.cos(t * 4) * .4], .8, { color: '#8a0000', sign: '- Future Mayor', marker: true }); } },
  // 51 "fell out of his pocket." — it flutters down, face up
  { a: 60.33, b: 61.47, set: 'town', light: 'night', dof: 9, shadow: 8, focus: [-54, .4, 6.5],
    cam: { pos: [-53, 3.2, 9.6], pos2: [-53.2, 2.8, 9.2], tgt: [-54, .6, 6.5], fov: 38 },
    fx: (t, c) => { c.W.puddle.visible = true; const k = Math.min(1, t / .8);
      c.FX.paper('letter', 'burn', L.burn.lines, [-54 + Math.sin(k * 9) * .5 * (1 - k), lerp(4.4, .06, k), lerp(5.8, 6.5, k)], k < 1 ? [-1.2 + Math.sin(k * 10) * .5, 0, Math.sin(k * 8) * .4] : [-Math.PI / 2, 0, .3], .9, { color: '#8a0000', sign: '- Future Mayor', marker: true }); } },
  // 52 "The whole town read it." — shock, then fury at the mayor
  { a: 61.47, b: 62.92, set: 'town', light: 'night', dof: 5, shadow: 18, shadowAt: [-54, 0, 6.5],
    cam: { pos: [-50.5, 13, 16], pos2: [-50.8, 12.6, 15.3], tgt: [-54.3, 2.2, 6.2], fov: 42 },
    cast: ring(['lady', 'husband', 'wife', 'kid', 'e1', 'e5', 'e6', 'e7'], -54, 6.5, 2.7, 'in', { a0: Math.PI * .65, span: Math.PI * 1.7, dr: .8,
      each: (i, x, z) => ({ pose: 'idle', face: [[0, 'shock'], [.85, 'angry']], ry: (t) => t < .9 ? F(x, z, -54, 6.5) : F(x, z, -57, 1.8) }) }),
    fx: (t, c) => { c.W.puddle.visible = true; c.FX.paper('letter', 'burn', L.burn.lines, [-54, .06, 6.5], [-Math.PI / 2, 0, .3], .9, { color: '#8a0000', sign: '- Future Mayor', marker: true }); } },
  // 53 "The mayor got the basement." — his turn
  { a: 62.92, b: 64.31, set: 'inter', light: 'basement', dof: 11, shadow: 10, shadowAt: [600, 0, 1001],
    cam: { tgt: [600, 2.8, 998], d: 5.4, yaw: 20, h: .4, fov: 34, push: .12 },
    cast: [{ c: 'mayor', p: [600, -1.85, 998], ry: 20, pose: 'sitSad', face: 'cry' }],
    fx: (t, c) => { c.W.basLight.intensity = 22; } },
  // 54 "Max got a parade." — lifted up, confetti
  { a: 64.31, b: 65.56, set: 'town', light: 'day', dof: 4, shadow: 25, shadowAt: [0, 0, 0],
    cam: { pos: [15, 3.6, 2.6], pos2: [14, 3.7, 2.4], tgt: [0, 5.2, -.5], fov: 44 },
    cast: [{ c: 'max', p: (t) => [0, 2.5 + Math.abs(Math.sin(t * 6)) * .3, -.5], ry: 70, pose: 'cheer', face: 'grin' },
      ...['lady', 'husband', 'wife', 'kid', 'e1', 'e5', 'e6', 'e7', 'kevin', 'bride'].map((id, i) => {
        const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); const z = -.5 + side * (1.7 + (k % 2) * 1.5), x = -3.5 + k * 1.9;
        return { c: id, p: [x, 0, z], ry: 75 + side * 15, pose: 'cheer', ph: i * .27, face: i % 3 ? 'grin' : 'laugh' };
      })],
    fx: (t, c) => c.FX.confetti(t, [2, 0, -.5], [14, 13, 9], 420) },
  // 55 "And the next morning, there was finally" — the flag is up
  { a: 65.56, b: 67.39, set: 'town', light: 'golden', dof: 4, shadow: 18,
    cam: { pos: [71.4, 4.4, 4.2], pos2: [72.2, 4.3, 3.4], tgt: [77.5, 3.7, -4.6], fov: 40 },
    cast: [{ c: 'max', p: (t) => [lerp(80.6, 77.2, t / 1.3), 0, lerp(.2, -3.9, t / 1.3)], ry: (t) => t < 1.3 ? -140 : 180, pose: (t) => t < 1.3 ? 'walk' : 'grab', face: [[0, 'neutral'], [.6, 'shock']] }],
    fx: (t, c) => { flagUp(c.W, c.W.maxBox); if (t > 1.4) openBox(c.W, c.W.maxBox, Math.min(1, (t - 1.4) * 3)); },
    ov: (g, t, O) => O.pop(g, t, .05, 'THE NEXT MORNING', .5, .12, 74, '#ffffff', { stroke: '#111', strokeW: 12 }) },
  // 56 "one letter in Max's mailbox." — one envelope, from the inside
  { a: 67.39, b: 69.2, set: 'town', light: 'golden', dof: 6, shadow: 8, focus: [77.2, 4.7, -3.9],
    cam: { pos: [77.2, 3.74, -6.66], pos2: [77.2, 3.74, -6.58], tgt: [77.2, 4.55, -3.0], fov: 80 },
    cast: [{ c: 'max', p: [77.2, 0, -3.7], ry: 180, pose: (t) => ({ lean: .08, armR: [Math.PI / 2.2, .1], head: [0, .05] }), face: [[0, 'neutral'], [.45, 'shock'], [1.1, 'grin']] }],
    fx: (t, c) => { openBox(c.W, c.W.maxBox); flagUp(c.W, c.W.maxBox); c.W.maxBox.liner.visible = false; c.FX.paper('env', 'final', null, [77.2, 3.6, -6.1], [-Math.PI / 2, 0, .12], .55, { to: 'Max', from: 'Future Max' }); } },
  // 57 "It said: told you."
  { a: 69.2, b: 70.62, set: 'town', light: 'golden', dof: 12, shadow: 8, focus: [77.6, 4.2, -1.0],
    cam: { pos: [77.6, 4.45, 2.3], pos2: [77.6, 4.4, 1.6], tgt: [77.6, 4.45, -1.0], fov: 38 },
    fx: (t, c) => c.FX.paper('letter', 'told', L.told.lines, [77.6, 4.1, -1.0], [0, 0, .04], 1, { color: BLUE, sign: '- Future Max' }) },
  // 58 end card
  { a: 70.62, b: 72.84, set: 'town', light: 'golden', dof: 8, shadow: 18, nocap: true,
    cam: { tgt: [77.6, 4.1, -3.4], d: 9, yaw: -6, h: .4, fov: 38, push: .08 },
    cast: [{ c: 'max', p: [77.6, 0, -3.4], ry: 0, pose: 'holdOne', face: 'grin', props: [P(L.told, { out: true })] }],
    fx: (t, c) => { flagUp(c.W, c.W.maxBox); openBox(c.W, c.W.maxBox); },
    ov: (g, t, O) => {
      g.save(); g.fillStyle = `rgba(0,0,0,${Math.min(.5, t * 2)})`; g.fillRect(0, 0, O.W, O.H); g.restore();
      O.pop(g, t, .1, 'WOULD YOU OPEN', .5, .27, 104, '#ffffff', { stroke: '#111', strokeW: 13 });
      O.pop(g, t, .2, 'YOUR LETTER?', .5, .34, 120, '#ffffff', { stroke: '#111', strokeW: 14 });
      O.pop(g, t, .55, 'YES', .32, .5, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 });
      O.pop(g, t, .65, 'or', .5, .505, 90, '#ffffff', { stroke: '#111', strokeW: 10 });
      O.pop(g, t, .75, 'NO', .68, .5, 150, '#ff3b3b', { stroke: '#3d0000', strokeW: 16 });
    } },
];
