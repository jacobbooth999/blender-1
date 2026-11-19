// ============================================================================
// Sketch engine: hand-drawn 2D characters (boiling ink, animated on 12s) living
// in a sketchy watercolour 3D world. Shared by film.html.
// ============================================================================
const W = 1600, H = 900, FPS = 12;
const Q = new URLSearchParams(location.search);
const DPR = +(Q.get('dpr') || 1.2);
const cv = document.getElementById('c');
cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
const mainCtx = cv.getContext('2d');
let ctx = mainCtx;

// ---------- math ----------
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const lerp = (a, b, p) => a + (b - a) * p, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]], add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };
const hex = c => { if (Array.isArray(c)) return c; if (c.startsWith('rgb')) return c.match(/[\d.]+/g).slice(0,3).map(Number); c = c.replace('#',''); return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]; };
const rgba = (a, al = 1) => `rgba(${a[0]|0},${a[1]|0},${a[2]|0},${al})`;
const mix = (a, b, p) => [lerp(a[0],b[0],p), lerp(a[1],b[1],p), lerp(a[2],b[2],p)];
const shadeRGB = (c, k, cool = 0) => [c[0]*k - cool*14, c[1]*k - cool*4, c[2]*k + cool*16].map(v => clamp(v, 0, 255));
const dk = (c, k) => rgba(shadeRGB(hex(c), k));
function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let BOIL = 0, SC = 0, INKK = 1;
const R = () => { SC++; return mulberry(((BOIL + 1) * 73856093) ^ (SC * 19349663)); };
const INK = '#1c1a1e', PENCIL = [61, 52, 44];
const EASE = {
  snap: p => { const s = 2.1, q = p - 1; return 1 + (s+1)*q*q*q + s*q*q; },
  out: p => 1 - Math.pow(1-p, 3), in: p => p*p*p,
  inout: p => p*p*(3-2*p), lin: p => p,
};

