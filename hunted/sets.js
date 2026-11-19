// ============================================================================
// Sets (3D, metres, y up). Each: { faces, bg(cam,t), fog, sun }
// ============================================================================
function indoorBg(top, bottom){ return (cam) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200); }; }
function skyBg(top, hor, clouds = []){
  return (cam, t) => {
    const hz = proj(cam, add(cam.pos, [cam.f[0]*1e4, 0, cam.f[2]*1e4]))[1];
    const g = ctx.createLinearGradient(0, 0, 0, Math.max(hz, 50)); g.addColorStop(0, top); g.addColorStop(1, hor);
    ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
    for (const cl of clouds){
      const x = ((cl[0] - cam.pos[0]*6 - t*cl[3]) % (W + 600) + W + 600) % (W + 600) - 300, y = cl[1], w = cl[2];
      ctx.save(); ctx.globalAlpha = 0.7; ctx.fillStyle = '#fbf6ea'; ctx.beginPath();
      for (const [bx, by, br] of [[0,0,1],[-.55,.15,.7],[.55,.12,.75],[-.25,-.25,.7],[.28,-.22,.62]]){ ctx.moveTo(x + bx*w + br*w*.42, y + by*w); ctx.arc(x + bx*w, y + by*w, br*w*0.42, 0, 7); }
      ctx.rect(x - w*.75, y, w*1.5, w*.22); ctx.fill(); ctx.restore();
    }
  };
}
const SHOPS = ['GADGET HUB','SHOEZ','BOOK NOOK','STYLE CO.','TOY TOWN','KICKS','THE CAFE','GLOW','SPORTZ','PHONE FIX','TEA HOUSE','DENIM','GAMES','BAKERY','OPTIX','FLORA'];
const SHOP_COL = ['#d98e6a','#e8c07a','#9bb0a6','#c97b6b','#8fa3bf','#d7a58c','#a3b18a','#c9a0dc','#e0b26a','#7fa1c4'];

// ---- shop unit on a wall facing +z (side=1) or -z (side=-1) ----
function shopUnit(F, x0, z, y0, side, idx, o = {}){
  const w = 8, nz = side, zf = z + side*0.01, r = mulberry(idx*31 + 7);
  const col = SHOP_COL[idx % SHOP_COL.length], name = SHOPS[idx % SHOPS.length];
  const fx0 = side > 0 ? x0 : x0 + w, fx1 = side > 0 ? x0 + w : x0;   // keep winding facing the corridor
  const wall = face([[fx0,y0,z],[fx1,y0,z],[fx1,y0+4.2,z],[fx0,y0+4.2,z]], '#efe6d6', [0,0,nz], { edge: true });
  wall.decals = [];
  const rz = (a, b, c, d, cl, oo = {}) => { const xa = side > 0 ? a : x0 + w - (a - x0) - (c - a), xb = xa + (c - a); return face([[xa,y0+b,zf],[xb,y0+b,zf],[xb,y0+d,zf],[xa,y0+d,zf]].map((p, i, arr) => side > 0 ? p : arr[[1,0,3,2][i]]), cl, [0,0,nz], oo); };
  wall.decals.push(rz(x0+0.3, 0, x0+w-0.3, 3.3, col, { nohatch: true }));
  wall.decals.push(rz(x0+0.6, 0.35, x0+2.6, 3.0, '#b9d8e6', { nohatch: true, ew: 1.4 }));
  wall.decals.push(rz(x0+5.4, 0.35, x0+7.4, 3.0, '#b9d8e6', { nohatch: true, ew: 1.4 }));
  wall.decals.push(rz(x0+2.9, 0, x0+5.1, 2.9, '#5a4b40', { nohatch: true }));
  for (const wx of [x0+0.9, x0+5.7]){ for (let k = 0; k < 2; k++){ const ox = wx + 0.25 + k*0.8; wall.decals.push(rz(ox, 0.35, ox + 0.45, 1.2 + r()*0.8, SHOP_COL[(idx + k + 3) % SHOP_COL.length], { nohatch: true, ew: 1 })); } }
  for (const wx of [x0+1.0, x0+5.8]) wall.decals.push(line3([[wx + 0.2, y0+2.8, zf + side*0.01], [wx + 1.0, y0+1.4, zf + side*0.01]], { w: 1.4, a: .5, col: '#ffffff' }));
  const tz = zf + side*0.02, tx0 = side > 0 ? x0+1 : x0+w-1, tx1 = side > 0 ? x0+w-1 : x0+1;
  wall.decals.push(sign([tx0, y0+4.0, tz], [tx1, y0+4.0, tz], [tx0, y0+3.4, tz], name, { bg: dk(col, .55), col: '#fff6e0', size: 30 }));
  F.push(wall);
  F.push(...box(x0 - 0.2, y0, Math.min(z, z + side*0.35), x0 + 0.2, y0 + 4.2, Math.max(z, z + side*0.35), '#e2d6c2'));
  return { x0, entrance: [x0 + 2.9, x0 + 5.1], z: zf, y0 };
}
function shutter(unit, frac, side = 1){ // frac 0 = open (rolled up), 1 = closed
  const [a, b] = unit.entrance, h = 2.9*frac, z = unit.z + side*0.04, y0 = unit.y0;
  if (frac <= 0.01) return [];
  const f = face(side > 0 ? [[a,y0+2.9-h,z],[b,y0+2.9-h,z],[b,y0+2.9,z],[a,y0+2.9,z]] : [[b,y0+2.9-h,z],[a,y0+2.9-h,z],[a,y0+2.9,z],[b,y0+2.9,z]], '#a8adb3', [0,0,side], { nohatch: true });
  f.decals = []; for (let y = y0 + 2.9 - 0.18; y > y0 + 2.9 - h; y -= 0.18) f.decals.push(line3([[a, y, z + side*0.01], [b, y, z + side*0.01]], { w: 1, a: .55 }));
  return [f];
}

