# Bande-son du trailer, entièrement synthétisée (aucun son sous droits) + voix off
import numpy as np, wave, subprocess
from scipy.signal import lfilter, fftconvolve
sr = 48000; T = 40.0; n = int(sr * T); rng = np.random.default_rng(21)
mus = np.zeros((n, 2)); sfx = np.zeros((n, 2)); vo = np.zeros(n)
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
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
saw = lambda f, x: 2 * ((f * x) % 1) - 1
def env(d, a, r): x = ts(d); return np.minimum(1, x / a) * np.minimum(1, (d - x) / r).clip(0)
def hit(t, g=1., big=False):  # impact cinéma : sub qui chute + souffle + grain
    d = 4.5 if big else 3; x = ts(d)
    sub = np.sin(2 * np.pi * (26 + (90 if big else 70) * np.exp(-x * 7)) * x) * np.exp(-x * (1.1 if big else 1.6))
    nz = lp(rng.standard_normal(len(x)), .18) * np.exp(-x * 9) * .7
    body = sum(saw(mtof(m), x) for m in ([26, 38, 45] if big else [33, 45])) / 3
    body = lp(body, .01 + .12 * np.exp(-x * 3)) * np.exp(-x * 1.3) * .9
    add(sfx, np.tanh((sub * 1.3 + nz + body) * 1.6), t, g)
def riser(t0, t1, g=.5, tone=True):
    d = t1 - t0; x = ts(d); k = x / d
    s = lp(rng.standard_normal(len(x)), .005 + .4 * k ** 2) * 3 * k ** 2.5
    if tone: s += np.sin(2 * np.pi * (120 * x + 500 * x ** 2 / d)) * k ** 3 * .25
    add(sfx, s, t0, g)
# ---- scène 1 : obscurité, micro-sons numériques de plus en plus denses, coupure nette à 5,0 s
x = ts(5.0); k = x / 5
drone = (np.sin(2 * np.pi * 36.7 * x) * .8 + lp(rng.standard_normal(len(x)), .004) * 6) * (.2 + .8 * k ** 1.5) * np.minimum(1, x / 1.2)
add(mus, drone, 0, .55)
for i in range(240):
    u = rng.random(); t = .25 + 4.6 * u ** (1 / 2.4)
    y = ts(.03); f = rng.choice([2200, 2900, 3700, 4400, 5800]) * rng.uniform(.95, 1.05)
    add(sfx, np.sin(2 * np.pi * f * y) * np.exp(-y * 180), t, .05 + .07 * t / 5, rng.uniform(-.9, .9))
for t in np.arange(1.0, 5.0, .5) ** 1:  # pulsations sourdes qui accélèrent
    pass
tt, step = .8, .9
while tt < 4.95:
    y = ts(.35); add(sfx, np.sin(2 * np.pi * (48 + 30 * np.exp(-y * 20)) * y) * np.exp(-y * 9), tt, .35 + .25 * tt / 5); tt += step; step = max(.16, step * .8)
