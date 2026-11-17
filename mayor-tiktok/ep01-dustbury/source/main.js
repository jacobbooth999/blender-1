// Dustbury EP.1 — "Population: Three". Vertical 1080×1920. Low-poly island world (three.js) + 2D cartoon cast, kinetic captions, game HUD.
import * as THREE from 'three';
import { clamp, seg, ss, eio, eo, lerp, hash, TAU } from '/core/lib.js';
import { DUR, T, VO_T, SKY, shotAt, CAPS, wt, lineEnd } from './story.js';
import { makePost } from './post.js';
import { makeSea } from './sea.js';
import { buildWorld, at } from './world.js';
import { Pen, bodyFront, headBlob, INK, SKINS, shade, mix } from './toon.js';
import { drawKinetic } from './kinetic.js';

await document.fonts.load('82px Anton'); await document.fonts.load('700 40px Fredoka'); await document.fonts.load('600 34px Fredoka'); await document.fonts.load('800 70px Inter'); await document.fonts.load('italic 80px "Instrument Serif"');
const W = 1080, H = 1920, QS = new URLSearchParams(location.search);
const SSAA = +(QS.get('ssaa') ?? 1.5);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-5, 5, 9, -9, 1, 1600);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, aoRadius: .5, aoScale: 1.4, aoThickness: 1 });
post.bloom.strength = .25; post.bloom.threshold = .95; post.bloom.radius = .5;
const sea = makeSea(scene);
const world = buildWorld(scene);
// shallow-water map: every land tile
{ const cv = sea.U.uShallow.value.image, sg = cv.getContext('2d'); sg.fillStyle = '#000'; sg.fillRect(0, 0, 512, 512);
  world.tiles.forEach(tl => { const px = (tl.c.x / 64 + .5) * 512, pz = (tl.c.z / 64 + .5) * 512; const gr = sg.createRadialGradient(px, pz, 0, px, pz, 22); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = gr; sg.fillRect(px - 22, pz - 22, 44, 44); });
  sea.U.uShallow.value.needsUpdate = true; }
