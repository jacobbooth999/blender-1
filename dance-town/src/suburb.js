// Suburban neighbourhood set in the "clean pastel low-poly town" style (see style-guides/suburb-neighbourhood.md):
// navy asphalt with a yellow dashed centre line, pale kerbs + sidewalks, lumpy bright-green trees, black curved
// street lamps, two-storey pastel houses (white trim, recessed deep-blue windows, pitched roofs), lawns, picket
// fences, driveways, mailboxes; a white school with a clock tower + gold dome closing the street; green hills.
//
// buildSuburb(scene, opts) -> { group, lamps, houses, landmark, road }
// The street runs along -z from z = +40 to the landmark plaza at z = END. Road centre x = 0.
// Static geometry is merged per material, so the whole neighbourhood is a few dozen draw calls.
import * as THREE from 'three';
import { mergeGeometries } from '../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const ROAD_W = 11, KERB = .22, VERGE = 2.2, WALK = 2.6;          // road half-width = ROAD_W / 2
export const LOT = 22, END = -330, START = 40;
const SIDE0 = ROAD_W / 2;                       // kerb line
const WALK0 = SIDE0 + .35 + VERGE, WALK1 = WALK0 + WALK;   // sidewalk band
const FRONT = WALK1 + 6;                         // house facade line (front lawn depth 6)

// ---------- palette (pale pastels, white trim, deep-blue glass) ----------
const WALLS = ['#d8d2f4', '#cdeedd', '#f6efc4', '#d6e6fb', '#f7d9de', '#e4f2c9', '#fbe2c8', '#cfe9ef'];
const ROOFS = ['#5d6c8f', '#c9675c', '#4f8a8b', '#7a6aa8', '#8a6a5a', '#5d7fbf'];
const SHUTTERS = ['#4a78c9', '#3e9a7a', '#d0575f', '#7c62c6', '#e0a13a'];
const TRIM = '#ffffff';

// ---------- textures ----------
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const noise = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(0,0,0,${((i * .618) % 1) * a})`; g.fillRect((i * 37) % w, (i * 101) % h, 2, 2); } };
// road: 1 texture unit = the road width x 24 m of length
const roadTex = () => canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = '#29335a'; g.fillRect(0, 0, w, h); noise(g, w, h, 1400, .12);
  g.fillStyle = '#f4f4f0'; g.fillRect(10, 0, 5, h); g.fillRect(w - 15, 0, 5, h);       // edge lines
  g.fillStyle = '#f2d23a'; g.fillRect(w / 2 - 4, 40, 8, 190); g.fillRect(w / 2 - 4, 296, 8, 190);   // dashed centre
});
const walkTex = () => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#e9ebf1'; g.fillRect(0, 0, w, h); noise(g, w, h, 300, .05);
  g.fillStyle = '#cfd3de'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 2, h);
});
const sidingTex = () => canvasTex(64, 256, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 18) { g.fillStyle = 'rgba(40,50,90,.10)'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,255,255,1)'; g.fillRect(0, y + 2, w, 1); }
});
const shingleTex = () => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) { g.fillStyle = 'rgba(0,0,0,.13)'; g.fillRect(0, r * 16 + 14, w, 2); for (let k = 0; k < 5; k++) g.fillRect(((k * 32) + (r % 2) * 16) % w, r * 16, 2, 16); }
});
const glassTex = () => canvasTex(128, 160, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a8df0'); gr.addColorStop(1, '#2b4fb8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.moveTo(w * .15, h); g.lineTo(w * .45, h); g.lineTo(w * .95, 0); g.lineTo(w * .65, 0); g.fill();
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(w * .55, h); g.lineTo(w * .65, h); g.lineTo(w * 1.1, 0); g.lineTo(w, 0); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, h / 2 - 4, w, 8);          // white muntins
});
const garageTex = () => canvasTex(128, 96, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  for (let r = 1; r < 4; r++) { g.fillStyle = 'rgba(40,50,90,.18)'; g.fillRect(0, r * 24 - 1, w, 2); }
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { g.strokeStyle = 'rgba(40,50,90,.12)'; g.lineWidth = 2; g.strokeRect(k * 32 + 4, r * 24 + 4, 24, 16); }
});
const grassTex = () => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(30,90,10,${((i * .37) % 1) * .035})`; g.fillRect((i * 53) % w, (i * 29) % h, 2, 2); }
});
const clockTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, w / 2, 120, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a2f45'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = '#2a2f45'; g.fillRect(w / 2 + Math.cos(a) * 98 - 5, w / 2 + Math.sin(a) * 98 - 5, 10, 10); }
  g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(w / 2, w / 2); g.lineTo(w / 2, w / 2 - 70); g.stroke();
  g.lineWidth = 9; g.beginPath(); g.moveTo(w / 2, w / 2); g.lineTo(w / 2 + 55, w / 2 + 20); g.stroke();
});
const signTex = (txt) => canvasTex(512, 96, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2f45'; g.font = '800 40px Montserrat, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 3);
});

