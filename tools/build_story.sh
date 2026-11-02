#!/usr/bin/env bash
# device stories: 3 clips -> one take (soft 0.9 s blends hide the seams) -> scroll frames
#   desktop  assets/story/<dev>/d/f_###.webp  1440x810
#   phone    assets/story/<dev>/p/f_###.webp  centre crop 960x1080 -> 640x720 (drawn at screen width, backdrop colour above/below)
set -e
FF=/c/ffmpeg/bin/ffmpeg
cd "$(dirname "$0")"
N=240; X=0.9
one() { d=$1; c1=$2   # c1 = seconds of clip 1 to keep (pod-pen's clip 1 grows a window light after ~4.5 s)
  o2=$(python -c "print($c1-$X)"); o3=$(python -c "print($c1+7.9-2*$X)"); T=$(python -c "print($c1+2*7.9-2*$X)")
  FPS=$(python -c "print(round($N/$T,3))")
  mkdir -p tmp_story assets/story/$d/d assets/story/$d/p; rm -f assets/story/$d/d/*.webp assets/story/$d/p/*.webp
  $FF -v error -y -t $c1 -i raw/$d-1-on.mp4 -i raw/$d-2-heat.mp4 -i raw/$d-3-cloud.mp4 -filter_complex \
    "[0]settb=1/24,fps=24[a];[1]settb=1/24,fps=24[b];[2]settb=1/24,fps=24[c];[a][b]xfade=transition=fade:duration=$X:offset=$o2[ab];[ab][c]xfade=transition=fade:duration=$X:offset=$o3[o]" \
    -map "[o]" -c:v libx264 -crf 14 -pix_fmt yuv420p tmp_story/$d.mp4
  $FF -v error -y -i tmp_story/$d.mp4 -vf "fps=$FPS,scale=1440:810:flags=lanczos" -frames:v $N -c:v libwebp -quality 64 assets/story/$d/d/f_%03d.webp
  $FF -v error -y -i tmp_story/$d.mp4 -vf "fps=$FPS,crop=960:1080,scale=640:720:flags=lanczos" -frames:v $N -c:v libwebp -quality 58 assets/story/$d/p/f_%03d.webp
  echo "$d T=${T}s d=$(ls assets/story/$d/d | wc -l) $(du -sh assets/story/$d/d | cut -f1)  p=$(ls assets/story/$d/p | wc -l) $(du -sh assets/story/$d/p | cut -f1)"
}
one pod-pen 4.4 & one pod-card 7.9 & one pod-pebble 7.9 & wait
one vape-box 7.9 & one vape-tube 7.9 & wait
