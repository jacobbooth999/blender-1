// "In This Town, You Must NEVER Stop Dancing" — shot list.
// Cuts sit on narration words: at(line, word) reads voice/words.json. Suburb coordinates are offset by SUBZ (Z()).
// cam: orbit {tgt, d, yaw, h, fov, push, dyaw} or {pos, pos2, tgt, tgt2, fov, ease}. Character ry 0 faces +z.
import { POSES } from './rig.js';
import { crowdRect, crowdRing, dancer } from './crowd.js';
import { SUPER, HOSP, HALL } from './interiors.js';

export const WORDS_URL = '../voice/words.json';
const WJ = await (await fetch(WORDS_URL)).json();
const byLine = {}; WJ.words.forEach((w) => (byLine[w.p] ||= []).push(w));
const at = (li, j = 0) => { const L = byLine[li]; return L[Math.min(j, L.length - 1)].start - .07; };
const endOf = (li) => { const L = byLine[li]; return L[L.length - 1].end; };
const DUR = WJ.duration;

const SUBZ = 3000;
const Z = (x, y, z) => [x, y, z + SUBZ];

const base = {
  hero: { shirt: '#4b8cf0', zip: true, longSleeve: true, pants: '#2d2d3a', shoes: '#ffffff', hair: 'messy', hairColor: '#2a1a10', skin: '#e8b48a' },
  gran: { shirt: '#b07ad9', longSleeve: true, pants: '#6a4c93', shoes: '#5a3a2a', hair: 'bun', hairColor: '#e0e0e0', skin: '#f2c9a0', glasses: true, scale: .88 },
  oldman: { shirt: '#c9a46b', longSleeve: true, pants: '#5a4a3a', shoes: '#3a2a20', hair: 'grey', hairColor: '#e6e6e6', skin: '#f2c9a0', glasses: true, scale: .95 },
  woman: { shirt: '#ff6fa8', pants: '#3b3b6b', shoes: '#ffffff', hair: 'long', hairColor: '#3a2616', skin: '#c98f5f' },
  tripper: { shirt: '#ff8a3d', pants: '#2f3a56', shoes: '#222', hat: 'cap', hatColor: '#2e7d32', hair: 'short', hairColor: '#111', skin: '#f7d7b5' },
  shopper: { shirt: '#7bd389', pants: '#3b2f2f', hair: 'pony', hairColor: '#b5542a', skin: '#f2c9a0' },
  eater: { shirt: '#ffb400', pants: '#1f2937', hair: 'short', hairColor: '#5a3a22', skin: '#8d5a3b' },
  cashier: { shirt: '#e53935', pants: '#22223b', hat: 'cap', hatColor: '#e53935', hair: 'short', hairColor: '#111', skin: '#c98f5f' },
  patient: { shirt: '#ff8fb0', longSleeve: true, pants: '#ff8fb0', hair: 'short', hairColor: '#dddddd', skin: '#f2c9a0' },
  nurse: { shirt: '#5ac8b8', pants: '#5ac8b8', shoes: '#ffffff', hair: 'bun', hairColor: '#3a2616', skin: '#e8b48a' },
  teacher: { shirt: '#6a4c93', longSleeve: true, pants: '#2f2f4f', tie: '#ffd43b', hair: 'short', hairColor: '#5a3a22', skin: '#f2c9a0', glasses: true },
  k1: { shirt: '#ff5a5f', pants: '#2f3a56', hair: 'spiky', hairColor: '#111', skin: '#8d5a3b', scale: .78 },
  k2: { shirt: '#ffd43b', pants: '#4a5568', hair: 'pony', hairColor: '#e0b040', skin: '#f2c9a0', scale: .78 },
  k3: { shirt: '#3ec1d3', pants: '#2d6a4f', hair: 'short', hairColor: '#5a3a22', skin: '#c98f5f', scale: .78 },
  k4: { shirt: '#a66cff', pants: '#22223b', hair: 'long', hairColor: '#111', skin: '#e8b48a', scale: .78 },
  k5: { shirt: '#7bd389', pants: '#3b2f2f', hat: 'beanie', hatColor: '#ff6f91', hair: 'short', hairColor: '#2a1a10', skin: '#f7d7b5', scale: .78 },
  k6: { shirt: '#ff8a3d', pants: '#1f2937', hair: 'messy', hairColor: '#b5542a', skin: '#a86b45', scale: .78 },
  beast: { shirt: '#120a1c', longSleeve: true, pants: '#120a1c', shoes: '#120a1c', hair: 'spiky', hairColor: '#0c0612', skin: '#140c20', scale: 16 },
};
export const CAST = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, { ...v, badge: false }]));
export const SPEAKERS = {
  2: { name: 'HIM', color: '#7fb2ff' }, 3: { name: 'OLD MAN', color: '#ffd28a' }, 6: { name: 'HIM', color: '#7fb2ff' }, 7: { name: 'WOMAN', color: '#ff9cc8' },
  19: { name: 'GRANDMA', color: '#d9a8ff' }, 25: { name: 'THE THING', color: '#ff5a5a' }, 30: { name: 'THE THING', color: '#ff5a5a' },
  32: { name: 'GRANDMA', color: '#d9a8ff' }, 33: { name: 'GRANDMA', color: '#d9a8ff' }, 34: { name: 'GRANDMA', color: '#d9a8ff' },
};

