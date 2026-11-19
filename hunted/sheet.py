import json, sys
from PIL import Image, ImageDraw
L = json.load(open('/tmp/sheet/list.json')); cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4
w, h = 400, 225; rows = (len(L) + cols - 1)//cols
S = Image.new('RGB', (w*cols, (h+18)*rows), 'white'); d = ImageDraw.Draw(S)
for i, (f, lab) in enumerate(L):
    x, y = (i % cols)*w, (i//cols)*(h+18); S.paste(Image.open(f).resize((w, h)), (x, y+18)); d.text((x+4, y+3), lab, fill='black')
S.save(sys.argv[1], quality=88)
