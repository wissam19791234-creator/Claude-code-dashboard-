# Bande-son du film (direction « Matière & lumière »), entièrement synthétisée + voix off
import numpy as np, wave, subprocess
from scipy.signal import lfilter, fftconvolve
sr = 48000; T = 33.0; n = int(sr * T); rng = np.random.default_rng(31)
mus = np.zeros((n, 2)); sfx = np.zeros((n, 2)); vo = np.zeros(n)
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
    if buf.ndim == 2 and sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n and j > i: buf[i:j] += sig[:j - i] * g
def env(d, a, r): x = ts(d); return np.minimum(1, x / a) * np.minimum(1, (d - x) / r).clip(0)
def hit(t, g=1., big=False):
    d = 4.5 if big else 3; x = ts(d)
    sub = np.sin(2 * np.pi * (26 + (90 if big else 70) * np.exp(-x * 7)) * x) * np.exp(-x * (1.1 if big else 1.6))
    nz = lp(rng.standard_normal(len(x)), .18) * np.exp(-x * 9) * .7
    body = lp(sum(saw(mtof(m), x) for m in ([26, 38, 45] if big else [33, 45])) / 3, .01 + .12 * np.exp(-x * 3)) * np.exp(-x * 1.3) * .9
    add(sfx, np.tanh((sub * 1.3 + nz + body) * 1.6), t, g)
def riser(t0, t1, g=.5):
    d = t1 - t0; x = ts(d); k = x / d
    add(sfx, lp(rng.standard_normal(len(x)), .005 + .4 * k ** 2) * 3 * k ** 2.5 + np.sin(2 * np.pi * (120 * x + 500 * x ** 2 / d)) * k ** 3 * .25, t0, g)
def swoosh(t, g=.35, d=.7):
    x = ts(d); s = lp(rng.standard_normal(len(x)), .03 + .35 * np.sin(np.pi * x / d)) * np.sin(np.pi * x / d) ** 2 * 2
    add(sfx, np.stack([s * (1 - x / d), s * (x / d)], 1), t - d / 2, g)
def ding(t, m, g=.1):
    y = ts(1.4); add(sfx, (np.sin(2 * np.pi * mtof(m) * y) + .4 * np.sin(2 * np.pi * mtof(m + 12) * y)) * np.exp(-y * 4.5), t, g)
# 1) chaos : nappe sombre, tic-tacs numériques, pulsations qui accélèrent, coupure à 4,5 s
x = ts(4.5); k = x / 4.5
add(mus, (np.sin(2 * np.pi * 36.7 * x) * .8 + lp(rng.standard_normal(len(x)), .004) * 6) * (.2 + .8 * k ** 1.5) * np.minimum(1, x / 1), 0, .55)
seed_ts = np.random.default_rng(9)
for i in range(64):
    u = seed_ts.random(); t = .2 + u ** .5 * 3.8
    y = ts(.05); add(sfx, np.sin(2 * np.pi * rng.choice([1800, 2400, 3100, 3900]) * y) * np.exp(-y * 120), t, .08 + .06 * t / 4.5, rng.uniform(-.8, .8))
tt, step = .6, .85
while tt < 4.45:
    y = ts(.35); add(sfx, np.sin(2 * np.pi * (48 + 30 * np.exp(-y * 20)) * y) * np.exp(-y * 9), tt, .35 + .3 * tt / 4.5); tt += step; step = max(.15, step * .8)
