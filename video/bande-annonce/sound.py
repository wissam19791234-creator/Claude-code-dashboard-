# Bande-son de la bande-annonce, entièrement synthétisée (aucun son sous droits)
import numpy as np, json, wave
sr = 48000
TL = json.load(open('timeline.json')); E = TL['E']; M = E['montage']; T = E['end']
n = int(sr * T); rng = np.random.default_rng(3)
mus = np.zeros((n, 2)); sfx = np.zeros((n, 2))
def ts(d): return np.arange(int(d * sr)) / sr
def add(buf, sig, t, g=1.0, pan=0.0):
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n: buf[i:j] += sig[:j - i] * g
def lp(x, a):  # passe-bas 1 pôle ; coefficient fixe ou variable (traité par blocs)
    from scipy.signal import lfilter
    if np.isscalar(a): return lfilter([a], [1, a - 1], x)
    a = np.asarray(a, float); y = np.empty_like(x); zi = np.zeros(1); B = 256
    for i in range(0, len(x), B):
        c = float(a[i:i + B].mean()); y[i:i + B], zi = lfilter([c], [1, c - 1], x[i:i + B], zi=zi * 1.0)
    return y
def env(d, a=.01, r=.3):
    t = ts(d); e = np.minimum(1, t / a); e *= np.minimum(1, (d - t) / r).clip(0); return e
def reverb(x, dur=2.8, mix=.35):
    from scipy.signal import fftconvolve
    t = ts(dur); ir = rng.standard_normal(len(t)) * np.exp(-t * 3 / dur * 2.2)
    irs = np.stack([ir, np.roll(ir, 331)], 1)
    out = np.stack([fftconvolve(x[:, c], irs[:, c])[:len(x)] for c in (0, 1)], 1)
    return x * (1 - mix) + out / np.max(np.abs(out) + 1e-9) * np.max(np.abs(x) + 1e-9) * mix * 1.5
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def saw(f, t): return 2 * ((f * t) % 1) - 1

# 1) nappe sombre (0 → silence avant le BRAAM)
d = E['braam'] - .35; t = ts(d)
pad = sum(np.sin(2 * np.pi * mtof(m) * t + .3 * np.sin(2 * np.pi * .13 * t)) for m in [33, 40, 45, 48]) / 4
pad *= np.minimum(1, t / 2.5) * (.55 + .45 * t / d) * np.minimum(1, (d - t) / .25)
add(mus, pad, 0, .35)
# tic-tac de 1,4 s jusqu'au silence, qui accélère
tt = 1.4; step = .5
while tt < E['braam'] - .45:
    x = ts(.04); tk = rng.standard_normal(len(x)) * np.exp(-x * 160)
    add(sfx, lp(tk, .5) * 1.2, tt, .35, pan=.3 if int(tt / step) % 2 else -.3)
    tt += step; step = max(.25, step * .975)
# battements sourds sur les plans « problèmes »
for h in [7.95, 9.95, 11.6]:
    x = ts(.7); add(sfx, np.sin(2 * np.pi * (48 + 40 * np.exp(-x * 14)) * x) * np.exp(-x * 5), h, .9)
    x = ts(.25); add(sfx, lp(rng.standard_normal(len(x)), .08) * np.exp(-x * 12), h - .2, .4)
# 2) BRAAM
d = 4.2; t = ts(d)
br = sum(saw(mtof(m) * (1 + det), t) for m in [28, 40, 47, 52] for det in (-.004, .004)) / 8
br = lp(br, .02 + .25 * np.exp(-t * 1.2)) * np.exp(-t * .75) * np.minimum(1, t / .02)
br = np.tanh(br * 3) * .8 + np.sin(2 * np.pi * 34 * t) * np.exp(-t * 1.1) * .9
add(sfx, br, E['braam'], 1.0)
# 3) « Et si… » : nappe claire + montée
d = M[0] - E['braam'] + .2; t = ts(d)
hope = sum(np.sin(2 * np.pi * mtof(m) * t) for m in [57, 64, 69, 72]) / 4 * np.minimum(1, t / 2) * np.minimum(1, (d - t) / .2)
add(mus, hope, E['braam'] + .6, .22)
d = M[0] - E['l4'] + .1; t = ts(d)
rs = lp(rng.standard_normal(len(t)), .01 + .2 * (t / d) ** 2) * 4 + np.sin(2 * np.pi * (180 * t + 700 * t ** 2 / d)) * .3
add(sfx, rs * (t / d) ** 2.2, E['l4'] - .1, .55)
# 4) montage : pulsation + toms + impacts sur chaque mot
bpm = 120; beat = 60 / bpm; tt = M[0]
while tt < E['hope'] - .2:
    x = ts(.45); tom = np.sin(2 * np.pi * (70 + 60 * np.exp(-x * 18)) * x) * np.exp(-x * 7)
    add(mus, tom, tt, .7); x = ts(.06); add(mus, np.diff(np.r_[0, rng.standard_normal(len(x))]) * np.exp(-x * 60) * .3, tt + beat / 2, .8)
    tt += beat
