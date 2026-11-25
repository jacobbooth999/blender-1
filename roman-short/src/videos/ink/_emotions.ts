import { Ink, P } from "./ink2d";
import { quad, GIRAFFE, LIONESS } from "./quadruped";
import { Emotion } from "./faces";
const bg = (ink: Ink, horizon = 760) => {
  const g = ink.g; g.fillStyle = ink.vgrad(0, horizon, [[0, "#9fd0ea"], [1, "#eef4ea"]]); g.fillRect(0, 0, 1920, horizon);
  g.fillStyle = ink.vgrad(horizon, 1080, [[0, "#e3c983"], [1, "#d2b06a"]]); g.fillRect(0, horizon, 1920, 1080 - horizon);
};
type Spec = [Emotion, "front" | "side" | "lion", number];
const SPECS: Spec[] = [["happy", "front", 1.3], ["laugh", "front", 1.1], ["surprised", "front", 0.6], ["scared", "front", 0.9], ["sad", "front", 0.4], ["love", "front", 0.7], ["smug", "side", 0.5], ["sleepy", "side", 0.8], ["confused", "side", 1.0], ["angry", "lion", 0.6]];
(window as any).INK_SHOTS = SPECS.map(([e, kind, t], i) => ({ name: `${String(i + 1).padStart(2, "0")}_${e}`, draw: (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.save(); g.scale(W / 1920, H / 1080); const ink = new Ink(g, i + 3);
  bg(ink);
  const draw = (k: Ink) => kind === "front" ? quad(k, GIRAFFE, 300, 2550, 1300, { gait: "stand", t, head: "front", emotion: e, shadow: false })
    : kind === "side" ? quad(k, GIRAFFE, 380, 1700, 900, { gait: "stand", t, emotion: e, shadow: false })
    : quad(k, LIONESS, 820, 1060, 560, { gait: "stand", t, emotion: e, shadow: false });
  // dry run to find the head, then frame a close-up on it
  const off = document.createElement("canvas"); off.width = 1920; off.height = 1080;
  const h = draw(new Ink(off.getContext("2d")!, 1));
  const z = kind === "front" ? 2.3 : kind === "side" ? 2.9 : 3.0, cx = kind === "front" ? h.headX : h.headX + 90, cy = kind === "front" ? h.headY + 20 : kind === "lion" ? h.headY + 10 : h.headY + 20;
  g.save(); g.translate(960, 560); g.scale(z, z); g.translate(-cx, -cy); draw(ink); g.restore();
  ink.text(e.toUpperCase(), 70, 80, 64, "Bangers", "#1d1a1c", "left", 10, "#ffffff");
  g.restore();
} }));
