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
export const FACES = ['neutral', 'smile', 'grin', 'shock', 'sad', 'cry', 'smug', 'worried', 'determined', 'laugh', 'happycry', 'greedy', 'talk'];
export function faceTex(name, blink = false) {
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
