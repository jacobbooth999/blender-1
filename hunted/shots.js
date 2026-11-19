// ============================================================================
// "YOU ARE BEING HUNTED IN A SHOPPING CENTRE" — shots, poses, sound cues.
// Shot times are local (0..dur). Sound cues: sfx [[t, name, gain]], vo [[t, line]].
// ============================================================================
const SETS = {
  mall: buildMall(0), top: buildMall(1), store: buildStore(), food: buildFoodCourt([9]), atrium: buildAtrium(),
  service: buildService(), carpark: buildCarPark(), street: buildStreet(),
};

// ---------- helpers ----------
function track(keys, ease = 'lin'){ // [[t, x, y, z], ...]
  return t => { if (t <= keys[0][0]) return keys[0].slice(1); for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]){ const a = keys[i-1], b = keys[i], p = EASE[b[4] || ease]((t - a[0])/(b[0] - a[0])); return [lerp(a[1],b[1],p), lerp(a[2],b[2],p), lerp(a[3],b[3],p)]; } return keys[keys.length-1].slice(1); };
}
const camT = (keys, ease = 'inout') => { const P = track(keys.map(k => [k[0], ...k[1]]), ease), T = track(keys.map(k => [k[0], ...k[2]]), ease), F = track(keys.map(k => [k[0], k[3] || 45, 0, 0]), ease); return t => ({ pos: P(t), target: T(t), fov: F(t)[0] }); };
const talk = (fn, t0, dur, a = 'o', b = 'flat') => t => { const P = fn(t); if (t >= t0 && t < t0 + dur) P.mouth = Math.floor((t - t0)*7) % 2 ? b : a; return P; };
const shakeAt = (list) => t => { let s = 0; for (const [t0, amp, d] of list) if (t >= t0 && t < t0 + d) s = Math.max(s, amp*(1 - (t - t0)/d)); return s; };
const flash = (t, t0, d = 0.09, col = '255,250,235') => { if (t >= t0 && t < t0 + d){ ctx.fillStyle = `rgba(${col},${0.85*(1 - (t - t0)/d)})`; ctx.fillRect(-100, -100, W + 200, H + 200); } };
const fadeBlack = (t, t0, d) => { const k = clamp((t - t0)/d, 0, 1); if (k > 0){ ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(-100, -100, W + 200, H + 200); } };
const fadeIn = (t, d) => { const k = 1 - clamp(t/d, 0, 1); if (k > 0){ ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(-100, -100, W + 200, H + 200); } };
function vignette(a = 0.45, col = '0,0,0'){ const g = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.95); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200); }

// ---------- pose library ----------
const RUNK = (o = {}) => anim([
  [0,    pz({ torso:16, head:-4, lFu:42,lFl:-12, lBu:-32,lBl:-55, aFu:-48,aFl:85, aBu:50,aBl:65, mouth:'open', eye:'wide', brow:-8, ...o }), .09],
  [2/12, pz({ torso:22, head:-6, air:16, lFu:-40,lFl:-18, lBu:64,lBl:-82, aFu:60,aFl:70, aBu:-58,aBl:92, mouth:'open', eye:'wide', brow:-8, ...o }), .09],
  [4/12, pz({ torso:16, head:-4, lFu:-32,lFl:-55, lBu:42,lBl:-12, aFu:50,aFl:65, aBu:-48,aBl:85, mouth:'open', eye:'wide', brow:-8, ...o }), .09],
  [6/12, pz({ torso:22, head:-6, air:16, lFu:64,lFl:-82, lBu:-40,lBl:-18, aFu:-58,aFl:92, aBu:60,aBl:70, mouth:'open', eye:'wide', brow:-8, ...o }), .09],
], 8/12);
const BRUN = RUNK();
const BRUN_BACK = withPose(RUNK({ flip: 1, head: -16 }), {});
const WALKK = (o = {}, arms = true) => anim([
  [0,   pz({ torso:3, lFu:22,lFl:-4, lBu:-20,lBl:-10, ...(arms ? { aFu:-18,aFl:20, aBu:18,aBl:20 } : {}), ...o }), .22, 'inout'],
  [.25, pz({ torso:3, air:3, lFu:-2,lFl:-8, lBu:8,lBl:-45, ...(arms ? { aFu:-2,aFl:15, aBu:2,aBl:15 } : {}), ...o }), .22, 'inout'],
  [.5,  pz({ torso:3, lFu:-20,lFl:-10, lBu:22,lBl:-4, ...(arms ? { aFu:18,aFl:20, aBu:-18,aBl:20 } : {}), ...o }), .22, 'inout'],
  [.75, pz({ torso:3, air:3, lFu:8,lFl:-45, lBu:-2,lBl:-8, ...(arms ? { aFu:2,aFl:15, aBu:-2,aBl:15 } : {}), ...o }), .22, 'inout'],
], 1.0);
const CWALK = WALKK();
const CRUN = RUNK({ eye: 'wide', mouth: 'open' });
const CRUN_P = withPose(RUNK({ eye: 'wide', mouth: 'open' }), { aFu: 150, aFl: 35, aBu: 140, aBl: 40 });
const BOY_PHONE = withPose(WALKK({ head: 16, aFu: 30, aFl: 88, aBu: 18, aBl: 78 }, false), t => ({ mouth: Math.floor(t*3) % 2 ? 'puff' : 'flat' }));
const BP = {
  startle: pz({ air:18, torso:-8, head:-6, aFu:115,aFl:40, aBu:-95,aBl:-40, lFu:18,lFl:-20, lBu:-16,lBl:-20, eye:'wide', mouth:'o', brow:-12 }),
  scared: pz({ torso:8, head:4, aFu:35,aFl:100, aBu:25,aBl:105, lFu:10,lFl:-14, lBu:-10,lBl:-14, eye:'wide', mouth:'o', brow:-12, sweat:1 }),
  antic: pz({ torso:32, head:-12, lFu:42,lFl:-75, lBu:-32,lBl:-55, aFu:-55,aFl:60, aBu:45,aBl:60, eye:'wide', mouth:'grit', brow:-8 }),
  dive: pz({ rot:75, air:60, torso:5, head:-22, aFu:170,aFl:0, aBu:165,aBl:5, lFu:-15,lFl:-10, lBu:-30,lBl:-20, eye:'squint', mouth:'grit' }),
  crouch: pz({ torso:26, head:-8, lFu:75,lFl:-145, lBu:45,lBl:-135, aFu:50,aFl:70, aBu:40,aBl:80, eye:'wide', mouth:'open', brow:-10, sweat:1 }),
  slide: pz({ torso:-55, head:28, lFu:88,lFl:-2, lBu:55,lBl:-115, aFu:70,aFl:10, aBu:-45,aBl:10, eye:'squint', mouth:'grit', hipYon:1, hipY:-16 }),
  hurdle: pz({ air:58, torso:28, head:-6, lFu:88,lFl:-8, lBu:-55,lBl:-85, aFu:-40,aFl:60, aBu:85,aBl:20, eye:'wide', mouth:'open', brow:-8 }),
  slip: pz({ rot:-70, air:50, torso:-10, head:30, lFu:110,lFl:-20, lBu:80,lBl:-40, aFu:160,aFl:40, aBu:-150,aBl:-40, eye:'wide', mouth:'o', brow:-12 }),
  floor: pz({ hipYon:1, hipY:-14, rot:-78, torso:0, head:58, lFu:165,lFl:-15, lBu:150,lBl:-35, aFu:120,aFl:-30, aBu:55,aBl:-70, eye:'wide', mouth:'o', brow:-12, sweat:1 }),
  floorHit: pz({ hipYon:1, hipY:-14, rot:-82, torso:0, head:20, lFu:175,lFl:-5, lBu:160,lBl:-20, aFu:150,aFl:-20, aBu:100,aBl:-40, eye:'shut', mouth:'grit', brow:10 }),
  kneel: pz({ torso:30, head:-14, lFu:70,lFl:-120, lBu:-10,lBl:-100, aFu:20,aFl:30, aBu:-30,aBl:30, eye:'wide', mouth:'grit', brow:-10 }),
  hold: pz({ torso:24, head:-4, lFu:75,lFl:-145, lBu:45,lBl:-135, hm:2, hfx:16, hfy:10, hbx:12, hby:13, eye:'wide', mouth:'puff', brow:-12, sweat:1 }),
  freeze: pz({ torso:-5, head:-4, aFu:-12,aFl:8, aBu:12,aBl:8, lFu:12,lFl:-4, lBu:-12,lBl:-4, eye:'wide', mouth:'o', brow:-14, sweat:1 }),
  gaspA: pz({ torso:52, head:-42, lFu:16,lFl:-26, lBu:-14,lBl:-26, aFu:22,aFl:-20, aBu:10,aBl:-10, eye:'shut', mouth:'open', brow:-6, sweat:1 }),
  gaspB: pz({ torso:44, head:-36, lFu:16,lFl:-22, lBu:-14,lBl:-22, aFu:24,aFl:-18, aBu:12,aBl:-8, eye:'shut', mouth:'open', brow:-6, sweat:1 }),
  lookBack: pz({ torso:-4, head:-8, flip:1, aFu:-6,aFl:20, aBu:6,aBl:20, lFu:14,lFl:-4, lBu:-12,lBl:-4, eye:'wide', mouth:'open', brow:-10, sweat:1 }),
};
const BCROUCH_PANT = anim([[0, BP.crouch, .2, 'inout'], [.3, { ...BP.crouch, torso: 31, head: -12 }, .2, 'inout']], .6);
const BHOLD = anim([[0, BP.hold, .2, 'inout'], [.5, { ...BP.hold, rx: 1.5, torso: 25 }, .1], [.6, { ...BP.hold, rx: -1, torso: 24 }, .1]], .8);
const GASP = anim([[0, BP.gaspA, .25, 'inout'], [.35, BP.gaspB, .25, 'inout']], .7);
const HS = { ik:1, gx:16, gy:40, ax:132, torso:0, head:2, lFu:6,lFl:-2, lBu:-6,lBl:-2, eye:'dot', mouth:'flat', brow:0 };
const HP = {
  stand: pz({ ...HS }),
  aim: pz({ ...HS, gx:26, gy:2, ax:90, torso:-3, head:10, lFu:14,lFl:-2, lBu:-14,lBl:-2, eye:'squint', brow:6 }),
  recoil: pz({ ...HS, gx:20, gy:-2, ax:80, torso:-10, head:4, lFu:14,lFl:-2, lBu:-14,lBl:-2, eye:'squint', brow:6 }),
  hang: pz({ ...HS, ik:2, gx:4, gy:52, ax:172 }),
  glasses: pz({ ...HS, ik:2, gx:2, gy:52, ax:172, hm:1, hfx:12, hfy:-6, head:-4 }),
  grab: pz({ ...HS, ik:2, gx:4, gy:52, ax:172, aFu:82, aFl:4, torso:6 }),
  pull: pz({ ...HS, ik:2, gx:4, gy:52, ax:172, aFu:38, aFl:70, torso:-6 }),
};
const HWALK = anim([
  [0,     pz({ ...HS, lFu:16,lFl:-2, lBu:-14,lBl:-6 }), .3, 'inout'],
  [.325,  pz({ ...HS, air:2, lFu:0,lFl:-6, lBu:4,lBl:-30 }), .3, 'inout'],
  [.65,   pz({ ...HS, lFu:-14,lFl:-6, lBu:16,lBl:-2 }), .3, 'inout'],
  [.975,  pz({ ...HS, air:2, lFu:4,lFl:-30, lBu:0,lBl:-6 }), .3, 'inout'],
], 1.3);
const HWALK_HANG = withPose(HWALK, { ik: 2, gx: 4, gy: 52, ax: 172 });
const GUARD = anim([[0, pz({ torso:-4, head:-10, aFu:150,aFl:25, aBu:120,aBl:30, lFu:16,lFl:-4, lBu:-16,lBl:-4, eye:'dot', mouth:'open', brow:12 })], [.25, pz({ torso:-2, head:-6, aFu:105,aFl:35, aBu:160,aBl:15, lFu:16,lFl:-4, lBu:-16,lBl:-4, eye:'dot', mouth:'open', brow:12 })]], .5);

