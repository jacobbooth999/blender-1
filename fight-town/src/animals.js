// Blocky cartoon animals for "Fight Town". makeAnimal(kind) -> { root, kind, p:{parts}, s }.
// animate(a, mode, t, k): mode 'idle' | 'attack' | 'hit' | 'ko' | 'walk' | 'roar'. Animals face +z (like characters).
import * as THREE from 'three';
import { mat } from './rig.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

const rb = (w, h, d, r = .12) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
function M(geo, mt, parent, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
const G = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

// cartoon eyes decal: 'calm' | 'angry' | 'shock' | 'dizzy' | 'sad'
const eyeCache = {};
export function eyesTex(kind = 'calm') {
  if (eyeCache[kind]) return eyeCache[kind];
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  for (const x of [64, 192]) {
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, 70, 44, kind === 'shock' ? 50 : 40, 0, 0, 7); g.fill();
    g.lineWidth = 6; g.strokeStyle = '#141414'; g.stroke();
    if (kind === 'dizzy') { g.lineWidth = 10; g.beginPath(); g.moveTo(x - 22, 48); g.lineTo(x + 22, 92); g.moveTo(x + 22, 48); g.lineTo(x - 22, 92); g.stroke(); }
    else { g.fillStyle = '#141414'; g.beginPath(); g.ellipse(x + (x < 128 ? 8 : -8), 74, kind === 'shock' ? 12 : 20, kind === 'shock' ? 12 : 24, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x + (x < 128 ? 2 : -14), 64, 7, 0, 7); g.fill(); }
    if (kind === 'angry') { g.fillStyle = '#141414'; g.save(); g.translate(x, 22); g.rotate(x < 128 ? .35 : -.35); g.fillRect(-46, -9, 92, 18); g.restore(); }
    if (kind === 'sad') { g.fillStyle = '#141414'; g.save(); g.translate(x, 22); g.rotate(x < 128 ? -.3 : .3); g.fillRect(-40, -7, 80, 14); g.restore(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; eyeCache[kind] = t; return t;
}
function eyes(parent, w, h, x, y, z, ry = 0) {
  const m = new THREE.MeshStandardMaterial({ map: eyesTex('calm'), transparent: true, roughness: .4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.renderOrder = 2; parent.add(p); return p;
}
export function setEyes(a, kind) { if (a.eyeKind === kind) return; a.eyeKind = kind; for (const e of a.p.eyes) { e.material.map = eyesTex(kind); e.material.needsUpdate = true; } }

export function makeAnimal(kind) {
  const root = new THREE.Group(), body = G(root), p = { body, eyes: [] }; const a = { root, kind, p, s: 1 };
  if (kind === 'chicken') {
    const w = mat('#fafafa', .7), o = mat('#ffa21f', .5), r = mat('#e8243c', .6);
    M(rb(1.3, 1.2, 1.6, .4), w, body, 0, 1.45, 0);
    M(rb(.6, .5, .6, .2), w, body, 0, 1.5, -.95);                         // tail
    p.head = G(body, 0, 2.1, .55); M(rb(.8, .85, .8, .3), w, p.head, 0, .3, 0);
    M(rb(.18, .35, .45, .06), r, p.head, 0, .85, -.05); M(rb(.32, .2, .3, .06), o, p.head, 0, .32, .52); M(rb(.14, .28, .1, .05), r, p.head, 0, .08, .45);
    p.eyes.push(eyes(p.head, .66, .33, 0, .5, .41));
    p.wingL = G(body, -.68, 1.75, 0); M(rb(.16, .8, 1.1, .08), w, p.wingL, 0, -.35, 0);
    p.wingR = G(body, .68, 1.75, 0); M(rb(.16, .8, 1.1, .08), w, p.wingR, 0, -.35, 0);
    p.legL = G(body, -.3, .9, 0); M(rb(.12, .9, .12, .04), o, p.legL, 0, -.45, 0); M(rb(.35, .08, .45, .03), o, p.legL, 0, -.88, .12);
    p.legR = G(body, .3, .9, 0); M(rb(.12, .9, .12, .04), o, p.legR, 0, -.45, 0); M(rb(.35, .08, .45, .03), o, p.legR, 0, -.88, .12);
  } else if (kind === 'goat') {
    const w = mat('#e9e4da', .8), d = mat('#8d8478', .7), h = mat('#cfc2a0', .5), pk = mat('#e8a0a8', .6);
    M(rb(1.5, 1.4, 2.8, .35), w, body, 0, 2.2, 0);
    p.legs = [];
    for (const [x, z] of [[-.5, .95], [.5, .95], [-.5, -.95], [.5, -.95]]) { const l = G(body, x, 1.6, z); M(rb(.34, 1.6, .34, .08), w, l, 0, -.8, 0); M(rb(.36, .25, .4, .06), d, l, 0, -1.5, .02); p.legs.push(l); }
    p.head = G(body, 0, 2.9, 1.45); M(rb(.85, .9, 1.1, .25), w, p.head, 0, .1, .2); M(rb(.6, .45, .5, .15), pk, p.head, 0, -.1, .7);
    for (const s of [-1, 1]) { const hn = M(new THREE.ConeGeometry(.13, .9, 8), h, p.head, s * .25, .8, -.05); hn.rotation.set(-.6, 0, s * .35);
      const ear = M(rb(.5, .18, .25, .06), w, p.head, s * .55, .35, 0); ear.rotation.z = s * -.4; }
    M(rb(.25, .5, .2, .06), mat('#d8d0c0', .8), p.head, 0, -.55, .55);       // beard
    p.eyes.push(eyes(p.head, .7, .35, 0, .3, .76));
    M(rb(.3, .5, .3, .1), w, body, 0, 2.9, -1.45);
  } else if (kind === 'croc') {
    const g1 = mat('#3f8f3a', .55), g2 = mat('#9bd15a', .6), wt = mat('#ffffff', .4);
    M(rb(2.2, 1.0, 4.4, .3), g1, body, 0, .75, 0);
    for (let i = 0; i < 7; i++) M(rb(.35, .2, .35, .06), g1, body, 0, 1.33, -1.8 + i * .6);
    p.tail = G(body, 0, .7, -2.2); M(rb(1.4, .7, 2.2, .2), g1, p.tail, 0, 0, -1.0); M(rb(.8, .45, 1.6, .15), g1, p.tail, 0, -.05, -2.7);
    p.head = G(body, 0, .8, 2.1);
    p.jawU = G(p.head, 0, .1, 0); M(rb(1.5, .5, 2.6, .2), g1, p.jawU, 0, .15, 1.2);
    p.jaw = G(p.head, 0, -.05, 0); M(rb(1.4, .35, 2.5, .15), g2, p.jaw, 0, -.15, 1.2);
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const t = M(new THREE.ConeGeometry(.08, .22, 5), wt, p.jawU, s * .6, -.15, .2 + i * .33); t.rotation.x = Math.PI; }
    for (const s of [-1, 1]) { const e = M(rb(.45, .4, .45, .18), g1, p.head, s * .45, .55, .1); }
    p.eyes.push(eyes(p.head, 1.1, .45, 0, .62, .34));
    p.legs = [];
    for (const [x, z] of [[-1.1, 1.3], [1.1, 1.3], [-1.1, -1.3], [1.1, -1.3]]) { const l = G(body, x, .5, z); M(rb(.5, .55, .7, .12), g1, l, x > 0 ? .1 : -.1, -.2, 0); p.legs.push(l); }
  } else if (kind === 'bear') {
    const b = mat('#7a4a2a', .85), lb = mat('#c59a6a', .8), k = mat('#1a1a1a', .3);
    p.hip = G(body, 0, 2.0, 0);                                             // rises up for 'roar'/'attack'
    M(rb(3.0, 2.8, 4.0, .7), b, p.hip, 0, 1.0, .6);
    p.head = G(p.hip, 0, 2.0, 2.8); M(rb(2.1, 1.9, 1.8, .6), b, p.head, 0, .2, 0); M(rb(1.0, .75, .8, .3), lb, p.head, 0, -.15, .95); M(rb(.4, .3, .2, .1), k, p.head, 0, .05, 1.38);
    for (const s of [-1, 1]) M(rb(.55, .55, .3, .25), b, p.head, s * .85, 1.2, -.1);
    p.eyes.push(eyes(p.head, 1.3, .55, 0, .55, .91));
    p.mouth = M(rb(.5, .12, .1, .04), k, p.head, 0, -.42, 1.36);
    p.armL = G(p.hip, -1.25, 1.2, 2.0); M(rb(1.0, 2.2, 1.0, .35), b, p.armL, 0, -1.1, 0);
    p.armR = G(p.hip, 1.25, 1.2, 2.0); M(rb(1.0, 2.2, 1.0, .35), b, p.armR, 0, -1.1, 0);
    p.legs = [];
    for (const x of [-1, 1]) { const l = G(body, x, 2.0, -.6); M(rb(1.0, 2.0, 1.1, .35), b, l, 0, -1.0, 0); p.legs.push(l); }
  } else if (kind === 'worm' || kind === 'buffworm') {
    const buff = kind === 'buffworm', pk = mat(buff ? '#ff7aa8' : '#ff9cbc', .5), r0 = buff ? .42 : .2;
    p.seg = [];
    for (let i = 0; i < 7; i++) { const s = M(new THREE.SphereGeometry(r0 * (1 - i * .06), 18, 12), pk, body, 0, r0, -i * r0 * 1.25); p.seg.push(s); }
    p.head = p.seg[0];
    p.eyes.push(eyes(p.head, r0 * 1.6, r0 * .8, 0, r0 * .3, r0 * .96));
    if (buff) {
      const hb = M(new THREE.CylinderGeometry(r0 * 1.02, r0 * 1.02, r0 * .35, 24, 1, true), mat('#e8243c', .6), p.head, 0, r0 * .62, 0); hb.material.side = THREE.DoubleSide;
      M(rb(.08, .35, .06, .02), mat('#e8243c', .6), p.head, .1, r0 * .4, -r0 * 1.0).rotation.z = .5;
      for (const s of [-1, 1]) { const arm = M(new THREE.SphereGeometry(r0 * .45, 12, 8), pk, p.seg[1], s * r0 * 1.05, 0, 0); arm.scale.set(1, .8, .8); }
    }
  } else if (kind === 'gorilla') {
    // built in story via makeChar (humanoid) — see CAST
  }
  return a;
}

const sin = Math.sin;
// k: 0..1 progress for one-shot modes
export function animate(a, mode, t, k = 0) {
  const p = a.p, b = p.body; b.position.set(0, 0, 0); b.rotation.set(0, 0, 0);
  if (a.kind === 'chicken') {
    const flap = mode === 'attack' || mode === 'hit' ? sin(t * 40) * .9 : sin(t * 6) * .1;
    p.wingL.rotation.z = -Math.abs(flap); p.wingR.rotation.z = Math.abs(flap);
    p.head.rotation.x = mode === 'idle' ? Math.max(0, sin(t * 5)) * .5 : 0;
    const w = mode === 'walk' || mode === 'attack' ? sin(t * 16) * .6 : 0; p.legL.rotation.x = w; p.legR.rotation.x = -w;
    if (mode === 'attack') b.position.set(0, Math.abs(sin(t * 16)) * .6, sin(t * 8) * .4);
    if (mode === 'hit') { b.position.z = -k * 1.5; b.rotation.x = -k * .5; }
    if (mode === 'ko') { b.rotation.z = Math.PI / 2; b.position.set(.6, -.3, 0); }
  } else if (a.kind === 'goat') {
    const w = mode === 'walk' || mode === 'attack' ? sin(t * 14) * .5 : 0; p.legs.forEach((l, i) => l.rotation.x = (i % 3 === 0 ? 1 : -1) * w);
    p.head.rotation.x = mode === 'attack' ? .5 + sin(t * 8) * .2 : sin(t * 2) * .05;
    if (mode === 'attack') b.position.z = Math.max(0, sin(t * 6)) * 1.2;
    if (mode === 'hit') { b.position.z = -k * 2; b.rotation.x = -k * .3; }
    if (mode === 'ko') { b.rotation.z = Math.PI / 2; b.position.set(1.6, -.6, 0); }
  } else if (a.kind === 'croc') {
    const open = mode === 'attack' ? Math.abs(sin(t * 7)) * .7 : mode === 'roar' ? .7 : .08 + Math.max(0, sin(t * 1.3)) * .1;
    p.jawU.rotation.x = -open * .7; p.jaw.rotation.x = open * .3;
    p.tail.rotation.y = sin(t * (mode === 'idle' ? 2 : 8)) * .35;
    if (mode === 'attack') b.position.z = Math.max(0, sin(t * 7)) * .8;
    if (mode === 'hit') { b.position.set(0, Math.sin(k * Math.PI) * 1.5, -k * 2); b.rotation.z = k * .8; }
    if (mode === 'ko') { b.rotation.z = Math.PI; b.position.set(0, 1.9, 0); }
  } else if (a.kind === 'bear') {
    const up = mode === 'roar' || mode === 'attack' ? 1 : 0;
    p.hip.rotation.x = -up * 1.0; p.hip.position.set(0, 2.0 + up * .6, up * -.6);
    p.armL.rotation.x = up ? -1.2 + (mode === 'attack' ? sin(t * 9) * .8 : 0) : 0; p.armR.rotation.x = up ? -1.2 - (mode === 'attack' ? sin(t * 9) * .8 : 0) : 0;
    p.head.rotation.x = up * .9;
    p.mouth.scale.y = mode === 'roar' ? 4 : 1;
    if (mode === 'hit') { b.position.z = -k * 2.5; b.rotation.x = -k * .25; }
    if (mode === 'ko') { b.rotation.z = Math.PI / 2; b.position.set(2.4, -.7, 0); }
  } else if (a.kind === 'worm' || a.kind === 'buffworm') {
    const r0 = a.kind === 'buffworm' ? .42 : .2;
    p.seg.forEach((s, i) => {
      let y = r0 * (1 - i * .06), z = -i * r0 * 1.25, x = sin(t * 5 - i * .9) * r0 * .5;
      if (mode === 'attack' || mode === 'roar') { const rise = Math.max(0, 3 - i) / 3; y += rise * r0 * 4; z += rise * r0 * 1.2; x += rise * sin(t * 18) * r0 * 2.2; }
      if (mode === 'hit') { y += k * r0 * 3 * Math.max(0, 1 - i / 6); }
      s.position.set(x, y, z);
    });
    if (mode === 'ko') { b.rotation.z = 0; p.seg.forEach((s, i) => s.position.set(sin(i * 1.3) * r0 * .7, r0 * .8, -i * r0 * 1.1)); }
  }
}