riser(2.4, 4.5, .45)
add(sfx, lp(rng.standard_normal(int(.09 * sr)), .3) * np.exp(-ts(.09) * 30), 4.45, .4)
# 2) aspiration → impact → lumière chaude
riser(4.85, 6.3, .7); swoosh(5.6, .3, 1.2)
hit(6.3, .95)
x = ts(3); add(sfx, sum(np.sin(2 * np.pi * mtof(m) * x) * np.exp(-x * (1 + j * .3)) for j, m in enumerate([86, 93, 98])) / 3, 6.35, .12)
d = 2.6; x = ts(d); add(mus, sum(np.sin(2 * np.pi * mtof(m) * x + .2 * np.sin(2 * np.pi * .4 * x + m)) for m in [50, 57, 62, 64, 69]) / 5 * env(d, .8, .5), 6.4, .35)
# 3) produit : pulsation douce qui monte, transitions, petits sons d'interface
B = 60 / 96; t0, t1 = 8.6, 21.2; t = t0; i = 0
while t < t1 - .01:
    lev = (t - t0) / (t1 - t0)
    y = ts(.45); add(mus, np.tanh(np.sin(2 * np.pi * (44 + 70 * np.exp(-y * 28)) * y) * np.exp(-y * 8) * 1.8), t, .4 + .25 * lev)
    for h in ((0, .5) if lev < .5 else (0, .25, .5, .75)):
        y = ts(.04); add(mus, np.diff(np.r_[0, rng.standard_normal(len(y))]) * np.exp(-y * 120), t + h * B, .05 + .05 * lev, .35)
    for e in (0, .5):
        y = ts(B / 2); add(mus, lp(saw(mtof([38, 38, 41, 36][(i // 4) % 4] - 12), y) * env(B / 2, .005, .04), .02 + .1 * lev), t + e * B, .28)
    t += B; i += 1
d = t1 - t0; x = ts(d); add(mus, sum(np.sin(2 * np.pi * mtof(m) * x + .15 * np.sin(2 * np.pi * .25 * x)) for m in [50, 57, 62, 66]) / 4 * env(d, 1.5, .5), t0, .2)
for a in [8.6, 11.8, 15.0, 18.2]: swoosh(a + .2, .3)
for t, m in [(9.95, 79), (10.7, 84), (12.6, 76), (13.3, 81), (13.9, 76), (14.4, 84), (15.9, 81), (16.9, 84)]: ding(t, m)
for j in range(8): y = ts(.15); add(sfx, np.sin(2 * np.pi * mtof(60 + j * 2) * y) * np.exp(-y * 25), 18.4 + j * .12, .12)
# 4) logo seul + voix : montée forte, silence, ÉNORME impact sur « 26 »
d = 26.45 - 21.2; x = ts(d); k = x / d
strings = sum(saw(mtof(m) * (1 + det), x) for m in [38, 45, 50, 53, 57] for det in (-.003, .003)) / 10
add(mus, lp(strings, .01 + .08 * k ** 2) * (.3 + .7 * k ** 2), 21.2, .5)
riser(25.0, 26.45, .65)
hit(26.9, 1.25, big=True)
x = ts(4); add(sfx, sum(np.sin(2 * np.pi * mtof(m) * x) * np.exp(-x * (.8 + j * .25)) for j, m in enumerate([62, 69, 74, 81])) / 4, 26.95, .18)
d = 3.3; x = ts(d); add(mus, (np.sin(2 * np.pi * 36.7 * x) + lp(rng.standard_normal(len(x)), .004) * 4) * env(d, .3, .5), 27.0, .3)
# 5) fin
d = 2.9; x = ts(d); add(mus, (np.sin(2 * np.pi * mtof(38) * x) * .7 + sum(np.sin(2 * np.pi * mtof(m) * x) for m in [62, 66, 69]) / 3 * .35) * env(d, .5, 1.0), 30.2, .32)
ding(30.3, 86, .07); ding(31.1, 81, .05)
for kk, t in [('v1', 21.55), ('v2', 23.95)]:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'vo/{kk}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True).stdout
    add(vo, np.frombuffer(raw, np.int16) / 32768., t)
def verb(x, dur, mix):
    t = ts(dur); ir = rng.standard_normal(len(t)) * np.exp(-t * 5 / dur)
    w = np.stack([fftconvolve(x[:, c], np.roll(ir, 377 * c))[:n] for c in (0, 1)], 1)
    return x + w / (np.abs(w).max() + 1e-9) * np.abs(x).max() * mix
mus = verb(mus, 2.5, .3); sfx = verb(sfx, 3.5, .45)
def mute(a, b):
    g = np.ones(n); i, j, f = int(a * sr), int(b * sr), int(.015 * sr)
    g[i - f:i] = np.linspace(1, 0, f); g[i:j] = 0; g[j:j + f] = np.linspace(0, 1, f); return g[:, None]
for a, b in [(4.5, 4.8), (26.45, 26.9)]: m = mute(a, b); mus *= m; sfx *= m
vos = np.stack([vo, vo], 1); vos = verb(vos, 1.6, .12)
ev = np.convolve(np.abs(vo), np.ones(4800) / 4800, 'same'); duck = 1 - .5 * np.clip(ev / (ev.max() * .2 + 1e-9), 0, 1)
mix = (mus / np.abs(mus).max() * .55 + sfx / np.abs(sfx).max() * .8) * duck[:, None] + vos / np.abs(vos).max() * .75
mix[-int(.8 * sr):] *= np.linspace(1, 0, int(.8 * sr))[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix = mix / np.abs(mix).max() * .95
w = wave.open('sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close(); print('ok')
