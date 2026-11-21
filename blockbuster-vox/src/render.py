"""Render beats to video segments, or a contact sheet of frames.

python3 render.py sheet [N ..]     # last frame of beats -> build/sheet_*.jpg
python3 render.py beats 1 5 9      # render selected beats (1-based) to build/seg
python3 render.py all              # render every beat in parallel
"""
import sys, os, json, subprocess
from multiprocessing import Pool
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

BUILD = os.path.join(ROOT, "build")
SEG = os.path.join(BUILD, "seg")
os.makedirs(SEG, exist_ok=True)
TRANS_N = 11  # transition length in frames

def beats():
    return json.load(open(os.path.join(ROOT, "narration", "beats.json")))

def durations():
    p = os.path.join(BUILD, "durations.json")
    if os.path.exists(p):
        return json.load(open(p))
    return [round(len(b["text"].split()) / 2.5, 2) for b in beats()]

def words():
    p = os.path.join(BUILD, "words.json")
    return json.load(open(p)) if os.path.exists(p) else [[] for _ in beats()]

def setup(i):
    import scenes
    dur = durations()[i]
    sc = scenes.build(i)
    cam = scenes.direction(i, sc, dur)
    return sc, cam, dur

def render_beat(i):
    import scenes, motion
    sc, cam, dur = setup(i)
    gen, events, n = motion.compose(sc, dur, words()[i], cam, beat=i)
    kind = scenes.transition_kind(i)
    prev = None
    if kind != "cut":
        psc, pcam, pdur = setup(i - 1)
        prev = motion.last_frame(psc, pdur, words()[i - 1], pcam, beat=i - 1)
        events.append((0.0, "whoosh" if kind != "zoom" else "riser"))
    out = os.path.join(SEG, f"B{i + 1:03d}.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k, f in enumerate(gen):
        if prev is not None and k < TRANS_N:
            f = motion.transition(kind, prev, f, (k + 1) / (TRANS_N + 1))
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    json.dump(events, open(os.path.join(SEG, f"B{i + 1:03d}.sfx.json"), "w"))
    return i, n

def sheet_frame(i):
    import motion
    try:
        sc, cam, dur = setup(i)
        a = motion.last_frame(sc, dur, words()[i], cam, beat=i)
        return Image.fromarray(a).resize((480, 270), Image.LANCZOS)
    except Exception as e:
        import traceback; print(f"B{i + 1:03d} FAILED", repr(e)); traceback.print_exc()
        return Image.new("RGB", (480, 270), (255, 0, 0))

def sheet(idx):
    with Pool(4) as pool:
        res = pool.map(sheet_frame, idx)
    per = 20
    for s in range(0, len(idx), per):
        chunk = res[s:s + per]
        sh = Image.new("RGB", (4 * 480, 5 * 270), (0, 0, 0))
        for k, im in enumerate(chunk):
            sh.paste(im, ((k % 4) * 480, (k // 4) * 270))
        sh.save(os.path.join(BUILD, f"sheet_{s // per + 1}.jpg"), quality=85)

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "sheet":
        idx = [int(a) - 1 for a in sys.argv[2:]] or list(range(len(beats())))
        sheet(idx)
    elif mode in ("beats", "all"):
        idx = [int(a) - 1 for a in sys.argv[2:]] if mode == "beats" else list(range(len(beats())))
        with Pool(4) as pool:
            for i, n in pool.imap_unordered(render_beat, idx):
                print(f"B{i + 1:03d} {n} frames", flush=True)