// ---------- actor factories ----------
function boyFood(r){ const h = r.aB[2]; shape([[h[0]-4, h[1]-14], [h[0]+12, h[1]-16], [h[0]+14, h[1]-4], [h[0]-2, h[1]-2]], '#e6b562', { ink: 2 }); inkLine([[h[0]-3, h[1]-9], [h[0]+13, h[1]-10]], 3, '#7aa65a', { flat: 1 }); }
function boyPhone(r){ const h = r.aF[2], a = r.aF[3]; ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(-rad(a) + Math.PI/2); shape([[-4,-12],[4,-12],[4,4],[-4,4]], '#26262c', { ink: 2, shade: false }); ctx.fillStyle = '#9fe0ff'; ctx.fillRect(-2.5, -10, 5, 11); ctx.restore(); }
const BOY = (pos, facing, pose, o = {}) => ({ cos: COS.boy, pos, facing, pose, trails: true, ...o });
const HUNTER = (pos, facing, pose, o = {}) => ({ cos: COS.hunter, pos, facing, pose, propsMid: (r, t) => { drawRifle(r); if (o.muzzle && o.muzzle(t)){ const m = rifleGeom(r).muzzle; burst(m, 14, 46, 9, '#ffe27a', 3); radLines(m, 50, 80, 8, 2.4, 2); } }, extra: r => [rifleGeom(r).muzzle], trails: true, ...o });
const GUARDA = (pos, facing, o = {}) => ({ cos: COS.guard, pos, facing, pose: t => GUARD(t), ...o });
function crowd(seed, n, o){
  const r = mulberry(seed), P = [];
  for (let i = 0; i < n; i++){
    const zr = o.z[Math.floor(r() * o.z.length)];
    P.push({ cos: randomCos(seed*100 + i), x0: lerp(o.x[0], o.x[1], r()), z: lerp(zr[0], zr[1], r()), dir: o.dir ?? (r() < .5 ? 1 : -1), ws: 0.9 + r()*0.6, rs: (o.rs || 4.2) + r()*2.2, ph: r()*3, arms: r() < (o.arms ?? .4), react: (o.tPanic ?? 1e9) + r()*0.45, pdir: o.pdir ?? (r() < .5 ? 1 : -1), mode: o.mode || 'walk' });
  }
  return tq => P.map(p => {
    let x, facing, pose;
    if (p.mode === 'run'){ x = p.x0 + p.dir*p.rs*tq; facing = p.dir; pose = (p.arms ? CRUN_P : CRUN)(tq + p.ph); }
    else if (p.mode === 'stand'){ x = p.x0; facing = p.dir; pose = pz({ head: 4 }); }
    else if (tq < p.react){ x = p.x0 + p.dir*p.ws*tq; facing = p.dir; pose = CWALK((tq + p.ph)*p.ws/1.1); }
    else { const dt = tq - p.react; x = p.x0 + p.dir*p.ws*p.react + p.pdir*p.rs*Math.max(0, dt - 0.17); facing = p.pdir; pose = dt < 0.17 ? BP.startle : (p.arms ? CRUN_P : CRUN)(dt + p.ph); }
    return { cos: p.cos, pos: [x, 0, p.z], facing, pose: () => pose };
  });
}
const run = (fns) => tq => fns.flatMap(f => f(tq));

