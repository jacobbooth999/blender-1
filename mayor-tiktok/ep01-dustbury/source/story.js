// Dustbury — EP.1 "Population: Three". Timeline (seconds). Every visual beat is anchored to a voice line.
import WORDS from './voices/words.json' with { type: 'json' };
import SCRIPT from './script.json' with { type: 'json' };

// voice line start times
export const VO_T = {
  L1: 0.35, L2: 3.15, L3: 5.55, L4: 8.75, L5: 13.15, L6: 15.75, L7: 18.85, L8: 21.35, L9: 23.85, L10: 27.45,
  L11: 30.75, L12: 34.35, L13: 36.55, L14: 40.4, L15: 43.6, L16: 46.85, L17: 50.85, L18: 55.05, L19: 60.45, L20: 63.25,
};
export const DUR = 66.0;
// time of a word: line id, word index (or text) → absolute start
export function wt(id, w) {
  const ws = WORDS[id].words;
  const i = typeof w === 'number' ? w : ws.findIndex(x => x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === w);
  return VO_T[id] + ws[Math.max(0, i)].s;
}
export const lineEnd = id => VO_T[id] + WORDS[id].dur;

export const T = {
  slam: 0.05,                 // welcome sign slams into the ground
  worst: wt('L1', 'worst'),
  you: wt('L2', 'you'),
  reveal: 4.95,               // pull back to the whole town + title
  three: wt('L3', 'three'),
  fountain: 8.6, mud: wt('L4', 'ambitions') - .1,
  lamps: 13.0, dead: wt('L5', 'dead'),
  hall: 15.6, tent: wt('L6', 'tent') - .05,
  people: 18.7, threeOf: wt('L7', 'three'),
  rose: 21.2, gary: 23.7, stopped: wt('L9', 'stopped'), dot: 27.3,
  scratch: 30.15, hill: 30.35, flicker: 35.45,
  stakes: 36.35, leaving: wt('L13', 'leaving'),
  zero: wt('L14', 'zero'), gone: wt('L14', 'gone'), forever: wt('L14', 'forever'), rewind: 43.35,
  coins: 43.5, hundred: wt('L15', 'hundred'),
  optA: 46.7, optB: 50.7, comment: 54.9, follow: 60.3, loop: 63.1,
};

// kinetic caption data: per line, chunks of words with absolute times and emphasis styles
export const CAPS = SCRIPT.map(L => {
  const ws = WORDS[L.id].words; let k = 0;
  const chunks = L.chunks.map(c => {
    const n = c.split(/\s+/).length, words = ws.slice(k, k + n).map(w => ({ w: w.w, t: VO_T[L.id] + w.s, e: VO_T[L.id] + w.e, st: L.emph[w.w] || null }));
    k += n; return { words, t0: words[0].t, t1: words[words.length - 1].e };
  });
  chunks.forEach((c, i) => { const nx = chunks[i + 1]; c.t1 = nx ? nx.t0 : c.t1 + .45; });
  return { id: L.id, chunks };
});

// sky keyframes: [t, zenith, horizon, deep sea, shallow sea, sun colour, sun I, hemi sky, hemi ground, hemi I, sun el°, sun az°, night(0..1), saturation]
// Dustbury starts grey and tired: overcast, low saturation. The hill is a cold dusk; "gone forever" drains everything; the vote warms up (hope).
export const SKY = [
  [0.0, '#8fa3b8', '#d9d4c8', '#4f7f8c', '#8ab3ad', '#fff0dc', 2.0, '#dde3ea', '#a89a86', 1.15, 38, 150, 0, .72],
  [29.8, '#8fa3b8', '#d9d4c8', '#4f7f8c', '#8ab3ad', '#fff0dc', 2.0, '#dde3ea', '#a89a86', 1.15, 38, 150, 0, .72],
  [30.6, '#3c4466', '#8a7f98', '#2f3e5c', '#4d6478', '#c8b0d8', .7, '#7a82a8', '#4a4458', .7, 14, 110, .75, .6],
  [36.0, '#3c4466', '#8a7f98', '#2f3e5c', '#4d6478', '#c8b0d8', .7, '#7a82a8', '#4a4458', .7, 14, 110, .75, .6],
  [36.6, '#8a98aa', '#d2ccc0', '#4a7480', '#83a8a2', '#ffe8d0', 1.8, '#d8dce2', '#a09280', 1.1, 32, 140, .05, .62],
  [41.4, '#8a98aa', '#d2ccc0', '#4a7480', '#83a8a2', '#ffe8d0', 1.8, '#d8dce2', '#a09280', 1.1, 32, 140, .05, .62],
  [42.2, '#5a5560', '#a0908a', '#3a4448', '#5a6a68', '#d8c0b0', 1.0, '#a8a0a0', '#706050', .85, 20, 140, .35, .12],
  [43.3, '#5a5560', '#a0908a', '#3a4448', '#5a6a68', '#d8c0b0', 1.0, '#a8a0a0', '#706050', .85, 20, 140, .35, .12],
  [43.36, '#8fb0cc', '#efe0c8', '#3f8c9c', '#86ccc0', '#ffe2b8', 2.3, '#e8ecf0', '#b8a68a', 1.15, 34, 135, 0, .9],
  [60.0, '#8fb0cc', '#f3dcc0', '#3f8c9c', '#86ccc0', '#ffd8a8', 2.2, '#ecebe8', '#b8a68a', 1.12, 28, 130, 0, .92],
  [63.0, '#8fa3b8', '#d9d4c8', '#4f7f8c', '#8ab3ad', '#fff0dc', 2.0, '#dde3ea', '#a89a86', 1.15, 38, 150, 0, .72],
  [66.0, '#8fa3b8', '#d9d4c8', '#4f7f8c', '#8ab3ad', '#fff0dc', 2.0, '#dde3ea', '#a89a86', 1.15, 38, 150, 0, .72],
];

export const SHOTS = [
  [0, T.reveal, 'hook'], [T.reveal, T.fountain, 'wide'], [T.fountain, T.lamps, 'fountain'], [T.lamps, T.hall, 'lamps'],
  [T.hall, T.people, 'hall'], [T.people, T.rose, 'people'], [T.rose, T.gary, 'rose'], [T.gary, T.dot, 'gary'], [T.dot, T.hill, 'dot'],
  [T.hill, T.stakes, 'hill'], [T.stakes, T.rewind, 'stakes'], [T.rewind, T.optA, 'coins'], [T.optA, T.optB, 'optA'], [T.optB, T.comment, 'optB'],
  [T.comment, T.follow, 'comment'], [T.follow, T.loop, 'follow'], [T.loop, DUR + 1, 'loop'],
];
export const shotAt = t => SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