// ---------- helpers ----------
const cl = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, k) => a + (b - a) * cl(k);
const smooth = (k) => { k = cl(k); return k * k * (3 - 2 * k); };
const all = (...fs) => (t, c) => fs.forEach((f) => f && f(t, c));
const mixPose = (a, b, kf) => (t) => {
  const pa = typeof a === 'string' ? POSES[a](t) : a(t), pb = typeof b === 'string' ? POSES[b](t) : b(t), k = cl(kf(t));
  const L = (x, y) => (x || 0) + ((y || 0) - (x || 0)) * k, A = (x = [0, 0, 0], y = [0, 0, 0]) => x.map((v, i) => L(v, y[i]));
  return { armL: A(pa.armL, pb.armL), armR: A(pa.armR, pb.armR), legL: L(pa.legL, pb.legL), legR: L(pa.legR, pb.legR), head: A(pa.head, pb.head), lean: L(pa.lean, pb.lean), twist: L(pa.twist, pb.twist), tilt: L(pa.tilt, pb.tilt), bob: L(pa.bob, pb.bob) };
};
const orbit = (tgt, d, yaw, h, fov = 36, extra = {}) => ({ tgt, d, yaw, h, fov, ...extra });

// ---------- places ----------
const HERO = Z(0, 0, -40);                    // hero's spot on the street
const TRIP = Z(1.6, 0, -31);                  // where the tripper falls
const SQ = Z(0, .22, -282);                   // hero's spot in the town square (fountain behind at z -308, town hall -356)
const BEAST = Z(0, 0, -392);                  // the creature rises behind the town hall
const BEAST_CHEST = Z(0, 44, -372);

// ---------- crowds (built once; modes set per frame) ----------
const STREET = crowdRect(1, -10.5, 10.5, -128 + SUBZ, -14 + SUBZ, 300, 0, 0, [HERO[0], HERO[2], 3.2])
  .filter((d) => Math.hypot(d.p[0] - TRIP[0], d.p[2] - (TRIP[2] + 1.5)) > 5.2 && Math.hypot(d.p[0] - 2, d.p[2] - (HERO[2] + 1)) > 3.5);
const SQUARE = crowdRect(2, -15, 15, -336 + SUBZ, -252 + SUBZ, 400, 0, .1, [SQ[0], SQ[2], 4.5])
  .filter((d) => Math.hypot(d.p[0], d.p[2] - (-308 + SUBZ)) > 9.6 && d.p[2] < -256 + SUBZ + 4 && !(d.p[2] < -320 + SUBZ && Math.abs(d.p[0]) < 9));
for (const d of SQUARE) d.ry = Math.atan2(SQ[0] - d.p[0], SQ[2] - d.p[2]) * 180 / Math.PI + (Math.sin(d.ph * 7) * 40);
const NIGHT = crowdRect(3, -10.5, 10.5, -300 + SUBZ, -150 + SUBZ, 260, 0, 0);
const SHOPPERS = [[-5, -6], [-5, 1], [5, -6], [5.6, -1], [-14, 8], [14, -8], [9, 10], [-2, 9], [4.4, -10]].map(([x, z], i) => dancer(500 + i, [SUPER[0] + x, 0, SUPER[2] + z], (i * 47) % 360));
const KIDS_FILL = [];
const drawCrowd = (list, opts = {}) => (t, c) => c.CR.draw(list, t + (opts.t0 || 0), opts);
const heads = (list, n, step = 7) => list.filter((_, i) => i % step === 0).slice(0, n).map((d) => [d.p[0], 4.6, d.p[2]]);

// ---------- shots ----------
const S = [];
const shot = (a, o) => S.push({ a, ...o });
const DAY = { set: 'sub', light: 'sub' };

// ===== SCENE 1: THE HOOK =====
// "In this town, everyone has to keep dancing." — aerial rush down onto the dancing street
shot(0, { ...DAY, dof: 0, shadow: 70, shadowAt: Z(0, 0, -60), fx: drawCrowd(STREET),
  cam: { pos: Z(0, 70, 40), pos2: Z(0, 16, -2), tgt: Z(0, 0, -90), tgt2: Z(0, 2, -60), fov: 52, ease: 'zoom', zt: 1.4 } });
shot(at(0, 5), { ...DAY, dof: 6, shadow: 30, shadowAt: Z(0, 0, -50), fx: drawCrowd(STREET),
  cam: { pos: Z(-6, 2.6, -18), pos2: Z(-3, 2.8, -24), tgt: Z(2, 3.8, -40), fov: 44 } });
