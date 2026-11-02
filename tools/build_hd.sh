#!/usr/bin/env bash
# desktop-only HD set: 1080p detail loops, full-res 864x1080 card loops, sharper stills
set -e
FF=/c/ffmpeg/bin/ffmpeg
cd "$(dirname "$0")"
mkdir -p assets/hd
X264="-c:v libx264 -preset slow -tune film -pix_fmt yuv420p -movflags +faststart -an"
for s in raw/*.jpg; do
  n=$(basename "$s" .jpg)
  $FF -v error -y -i "$s" -vf "scale=-2:1080:flags=lanczos,crop=864:1080" -c:v libwebp -quality 90 "assets/hd/$n-card.webp"
  $FF -v error -y -i "$s" -vf "scale=1920:-2:flags=lanczos" -c:v libwebp -quality 90 "assets/hd/$n-wide.webp"
done
enc() { v=$1; n=$(basename "$v" .mp4)
  $FF -v error -y -i "$v" -filter_complex "[0]crop=864:1080,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]" -map "[o]" $X264 -crf 21 "assets/hd/$n-card.mp4"
  $FF -v error -y -i "$v" -filter_complex "[0]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]" -map "[o]" $X264 -crf 18 -maxrate 14M -bufsize 28M "assets/hd/$n-wide.mp4"
  echo "$n ok"; }
for v in raw/*.mp4; do [ "$(basename $v)" = intro.mp4 ] && continue; enc "$v" & 
  while [ $(jobs -r | wc -l) -ge 3 ]; do wait -n; done; done
wait
$FF -v error -y -i raw/intro.mp4 $X264 -crf 20 assets/hd/intro.mp4
du -sh assets/hd
