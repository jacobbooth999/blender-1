// Frame-deterministic renderer: window.renderFrame(f) draws frame f (30 fps) into #out (2D canvas) =
// three.js scene -> DOF + grade pass -> word-pop captions + title cards.
import * as THREE from 'three';
import { makeChar, setFace, setBadge, applyPose, POSES } from './rig.js';
import { buildWorld } from './sets.js';
import { SHOTS, CAST, WORDS_URL } from './story.js';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1080), H = +(params.get('h') || 1920), PX = W / 1080;
const FPS = 30;

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W / H, .1, 1500);
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .45; }

const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.FloatType;

// sky dome
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top,hor,bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0. ? mix(hor, top, pow(clamp(h*1.6,0.,1.),.7)) : mix(hor, bot, clamp(-h*4.,0.,1.)); gl_FragColor=vec4(c,1.); }',
}));
scene.add(sky);
// clouds: puffy low-poly blobs
const clouds = new THREE.Group(); scene.add(clouds);
const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: .25 });
for (let i = 0; i < 14; i++) {
  const g = new THREE.Group(); const a = i / 14 * Math.PI * 2;
  g.position.set(Math.cos(a) * 420, 110 + (i % 4) * 22, Math.sin(a) * 420);
  for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(18 + (k % 3) * 7, 10, 8), cloudM); s.position.set((k - 2) * 20, (k % 2) * 8, (k % 3) * 6); g.add(s); }
  g.lookAt(0, g.position.y, 0); clouds.add(g);
}
scene.fog = new THREE.Fog('#ffffff', 80, 600);
const hemi = new THREE.HemisphereLight('#bfe0ff', '#8fbf6a', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 3); sun.castShadow = true; scene.add(sun); scene.add(sun.target);
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
const fill = new THREE.DirectionalLight('#ffffff', 0); scene.add(fill); scene.add(fill.target);

const LIGHTS = {
  golden: { sun: [-1, .32, .45], sunC: '#ffb066', sunI: 3.4, hemiS: '#a8c8ff', hemiG: '#d29a6a', hemiI: 1.15, top: '#4a86e0', hor: '#ffc27e', bot: '#d9a070', fog: '#ffc896', near: 90, far: 520, exp: 1.0, fillC: '#8aa0ff', fillI: .35 },
  day: { sun: [-.5, .9, .7], sunC: '#fff2dc', sunI: 3.3, hemiS: '#cfe6ff', hemiG: '#9ccf7a', hemiI: 1.25, top: '#2f86ec', hor: '#cfe9ff', bot: '#9ccf7a', fog: '#d8ecff', near: 120, far: 700, exp: 1.0, fillC: '#ffffff', fillI: .3 },
  night: { sun: [.6, .8, .5], sunC: '#8fb0ff', sunI: 1.1, hemiS: '#3d55a8', hemiG: '#1c1f35', hemiI: .7, top: '#070b26', hor: '#2a3a78', bot: '#141a30', fog: '#1d2a5a', near: 40, far: 320, exp: 1.25, fillC: '#ffb060', fillI: .35 },
  room: { sun: [.9, .7, .3], sunC: '#fff0d8', sunI: 2.6, hemiS: '#fff4e6', hemiG: '#c9a27a', hemiI: 1.35, top: '#9fd0ff', hor: '#dff0ff', bot: '#dff0ff', fog: '#dff0ff', near: 200, far: 900, exp: 1.0, fillC: '#ffffff', fillI: .45 },
  office: { sun: [-.7, .8, .5], sunC: '#ffd29a', sunI: 2.2, hemiS: '#ffd7a8', hemiG: '#5a2a20', hemiI: 1.0, top: '#ffbf80', hor: '#ffbf80', bot: '#ffbf80', fog: '#ffbf80', near: 200, far: 900, exp: 1.05, fillC: '#ffe6b0', fillI: .5 },
  officeNight: { sun: [-.7, .8, .5], sunC: '#ffc27a', sunI: 1.9, hemiS: '#a0a8ff', hemiG: '#3a1a18', hemiI: .8, top: '#1a2050', hor: '#1a2050', bot: '#1a2050', fog: '#1a2050', near: 200, far: 900, exp: 1.15, fillC: '#ffd090', fillI: .6 },
};
function applyLight(name, focus, size) {
  const L = LIGHTS[name];
  const d = new THREE.Vector3(...L.sun).normalize();
  sun.color.set(L.sunC); sun.intensity = L.sunI;
  sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(d, 120);
  const sc = sun.shadow.camera; sc.left = -size; sc.right = size; sc.top = size; sc.bottom = -size; sc.near = 1; sc.far = 300; sc.updateProjectionMatrix();
  fill.color.set(L.fillC); fill.intensity = L.fillI; fill.target.position.copy(focus); fill.position.copy(focus).add(new THREE.Vector3(-d.x, .4, -d.z).multiplyScalar(50));
  hemi.color.set(L.hemiS); hemi.groundColor.set(L.hemiG); hemi.intensity = L.hemiI;
  skyU.top.value.set(L.top); skyU.hor.value.set(L.hor); skyU.bot.value.set(L.bot);
  scene.fog.color.set(L.fog); scene.fog.near = L.near; scene.fog.far = L.far;
  cloudM.color.set(name === 'night' ? '#3a4a8a' : name === 'golden' ? '#ffe2c4' : '#ffffff');
  cloudM.emissive.set(name === 'night' ? '#101840' : '#ffffff'); cloudM.emissiveIntensity = name === 'night' ? .2 : .3;
  post.uniforms.exposure.value = L.exp;
}