// "And if you stop, something terrible happens." — supermarket / hospital / school
shot(at(1, 0), { set: 'inter', light: 'room', dof: 6, shadow: 22, shadowAt: SUPER, fx: drawCrowd(SHOPPERS),
  cam: { pos: [SUPER[0] + 5, 5.2, SUPER[2] + 12.5], pos2: [SUPER[0] + 5, 4.8, SUPER[2] + 10.8], tgt: [SUPER[0] + 5, 3.2, SUPER[2] - 4], fov: 50 },
  cast: [{ c: 'eater', p: [SUPER[0] + 4.4, 0, SUPER[2] + 3.4], ry: 15, pose: 'eatDance', face: 'grin', props: [{ k: 'sandwich' }] },
    { c: 'cashier', p: [SUPER[0] - 9, 0, SUPER[2] + 11.2], ry: 180, pose: 'dance3', face: 'smile' }] });
shot(at(1, 2), { set: 'inter', light: 'room', dof: 8, shadow: 14, shadowAt: SUPER, focus: [SUPER[0] + 4.4, 4.4, SUPER[2] + 3.4], fx: drawCrowd(SHOPPERS),
  cam: orbit([SUPER[0] + 4.4, 4.3, SUPER[2] + 3.4], 6.2, 20, .4, 36, { push: .1 }),
  cast: [{ c: 'eater', p: [SUPER[0] + 4.4, 0, SUPER[2] + 3.4], ry: 15, pose: 'eatDance', face: 'grin', props: [{ k: 'sandwich' }] }] });
shot(at(1, 3), { set: 'inter', light: 'room', dof: 6, shadow: 16, shadowAt: HOSP, fx: (t, c) => c.W.drawHeart(t * 1.6),
  cam: orbit([HOSP[0] - 6, 3.4, HOSP[2] - 4.4], 7.5, 30, 5.5, 44, { push: .12 }),
  cast: [{ c: 'patient', p: [HOSP[0] - 6, 3.25, HOSP[2] - 2.0], rx: -90, pose: 'sleepDance', face: 'smile', ph: 0 },
    { c: 'nurse', p: [HOSP[0] - 10, 0, HOSP[2] - 2.5], ry: 60, pose: 'dance5', face: 't3' }] });
shot(at(1, 5), { set: 'inter', light: 'room', dof: 6, shadow: 18, shadowAt: [0, 0, 1003],
  cam: { pos: [2, 7.8, 990.2], pos2: [1, 7.2, 991], tgt: [0, 2.8, 1004], fov: 56 },
  cast: [['k1', -6, 1.3], ['k2', 0, 1.3], ['k3', 6, 1.3], ['k4', -6, 5.8], ['k5', 0, 5.8], ['k6', 6, 5.8]].map(([id, x, z], i) => ({ c: id, p: [x, 0, 1000 + z], ry: 180, pose: 'dance' + (i % 6), face: ['grin', 'smile', 't21', 'laugh', 't18', 't3'][i], ph: i * .4 }))
    .concat([{ c: 'teacher', p: [-5, 0, 991.5], ry: 0, pose: 'dance1', face: 'grin' }]) });
// "Why is everyone dancing?" — push in on the nervous hero in the middle of the street
shot(at(2, 0), { ...DAY, dof: 7, shadow: 26, shadowAt: HERO, fx: drawCrowd(STREET),
  cam: { pos: Z(0, 6, -20), pos2: Z(0, 4.9, -31.5), tgt: Z(0, 4.0, -40), fov: 38, ease: 'zoom', zt: .9 },
  cast: [{ c: 'hero', p: HERO, ry: 0, pose: 'nervousDance', face: 'worried' }] });
// "Never. Stop. Moving." — the old man grabs his shoulder, still dancing
shot(at(3, 0), { ...DAY, dof: 8, shadow: 20, shadowAt: HERO, fx: drawCrowd(STREET),
  cam: orbit(Z(1.1, 4.0, -40), 15, 20, .6, 36, { push: .12 }),
  cast: [{ c: 'hero', p: HERO, ry: 30, pose: 'nervousDance', face: 'shock' },
    { c: 'oldman', p: Z(2.3, 0, -39.4), ry: -75, pose: 'grabShoulder', face: 't7' }] });
shot(at(3, 1), { ...DAY, dof: 10, shadow: 14, shadowAt: HERO, fx: drawCrowd(STREET), kicks: [[.02, .08]],
  cam: orbit(Z(2.3, 4.55, -39.4), 3.6, -60, .05, 30, { push: .18 }),
  cast: [{ c: 'oldman', p: Z(2.3, 0, -39.4), ry: -75, pose: 'grabShoulder', face: 't8' }, { c: 'hero', p: HERO, ry: 30, pose: 'stand', face: 'shock' }] });
shot(at(3, 2), { ...DAY, dof: 10, shadow: 14, shadowAt: HERO, fx: drawCrowd(STREET), kicks: [[.02, .1]],
  cam: orbit(Z(2.3, 4.55, -39.4), 2.6, -60, .05, 30, { push: .1 }),
  cast: [{ c: 'oldman', p: Z(2.3, 0, -39.4), ry: -75, pose: 'grabShoulder', face: 't7' }, { c: 'hero', p: HERO, ry: 30, pose: 'stand', face: 'shock' }] });