bass = [45, 41, 48, 43, 45]
for i, m in enumerate(M):
    nxt = M[i + 1] if i + 1 < len(M) else E['hope'] - .15
    d = nxt - m; t = ts(d)
    b = (saw(mtof(bass[i] - 12), t) * .5 + np.sin(2 * np.pi * mtof(bass[i] - 24) * t)) * np.exp(-t * .9) * np.minimum(1, (d - t) / .05)
    add(mus, lp(b, .08), m, .5)
    x = ts(1.2); hit = np.sin(2 * np.pi * (40 + 70 * np.exp(-x * 16)) * x) * np.exp(-x * 4) + lp(rng.standard_normal(len(x)), .3) * np.exp(-x * 18) * .6
    add(sfx, hit, m - .02, .85)
    x = ts(.35); add(sfx, lp(rng.standard_normal(len(x)), .03 + .3 * x / .35) * np.sin(np.pi * x / .35) ** 2 * 1.5, m - .3, .35)
# 5) espoir : accord majeur ample
d = E['logo'] - E['hope'] + .4; t = ts(d)
ch = sum(np.sin(2 * np.pi * mtof(m) * t + .2 * np.sin(2 * np.pi * 4.5 * t)) for m in [53, 57, 60, 65, 69]) / 5
add(mus, ch * np.minimum(1, t / .8) * np.minimum(1, (d - t) / .3), E['hope'] - .1, .4)
d = 1.6; t = ts(d)
add(sfx, (lp(rng.standard_normal(len(t)), .01 + .3 * (t / d) ** 2) * 4) * (t / d) ** 2.5, E['logo'] - d, .55)
# 6) logo : BOOM + scintillement
d = 4; t = ts(d)
boom = np.sin(2 * np.pi * (30 + 80 * np.exp(-t * 10)) * t) * np.exp(-t * 1.3) * 1.2 + lp(rng.standard_normal(len(t)), .25) * np.exp(-t * 6) * .7
add(sfx, boom, E['logo'], 1.0)
sh = sum(np.sin(2 * np.pi * mtof(m) * t) * np.exp(-t * (1.2 + k * .2)) for k, m in enumerate([84, 88, 91, 96])) / 4
add(sfx, sh, E['logo'] + .05, .25)
d = E['launch'][0] - E['logo'] + .2; t = ts(d)
add(mus, sum(np.sin(2 * np.pi * mtof(m) * t) for m in [41, 48, 53, 57]) / 4 * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .2), E['logo'], .3)
# 7) machine à sous : cliquetis, verrouillage
tt = E['launch'][0] + .1
while tt < E['launch'][1] - .02:
    x = ts(.03); add(sfx, np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 200), tt, .25); tt += .065
for lk in [E['launch'][1] - .32, E['launch'][1] - .02]:
    x = ts(.6); add(sfx, np.sin(2 * np.pi * (60 + 90 * np.exp(-x * 20)) * x) * np.exp(-x * 6) + np.sin(2 * np.pi * 1200 * x) * np.exp(-x * 30) * .3, lk, .8)
d = E['follow'] - E['launch'][0]; t = ts(d)
add(mus, lp(saw(mtof(33), t), .05) * .6 * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .2), E['launch'][0], .45)
# 8) fin
d = T - E['follow'] + .1; t = ts(d)
add(mus, sum(np.sin(2 * np.pi * mtof(m) * t) for m in [45, 52, 57, 61, 64]) / 5 * np.minimum(1, t / .2) * np.exp(-t * .5), E['follow'] - .1, .5)
x = ts(2.5); add(sfx, np.sin(2 * np.pi * (35 + 60 * np.exp(-x * 12)) * x) * np.exp(-x * 1.8), E['follow'] - .1, .7)

mus = reverb(mus, 3.2, .4); sfx = reverb(sfx, 2.4, .3)
fade = np.ones(n); fade[-int(.8 * sr):] = np.linspace(1, 0, int(.8 * sr))
def save(name, x):
    x = x * fade[:, None]; x = x / (np.max(np.abs(x)) + 1e-9) * .9
    f = wave.open(name, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr); f.writeframes((x * 32767).astype(np.int16).tobytes()); f.close()
save('music.wav', mus); save('sfx.wav', sfx)