// ---------- sprites ----------
const foodSprite = (pos) => ({ pos, draw: s => { const k = s/220*1.8; ctx.scale(k, k); shape([[-9,-6],[9,-7],[10,4],[-8,5]], '#e6b562', { ink: 2 }); inkLine([[-8,-1],[9,-2]], 3, '#7aa65a', { flat: 1 }); } });
function shards(origin, t0, n, seed, dir = 1){ // glass burst from a world point
  return t => { if (t < t0) return []; const u = t - t0, r = mulberry(seed), out = [];
    for (let i = 0; i < n; i++){ const vx = (r() - .5)*3.2 + dir*1.5, vy = 1 + r()*2.6, vz = 0.5 + r()*2.0, x = origin[0] + vx*u, y = Math.max(0.01, origin[1] + vy*u - 4.9*u*u), z = origin[2] + vz*u, rot = u*(r() - .5)*20, sz = 0.05 + r()*0.08;
      out.push({ pos: [x, y, z], draw: s => { const k = s*sz; ctx.rotate(rot); shape([[-k, -k*0.4], [k, -k], [k*0.3, k]], 'rgba(205,235,245,.85)', { ink: 1.4, shade: false, mis: [0,0] }); } }); }
    return out; };
}
function cups(origin, t0, n, seed){
  return t => { if (t < t0) return []; const u = t - t0, r = mulberry(seed), out = [];
    for (let i = 0; i < n; i++){ const vx = (r() - .5)*3, vy = 2 + r()*2, vz = (r() - .3)*2, y = origin[1] + vy*u - 4.9*u*u; if (y < 0) continue; const rot = u*(r() - .5)*14, c = CROWD_TOPS[(r()*12)|0];
      out.push({ pos: [origin[0] + vx*u, y, origin[2] + vz*u], draw: s => { const k = s*0.07; ctx.rotate(rot); shape([[-k*.6, -k], [k*.6, -k], [k*.45, k], [-k*.45, k]], c, { ink: 1.6, shade: false }); const d = mulberry(i); ctx.fillStyle = 'rgba(120,70,40,.7)'; for (let j = 0; j < 3; j++){ ctx.beginPath(); ctx.arc(-k*1.2 - j*k*0.6, k*(d() - .5), k*0.25, 0, 7); ctx.fill(); } } }); }
    return out; };
}
function clothes(origin, t0, n, seed){
  return t => { if (t < t0) return []; const u = t - t0, r = mulberry(seed), out = [];
    for (let i = 0; i < n; i++){ const vx = 1 + r()*3, vy = 1.5 + r()*2, vz = (r() - .5)*2, y = Math.max(0.02, origin[1] + vy*u - 4.0*u*u), rot = Math.min(u, 0.6)*(r() - .5)*12, c = CROWD_TOPS[(r()*12)|0];
      out.push({ pos: [origin[0] + vx*u*(y > 0.03 ? 1 : 0.6), y, origin[2] + vz*u], draw: s => { const k = s*0.18; ctx.rotate(rot); shape([[-k, -k*.6], [-k*.4, -k*.8], [k*.4, -k*.8], [k, -k*.6], [k*.8, -k*.2], [k*.45, -k*.3], [k*.45, k*.7], [-k*.45, k*.7], [-k*.45, -k*.3], [-k*.8, -k*.2]], c, { ink: 1.6 }); } }); }
    return out; };
}
const puddle = (x, z, rr, col = '#c98b4a') => ({ pos: [x, 0.01, z], layer: -1, draw: s => { ctx.scale(1, 0.28); shape(circlePts(0, 0, rr*s, rr*s*0.9, 16), col, { ink: 1.4, shade: false, mis: [0,0] }); } });

// ---------- shots ----------
const SHOTS = [];
const S = o => SHOTS.push(o);
const MALL = SETS.mall, U = MALL.units.back;