// ---- MALL corridor (also used for the top floor) ----
function buildMall(variant = 0){
  const F = [], X0 = -64, X1 = 64;
  const fl = plane(X0, -7, X1, 7, 0, variant ? '#ddd4c6' : '#e8dfcf'); fl.decals = [];
  for (let x = X0; x < X1; x += 2) for (let z = -7; z < 7; z += 2) if (((x + z) / 2) & 1) fl.decals.push(plane(x, z, x + 2, z + 2, 0, variant ? '#cfc4b2' : '#d9cdb8', { simple: true }));
  F.push(fl);
  const units = { back: [], front: [] };
  let i = variant * 5;
  for (let x = X0; x < X1; x += 8){ units.back.push(shopUnit(F, x, -7, 0, 1, i++)); }
  for (let x = X0; x < X1; x += 8){ units.front.push(shopUnit(F, x, 7, 0, -1, i++ + 3)); }
  // balconies + upper shops
  F.push(...box(X0, 4.2, -7, X1, 4.7, -3.6, '#e8decd', { bottom: true, bottom_: 1, nohatch: true }));
  F.push(...box(X0, 4.2, 3.6, X1, 4.7, 7, '#e8decd', { bottom: true, nohatch: true }));
  F.push(face([[X0,4.7,-3.6],[X1,4.7,-3.6],[X1,5.7,-3.6],[X0,5.7,-3.6]], '#cfe6ee', [0,0,1], { alpha: .35, nohatch: true, edge: false }));
  F.push(face([[X1,4.7,3.6],[X0,4.7,3.6],[X0,5.7,3.6],[X1,5.7,3.6]], '#cfe6ee', [0,0,-1], { alpha: .35, nohatch: true, edge: false }));
  F.push(line3([[X0,5.7,-3.6],[X1,5.7,-3.6]], { w: 2.4, a: .9 }), line3([[X0,5.7,3.6],[X1,5.7,3.6]], { w: 2.4, a: .9 }));
  for (let x = X0; x < X1; x += 8){ const up = rectZ(x, 4.7, x + 8, 9.5, -7, '#e9dfcc', { layer: -1 }); up.decals = [rectZ(x + 0.8, 5.0, x + 7.2, 7.6, -6.99, '#b9d8e6', { nohatch: true }), sign([x+1.5, 8.4, -6.98], [x+6.5, 8.4, -6.98], [x+1.5, 7.8, -6.98], SHOPS[(i++) % SHOPS.length], { bg: dk(SHOP_COL[i % 10], .55), col: '#fff6e0' })]; F.push(up);
    const up2 = face([[x+8,4.7,7],[x,4.7,7],[x,9.5,7],[x+8,9.5,7]], '#e9dfcc', [0,0,-1], { layer: -1 }); F.push(up2); }
  F.push(plane(X0, -7, X1, 7, 9.5, '#f3ead8', { down: true, layer: -2 }));
  for (let x = X0; x < X1; x += 6) F.push(face([[x,9.48,-2],[x+3,9.48,-2],[x+3,9.48,2],[x,9.48,2]], '#fbf6e6', [0,-1,0], { layer: -2, simple: true, flat: true }));
  F.push(rectX(-7, 0, 7, 9.5, X0, '#e2d6c0', { layer: -2, nx: 1 }), rectX(7, 0, -7, 9.5, X1, '#e2d6c0', { layer: -2, nx: -1 }));
  for (let x = X0 + 19; x < X1; x += 18){ const z = -5.3; F.push(...box(x - 0.6, 0, z - 0.6, x + 0.6, 0.6, z + 0.6, '#8f7a64', { top: '#6b4a33' }), ...cone(x, z, 0.55, 0.6, 1.9, 7, '#6f9455', { rot: x }), ...box(x + 3, 0.3, z - 0.3, x + 5, 0.45, z + 0.3, '#7a5a48'), ...box(x + 3.1, 0, z - 0.2, x + 3.25, 0.3, z + 0.2, '#555'), ...box(x + 4.75, 0, z - 0.2, x + 4.9, 0.3, z + 0.2, '#555')); }
  return { faces: F, units, bg: indoorBg('#f3ead8', '#e6dccb'), fog: { col: hex('#efe5d2'), near: 18, far: 90, max: .7 } };
}