// ---------- merged-geometry builder ----------
class Kit {
  constructor() { this.bins = new Map(); this.mats = new Map(); }
  mat(key, make) { if (!this.mats.has(key)) this.mats.set(key, make()); return this.mats.get(key); }
  col(c, rough = .78, extra = {}) { return this.mat(c + rough + JSON.stringify(Object.keys(extra)), () => new THREE.MeshStandardMaterial({ color: c, roughness: rough, ...extra })); }
  add(geo, material, m4, { cast = true } = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m4);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const key = material.uuid + (cast ? 'c' : 'n');
    if (!this.bins.has(key)) this.bins.set(key, { material, cast, geos: [] });
    this.bins.get(key).geos.push(g);
  }
  flush(parent) {
    for (const { material, cast, geos } of this.bins.values()) {
      for (let i = 0; i < geos.length; i += 4000) {
        const mesh = new THREE.Mesh(mergeGeometries(geos.slice(i, i + 4000)), material);
        mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh);
      }
    }
    this.bins.clear();
  }
}
// transform stack helper: T(x,y,z, ry, sx,sy,sz) relative to a parent matrix
const M = (x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, s = [1, 1, 1]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(...s));
const BOX = new THREE.BoxGeometry(1, 1, 1);
const SPH = new THREE.IcosahedronGeometry(1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 12);
const RBOX = new RoundedBoxGeometry(1, 1, 1, 3, .12);
const box = (K, mt, P, x, y, z, w, h, d, o = {}) => K.add(BOX, mt, P.clone().multiply(M(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0, [w, h, d])), o);
// a box whose UVs repeat with size (for siding/shingle/sidewalk textures)
function tbox(K, mt, P, x, y, z, w, h, d, o = {}, scale = 1) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv, n = g.attributes.normal, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const [u, v] = ax > .5 ? [p.getZ(i), p.getY(i)] : ay > .5 ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)];
    uv.setXY(i, u / scale, v / scale);
  }
  K.add(g, mt, P.clone().multiply(M(x, y, z, o.ry || 0, o.rx || 0, o.rz || 0)), o);
}

