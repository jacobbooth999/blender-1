// Dustbury: a broken low-poly hex town. Every prop is primitive geometry, flat-shaded, no textures (except the painted sign boards).
import * as THREE from 'three';
import { clamp, seg, ss, eo, eio, lerp, hash, TAU } from '/core/lib.js';
import { T, DUR } from './story.js';

const SQ3 = Math.sqrt(3);
export const hex2w = (q, r) => [SQ3 * (q + r / 2), 1.5 * r];
const hd = (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
const MC = new Map();
export function mat(hex, o = {}) {
  const k = hex + JSON.stringify(o);
  if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: .9, metalness: 0, ...o }));
  return MC.get(k);
}
const jit = (hex, a) => { const c = new THREE.Color(hex), h = {}; c.getHSL(h); c.setHSL(h.h, h.s, clamp(h.l * (1 + a))); return '#' + c.getHexString(); };
const M = (g, m, cast = true) => { const x = new THREE.Mesh(g, m); x.castShadow = cast; x.receiveShadow = true; return x; };
const box = (w, h, d, c, x = 0, y = 0, z = 0) => { const m = M(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); return m; };
const cyl = (rt, rb, h, n, c, x = 0, y = 0, z = 0) => { const m = M(new THREE.CylinderGeometry(rt, rb, h, n), mat(c)); m.position.set(x, y, z); return m; };

export const PAL = {
  grass: '#a7ad7c', grass2: '#9aa273', dry: '#b9b083', earth: '#a88a6a', sand: '#dccfa6', sandSide: '#c8b78a',
  rock: '#a4a6a8', rockSide: '#83868c', road: '#b8b2a6', roadSide: '#958e82',
  walls: ['#e9e2d4', '#d9b9aa', '#b9cdc2', '#b4c4d4', '#e2d29e'], roofs: ['#b86a56', '#5f7c9c', '#b98a5e', '#6f6684'],
  wood: '#8f6c50', woodDark: '#5f4636', board: '#a07e5a', iron: '#4a4d55', dead: '#7a6450', win: '#3f4756', warm: '#ffc676',
};

// —— layout: radius-4 hex island ——
const HILL = [-1, -2];
const ROAD = new Set(['-3,1', '-2,1', '-1,1', '0,1', '1,1', '2,1', '0,0', '1,0', '-1,0']);
const REMOVE = new Set(['4,-4', '-4,4', '0,-4', '-4,0', '4,0', '0,4', '3,-4', '-4,3', '1,3', '4,-1', '-3,-1', '-1,-3']);
export const CELLS = (() => {
  const out = [];
  for (let q = -4; q <= 4; q++) for (let r = -4; r <= 4; r++) {
    const d = hd(q, r), key = q + ',' + r; if (d > 4 || REMOVE.has(key)) continue;
    const [x, z] = hex2w(q, r); const dh = hd(q - HILL[0], r - HILL[1]);
    let type = 'grass', h = .62 + hash(q * 7 + r * 13) * .1;
    if (d === 4) { type = 'sand'; h = .3 + hash(q * 3 + r * 5) * .06; }
    if (dh === 0) { type = 'rock'; h = 2.1; } else if (dh === 1 && d < 4) { type = 'hill'; h = 1.2 + hash(q + r * 9) * .25; }
    if (ROAD.has(key)) { type = 'road'; h = .6; }
    out.push({ q, r, d, x, z, key, type, h });
  }
  return out;
})();
const cellAt = (q, r) => CELLS.find(c => c.q === q && c.r === r);
export const at = (q, r, dx = 0, dz = 0) => { const c = cellAt(q, r); const [x, z] = hex2w(q, r); return [x + dx, c ? c.h : .6, z + dz]; };