// ---- CLOTHING STORE ----
function rackFaces(x, z, seed){
  const F = [], r = mulberry(seed);
  F.push(...box(x - 1.2, 1.38, z - 0.03, x + 1.2, 1.44, z + 0.03, '#555b62', { nohatch: true }));
  F.push(...box(x - 1.2, 0, z - 0.03, x - 1.14, 1.44, z + 0.03, '#555b62', { nohatch: true }), ...box(x + 1.14, 0, z - 0.03, x + 1.2, 1.44, z + 0.03, '#555b62', { nohatch: true }));
  for (let k = 0; k < 7; k++){ const gx = x - 1.0 + k*0.32, c = CROWD_TOPS[(r()*CROWD_TOPS.length)|0], gz = z + 0.02 + k*0.012;
    F.push(face([[gx-0.17,0.55,gz],[gx+0.17,0.55,gz],[gx+0.2,1.38,gz],[gx-0.2,1.38,gz]], c, [0,0,1], { nohatch: true, ew: 1 })); }
  return F;
}
function curtainFace(x0, x1, z, open, col){ // open 0..1 -> bunches to the left
  const w = (x1 - x0) * (1 - 0.82*open), f = face([[x0,0.15,z],[x0 + w,0.15,z],[x0 + w,2.2,z],[x0,2.2,z]], col, [0,0,1], { nohatch: true });
  f.decals = []; for (let k = 1; k < 6; k++){ const fx = x0 + w*k/6; f.decals.push(line3([[fx, 0.2, z + 0.01], [fx, 2.15, z + 0.01]], { w: 1.2, a: .5 })); }
  return f;
}
function buildStore(){
  const F = [];
  const fl = plane(-10, -7, 10, 6, 0, '#c9a77c'); fl.decals = [];
  for (let z = -7; z < 6; z += 0.45) fl.decals.push(line3([[-10, 0, z], [10, 0, z]], { w: .8, a: .3 }));
  F.push(fl, rectZ(-10, 0, 10, 4, -7, '#efe3d0', { layer: -1, edge: false }), rectX(-7, 0, 6, 4, -10, '#e5d6be', { layer: -1, edge: false, nx: 1 }), rectX(6, 0, -7, 4, 10, '#e5d6be', { layer: -1, edge: false, nx: -1 }));
  F.push(plane(-10, -7, 10, 6, 4, '#f6eedf', { down: true, layer: -2 }));
  // wall shelves with folded clothes
  for (let y = 0.6; y < 2.8; y += 0.7){ F.push(...box(-9.6, y, -7, -2.5, y + 0.06, -6.5, '#a58763', { nohatch: true }));
    for (let x = -9.4; x < -2.8; x += 0.55) F.push(...box(x, y + 0.06, -6.95, x + 0.4, y + 0.26, -6.6, CROWD_TOPS[Math.abs(Math.round(x*7 + y*3)) % CROWD_TOPS.length], { nohatch: true, ew: 1 })); }
  // changing rooms: booths x 2..8 (3 x 2m), front at z=-5
  for (let k = 0; k <= 3; k++){ const x = 2 + k*2; F.push(...box(x - 0.06, 0, -7, x + 0.06, 2.3, -5, '#d9cbb4')); }
  F.push(...box(1.94, 2.3, -7, 8.06, 2.6, -4.95, '#cdbda4'));
  F.push(sign([3.2, 2.58, -4.94], [6.8, 2.58, -4.94], [3.2, 2.32, -4.94], 'FITTING ROOMS', { bg: '#7b2e3a', col: '#fff3e0', size: 24 }));
  // back door + exit sign
  const door = rectZ(-0.4, 0, 1.2, 2.2, -6.99, '#6b8f71', { nohatch: true }); door.decals = [line3([[-0.2, 1.05, -6.97], [1.0, 1.05, -6.97]], { w: 3, a: .9 })];
  F.push(door, sign([-0.3, 2.75, -6.98], [1.1, 2.75, -6.98], [-0.3, 2.4, -6.98], 'EXIT', { bg: '#2f9a55', col: '#ffffff', size: 34, glow: true }));
  F.push(sign([-4, 3.6, -6.98], [4, 3.6, -6.98], [-4, 3.0, -6.98], 'STYLE CO.', { bg: '#c97b6b', col: '#fff6e0', size: 34 }));
  F.push(...box(-7.5, 0, -4.5, -5, 1.0, -3.5, '#8a6f55', { top: '#e6dccb' }));
  return { faces: F, bg: indoorBg('#f6eedf', '#e9dcc4'), fog: null };
}