// ---------- pieces ----------
function treeAt(K, P, x, z, s = 1, seed = 0) {
  const T = P.clone().multiply(M(x, 0, z, seed * 2.1, 0, 0, [s, s, s]));
  K.add(CYL, K.col('#7b4f2e', .9), T.clone().multiply(M(0, 1.6, 0, 0, 0, 0, [.22, 3.2, .22])));
  const lm = K.col('#4fb33b', .85, { flatShading: true }), lt = K.col('#6cc94a', .85, { flatShading: true });
  const blobs = [[0, 4.4, 0, 1.9], [1.2, 3.9, .3, 1.35], [-1.15, 4.0, -.2, 1.4], [.3, 4.0, 1.1, 1.3], [-.2, 3.9, -1.1, 1.3], [.1, 5.5, .1, 1.3]];
  blobs.forEach(([bx, by, bz, r], i) => K.add(SPH, i === 5 ? lt : lm, T.clone().multiply(M(bx, by, bz, i, 0, 0, [r, r * .92, r]))));
}
function lampAt(K, P, x, z, facing) {   // facing: +1 arm towards +x, -1 towards -x
  const blk = K.col('#24262e', .45);
  const T = P.clone().multiply(M(x, 0, z, facing > 0 ? 0 : Math.PI));
  K.add(CYL, blk, T.clone().multiply(M(0, .25, 0, 0, 0, 0, [.28, .5, .28])));
  K.add(CYL, blk, T.clone().multiply(M(0, 3.6, 0, 0, 0, 0, [.11, 7.2, .11])));
  const arc = new THREE.TorusGeometry(.9, .09, 6, 10, Math.PI / 2);
  K.add(arc, blk, T.clone().multiply(M(.9, 7.2, 0, 0, 0, Math.PI / 2)));
  K.add(BOX, blk, T.clone().multiply(M(1.5, 8.08, 0, 0, 0, -.06, [1.4, .22, .5])));
  K.add(BOX, K.mat('bulb', () => new THREE.MeshStandardMaterial({ color: '#fff7d6', emissive: '#ffe8a0', emissiveIntensity: .35 })), T.clone().multiply(M(1.6, 7.95, 0, 0, 0, -.06, [.9, .06, .36])), { cast: false });
}
function fence(K, P, x0, z0, x1, z1) {   // white picket run from (x0,z0) to (x1,z1)
  const w = K.col(TRIM, .6), len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.floor(len / .42);
  const T = P.clone().multiply(M(x0, 0, z0, ry));
  box(K, w, T, 0, .45, len / 2, .08, .1, len); box(K, w, T, 0, .85, len / 2, .08, .1, len);
  for (let i = 0; i <= n; i++) { box(K, w, T, 0, .58, i * len / n, .1, 1.16, .16); box(K, w, T, 0, 1.2, i * len / n, .07, .1, .1, { rx: .78 }); }
}
function windowAt(K, P, x, y, z, w = 1.6, h = 1.9, shutter = null) {   // on a facade facing +z at depth z
  const tr = K.col(TRIM, .5);
  box(K, tr, P, x, y, z + .06, w + .34, h + .34, .2);                         // frame
  box(K, K.mat('glass', () => new THREE.MeshStandardMaterial({ map: glassTex(), roughness: .15, metalness: .1, emissive: '#1a3a8a', emissiveIntensity: .15 })), P, x, y, z + .18, w, h, .04, { cast: false });
  box(K, tr, P, x, y - h / 2 - .22, z + .22, w + .6, .14, .42);              // sill
  box(K, tr, P, x, y + h / 2 + .24, z + .15, w + .5, .16, .28);              // head
  if (shutter) for (const s of [-1, 1]) box(K, K.col(shutter, .6), P, x + s * (w / 2 + .5), y, z + .1, .55, h + .2, .12);
}

