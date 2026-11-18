// Dance Town interiors + story props, added to the world by addDanceTown(W, scene).
//  supermarket @ SUPER, hospital ward @ HOSP, town-hall archive @ HALL (night), black hands, shadow-creature face, hole.
import * as THREE from 'three';
import { mat } from './rig.js';

export const SUPER = [0, 0, 1400], HOSP = [200, 0, 1400], HALL = [400, 0, 1400];
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function m(geo, mt, parent, x = 0, y = 0, z = 0, cast = true) { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o; }
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, g: c.getContext('2d'), t }; }
function room(p, w, d, h, wall, floor, at, ceil = '#f4f4f4') {
  const g = new THREE.Group(); g.position.set(...at); p.add(g);
  m(B(w, .2, d), mat(floor, .55), g, 0, -.1, 0, false);
  m(B(w, h, .3), mat(wall, .85), g, 0, h / 2, -d / 2, false); m(B(.3, h, d), mat(wall, .85), g, -w / 2, h / 2, 0, false);
  m(B(.3, h, d), mat(wall, .85), g, w / 2, h / 2, 0, false); m(B(w, h, .3), mat(wall, .85), g, 0, h / 2, d / 2, false);
  m(B(w, .2, d), mat(ceil, .9), g, 0, h, 0, false); m(B(w, .45, .35), mat('#ffffff', .6), g, 0, .22, -d / 2 + .2, false);
  return g;
}
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- textures ----------
function tileTex(a, b, n = 8) { const { g, t } = canvas(256, 256); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * 256 / n, j * 256 / n, 256 / n, 256 / n); } t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function signTex(txt, bg, fg = '#fff') { const { g, t } = canvas(512, 128); g.fillStyle = bg; g.fillRect(0, 0, 512, 128); g.fillStyle = fg; g.font = '900 72px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 256, 70); return t; }
export function newspaperTex() {
  const { g, t } = canvas(768, 1024);
  g.fillStyle = '#e9dfc6'; g.fillRect(0, 0, 768, 1024);
  for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(90,60,20,${hash(i) * .08})`; g.fillRect(hash(i + 1) * 768, hash(i + 2) * 1024, 3, 3); }
  g.fillStyle = '#1d1a14'; g.textAlign = 'center';
  g.font = '900 78px Georgia, serif'; g.fillText('THE TOWN GAZETTE', 384, 100);
  g.fillRect(40, 122, 688, 6); g.font = 'italic 26px Georgia, serif'; g.fillText('June 3rd, 1826        Price: One Penny', 384, 160); g.fillRect(40, 176, 688, 3);
  g.font = '900 70px Georgia, serif';
  ['THE DANCING HAS', 'KEPT THE THING', 'ASLEEP FOR', '200 YEARS'].forEach((l, i) => g.fillText(l, 384, 262 + i * 76));
  // engraving of dancers
  g.fillStyle = '#cbbd9c'; g.fillRect(70, 560, 628, 270); g.fillStyle = '#3a3226';
  for (let k = 0; k < 9; k++) { const x = 110 + k * 68, y = 760 - (k % 2) * 10; g.fillRect(x, y - 90, 28, 46); g.fillRect(x + 4, y - 120, 20, 26); g.save(); g.translate(x, y - 84); g.rotate(-1.2 - (k % 3) * .4); g.fillRect(0, 0, 8, 40); g.restore(); g.save(); g.translate(x + 28, y - 84); g.rotate(1.2 + (k % 2) * .5); g.fillRect(-8, 0, 8, 40); g.restore(); g.fillRect(x + 2, y - 44, 9, 44); g.fillRect(x + 17, y - 44, 9, 44); }
  g.fillStyle = '#5a5040'; for (let r = 0; r < 6; r++) { g.fillRect(70, 860 + r * 24, 300, 8); g.fillRect(398, 860 + r * 24, 300, 8); }
  return t;
}
// creature face: glowing eyes + jagged grin on black
export function creatureFaceTex() {
  const { g, t } = canvas(512, 512);
  g.fillStyle = '#ffffff';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 40, 250); g.lineTo(256 + s * 150, 190); g.lineTo(256 + s * 135, 262); g.closePath(); g.fill(); }
  g.beginPath(); g.moveTo(150, 320); for (let i = 0; i <= 10; i++) g.lineTo(150 + i * 21.2, i % 2 ? 360 : 330); g.lineTo(362, 320); g.quadraticCurveTo(256, 420, 150, 320); g.fill();
  return t;
}

export function addDanceTown(W, scene) {
  const inter = W.inter;
  // ---------- supermarket ----------
  const sm = room(inter, 34, 28, 10, '#f3f6fb', '#ffffff', SUPER, '#ffffff'); W.supermarket = sm;
  sm.children[0].material = new THREE.MeshStandardMaterial({ map: tileTex('#e7ecf3', '#ffffff', 10), roughness: .35 }); sm.children[0].material.map.repeat.set(4, 3);
  const PROD = ['#ff5a5f', '#ffb400', '#3ec1d3', '#7bd389', '#a66cff', '#ff7eb6', '#4d7cfe', '#ff8a3d', '#f9f871'];
  for (let a = 0; a < 3; a++) {           // aisles along z
    const x = -10 + a * 10;
    const sh = new THREE.Group(); sh.position.set(x, 0, -2); sm.add(sh);
    m(B(2.4, .3, 18), mat('#d9dee7', .5), sh, 0, .15, 0); m(B(.3, 6, 18), mat('#c9d0db', .5), sh, 0, 3, 0);
    for (let lvl = 0; lvl < 4; lvl++) { m(B(2.4, .15, 18), mat('#e6eaf0', .4), sh, 0, 1.2 + lvl * 1.4, 0);
      for (let k = 0; k < 22; k++) for (const sd of [-1, 1]) { const c = PROD[Math.floor(hash(a * 300 + lvl * 40 + k + sd) * PROD.length)]; const hh = .6 + hash(k + lvl) * .5;
        m(B(.8, hh, .7), mat(c, .6), sh, sd * .75, 1.28 + lvl * 1.4 + hh / 2, -8.4 + k * .8, false); } }
  }
  m(B(30, 1.2, .2), new THREE.MeshBasicMaterial({ map: signTex('SUPER SAVER', '#e53935') }), sm, 0, 8.4, -13.8, false);
  for (let i = 0; i < 4; i++) m(B(10, .15, 1), new THREE.MeshBasicMaterial({ color: '#ffffff' }), sm, -12 + i * 8, 9.85, 0, false);
  // checkout
  m(B(6, 2.4, 2), mat('#4d7cfe', .5), sm, -9, 1.2, 9); m(B(6.2, .2, 2.2), mat('#2b2f3a', .3), sm, -9, 2.5, 9);
  // ---------- hospital ward ----------
  const hp = room(inter, 26, 22, 10, '#d7f3ee', '#cfe0ea', HOSP); W.hospital = hp;
  hp.children[0].material = new THREE.MeshStandardMaterial({ map: tileTex('#c4d8e4', '#dbe8f0', 8), roughness: .4 }); hp.children[0].material.map.repeat.set(3, 3);
  W.beds = [];
  for (const bx of [-6, 6]) {
    const bed = new THREE.Group(); bed.position.set(bx, 0, -4); hp.add(bed); W.beds.push(bed);
    m(B(3.6, .5, 7.2), mat('#e9edf2', .4), bed, 0, 2.2, 0); m(B(3.4, .5, 7), mat('#ffffff', .8), bed, 0, 2.6, 0);
    m(B(3.4, .25, 4.4), mat('#7ec8e3', .8), bed, 0, 2.95, 1.2);         // blanket
    m(B(2.2, .5, 1.2), mat('#ffffff', .9), bed, 0, 3.0, -2.8);           // pillow
    m(B(3.8, 3, .3), mat('#9aa6b2', .4), bed, 0, 2.6, -3.6);              // headboard
    for (const [a, b] of [[-1.6, -3.3], [1.6, -3.3], [-1.6, 3.3], [1.6, 3.3]]) m(B(.25, 2, .25), mat('#9aa6b2', .4), bed, a, 1, b);
    m(new THREE.CylinderGeometry(.06, .06, 6, 8), mat('#c9ced6', .3), bed, 2.6, 3, -3);   // IV stand
    m(B(.6, .9, .2), mat('#cfe9ff', .2, { transparent: true, opacity: .8 }), bed, 2.6, 5.6, -3);
  }
  const mon = canvas(256, 160); W.heartMon = mon;
  m(B(2.4, 1.6, .3), [mat('#2b2f3a'), mat('#2b2f3a'), mat('#2b2f3a'), mat('#2b2f3a'), new THREE.MeshBasicMaterial({ map: mon.t, toneMapped: false }), mat('#2b2f3a')], hp, -3, 6, -10.7, false);
  W.drawHeart = (t) => { const g = mon.g; g.fillStyle = '#071a12'; g.fillRect(0, 0, 256, 160); g.strokeStyle = '#3cff8a'; g.lineWidth = 4; g.beginPath();
    for (let x = 0; x < 256; x += 2) { const ph = ((x / 256) * 3 + t * 2.2) % 1; const y = ph > .4 && ph < .46 ? 30 : ph > .46 && ph < .52 ? 130 : 80 + Math.sin(x * .3 + t * 9) * 4; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); mon.t.needsUpdate = true; };
  W.drawHeart(0);
  for (const x of [-11, 11]) { const wnd = m(B(.1, 4, 6), new THREE.MeshBasicMaterial({ color: '#bfe6ff' }), hp, x * 1.08, 5.5, 2, false); }
  // ---------- town hall archive (night) ----------
  const hl = room(inter, 22, 18, 10, '#3d2a24', '#2a1d18', HALL, '#2a201c'); W.hall = hl;
  for (let k = 0; k < 4; k++) {           // filing shelves
    const sh = new THREE.Group(); sh.position.set(-9 + k * 2.6, 0, -8); hl.add(sh);
    m(B(2.2, 7, 1.4), mat('#5a3f30', .7), sh, 0, 3.5, 0);
    for (let r = 0; r < 5; r++) for (let j = 0; j < 4; j++) m(B(.45, 1.0, 1.0), mat(['#c9b48a', '#a88a5a', '#e0d0a8'][(r + j + k) % 3], .9), sh, -.75 + j * .5, .9 + r * 1.3, .25, false);
  }
  const desk = new THREE.Group(); desk.position.set(3, 0, -4); hl.add(desk); W.hallDesk = desk;
  m(B(7, .3, 3.2), mat('#6b4a36', .6), desk, 0, 2.6, 0);
  for (const [a, b] of [[-3.2, -1.3], [3.2, -1.3], [-3.2, 1.3], [3.2, 1.3]]) m(B(.3, 2.6, .3), mat('#4a3226', .6), desk, a, 1.3, b);
  // old CRT computer
  const crt = new THREE.Group(); crt.position.set(0, 2.75, -.5); desk.add(crt); W.crt = crt;
  m(B(3.2, 2.7, 2.6), mat('#d8cfb8', .7), crt, 0, 1.35, 0); m(B(2.0, 1.4, 1.6), mat('#cfc6ae', .7), crt, 0, 1.2, -1.6);
  const scr = canvas(512, 384); W.cctvCanvas = scr;
  W.crtScreen = m(new THREE.PlaneGeometry(2.6, 1.95), new THREE.MeshBasicMaterial({ map: scr.t, toneMapped: false }), crt, 0, 1.45, 1.31, false);
  m(B(3.2, .35, 1.2), mat('#d8cfb8', .7), desk, 0, 2.93, 1.0);             // keyboard
  W.newspaper = m(new THREE.PlaneGeometry(1.5, 2.0), new THREE.MeshStandardMaterial({ map: newspaperTex(), roughness: .9 }), desk, -2.3, 2.77, .5, false);
  W.newspaper.rotation.set(-Math.PI / 2, 0, .25);
  W.screenLight = new THREE.PointLight('#9fc8ff', 0, 16, 1.5); W.screenLight.position.set(HALL[0] + 3, 5.4, HALL[2] - 2); scene.add(W.screenLight);
  W.lampLight = new THREE.PointLight('#ffb36a', 0, 14, 1.7); W.lampLight.position.set(HALL[0] - 4, 7, HALL[2] - 2); scene.add(W.lampLight);
  // CCTV / message screen. mode: 'off' | 'feed' | 'msg'; years: 50 | 100 | 200
  W.cctv = (mode, t, years = 50) => {
    const g = scr.g, w = 512, h = 384;
    if (mode === 'off') { g.fillStyle = '#0d1410'; g.fillRect(0, 0, w, h); scr.t.needsUpdate = true; W.screenLight.intensity = 0; return; }
    if (mode === 'msg') {
      g.fillStyle = (Math.floor(t * 6) % 2) ? '#200000' : '#3a0000'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ff2a2a'; g.font = '900 92px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = '#ff0000'; g.shadowBlur = 30; g.fillText('DO NOT', w / 2, h / 2 - 50); g.fillText('STOP.', w / 2, h / 2 + 55); g.shadowBlur = 0;
      for (let y = 0; y < h; y += 4) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, w, 2); }
      scr.t.needsUpdate = true; W.screenLight.color.set('#ff3030'); W.screenLight.intensity = 9; return;
    }
    const sep = years >= 200 ? [70, 52, 30] : years >= 100 ? [52, 48, 40] : [38, 44, 40];
    g.fillStyle = `rgb(${sep})`; g.fillRect(0, 0, w, h);
    // street + figures
    g.fillStyle = `rgba(255,255,255,.08)`; g.fillRect(0, h * .62, w, h * .38);
    for (let k = 0; k < 26; k++) {
      const row = k % 3, x = ((k * 61) % 520) - 10, y = 150 + row * 70, s = .7 + row * .25, b = Math.sin(t * 8 + k) * 6 * s, arm = Math.sin(t * 8 + k * 1.7);
      g.fillStyle = `rgba(230,230,220,${.55 + row * .15})`;
      g.fillRect(x, y - 40 * s + b, 18 * s, 26 * s); g.fillRect(x + 3 * s, y - 56 * s + b, 12 * s, 14 * s);
      g.save(); g.translate(x, y - 38 * s + b); g.rotate(-1.4 - arm * .8); g.fillRect(0, -3 * s, 20 * s, 5 * s); g.restore();
      g.save(); g.translate(x + 18 * s, y - 38 * s + b); g.rotate(-1.7 + arm * .8); g.fillRect(0, -3 * s, 20 * s, 5 * s); g.restore();
      g.fillRect(x + 2 * s, y - 14 * s + b, 5 * s, 16 * s); g.fillRect(x + 11 * s, y - 14 * s + b, 5 * s, 16 * s);
    }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${hash(i + Math.floor(t * 24) * 7) * .12})`; g.fillRect(hash(i * 3 + Math.floor(t * 24)) * w, hash(i * 5 + Math.floor(t * 24)) * h, 2, 2); }
    for (let y = 0; y < h; y += 4) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y, w, 2); }
    g.fillStyle = '#ffffff'; g.font = '700 22px monospace'; g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText(`CAM 03   ${2026 - years}-06-03   23:4${Math.floor(t) % 10}`, 14, 12);
    if (Math.floor(t * 2) % 2) { g.fillStyle = '#ff3030'; g.beginPath(); g.arc(w - 60, 26, 8, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillText('REC', w - 46, 14); }
    g.fillStyle = '#ffe14d'; g.font = '900 54px Montserrat'; g.textAlign = 'center'; g.fillText(`${years} YEARS AGO`, w / 2, h - 74);
    scr.t.needsUpdate = true; W.screenLight.color.set('#9fc8ff'); W.screenLight.intensity = 6;
  };
  W.cctv('off', 0);

  // ---------- black hands + hole (placed per shot) ----------
  const hands = new THREE.Group(); scene.add(hands); W.hands = hands; hands.visible = false;
  const blk = new THREE.MeshStandardMaterial({ color: '#050507', roughness: .9 });
  const hole = m(new THREE.CircleGeometry(2.6, 40), new THREE.MeshBasicMaterial({ color: '#000000' }), hands, 0, .06, 0, false); hole.rotation.x = -Math.PI / 2; W.hole = hole;
  const holeRim = m(new THREE.RingGeometry(2.5, 3.2, 40), new THREE.MeshStandardMaterial({ color: '#3a2a20', roughness: 1 }), hands, 0, .05, 0, false); holeRim.rotation.x = -Math.PI / 2;
  W.handArms = [];
  for (let i = 0; i < 7; i++) {
    const a = new THREE.Group(); hands.add(a); W.handArms.push(a);
    const L = 5 + hash(i) * 2;
    m(B(.55, L, .55), blk, a, 0, L / 2, 0);
    const palm = new THREE.Group(); palm.position.y = L; a.add(palm); a.userData = { palm, L };
    m(B(.9, .8, .4), blk, palm, 0, .4, 0);
    for (let f = 0; f < 4; f++) { const fg = m(B(.16, .8, .16), blk, palm, -.33 + f * .22, 1.15, 0); fg.rotation.x = .25; }
    m(B(.18, .6, .18), blk, palm, -.55, .7, 0).rotation.z = .7;
  }
  // place: centre c, k 0..1 rise progress, grab: hands close over a point at height gy
  W.placeHands = (c, t, k, gy = 2.5) => {
    hands.visible = true; hands.position.set(...c);
    hole.scale.setScalar(Math.min(1, k * 3)); holeRim.scale.setScalar(Math.min(1, k * 3));
    W.handArms.forEach((a, i) => {
      const ang = i / 7 * Math.PI * 2, r = 1.6 + hash(i + 3) * .6, rise = Math.max(0, Math.min(1, k * 1.6 - i * .05));
      a.position.set(Math.sin(ang) * r, -a.userData.L + rise * (a.userData.L * .55 + gy * .5) , Math.cos(ang) * r);
      a.rotation.set(-Math.cos(ang) * .35 * rise + Math.sin(t * 9 + i) * .08, 0, Math.sin(ang) * .35 * rise + Math.cos(t * 8 + i) * .08);
      a.userData.palm.rotation.x = Math.sin(t * 11 + i) * .3;
    });
  };
  // ---------- creature extras ----------
  W.creatureFace = creatureFaceTex();
}
