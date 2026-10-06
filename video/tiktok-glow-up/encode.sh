#!/bin/bash
# Base vidéo + calque transparent + beat -> MP4 compatible TikTok / mobile
set -e
ffmpeg -v error -y -i base.mp4 -framerate 30 -i ov/f%04d.png -i beat.wav \
  -filter_complex "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.2:LRA=9[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 17 -maxrate 12M -bufsize 12M -profile:v high -level:v 4.1 \
  -pix_fmt yuv420p -r 30 -g 30 -keyint_min 30 -bf 2 -movflags +faststart -c:a aac -b:a 192k -ar 48000 -ac 2 -t 17.5 scalify-glow-up.mp4
