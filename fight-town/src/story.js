// "In This Town, You Have to Fight an Animal to Earn Your Food" — shot list.
// Cuts are placed on narration words: at(line, wordIndex) reads voice/words.json (HUS punches are their own words).
// cam: orbit {tgt, d, yaw, h, fov, push, dyaw} or {pos, pos2, tgt, tgt2, fov}. Character ry 0 faces +z.
export const WORDS_URL = '../voice/words.json';
const WJ = await (await fetch(WORDS_URL)).json();
const byLine = {}; WJ.words.forEach((w) => (byLine[w.p] ||= []).push(w));
const at = (li, j = 0) => { const L = byLine[li]; return L[Math.min(j, L.length - 1)].start - .07; };
const DUR = WJ.duration;

const base = {
  hero: { shirt: '#7ed957', zip: true, longSleeve: true, pants: '#2f5fa8', shoes: '#ffffff', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0', build: -1 },
  heroBuff: { shirt: '#7ed957', sleeve: 0, pants: '#2f5fa8', shoes: '#ffffff', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0', headband: '#e8243c', build: 1 },
  gran: { shirt: '#b07ad9', longSleeve: true, pants: '#6a4c93', shoes: '#5a3a2a', hair: 'bun', hairColor: '#e0e0e0', skin: '#f2c9a0', glasses: true, scale: .88 },
  gorilla: { shirt: '#2e2a2a', longSleeve: true, pants: '#2e2a2a', shoes: '#2e2a2a', hair: 'short', hairColor: '#2e2a2a', skin: '#5a4a44', patch: '#5a4a44', build: 1, scale: 4 },
  f1: { shirt: '#ffd43b', pants: '#3a3a3a', hair: 'short', hairColor: '#e0b040', skin: '#f2c9a0', shoes: '#222' },
  f2: { shirt: '#4fc3f7', pants: '#5a4030', hat: 'cap', hatColor: '#e53935', hair: 'short', hairColor: '#2a1a10', skin: '#c98f5f', shoes: '#fff' },
  f3: { shirt: '#ff7043', sleeve: .4, pants: '#263238', hair: 'spiky', hairColor: '#111', skin: '#8d5a3b', build: .5, shoes: '#222' },
  f4: { shirt: '#e53935', sleeve: 0, pants: '#212121', hair: 'short', hairColor: '#111', skin: '#e8b48a', build: 1, headband: '#ffffff', shoes: '#111' },
  x1: { shirt: '#8e5be0', pants: '#2f2f4f', hair: 'long', hairColor: '#1a1a1a', skin: '#8d5a3b' },
  x2: { shirt: '#ff8fc8', pants: '#5a4a6a', hair: 'pony', hairColor: '#3a2616', skin: '#f2c9a0' },
  x3: { shirt: '#9ccc65', pants: '#3e2723', hair: 'bun', hairColor: '#ffcc66', skin: '#f2c9a0' },
  x4: { shirt: '#ffb74d', pants: '#263238', hat: 'beanie', hatColor: '#3a74d9', hair: 'short', hairColor: '#4a2a10', skin: '#c98f5f' },
};
export const CAST = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, { ...v, badge: false }]));

// ---------- helpers ----------
const cl = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, k) => a + (b - a) * cl(k);
const Y = .3;                                   // arena sand height
const AX = 300;                                 // arena centre x (z = 0)
const FP = [298.2, Y, 0], AP = [301.8, Y, 0];   // fighter spot (faces +x), animal spot (faces -x)
const side = (tx = 300, ty = 2.8, d = 15, extra = {}) => ({ tgt: [tx, ty, 0], d, h: 1, fov: 38, push: .08, ...extra, yaw: 55 + (extra.yaw || 0) * .5 });
const crowd = (cheer = 1) => (t, c) => c.W.crowdAt(t, cheer);
const food = (c, k, p, s = 1, ry = 0) => { const f = c.W.foods[k]; f.visible = true; f.position.set(...p); f.scale.setScalar(s); f.rotation.y = ry; return f; };
const overHead = (p, s = 1) => [p[0], p[1] + 6.9 * s, p[2]];
const screen = (a, b, col) => (t, c) => c.W.setScreen(a, b, col);
const all = (...fs) => (t, c) => fs.forEach((f) => f && f(t, c));
// front-row laughing spectators on the first tier (angles around the near side of the arena)
const laughers = (faces = 'laugh') => ['x1', 'x2', 'x3', 'x4'].map((id, i) => {
  const a = -.5 + i * .33, r = 21.6; return { c: id, p: [AX + Math.sin(a) * r, 1.6, Math.cos(a) * r], ry: (a * 180 / Math.PI) + 180, pose: 'laughPoint', face: faces, ph: i * .3 };
});
const KIT = [200, 0, 1000];
const kitchenNight = (t, c) => { if (c.W.kitWin) c.W.kitWin.children[0].material.color.set('#1d2a5a'); };
const TG = [-150, 0, 60];                       // training ground (punch tree at its origin)
const HUS3 = (li) => [at(li, 1), at(li, 2), at(li, 3)];

const S = [];
const shot = (a, o) => S.push({ a, ...o });

