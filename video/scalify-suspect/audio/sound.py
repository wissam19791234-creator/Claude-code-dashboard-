# Bande-son « émission d'enquête » : nappe tendue, pulsation de basse, pin-pon, hélicoptère, « DUN DUN » sur l'arrêt sur image,
# machine à écrire, feutre, tampons ; après « on l'a retrouvé », un beat plus groovy (affaire classée).
# Tout est synthétisé ici (aucune piste sous licence). Usage : python3 audio/sound.py voix.wav sortie.wav [sans-musique.wav]
import sys, json, wave, subprocess, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from instr import *   # noqa: F401,F403

VO_IN, OUT = sys.argv[1], sys.argv[2]; OUT_NM = sys.argv[3] if len(sys.argv) > 3 else None
M = json.load(open('work/montage.json')); Wd = M['words']; Lw = lambda li: [w for w in Wd if w[3] == li]
BPM = 96; B = 60 / BPM

def drone(d, m=38, cut=500):
    x = ts(d); s = np.zeros(len(x))
    for det in (-.1, 0, .1): s += saw(osc(mtof(m + det), x)) + .5 * saw(osc(mtof(m + 7 + det), x))
    return lpf(s / 4.5, cut) * np.minimum(1, x / .4) * np.clip((d - x) / .5, 0, 1)
def pulse(m, d=.18):
    x = ts(d); f = mtof(m); s = saw(osc(f, x)) * .6 + np.sin(2 * np.pi * f * x); k = np.exp(-x * 18)
    return (lpf(s, 300) * (1 - k) + lpf(s, 1400) * k) * np.exp(-x * 7) * env(x, .003)
def dundun(t0, g=.8):   # le célèbre double coup de gong grave
    for k, (f0, dt) in enumerate([(55, 0), (52, .36)]):
        x = ts(1.6); f = f0 * (1 + .6 * np.exp(-x * 30))
        s = np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 2.2) + .5 * np.sin(2 * np.pi * osc(f * 2.01, x)) * np.exp(-x * 3) + lpf(rng.standard_normal(len(x)), 3000) * np.exp(-x * 12) * .5
        add(sfx, np.tanh(s * 1.6), t0 + dt, g)
def siren(t0, d, g=.12, pan=-.3):   # deux-tons français : la / si
    x = ts(d); f = np.where((x // .45) % 2 == 0, 435.0, 488.0)
    s = np.tanh(np.sin(2 * np.pi * osc(f, x)) * 3) * .6 + .2 * np.sin(4 * np.pi * osc(f, x))
    add(sfx, lpf(s, 3000) * np.minimum(1, x / .2) * np.clip((d - x) / .4, 0, 1), t0, g, pan)
def heli(t0, d, g=.12):
    x = ts(d); chop = (.5 + .5 * np.sin(2 * np.pi * 11 * x)) ** 4
    add(sfx, lpf(rng.standard_normal(len(x)), 600) * chop * np.minimum(1, x / .5) * np.clip((d - x) / .5, 0, 1), t0, g, .3)
def radio(t0, d=.35, g=.18):
    x = ts(d); add(sfx, bp(rng.standard_normal(len(x)), 900, 3500) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 23 * x))) * np.exp(-x * 4), t0, g, -.2)
def beep(t0, f=1800, g=.08):
    x = ts(.08); add(sfx, np.sin(2 * np.pi * f * x) * env(x, .002, r=.02), t0, g, .2)
def typewriter(t0, n, every=.055, g=.16):
    for i in range(n):
        x = ts(.05); s = hpf(rng.standard_normal(len(x)), 1500) * np.exp(-x * 120) + np.sin(2 * np.pi * (900 + 300 * rng.random()) * x) * np.exp(-x * 160) * .5
        add(sfx, s, t0 + i * every + rng.random() * .012, g, rng.uniform(-.2, .2))
def bell_ding(t0, g=.12): add(sfx, bell(93, .7, .3), t0, g, .3)
def marker(t0, g=.1):
    x = ts(.07); add(sfx, bp(rng.standard_normal(len(x)), 2500, 7000) * np.sin(np.pi * x / .07), t0, g, -.1)
def shutter(t0, g=.35):
    x = ts(.12); s = hpf(rng.standard_normal(len(x)), 2000) * (np.exp(-x * 80) + .6 * np.exp(-np.maximum(0, x - .06) * 80) * (x > .06))
    add(sfx, s, t0, g); xx = ts(.5); add(sfx, np.sin(2 * np.pi * osc(2000 + 3000 * xx / .5, xx)) * .08 * np.exp(-xx * 4), t0 + .02, g)
def paper(t0, g=.25): add(sfx, swish(), t0, g)

