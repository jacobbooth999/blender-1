// Instanced crowd of blocky dancers (same proportions as rig.js characters: legs 0-2, torso 2-4, head 4-5.2).
// Hundreds of dancers cost a handful of draw calls. Each dancer: position, yaw, colours, dance style, phase, face.
//
// const C = makeCrowd(scene, max);  C.draw(list, t, opts) every frame (list from layout helpers below).
// opts: { mode: 'dance'|'freeze'|'stare'|'creepy'|'collapse'|'drain', look: [x,y,z], k: 0..1 (mode progress),
//         faces: 'happy'|'stare'|'scared', freezeAt: t }
// Modes can also be set per dancer with d.mode / d.k (overrides opts).
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { templateFaceTex } from './tex.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SHIRTS = ['#ff5a5f', '#ffb400', '#3ec1d3', '#7bd389', '#a66cff', '#ff7eb6', '#4d7cfe', '#ff8a3d', '#2ec4b6', '#f9f871', '#e84a5f', '#6a4c93', '#ffffff', '#1f2937'];
const PANTS = ['#2f3a56', '#3b2f2f', '#1f2937', '#4a5568', '#2d6a4f', '#5a189a', '#6b4f3a', '#22223b'];
const SKINS = ['#f2c9a0', '#e8b48a', '#c98f5f', '#8d5a3b', '#f7d7b5', '#a86b45'];
const HAIRS = ['#2a1a10', '#5a3a22', '#111111', '#e0b040', '#b5542a', '#dddddd', '#3a2616'];

// ---- dance styles: return pose {aL:[x,z], aR:[x,z], lL, lR, bob, lean, twist, tilt, hy, hp, hr} ----
export const DANCES = [
  (t) => { const b = sin(t * 7.5); return { aR: [PI * .85 + b * .25, .25], aL: [.5 - b * .3, -.4], lL: Math.max(0, b) * .5, lR: Math.max(0, -b) * .5, bob: Math.abs(b) * .25, tilt: b * .12, hy: b * .2 }; },          // disco point
  (t) => { const k = (sin(t * 8) + 1) / 2; return { aL: [.1, -.3 - k * 2.4], aR: [.1, .3 + k * 2.4], lL: 0, lR: 0, bob: k * .7, hp: -.1 }; },                                                                         // jumping jacks
  (t) => { const s = Math.floor(t * 4) % 4; const P = [[1.57, 0, 0, 0], [0, 1.57, 0, .3], [1.57, 1.57, .3, 0], [.6, 2.4, 0, .3]][s]; return { aL: [P[0], -.1], aR: [P[1], .1], lL: P[2], lR: P[3], hy: [.4, -.4, 0, .2][s], bob: 0 }; },   // robot
  (t) => { const b = sin(t * 6.5); const clap = Math.abs(sin(t * 13)); return { aL: [1.2, .2 + clap * .55], aR: [1.2, -.2 - clap * .55], lL: Math.max(0, b) * .6, lR: Math.max(0, -b) * .6, twist: b * .3, bob: Math.abs(b) * .18 }; }, // step clap
  (t) => ({ aL: [1.4 + sin(t * 17) * 1.1, -.5 + sin(t * 11) * .4], aR: [1.4 + sin(t * 15 + 1) * 1.1, .5 - sin(t * 13) * .4], lL: sin(t * 10) * .5, lR: -sin(t * 10) * .5, bob: Math.abs(sin(t * 10)) * .3, lean: sin(t * 7) * .12, hy: sin(t * 9) * .3 }), // flail party
  (t) => { const b = sin(t * 4.5); return { aL: [PI * .9, -.3 + b * .35], aR: [PI * .9, .3 + b * .35], tilt: b * .18, twist: -b * .15, bob: Math.abs(sin(t * 9)) * .12, lL: Math.max(0, -b) * .3, lR: Math.max(0, b) * .3, hr: b * .15 }; }, // hands up sway
];

function partGeo(w, h, d, pivotTop = false, r = .07) {
  const g = new RoundedBoxGeometry(w, h, d, 2, r); if (pivotTop) g.translate(0, -h / 2, 0); return g;
}