const hemi = new THREE.HemisphereLight('#eef6fb', '#c6b89c', 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff6e8', 2.4); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02; sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 120 }); sun.shadow.camera.updateProjectionMatrix();
scene.add(sun, sun.target);

const C = h => new THREE.Color(h);
const SK = SKY.map(k => ({ t: k[0], zen: C(k[1]), hor: C(k[2]), deep: C(k[3]), shal: C(k[4]), sun: C(k[5]), sunI: k[6], hs: C(k[7]), hg: C(k[8]), hI: k[9], el: k[10], az: k[11], night: k[12], sat: k[13] }));
function skyAt(t) {
  let i = 0; while (i < SK.length - 2 && t > SK[i + 1].t) i++;
  const a = SK[i], b = SK[i + 1], u = ss(seg(t, a.t, b.t)), o = {};
  for (const k of ['zen', 'hor', 'deep', 'shal', 'sun', 'hs', 'hg']) o[k] = a[k].clone().lerp(b[k], u);
  for (const k of ['sunI', 'hI', 'el', 'az', 'night', 'sat']) o[k] = lerp(a[k], b[k], u);
  return o;
}

// —— camera ——
const DEG = Math.PI / 180, A = world.anchors;
const mid = (p, q, k = .5) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)];
const add = (p, dx = 0, dy = 0, dz = 0) => [p[0] + dx, p[1] + dy, p[2] + dz];
let CAM = {};
// kick: a quick zoom punch (fh multiplier) on impact words
const punch = (t, t0, k = .06) => { const s = t - t0; return s < 0 || s > .5 ? 1 : 1 - k * Math.sin(Math.min(1, s / .08) * Math.PI / 2) * Math.exp(-s * 7); };
function cam(t) {
  const [t0, t1, name] = shotAt(t), u = seg(t, t0, t1);
  let tg = [0, .6, 0], az = 45, el = 30, fh = 20, oy = 0, hzA = .6, hzB = 2.4, tiltB = .32;
  const charCam = (p, f, a, e = 16, side = 0) => { tg = add(p, Math.cos(a * DEG) * side, 0, -Math.sin(a * DEG) * side); fh = f; az = a; el = e; oy = -.39; };
  const hookCam = (s) => { charCam(A.mayor, 2.45 - s * .15, 40 + s * 6, 14, -.15); hzA = .35; hzB = 1.6; };
  switch (name) {
    case 'hook': hookCam(u); fh *= punch(t, T.slam + .2, .08) * punch(t, T.worst, .05) * punch(t, wt('L2', 'decide'), .05); break;
    case 'wide': { const z = eio(seg(t, t0, t0 + 1.25)); hzA = lerp(.35, .12, z); hzB = lerp(1.6, .52, z); tg = [lerp(A.sign[0] - .2, -.3, z), lerp(1.0, .9, z), lerp(A.sign[2] + .2, -.2, z)]; az = lerp(46, 70, eio(u)); el = lerp(16, 33, z); fh = lerp(2.3, 21, Math.pow(z, .8)); oy = lerp(-.39, -.06, z); break; }
    case 'fountain': tg = add(A.fountain, 0, .45, 0); az = lerp(74, 84, u); el = 27; fh = lerp(3.6, 3.1, u) * punch(t, T.mud + .15, .07); oy = -.08; break;
    case 'lamps': { const k = eio(seg(t, t0, T.dead - .25)); const p0 = at(-3, 1, .55, .3), p1 = at(1, 1, .55, .3); tg = add(mid(p0, p1, lerp(.0, 1, k)), 0, .75, 0); az = 18; el = 22; fh = lerp(4.0, 3.2, u) * punch(t, T.dead, .07); oy = -.3; break; }
    case 'hall': { const k = eio(seg(t, T.tent - .45, T.tent - .05)); const h = add(at(1, -1), 0, .55, 0), te = add(A.tent, -.15, .3, 0); tg = mid(h, te, k); az = 52; el = 26; fh = lerp(4.0, 2.2, k) * punch(t, T.tent + .05, .06); oy = lerp(-.1, -.3, k); break; }
    case 'people': charCam(PEOPLE, lerp(2.5, 2.35, u), 75, 15); break;
    case 'rose': charCam(A.rose, lerp(1.85, 1.72, u), lerp(50, 56, u), 15, .1); break;
    case 'gary': charCam(A.gary, lerp(1.75, 1.6, u) * punch(t, T.stopped + .3, .06), lerp(42, 48, u), 15, .12); oy = -.34; break;
    case 'dot': charCam(A.dot, lerp(1.45, 1.32, u), lerp(55, 50, u), 14, .1); oy = -.33; break;
    case 'hill': { hzA = .0; hzB = .35; const k = eio(seg(t, t0 + .2, T.flicker)); tg = add(A.tower, 0, lerp(.6, 1.0, k), 0); az = lerp(30, 42, u); el = lerp(22, 15, k); fh = lerp(9.5, 3.3, Math.pow(k, .9)); oy = -.08; hzA = .0; hzB = .3; break; }
    case 'stakes': {
      if (t < T.zero - .05) { charCam(roseWalk(t), 1.9, lerp(55, 60, u), 15, .05); }
      else { const k = seg(t, T.zero - .05, T.rewind); tg = [0, .4, -.5]; az = 45 + k * 25; el = 34; fh = lerp(17, 21, k) * punch(t, T.gone, .05); oy = -.04; hzA = .12; hzB = .55; }
      break; }
    case 'coins': charCam(A.mayor, lerp(2.3, 2.15, u) * punch(t, T.hundred, .05), lerp(42, 48, u), 15, -.1); break;
    case 'optA': tg = add(A.fountain, 0, .5, 0); az = lerp(74, 82, u); el = 25; fh = lerp(4.6, 4.2, u); oy = -.22; break;
    case 'optB': { const p0 = at(-3, 1, .55, .3), p1 = at(2, 1, .55, .3); tg = add(mid(p0, p1, lerp(.35, .6, u)), 0, .8, 0); az = 20; el = 21; fh = lerp(6.6, 6.0, u); oy = -.22; break; }
    case 'comment': tg = [.2, .8, .3]; az = lerp(40, 52, u); el = 30; fh = lerp(13, 12, u); oy = -.2; hzA = .15; hzB = .7; break;
    case 'follow': charCam(A.mayor, lerp(2.3, 2.15, u), lerp(46, 42, u), 15, .25); break;
    default: hookCam(0);
  }
  const D = Math.max(300, fh * 3), ce = Math.cos(el * DEG);
  camera.position.set(tg[0] + D * ce * Math.sin(az * DEG), tg[1] + D * Math.sin(el * DEG), tg[2] + D * ce * Math.cos(az * DEG));
  camera.up.set(0, 1, 0); camera.lookAt(tg[0], tg[1], tg[2]);
  camera.updateMatrixWorld(); const U = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1); camera.position.addScaledVector(U, -oy * fh);
  const fw = fh * W / H; camera.left = -fw / 2; camera.right = fw / 2; camera.top = fh / 2; camera.bottom = -fh / 2; camera.near = 1; camera.far = D + fh * 5 + 800; camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const cot = 1 / Math.tan(el * DEG);
  post.comp.camDist.value = D; post.comp.hz0.value = hzA * fh * cot; post.comp.hz1.value = hzB * fh * cot;
  post.tilt.fy.value = .5; post.tilt.band.value = tiltB;
  CAM = { tg, az, el, fh, name };
}
const PEOPLE = at(1, 0, .2, .2);
// Rose walking out of town with her bag (stakes beat)
function roseWalk(t) { const k = ss(seg(t, T.stakes + .3, T.zero)); const a = A.rose, b = add(A.rose, -.9, 0, 1.15); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }

