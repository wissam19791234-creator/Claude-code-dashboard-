#!/bin/bash
# Assemble images + voix + musique + bruitages — réglages compatibles mobile / TikTok
set -e
V="-vf hqdn3d=2:1.5:4:3 -c:v libx264 -preset slow -crf 20 -maxrate 6M -bufsize 6M -profile:v high -level:v 4.1 -pix_fmt yuv420p -r 30 -g 30 -keyint_min 30 -sc_threshold 0 -bf 2 -movflags +faststart"
A="-c:a aac -b:a 192k -ar 48000 -ac 2"
MIX="[1:a]volume=1.9,aformat=channel_layouts=stereo,asplit=2[vo][vk];[2:a]volume=0.55[m];[3:a]volume=0.75[s];[m][vk]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=350[md];[md][vo][s]amix=inputs=3:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:36.77[a]"
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i vo_track.wav -i music.wav -i sfx.wav -filter_complex "$MIX" -map 0:v -map "[a]" $V $A -t 36.77 scalify-bande-annonce.mp4