// ---- FOOD COURT ----
function tableFaces(x, z, seed = 0){
  const F = [];
  F.push(...box(x - 0.6, 0.72, z - 0.45, x + 0.6, 0.78, z + 0.45, '#f1ece2', { top: '#f6f1e6' }));
  F.push(...prism(x, z, 0.06, 0, 0.72, 5, '#5a5a62', { edge: false }), ...box(x - 0.35, 0, z - 0.35, x + 0.35, 0.04, z + 0.35, '#5a5a62', { edge: false }));
  return F;
}
function chairFaces(x, z, c){ return [...box(x - 0.22, 0.42, z - 0.22, x + 0.22, 0.47, z + 0.22, c), ...box(x - 0.22, 0.47, z - 0.24, x + 0.22, 0.95, z - 0.2, c), ...box(x - 0.2, 0, z - 0.02, x - 0.16, 0.42, z + 0.02, '#555', { edge: false }), ...box(x + 0.16, 0, z - 0.02, x + 0.2, 0.42, z + 0.02, '#555', { edge: false })]; }
const FC_TABLES = []; for (const z of [-6.5, -3, 0.5]) for (let x = -12; x <= 12; x += 3.5) FC_TABLES.push([x + (z === -3 ? 1.75 : 0), z]);
function buildFoodCourt(skip = []){
  const F = [];
  const fl = plane(-20, -12, 20, 9, 0, '#ece4d4'); fl.decals = [];
  for (let x = -20; x < 20; x += 1.5) for (let z = -12; z < 9; z += 1.5) if ((Math.round(x/1.5) + Math.round(z/1.5)) & 1) fl.decals.push(plane(x, z, x + 1.5, z + 1.5, 0, '#ddd2bd', { simple: true }));
  F.push(fl, rectZ(-20, 0, 20, 7, -12, '#e8dcc6', { layer: -1, edge: false }), plane(-20, -12, 20, 9, 7, '#f2e9d8', { down: true, layer: -2 }));
  const stalls = [['NOODLES','#c4473a'],['PIZZA','#e0a23c'],['BURGERS','#3d6f9a'],['TACOS','#5f9a4a'],['SUSHI','#2f2f3a'],['DONUTS','#d16fa0']];
  stalls.forEach(([n, c], k) => { const x = -18 + k*6.2;
    F.push(...box(x, 0, -12, x + 5.6, 1.1, -10.9, c, { top: '#e8e2d4' }));
    const back = rectZ(x, 1.1, x + 5.6, 3.6, -11.98, dk(c, 1.25), { nohatch: true }); back.decals = [rectZ(x + 0.6, 1.5, x + 2.6, 2.8, -11.96, '#2b2b30', { nohatch: true }), rectZ(x + 3.0, 1.5, x + 5.0, 2.8, -11.96, '#2b2b30', { nohatch: true })]; F.push(back);
    for (let s = 0; s < 6; s++) F.push(face([[x + s*0.93, 3.6, -11.9], [x + (s+1)*0.93, 3.6, -11.9], [x + (s+1)*0.93, 3.9, -11.2], [x + s*0.93, 3.9, -11.2]], s & 1 ? '#f6f1e6' : c, norm([0, 0.9, 0.4])));
    F.push(sign([x + 0.5, 4.8, -11.95], [x + 5.1, 4.8, -11.95], [x + 0.5, 4.0, -11.95], n, { bg: c, col: '#fff6e0', size: 34 })); });
  FC_TABLES.forEach(([x, z], i) => { if (skip.includes(i)) return; F.push(...tableFaces(x, z)); F.push(...chairFaces(x - 0.9, z, CROWD_TOPS[i % 12]), ...chairFaces(x + 0.9, z, CROWD_TOPS[(i + 5) % 12])); });
  for (const x of [-16, 16]) F.push(...box(x - 0.4, 0, -9, x + 0.4, 7, -8.2, '#e2d6c0'));
  for (let x = -15; x <= 15; x += 7.5) F.push(line3([[x, 7, -4], [x, 5.4, -4]], { w: 1.2 }), ...cone(x, -4, 0.5, 5.0, 5.5, 8, '#e0b26a'));
  return { faces: F, bg: indoorBg('#f2e9d8', '#e6dccb'), fog: { col: hex('#efe5d2'), near: 14, far: 50, max: .6 } };
}

