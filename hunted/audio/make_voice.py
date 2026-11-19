# Generates the voice lines with Kokoro TTS (model files in ~/tts or $TTS_DIR).
# Narrator: British male. Hunter: deep male, slowed and pitched down.
import os, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
D = os.environ.get('TTS_DIR', os.path.expanduser('~/tts'))
k = Kokoro(os.path.join(D, 'kokoro-v1.0.onnx'), os.path.join(D, 'voices-v1.0.bin'))
OUT = os.path.join(os.path.dirname(__file__), 'voice')
LINES = {
  'n1': ('bm_george', 1.0, 0, "You just made eye contact with a Russian hitman. And he's carrying a rifle."),
  'n2': ('bm_george', 1.05, 0, "You need to get out. But every exit seems to be getting blocked."),
  'h1': ('am_onyx', 0.8, -3, "There you are."),
  'h2': ('am_onyx', 0.8, -3, "You cannot hide forever."),
  'h3': ('am_onyx', 0.8, -3, "Found you."),
  'h4': ('am_onyx', 0.78, -3, "Next time."),
  'g1': ('bm_daniel', 1.15, 0, "Everybody out! Move! Move!"),
}
def pitch(x, sr, semis):
    if not semis: return x
    f = 2 ** (semis / 12)          # resample -> lower pitch & slower; Kokoro speed compensates
    n = int(len(x) / f)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - 800): idx[-1] + 2400] if len(idx) else x
meta = {}
for name, (voice, speed, semis, text) in LINES.items():
    s, sr = k.create(text, voice=voice, speed=speed * (2 ** (semis / 12)) if semis else speed, lang='en-gb' if voice.startswith('b') else 'en-us')
    s = trim(pitch(np.asarray(s, dtype=np.float32), sr, semis))
    s = s / (np.max(np.abs(s)) + 1e-9) * 0.9
    sf.write(os.path.join(OUT, name + '.wav'), s, sr)
    meta[name] = round(len(s) / sr, 3); print(name, meta[name], 's')
json.dump(meta, open(os.path.join(OUT, 'durations.json'), 'w'), indent=1)