// ===== 1. the rule =====
// "In this town, you fight animals for food."
shot(0, { set: 'town', light: 'golden', dof: 0, shadow: 50, fx: all(crowd(1), screen('FIGHT FOR', 'YOUR FOOD')),
  cam: { pos: [AX + 34, 16, 30], pos2: [AX + 26, 12, 24], tgt: [AX, 2, 0], fov: 46 },
  cast: [{ c: 'f1', p: FP, ry: 90, pose: 'punch' }, { an: 'goat', p: AP, ry: -90, mode: 'attack' }] });
shot(at(0, 4), { set: 'town', light: 'golden', dof: 8, shadow: 20, fx: crowd(1), hus: [.15, .45],
  cam: side(299.8, 2.8, 11, { push: .12 }),
  cast: [{ c: 'f2', p: FP, ry: 90, pose: 'punch', face: 'determined' }, { an: 'goat', p: AP, ry: -90, mode: 'attack', eyes: 'angry' }] });
// "Scarier animal, better meal." — the matchup board
shot(at(1, 0), { set: 'town', light: 'golden', dof: 0, shadow: 30, fx: all(crowd(.6), screen('SCARIER ANIMAL', 'BETTER MEAL', '#5dff7a')),
  cam: { pos: [AX, 12.5, 1], pos2: [AX, 13.2, -2], tgt: [AX, 15, -31], fov: 40 } });
// "Chicken?"
shot(at(2, 0), { set: 'town', light: 'golden', dof: 8, shadow: 16, fx: all(crowd(.5), screen('CHICKEN', 'SANDWICH')),
  cam: side(299.8, 2.2, 10, { yaw: -12 }),
  cast: [{ c: 'f1', p: FP, ry: 90, pose: 'idle', face: 'determined' }, { an: 'chicken', p: [301.2, Y, 0], ry: -90, mode: 'attack', eyes: 'angry' }] });
// "HUS! HUS! HUS!"
shot(at(2, 1), { set: 'town', light: 'golden', dof: 9, shadow: 12, kicks: [[0, .1], [.2, .1], [.4, .14]], fx: crowd(1),
  cam: side(299.5, 2.6, 7.5, { yaw: 18, h: .5, push: .15 }),
  cast: [{ c: 'f1', p: FP, ry: 90, pose: 'punch', face: 'angry' }, { an: 'chicken', p: [300.2, Y, 0], ry: -90, mode: (t) => t < .45 ? 'hit' : 'ko', k: (t) => cl(t / .45), eyes: (t) => t < .45 ? 'shock' : 'dizzy' }] });
// "Sandwich."
shot(at(2, 4), { set: 'town', light: 'golden', dof: 8, shadow: 12, fx: (t, c) => { crowd(1)(t, c); food(c, 'sandwich', overHead([AX, Y, 0]), 1.3, t); },
  cam: { tgt: [AX, 5.2, 0], d: 9.5, yaw: 8, h: -.8, fov: 38, push: .1 },
  cast: [{ c: 'f1', p: [AX, Y, 0], ry: 0, pose: 'lift', face: 'grin' }] });
// "Goat?" — it charges
shot(at(3, 0), { set: 'town', light: 'golden', dof: 8, shadow: 14, fx: all(crowd(1), screen('GOAT', 'BURGER')), hus: [.25],
  cam: side(299.6, 2.6, 11, { yaw: -20 }), kicks: [[.3, .12]],
  cast: [{ c: 'f2', p: FP, ry: 90, pose: 'kick', face: 'angry' }, { an: 'goat', p: (t) => [lerp(302.6, 299.8, t / .3), Y, 0], ry: -90, mode: (t) => t < .3 ? 'attack' : 'hit', k: (t) => cl((t - .3) / .3), eyes: 'angry' }] });
// "Burger."
shot(at(3, 1), { set: 'town', light: 'golden', dof: 8, shadow: 12, fx: (t, c) => { crowd(1)(t, c); food(c, 'burger', overHead([AX, Y, 0]), 1.5, t * 1.5); },
  cam: { tgt: [AX, 5.4, 0], d: 9.5, yaw: -10, h: -.8, fov: 38, push: .1 },
  cast: [{ c: 'f2', p: [AX, Y, 0], ry: 0, pose: 'lift', face: 'laugh' }] });
// "Crocodile?"
shot(at(4, 0), { set: 'town', light: 'golden', dof: 8, shadow: 14, fx: all(crowd(1), screen('CROCODILE', 'STEAK')), hus: [.2, .45],
  cam: side(300.3, 2.2, 11, { yaw: 22, h: .4 }), kicks: [[.25, .12], [.5, .12]],
  cast: [{ c: 'f3', p: FP, ry: 90, pose: 'punch', face: 'angry' }, { an: 'croc', p: [302.6, Y, 0], ry: -90, mode: (t) => t < .5 ? 'attack' : 'hit', k: (t) => cl((t - .5) / .4), eyes: 'angry' }] });
// "Steak."
shot(at(4, 1), { set: 'town', light: 'golden', dof: 8, shadow: 12, fx: (t, c) => { crowd(1)(t, c); food(c, 'steak', overHead([AX, Y, 0], 1.05), 1.4, .3 + t); },
  cam: { tgt: [AX, 5.6, 0], d: 10, yaw: 12, h: -.8, fov: 38, push: .1 },
  cast: [{ c: 'f3', p: [AX, Y, 0], ry: 0, pose: 'lift', face: 'grin' }] });