// ---- ATRIUM with escalator ----
const ESC = { x0: -1, x1: 6.5, top: 5.0 };
const escY = x => x < ESC.x0 ? 0 : x > ESC.x1 ? ESC.top : ESC.top * (x - ESC.x0) / (ESC.x1 - ESC.x0);
function buildAtrium(){
  const F = [];
  const fl = plane(-25, -10, 35, 10, 0, '#e8dfcf'); fl.decals = [];
  for (let x = -24; x < 34; x += 2) for (let z = -10; z < 10; z += 2) if (((x + z)/2) & 1) fl.decals.push(plane(x, z, x + 2, z + 2, 0, '#d9cdb8', { simple: true }));
  F.push(fl);
  let i = 2; for (let x = -24; x < 32; x += 8){ shopUnit(F, x, -10, 0, 1, i++); const up = rectZ(x, 4.6, x + 8, 10, -10, '#e9dfcc', { layer: -1 }); up.decals = [rectZ(x + 0.8, 5.4, x + 7.2, 8.4, -9.99, '#b9d8e6', { nohatch: true }), sign([x + 1.5, 9.4, -9.98], [x + 6.5, 9.4, -9.98], [x + 1.5, 8.8, -9.98], SHOPS[(i + 6) % SHOPS.length], { bg: dk(SHOP_COL[i % 10], .55), col: '#fff6e0' })]; F.push(up); }
  F.push(...box(7.5, 4.6, -10, 35, 5.0, 4, '#e8decd', { bottom: true, nohatch: true }));
  F.push(face([[7.5,5.0,4],[35,5.0,4],[35,6.0,4],[7.5,6.0,4]], '#cfe6ee', [0,0,1], { alpha: .35, edge: false, nohatch: true }), line3([[7.5,6.0,4],[35,6.0,4]], { w: 2.4 }));
  F.push(plane(-25, -10, 35, 10, 11, '#f3ead8', { down: true, layer: -2 }));
  // escalator
  const sy = escY, Z = 0.75;
  for (let x = ESC.x0 - 1.5; x < ESC.x1 + 1; x += 0.42){ const y = sy(x + 0.21); F.push(...box(x, y - 0.18, -0.6, x + 0.42, y, 0.6, '#77808a', { top: '#5f666e', edge: false, nohatch: true })); }
  const panel = (z, nz) => face([[-3, 0, z], [-0.6, 0, z], [6.3, 4.1, z], [7.5, 4.1, z], [7.5, 5.15, z], [6.5, 5.15, z], [-1, 0.15, z], [-3, 0.15, z]].map(p => nz > 0 ? p : p).reverse(), '#9aa3ab', [0, 0, nz], { nohatch: true });
  F.push(panel(Z, 1), panel(-Z, -1));
  const glass = (z, nz) => face([[-3, 0.15, z], [-1, 0.15, z], [6.5, 5.15, z], [7.5, 5.15, z], [7.5, 6.1, z], [6.5, 6.1, z], [-1, 1.1, z], [-3, 1.1, z]].reverse(), '#cfe6ee', [0, 0, nz], { alpha: .3, edge: false, nohatch: true, zbias: -0.3 });
  F.push(glass(Z, 1), glass(-Z, -1));
  F.push(line3([[-3, 1.1, Z], [-1, 1.1, Z], [6.5, 6.1, Z], [7.5, 6.1, Z]], { w: 4, a: .95, col: '#1c1a1e' }), line3([[-3, 1.1, -Z], [-1, 1.1, -Z], [6.5, 6.1, -Z], [7.5, 6.1, -Z]], { w: 3, a: .8, col: '#1c1a1e' }));
  return { faces: F, bg: indoorBg('#f3ead8', '#e6dccb'), fog: { col: hex('#efe5d2'), near: 18, far: 70, max: .6 } };
}

