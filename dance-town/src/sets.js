// Scenery: one outdoor town (street, bakery alley, gold mansion, dam above town, escape hill, square with stage)
// and three interiors placed far away (classroom, kitchen, mayor's office).
import * as THREE from 'three';
import { mat } from './rig.js';
import { signTex, chalkTex, chequeTex, brickTex, crackTex, screenSamTex, plaqueTex, slopTex, stockTex } from './tex.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function m(geo, mt, parent, x = 0, y = 0, z = 0, cast = true) {
  const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o;
}
const unlit = (tex) => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
function stripeTex(a, b) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 32, 0, 32, 64); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function roadTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#5b5f66'; g.fillRect(0, 0, 64, 512);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${(i * 0.618) % 1 * .08})`; g.fillRect((i * 31) % 64, (i * 97) % 512, 2, 2); }
  g.fillStyle = '#f2f2f2'; g.fillRect(30, 0, 4, 300);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

export const OCC = [];
function tree(p, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); p.add(g);
  g.userData = { c: new THREE.Vector3(x, 4 * s, z), r: 3.2 * s }; OCC.push(g);
  m(B(.7, 3, .7), mat('#7a4b2a', .9), g, 0, 1.5, 0);
  const lm = mat('#3fae3f', .85);
  m(new THREE.SphereGeometry(2.2, 8, 6), lm, g, 0, 4.6, 0); m(new THREE.SphereGeometry(1.6, 8, 6), lm, g, 1.3, 4.0, .4); m(new THREE.SphereGeometry(1.5, 8, 6), lm, g, -1.2, 4.2, -.3);
  return g;
}
function lamp(p0, x, z) {
  const p = new THREE.Group(); p0.add(p); p.userData = { c: new THREE.Vector3(x + .5, 3, z), r: 1.2 }; OCC.push(p);
  m(B(.25, 6, .25), mat('#2d2f33', .4), p, x, 3, z);
  m(B(1.2, .25, .25), mat('#2d2f33', .4), p, x + .5, 6, z);
  const bulb = m(B(.6, .3, .6), new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd27a', emissiveIntensity: 0 }), p, x + 1, 5.8, z, false);
  return bulb;
}

const SHOPS = [
  // [name, bodyColor, trim, awningA, awningB, height]
  ['TOYS', '#a77de0', '#ffd43b', '#ff5aa5', '#ffffff', 11],
  ['PIZZA', '#ff6b5a', '#ffffff', '#e8343e', '#ffffff', 10],
  ['BAKERY', '#ffd37a', '#c0563b', '#e85d75', '#fff3e0', 11],
  ['BANK', '#58c4b8', '#ffffff', '#1f8a7a', '#ffffff', 13],
  ['DINER', '#ff9f43', '#ffffff', '#ff4d4d', '#ffe066', 10],
  ['BOOKS', '#7ab8ff', '#ffffff', '#3a74d9', '#ffffff', 12],
  ['FLOWERS', '#ff8fc8', '#ffffff', '#3fae3f', '#ffffff', 10],
  ['GAMES', '#61d67a', '#ffffff', '#ffd43b', '#2b2b2b', 11],
];

function shop(p, x, z, facing, spec, w = 11) {
  const [name, col, trim, a1, a2, h] = spec;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = facing; p.add(g);
  m(B(w, h, 10), mat(col, .7), g, 0, h / 2, -5);
  m(B(w + .4, .6, 10.4), mat(trim, .6), g, 0, h + .3, -5);           // cornice
  m(B(w + .2, .5, .3), mat(trim, .6), g, 0, 4.6, .05);                 // band
  // shop window + door
  const glass = new THREE.MeshStandardMaterial({ color: '#9fd8ff', roughness: .08, metalness: .1, emissive: '#2a5a7a', emissiveIntensity: .25 });
  m(B(w * .55, 3.2, .2), glass, g, -w * .15, 2.2, .05);
  m(B(w * .58, .3, .3), mat('#ffffff'), g, -w * .15, .55, .1);
  m(B(2, 3.6, .2), mat('#6b3f22', .7), g, w * .3, 1.8, .05);
  m(B(.2, .2, .3), mat('#ffcc33', .3, { metalness: .8 }), g, w * .3 + .6, 1.8, .2);
  // upper windows
  for (let i = 0; i < 2; i++) for (let j = 0; j < (h > 11 ? 2 : 1); j++) {
    m(B(2, 2, .2), glass, g, -w * .25 + i * w * .5, 6.8 + j * 3, .05);
    m(B(2.4, .3, .5), mat('#ffffff'), g, -w * .25 + i * w * .5, 5.7 + j * 3, .2);
  }
  // awning
  const aw = m(B(w * .9, .15, 1.8), new THREE.MeshStandardMaterial({ map: stripeTex(a1, a2), roughness: .8 }), g, 0, 4.25, .85);
  aw.rotation.x = .32;
  // sign
  const sg = m(B(w * .7, 1.3, .25), [mat(trim), mat(trim), mat(trim), mat(trim), unlit(signTex(name, a1 === '#ffffff' ? col : a1)), mat(trim)], g, 0, 5.4, .2);
  return g;
}

function room(p, w, d, h, wall, floor, ox, oz) {
  const g = new THREE.Group(); g.position.set(ox, 0, oz); p.add(g);
  m(B(w, .2, d), mat(floor, .6), g, 0, -.1, 0, false);
  m(B(w, h, .3), mat(wall, .85), g, 0, h / 2, -d / 2, false);
  m(B(.3, h, d), mat(wall, .85), g, -w / 2, h / 2, 0, false);
  m(B(.3, h, d), mat(wall, .85), g, w / 2, h / 2, 0, false);
  m(B(w, h, .3), mat(wall, .85), g, 0, h / 2, d / 2, false);
  m(B(w, .2, d), mat('#f4f1ea', .9), g, 0, h, 0, false);
  m(B(w, .5, .35), mat('#ffffff', .6), g, 0, .25, -d / 2 + .2, false);
  return g;
}
function window3(p, x, y, z, ry = 0, w = 4, h = 3.5) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g);
  m(B(w, h, .1), new THREE.MeshBasicMaterial({ color: '#bfe6ff' }), g, 0, 0, 0, false);
  const fm = mat('#ffffff', .5);
  m(B(w + .4, .3, .3), fm, g, 0, h / 2, 0); m(B(w + .4, .3, .3), fm, g, 0, -h / 2, 0);
  m(B(.3, h, .3), fm, g, -w / 2, 0, 0); m(B(.3, h, .3), fm, g, w / 2, 0, 0); m(B(.15, h, .2), fm, g, 0, 0, 0);
  return g;
}
function desk(p, x, z, top = '#e2b36b') {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  m(B(3, .25, 2), mat(top, .6), g, 0, 2.6, 0);
  for (const [a, b] of [[-1.3, -.8], [1.3, -.8], [-1.3, .8], [1.3, .8]]) m(B(.2, 2.6, .2), mat('#3a3f47', .5), g, a, 1.3, b);
  return g;
}