// ---------- post: DOF + tone map + grade ----------
const post = new THREE.ShaderMaterial({
  uniforms: {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, res: { value: new THREE.Vector2(W, H) },
    near: { value: .1 }, far: { value: 1500 }, focus: { value: 6 }, amt: { value: 10 }, maxR: { value: 16 }, exposure: { value: 1 },
    sat: { value: 1.14 }, flash: { value: 0 }, vign: { value: .22 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
  fragmentShader: `
    uniform sampler2D tColor, tDepth; uniform vec2 res; uniform float near, far, focus, amt, maxR, exposure, sat, flash, vign;
    varying vec2 vUv;
    float lin(float d){ float z = d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
    float coc(float z){ return min(maxR, amt*abs(1.-focus/z)); }
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1./2.4))-.055, step(.0031308, c)); }
    void main(){
      float zc = lin(texture2D(tDepth, vUv).r); float cc = coc(zc);
      vec3 acc = texture2D(tColor, vUv).rgb; float wsum = 1.;
      if (cc > .6) {
        const int N = 40; float ga = 2.39996;
        for (int i = 1; i < N; i++) {
          float r = sqrt(float(i)/float(N)) * cc; float a = float(i)*ga;
          vec2 o = vec2(cos(a), sin(a)) * r / res; vec2 uv = vUv + o;
          float zs = lin(texture2D(tDepth, uv).r); float cs = coc(zs);
          float w = zs < zc ? clamp(cs - r + 1., 0., 1.) : clamp(min(cs, cc) - r + 1., 0., 1.);
          acc += texture2D(tColor, uv).rgb * w; wsum += w;
        }
      }
      vec3 c = acc / wsum;
      c = aces(c * exposure);
      float l = dot(c, vec3(.2126,.7152,.0722)); c = mix(vec3(l), c, sat);
      c = (c - .5) * 1.05 + .5;
      vec2 q = vUv - .5; c *= 1. - vign * dot(q*vec2(1.,.75), q*vec2(1.,.75)) * 2.2;
      c = toSRGB(clamp(c, 0., 1.));
      c = mix(c, vec3(1.), flash);
      gl_FragColor = vec4(c, 1.);
    }`,
  depthTest: false, depthWrite: false,
});
const postScene = new THREE.Scene(); const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));

// ---------- world + cast ----------
const Wd = buildWorld(scene);
const chars = {};
for (const [id, def] of Object.entries(CAST)) { const c = makeChar({ name: id, ...def }); c.root.visible = false; scene.add(c.root); chars[id] = c; }