riser(2.6, 5.0, .45)
add(sfx, lp(rng.standard_normal(int(.09 * sr)), .3) * np.exp(-ts(.09) * 30), 4.95, .4)  # « clac » d'arrêt
mus[int(5.0 * sr):int(5.35 * sr)] = 0; sfx[int(5.0 * sr):int(5.35 * sr)] = 0           # silence total
# ---- scène 2 : impulsion, aspiration, impact, nappe qui monte
d = .5; x = ts(d); sw = lp(rng.standard_normal(len(x)), .05 + .4 * np.sin(np.pi * x / d)) * np.sin(np.pi * x / d) * 2
add(sfx, np.stack([sw * (1 - x / d), sw * (x / d)], 1), 5.35, .6)
riser(5.7, 6.6, .7)
hit(6.6, .9)
x = ts(2.6); add(sfx, sum(np.sin(2 * np.pi * mtof(m) * x) * np.exp(-x * (1.2 + j * .3)) for j, m in enumerate([86, 93, 98])) / 3, 6.7, .12)
d = 2.6; x = ts(d)
pad = sum(np.sin(2 * np.pi * mtof(m) * x + .2 * np.sin(2 * np.pi * .4 * x + m)) for m in [50, 57, 62, 64, 69]) / 5
add(mus, pad * env(d, 1.0, .6), 6.8, .35)
# ---- scène 3–4 : pulsation électronique discrète qui s'intensifie (≈ 96 BPM)
B = 60 / 96; t0 = 9.0; t1 = 23.0; i = 0; t = t0
bassn = [38, 38, 41, 36]
while t < t1 - .01:
    lev = (t - t0) / (t1 - t0)
    y = ts(.45); add(mus, np.tanh(np.sin(2 * np.pi * (44 + 70 * np.exp(-y * 28)) * y) * np.exp(-y * 8) * 1.8), t, .45 + .25 * lev)
    for h in (0, .5) if lev < .5 else (0, .25, .5, .75):
        y = ts(.04); add(mus, np.diff(np.r_[0, rng.standard_normal(len(y))]) * np.exp(-y * 120), t + h * B, .05 + .05 * lev, .4 if h % .5 else -.3)
    if i % 2 == 1 and lev > .35: y = ts(.25); add(mus, lp(rng.standard_normal(len(y)), .35) * np.exp(-y * 22), t, .12 + .1 * lev)
    for e in (0, .5):  # basse en croches, filtre qui s'ouvre
        y = ts(B / 2); b = saw(mtof(bassn[(i // 4) % 4] - 12), y) * env(B / 2, .005, .04)
        add(mus, lp(b, .02 + .1 * lev), t + e * B, .3)
    t += B; i += 1
d = t1 - t0; x = ts(d)
add(mus, sum(np.sin(2 * np.pi * mtof(m) * x + .15 * np.sin(2 * np.pi * .25 * x)) for m in [50, 57, 62, 65]) / 4 * env(d, 1.5, .5) * (.5 + .5 * x / d), t0, .18)
for t in [12.6, 14.6, 16.2]:   # notifications : petit carillon doux
    y = ts(1.2); add(sfx, (np.sin(2 * np.pi * 1318 * y) + .5 * np.sin(2 * np.pi * 1976 * y)) * np.exp(-y * 5), t, .1)
for c in range(37):            # frappe de la question
    t = 18.55 + 1.1 * c / 37; y = ts(.02); add(sfx, lp(rng.standard_normal(len(y)), .5) * np.exp(-y * 300), t, .1, rng.uniform(-.2, .2))
d = .6; x = ts(d); add(sfx, np.sin(2 * np.pi * (600 + 1800 * x / d) * x) * np.sin(np.pi * x / d) * .3, 19.75, .12)  # analyse
for j, t in enumerate([20.3, 20.72, 21.14, 21.6]):
    y = ts(1); add(sfx, np.sin(2 * np.pi * mtof([76, 79, 74, 81][j]) * y) * np.exp(-y * 6), t, .1)
# ---- scène 5 : montée forte sous la voix, silence, impact
d = 5.0; x = ts(d); k = x / d
strings = sum(saw(mtof(m) * (1 + det), x) for m in [38, 45, 50, 53, 57] for det in (-.003, .003)) / 10
add(mus, lp(strings, .01 + .08 * k ** 2) * (.3 + .7 * k ** 2) * np.minimum(1, (d - x) / .05), 23.0, .55)
tt, step = 23.0, B
while tt < 27.9:
    y = ts(.5); add(mus, np.sin(2 * np.pi * (40 + 60 * np.exp(-y * 18)) * y) * np.exp(-y * 6), tt, .35 + .4 * (tt - 23) / 5); tt += step; step = max(B / 4, step * .9)
riser(25.8, 28.0, .6)
for L in (mus, sfx): L[int(28.0 * sr):int(28.3 * sr)] = 0
hit(28.3, 1.0, big=True)
# ---- scène 6 : reprise, tension, ÉNORME impact sur « 26 », silence
d = 3.3; x = ts(d); add(mus, sum(np.sin(2 * np.pi * mtof(m) * x) for m in [50, 57, 62, 66, 69, 74]) / 6 * env(d, .4, .5), 28.6, .3)
d = 1.8; x = ts(d); add(mus, (np.sin(2 * np.pi * 36.7 * x) + lp(rng.standard_normal(len(x)), .004) * 5) * (x / d) ** 1.5, 31.6, .5)
riser(32.0, 33.4, .7)
for L in (mus, sfx): L[int(33.3 * sr):int(33.4 * sr)] = 0
hit(33.4, 1.25, big=True)
x = ts(4); add(sfx, sum(np.sin(2 * np.pi * mtof(m) * x) * np.exp(-x * (.8 + j * .25)) for j, m in enumerate([62, 69, 74, 81])) / 4, 33.45, .18)
# ---- final : note grave + scintillement, fondu
d = 3.7; x = ts(d); add(mus, (np.sin(2 * np.pi * mtof(38) * x) * .7 + sum(np.sin(2 * np.pi * mtof(m) * x) for m in [62, 69]) / 2 * .3) * env(d, .8, 1.2), 36.3, .3)
x = ts(2.5); add(sfx, np.sin(2 * np.pi * mtof(86) * x) * np.exp(-x * 1.6), 36.9, .07)
# ---- voix off
for k, t in [('v1', 24.15), ('v2', 26.45)]:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'vo/{k}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True).stdout
    add(vo, np.frombuffer(raw, np.int16) / 32768., t)
# réverbérations
def verb(x, dur, mix):
    t = ts(dur); ir = rng.standard_normal(len(t)) * np.exp(-t * 5 / dur)
    w = np.stack([fftconvolve(x[:, c], np.roll(ir, 377 * c))[:n] for c in (0, 1)], 1)
    return x + w / (np.abs(w).max() + 1e-9) * np.abs(x).max() * mix
mus = verb(mus, 2.5, .3); sfx = verb(sfx, 3.5, .45)
def mute(a, b):  # silences francs (après réverbération), avec micro-fondus
    g = np.ones(n); i, j, f = int(a * sr), int(b * sr), int(.015 * sr)
    g[i - f:i] = np.linspace(1, 0, f); g[i:j] = 0; g[j:j + f] = np.linspace(0, 1, f)
    return g[:, None]
for a, b in [(5.0, 5.35), (28.0, 28.3), (33.32, 33.4)]:
    m = mute(a, b); mus *= m; sfx *= m
vos = np.stack([vo, vo], 1); vos = verb(vos, 1.6, .12)
env_v = np.convolve(np.abs(vo), np.ones(4800) / 4800, 'same'); duck = 1 - .5 * np.clip(env_v / (env_v.max() * .2 + 1e-9), 0, 1)
mix = (mus / np.abs(mus).max() * .55 + sfx / np.abs(sfx).max() * .8) * duck[:, None] + vos / np.abs(vos).max() * .75
mix[-int(.8 * sr):] *= np.linspace(1, 0, int(.8 * sr))[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix / np.abs(mix).max() * .95
w = wave.open('sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok')
