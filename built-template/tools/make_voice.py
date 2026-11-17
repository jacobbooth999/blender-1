"""Synthesise a British voiceover + words.json for an episode script with local TTS (sherpa-onnx).

  python tools/make_voice.py --voice george --text "If you ..." --out voices/george
  python tools/make_voice.py --voice george --episode episodes/demo_chippy.json --out voices/george

Writes <out>.wav (44.1 kHz, loudness-normalised to -14 LUFS) and <out>.words.json in the schema the
builder reads. Sentences are synthesised one at a time, so sentence boundaries are exact; word times
inside a sentence are spread by syllable-ish length (good enough for one-word captions; use a forced
aligner if you need frame accuracy).

Models (download from github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models into --models):
  kokoro-multi-lang-v1_0, vits-piper-en_GB-alan-medium, vits-piper-en_GB-northern_english_male-medium,
  vits-piper-en_GB-cori-high, vits-piper-en_GB-vctk-medium
Needs: pip install sherpa-onnx piper-tts num2words soundfile numpy ; ffmpeg on PATH.
Captions keep the written words ("£8.50"); the voice says the spelled-out form.
"""
import argparse, json, os, re, subprocess, tempfile
import numpy as np
import soundfile as sf
import sherpa_onnx  # Kokoro voices

try:                # Piper voices (pip install piper-tts); sherpa-onnx 2.x has no Piper phonemiser
    from piper import PiperVoice, SynthesisConfig
except ImportError:
    PiperVoice = None

# name -> (engine, model dir, speaker id, default speed, description)
VOICES = {
    "george":   ("kokoro", "kokoro-multi-lang-v1_0", 26, 1.43, "Kokoro bm_george: warm, mature male"),
    "lewis":    ("kokoro", "kokoro-multi-lang-v1_0", 27, 1.3, "Kokoro bm_lewis: deeper male"),
    "daniel":   ("kokoro", "kokoro-multi-lang-v1_0", 24, 1.35, "Kokoro bm_daniel: crisp male"),
    "fable":    ("kokoro", "kokoro-multi-lang-v1_0", 25, 1.59, "Kokoro bm_fable: storyteller male"),
    "emma":     ("kokoro", "kokoro-multi-lang-v1_0", 21, 1.22, "Kokoro bf_emma: clear female"),
    "isabella": ("kokoro", "kokoro-multi-lang-v1_0", 22, 1.27, "Kokoro bf_isabella: bright female"),
    "alice":    ("kokoro", "kokoro-multi-lang-v1_0", 20, 1.37, "Kokoro bf_alice: female"),
    "lily":     ("kokoro", "kokoro-multi-lang-v1_0", 23, 1.46, "Kokoro bf_lily: younger female"),
    "alan":     ("piper", "vits-piper-en_GB-alan-medium", 0, 1.43, "Piper alan: southern English male"),
    "northern": ("piper", "vits-piper-en_GB-northern_english_male-medium", 0, 1.12, "Piper northern_english_male"),
    "cori":     ("piper", "vits-piper-en_GB-cori-high", 0, 1.3, "Piper cori: English female"),
    "london":   ("piper", "vits-piper-en_GB-vctk-medium", 81, 1.09, "VCTK p243 (London, male)"),
    "brum":     ("piper", "vits-piper-en_GB-vctk-medium", 104, 1.13, "VCTK p256 (Birmingham, male)"),
    "yorkshire":("piper", "vits-piper-en_GB-vctk-medium", 12, 1.06, "VCTK p270 (Yorkshire, male)"),
    "geordie":  ("piper", "vits-piper-en_GB-vctk-medium", 9, 1.1, "VCTK p286 (Newcastle, male)"),
}


class _Piper:
    """Small adapter so Piper voices look like sherpa-onnx OfflineTts."""

    def __init__(self, d):
        onnx = [f for f in os.listdir(d) if f.endswith(".onnx")][0]
        self.v = PiperVoice.load(os.path.join(d, onnx))
        self.sample_rate = self.v.config.sample_rate

    def generate(self, text, sid=0, speed=1.0):
        cfg = SynthesisConfig(speaker_id=sid if self.v.config.num_speakers > 1 else None, length_scale=1.0 / speed)
        x = np.concatenate([c.audio_float_array for c in self.v.synthesize(text, syn_config=cfg)])

        class R:
            samples = x
        return R()


# ---- text normalising and pronunciations for words the Kokoro dictionary lacks -------------
def normalise(text):
    """Spell out money, times and numbers so every engine says them (Kokoro skips digits)."""
    from num2words import num2words as n2w

    def money(m):
        sym, whole, pence = m.group(1), int(m.group(2)), m.group(3)
        unit = {"£": "pound", "$": "dollar", "€": "euro"}[sym]
        out = f"{n2w(whole)} {unit}{'' if whole == 1 else 's'}"
        return out + (f" {n2w(int(pence))}" if pence and int(pence) else "")
    text = re.sub(r"([£$€])(\d+)(?:\.(\d\d))?", money, text)
    text = re.sub(r"\b(\d{1,2})(am|pm)\b", lambda m: f"{n2w(int(m.group(1)))} {' '.join(m.group(2).upper())}", text)
    text = re.sub(r"\b(\d+)%", lambda m: f"{n2w(int(m.group(1)))} percent", text)
    text = re.sub(r"\b\d+(st|nd|rd|th)\b", lambda m: n2w(int(m.group(0)[:-2]), to="ordinal"), text)
    text = re.sub(r"\b\d+\b", lambda m: n2w(int(m.group(0))), text)
    return text