// ---- SERVICE corridor ----
function buildService(){
  const F = [], X1 = 40;
  F.push(plane(-6, -1.4, X1, 1.4, 0, '#7f817b'), plane(-6, -1.4, X1, 1.4, 2.9, '#9c9e98', { down: true, layer: -2 }));
  const wl = rectZ(-6, 0, X1, 2.9, -1.4, '#b7bea9', { layer: -1, edge: false }), wr = face([[X1,0,1.4],[-6,0,1.4],[-6,2.9,1.4],[X1,2.9,1.4]], '#aeb5a0', [0,0,-1], { layer: -1, edge: false });
  wl.decals = []; wr.decals = [];
  for (let x = -6; x < X1; x += 1.2){ wl.decals.push(line3([[x, 0, -1.39], [x, 2.9, -1.39]], { w: .7, a: .25 })); }
  for (const x of [2, 11, 23]) wl.decals.push(rectZ(x, 0, x + 1.1, 2.1, -1.39, '#8a7f6e', { nohatch: true }));
  for (const x of [6, 17, 30]) wr.decals.push(face([[x + 1.1, 0, 1.39], [x, 0, 1.39], [x, 2.1, 1.39], [x + 1.1, 2.1, 1.39]], '#8a7f6e', [0,0,-1], { nohatch: true }));
  wl.decals.push(rectZ(-6, 0, X1, 0.15, -1.38, '#e0b23a', { nohatch: true, edge: false }));
  F.push(wl, wr, rectX(-1.4, 0, 1.4, 2.9, -6, '#a9b09b', { layer: -2, nx: 1 }));
  F.push(...box(-6, 2.45, -1.4, X1, 2.6, -1.25, '#a8432f', { nohatch: true }), ...box(-6, 2.2, -1.4, X1, 2.32, -1.28, '#8b9096', { nohatch: true }), ...box(-6, 2.5, 1.22, X1, 2.68, 1.4, '#8b9096', { nohatch: true }));
  for (let x = -4; x < X1; x += 4.5) F.push(face([[x, 2.89, -0.2], [x + 1.4, 2.89, -0.2], [x + 1.4, 2.89, 0.2], [x, 2.89, 0.2]], '#fffbe6', [0,-1,0], { glow: true, flat: true, layer: -2 }));
  F.push(...box(8, 0, -1.4, 8.8, 0.9, -0.9, '#6f7f8f'), ...box(19, 0, 0.8, 19.6, 0.6, 1.4, '#c4a35a'), ...prism(26, -1.0, 0.25, 0, 0.5, 8, '#e0b23a'));
  return { faces: F, X1, bg: indoorBg('#9c9e98', '#7f817b'), fog: { col: hex('#8d918a'), near: 8, far: 45, max: .7 } };
}
function exitDoorFaces(x, open){ // end door of the service corridor, hinge at z=-0.6
  const F = [], ang = open * 1.6;
  F.push(rectX(-0.65, 0, 0.65, 2.2, x + 0.02, open > 0.02 ? '#fff8e6' : '#3d3a36', { nx: -1, flat: true, glow: open > 0.02, layer: -1 }));
  const d = face([[x, 0, -0.6], [x, 0, 0.6], [x, 2.15, 0.6], [x, 2.15, -0.6]].reverse(), '#5f7f63', [-1, 0, 0], { nohatch: true, two: true });
  d.decals = [line3([[x - 0.01, 1.0, -0.4], [x - 0.01, 1.0, 0.45]], { w: 3 })];
  F.push(...rotFaces([d], [x, 0, -0.6], 'y', -ang));
  F.push(sign([x - 0.02, 2.72, -0.5], [x - 0.02, 2.72, 0.5], [x - 0.02, 2.36, -0.5], 'EXIT', { bg: '#2f9a55', col: '#ffffff', size: 34, glow: true }));
  return F;
}

