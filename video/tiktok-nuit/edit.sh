#!/bin/bash
# Montage des rushes Pexels : coupe, recadrage 9:16, étalonnage ciné commun, 24 i/s
G="eq=contrast=1.07:saturation=0.8:gamma=0.96,colorbalance=rs=-0.05:gs=-0.01:bs=0.07:rh=0.06:gh=0.01:bh=-0.05,curves=all='0/0.035 0.5/0.47 1/0.95',vignette=PI/4.5,noise=alls=4:allf=t,format=yuv420p"
S="scale=1080:1920:flags=lanczos,setsar=1,fps=24"
ffmpeg -v error -y \
 -ss 1.0 -t 2.0  -i clips/rainwin.mp4 \
 -ss 6.0 -t 1.75 -i clips/fog.mp4 \
 -ss 4.0 -t 1.75 -i clips/phone.mp4 \
 -ss 0.8 -t 2.0  -i clips/open.mp4 \
 -filter_complex "
 [0:v]$S,$G,trim=end_frame=48,setpts=PTS-STARTPTS[a];
 [1:v]crop=600:1067:0:40,$S,eq=brightness=-0.09:gamma=0.9,$G,trim=end_frame=42,setpts=PTS-STARTPTS[b];
 [2:v]crop=1440:2560:0:86,$S,$G,trim=end_frame=42,setpts=PTS-STARTPTS[c];
 [3:v]$S,eq=brightness=-0.07,$G,trim=end_frame=48,setpts=PTS-STARTPTS,fade=t=out:st=1.6:d=0.4[d];
 color=c=black:s=1080x1920:r=24:d=2.5,format=yuv420p[e];
 [a][b][c][d][e]concat=n=5:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 12 -preset slow base.mp4
ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 base.mp4