// —— 2D layer ——
const ov = document.getElementById('ov'), g = ov.getContext('2d');
const proj = (p) => { const v = new THREE.Vector3(...p).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
const pxPerUnit = () => H / CAM.fh;

// cast (our own cartoon characters; Mayor Mack is the user's chosen mayor)
const MACK = { jacket: '#f08a2c', pants: '#3b5b9a', boots: '#5a3b2a', hat: 'cap', cap: '#f4c430', beard: '#4a3020', skin: SKINS[2], sash: '#e2453c' };
const ROSE = { jacket: '#a98bc0', pants: '#a98bc0', dress: '#b89acc', legs: mix(SKINS[0], '#7a4b3a', .3), boots: '#5a3b2a', hat: 'hair', hair: '#dcd8d2', skin: SKINS[0], build: 'stout' };
const GARY = { jacket: '#7d8466', pants: '#4a4540', boots: '#3a2a20', hat: 'cap', cap: '#5a6a7a', beard: '#7a5c44', skin: SKINS[1] };
const DOT = { jacket: '#4fa0c8', pants: '#3b3f52', boots: '#f4f1ea', hat: 'hair', hair: '#2a1d18', build: 'kid', skin: SKINS[3] };
const SEED = { mack: 23, rose: 41, gary: 57, dot: 63 };
const cc = document.createElement('canvas'); cc.width = 600; cc.height = 1000; const cg = cc.getContext('2d');
function chain(p, o, seed) {   // Mayor Mack's gold chain of office
  const H2 = headBlob(seed, 118, 0), HH = 2 * H2.b, Wd = 2 * H2.a, u = Wd / 100, torsoBot = 975 - 1.4 * HH, chin = torsoBot - 1.1 * HH, G = p.g;
  const rx = .3 * Wd, depth = .42 * HH;
  for (let i = 0; i <= 13; i++) { const a = Math.PI * i / 13, x = 300 - rx * Math.cos(a), y = chin + .05 * HH + depth * Math.sin(a); G.beginPath(); G.ellipse(x, y, 4.6 * u, 3.4 * u, 0, 0, 7); G.fillStyle = '#e8c45a'; G.fill(); G.lineWidth = 2.2 * u; G.strokeStyle = INK; G.stroke(); }
  const my = chin + .05 * HH + depth + .13 * HH; G.beginPath(); G.arc(300, my, 11 * u, 0, 7); G.fillStyle = '#e8c45a'; G.fill(); G.lineWidth = 3 * u; G.strokeStyle = INK; G.stroke();
  G.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 2.4 * u : 5.5 * u, a = -Math.PI / 2 + k * Math.PI / 5; G.lineTo(300 + r * Math.cos(a), my + r * Math.sin(a)); } G.closePath(); G.fillStyle = '#fff3b0'; G.fill();
}
const blinkAt = (t, seed) => { const per = 2.1 + hash(seed) * 1.6, ph = ((t + hash(seed * 3) * 5) % per); return ph < .12 ? 1 : 0; };
// draw one character at a world anchor; hWorld = standing height in world units
function drawChar(o, seed, anchor, t, opts = {}, hWorld = .62, extra = {}) {
  cg.clearRect(0, 0, 600, 1000);
  cg.save(); const p = new Pen(cg);
  // contact shadow
  cg.beginPath(); cg.ellipse(300, 978, 120, 16, 0, 0, 7); cg.fillStyle = 'rgba(36,23,38,.25)'; cg.fill();
  bodyFront(p, o, { mode: 'stand', seed, blink: blinkAt(t, seed), ...opts });
  if (extra.chain) chain(p, o, seed);
  cg.restore();
  const [sx, sy] = proj(anchor), s = pxPerUnit() * hWorld / 777 * (extra.scale ?? 1), pop = extra.pop ?? 1;
  if (pop <= 0.001) return;
  const dw = 600 * s * pop, dh = 1000 * s * pop;
  g.save(); g.globalAlpha = extra.alpha ?? 1;
  if (extra.clipY !== undefined) { g.beginPath(); g.rect(0, 0, W, sy - (975 - extra.clipY) * s * pop); g.clip(); }
  g.drawImage(cc, sx - dw / 2, sy - 975 * s * pop, dw, dh);
  g.restore();
  return { x: sx, top: sy - 800 * s * pop, s };
}
const popK = (t, t0) => { const s = t - t0; return s < 0 ? 0 : 1 - Math.exp(-9 * s) * Math.cos(17 * s); };