// ---- CAR PARK ----
function carFaces(x, z, col, o = {}){
  const F = [], L = 2.1, Wd = 0.9;
  const body = box(x - L, 0.32, z - Wd, x + L, 0.98, z + Wd, col, { nohatch: true });
  body[3].decals = [line3([[x - 0.3, 0.4, z + Wd + 0.01], [x - 0.3, 0.97, z + Wd + 0.01]], { w: 1, a: .6 }), line3([[x + 0.9, 0.4, z + Wd + 0.01], [x + 0.9, 0.97, z + Wd + 0.01]], { w: 1, a: .6 })];
  body[0].decals = [rectX(z - 0.8, 0.6, z - 0.4, 0.8, x + L + 0.01, o.lights || '#f4e7b5', { nohatch: true, glow: !!o.lights, flat: !!o.lights }), rectX(z + 0.4, 0.6, z + 0.8, 0.8, x + L + 0.01, o.lights || '#f4e7b5', { nohatch: true, glow: !!o.lights, flat: !!o.lights })];
  body[1].decals = [rectX(z + 0.8, 0.6, z + 0.4, 0.8, x - L - 0.01, o.lights || '#c43a2f', { nx: -1, nohatch: true, glow: !!o.lights, flat: !!o.lights }), rectX(z - 0.4, 0.6, z - 0.8, 0.8, x - L - 0.01, o.lights || '#c43a2f', { nx: -1, nohatch: true, glow: !!o.lights, flat: !!o.lights })];
  F.push(...body);
  const cab = box(x - 1.2, 0.98, z - 0.8, x + 0.9, 1.5, z + 0.8, dk(col, .92), { nohatch: true });
  cab[3].decals = [rectZ(x - 1.05, 1.03, x - 0.15, 1.44, z + 0.81, '#4f6474', { nohatch: true }), rectZ(x - 0.05, 1.03, x + 0.75, 1.44, z + 0.81, '#4f6474', { nohatch: true })];
  cab[4].decals = [face([[x + 0.75, 1.03, z - 0.81], [x - 1.05, 1.03, z - 0.81], [x - 1.05, 1.44, z - 0.81], [x + 0.75, 1.44, z - 0.81]], '#4f6474', [0,0,-1], { nohatch: true })];
  F.push(...cab);
  for (const wx of [x - 1.35, x + 1.35]) for (const s of [1, -1]){ const w = discZ(wx, 0.33, z + s*(Wd + 0.02), 0.33, '#1f1e22', { nz: s, nohatch: true }); w.decals = [discZ(wx, 0.33, z + s*(Wd + 0.03), 0.14, '#9aa0a6', { nz: s, nohatch: true })]; F.push(w); }
  if (o.door){ const d = face([[x - 0.25, 0.38, z + Wd], [x + 0.9, 0.38, z + Wd], [x + 0.9, 1.4, z + Wd], [x - 0.25, 1.4, z + Wd]], col, [0,0,1], { nohatch: true, two: true });
    F.push(...rotFaces([d], [x + 0.9, 0, z + Wd], 'y', -o.door)); }
  return F;
}
const CARS = [[-18, -8.5, '#3d6f9a'], [-10, -8.5, '#e8e4da'], [6, -8.5, '#c4473a'], [14, -8.5, '#2f2f3a'], [22, -8.5, '#7aa65a'], [-22, 3.2, '#e0a23c'], [-13, 3.2, '#8e6fd1'], [12, 3.2, '#e8e4da'], [20, 3.2, '#3d6f9a']];
function buildCarPark(heroDoor = 0.5){
  const F = [];
  const fl = plane(-40, -14, 45, 12, 0, '#8d8c87'); fl.decals = [];
  for (let x = -40; x < 45; x += 3) { fl.decals.push(plane(x, -11, x + 0.1, -6.3, 0, '#e9e6dc', { simple: true }), plane(x, 1, x + 0.1, 5.6, 0, '#e9e6dc', { simple: true })); }
  fl.decals.push(plane(-40, -1.7, 45, -1.55, 0, '#e0b23a', { simple: true }));
  F.push(fl, plane(-40, -14, 45, 12, 2.9, '#a7a59f', { down: true, layer: -2 }));
  const back = rectZ(-40, 0, 45, 2.9, -14, '#b8b4aa', { layer: -1, edge: false }); back.decals = [rectZ(-6.7, 0, -5.3, 2.2, -13.99, '#6f8a6a', { nohatch: true }), sign([-6.7, 2.75, -13.98], [-5.3, 2.75, -13.98], [-6.7, 2.4, -13.98], 'EXIT', { bg: '#2f9a55', col: '#fff', size: 34, glow: true })];
  for (let x = -38; x < 44; x += 6) back.decals.push(sign([x, 1.9, -13.98], [x + 1.2, 1.9, -13.98], [x, 1.5, -13.98], 'P' + (2 + ((x/6)|0) % 3 + 3), { bg: '#3d6f9a', col: '#fff', size: 30 }));
  F.push(back, face([[45, 0, -14], [45, 0, 12], [45, 2.9, 12], [45, 2.9, -14]].reverse(), '#fbf6e6', [-1, 0, 0], { flat: true, layer: -2, edge: false }));
  for (let x = -36; x < 45; x += 8) F.push(...box(x - 0.18, 2.5, -14, x + 0.18, 2.9, 12, '#9e9c96', { nohatch: true, bottom: true }));
  for (let x = -32; x < 44; x += 8) for (const z of [-4.5, 7.5]) F.push(...box(x - 0.3, 0, z - 0.3, x + 0.3, 2.9, z + 0.3, '#bdb9ae', { front: '#c8c4b8' }));
  for (const [x, z, c] of CARS) F.push(...carFaces(x, z, c));
  return { faces: F, bg: indoorBg('#a7a59f', '#8d8c87'), fog: { col: hex('#a9a69e'), near: 10, far: 45, max: .65 } };
}