function house(K, P, i, opts = {}) {
  // local frame: facade faces +z, centred at origin, ground at y = 0
  const wall = WALLS[i % WALLS.length], roof = ROOFS[(i * 5 + 1) % ROOFS.length], sh = i % 3 === 0 ? null : SHUTTERS[(i * 3) % SHUTTERS.length];
  const ranch = i % 7 === 3, gL = i % 2 === 0;           // single-storey variant; garage left/right
  const w = ranch ? 13 : 11, h = ranch ? 3.9 : 6.9, d = 9.5, rh = ranch ? 2.6 : 3.6;
  const wallM = K.mat('wall' + wall, () => new THREE.MeshStandardMaterial({ color: wall, roughness: .85, map: sidingTex() }));
  const roofM = K.mat('roof' + roof, () => new THREE.MeshStandardMaterial({ color: roof, roughness: .8, map: shingleTex() }));
  const tr = K.col(TRIM, .5);
  box(K, K.col('#c9ccd6', .9), P, 0, .2, 0, w + .3, .4, d + .3);              // foundation
  tbox(K, wallM, P, 0, .4 + h / 2, 0, w, h, d, {}, 7);
  // gable triangles (sides) + roof slopes (ridge along x)
  const tri = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, rh)]);
  const gab = new THREE.ExtrudeGeometry(tri, { depth: w - .02, bevelEnabled: false });
  K.add(gab, wallM, P.clone().multiply(M(-w / 2 + .01, .4 + h, 0, Math.PI / 2)).multiply(M(0, 0, 0)));
  const ang = Math.atan2(rh, d / 2), sl = Math.hypot(rh, d / 2) + .9;
  for (const s of [-1, 1]) {
    const T = P.clone().multiply(M(0, .4 + h + rh / 2 + .1, s * d / 4 + s * .25, 0, s * ang));
    tbox(K, roofM, T, 0, 0, 0, w + 1.3, .3, sl, {}, 2.5);
    box(K, tr, T, 0, -.12, s * sl / 2, w + 1.35, .3, .12);                    // fascia
  }
  box(K, tr, P, 0, .4 + h + rh + .14, 0, w + 1.35, .22, .45);                 // ridge cap
  // trim: corner boards + floor band
  for (const s of [-1, 1]) box(K, tr, P, s * (w / 2 + .02), .4 + h / 2, d / 2 + .02, .35, h, .2);
  if (!ranch) box(K, tr, P, 0, .4 + h / 2, d / 2 + .06, w, .25, .14);
  // chimney
  if (i % 3 !== 1) { box(K, K.col('#b8705a', .9), P, (gL ? 1 : -1) * w * .3, .4 + h + rh * .7, -d * .15, 1.1, rh * 1.3, 1.1); box(K, K.col('#e9e9ee', .6), P, (gL ? 1 : -1) * w * .3, .4 + h + rh * 1.35 + .1, -d * .15, 1.4, .25, 1.4); }
  // front door + porch
  const dx = gL ? w * .2 : -w * .2;
  box(K, K.col(SHUTTERS[(i + 2) % SHUTTERS.length], .5), P, dx, .4 + 1.35, d / 2 + .08, 1.3, 2.7, .12);
  box(K, tr, P, dx, .4 + 1.4, d / 2 + .04, 1.75, 3, .1);
  box(K, K.col('#f4c64a', .3, { metalness: .6 }), P, dx + .42, .4 + 1.3, d / 2 + .18, .12, .12, .14);
  box(K, K.col('#d9dbe3', .9), P, dx, .2, d / 2 + 1.1, 3.6, .4, 2.2);         // porch slab
  box(K, K.col('#d9dbe3', .9), P, dx, .1, d / 2 + 2.5, 2.4, .2, .8);          // step
  box(K, roofM, P, dx, .4 + 3.25, d / 2 + 1.15, 4.2, .22, 2.6, { rx: -.18 });  // porch roof
  for (const s of [-1, 1]) box(K, tr, P, dx + s * 1.6, .4 + 1.6, d / 2 + 2.0, .24, 3.2, .24);
  // windows
  const wy0 = .4 + 1.95, wy1 = .4 + h - 1.6;
  windowAt(K, P, -dx * .95, wy0, d / 2, 2.4, 1.8, sh);
  if (!ranch) { windowAt(K, P, -w * .3, wy1, d / 2, 1.5, 1.7, sh); windowAt(K, P, w * .3, wy1, d / 2, 1.5, 1.7, sh); windowAt(K, P, 0, wy1, d / 2, 1.1, 1.5); }
  else windowAt(K, P, dx * .2 + (gL ? -1.4 : 1.4), wy0, d / 2, 1.3, 1.6, sh);
  for (const s of [-1, 1]) windowAt(K, P.clone().multiply(M(s * w / 2, 0, 0, s * Math.PI / 2)), 0, wy0, 0, 1.4, 1.7);
  // hedge under the big window + bushes
  box(K, K.col('#3f9a3a', .9), P, -dx * .95, .9, d / 2 + .9, 3.6, 1, 1.1);
  for (const s of [-1, 1]) K.add(SPH, K.col('#47a83c', .85, { flatShading: true }), P.clone().multiply(M(dx + s * 2.4, .6, d / 2 + 1.2, s, 0, 0, [.75, .65, .75])));
  // attached garage
  const gx = (gL ? -1 : 1) * (w / 2 + 3.6), gw = 7.2, gh = 3.6;
  box(K, K.col('#c9ccd6', .9), P, gx, .2, .6, gw + .3, .4, d - .9);
  tbox(K, wallM, P, gx, .4 + gh / 2, .6, gw, gh, d - 1.2, {}, 7);
  box(K, K.mat('garage', () => new THREE.MeshStandardMaterial({ map: garageTex(), roughness: .6 })), P, gx, .4 + 1.35, .6 + (d - 1.2) / 2 + .06, gw - 1.4, 2.7, .1);
  box(K, tr, P, gx, .4 + 1.4, .6 + (d - 1.2) / 2 + .03, gw - .9, 3.0, .08);
  box(K, roofM, P, gx, .4 + gh + .25, .9, gw + .8, .5, d - .2);                 // flat-ish garage roof
  box(K, tr, P, gx, .4 + gh + .02, .6 + (d - 1.2) / 2 + .35, gw + .85, .25, .1);
  return { door: [dx, d / 2 + 2.6], garage: [gx, d / 2 + .1], w, d, gw, ranch };
}

