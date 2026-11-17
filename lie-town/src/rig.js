// Blocky Roblox-style characters: cube torso, box limbs (pivot at shoulder/hip), cylinder head with a face decal,
// chunky hair/hats, and a money badge on a cord. Height ~5.3 units (feet at y=0).
import * as THREE from 'three';
import { faceTex, badgeTex } from './tex.js';

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

export function makeChar(o) {
  const skin = o.skin || '#f2c9a0', shirt = o.shirt || '#4caf50', pants = o.pants || '#2f5fa8';
  const root = new THREE.Group(); root.name = o.name || 'char';
  const body = new THREE.Group(); root.add(body);             // bob / lean
  const torso = mesh(box(2, 2, 1), mat(shirt), body, 0, 3, 0);
  if (o.plaid) torso.material = mat(shirt, .7);
  // lower torso band in pants colour (belt line)
  mesh(box(2.01, .25, 1.01), mat(pants), body, 0, 2.12, 0);
  if (o.tie) { mesh(box(.32, 1.3, .06), mat(o.tie, .4), body, 0, 3.25, .52); mesh(box(.9, .5, .05), mat('#f4f4f4'), body, 0, 3.78, .51); }
  if (o.jacketOpen) { mesh(box(.5, 1.95, .04), mat('#f4f4f4'), body, 0, 3.0, .505); mesh(box(.32, 1.3, .06), mat(o.jacketOpen, .4), body, 0, 3.25, .53); }
  if (o.patch) mesh(box(.55, .5, .04), mat(o.patch, .8), body, -.55, 2.6, .51);
  if (o.stripe) mesh(box(2.02, .3, 1.02), mat(o.stripe), body, 0, 3.2, 0);
  if (o.zip) mesh(box(.08, 1.8, .04), mat('#eee'), body, 0, 3.0, .51);
  if (o.chain) { const ch = mesh(new THREE.TorusGeometry(.55, .06, 6, 20, Math.PI), mat('#ffcc33', .25, { metalness: .9 }), body, 0, 3.5, .53); ch.rotation.z = Math.PI; }
  if (o.apron) mesh(box(1.6, 1.6, .05), mat(o.apron), body, 0, 2.6, .52);

  const limb = (x, y, colTop, colBot, topFrac) => {
    const piv = new THREE.Group(); piv.position.set(x, y, 0); body.add(piv);
    const tl = 2 * topFrac;
    mesh(box(.98, tl, .98), mat(colTop), piv, 0, -tl / 2 + .05, 0);
    if (topFrac < 1) mesh(box(.96, 2 - tl, .96), mat(colBot), piv, 0, -tl - (2 - tl) / 2 + .05, 0);
    return piv;
  };
  const sleeve = o.longSleeve ? 1 : o.sleeve ?? .4;
  const armL = limb(-1.5, 3.95, shirt, skin, sleeve), armR = limb(1.5, 3.95, shirt, skin, sleeve);
  const legL = limb(-.5, 2.05, pants, o.shoes || pants, o.shoes ? .82 : 1), legR = limb(.5, 2.05, pants, o.shoes || pants, o.shoes ? .82 : 1);

  const head = new THREE.Group(); head.position.set(0, 4.0, 0); body.add(head);
  const hm = mat(skin, .5);
  const skull = mesh(new THREE.CylinderGeometry(.62, .62, 1.18, 28), hm, head, 0, .66, 0);
  // rounded top/bottom caps
  const cap = new THREE.SphereGeometry(.62, 28, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const c1 = mesh(cap, hm, head, 0, 1.25, 0); c1.scale.y = .28;
  const c2 = mesh(cap, hm, head, 0, .07, 0); c2.scale.y = -.28;
  mesh(box(.55, .2, .55), hm, head, 0, 0, 0); // neck
  const faceM = new THREE.MeshStandardMaterial({ map: faceTex('neutral'), transparent: true, roughness: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = new THREE.Mesh(new THREE.CylinderGeometry(.626, .626, 1.18, 28, 1, true, -Math.PI * .36, Math.PI * .72), faceM);
  face.position.y = .66; face.renderOrder = 2; head.add(face);
  // face UVs: cylinder open segment maps u 0..1 across arc -> good
  hair(head, o);

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
  const ch = { root, body, torso, armL, armR, legL, legR, head, face, faceM, badge, o, lastFace: '', s: o.scale || 1 };
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
  scared: (t) => ({ armL: [Math.PI * .55, .5], armR: [Math.PI * .55, -.5], lean: -.12, bob: sin(t * 40) * .02 }),
};
