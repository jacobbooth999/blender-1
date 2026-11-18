// Canvas-drawn textures: faces, badges, signs, cheque, screens.
import * as THREE from 'three';

const cache = new Map();
function canvasTex(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  cache.set(key, t); return t;
}

// ---------- faces (drawn flat on the head, 512x512, face centred) ----------
const INK = '#141414';
function eyesOval(g, look = 0, blink = false, size = 1) {
  for (const x of [190, 322]) {
    if (blink) { g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 24, 230); g.quadraticCurveTo(x, 244, x + 24, 230); g.stroke(); continue; }
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + look * 8, 226, 17 * size, 30 * size, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + look * 8 - 5, 214, 6 * size, 8 * size, 0, 0, 7); g.fill();
  }
}
function squint(g) {
  g.lineWidth = 13; g.lineCap = 'round'; g.strokeStyle = INK;
  for (const x of [190, 322]) { g.beginPath(); g.moveTo(x - 28, 238); g.quadraticCurveTo(x, 196, x + 28, 238); g.stroke(); }
}
function brows(g, inner, outer, y = 168) {
  g.lineWidth = 12; g.lineCap = 'round'; g.strokeStyle = INK;
  g.beginPath(); g.moveTo(158, y + outer); g.lineTo(222, y + inner); g.stroke();
  g.beginPath(); g.moveTo(354, y + outer); g.lineTo(290, y + inner); g.stroke();
}
function tears(g) {
  for (const x of [184, 316]) {
    const gr = g.createLinearGradient(0, 250, 0, 420); gr.addColorStop(0, '#3fa9ff'); gr.addColorStop(1, '#1e6fe0');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 10, 252); g.lineTo(x + 10, 252); g.lineTo(x + 14, 400);
    g.quadraticCurveTo(x, 425, x - 14, 400); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x - 4, 270, 4, 90);
  }
}
function mouthArc(g, w, depth, y = 318) {
  g.lineWidth = 12; g.lineCap = 'round'; g.strokeStyle = INK;
  g.beginPath(); g.moveTo(256 - w, y); g.quadraticCurveTo(256, y + depth, 256 + w, y); g.stroke();
}
function grinMouth(g, w = 80, h = 70, y = 300, teeth = true) {
  g.fillStyle = INK; g.beginPath(); g.moveTo(256 - w, y); g.quadraticCurveTo(256, y + h * 2, 256 + w, y); g.closePath(); g.fill();
  if (teeth) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(256 - w + 14, y + 6); g.quadraticCurveTo(256, y + 26, 256 + w - 14, y + 6); g.lineTo(256 + w - 22, y + 4); g.closePath(); g.fill(); }
}
// ---------- template faces t1..t24 (copied from the user's face sheet, numbered the same) ----------
// eye styles: A oval + arc brow, B flat relaxed, C angry spiky, D lidded half-dome, E thin arch + dot, F big eye + side brow, G side-glance
// mouths: smile, frown (small open), grin (D shape), teethGrin, frownLip, flat, o (pink), clench (teeth bar)
const TPL = {
  1: ['A', 'smile'], 2: ['A', 'frown'], 3: ['A', 'grin'], 4: ['A', 'flat'], 5: ['B', 'smile'], 6: ['A', 'o'],
  7: ['C', 'clench'], 8: ['C', 'flat'], 9: ['C', 'frown'], 10: ['C', 'grin'], 11: ['D', 'flat'], 12: ['D', 'smile'],
  13: ['D', 'grin'], 14: ['E', 'flat'], 15: ['E', 'o'], 16: ['E', 'frown'], 17: ['E', 'grin'], 18: ['F', 'grin'],
  19: ['F', 'flat'], 20: ['F', 'frownLip'], 21: ['F', 'teethGrin'], 22: ['G', 'frownLip'], 23: ['G', 'flat'], 24: ['G', 'teethGrin'],
};
export const TEMPLATE_FACES = Object.keys(TPL).map((n) => 't' + n);
function tplEyes(g, kind, blink) {
  g.strokeStyle = INK; g.fillStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [x, sd] of [[190, -1], [322, 1]]) {          // sd: -1 left eye, +1 right eye (outer side)
    if (blink && kind !== 'B') { g.lineWidth = 10; g.beginPath(); g.moveTo(x - 24, 236); g.quadraticCurveTo(x, 248, x + 24, 236); g.stroke(); continue; }
    switch (kind) {
      case 'A':
        g.beginPath(); g.ellipse(x, 236, 17, 25, 0, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - 5, 225, 5, 7, 0, 0, 7); g.fill(); g.fillStyle = INK;
        g.lineWidth = 8; g.beginPath(); g.arc(x + 3, 238, 36, -2.5, -.35); g.stroke(); break;
      case 'B':
        g.lineWidth = 9; g.beginPath(); g.moveTo(x - 36, 226); g.lineTo(x + 36, 226); g.stroke();
        g.beginPath(); g.ellipse(x, 229, 15, 9, 0, 0, 7); g.fill();
        g.lineWidth = 6; g.beginPath(); g.moveTo(x + sd * 36, 226); g.lineTo(x + sd * 46, 216); g.stroke(); break;
      case 'C': {
        const o = x + sd * 42, i = x - sd * 30;
        g.beginPath(); g.moveTo(o, 210); g.lineTo(i, 224); g.lineTo(i - sd * 2, 240); g.quadraticCurveTo(x, 262, x + sd * 32, 232); g.closePath(); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - 2, 234, 4, 5, 0, 0, 7); g.fill(); g.fillStyle = INK;
        g.lineWidth = 8; for (const [dx, dy] of [[14, -14], [18, 0]]) { g.beginPath(); g.moveTo(o - sd * 4, 216); g.lineTo(o + sd * dx, 216 + dy); g.stroke(); }
        g.beginPath(); g.moveTo(i + sd * 4, 230); g.lineTo(i - sd * 12, 238); g.stroke(); break; }
      case 'D':
        g.lineWidth = 9; g.beginPath(); g.moveTo(x - 30, 222); g.lineTo(x + 30, 222); g.stroke();
        g.beginPath(); g.arc(x, 222, 21, 0, Math.PI); g.fill();
        g.lineWidth = 6; g.beginPath(); g.moveTo(x + sd * 30, 222); g.lineTo(x + sd * 40, 214); g.stroke(); break;
      case 'E':
        g.lineWidth = 8; g.beginPath(); g.arc(x, 240, 30, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
        g.beginPath(); g.arc(x + sd * 2, 240, 6.5, 0, 7); g.fill(); break;
      case 'F':
        g.beginPath(); g.ellipse(x, 238, 20, 28, 0, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - 6, 226, 6, 8, 0, 0, 7); g.fill(); g.fillStyle = INK;
        g.lineWidth = 8; g.beginPath(); g.arc(x - sd * 2, 236, 40, sd > 0 ? -2.0 : -2.3, sd > 0 ? -.75 : -1.05); g.stroke(); break;
      case 'G':      // eye whites with pupils glancing to the side
        g.fillStyle = '#fff'; g.lineWidth = 7; g.beginPath(); g.ellipse(x, 238, 22, 28, 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = INK; g.beginPath(); g.ellipse(x - 8, 240, 15, 23, 0, 0, 7); g.fill();
        g.lineWidth = 8; g.beginPath(); g.arc(x + 4, 236, 40, -2.1, -.9); g.stroke(); break;
    }
  }
}
function tplMouth(g, kind) {
  g.strokeStyle = INK; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
  const frown = () => { g.beginPath(); g.moveTo(224, 342); g.quadraticCurveTo(250, 306, 280, 342); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.stroke(); };
  const grin = () => { g.beginPath(); g.moveTo(214, 318); g.lineTo(284, 312); g.quadraticCurveTo(272, 364, 236, 356); g.quadraticCurveTo(216, 348, 214, 318); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.stroke(); };
  switch (kind) {
    case 'smile': g.beginPath(); g.moveTo(206, 322); g.quadraticCurveTo(252, 354, 300, 318); g.stroke(); break;
    case 'flat': g.beginPath(); g.moveTo(212, 334); g.quadraticCurveTo(250, 330, 290, 336); g.stroke(); break;
    case 'frown': frown(); break;
    case 'frownLip': frown(); g.beginPath(); g.moveTo(198, 324); g.quadraticCurveTo(230, 314, 262, 322); g.stroke(); break;
    case 'grin': grin(); break;
    case 'teethGrin': grin(); g.lineWidth = 6; g.beginPath(); g.moveTo(222, 328); g.lineTo(278, 324); g.stroke(); break;
    case 'o': g.beginPath(); g.ellipse(244, 338, 15, 12, 0, 0, 7); g.fillStyle = '#e8506a'; g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(240, 333, 6, 3.5, 0, 0, 7); g.fill(); break;
    case 'clench': g.beginPath(); g.roundRect(212, 318, 88, 34, 12); g.fillStyle = '#fff'; g.fill(); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(216, 335); g.lineTo(296, 335); g.stroke();
      for (const x of [234, 256, 278]) { g.beginPath(); g.moveTo(x, 320); g.lineTo(x, 350); g.stroke(); } break;
  }
}
export function templateFaceTex(n, blink = false) {
  return canvasTex(`tface:${n}:${blink}`, 512, 512, (g) => { const [e, m] = TPL[n]; g.translate(256, 292); g.scale(1.6, 1.6); g.translate(-256, -270); tplEyes(g, e, blink); tplMouth(g, m); });
}