// ===== SCENE 2: THE MYSTERY =====
// "Nobody knew why they had to dance." — slow orbit over the crowd
shot(at(4, 0), { ...DAY, dof: 0, shadow: 50, shadowAt: Z(0, 0, -50), fx: drawCrowd(STREET),
  cam: orbit(Z(0, 2, -48), 40, -35, 22, 40, { dyaw: 25, push: .05 }),
  cast: [{ c: 'hero', p: HERO, ry: 0, pose: 'nervousDance', face: 'worried' }, { c: 'tripper', p: TRIP, ry: -10, pose: 'dance4', face: 'grin' }] });
// "They just knew what happened to people who stopped." — meet the tripper
shot(at(5, 0), { ...DAY, dof: 7, shadow: 22, shadowAt: TRIP, fx: drawCrowd(STREET),
  cam: orbit(Z(1.6, 3.4, -31), 15, 12, 1.2, 38, { push: .1 }),
  cast: [{ c: 'tripper', p: TRIP, ry: -10, pose: 'dance4', face: 'grin' }] });
// the trip (end of line 5 + pause): trip, freeze, silence, alarm, hands, gone
const E5 = endOf(5) + .05;
export const BEATS = { trip: E5, freeze: E5 + .8, alarm: E5 + 2.0, hands: E5 + 2.9, gone: E5 + 4.6, resume: E5 + 4.9 };
const tripCast = (k0) => ({ c: 'tripper', p: (t) => [TRIP[0], .35 * cl((t + k0) / .35), TRIP[2] + 1.2 * cl((t + k0) / .35)], ry: -10,
  rx: (t) => 84 * smooth((t + k0) / .35), pose: (t) => (t + k0 < .2 ? POSES.trip(t) : POSES.fallen(t)), face: 'shock' });
shot(BEATS.trip, { ...DAY, dof: 7, shadow: 22, shadowAt: TRIP, fx: drawCrowd(STREET), kicks: [[.32, .14]],
  cam: orbit(Z(1.6, 2.2, -29.5), 12, -22, 1.4, 40),
  cast: [tripCast(0)] });
// everyone freezes and turns
shot(BEATS.freeze, { ...DAY, dof: 0, shadow: 40, shadowAt: Z(0, 0, -40), fx: (t, c) => c.CR.draw(STREET, t, { mode: 'stare', look: TRIP, k: smooth(t / .7), freezeAt: 0 }),
  cam: { pos: Z(-3, 2.4, -16), pos2: Z(-3, 2.6, -17), tgt: Z(1, 3.5, -50), fov: 46 },
  cast: [tripCast(1), { c: 'hero', p: HERO, ry: 10, pose: 'stand', face: 'shock' }] });
const alarmOV = (t0) => (g, t, OV) => { const a = .28 + .22 * Math.sin((t + t0) * 14); const gr = g.createRadialGradient(OV.W / 2, OV.H / 2, OV.H * .2, OV.W / 2, OV.H / 2, OV.H * .75); gr.addColorStop(0, 'rgba(255,0,0,0)'); gr.addColorStop(1, `rgba(255,0,0,${Math.max(0, a)})`); g.fillStyle = gr; g.fillRect(0, 0, OV.W, OV.H); };
shot(BEATS.alarm, { ...DAY, dof: 6, shadow: 22, shadowAt: TRIP, ov: alarmOV(0), wobble: .03,
  fx: (t, c) => c.CR.draw(STREET, t, { mode: 'stare', look: TRIP, k: 1, faces: 'scared' }),
  cam: orbit(Z(1.6, 1.0, -29.2), 9, -15, 7, 40, { push: .2 }),
  cast: [{ ...tripCast(2), face: 'cry' }] });
// the hands
shot(BEATS.hands, { ...DAY, dof: 0, shadow: 22, shadowAt: TRIP, ov: alarmOV(1), wobble: .06, kicks: [[0, .15], [.9, .2]],
  fx: (t, c) => { c.CR.draw(STREET, t, { mode: 'stare', look: TRIP, k: 1, faces: 'scared' }); c.W.placeHands(TRIP, t, cl(t / .7), 2.6); c.FX.smoke(t, [TRIP[0], 0, TRIP[2]], 2.5, 24, 3, 3); },
  cam: orbit(Z(1.6, 2.4, -31), 20, 14, 6, 44),
  cast: [{ c: 'tripper', p: (t) => [TRIP[0], -6.5 * smooth((t - .55) / 1.1), TRIP[2]], ry: -10, pose: 'reachUp', face: 'shock' }] });
// gone — straight back to dancing
shot(BEATS.gone, { ...DAY, dof: 0, shadow: 40, shadowAt: Z(0, 0, -40), fx: (t, c) => { c.CR.draw(STREET, t, { mode: 'dance' }); },
  cam: orbit(Z(1, 2, -34), 18, 0, 5, 42) });
