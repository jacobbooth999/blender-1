// Channel profile picture for "In This Town": hero with a big reaction face, sunburst + little town behind.
// window.renderFrame(i): variants (see V below). 1080x1080, everything important inside the centre circle.
import * as THREE from 'three';
import { makeChar, applyPose, setFace, mat } from './rig.js';
import { RoundedBoxGeometry } from '../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';

const q = new URLSearchParams(location.search); const W = +(q.get('w') || 1080), H = +(q.get('h') || 1080);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .25;
scene.add(new THREE.HemisphereLight('#e8f4ff', '#ffd9a8', .75));
const key = new THREE.DirectionalLight('#fff4e0', 1.9); key.position.set(-5, 9, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); key.shadow.bias = -.0004; scene.add(key);
const rim = new THREE.DirectionalLight('#bfe2ff', 1.4); rim.position.set(6, 6, -6); scene.add(rim);

// little town behind the hero
const town = new THREE.Group(); town.position.y = 2.2; scene.add(town);
const HOUSES = [['#ff8fc8', '#6c5ce7'], ['#7fd3ff', '#ff5a5a'], ['#a8e6a1', '#ff9f43'], ['#ffd43b', '#e8343e'], ['#b07ad9', '#ffcc2e'], ['#ff9f43', '#2f86d6'], ['#61d67a', '#c0392b']];
HOUSES.forEach(([body, roof], i) => {
  const x = (i - 3) * 5.6, z = -22 - (i % 2) * 3, h = 4.2 + (i % 3) * .9, g = new THREE.Group(); g.position.set(x, 0, z); town.add(g);
  const b = new THREE.Mesh(new RoundedBoxGeometry(4.4, h, 3.6, 3, .12), mat(body, .7)); b.position.y = h / 2; b.castShadow = b.receiveShadow = true; g.add(b);
  const r = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.4, 4), mat(roof, .6)); r.rotation.y = Math.PI / 4; r.scale.z = .8; r.position.y = h + 1.2; g.add(r);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, .1), new THREE.MeshBasicMaterial({ color: '#fff3c4' })); win.position.set(-.9, h * .62, 1.82); g.add(win);
  const w2 = win.clone(); w2.position.x = .9; g.add(w2);
  const door = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.7, .1), mat('#ffffff', .5)); door.position.set(0, .85, 1.82); g.add(door);
});
const grass = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, .4, 48), mat('#6cc04a', .95)); grass.position.set(0, -.2, -8); grass.receiveShadow = true; /* no ground: houses sit behind the shoulders */

const hero = makeChar({ name: 'hero', shirt: '#7ed957', zip: true, longSleeve: true, pants: '#2f5fa8', shoes: '#ffffff', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0', badge: false });
scene.add(hero.root);
const camera = new THREE.PerspectiveCamera(30, W / H, .1, 500);

const POSE = {
  cheeks: { armL: [Math.PI * .62, -.55], armR: [Math.PI * .62, .55], head: [0, -.04] },
  wave: { armR: [Math.PI * .86, .35], armL: [0, -.05], head: [.12, 0, .06] },
  none: { armL: [0, -.05], armR: [0, .05] },
};
// variants: [face, pose, text, extra]
const V = [
  { face: 'shock', pose: 'none', text: true },
  { face: 'shock', pose: 'none', text: false },
  { face: 'grin', pose: 'wave', text: true },
  { face: 'grin', pose: 'none', text: false },
];
const out = document.getElementById('out'); out.width = W; out.height = H; const g = out.getContext('2d');
function background() {
  const cx = W / 2, cy = H * .46;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, W * .75); gr.addColorStop(0, '#ffe066'); gr.addColorStop(.45, '#ffb020'); gr.addColorStop(1, '#ff6a1a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(cx, cy); g.globalAlpha = .28; g.fillStyle = '#fff6c8';
  for (let i = 0; i < 18; i++) { g.rotate(Math.PI * 2 / 18); g.beginPath(); g.moveTo(0, 0); g.lineTo(W, -W * .09); g.lineTo(W, W * .09); g.closePath(); g.fill(); }
  g.restore();
}
function banner(txt) {
  const y = H * .815, w = W * .74, h = H * .13;
  g.save(); g.translate(W / 2, y); g.rotate(-.04);
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
  g.fillStyle = '#e8243c'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 26); g.fill(); g.shadowColor = 'transparent';
  g.lineWidth = 10; g.strokeStyle = '#ffffff'; g.beginPath(); g.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 20); g.stroke();
  g.font = `900 ${H * .082}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#5a0010'; g.strokeText(txt, 0, 6); g.fillStyle = '#ffffff'; g.fillText(txt, 0, 6);
  g.restore();
}
window.renderFrame = (i) => {
  const v = V[i];
  hero.root.position.set(0, 0, 0); hero.root.rotation.y = -.12; applyPose(hero, POSE[v.pose]); setFace(hero, v.face, false);
  if (v.text) { camera.position.set(.5, 4.9, 6.6); camera.lookAt(0, 4.05, 0); } else { camera.position.set(.5, 4.9, 5.6); camera.lookAt(0, 4.3, 0); }
  background(); renderer.render(scene, camera); g.drawImage(renderer.domElement, 0, 0);
  if (v.text) banner('IN THIS TOWN');
};
window.ready = Promise.resolve(true);