// "Bear?" — it rises up and roars
shot(at(5, 0), { set: 'town', light: 'golden', dof: 6, shadow: 18, fx: all(crowd(1), screen('BEAR', 'A FEAST')),
  cam: { pos: [AX + 9, 2.4, 14], pos2: [AX + 8.4, 2.5, 13.2], tgt: [AX + 1.6, 4.8, -.5], fov: 46 },
  cast: [{ c: 'f4', p: [298.3, Y, 1.2], ry: 70, pose: 'idle', face: 'determined' }, { an: 'bear', p: [303, Y, -1.5], ry: -110, mode: 'roar', eyes: 'angry' }] });
// "HUS! HUS! HUS!"
shot(at(5, 1), { set: 'town', light: 'golden', dof: 0, shadow: 14, fx: crowd(1), kicks: [[0, .14], [.2, .14], [.4, .2]],
  cam: side(300.2, 3.4, 13, { yaw: -15, push: .14 }),
  cast: [{ c: 'f4', p: FP, ry: 90, pose: (t) => t < .4 ? 'punch' : 'uppercut', face: 'angry' }, { an: 'bear', p: [302.4, Y, 0], ry: -90, mode: (t) => t < .4 ? 'attack' : 'hit', k: (t) => cl((t - .4) / .3), eyes: (t) => t < .4 ? 'angry' : 'dizzy' }] });
// "A feast."
shot(at(5, 4), { set: 'town', light: 'golden', dof: 6, shadow: 16, fx: (t, c) => { crowd(1)(t, c); food(c, 'feast', [AX, Y, 1.2], 1, 0); c.FX.confetti(t, [AX, 0, 0], [14, 12, 10], 220); },
  cam: { tgt: [AX, 3.8, 1.2], d: 11, yaw: 0, h: 1.2, fov: 40, push: .1 },
  cast: [{ c: 'f4', p: [AX, Y, -1.3], ry: 0, pose: 'cheer', face: 'laugh' }] });

// ===== 2. me vs the worm =====
// "Me?" — the skinny hero walks in
shot(at(6, 0), { set: 'town', light: 'golden', dof: 7, shadow: 14, fx: all(crowd(.3), screen('???', 'WORM', '#ff9cbc')),
  cam: { tgt: [AX - 4, 3.6, 0], d: 6.5, yaw: 90, h: .3, fov: 36, push: .1 },
  cast: [{ c: 'hero', p: (t) => [AX - 5 + t * 1.2, Y, 0], ry: 90, pose: 'walk', face: 'worried' }] });
// "They gave me a worm."
shot(at(6, 1), { set: 'town', light: 'golden', dof: 5, shadow: 8, focus: [AX + 1.5, .6, 0], fx: crowd(.3),
  cam: { pos: [AX + .2, .9, 1.4], pos2: [AX + .3, .85, 1.1], tgt: [AX + 1.6, .5, 0], fov: 50 },
  cast: [{ an: 'worm', p: [AX + 1.6, Y, 0], ry: -90, mode: 'idle', eyes: 'calm' }, { c: 'hero', p: [AX - 1.3, Y, 0], ry: 90, pose: 'idle', face: 'shock' }] });
// "Everyone laughed."
shot(at(7, 0), { set: 'town', light: 'golden', dof: 6, shadow: 14, fx: crowd(1.4),
  cam: { pos: [AX + 3, 4.6, 9], pos2: [AX + 3.4, 4.7, 9.8], tgt: [AX + 2.6, 3.6, 21], fov: 50 },
  cast: laughers() });
// "And the worm almost won." — hero swings and misses
shot(at(8, 0), { set: 'town', light: 'golden', dof: 7, shadow: 10, focus: [AX, 2, 0], fx: crowd(1), hus: [.2, .55],
  cam: side(AX - .4, 2.2, 11, { yaw: 14, h: .4 }),
  cast: [{ c: 'hero', p: [AX - 1.6, Y, 0], ry: 90, pose: 'flail', face: 'angry' }, { an: 'worm', p: (t) => [AX + .6 + Math.sin(t * 9) * .5, Y, Math.cos(t * 7) * .4], ry: -90, mode: 'idle', eyes: 'calm' }] });
// "It dodged."
shot(at(8, 5), { set: 'town', light: 'golden', dof: 7, shadow: 10, fx: crowd(1), hus: [.05],
  cam: side(AX - .2, 2.0, 10, { yaw: -24, h: .2 }),
  cast: [{ c: 'hero', p: (t) => [AX - 1.2 + t * 1.5, Y, 0], ry: 90, rx: (t) => lerp(0, 25, t / .4), pose: 'bigpunch', face: 'shock' }, { an: 'worm', p: (t) => [AX + .8, Y, lerp(0, 1.4, t / .15)], ry: -90, mode: 'idle', eyes: 'calm' }] });
