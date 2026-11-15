# merge owned files from sandboxes into src/videos/rome (backup first). usage: python3 scripts/merge.py cam,char,world
import shutil, sys, time, os
OWN = {"cam": ["story.ts"], "char": ["toon.ts", "cast.ts"], "world": ["sets.ts", "world.ts", "build.ts", "paint.ts", "lights.ts", "shade.ts", "grade.ts"]}
bk = f"backup/rome_{time.strftime('%H%M%S')}"; shutil.copytree("src/videos/rome", bk)
for n in sys.argv[1].split(","):
    for f in OWN[n]: shutil.copy(f"src/videos/rome_{n}/{f}", f"src/videos/rome/{f}"); print("merged", n, f)
print("backup", bk)
