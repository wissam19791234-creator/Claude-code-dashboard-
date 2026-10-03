#!/bin/bash
# Assemble images + voix + musique + bruitages — réglages compatibles mobile / TikTok
set -e
V="-vf hqdn3d=2:1.5:4:3 -c:v libx264 -preset slow -crf 20 -maxrate 6M -bufsize 6M -profile:v high -level:v 4.1 -pix_fmt yuv420p -r 30 -g 30 -keyint_min 30 -sc_threshold 0 -bf 2 -movflags +faststart"
A="-c:a aac -b:a 192k -ar 48000 -ac 2"
MIX="[1:a]adelay=100|100,volume=1.7,apad,asplit=2[vo][vk];[2:a]volume=0.20[m];[3:a]volume=0.55[s];[m][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[md];[md][vo][s]amix=inputs=3:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:27.6[a]"
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i vo.mp3 -i music.wav -i sfx.wav -filter_complex "$MIX" -map 0:v -map "[a]" $V $A -t 27.6 scalify-tiktok-14-outils.mp4
MIX2="[1:a]volume=0.55,loudnorm=I=-16:TP=-1.5,atrim=0:27.6[a]"
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i sfx.wav -filter_complex "$MIX2" -map 0:v -map "[a]" $V $A -t 27.6 scalify-tiktok-14-outils-sans-voix.mp4
