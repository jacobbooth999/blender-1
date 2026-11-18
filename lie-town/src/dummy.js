// Pose test page: the bare grey Dummy body on a Roblox-style baseplate. window.renderFrame(i) renders pose i (0-4).
import * as THREE from 'three';
import { makeChar, applyPose, POSES } from './rig.js';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';

const q = new URLSearchParams(location.search); const W = +(q.get('w') || 1080), H = +(q.get('h') || 1920);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .35;
// sky
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
  vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'varying vec3 p; void main(){ float h = clamp(p.y,0.,1.); vec3 c = mix(vec3(.80,.90,.96), vec3(.33,.62,.84), pow(h,.5)); gl_FragColor = vec4(c,1.); }' }));
scene.add(sky);
const cm = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: .5 });
for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, g = new THREE.Group(); g.position.set(Math.cos(a) * 300, 70 + (i % 3) * 18, Math.sin(a) * 300);
  for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(12 + k * 3, 10, 8), cm); s.position.set((k - 1.5) * 14, k % 2 * 4, 0); s.scale.y = .45; g.add(s); } g.lookAt(0, g.position.y, 0); scene.add(g); }
// baseplate: dark grey with rounded-square tiles like Roblox Studio's default baseplate
const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
g.fillStyle = '#6b686e'; g.fillRect(0, 0, 256, 256);
const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
g.fillStyle = '#4c4a50'; rr(46, 46, 164, 164, 36); g.fill();
g.fillStyle = '#5d5a60'; rr(58, 58, 140, 140, 28); g.fill();
g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 6; rr(50, 50, 156, 156, 32); g.stroke();
const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(360, 360); tex.anisotropy = 8;
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
scene.fog = new THREE.Fog('#a9c9de', 60, 260);
scene.add(new THREE.HemisphereLight('#dfefff', '#6b686e', 1.4));
const sun = new THREE.DirectionalLight('#fffaf0', 2.6); sun.position.set(-8, 14, 9); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); sun.shadow.bias = -.0004; sun.shadow.radius = 4; scene.add(sun);
const grey = '#cfcfcf';
const dummy = makeChar({ name: 'dummy', shirt: grey, pants: grey, skin: grey, hair: 'none', badge: false, sleeve: 1, noFace: true });
scene.add(dummy.root);
const camera = new THREE.PerspectiveCamera(35, W / H, .1, 1000);
const sin = Math.sin;
const SHOTS = [
  { pose: POSES.idle(0), ry: 0, cam: [0, 5.2, 13], look: [0, 2.8, 0] },                       // 1 front, like the reference
  { pose: POSES.walk(.11), ry: 35, cam: [6.5, 3.8, 10], look: [0, 2.7, 0] },                  // 2 walking, 3/4
  { pose: POSES.cheer(.2), ry: -20, cam: [-2.5, 1.6, 10], look: [0, 3.4, 0] },                // 3 arms up, low angle
  { pose: POSES.point(0), ry: -70, cam: [6, 4.4, 9.5], look: [-.5, 3.0, 0] },                 // 4 pointing, side view
  { pose: { ...POSES.sitSad(0), head: [0, -.05], armL: [1.15, .08], armR: [1.15, -.08], lean: .05 }, ry: 25, y: -1.88, cam: [5, 3.6, 9], look: [0, 1.4, 0] }, // 5 sitting
];
const out = document.getElementById('out'); out.width = W; out.height = H; const g2 = out.getContext('2d');
window.renderFrame = (i) => {
  const S = SHOTS[i];
  dummy.root.position.set(0, S.y || 0, 0); dummy.root.rotation.y = S.ry * Math.PI / 180; applyPose(dummy, S.pose);
  camera.position.set(...S.cam); camera.lookAt(...S.look);
  renderer.render(scene, camera); g2.drawImage(renderer.domElement, 0, 0);
};
window.ready = Promise.resolve(true);