// "WHAT WAS THAT?!"
shot(at(6, 0), { ...DAY, dof: 9, shadow: 16, shadowAt: HERO, fx: drawCrowd(STREET), kicks: [[.05, .12]],
  cam: orbit(Z(0, 4.4, -40), 6.5, 25, .9, 34, { push: .2 }),
  cast: [{ c: 'hero', p: HERO, ry: 0, pose: 'armsOut', face: 'shock' }] });
// "The town needs us moving." — the woman leans in, whispering, smiling too much
shot(at(7, 0), { ...DAY, dof: 9, shadow: 16, shadowAt: HERO, fx: (t, c) => c.CR.draw(STREET, t, { mode: 'creepy' }),
  cam: orbit(Z(-.8, 4.5, -40), 5.4, 28, .1, 32, { push: .12 }),
  cast: [{ c: 'hero', p: HERO, ry: -30, pose: 'stand', face: 't22' }, { c: 'woman', p: Z(-2.0, 0, -39.5), ry: 80, pose: 'whisper', face: 't12' }] });

// ===== SCENE 3: THE WARNING (night) =====
const NIGHTSET = { set: 'sub', light: 'subNight' };
// "That night, he decided to investigate."
shot(at(8, 0), { ...NIGHTSET, dof: 0, shadow: 50, shadowAt: Z(0, 0, -240), fx: (t, c) => c.CR.draw(NIGHT, t, { mode: 'creepy' }),
  cam: { pos: Z(0, 22, -110), pos2: Z(0, 18, -126), tgt: Z(0, 6, -330), fov: 46 },
  cast: [{ c: 'hero', p: (t) => Z(-8.2, 0, -140 - t * 2.2), ry: 180, pose: 'sneak', face: 'worried' }] });
shot(at(8, 3), { ...NIGHTSET, dof: 6, shadow: 26, shadowAt: Z(-6, 0, -322), fx: (t, c) => c.CR.draw(NIGHT, t, { mode: 'creepy' }),
  cam: orbit(Z(-6, 3.2, -322), 9, 140, 1.2, 40, { push: .1 }),
  cast: [{ c: 'hero', p: (t) => Z(-6, .22, -320 - t * 1.6), ry: 180, pose: 'sneak', face: 'worried' }] });
// "He found the town's old security footage." — the archive, CRT glowing
const HALLSET = { set: 'inter', light: 'hall' };
const H = (x, y, z) => [HALL[0] + x, y, HALL[2] + z];
const crtOn = (mode, years) => (t, c) => { c.W.cctv(mode, t, years); c.W.lampLight.intensity = 4; };
shot(at(9, 0), { ...HALLSET, dof: 6, shadow: 14, shadowAt: H(3, 0, -4), fx: crtOn('feed', 50),
  cam: { pos: H(-2.5, 6.5, 5), pos2: H(-1.6, 6.2, 3.6), tgt: H(3, 4.2, -4.4), fov: 42 },
  cast: [{ c: 'hero', p: H(3, 0, -1.6), ry: 180, pose: 'read', face: 'worried' }] });
// "Fifty years ago..."
const screenCam = (zoom = 0) => ({ pos: H(3, 4.2, .9 + zoom), pos2: H(3, 4.2, .5 + zoom), tgt: H(3, 4.2, -4.3), fov: 64 });
shot(at(10, 0), { ...HALLSET, dof: 0, shadow: 10, fx: crtOn('feed', 50), cam: screenCam(), nocap: false });
shot(at(11, 0), { ...HALLSET, dof: 0, shadow: 10, fx: crtOn('feed', 100), cam: screenCam(-.3) });
shot(at(11, 4), { ...HALLSET, dof: 8, shadow: 10, fx: crtOn('feed', 100),
  cam: orbit(H(3, 4.6, -1.6), 3.2, 160, .1, 34, { push: .1 }),
  cast: [{ c: 'hero', p: H(3, 0, -1.6), ry: 180, pose: 'read', face: 't2' }] });
shot(at(12, 0), { ...HALLSET, dof: 0, shadow: 10, fx: crtOn('feed', 200), cam: { pos: H(3, 4.2, .6), pos2: H(3, 4.2, -.2), tgt: H(3, 4.2, -4.3), fov: 64 } });
// "Then he found an old newspaper." / headline
shot(at(13, 0), { ...HALLSET, dof: 6, shadow: 12, fx: crtOn('off'),
  cam: orbit(H(2.4, 3.8, -3.0), 5.5, 62, 2.0, 40, { push: .1 }),
  cast: [{ c: 'hero', p: H(2.4, 0, -1.6), ry: 180, pose: 'read', face: 't6', props: [{ k: 'news' }] }] });
shot(at(14, 0), { ...HALLSET, dof: 0, shadow: 10, fx: (t, c) => { c.W.lampLight.intensity = 5; },
  cam: { pos: H(.7, 6.4, -2.9), pos2: H(.7, 5.4, -3.2), tgt: H(.7, 2.77, -3.5), fov: 40 },
  cast: [] });
