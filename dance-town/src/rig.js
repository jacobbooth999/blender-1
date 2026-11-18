// Blocky Roblox-style characters (Dummy body: bevelled parts, hand/foot slabs, rounded head) with a face decal,
// chunky hair/hats, and a money badge on a cord. Height ~5.3 units (feet at y=0).
import * as THREE from 'three';
import { faceTex, badgeTex } from './tex.js';
import { DANCES } from './crowd.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const mats = new Map();
export function mat(color, rough = .55, extra = {}) {
  const k = color + rough + JSON.stringify(extra);
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }));
  return mats.get(k);
}
function mesh(geo, m, parent, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
}

// Body built to match the Roblox blocky "Dummy": bevelled parts with seams, two-piece torso, arm + hand slab,
// leg + foot slab, rounded head with no neck. Torso is 2 wide, top of torso at y = 4, feet at y = 0.
const BEV = .07;
const rbox = (w, h, d, r = BEV) => new RoundedBoxGeometry(w, h, d, 3, r);
const splitMats = new Map();
// one material that is colour A above local y = split and colour B below it (sleeves, shoes) without a geometry seam
function splitMat(top, bot, split) {
  const k = top + bot + split;
  if (splitMats.has(k)) return splitMats.get(k);
  const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .5, metalness: 0 });
  const cA = new THREE.Color(top), cB = new THREE.Color(bot);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.cA = { value: cA }; sh.uniforms.cB = { value: cB }; sh.uniforms.splitY = { value: split };
    sh.vertexShader = 'varying float vLy;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLy = position.y;');
    sh.fragmentShader = 'uniform vec3 cA; uniform vec3 cB; uniform float splitY; varying float vLy;\n' +
      sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( vLy > splitY ? cA : cB, opacity );');
  };
  m.customProgramCacheKey = () => 'split' + k;
  splitMats.set(k, m); return m;
}
// classic head: lathe profile, strongly rounded top, softer bottom, slight taper
function headGeo() {
  const P = [[0, 0], [.34, 0], [.46, .03], [.53, .1], [.56, .22], [.585, .55], [.585, .78], [.567, .93], [.52, 1.04], [.43, 1.12], [.28, 1.17], [0, 1.188]];
  const pts = []; for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 4; k++) { const a = P[i], b = P[i + 1], t = k / 4; pts.push(new THREE.Vector2(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)); }
  pts.push(new THREE.Vector2(...P[P.length - 1]));
  const g = new THREE.LatheGeometry(pts, 48); g.computeVertexNormals(); return g;
}
const HEAD_GEO = headGeo();

