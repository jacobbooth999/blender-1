// Face sheet preview: window.renderFrame(i) renders template face t(i+1) on a character, head and shoulders.
import * as THREE from 'three';
import { makeChar, setFace } from './rig.js';
const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1080), H = +(params.get('h') || 1080);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#bfe0ff');
scene.add(new THREE.HemisphereLight('#e6f2ff', '#9ccf7a', 1.6));
const sun = new THREE.DirectionalLight('#fff4e0', 2.6); sun.position.set(-3, 6, 6); scene.add(sun);
const ch = makeChar({ shirt: '#7ed957', zip: true, longSleeve: true, pants: '#2f5fa8', shoes: '#ffffff', hair: 'messy', hairColor: '#5a3a22', skin: '#f2c9a0', badge: false });
scene.add(ch.root);
const camera = new THREE.PerspectiveCamera(24, W / H, .1, 100);
const box = new THREE.Box3().setFromObject(ch.head); const c = box.getCenter(new THREE.Vector3());
camera.position.set(c.x, c.y + .1, c.z + 7.4); camera.lookAt(c.x, c.y - .35, c.z);
window.renderFrame = (i) => {
  setFace(ch, 't' + (i + 1)); renderer.render(scene, camera);
  const out = document.getElementById('out'); out.width = W; out.height = H; const g = out.getContext('2d');
  g.drawImage(renderer.domElement, 0, 0);
  g.font = `900 ${H * .09}px Montserrat`; g.textAlign = 'left'; g.textBaseline = 'top'; g.lineJoin = 'round';
  g.lineWidth = H * .016; g.strokeStyle = '#3a1a00'; g.strokeText(String(i + 1), W * .05, H * .04); g.fillStyle = '#ff9a2a'; g.fillText(String(i + 1), W * .05, H * .04);
};
window.ready = Promise.resolve(true);
