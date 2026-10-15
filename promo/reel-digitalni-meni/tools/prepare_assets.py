"""Pretvara snimke stvarne stranice (tools/capture*.js) u resurse za video.html.

    python3 tools/prepare_assets.py <mapa-sa-snimkama>

Očekuje u mapi: strip_menu.png, strip_rez_{0,A,B,C}.png, hero.png, onama.png,
footer.png, float_social.png, rez_boxes.json, qr.json (tools/qr.js).
"""
import json
import pathlib
import sys

from PIL import Image

SHOTS = pathlib.Path(sys.argv[1])
ASSETS = pathlib.Path(__file__).resolve().parent.parent / 'assets'
W = 600  # ekran mobitela u videu je 412 px širok; 600 px ostavlja rezervu za povećanje


def resize(name, out):
    im = Image.open(SHOTS / f'{name}.png').convert('RGB')
    im = im.resize((W, round(im.size[1] * W / im.size[0])), Image.LANCZOS)
    im.save(ASSETS / f'{out}.jpg', quality=92, subsampling=0)


resize('strip_menu', 'scr_menu')
for state in '0ABC':
    resize(f'strip_rez_{state}', f'scr_rez_{state}')
for name in ('hero', 'onama', 'footer'):
    resize(name, f'scr_{name}')

# kartica jela koja "iskače" iz mobitela (Brancin sa žara), izrezana iz @3x snimke
card = {'x': 16, 'y': 1050.8, 'w': 173.4, 'h': 336.7}  # CSS px, vidi menu_cards.json
im = Image.open(SHOTS / 'strip_menu.png').convert('RGB')
crop = im.crop(tuple(round(v * 3) for v in (card['x'], card['y'], card['x'] + card['w'], card['y'] + card['h'])))
crop.resize((round(card['w'] * 2), round(card['h'] * 2)), Image.LANCZOS).save(ASSETS / 'card_brancin.jpg', quality=94, subsampling=0)

Image.open(SHOTS / 'float_social.png').resize((W, 1298), Image.LANCZOS).save(ASSETS / 'float_social.png')
Image.effect_noise((256, 256), 64).convert('L').save(ASSETS / 'grain.png')

qr = json.loads((SHOTS / 'qr.json').read_text())
rez = json.loads((SHOTS / 'rez_boxes.json').read_text())
(ASSETS / 'data.js').write_text(
    '// Generirano iz tools/capture_rezervacija.js i tools/qr.js — ne uređivati ručno.\n'
    f'window.QR_DATA = {json.dumps(qr)};\nwindow.REZ_DATA = {json.dumps(rez)};\n')
print('ok')