// "Suddenly, the computer turned on by itself." / "Do not stop."
shot(at(15, 0), { ...HALLSET, dof: 7, shadow: 12, fx: (t, c) => { c.W.lampLight.intensity = 3; if (t > .9) c.W.cctv('msg', t); },
  cam: orbit(H(2.4, 4.4, -1.6), 7.5, -120, 1, 38, { push: .15 }), kicks: [[.9, .1]],
  cast: [{ c: 'hero', p: H(2.4, 0, -1.6), ry: (t) => (t < 1.0 ? 180 : 160), pose: (t) => (t < 1.0 ? POSES.read(t) : POSES.scared(t)), face: (t) => (t < 1.0 ? 'neutral' : 'shock') }] });
shot(at(16, 0), { ...HALLSET, dof: 0, shadow: 10, fx: (t, c) => c.W.cctv('msg', t), kicks: [[.02, .12]], wobble: .015,
  cam: { pos: H(3, 4.2, .7), pos2: H(3, 4.2, .1), tgt: H(3, 4.2, -4.3), fov: 64 } });

// ===== SCENE 4: THE PLOT TWIST =====
// "But he made one decision that would change everything." — the square, packed
const sqDraw = (opts = {}) => (t, c) => c.CR.draw(SQUARE, t, { mode: 'creepy', ...opts });
const granSQ = Z(2.7, .22, -281.4);
shot(at(17, 0), { ...DAY, dof: 0, shadow: 60, shadowAt: Z(0, 0, -295), fx: sqDraw({ mode: 'dance' }),
  cam: { pos: Z(0, 46, -236), pos2: Z(0, 30, -252), tgt: Z(0, 2, -300), fov: 46 },
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'nervousDance', face: 'neutral' }, { c: 'gran', p: granSQ, ry: -20, pose: 'dance5', face: 'smile' }] });
// "He walked into the town square, and slowly stopped moving."
shot(at(18, 0), { ...DAY, dof: 7, shadow: 26, shadowAt: SQ, fx: sqDraw({ mode: 'dance' }),
  cam: orbit(Z(0, 3.6, -282), 16, 15, 1.2, 40, { push: .15 }),
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: mixPose('nervousDance', 'stand', (t) => (t - (at(18, 7) - at(18, 0))) / 1.2), face: 'neutral' },
    { c: 'gran', p: granSQ, ry: -20, pose: 'dance5', face: 'smile' }] });
// "PLEASE! NOT YOU!"
shot(at(19, 0), { ...DAY, dof: 9, shadow: 16, shadowAt: granSQ, fx: sqDraw({ mode: 'dance' }), kicks: [[.05, .12]],
  cam: orbit(Z(2.7, 4.0, -281.4), 4.6, 35, .1, 34, { push: .15 }),
  cast: [{ c: 'gran', p: granSQ, ry: -55, pose: 'screamReach', face: 'cry' }, { c: 'hero', p: SQ, ry: 0, pose: 'stand', face: 'neutral' }] });
// three seconds of nothing: everyone keeps dancing, silently; he stands still
const E19 = endOf(19) + .1;
shot(E19, { ...DAY, dof: 0, shadow: 40, shadowAt: SQ, fx: sqDraw({ mode: 'dance' }),
  cam: { pos: Z(0, 5, -258), pos2: Z(0, 4.8, -262), tgt: Z(0, 4, -290), fov: 42 },
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'stand', face: 'neutral' }, { c: 'gran', p: granSQ, ry: -55, pose: 'screamReach', face: 'cry' }] });
shot(E19 + 1.6, { ...DAY, dof: 10, shadow: 14, shadowAt: SQ, fx: sqDraw({ mode: 'dance' }),
  cam: orbit(Z(0, 4.6, -282), 3.8, 0, .05, 30, { push: .12 }),
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'stand', face: (t) => (t > 1.0 ? 't19' : 'neutral') }] });
// "Then the ground began to shake."
shot(at(20, 0), { ...DAY, dof: 0, shadow: 40, shadowAt: SQ, wobble: .22, fx: (t, c) => { sqDraw({ mode: 'dance' })(t, c); c.FX.smoke(t, Z(0, 0, -300), 18, 40, 5, 2); },
  cam: orbit(Z(0, 3, -290), 26, 10, 6, 42),
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'scared', face: 'shock' }, { c: 'gran', p: granSQ, ry: -55, pose: 'scared', face: 'shock' }] });
// "The sky turned black."
shot(at(21, 0), { set: 'sub', light: 'void', dof: 0, shadow: 60, shadowAt: SQ, wobble: .1, fx: sqDraw({ mode: 'freeze', freezeAt: 0 }),
  cam: { pos: Z(0, 9, -248), pos2: Z(0, 10, -250), tgt: Z(0, 28, -340), fov: 52 },
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'stand', face: 'shock' }] });
// "And every single person turned to look at him."
shot(at(22, 0), { set: 'sub', light: 'void', dof: 7, shadow: 30, shadowAt: SQ, fx: (t, c) => c.CR.draw(SQUARE, t, { mode: 'stare', look: SQ, k: smooth(t / 1.2), faces: 'stare', freezeAt: 0 }),
  cam: { pos: Z(-.8, 5.6, -277.5), pos2: Z(-.6, 5.4, -278.5), tgt: Z(0, 4, -300), fov: 44 },
  cast: [{ c: 'hero', p: SQ, ry: 180, pose: 'stand', face: 'shock' }] });
