"""Render beats to video segments, or a contact sheet of final frames.

python3 render.py sheet            # final frame of every beat -> build/sheet_*.jpg
python3 render.py beats 1 5 9      # render selected beats (1-based) to build/seg
python3 render.py all              # render every beat in parallel
"""
import sys, os, json, subprocess
from multiprocessing import Pool
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import scenes

BUILD = os.path.join(ROOT, "build")
SEG = os.path.join(BUILD, "seg")
os.makedirs(SEG, exist_ok=True)

def beats():
    return json.load(open(os.path.join(ROOT, "narration", "beats.json")))

def durations():
    p = os.path.join(BUILD, "durations.json")
    if os.path.exists(p):
        return json.load(open(p))
    return [round(len(b["text"].split()) / 2.5, 2) for b in beats()]

def render_beat(i):
    dur = durations()[i]
    sc = scenes.build(i)
    frames, events = render_scene(sc, dur)
    out = os.path.join(SEG, f"B{i + 1:03d}.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k, f in enumerate(frames):
        p.stdin.write(finalize(f, k).tobytes())
    p.stdin.close()
    p.wait()
    json.dump(events, open(os.path.join(SEG, f"B{i + 1:03d}.sfx.json"), "w"))
    return i, len(frames)

def final_frame(i):
    dur = durations()[i]
    try:
        sc = scenes.build(i)
        frames, _ = render_scene(sc, dur)
    except Exception as e:
        import traceback; print(f"B{i+1:03d} FAILED", repr(e)); traceback.print_exc()
        z = Image.new("RGB", (480, 270), (255, 0, 0)); return z, z
    return frames[-1].resize((480, 270), Image.LANCZOS), frames[len(frames) // 4].resize((480, 270), Image.LANCZOS)

def sheet(idx):
    with Pool(4) as pool:
        res = pool.map(final_frame, idx)
    per = 20
    for s in range(0, len(idx), per):
        chunk = res[s:s + per]
        sh = Image.new("RGB", (4 * 480, 5 * 270), (0, 0, 0))
        for k, (fin, _) in enumerate(chunk):
            sh.paste(fin, ((k % 4) * 480, (k // 4) * 270))
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
