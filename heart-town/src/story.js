// "Heart Town" shot list, cut to the user's reference narration (voice/words.json, word starts from the original audio).
// cam: orbit {tgt, d, yaw, h, fov, push, dyaw} or {pos, pos2, tgt, tgt2, fov}. Character ry 0 faces +z.
export const WORDS_URL = '../voice/words.json';

const base = {
  marlon: { shirt: '#7ed957', zip: true, pants: '#2f5fa8', shoes: '#ffffff', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0', scale: .78 },
  dad: { shirt: '#3d7bd9', stripe: '#2d5fb0', longSleeve: true, pants: '#6b5a45', shoes: '#3a2a1a', hair: 'short', hairColor: '#2a1a10', skin: '#e8b48a' },
  mom: { shirt: '#e53935', longSleeve: true, pants: '#4a4a6a', shoes: '#ffffff', hair: 'long', hairColor: '#7a3f1a', skin: '#f2c9a0' },
  vail: { shirt: '#5b2a86', longSleeve: true, jacketOpen: '#ffcc2e', chain: true, hat: 'top', hatColor: '#3b1a5a', pants: '#2b123d', shoes: '#0a0a0a', hair: 'grey', hairColor: '#a0a0a0', skin: '#f0c39a' },
  nwoman: { shirt: '#ff8fc8', pants: '#5a4a6a', hair: 'pony', hairColor: '#3a2616', skin: '#c98f5f', shoes: '#ffffff' },
  nman: { shirt: '#ffb74d', pants: '#263238', hair: 'spiky', hairColor: '#111', skin: '#e8b48a', shoes: '#222' },
  e1: { shirt: '#ffd43b', pants: '#3a3a3a', hair: 'short', hairColor: '#e0b040', skin: '#f2c9a0' },
  e2: { shirt: '#8e5be0', pants: '#2f2f4f', hair: 'long', hairColor: '#1a1a1a', skin: '#8d5a3b' },
  e6: { shirt: '#4fc3f7', pants: '#5a4030', hat: 'beanie', hatColor: '#ff6f91', hair: 'short', hairColor: '#2a1a10', skin: '#c98f5f' },
  e7: { shirt: '#9ccc65', pants: '#3e2723', hair: 'bun', hairColor: '#ffcc66', skin: '#f2c9a0' },
};
export const CAST = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, { ...v, badge: false }]));

// ---------- helpers ----------
const F = (px, pz, qx, qz) => Math.atan2(qx - px, qz - pz) * 180 / Math.PI;
const cl = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, k) => a + (b - a) * cl(k);
const SW = .3;
// kitchen layout (room centre 200,0,1000): table top y 2.85 at (200,1001); meter on the left wall; stairs on the right
const DAD = [197, 0, 1000.6], MOM = [197.8, 0, 1003.6], VAIL = [203.2, 0, 1000.8];
const MET = [189.2, 6.4, 997.8];
const STEP = [209.4, 4.5, 1004.5];            // Marlon crouched on the 5th stair
const kitNight = (W) => { W.kitWin.children[0].material.color.set('#1d2a5a'); };
const kitchen = (extra = []) => [
  { c: 'dad', p: DAD, ry: 90, pose: 'idle', face: 'worried' },
  { c: 'mom', p: MOM, ry: 120, pose: 'idle', face: 'worried', ph: .4 },
  { c: 'vail', p: VAIL, ry: -90, pose: 'idle', face: 'smug', ph: .8 }, ...extra];
const briefOnTable = (W, open = 0) => { const b = W.brief; b.g.visible = true; b.g.position.set(200.4, 2.85, 1000.9); b.g.rotation.set(0, -Math.PI / 2, 0); b.lid.rotation.x = -1.9 * open; };
const meterCam = (k = 0) => ({ pos: [196 - k, 6.0, 1000.5 - k * .6], pos2: [194.8 - k, 6.15, 999.8 - k * .6], tgt: MET, fov: 40 });
const card = (txt, sub) => (g, t, O) => { O.pop(g, t, .02, txt, .5, .14, 74, '#ffd43b', { stroke: '#2a1a00', strokeW: 10 }); };

