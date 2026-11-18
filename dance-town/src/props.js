// Food rewards + Fight Town locations (arena, training ground, mountain). Added to the world by addFightTown(W, scene).
import * as THREE from 'three';
import { mat } from './rig.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

const rb = (w, h, d, r = .1) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
function M(geo, mt, parent, x = 0, y = 0, z = 0, cast = true) { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o; }
const G = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const cyl = (r, h, n = 24) => new THREE.CylinderGeometry(r, r, h, n);

// ---------- food (origin = bottom centre, ~1 unit across unless noted) ----------
export function makeFood(kind) {
  const g = new THREE.Group();
  const bread = mat('#e8b86a', .7), crust = mat('#c2833c', .7), lettuce = mat('#5cc84a', .6), cheese = mat('#ffcc2e', .5), tomato = mat('#e8343e', .5), meat = mat('#7a3a1e', .55);
  if (kind === 'crumb') { M(rb(.32, .2, .26, .06), bread, g, 0, .1, 0); }
  else if (kind === 'sandwich') {
    M(rb(1.3, .22, 1.3, .08), bread, g, 0, .11, 0); M(rb(1.38, .07, 1.38, .03), lettuce, g, 0, .26, 0); M(rb(1.25, .07, 1.25, .03), cheese, g, 0, .32, 0);
    M(rb(1.2, .1, 1.2, .04), mat('#f2a0a0', .6), g, 0, .4, 0); M(rb(1.3, .22, 1.3, .08), bread, g, 0, .56, 0);
  } else if (kind === 'burger') {
    M(cyl(.75, .25), bread, g, 0, .12, 0); M(cyl(.8, .22), meat, g, 0, .36, 0); M(cyl(.85, .05), cheese, g, 0, .5, 0); M(cyl(.82, .06), lettuce, g, 0, .56, 0);
    M(cyl(.72, .06), tomato, g, 0, .62, 0); const top = M(new THREE.SphereGeometry(.78, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), bread, g, 0, .65, 0); top.scale.y = .7;
    for (let i = 0; i < 9; i++) M(new THREE.SphereGeometry(.04, 6, 4), mat('#fff6d8'), g, Math.cos(i * 2.4) * .45, 1.08 - (i % 3) * .05, Math.sin(i * 2.4) * .45, false);
  } else if (kind === 'steak') {
    const s = M(rb(2.4, .35, 1.6, .25), meat, g, 0, .2, 0); M(rb(2.2, .05, .2, .02), mat('#f3e3c8', .6), g, 0, .39, .55);
    for (let i = 0; i < 4; i++) M(rb(.08, .03, 1.3, .01), mat('#3a1a0a'), g, -.75 + i * .5, .39, 0, false);
    M(cyl(.12, 1.1, 10), mat('#f6f0e0', .5), g, 1.6, .25, 0).rotation.z = Math.PI / 2; M(new THREE.SphereGeometry(.2, 10, 8), mat('#f6f0e0', .5), g, 2.15, .25, 0);
  } else if (kind === 'turkey') {
    const t = M(new THREE.SphereGeometry(1, 20, 14), mat('#c8742e', .45), g, 0, .8, 0); t.scale.set(1.2, .8, .9);
    for (const s of [-1, 1]) { const l = M(new THREE.SphereGeometry(.35, 12, 8), mat('#c8742e', .45), g, s * .9, .8, .7); l.scale.set(.8, .8, 1.4); M(cyl(.08, .5, 8), mat('#f6f0e0'), g, s * 1.0, .85, 1.2).rotation.x = Math.PI / 2; }
  } else if (kind === 'cake') {
    M(cyl(.9, .7), mat('#ff8fc8', .6), g, 0, .35, 0); M(cyl(.65, .55), mat('#ffffff', .6), g, 0, .97, 0); M(new THREE.SphereGeometry(.18, 10, 8), mat('#e8243c', .4), g, 0, 1.35, 0);
  } else if (kind === 'feast' || kind === 'megafeast') {
    const big = kind === 'megafeast', L = big ? 12 : 5, D = big ? 4 : 2.6;
    M(rb(L, .3, D, .1), mat('#a0522d', .6), g, 0, 2.6, 0); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(rb(.3, 2.5, .3, .05), mat('#7a3d1a'), g, x * (L / 2 - .4), 1.25, z * (D / 2 - .4));
    M(rb(L + .2, .05, D + .2, .02), mat('#ffffff', .8), g, 0, 2.77, 0);
    const items = big ? ['turkey', 'cake', 'burger', 'steak', 'turkey', 'sandwich', 'burger', 'cake', 'steak', 'turkey', 'burger', 'sandwich'] : ['turkey', 'burger', 'steak', 'cake'];
    items.forEach((k, i) => { const f = makeFood(k); const n = items.length; f.position.set(-L / 2 + .9 + (i % (big ? 6 : 4)) * ((L - 1.8) / ((big ? 6 : 4) - 1)), 2.8, (big ? (i < 6 ? -.9 : .9) : 0)); f.scale.setScalar(big ? 1.1 : .9); f.rotation.y = i * .7; g.add(f); });
    if (big) for (let i = 0; i < 18; i++) { const f = makeFood(['burger', 'sandwich', 'cake'][i % 3]); f.position.set(-L / 2 + .6 + (i % 9) * (L - 1.2) / 8, 2.8, (i < 9 ? -1.7 : 1.7)); f.scale.setScalar(.6); g.add(f); }
  } else if (kind === 'tray') {   // a towering stack of food carried in front of the hero
    M(rb(3.2, .15, 2, .05), mat('#d4a017', .3, { metalness: .7 }), g, 0, 0, 0);
    const stack = ['turkey', 'cake', 'burger', 'steak', 'burger', 'cake', 'sandwich', 'turkey'];
    let y = .1; stack.forEach((k, i) => { const f = makeFood(k); f.scale.setScalar(.7 - i * .03); f.position.set(Math.sin(i * 2) * .3, y, 0); f.rotation.y = i; g.add(f); y += k === 'turkey' ? 1.1 : k === 'cake' ? .95 : .55; });
  }
  return g;
}