// "It slapped me."
shot(at(8, 7), { set: 'town', light: 'golden', dof: 7, shadow: 8, kicks: [[.2, .25]], fx: (t, c) => { crowd(1.2)(t, c); if (t > .2 && t < .28) c.OV.flash = .5; },
  cam: { tgt: [AX - .2, 2.8, 0], d: 7.5, yaw: 40, h: -.4, fov: 38, push: .14 },
  cast: [{ c: 'hero', p: [AX - .9, Y, 0], ry: 90, rz: (t) => t > .2 ? lerp(0, -12, (t - .2) / .2) : 0, pose: 'idle', face: (t) => t < .22 ? 'worried' : 'shock' }, { an: 'worm', p: [AX + .5, Y, 0], ry: -90, mode: 'attack', eyes: 'angry' }] });
// "I cried."
shot(at(8, 10), { set: 'town', light: 'golden', dof: 8, shadow: 8, fx: crowd(1.2),
  cam: { pos: [AX - .5, 7.4, 1.9], pos2: [AX - .5, 6.8, 1.6], tgt: [AX - .5, Y, .3], fov: 46 },
  cast: [{ c: 'hero', p: [AX - .5, Y + .55, 2.7], rx: -90, ry: 0, pose: 'lying', face: 'cry' }, { an: 'worm', p: [AX + 1.1, Y, -1.4], ry: -120, mode: 'idle', eyes: 'calm' }] });
// "I won. Barely." — he flops onto the worm
shot(at(9, 0), { set: 'town', light: 'golden', dof: 7, shadow: 8, fx: crowd(.4),
  cam: { pos: [AX - .3, 7.6, 2.1], pos2: [AX - .3, 7.0, 1.8], tgt: [AX - .3, Y, .4], fov: 48 },
  cast: [{ c: 'hero', p: [AX - .5, Y + .55, 2.7], rx: -90, ry: 0, pose: 'lying', face: 'sick' }, { an: 'worm', p: [AX + 1.3, Y, .2], ry: -90, mode: 'ko', eyes: 'dizzy' }] });
// "My prize?"
shot(at(9, 3), { set: 'town', light: 'golden', dof: 6, shadow: 10, fx: (t, c) => { crowd(.3)(t, c); c.W.reward.visible = true; food(c, 'crumb', [AX + 16, Y + 2.6, 0], 1, 0); },
  cam: { pos: [AX + 13, 4.3, 3.6], pos2: [AX + 14.6, 3.4, 1.4], tgt: [AX + 16, 2.95, 0], fov: 38 } });
// "One tiny piece of bread."
shot(at(9, 5), { set: 'town', light: 'golden', dof: 9, shadow: 8, focus: [AX, 3.1, .9], fx: (t, c) => { crowd(.3)(t, c); food(c, 'crumb', [AX - .05, Y + 2.8, 1.25], 1, 0); },
  cam: { tgt: [AX, 4.0, .5], d: 4.2, yaw: 6, h: .1, fov: 36, push: .12 },
  cast: [{ c: 'hero', p: [AX, Y, 0], ry: 0, pose: { armR: [Math.PI / 2.3, -.15], armL: [0, -.05], head: [0, .25] }, face: 'sad' }] });

// ===== 3. grandma =====
// "Only Grandma believed in me." — she hugs him in the kitchen
shot(at(10, 0), { set: 'inter', light: 'office', dof: 7, shadow: 12, fx: kitchenNight,
  cam: { tgt: [200, 3.9, 1004], d: 5.6, yaw: 0, h: .4, fov: 38, push: .1 },
  cast: [{ c: 'hero', p: [199.4, 0, 1005.2], ry: 50, pose: 'hug', face: 'sad' }, { c: 'gran', p: [200.7, 0, 1005.2], ry: -50, pose: 'hug', face: 'smile' }] });
// "The time will come eventually."
shot(at(11, 0), { set: 'inter', light: 'office', dof: 9, shadow: 10, fx: kitchenNight,
  cam: { tgt: [200.7, 3.9, 1005.2], d: 3.6, yaw: -20, h: 0, fov: 34, push: .12 },
  cast: [{ c: 'gran', p: [200.7, 0, 1005.2], ry: -40, pose: 'talk', face: [[0, 'talk'], [.5, 'smile'], [.9, 'talk']] }, { c: 'hero', p: [199.4, 0, 1005.2], ry: 50, pose: 'idle', face: 'sad' }] });
// "I promised her I'd fight the strongest animal."
shot(at(12, 0), { set: 'inter', light: 'office', dof: 9, shadow: 10, fx: kitchenNight,
  cam: { tgt: [199.4, 3.9, 1005.2], d: 3.8, yaw: 40, h: -.4, fov: 34, push: .14 },
  cast: [{ c: 'hero', p: [199.4, 0, 1005.2], ry: 50, pose: 'pointUp', face: 'determined' }, { c: 'gran', p: [200.7, 0, 1005.2], ry: -40, pose: 'idle', face: 'happycry' }] });

// ===== 4. training =====
// "So I trained." — dawn at the training ground
shot(at(13, 0), { set: 'town', light: 'golden', dof: 0, shadow: 40,
  cam: { pos: [TG[0] + 14, 6, TG[2] + 20], pos2: [TG[0] + 11, 5.5, TG[2] + 17], tgt: [TG[0], 4, TG[2]], fov: 44 },
  cast: [{ c: 'hero', p: [TG[0] - 1, 0, TG[2] + 4], ry: 180, pose: 'flex', face: 'determined', build: -.8 }] });
