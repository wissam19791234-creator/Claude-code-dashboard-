# Calcule la timeline à partir de la voix off, puis monte les rushes (24 i/s)
import json, subprocess
FPS = 24; GAP = .18
L = json.load(open('vo/lines.json'))
t = .12; TL = {}
for k, v in L.items():
    w = v['words']; end = w[-1]['t'] + w[-1]['d']
    TL[k] = {'start': t, 'end': t + end, 'words': [{'w': x['w'], 't': t + x['t'], 'e': t + x['t'] + x['d']} for x in w]}
    t += end + GAP + (.25 if k == 'l4' else 0)
END = round((TL['l6']['end'] + 1.1) * FPS) / FPS
J = TL['l4']['words']; jour = [x for x in J if x['w'] == 'Jour'][0]['t']
# (rush, début source, crop, vitesse, début en s)
SHOTS = [
 ('sign',   0.6, 'crop=1440:2560:0:86', 1, 0),
 ('phone',  3.0, 'crop=1440:2560:0:86', 1, TL['l2']['start'] - .1),
 ('street', 3.0, 'crop=1215:2160:112:0', 1, TL['l3']['start'] - .1),
 ('sign',   7.4, 'crop=1440:2560:0:86', 1.25, TL['l4']['start'] - .1),   # CLOSE → OPEN
 ('texter', 0.5, None, 1, jour - .1),
 (None,     0,   None, 1, TL['l5']['start'] - .15),                     # carton final
]
G = ("eq=contrast=1.1:saturation=0.85:gamma=0.96,colorbalance=rs=-0.05:bs=0.07:rh=0.07:bh=-0.05,"
     "curves=all='0/0.03 0.5/0.47 1/0.96',vignette=PI/4.5,noise=alls=3:allf=t,format=yuv420p")
fr = lambda s: round(s * FPS)
ins, fl, lab = [], [], []
for i, (c, ss, crop, sp, a) in enumerate(SHOTS):
    b = SHOTS[i + 1][4] if i + 1 < len(SHOTS) else END
    nf = fr(b) - fr(a)
    if c is None:
        fl.append(f"color=c=0x0b0b0e:s=1080x1920:r={FPS}:d={nf / FPS + .1},format=yuv420p,trim=end_frame={nf}[s{i}]")
    else:
        ins += ['-ss', str(ss), '-t', str(nf / FPS * sp + .5), '-i', f'clips/{c}.mp4']; k = len(ins) // 6 - 1
        ex = {'sign': 'eq=brightness=-0.04,'}.get(c, '')
        fl.append(f"[{k}:v]" + (crop + ',' if crop else '') + f"setpts=PTS/{sp},scale=1080:1920:flags=lanczos,setsar=1,fps={FPS},{ex}{G},trim=end_frame={nf},setpts=PTS-STARTPTS[s{i}]")
    lab.append(f"[s{i}]")
fl.append(''.join(lab) + f"concat=n={len(SHOTS)}:v=1:a=0[v]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[v]', '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', 'base.mp4'], check=True)
json.dump({'lines': TL, 'cuts': [fr(s[4]) / FPS for s in SHOTS], 'end': END}, open('timeline.json', 'w'), ensure_ascii=False)
print('durée', END, 'coupes', [round(fr(s[4]) / FPS, 2) for s in SHOTS])