// matchup screen texture ("CHICKEN = SANDWICH")
const scrCache = {};
function screenTex(a, b, col = '#ffcc2e') {
  const key = a + '|' + b; if (scrCache[key]) return scrCache[key];
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 576); gr.addColorStop(0, '#1a1f3a'); gr.addColorStop(1, '#3a1030'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 576);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const fit = (txt, max) => { let fs = max; g.font = `900 ${fs}px Montserrat`; while (g.measureText(txt).width > 920 && fs > 30) { fs -= 4; g.font = `900 ${fs}px Montserrat`; } };
  fit(a, 110); g.fillStyle = '#ffffff'; g.fillText(a, 512, 170);
  g.font = '900 70px Montserrat'; g.fillStyle = '#ff4d6d'; g.fillText('WIN:', 512, 300);
  fit(b, 110); g.fillStyle = col; g.fillText(b, 512, 420);
  g.strokeStyle = '#ffcc2e'; g.lineWidth = 16; g.strokeRect(10, 10, 1004, 556);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scrCache[key] = t; return t;
}
function bannerTex(txt, bg, fg) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 160; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 160); g.fillStyle = fg; g.font = '900 78px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 512, 86);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export const ARENA = [300, 0, 0], ARENA_R = 20;
export function addFightTown(W, scene, OCC) {
  const town = W.town;
  // ---------- arena ----------
  const ar = G(town, ...ARENA); W.arena = ar;
  M(new THREE.CylinderGeometry(ARENA_R, ARENA_R, .3, 64), mat('#e8c98a', .95), ar, 0, .15, 0, false);
  const wall = M(new THREE.CylinderGeometry(ARENA_R + .4, ARENA_R + .4, 1.8, 64, 1, true), mat('#e8243c', .5), ar, 0, .9, 0); wall.material.side = THREE.DoubleSide;
  M(new THREE.TorusGeometry(ARENA_R + .4, .18, 8, 64), mat('#ffffff', .4), ar, 0, 1.8, 0).rotation.x = Math.PI / 2;
  // stepped stands (lathe profile): three tiers rising outward
  const R0 = ARENA_R + .5, prof = [[R0, 0], [R0, 1.6], [R0 + 2.6, 1.6], [R0 + 2.6, 3.8], [R0 + 5.2, 3.8], [R0 + 5.2, 6.0], [R0 + 7.8, 6.0], [R0 + 7.8, 0]];
  const pts = []; for (let i = 0; i < prof.length - 1; i++) { pts.push(new THREE.Vector2(...prof[i])); pts.push(new THREE.Vector2(prof[i][0] + (prof[i + 1][0] - prof[i][0]) * .999, prof[i][1] + (prof[i + 1][1] - prof[i][1]) * .999)); }
  pts.push(new THREE.Vector2(...prof[prof.length - 1]));
  const stands = M(new THREE.LatheGeometry(pts, 72), mat('#3a74d9', .7), ar, 0, 0, 0, false); stands.material.side = THREE.DoubleSide;
  for (let i = 0; i < 3; i++) { const st = M(new THREE.RingGeometry(R0 + i * 2.6, R0 + i * 2.6 + 2.6, 72), mat(['#ffcc2e', '#3a74d9', '#ffcc2e'][i], .7), ar, 0, 1.6 + i * 2.2 + .02, 0, false); st.rotation.x = -Math.PI / 2; }
  // crowd: instanced blocky people on the tiers
  const N = 260, bodyG = new THREE.BoxGeometry(1.3, 1.6, .9), headG = new THREE.BoxGeometry(.95, .95, .95);
  const bodies = new THREE.InstancedMesh(bodyG, new THREE.MeshStandardMaterial({ roughness: .6 }), N), heads = new THREE.InstancedMesh(headG, new THREE.MeshStandardMaterial({ roughness: .5 }), N);
  const cols = ['#e53935', '#43a047', '#1e88e5', '#ffb300', '#8e24aa', '#ff7043', '#00acc1', '#f06292', '#7cb342'].map((c) => new THREE.Color(c));
  const skins = ['#f2c9a0', '#e8b48a', '#c98f5f', '#8d5a3b'].map((c) => new THREE.Color(c));
  const d = new THREE.Object3D(); W.crowd = { bodies, heads, base: [] };
  for (let i = 0; i < N; i++) {
    const tier = i % 3, a = (i / N) * Math.PI * 2 + tier * .07, r = ARENA_R + 1.8 + tier * 2.6, y = 1.6 + tier * 2.2;
    W.crowd.base.push([Math.sin(a) * r, y, Math.cos(a) * r, a]);
    bodies.setColorAt(i, cols[(i * 7) % cols.length]); heads.setColorAt(i, skins[(i * 3) % skins.length]);
  }
  ar.add(bodies, heads); bodies.castShadow = heads.castShadow = false;
  W.crowdAt = (t, cheer = 0) => {
    W.crowd.base.forEach(([x, y, z, a], i) => {
      const hop = cheer ? Math.abs(Math.sin(t * 9 + i * 1.7)) * .5 * cheer : 0;
      d.position.set(x, y + .8 + hop, z); d.rotation.set(0, a + Math.PI, 0); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix);
      d.position.set(x, y + 2.1 + hop, z); d.updateMatrix(); heads.setMatrixAt(i, d.matrix);
    });
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
  };
  W.crowdAt(0);
  // big matchup screen behind the north stands
  for (const x of [-7, 7]) M(new THREE.BoxGeometry(.6, 16, .6), mat('#333'), ar, x, 8, -ARENA_R - 11);
  M(new THREE.BoxGeometry(15, 8.8, .5), mat('#111'), ar, 0, 15, -ARENA_R - 11);
  W.screenF = M(new THREE.PlaneGeometry(14, 7.9), new THREE.MeshBasicMaterial({ map: screenTex('CHICKEN', 'SANDWICH'), toneMapped: false }), ar, 0, 15, -ARENA_R - 10.7, false);
  W.setScreen = (a, b, col) => { W.screenF.material.map = screenTex(a, b, col); W.screenF.material.needsUpdate = true; };
  M(new THREE.PlaneGeometry(22, 3.4), new THREE.MeshBasicMaterial({ map: bannerTex('FIGHT FOR YOUR FOOD', '#e8243c', '#ffffff'), toneMapped: false }), ar, 0, 21.4, -ARENA_R - 10.7, false);
  // reward pedestal (golden) at the east edge of the sand
  W.pedestal = G(ar, ARENA_R - 4, 0, 0);
  M(new THREE.CylinderGeometry(1.4, 1.7, 2.6, 24), mat('#ffcc2e', .25, { metalness: .7, emissive: '#5a3a00', emissiveIntensity: .2 }), W.pedestal, 0, 1.3, 0);
  W.reward = G(W.pedestal, 0, 2.6, 0);
  W.foods = {}; for (const k of ['crumb', 'sandwich', 'burger', 'steak', 'feast', 'megafeast', 'tray']) { const f = makeFood(k); f.visible = false; scene.add(f); W.foods[k] = f; }
  // crater for the final fight
  W.crater = M(new THREE.CircleGeometry(4, 32), new THREE.MeshStandardMaterial({ color: '#8a6a3a', roughness: 1 }), ar, 0, .32, 0, false); W.crater.rotation.x = -Math.PI / 2; W.crater.visible = false;
  W.debris = []; for (let i = 0; i < 14; i++) { const c = M(rb(.8, .6, .7, .1), mat('#c9a86a', .9), ar, 0, 0, 0); c.visible = false; W.debris.push(c); }

  // ---------- training ground (west, past the hill) ----------
  const tg = G(town, -150, 0, 60); W.train = tg;
  const trunk = mat('#7a4b2a', .8), leaf = mat('#4caf50', .8);
  W.punchTree = G(tg, 0, 0, 0); M(rb(1.6, 9, 1.6, .2), trunk, W.punchTree, 0, 4.5, 0); M(new THREE.SphereGeometry(4.2, 16, 12), leaf, W.punchTree, 0, 10.5, 0);
  M(rb(1.1, 1.1, .1, .05), mat('#c9a06a'), W.punchTree, 0, 4.4, .82, false);          // worn punch patch
  for (let i = 0; i < 14; i++) { const t = G(tg, -18 + (i % 7) * 6 + (i > 6 ? 3 : 0), 0, -10 - (i > 6 ? 8 : 0)); M(rb(1.2, 7, 1.2, .15), trunk, t, 0, 3.5, 0); M(new THREE.SphereGeometry(3.2, 14, 10), leaf, t, 0, 8.5, 0); }
  W.boulder = M(new THREE.DodecahedronGeometry(1.8, 0), mat('#8d8a86', .9), scene, 0, 0, 0); W.boulder.visible = false;
  for (let i = 0; i < 5; i++) M(new THREE.DodecahedronGeometry(1 + (i % 3) * .5, 0), mat('#9a9690', .9), tg, 8 + i * 2.6, .8, 4 - (i % 2) * 3);
  W.pads = [0, 1].map(() => { const p = M(rb(.9, 1.1, .5, .15), mat('#e8243c', .5), scene, 0, 0, 0); p.visible = false; return p; });
  // ---------- the mountain ----------
  const mt = G(town, -260, 0, -300); W.mountain = mt;
  M(new THREE.ConeGeometry(110, 120, 7), mat('#7d8a96', .95), mt, 0, 60, 0, false);
  M(new THREE.ConeGeometry(32, 35, 7), mat('#ffffff', .8), mt, 0, 103, 0, false);
  M(new THREE.ConeGeometry(70, 70, 6), mat('#6f7c88', .95), mt, 120, 35, 40, false);
  W.mountainSlope = (u) => [-260 + 110 * (1 - u) * .62, 120 * u - .2, -300 + 110 * (1 - u) * .78];   // a point on the near face, u: 0 foot → 1 top
}
