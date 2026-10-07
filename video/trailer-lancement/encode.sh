#!/bin/bash
# Encodage : 16:9 (YouTube, LinkedIn, X, site) et 9:16 (TikTok, Reels, Shorts)
enc(){ ffmpeg -v error -y -framerate 30 -i "$1/f%04d.jpg" -i sound.wav \
  -filter_complex "[0:v]format=yuv420p[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" -map "[v]" -map "[a]" \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level:v 4.2 -g 30 -keyint_min 30 -maxrate 14M -bufsize 28M -tune film \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -movflags +faststart -shortest "$2"; ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$2"; }
enc frames scalify-trailer-16x9.mp4
[ -d framesv ] && enc framesv scalify-trailer-9x16.mp4
