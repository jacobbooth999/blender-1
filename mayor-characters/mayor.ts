import { Pen, bodyFront, headBlob, INK, SKINS, shade, mix, Outfit, Expr, Prop } from "../roman-short/src/videos/rome/toon";
type M = { name: string; tag: string; o: Outfit; chain: string; sash?: string; seed: number; props: [Expr, Prop, string][] };
const GOLD = "#e8c45a";
export const MAYORS: M[] = [
  { name: "Mayor Bigsby", tag: "The Classic — top hat, big promises", seed: 3, chain: GOLD, sash: "#c0353a",
    o: { jacket: "#2f3f6b", pants: "#2b2d38", boots: INK, hat: "tophat", moustache: "#5a3b2a", buttons: GOLD, build: "stout" },
    props: [["grin", "cheer", "Votes are in!"], ["stern", "scroll", "New law"], ["shock", "shrug", "Uh oh"]] },
  { name: "Mayor Dale", tag: "The Rookie — accidentally got elected", seed: 7, chain: GOLD, sash: "#2f8f6b",
    o: { jacket: "#3a8f8a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#c9803a", buttons: "#f1efe6" },
    props: [["nervous", "scroll", "Reading the rules"], ["laugh", "cheer", "It worked?!"], ["dazed", "shrug", "Chaos"]] },
  { name: "Madam Mayor Penny", tag: "The Boss — runs a tight town", seed: 11, chain: GOLD, sash: "#6a2c7a",
    o: { jacket: "#7b5ac9", pants: "#7b5ac9", dress: "#8e6bd6", legs: mix(SKINS[3], "#7a4b3a", 0.35), boots: "#3a2a20", hat: "hair", hair: "#2a1d18", skin: SKINS[3] },
    props: [["smile", "scroll", "Decree signed"], ["stern", "arms", "Not happy"], ["grin", "coins", "Budget win"]] },
  { name: "Mayor Grumbleton", tag: "The Old-Timer — mayor for 40 years", seed: 19, chain: GOLD, sash: "#3d6b3d",
    o: { jacket: "#6b6b70", pants: "#3d3d44", boots: INK, hat: "tophat", moustache: "#9c968f", buttons: GOLD, build: "stout", skin: SKINS[1] },
    props: [["stern", "arms", "Back in my day"], ["shock", "shrug", "Who voted THAT?"], ["smile_closed", "scroll", "Fine. Approved."]] },
  { name: "Mayor Mack", tag: "The Builder — fixes the town himself", seed: 23, chain: GOLD, sash: "#e2453c",
    o: { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#5a3b2a", hat: "cap", cap: "#f4c430", beard: "#4a3020", skin: SKINS[2] },
    props: [["grin", ["hammer", 0.2], "On it"], ["relief", "shovel", "Built it"], ["pained", ["hammer", 1], "Oops"]] },
  { name: "Mayor Pip", tag: "The Kid Mayor — the town voted for chaos", seed: 31, chain: GOLD, sash: "#c0353a",
    o: { jacket: "#e2453c", pants: "#2b2d38", boots: "#f4f1ea", hat: "tophat", build: "kid", buttons: GOLD },
    props: [["laugh", "cheer", "I'm the boss!"], ["grin", "coins", "Free candy budget"], ["shock", "shrug", "Wait what"]] },
];
const BUILD: Record<string, { torso: number; legs: number; tw: number }> = { adult: { torso: 1.1, legs: 1.4, tw: 0.8 }, stout: { torso: 1.15, legs: 1.32, tw: 0.92 }, kid: { torso: 0.85, legs: 1.0, tw: 0.72 } };
const chainOfOffice = (p: Pen, m: M, seed: number) => {
  const b = m.o.build ?? "adult", Bd = BUILD[b], H = headBlob(seed, b === "kid" ? 112 : 118, 0), HH = 2 * H.b, W = 2 * H.a, u = W / 100;
  const torsoBot = 975 - Bd.legs * HH, chin = torsoBot - Bd.torso * HH, g = p.g;
  // links: a U from shoulder to shoulder
  const n = 13, rx = 0.3 * W * Bd.tw / 0.8, depth = 0.42 * HH;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, a = Math.PI * t; pts.push([300 - rx * Math.cos(a), chin + 0.05 * HH + depth * Math.sin(a)]); }
  for (const [x, y] of pts) { g.beginPath(); g.ellipse(x, y, 4.6 * u, 3.4 * u, 0, 0, 7); g.fillStyle = m.chain; g.fill(); g.lineWidth = 2.2 * u; g.strokeStyle = INK; g.stroke(); }
  const my = chin + 0.05 * HH + depth + 0.13 * HH;
  g.beginPath(); g.arc(300, my, 11 * u, 0, 7); g.fillStyle = m.chain; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(300, my, 6 * u, 0, 7); g.fillStyle = shade(m.chain, 0.78); g.fill();
  // little star on the medallion
  g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 2.4 * u : 5.5 * u, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(300 + r * Math.cos(a), my + r * Math.sin(a)); } g.closePath(); g.fillStyle = "#fff3b0"; g.fill();
};
export function drawMayor(c: HTMLCanvasElement, i: number, k: number) {
  const m = MAYORS[i], [expr, prop] = m.props[k], g = c.getContext("2d")!;
  g.save(); g.scale(c.width / 600, c.height / 1000);
  // contact shadow
  g.beginPath(); g.ellipse(300, 978, 120, 16, 0, 0, 7); g.fillStyle = "rgba(36,23,38,.22)"; g.fill();
  const p = new Pen(g);
  const o = { ...m.o, sash: m.sash };
  bodyFront(p, o, { mode: "stand", expr, prop, seed: m.seed, look: k === 1 ? 0.3 : 0 });
  if (!["cheer", "arms", "shrug"].includes(String(prop))) chainOfOffice(p, m, m.seed); else chainOfOffice(p, m, m.seed);
  g.restore();
}
(window as any).MAYORS = MAYORS; (window as any).drawMayor = drawMayor;