# ---------------------------------------------------------------- musique
# 1-2 : tension (ré mineur)
add(mus, drone(15.9, 38, 420), 0, .26)
t = 0; k = 0
while t < 15.7:
    add(mus, pulse(38 + (3 if (k // 8) % 4 == 2 else 0), .2), t, .3, -.1)
    if k % 2: add(mus, tick(4200), t, .05, .3)
    if k % 8 == 0: add(mus, kick(.7), t, .3)
    if k % 8 == 4: add(mus, lpf(snare_ := (bp(rng.standard_normal(int(.2 * SR)), 900, 6000) * np.exp(-ts(.2) * 20)), 5000), t, .12, .1)
    t += B / 2; k += 1
for a in (5.15, 9.74, 12.34): add(sfx, impact_ := np.sin(2 * np.pi * osc(45 + 60 * np.exp(-ts(1.2) * 9), ts(1.2))) * np.exp(-ts(1.2) * 2.5), a, .35)
# 3-5 : affaire classée (groove)
BPM2 = 104; B2 = 60 / BPM2
PROG = [(50, [62, 65, 69]), (48, [60, 64, 67]), (46, [58, 62, 65]), (45, [61, 64, 69])]
t = 16.0; bar = 0
while t < M['end'] - .6:
    root, ch = PROG[bar % 4]
    for b in range(4):
        tb = t + b * B2
        if tb > M['end'] - .6: break
        add(mus, kick(.85), tb, .45 if b in (0, 2) else 0)
        if b in (1, 3): add(mus, clap(), tb, .2, .1)
        add(mus, hat(), tb + B2 / 2, .07, .3); add(mus, hat(), tb + B2 * .75, .03, -.3)
        add(mus, bass(root - 12 + (12 if b == 3 else 0), B2 * .45), tb, .32); add(mus, bass(root - 12 + 7, B2 * .3), tb + B2 * .5, .2)
        if b in (1, 3): add(mus, epiano(ch[0] + 12, .3) + epiano(ch[1] + 12, .3) + epiano(ch[2] + 12, .3), tb + B2 * .5, .05, .2)
    bar += 1; t += 4 * B2

# ---------------------------------------------------------------- bruitages
radio(0.0, .3); heli(0, 5.3, .07); siren(0.05, 5.0, .035, -.4)
for i in range(5): beep(i * 1.0 + .5, 1500, .04)
dundun(M['vo'][0]['end'] + .02, .6); shutter(M['freeze'][0] + .01, .2)
add(sfx, pop(1200, 1.0), M['freeze'][0] + .2, .15)
radio(M['cam2'] - .02, .2, .15)
add(sfx, pop(1500, 1.0), Lw(1)[4][1], .15); add(sfx, stamp(), M['site'], .35)
add(sfx, whoosh(.3, 4000, 300, 1.0), M['board'] - .1, .3)
paper(M['board'] + .1, .2); paper(M['board'] + .2, .15)
for tt in (Lw(2)[0][1], Lw(3)[0][1], Lw(4)[0][1]): paper(tt - .02, .25); add(sfx, wood(70, .15), tt + .25, .2)
for i in range(15): marker(M['tally'] + i * .055, .09)
add(sfx, stamp(), M['faux'], .55); add(sfx, stamp(), M['introuvable'], .6)
siren(M['lineup'] - .55, 1.4, .12, 0)
for a in M['flashes']: shutter(a, .35)
add(sfx, whoosh(.4, 300, 3000, 1.0), M['flashes'][2] - .9, .12); sparkle(M['flashes'][2] + .02, .05)
paper(M['dossier'], .3)
for i, a in enumerate(M['dossierT']): typewriter(a - .05, 9, .035, .14); bell_ding(a + .32, .1)
add(sfx, stamp(), M['dossierT'][3] + .35, .55)
paper(M['poster'], .35); add(sfx, whoosh(.5, 3000, 400, 1.0), M['poster'], .2)
siren(M['poster'] + .3, 3.6, .025, .4)
add(sfx, stamp(), M['cta'][2] - .02, .28)
dundun(M['end'] - 1.3, .5)

# ---------------------------------------------------------------- voix + mixage
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VO_IN, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; vo[:min(N, len(v))] = v[:N]
e = np.convolve(np.abs(vo), np.ones(2400) / 2400, 'same'); e = np.convolve((e > .01).astype(float), np.ones(9600) / 9600, 'same')
duck = 1 - .5 * np.clip(e * 1.4, 0, 1); sduck = 1 - .3 * np.clip(e * 1.4, 0, 1)
fade = np.clip((DUR - np.arange(N) / SR) / .8, 0, 1)
def write(path, with_music):
    out = (reverb(mus, 1.2, .14) * duck[:, None] * .95 if with_music else 0) + reverb(sfx, .9, .12) * sduck[:, None] * .75 + np.stack([vo, vo], 1) * 1.7
    out = out * fade[:, None]; out = np.tanh(out * 1.1) / np.tanh(1.1)
    with wave.open(path, 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(out / max(1e-6, np.abs(out).max()) * .95, -1, 1) * 32767).astype(np.int16).tobytes())
write(OUT, True)
if OUT_NM: write(OUT_NM, False)
print('mix', OUT, f'{DUR:.2f} s')