// 1. Hook: boy strolling, eating, on his phone. BANG at 2.8. Crowd panics.
{ const bx = t => -3.6 + Math.min(t, 2.8)*1.4;
  const boyPose = anim([[0, pz({})], [2.8, BP.startle, .07], [3.15, BP.scared, .12]]);
  const crowdA = crowd(11, 16, { x: [-14, 12], z: [[-5.5, -1.5]], tPanic: 2.95, pdir: 1, arms: .5 });
  S({ name: 'hook', dur: 3.7, set: MALL,
    cam: camT([[0, [-0.4, 1.75, 6.4], [0.2, 1.35, -2], 48], [3.7, [0.2, 1.7, 6.0], [0.6, 1.35, -2], 46]]),
    shake: shakeAt([[2.8, 0.25, 0.45]]),
    actors: tq => [...crowdA(tq), BOY([bx(tq), 0, 1.4], 1, t => t < 2.8 ? BOY_PHONE(t) : boyPose(t), { propsBack: (r, t) => { if (t < 2.8) boyFood(r); }, propsFront: (r, t) => { if (t < 2.8) boyPhone(r); } })],
    sprites: tq => tq >= 2.8 ? [foodSprite([bx(2.8) - 0.3, Math.max(0.03, 1.0 - 4.9*(tq - 2.8)**2*2), 1.6])] : [],
    over: (tq, cam, t) => { flash(t, 2.8, 0.12); fadeIn(t, 0.4); },
    sfx: [[0, 'amb_mall', 1], [0, 'muzak', 0.7], [2.8, 'bang', 1], [2.95, 'screams', 1]] });
}
// 2. Boy turns around.
{ const pose = anim([[0, BP.scared], [0.25, { ...BP.scared, air: 10 }, .06], [0.34, BP.scared, .08]]);
  const crowdB = crowd(12, 9, { x: [-8, 4], z: [[-5, -1.5]], mode: 'run', dir: 1, arms: .6 });
  S({ name: 'turn', dur: 1.0, set: MALL,
    cam: camT([[0, [1.6, 1.55, 4.0], [0.4, 1.5, 0], 40], [1, [1.5, 1.55, 3.8], [0.4, 1.5, 0], 38]]),
    actors: tq => [...crowdB(tq), BOY([0.3, 0, 1.4], tq < 0.25 ? 1 : -1, pose)],
    sfx: [[0.25, 'whoosh', .6]] });
}
// 3. Reveal: the hunter at the far end of the corridor. "There you are."
{ const hp = talk(anim([[0, HP.stand]]), 0.4, 1.4);
  const crowdC = crowd(13, 10, { x: [-27, -17], z: [[-5, -2.5], [3, 5.5]], mode: 'run', dir: 1, arms: .5, rs: 5 });
  S({ name: 'reveal', dur: 2.8, set: MALL,
    cam: camT([[0, [7, 1.55, 1.4], [-30, 1.65, 0.4], 30], [2.8, [6, 1.55, 1.4], [-30, 1.75, 0.4], 11]], 'out'),
    actors: tq => [...crowdC(tq), HUNTER([-30, 0, 0.4], 1, hp, { trails: false })],
    over: (tq, cam, t) => vignette(0.35),
    vo: [[0.4, 'h1']], sfx: [[0, 'sting', 1], [0.2, 'step_h', .5]] });
}
// 4. Close-up: the boy, terrified. Narrator.
{ const pose = withPose(anim([[0, pz({ ...BP.scared, head: 8 })]]), t => ({ rx: Math.sin(t*60)*0.8, eye: (t > 0.9 && t < 1.0) ? 'shut' : 'wide' }));
  const crowdD = crowd(14, 8, { x: [-10, 0], z: [[-5, -2]], mode: 'run', dir: 1, arms: .6 });
  S({ name: 'boyCU', dur: 1.8, set: MALL,
    cam: camT([[0, [-0.6, 1.62, 2.6], [0.35, 1.5, 1.2], 32], [1.8, [-0.5, 1.62, 2.4], [0.35, 1.52, 1.2], 30]]),
    actors: tq => [...crowdD(tq), BOY([0.3, 0, 1.4], -1, pose, { trails: false })],
    over: () => vignette(0.4),
    vo: [[0.1, 'n1']], sfx: [[0, 'heart', .7]] });
}
// 5. Drops the food, snaps into a sprint.
{ const pose = t => t < 0.35 ? anim([[0, BP.scared], [0.12, BP.antic, .1]])(t) : BRUN(t);
  const x = t => 0.3 + Math.max(0, t - 0.35)*5.5;
  S({ name: 'drop', dur: 1.0, set: MALL,
    cam: camT([[0, [1.4, 1.3, 5.2], [1.0, 1.0, 0], 44], [1, [2.4, 1.3, 5.2], [2.0, 1.0, 0], 44]]),
    actors: tq => [...crowd(15, 6, { x: [-6, 6], z: [[-5, -2]], mode: 'run', dir: 1, arms: .5 })(tq), BOY([x(tq), 0, 1.4], 1, pose, { propsBack: (r, t) => { if (t < 0.1) boyFood(r); } })],
    sprites: tq => tq >= 0.1 ? [foodSprite([0.15, Math.max(0.03, 0.95 - 4.9*(tq - 0.1)**2*2.2), 1.5])] : [],
    sfx: [[0.12, 'whoosh', .8], [0.35, 'steps_run', 1]] });
}
// 6. Chase: tracking. Shutters closing, guard shouting.
{ const x = t => 2 + t*6.2;
  const crowdE = crowd(16, 14, { x: [0, 30], z: [[-5.5, -2.5], [-0.6, 0.3]], mode: 'run', dir: 1, arms: .5, rs: 3.6 });
  S({ name: 'chase', dur: 2.8, set: MALL,
    cam: t => ({ pos: [x(t) - 1.4, 1.35, 5.6], target: [x(t) + 1.2, 1.2, 0], fov: 44 }),
    dyn: tq => U.filter(u => u.x0 > 0 && u.x0 < 30).flatMap((u, i) => shutter(u, clamp((tq - 0.2 - i*0.35)/1.4, 0, 1))),
    actors: tq => [...crowdE(tq), GUARDA([17, 0, -3.2], -1), BOY([x(tq), 0, 1.2], 1, BRUN)],
    sfx: [[0, 'steps_run', 1], [0.2, 'shutter', .8], [0.9, 'shutter', .6], [0, 'screams', .7]], vo: [[1.4, 'g1']] });
}
// 7. Looks back over his shoulder.
{ const x = t => 20 + t*6.2;
  S({ name: 'lookback', dur: 1.0, set: MALL,
    cam: t => ({ pos: [x(t) + 1.6, 1.55, 3.6], target: [x(t), 1.45, 1.2], fov: 40 }),
    actors: tq => [...crowd(17, 5, { x: [14, 28], z: [[-5, -2]], mode: 'run', dir: 1 })(tq), BOY([x(tq), 0, 1.2], 1, BRUN_BACK)],
    sfx: [[0, 'steps_run', 1]] });
}
// 8. The hunter walks, calm. Raises the rifle. Fires.
{ const hx = t => -8 + Math.min(t, 1.05)*1.25;
  const pose = t => t < 1.05 ? HWALK(t) : anim([[0, HP.stand], [0.0, HP.aim, .12], [0.55, HP.recoil, .03], [0.62, HP.aim, .12]])(t - 1.05);
  S({ name: 'hunterWalk', dur: 2.0, set: MALL,
    cam: camT([[0, [-1.0, 0.75, 4.2], [-7.5, 1.6, 0.6], 40], [2, [-1.6, 0.8, 3.9], [-6.6, 1.55, 0.6], 34]]),
    actors: tq => [...crowd(18, 8, { x: [-16, -2], z: [[-5, -3]], mode: 'run', dir: 1, arms: .6 })(tq), HUNTER([hx(tq), 0, 0.6], 1, pose, { muzzle: t => t >= 1.6 && t < 1.7 })],
    shake: shakeAt([[1.6, 0.12, 0.3]]),
    over: (tq, cam, t) => { vignette(0.35); flash(t, 1.6, 0.08); },
    sfx: [[0, 'step_h', .7], [0.65, 'step_h', .7], [1.05, 'rifle_up', .9], [1.6, 'bang', 1]] });
}
// 9. Shot shatters a window beside the boy; he dives behind a display.
{ const U9 = U.find(u => u.x0 === 32), wx = U9.x0 + 6.4, x = t => 28 + Math.min(t, 0.55)*6.2 + Math.max(0, Math.min(t, 0.9) - 0.55)*5;
  const pose = t => t < 0.55 ? BRUN(t) : anim([[0, BP.dive, .06], [0.32, BP.crouch, .07]])(t - 0.55);
  const gl = shards([wx, 1.7, -6.9], 0.15, 26, 9, -1);
  const disp = [...box(36.4, 0, -3.6, 38.6, 0.95, -2.6, '#8a6f55', { top: '#e6dccb' }), ...rackFaces(37.5, -3.0, 4)];
  S({ name: 'shatter', dur: 1.6, set: MALL,
    cam: t => ({ pos: [32.5 + t*1.6, 1.3, 1.2], target: [35 + t*1.6, 1.1, -4.5], fov: 50 }),
    dyn: tq => [...disp, ...(tq >= 0.15 ? [rectZ(wx - 0.9, 0.5, wx + 0.9, 2.8, -6.97, '#3e3a3a', { nohatch: true })] : [])],
    actors: tq => [BOY([x(tq), 0, -4.4], 1, pose, { zbias: 0.5 })],
    sprites: gl,
    shake: shakeAt([[0.15, 0.08, 0.25]]),
    over: (tq, cam, t) => { if (t >= 0.15 && t < 0.3){ const p = proj(cam, [wx, 1.7, -6.9]); ctx.save(); burst(p, 30, 90, 10, '#e9f6fa', 7); radLines(p, 95, 150, 12, 3, 8); ctx.restore(); } },
    sfx: [[0.15, 'glass', 1], [0.55, 'whoosh', .8], [0.87, 'thud', .7]] });
}
// 10. Hiding behind the display, panting. Narrator.
{ S({ name: 'hide', dur: 2.3, set: MALL,
    cam: camT([[0, [38.5, 1.1, -6.7], [36.6, 0.75, -2.0], 52], [2.3, [38.4, 1.1, -6.65], [36.6, 0.77, -2.0], 48]]),
    dyn: () => [...box(36.4, 0, -3.6, 38.6, 0.95, -2.6, '#8a6f55', { top: '#e6dccb' }), ...rackFaces(37.5, -3.0, 4), rectZ(37.5, 0.5, 39.3, 2.8, -6.97, '#3e3a3a', { nohatch: true })],
    actors: tq => [...crowd(19, 5, { x: [26, 44], z: [[1.5, 4]], mode: 'run', dir: 1 })(tq), BOY([37.0, 0, -4.4], 1, withPose(BCROUCH_PANT, t => t > 1.6 ? { flip: 1, head: -20 } : {}))],
    sprites: tq => { const r = mulberry(5), o = []; for (let i = 0; i < 14; i++){ const p = [37.5 + (r() - .5)*3, 0.01, -5.6 + r()*1.4]; o.push({ pos: p, layer: -1, draw: s => { const k = s*0.06; shape([[-k, 0], [k, -k*0.3], [k*0.4, k*0.3]], 'rgba(205,235,245,.8)', { ink: 1, shade: false, mis: [0,0] }); } }); } return o; },
    over: () => vignette(0.4),
    vo: [[0.1, 'n2']], sfx: [[0, 'breath', .8]] });
}
// 11. Clothing store: bursts through, mannequins and racks go flying.
{ const STORE = SETS.store, x = t => -9 + t*5.6;
  const rackFall = (rx, rz, t0, seed) => tq => { const a = clamp((tq - t0)/0.35, 0, 1); return a <= 0 ? rackFaces(rx, rz, seed) : rotFaces(rackFaces(rx, rz, seed), [rx, 0, rz - 0.05], 'x', -EASE.out(a)*1.45); };
  const mann = (mx, mz, t0, c, dir) => ({ cos: { ...COS.mannequin, top: c, sleeve: c }, pos: [mx + (tq0 => 0)(0), 0, mz], facing: dir, shadow: true, pose: t => pz({ rot: clamp((t - t0)/0.3, 0, 1)**2 * 88 * dir * 1, aFu: 20, aFl: 10, aBu: -20, aBl: 10 }) });
  S({ name: 'store', dur: 2.5, set: STORE,
    cam: camT([[0, [-4, 1.7, 4.4], [-2, 1.0, -2], 54], [2.5, [1.5, 1.7, 4.2], [2.5, 1.0, -2], 52]]),
    dyn: tq => [...rackFall(-4.2, -1.4, 0.95, 3)(tq), ...rackFall(2.4, -1.6, 1.95, 5)(tq), ...rackFaces(-6.5, -3.5, 8)],
    actors: tq => [mann(-1.6, -0.3, 1.38, '#c96a8a', 1), mann(0.4, 0.2, 1.72, '#7fa1c4', 1), mann(-6.8, 1.2, 99, '#e0b26a', 1), BOY([x(tq), 0, -0.5], 1, BRUN)],
    sprites: tq => [...clothes([-4.2, 1.1, -1.2], 0.95, 6, 3)(tq), ...clothes([2.4, 1.1, -1.4], 1.95, 6, 4)(tq)],
    shake: shakeAt([[0.95, .06, .2], [1.4, .06, .2], [1.95, .06, .2]]),
    sfx: [[0, 'steps_run', 1], [0.95, 'crash', .9], [1.4, 'crash', .7], [1.72, 'crash', .7], [1.95, 'crash', .9]] });
}
// 12. Slides under a closing security shutter.
{ const x = t => -4 + t*5.2, sh = t => clamp((t - 0.1)/1.15, 0, 1);
  const pose = t => t < 0.55 ? BRUN(t) : t < 1.15 ? anim([[0, BP.slide, .07]])(t - 0.55) : anim([[0, BP.kneel, .08], [0.18, BRUN(0), .1]])(t - 1.15);
  const shut = tq => { const f = sh(tq), h = 2.7*(1 - EASE.inout(f)), x0 = 1.4, F = [];
    F.push(rectX(-4.5, 0, -0.6, 3.0, x0 - 0.05, '#cbbfa8', { nx: -1, edge: true }));
    F.push(face([[x0, h, -4.4], [x0, h, -0.7], [x0, 3.0, -0.7], [x0, 3.0, -4.4]], '#a8adb3', [-1, 0, 0], { nohatch: true, zbias: -0.6 }));
    for (let y = h + 0.16; y < 3.0; y += 0.16) F.push(line3([[x0 - 0.01, y, -4.4], [x0 - 0.01, y, -0.7]], { w: 1, a: .55 }));
    return F; };
  S({ name: 'shutter', dur: 1.5, set: SETS.store,
    cam: camT([[0, [-2.4, 0.7, 2.6], [1.6, 0.8, -2.6], 50], [1.5, [-2.0, 0.65, 2.4], [1.9, 0.75, -2.6], 48]]),
    dyn: shut,
    actors: tq => [BOY([x(tq), 0, -2.5], 1, pose)],
    sfx: [[0, 'shutter', 1], [0.55, 'slide', .9], [1.25, 'clang', .8]] });
}
// 13. Into the fitting rooms; curtain snaps shut.
{ const path = track([[0, 0.5, 0, -3.2], [0.55, 4.6, 0, -3.6], [0.8, 5.0, 0, -6.1]]);
  S({ name: 'fitting', dur: 1.3, set: SETS.store,
    cam: camT([[0, [4.6, 1.6, 2.6], [4.4, 1.2, -5], 46], [1.3, [4.8, 1.55, 2.3], [4.8, 1.2, -5], 44]]),
    dyn: tq => [curtainFace(2.06, 3.94, -4.98, 0, '#7b2e3a'), curtainFace(4.06, 5.94, -4.98, tq < 0.8 ? 1 : 1 - EASE.snap(clamp((tq - 0.8)/0.12, 0, 1)), '#7b2e3a'), curtainFace(6.06, 7.94, -4.98, 0, '#7b2e3a')],
    actors: tq => tq < 1.0 ? [BOY(path(tq), 1, t => t < 0.55 ? BRUN(t) : BP.crouch, { zbias: 0 })] : [],
    sfx: [[0, 'steps_run', 1], [0.8, 'curtain', 1]] });
}
// 14. POV through the curtain gap: the hunter's shoes approach. "You cannot hide forever."
{ const hx = t => 9.5 - Math.min(t, 2.0)*2.25;
  S({ name: 'pov', dur: 4.4, set: SETS.store,
    cam: camT([[0, [5.0, 0.45, -5.7], [5.0, 0.32, 2], 52], [4.4, [5.0, 0.45, -5.6], [5.0, 0.34, 2], 48]]),
    actors: tq => [HUNTER([hx(tq), 0, -3.5], -1, t => t < 2.0 ? HWALK(t) : HP.stand, { trails: false })],
    over: (tq, cam, t) => { // curtain fabric framing a narrow gap
      const gap = 70 + Math.sin(t*1.3)*6, cx = W/2 + Math.sin(t*0.9)*8;
      for (const side of [-1, 1]){ const edge = cx + side*gap/2, far = side < 0 ? -50 : W + 50;
        ctx.fillStyle = '#3b1219'; pathPts([[edge, -50], [far, -50], [far, H + 50], [edge + side*6, H + 50]]); ctx.fill();
        for (let k = 1; k < 8; k++){ const fx = edge + side*k*(W/2/8); inkLine([[fx, -20], [fx + side*4, H/2], [fx, H + 20]], 3, 'rgba(0,0,0,.5)', { flat: 1 }); }
        inkLine([[edge, -20], [edge + side*5, H/2], [edge + side*6, H + 20]], 4, INK); }
      vignette(0.75); },
    vo: [[2.5, 'h2_echo']], sfx: [[0, 'heart', 1], [0.3, 'step_h', .7], [0.95, 'step_h', .75], [1.6, 'step_h', .8]] });
}
// 15. Boy holds his breath.
{ S({ name: 'holdbreath', dur: 1.3, set: SETS.store,
    cam: camT([[0, [5.9, 0.95, -5.4], [4.6, 0.85, -6.1], 54], [1.3, [5.85, 0.95, -5.45], [4.6, 0.87, -6.1], 50]]),
    actors: tq => [BOY([4.6, 0, -6.1], 1, BHOLD, { trails: false })],
    over: () => { ctx.fillStyle = 'rgba(40,10,20,.25)'; ctx.fillRect(-100, -100, W + 200, H + 200); vignette(0.7); },
    sfx: [[0, 'heart', 1]] });
}
// 16. The hunter rips open the curtain next door.
{ S({ name: 'rip', dur: 0.9, set: SETS.store,
    cam: camT([[0, [6.2, 1.5, 1.8], [6.4, 1.2, -5], 46], [0.9, [6.3, 1.5, 1.6], [6.6, 1.2, -5], 44]]),
    dyn: tq => [curtainFace(4.06, 5.94, -4.98, 0, '#7b2e3a'), curtainFace(6.06, 7.94, -4.98, EASE.snap(clamp((tq - 0.2)/0.1, 0, 1)), '#7b2e3a')],
    actors: tq => [HUNTER([8.6, 0, -3.9], -1, anim([[0, HP.grab], [0.2, HP.pull, .07]]), { trails: true })],
    shake: shakeAt([[0.2, .05, .2]]),
    sfx: [[0.2, 'curtain', 1]] });
}
// 17. Boy bursts out of his own cubicle and out the back door.
{ const path = track([[0, 5.0, 0, -6.0], [0.25, 4.6, 0, -4.2], [0.75, 1.0, 0, -4.6], [1.05, 0.4, 0, -6.6]]);
  S({ name: 'burstout', dur: 1.25, set: SETS.store,
    cam: camT([[0, [3.6, 1.55, 2.6], [3.0, 1.2, -5], 50], [1.25, [2.8, 1.55, 2.6], [2.2, 1.2, -5], 50]]),
    dyn: tq => [curtainFace(4.06, 5.94, -4.98, EASE.snap(clamp(tq/0.08, 0, 1)), '#7b2e3a'), curtainFace(6.06, 7.94, -4.98, 1, '#7b2e3a'), ...(tq > 0.95 ? [rectZ(-0.4, 0, 1.2, 2.2, -6.97, '#fff4dc', { glow: true, flat: true })] : [])],
    actors: tq => [HUNTER([6.4, 0, -3.9], -1, anim([[0, HP.pull], [0.25, { ...HP.hang, flip: 1 }, .07]]), { trails: false }), ...(tq < 1.05 ? [BOY(path(tq), -1, BRUN)] : [])],
    sfx: [[0, 'curtain', 1], [0.1, 'steps_run', 1], [0.98, 'door', 1]] });
}
// 18. Food court chaos: tables flip, he hurdles a table.
{ const FOOD = SETS.food, x = t => -15 + t*6.0, hurdleT = [1.85, 2.3];
  const flips = [[-8.75, -3, 0.55], [-5.25, -3, 0.9], [5.25, -3, 1.3], [-1.75, 0.5, 1.6]];
  const pose = t => (t >= hurdleT[0] && t < hurdleT[1]) ? BP.hurdle : BRUN(t);
  S({ name: 'foodcourt', dur: 2.6, set: FOOD,
    cam: camT([[0, [-6, 2.1, 6.0], [-4, 0.9, -3], 56], [2.6, [1.5, 2.0, 5.8], [3.5, 0.9, -3], 54]]),
    dyn: tq => [...flips.flatMap(([fx, fz, t0]) => { const a = clamp((tq - t0)/0.25, 0, 1); const F = [...tableFaces(fx, fz)]; return a <= 0 ? F : rotFaces(F, [fx, 0, fz - 0.45], 'x', -EASE.out(a)*1.5); }), ...tableFaces(FC_TABLES[9][0], FC_TABLES[9][1])],
    actors: tq => [...crowd(21, 18, { x: [-14, 14], z: [[-9, -4.5], [-2, 2], [3, 6]], tPanic: 0, arms: .6 })(tq), BOY([x(tq), 0, -1.5], 1, pose, { zbias: -0.2 })],
    sprites: tq => [...cups([-8.75, 0.8, -3], 0.55, 4, 1)(tq), ...cups([5.25, 0.8, -3], 1.3, 4, 2)(tq), ...cups([-1.75, 0.8, 0.5], 1.6, 3, 3)(tq), puddle(-8.5, -2.2, 0.6 * clamp((tq - 0.7)*3, 0, 1) + 0.01), puddle(-1.5, -0.6, 0.7 * clamp((tq - 1.8)*3, 0, 1) + 0.01, '#8a4f2a')],
    shake: shakeAt([[0.55, .05, .2], [0.9, .05, .2], [1.3, .05, .2], [1.6, .05, .2]]),
    sfx: [[0, 'screams', 1], [0, 'steps_run', 1], [0.55, 'table', .9], [0.9, 'table', .8], [1.3, 'table', .9], [1.6, 'table', .8], [0.6, 'splash', .7], [1.65, 'splash', .7], [1.85, 'whoosh', .8]] });
}
// 19. Slips on a spilled drink, crashes down.
{ const x = t => 3 + Math.min(t, 0.45)*6 + Math.max(0, Math.min(t, 0.75) - 0.45)*4;
  const pose = t => t < 0.45 ? BRUN(t) : anim([[0, BP.slip, .07], [0.32, BP.floorHit, .05], [0.7, BP.floor, .12]])(t - 0.45);
  S({ name: 'slip', dur: 1.4, set: SETS.food,
    cam: camT([[0, [4.6, 0.9, 3.6], [5.6, 0.5, -1.6], 46], [1.4, [5.2, 0.85, 3.4], [6.2, 0.45, -1.6], 44]]),
    actors: tq => [BOY([x(tq), 0, -1.6], 1, pose)],
    sprites: tq => [puddle(5.9, -1.4, 0.8, '#c98b4a')],
    shake: shakeAt([[0.77, .18, .3]]),
    over: (tq, cam, t) => { if (t >= 0.77 && t < 0.95){ const p = proj(cam, [6.6, 0.2, -1.6]); burst(p, 20, 60, 8, '#fff2b0', 5); radLines(p, 64, 100, 9, 2.6, 5); } },
    sfx: [[0.42, 'squeak', 1], [0.47, 'whoosh', .8], [0.77, 'thud', 1]] });
}
// 20. On the floor, looks up.
{ S({ name: 'lookup', dur: 0.9, set: SETS.food,
    cam: camT([[0, [8.2, 0.35, 0.4], [6.6, 0.3, -1.6], 42], [0.9, [8.0, 0.35, 0.3], [6.6, 0.32, -1.6], 38]]),
    actors: tq => [BOY([6.6, 0, -1.6], 1, withPose(anim([[0, BP.floor]]), { head: 70 }), { trails: false })],
    over: () => vignette(0.45), sfx: [[0, 'sting2', .8]] });
}
// 21. The hunter, perfectly still in the chaos, scanning. Glint. "Found you."
{ const hp = talk(anim([[0, HP.stand], [0.6, { ...HP.stand, flip: 1, head: -4 }, .12, 'inout'], [1.5, { ...HP.stand, head: 4 }, .12, 'inout'], [2.2, { ...HP.stand, head: 6, glint: 1 }, .06]]), 2.55, 1.0);
  S({ name: 'scan', dur: 3.5, set: SETS.food,
    cam: camT([[0, [-1.2, 1.6, 4.6], [-2.4, 1.7, -3], 40], [3.5, [-1.6, 1.85, 2.3], [-2.4, 1.95, -3], 30]], 'inout'),
    actors: tq => [...crowd(22, 14, { x: [-14, 10], z: [[-8, -4.5], [-1.5, 1.5]], mode: 'run', arms: .6 })(tq), HUNTER([-2.4, 0, -3.0], 1, hp, { trails: false })],
    over: () => vignette(0.4),
    vo: [[2.55, 'h3']], sfx: [[0, 'screams', .7], [2.2, 'glint', 1], [2.2, 'sting', .9]] });
}
// 22. Scrambles up and sprints for the escalator.
{ const x = t => 6.6 + Math.max(0, t - 0.55)*6;
  const pose = t => t < 0.55 ? anim([[0, BP.floor], [0.12, BP.kneel, .08], [0.36, BP.antic, .07]])(t) : BRUN(t);
  S({ name: 'scramble', dur: 1.3, set: SETS.food,
    cam: camT([[0, [6.0, 1.1, 3.4], [7.4, 0.8, -1.6], 48], [1.3, [8.5, 1.2, 3.4], [10.5, 0.9, -1.6], 48]]),
    actors: tq => [BOY([x(tq), 0, -1.6], 1, pose)],
    sfx: [[0.12, 'whoosh', .7], [0.55, 'steps_run', 1]] });
}
// 23. Up the escalator, two steps at a time. The hunter arrives below.
{ const bx = t => -5 + t*5.4;
  S({ name: 'escalator', dur: 2.7, set: SETS.atrium,
    cam: camT([[0, [-1.0, 2.2, 7.5], [-0.5, 1.9, 0], 48], [2.7, [5.0, 4.6, 7.5], [5.5, 4.3, 0], 48]]),
    actors: tq => [BOY([bx(tq), escY(bx(tq)) + 0.02, 0], 1, BRUN), ...(tq > 1.6 ? [HUNTER([-9 + (tq - 1.6)*1.25, 0, 0.0], 1, HWALK, { trails: false })] : []), ...crowd(23, 6, { x: [10, 30], z: [[-8, 2]], mode: 'run', dir: 1 })(tq).map(a => ({ ...a, pos: [a.pos[0], 5.0, a.pos[2]] }))],
    sfx: [[0, 'steps_run', 1], [0, 'escalator', .6]] });
}
// 24. Top floor: the exit sign... and the hunter at the far end. Boy freezes.
{ const exitSign = [sign([24, 3.9, 0], [27, 3.9, 0], [24, 3.3, 0], 'EMERGENCY EXIT  >', { bg: '#2f9a55', col: '#ffffff', size: 22, glow: true }), line3([[24.3, 3.9, 0], [24.3, 4.2, 0]], { w: 1.2 }), line3([[26.7, 3.9, 0], [26.7, 4.2, 0]], { w: 1.2 })];
  S({ name: 'exitsign', dur: 0.8, set: SETS.top,
    cam: camT([[0, [21.5, 2.4, 3.6], [25.5, 3.6, 0], 30], [0.8, [21.8, 2.4, 3.4], [25.5, 3.6, 0], 26]]),
    dyn: () => exitSign, sfx: [[0, 'sting2', .6]] });
  const bx = t => 10 + Math.min(t, 0.9)*6.4;
  const bpose = t => t < 0.9 ? BRUN(t) : anim([[0, BP.freeze, .06]])(t - 0.9);
  S({ name: 'blocked', dur: 2.2, set: SETS.top,
    cam: camT([[0, [19.2, 1.7, 6.6], [19.8, 1.5, -1], 58], [2.2, [19.6, 1.7, 6.0], [19.9, 1.5, -1], 54]]),
    dyn: () => exitSign,
    actors: tq => [BOY([bx(tq), 0, 0.8], 1, bpose), ...(tq > 0.7 ? [HUNTER([23.6, 0, 0.6], -1, HP.stand, { trails: false })] : [])],
    sfx: [[0, 'steps_run', 1], [0.7, 'sting', 1], [0.9, 'skid', .8]] });
}
// 25. The hunter slowly raises his rifle.
{ S({ name: 'raise', dur: 1.2, set: SETS.top,
    cam: camT([[0, [20.7, 0.9, 3.0], [23.6, 1.75, 0.6], 36], [1.2, [21.0, 0.9, 2.8], [23.6, 1.75, 0.6], 32]]),
    dyn: () => [sign([24, 3.9, 0], [27, 3.9, 0], [24, 3.3, 0], 'EMERGENCY EXIT  >', { bg: '#2f9a55', col: '#ffffff', size: 22, glow: true })],
    actors: tq => [HUNTER([23.6, 0, 0.6], -1, anim([[0, HP.stand], [0.15, HP.aim, .8, 'inout']]), { trails: false })],
    over: () => vignette(0.5), sfx: [[0.15, 'rifle_up', 1]] });
}
// 26. Dives through the staff door.
{ const door = (open) => { const d = face([[17.6, 0, -6.96], [18.8, 0, -6.96], [18.8, 2.2, -6.96], [17.6, 2.2, -6.96]], '#8a7f6e', [0, 0, 1], { nohatch: true, two: true }); return [rectZ(17.6, 0, 18.8, 2.2, -6.97, '#2a2622', { nohatch: true, flat: true }), ...rotFaces([d], [17.6, 0, -6.96], 'y', open*1.4), sign([17.6, 2.55, -6.95], [18.8, 2.55, -6.95], [17.6, 2.3, -6.95], 'STAFF ONLY', { bg: '#c4473a', col: '#fff', size: 26 })]; };
  const path = track([[0, 16.4, 0, 0.8], [0.25, 17.0, 0, -1.5], [0.6, 18.1, 0, -6.4]]);
  S({ name: 'staffdoor', dur: 1.0, set: SETS.top,
    cam: camT([[0, [13.5, 1.6, 4.5], [18, 1.2, -4], 48], [1.0, [14.0, 1.6, 4.3], [18, 1.2, -4], 46]]),
    dyn: tq => door(tq < 0.45 ? 0 : tq < 0.75 ? 1 : 1 - (tq - 0.75)*3),
    actors: tq => tq < 0.62 ? [BOY(path(tq), 1, t => t < 0.25 ? BP.freeze : BP.dive, { zbias: -1 })] : [],
    sfx: [[0.2, 'whoosh', .9], [0.45, 'door', 1]] });
}
// 27. Service corridor sprint, crashes through the emergency exit into light.
{ const SV = SETS.service, bx = t => 4 + t*6.4;
  S({ name: 'service', dur: 1.9, set: SV,
    cam: t => ({ pos: [bx(t) + 4.5, 1.7, 0.9], target: [bx(t) - 1, 1.1, -0.4], fov: 52 }),
    actors: tq => [BOY([bx(tq), 0, -0.3], 1, BRUN)],
    over: () => vignette(0.45), sfx: [[0, 'steps_run_hall', 1]] });
  const bx2 = t => 33 + t*6.4;
  S({ name: 'exitdoor', dur: 1.2, set: SV,
    cam: camT([[0, [31, 1.5, 0.5], [40, 1.2, -0.1], 50], [1.2, [33.5, 1.5, 0.5], [40, 1.2, -0.1], 50]]),
    dyn: tq => exitDoorFaces(40, clamp((tq - 0.95)/0.1, 0, 1)),
    actors: tq => tq < 1.08 ? [BOY([bx2(tq), 0, -0.1], 1, BRUN)] : [],
    over: (tq, cam, t) => { vignette(0.4); if (t > 0.95){ ctx.fillStyle = `rgba(255,251,238,${clamp((t - 0.95)/0.25, 0, 1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); } },
    shake: shakeAt([[0.95, .15, .25]]),
    sfx: [[0, 'steps_run_hall', 1], [0.95, 'door', 1]] });
}
// 28. Car park: sprints, looks for cover, dives behind a car. The exit door bursts open.
{ const CP = SETS.carpark, path = track([[0, -7, 0, -11.5], [0.8, -3.5, 0, -6], [1.3, -0.5, 0, -2.0], [1.9, 1.6, 0, 1.75]]);
  const pose = t => t < 1.3 ? BRUN(t) : t < 1.55 ? withPose(BRUN, { flip: 1 })(t) : anim([[0, BP.dive, .06], [0.25, BP.crouch, .07]])(t - 1.55);
  const doorOpen = t => clamp((t - 2.2)/0.08, 0, 1);
  S({ name: 'carpark', dur: 3.0, set: CP,
    cam: camT([[0, [-3.5, 1.6, 7.6], [-2.5, 1.0, -4], 56], [3.0, [0.5, 1.5, 7.0], [0.5, 0.9, -4], 52]]),
    dyn: tq => [...carFaces(2, 0.6, '#5e8fbf', { door: 0.35 }), ...rotFaces([rectZ(-6.7, 0, -5.3, 2.2, -13.95, '#6f8a6a', { nohatch: true, two: true })], [-5.3, 0, -13.95], 'y', -doorOpen(tq)*1.5), ...(doorOpen(tq) > 0 ? [rectZ(-6.7, 0, -5.3, 2.2, -13.97, '#fff8e6', { glow: true, flat: true })] : [])],
    actors: tq => [BOY(path(tq), 1, pose, { zbias: -0.6 }), ...(tq > 2.3 ? [HUNTER([-6, 0, -12.8 + (tq - 2.3)*1.2], 1, HWALK, { trails: false })] : [])],
    shake: shakeAt([[2.2, .06, .2]]),
    sfx: [[0, 'steps_run_hall', 1], [1.55, 'whoosh', .8], [1.85, 'thud', .5], [2.2, 'door', 1]] });
}
// 29. Over the boy's shoulder: the hunter scans, then walks towards the car.
{ const hp = t => t < 1.0 ? anim([[0, HP.stand], [0.4, { ...HP.stand, flip: 1 }, .12, 'inout'], [0.8, HP.stand, .12, 'inout']])(t) : HWALK(t);
  const hpos = t => [-5.5 + Math.max(0, t - 1.0)*1.1, 0, -11.5 + Math.max(0, t - 1.0)*2.2];
  S({ name: 'carwatch', dur: 2.4, set: SETS.carpark,
    cam: camT([[0, [-0.4, 1.3, 5.4], [-2.0, 0.9, -8], 50], [2.4, [-0.3, 1.35, 5.2], [-1.6, 0.9, -8], 46]]),
    dyn: () => carFaces(2, 0.6, '#5e8fbf', { door: 0.35 }),
    actors: tq => [BOY([1.6, 0, 1.75], 1, withPose(BCROUCH_PANT, { flip: 1, head: -30, mouth: 'grit' }), { trails: false, zbias: -0.6 }), HUNTER(hpos(tq), 1, hp, { trails: false })],
    over: () => vignette(0.35), sfx: [[1.0, 'step_h', .5], [1.65, 'step_h', .55], [2.3, 'step_h', .6]] });
}
// 30. Close: hand over mouth.
{ S({ name: 'covermouth', dur: 1.3, set: SETS.carpark,
    cam: camT([[0, [3.0, 0.85, 3.2], [1.6, 0.78, 1.75], 36], [1.3, [2.9, 0.85, 3.1], [1.6, 0.8, 1.75], 32]]),
    dyn: () => carFaces(2, 0.6, '#5e8fbf', { door: 0.35 }),
    actors: tq => [BOY([1.6, 0, 1.75], 1, withPose(BHOLD, t => ({ hm: 1, hfx: 16, hfy: 10, flip: Math.floor(t*2.5) % 2 })), { trails: false, zbias: -0.6 })],
    over: () => vignette(0.6), sfx: [[0, 'heart', 1], [0.6, 'step_h', .7]] });
}
// 31. Under the car: the shoes stop right beside it. Silence.
{ const hx = t => -2.5 + Math.min(t, 1.2)*2.6;
  S({ name: 'undercar', dur: 2.4, set: SETS.carpark,
    cam: camT([[0, [2.0, 0.16, 3.4], [2.0, 0.22, -3], 54], [2.4, [2.1, 0.16, 3.3], [2.1, 0.22, -3], 50]]),
    dyn: () => carFaces(2, 0.6, '#5e8fbf', { door: 0.35 }),
    actors: tq => [HUNTER([hx(tq), 0, -0.9], 1, t => t < 1.2 ? HWALK(t) : HP.stand, { trails: false })],
    over: () => vignette(0.7), sfx: [[0, 'heart', .6], [0.05, 'step_h', .9], [0.7, 'step_h', 1], [1.25, 'step_h', 1.1]] });
}
// 32. A car alarm goes off across the car park. The hunter turns.
{ const lights = tq => Math.floor(tq*4) % 2 ? '#ffb43a' : null;
  S({ name: 'alarm', dur: 1.4, set: SETS.carpark,
    cam: camT([[0, [4.6, 1.65, 0.8], [-14, 1.1, -7.5], 46], [1.4, [4.4, 1.65, 0.7], [-15, 1.1, -7.8], 42]]),
    dyn: tq => [...carFaces(2, 0.6, '#5e8fbf', { door: 0.35 }), ...carFaces(-18, -8.5, '#3d6f9a', { lights: lights(tq) })],
    actors: tq => [HUNTER([0.8, 0, -0.9], 1, anim([[0, HP.stand], [0.25, { ...HP.stand, flip: 1, head: -6 }, .08]]), { trails: false })],
    over: (tq, cam, t) => { if (Math.floor(t*4) % 2){ const p = proj(cam, [-18, 0.8, -8.5]); const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 260); g.addColorStop(0, 'rgba(255,190,80,.45)'); g.addColorStop(1, 'rgba(255,190,80,0)'); ctx.fillStyle = g; ctx.fillRect(p[0] - 260, p[1] - 260, 520, 520); } },
    sfx: [[0, 'alarm', 1]] });
}
// 33. Street: sprints, hurdles the barrier, vanishes into the crowd.
{ const ST = SETS.street, path = track([[0, -3, 0, 5.0], [0.55, -1.2, 0, 3.0], [0.85, -0.4, 0, 2.3], [1.9, 3.5, 0, -6.5], [2.6, 6.5, 0, -7.6]]);
  const pose = t => (t >= 0.5 && t < 0.85) ? BP.hurdle : BRUN(t);
  S({ name: 'street', dur: 2.6, set: ST,
    cam: camT([[0, [-2.5, 1.7, 7.4], [-0.5, 1.0, -4], 52], [2.6, [0.5, 1.7, 7.2], [3.0, 1.0, -5], 46]]),
    actors: tq => [...crowd(31, 16, { x: [-14, 18], z: [[-7.1, -6.4]], mode: 'walk' })(tq), BOY(path(tq), 1, pose)],
    sfx: [[0, 'traffic', 1], [0, 'alarm', .45], [0, 'steps_run_out', 1], [0.5, 'whoosh', .8], [0.82, 'thud', .4]] });
}
// 34. The hunter at the barrier. Adjusts his glasses. "Next time."
{ const hp = talk(anim([[0, HP.hang], [1.0, HP.glasses, .45, 'inout'], [1.9, HP.hang, .4, 'inout']]), 1.6, 1.2);
  S({ name: 'nexttime', dur: 3.1, set: SETS.street,
    cam: camT([[0, [-2.4, 1.85, 6.2], [1.0, 1.75, 2.9], 34], [3.1, [-2.0, 1.9, 5.6], [1.0, 1.85, 2.9], 26]]),
    actors: tq => [...crowd(31, 16, { x: [-14, 18], z: [[-7.1, -6.4]], mode: 'walk' })(tq + 2.6), HUNTER([1.0, 0, 3.0], -1, hp, { trails: false })],
    over: () => vignette(0.35),
    vo: [[1.6, 'h4']], sfx: [[0, 'traffic', .8], [0, 'alarm', .3], [1.0, 'cloth', .6]] });
}
// 35. Final: across the road, the boy looks back, gasping. Cut to black.
{ const pose = t => t < 1.3 ? GASP(t) : anim([[0, BP.gaspA], [0.0, { ...BP.lookBack }, .12]])(t - 1.3);
  S({ name: 'final', dur: 3.4, set: SETS.street,
    cam: camT([[0, [-1.4, 1.45, -9.9], [2.8, 1.3, 1.5], 46], [3.4, [-1.3, 1.45, -9.85], [2.4, 1.3, 1.5], 42]]),
    actors: tq => [...crowd(31, 16, { x: [-14, 18], z: [[-7.1, -6.4]], mode: 'walk' })(tq + 5.7), HUNTER([1.0, 0, 3.0], -1, t => t < 2.0 ? HP.hang : withPose(HWALK_HANG, { flip: 0 })(t), { facing: tq < 2.0 ? -1 : 1, trails: false }), BOY([0, 0, -7.3], 1, withPose(pose, t => t > 1.3 ? { mouth: Math.floor(t*3) % 2 ? 'open' : 'o' } : {}), { trails: false })]
      .map(a => a.cos === COS.hunter ? { ...a, pos: tq < 2.0 ? [1.0, 0, 3.0] : [1.0 + (tq - 2.0)*1.2, 0, 3.0 + (tq - 2.0)*0.5], facing: tq < 2.0 ? -1 : 1 } : a),
    over: (tq, cam, t) => { if (t >= 3.0){ ctx.fillStyle = '#000'; ctx.fillRect(-100, -100, W + 200, H + 200); } },
    sfx: [[0, 'traffic', 1], [0, 'breath', 1], [3.0, 'cut', 1]] });
}
// 36. Black.
S({ name: 'black', dur: 1.2, set: { faces: [], bg: () => { ctx.fillStyle = '#000'; ctx.fillRect(-100, -100, W + 200, H + 200); } }, cam: () => ({ pos: [0, 1, 5], target: [0, 1, 0], fov: 40 }), noPaper: true });

// ---------- timeline ----------
let acc = 0; for (const s of SHOTS){ s.start = acc; acc += s.dur; }
const DURATION = acc;
function shotAt(T){ for (const s of SHOTS) if (T < s.start + s.dur) return s; return SHOTS[SHOTS.length - 1]; }
function renderAt(T){ const s = shotAt(T); renderShot(s, T - s.start, T); }
function cueList(){ const out = []; for (const s of SHOTS){ for (const [t, n, g] of (s.sfx || [])) out.push({ t: +(s.start + t).toFixed(3), kind: 'sfx', name: n, gain: g ?? 1, shot: s.name, shotEnd: +(s.start + s.dur).toFixed(3) }); for (const [t, n] of (s.vo || [])) out.push({ t: +(s.start + t).toFixed(3), kind: 'vo', name: n, shot: s.name }); } return { duration: DURATION, shots: SHOTS.map(s => ({ name: s.name, start: +s.start.toFixed(3), dur: s.dur })), cues: out }; }
