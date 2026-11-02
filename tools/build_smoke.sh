#!/usr/bin/env bash
# smoke intro, cleaned up: deband + light denoise + lanczos upscale + soft sharpen + fine grain (hides Veo's blocks)
set -e
FF=/c/ffmpeg/bin/ffmpeg
cd "$(dirname "$0")"
CLEAN="hqdn3d=1.2:1.2:3:3,deband=1thr=0.02:2thr=0.02:3thr=0.02:range=20:blur=1"
X="-c:v libx264 -preset slower -tune film -pix_fmt yuv420p -movflags +faststart -an -x264-params aq-mode=3"
for n in intro-in intro-out; do
  # desktop: 2560x1440
  $FF -v error -y -i raw/$n.mp4 -vf "$CLEAN,scale=2560:1440:flags=lanczos,unsharp=5:5:0.5:5:5:0" $X -crf 22 assets/hd/$n-2k.mp4 &
  # phones: the centre 608x1080 of the frame (what a portrait screen shows), at 1080x1920 so it's drawn 1:1
  $FF -v error -y -i raw/$n.mp4 -vf "crop=608:1080,$CLEAN,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6:5:5:0" $X -crf 23 assets/vid/$n-portrait.mp4 &
done
wait
$FF -v error -y -i assets/hd/intro-out-2k.mp4 -frames:v 1 -c:v libwebp -quality 88 assets/hd/intro-hold-2k.webp
$FF -v error -y -i assets/vid/intro-out-portrait.mp4 -frames:v 1 -c:v libwebp -quality 85 assets/img/intro-hold-portrait.webp
ls -la assets/hd/intro-*-2k.* assets/vid/intro-*-portrait.mp4 assets/img/intro-hold-portrait.webp
