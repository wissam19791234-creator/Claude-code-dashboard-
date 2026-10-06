# Monte la base vidéo (vraies vidéos verticales) avec ffmpeg : coupes sur le beat, étalonnage, zooms « punch »
import subprocess
FPS = 30
BEFORE = "eq=saturation=0.38:contrast=1.08:brightness=-0.05,colorbalance=bs=0.06:bm=0.04:rs=-0.03"
AFTER = "eq=saturation=1.22:contrast=1.06:brightness=0.01,colorbalance=rm=0.04:rh=0.03:bm=-0.04"
PUSH = "z='min(1+on*0.0018,1.08)'"
PUNCH = "z='if(lte(on,0),1.16,max(1.0,zoom-0.028))'"
# (clip, début dans le clip, durée, étalonnage, zoom, extra)
SEG = [
  ("rain", 6, 2.0, BEFORE, PUSH, ""),
  ("phonecafe", 3, 1.5, BEFORE, PUNCH, ""),
  ("serving", .3, 1.5, BEFORE, PUNCH, ""),
  ("pizza", .3, 1.5, BEFORE, PUNCH, ""),
  ("rain", 12, 1.0, BEFORE, PUSH, ",rgbashift=rh=-16:bh=16:gv=5:enable='gte(t,0.4)',noise=alls=18:allf=t:enable='gte(t,0.4)'"),
]
for clip, ss in [("latte", 4), ("barber", 2.5), ("florist", 4), ("pasta", 3), ("menuboard", 2), ("bread", 1),
                 ("pizza", 6), ("latte", 9), ("barber", 5), ("florist", 7), ("pasta", 7.5), ("menuboard", 6.5)]:
    SEG.append((clip, ss, .5, AFTER, PUNCH, ""))
SEG.append(("serving", 4.5, 4.0, AFTER, PUSH, ",boxblur=22:2:enable='gte(t,1.5)',eq=brightness=-0.22:saturation=0.8:enable='gte(t,1.5)'"))
inputs, chains = [], []
for i, (c, ss, d, g, z, extra) in enumerate(SEG):
    inputs += ["-ss", str(ss), "-t", str(d + .2), "-i", f"clips/{c}.mp4"]
    n = round(d * FPS)
    chains.append(f"[{i}:v]fps={FPS},scale=1440:2560:force_original_aspect_ratio=increase:flags=lanczos,crop=1440:2560,setsar=1,"
                  f"zoompan={z}:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps={FPS},trim=end_frame={n},setpts=PTS-STARTPTS,"
                  f"{g}{extra},vignette=PI/5[v{i}]")
graph = ";".join(chains) + ";" + "".join(f"[v{i}]" for i in range(len(SEG))) + f"concat=n={len(SEG)}:v=1:a=0,format=yuv420p[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[out]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-r", str(FPS), "base.mp4"], check=True)
print("total", sum(s[2] for s in SEG))