// pools
const coinGeo = new THREE.CylinderGeometry(.32, .32, .08, 16);
const coinMat = new THREE.MeshStandardMaterial({ color: '#ffcc2e', roughness: .22, metalness: .85, emissive: '#7a5200', emissiveIntensity: .3 });
const coins = new THREE.InstancedMesh(coinGeo, coinMat, 400); coins.castShadow = true; coins.frustumCulled = false; scene.add(coins);
const billGeo = new THREE.PlaneGeometry(.9, .42);
const billTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 60; const g = c.getContext('2d'); g.fillStyle = '#6fbf5a'; g.fillRect(0, 0, 128, 60); g.strokeStyle = '#2f7a2a'; g.lineWidth = 5; g.strokeRect(4, 4, 120, 52); g.fillStyle = '#2f7a2a'; g.font = '900 34px Montserrat'; g.textAlign = 'center'; g.fillText('$', 64, 42); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const bills = new THREE.InstancedMesh(billGeo, new THREE.MeshStandardMaterial({ map: billTex, side: THREE.DoubleSide, roughness: .8 }), 500); bills.frustumCulled = false; scene.add(bills);
const rainGeo = new THREE.BoxGeometry(.03, 1.4, .03);
const rain = new THREE.InstancedMesh(rainGeo, new THREE.MeshBasicMaterial({ color: '#cfe0ff', transparent: true, opacity: .55, fog: false }), 2500); rain.frustumCulled = false; scene.add(rain);
const dummy = new THREE.Object3D();
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const FX = {
  coinsUsed: 0, billsUsed: 0, rainOn: false,
  reset() { this.coinsUsed = 0; this.billsUsed = 0; this.rainOn = false; },
  // ballistic coin burst from origin, starting at local time t0
  coins(t, t0, origin, n = 40, power = 1, seed = 1) {
    const k = t - t0; if (k < 0) return;
    for (let i = 0; i < n && this.coinsUsed < 400; i++) {
      const s = seed * 100 + i, a = hash(s) * Math.PI * 2, up = (3 + hash(s + 1) * 4) * power, out = (1 + hash(s + 2) * 2.5) * power;
      const tt = k * (.8 + hash(s + 3) * .4);
      const y = origin[1] + up * tt - 9 * tt * tt;
      dummy.position.set(origin[0] + Math.cos(a) * out * tt, Math.max(.05, y), origin[2] + Math.sin(a) * out * tt * .5);
      if (dummy.position.distanceTo(camera.position) < 1.8) continue;
      dummy.rotation.set(tt * 9 + s, tt * 5, s); dummy.scale.setScalar(1); dummy.updateMatrix(); coins.setMatrixAt(this.coinsUsed++, dummy.matrix);
    }
  },
  coinAt(p, rot, s = 1) { if (this.coinsUsed >= 400) return; dummy.position.set(...p); dummy.rotation.set(...rot); dummy.scale.setScalar(s); dummy.updateMatrix(); coins.setMatrixAt(this.coinsUsed++, dummy.matrix); },
  // falling bills in a box around center
  bills(t, center, size = [12, 10, 12], n = 160, seed = 3) {
    for (let i = 0; i < n && this.billsUsed < 500; i++) {
      const s = seed * 1000 + i, fall = 1.6 + hash(s) * 1.2;
      const y = center[1] + size[1] - ((t * fall + hash(s + 1) * size[1]) % size[1]);
      dummy.position.set(center[0] + (hash(s + 2) - .5) * size[0] + Math.sin(t * 2 + s) * .6, y, center[2] + (hash(s + 3) - .5) * size[2]);
      if (dummy.position.distanceTo(camera.position) < 3.2) continue;
      dummy.rotation.set(t * 3 + s, t * 2 + s * 2, Math.sin(t * 4 + s)); dummy.scale.setScalar(1); dummy.updateMatrix(); bills.setMatrixAt(this.billsUsed++, dummy.matrix);
    }
  },
  rain(t) { this.rainOn = true; },
  finish(t) {
    coins.count = this.coinsUsed; coins.instanceMatrix.needsUpdate = true;
    bills.count = this.billsUsed; bills.instanceMatrix.needsUpdate = true;
    rain.visible = this.rainOn;
    if (this.rainOn) {
      const cp = camera.position, fw = new THREE.Vector3(); camera.getWorldDirection(fw);
      for (let i = 0; i < 2500; i++) {
        const r = 2 + hash(i) * 30, a = (hash(i + 7) - .5) * 1.4 + Math.atan2(fw.x, fw.z);
        const y = 30 - ((t * 28 + hash(i + 3) * 30) % 30);
        dummy.position.set(cp.x + Math.sin(a) * r, cp.y - 10 + y, cp.z + Math.cos(a) * r); dummy.rotation.set(0, 0, .12); dummy.scale.setScalar(1);
        dummy.updateMatrix(); rain.setMatrixAt(i, dummy.matrix);
      }
      rain.instanceMatrix.needsUpdate = true;
    }
  },
};