export function makeChar(o) {
  const skin = o.skin || '#f2c9a0', shirt = o.shirt || '#4caf50', pants = o.pants || '#2f5fa8';
  const root = new THREE.Group(); root.name = o.name || 'char';
  const body = new THREE.Group(); root.add(body);             // bob / lean
  const trunk = new THREE.Group(); body.add(trunk);           // torso + decorations (scaled by setBuild)
  // torso: upper 2 x 1.55 x 1 (top at y 4), seam, lower band 2 x .43 x 1 (bottom at y 2)
  const torso = mesh(rbox(2, 1.55, 1), mat(shirt, o.plaid ? .7 : .5), trunk, 0, 3.225, 0);
  mesh(rbox(1.98, .43, .98), mat(pants, .5), trunk, 0, 2.215, 0);
  if (o.tie) { mesh(box(.32, 1.3, .06), mat(o.tie, .4), trunk, 0, 3.25, .52); mesh(box(.9, .5, .05), mat('#f4f4f4'), trunk, 0, 3.78, .51); }
  if (o.jacketOpen) { mesh(box(.5, 1.5, .04), mat('#f4f4f4'), trunk, 0, 3.22, .505); mesh(box(.32, 1.2, .06), mat(o.jacketOpen, .4), trunk, 0, 3.3, .53); }
  if (o.patch) mesh(box(.55, .5, .04), mat(o.patch, .8), trunk, -.55, 2.8, .51);
  if (o.stripe) mesh(box(2.02, .3, 1.02), mat(o.stripe), trunk, 0, 3.2, 0);
  if (o.zip) mesh(box(.08, 1.5, .04), mat('#eee'), trunk, 0, 3.2, .51);
  if (o.chain) { const ch = mesh(new THREE.TorusGeometry(.55, .06, 6, 20, Math.PI), mat('#ffcc33', .25, { metalness: .9 }), trunk, 0, 3.5, .53); ch.rotation.z = Math.PI; }
  if (o.apron) mesh(box(1.6, 1.4, .05), mat(o.apron), trunk, 0, 2.75, .52);

  // arms: pivot at the shoulder; arm 1 x 1.72 x 1 (top flush with torso top) + hand slab .94 x .25 x 1.04
  const sleeve = o.longSleeve ? 1 : o.sleeve ?? .4;
  const arm = (side) => {
    const piv = new THREE.Group(); piv.position.set(side * 1.52, 3.95, 0); body.add(piv);
    const L = 1.72, cy = .05 - L / 2;
    const m = sleeve >= 1 ? mat(shirt) : splitMat(shirt, skin, L / 2 - L * sleeve);
    mesh(rbox(1, L, 1), m, piv, 0, cy, 0);
    mesh(rbox(.94, .25, 1.04, .06), mat(skin, .5), piv, -side * .03, .05 - L - .03 - .125, .01);
    return piv;
  };
  const armL = arm(-1), armR = arm(1);
  // legs: pivot at the hip; leg .98 x 1.75 x 1 + foot slab .98 x .22 x 1.06 (bottom at y 0)
  const leg = (side) => {
    const piv = new THREE.Group(); piv.position.set(side * .51, 2.0, 0); body.add(piv);
    const L = 1.75;
    mesh(rbox(.98, L, 1), mat(pants, .5), piv, 0, -L / 2 - .005, 0);
    mesh(rbox(.98, .22, 1.06, .06), mat(o.shoes || pants, .5), piv, 0, -2.0 + .11, .02);
    return piv;
  };
  const legL = leg(-1), legR = leg(1);

  // head: sits straight on the torso, no neck
  const head = new THREE.Group(); head.position.set(0, 4.0, 0); body.add(head);
  const hm = mat(skin, .3);
  mesh(HEAD_GEO, hm, head, 0, -.07, 0);
  const faceM = new THREE.MeshStandardMaterial({ map: faceTex('neutral'), transparent: true, roughness: .42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = new THREE.Mesh(new THREE.CylinderGeometry(.586, .586, 1.0, 32, 1, true, -Math.PI * .36, Math.PI * .72), faceM);
  face.position.y = .6; face.renderOrder = 2; head.add(face);
  if (o.noFace) face.visible = false;
  hair(head, o);
  if (o.sunglasses) {
    const gm = mat('#0a0a0a', .15, { metalness: .5 });
    mesh(rbox(.42, .26, .08, .05), gm, head, -.21, .66, .57); mesh(rbox(.42, .26, .08, .05), gm, head, .21, .66, .57);
    mesh(box(1.18, .05, .05), gm, head, 0, .74, .55);
  }
  if (o.headband) { const hb = mesh(new THREE.CylinderGeometry(.6, .6, .22, 32, 1, true), mat(o.headband, .6), head, 0, .98, 0); hb.material.side = THREE.DoubleSide;
    const tail = mesh(box(.12, .5, .1), mat(o.headband, .6), head, .25, .75, -.6); tail.rotation.z = .5; const t2 = mesh(box(.12, .45, .1), mat(o.headband, .6), head, .05, .72, -.62); t2.rotation.z = -.3; }
  if (o.glasses) { const gm = mat('#2a2a2a', .3, { metalness: .4 });
    for (const x of [-.2, .2]) { const r = mesh(new THREE.TorusGeometry(.15, .025, 8, 24), gm, head, x, .68, .585); }
    mesh(box(.12, .025, .025), gm, head, 0, .7, .59); }
  if (o.earpiece) mesh(new THREE.SphereGeometry(.07, 8, 6), mat('#111'), head, .58, .55, .05);

  // badge
  let badge = null;
  if (o.badge !== false) {
    const bg = new THREE.Group(); bg.position.set(0, 3.0, .53); body.add(bg);
    const cord = mat('#1b1b1b');
    const c1 = mesh(box(.07, 1.2, .05), cord, bg, -.32, .55, 0); c1.rotation.z = -.5;
    const c2 = mesh(box(.07, 1.2, .05), cord, bg, .32, .55, 0); c2.rotation.z = .5;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .1, 32), [mat('#2b2f36'), new THREE.MeshStandardMaterial({ map: badgeTex('$0', '#ff3b3b'), roughness: .35 }), mat('#2b2f36')]);
    disc.rotation.x = Math.PI / 2; disc.position.z = .06; disc.castShadow = true; const dh = new THREE.Group(); dh.rotation.z = Math.PI / 2; dh.add(disc); bg.add(dh);
    badge = { group: bg, disc, value: null };
  }
  const ch = { root, body, trunk, torso, armL, armR, legL, legR, head, face, faceM, badge, o, lastFace: '', s: o.scale || 1 };
  root.scale.setScalar(ch.s);
  return ch;
}