shot(at(22, 5), { set: 'sub', light: 'void', dof: 0, shadow: 50, shadowAt: SQ, fx: (t, c) => c.CR.draw(SQUARE, t, { mode: 'stare', look: SQ, k: 1, faces: 'stare' }),
  cam: { pos: Z(0, 40, -282), pos2: Z(0, 30, -282.5), tgt: Z(0, 0, -282), fov: 46 },
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'stand', face: 'shock' }] });
// "Something enormous rose from beneath the town."
const beastCast = (yf, pose = 'giantRise', ryf = 0) => ({ c: 'beast', p: (t) => [BEAST[0], yf(t), BEAST[2]], ry: ryf, pose, face: 'creature' });
const voidFX = (extra) => (t, c) => { c.CR.draw(SQUARE, t, { mode: 'stare', look: SQ, k: 1, faces: 'stare' }); c.FX.smoke(t, Z(0, 0, -380), 30, 70, 9, 30); if (extra) extra(t, c); };
shot(at(23, 0), { set: 'sub', light: 'void', dof: 0, shadow: 80, shadowAt: Z(0, 0, -330), wobble: .12, fx: voidFX(),
  cam: { pos: Z(0, 7, -262), pos2: Z(0, 6, -266), tgt: Z(0, 30, -340), tgt2: Z(0, 52, -360), fov: 56 },
  cast: [beastCast((t) => -80 + 62 * smooth(t / 2.6)), { c: 'hero', p: SQ, ry: 180, pose: 'stand', face: 'shock' }] });
// "But it didn't attack him."
shot(at(24, 0), { set: 'sub', light: 'void', dof: 6, shadow: 60, shadowAt: SQ, fx: voidFX(),
  cam: { pos: Z(4, 3.2, -275), pos2: Z(3.6, 3.4, -276), tgt: Z(-2, 30, -330), fov: 54 },
  cast: [beastCast(() => -18, (t) => POSES.giantPoint(t)), { c: 'hero', p: SQ, ry: 180, pose: 'scared', face: 'shock' }] });
// "Finally. Someone has stopped feeding me."
shot(at(25, 0), { set: 'sub', light: 'void', dof: 0, shadow: 60, fx: voidFX(), wobble: .03,
  cam: { pos: Z(0, 56, -300), pos2: Z(0, 57, -306), tgt: Z(0, 62, -380), fov: 44 },
  cast: [beastCast(() => -18, (t) => POSES.giantPoint(t))] });

// ===== SCENE 5: THE FINAL TWIST =====
// "He thought stopping the dancing would save everyone."
shot(at(26, 0), { set: 'sub', light: 'void', dof: 8, shadow: 16, shadowAt: SQ, fx: voidFX(),
  cam: orbit(Z(0, 4.6, -282), 4.4, -15, .2, 32, { push: .12 }),
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'stand', face: 't1' }] });
// "But he had just released the thing they'd been keeping alive." — the creature drinks the dancing energy
const drainFX = (t0) => (t, c) => {
  const tt = t + t0;
  for (const d of SQUARE) { d.mode = 'drain'; d.k = cl(tt / 1.5); }
  c.CR.draw(SQUARE, tt, {}); for (const d of SQUARE) { d.mode = undefined; d.k = undefined; }
  c.FX.stream(tt, heads(SQUARE, 70, 5), BEAST_CHEST, '#8ff7ff', 3, 1, .7, 10); c.FX.smoke(tt, Z(0, 0, -380), 30, 60, 9, 30);
};
shot(at(27, 0), { set: 'sub', light: 'void', dof: 0, shadow: 80, shadowAt: Z(0, 0, -320), wobble: .05, fx: drainFX(0),
  cam: { pos: Z(14, 10, -248), pos2: Z(10, 12, -254), tgt: Z(0, 26, -340), fov: 54 },
  cast: [beastCast(() => -18, 'giantSuck'), { c: 'hero', p: SQ, ry: 180, pose: 'scared', face: 'shock' }] });
// "People started collapsing."
const collapseFX = (t0) => (t, c) => {
  const tt = t + t0;
  SQUARE.forEach((d, i) => { const dl = (Math.abs(d.p[2] - SQ[2]) + Math.abs(d.p[0])) * .03 + (i % 7) * .05; const k = cl((tt - dl) / .45); d.mode = k > 0 ? 'collapse' : 'drain'; d.k = k > 0 ? k : 1; });
  c.CR.draw(SQUARE, tt, {}); for (const d of SQUARE) { d.mode = undefined; d.k = undefined; }
  c.FX.stream(tt, heads(SQUARE, 40, 9), BEAST_CHEST, '#8ff7ff', 2, 2, .7, 10);
};
shot(at(28, 0), { set: 'sub', light: 'void', dof: 0, shadow: 50, shadowAt: SQ, fx: collapseFX(0), kicks: [[.2, .06], [.6, .05]],
  cam: { pos: Z(-12, 9, -262), pos2: Z(-10, 8, -266), tgt: Z(0, 1, -292), fov: 46 },
  cast: [{ c: 'hero', p: SQ, ry: 180, pose: 'scared', face: 'shock' }, { c: 'gran', p: granSQ, ry: -20, pose: 'stand', face: 't14' }] });
