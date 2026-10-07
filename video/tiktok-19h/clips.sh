#!/bin/bash
# Rushes Pexels (licence Pexels : usage commercial libre, sans attribution obligatoire)
mkdir -p clips && cd clips
get(){ curl -sL -o "$1.mp4" "https://videos.pexels.com/video-files/$2"; }
get rainwin 35099181/14869851_1440_2560_30fps.mp4
get fog     35656183/15109816_1080_1920_60fps.mp4
get phone   7942761/7942761-uhd_1440_2732_25fps.mp4
get open    16407853/16407853-uhd_1440_2560_24fps.mp4
get sign    6115073/6115073-uhd_1440_2732_25fps.mp4
get dead    7320657/7320657-hd_1080_1920_30fps.mp4
get texter  7062340/7062340-hd_1080_1920_24fps.mp4
get street  30979118/13242898_1440_2160_30fps.mp4
