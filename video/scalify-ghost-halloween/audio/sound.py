# Bande-son « mignon qui fait peur » : boîte à musique, pizzicatos, thérémine, claquements de doigts (ré mineur, 112 BPM),
# qui passe en majeur quand Scalify arrive. Bruitages : souffle du fantôme, « pouf », tampon, cartes qui se retournent.
# Tout est synthétisé ici (aucune piste sous licence). Usage : python3 audio/sound.py voix.wav sortie.wav [sans-musique.wav]
import sys, json, wave, subprocess, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from instr import *   # noqa: F401,F403

VO_IN, OUT = sys.argv[1], sys.argv[2]; OUT_NM = sys.argv[3] if len(sys.argv) > 3 else None
M = json.load(open('work/montage.json'))
BPM = 112; B = 60 / BPM; BAR = 4 * B

def pizz(m, d=.32):
    x = ts(d); f = mtof(m); s = saw(osc(f, x)) * .6 + np.sin(2 * np.pi * f * x)
    k = np.exp(-x * 30); return (lpf(s, 700) * (1 - k) + lpf(s, 3200) * k) * np.exp(-x * 11) * env(x, .002)
def mbox(m, d=.9):   # boîte à musique
    x = ts(d); f = mtof(m)
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 4) + .45 * np.sin(2 * np.pi * f * 4.02 * x) * np.exp(-x * 9) + .2 * np.sin(2 * np.pi * f * 6.9 * x) * np.exp(-x * 16)) * env(x, .001)
def theremin(notes, t0, g=.12):   # [(midi, durée)] avec glissés
    tt = t0
    for i, (m, d) in enumerate(notes):
        x = ts(d); m0 = notes[i - 1][0] if i else m
        f = mtof(m0 + (m - m0) * np.clip(x / .12, 0, 1)) * (1 + .012 * np.sin(2 * np.pi * 5.6 * x) * np.clip(x / .25, 0, 1))
        s = np.sin(2 * np.pi * osc(f, x)) + .12 * np.sin(4 * np.pi * osc(f, x))
        add(mus, s * env(x, .03, r=.06), tt, g, -.2); tt += d
def snap():
    x = ts(.06); return (hpf(rng.standard_normal(len(x)), 1800) * np.exp(-x * 90) + np.sin(2 * np.pi * 2300 * x) * np.exp(-x * 120) * .3)
def boo(t0, g=.5):   # « bouh » du fantôme
    x = ts(.7); f = 330 * (180 / 330) ** (x / .7)
    s = np.sin(2 * np.pi * osc(f, x)) * .7 + bp(rng.standard_normal(len(x)), 300, 1100) * .25
    add(sfx, s * np.sin(np.pi * x / .7) ** .8 * (1 + .2 * np.sin(2 * np.pi * 7 * x)), t0, g, .1)
def hoo(t0, g=.35):   # souffle du fantôme qui passe
    x = ts(.55); f = 760 * (360 / 760) ** (x / .55)
    s = np.sin(2 * np.pi * osc(f * (1 + .02 * np.sin(2 * np.pi * 9 * x)), x))
    add(sfx, s * np.sin(np.pi * x / .55) ** 1.4, t0, g, 0)
def poof(t0, g=.5):
    x = ts(.45); s = lpf(rng.standard_normal(len(x)), 1800) * np.exp(-x * 9) + lpf(rng.standard_normal(len(x)), 500) * np.exp(-x * 5) * .6
    add(sfx, s, t0, g, 0)
def flick():
    x = ts(.12); return bp(rng.standard_normal(len(x)), 1500, 7000) * np.exp(-x * 45)
def drip():
    x = ts(.3); f = 400 + 900 * np.exp(-x * 25); return np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 12) * env(x, .001)
def impact(g=1.0, d=1.6):
    x = ts(d); f = 60 + 110 * np.exp(-x * 11)
    return (np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 3) + lpf(rng.standard_normal(len(x)), 2000) * np.exp(-x * 7) * .4) * g
def ding2(m):
    return bell(m, .8, .3) * .8