// "Then his hands began to glow."
shot(at(29, 0), { set: 'sub', light: 'void', dof: 9, shadow: 14, shadowAt: SQ, fx: collapseFX(3),
  cam: orbit(Z(0, 4.0, -282), 4.6, 10, 1.8, 34, { push: .1 }),
  cast: [{ c: 'hero', p: SQ, ry: 0, pose: 'lookHands', face: 'shock', glow: (t) => smooth(t / 1.2) }] });
// "YOU'RE THE ONLY ONE WHO CAN REPLACE ME!"
shot(at(30, 0), { set: 'sub', light: 'void', dof: 0, shadow: 70, shadowAt: Z(0, 0, -320), wobble: .14, fx: (t, c) => { collapseFX(6)(t, c); c.FX.smoke(t, Z(0, 0, -380), 30, 60, 9, 30); },
  cam: { pos: Z(0, 3, -270), pos2: Z(0, 4, -273), tgt: Z(0, 40, -350), fov: 56 },
  cast: [beastCast(() => -18, 'giantPoint'), { c: 'hero', p: SQ, ry: 180, pose: 'lookHands', face: 'shock', glow: 1 }] });
// "Then Grandma grabbed his arm."
shot(at(31, 0), { set: 'sub', light: 'void', dof: 8, shadow: 18, shadowAt: SQ, fx: collapseFX(9),
  cam: orbit(Z(1.2, 4.0, -282), 8, -8, .4, 34, { push: .1 }),
  cast: [{ c: 'hero', p: SQ, ry: 40, pose: 'lookHands', face: 't20', glow: 1 }, { c: 'gran', p: Z(2.3, .22, -281.1), ry: -25, pose: 'grabArm', face: 't4' }] });
// "I've been waiting two hundred years for this moment."
shot(at(32, 0), { set: 'sub', light: 'void', dof: 10, shadow: 14, shadowAt: granSQ, fx: collapseFX(12),
  cam: orbit(Z(2.3, 3.9, -281.1), 4.0, -5, .05, 32, { push: .14 }),
  cast: [{ c: 'gran', p: Z(2.3, .22, -281.1), ry: -25, pose: 'grabArm', face: (t) => (t < 1.4 ? 't4' : 't12') }, { c: 'hero', p: SQ, ry: 40, pose: 'lookHands', face: 't20', glow: 1 }] });
// "You're not just another dancer."
shot(at(33, 0), { set: 'sub', light: 'void', dof: 10, shadow: 14, shadowAt: SQ, fx: collapseFX(15),
  cam: orbit(Z(0, 4.6, -282), 3.4, -30, .05, 30, { push: .1 }),
  cast: [{ c: 'hero', p: SQ, ry: 40, pose: 'stand', face: 't22', glow: 1 }, { c: 'gran', p: Z(2.3, .22, -281.1), ry: -25, pose: 'grabArm', face: 't12' }] });
// "You're the reason this town exists." — Grandma's slow smile, extreme close-up
shot(at(34, 0), { set: 'sub', light: 'void', dof: 12, shadow: 14, shadowAt: granSQ, fx: collapseFX(18),
  cam: orbit(Z(2.3, 3.95, -281.1), 3.0, -10, -.05, 30, { push: .22 }),
  cast: [{ c: 'gran', p: Z(2.3, .22, -281.1), ry: -25, pose: 'grabArm', face: 't13' }] });
// CUT TO BLACK + question + heartbeat
const END = endOf(34) + .35;
export const END_T = END;
shot(END, { set: 'sub', light: 'black', dof: 0, shadow: 10, nocap: true, cam: { pos: Z(0, -50, 0), tgt: Z(0, -60, -10), fov: 40 },
  ov: (g, t, OV) => { g.fillStyle = '#000'; g.fillRect(0, 0, OV.W, OV.H); if (t < .6) return;
    const beat = 1 + .05 * Math.max(0, Math.sin((t - .6) * Math.PI * 2 * .85)) ** 8;
    OV.pop(g, t, .6, 'WOULD YOU', .5, .43, 96 * beat, '#ffffff', { weight: 900 });
    OV.pop(g, t, .75, 'START DANCING', .5, .5, 96 * beat, '#ff3b3b', { weight: 900 });
    OV.pop(g, t, .9, 'AGAIN?', .5, .57, 96 * beat, '#ffffff', { weight: 900 }); } });

S.sort((a, b) => a.a - b.a);
S.forEach((s, i) => { s.b = i + 1 < S.length ? S[i + 1].a : DUR + 1; });
export const SHOTS = S;