function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function tag(x, y, text, col = '#ffd84a', k = 1, sub = '') {
  if (k <= .01) return;
  g.save(); g.translate(x, y); g.scale(k, k); g.font = '700 40px Fredoka'; const tw = g.measureText(text).width + 44;
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 5; rr(-tw / 2, -32, tw, 64, 32); g.fillStyle = '#1d1a26'; g.fill();
  g.shadowColor = 'transparent'; g.lineWidth = 4; g.strokeStyle = col; g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 2);
  g.beginPath(); g.moveTo(-12, 31); g.lineTo(12, 31); g.lineTo(0, 46); g.closePath(); g.fillStyle = '#1d1a26'; g.fill();
  if (sub) { g.font = '600 28px Fredoka'; g.fillStyle = '#ffffff'; g.fillText(sub, 0, -56); }
  g.restore();
}
function zzz(x, y, t) { g.save(); g.font = '700 46px Fredoka'; g.textAlign = 'center'; for (let k = 0; k < 3; k++) { const u = ((t * .6 + k / 3) % 1); g.globalAlpha = Math.sin(u * Math.PI); g.fillStyle = '#ffffff'; g.lineWidth = 8; g.strokeStyle = '#241726'; const xx = x + u * 60 + k * 6, yy = y - u * 110; g.strokeText('z', xx, yy); g.fillText('z', xx, yy); } g.restore(); }
function qmark(x, y, t, k) { if (k <= 0) return; g.save(); g.translate(x, y + Math.sin(t * 5) * 6); g.scale(k, k); g.rotate(Math.sin(t * 3) * .12); g.font = 'bold 110px Anton'; g.textAlign = 'center'; g.lineWidth = 14; g.strokeStyle = '#241726'; g.strokeText('?', 0, 0); g.fillStyle = '#ffd84a'; g.fillText('?', 0, 0); g.restore(); }

