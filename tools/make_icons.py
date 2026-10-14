"""Erzeugt die Erweiterungs-Icons (benötigt Pillow): python3 tools/make_icons.py"""
import math
import os

from PIL import Image, ImageDraw

SIZE = 512
OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rounded_rectangle((16, 16, SIZE - 16, SIZE - 16), radius=110, fill=(31, 36, 48, 255))

# Genderstern in Weiß
cx, cy, r = SIZE / 2, SIZE / 2, 150
for k in range(3):
    a = math.radians(90 + k * 60)
    dx, dy = math.cos(a) * r, math.sin(a) * r
    d.line((cx - dx, cy - dy, cx + dx, cy + dy), fill=(240, 242, 246, 255), width=56)

# Grüner Durchstreich-Balken
d.line((96, 416, 416, 96), fill=(78, 201, 124, 255), width=52)

for s in (16, 48, 128):
    img.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, f"icon{s}.png"))
print("Icons geschrieben nach", os.path.abspath(OUT))
