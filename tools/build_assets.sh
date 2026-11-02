#!/usr/bin/env bash
# raw/ (16:9 stills 2752x1536, Veo clips 1920x1080 8s) -> assets/
set -e
FF=/c/ffmpeg/bin/ffmpeg
cd "$(dirname "$0")"
mkdir -p assets/img assets/vid
X264="-c:v libx264 -preset slow -pix_fmt yuv420p -movflags +faststart -an"
for s in raw/*.jpg; do
  n=$(basename "$s" .jpg)
  $FF -v error -y -i "$s" -vf "scale=-2:1080,crop=864:1080,scale=560:700" -c:v libwebp -quality 80 "assets/img/$n-card.webp"
  $FF -v error -y -i "$s" -vf "scale=1600:-2" -c:v libwebp -quality 76 "assets/img/$n-wide.webp"
done
for v in raw/*.mp4; do
  n=$(basename "$v" .mp4)
  if [ "$n" = intro ]; then
    $FF -v error -y -i "$v" -vf "scale=1280:720" $X264 -crf 27 assets/vid/intro.mp4
    $FF -v error -y -i "$v" -vf "scale=1280:720" -frames:v 1 -c:v libwebp -quality 70 assets/img/intro.webp
    continue
  fi
  # forward + reverse = seamless loop
  $FF -v error -y -i "$v" -filter_complex "[0]crop=864:1080,scale=480:600,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]" -map "[o]" $X264 -crf 29 "assets/vid/$n-card.mp4"
  $FF -v error -y -i "$v" -filter_complex "[0]scale=1280:720,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]" -map "[o]" $X264 -crf 26 "assets/vid/$n-wide.mp4"
  echo "$n ok"
done
du -sh assets/img assets/vid
