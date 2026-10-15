"""Erzeugt die Erweiterungs-Icons (benötigt Pillow): python3 tools/make_icons.py"""
import math
import os

from PIL import Image, ImageDraw

SIZE = 512
OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)



def make(star, bar, prefix):
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((16, 16, SIZE - 16, SIZE - 16), radius=110, fill=(31, 36, 48, 255))
    cx, cy, r = SIZE / 2, SIZE / 2, 150
    for k in range(3):
        a = math.radians(90 + k * 60)
        dx, dy = math.cos(a) * r, math.sin(a) * r
        d.line((cx - dx, cy - dy, cx + dx, cy + dy), fill=star, width=56)
    if bar:
        d.line((96, 416, 416, 96), fill=bar, width=52)
    for s in (16, 48, 128):
        img.resize((s, s), Image.LANCZOS).save(os.path.join(OUT, f"{prefix}{s}.png"))


# Aktiv: weißer Genderstern mit grünem Durchstreich-Balken
make((240, 242, 246, 255), (78, 201, 124, 255), "icon")
# Inaktiv (auf dieser Seite ausgeschaltet): roter Stern, kein Balken
make((226, 68, 68, 255), None, "icon-off")
print("Icons geschrieben nach", os.path.abspath(OUT))