function car(K, P, color, x, z, ry = 0) {
  const T = P.clone().multiply(M(x, 0, z, ry));
  const body = K.col(color, .35, { metalness: .15 }), dark = K.col('#1f2a4f', .2), blk = K.col('#1b1c22', .7);
  K.add(RBOX, body, T.clone().multiply(M(0, .95, 0, 0, 0, 0, [2.1, .95, 4.4])));
  K.add(RBOX, body, T.clone().multiply(M(0, 1.75, -.25, 0, 0, 0, [1.85, .8, 2.4])));
  K.add(BOX, dark, T.clone().multiply(M(0, 1.78, -.25, 0, 0, 0, [1.9, .55, 2.2])));
  for (const sx of [-1, 1]) for (const sz of [-1.35, 1.35]) K.add(CYL, blk, T.clone().multiply(M(sx * .95, .42, sz, 0, 0, Math.PI / 2, [.42, .3, .42])));
  for (const sx of [-.7, .7]) { box(K, K.col('#ff3b3b', .3), T, sx, 1.1, -2.2, .45, .2, .06); box(K, K.col('#fff6c8', .3), T, sx, 1.1, 2.2, .45, .2, .06); }
}

function mailbox(K, P, x, z, color) {
  box(K, K.col('#ffffff', .6), P, x, .55, z, .14, 1.1, .14);
  K.add(RBOX, K.col(color, .5), P.clone().multiply(M(x, 1.25, z, 0, 0, 0, [.5, .45, .8])));
  box(K, K.col('#e53b3b', .5), P, x + .28, 1.45, z - .1, .05, .35, .08);
}

