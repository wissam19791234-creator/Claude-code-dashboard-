#!/bin/bash
# Télécharge les vidéos verticales Pexels utilisées (licence Pexels : usage commercial libre)
mkdir -p clips && cd clips
get(){ curl -sL -o "$1.mp4" "https://videos.pexels.com/video-files/$2"; }
get latte     34601858/14664330_1440_2560_30fps.mp4
get barber    7697084/7697084-hd_1080_1920_30fps.mp4
get florist   6912181/6912181-uhd_1440_2560_24fps.mp4
get bread     5757797/5757797-uhd_1440_2560_30fps.mp4
get pasta     6221653/6221653-uhd_1440_2560_24fps.mp4
get rain      20351897/20351897-hd_1080_1920_30fps.mp4
get menuboard 13736678/13736678-uhd_1440_2560_24fps.mp4
get pizza     6603836/6603836-uhd_1440_2560_25fps.mp4
get phonecafe 17512949/17512949-uhd_1440_2560_25fps.mp4
get serving   13736705/13736705-uhd_1440_2560_24fps.mp4
