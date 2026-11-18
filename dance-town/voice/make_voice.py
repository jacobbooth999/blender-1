# Narration in the user's default "Adam" voice (CLAUDE.md, voices/adam/README.md): zero-shot ZipVoice clone,
# full-precision model, 32 steps, espeak lexicon, one line at a time, every take checked with parakeet ASR.
# Writes voice.wav + words.json (word starts from the ASR timestamps) + words_v1.json (identity warp).
import json, os, re, sys
import numpy as np, soundfile as sf, librosa, sherpa_onnx as so
from phonemizer.backend.espeak.wrapper import EspeakWrapper
import espeakng_loader

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
Z = os.path.join(ROOT, "lie-town/voice/models/zipvoice/"); A = os.path.join(ROOT, "lie-town/voice/models/asr/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8/")
SAMPLE = os.path.join(ROOT, "voices/adam/voice-adam.m4a"); PROMPT_TEXT = open(os.path.join(ROOT, "voices/adam/transcript.txt")).read().strip()

LINES = [  # (text, pause after) — "In This Town, You Must NEVER Stop Dancing"
    ("In this town, everyone has to keep dancing.", .15),
    ("And if you stop, something terrible happens.", .45),
    ("Why is everyone dancing?", .3),                                   # hero
    ("Never. Stop. Moving.", .5),                                       # old man
    ("Nobody knew why they had to dance.", .15),
    ("They just knew what happened to people who stopped.", 5.6),       # trip, freeze, silence, alarm, hands
    ("What was that?!", .35),                                           # hero
    ("The town needs us moving.", .6),                                  # woman (whisper)
    ("That night, he decided to investigate.", .35),
    ("He found the town's old security footage.", .25),
    ("Fifty years ago. Everyone dancing.", .25),
    ("A hundred years ago. Everyone dancing.", .25),
    ("Two hundred years ago. Everyone dancing.", .4),
    ("Then he found an old newspaper.", .25),
    ("The dancing has kept the thing asleep for two hundred years.", .6),
    ("Suddenly, the computer turned on by itself.", .4),
    ("Do not stop.", .7),
    ("But he made one decision that would change everything.", .4),
    ("He walked into the town square, and slowly stopped moving.", .35),
    ("Please! Not you!", 3.2),                                          # grandma, then three seconds of nothing
    ("Then the ground began to shake.", .2),
    ("The sky turned black.", .25),
    ("And every single person turned to look at him.", .45),
    ("Something enormous rose from beneath the town.", .35),
    ("But it didn't attack him.", .45),
    ("Finally. Someone has stopped feeding me.", .6),                   # creature
    ("He thought stopping the dancing would save everyone.", .15),
    ("But he had just released the thing they'd been keeping alive.", .35),
    ("People started collapsing.", .25),
    ("Then his hands began to glow.", .35),
    ("You're the only one who can replace me!", .5),                    # creature
    ("Then Grandma grabbed his arm.", .25),
    ("I've been waiting two hundred years for this moment.", .6),       # grandma
    ("You're not just another dancer.", .25),                           # grandma
    ("You're the reason this town exists.", 0),                         # grandma
]
LEAD, TAIL, SR, STEPS, TAKES = .15, 5.0, 24000, 32, 3
FIX = {"a": "ə"}   # article as schwa

EspeakWrapper.set_library(espeakng_loader.get_library_path()); EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
from phonemizer.backend import EspeakBackend
be = EspeakBackend("en-us", preserve_punctuation=False, with_stress=True, language_switch="remove-flags")
toks = set(l.rstrip("\n").split("\t")[0] for l in open(Z + "tokens.txt", encoding="utf8"))
words = sorted(set(re.findall(r"[A-Za-z0-9']+", PROMPT_TEXT + " " + " ".join(t for t, _ in LINES))))
lex = Z + "lexicon_fight.txt"
with open(lex, "w", encoding="utf8") as f:
    for w, p in zip(words, be.phonemize(words, strip=True)):
        t = FIX.get(w.lower()) or " ".join(c for c in p.replace(" ", "") if c in toks)
        for ww in {w, w.lower(), w.upper()}: f.write(f"{ww} {t}\n")
    f.write(open(Z + "lexicon.txt", encoding="utf8").read())

tts = so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(zipvoice=so.OfflineTtsZipvoiceModelConfig(
    tokens=Z + "tokens.txt", encoder=Z + "text_encoder.onnx", decoder=Z + "fm_decoder.onnx", vocoder=Z + "vocos_24khz.onnx",
    data_dir=Z + "espeak-ng-data", lexicon=lex, guidance_scale=1.0), num_threads=4)))
asr = so.OfflineRecognizer.from_transducer(encoder=A + "encoder.int8.onnx", decoder=A + "decoder.int8.onnx", joiner=A + "joiner.int8.onnx",
                                           tokens=A + "tokens.txt", model_type="nemo_transducer", num_threads=4)