function school(K, P, opts = {}) {
  // white civic building with columns, gold dome on a clock tower, flag; faces +z
  const wh = K.col('#e9ecf6', .75), tr = K.col('#c9cfe0', .7), gold = K.col('#e8b923', .25, { metalness: .75 }), roofC = K.col('#5d7fbf', .7);
  box(K, tr, P, 0, .5, 0, 44, 1, 20);
  for (let s = 0; s < 3; s++) box(K, tr, P, 0, .2 + s * .3, 11 + (2 - s) * .8, 16, .4 + s * .3 * 0, 1.6);   // steps
  box(K, wh, P, 0, 6, -1, 40, 10, 16);
  for (const s of [-1, 1]) box(K, wh, P, s * 16, 7.5, 1, 9, 13, 12);                 // end wings
  box(K, tr, P, 0, 11.2, -1, 41, .5, 17); for (const s of [-1, 1]) box(K, tr, P, s * 16, 14.2, 1, 9.6, .5, 12.6);
  // portico + pediment
  box(K, wh, P, 0, 1.2, 9, 14, .4, 5); for (let k = 0; k < 6; k++) K.add(CYL, wh, P.clone().multiply(M(-5.5 + k * 2.2, 5.6, 10.6, 0, 0, 0, [.42, 8.6, .42])));
  box(K, wh, P, 0, 10.2, 9.2, 15, 1.2, 5.6);
  const ped = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-7.6, 0), new THREE.Vector2(7.6, 0), new THREE.Vector2(0, 3)]), { depth: 5.6, bevelEnabled: false });
  K.add(ped, wh, P.clone().multiply(M(0, 10.8, 6.4)));
  box(K, K.mat('sign', () => new THREE.MeshBasicMaterial({ map: signTex(opts.sign || 'TOWN HALL'), toneMapped: false })), P, 0, 10.2, 12.05, 11, 1.0, .05, { cast: false });
  // windows on the main block + wings
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { windowAt(K, P, s * (9 + k * 0), 4, 7, 2.2, 3); }
  for (const s of [-1, 1]) for (const y of [4, 9.5]) windowAt(K, P, s * 16, y, 7, 2.6, 3);
  for (const s of [-1, 1]) windowAt(K, P, s * 10.5, 9, 7, 2, 2.2);
  // clock tower + dome
  box(K, wh, P, 0, 14, -2, 8, 6, 8); box(K, tr, P, 0, 17.2, -2, 8.8, .5, 8.8);
  box(K, K.mat('clock', () => new THREE.MeshBasicMaterial({ map: clockTex(), transparent: true, toneMapped: false })), P, 0, 14.4, 2.06, 4, 4, .05, { cast: false });
  K.add(CYL, wh, P.clone().multiply(M(0, 18.6, -2, 0, 0, 0, [3.4, 2.6, 3.4])));
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; K.add(CYL, tr, P.clone().multiply(M(Math.cos(a) * 3.45, 18.6, -2 + Math.sin(a) * 3.45, 0, 0, 0, [.18, 2.6, .18]))); }
  const dome = new THREE.SphereGeometry(3.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  K.add(dome, gold, P.clone().multiply(M(0, 19.9, -2)));
  K.add(SPH, gold, P.clone().multiply(M(0, 23.8, -2, 0, 0, 0, [.5, .5, .5])));
  box(K, K.col('#dfe2ea', .4, { metalness: .4 }), P, 0, 26.2, -2, .12, 5, .12);
  box(K, K.col('#4a78c9', .6), P, .85, 27.7, -2, 1.6, 1.0, .05, { cast: false });
  K.add(SPH, gold, P.clone().multiply(M(.85, 27.7, -1.95, 0, 0, 0, [.22, .22, .02])));
}

function hills(K, P) {
  const g1 = K.col('#5cc444', 1), g2 = K.col('#6fd24f', 1);
  [[-160, -620, 150, 46], [20, -700, 190, 60], [210, -610, 160, 50], [-330, -520, 140, 40], [360, -520, 150, 42], [-60, -560, 110, 30], [130, -560, 120, 34]]
    .forEach(([x, z, r, h], i) => K.add(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? g1 : g2, P.clone().multiply(M(x, -2, z, 0, 0, 0, [r, h, r * .55])), { cast: false }));
  // a few clumps of distant trees on the hills
  for (let k = 0; k < 40; k++) treeAt(K, P, -260 + (k * 53) % 520, -470 - (k * 37) % 120, 2.6 + (k % 3) * .5, k);
}