export const SHOTS = [
  // ---- the rule ----
  // "In this town," — golden street of little houses with heart meters
  { a: 0, b: 1.0, set: 'town', light: 'golden', dof: 0, shadow: 40,
    cam: { pos: [118, 5.6, 7], pos2: [113, 5.3, 6.4], tgt: [80, 4, -10], fov: 44 },
    cast: [{ c: 'e1', p: (t) => [104 - t * 1.4, SW, -6.2], ry: -90, pose: 'walk' }, { c: 'e6', p: (t) => [86 + t * 1.3, SW, 6.4], ry: 90, pose: 'walk', ph: .3 },
      { c: 'e2', p: [96.6, SW, -6.4], ry: 30, pose: 'idle' }, { c: 'nwoman', p: [98, SW, -6.6], ry: -30, pose: 'talk', face: 'smile' }] },
  // "every time your heart gets broken," — he walks out on her; her meter cracks
  { a: 1.0, b: 2.35, set: 'town', light: 'golden', dof: 9, shadow: 14,
    cam: { tgt: [97.4, 4.3, -6.6], d: 12, yaw: 8, h: .3, fov: 34, push: .1 },
    fx: (t, c) => c.W.setMeter(c.W.nbMeter, t < .45 ? 100 : t < .8 ? lerp(100, 0, (t - .45) / .35) : 0),
    cast: [{ c: 'nwoman', p: [96.4, SW, -6.6], ry: 10, pose: 'idle', face: [[0, 'sad'], [.55, 'cry']] },
      { c: 'nman', p: (t) => [98.6 + t * 2.4, SW, -6.0], ry: 95, pose: 'walk', face: 'neutral' }] },
  // "you get a million dollars." — money pours from the sky on her
  { a: 2.35, b: 4.15, set: 'town', light: 'golden', dof: 8, shadow: 14, focus: [96.4, 4.6, -6.6],
    cam: { pos: [96.6, 2.6, -1.2], pos2: [96.6, 2.8, -2.0], tgt: [96.4, 5.4, -6.6], fov: 48 },
    fx: (t, c) => { c.W.setMeter(c.W.nbMeter, 0); c.FX.bills(t + 3, [96.4, 0, -5], [14, 13, 10], 260, 4); },
    cast: [{ c: 'nwoman', p: [96.4, SW, -6.6], ry: 0, pose: (t) => t < .5 ? 'facepalm' : 'armsUp', face: [[0, 'cry'], [.5, 'shock'], [1.05, 'happycry']] }],
    ov: (g, t, O) => O.pop(g, t, .5, '$1,000,000', .5, .6, 120, '#5dff7a', { stroke: '#0b3d1a', strokeW: 14 }) },
  // "That's why the richest people here" — Vail's golden mansion, low angle
  { a: 4.15, b: 5.75, set: 'town', light: 'golden', dof: 0, shadow: 50,
    cam: { pos: [52, 1.6, -1], pos2: [52, 2.2, 1], tgt: [52, 10.5, 20], fov: 52 },
    fx: (t, c) => c.FX.bills(t, [52, 0, 12], [30, 18, 10], 120, 7) },
  // "are the loneliest." — the richest man, all alone with his gold
  { a: 5.75, b: 6.5, set: 'inter', light: 'office', dof: 8, shadow: 12,
    cam: { tgt: [400, 4.6, 994.5], d: 10, yaw: 18, h: 1, fov: 34, push: .12 },
    cast: [{ c: 'vail', p: [400, 0, 994], ry: 0, pose: 'idle', face: 'sad' }] },

  // ---- my family ----
  // "And my family, we're the poorest in town" — the little house, the family waving
  { a: 6.5, b: 8.4, set: 'town', light: 'golden', dof: 6, shadow: 22, focus: [80, 3.6, -8.4],
    cam: { tgt: [80, 3.8, -8.5], d: 15, yaw: 0, h: 1.6, fov: 38, push: .12, dyaw: -6 },
    cast: [{ c: 'dad', p: [78, SW, -8.6], ry: 8, pose: 'wave', face: 'smile' }, { c: 'mom', p: [82, SW, -8.6], ry: -8, pose: 'wave', face: 'grin', ph: .5 },
      { c: 'marlon', p: [80, SW, -8.2], ry: 0, pose: 'cheer', face: 'grin' }],
    ov: (g, t, O) => O.stamp(g, t, 1.08, 'POOREST', .5, .64, 96, '#ff3b3b') },
  // "because my parents have never broken up," — Mom and Dad hugging in the kitchen
  { a: 8.4, b: 10.15, set: 'inter', light: 'room', dof: 9, shadow: 12,
    cam: { tgt: [200, 4.2, 1003], d: 6.2, yaw: 0, h: .3, fov: 36, push: .1 },
    cast: [{ c: 'dad', p: [199.05, 0, 1003], ry: 12, pose: (t) => ({ armR: [.35, .55], armL: [0, -.05] }), face: 'smile' }, { c: 'mom', p: [200.95, 0, 1003], ry: -12, pose: (t) => ({ armL: [.35, -.55], armR: [0, .05] }), face: 'grin' }] },
  // "not once in 20 years." — big number
  { a: 10.15, b: 11.6, set: 'inter', light: 'room', dof: 10, shadow: 10,
    cam: { tgt: [200, 4.5, 1003], d: 4.3, yaw: 0, h: 0, fov: 36, push: .12 },
    cast: [{ c: 'dad', p: [199.05, 0, 1003], ry: 12, pose: (t) => ({ armR: [.35, .55], armL: [0, -.05] }), face: 'laugh' }, { c: 'mom', p: [200.95, 0, 1003], ry: -12, pose: (t) => ({ armL: [.35, -.55], armR: [0, .05] }), face: 'happycry' }],
    ov: (g, t, O) => { O.pop(g, t, .68, '20', .5, .56, 280, '#ffd43b', { stroke: '#5a3a00', strokeW: 22 }); O.pop(g, t, .76, 'YEARS', .5, .67, 120, '#ffffff', { stroke: '#111', strokeW: 13 }); } },

  // ---- the heart meter ----
  // "Every house has a heart meter on the wall."
  { a: 11.6, b: 13.4, set: 'inter', light: 'room', dof: 8, shadow: 10, focus: MET,
    cam: meterCam(0) },
  // "When a heart breaks," — next door, the meter starts to fall
  { a: 13.4, b: 14.4, set: 'town', light: 'golden', dof: 9, shadow: 10, focus: [98, 4.2, -9.9],
    cam: { pos: [98.6, 4.3, -4.9], pos2: [98.5, 4.25, -5.8], tgt: [98, 4.2, -9.9], fov: 36 },
    fx: (t, c) => c.W.setMeter(c.W.nbMeter, lerp(100, 40, (t - .15) / .8)) },
  // "it drops to zero," — crack
  { a: 14.4, b: 15.4, set: 'town', light: 'golden', dof: 9, shadow: 10, focus: [98, 4.2, -9.9], kicks: [[.45, .18]],
    cam: { pos: [98.3, 4.25, -6.6], pos2: [98.25, 4.22, -7.1], tgt: [98, 4.2, -9.9], fov: 36 },
    fx: (t, c) => { c.W.setMeter(c.W.nbMeter, lerp(40, 0, t / .45)); if (t > .45 && t < .55) c.OV.flash = .5; } },
  // "and money rains from the sky." — the whole street showered in cash
  { a: 15.4, b: 17.0, set: 'town', light: 'golden', dof: 0, shadow: 30,
    cam: { pos: [105, 9, 6.5], pos2: [102.5, 8, 4.8], tgt: [97, 3, -6.5], fov: 44 },
    fx: (t, c) => { c.W.setMeter(c.W.nbMeter, 0); c.FX.bills(t + 5, [97, 0, -3], [26, 16, 20], 420, 9); },
    cast: [{ c: 'nwoman', p: [96.4, SW, -6.6], ry: 20, pose: 'armsUp', face: 'happycry' },
      { c: 'e1', p: [101, SW, -6.2], ry: -40, pose: 'point', face: 'shock' }, { c: 'e7', p: [92, SW, 6.4], ry: 160, pose: 'armsUp', face: 'shock', ph: .4 }] },
  // "Ours has been full since before I was born." — Marlon looks up at their meter, glowing
  { a: 17.0, b: 18.0, set: 'inter', light: 'room', dof: 8, shadow: 10, focus: MET,
    cam: meterCam(.8), fx: (t, c) => c.W.setMeter(c.W.kitMeter, 100, 1) },
  { a: 18.0, b: 19.2, set: 'inter', light: 'room', dof: 7, shadow: 10, focus: [192.6, 3.5, 999.2],
    cam: { pos: [189.9, 6.5, 998.3], pos2: [190.1, 6.3, 998.4], tgt: [192.6, 3.4, 999.3], fov: 42 },
    fx: (t, c) => c.W.setMeter(c.W.kitMeter, 100, 1),
    cast: [{ c: 'marlon', p: [192.6, 0, 999.2], ry: -105, pose: (t) => ({ head: [0, -.4] }), face: 'smile' }] },

  // ---- the offer ----
  // "But last night," — their house at night
  { a: 19.2, b: 20.15, set: 'town', light: 'night', dof: 0, shadow: 30,
    cam: { pos: [93, 5, 8.5], pos2: [91, 5, 7.6], tgt: [80, 4, -10], fov: 42 },
    ov: card('LAST NIGHT') },
  // "a golden limousine stopped in front of our house."
  { a: 20.15, b: 22.15, set: 'town', light: 'night', dof: 0, shadow: 30,
    cam: { pos: [68, 3.0, 9.5], pos2: [70, 3.1, 9.8], tgt: [84, 2.6, 1], fov: 46 },
    fx: (t, c) => { const L = c.W.limo, k = cl(t / 1.4); L.visible = true; L.rotation.y = Math.PI; L.position.set(81 + 34 * (1 - k) * (1 - k), 0, 2.6); },
    ov: card('LAST NIGHT') },
  // "Mr. Vail," — he steps out, low angle
  { a: 22.15, b: 23.15, set: 'town', light: 'night', dof: 8, shadow: 12, focus: [78.8, 4.6, -1.2],
    cam: { pos: [78.4, 1.7, -6.4], pos2: [78.4, 1.8, -5.9], tgt: [78.8, 4.6, -1.2], fov: 44 },
    fx: (t, c) => { const L = c.W.limo; L.visible = true; L.rotation.y = Math.PI; L.position.set(81, 0, 2.6); c.W.limoDoor.visible = false; },
    cast: [{ c: 'vail', p: (t) => [78.8, 0, lerp(.6, -1.2, t / .5)], ry: 180, pose: (t) => t < .5 ? 'walk' : 'idle', face: 'smug' }] },
  // "the richest man in town,"
  { a: 23.15, b: 24.4, set: 'town', light: 'night', dof: 9, shadow: 10,
    cam: { tgt: [78.8, 4.7, -1.2], d: 4.8, yaw: 180, h: -1.3, fov: 32, push: .1 },
    fx: (t, c) => { const L = c.W.limo; L.visible = true; L.rotation.y = Math.PI; L.position.set(81, 0, 2.6); c.W.limoDoor.visible = false; },
    cast: [{ c: 'vail', p: [78.8, 0, -1.2], ry: 180, pose: 'idle', face: 'smug' }] },
  // "dumped a thousand times."
  { a: 24.4, b: 25.85, set: 'town', light: 'night', dof: 10, shadow: 10,
    cam: { tgt: [78.8, 4.75, -1.2], d: 4, yaw: 196, h: -.6, fov: 32, push: .14 },
    fx: (t, c) => { const L = c.W.limo; L.visible = true; L.rotation.y = Math.PI; L.position.set(81, 0, 2.6); c.W.limoDoor.visible = false; },
    cast: [{ c: 'vail', p: [78.8, 0, -1.2], ry: 180, pose: 'idle', face: [[0, 'smug'], [.45, 'sad']] }],
    ov: (g, t, O) => O.stamp(g, t, .08, 'DUMPED x1000', .5, .64, 88, '#ff2a2a') },
  // "He put a briefcase on our kitchen table."
  { a: 25.85, b: 27.6, set: 'inter', light: 'office', dof: 0, shadow: 14, kicks: [[.42, .12]],
    cam: { pos: [205.6, 7.8, 1007.6], pos2: [205.2, 7.5, 1007.1], tgt: [199.6, 3.6, 1000.9], fov: 50 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W); c.W.brief.g.position.y = 2.85 + Math.max(0, 1.4 * (1 - t / .42)); },
    cast: kitchen([{ c: 'marlon', p: [206.0, 0, 1005.4], ry: -120, pose: 'idle', face: 'worried' }]).map((x) => x.c === 'vail' ? { ...x, pose: (t) => t < .5 ? 'serve' : 'idle' } : x.c === 'dad' ? { ...x, face: [[0, 'neutral'], [.45, 'shock']] } : x) },
  // "$10 million." — it opens: stacks of cash
  { a: 27.6, b: 28.7, set: 'inter', light: 'office', dof: 7, shadow: 8, focus: [200.4, 3.0, 1000.9],
    cam: { pos: [198.2, 6.0, 1000.9], pos2: [198.6, 5.5, 1000.9], tgt: [200.6, 3.0, 1000.9], fov: 42 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, cl(t / .25)); },
    cast: kitchen(),
    ov: (g, t, O) => O.pop(g, t, .08, '$10,000,000', .5, .62, 112, '#5dff7a', { stroke: '#0b3d1a', strokeW: 14 }) },
  // "Break up with her tonight." — over Dad's shoulder onto Vail
  { a: 28.7, b: 30.05, set: 'inter', light: 'office', dof: 9, shadow: 10, focus: [203.2, 4.6, 1000.8],
    cam: { tgt: [203.2, 4.75, 1000.8], d: 4.2, yaw: -46, h: -.3, fov: 32, push: .1 },
    fx: (t, c) => { kitNight(c.W); },
    cast: kitchen().filter((x) => x.c !== 'dad').map((x) => x.c === 'vail' ? { ...x, ry: -50, pose: 'talk', face: [[0, 'smug'], [.5, 'talk'], [.8, 'smug']] } : x) },
  // "Dad said, Marlon, go upstairs." — from behind Marlon at the foot of the stairs
  { a: 30.05, b: 31.95, set: 'inter', light: 'office', dof: 8, shadow: 10, focus: [197.3, 4.6, 1000.9],
    cam: { pos: [208.2, 5.7, 1008.2], pos2: [207.9, 5.6, 1007.9], tgt: [197.8, 4.3, 1001.2], fov: 36 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: kitchen([{ c: 'marlon', p: [206.4, 0, 1006.4], ry: F(206.4, 1006.4, 197, 1000.6), pose: 'idle', face: 'worried' }])
      .map((x) => x.c === 'dad' ? { ...x, ry: F(197, 1000.6, 206.4, 1006.4), pose: (t) => t < .55 ? 'talk' : 'pointUp', face: 'determined' } : x) },
  // "I didn't. I watched from the stairs." — Marlon peeking through the banisters
  { a: 31.95, b: 33.65, set: 'inter', light: 'office', dof: 8, shadow: 10, focus: [209.3, 8.1, 1004.5],
    cam: { pos: [205.2, 7.3, 1003.0], pos2: [205.6, 7.4, 1003.3], tgt: [209.2, 8.3, 1004.5], fov: 38 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: [{ c: 'marlon', p: STEP, ry: -100, pose: 'peek', face: [[0, 'determined'], [.6, 'worried']] }] },
  // "Dad looked at the money,"
  { a: 33.65, b: 34.7, set: 'inter', light: 'office', dof: 10, shadow: 10,
    cam: { tgt: [197.2, 4.4, 1000.6], d: 4.0, yaw: 118, h: .5, fov: 34, push: .12 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: kitchen().map((x) => x.c === 'dad' ? { ...x, pose: (t) => ({ head: [0, .4] }), face: 'worried' } : x) },
  // "then at Mom."
  { a: 34.7, b: 35.55, set: 'inter', light: 'office', dof: 10, shadow: 10,
    cam: { tgt: [197.8, 4.6, 1003.6], d: 4.0, yaw: 128, h: .2, fov: 34, push: .12 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: kitchen().map((x) => x.c === 'mom' ? { ...x, face: 'worried' } : x) },
  // "And for the first time ever," — the whole scene from Marlon's stair
  { a: 35.55, b: 36.85, set: 'inter', light: 'office', dof: 6, shadow: 14, focus: [199.6, 3.8, 1001.2],
    cam: { pos: [210.2, 9.9, 1006.0], pos2: [210.0, 9.7, 1005.6], tgt: [199.8, 3.6, 1001.2], fov: 40 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: kitchen([{ c: 'marlon', p: STEP, ry: -100, pose: 'peek', face: 'worried' }]) },
  // "he didn't say no."
  { a: 36.85, b: 37.8, set: 'inter', light: 'office', dof: 10, shadow: 10,
    cam: { tgt: [197.1, 4.6, 1000.6], d: 3.6, yaw: 96, h: .1, fov: 32, push: .16 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: kitchen().map((x) => x.c === 'dad' ? { ...x, face: 'neutral', pose: (t) => ({ head: [.15, .1] }) } : x) },
  // "The heart meter started dropping: 80%, 50%, 20%"
  { a: 37.8, b: 39.25, set: 'inter', light: 'office', dof: 8, shadow: 8, focus: MET,
    cam: meterCam(0), fx: (t, c) => { kitNight(c.W); c.W.setMeter(c.W.kitMeter, lerp(100, 86, (t - .7) / .75)); } },
  { a: 39.25, b: 39.9, set: 'inter', light: 'office', dof: 8, shadow: 8, focus: MET, kicks: [[.02, .12]],
    cam: { ...meterCam(1.1), roll: 4 }, fx: (t, c) => { kitNight(c.W); c.W.setMeter(c.W.kitMeter, 80); } },
  { a: 39.9, b: 40.5, set: 'inter', light: 'office', dof: 8, shadow: 8, focus: MET, kicks: [[.02, .16]],
    cam: { ...meterCam(1.8), roll: -5 }, fx: (t, c) => { kitNight(c.W); c.W.setMeter(c.W.kitMeter, 50); } },
  { a: 40.5, b: 41.0, set: 'inter', light: 'office', dof: 8, shadow: 8, focus: MET, kicks: [[.02, .22]],
    cam: { ...meterCam(2.4), roll: 6 }, fx: (t, c) => { kitNight(c.W); c.W.setMeter(c.W.kitMeter, 20); } },
  // "Mom's hands were shaking."
  { a: 41.0, b: 42.25, set: 'inter', light: 'office', dof: 10, shadow: 10,
    cam: { tgt: [197.8, 4.3, 1003.6], d: 4.3, yaw: 150, h: .3, fov: 34, push: .12 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, 1); },
    cast: kitchen().map((x) => x.c === 'mom' ? { ...x, pose: 'hands', face: 'cry' } : x) },
  // "Mr. Vail smiled."
  { a: 42.25, b: 43.6, set: 'inter', light: 'office', dof: 9, shadow: 10,
    cam: { tgt: [203.2, 4.7, 1000.8], d: 4.5, yaw: -46, h: -.8, fov: 32, push: .1 },
    fx: (t, c) => { kitNight(c.W); },
    cast: kitchen().filter((x) => x.c !== 'dad').map((x) => x.c === 'vail' ? { ...x, ry: -50, face: 'greedy' } : x) },
  // "Almost."
  { a: 43.6, b: 44.25, set: 'inter', light: 'office', dof: 10, shadow: 10,
    cam: { tgt: [203.2, 4.9, 1000.8], d: 3.9, yaw: -48, h: -.2, fov: 30, push: .2 },
    fx: (t, c) => { kitNight(c.W); },
    cast: kitchen().filter((x) => x.c !== 'dad').map((x) => x.c === 'vail' ? { ...x, ry: -50, face: 'grin' } : x) },

  // ---- the choice ----
  // "Then Dad grabbed the briefcase"
  { a: 44.25, b: 45.85, set: 'inter', light: 'office', dof: 0, shadow: 14, kicks: [[.35, .1]],
    cam: { pos: [202.6, 5.4, 996.6], pos2: [202.2, 5.3, 997.0], tgt: [198.4, 4.5, 1000.8], fov: 46 },
    fx: (t, c) => { kitNight(c.W); briefOnTable(c.W, cl(1 - (t - .2) / .15)); const k = cl((t - .35) / .3), b = c.W.brief.g;
      b.position.set(lerp(200.4, 198.4, k), lerp(2.85, 3.3, k), lerp(1000.9, 1000.6, k)); b.rotation.set(lerp(0, -Math.PI / 2, k), -Math.PI / 2, 0); },
    cast: kitchen().map((x) => x.c === 'dad' ? { ...x, pose: (t) => t < .3 ? 'idle' : 'grab', face: 'angry' } : x.c === 'vail' ? { ...x, face: [[0, 'smug'], [.5, 'shock']] } : x) },
  // "and threw it out the window." — it sails out the back window, bills explode into the night
  { a: 45.85, b: 46.95, set: 'inter', light: 'office', dof: 0, shadow: 14,
    cam: { pos: [196.6, 6.4, 1008.6], pos2: [196.7, 6.5, 1008.1], tgt: [199.0, 5.2, 993], fov: 50 },
    fx: (t, c) => { kitNight(c.W); const k = cl((t - .08) / .45), b = c.W.brief;
      b.g.visible = k < 1; b.lid.rotation.x = 0; b.g.position.set(lerp(198.4, 200, k), 3.3 + Math.sin(k * Math.PI) * 3.2 + k * 2.4, lerp(1000.6, 990.6, k)); b.g.rotation.set(-Math.PI / 2 - k * 7, -Math.PI / 2, k * 3);
      if (t > .53) { c.W.kitWin.children[0].material.color.set('#0e1638'); c.FX.billBurst(t, .53, [200, 6.6, 990.4], 160, 1.1, 5, [0, 0, 2.5]); }
      if (t > .53 && t < .62) c.OV.flash = .35; },
    cast: kitchen().filter((x) => x.c !== 'mom').map((x) => x.c === 'dad' ? { ...x, pose: (t) => t < .2 ? 'throw' : 'point', face: 'angry', ry: 170 } : x.c === 'vail' ? { ...x, face: 'shock', pose: 'scared' } : x) },
  // "Get out of my house!"
  { a: 46.95, b: 47.95, set: 'inter', light: 'office', dof: 9, shadow: 10, kicks: [[.08, .22]],
    cam: { tgt: [197, 4.7, 1000.6], d: 4.4, yaw: -24, h: -.5, fov: 34, push: .14 },
    fx: (t, c) => { kitNight(c.W); },
    cast: kitchen().map((x) => x.c === 'dad' ? { ...x, ry: F(197, 1000.6, 194, 1009.8), pose: 'point', face: 'angry' } : x.c === 'vail' ? { ...x, face: 'shock', pose: 'scared' } : x.c === 'mom' ? { ...x, face: 'shock' } : x) },
  // "The meter shot back to full."
  { a: 47.95, b: 49.4, set: 'inter', light: 'office', dof: 8, shadow: 8, focus: MET,
    cam: { pos: [194.6, 6.1, 999.8], pos2: [196.2, 6.0, 1000.6], tgt: MET, fov: 40 },
    fx: (t, c) => { kitNight(c.W); const v = lerp(20, 100, (t - .1) / .5); c.W.setMeter(c.W.kitMeter, v, v >= 100 ? 1 : 0); if (t > .6 && t < .72) c.OV.flash = .4; } },

  // ---- after ----
  // "We're still the poorest family in town." — a group hug in front of the little house
  { a: 49.4, b: 51.3, set: 'town', light: 'golden', dof: 7, shadow: 18, focus: [80, 3.8, -8.4],
    cam: { tgt: [80, 3.4, -8.3], d: 13, yaw: 8, h: .9, fov: 36, push: .12 },
    cast: [{ c: 'dad', p: [78.6, SW, -8.4], ry: 12, pose: (t) => ({ armR: [.35, .55], armL: [0, -.05] }), face: 'laugh' }, { c: 'mom', p: [81.4, SW, -8.4], ry: -12, pose: (t) => ({ armL: [.35, -.55], armR: [0, .05] }), face: 'happycry' },
      { c: 'marlon', p: [80, SW, -7.6], ry: 0, pose: 'cheer', face: 'grin' }] },
  // "But this morning," — Vail walks up the path again
  { a: 51.3, b: 52.0, set: 'town', light: 'day', dof: 0, shadow: 30,
    cam: { pos: [90, 5.8, 6.5], pos2: [89, 5.7, 6.0], tgt: [80, 4.8, -7.5], fov: 40 },
    cast: [{ c: 'vail', p: (t) => [80, SW, -5.6 - t * 2], ry: 180, pose: 'walk', face: 'neutral' }],
    ov: card('THIS MORNING') },
  // "Mr. Vail knocked again."
  { a: 52.0, b: 53.3, set: 'town', light: 'day', dof: 8, shadow: 12, focus: [80, 4.4, -8.8],
    cam: { tgt: [80, 4.9, -9.0], d: 11, yaw: 48, h: .2, fov: 36, push: .1 },
    cast: [{ c: 'vail', p: [80, SW, -8.6], ry: 180, pose: 'knock', face: 'worried' }],
    ov: card('THIS MORNING') },
  // "This time, he wasn't offering money." — from the doorway
  { a: 53.3, b: 54.75, set: 'town', light: 'day', dof: 9, shadow: 10, focus: [80, 4.6, -5.4],
    cam: { pos: [80.4, 4.7, -9.7], pos2: [80.35, 4.7, -9.5], tgt: [80, 4.55, -5.4], fov: 46 },
    cast: [{ c: 'vail', p: [80, SW, -5.4], ry: 180, pose: 'shrug', face: 'sad' }] },
  // "He was asking how to fall in love." — he holds out a rose
  { a: 54.75, b: 56.25, set: 'town', light: 'day', dof: 9, shadow: 10, focus: [80, 4.4, -5.4],
    cam: { pos: [80.4, 4.4, -9.7], pos2: [80.3, 4.35, -9.4], tgt: [80, 3.9, -5.4], fov: 52 },
    fx: (t, c) => roseIn(c, true),
    cast: [{ c: 'vail', p: [80, SW, -5.4], ry: 180, pose: 'hold', face: [[0, 'worried'], [.8, 'smile']] }] },
  // "Should we help him? Comment yes or no." — end card
  { a: 56.25, b: 62.7, set: 'town', light: 'day', dof: 7, shadow: 12, focus: [80, 4.4, -6.6],
    cam: { tgt: [80, 3.4, -6.6], d: 8, yaw: 0, h: .4, fov: 36, push: .06 },
    fx: (t, c) => roseIn(c, true),
    cast: [{ c: 'vail', p: [80, SW, -6.6], ry: 0, pose: 'hold', face: 'worried' }],
    ov: (g, t, O) => {
      g.save(); g.fillStyle = `rgba(0,0,0,${Math.min(.45, t * 2)})`; g.fillRect(0, 0, O.W, O.H); g.restore();
      O.pop(g, t, .15, 'HELP HIM?', .5, .13, 150, '#ffffff', { stroke: '#111', strokeW: 16 });
      O.pop(g, t, 1.0, 'YES', .32, .5, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 });
      O.pop(g, t, 1.1, 'or', .5, .505, 90, '#ffffff', { stroke: '#111', strokeW: 10 });
      O.pop(g, t, 1.2, 'NO', .68, .5, 150, '#ff3b3b', { stroke: '#3d0000', strokeW: 16 });
    } },
];

// the rose is held out in front of Vail's chest (placed in world space from his root)
function roseIn(c, on) {
  const r = c.W.rose, v = c.chars.vail.root, a = v.rotation.y;
  if (r.parent !== c.W.town.parent) c.W.town.parent.add(r);
  r.position.set(v.position.x + Math.sin(a) * 1.45, v.position.y + 2.5, v.position.z + Math.cos(a) * 1.45);
  r.rotation.set(Math.cos(a) * .25, 0, -Math.sin(a) * .25); r.scale.setScalar(1.25); r.visible = on;
}