MIN = [(50, [62, 65, 69]), (46, [62, 65, 70]), (43, [62, 67, 70]), (45, [61, 64, 69])]   # ré m – si♭ – sol m – la
MAJ = [(50, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (43, [62, 67, 71])]   # ré – la – si m – sol
MEL_MIN = [74, 77, 81, 79, 77, 76, 74, 73]
MEL_MAJ = [74, 78, 81, 83, 81, 78, 76, 74]
def groove(t0, t1, prog, mel, level=1.0, kick_on=True, melody=True):
    t = t0; bar = 0
    while t < t1 - 1e-6:
        root, ch = prog[bar % 4]
        for e in range(8):
            te = t + e * B / 2
            if te >= t1: break
            add(mus, pizz(root - 12 + (7 if e % 4 == 2 else 0) + (12 if e == 6 else 0), .3), te, .26 * level, -.15)
            if e % 2 == 1: add(mus, hat(), te, .05 * level, .3)
        for b in range(4):
            tb = t + b * B
            if tb >= t1: break
            if kick_on and b in (0, 2): add(mus, kick(.7), tb, .42 * level)
            if b in (1, 3): add(mus, snap(), tb, .34 * level, .2); add(mus, clap(), tb, .08 * level, -.1)
        for k, m in enumerate(ch): add(mus, pad([m], BAR * .98, 1600, .05, .25), t, .05 * level, -.3 + k * .3)
        if melody:
            for j in range(4):
                tj = t + j * B
                if tj < t1: add(mus, mbox(mel[(bar * 4 + j) % 8] + 12, .8), tj, .075 * level, .35)
        bar += 1; t += BAR

C = M['cards']; W_ = M['words']; Lw = lambda li: [w for w in W_ if w[3] == li]
# ---- accroche
boo(0.0, .45)
theremin([(74, .45), (81, .55), (77, .5), (74, .9)], .1, .09)
for k in range(4): add(mus, mbox([74, 77, 81, 86][k] + 12, .9), .05 + k * B / 2, .07, .3)
for b in range(5): add(mus, snap(), .55 + b * B, .3, .2)
gt = Lw(0)[6][1]
add(sfx, impact(.9, 1.4), gt, .5); add(sfx, drip(), gt + .12, .35); add(sfx, drip(), gt + .3, .25)
add(sfx, whoosh(.3, 2500, 400, 1.0), 2.42, .25)
# ---- les quatre trucs
groove(2.72, 14.75, MIN, MEL_MIN, 1.0)
for i, c in enumerate(C):
    add(sfx, swish(), c['in'] - .02, .3)
    add(sfx, pop(1300 + i * 120, 1.0), c['num'], .22)
    add(sfx, whoosh(.25, 600, 5000, 1.0), c['swoop'] - .25, .25)
    hoo(c['swoop'] - .02, .32); poof(c['swoop'] + .2, .45); add(sfx, stamp(), c['swoop'] + .24, .5)
    add(sfx, whoosh(.35, 3000, 700, 1.0), c['tray'], .16); add(sfx, pop(1800, 1.0), c['tray'] + .42, .12)
# ---- retournement : passage en majeur
tw = M['twist']
add(mus, pad([62, 66, 69, 74], 2.0, 2400, .05, .6), tw, .2)
for k, m in enumerate([74, 78, 81, 86, 90]): add(mus, mbox(m, 1.2), tw + .05 + k * .07, .09, -.4 + k * .2)
sparkle(tw + .1, .14); add(sfx, impact(.6, 1.2), tw + .1, .35)
theremin([(81, .3), (86, .7)], tw + 1.0, .06)
groove(M['proof'], M['cta'] + .05, MAJ, MEL_MAJ, .95)
add(sfx, swish(), M['proof'], .3)
add(sfx, impact(.9, 1.5), M['t200'] - .02, .55); add(sfx, ching(), M['t200'] + .02, .16)
for i, f in enumerate(M['flips']): add(sfx, flick(), f, .35); add(sfx, ding2(84 + [0, 4, 7, 12][i]), f + .12, .2)
# ---- appel à l'action
groove(M['cta'], M['end'] - 1.0, MAJ, MEL_MAJ, .9)
add(sfx, whoosh(.4, 500, 6000, 1.0), M['cta'] - .1, .25)
add(sfx, impact(.8, 1.3), Lw(9)[1][1], .4); add(sfx, pop(1500, 1.0), Lw(9)[1][1] + .05, .2)
add(sfx, whoosh(.22, 1500, 7000, 1.0), Lw(9)[4][1] + .05, .25); add(sfx, pop(1700, 1.0), Lw(9)[4][1] + .12, .2)
add(sfx, ding2(88), Lw(10)[0][1] - .02, .28)
E = M['end'] - 1.0
for k, m in enumerate([62, 66, 69, 74, 78]): add(mus, mbox(m + 12, 1.2), E + k * .06, .09, -.4 + k * .2)
add(mus, pad([50, 62, 66, 69], 1.2, 1800, .02, .8), E, .2); add(sfx, impact(.6, 1.0), E, .3)

# ---- voix + mixage (la musique s'efface sous la voix)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VO_IN, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; vo[:min(N, len(v))] = v[:N]
e = np.convolve(np.abs(vo), np.ones(2400) / 2400, 'same'); e = np.convolve((e > .01).astype(float), np.ones(9600) / 9600, 'same')
duck = 1 - .55 * np.clip(e * 1.4, 0, 1); sduck = 1 - .3 * np.clip(e * 1.4, 0, 1)
fade = np.clip((DUR - np.arange(N) / SR) / .8, 0, 1)
def write(path, with_music):
    out = (reverb(mus, 1.0, .14) * duck[:, None] * .95 if with_music else 0) + reverb(sfx, .8, .1) * sduck[:, None] * .7 + np.stack([vo, vo], 1) * 1.7
    out = out * fade[:, None]; out = np.tanh(out * 1.1) / np.tanh(1.1)
    with wave.open(path, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(out / max(1e-6, np.abs(out).max()) * .95, -1, 1) * 32767).astype(np.int16).tobytes())
write(OUT, True)
if OUT_NM: write(OUT_NM, False)
print('mix', OUT, f'{DUR:.2f} s')
