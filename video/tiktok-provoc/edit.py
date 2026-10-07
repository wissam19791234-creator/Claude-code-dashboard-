# Montage rythmé : chaque coupe tombe sur un temps (110 BPM), 24 i/s
import json, subprocess
B = 60 / 110; FPS = 24
fr = lambda b: round(b * B * FPS)
# (rush, début source, crop, vitesse, temps de début en battements)
SHOTS = [
 ('dead',   2.0, None,                 1, 0),
 ('sign',   0.6, 'crop=1440:2560:0:86', 1, 2),
 ('texter', 1.0, None,                 1, 3),
 ('phone',  4.0, 'crop=1440:2560:0:86', 1, 4),
 ('street', 3.0, 'crop=1215:2160:112:0', 1, 5),
 ('fog',    6.0, 'crop=600:1067:0:40', 1, 6),
 (None,     0,   None,                 1, 7),        # noir : silence avant la bascule
 ('sign',   7.6, 'crop=1440:2560:0:86', 2, 7.5),     # CLOSE → OPEN en accéléré
 ('open',   0.8, None,                 1, 10),
 (None,     0,   None,                 1, 11.5),     # carton final
]
END = 15
G = ("eq=contrast=1.12:saturation=0.85:gamma=0.95,colorbalance=rs=-0.05:bs=0.07:rh=0.07:bh=-0.05,"
     "curves=all='0/0.03 0.5/0.46 1/0.96',vignette=PI/4.5,noise=alls=4:allf=t,format=yuv420p")
ins, fl, labels = [], [], []
for i, (c, ss, crop, sp, b) in enumerate(SHOTS):
    nb = SHOTS[i + 1][4] if i + 1 < len(SHOTS) else END
    nf = fr(nb) - fr(b)
    if c is None:
        fl.append(f"color=c=black:s=1080x1920:r={FPS}:d={nf / FPS + .1},format=yuv420p,trim=end_frame={nf}[s{i}]")
    else:
        ins += ['-ss', str(ss), '-t', str(nf / FPS * sp + .5), '-i', f'clips/{c}.mp4']
        k = len(ins) // 6 - 1
        extra = {'dead': 'eq=brightness=-0.12:saturation=0.5,', 'fog': 'eq=brightness=-0.09:gamma=0.9,', 'open': 'eq=brightness=-0.07,', 'sign': 'eq=brightness=-0.05,'}.get(c, '')
        f = f"[{k}:v]" + (crop + ',' if crop else '') + f"setpts=PTS/{sp},scale=1080:1920:flags=lanczos,setsar=1,fps={FPS},{extra}{G},trim=end_frame={nf},setpts=PTS-STARTPTS[s{i}]"
        fl.append(f)
    labels.append(f"[s{i}]")
fl.append(''.join(labels) + f"concat=n={len(SHOTS)}:v=1:a=0[v]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[v]', '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', 'base.mp4'], check=True)
json.dump({'cuts': [fr(s[4]) / FPS for s in SHOTS], 'B': B, 'end': fr(END) / FPS}, open('timeline.json', 'w'))
print(fr(END), 'images')