// —— HUD ——
function pill(x, y, w, text, icon, col, k = 1, align = 'left') {
  if (k <= .01) return;
  g.save(); g.translate(x, y); g.scale(k, k);
  const X = align === 'left' ? 0 : -w;
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 14; g.shadowOffsetY = 5; rr(X, -34, w, 68, 34); g.fillStyle = 'rgba(24,20,34,.82)'; g.fill(); g.shadowColor = 'transparent';
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke();
  if (icon) icon(X + 38, 0);
  g.font = '700 38px Fredoka'; g.fillStyle = col; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(text, X + (icon ? 70 : 26), 2);
  g.restore();
}
const personIcon = (x, y) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y - 9, 9, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y + 12, 15, 11, 0, Math.PI, 0); g.fill(); };
const coinIcon = (x, y) => { g.fillStyle = '#f0cd60'; g.beginPath(); g.arc(x, y, 17, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = '#a07a20'; g.stroke(); g.fillStyle = '#a07a20'; g.font = '700 20px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', x, y + 1); g.textAlign = 'left'; };
function popAt(t) {   // population shown: 3, flashes '2?' on leaving, rolls to 0 on 'zero', back to 3 on rewind
  if (t >= T.zero && t < T.rewind) return { n: '0', col: '#ff5a4f' };
  if (t >= T.leaving && t < T.zero) return { n: (Math.floor(t * 4) % 2) ? '2?' : '3', col: (Math.floor(t * 4) % 2) ? '#ff5a4f' : '#ffffff' };
  return { n: '3', col: '#ffffff' };
}
function healthAt(t) { if (t >= T.zero - .1 && t < T.rewind) return lerp(.08, 0, ss(seg(t, T.zero - .1, T.zero + .6))); return .08; }
function hud(t) {
  const kIn = popK(t, T.reveal + .35);
  // episode badge (always on: tells a new viewer this is a series)
  pill(56, 212, 300, 'EP. 1 · DAY 1', null, '#ffd84a', 1);
  const P = popAt(t), kp = popK(t, T.three - .05) * (t >= T.leaving && t < T.rewind ? 1 + .06 * Math.sin(t * 25) : 1);
  pill(W - 56, 212, 190, 'POP ' + P.n, personIcon, P.col, Math.max(kp, 0), 'right');
  // town health bar
  if (kIn > .01) {
    g.save(); g.translate(56, 280); g.globalAlpha = clamp(kIn, 0, 1);
    g.font = '600 26px Fredoka'; g.fillStyle = 'rgba(255,255,255,.9)'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 8;
    g.fillText('TOWN HEALTH', 0, 0); const hv = healthAt(t);
    g.shadowColor = 'transparent'; rr(190, -13, 300, 26, 13); g.fillStyle = 'rgba(24,20,34,.75)'; g.fill();
    if (hv > .002) { rr(193, -10, Math.max(20, 294 * hv * (t < T.zero ? 1 : hv / .08)), 20, 10); g.fillStyle = '#ff5a4f'; g.fill(); }
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 8; g.fillStyle = '#ff6a5f'; g.font = '700 30px Fredoka'; g.fillText(Math.round(hv * 100) + '%', 506, 1);
    g.restore();
  }
  const kc = popK(t, T.hundred - .05); if (t > T.hundred - .05) pill(W - 56, 290, 190, '100', coinIcon, '#f0cd60', kc, 'right');
}
function title(t) {   // 'DUSTBURY' rises letter by letter at the reveal
  const t0 = T.reveal + .25, t1 = T.fountain - .1; if (t < t0 || t > t1) return;
  const a = 1 - ss(seg(t, t1 - .35, t1)), TXT = 'DUSTBURY';
  g.save(); g.globalAlpha = a; g.font = '82px Anton'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
  const track = 18, ws = [...TXT].map(c => g.measureText(c).width), tot = ws.reduce((x, y) => x + y, 0) + track * (TXT.length - 1); let cx = W / 2 - tot / 2;
  g.save(); g.beginPath(); g.rect(0, 0, W, 560); g.clip();
  [...TXT].forEach((ch, i) => { const s = t - (t0 + i * .06); const off = s < 0 ? 200 : s < .26 ? 130 * Math.pow(1 - s / .26, 2) : -Math.sin((s - .26) * 14) * Math.exp(-(s - .26) * 8) * 12;
    g.lineWidth = 12; g.strokeStyle = '#241726'; g.lineJoin = 'round'; g.strokeText(ch, cx + ws[i] / 2, 540 + off); g.fillStyle = '#ffffff'; g.fillText(ch, cx + ws[i] / 2, 540 + off); cx += ws[i] + track; });
  g.restore();
  g.font = '600 34px Fredoka'; g.globalAlpha = a * ss(seg(t, t0 + .7, t0 + 1.1)); g.fillStyle = '#ffd84a'; g.lineWidth = 8; g.strokeStyle = '#241726';
  g.strokeText('a town run by the comments', W / 2, 596); g.fillText('a town run by the comments', W / 2, 596);
  g.restore();
}
// vote cards
function fountainIcon(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#5fc6e8'; g.beginPath(); g.moveTo(0, -46); g.bezierCurveTo(26, -10, 30, 6, 30, 16); g.arc(0, 16, 30, 0, Math.PI); g.bezierCurveTo(-30, 6, -26, -10, 0, -46); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(-11, 10, 6, 11, -.4, 0, 7); g.fill(); g.restore(); }
function bulbIcon(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(0, -10, 30, Math.PI * .8, Math.PI * 2.2); g.lineTo(13, 26); g.lineTo(-13, 26); g.closePath(); g.fill(); g.fillStyle = '#9aa0aa'; g.fillRect(-14, 28, 28, 8); g.fillRect(-11, 39, 22, 7); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-10, -16, 6, 10, -.5, 0, 7); g.fill(); g.restore(); }
function card(x, y, k, letter, lcol, label1, label2, icon, glow = 0) {
  if (k <= .01) return;
  const w = 430, h = 330;
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate((1 - Math.min(1, k)) * .2);
  g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = 10; rr(-w / 2, -h / 2, w, h, 36); g.fillStyle = '#fffaf0'; g.fill(); g.shadowColor = 'transparent';
  g.lineWidth = 8 + glow * 4; g.strokeStyle = lcol; g.stroke();
  g.beginPath(); g.arc(-w / 2 + 70, -h / 2 + 70, 46, 0, 7); g.fillStyle = lcol; g.fill();
  g.font = '64px Anton'; g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, -w / 2 + 70, -h / 2 + 74);
  icon(w / 2 - 90, -h / 2 + 84, 1.15);
  g.fillStyle = '#241726'; g.font = '52px Anton'; g.fillText(label1, 0, 40); g.font = '600 28px Fredoka'; g.fillStyle = '#6a5f70'; g.fillText(label2, 0, 104);
  g.restore();
}
function cards(t) {
  const A_IN = T.optA + .15, B_IN = T.optB + .15, BOTH = T.comment, OUT = T.follow - .15;
  const outK = 1 - ss(seg(t, OUT, OUT + .25));
  if (t >= A_IN && t < BOTH) { const k = popK(t, A_IN) * (t > B_IN - .3 ? 1 - ss(seg(t, B_IN - .3, B_IN)) : 1); card(W / 2 - 40, 560, k, 'A', '#3fa7d6', 'FIX THE FOUNTAIN', 'clean water · new neighbor?', fountainIcon); }
  if (t >= B_IN && t < BOTH) { const k = popK(t, B_IN) * (t > BOTH - .25 ? 1 - ss(seg(t, BOTH - .25, BOTH)) : 1); card(W / 2 - 40, 560, k, 'B', '#f0a020', 'FIX THE LIGHTS', 'no more sleeping in the dark', bulbIcon); }
  if (t >= BOTH && t < OUT + .3) {
    const kA = popK(t, BOTH), kB = popK(t, BOTH + .18), pulseA = t > wt('L18', 1) && t < wt('L18', 2) ? 1 : 0, pulseB = t > wt('L18', 3) && t < wt('L18', 4) + .3 ? 1 : 0;
    card(282, 560, kA * .78 * outK * (1 + .06 * pulseA), 'A', '#3fa7d6', 'FOUNTAIN', '100 coins', fountainIcon, pulseA);
    card(W - 322, 560, kB * .78 * outK * (1 + .06 * pulseB), 'B', '#f0a020', 'LIGHTS', '100 coins', bulbIcon, pulseB);
    const kv = popK(t, BOTH + .35) * outK; if (kv > .01) { g.save(); g.translate(W / 2 - 20, 560); g.scale(kv, kv); g.font = '64px Anton'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#241726'; g.strokeText('VS', 0, 0); g.fillStyle = '#ff5a4f'; g.fillText('VS', 0, 0); g.restore(); }
    // comment prompt bubble
    const kc = popK(t, wt('L18', 'why') - .1) * outK; if (kc > .01) { g.save(); g.translate(W / 2 - 20, 800); g.scale(kc, kc); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 14; rr(-310, -46, 620, 92, 46); g.fillStyle = '#ffffff'; g.fill(); g.shadowColor = 'transparent';
      g.beginPath(); g.moveTo(-200, 40); g.lineTo(-240, 80); g.lineTo(-160, 44); g.fill();
      g.font = '700 40px Fredoka'; g.fillStyle = '#241726'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('"A because..."  "B because..."', 0, 2); g.restore(); }
  }
}
function followCue(t) {   // points at the real follow button on the right edge
  const t0 = T.follow + .1, t1 = T.loop - .1; if (t < t0 || t > t1) return;
  const k = popK(t, t0) * (1 - ss(seg(t, t1 - .25, t1))), bob = Math.sin(t * 8) * 12;
  g.save(); g.translate(800 + bob, 640); g.scale(k, k);
  g.font = '62px Anton'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#241726'; g.lineJoin = 'round';
  g.strokeText('FOLLOW', 0, 0); g.fillStyle = '#ffffff'; g.fillText('FOLLOW', 0, 0);
  g.beginPath(); g.moveTo(24, -26); g.lineTo(82, 0); g.lineTo(24, 26); g.closePath(); g.lineWidth = 10; g.stroke(); g.fillStyle = '#ff3b5c'; g.fill();
  g.font = '600 32px Fredoka'; g.textAlign = 'right'; g.lineWidth = 8; g.strokeText('see EP. 2', 0, 54); g.fillStyle = '#ffd84a'; g.fillText('see EP. 2', 0, 54);
  g.restore();
}
function rewindFx(t) {   // VHS rewind streaks + ◀◀ on the snap back
  const s = t - (T.rewind - .25); if (s < 0 || s > .55) return;
  const a = Math.sin(clamp(s / .55, 0, 1) * Math.PI);
  g.save(); g.globalAlpha = a * .8; for (let i = 0; i < 18; i++) { const y = (hash(i * 7 + Math.floor(t * 30)) * H); g.fillStyle = `rgba(255,255,255,${.15 + hash(i) * .3})`; g.fillRect(0, y, W, 3 + hash(i * 3) * 8); }
  g.globalAlpha = a; g.font = '150px Anton'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 14; g.strokeStyle = '#241726'; g.strokeText('◀◀', W / 2, 860); g.fillStyle = '#ffffff'; g.fillText('◀◀', W / 2, 860);
  g.restore();
}
function vignetteFlash(t) {   // red pulse at 'zero' / white flash on the slam
  const f = Math.exp(-Math.max(0, t - T.slam - .2) * 10) * (t > T.slam + .2 ? 1 : 0);
  if (f > .01) { g.fillStyle = `rgba(255,255,255,${f * .55})`; g.fillRect(0, 0, W, H); }
  if (t > T.zero - .05 && t < T.rewind) { const k = .35 + .15 * Math.sin(t * 9); const gr = g.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .75); gr.addColorStop(0, 'rgba(120,0,0,0)'); gr.addColorStop(1, `rgba(120,0,0,${k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
}

// —— the cast, per shot ——
function cast(t) {
  const name = CAM.name;
  if (name === 'hook' || name === 'loop' || name === 'coins' || name === 'follow' || (name === 'wide' && t < T.reveal + .8)) {
    let expr = 'grin', prop = null, wave;
    if (name === 'hook') { if (t > T.worst - .05) expr = 'nervous'; if (t > T.you - .1) { expr = 'grin'; prop = 'cheer'; } if (t < .9) { wave = Math.sin(t * 14); } }
    if (name === 'coins') { expr = t > T.hundred ? 'laugh' : 'grin'; prop = t > T.hundred ? 'coins' : null; if (t > wt('L15', 'one') + .2 && t > T.hundred + 1) { expr = 'stern'; prop = null; } }
    if (name === 'follow') { expr = 'laugh'; wave = Math.sin(t * 12); if (t > wt('L19', 'broke') - .1) { expr = 'nervous'; wave = undefined; prop = 'shrug'; } }
    if (name === 'loop') { expr = 'grin'; }
    drawChar(MACK, SEED.mack, A.mayor, t, { expr, prop, wave, look: 0 }, .72, { chain: true });
  }
  if (name === 'hall' && t > T.tent - .1) {
    const k = popK(t, T.tent - .1); drawChar(MACK, SEED.mack, A.tent, t, { expr: 'nervous', prop: 'shrug' }, .6, { chain: true, pop: k });
  }
  if (name === 'people') {
    const base = PEOPLE, pv = [Math.cos(75 * DEG), -Math.sin(75 * DEG)];
    const ts = [wt('L7', 'three') - .05, wt('L7', 'of') - .02, wt('L7', 'them') - .02];
    const R = [[ROSE, SEED.rose, -1, 'OLD ROSE', 'smile_closed', .58], [GARY, SEED.gary, 0, 'GARY', 'neutral', .62], [DOT, SEED.dot, 1, 'DOT', 'whistle', .44]];
    R.forEach(([o, s, i, nm, ex, hw], j) => { const k = popK(t, ts[j]); const p = [base[0] + i * .5 * pv[0], base[1], base[2] + i * .5 * pv[1]]; const r = drawChar(o, s, p, t, { expr: ex }, hw, { pop: k }); if (r) tag(r.x, r.top - 50, nm, '#ffd84a', k * .85); });
  }
  if (name === 'rose') {
    const r = drawChar(ROSE, SEED.rose, A.rose, t, { expr: t > wt('L8', 'eighty') ? 'smile_closed' : 'smile', look: .2 }, .58);
    if (r) tag(Math.min(820, r.x + 250), r.top + 90, 'OLD ROSE', '#ffd84a', popK(t, T.rose + .25), '80 years here');
  }
  if (name === 'gary') {
    const r = drawChar(GARY, SEED.gary, A.gary, t, { expr: t > T.stopped + .3 && t < T.stopped + 1.4 ? 'shock' : 'neutral', mode: 'sit', blink: t > T.stopped + .3 && t < T.stopped + 1.4 ? 0 : 1, headTilt: .12 }, .62);
    if (r) { tag(Math.min(800, r.x + 250), r.top + 120, 'GARY', '#ffd84a', popK(t, T.gary + .25), 'lives at the bus stop'); if (!(t > T.stopped + .3 && t < T.stopped + 1.4)) zzz(r.x + 50, r.top + 60, t); }
  }
  if (name === 'dot') {
    const peek = ss(seg(t, T.dot + .2, T.dot + .7)) - ss(seg(t, T.hill - .7, T.hill - .35));
    const p = add(A.dot, 0, -.36 * (1 - peek), 0);
    const r = drawChar(DOT, SEED.dot, p, t, { expr: t > wt('L10', 'nobody') ? 'whistle' : 'smile', look: Math.sin(t * 2) * .6 }, .44, { clipY: 975 - 0 });
    if (r && peek > .5) { qmark(r.x + 150, r.top + 20, t, popK(t, wt('L10', 'nobody'))); tag(Math.max(200, r.x - 250), r.top + 120, 'DOT', '#ffd84a', popK(t, T.dot + .6), 'from ???'); }
  }
  if (name === 'stakes' && t < T.zero - .05) {
    const rp = roseWalk(t), ph = (t * 1.6) % 1, walking = t > T.stakes + .3;
    const r = drawChar(ROSE, SEED.rose, rp, t, { expr: t > T.leaving - .1 ? 'stern' : 'neutral', mode: walking ? 'stroll' : 'stand', phase: ph, prop: 'sack', facing: walking ? -1 : 0 }, .58);
    if (r && t > T.leaving - .1) tag(Math.min(800, r.x + 250), r.top + 90, 'LEAVING?', '#ff5a4f', popK(t, T.leaving - .1));
  }
}

// —— render ——
function render(t) {
  const sk = skyAt(t);
  cam(t);
  const night = sk.night;
  sea.U.uTime.value = t; sea.U.uAmp.value = 1; sea.U.uDeep.value.copy(sk.deep); sea.U.uShal.value.copy(sk.shal);
  sea.U.uFoam.value.set(night > .5 ? '#9fb0e0' : '#ffffff');
  hemi.color.copy(sk.hs); hemi.groundColor.copy(sk.hg); hemi.intensity = sk.hI;
  const se = sk.el * DEG, sa = sk.az * DEG;
  sun.color.copy(sk.sun); sun.intensity = sk.sunI;
  sun.target.position.set(0, 0, 0); sun.position.set(Math.cos(se) * Math.sin(sa) * 60, Math.sin(se) * 60, Math.cos(se) * Math.cos(sa) * 60);
  post.comp.zen.value.copy(sk.zen); post.comp.hor.value.copy(sk.hor);
  post.comp.stars.value = ss(seg(night, .5, 1)) * .6; post.comp.starOff.value = CAM.az / 60; post.comp.time.value = t;
  const gd = post.grade; gd.sat.value = sk.sat; gd.contrast.value = lerp(.06, .12, night); gd.lift.value.setRGB(.016, .016, lerp(.022, .045, night)); gd.vig.value = lerp(.18, .34, night);
  post.bloom.strength = lerp(.22, .55, night);
  { const f = new THREE.Vector3(); camera.getWorldDirection(f); const fl = Math.hypot(f.x, f.z) || 1; sea.U.uFwd.value.set(f.x / fl, f.z / fl); sea.U.uTgt.value.set(CAM.tg[0], CAM.tg[2]); sea.U.uSpanF.value = CAM.fh / Math.tan(CAM.el * DEG) * .5; sea.U.uNight.value = night; }
  world.update(t);
  post.composer.render();
  g.clearRect(0, 0, W, H);
  if (QS.get('nohud')) return;
  cast(t);
  vignetteFlash(t);
  hud(t); title(t); cards(t); followCue(t); rewindFx(t);
  drawKinetic(g, t, CAPS, { W, H, y: CAM.name === 'comment' ? 1000 : 880 });
}

// —— events for the mix ——
function events() {
  const ev = world.EVS.slice();
  Object.entries(VO_T).forEach(([id, t]) => ev.push({ t, type: 'vo', id }));
  // caption word pops (soft), name tag pops, card pops, HUD pops
  ev.push({ t: T.three - .05, type: 'pop' }); ev.push({ t: T.reveal + .35, type: 'pop' });
  [wt('L7', 'three'), wt('L7', 'of'), wt('L7', 'them')].forEach(x => ev.push({ t: x, type: 'pop', hi: 1 }));
  [T.rose + .25, T.gary + .25, T.dot + .6].forEach(x => ev.push({ t: x, type: 'tag' }));
  ev.push({ t: T.tent - .1, type: 'boing' });
  ev.push({ t: T.optA + .15, type: 'card' }); ev.push({ t: T.optB + .15, type: 'card' }); ev.push({ t: T.comment, type: 'card' }); ev.push({ t: T.comment + .18, type: 'card' });
  ev.push({ t: T.hundred - .05, type: 'coins' });
  ev.push({ t: T.leaving - .1, type: 'alarm' }); ev.push({ t: T.zero, type: 'boom' });
  ev.push({ t: T.reveal, type: 'whoosh' }); ev.push({ t: T.hill, type: 'whoosh', soft: 1 }); ev.push({ t: T.optA, type: 'whoosh', soft: 1 }); ev.push({ t: T.follow, type: 'whoosh', soft: 1 });
  ev.push({ t: T.scratch, type: 'scratch' }); ev.push({ t: T.three + .7, type: 'crickets', d: 1.6 });
  ev.push({ t: T.follow + .1, type: 'pop', hi: 1 });
  ['fountain', 'lamps', 'hall', 'people', 'rose', 'gary', 'dot', 'stakes', 'coins', 'optB', 'comment', 'loop'].forEach(k => ev.push({ t: T[k], type: 'cut', name: k }));
  return ev.sort((a, b) => a.t - b.t);
}
window.render = render; window.DUR = DUR; window.EV = events(); window.DBG = { camera, world, post, scene };
window.TEXTS = () => [];
render(parseFloat(QS.get('t') ?? '1'));
window.READY = true;