import subprocess, tempfile
_wav = os.path.join(tempfile.gettempdir(), "adam_prompt_24k.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SAMPLE, "-ac", "1", "-ar", str(SR), _wav], check=True)
P, psr = sf.read(_wav, dtype="float32"); P = P.tolist()

def recog(x):
    s = asr.create_stream(); s.accept_waveform(16000, librosa.resample(x, orig_sr=SR, target_sr=16000)); asr.decode_stream(s)
    r = s.result; out, w = [], None
    for t, ts in zip(r.tokens, r.timestamps):
        if t.startswith(" ") or w is None:
            if w: out.append(w)
            w = [t.strip(), ts]
        else: w[0] += t
    if w: out.append(w)
    return out
norm = lambda s: [w for w in re.findall(r"[a-z']+", s.lower().replace("'s", " s"))]
def score(text, hyp):
    ref = norm(text); h = norm(" ".join(w for w, _ in hyp))
    hits = sum(1 for w in ref if w in h or (w == "hus" and any(x.startswith(("hus", "huss", "hu", "has", "his")) for x in h)))
    last_ok = bool(h) and (ref[-1] in h[-2:] or ref[-1] == "hus")
    return hits / len(ref) + (.5 if last_ok else 0)

cache = os.path.join(HERE, "takes"); os.makedirs(cache, exist_ok=True)
HUS3 = "HUS! HUS! HUS!"

def gen_best(text, fn, tag):
    """Generate up to TAKES takes of text, keep the best ASR score; cached in fn."""
    if os.path.exists(fn): x, _ = sf.read(fn, dtype="float32"); return x, recog(x)
    best = None
    for take in range(TAKES):
        a = tts.generate(text, prompt_text=PROMPT_TEXT, prompt_samples=P, sample_rate=SR, speed=0.92 if take == 2 else 1.0, num_steps=STEPS)
        x = np.array(a.samples, np.float32)
        if not len(x): continue
        nz = np.where(np.abs(x) > .006)[0]; x = x[max(0, nz[0] - 240): nz[-1] + 1200]
        hyp = recog(x); sc = score(text, hyp)
        print(f"{tag}.{take} score {sc:.2f} | {' '.join(w for w, _ in hyp)}", flush=True)
        if best is None or sc > best[0]: best = (sc, x, hyp)
        if sc >= 1.5: break
    _, x, hyp = best; sf.write(fn, x, SR); return x, hyp

parts, words_out, t = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
for li, (text, gap) in enumerate(LINES):
    def emit_words(x, hyp, seg, t0):
        sw = re.findall(r"[A-Za-z0-9']+", seg); dur = len(x) / SR
        ts = [h[1] for h in hyp] or [0]
        starts = [ts[j] if len(ts) == len(sw) else ts[min(len(ts) - 1, round(j * len(ts) / len(sw)))] for j in range(len(sw))]
        starts = [min(s_, dur - .05) for s_ in starts]
        for j, w in enumerate(sw):
            e = starts[j + 1] if j + 1 < len(sw) else dur
            words_out.append({"word": w, "start": round(t0 + starts[j], 3), "end": round(t0 + max(starts[j] + .12, e), 3), "p": li})
    if HUS3 in text:
        pre, post = [q.strip() for q in text.split(HUS3)]
        x, hyp = gen_best(pre + " " + post, os.path.join(cache, f"line{li:02d}_nohus.wav"), f"{li}")
        # cut at the internal pause closest to where the punches belong
        n_pre = len(re.findall(r"[A-Za-z0-9']+", pre)); n_all = n_pre + len(re.findall(r"[A-Za-z0-9']+", post))
        hop = int(.01 * SR); e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
        q = e < .12 * np.median(e); gaps = []; i = 0
        while i < len(q):
            if q[i]:
                j = i
                while j < len(q) and q[j]: j += 1
                if j - i >= 4 and i > 5 and j < len(q) - 5: gaps.append(((i + j) / 2 * .01, j - i))
                i = j
            else: i += 1
        want = (hyp[n_pre][1] if len(hyp) == n_all else len(x) / SR * n_pre / n_all)
        cut = min(gaps, key=lambda g: abs(g[0] - want))[0] if gaps else want
        xa, xb = x[:int(cut * SR)], x[int(cut * SR):]
        ha = [h for h in hyp if h[1] < cut]; hb = [[w, s_ - cut] for w, s_ in hyp if s_ >= cut]
        emit_words(xa, ha, pre, t); parts.append(xa); t += len(xa) / SR
        parts.append(np.zeros(int(.12 * SR), np.float32)); t += .12
        hx, st = hus3()
        for j in range(3): words_out.append({"word": "HUS", "start": round(t + st[j], 3), "end": round(t + st[j] + len(hus[j]) / SR, 3), "p": li, "hus": True})
        parts.append(hx); t += len(hx) / SR
        parts.append(np.zeros(int(.15 * SR), np.float32)); t += .15
        emit_words(xb, hb, post, t); parts.append(xb); t += len(xb) / SR
    else:
        x, hyp = gen_best(text, os.path.join(cache, f"line{li:02d}.wav"), f"{li}")
        emit_words(x, hyp, text, t); parts.append(x); t += len(x) / SR
    parts.append(np.zeros(int(gap * SR), np.float32)); t += gap
parts.append(np.zeros(int(TAIL * SR), np.float32))
y = np.concatenate(parts); y = y / (np.abs(y).max() + 1e-9) * .8
sf.write(os.path.join(HERE, "voice.wav"), y, SR)
data = {"duration": round(len(y) / SR, 3), "words": words_out, "phrases": []}
for n in ("words.json", "words_v1.json"): json.dump(data, open(os.path.join(HERE, n), "w"), indent=0)
print("duration", data["duration"], "words", len(words_out))
