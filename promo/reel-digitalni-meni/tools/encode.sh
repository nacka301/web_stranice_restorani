#!/usr/bin/env bash
# Kodira PNG sličice (tools/render.js) + zvuk (tools/sound.py) u finalne MP4 datoteke.
#   tools/encode.sh <mapa-sa-sličicama> <audio.wav> <izlazna-mapa>
set -euo pipefail
FRAMES="$1"; AUDIO="$2"; OUT="$3"
mkdir -p "$OUT"
VF="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
X264=(-c:v libx264 -preset slow -crf 16 -maxrate 24M -bufsize 48M -profile:v high -level:v 4.2
      -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv
      -movflags +faststart)

# glavna verzija: 1080x1920, 60 fps, sa zvukom (glasnoća -14 LUFS, standard društvenih mreža)
ffmpeg -y -v error -framerate 60 -i "$FRAMES/f_%05d.png" -i "$AUDIO" -vf "$VF" "${X264[@]}" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 192k -shortest \
  "$OUT/vpsolutions-reel-20s.mp4"

# bez zvuka (za dodavanje vlastite / trending glazbe u aplikaciji)
ffmpeg -y -v error -framerate 60 -i "$FRAMES/f_%05d.png" -vf "$VF" "${X264[@]}" -an \
  "$OUT/vpsolutions-reel-20s-bez-zvuka.mp4"

# naslovnica (cover) za Reels/TikTok: kadar s hook porukom
ffmpeg -y -v error -i "$FRAMES/f_00066.png" -q:v 2 "$OUT/naslovnica.jpg"
ls -la "$OUT"