export function buildWorld(scene) {
  const W = {};
  const town = new THREE.Group(); scene.add(town); W.town = town;
  // ground + road
  const grass = m(new THREE.PlaneGeometry(1200, 1200), mat('#6cc04a', .95), town, 0, 0, 0, false); grass.rotation.x = -Math.PI / 2;
  const rt = roadTex(); rt.repeat.set(1, 22);
  const road = m(new THREE.PlaneGeometry(10, 220), new THREE.MeshStandardMaterial({ map: rt, roughness: .85 }), town, 0, .02, 0, false);
  road.rotation.set(-Math.PI / 2, 0, Math.PI / 2); W.road = road;
  for (const z of [-7, 7]) { m(B(220, .3, 4), mat('#d9d4cc', .85), town, 0, .15, z, false); m(B(220, .32, .3), mat('#bdb6ab', .8), town, 0, .16, z > 0 ? 5.1 : -5.1, false); }

  // shops both sides, x from -40 to 40
  W.shops = [];
  for (let i = 0; i < 8; i++) {
    const x = -38.5 + i * 11;
    W.shops.push(shop(town, x, -9, 0, SHOPS[i]));
    if (x < 30) W.shops.push(shop(town, x + 5, 9, Math.PI, SHOPS[(i + 4) % 8]));
  }
  // bakery is SHOPS[2] on north side at x = -16.5
  W.bakeryX = -16.5;
  // trees + lamps along the sidewalks
  W.lamps = [];
  for (let x = -40; x <= 40; x += 13) { tree(town, x + 3, -6.2, .8); W.lamps.push(lamp(town, x - 3, 6.4)); tree(town, x - 6, 6.4, .8); }
  // bench, hydrant, bins
  m(B(.6, 1, .6), mat('#e53935', .4), town, 6, .8, 6.2);
  m(B(1.2, 1.6, 1.2), mat('#2e7d32', .6), town, -6, .8, -6.2);

  // ---- alley behind the bakery (north side, z -19..-28) ----
  const alley = new THREE.Group(); alley.position.set(W.bakeryX, 0, -24); town.add(alley); W.alley = alley;
  const bt = brickTex(); bt.repeat.set(6, 2);
  m(B(40, 10, 1), new THREE.MeshStandardMaterial({ map: bt, roughness: .9 }), alley, 0, 5, -4.5);
  m(B(40, .2, 9), mat('#8d8a86', .9), alley, 0, .1, 0, false);
  m(B(2.2, 2.6, 1.6), mat('#3d6b4a', .6), alley, 6, 1.3, -3);            // dumpster
  m(B(2.4, .3, 1.8), mat('#2c4f37', .6), alley, 6, 2.7, -3);
  m(B(1, 1.4, 1), mat('#888', .5), alley, 9, .7, -3.2); m(B(1, 1.4, 1), mat('#777', .5), alley, -7, .7, -3.4);
  // cardboard box house
  const box = new THREE.Group(); box.position.set(0, 0, -1.5); alley.add(box); W.boxHouse = box;
  const cb = mat('#c8955a', .95), cbd = mat('#a8763f', .95);
  m(B(5, 3.2, .15), cb, box, 0, 1.6, -1.8); m(B(.15, 3.2, 3.6), cb, box, -2.5, 1.6, 0); m(B(.15, 3.2, 3.6), cb, box, 2.5, 1.6, 0);
  m(B(5.2, .15, 3.8), cbd, box, 0, 3.25, 0);
  const flap = m(B(2.4, .12, 1.4), cbd, box, -1.3, 3.0, 2.3); flap.rotation.x = .9;
  m(B(1.7, .12, .1), mat('#222'), box, 1.3, 2.4, 1.85);
  const homeSign = m(new THREE.PlaneGeometry(2, .7), unlit(signTex('HOME', '#c8955a', '#3a2510', 256, 96, 800)), box, 1.2, 2.5, 1.86, false);
  m(B(1.6, .08, 2.6), mat('#6d8bd1', .9), box, -.8, .2, .2);            // blanket
  W.alleyLamp = m(B(.6, .4, .4), new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffcf70', emissiveIntensity: 1.5 }), alley, -3, 7, -3.9, false);

  // ---- golden mansion (south side, x 42..62) ----
  const man = new THREE.Group(); man.position.set(52, 0, 24); man.rotation.y = Math.PI; town.add(man); W.mansion = man;
  const gold = mat('#ffcc2e', .3, { metalness: .35, emissive: '#5a3a00', emissiveIntensity: .25 }), goldD = mat('#f0b020', .3, { metalness: .4, emissive: '#4a3000', emissiveIntensity: .25 }), white = mat('#fffbe8', .5);
  m(B(22, 12, 12), gold, man, 0, 6, 0); m(B(24, 1, 13), goldD, man, 0, 12.5, 0);
  m(B(10, 6, 10), gold, man, 0, 16, 0); const dome = m(new THREE.SphereGeometry(4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), goldD, man, 0, 19, 0);
  for (let i = -3; i <= 3; i++) m(new THREE.CylinderGeometry(.5, .5, 11, 12), white, man, i * 3.2, 5.5, 6.6);
  m(B(22, 1, 3), white, man, 0, 11.4, 6.8);
  for (let i = -2; i <= 2; i++) if (i) m(B(2, 3, .3), new THREE.MeshStandardMaterial({ color: '#9fe0ff', emissive: '#ffe08a', emissiveIntensity: .35 }), man, i * 4, 7.5, 6.05);
  m(B(3, 5, .3), mat('#7a3d10', .4), man, 0, 2.5, 6.1);
  m(B(26, .6, 2), goldD, man, 0, .3, 14);
  for (let i = -6; i <= 6; i++) m(B(.3, 3.4, .3), goldD, man, i * 2, 1.7, 14); // fence
  m(B(26, .3, .3), goldD, man, 0, 3.2, 14);
  W.mansionSign = m(B(6, 1.4, .3), [goldD, goldD, goldD, goldD, unlit(signTex('MAYOR', '#1a1a1a', '#ffcc2e')), goldD], man, 0, 14.6, 6.6);

  // ---- hill + dam above the town (north) ----
  const hillM = mat('#5fb544', .95);
  const slope = m(B(260, 20, 80), hillM, town, 0, -2.84, -80.3, false); slope.rotation.x = .18;
  m(B(260, 20, 124), hillM, town, 0, 4, -179, false);
  const dam = new THREE.Group(); dam.position.set(0, 26, -120); town.add(dam); W.dam = dam;
  const conc = mat('#b9bcc2', .85);
  W.damWall = m(B(90, 24, 6), conc, dam, 0, 0, 0);
  m(B(92, 1.5, 8), mat('#9a9da3', .8), dam, 0, 12.5, 0);
  for (let i = -4; i <= 4; i++) m(B(1, 24, 1), mat('#a7aab0', .85), dam, i * 10, 0, 3.2);
  W.reservoir = m(new THREE.PlaneGeometry(90, 60), new THREE.MeshStandardMaterial({ color: '#2f86d6', roughness: .15, metalness: .1 }), dam, 0, 10.5, -32, false);
  W.reservoir.rotation.x = -Math.PI / 2;
  const crack = m(new THREE.PlaneGeometry(8, 16), new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, depthWrite: false }), dam, 3, 1, 3.05, false);
  W.crack = crack;
  // water jets through the crack (stretched boxes)
  W.jets = [];
  for (let i = 0; i < 4; i++) { const j = m(B(.5, .5, 3), new THREE.MeshStandardMaterial({ color: '#7cc6ff', transparent: true, opacity: .85, roughness: .1 }), dam, 2 + i * .6, -2 - i * 1.6, 4.5, false); j.visible = false; W.jets.push(j); }
  // chunks for the burst
  W.chunks = [];
  for (let i = 0; i < 26; i++) { const c = m(B(3 + (i % 3), 3, 3), conc, dam, 0, 0, 0); c.visible = false; W.chunks.push(c); }

  // ---- escape hill (west) ----
  const hill = m(new THREE.SphereGeometry(40, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hillM, town, -105, -14, 0, false); hill.scale.set(1, .95, 1.2);
  for (let i = 0; i < 6; i++) tree(town, -100 + Math.sin(i) * 20, Math.cos(i * 2) * 25, 1.2);

  // ---- town square stage (west end of street) ----
  const st = new THREE.Group(); st.position.set(-55, 0, -2); town.add(st); W.stage = st;
  m(B(12, 1.6, 7), mat('#e04848', .6), st, 0, .8, -2);
  m(B(12.4, .2, 7.4), mat('#ffffff', .6), st, 0, 1.7, -2);
  m(B(.12, 3.5, .12), mat('#222', .3), st, 1.0, 3.45, -.6);
  const mic = m(B(.1, .8, .1), mat('#222', .3), st, .8, 5.45, -.8); mic.rotation.z = .7;
  m(new THREE.SphereGeometry(.17, 12, 8), mat('#333', .3), st, .55, 5.75, -.9);
  // big screen
  m(B(.4, 10, .4), mat('#333'), st, -6, 5, -6); m(B(.4, 10, .4), mat('#333'), st, 6, 5, -6);
  m(B(13, 7.6, .4), mat('#1a1a1a'), st, 0, 10, -6.1);
  W.screen = m(new THREE.PlaneGeometry(12.2, 6.86), unlit(screenSamTex()), st, 0, 10, -5.88, false);
  // TV camera on tripod
  const cam = new THREE.Group(); cam.position.set(0, 0, 7); st.add(cam); W.tvcam = cam;
  for (const a of [0, 2.1, 4.2]) { const l = m(B(.15, 4.2, .15), mat('#222'), cam, Math.sin(a) * .7, 2, Math.cos(a) * .7); l.rotation.set(Math.cos(a) * .18, 0, -Math.sin(a) * .18); }
  m(B(1.4, 1.3, 2.4), mat('#2b2b2b', .4), cam, 0, 4.6, 0);
  m(new THREE.CylinderGeometry(.5, .6, 1.2, 20), mat('#111', .2), cam, 0, 4.6, -1.6).rotation.x = Math.PI / 2;
  m(new THREE.CircleGeometry(.42, 24), new THREE.MeshStandardMaterial({ color: '#1a2a60', roughness: .05, metalness: .9 }), cam, 0, 4.6, -2.21, false).rotation.y = Math.PI;
  W.tally = m(B(.25, .25, .25), new THREE.MeshBasicMaterial({ color: '#ff2020' }), cam, .5, 5.4, -1.1, false);

  // ---- new house + statue (after the flood) ----
  const nh = new THREE.Group(); nh.position.set(80, 0, -14); town.add(nh); W.newHouse = nh;
  m(B(10, 6, 8), mat('#7fd3ff', .7), nh, 0, 3, 0);
  const roof = m(new THREE.ConeGeometry(7.6, 4, 4), mat('#ff5a5a', .7), nh, 0, 8, 0); roof.rotation.y = Math.PI / 4; roof.scale.z = .8;
  m(B(2, 3.6, .2), mat('#ffd43b', .5), nh, 0, 1.8, 4.05);
  window3(nh, -3, 3.4, 4.05, 0, 2, 2); window3(nh, 3, 3.4, 4.05, 0, 2, 2);
  for (let i = -5; i <= 5; i++) m(B(.3, 1.4, .2), mat('#ffffff'), nh, i, .7, 7);
  const statue = new THREE.Group(); statue.position.set(72, 0, -5); town.add(statue); W.statue = statue;
  m(B(3.4, 3, 3.4), mat('#d8d4cc', .8), statue, 0, 1.5, 0);
  m(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshStandardMaterial({ map: plaqueTex(), roughness: .4 }), statue, 0, 1.6, 1.71, false);
  W.statueTop = new THREE.Group(); W.statueTop.position.set(0, 3, 0); statue.add(W.statueTop);

  // ---- flood water ----
  const wm = new THREE.MeshStandardMaterial({ color: '#2d8fe0', roughness: .12, metalness: .05, transparent: true, opacity: .93 });
  W.flood = m(new THREE.PlaneGeometry(400, 1), wm, town, 20, 0, 0, false); W.flood.rotation.x = -Math.PI / 2; W.flood.visible = false;
  W.wave = new THREE.Group(); town.add(W.wave); W.wave.visible = false;
  m(B(400, 8, 6), wm, W.wave, 20, 2, 0, false);
  m(B(400, 1.6, 7), mat('#f2fbff', .6), W.wave, 20, 6.4, 1);
  for (let i = 0; i < 40; i++) m(new THREE.SphereGeometry(1.4 + (i % 3) * .5, 8, 6), mat('#ffffff', .6), W.wave, -180 + i * 10, 6.8 + (i % 2), 2.6, false);
  W.spill = m(new THREE.PlaneGeometry(90, 1), wm, town, 0, 0, 0, false); W.spill.visible = false;
  W.floatCoins = [];
  for (let i = 0; i < 40; i++) { const c = m(new THREE.CylinderGeometry(.5, .5, .12, 16), mat('#ffcc2e', .25, { metalness: .8 }), town, 0, 0, 0); c.visible = false; W.floatCoins.push(c); }

  // ================= interiors =================
  const inter = new THREE.Group(); scene.add(inter); W.inter = inter;
  // classroom @ (0, 0, 1000)
  const cls = room(inter, 26, 22, 11, '#a8ddd5', '#c9965a', 0, 1000); W.classroom = cls;
  m(new THREE.PlaneGeometry(12, 6), new THREE.MeshStandardMaterial({ map: chalkTex(), roughness: .9 }), cls, 0, 6, -10.8, false);
  window3(cls, 12.8, 6, -3, -Math.PI / 2, 5, 4); window3(cls, 12.8, 6, 5, -Math.PI / 2, 5, 4);
  desk(cls, -5, -6.5, '#8e5a2f');                          // teacher desk
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) desk(cls, -6 + c * 6, 0 + r * 4.5);
  m(B(6, 4, .2), mat('#f7d36b', .8), cls, -8, 7, -10.8);         // pin board
  for (let i = 0; i < 5; i++) m(B(1, 1.2, .1), mat(['#ff8fc8', '#7ab8ff', '#ffffff', '#61d67a', '#ffd43b'][i], .9), cls, -10 + i * 1.1, 7 + (i % 2) * .4, -10.65, false);
  // homework paper (chewed)
  W.homework = m(B(1.6, .05, 2), mat('#ffffff', .9), cls, 0, 0, 0); W.homework.visible = false;

  // kitchen @ (200, 0, 1000)
  const kit = room(inter, 22, 20, 11, '#ffe08a', '#b9835a', 200, 1000); W.kitchen = kit;
  window3(kit, 0, 6.5, -9.8, 0, 6, 4);
  for (let i = 0; i < 5; i++) { m(B(3, 3.4, 2.2), mat('#ffffff', .5), kit, -8 + i * 3.2, 1.7, -8.6); m(B(3, .3, 2.4), mat('#6d4c41', .5), kit, -8 + i * 3.2, 3.5, -8.6); m(B(2.8, 2.6, 1.4), mat('#5bc0de', .5), kit, -8 + i * 3.2, 8.6, -9.2); }
  m(B(3.6, 8, 3), mat('#e8eef2', .3), kit, 8.5, 4, -8.2);           // fridge
  const tbl = new THREE.Group(); tbl.position.set(0, 0, 1); kit.add(tbl);
  m(new THREE.CylinderGeometry(3.4, 3.4, .3, 32), mat('#c0874f', .5), tbl, 0, 2.7, 0);
  m(new THREE.CylinderGeometry(.4, .7, 2.7, 16), mat('#7a4b2a', .5), tbl, 0, 1.35, 0);
  W.plate = new THREE.Group(); tbl.add(W.plate); W.plate.position.set(0, 2.9, .8);
  m(new THREE.CylinderGeometry(1.1, .9, .12, 28), mat('#ffffff', .3), W.plate, 0, 0, 0);
  W.slop = m(new THREE.SphereGeometry(.85, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: slopTex(), roughness: .25 }), W.plate, 0, .06, 0);
  W.slop.scale.y = .45;

  // office @ (400, 0, 1000)
  const off = room(inter, 24, 20, 12, '#7a1f2b', '#3b2416', 400, 1000); W.office = off;
  window3(off, -6, 6.5, -9.8, 0, 4, 5); window3(off, 6, 6.5, -9.8, 0, 4, 5);
  const pt = m(B(4, 5, .3), mat('#ffcc2e', .3, { metalness: .8 }), off, 0, 7, -9.7);
  m(B(3.2, 4.2, .1), mat('#2b2b2b', .6), off, 0, 7, -9.5);
  const dk = new THREE.Group(); dk.position.set(0, 0, -3); off.add(dk); W.officeDesk = dk;
  m(B(9, .5, 4), mat('#5a3418', .45), dk, 0, 3, 0); m(B(8.6, 2.8, 3.6), mat('#4a2a12', .55), dk, 0, 1.4, 0);
  m(B(9.1, .15, 4.1), mat('#ffcc2e', .3, { metalness: .8 }), dk, 0, 3.27, 0);
  W.goldPile = new THREE.Group(); W.goldPile.position.set(-6.5, 0, -1.5); off.add(W.goldPile);
  for (let i = 0; i < 70; i++) {
    const a = i * 2.4, r = Math.sqrt(i) * .45, y = Math.max(0, 3 - r * 1.3) + .1;
    const c = m(new THREE.CylinderGeometry(.42, .42, .14, 14), mat('#ffcc2e', .25, { metalness: .85 }), W.goldPile, Math.cos(a) * r, y, Math.sin(a) * r);
    c.rotation.set(Math.sin(i) * .6, 0, Math.cos(i * 1.7) * .6);
  }
  for (let i = 0; i < 4; i++) m(B(1.6, .7, .9), mat('#ffcc2e', .25, { metalness: .85 }), W.goldPile, -1 + i * .7, .35 + (i % 2) * .7, 1.6);
  // cheque prop
  W.cheque = m(B(3, .02, 1.35), [mat('#e8dfb4'), mat('#e8dfb4'), new THREE.MeshStandardMaterial({ map: chequeTex(), roughness: .7 }), mat('#e8dfb4'), mat('#e8dfb4'), mat('#e8dfb4')], scene, 0, 0, 0);
  W.cheque.visible = false;
  W.pen = m(new THREE.CylinderGeometry(.06, .06, 1.4, 8), mat('#111', .3), scene, 0, 0, 0); W.pen.visible = false;
  // bread crust prop
  W.crust = m(B(1.2, .25, .35), mat('#b06a2a', .8), scene, 0, 0, 0); W.crust.visible = false;

  // ================= Letter Town additions =================
  // mailbox: post + rounded box (door faces +z, hinged at the bottom), red flag, an inner slot for envelopes
  W.mailbox = (x, z, ry = 0, col = '#3a5fd0') => {
    const g = new THREE.Group(); g.position.set(x, .3, z); g.rotation.y = ry; town.add(g);
    m(B(.22, 3.2, .22), mat('#6d4c41', .8), g, 0, 1.6, 0);
    const bx = new THREE.Group(); bx.position.set(0, 3.2, 0); g.add(bx);
    const bm = mat(col, .45);
    m(B(1.0, .06, 1.7), bm, bx, 0, .03, 0); m(B(.06, .62, 1.7), bm, bx, -.47, .34, 0); m(B(.06, .62, 1.7), bm, bx, .47, .34, 0);
    const top = m(new THREE.CylinderGeometry(.5, .5, 1.7, 20, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: col, roughness: .45, side: THREE.DoubleSide }), bx, 0, .64, 0); top.rotation.x = -Math.PI / 2;
    const back = m(new THREE.CircleGeometry(.5, 20, 0, Math.PI), new THREE.MeshStandardMaterial({ color: col, roughness: .45, side: THREE.DoubleSide }), bx, 0, .64, -.85); m(B(1.0, .64, .06), bm, bx, 0, .32, -.85);
    const inner = m(B(.88, .02, 1.6), mat('#1c1c22', .9), bx, 0, .07, 0, false);
    const liner = m(B(.86, .6, 1.62), new THREE.MeshStandardMaterial({ color: '#2a2024', roughness: 1, side: THREE.BackSide }), bx, 0, .36, -.02, false);
    const door = new THREE.Group(); door.position.set(0, .03, .86); bx.add(door);
    m(B(1.0, .64, .05), bm, door, 0, .32, 0); m(new THREE.CircleGeometry(.5, 20, 0, Math.PI), new THREE.MeshStandardMaterial({ color: col, roughness: .45, side: THREE.DoubleSide }), door, 0, .64, 0);
    m(B(.18, .1, .1), mat('#dddddd', .3, { metalness: .6 }), door, 0, .75, .05);
    const flag = new THREE.Group(); flag.position.set(.53, .4, -.3); bx.add(flag);
    m(B(.05, .9, .1), mat('#e53935', .4), flag, 0, .45, 0); m(B(.05, .3, .4), mat('#e53935', .4), flag, 0, .78, .2);
    const env = new THREE.Group(); env.position.set(0, .12, 0); bx.add(env);
    return { g, bx, door, flag, env, liner };
  };
  W.maxBox = W.mailbox(77.2, -6.0, 0, '#d63031');
  W.boxes = [W.mailbox(-27, -5.7), W.mailbox(-5, -5.7, 0, '#2e9e5b'), W.mailbox(17, -5.7, 0, '#d65db1'), W.mailbox(-16, 5.7, Math.PI, '#f39c12'), W.mailbox(6, 5.7, Math.PI, '#8e5be0')];
  // mansion: basement window low on the west wall (world x = 41, facing -x)
  W.basementWin = m(B(.12, 1.1, 2.0), mat('#1a1a24', .3), town, 40.95, .75, 22, false);
  m(B(.2, .16, 2.3), mat('#fffbe8'), town, 40.92, 1.38, 22); m(B(.2, .16, 2.3), mat('#fffbe8'), town, 40.92, .12, 22);
  // town square: gas cans + puddle
  W.gas = [];
  for (const [x, z] of [[-60, 3], [-58.5, 3.6], [-50.5, 2.6], [-49, 3.4], [-62, -8.5], [-47.6, -8.5]]) {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = x * 1.3; town.add(c);
    m(B(1, 1.3, .6), mat('#d62828', .4), c, 0, .65, 0); m(B(.18, .4, .18), mat('#222', .4), c, .3, 1.45, 0).rotation.z = -.5; m(B(.5, .12, .14), mat('#222'), c, -.15, 1.35, 0);
    W.gas.push(c);
  }
  W.puddle = m(new THREE.CircleGeometry(1.6, 32), new THREE.MeshStandardMaterial({ color: '#6fa8dc', roughness: .05, metalness: .2 }), town, -54, .025, 4, false);
  W.puddle.rotation.x = -Math.PI / 2; W.puddle.scale.set(1, .7, 1);
  // stage screen: Max's stocks
  W.stockScreen = m(new THREE.PlaneGeometry(12.2, 6.86), unlit(stockTex()), W.stage, 0, 10, -5.86, false); W.stockScreen.visible = false;
  // office (mansion interior): curtains on the left wall
  W.curtains = new THREE.Group(); W.curtains.position.set(388.4, 0, 1001); inter.add(W.curtains);
  const cmat = mat('#8e1b2b', .9);
  for (let i = 0; i < 6; i++) { const c = m(B(.5, 11.4, 1.0), cmat, W.curtains, .35 + (i % 2) * .25, 5.7, -3 + i * 1.0); c.rotation.y = Math.sin(i) * .15; }
  m(B(.3, .3, 7), mat('#c9a43a', .3, { metalness: .7 }), W.curtains, .3, 11.5, -.5);
  // basement @ (600, 0, 1000)
  const bt2 = brickTex(); bt2.repeat.set(3, 1.5);
  const bw = new THREE.MeshStandardMaterial({ map: bt2, color: '#7d7a80', roughness: .95 });
  const bas = new THREE.Group(); bas.position.set(600, 0, 1000); inter.add(bas); W.basement = bas;
  m(B(16, .2, 14), mat('#5d5b5a', .95), bas, 0, -.1, 0, false);
  m(B(16, 9, .3), bw, bas, 0, 4.5, -7, false); m(B(.3, 9, 14), bw, bas, -8, 4.5, 0, false); m(B(.3, 9, 14), bw, bas, 8, 4.5, 0, false); m(B(16, 9, .3), bw, bas, 0, 4.5, 7, false);
  m(B(16, .2, 14), mat('#3a3836', .9), bas, 0, 9, 0, false);
  m(B(3, 6, .2), mat('#5a3a22', .7), bas, 4, 3, 6.8);                       // door
  W.basWin = m(B(2.2, 1.1, .1), new THREE.MeshBasicMaterial({ color: '#bcd4ff' }), bas, -3, 7.6, -6.84, false);   // tiny window
  m(B(2.5, .15, .3), mat('#444'), bas, -3, 8.2, -6.8); m(B(2.5, .15, .3), mat('#444'), bas, -3, 7.0, -6.8);
  W.crates = [];
  for (const [x, y, z, r] of [[-3, .9, -5.6, .1], [-1.2, .9, -5.4, -.15], [-2.2, 2.7, -5.6, .2], [5, .9, -5, .4], [6, .9, -3.2, -.2], [-6.5, .9, 3, .3]]) {
    const c = m(new RoundedBoxGeometry(1.8, 1.8, 1.8, 2, .08), mat('#a87a45', .85), bas, x, y, z); c.rotation.y = r; W.crates.push(c);
  }
  W.bulb = m(new THREE.SphereGeometry(.25, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffe9a8' }), bas, 0, 7.6, 0, false);
  m(B(.04, 1.4, .04), mat('#111'), bas, 0, 8.4, 0, false);
  W.basLight = new THREE.PointLight('#ffd590', 0, 30, 1.6); W.basLight.position.set(600, 7.3, 1000); scene.add(W.basLight);
  W.wmatch = new THREE.Group(); scene.add(W.wmatch); W.wmatch.visible = false;
  m(B(.07, .7, .07), mat('#e8d2a0', .7), W.wmatch, 0, 0, 0); m(new THREE.SphereGeometry(.08, 8, 6), mat('#c0392b', .6), W.wmatch, 0, .37, 0);
  // props held by characters (created once, attached per shot by main.js)
  W.fish = new THREE.Group(); scene.add(W.fish); W.fish.visible = false;
  { const f = m(new THREE.SphereGeometry(.5, 14, 10), mat('#f08a3c', .4), W.fish, 0, 0, 0); f.scale.set(1.6, .55, .6);
    const tail = m(new THREE.ConeGeometry(.35, .6, 4), mat('#e0702a', .4), W.fish, -.95, 0, 0); tail.rotation.z = Math.PI / 2;
    m(new THREE.SphereGeometry(.07, 8, 6), mat('#111'), W.fish, .55, .1, .25); }
  W.occluders = OCC;
  return W;
}