function hair(head, o) {
  const hc = mat(o.hairColor || '#3a2616', .8);
  const h = o.hair || 'short';
  if (h === 'short' || h === 'spiky' || h === 'messy') {
    const g = new THREE.Group(); g.position.y = .66; head.add(g);
    const top = mesh(new THREE.SphereGeometry(.68, 20, 10, 0, Math.PI * 2, 0, Math.PI * .55), hc, g, 0, .28, -.03); top.scale.set(1, .75, 1.04);
    // fringe clumps
    for (let i = -2; i <= 2; i++) { const c = mesh(box(.32, .32, .3), hc, g, i * .22, .58 - Math.abs(i) * .04, .5); c.rotation.set(.4, 0, i * .2); }
    if (h === 'spiky' || h === 'messy') for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const c = mesh(box(.34, .4, .34), hc, g, Math.sin(a) * .5, .66, Math.cos(a) * .45 - .05); c.rotation.set(Math.cos(a) * .5, a, Math.sin(a) * .5); }
    mesh(box(1.3, .7, .4), hc, g, 0, .1, -.5); // back
  } else if (h === 'long' || h === 'bun' || h === 'pony') {
    const g = new THREE.Group(); g.position.y = .66; head.add(g);
    const top = mesh(new THREE.SphereGeometry(.7, 20, 10, 0, Math.PI * 2, 0, Math.PI * .55), hc, g, 0, .26, -.02); top.scale.set(1, .8, 1.05);
    for (let i = -2; i <= 2; i++) { const c = mesh(box(.3, .26, .26), hc, g, i * .22, .6, .52); c.rotation.z = i * .15; }
    if (h === 'long') { mesh(box(1.45, 1.7, .5), hc, g, 0, -.45, -.38); mesh(box(.32, 1.5, .5), hc, g, -.62, -.35, .1); mesh(box(.32, 1.5, .5), hc, g, .62, -.35, .1); }
    if (h === 'bun') mesh(new THREE.SphereGeometry(.34, 14, 10), hc, g, 0, .82, -.35);
    if (h === 'pony') { mesh(box(.4, 1.2, .4), hc, g, 0, -.2, -.75); }
  } else if (h === 'grey') {
    const g = new THREE.Group(); g.position.y = .66; head.add(g);
    mesh(box(.3, .6, .9), hc, g, -.62, .05, -.1); mesh(box(.3, .6, .9), hc, g, .62, .05, -.1); mesh(box(1.25, .6, .3), hc, g, 0, .05, -.55);
  }
  if (o.hat === 'top') {
    const hm = mat('#141414', .45);
    mesh(new THREE.CylinderGeometry(1.0, 1.0, .08, 28), hm, head, 0, 1.33, 0);
    mesh(new THREE.CylinderGeometry(.62, .66, 1.05, 28), hm, head, 0, 1.88, 0);
    mesh(new THREE.CylinderGeometry(.665, .665, .18, 28), mat('#d4a017', .3, { metalness: .8 }), head, 0, 1.46, 0);
  } else if (o.hat === 'cap') {
    const hm = mat(o.hatColor || '#e53935');
    const c = mesh(new THREE.SphereGeometry(.68, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, head, 0, 1.12, 0); c.scale.y = .7;
    mesh(box(1.0, .08, .7), hm, head, 0, 1.15, .7);
  } else if (o.hat === 'beanie') {
    const hm = mat(o.hatColor || '#ff6f91', .9);
    const c = mesh(new THREE.SphereGeometry(.7, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, head, 0, 1.08, 0); c.scale.y = .95;
    mesh(new THREE.CylinderGeometry(.71, .71, .24, 24), mat('#ffffff', .9), head, 0, 1.1, 0);
  }
}

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
export function setBadge(ch, value) {
  if (!ch.badge) return;
  const txt = typeof value === 'string' ? value : fmt(value);
  if (ch.badge.value === txt) return;
  ch.badge.value = txt;
  const col = txt === '$0' ? '#ff3b3b' : '#33e07a';
  ch.badge.disc.material[1] = new THREE.MeshStandardMaterial({ map: badgeTex(txt, col), roughness: .35, emissive: '#ffffff', emissiveMap: badgeTex(txt, col), emissiveIntensity: .25 });
}

export function setFace(ch, name, blink) {
  const k = name + blink;
  if (ch.lastFace === k) return;
  ch.lastFace = k; ch.faceM.map = faceTex(name, blink); ch.faceM.needsUpdate = true;
}

// body build: -1 skinny ... 0 normal ... 1 muscular (torso/arms/legs widen, shoulders move out; head unchanged)
export function setBuild(ch, b) {
  if (ch.build === b) return; ch.build = b;
  const tw = b < 0 ? 1 + .42 * b : 1 + .42 * b, td = b < 0 ? 1 + .25 * b : 1 + .3 * b, aw = b < 0 ? 1 + .5 * b : 1 + .55 * b, lw = b < 0 ? 1 + .35 * b : 1 + .22 * b;
  ch.trunk.scale.set(tw, 1, td);
  for (const [piv, side] of [[ch.armL, -1], [ch.armR, 1]]) { piv.position.x = side * (tw + aw * .5 + .02); for (const m of piv.children) m.scale.set(aw, 1, aw); }
  for (const [piv, side] of [[ch.legL, -1], [ch.legR, 1]]) { piv.position.x = side * (.49 * lw * Math.min(1.2, tw) + .02); for (const m of piv.children) m.scale.set(lw, 1, lw); }
}

// pose: {armL:[x,z], armR:[x,z], legL, legR (x rot), head:[yaw,pitch,roll], lean, bob, twist}
export function applyPose(ch, p) {
  const r = (a) => a || 0;
  ch.armL.rotation.set(-r(p.armL?.[0]), 0, r(p.armL?.[1]));
  ch.armR.rotation.set(-r(p.armR?.[0]), 0, r(p.armR?.[1]));
  ch.legL.rotation.set(-r(p.legL), 0, 0); ch.legR.rotation.set(-r(p.legR), 0, 0);
  ch.head.rotation.set(r(p.head?.[1]), r(p.head?.[0]), r(p.head?.[2]));
  ch.body.position.y = r(p.bob); ch.body.rotation.set(r(p.lean), r(p.twist), r(p.tilt));
}

// ---- pose library (t = seconds) ----
const sin = Math.sin;
export const POSES = {
  idle: (t) => ({ armL: [sin(t * 1.3) * .03, -.06], armR: [sin(t * 1.3 + 1) * .03, .06], head: [sin(t * .7) * .06, 0], bob: sin(t * 2) * .02 }),
  walk: (t, sp = 1) => { const ph = t * 7 * sp; return { armL: [sin(ph) * .7, -.05], armR: [-sin(ph) * .7, .05], legL: -sin(ph) * .7, legR: sin(ph) * .7, bob: Math.abs(sin(ph)) * .12, head: [0, 0] }; },
  run: (t) => { const ph = t * 12; return { armL: [sin(ph) * 1.1 - .2, -.1], armR: [-sin(ph) * 1.1 - .2, .1], legL: -sin(ph) * 1.0, legR: sin(ph) * 1.0, bob: Math.abs(sin(ph)) * .3, lean: .2 }; },
  armsUp: (t) => ({ armL: [Math.PI * .9 + sin(t * 9) * .08, -.35], armR: [Math.PI * .9 - sin(t * 9) * .08, .35], bob: Math.abs(sin(t * 9)) * .06 }),
  cheer: (t) => ({ armL: [Math.PI * .95, -.3 - Math.abs(sin(t * 8)) * .2], armR: [Math.PI * .95, .3 + Math.abs(sin(t * 8)) * .2], bob: Math.abs(sin(t * 8)) * .45, head: [0, -.15] }),
  point: (t) => ({ armR: [Math.PI / 2 + sin(t * 3) * .03, .05], armL: [0, -.05], head: [0, 0] }),
  pointUp: (t) => ({ armR: [Math.PI * .78, .1], armL: [0, -.05], head: [0, -.1] }),
  laughPoint: (t) => ({ armR: [Math.PI / 2 + sin(t * 14) * .08, .05], armL: [.6, .5], lean: -.05 + sin(t * 14) * .04, bob: Math.abs(sin(t * 14)) * .08, head: [0, -.12 + sin(t * 14) * .05] }),
  hold: (t) => ({ armL: [Math.PI / 2.3, .25], armR: [Math.PI / 2.3, -.25], head: [0, .15] }),
  holdOne: (t) => ({ armR: [Math.PI / 2.4, -.15], armL: [0, -.05], head: [0, .1] }),
  serve: (t) => ({ armL: [Math.PI / 2.2, .3], armR: [Math.PI / 2.2, -.3], head: [0, 0], bob: sin(t * 3) * .02 }),
  shrug: (t) => ({ armL: [.5, -.9], armR: [.5, .9], head: [0, 0, .12], tilt: .03 }),
  hug: (t) => ({ armL: [Math.PI / 2.4, .7], armR: [Math.PI / 2.4, -.7], lean: .12, head: [0, .2] }),
  sitSad: (t) => ({ armL: [.9, .3], armR: [.9, -.3], legL: Math.PI / 2, legR: Math.PI / 2, head: [0, .3], lean: .15 }),
  eat: (t) => ({ armR: [Math.PI * .62 + sin(t * 6) * .12, -.2], armL: [.2, -.1], head: [0, .05] }),
  talk: (t) => ({ armL: [.4 + sin(t * 4) * .15, -.2], armR: [.6 + sin(t * 4.6 + 1) * .2, .2], head: [sin(t * 2) * .08, 0], bob: sin(t * 4) * .02 }),
  speech: (t) => ({ armR: [Math.PI / 2.4, .05], armL: [.3, -.1], head: [0, 0] }),
  armsOut: (t) => ({ armL: [.2, -1.3], armR: [.2, 1.3], head: [0, -.05] }),
  facepalm: (t) => ({ armR: [Math.PI * .75, -.6], armL: [0, -.05], head: [0, .25] }),
  wave: (t) => ({ armR: [Math.PI * .85, .3 + sin(t * 10) * .35], armL: [0, -.05] }),
  sneak: (t) => { const ph = t * 4; return { armL: [.9 + Math.sin(ph) * .2, -.25], armR: [.9 - Math.sin(ph) * .2, .25], legL: -Math.sin(ph) * .35, legR: Math.sin(ph) * .35, lean: .32, bob: Math.abs(Math.sin(ph)) * .05, head: [Math.sin(t * 1.3) * .35, -.2] }; },
  crawl: (t) => { const ph = t * 6; return { armL: [Math.PI * .85 + Math.sin(ph) * .35, -.1], armR: [Math.PI * .85 - Math.sin(ph) * .35, .1], legL: Math.sin(ph) * .3, legR: -Math.sin(ph) * .3, head: [0, -.9] }; },
  dive: (t) => ({ armL: [Math.PI * .95, -.15], armR: [Math.PI * .95, .15], legL: -.25, legR: -.1, head: [0, -.6] }),
  carried: (t) => ({ armL: [.3 + Math.sin(t * 9) * .3, -.6], armR: [.3 - Math.sin(t * 9) * .3, .6], legL: Math.sin(t * 11) * .5, legR: -Math.sin(t * 11) * .5, head: [Math.sin(t * 5) * .3, 0] }),
  grab: (t) => ({ armL: [Math.PI / 2.1, .5], armR: [Math.PI / 2.1, -.5], lean: .05 }),
  lying: (t) => ({ armL: [.2, -1.1], armR: [.2, 1.1], legL: .1, legR: -.1, head: [Math.sin(t * 3) * .2, 0] }),
  peek: (t) => ({ armL: [.2, -.05], armR: [.9, -.2], lean: .05, head: [0, 0, .25] }),
  read: (t) => ({ armL: [Math.PI / 2.4, .32], armR: [Math.PI / 2.4, -.32], head: [0, .28], bob: Math.sin(t * 2) * .02 }),
  strike: (t) => ({ armL: [Math.PI / 2.6, .35], armR: [Math.PI / 2.2 + Math.sin(t * 6) * .25, -.3], head: [0, .25], lean: .05 }),
  stack: (t) => ({ armL: [Math.PI * .7 + Math.sin(t * 7) * .2, .3], armR: [Math.PI * .7 - Math.sin(t * 7) * .2, -.3], lean: .1 + Math.sin(t * 7) * .05 }),
  punch: (t) => { const ph = t * 11, a = Math.max(0, sin(ph)), b = Math.max(0, -sin(ph)); return { armR: [.9 + a * .75, -.15], armL: [.9 + b * .75, .15], twist: sin(ph) * .25, lean: .1, legL: .25, legR: -.2, head: [0, .05] }; },
  uppercut: (t) => ({ armR: [Math.PI * .95, -.12], armL: [.8, .2], lean: -.12, twist: -.3, legL: .3, bob: .25, head: [0, -.2] }),
  bigpunch: (t) => ({ armR: [Math.PI / 2, -.05], armL: [.3, .35], lean: .28, twist: -.45, legL: .6, legR: -.45, head: [0, .05] }),
  kick: (t) => ({ legR: 1.5, legL: -.15, armL: [.4, -.9], armR: [.4, .9], lean: -.2, head: [0, .1] }),
  flex: (t) => ({ armL: [.15, -2.5 + sin(t * 6) * .08], armR: [.15, 2.5 - sin(t * 6) * .08], head: [0, -.1], bob: Math.abs(sin(t * 6)) * .05 }),
  lift: (t) => ({ armL: [Math.PI * .96, -.12], armR: [Math.PI * .96, .12], legL: .12, legR: -.12, bob: sin(t * 30) * .03, head: [0, -.2] }),
  carry: (t) => ({ armL: [Math.PI / 2.05, .12], armR: [Math.PI / 2.05, -.12], head: [0, -.05], bob: Math.abs(sin(t * 7)) * .05 }),
  flail: (t) => ({ armL: [1.2 + sin(t * 23) * .9, -.4 + sin(t * 17) * .3], armR: [1.2 + sin(t * 21 + 1) * .9, .4 - sin(t * 19) * .3], legL: sin(t * 15) * .5, legR: -sin(t * 15) * .5, lean: .1 + sin(t * 9) * .1, head: [sin(t * 13) * .3, .1] }),
  pads: (t) => ({ armL: [Math.PI / 2.1, .25], armR: [Math.PI / 2.1, -.25], lean: -.06, bob: sin(t * 11) * .03 }),
  scared: (t) => ({ armL: [Math.PI * .55, .5], armR: [Math.PI * .55, -.5], lean: -.12, bob: sin(t * 40) * .02 }),
};

// dances shared with the instanced crowd (crowd.js DANCES -> rig pose format)
const conv = (p) => ({ armL: p.aL, armR: p.aR, legL: p.lL || 0, legR: p.lR || 0, bob: p.bob || 0, lean: p.lean || 0, twist: p.twist || 0, tilt: p.tilt || 0, head: [p.hy || 0, p.hp || 0, p.hr || 0] });
DANCES.forEach((d, i) => { POSES['dance' + i] = (t) => conv(d(t)); POSES['creepy' + i] = (t) => { const c = conv(d(Math.floor(t * 3) / 3 * .6)); c.head = [c.head[0], .15, .4]; c.bob *= .4; return c; }; });
// nervous half-hearted dance (the hero): small bounce, arms stiff
POSES.nervousDance = (t) => ({ armL: [.35 + Math.sin(t * 7) * .15, -.25], armR: [.35 - Math.sin(t * 7) * .15, .25], legL: Math.max(0, Math.sin(t * 7)) * .2, legR: Math.max(0, -Math.sin(t * 7)) * .2, bob: Math.abs(Math.sin(t * 7)) * .08, head: [Math.sin(t * 1.7) * .4, 0] });
// lying in bed, still dancing in their sleep (use with rx -90)
POSES.sleepDance = (t) => ({ armL: [Math.PI * .8 + Math.sin(t * 7) * .3, -.3], armR: [Math.PI * .8 - Math.sin(t * 7) * .3, .3], legL: Math.sin(t * 7) * .35, legR: -Math.sin(t * 7) * .35, head: [Math.sin(t * 3.5) * .25, 0] });
POSES.eatDance = (t) => { const b = Math.sin(t * 7); return { armR: [Math.PI * .62 + Math.sin(t * 5) * .15, -.2], armL: [.6 + b * .5, -.6], legL: Math.max(0, b) * .5, legR: Math.max(0, -b) * .5, bob: Math.abs(b) * .2, tilt: b * .1, head: [0, .05] }; };
POSES.trip = (t) => ({ armL: [Math.PI * .7, -.6], armR: [Math.PI * .6, .7], legL: -.6, legR: .9, lean: .55, head: [0, -.3] });
POSES.fallen = (t) => ({ armL: [Math.PI * .9, -.3], armR: [Math.PI * .9, .3], legL: 0, legR: .2, head: [0, -.4] });
POSES.reachUp = (t) => ({ armL: [Math.PI * .95 + Math.sin(t * 14) * .1, -.2], armR: [Math.PI * .95 - Math.sin(t * 14) * .1, .2], legL: Math.sin(t * 16) * .3, legR: -Math.sin(t * 16) * .3, head: [0, -.5] });
POSES.grabShoulder = (t) => ({ armR: [Math.PI / 2.05, -.45], armL: [Math.PI * .85 + Math.sin(t * 8) * .25, -.3], bob: Math.abs(Math.sin(t * 8)) * .15, legL: Math.max(0, Math.sin(t * 8)) * .4, head: [0, .05] });
POSES.whisper = (t) => ({ armR: [Math.PI * .62, -.55], armL: [.7 + Math.sin(t * 7) * .4, -.6], bob: Math.abs(Math.sin(t * 7)) * .12, lean: .12, head: [.3, .1] });
POSES.stand = (t) => ({ armL: [0, -.04], armR: [0, .04], head: [0, 0], bob: 0 });
POSES.lookHands = (t) => ({ armL: [Math.PI * .45, .45], armR: [Math.PI * .45, -.45], head: [0, .45], bob: Math.sin(t * 2) * .01 });
POSES.screamReach = (t) => ({ armL: [Math.PI * .55, .2], armR: [Math.PI * .55, -.2], lean: .25, head: [0, -.1], bob: Math.sin(t * 30) * .02 });
POSES.grabArm = (t) => ({ armR: [Math.PI / 2.1, -.5], armL: [.2, -.1], lean: .1, head: [.2, .05] });
POSES.giantRise = (t) => ({ armL: [Math.PI * .35 + Math.sin(t * 1.3) * .1, -.7], armR: [Math.PI * .35 - Math.sin(t * 1.3) * .1, .7], head: [Math.sin(t * .6) * .15, .25], lean: .1 });
POSES.giantSuck = (t) => ({ armL: [Math.PI * .7, -1.0], armR: [Math.PI * .7, 1.0], head: [0, -.25], lean: -.1, bob: Math.sin(t * 25) * .03 });
POSES.giantPoint = (t) => ({ armR: [Math.PI * .5, -.1], armL: [.4, -.5], lean: .25, head: [0, .2] });