function hexPrism(r, h, top, side, y0 = -2.4) {
  const g = new THREE.Group(), bt = h - .1;
  const body = M(new THREE.CylinderGeometry(r * .985, r * .985, bt - y0, 6, 1), mat(side)); body.position.y = (bt + y0) / 2; g.add(body);
  const cap = M(new THREE.CylinderGeometry(r, r, .16, 6, 1), mat(top)); cap.position.y = h - .08; g.add(cap);
  return g;
}
function gable(w, d, h, over = .08) {
  const W = w / 2 + over, D = d / 2 + over, g = new THREE.BufferGeometry();
  const v = [-W, 0, -D, W, h, 0, W, 0, -D, -W, 0, -D, -W, h, 0, W, h, 0, -W, 0, D, W, h, 0, -W, h, 0, -W, 0, D, W, 0, D, W, h, 0,
    -W, 0, -D, W, 0, D, -W, 0, D, -W, 0, -D, W, 0, -D, W, 0, D];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
}
// rotate the gable so the ridge runs along z (it is built along x)
function gableEnds(w, d, h) {
  const W = w / 2, D = d / 2, g = new THREE.BufferGeometry();
  const v = [W, 0, -D, W, h, 0, W, 0, D, -W, 0, D, -W, h, 0, -W, 0, -D];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
}
// a house: state 'ok' | 'roofless' | 'boarded' | 'sagging'
function makeHouse(wall, roof, floors, state, winMat) {
  const g = new THREE.Group(), W = .9, FH = .6, H = floors * FH;
  g.add(box(W, H, W, wall, 0, H / 2, 0));
  g.add(box(W + .04, .08, W + .04, jit(wall, -.25), 0, .04, 0));
  for (let f = 0; f < floors; f++) for (let s = 0; s < 4; s++) {
    const a = s * Math.PI / 2, n = (s === 0 && f === 0) ? 1 : 2;
    for (let j = 0; j < n; j++) {
      const off = n === 1 ? .2 : (j - .5) * .4, y = f * FH + FH * .56;
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(.17, .22), winMat || mat(PAL.win));
      wm.position.set(Math.sin(a) * (W / 2 + .004) + Math.cos(a) * off, y, Math.cos(a) * (W / 2 + .004) - Math.sin(a) * off); wm.rotation.y = a; g.add(wm);
      if (state === 'boarded') { const b = box(.24, .045, .02, PAL.board); b.position.copy(wm.position); b.position.addScaledVector(new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), .012); b.rotation.set(0, a, .5 * (j ? 1 : -1)); g.add(b); }
    }
    if (s === 0 && f === 0) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.2, .34), mat(PAL.woodDark)); d.position.set(Math.sin(a) * (W / 2 + .004) - .18 * Math.cos(a), .17, Math.cos(a) * (W / 2 + .004) + .18 * Math.sin(a)); d.rotation.y = a; g.add(d); }
  }
  if (state !== 'roofless') {
    const r = new THREE.Group(); r.add(M(gable(W, W, .48), mat(roof))); r.add(M(gableEnds(W - .01, W - .01, .48), mat(wall)));
    r.position.y = H; if (state === 'sagging') { r.rotation.z = .16; r.position.x = .05; r.position.y -= .04; } g.add(r);
    if (state === 'sagging') { const hole = box(.22, .03, .26, '#3a3530', -.12, H + .18, .1); hole.rotation.z = .5; g.add(hole); }
  } else {
    // roof fallen in: a few broken rafters and a tile slab lying on the ground beside it
    for (let k = 0; k < 3; k++) { const b = box(.05, .05, W + .1, PAL.wood, -.3 + k * .3, H - .03 - k * .05, 0); b.rotation.x = (k - 1) * .25; b.rotation.z = (k - 1) * .2; g.add(b); }
    const slab = M(gable(.7, .6, .2, 0), mat(roof)); slab.position.set(.75, .02, .25); slab.rotation.set(.0, .7, 1.25); g.add(slab);
  }
  // chimney
  if (state !== 'roofless') g.add(box(.12, .32, .12, jit(wall, -.35), .22, H + .32, -.2));
  return g;
}
function deadTree(s) {
  const g = new THREE.Group();
  const tr = cyl(.04, .07, .7, 5, PAL.dead, 0, .35, 0); g.add(tr);
  for (let k = 0; k < 3; k++) { const b = cyl(.015, .03, .35, 4, PAL.dead); const a = k * 2.1 + s * 3; b.position.set(Math.cos(a) * .08, .5 + k * .08, Math.sin(a) * .08); b.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); g.add(b); }
  return g;
}
function shrub(c) { const m = M(new THREE.IcosahedronGeometry(.18, 0), mat(c)); m.position.y = .12; m.scale.y = .7; return m; }
function rubble(n, seed) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) { const s = .06 + hash(seed + k) * .09; const m = M(new THREE.IcosahedronGeometry(s, 0), mat(k % 2 ? PAL.rock : '#b9ad98')); m.position.set((hash(seed + k * 3) - .5) * .7, s * .5, (hash(seed + k * 7) - .5) * .7); m.rotation.set(k, k * 2, 0); g.add(m); }
  return g;
}
// painted board (sign text) as a canvas texture
function boardTex(lines, w = 512, h = 256, bg = '#c8a477') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(90,60,30,${.05 + .04 * (i % 2)})`; g.fillRect(0, i * h / 6, w, 3); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach(([txt, size, col, y]) => { g.font = `700 ${size}px Fredoka`; g.fillStyle = col; g.fillText(txt, w / 2, y); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildWorld(scene) {
  const W = { EVS: [], anchors: {} };
  const S = new THREE.Group(); scene.add(S);
  // tiles (kept for the 'gone forever' sink)
  W.tiles = CELLS.map(c => {
    const j = (hash(c.q * 17 + c.r * 31) - .5) * .08;
    const [top, side] = c.type === 'sand' ? [PAL.sand, PAL.sandSide] : c.type === 'rock' ? [PAL.rock, PAL.rockSide] : c.type === 'hill' ? ['#9a9f78', PAL.rockSide]
      : c.type === 'road' ? [PAL.road, PAL.roadSide] : [hash(c.q + c.r * 5) > .5 ? PAL.grass : PAL.dry, PAL.earth];
    const t = hexPrism(.985, c.h, jit(top, j), jit(side, j * .5)); t.position.set(c.x, 0, c.z); S.add(t);
    return { c, obj: t, items: [] };
  });
  const tileOf = (q, r) => W.tiles.find(t => t.c.q === q && t.c.r === r);
  const place = (obj, q, r, dx = 0, dz = 0, ry = 0) => { const p = at(q, r, dx, dz); obj.position.set(...p); obj.rotation.y = ry; S.add(obj); const t = tileOf(q, r); if (t) t.items.push({ obj, y: p[1] }); return obj; };
  const faceCam = Math.PI / 4;   // default camera azimuth 45°: +x,+z faces the viewer

  // —— houses ——
  W.houses = [
    place(makeHouse(PAL.walls[0], PAL.roofs[0], 1, 'roofless'), -2, 0, 0, 0, .1),
    place(makeHouse(PAL.walls[2], PAL.roofs[1], 2, 'boarded'), 0, 2, 0, 0, faceCam - .2),
    place(makeHouse(PAL.walls[3], PAL.roofs[3], 1, 'sagging'), 2, -2, 0, 0, .3),
    place(makeHouse(PAL.walls[4], PAL.roofs[2], 2, 'boarded'), -3, 3, 0, 0, faceCam),
    place(makeHouse(PAL.walls[1], PAL.roofs[0], 1, 'roofless'), 3, -3, 0, 0, -.2),
  ];
  // Rose's house: the one that is still cared for (flowers, curtains)
  const rose = place(makeHouse('#efe3cf', '#c0705a', 1, 'ok'), -2, 2, 0, 0, faceCam); W.roseHouse = rose;
  for (let k = 0; k < 5; k++) { const f = M(new THREE.IcosahedronGeometry(.05, 0), mat(['#e07a8a', '#f2c45a', '#e88a6a'][k % 3])); f.position.set(.55, .08, -.36 + k * .18); rose.add(f); }
  W.anchors.rose = at(-2, 2, .75, .55);

  // —— the fountain (centre plaza): hex basin, broken spout, muddy puddle ——
  const fo = new THREE.Group();
  const basin = cyl(.62, .66, .22, 6, '#c9c2b2', 0, .11, 0), inner = cyl(.52, .52, .05, 6, '#6b6248', 0, .2, 0);
  const pillar = cyl(.1, .13, .42, 6, '#bdb6a6', 0, .42, 0); pillar.rotation.z = .12;
  const bowlBroken = cyl(.24, .12, .1, 6, '#c9c2b2', .32, .26, .22); bowlBroken.rotation.set(.6, 0, 1.1);
  fo.add(basin, inner, pillar, bowlBroken); place(fo, 0, 0); W.fountain = fo; W.anchors.fountain = at(0, 0, 0, 0);
  // mud blob (the puddle 'with ambitions' spits once)
  W.mud = new THREE.Group(); for (let k = 0; k < 7; k++) { const m = M(new THREE.IcosahedronGeometry(.07 + .03 * (k % 3), 0), mat('#6a5a3c')); W.mud.add(m); } fo.add(W.mud);
  // the 'option A' preview: water column + sparkle bowl (hidden until the preview)
  W.water = new THREE.Group();
  const wcol = M(new THREE.CylinderGeometry(.06, .1, .7, 6), new THREE.MeshStandardMaterial({ color: '#9fe3f2', emissive: '#4fc3e0', emissiveIntensity: .5, flatShading: true }), false); wcol.position.y = .75; W.water.add(wcol);
  const wpool = M(new THREE.CylinderGeometry(.52, .52, .04, 6), new THREE.MeshStandardMaterial({ color: '#7fd3e8', emissive: '#3fb3d0', emissiveIntensity: .35, flatShading: true }), false); wpool.position.y = .225; W.water.add(wpool);
  const bowl = cyl(.26, .12, .1, 6, '#e6e0d2', 0, .64, 0); W.water.add(bowl);
  for (let k = 0; k < 6; k++) { const d = M(new THREE.IcosahedronGeometry(.045, 0), new THREE.MeshStandardMaterial({ color: '#bff0ff', emissive: '#6fd6f0', emissiveIntensity: .6, flatShading: true }), false); d.userData.a = k / 6 * TAU; W.water.add(d); }
  W.water.visible = false; fo.add(W.water);

  // —— streetlights along the road (r = 1 row), all dead; the last one dies on 'dead.' ——
  W.lamps = [];
  [[-3, 1], [-1, 1], [1, 1], [2, 1]].forEach(([q, r], i) => {
    const g = new THREE.Group();
    g.add(cyl(.03, .045, 1.15, 6, PAL.iron, 0, .575, 0));
    const arm = box(.22, .03, .03, PAL.iron, .09, 1.13, 0); g.add(arm);
    const lm = new THREE.MeshStandardMaterial({ color: '#d8d4c4', emissive: '#ffc676', emissiveIntensity: 0, flatShading: true });
    const head = M(new THREE.BoxGeometry(.13, .1, .13), lm); head.position.set(.19, 1.07, 0); g.add(head);
    g.add(box(.16, .03, .16, PAL.iron, .19, 1.135, 0));
    if (i === 0) g.rotation.z = .12;   // one leans
    place(g, q, r, .55, .3, faceCam + Math.PI / 2);
    W.lamps.push({ g, lm, head });
  });

  // —— town hall (big, columns, roof caved in) + the mayor's tent ——
  const hall = new THREE.Group();
  hall.add(box(1.5, .8, 1.1, '#ddd6c6', 0, .4, 0)); hall.add(box(1.6, .08, 1.2, '#c4bcaa', 0, .04, 0));
  for (let k = 0; k < 4; k++) hall.add(cyl(.06, .06, .7, 6, '#efe9dc', -.54 + k * .36, .37, .62));
  hall.add(box(1.62, .1, .3, '#cfc7b5', 0, .82, .62));
  const rf1 = M(gable(1.5, 1.1, .45), mat('#8a6a5a')); rf1.position.set(-.1, .62, 0); rf1.rotation.z = -.32; hall.add(rf1);
  hall.add(rubble(6, 11)); hall.children[hall.children.length - 1].position.set(.5, .0, -.7);
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(.8, .2), new THREE.MeshStandardMaterial({ map: boardTex([['TOWN HALL', 92, '#3a2c20', 84]], 512, 160, '#e6dcc4'), roughness: .9 }));
  hs.position.set(0, .97, .78); hs.rotation.x = -.05; hs.rotation.z = .12; hall.add(hs);
  place(hall, 1, -1, 0, 0, faceCam - .1); W.hall = hall;
  const tent = new THREE.Group();
  const tc = M(new THREE.ConeGeometry(.42, .62, 4), mat('#d9a35a')); tc.position.y = .31; tc.rotation.y = Math.PI / 4; tent.add(tc);
  const flap = new THREE.Mesh(new THREE.PlaneGeometry(.2, .3), mat('#5a4030')); flap.position.set(0, .15, .31); flap.rotation.x = -.45; tent.add(flap);
  const flag = box(.02, .32, .02, PAL.iron, 0, .75, 0); tent.add(flag); const fl = box(.16, .1, .01, '#c0504a', .08, .85, 0); tent.add(fl);
  place(tent, 2, -1, .1, .25, faceCam); W.tent = tent; W.anchors.tent = at(2, -1, .35, .62);

  // —— bus stop: bench, shelter, sign on a post (falls on 'stopped') ——
  const bus = new THREE.Group();
  bus.add(box(.7, .04, .2, PAL.wood, 0, .24, 0)); bus.add(box(.04, .22, .18, PAL.iron, -.3, .12, 0)); bus.add(box(.04, .22, .18, PAL.iron, .3, .12, 0));
  bus.add(box(.8, .03, .4, '#7f8a96', 0, .86, -.05)); bus.add(box(.03, .86, .03, PAL.iron, -.38, .43, -.22)); bus.add(box(.03, .86, .03, PAL.iron, .38, .43, -.22));
  const signP = new THREE.Group(); signP.position.set(.62, 0, .05);
  signP.add(box(.03, .9, .03, PAL.iron, 0, .45, 0));
  const sb = new THREE.Mesh(new THREE.CircleGeometry(.13, 12), new THREE.MeshStandardMaterial({ map: boardTex([['BUS', 150, '#ffffff', 128]], 256, 256, '#3f6fb0') })); sb.position.set(0, .92, .02); signP.add(sb);
  bus.add(signP); W.busSign = signP;
  place(bus, -1, 2, 0, -.15, faceCam); W.anchors.gary = at(-1, 2, -.05, .02);

  // —— the hill: the building nobody goes into (dark, boarded tower with one window) ——
  const tower = new THREE.Group();
  tower.add(cyl(.42, .5, 1.3, 8, '#5d5a66', 0, .65, 0)); tower.add(cyl(.5, .5, .1, 8, '#45434e', 0, 1.33, 0));
  const tcap = M(new THREE.ConeGeometry(.55, .6, 8), mat('#3c3a45')); tcap.position.y = 1.68; tower.add(tcap);
  W.towerWin = new THREE.MeshStandardMaterial({ color: '#2a2a33', emissive: '#ffcf6a', emissiveIntensity: 0, flatShading: true });
  const tw = M(new THREE.BoxGeometry(.16, .22, .05), W.towerWin, false); tw.position.set(0, 1.05, .45); tower.add(tw);
  const tdoor = box(.24, .4, .04, '#2e2a26', 0, .2, .47); tower.add(tdoor);
  for (let k = 0; k < 2; k++) { const b = box(.34, .05, .03, PAL.board, 0, .16 + k * .16, .5); b.rotation.z = k ? .4 : -.4; tower.add(b); }
  const fence = new THREE.Group(); for (let k = 0; k < 7; k++) { const a = -1.2 + k * .4; fence.add(box(.03, .3, .03, PAL.woodDark, Math.sin(a) * .85, .15, Math.cos(a) * .85)); }
  fence.add(box(1.6, .03, .02, PAL.woodDark, 0, .24, .88)); tower.add(fence);
  place(tower, HILL[0], HILL[1], 0, 0, faceCam); W.tower = tower; W.anchors.tower = at(HILL[0], HILL[1], 0, 0);

  // —— the welcome sign at the front edge (slams down at t=0); the '3' is painted over an older number ——
  const sign = new THREE.Group();
  sign.add(box(.08, 1.6, .08, PAL.woodDark, -.42, .8, -.07)); sign.add(box(.08, 1.6, .08, PAL.woodDark, .42, .8, -.07));
  const sTex = boardTex([['WELCOME TO', 54, '#3a2a1c', 64], ['DUSTBURY', 104, '#2b1d12', 140], ['POP. 3', 56, '#8a2a20', 214]], 512, 256, '#d2ad7a');
  const board = M(new THREE.BoxGeometry(1.2, .6, .05), [mat('#9c7650'), mat('#9c7650'), mat('#9c7650'), mat('#9c7650'), new THREE.MeshStandardMaterial({ map: sTex, roughness: .9 }), mat('#9c7650')]);
  board.position.y = 1.3; board.rotation.z = -.05; sign.add(board);
  place(sign, 2, 2, -.2, -.1, faceCam); W.sign = sign; W.signY = sign.position.y; W.anchors.sign = at(2, 2, -.2, -.1);
  W.anchors.mayor = at(2, 2, .75, .7);

  // —— scattered: dead trees, shrubs, rubble, barrels (Dot hides behind them), a dock ——
  [[-1, -1, .3, .2], [3, 0, -.2, .3], [-4, 2, .1, 0], [1, 3 - 1, .5, .5], [-2, 3, .3, -.2], [3, -2, .3, .4], [0, -2, -.3, .2]].forEach(([q, r, dx, dz], k) => { if (cellAt(q, r)) place(deadTree(k), q, r, dx, dz, k); });
  [[-3, 2, -.4, .3], [4, -2, 0, 0], [-1, 3, .2, -.3], [2, 0, .5, -.4]].forEach(([q, r, dx, dz], k) => { if (cellAt(q, r)) place(shrub(k % 2 ? '#8f9a6a' : '#7f8a60'), q, r, dx, dz); });
  [[-1, -1, -.3, -.2], [3, -1, .2, .2], [-3, 0, 0, 0], [0, 3, -.2, -.2]].forEach(([q, r, dx, dz], k) => { if (cellAt(q, r)) place(rubble(5, k * 13), q, r, dx, dz); });
  const barrels = new THREE.Group();
  [[0, 0], [.24, .05], [.12, .2]].forEach(([x, z], k) => { const b = cyl(.11, .11, .26, 8, k ? '#8a5e3c' : '#9a6a44', x, .13, z); barrels.add(b); barrels.add(cyl(.115, .115, .03, 8, PAL.iron, x, .2, z)); });
  barrels.add(box(.3, .22, .3, '#a08060', -.25, .11, .15));
  place(barrels, 3, -1, -.1, .2, faceCam); W.anchors.dot = at(3, -1, .05, .45);
  const dock = new THREE.Group(); for (let k = 0; k < 4; k++) { const p = box(.32, .04, .7, k === 2 ? '#6a5040' : PAL.wood, k * .34, .3, 0); p.rotation.z = (k === 3 ? .25 : 0); dock.add(p); dock.add(cyl(.03, .03, .6, 5, PAL.woodDark, k * .34, .02, .3)); }
  place(dock, 4, -3, -.1, .6, -.6);
  // coins (vote section): a small pile in front of the mayor
  W.coins = new THREE.Group(); for (let k = 0; k < 14; k++) { const c = cyl(.07, .07, .025, 10, '#e8c45a', (hash(k) - .5) * .3, .012 + Math.floor(k / 5) * .03, (hash(k * 3) - .5) * .25); c.material = new THREE.MeshStandardMaterial({ color: '#f0cd60', emissive: '#a07a20', emissiveIntensity: .25, flatShading: true, metalness: .3, roughness: .5 }); W.coins.add(c); }
  W.coins.visible = false; place(W.coins, 2, 2, .2, .75);
  // sparks (lamp dying)
  W.sparks = []; for (let k = 0; k < 8; k++) { const s = M(new THREE.BoxGeometry(.03, .03, .03), new THREE.MeshStandardMaterial({ color: '#fff3c0', emissive: '#ffd060', emissiveIntensity: 3 }), false); s.visible = false; S.add(s); W.sparks.push(s); }

  // —— events (sound) ——
  const E = (t, type, o = {}) => W.EVS.push({ t, type, ...o });
  E(T.slam + .18, 'thump', { big: 1 });
  E(T.mud, 'gloop'); E(T.dead, 'zap'); E(T.stopped + .25, 'clang'); E(T.flicker, 'flicker');
  E(T.gone, 'sink'); E(T.rewind, 'rewind');
  E(T.optA + 1.2, 'sparkle'); E(T.optB + 1.6, 'hum');

  // —— per-frame ——
  W.update = (t) => {
    // sign slam: falls from above, bounces, settles; again at the loop (same frame as the start for a seamless loop)
    const sl = (t0) => { const s = t - t0; if (s < 0) return 0; if (s < .2) return 2.2 * (1 - Math.pow(s / .2, 2)); const u = s - .2; return Math.abs(Math.sin(u * 15)) * Math.exp(-u * 9) * .18; };
    W.sign.position.y = W.signY + (t < T.loop ? sl(T.slam) : 0);
    { const s = t - (T.slam + .2); const sq = s > 0 ? 1 - .14 * Math.exp(-s * 12) * Math.cos(s * 26) : 1; W.sign.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); }
    // mud blob: one arc
    { const s = t - T.mud; W.mud.visible = s > 0 && s < 1.1; W.mud.children.forEach((m, k) => { const a = k / 7 * TAU, v = .35 + .1 * (k % 3), u = clamp(s, 0, 1.1); m.position.set(Math.cos(a) * u * .35, .25 + u * 2.2 * v - 4.2 * u * u * v, Math.sin(a) * u * .35); m.scale.setScalar(clamp(1.3 - u * .5, .4, 1.3)); }); }
    // lamps: the last one flickers then dies on 'dead.'; option B preview lights them all
    const pB = ss(seg(t, T.optB + 1.5, T.optB + 1.9)) * (1 - ss(seg(t, T.comment - .3, T.comment))), pBc = ss(seg(t, T.comment + 1.0, T.comment + 1.4)) * (1 - ss(seg(t, T.follow - .2, T.follow)));
    W.lamps.forEach((L, i) => {
      let e = 0;
      if (i === 2 && t > T.lamps && t < T.dead) e = (hash(Math.floor(t * 14)) > .45 ? 1 : .1) * 1.4;
      e = Math.max(e, (pB + pBc * .9) * 2.2 * (i % 2 ? 1 : .9 + .1 * Math.sin(t * 9 + i)));
      L.lm.emissiveIntensity = e;
    });
    // sparks on 'dead.'
    { const s = t - T.dead; const L = W.lamps[2]; const hp = new THREE.Vector3(); L.head.getWorldPosition(hp);
      W.sparks.forEach((sp, k) => { sp.visible = s > 0 && s < .6; if (!sp.visible) return; const a = k / 8 * TAU; sp.position.set(hp.x + Math.cos(a) * s * .5, hp.y - .02 + s * (.6 + .2 * (k % 3)) - 3.2 * s * s, hp.z + Math.sin(a) * s * .5); }); }
    // bus sign tips over on 'stopped'
    { const s = t - T.stopped; W.busSign.rotation.z = s > 0 ? -Math.min(1.45, 1.45 * Math.pow(s / .35, 2)) + (s > .35 ? Math.sin((s - .35) * 18) * Math.exp(-(s - .35) * 8) * .12 : 0) : 0; }
    // tower window: dark, then flickers on (the open loop)
    { const s = t - T.flicker; W.towerWin.emissiveIntensity = s < 0 ? 0 : s < .6 ? (hash(Math.floor(s * 20) + 3) > .5 ? 2.2 : 0) : s < 1.6 ? 2.0 : 2.0 * (1 - ss(seg(s, 1.6, 2.2))); }
    // 'gone forever': the island sinks tile by tile from the edges, then rewinds
    { const z = seg(t, T.gone - .2, T.forever + .9);
      W.tiles.forEach(tl => { const d = tl.c.d + hash(tl.c.q * 5 + tl.c.r * 11) * 1.2, k = clamp(z * 7 - (5.2 - d) * .9, 0, 1), dy = t < T.rewind ? -Math.pow(k, 2) * 3.2 : 0;
        tl.obj.position.y = dy; tl.items.forEach(it => { it.obj.position.y = (it.obj === W.sign ? W.sign.position.y : it.y) + dy; }); }); }
    // option A preview: water returns to the fountain (comes back during the comment beat too)
    { const a = ss(seg(t, T.optA + 1.1, T.optA + 1.5)) * (1 - ss(seg(t, T.optB - .2, T.optB))), c = ss(seg(t, T.comment + .3, T.comment + .7)) * (1 - ss(seg(t, T.follow - .2, T.follow)));
      const v = Math.max(a, c); W.water.visible = v > .01; const pop = 1 - Math.exp(-9 * Math.max(0, t - T.optA - 1.1)) * Math.cos(17 * Math.max(0, t - T.optA - 1.1));
      W.water.scale.setScalar(Math.max(.001, v * (t < T.optB ? pop : 1)));
      W.water.children.forEach(d => { if (d.userData.a !== undefined) { const u = ((t * .9 + d.userData.a / TAU) % 1); d.position.set(Math.cos(d.userData.a) * u * .45, .9 - u * u * .75 + u * .3, Math.sin(d.userData.a) * u * .45); } }); }
    W.coins.visible = t > T.hundred - .1 && t < T.optA;
    if (W.coins.visible) { const s = t - T.hundred + .1; W.coins.children.forEach((c, k) => { const d = s - k * .03; c.position.y = .012 + Math.floor(k / 5) * .03 + (d < 0 ? 5 : d < .2 ? 1.2 * (1 - Math.pow(d / .2, 2)) : Math.abs(Math.sin((d - .2) * 16)) * Math.exp(-(d - .2) * 10) * .08); }); }
  };
  return W;
}
