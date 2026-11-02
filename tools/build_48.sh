#!/usr/bin/env bash
# desktop-only smooth set: every source motion-interpolated 24 -> 48 fps once (raw48/), then
#   hd/<id>-wide.mp4   1920x1080 48 fps ping-pong loop, crf 17
#   hd/<id>-card.mp4   600x750  48 fps ping-pong loop (board tiles + finder), crf 19
#   hd/intro-*-2k.mp4  2560x1440 48 fps cleaned smoke
#   story/<dev>/d2/    720 frames 1920x1080 from the 48 fps joined take
set -e
FF=/c/ffmpeg/bin/ffmpeg
cd "$(dirname "$0")"
MI="minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
X="-c:v libx264 -preset slow -tune film -pix_fmt yuv420p -movflags +faststart -an"
mkdir -p raw48
interp() { [ -s "raw48/$2.mp4" ] || $FF -v error -y -i "$1" -vf "$MI" -c:v libx264 -crf 12 -preset fast -pix_fmt yuv420p -an "raw48/$2.mp4"; echo "interp $2"; }
jobs_wait() { while [ $(jobs -r | wc -l) -ge 10 ]; do wait -n; done; }
for v in raw/salt-*.mp4 raw/pod-pen.mp4 raw/pod-card.mp4 raw/pod-pebble.mp4 raw/vape-box.mp4 raw/vape-tube.mp4 raw/intro-in.mp4 raw/intro-out.mp4; do
  interp "$v" "$(basename "$v" .mp4)" & jobs_wait; done
for d in pod-pen pod-card pod-pebble vape-box vape-tube; do interp "tmp_story/$d.mp4" "story-$d" & jobs_wait; done
wait
for v in raw48/salt-*.mp4 raw48/pod-*.mp4 raw48/vape-*.mp4; do n=$(basename "$v" .mp4); case $n in story-*) continue;; esac
  ( $FF -v error -y -i "$v" -filter_complex "[0]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]" -map "[o]" $X -crf 17 "assets/hd/$n-wide.mp4"
    $FF -v error -y -i "$v" -filter_complex "[0]crop=864:1080,scale=600:750:flags=lanczos,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]" -map "[o]" $X -crf 19 "assets/hd/$n-card.mp4"
    echo "loops $n" ) & jobs_wait
done
CLEAN="hqdn3d=1.2:1.2:3:3,deband=1thr=0.02:2thr=0.02:3thr=0.02:range=20:blur=1"
for n in intro-in intro-out; do
  $FF -v error -y -i raw48/$n.mp4 -vf "$CLEAN,scale=2560:1440:flags=lanczos,unsharp=5:5:0.5:5:5:0" $X -crf 22 assets/hd/$n-2k.mp4 & jobs_wait
done
for d in pod-pen pod-card pod-pebble vape-box vape-tube; do
  ( mkdir -p assets/story/$d/d2; rm -f assets/story/$d/d2/*.webp
    T=$(/c/ffmpeg/bin/ffprobe -v error -show_entries format=duration -of csv=p=0 raw48/story-$d.mp4)
    $FF -v error -y -i raw48/story-$d.mp4 -vf "fps=$(python -c "print(round(720/$T,4))")" -frames:v 720 -c:v libwebp -quality 76 assets/story/$d/d2/f_%03d.webp
    echo "story $d $(ls assets/story/$d/d2 | wc -l) $(du -sh assets/story/$d/d2 | cut -f1)" ) & jobs_wait
done
wait
du -sh assets/hd assets/story