// ---------- main ----------
export function buildSuburb(scene, opts = {}) {
  const group = new THREE.Group(); scene.add(group);
  const K = new Kit(); const P = new THREE.Matrix4();
  const len = START - END;
  // ground
  const grassM = K.mat('grass', () => new THREE.MeshStandardMaterial({ color: '#62c23e', roughness: .95, map: grassTex() }));
  tbox(K, grassM, P, 0, -.05, (START + END) / 2 - 200, 1400, .1, len + 900, { cast: false }, 6);
  // road
  const rt = roadTex(); rt.repeat.set(1, len / 24);
  box(K, K.mat('road', () => new THREE.MeshStandardMaterial({ map: rt, roughness: .85 })), P, 0, .02, (START + END) / 2 + 6, ROAD_W, .04, len + 12, { cast: false });
  // kerbs, verges, sidewalks (both sides)
  const walkM = K.mat('walk', () => new THREE.MeshStandardMaterial({ map: walkTex(), roughness: .9 }));
  for (const s of [-1, 1]) {
    box(K, K.col('#d4d8e2', .8), P, s * (SIDE0 + .17), KERB / 2, (START + END) / 2, .34, KERB, len);
    tbox(K, grassM, P, s * (SIDE0 + .35 + VERGE / 2), .1, (START + END) / 2, VERGE, .2, len, { cast: false }, 6);
    tbox(K, walkM, P, s * (WALK0 + WALK / 2), .14, (START + END) / 2, WALK, .2, len, { cast: false }, 2.2);
  }
  // lots
  const houses = []; let n = 0;
  for (let z = START - LOT / 2 - 4; z > END + 60; z -= LOT) {
    for (const s of [-1, 1]) {
      const idx = n++;
      const HS = 1.25, T = P.clone().multiply(M(s * (FRONT + 4.75 * HS), 0, z + (s > 0 ? 3 : -3), s > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0, [HS, HS, HS]));
      const lawnDepth = (FRONT - WALK1) / HS, toKerb = (FRONT - SIDE0) / HS;
      const info = house(K, T, idx); houses.push({ side: s, z, info });
      // driveway from garage to the road + path to the door (in the house frame: +z = towards the street)
      box(K, K.col('#d7dae3', .9), T, info.garage[0], .12, info.garage[1] + toKerb / 2, info.gw - .8, .16, toKerb, { cast: false });
      box(K, K.col('#ecdcc0', .9), T, info.door[0], .11, info.door[1] + (lawnDepth - info.door[1] + info.d / 2) / 2 + 1.0, 1.5, .1, lawnDepth - 2.4, { cast: false });
      // picket fence along the sidewalk, gaps for path and driveway
      const fz = info.d / 2 + lawnDepth - .3, xs = [-LOT / 2 / HS + .5, LOT / 2 / HS - .5];
      const gaps = [[info.door[0] - 1, info.door[0] + 1], [info.garage[0] - info.gw / 2 + .2, info.garage[0] + info.gw / 2 - .2]].sort((a, b) => a[0] - b[0]);
      let x0 = xs[0];
      for (const [g0, g1] of gaps) { if (g0 - x0 > .8) fence(K, T, x0, fz, g0, fz); x0 = Math.max(x0, g1); }
      if (xs[1] - x0 > .8) fence(K, T, x0, fz, xs[1], fz);
      mailbox(K, T, info.garage[0] + (info.garage[0] > 0 ? -1 : 1) * (info.gw / 2 + .6), fz + .6, SHUTTERS[idx % SHUTTERS.length]);
      // parked car on some driveways
      if (idx % 3 !== 2) car(K, T, ['#ff6f61', '#3fb6a8', '#f2c14e', '#6c8cff', '#ffffff', '#a275e3'][idx % 6], info.garage[0], info.garage[1] + 4.4, 0);
      // a tree in the front lawn on some lots, back-yard trees behind
      if (idx % 2 === 0) treeAt(K, T, info.door[0] > 0 ? -LOT / 2 / HS + 2 : LOT / 2 / HS - 2, info.d / 2 + lawnDepth * .55, .9, idx);
      treeAt(K, T, (idx % 4 - 1.5) * 5, -info.d / 2 - 6, 1.3, idx + 7);
    }
  }
  // street trees on the verge + lamps
  for (let z = START - 6, k = 0; z > END + 40; z -= 12, k++) for (const s of [-1, 1]) {
    const vx = s * (SIDE0 + .35 + VERGE / 2);
    if (k % 3 === 1) lampAt(K, P, vx, z + s * 2, -s); else treeAt(K, P, vx, z + (s > 0 ? 4 : 0), .9 + (k % 2) * .12, k * 2 + (s > 0 ? 1 : 0));
  }
  // hydrants
  for (let z = START - 30; z > END + 60; z -= 66) { K.add(CYL, K.col('#e23a3a', .5), P.clone().multiply(M(SIDE0 + .9, .45, z, 0, 0, 0, [.22, .9, .22]))); K.add(SPH, K.col('#e23a3a', .5), P.clone().multiply(M(SIDE0 + .9, .95, z, 0, 0, 0, [.24, .2, .24]))); }
  // cars on the road
  if (opts.roadCars !== false) { car(K, P, '#3fb6a8', -2.6, -40, Math.PI); car(K, P, '#f29a3a', 2.6, -95, 0); car(K, P, '#6c8cff', -2.6, -170, Math.PI); }
  // plaza + roundabout at the end, school beyond
  const pz = END + 22;
  box(K, walkM, P, 0, .13, pz - 10, 70, .18, 44, { cast: false });
  K.add(new THREE.CylinderGeometry(9, 9, .5, 40), K.col('#d4d8e2', .8), P.clone().multiply(M(0, .25, pz)));
  K.add(new THREE.CylinderGeometry(8.3, 8.3, .5, 40), grassM, P.clone().multiply(M(0, .32, pz)), { cast: false });
  K.add(new THREE.CylinderGeometry(3.2, 3.6, .9, 28), K.col('#f3f4f8', .5), P.clone().multiply(M(0, .8, pz)));
  K.add(new THREE.CylinderGeometry(2.8, 2.8, .2, 28), K.col('#7ec8f2', .1, { metalness: .2 }), P.clone().multiply(M(0, 1.22, pz)), { cast: false });
  K.add(CYL, K.col('#f3f4f8', .5), P.clone().multiply(M(0, 2.0, pz, 0, 0, 0, [.5, 1.8, .5])));
  K.add(new THREE.CylinderGeometry(1.4, .3, .5, 20), K.col('#f3f4f8', .5), P.clone().multiply(M(0, 3.0, pz)));
  for (const s of [-1, 1]) { treeAt(K, P, s * 22, pz - 2, 1.3, s + 4); treeAt(K, P, s * 30, pz - 18, 1.4, s + 9); box(K, K.col('#3f9a3a', .9), P, s * 14, .7, END - 2, 9, 1.0, 1.2); }
  school(K, P.clone().multiply(M(0, 0, END - 26)), opts);
  hills(K, P);
  // distant pale skyline far behind the hills (keeps the reference's tower silhouettes, faded by the haze)
  const twr = K.col('#9cc4ee', .4, { metalness: .2 });
  [[-140, 60], [-95, 85], [-50, 70], [60, 95], [105, 72], [150, 58]].forEach(([x, h], k) => box(K, twr, P, x, h / 2, -900 - (k % 2) * 40, 22, h, 22, { cast: false }));
  K.flush(group);
  return { group, mats: K.mats, houses, landmark: [0, 0, END - 26], plaza: [0, 0, pz], FRONT, WALK0, WALK1 };
}