// ---------- 2D primitives ----------
function pathPts(p){ ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); }
function resample(pts, step){
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++){
    const a = pts[i-1], b = pts[i], d = Math.hypot(b[0]-a[0], b[1]-a[1]), n = Math.max(1, Math.ceil(d / step));
    for (let k = 1; k <= n; k++) out.push([a[0]+(b[0]-a[0])*k/n, a[1]+(b[1]-a[1])*k/n]);
  }
  return out;
}
function inkLine(pts, w, color, o = {}){
  const r = R(), j = o.jit ?? 1, step = o.step ?? 5; w *= INKK;
  let p = resample(pts, step); const n = p.length; if (n < 2) return;
  const ph1 = r()*6.28, ph2 = r()*6.28, f1 = 0.12 + r()*0.2, wb = 0.85 + r()*0.3, ta = o.ta ?? 0.25;
  p = p.map((q, i) => [q[0] + Math.sin(i*f1+ph1)*j + (r()-.5)*j*.5, q[1] + Math.sin(i*f1*1.3+ph2)*j + (r()-.5)*j*.5]);
  const L = [], Rr = [];
  for (let i = 0; i < n; i++){
    const a = p[Math.max(0,i-1)], b = p[Math.min(n-1,i+1)];
    let tx = b[0]-a[0], ty = b[1]-a[1]; const d = Math.hypot(tx,ty) || 1; tx /= d; ty /= d;
    const u = i/(n-1);
    const tp = o.flat ? 1 : Math.max(0.12, Math.pow(Math.min(1, u/ta, (1-u)/ta), 0.6));
    const ww = w * wb * tp * (0.82 + 0.36*(0.5+0.5*Math.sin(i*0.23+ph1))) / 2;
    L.push([p[i][0]-ty*ww, p[i][1]+tx*ww]); Rr.push([p[i][0]+ty*ww, p[i][1]-tx*ww]);
  }
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = color;
  pathPts(L.concat(Rr.reverse())); ctx.fill(); ctx.restore();
}
function shape(loop, fill, o = {}){
  const r = R(), mis = o.mis ?? [1.8, -1.2], sh = o.sh ?? 3.2;
  const shifted = loop.map(p => [p[0]+mis[0], p[1]+mis[1]]);
  ctx.save();
  pathPts(shifted); ctx.fillStyle = fill; ctx.fill();
  if (o.shade !== false){
    ctx.clip(); ctx.fillStyle = rgba(shadeRGB(hex(fill), 0.74, 0.35)); ctx.fill();
    pathPts(shifted.map(p => [p[0]-sh, p[1]-sh])); ctx.fillStyle = fill; ctx.fill();
  }
  ctx.restore();
  if (o.ink === 0) return;
  const n = loop.length, st = Math.floor(r()*n), ext = Math.ceil(n*0.07);
  const seq = []; for (let i = 0; i <= n + ext; i++) seq.push(loop[(st+i) % n]);
  inkLine(seq, o.ink ?? 2.6, INK, { jit: o.jit ?? 0.7, step: 4, ta: 0.1 });
}
function circlePts(cx, cy, rx, ry = rx, n = 28){ const r = R(), out = []; for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2; const k = 1 + (r()-.5)*0.05; out.push([cx+Math.cos(a)*rx*k, cy+Math.sin(a)*ry*k]); } return out; }
function squarePts(cx, cy, rx, ry, n = 28, e = 0.55){ const out = []; for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2, c = Math.cos(a), s = Math.sin(a); out.push([cx + rx*Math.sign(c)*Math.pow(Math.abs(c), e), cy + ry*Math.sign(s)*Math.pow(Math.abs(s), e)]); } return out; }
function tubeLoop(pts, ws){
  const p = resample(pts, 4), n = p.length;
  const cum = [0]; for (let i = 1; i < n; i++) cum.push(cum[i-1] + Math.hypot(p[i][0]-p[i-1][0], p[i][1]-p[i-1][1]));
  const jc = [0]; for (let i = 1; i < pts.length; i++) jc.push(jc[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
  const wAt = s => { for (let i = 1; i < jc.length; i++) if (s <= jc[i] || i === jc.length-1){ const u = clamp((s-jc[i-1])/((jc[i]-jc[i-1])||1),0,1); return lerp(ws[i-1], ws[i], u); } return ws[0]; };
  const L = [], Rr = [], T = [];
  for (let i = 0; i < n; i++){
    const a = p[Math.max(0,i-2)], b = p[Math.min(n-1,i+2)];
    let tx = b[0]-a[0], ty = b[1]-a[1]; const d = Math.hypot(tx,ty) || 1; tx /= d; ty /= d; T.push([tx,ty]);
    const w = wAt(cum[i]) / 2;
    L.push([p[i][0]-ty*w, p[i][1]+tx*w]); Rr.push([p[i][0]+ty*w, p[i][1]-tx*w]);
  }
  const cap = (c, t, w, from) => { const out = [], a0 = Math.atan2(t[1], t[0]); for (let k = 1; k < 6; k++){ const a = a0 + from - k*Math.PI/6; out.push([c[0]+Math.cos(a)*w, c[1]+Math.sin(a)*w]); } return out; };
  return L.concat(cap(p[n-1], T[n-1], ws[ws.length-1]/2, Math.PI/2), Rr.reverse(), cap(p[0], T[0], ws[0]/2, -Math.PI/2));
}
const limb = (pts, ws, fill, o) => shape(tubeLoop(pts, ws), fill, o);
const P2 = (a, d, l) => [a[0] + d[0]*l, a[1] + d[1]*l];
const dn = a => [Math.sin(rad(a)), Math.cos(rad(a))];
const up = a => [Math.sin(rad(a)), -Math.cos(rad(a))];
function burst(c, rIn, rOut, n, fill, seedOff = 0){
  const r = mulberry(n*7 + seedOff + BOIL), pts = [];
  for (let i = 0; i < n*2; i++){ const a = i/(n*2)*Math.PI*2 + r()*0.2, rr = (i % 2 ? rIn : rOut)*(0.8 + r()*0.4); pts.push([c[0] + Math.cos(a)*rr, c[1] + Math.sin(a)*rr]); }
  shape(pts, fill, { ink: 2.4, shade: false, mis: [0, 0] });
}
function radLines(c, r0, r1, n, w = 2.6, seedOff = 0){
  const r = mulberry(n*13 + seedOff + BOIL);
  for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2 + r()*0.4, k = 0.8 + r()*0.5; inkLine([[c[0]+Math.cos(a)*r0, c[1]+Math.sin(a)*r0], [c[0]+Math.cos(a)*r1*k, c[1]+Math.sin(a)*r1*k]], w, INK, { jit: .4, ta: .5 }); }
}

// ---------- rig ----------
const STAND = { rx:0, air:0, torso:3, head:0, aFu:6, aFl:12, aBu:-6, aBl:12, lFu:4, lFl:-2, lBu:-4, lBl:-2, eye:'dot', mouth:'flat', brow:0, rot:0 };
const NUM = ['rx','air','torso','head','aFu','aFl','aBu','aBl','lFu','lFl','lBu','lBl','brow','gx','gy','ax','rot','hipY','hfx','hfy','hbx','hby'];
const DISC = ['eye','mouth','ik','hm','flip','sweat','glint','hipYon'];
const pz = o => ({ ...STAND, ...o });
// keys: [{t, in, ease, pose}] ; loop>0 wraps, otherwise holds the last key
function anim(keys, loop = 0){
  keys = keys.map(k => Array.isArray(k) ? { t: k[0], pose: k[1], in: k[2] ?? .08, ease: k[3] || 'snap' } : k);
  return t => {
    if (loop) t = ((t % loop) + loop) % loop;
    let i = loop ? keys.length - 1 : 0; for (let k = 0; k < keys.length; k++) if (keys[k].t <= t) i = k;
    const cur = keys[i], prev = loop ? keys[(i - 1 + keys.length) % keys.length] : keys[Math.max(0, i - 1)];
    const p = clamp((t - cur.t) / (cur.in || 0.1), 0, 1), e = EASE[cur.ease || 'snap'](p);
    const out = { ...cur.pose };
    for (const k of NUM){ const a = prev.pose[k] ?? STAND[k] ?? 0, b = cur.pose[k] ?? STAND[k] ?? 0; out[k] = a + (b - a)*e; }
    for (const k of DISC) out[k] = p < 0.35 ? prev.pose[k] : cur.pose[k];
    return out;
  };
}
const withPose = (fn, o) => t => ({ ...fn(t), ...(typeof o === 'function' ? o(t) : o) });
function fk(o, a, b, l1, l2){ const j = P2(o, dn(a), l1), e = P2(j, dn(a+b), l2); return [o, j, e, a+b]; }
function ik(o, t, l1, l2, bend = 1){
  const dx = t[0]-o[0], dy = t[1]-o[1], d = clamp(Math.hypot(dx,dy), Math.abs(l1-l2)+0.5, l1+l2-0.5), a = Math.atan2(dy,dx);
  const A = Math.acos(clamp((l1*l1 + d*d - l2*l2)/(2*l1*d), -1, 1)) * bend;
  const j = [o[0]+Math.cos(a+A)*l1, o[1]+Math.sin(a+A)*l1], e = [o[0]+Math.cos(a)*d, o[1]+Math.sin(a)*d];
  return [o, j, e, deg(Math.atan2(e[0]-j[0], e[1]-j[1]))];
}
function solve(P){
  const leg = (a, b) => 46*Math.cos(rad(a)) + 46*Math.cos(rad(a+b));
  const hy = P.hipYon ? P.hipY : -Math.max(leg(P.lFu,P.lFl), leg(P.lBu,P.lBl)) - (P.air || 0);
  const hip = [P.rx || 0, hy];
  const td = up(P.torso);
  const neck = P2(hip, td, 70), sh = P2(hip, td, 60), ha = P.torso + P.head, head = P2(neck, up(ha), 27);
  const r = { P, hip, td, neck, sh, ha, head, lF: fk(hip, P.lFu, P.lFl, 46, 46), lB: fk([hip[0]-3, hip[1]], P.lBu, P.lBl, 46, 46) };
  if (P.ik){
    r.grip = [sh[0] + P.gx, sh[1] + P.gy]; r.adir = up(P.ax);
    r.aB = ik(sh, r.grip, 36, 34);
    r.aF = P.ik === 2 ? null : ik(sh, P2(r.grip, r.adir, 26), 36, 34);
  } else { r.aF = fk(sh, P.aFu, P.aFl, 36, 34); r.aB = fk(sh, P.aBu, P.aBl, 36, 34); }
  if (P.hm){ // hands to points relative to the head centre (e.g. covering mouth, adjusting glasses)
    if (P.hm !== 'B') r.aF = ik(sh, [r.head[0] + P.hfx, r.head[1] + P.hfy], 36, 34, -1);
    if (P.hm === 2 || P.hm === 'B') r.aB = ik(sh, [r.head[0] + P.hbx, r.head[1] + P.hby], 36, 34, -1);
  }
  if (!r.aF) r.aF = fk(sh, P.aFu, P.aFl, 36, 34);
  return r;
}

// ---------- costumes ----------
const COS = {
  boy: { skin:'#f2c39c', top:'#d9483b', sleeve:'#d9483b', pants:'#3c5f93', shoe:'#efece4', hair:'#5a3a22', hairStyle:'swept', hood:true, backpack:'#2f3d4f', scale:0.97 },
  hunter: { skin:'#ead2bd', top:'#1f1f25', sleeve:'#1f1f25', pants:'#26262c', shoe:'#111114', hair:'#4a4a50', hairStyle:'buzz', coat:true, glasses:true, gloves:'#141417', face:'stern', scale:1.12, build:1.12 },
  guard: { skin:'#c99673', top:'#e8d33a', sleeve:'#2b3140', pants:'#2b3140', shoe:'#141414', hair:'#1e1a17', hairStyle:'buzz', vest:true, cap:'#2b3140', scale:1.02 },
  mannequin: { skin:'#e9dfcf', top:'#7fa1c4', sleeve:'#7fa1c4', pants:'#e9dfcf', shoe:'#e9dfcf', hair:'#e9dfcf', hairStyle:'bald', face:'blank', scale:1.0 },
};
const CROWD_TOPS = ['#5e8fbf','#e6a23c','#7aa65a','#b56db0','#e07a5f','#3d9a8f','#c9c2b0','#8e6fd1','#f2cc8f','#6d6875','#d1495b','#4f772d'];
const CROWD_PANTS = ['#2e3a59','#4a4a4a','#6b5b45','#1f2a44','#7a6c5d','#2b2d42','#55606e'];
const CROWD_HAIR = ['#2b1e17','#5a3a22','#c9a26b','#1a1a1a','#8b4513','#d8d0c0','#a0522d'];
const CROWD_SKIN = ['#f2c39c','#e0ac80','#c68e64','#a8754f','#8d5b3c','#f6d2b6','#6f4630'];
function randomCos(seed){
  const r = mulberry(seed * 977 + 13), pick = a => a[(r() * a.length) | 0];
  const styles = ['short','long','long','bun','buzz','bald','swept','short'];
  const top = pick(CROWD_TOPS);
  return { skin: pick(CROWD_SKIN), top, sleeve: r() < .6 ? top : pick(CROWD_SKIN), pants: pick(CROWD_PANTS), shoe: pick(['#2a2522','#efece4','#6b4a33','#1b1b1b']),
    hair: pick(CROWD_HAIR), hairStyle: pick(styles), scale: 0.88 + r() * 0.2, bag: r() < .3 ? pick(['#c46a52','#e0b26a','#3f5d7d']) : null };
}

// ---------- character drawing ----------
function drawArm(a, back, cos){
  const k = back ? 0.8 : 1, sleeve = dk(cos.sleeve, k), hand = dk(cos.gloves || cos.skin, k);
  limb([a[1], a[2]], [10, 9], cos.coat ? dk(cos.top, k*1.15) : (cos.sleeve === cos.top ? sleeve : hand), { ink: 2.3 });
  shape(circlePts(...P2(a[2], dn(a[3]), 3), 7, 7, 14), hand, { ink: 2.2, sh: 2 });
  limb([a[0], a[1]], [15, 12], cos.coat ? dk(cos.top, k*1.15) : sleeve, { ink: 2.4 });
}
function drawLeg(l, back, cos){
  const k = back ? 0.78 : 1;
  limb([l[0], l[1], l[2]], [20, 16, 13], dk(cos.pants, k), { ink: 2.5 });
  const fd = [Math.cos(rad(l[3])), -Math.sin(rad(l[3]))], sd = dn(l[3]);
  const a = P2(P2(l[2], fd, -3), sd, 3), b = P2(P2(l[2], fd, 15), sd, 5);
  limb([a, b], [12, 11], dk(cos.shoe, back ? 0.85 : 1), { ink: 2.4, sh: 2 });
}
function drawHair(cos){
  const st = cos.hairStyle, c = cos.hair;
  if (st === 'bald') return;
  if (st === 'buzz'){ const hp = []; for (let a = -30; a >= -205; a -= 12) hp.push([Math.cos(rad(a))*26.5, Math.sin(rad(a))*26.5]); for (let a = -205; a <= -30; a += 15) hp.push([Math.cos(rad(a))*21, Math.sin(rad(a))*21 - 3]); shape(hp, c, { ink: 2.2, shade: false, mis: [1,-1] }); return; }
  if (st === 'long'){ shape([[-6,-26],[-26,-12],[-30,10],[-26,38],[-12,40],[-10,14],[-4,-8]], c, { ink: 2.3, shade: false }); }
  const hp = []; for (let a = -38; a >= -216; a -= 12) hp.push([Math.cos(rad(a))*28, Math.sin(rad(a))*28 - 1]);
  hp.push([-21, 8], [-15, -4], [-6, -11], [3, -14], [12, -15], [18, -13]);
  shape(hp, c, { ink: 2.4, shade: false, mis: [1, -1] });
  if (st === 'swept'){ for (const [x, y, dx, dy] of [[-8,-26,-6,-12],[2,-28,4,-12],[10,-24,12,-8]]) shape([[x-5,y+2],[x+dx,y+dy],[x+6,y+2]], c, { ink: 2, shade: false }); }
  if (st === 'bun') shape(circlePts(-20, -22, 10, 10, 14), c, { ink: 2.2, shade: false });
  if (st === 'short' || st === 'swept') inkLine([[-4,-27],[0,-36],[4,-30]], 2.2, INK, { jit: .5 });
}
function drawHead(r, cos){
  const P = r.P;
  limb([r.neck, P2(r.neck, up(r.ha), 12)], [11, 11], cos.skin, { ink: 2.2 });
  if (cos.hood) shape(circlePts(...P2(P2(r.neck, up(r.ha), 2), [r.td[1], -r.td[0]], 13), 15, 11, 16), dk(cos.top, 0.85), { ink: 2.4 });
  ctx.save(); ctx.translate(r.head[0], r.head[1]); ctx.rotate(rad(r.ha)); if (P.flip) ctx.scale(-1, 1);
  const stern = cos.face === 'stern', blank = cos.face === 'blank';
  if (!blank) shape(circlePts(23, 2, 4.5, 4.5, 12), cos.skin, { ink: 2, shade: false });
  shape(stern ? squarePts(0, 1, 23, 26, 30) : circlePts(0, 0, 24, 25, 30), cos.skin, { ink: 2.8 });
  if (blank){ ctx.restore(); return; }
  if (!stern){ ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#ef7d6b'; ctx.beginPath(); ctx.ellipse(8, 8, 6, 4, 0, 0, 7); ctx.fill(); ctx.restore(); }
  inkLine([[-2,-6],[-8,-2],[-7,5],[-2,5]], 2.2, INK, { jit: .4 });
  drawHair(cos);
  if (cos.cap){ shape([[-24,-12],[-20,-28],[0,-32],[18,-24],[22,-14]], cos.cap, { ink: 2.3, shade: false }); limb([[14,-15],[36,-12]], [5, 4], cos.cap, { ink: 2, shade: false }); }
  const ex = 11, ey = -3, b = P.brow || 0;
  if (P.eye === 'wide'){ shape(circlePts(ex+1, ey, 6.5, 7, 14), '#fffaf0', { ink: 2, shade: false }); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex+3, ey, 2.6, 0, 7); ctx.fill(); }
  else if (P.eye === 'squint') inkLine([[ex-3,ey-6],[ex+3,ey-1],[ex-3,ey+3]], 2.6, INK, { jit: .3, ta: .2 });
  else if (P.eye === 'closed') inkLine([[ex-4,ey+1],[ex,ey-4],[ex+4,ey+1]], 2.6, INK, { jit: .3, ta: .2 });
  else if (P.eye === 'shut') inkLine([[ex-4,ey],[ex+4,ey+1]], 2.6, INK, { jit: .3, ta: .2 });
  else { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex, ey, stern ? 2.6 : 3.2, stern ? 3 : 4, 0, 0, 7); ctx.fill(); }
  if (stern) inkLine([[ex-8, -11], [ex+7, -10 + b*0.2]], 4.2, INK, { jit: .2, flat: 1 });
  else inkLine([[ex-6, -13 - b*0.3], [ex+5, -12 + b*0.3]], 2.8, INK, { jit: .3 });
  if (cos.glasses){
    shape([[ex-6,ey-6],[ex+8,ey-6],[ex+8,ey+4],[ex-6,ey+4]], 'rgba(190,220,235,.35)', { ink: 2, shade: false, mis: [0,0] });
    inkLine([[ex-6,ey-4],[-6,-4]], 1.8, INK, { jit: .2, flat: 1 });
    if (P.glint){ ctx.save(); ctx.fillStyle = '#ffffff'; pathPts([[ex-3,ey+3],[ex+1,ey-6],[ex+5,ey-6],[ex+1,ey+3]]); ctx.fill(); ctx.restore(); radLines([ex+1, ey-1], 12, 24, 6, 1.8, 4); }
  }
  const m = P.mouth;
  if (m === 'smile') inkLine([[8,8],[13,13],[19,8]], 2.4, INK, { jit: .3 });
  else if (m === 'o') shape(circlePts(16, 11, 3.6, 4.2, 10), '#5a1f22', { ink: 2, shade: false });
  else if (m === 'open') shape([[8,7],[20,6],[18,15],[11,16]], '#5a1f22', { ink: 2.2, shade: false });
  else if (m === 'grit'){ shape([[8,7],[19,7],[19,13],[8,13]], '#fffaf0', { ink: 2, shade: false }); inkLine([[8,10],[19,10]], 1.4, INK, { jit: .2, flat: 1 }); }
  else if (m === 'puff'){ shape(circlePts(12, 9, 9, 7, 14), cos.skin, { ink: 2, shade: false }); inkLine([[17,8],[21,9]], 2.2, INK, { jit: .2 }); }
  else if (m === 'frown') inkLine([[9,12],[14,8],[19,11]], 2.4, INK, { jit: .3 });
  else inkLine([[9,10],[18,10]], stern ? 3 : 2.4, INK, { jit: .3, flat: stern ? 1 : 0 });
  ctx.restore();
  if (P.sweat){ const s = mulberry(BOIL); for (let i = 0; i < 3; i++){ const a = rad(-140 + i*35 + s()*10), d = 36 + s()*6; const c = [r.head[0] + Math.cos(a)*d*(P.flip ? -1 : 1), r.head[1] + Math.sin(a)*d]; shape([[c[0], c[1]-6], [c[0]+3.5, c[1]+2], [c[0], c[1]+5], [c[0]-3.5, c[1]+2]], '#bfe3f2', { ink: 1.6, shade: false, mis: [0,0] }); } }
}
function drawTorso(r, cos){
  const bw = cos.build || 1;
  if (cos.coat){
    const hem = P2(r.hip, [ (dn(r.P.lFu)[0] + dn(r.P.lBu)[0]) / 2, 1 ], 50);
    limb([P2(r.hip, r.td, 64), r.hip, hem], [30*bw, 40*bw, 56*bw], cos.top, { ink: 2.8 });
    inkLine([P2(r.hip, r.td, 64), P2(P2(r.hip, r.td, 30), [-r.td[1], r.td[0]], 8)], 2, INK, { jit: .4 });
    inkLine([P2(r.hip, r.td, 4), P2(r.hip, r.td, 6 + 0)], 1, INK);
    return;
  }
  const a = P2(r.hip, r.td, -6), m = P2(r.hip, r.td, 34), b = P2(r.hip, r.td, 66);
  limb([a, m, b], [34*bw, 38*bw, 28*bw], cos.top, { ink: 2.8 });
  if (cos.vest){ for (const k of [22, 40]){ const c = P2(r.hip, r.td, k), n = [-r.td[1], r.td[0]]; inkLine([P2(c, n, -16), P2(c, n, 16)], 5, '#e8eef2', { flat: 1, jit: .3 }); } }
  if (cos.hood){ const c = P2(r.hip, r.td, 58), n = [-r.td[1], r.td[0]]; inkLine([P2(c, n, 10), P2(P2(c, n, 12), r.td, -18)], 1.6, INK, { jit: .3 }); }
}
function drawBackpack(r, cos){
  if (!cos.backpack) return;
  const bk = [r.td[1], -r.td[0]];
  limb([P2(P2(r.hip, r.td, 16), bk, 21), P2(P2(r.hip, r.td, 56), bk, 19)], [24, 22], cos.backpack, { ink: 2.6 });
}
function drawActor(a, r, t){
  const cos = a.cos;
  a.propsBack && a.propsBack(r, t);
  drawArm(r.aB, true, cos); drawLeg(r.lB, true, cos); drawLeg(r.lF, false, cos);
  drawBackpack(r, cos);
  if (cos.bag){ limb([P2(r.sh, [-.4, .2], 8), P2(r.hip, [-1, .2], 10)], [14, 16], cos.bag, { ink: 2.2 }); }
  drawTorso(r, cos);
  if (cos.backpack){ inkLine([P2(r.sh, r.td, 3), P2(P2(r.hip, r.td, 30), [-r.td[1], r.td[0]], 10)], 3.4, dk(cos.backpack, .8), { flat: 1, jit: .3 }); }
  drawHead(r, cos);
  a.propsMid && a.propsMid(r, t);
  drawArm(r.aF, false, cos);
  a.propsFront && a.propsFront(r, t);
}
// smear / speed lines from in-between positions
function drawTrails(a, t){
  const hist = []; for (let k = 0; k <= 5; k++){ const r = solve(a.pose(t - k/36)); const e = [r.aF[2], r.aB[2], r.lF[2], r.lB[2]]; if (a.extra) e.push(...a.extra(r)); hist.push(e); }
  for (let i = 0; i < hist[0].length; i++){
    const ch = hist.map(h => h[i]); let len = 0; for (let k = 1; k < ch.length; k++) len += Math.hypot(ch[k][0]-ch[k-1][0], ch[k][1]-ch[k-1][1]);
    if (len < 34) continue;
    const pts = resample(ch.slice(1), 4); if (pts.length < 3) continue;
    const p0 = pts[0], p1 = pts[Math.min(3, pts.length-1)], d = Math.hypot(p1[0]-p0[0], p1[1]-p0[1]) || 1, nx = -(p1[1]-p0[1])/d, ny = (p1[0]-p0[0])/d;
    const al = clamp((len - 34)/80, 0.3, 0.85);
    for (const off of [-9, 0, 9]){ const k = 1 - Math.abs(off)/30;
      inkLine(pts.slice(0, Math.max(3, Math.floor(pts.length*k))).map(p => [p[0]+nx*off, p[1]+ny*off]), off ? 2.2 : 3.2, INK, { jit: .6, a: al, ta: .45 }); }
  }
}