export function makeCrowd(scene, max = 420) {
  const std = (c) => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .55 });
  const mk = (geo) => { const m = new THREE.InstancedMesh(geo, std(), max); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.count = 0; scene.add(m); return m; };
  const torso = mk(partGeo(2, 2, 1)), head = mk(partGeo(1.12, 1.18, 1.12, false, .3)), hair = mk(partGeo(1.2, .42, 1.2, false, .12));
  const armL = mk(partGeo(1, 2, 1, true)), armR = mk(partGeo(1, 2, 1, true)), legL = mk(partGeo(.98, 2, 1, true)), legR = mk(partGeo(.98, 2, 1, true));
  // faces: one instanced plane per face design
  const FACE_SETS = { happy: [1, 3, 21, 18], stare: [19, 4, 23, 11], scared: [15, 2, 16, 22], creepy: [12, 13, 5, 10] };
  const faceIds = [...new Set(Object.values(FACE_SETS).flat())];
  const faceMeshes = {};
  for (const id of faceIds) {
    const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshStandardMaterial({ map: templateFaceTex(id), transparent: true, roughness: .45, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), max);
    m.frustumCulled = false; m.count = 0; m.renderOrder = 2; scene.add(m); faceMeshes[id] = m;
  }
  const parts = [torso, head, hair, armL, armR, legL, legR];
  const col = new THREE.Color(), M = new THREE.Matrix4(), R = new THREE.Matrix4(), tmp = new THREE.Matrix4();
  const q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  const local = (x, y, z, rx = 0, ry = 0, rz = 0, s = one) => { e.set(rx, ry, rz, 'YXZ'); q.setFromEuler(e); return tmp.compose(v.set(x, y, z), q, s); };
  const sc = new THREE.Vector3();
  let colored = -1;

  function pose(d, t, mode, k, look) {
    const tt = t * (d.speed || 1) + d.ph;
    let p = DANCES[d.style % DANCES.length](tt);
    if (mode === 'freeze') p = DANCES[d.style % DANCES.length](d.ph + (d.freezeAt ?? 0) * (d.speed || 1));
    if (mode === 'creepy') { const q8 = Math.floor(tt * 3) / 3; p = DANCES[d.style % DANCES.length](q8 * .6); p.hr = (p.hr || 0) + .45 * sin(d.ph * 3); p.hp = .15; p.bob = (p.bob || 0) * .4; }
    if (mode === 'stare' && look) {
      const base = mode === 'stare' ? DANCES[d.style % DANCES.length](d.ph + (d.freezeAt ?? 0) * (d.speed || 1)) : p;
      p = { ...base, aL: [base.aL[0] * (1 - k), base.aL[1] * (1 - k) - .06 * k], aR: [base.aR[0] * (1 - k), base.aR[1] * (1 - k) + .06 * k], lL: (base.lL || 0) * (1 - k), lR: (base.lR || 0) * (1 - k), bob: (base.bob || 0) * (1 - k), tilt: (base.tilt || 0) * (1 - k), twist: 0, lean: 0, hy: 0, hr: 0 };
    }
    if (mode === 'drain') { p = { aL: [.15, -.08], aR: [.15, .08], lL: 0, lR: 0, bob: -.2 * k, lean: .35 * k, hp: .5 * k, tilt: sin(tt * 30) * .04 * (1 - k) }; }
    if (mode === 'collapse') { p = { aL: [.3, -1.0], aR: [.3, 1.0], lL: .1, lR: -.1, bob: 0 }; }
    return p;
  }

  return {
    parts, faceMeshes, FACE_SETS,
    get visible() { return torso.visible; },
    hide() { for (const m of [...parts, ...Object.values(faceMeshes)]) m.count = 0; },
    // list: [{p:[x,y,z], ry (deg), style, ph, speed, shirt,pants,skin,hair, face (0..3), mode?, k?}]
    draw(list, t, opts = {}) {
      const n = Math.min(max, list.length);
      for (const m of [...parts, ...Object.values(faceMeshes)]) m.count = 0;
      const fcount = {};
      const lk = opts.look;
      // keep the lens clear: skip dancers near the camera or standing between it and what it looks at
      const cam = this.camera, look = this.lookAt;
      let dir = null, L = 0;
      if (cam && look) { dir = look.clone().sub(cam); L = dir.length(); dir.normalize(); }
      let w = 0;
      for (let i = 0; i < n; i++) {
        const d = list[i];
        if (dir) { const cx = d.p[0] - cam.x, cy = (d.p[1] || 0) + 3 - cam.y, cz = d.p[2] - cam.z; const al = cx * dir.x + cy * dir.y + cz * dir.z;
          const px = cx - dir.x * al, py = cy - dir.y * al, pz = cz - dir.z * al; const perp = Math.sqrt(px * px + py * py + pz * pz);
          if (Math.hypot(cx, cz) < 6.5 && Math.abs(cy) < 7) continue;
          if (al > 0 && al < L - 2.2 && perp < 2.8 + al * .05) continue; }
        this._draw1(d, i, w++, t, opts, lk, fcount);
      }
      for (const m of parts) { m.count = w; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      for (const [id, m] of Object.entries(faceMeshes)) { m.count = fcount[id] || 0; m.instanceMatrix.needsUpdate = true; }
    },
    _draw1(d, ci, i, t, opts, lk, fcount) {
      {
        torso.setColorAt(i, col.set(d.shirt)); armL.setColorAt(i, col.set(d.sleeve ? d.shirt : d.skin)); armR.setColorAt(i, col.set(d.sleeve ? d.shirt : d.skin));
        legL.setColorAt(i, col.set(d.pants)); legR.setColorAt(i, col.set(d.pants)); head.setColorAt(i, col.set(d.skin)); hair.setColorAt(i, col.set(d.hair));
        const mode = d.mode || opts.mode || 'dance', k = Math.max(0, Math.min(1, d.k ?? opts.k ?? 1));
        if (opts.freezeAt !== undefined && d.freezeAt === undefined) d.freezeAt = opts.freezeAt;
        const p = pose(d, t, mode, k, lk);
        let yaw = (d.ry || 0) * PI / 180;
        if (mode === 'stare' && lk) { const want = Math.atan2(lk[0] - d.p[0], lk[2] - d.p[2]); let dy = want - yaw; dy = Math.atan2(sin(dy), cos(dy)); yaw += dy * k; }
        const s = d.s || 1; sc.set(s, s, s);
        // root
        e.set(0, yaw, 0, 'YXZ'); q.setFromEuler(e); R.compose(v.set(d.p[0], d.p[1] || 0, d.p[2]), q, sc);
        if (mode === 'collapse') { const a = Math.min(1, k) * PI / 2 * .98; R.multiply(local(0, .5 * Math.min(1, k), 0, -a, 0, (hash(ci) - .5) * .4)); }
        R.multiply(local(0, p.bob || 0, 0, p.lean || 0, p.twist || 0, p.tilt || 0));
        M.copy(R).multiply(local(0, 3, 0)); torso.setMatrixAt(i, M);
        const hm = new THREE.Matrix4().copy(R).multiply(local(0, 4.0, 0, p.hp || 0, p.hy || 0, p.hr || 0));
        M.copy(hm).multiply(local(0, .6, 0)); head.setMatrixAt(i, M);
        M.copy(hm).multiply(local(0, 1.12, -.04)); hair.setMatrixAt(i, M);
        const fid = FACE_SETS[opts.faces || (mode === 'stare' ? 'stare' : mode === 'creepy' ? 'creepy' : (mode === 'drain' || mode === 'collapse') ? 'scared' : 'happy')][(d.face ?? ci) % 4];
        const fm = faceMeshes[fid]; const fi = fcount[fid] = (fcount[fid] || 0); fcount[fid]++;
        M.copy(hm).multiply(local(0, .6, .575)); fm.setMatrixAt(fi, M);
        M.copy(R).multiply(local(-1.5, 3.95, 0, -p.aL[0], 0, p.aL[1])); armL.setMatrixAt(i, M.multiply(local(0, .05, 0)));
        M.copy(R).multiply(local(1.5, 3.95, 0, -p.aR[0], 0, p.aR[1])); armR.setMatrixAt(i, M.multiply(local(0, .05, 0)));
        M.copy(R).multiply(local(-.5, 2, 0, -(p.lL || 0), 0, 0)); legL.setMatrixAt(i, M);
        M.copy(R).multiply(local(.5, 2, 0, -(p.lR || 0), 0, 0)); legR.setMatrixAt(i, M);
      }
    },
  };
}