// "Punched trees. HUS! HUS! HUS!"
shot(at(13, 4), { set: 'town', light: 'golden', dof: 8, shadow: 12, kicks: [[.1, .08], [.4, .08], [.7, .1]],
  cam: { tgt: [TG[0], 4.2, TG[2] + 1.6], d: 7, yaw: 110, h: .3, fov: 40, push: .12 },
  cast: [{ c: 'hero', p: [TG[0], 0, TG[2] + 2.3], ry: 180, pose: 'punch', face: 'angry', build: -.7 }] });
// "The tree won."
shot(at(13, 9), { set: 'town', light: 'golden', dof: 8, shadow: 10,
  cam: { tgt: [TG[0], 3.8, TG[2] + 2.6], d: 4.6, yaw: 20, h: -.2, fov: 36, push: .1 },
  cast: [{ c: 'hero', p: [TG[0], 0, TG[2] + 2.6], ry: 15, pose: { armR: [Math.PI / 2.4, .2], armL: [.5, -.3], head: [0, .2], bob: 0 }, face: 'cry', build: -.7 }] });
// "I ran mountains."
shot(at(14, 0), { set: 'town', light: 'golden', dof: 0, shadow: 40,
  cam: (() => { const q = (u) => [-260 + 110 * (1 - u) * .62, 120 * u, -300 + 110 * (1 - u) * .78], p = q(.3), d = q(.26); return { pos: [d[0] + 5, d[1] + 3.5, d[2] + 1], pos2: [d[0] + 4.5, d[1] + 3.8, d[2] + .5], tgt: [p[0], p[1] + 4, p[2]], fov: 46 }; })(),
  cast: [{ c: 'hero', p: (t) => { const u = .3 + t * .02; return [-260 + 110 * (1 - u) * .62, 120 * u + .3, -300 + 110 * (1 - u) * .78]; }, ry: -142, rx: 20, pose: 'run', face: 'determined', build: -.3 }] });
// "Lifted boulders."
shot(at(14, 3), { set: 'town', light: 'golden', dof: 8, shadow: 12, fx: (t, c) => { const b = c.W.boulder; b.visible = true; b.position.set(TG[0] + 8, 8.7 + Math.sin(t * 30) * .05, TG[2] + 8); b.rotation.set(.3, t * .2, .2); b.scale.setScalar(1.4); },
  cam: { tgt: [TG[0] + 8, 5.4, TG[2] + 8], d: 11, yaw: 10, h: -1, fov: 40, push: .1 },
  cast: [{ c: 'hero', p: [TG[0] + 8, 0, TG[2] + 8], ry: 0, pose: 'lift', face: 'angry', build: .1 }] });
// "Fought bigger animals." — knocks out a goat, then a bear
shot(at(14, 5), { set: 'town', light: 'golden', dof: 6, shadow: 14, hus: [.1, .45], kicks: [[.12, .12], [.47, .16]],
  cam: { tgt: [TG[0] + 3.5, 3.4, TG[2] + 14], d: 19, yaw: 12, h: 1.8, fov: 40, push: .1 },
  cast: [{ c: 'hero', p: [TG[0], 0, TG[2] + 14], ry: 90, pose: (t) => t < .4 ? 'punch' : 'uppercut', face: 'angry', build: .45 },
    { an: 'goat2', p: (t) => [TG[0] + 2.4 + t * 3, Math.max(0, Math.sin(cl(t / .6) * Math.PI) * 3), TG[2] + 13], ry: -90, rz: (t) => t * 180, mode: 'hit', k: (t) => cl(t / .3), eyes: 'dizzy' },
    { an: 'bear', p: [TG[0] + 7, 0, TG[2] + 15], ry: -100, mode: 'roar', eyes: 'shock' }] });
// "Grandma kept saying," — training with Grandma's pads
shot(at(15, 0), { set: 'town', light: 'golden', dof: 8, shadow: 12, hus: [.15, .4, .65],
  fx: (t, c) => { const g = c.chars.gran.root.position; c.W.pads.forEach((p, i) => { p.visible = true; p.position.set(g.x - 1.0 + i * 2.0, 3.5, g.z - 1.5); }); },
  cam: { tgt: [TG[0] + .4, 3.7, TG[2] + 21], d: 10, yaw: 18, h: .6, fov: 38, push: .1 },
  cast: [{ c: 'hero', p: [TG[0] - 1.3, 0, TG[2] + 21], ry: 90, pose: 'punch', face: 'determined', build: .75 },
    { c: 'gran', p: [TG[0] + 2.2, 0, TG[2] + 21], ry: -90, pose: 'pads', face: 'laugh' }] });
// "the time will come eventually."
shot(at(15, 3), { set: 'town', light: 'golden', dof: 9, shadow: 10,
  fx: (t, c) => { const g = c.chars.gran.root.position; c.W.pads.forEach((p, i) => { p.visible = true; p.position.set(g.x - 1.0 + i * 2.0, 3.5, g.z - 1.5); }); },
  cam: { tgt: [TG[0] + 2.2, 3.7, TG[2] + 21], d: 3.8, yaw: -70, h: 0, fov: 34, push: .12 },
  cast: [{ c: 'gran', p: [TG[0] + 2.2, 0, TG[2] + 21], ry: -90, pose: 'pads', face: [[0, 'talk'], [.6, 'smile']] }] });