// ---------- rifle ----------
function rifleGeom(r){ const g = r.grip, d = r.adir, n = [-d[1], d[0]]; return { g, d, n, butt: P2(g, d, -34), muzzle: P2(g, d, 92) }; }
function drawRifle(r){
  const { g, d, n } = rifleGeom(r);
  const at = (u, v = 0) => P2(P2(g, d, u), n, v);
  shape([at(-36, -7), at(-8, -4), at(-4, 5), at(-12, 6), at(-36, 9)], '#5e3f2b', { ink: 2.4, sh: 2 });
  limb([at(-6, -1), at(34, -1)], [10, 10], '#2d2d33', { ink: 2.4, sh: 2 });
  limb([at(0, 2), at(28, 2)], [7, 7], '#6b4a33', { ink: 2, shade: false });
  limb([at(30, -2), at(92, -2)], [4.5, 4], '#2d2d33', { ink: 2, shade: false });
  limb([at(4, -8), at(22, -8)], [6, 6], '#1d1d22', { ink: 2, shade: false });
}

// ---------- 3D world ----------
let SUN = norm([-0.4, 0.85, 0.35]), FOG = null;
function makeCam(c){ const f = norm(sub(c.target, c.pos)), r = norm(cross(f, [0,1,0])), u = cross(r, f); return { pos: c.pos, f, r, u, fl: (H/2)/Math.tan(rad(c.fov || 42)/2), roll: c.roll || 0 }; }
const toCam = (cam, p) => { const d = sub(p, cam.pos); return [dot(d, cam.r), dot(d, cam.u), dot(d, cam.f)]; };
const projC = (cam, q) => [W/2 + cam.fl*q[0]/q[2], H/2 - cam.fl*q[1]/q[2]];
const proj = (cam, p) => projC(cam, toCam(cam, p));
function clipNear(q, n = 0.15){
  const out = [];
  for (let i = 0; i < q.length; i++){ const a = q[i], b = q[(i+1) % q.length], ai = a[2] >= n, bi = b[2] >= n;
    if (ai) out.push(a); if (ai !== bi){ const t = (n - a[2])/(b[2] - a[2]); out.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, n]); } }
  return out;
}
const face = (p, c, n, o = {}) => ({ p, c, n, ...o });
function box(x0, y0, z0, x1, y1, z1, c, o = {}){
  const F = [], col = k => o[k] || c;
  F.push(face([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]], col('sx'), [1,0,0], o));
  F.push(face([[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0]], col('sx'), [-1,0,0], o));
  F.push(face([[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]], col('top'), [0,1,0], o));
  F.push(face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]], col('front'), [0,0,1], o));
  F.push(face([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]], col('back'), [0,0,-1], o));
  if (o.bottom) F.push(face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]], o.bottomCol || c, [0,-1,0], o));
  return F;
}
const plane = (x0, z0, x1, z1, y, c, o = {}) => face([[x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0]], c, [0,o.down ? -1 : 1,0], { layer: -1, edge: false, ...o });
const rectZ = (x0, y0, x1, y1, z, c, o = {}) => face([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]], c, [0,0,o.nz || 1], o);
const rectX = (z0, y0, z1, y1, x, c, o = {}) => face([[x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0]], c, [o.nx || 1,0,0], o);
const discY = (cx, y, cz, r, c, o = {}) => face(Array.from({length: 12}, (_, i) => [cx + Math.cos(i/12*6.283)*r, y, cz + Math.sin(i/12*6.283)*r]), c, [0,1,0], o);
const discZ = (cx, cy, z, r, c, o = {}) => face(Array.from({length: 12}, (_, i) => [cx + Math.cos(i/12*6.283)*r, cy + Math.sin(i/12*6.283)*r, z]), c, [0,0,o.nz || 1], o);
const discX = (x, cy, cz, r, c, o = {}) => face(Array.from({length: 12}, (_, i) => [x, cy + Math.sin(i/12*6.283)*r, cz + Math.cos(i/12*6.283)*r]), c, [o.nx || 1,0,0], o);
function prism(cx, cz, r, y0, y1, n, c, o = {}){
  const F = [], ring = Array.from({length: n}, (_, i) => i/n*Math.PI*2 + (o.rot || 0));
  for (let i = 0; i < n; i++){ const a = ring[i], b = ring[(i+1) % n], m = (a + b)/2 + (b < a ? Math.PI : 0);
    F.push(face([[cx+Math.cos(a)*r,y0,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,y0,cz+Math.sin(b)*r],[cx+Math.cos(b)*r,y1,cz+Math.sin(b)*r],[cx+Math.cos(a)*r,y1,cz+Math.sin(a)*r]], c, [Math.cos(m),0,Math.sin(m)], o)); }
  if (!o.notop) F.push(face(ring.map(a => [cx+Math.cos(a)*r, y1, cz+Math.sin(a)*r]), o.top || c, [0,1,0], o));
  return F;
}
function cone(cx, cz, r, y0, y1, n, c, o = {}){
  const F = [], h = y1 - y0, rot = o.rot || 0;
  for (let i = 0; i < n; i++){ const a = i/n*Math.PI*2 + rot, b = (i+1)/n*Math.PI*2 + rot, m = (a+b)/2;
    F.push(face([[cx+Math.cos(a)*r,y0,cz+Math.sin(a)*r],[cx+Math.cos(b)*r,y0,cz+Math.sin(b)*r],[cx,y1,cz]], c, norm([Math.cos(m)*h, r, Math.sin(m)*h]), o)); }
  return F;
}
const line3 = (pts, o = {}) => ({ kind: 'line', p: pts, ...o });
// text sign: p = [topLeft, topRight, bottomLeft]
const sign = (tl, tr, bl, text, o = {}) => ({ kind: 'text', p: [tl, tr, bl, add(tr, sub(bl, tl))], text, ...o });
// rotate faces about a pivot (axis 'x'|'y'|'z')
function rotFaces(F, pivot, axis, ang){
  const c = Math.cos(ang), s = Math.sin(ang);
  const rp = p => { const q = sub(p, pivot); let x = q[0], y = q[1], z = q[2];
    if (axis === 'x'){ [y, z] = [y*c - z*s, y*s + z*c]; } else if (axis === 'y'){ [x, z] = [x*c + z*s, -x*s + z*c]; } else { [x, y] = [x*c - y*s, x*s + y*c]; }
    return add([x, y, z], pivot); };
  const rn = n => { if (!n) return n; let [x, y, z] = n; if (axis === 'x'){ [y, z] = [y*c - z*s, y*s + z*c]; } else if (axis === 'y'){ [x, z] = [x*c + z*s, -x*s + z*c]; } else { [x, y] = [x*c - y*s, x*s + y*c]; } return [x, y, z]; };
  const go = f => ({ ...f, p: f.p.map(rp), n: rn(f.n), decals: f.decals && f.decals.map(go) });
  return F.map(go);
}
const moveFaces = (F, d) => F.map(f => ({ ...f, p: f.p.map(p => add(p, d)), decals: f.decals && moveFaces(f.decals, d) }));