export const FACES = ['sick', 'angry', 'tongue', 'neutral', 'smile', 'grin', 'shock', 'sad', 'cry', 'smug', 'worried', 'determined', 'laugh', 'happycry', 'greedy', 'talk'];
// The template faces are the default look: the named expressions map onto them (tears drawn on top where needed).
// 'sick' (X eyes) and 'greedy' ($ eyes) have no template and keep their own drawings; 'classic:<name>' gets the old face.
export const FACE_MAP = { neutral: 4, talk: 6, smile: 1, grin: 3, laugh: 21, shock: 15, sad: 16, cry: 16, happycry: 21,
  worried: 2, angry: 9, determined: 8, smug: 12, tongue: 17 };
function tplTears(g) {
  for (const x of [150, 362]) {
    const gr = g.createLinearGradient(0, 262, 0, 430); gr.addColorStop(0, '#3fa9ff'); gr.addColorStop(1, '#1e6fe0');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 10, 262); g.lineTo(x + 10, 262); g.lineTo(x + 14, 410); g.quadraticCurveTo(x, 435, x - 14, 410); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x - 4, 280, 4, 90);
  }
}
export function faceTex(name, blink = false) {
  if (name === 'creature') return canvasTex('face:creature', 512, 512, (g) => {
    g.fillStyle = '#ffffff';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(256 + s * 30, 262); g.lineTo(256 + s * 170, 186); g.lineTo(256 + s * 150, 272); g.closePath(); g.fill(); }
    g.beginPath(); g.moveTo(140, 330); for (let i = 0; i <= 12; i++) g.lineTo(140 + i * 19.3, i % 2 ? 372 : 340); g.lineTo(372, 330); g.quadraticCurveTo(256, 440, 140, 330); g.fill();
  });
  if (/^t\d+$/.test(name)) return templateFaceTex(+name.slice(1), blink);
  if (name in FACE_MAP) {
    const n = FACE_MAP[name];
    if (name !== 'cry' && name !== 'happycry') return templateFaceTex(n, blink);
    return canvasTex(`tface:${name}:${blink}`, 512, 512, (g) => {
      const [e, m] = TPL[n]; g.save(); g.translate(256, 292); g.scale(1.6, 1.6); g.translate(-256, -270); tplEyes(g, e, blink); tplMouth(g, m); g.restore(); tplTears(g);
    });
  }
  if (name.startsWith('classic:')) name = name.slice(8);
  return canvasTex(`face:${name}:${blink}`, 512, 512, (g) => {
    g.strokeStyle = INK; g.fillStyle = INK;
    switch (name) {
      case 'neutral': eyesOval(g, 0, blink); mouthArc(g, 34, 14); break;
      case 'talk': eyesOval(g, 0, blink); g.fillStyle = INK; g.beginPath(); g.ellipse(256, 322, 30, 20, 0, 0, 7); g.fill(); break;
      case 'smile': eyesOval(g, 0, blink); mouthArc(g, 62, 46, 304); break;
      case 'grin': squint(g); grinMouth(g, 88, 64); break;
      case 'laugh': squint(g); grinMouth(g, 84, 86, 292); g.fillStyle = '#e8506a'; g.beginPath(); g.ellipse(256, 360, 34, 16, 0, 0, 7); g.fill(); break;
      case 'shock':
        for (const x of [184, 328]) { g.fillStyle = '#fff'; g.lineWidth = 9; g.beginPath(); g.arc(x, 222, 50, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x, 226, 8, 0, 7); g.fill(); }
        g.fillStyle = INK; g.beginPath(); g.ellipse(256, 352, 40, 50, 0, 0, 7); g.fill();
        g.fillStyle = '#d24a5c'; g.beginPath(); g.ellipse(256, 380, 24, 14, 0, 0, 7); g.fill(); break;
      case 'sad': eyesOval(g, 0, blink, .9); brows(g, -22, 6, 172); mouthArc(g, 40, -24, 336); break;
      case 'cry': eyesOval(g, 0, false, .9); brows(g, -24, 8, 170); tears(g);
        g.lineWidth = 11; g.beginPath(); g.moveTo(206, 344); for (let i = 0; i <= 8; i++) g.lineTo(206 + i * 12.5, 336 + (i % 2 ? -9 : 0)); g.stroke(); break;
      case 'happycry': squint(g); tears(g); grinMouth(g, 80, 60, 304); break;
      case 'smug':
        for (const x of [190, 322]) { g.fillStyle = INK; g.beginPath(); g.ellipse(x + 6, 234, 20, 16, 0, 0, Math.PI); g.fill(); g.lineWidth = 11; g.beginPath(); g.moveTo(x - 30, 230); g.lineTo(x + 32, 230); g.stroke(); }
        g.lineWidth = 11; g.beginPath(); g.moveTo(160, 196); g.lineTo(222, 186); g.stroke(); g.beginPath(); g.moveTo(290, 178); g.quadraticCurveTo(320, 160, 356, 176); g.stroke();
        g.lineWidth = 12; g.beginPath(); g.moveTo(204, 330); g.quadraticCurveTo(260, 344, 318, 300); g.stroke(); break;
      case 'greedy': // dollar eyes
        g.font = '900 110px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#1f9d3a'; g.fillText('$', 186, 268); g.fillText('$', 326, 268);
        grinMouth(g, 86, 60); break;
      case 'worried': eyesOval(g, 1, blink, .95); brows(g, -18, 4, 170);
        g.lineWidth = 11; g.beginPath(); g.moveTo(216, 334); g.bezierCurveTo(236, 318, 256, 350, 296, 328); g.stroke(); break;
      case 'sick': // X eyes + wavy green-ish mouth
        g.lineWidth = 12; g.lineCap = 'round';
        for (const x of [190, 322]) { g.beginPath(); g.moveTo(x - 22, 204); g.lineTo(x + 22, 248); g.moveTo(x + 22, 204); g.lineTo(x - 22, 248); g.stroke(); }
        g.strokeStyle = '#3b7a1a'; g.beginPath(); g.moveTo(200, 336); for (let i = 0; i <= 8; i++) g.lineTo(200 + i * 14, 330 + (i % 2 ? -12 : 6)); g.stroke(); break;
      case 'angry': eyesOval(g, 0, blink, .9); brows(g, 22, -12, 178); mouthArc(g, 44, -26, 340); break;
      case 'tongue': squint(g); mouthArc(g, 60, 40, 304); g.fillStyle = '#e8506a'; g.beginPath(); g.ellipse(286, 352, 22, 28, 0, 0, 7); g.fill(); break;
      case 'determined': eyesOval(g, 0, blink, .9); brows(g, 14, -10, 178); g.lineWidth = 13; g.beginPath(); g.moveTo(214, 330); g.lineTo(300, 326); g.stroke(); break;
    }
  });
}

