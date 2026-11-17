# Word timings without ASR: split each line at its pauses (matched to punctuation), then share each segment by syllables.
import json, re, wave, numpy as np
S = json.load(open('script.json')); out = {}
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()) or 'x'
    n = len(re.findall(r'[aeiouy]+', w)); n -= 1 if w.endswith('e') and n > 1 and not w.endswith('le') else 0
    return max(1, n) + (0.6 if any(c.isdigit() for c in w) else 0)
for L in S:
    wf = wave.open(f"voices/{L['id']}.wav"); sr = wf.getframerate(); a = np.frombuffer(wf.readframes(wf.getnframes()), np.int16) / 32768.
    hop = int(sr * .01); env = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
    thr = max(env.max() * .04, 1e-3); sil = env < thr; T = len(a) / sr
    runs, i = [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if i > 5 and j < len(sil) - 5 and (j - i) >= 5: runs.append(((i + j) / 2 * .01, (j - i) * .01, i * .01, j * .01))
            i = j
        else: i += 1
    words = ' '.join(L['chunks']).split()
    brk = [k for k, w in enumerate(words[:-1]) if re.search(r'[,.?!:]$|\.\.\.$', w)]
    nz = np.where(~sil)[0]; t0, t1 = nz[0] * .01, (nz[-1] + 1) * .01
    sy = [syl(w) + .35 for w in words]; tot = sum(sy); cum = np.cumsum(sy)
    exp = [t0 + (t1 - t0) * cum[k] / tot for k in brk]
    # match breaks to pauses in order: each break takes the longest pause within 0.45 s of its expected time
    used, match = set(), {}
    for bi, k in sorted(enumerate(brk), key=lambda x: 0):
        cand = [r for r in runs if abs(r[0] - exp[bi]) < .45 and r not in used and all(r[0] > match[b][0] for b in match if b < bi)]
        if cand: r = max(cand, key=lambda r: r[1] - abs(r[0] - exp[bi]) * .2); used.add(r); match[bi] = r
    edges, groups, s0 = [t0], [], 0
    for bi, k in enumerate(brk):
        if bi in match: groups.append(words[s0:k + 1]); s0 = k + 1; edges += [match[bi][2], match[bi][3]]
    groups.append(words[s0:]); edges.append(t1)
    if len(match) < len(brk): print('!', L['id'], 'matched', len(match), 'of', len(brk))
    W = []
    for gi, g in enumerate(groups):
        a0, a1 = edges[2 * gi], edges[2 * gi + 1]; ws = [syl(w) + .35 for w in g]; tot = sum(ws); c = a0
        for w, x in zip(g, ws): d = (a1 - a0) * x / tot; W.append({'w': w, 's': round(c, 3), 'e': round(c + d, 3)}); c += d
    out[L['id']] = {'dur': round(T, 3), 'words': W}
json.dump(out, open('voices/words.json', 'w'), indent=1)
print('ok', len(out))
