# Reel: digitalni meni + online naručivanje (VP Solutions)

Vertikalni video 1080×1920, 20 s, 60 fps, za Instagram Reels, TikTok i Facebook.

| Datoteka | Što je |
|---|---|
| `out/vpsolutions-reel-20s.mp4` | Glavna verzija, sa zvukom (efekti + podloga, −14 LUFS) |
| `out/vpsolutions-reel-20s-bez-zvuka.mp4` | Ista slika bez zvuka, za dodavanje glazbe u aplikaciji |
| `out/naslovnica.jpg` | Prijedlog naslovne sličice (kadar s hookom) |

## Scenarij

| Vrijeme | Sadržaj |
|---|---|
| 0–2 s | Hook „Gosti čekaju konobara. I odlaze.” (zvono koje nitko ne čuje, „I odlaze.” doslovno odlazi iz kadra), zatim logo vpsolutions |
| 2–4,5 s | „Digitalni meni i rezerviranje stolova za tvoj restoran — pod tvojim imenom.” preko fotografije sa stranice |
| 4,5–7,5 s | 01 QR za stolom: pravi QR kod (vodi na demo) se skenira, mobitel otvara jelovnik |
| 7,5–10,5 s | 02 Digitalni meni: listanje stvarnog jelovnika, kartica jela iskače iz ekrana |
| 10,5–13,5 s | 03 Naručivanje online: stvarni tijek na stranici (datum → termin → stol) |
| 13,5–16,5 s | 04 Tvoj brend, bez provizije: tri ekrana stranice „Konoba Maslina” + pečat „0 %” |
| 16,5–18,5 s | Prvi mjesec BESPLATNO · Bez provizije po narudžbi · Gotovo za par dana |
| 18,5–20 s | Logo, „Zatraži besplatan primjer”, vpsolution.vercel.app |

Sav tekst i ključni vizuali su unutar sigurne zone (bez gornjih 15 % i donjih 20 %).
`video.html?safe=1` prikazuje granice.

## Odakle su ekrani

Ekrani na mobitelima su stvarne snimke demo stranice (ovaj repozitorij, isti kod
kao na https://stranice-restorani.vercel.app/), snimljene u Chromiumu na veličini
iPhonea (390×844 @3x). Nema izmišljenih ekrana. Prije snimanja zamijenjen je samo
font kojim se crta: Georgia → Gelasio (metrički kompatibilan), sistemski sans → Inter
(najbliži SF Pro-u koji vide korisnici iPhonea). Boje, raspored i sadržaj su sa stranice.

## Ponovno renderiranje

Bez Remotiona i sličnih alata: `video.html` je obična stranica s determinističkom
funkcijom `renderAt(t)`. Playwright snima sličicu po sličicu, ffmpeg kodira.

```bash
npm install                                   # playwright + qrcode
python3 -m http.server 8765 --bind 127.0.0.1  # iz korijena repozitorija (demo stranica)

# 1) snimke stvarne stranice -> resursi (potrebno samo ako se stranica promijeni)
node tools/capture.js shots && node tools/capture_rezervacija.js shots
node tools/qr.js > shots/qr.json
python3 tools/prepare_assets.py shots

# 2) slika + zvuk -> MP4
node tools/render.js --frames frames --fps 60 --workers 4   # ~3,5 min, ~3 GB PNG-ova
python3 tools/sound.py out/audio.wav                        # treba numpy + scipy
tools/encode.sh frames out/audio.wav out
```

Pojedinačni kadrovi za provjeru: `node tools/render.js --stills stills --at 1,6.5,15 --safe`.
Otvaranjem `video.html` u pregledniku animacija se vrti u realnom vremenu; `?t=9.6` zamrzne kadar.