_MISAKI = [("aɪ", "I"), ("eɪ", "A"), ("aʊ", "W"), ("ɔɪ", "Y"), ("əʊ", "Q"), ("oʊ", "O"),
           ("dʒ", "ʤ"), ("tʃ", "ʧ"), ("ɐ", "ə"), ("ɚ", "ə"), ("r", "ɹ")]


def kokoro_extra_lexicon(text, d, out_path):
    """Write lexicon entries (British RP via espeak in piper-tts) for words missing from Kokoro's dictionary."""
    known = set()
    with open(f"{d}/lexicon-gb-en.txt", encoding="utf-8") as f:
        for line in f:
            known.add(line.split(" ", 1)[0])
    tokens = set()
    with open(f"{d}/tokens.txt", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                tokens.add(line.rsplit(" ", 1)[0])
    words = {w for w in re.findall(r"[a-z']+", text.lower()) if w.strip("'") and w not in known}
    if not words:
        return None
    try:
        from piper.phonemize_espeak import EspeakPhonemizer
    except ImportError:
        print(f"warning: Kokoro will skip these words (pip install piper-tts to fix): {sorted(words)}")
        return None
    ph = EspeakPhonemizer()
    lines = []
    for w in sorted(words):
        ipa = "".join(c for sent in ph.phonemize("en-gb-x-rp", w) for c in sent if c != " ")
        for a, b in _MISAKI:
            ipa = ipa.replace(a, b)
        seq = [c for c in ipa if c in tokens]
        if seq:
            lines.append(f"{w} {' '.join(seq)}")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"added pronunciations for: {', '.join(sorted(words))}")
    return out_path


def make_tts(engine, d, text=""):
    if engine == "piper":
        if PiperVoice is None:
            raise SystemExit("Piper voices need: pip install piper-tts")
        return _Piper(d)
    if engine == "kokoro":
        extra = kokoro_extra_lexicon(text, d, os.path.join(tempfile.gettempdir(), "kokoro_extra_lexicon.txt"))
        m = sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f"{d}/model.onnx", voices=f"{d}/voices.bin", tokens=f"{d}/tokens.txt",
            data_dir=f"{d}/espeak-ng-data", dict_dir=f"{d}/dict",
            lexicon=",".join(x for x in (extra, f"{d}/lexicon-gb-en.txt", f"{d}/lexicon-zh.txt") if x),
            lang="en-gb"), num_threads=4)
    else:
        onnx = [f for f in os.listdir(d) if f.endswith(".onnx")][0]
        m = sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f"{d}/{onnx}", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data"), num_threads=4)
    return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=m))


def trim(x, sr, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx):
        return x
    pad = int(0.02 * sr)
    return x[max(0, idx[0] - pad): idx[-1] + pad]


def weight(w):
    core = re.sub(r"[^a-z0-9£$€]", "", w.lower())
    if any(ch.isdigit() for ch in core) or any(c in core for c in "£$€"):
        return 2.5 + len(core) * 0.3          # numbers are said as several words
    syl = max(1, len(re.findall(r"[aeiouy]+", core)))
    return 0.6 + syl + len(core) * 0.05


def synth(text, voice, models, speed=None, gap=0.16, comma_gap=0.0):
    engine, sub, sid, dspeed, _ = VOICES[voice]
    tts = make_tts(engine, os.path.join(models, sub), normalise(text))
    sentences = re.findall(r"[^.!?]+[.!?]*", text)
    sr = tts.sample_rate
    out, words, t, s_idx = [], [], 0.1, 0
    out.append(np.zeros(int(0.1 * sr), dtype=np.float32))
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
        a = tts.generate(normalise(sent), sid=sid, speed=speed or dspeed)
        x = trim(np.array(a.samples, dtype=np.float32), sr)
        dur = len(x) / sr
        toks = sent.split()
        ws = [weight(w) for w in toks]
        tot = sum(ws)
        tt = t
        for w, wt in zip(toks, ws):
            d = dur * wt / tot
            words.append({"word": w, "start": round(tt, 3), "end": round(tt + d, 3), "s": s_idx})
            tt += d
        out.append(x)
        out.append(np.zeros(int(gap * sr), dtype=np.float32))
        t += dur + gap
        s_idx += 1
    return np.concatenate(out), sr, {"duration": round(t, 3), "words": words}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True, choices=sorted(VOICES))
    ap.add_argument("--text")
    ap.add_argument("--episode")
    ap.add_argument("--out", required=True)
    ap.add_argument("--speed", type=float)
    ap.add_argument("--models", default=os.environ.get("TTS_MODELS", "models/tts"))
    a = ap.parse_args()
    text = a.text or json.load(open(a.episode))["script"]
    x, sr, words = synth(text, a.voice, a.models, a.speed)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        sf.write(tmp.name, x, sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp.name, "-af",
                        "highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7",
                        "-ar", "44100", a.out + ".wav"], check=True)
    json.dump(words, open(a.out + ".words.json", "w"), indent=1)
    print(f"{a.voice}: {words['duration']:.1f}s, {len(words['words'])} words, "
          f"{len(words['words']) / words['duration']:.2f} words/s -> {a.out}.wav")


if __name__ == "__main__":
    main()