// ===== 5. the final challenge =====
// "Then came the final challenge:"
shot(at(16, 0), { set: 'town', light: 'golden', dof: 0, shadow: 50, fx: all(crowd(.2), screen('FINAL CHALLENGE', '???', '#ff4d6d')),
  cam: { pos: [AX + 30, 18, 26], pos2: [AX + 24, 15, 22], tgt: [AX, 6, -6], fov: 46 } });
// "a gorilla as big as a building."
shot(at(16, 5), { set: 'town', light: 'golden', dof: 0, shadow: 40, kicks: [[.1, .25], [.5, .25]], fx: (t, c) => { c.W.crowdAt(t, 0); c.W.setScreen('GORILLA', 'BIGGEST FEAST', '#5dff7a'); },
  cam: { pos: [AX + 4, 2.0, 18.5], pos2: [AX + 3.5, 1.7, 17.5], tgt: [AX, 14, -6], fov: 64 },
  cast: [{ c: 'gorilla', p: [AX, Y, -6], ry: 0, pose: (t) => ({ armL: [Math.PI * .45 + Math.abs(Math.sin(t * 9)) * .4, .25], armR: [Math.PI * .45 + Math.abs(Math.cos(t * 9)) * .4, -.25], head: [0, -.15] }), face: 'angry' }] });
// "Nobody stepped up."
shot(at(17, 0), { set: 'town', light: 'golden', dof: 6, shadow: 14,
  cam: { tgt: [AX + 1, 3.8, 9.6], d: 11, yaw: 172, h: .8, fov: 40, push: .1 },
  cast: [{ c: 'f4', p: (t) => [AX - 2, Y, 9 + t * 1.4], ry: 180, pose: 'scared', face: 'shock' }, { c: 'f3', p: (t) => [AX + 1, Y, 9.5 + t * 1.6], ry: 170, pose: 'scared', face: 'worried' },
    { c: 'f1', p: (t) => [AX + 3.8, Y, 9 + t * 1.2], ry: 190, pose: 'scared', face: 'shock' }] });
// "Except me." — the buff hero walks forward
shot(at(17, 3), { set: 'town', light: 'golden', dof: 6, shadow: 14,
  cam: { pos: [AX + 1.2, 1.6, 4.4], pos2: [AX + 1.1, 1.8, 3.8], tgt: [AX, 4.6, 9], fov: 44 },
  cast: [{ c: 'heroBuff', p: (t) => [AX, Y, 11 - t * 1.5], ry: 180, pose: 'walk', face: 'determined' }] });
// "Everyone laughed."
shot(at(18, 0), { set: 'town', light: 'golden', dof: 6, shadow: 14, fx: crowd(1.4),
  cam: { pos: [AX + 3, 4.6, 9], pos2: [AX + 3.4, 4.7, 9.8], tgt: [AX + 2.6, 3.6, 21], fov: 50 },
  cast: laughers() });
// "Grandma smiled." — in the front row
shot(at(18, 2), { set: 'town', light: 'golden', dof: 8, shadow: 10, fx: crowd(.6),
  cam: { tgt: [AX + 6.6, 5.1, 20.4], d: 5, yaw: 200, h: -.4, fov: 34, push: .12 },
  cast: [{ c: 'gran', p: [AX + 6.6, 1.6, 20.6], ry: 200, pose: 'idle', face: 'smile' }, ...laughers().slice(2)] });

// ===== 6. the final fight =====
// "The gorilla smashed me into the ground."
shot(at(19, 0), { set: 'town', light: 'golden', dof: 0, shadow: 30, kicks: [[.55, .4]],
  fx: (t, c) => { crowd(.2)(t, c); if (t > .55) { c.W.crater.visible = true; c.W.crater.position.set(0, .32, 5.7); c.W.debris.forEach((d, i) => { const k = t - .55, a = i * .45; d.visible = true; d.position.set(Math.cos(a) * (2 + k * 7), Math.max(.3, 2 + 9 * k - 16 * k * k) * (i % 3 ? 1 : .6), 6 + Math.sin(a) * (2 + k * 7)); d.rotation.set(k * 6 + i, k * 4, i); }); }
    if (t > .55 && t < .65) c.OV.flash = .55; },
  cam: { pos: [AX + 15, 7, 20], pos2: [AX + 16, 6, 21], tgt: [AX, 6, 1], fov: 50 },
  cast: [{ c: 'gorilla', p: [AX, Y, -6], ry: 0, pose: (t) => ({ armR: [t < .4 ? Math.PI * .95 : lerp(Math.PI * .95, Math.PI * .3, (t - .4) / .15), -.1], armL: [.3, .2], lean: t > .4 ? lerp(0, .35, (t - .4) / .15) : 0, head: [0, .2] }), face: 'angry' },
    { c: 'heroBuff', p: (t) => t < .55 ? [AX, Y, 6] : [AX, Y + .55, 8], ry: (t) => t < .55 ? 180 : 0, rx: (t) => t < .55 ? 0 : -90, pose: (t) => t < .55 ? 'idle' : 'lying', face: (t) => t < .55 ? 'determined' : 'shock' }] });