// ---------- 2D output + captions ----------
const out = document.getElementById('out'); out.width = W; out.height = H;
const g2 = out.getContext('2d');
let WORDS = [];
// time warp: new narration time -> old shot-timeline time, anchored at matching phrase starts/ends
let WARP = [[0, 0]];
function warp(tn) {
  for (let i = 1; i < WARP.length; i++) if (tn <= WARP[i][0]) { const [a0, b0] = WARP[i - 1], [a1, b1] = WARP[i]; return b0 + (b1 - b0) * (tn - a0) / Math.max(1e-6, a1 - a0); }
  const [a, b] = WARP[WARP.length - 1]; return b + (tn - a);
}
const OV = {
  W, H, PX,
  easeBack(k) { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  text(g, txt, x, y, size, fill, opts = {}) {
    g.save(); g.translate(x, y); if (opts.rot) g.rotate(opts.rot); if (opts.scale) g.scale(opts.scale, opts.scale);
    g.font = `${opts.weight || 900} ${size}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (opts.shadow !== false) { g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 14 * PX; g.shadowOffsetY = 6 * PX; }
    if (opts.stroke) { g.lineJoin = 'round'; g.lineWidth = opts.strokeW || size * .14; g.strokeStyle = opts.stroke; g.strokeText(txt, 0, 0); g.shadowColor = 'transparent'; }
    g.fillStyle = fill; g.fillText(txt, 0, 0); g.restore();
  },
  // pop-in card: scale .6 -> 1 with overshoot over ~4 frames
  pop(g, t, t0, txt, x, y, size, fill, opts = {}) {
    const k = (t - t0) / .14; if (k < 0) return; if (opts.until && t > opts.until) return;
    const s = k >= 1 ? 1 : .6 + .4 * this.easeBack(Math.min(1, k));
    this.text(g, txt, x * W, y * H, size * PX, fill, { ...opts, scale: s * (1 + (opts.grow || 0) * (t - t0)) });
  },
  stamp(g, t, t0, txt, x, y, size, color, rot = -.18) {
    const k = (t - t0) / .12; if (k < 0) return;
    const s = k >= 1 ? 1 : 2.2 - 1.2 * k;
    g.save(); g.translate(x * W, y * H); g.rotate(rot); g.scale(s, s); g.globalAlpha = Math.min(1, k * 1.5);
    g.font = `900 ${size * PX}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = g.measureText(txt).width + 40 * PX, h = size * PX * 1.25;
    g.lineWidth = 10 * PX; g.strokeStyle = color; g.strokeRect(-w / 2, -h / 2, w, h);
    g.fillStyle = color; g.fillText(txt, 0, 4 * PX); g.restore();
  },
  live(g, t) {
    const x = 60 * PX, y = 150 * PX; g.save(); g.fillStyle = '#e02424'; g.fillRect(x, y, 170 * PX, 66 * PX);
    g.fillStyle = '#fff'; if (Math.floor(t * 2) % 2 === 0) { g.beginPath(); g.arc(x + 34 * PX, y + 33 * PX, 12 * PX, 0, 7); g.fill(); }
    g.font = `900 ${42 * PX}px Montserrat`; g.textBaseline = 'middle'; g.fillText('LIVE', x + 58 * PX, y + 35 * PX); g.restore();
  },
  flash: 0,
};
function drawCaption(T) {
  let cur = null;
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i], next = WORDS[i + 1];
    const end = next ? Math.min(next.start, w.end + .35) : w.end + .35;
    if (T >= w.start - .02 && T < end) { cur = w; break; }
  }
  if (!cur) return;
  const txt = cur.word.toLowerCase().replace(/[^a-z0-9'$,]/g, '').replace(/,$/, '');
  const k = (T - cur.start + .02) / .1;
  const s = k >= 1 ? 1 : .6 + .4 * OV.easeBack(Math.max(0, k));
  OV.text(g2, txt, W / 2, H * .335, 86 * PX, '#ffffff', { weight: 800, scale: s, stroke: 'rgba(0,0,0,.35)', strokeW: 7 * PX });
}

// ---------- shot application ----------
const v3 = (a) => new THREE.Vector3(...a);
const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
const lerp = (a, b, k) => a + (b - a) * k;
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function valAt(spec, t) {
  if (typeof spec === 'function') return spec(t);
  if (Array.isArray(spec) && Array.isArray(spec[0])) { let v = spec[0][1]; for (const [tt, vv] of spec) if (t >= tt) v = vv; return v; }
  return spec;
}

function cameraAt(c, t, dur) {
  const k = c.ease === 'lin' ? t / dur : .35 * (t / dur) + .65 * smooth(t / dur);
  let tgt = c.tgt2 ? lerp3(c.tgt, c.tgt2, k) : c.tgt;
  if (c.pos) {
    const p = c.pos2 ? lerp3(c.pos, c.pos2, k) : c.pos;
    return { pos: p, look: tgt, fov: lerp(c.fov || 35, c.fov2 || c.fov || 35, k), roll: c.roll || 0 };
  }
  const d = (c.d || 6) * ((c.d || 6) <= 5.5 ? 1.3 : 1) * (1 - (c.push ?? .07) * k);
  const yaw = ((c.yaw || 0) + (c.dyaw || 0) * k) * Math.PI / 180;
  const h = (c.h || 0) + (c.dh || 0) * k;
  return { pos: [tgt[0] + Math.sin(yaw) * d, tgt[1] + h, tgt[2] + Math.cos(yaw) * d], look: tgt, fov: lerp(c.fov || 35, c.fov2 || c.fov || 35, k), roll: c.roll || 0 };
}

const SETS = () => ({ town: Wd.town, inter: Wd.inter });
let shotIdx = -1;
function resetWorld(f) {
  // restore dynamic props to their default state
  Wd.flood.visible = false; Wd.wave.visible = false; Wd.spill.visible = false;
  for (const c of Wd.chunks) c.visible = false; for (const j of Wd.jets) j.visible = false;
  Wd.damWall.visible = true; Wd.crack.visible = f / FPS > 23; Wd.crack.scale.set(1, 1, 1);
  Wd.mansion.position.set(52, 0, 24); Wd.mansion.rotation.set(0, Math.PI, 0); Wd.mansion.visible = true;
  for (const c of Wd.floatCoins) c.visible = false;
  Wd.cheque.visible = false; Wd.pen.visible = false; Wd.crust.visible = false; Wd.homework.visible = false;
  Wd.newHouse.visible = false; Wd.statue.visible = false;
  for (const l of Wd.lamps) l.material.emissiveIntensity = 0;
  Wd.slop.position.y = .06;
}

window.renderFrame = function (f) {
  const TN = f / FPS, T = warp(TN);
  let si = SHOTS.findIndex((s) => T >= s.a && T < s.b); if (si < 0) si = SHOTS.length - 1;
  const S = SHOTS[si], t = T - S.a, dur = S.b - S.a;
  resetWorld(f); FX.reset(); OV.flash = 0;
  Wd.town.visible = S.set !== 'inter'; Wd.inter.visible = S.set === 'inter';
  sky.visible = clouds.visible = S.set !== 'inter';
  for (const c of Object.values(chars)) c.root.visible = false;
  for (const cs of S.cast || []) {
    const c = chars[cs.c]; c.root.visible = true;
    const p = typeof cs.p === 'function' ? cs.p(t) : cs.p;
    c.root.position.set(p[0], p[1] || 0, p[2]);
    c.root.rotation.set(0, (valAt(cs.ry ?? 0, t)) * Math.PI / 180, 0);
    c.root.scale.setScalar((cs.s || 1) * c.s);
    const pz = valAt(cs.pose || 'idle', t); const pose = typeof pz === 'string' ? POSES[pz](t + (cs.ph || 0)) : pz;
    applyPose(c, pose);
    const seed = cs.c.length * 1.37 + (cs.ph || 0);
    const blink = ((t + seed) % (1.9 + (seed % 1))) < .12;
    const fc = valAt(cs.face || 'neutral', t);
    setFace(c, fc, blink && !['grin', 'laugh', 'shock', 'happycry', 'cry', 'smug', 'greedy'].includes(fc));
    if (cs.badge !== undefined) setBadge(c, valAt(cs.badge, t));
    if (c.badge) c.badge.group.visible = cs.nobadge ? false : true;
  }
  const cam = cameraAt(S.cam, t, dur);
  // impact shakes
  let sx = 0, sy = 0;
  for (const kk of S.kicks || []) { const fr = Math.round((t - kk[0]) * FPS); if (fr >= 0 && fr < 8) { const a = kk[1] * (1 - fr / 8) * (fr % 2 ? -1 : 1); sx += a; sy += a * .6; } }
  if (S.wobble) { sx += Math.sin(T * 7.3) * S.wobble + Math.sin(T * 13.1) * S.wobble * .4; sy += Math.cos(T * 6.1) * S.wobble * .8; }
  camera.position.set(...cam.pos); camera.fov = cam.fov; camera.updateProjectionMatrix();
  camera.up.set(0, 1, 0); camera.lookAt(v3(cam.look));
  camera.translateX(sx); camera.translateY(sy);
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  // hide street props (trees, lamps) that sit between the lens and what it looks at
  { const a = camera.position, b = v3(cam.look), ab = b.clone().sub(a), L = ab.length(); ab.normalize();
    for (const o of Wd.occluders) { const c = o.userData.c; const k = Math.max(0, Math.min(L, c.clone().sub(a).dot(ab)));
      o.visible = a.clone().addScaledVector(ab, k).distanceTo(c) > o.userData.r; } }
  // DOF
  const look = v3(cam.look);
  const fd = S.focus ? (typeof S.focus === 'number' ? S.focus : camera.position.distanceTo(v3(S.focus))) : camera.position.distanceTo(look);
  post.uniforms.focus.value = fd; post.uniforms.amt.value = (S.dof ?? 11) * PX; post.uniforms.maxR.value = Math.max(2, (S.dof ?? 11) * 1.6) * PX;
  applyLight(S.light || 'golden', S.shadowAt ? v3(S.shadowAt) : look, S.shadow || 22);
  if (S.light === 'night') for (const l of Wd.lamps) l.material.emissiveIntensity = 3;
  if (S.fx) S.fx(t, { W: Wd, FX, chars, OV, T, dur, camera });
  FX.finish(T);
  // render
  renderer.setRenderTarget(rt); renderer.render(scene, camera);
  post.uniforms.flash.value = OV.flash;
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  g2.drawImage(renderer.domElement, 0, 0);
  if (S.ov) S.ov(g2, t, OV, T);
  if (!S.nocap) drawCaption(TN);
  return si;
};

window.ready = (async () => {
  await document.fonts.load('800 80px Montserrat'); await document.fonts.load('900 80px Montserrat'); await document.fonts.load('700 30px Montserrat');
  await document.fonts.load('600 30px Montserrat');
  const NW = await (await fetch(WORDS_URL)).json(), OW = await (await fetch(WORDS_URL.replace('words.json', 'words_v1.json'))).json();
  WORDS = NW.words;
  const anchors = [[0, 0]]; const byP = {};
  NW.words.forEach((w, i) => { (byP[w.p] ||= []).push(i); });
  for (const p of Object.keys(byP).map(Number).sort((a, b) => a - b)) {
    const ids = byP[p], i0 = ids[0], i1 = ids[ids.length - 1];
    anchors.push([NW.words[i0].start, OW.words[i0].start], [NW.words[i1].end, OW.words[i1].end]);
  }
  anchors.push([NW.duration, OW.duration]);
  WARP = anchors.filter((a, i) => i === 0 || a[0] > anchors[i - 1][0] + 1e-4);
  window.SHOT_COUNT = SHOTS.length; window.DURATION = NW.duration;
  return true;
})();
