#!/bin/bash
set -e
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i sound.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.2:LRA=9[a]" -map 0:v -map "[a]" \
  -c:v libx264 -preset slow -crf 16 -maxrate 10M -bufsize 10M -profile:v high -level:v 4.1 -pix_fmt yuv420p -r 30 -g 30 -keyint_min 30 -bf 2 \
  -movflags +faststart -c:a aac -b:a 192k -ar 48000 -ac 2 -t 20 scalify-pov-21h30.mp4