// ---- layouts ----
export function dancer(i, p, ry = 0, extra = {}) {
  const h = (k) => hash(i * 13.7 + k);
  return { p, ry, style: Math.floor(h(1) * DANCES.length), ph: h(2) * 10, speed: .85 + h(3) * .35,
    shirt: SHIRTS[Math.floor(h(4) * SHIRTS.length)], pants: PANTS[Math.floor(h(5) * PANTS.length)], skin: SKINS[Math.floor(h(6) * SKINS.length)],
    hair: HAIRS[Math.floor(h(7) * HAIRS.length)], sleeve: h(8) > .5, face: Math.floor(h(9) * 4), ...extra };
}
// scatter dancers in a rectangle [x0,x1]x[z0,z1] (jittered grid), facing roughly ry
export function crowdRect(seed, x0, x1, z0, z1, n, ry = 0, y = 0, avoid = null) {
  const out = []; const cols = Math.ceil(Math.sqrt(n * (x1 - x0) / (z1 - z0))), rows = Math.ceil(n / cols);
  for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols && i < n; c++, i++) {
    const s = seed * 1000 + i;
    const x = x0 + (c + .5 + (hash(s) - .5) * .6) * (x1 - x0) / cols, z = z0 + (r + .5 + (hash(s + 1) - .5) * .6) * (z1 - z0) / rows;
    if (avoid && Math.hypot(x - avoid[0], z - avoid[1]) < avoid[2]) continue;
    out.push(dancer(s, [x, y, z], ry + (hash(s + 2) - .5) * 70));
  }
  return out;
}
// ring(s) of dancers around a centre, facing it
export function crowdRing(seed, c, r0, r1, n, y = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const s = seed * 1000 + i, a = hash(s) * PI * 2, r = r0 + Math.sqrt(hash(s + 1)) * (r1 - r0);
    const p = [c[0] + sin(a) * r, y, c[2] + cos(a) * r];
    out.push(dancer(s, p, (Math.atan2(c[0] - p[0], c[2] - p[2]) * 180 / PI) + (hash(s + 2) - .5) * 60));
  }
  return out;
}
