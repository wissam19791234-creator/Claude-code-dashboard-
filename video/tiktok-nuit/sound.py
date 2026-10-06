# Bande-son synthétisée (aucun son sous droits) : pluie, nappe grave, piano lointain, impact final
import numpy as np, wave
from scipy.signal import lfilter, fftconvolve
sr = 48000; T = 10.0; n = int(sr * T); rng = np.random.default_rng(7)
out = np.zeros((n, 2))
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, a):  # passe-bas 1 pôle ; coefficient fixe ou variable (par blocs)
    if np.isscalar(a): return lfilter([a], [1, a - 1], x)
    y = np.empty_like(x); zi = np.zeros(1)
    for i in range(0, len(x), 256):
        c = float(np.mean(a[i:i + 256])); y[i:i + 256], zi = lfilter([c], [1, c - 1], x[i:i + 256], zi=zi)
    return y
def add(sig, t, g=1., pan=0.):
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig)); out[i:j] += sig[:j - i] * g
# pluie : bruit filtré + gouttes
d = 7.45; t = ts(d)
rain = np.stack([lp(rng.standard_normal(len(t)), .25) - lp(rng.standard_normal(len(t)), .02) for _ in (0, 1)], 1)
rain *= (np.minimum(1, t / .05) * np.minimum(1, (d - t) / .3))[:, None]
add(rain, 0, .05)
for k in range(140):
    x = ts(.02); add(np.sin(2 * np.pi * rng.uniform(2500, 6000) * x) * np.exp(-x * 300), rng.uniform(0, 7.3), .03, rng.uniform(-.8, .8))
# nappe grave qui monte
d = 7.5; t = ts(d)
pad = sum(np.sin(2 * np.pi * mtof(m) * t + .4 * np.sin(2 * np.pi * .2 * t + m)) for m in [38, 45, 50, 53]) / 4
pad *= np.minimum(1, t / 1.2) * (.45 + .55 * (t / d) ** 1.5) * np.minimum(1, (d - t) / .25)
add(pad, 0, .3)
# piano lointain sur chaque phrase
def piano(m, d=2.6):
    x = ts(d); f = mtof(m)
    s = sum(np.sin(2 * np.pi * f * h * x) * np.exp(-x * (2.2 + h * 1.4)) / h ** 1.3 for h in (1, 2, 3, 4))
    return s * np.minimum(1, x / .004)
for tt, ms in [(.15, [74]), (2.12, [72]), (3.87, [69]), (5.62, [77, 74])]:
    for j, m in enumerate(ms): add(piano(m), tt + j * .12, .22, -.25 + .5 * j)
# coups sourds sur les coupes, précédés d'un souffle inversé
for c in [2.0, 3.75, 5.5]:
    x = ts(.9); add(np.sin(2 * np.pi * (42 + 45 * np.exp(-x * 14)) * x) * np.exp(-x * 4.5), c, .55)
    x = ts(.45); add(lp(rng.standard_normal(len(x)), .02 + .25 * x / .45) * (x / .45) ** 3 * 2, c - .45, .18)
# silence, puis impact + accord qui s'ouvre (ré majeur)
x = ts(.7); add(lp(rng.standard_normal(len(x)), .01 + .3 * (x / .7) ** 2) * (x / .7) ** 3 * 3, 7.0, .3)
x = ts(2.3); add(np.sin(2 * np.pi * (30 + 70 * np.exp(-x * 9)) * x) * np.exp(-x * 1.6) * 1.2 + lp(rng.standard_normal(len(x)), .2) * np.exp(-x * 7) * .5, 7.7, .8)
d = 2.35; t = ts(d)
ch = sum(np.sin(2 * np.pi * mtof(m) * t + .15 * np.sin(2 * np.pi * 5 * t)) for m in [50, 57, 62, 66, 69, 74]) / 6
add(ch * np.minimum(1, t / .6) * np.minimum(1, (d - t) / .6), 7.65, .35)
add(piano(81, 2), 8.95, .2); add(piano(86, 2), 8.97, .1)
# réverbération
t = ts(2.6); ir = rng.standard_normal(len(t)) * np.exp(-t * 2.4); irs = [ir, np.roll(ir, 457)]
wet = np.stack([fftconvolve(out[:, c], irs[c])[:n] for c in (0, 1)], 1)
out = out + wet / np.abs(wet).max() * np.abs(out).max() * .45
out[-int(.5 * sr):] *= np.linspace(1, 0, int(.5 * sr))[:, None]
out = out / np.abs(out).max() * .9
w = wave.open('sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
