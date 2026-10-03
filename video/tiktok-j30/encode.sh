#!/bin/bash
# Assemble images + voix + musique + bruitages
set -e
MIX="[1:a]adelay=100|100,volume=1.7,apad,asplit=2[vo][vk];[2:a]volume=0.20[m];[3:a]volume=0.55[s];[m][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[md];[md][vo][s]amix=inputs=3:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:21[a]"
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i vo.mp3 -i music.wav -i sfx.wav -filter_complex "$MIX" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 21 -maxrate 10M -bufsize 20M -pix_fmt yuv420p -profile:v high -r 30 \
  -c:a aac -b:a 192k -ar 44100 -movflags +faststart -t 21 scalify-tiktok-j30.mp4
MIX2="[1:a]volume=0.55[s];[2:a]volume=0.0[z];[s][z]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5,atrim=0:21[a]"
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i sfx.wav -i sfx.wav -filter_complex "$MIX2" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 21 -maxrate 10M -bufsize 20M -pix_fmt yuv420p -profile:v high -r 30 \
  -c:a aac -b:a 192k -ar 44100 -movflags +faststart -t 21 scalify-tiktok-j30-sans-voix.mp4