// "Then I heard Grandma." — lying in the crater
shot(at(20, 0), { set: 'town', light: 'golden', dof: 7, shadow: 10, fx: (t, c) => { c.W.crater.visible = true; c.W.crater.position.set(0, .32, 5.7); },
  cam: { pos: [AX + .2, 7.8, 7.4], pos2: [AX + .2, 6.8, 7.2], tgt: [AX, Y, 5.7], fov: 48 },
  cast: [{ c: 'heroBuff', p: [AX, Y + .55, 8], ry: 0, rx: -90, pose: 'lying', face: 'sad' }] });
// "The time will come eventually." — Grandma's face, like a memory
shot(at(20, 4), { set: 'inter', light: 'room', dof: 10, shadow: 8,
  cam: { tgt: [200.7, 3.9, 1005.2], d: 3.4, yaw: -30, h: 0, fov: 34, push: .16 },
  cast: [{ c: 'gran', p: [200.7, 0, 1005.2], ry: -30, pose: 'talk', face: [[0, 'talk'], [.6, 'smile'], [1.1, 'talk']] }],
  ov: (g, t, O) => { const gr = g.createRadialGradient(O.W / 2, O.H / 2, O.W * .25, O.W / 2, O.H / 2, O.W * .9); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.85)'); g.fillStyle = gr; g.fillRect(0, 0, O.W, O.H); } });
// "I got up." — eyes open, power aura
shot(at(21, 0), { set: 'town', light: 'golden', dof: 7, shadow: 12, fx: (t, c) => { c.W.crater.visible = true; c.W.crater.position.set(0, .32, 5.7); for (let i = 0; i < 6; i++) c.FX.flame([AX + Math.sin(i) * 1.6, Y + .3, 6 + Math.cos(i) * 1.2], 1.4, t, i + 1, 8); },
  cam: { pos: [AX + 1.5, 2.2, -1.4], pos2: [AX + 1.2, 2.6, -.6], tgt: [AX, 4.2, 6], fov: 44 },
  cast: [{ c: 'heroBuff', p: [AX, Y, 6], ry: 180, pose: 'flex', face: 'angry' }] });
// "HUS!" ×3 — three different angles, each landing harder
shot(at(21, 3), { set: 'town', light: 'golden', dof: 0, shadow: 20, kicks: [[.03, .2]], fx: crowd(.6),
  cam: side(AX + .5, 4, 12, { yaw: 30, h: 2 }),
  cast: [{ c: 'heroBuff', p: [AX + .6, Y + 1.5, -1], ry: 180, pose: 'bigpunch', face: 'angry' }, { c: 'gorilla', p: [AX, Y, -6], ry: 0, rx: -6, pose: { armL: [.4, .5], armR: [.4, -.5], head: [0, -.3] }, face: 'shock' }] });
shot(at(21, 4), { set: 'town', light: 'golden', dof: 0, shadow: 20, kicks: [[.03, .25]], fx: crowd(.8),
  cam: side(AX - .5, 6, 14, { yaw: -40, h: -1 }),
  cast: [{ c: 'heroBuff', p: [AX - 1, Y + 4, -2], ry: 170, pose: 'kick', face: 'angry' }, { c: 'gorilla', p: [AX, Y, -6.5], ry: 10, rz: -8, pose: { armL: [.6, .8], armR: [.2, -.4], head: [.4, -.2] }, face: 'shock' }] });
shot(at(21, 5), { set: 'town', light: 'golden', dof: 0, shadow: 20, kicks: [[.03, .35]], fx: (t, c) => { crowd(1)(t, c); if (t < .08) c.OV.flash = .4; },
  cam: { pos: [AX + 2, 1.4, 6], pos2: [AX + 2.4, 1.2, 6.6], tgt: [AX, 12, -4], fov: 56 },
  cast: [{ c: 'heroBuff', p: [AX, Y + 7.5, -1.5], ry: 180, pose: 'uppercut', face: 'angry' }, { c: 'gorilla', p: [AX, Y + 1, -7], ry: 0, rx: -18, pose: { armL: [1.2, .9], armR: [1.2, -.9], head: [0, -.5] }, face: 'shock' }] });
// "The gorilla flew out of town."
shot(at(21, 6), { set: 'town', light: 'golden', dof: 0, shadow: 30, fx: crowd(1.4),
  cam: { pos: [AX + 9, 3, 17], pos2: [AX + 9, 4, 18], tgt: [AX, 12, -6], tgt2: [AX - 8, 52, -56], fov: 58, ease: 'lin' },
  cast: [{ c: 'gorilla', p: (t) => [AX - t * 8, Y + t * 50, -6 - t * 50], ry: 0, rx: (t) => -t * 400, rz: (t) => t * 200, pose: { armL: [2.4, .9], armR: [2.4, -.9], legL: .6, legR: -.6 }, face: 'shock', s: (t) => Math.max(.2, 1 - t * .35) },
    { c: 'heroBuff', p: [AX, Y, 3], ry: 180, pose: 'flex', face: 'grin' }],
  ov: (g, t, O) => { const k = (t - 1.0) / .25; if (k < 0 || k > 1.2) return; const x = O.W * .32, y = O.H * .12, r = 90 * O.PX * Math.sin(Math.min(1, k) * Math.PI);
    g.save(); g.translate(x, y); g.rotate(k * 2); g.fillStyle = '#fff6c8'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = i % 2 ? r * .25 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill(); g.restore(); } });

// ===== 7. ending =====
// "The biggest feast ever."
shot(at(22, 0), { set: 'town', light: 'golden', dof: 0, shadow: 30, fx: (t, c) => { crowd(1.4)(t, c); food(c, 'megafeast', [AX, Y, 2], 1, 0); c.FX.confetti(t, [AX, 0, 2], [24, 16, 16], 400); c.FX.bills(t, [AX, 0, 2], [20, 14, 14], 120); },
  cam: { tgt: [AX, 4, 2], d: 17, yaw: 0, h: 3, fov: 42, push: .12 },
  cast: [{ c: 'heroBuff', p: [AX, Y, -1], ry: 0, pose: 'cheer', face: 'laugh' }] });
// "I took it all to Grandma." — carrying a tower of food home
shot(at(22, 4), { set: 'town', light: 'golden', dof: 4, shadow: 20, fx: (t, c) => { const h = c.chars.heroBuff.root.position; food(c, 'tray', [h.x + 1.5, 3.6, h.z], 1.15, Math.PI / 2); },
  cam: { tgt: [76, 5, -6.2], d: 13, yaw: 25, h: 1.5, fov: 42, push: .1 },
  cast: [{ c: 'heroBuff', p: (t) => [72 + t * 2.2, .3, -6.2], ry: 90, pose: 'carry', face: 'grin' }] });
// "I told you the time would come eventually." — the feast on Grandma's table
shot(at(23, 0), { set: 'inter', light: 'office', dof: 6, shadow: 14, fx: (t, c) => { kitchenNight(t, c); food(c, 'feast', [200, 0, 995.6], 1, 0); },
  cam: { pos: [200, 6.6, 990.7], pos2: [200, 6.3, 991.3], tgt: [200, 3.4, 1004], fov: 48 },
  cast: [{ c: 'gran', p: [198.3, 0, 1005.6], ry: 160, pose: 'talk', face: [[0, 'smile'], [.4, 'talk'], [1.2, 'smile']] }, { c: 'heroBuff', p: [201.7, 0, 1005.6], ry: 200, pose: 'idle', face: 'grin' }] });
// "Then something tapped my shoulder."
shot(at(24, 0), { set: 'inter', light: 'office', dof: 8, shadow: 10, fx: (t, c) => { kitchenNight(t, c); food(c, 'feast', [200, 0, 995.6], 1, 0); },
  cam: { tgt: [201.7, 4.3, 1005.6], d: 4.2, yaw: 190, h: 0, fov: 36, push: .12 },
  cast: [{ c: 'heroBuff', p: [201.7, 0, 1005.6], ry: (t) => lerp(200, 150, (t - .35) / .3), pose: 'idle', face: (t) => t < .35 ? 'grin' : 'worried' }] });
// "The worm. It had been training too." — the buff worm, headband on, flexing on the counter
shot(at(24, 5), { set: 'inter', light: 'office', dof: 7, shadow: 10, focus: [202, 3.4, 1006.8], fx: kitchenNight,
  cam: { pos: [193.4, 4.0, 1006.7], pos2: [194.4, 3.9, 1006.7], tgt: [202.0, 3.2, 1006.8], fov: 46 },
  cast: [{ an: 'buffworm', p: [201.8, .02, 1008.3], ry: 180, mode: 'attack', eyes: 'angry', s: 2.0 }, { c: 'heroBuff', p: [202.2, 0, 1005.4], ry: -15, pose: { armL: [.35, -.5], armR: [.35, .5], lean: -.12, head: [0, -.1] }, face: 'shock' }] });
// end card
shot(Math.min(DUR - 2.2, byLine[24][byLine[24].length - 1].end + .25), { set: 'inter', light: 'office', dof: 7, shadow: 10, fx: kitchenNight, nocap: true,
  cam: { pos: [191.6, 4.4, 1006.6], pos2: [191.9, 4.4, 1006.6], tgt: [202.0, 3.2, 1006.8], fov: 50 },
  cast: [{ an: 'buffworm', p: [201.8, .02, 1008.3], ry: 180, mode: 'attack', eyes: 'angry', s: 2.0 }, { c: 'heroBuff', p: [202.2, 0, 1005.4], ry: -15, pose: { armL: [.35, -.5], armR: [.35, .5], lean: -.12, head: [0, -.1] }, face: 'shock' }],
  ov: (g, t, O) => {
    g.save(); g.fillStyle = `rgba(0,0,0,${Math.min(.45, t * 2)})`; g.fillRect(0, 0, O.W, O.H); g.restore();
    O.pop(g, t, .1, 'REMATCH?', .5, .2, 150, '#ffffff', { stroke: '#111', strokeW: 16 });
    O.pop(g, t, .5, 'YES', .32, .5, 150, '#3ee870', { stroke: '#0b3d1a', strokeW: 16 });
    O.pop(g, t, .6, 'or', .5, .505, 90, '#ffffff', { stroke: '#111', strokeW: 10 });
    O.pop(g, t, .7, 'NO', .68, .5, 150, '#ff3b3b', { stroke: '#3d0000', strokeW: 16 });
  } });

S.sort((p, q) => p.a - q.a);
S.forEach((s, i) => { s.b = i + 1 < S.length ? S[i + 1].a : DUR + .1; });
S[0].a = 0;
export const SHOTS = S;