// ---- STREET outside the car park ----
function buildStreet(){
  const F = [], r = mulberry(5);
  F.push(plane(-50, 2, 70, 30, 0, '#a8a59d'));                         // car park apron (near side)
  const road = plane(-50, -6, 70, 2, 0, '#8e8a86'); road.decals = [];
  for (let x = -50; x < 70; x += 4.5) road.decals.push(plane(x, -2.15, x + 2.2, -1.85, 0, '#f2e8c8', { simple: true }));
  for (let x = 6; x < 12; x += 0.8) road.decals.push(plane(x, -5.6, x + 0.45, 1.6, 0, '#f4f1e4', { simple: true }));
  F.push(road, plane(-50, -10, 70, -6, 0, '#cbc1af'));
  F.push(...box(-50, 0, 1.85, 70, 0.15, 2.0, '#bdb4a3'), ...box(-50, 0, -6.15, 70, 0.15, -6.0, '#bdb4a3'));
  for (let x = -40; x < 60; x += 2){ F.push(...box(x, 0, 2.6, x + 0.1, 0.8, 2.7, '#c9a227', { edge: false, nohatch: true })); }
  F.push(...box(-40, 0.72, 2.58, 60, 0.82, 2.72, '#e0b23a', { nohatch: true }));
  const pal = ['#d98e6a','#e8c07a','#9bb0a6','#c97b6b','#b6a58e','#8fa3bf','#d7a58c'];
  for (let x = -40; x < 70;){ const w = 5 + r()*4, h = 6 + r()*10, c = pal[(r()*pal.length)|0];
    const fb = box(x, 0, -18, x + w - 0.3, h, -10.5, c, { top: '#8a7d70' }); fb[3].decals = [];
    for (let wy = 1.6; wy < h - 0.8; wy += 2) for (let wx = x + 0.7; wx < x + w - 1.2; wx += 1.5) fb[3].decals.push(rectZ(wx, wy, wx + 0.8, wy + 1.1, -10.48, r() < .25 ? '#f3dc9a' : '#5f7a96', { nohatch: true, ew: 1 }));
    F.push(...fb); x += w; }
  // multi-storey car park on the near side
  const cp = box(-40, 0, 6, 40, 12, 30, '#b8b4aa', { nohatch: true }); cp[3].decals = [];
  for (let y = 0; y < 12; y += 3){ cp[3].decals.push(rectZ(-40, y + 0.9, 40, y + 2.6, 6.01, '#55534e', { nohatch: true })); }
  cp[3].decals.push(sign([-4, 11.4, 6.02], [4, 11.4, 6.02], [-4, 10.2, 6.02], 'CAR PARK', { bg: '#3d6f9a', col: '#fff', size: 34 }));
  F.push(...cp);
  for (let x = -36; x < 66; x += 13){ F.push(...prism(x, -6.6, 0.07, 0, 4.2, 5, '#3f4a52', { edge: false }), ...box(x - 0.1, 4.1, -6.85, x + 0.9, 4.3, -6.4, '#3f4a52')); }
  return { faces: F, bg: skyBg('#9db7cf', '#ede3cf', [[200, 110, 120, 4], [900, 70, 150, 3], [1400, 150, 90, 5]]), fog: { col: hex('#e6dccb'), near: 16, far: 80, max: .7 } };
}
