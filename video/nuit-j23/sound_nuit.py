# Bande-son « Cette nuit… » : nuit calme, carillons à chaque carte, aube, impact sur le chiffre
import numpy as np, wave
from scipy.signal import lfilter, fftconvolve
sr = 48000; T = 16.0; n = int(sr * T); rng = np.random.default_rng(41)
mus = np.zeros((n, 2)); sfx = np.zeros((n, 2))
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
saw = lambda f, x: 2 * ((f * x) % 1) - 1
def lp(x, a):
    if np.isscalar(a): return lfilter([a], [1, a - 1], x)
    y = np.empty_like(x); zi = np.zeros(1)
    for i in range(0, len(x), 256):
        c = float(np.mean(a[i:i + 256])); y[i:i + 256], zi = lfilter([c], [1, c - 1], x[i:i + 256], zi=zi)
    return y
def add(buf, sig, t, g=1., pan=0.):
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n and j > i: buf[i:j] += sig[:j - i] * g
def env(d, a, r): x = ts(d); return np.minimum(1, x / a) * np.minimum(1, (d - x) / r).clip(0)
def hit(t, g=1.):
    x = ts(4.5); sub = np.sin(2 * np.pi * (26 + 90 * np.exp(-x * 7)) * x) * np.exp(-x * 1.1)
    body = lp(sum(saw(mtof(m), x) for m in [26, 38, 45]) / 3, .01 + .12 * np.exp(-x * 3)) * np.exp(-x * 1.3) * .9
    add(sfx, np.tanh((sub * 1.3 + lp(rng.standard_normal(len(x)), .18) * np.exp(-x * 9) * .7 + body) * 1.6), t, g)
def riser(t0, t1, g=.5):
    d = t1 - t0; x = ts(d); k = x / d
    add(sfx, lp(rng.standard_normal(len(x)), .005 + .4 * k ** 2) * 3 * k ** 2.5 + np.sin(2 * np.pi * (120 * x + 500 * x ** 2 / d)) * k ** 3 * .25, t0, g)
def swoosh(t, g=.3, d=.7):
    x = ts(d); s = lp(rng.standard_normal(len(x)), .03 + .35 * np.sin(np.pi * x / d)) * np.sin(np.pi * x / d) ** 2 * 2
    add(sfx, np.stack([s * (1 - x / d), s * (x / d)], 1), t - d / 2, g)
def ding(t, m, g=.13):
    y = ts(1.8); add(sfx, (np.sin(2 * np.pi * mtof(m) * y) + .4 * np.sin(2 * np.pi * mtof(m + 12) * y) + .15 * np.sin(2 * np.pi * mtof(m + 19) * y)) * np.exp(-y * 3.5), t, g)
# nuit : nappe grave et douce, souffle (vent), boîte à musique lointaine
d = 9.6; x = ts(d)
add(mus, sum(np.sin(2 * np.pi * mtof(m) * x + .3 * np.sin(2 * np.pi * .2 * x + m)) for m in [38, 45, 50, 57]) / 4 * env(d, 1.2, .4) * (.6 + .4 * x / d), 0, .4)
add(mus, lp(rng.standard_normal(len(x)), .006) * 5 * env(d, 2, 1), 0, .2)
for t, m in [(.3, 74), (.9, 81), (1.5, 78)]: ding(t, m, .07)
# cartes : swoosh + carillon (gamme montante), pulsation qui s'installe
B = 60 / 92
for i, a in enumerate([2.3, 4.0, 5.7, 7.4]): swoosh(a + .2, .28); ding(a + .45, [69, 72, 76, 81][i], .14)
t = 2.3; k = 0
while t < 9.1:
    lev = (t - 2.3) / 6.8
    y = ts(.45); add(mus, np.tanh(np.sin(2 * np.pi * (44 + 70 * np.exp(-y * 28)) * y) * np.exp(-y * 8) * 1.6), t, .25 + .3 * lev)
    y = ts(.04); add(mus, np.diff(np.r_[0, rng.standard_normal(len(y))]) * np.exp(-y * 120), t + B / 2, .05 + .05 * lev, .3)
    t += B; k += 1
# aube : accord majeur qui s'ouvre
d = 6.0; x = ts(d); add(mus, sum(np.sin(2 * np.pi * mtof(m) * x) for m in [50, 57, 62, 66, 69]) / 5 * env(d, 2.5, .6), 4.2, .3)
# révélation logo, montée, silence, impact
swoosh(9.6, .35, 1.0); x = ts(2.5); add(sfx, sum(np.sin(2 * np.pi * mtof(m) * x) * np.exp(-x * (1 + j * .3)) for j, m in enumerate([86, 93, 98])) / 3, 9.62, .12)
riser(9.9, 11.0, .6)
hit(11.4, 1.2)
x = ts(3.5); add(sfx, sum(np.sin(2 * np.pi * mtof(m) * x) * np.exp(-x * (.8 + j * .25)) for j, m in enumerate([62, 69, 74, 81])) / 4, 11.45, .16)
d = 2.9; x = ts(d); add(mus, (np.sin(2 * np.pi * 36.7 * x) + lp(rng.standard_normal(len(x)), .004) * 4) * env(d, .3, .5), 11.5, .3)
d = 1.7; x = ts(d); add(mus, (np.sin(2 * np.pi * mtof(38) * x) * .7 + sum(np.sin(2 * np.pi * mtof(m) * x) for m in [62, 66, 69]) / 3 * .35) * env(d, .3, .8), 14.3, .32)
ding(14.4, 86, .07)
def verb(x, dur, mix):
    t = ts(dur); ir = rng.standard_normal(len(t)) * np.exp(-t * 5 / dur)
    w = np.stack([fftconvolve(x[:, c], np.roll(ir, 377 * c))[:n] for c in (0, 1)], 1)
    return x + w / (np.abs(w).max() + 1e-9) * np.abs(x).max() * mix
mus = verb(mus, 2.5, .3); sfx = verb(sfx, 3.5, .45)
g = np.ones(n); i, j, f = int(11.0 * sr), int(11.4 * sr), int(.015 * sr); g[i - f:i] = np.linspace(1, 0, f); g[i:j] = 0; g[j:j + f] = np.linspace(0, 1, f)
mus *= g[:, None]; sfx *= g[:, None]
mix = mus / np.abs(mus).max() * .55 + sfx / np.abs(sfx).max() * .8
mix[-int(.7 * sr):] *= np.linspace(1, 0, int(.7 * sr))[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix = mix / np.abs(mix).max() * .95
w = wave.open('sound_nuit.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close(); print('ok')