// ---------- money badge on a cord ----------
export function badgeTex(text, color) {
  return canvasTex(`badge:${text}:${color}`, 256, 256, (g) => {
    g.fillStyle = '#2b2f36'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
    g.fillStyle = '#0d0f12'; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.fill();
    g.strokeStyle = color; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 98, 0, 7); g.stroke();
    g.fillStyle = '#cfd3da'; g.font = '700 26px Montserrat'; g.textAlign = 'center'; g.fillText('LIES', 128, 92);
    const fs = text.length > 7 ? 30 : text.length > 5 ? 40 : 54;
    g.fillStyle = color; g.font = `900 ${fs}px Montserrat`; g.fillText(text, 128, 128 + fs * .36);
  });
}

export function signTex(text, bg, fg = '#fff', w = 512, h = 128, font = 900) {
  return canvasTex(`sign:${text}:${bg}:${fg}:${w}`, w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - 10, w, 10);
    g.fillStyle = fg; g.font = `${font} ${h * .56}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 4);
  });
}

export function chalkTex() {
  return canvasTex('chalk', 1024, 512, (g) => {
    g.fillStyle = '#244a3a'; g.fillRect(0, 0, 1024, 512);
    g.strokeStyle = '#8a6a3c'; g.lineWidth = 30; g.strokeRect(0, 0, 1024, 512);
    g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '700 70px Montserrat'; g.textAlign = 'center';
    g.fillText('HOMEWORK DUE', 512, 170); g.font = '700 60px Montserrat'; g.fillText('TODAY!', 512, 270);
    g.font = '600 46px Montserrat'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('2 + 2 = 4', 260, 420); g.fillText('7 x 3 = 21', 760, 420);
  });
}

export function chequeTex() {
  return canvasTex('cheque', 1024, 460, (g) => {
    const gr = g.createLinearGradient(0, 0, 1024, 460); gr.addColorStop(0, '#f6f0d2'); gr.addColorStop(1, '#e8dfb4');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 460);
    g.strokeStyle = '#c9a43a'; g.lineWidth = 14; g.strokeRect(14, 14, 996, 432);
    g.fillStyle = '#7a5a10'; g.font = '800 40px Montserrat'; g.fillText('MAYOR\'S BANK', 50, 80);
    g.font = '600 32px Montserrat'; g.fillStyle = '#444'; g.fillText('PAY TO:', 50, 160);
    g.fillStyle = '#1d3a8a'; g.font = 'italic 700 52px Georgia'; g.fillText('Sam', 210, 165);
    g.strokeStyle = '#555'; g.lineWidth = 3; g.beginPath(); g.moveTo(200, 175); g.lineTo(620, 175); g.stroke();
    g.fillStyle = '#fff'; g.fillRect(630, 110, 340, 90); g.strokeStyle = '#555'; g.strokeRect(630, 110, 340, 90);
    g.fillStyle = '#0f7a2a'; g.font = '900 56px Montserrat'; g.textAlign = 'center'; g.fillText('$1,000,000', 800, 178);
    g.textAlign = 'left'; g.fillStyle = '#1d3a8a'; g.font = 'italic 700 42px Georgia'; g.fillText('One million dollars', 50, 270);
    g.beginPath(); g.moveTo(40, 285); g.lineTo(980, 285); g.stroke();
    g.fillStyle = '#444'; g.font = '600 26px Montserrat'; g.fillText('FOR: one tiny lie', 50, 380);
    g.fillStyle = '#1d3a8a'; g.font = 'italic 700 50px Georgia'; g.fillText('The Mayor', 680, 390);
  });
}

export function brickTex() {
  const t = canvasTex('brick', 512, 512, (g) => {
    g.fillStyle = '#b8806a'; g.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 16; r++) for (let c = -1; c < 9; c++) {
      const x = c * 64 + (r % 2) * 32, y = r * 32; const v = (Math.sin(r * 12.9 + c * 78.2) * 43758.5) % 1;
      g.fillStyle = `hsl(14, 42%, ${44 + Math.abs(v) * 10}%)`; g.fillRect(x + 3, y + 3, 58, 26);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

export function crackTex() {
  return canvasTex('crack', 512, 1024, (g) => {
    g.clearRect(0, 0, 512, 1024);
    const draw = (x, y, a, len, w, depth) => {
      if (depth > 5 || w < 1) return;
      let px = x, py = y; g.lineWidth = w; g.beginPath(); g.moveTo(px, py);
      for (let i = 0; i < 6; i++) { a += (Math.sin(depth * 7 + i * 3.1) * .5); px += Math.sin(a) * len / 6; py += Math.cos(a) * len / 6; g.lineTo(px, py); }
      g.stroke(); draw(px, py, a + .5, len * .7, w * .6, depth + 1); draw(px, py, a - .6, len * .6, w * .55, depth + 1);
    };
    g.strokeStyle = '#151515'; g.lineCap = 'round'; draw(256, 0, 0, 520, 16, 0);
  });
}

export function screenSamTex() {
  return canvasTex('screenSam', 768, 432, (g) => {
    g.fillStyle = '#7fc4ff'; g.fillRect(0, 0, 768, 432);
    g.fillStyle = '#e8c39c'; g.fillRect(274, 90, 220, 230); g.fillStyle = '#5a3a22'; g.fillRect(262, 70, 244, 60);
    g.fillStyle = '#5fd03a'; g.fillRect(200, 320, 368, 112);
    g.fillStyle = INK; g.fillRect(330, 180, 22, 40); g.fillRect(416, 180, 22, 40); g.fillRect(340, 262, 90, 12);
    g.fillStyle = '#e02424'; g.fillRect(24, 24, 120, 50); g.fillStyle = '#fff'; g.font = '900 36px Montserrat'; g.fillText('LIVE', 40, 63);
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 360, 768, 72); g.fillStyle = '#fff'; g.font = '800 34px Montserrat'; g.fillText('SAM SPEAKS', 30, 408);
  });
}

export function plaqueTex() {
  return canvasTex('plaque', 512, 256, (g) => {
    g.fillStyle = '#c99a2e'; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#7a5a10'; g.lineWidth = 14; g.strokeRect(8, 8, 496, 240);
    g.fillStyle = '#3d2a05'; g.font = '900 64px Montserrat'; g.textAlign = 'center'; g.fillText('SAM', 256, 110);
    g.font = '700 30px Montserrat'; g.fillText('HE NEVER LIED', 256, 175);
  });
}

export function slopTex() {
  return canvasTex('slop', 256, 256, (g) => {
    g.fillStyle = '#7fbf2a'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? '#5d9a1a' : '#a4d94a'; g.beginPath(); g.arc((i * 73) % 256, (i * 131) % 256, 10 + (i % 5) * 4, 0, 7); g.fill(); }
  });
}

// ---------- letters from the future ----------
export function letterTex(key, lines, color = '#1d2c6b', sign = '- Future You', marker = false) {
  return canvasTex('letter:' + key, 768, 1000, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 1000); gr.addColorStop(0, '#fffdf3'); gr.addColorStop(1, '#f3ead2');
    g.fillStyle = gr; g.fillRect(0, 0, 768, 1000);
    g.strokeStyle = 'rgba(80,120,200,.25)'; g.lineWidth = 3;
    for (let y = 150; y < 980; y += 64) { g.beginPath(); g.moveTo(40, y); g.lineTo(728, y); g.stroke(); }
    g.strokeStyle = 'rgba(220,80,80,.35)'; g.beginPath(); g.moveTo(90, 0); g.lineTo(90, 1000); g.stroke();
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    const fs = marker ? 92 : 104, lh = fs * 1.12, y0 = 470 - (lines.length - 1) * lh / 2;
    g.font = marker ? `400 ${fs}px "Permanent Marker"` : `700 ${fs}px Caveat`;
    lines.forEach((l, i) => g.fillText(l, 400, y0 + i * lh));
    g.font = '700 64px Caveat'; g.textAlign = 'right'; g.fillStyle = '#333'; g.fillText(sign, 700, 900);
  });
}
export function envelopeTex(key, to, from) {
  return canvasTex('env:' + key, 768, 480, (g) => {
    g.fillStyle = '#fbf7ec'; g.fillRect(0, 0, 768, 480);
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(384, 250); g.lineTo(768, 0); g.stroke();
    g.fillStyle = '#c0392b'; g.beginPath(); g.arc(384, 250, 46, 0, 7); g.fill();
    g.fillStyle = '#8e2418'; g.font = '900 44px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('F', 384, 252);
    g.fillStyle = '#222'; g.font = '700 58px Caveat'; g.textAlign = 'left';
    g.fillText('To: ' + to, 60, 370); g.fillText('From: ' + from, 60, 430);
    g.fillStyle = '#d63031'; g.fillRect(640, 30, 90, 110); g.fillStyle = '#fff'; g.font = '900 30px Montserrat'; g.textAlign = 'center'; g.fillText('2036', 685, 90);
  });
}
export function stockTex() {
  return canvasTex('stocks', 768, 432, (g) => {
    g.fillStyle = '#0d1117'; g.fillRect(0, 0, 768, 432);
    g.fillStyle = '#fff'; g.font = '900 40px Montserrat'; g.fillText('MAX\'S STOCKS', 30, 60);
    g.strokeStyle = '#ff3b3b'; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 120);
    const pts = [[120, 140], [200, 130], [280, 190], [360, 180], [440, 260], [520, 250], [600, 340], [700, 390]]; for (const [x, y] of pts) g.lineTo(x, y); g.stroke();
    g.fillStyle = '#ff3b3b'; g.beginPath(); g.moveTo(700, 410); g.lineTo(660, 340); g.lineTo(740, 340); g.fill();
    g.font = '900 64px Montserrat'; g.fillText('-99%', 520, 120);
  });
}
