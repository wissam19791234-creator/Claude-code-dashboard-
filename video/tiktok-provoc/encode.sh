#!/bin/bash
# Composition finale : rushes étalonnés + titres (calque alpha) + son, encodage compatible mobile
ffmpeg -v error -y -i base.mp4 -framerate 24 -i ov/f%04d.png -i sound.wav -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 15 -profile:v high -level:v 4.1 -g 24 -keyint_min 24 -maxrate 12M -bufsize 24M \
 -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -shortest scalify-provoc.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 scalify-provoc.mp4