function pencil(s, w, al, col = PENCIL){
  const r = R();
  for (let i = 1; i < s.length; i++){
    const a = s[i-1], b = s[i], d = Math.hypot(b[0]-a[0], b[1]-a[1]); if (d < 1) continue;
    const ux = (b[0]-a[0])/d, uy = (b[1]-a[1])/d, e1 = 2 + r()*7, e2 = 2 + r()*7;
    ctx.beginPath(); ctx.moveTo(a[0]-ux*e1 + (r()-.5)*1.5, a[1]-uy*e1 + (r()-.5)*1.5);
    ctx.quadraticCurveTo((a[0]+b[0])/2 + (r()-.5)*Math.min(d,400)*0.02, (a[1]+b[1])/2 + (r()-.5)*Math.min(d,400)*0.02, b[0]+ux*e2, b[1]+uy*e2);
    ctx.strokeStyle = rgba(col, al); ctx.lineWidth = w; ctx.stroke();
    if (r() < 0.35){ ctx.beginPath(); ctx.moveTo(a[0]+(r()-.5)*3, a[1]+(r()-.5)*3); ctx.lineTo(b[0]+(r()-.5)*3, b[1]+(r()-.5)*3); ctx.strokeStyle = rgba(col, al*0.4); ctx.lineWidth = w*0.7; ctx.stroke(); }
  }
}
function wash(s, col, big, alpha = 1){
  const r = R();
  ctx.save(); ctx.globalAlpha = alpha; pathPts(s); ctx.fillStyle = rgba(col, 0.94); ctx.fill();
  ctx.clip();
  for (let i = 0; i < 2; i++){ pathPts(s.map(p => [p[0] + (r()-.5)*7, p[1] + (r()-.5)*7])); ctx.fillStyle = rgba(shadeRGB(col, 0.9 + r()*0.16), 0.22); ctx.fill(); }
  if (big){
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of s){ x0 = Math.min(x0,p[0]); y0 = Math.min(y0,p[1]); x1 = Math.max(x1,p[0]); y1 = Math.max(y1,p[1]); }
    x0 = Math.max(x0, -50); x1 = Math.min(x1, W+50); y0 = Math.max(y0, -50); y1 = Math.min(y1, H+50);
    const rs = mulberry(Math.round(s[0][0]*7 + s[0][1]*13) + 5);   // blooms stay put (painted once), lines boil
    for (let i = 0; i < 4; i++){ const cx = lerp(x0,x1,rs()), cy = lerp(y0,y1,rs()), rr = 40 + rs()*160;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr); const cc = shadeRGB(col, rs() < .5 ? 0.88 : 1.07);
      g.addColorStop(0, rgba(cc, 0.32)); g.addColorStop(0.75, rgba(cc, 0.1)); g.addColorStop(1, rgba(cc, 0));
      ctx.fillStyle = g; ctx.fillRect(cx-rr, cy-rr, rr*2, rr*2); }
  }
  pathPts(s); ctx.strokeStyle = rgba(shadeRGB(col, 0.72), 0.45); ctx.lineWidth = 2.6; ctx.stroke();
  ctx.restore();
}
function hatch(s, amt, al){
  const r = R(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of s){ x0 = Math.min(x0,p[0]); y0 = Math.min(y0,p[1]); x1 = Math.max(x1,p[0]); y1 = Math.max(y1,p[1]); }
  x0 = Math.max(x0, 0); y0 = Math.max(y0, 0); x1 = Math.min(x1, W); y1 = Math.min(y1, H); if (x1 <= x0 || y1 <= y0) return;
  ctx.save(); pathPts(s); ctx.clip(); ctx.strokeStyle = rgba(PENCIL, 0.36*al); ctx.lineWidth = 1.1;
  const sp = lerp(13, 5.5, amt), span = (x1-x0) + (y1-y0);
  ctx.beginPath();
  for (let d = -span; d < span; d += sp*(0.8 + r()*0.4)){ const xa = x0 + d; ctx.moveTo(xa + (r()-.5)*3, y1); ctx.lineTo(xa + (y1-y0)*0.7 + (r()-.5)*3, y0); }
  ctx.stroke(); ctx.restore();
}
const fogK = z => FOG ? clamp((z - FOG.near)/(FOG.far - FOG.near), 0, FOG.max ?? 0.8) : 0;
function paintText(fc, s, fk){
  const [a, b, c] = s; const tw = 200, th = 50;
  ctx.save();
  const m = new DOMMatrix([ (b[0]-a[0])/tw, (b[1]-a[1])/tw, (c[0]-a[0])/th, (c[1]-a[1])/th, a[0], a[1] ]);
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  if (fc.bg){ ctx.fillStyle = rgba(mix(hex(fc.bg), FOG ? FOG.col : [0,0,0], fk)); ctx.fillRect(0, 0, tw, th); if (fc.glow){ ctx.shadowColor = fc.bg; ctx.shadowBlur = 12; ctx.fillRect(0,0,tw,th); ctx.shadowBlur = 0; } ctx.strokeStyle = rgba(PENCIL, .7*(1-fk)); ctx.lineWidth = 2; ctx.strokeRect(1, 1, tw-2, th-2); }
  ctx.fillStyle = rgba(mix(hex(fc.col || '#ffffff'), FOG ? FOG.col : [0,0,0], fk*0.8));
  ctx.font = `bold ${fc.size || 30}px "DejaVu Sans", "Liberation Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(fc.text, tw/2, th/2 + 2, tw - 14);
  ctx.restore();
}
function paintFace(fc, s, z){
  const fk = fogK(z);
  if (fc.kind === 'line'){ pencil(s, fc.w || 1.3, (fc.a ?? .8)*(1 - fk*0.8), fc.col ? hex(fc.col) : PENCIL); return; }
  if (fc.kind === 'text'){ paintText(fc, s, fk); return; }
  let col = hex(fc.c), d = fc.n ? dot(fc.n, SUN) : 1;
  if (!fc.flat){ const lit = 0.66 + 0.42*Math.max(0, d); col = shadeRGB(col, lit, lit < 0.8 ? (0.8 - lit)*2.5 : 0); }
  if (fk > 0) col = mix(col, FOG.col, fk);
  if (fc.glow){ ctx.save(); pathPts(s); ctx.fillStyle = rgba(col); ctx.shadowColor = rgba(col, .9); ctx.shadowBlur = 16*DPR; ctx.fill(); ctx.restore(); return; }
  if (fc.simple){ ctx.save(); pathPts(s); ctx.fillStyle = rgba(col, fc.alpha ?? .92); ctx.fill(); ctx.restore(); }
  else {
    let area = 0; for (let i = 0; i < s.length; i++){ const a = s[i], b = s[(i+1) % s.length]; area += a[0]*b[1] - b[0]*a[1]; }
    wash(s, col, Math.abs(area) > 40000, fc.alpha ?? 1);
    if (fc.n && !fc.nohatch && d < 0.12) hatch(s, clamp((0.12 - d)/1.0, 0, 1), 1 - fk);
  }
  if (fc.edge !== false && !fc.simple) pencil(s.concat([s[0]]), fc.ew || 1.3, 0.72*(1 - fk*0.85)*(fc.alpha ?? 1));
}
function projectFace(fc, cam){
  let q = fc.p.map(p => toCam(cam, p));
  if (fc.kind === 'line'){ if (q.some(v => v[2] < 0.15)) return null; }
  else if (fc.kind === 'text'){ if (q.some(v => v[2] < 0.15)) return null; }
  else { q = clipNear(q); if (q.length < 3) return null; }
  const s = q.map(v => projC(cam, v));
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of s){ x0 = Math.min(x0,p[0]); y0 = Math.min(y0,p[1]); x1 = Math.max(x1,p[0]); y1 = Math.max(y1,p[1]); }
  if (x1 < -20 || x0 > W+20 || y1 < -20 || y0 > H+20) return null;
  return { fc, s, z: fc.zsort ?? (q.reduce((a, v) => a + v[2], 0)/q.length + (fc.zbias || 0)) };
}
function cullBack(fc, cam){
  if (!fc.n || fc.two || fc.kind) return false;
  const c = fc.p.reduce((a, p) => add(a, p), [0,0,0]).map(v => v / fc.p.length);
  return dot(fc.n, sub(c, cam.pos)) > 0;
}
function paintItem(it, cam){
  if (it.actor){ paintActor(it.actor, cam, it); return; }
  if (it.sprite){ ctx.save(); ctx.translate(it.sp[0], it.sp[1]); INKK = clamp(Math.pow(120 / it.s, 0.5), 0.5, 1.6); it.sprite.draw(it.s, it); INKK = 1; ctx.restore(); return; }
  paintFace(it.fc, it.s, it.z);
  if (it.fc.decals) for (const d of it.fc.decals){ if (cullBack(d, cam)) continue; const dj = projectFace(d, cam); if (dj) paintFace(d, dj.s, dj.z); }
}
// ---------- actors in the world ----------
// actor: { cos, pos:[x,y,z], facing, pose(t)->P, t, trails, glow, rot }
function placeActor(a, cam){
  const feet = toCam(cam, a.pos); if (feet[2] < 0.3) return null;
  const hp = toCam(cam, add(a.pos, [0, 1.8 * (a.cos.scale || 1), 0]));
  const fs = projC(cam, feet), hs = projC(cam, hp), s = (fs[1] - hs[1]) / 220;
  if (fs[0] < -400*s - 50 || fs[0] > W + 400*s + 50) return null;
  return { actor: a, fs, s, z: feet[2] + (a.zbias || 0) };
}
function paintActor(a, cam, it){
  const { fs, s } = it, P = a.P, rig = a.rig;
  const fk = fogK(it.z);
  if (a.shadow !== false){
    ctx.save(); ctx.globalAlpha = 0.22*clamp(1 - (P.air || 0)/60, 0.3, 1); ctx.fillStyle = a.shadowCol || '#2b2018';
    ctx.beginPath(); ctx.ellipse(fs[0] + rig.hip[0]*s*a.facing, fs[1], 50*s, 8*s, 0, 0, 7); ctx.fill(); ctx.restore();
  }
  ctx.save();
  if (a.glow){ ctx.shadowColor = a.glow; ctx.shadowBlur = 10*DPR; }
  ctx.translate(fs[0], fs[1]); ctx.scale(s * a.facing, s);
  if (P.rot){ ctx.translate(rig.hip[0], rig.hip[1]); ctx.rotate(rad(P.rot)); ctx.translate(-rig.hip[0], -rig.hip[1]); }
  INKK = clamp(Math.pow(2.0 / s, 0.5), 0.45, 1.7);
  if (fk > 0.05) ctx.globalAlpha = 1 - fk*0.6;
  if (a.trails) drawTrails(a, a.t);
  drawActor(a, rig, a.t);
  ctx.restore(); INKK = 1;
}

// ---------- paper ----------
const paper = (() => {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const id = g.createImageData(W, H), d = id.data, r = mulberry(11), GW = 50, GH = 30, grid = [];
  for (let i = 0; i < (GW+1)*(GH+1); i++) grid.push(r());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const gx = x/W*GW, gy = y/H*GH, ix = gx|0, iy = gy|0, fx = gx-ix, fy = gy-iy, G = (i, j) => grid[j*(GW+1)+i];
    const low = lerp(lerp(G(ix,iy), G(ix+1,iy), fx), lerp(G(ix,iy+1), G(ix+1,iy+1), fx), fy);
    const v = 238 + low*12 + (r()-.5)*18, i = (y*W+x)*4;
    d[i] = v + 2; d[i+1] = v - 2; d[i+2] = v - 11; d[i+3] = 255;
  }
  g.putImageData(id, 0, 0);
  g.strokeStyle = 'rgba(150,130,100,.16)'; g.lineWidth = 0.8;
  for (let i = 0; i < 260; i++){ const x = r()*W, y = r()*H, a = r()*6.28, l = 6 + r()*22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a)*l*0.5 + (r()-.5)*6, y + Math.sin(a)*l*0.5 + (r()-.5)*6, x + Math.cos(a)*l, y + Math.sin(a)*l); g.stroke(); }
  const vg = g.createRadialGradient(W/2, H/2, H*0.45, W/2, H/2, H*1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,40,20,.34)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
})();

// ---------- frame renderer ----------
// shot: { set, cam(t), actors(tq)->[...], dyn(tq)->faces, fx(tq, cam), over(tq, cam) }
function renderShot(shot, t, absT){
  const tq = Math.floor(t*FPS + 1e-6)/FPS;
  BOIL = Math.floor(absT*FPS + 1e-6); SC = 0; INKK = 1;
  ctx = mainCtx; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const set = shot.set; FOG = set.fog || null; SUN = set.sun || norm([-0.4, 0.85, 0.35]);
  const c = shot.cam(t); let shake = shot.shake ? shot.shake(t) : 0;
  if (shake){ const r = mulberry(Math.floor(t*24)*7 + 3); c.pos = add(c.pos, [(r()-.5)*shake, (r()-.5)*shake, 0]); c.target = add(c.target, [(r()-.5)*shake*1.5, (r()-.5)*shake*1.5, 0]); }
  const cam = makeCam(c);
  if (cam.roll){ ctx.translate(W/2, H/2); ctx.rotate(rad(cam.roll)); ctx.translate(-W/2, -H/2); }
  set.bg(cam, t);
  const faces = shot.dyn ? set.faces.concat(shot.dyn(tq)) : set.faces;
  const items = { '-2': [], '-1': [], '0': [], '1': [] };
  for (const fc of faces){ if (cullBack(fc, cam)) continue; const it = projectFace(fc, cam); if (it) (items[fc.layer || 0] || items[0]).push(it); }
  for (const a of (shot.actors ? shot.actors(tq) : [])){
    if (typeof a.pose !== 'function'){ const P0 = a.pose; a.pose = () => P0; }
    a.P = a.pose(tq); a.rig = solve(a.P); a.t = tq; a.facing = a.facing ?? 1;
    const it = placeActor(a, cam); if (it) items[a.layer || 0].push(it);
  }
  for (const sp of (shot.sprites ? shot.sprites(tq) : [])){
    const q = toCam(cam, sp.pos); if (q[2] < 0.2) continue;
    items[sp.layer || 0].push({ sprite: sp, sp: projC(cam, q), s: cam.fl / q[2], z: q[2] + (sp.zbias || 0) });
  }
  for (const L of ['-2', '-1', '0', '1']){ items[L].sort((a, b) => b.z - a.z); for (const it of items[L]) paintItem(it, cam); }
  if (shot.fx){ ctx.save(); shot.fx(tq, cam, t); ctx.restore(); }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paper, 0, 0, W, H); ctx.restore();
  if (shot.over){ ctx.save(); shot.over(tq, cam, t); ctx.restore(); }
}
