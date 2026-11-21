"""Generate one narration clip per beat with Kokoro (local, open weights) and
write build/durations.json so each scene lasts exactly as long as its line.

python3 tts.py MODEL_DIR [voice] [speed]
MODEL_DIR must contain kokoro-v1.0.onnx and voices-v1.0.bin.
"""
import os, sys, json
import numpy as np
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import beats, BUILD, ROOT
from kokoro_onnx import Kokoro

def main():
    mdir = sys.argv[1]
    voice = sys.argv[2] if len(sys.argv) > 2 else "am_michael"
    speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    k = Kokoro(os.path.join(mdir, "kokoro-v1.0.onnx"), os.path.join(mdir, "voices-v1.0.bin"))
    vdir = os.path.join(ROOT, "narration", "voice")
    os.makedirs(vdir, exist_ok=True)
    durs = []
    for i, b in enumerate(beats()):
        audio, sr = k.create(b["text"], voice=voice, speed=speed, lang="en-us")
        # trim leading/trailing silence
        a = np.asarray(audio, np.float32)
        nz = np.nonzero(np.abs(a) > 0.01)[0]
        if len(nz):
            a = a[max(0, nz[0] - int(0.03 * sr)): nz[-1] + int(0.06 * sr)]
        sf.write(os.path.join(vdir, f"B{i + 1:03d}.wav"), a, sr, subtype="PCM_16")
        # beat lasts as long as its line plus a breath; sentence ends get a longer pause
        pause = 0.32 if b["text"].rstrip().endswith((".", "?")) else 0.12
        durs.append(round(len(a) / sr + 0.08 + pause, 3))
        print(b["code"], f"{durs[-1]:.2f}s", flush=True)
    json.dump(durs, open(os.path.join(BUILD, "durations.json"), "w"))
    print("total", round(sum(durs), 1))

if __name__ == "__main__":
    main()
