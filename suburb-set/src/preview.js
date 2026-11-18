// Preview harness for the suburb set: window.renderFrame(i) renders camera preset i into #out.
import * as THREE from 'three';
import { buildSuburb, END } from './suburb.js';
import { RoomEnvironment } from '../node_modules/three/examples/jsm/environments/RoomEnvironment.js';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1080), H = +(params.get('h') || 1920);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, .2, 2500);
{ const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .35; }
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });

// bright pastel daytime sky: mid blue at the top, pale blue at the horizon
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'varying vec3 vP; void main(){ float h=max(vP.y,0.); vec3 top=vec3(.13,.45,.92), hor=vec3(.70,.85,.99); gl_FragColor=vec4(mix(hor, top, pow(clamp(h*1.9,0.,1.),.6)),1.); }',
}));
scene.add(sky);
// soft flat clouds
const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: .55, transparent: true, opacity: .92, fog: false });
for (let i = 0; i < 22; i++) {
  const g = new THREE.Group(), a = -Math.PI / 2 + (i / 22 - .5) * 2.6, r = 900 + (i % 3) * 120;
  g.position.set(Math.cos(a) * r, 230 + (i % 5) * 45, Math.sin(a) * r + END);
  for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(30 + (k % 3) * 12, 12, 8), cloudM); s.position.set((k - 2.5) * 34, (k % 2) * 6, 0); s.scale.set(1.4, .32, .6); g.add(s); }
  g.lookAt(0, g.position.y, END); scene.add(g);
}
scene.fog = new THREE.Fog('#cfe3fa', 160, 1100);
const hemi = new THREE.HemisphereLight('#d6e8ff', '#8fbf6a', .95); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 3.6); sun.castShadow = true; scene.add(sun, sun.target);
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -.0003; sun.shadow.normalBias = .04; sun.shadow.radius = 2.5;

const post = new THREE.ShaderMaterial({
  uniforms: { tColor: { value: rt.texture }, exposure: { value: 1.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
  fragmentShader: `uniform sampler2D tColor; uniform float exposure; varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1./2.4))-.055, step(.0031308, c)); }
    void main(){ vec3 c = aces(texture2D(tColor, vUv).rgb * exposure); float l = dot(c, vec3(.2126,.7152,.0722)); c = mix(vec3(l), c, 1.1);
      c = (c - .5) * 1.06 + .5; c = toSRGB(clamp(c,0.,1.)); gl_FragColor = vec4(c,1.); }`,
  depthTest: false, depthWrite: false,
});
const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));

const S = buildSuburb(scene);

// camera presets: [pos, target, fov, shadow focus, shadow size]
const SHOTS = [
  [[0, 34, 52], [0, 2, -170], 52, [0, 0, -60], 130],        // high aerial down the street to the school (ref. shot 1)
  [[1.5, 2.4, 10], [0, 6.5, -200], 56, [0, 0, -40], 90],     // road level, looking down the street (ref. shot 2)
  [[3.5, 3.2, -38], [-19, 5.2, -64], 48, [-22, 0, -66], 45], // three-quarter on a house: lawn, fence, porch, driveway
  [[0, 9, END + 70], [0, 13, END - 26], 50, [0, 0, END], 70],  // the plaza + school
  [[60, 110, 80], [0, 0, -110], 40, [0, 0, -100], 190],     // high wide establishing
];
window.renderFrame = (i) => {
  const [p, t, fov, f, sz] = SHOTS[i % SHOTS.length];
  camera.position.set(...p); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(...t);
  const d = new THREE.Vector3(-.45, .85, .55).normalize(), fc = new THREE.Vector3(...f);
  sun.target.position.copy(fc); sun.position.copy(fc).addScaledVector(d, 250);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -sz; sc.right = sc.top = sz; sc.near = 1; sc.far = 600; sc.updateProjectionMatrix();
  renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  const out = document.getElementById('out'); out.width = W; out.height = H; out.getContext('2d').drawImage(renderer.domElement, 0, 0);
};
window.ready = Promise.resolve(true);
