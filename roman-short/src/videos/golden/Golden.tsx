// "From Wolf to Golden": seven cartoon stills (one per frame) in the flat-characters-in-a-3D-toon-world style,
// with the same post chain as the Rome short: ink -> lens blur -> bloom -> Neutral tone map -> grade, MSAA 4.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "../rome/ink";
import { LensBlur, GrainEffect } from "../rome/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../rome/grade";
import { Kit } from "../rome/build";
import { TOTAL, SHOTS, dofAt } from "./story";

export const GOLDEN_FRAMES = TOTAL;

/** A/B switches for test stills only (Remotion inputProps `{ post: { ink: false, ... } }`); everything is on by default. */
type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean; fast: boolean };
/** fast = preview mode: no MSAA, no lens blur, small shadow map, low-res character canvases */
const toggles = (): PostToggles => {
  const p = { ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, fast: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) };
  if (p.fast) { p.lens = false; p.pre = false; (globalThis as { ROME_FAST?: boolean }).ROME_FAST = true; }
  return p;
};

/** Bloom for emissive sources only (depth.md 6.4). Its MIP chain always starts at 540x960 (half of 1080x1920),
 *  whatever the output size, so the glow keeps the same size relative to the frame (e-fold ~30 px at 1080p,
 *  ~1.5 % of the frame height) at 540, 1080 and 1440 widths. ADD blend: HDR-safe (SCREEN darkens values > 1). */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("golden kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }), // film grain, OFF by default (inputProps post.grain): the reference measures no grain and it quadruples the file size
  }), [camera, scene]);
  useEffect(() => () => InkPass.prototype.dispose.call(fx.ink), [fx]); // R3F dispose={null} overwrites the instance method
  const post = useMemo(() => (
    <EffectComposer multisampling={on.fast ? 0 : 4}>
      {on.ink ? <primitive object={fx.ink} dispose={null} /> : null}
      {on.lens && on.pre ? <primitive object={fx.lens.pre} dispose={null} /> : null}
      {on.lens ? <primitive object={fx.lens.main} dispose={null} /> : null}
      {on.bloom ? <primitive object={fx.bloom} dispose={null} /> : null}
      <primitive object={fx.tone} dispose={null} />
      {on.grade ? <primitive object={fx.grade} dispose={null} /> : null}
      {on.grain ? <primitive object={fx.grain} dispose={null} /> : null}
    </EffectComposer>
  ), [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  if (on.fast) scene.traverse((o) => { const l = o as THREE.DirectionalLight; if (l.isDirectionalLight && l.shadow.mapSize.x !== 1024) { l.shadow.mapSize.set(1024, 1024); l.shadow.map?.dispose(); l.shadow.map = null as unknown as THREE.WebGLRenderTarget; } });
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  // thin-lens focus: distance along the view axis to the shot's focus point (default: the camera's look target)
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, SHOTS[id - 1].light);
  fx.grain.seed = f; // deterministic per frame
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

/** test stills only: inputProps `{ post: { dpr: 0.5 } }` forces the WebGL buffer size (R3F clamps dpr to >= 1 by default) */
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.2, far: 4000 }}>
      <Inner id={id} kit={kit} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const GoldenStills: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  return (
    // the sets are laid out with +x = screen right; a camera looking down +z has +x on its left, so the frame is
    // mirrored once here (lighting, shadows and card facing all stay consistent in the mirror)
    <AbsoluteFill style={{ background: "#cfe3f2", transform: "scaleX(-1)" }}>
      <ShotView key={f} id={Math.min(SHOTS.length, f + 1)} kit={kit} alpha={1} />
    </AbsoluteFill>
  );
};
