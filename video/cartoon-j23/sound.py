# Bande-son cartoon (synthétisée) : xylophone qui s'emballe, chute, BOING, thème joyeux, tiroir-caisse, fanfare
import numpy as np, wave
from scipy.signal import lfilter, fftconvolve
sr = 48000; T = 16.0; n = int(sr * T); rng = np.random.default_rng(7)
mus = np.zeros((n, 2)); sfx = np.zeros((n, 2))
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, a: lfilter([a], [1, a - 1], x)
def add(buf, sig, t, g=1., pan=0.):
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n and j > i: buf[i:j] += sig[:j - i] * g
def mallet(m, d=.35, bright=1.):   # xylophone / marimba
    x = ts(d); f = mtof(m)
    return (np.sin(2 * np.pi * f * x) + .35 * bright * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 30)) * np.exp(-x * 9) * np.minimum(1, x / .002)
def pluck(m, d=.3):
    x = ts(d); f = mtof(m); s = sum(np.sin(2 * np.pi * f * h * x) / h for h in (1, 2, 3)) * np.exp(-x * 10)
    return s * np.minimum(1, x / .003)
def pop(t, g=.4, f=900):
    x = ts(.08); add(sfx, np.sin(2 * np.pi * (f + 900 * np.exp(-x * 60)) * x) * np.exp(-x * 45), t, g)
def clap(t, g=.25):
    x = ts(.12); add(mus, lp(rng.standard_normal(len(x)), .6) * np.exp(-x * 40), t, g)
def kick(t, g=.5):
    x = ts(.3); add(mus, np.sin(2 * np.pi * (50 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 9), t, g)
def slide(t0, d, f0, f1, g=.3):   # sifflet à coulisse
    x = ts(d); f = f0 * (f1 / f0) ** (x / d); ph = 2 * np.pi * np.cumsum(f) / sr
    add(sfx, (np.sin(ph) + .2 * np.sin(2 * ph)) * (1 + .1 * np.sin(2 * np.pi * 6 * x)) * np.minimum(1, x / .02) * np.minimum(1, (d - x) / .05), t0, g)
def boing(t, g=.5):
    x = ts(.7); f = 180 + 160 * np.exp(-x * 4) * np.cos(2 * np.pi * 9 * x); ph = 2 * np.pi * np.cumsum(f) / sr
    add(sfx, np.sin(ph) * np.exp(-x * 4), t, g)
def ding(t, m=88, g=.2):
    x = ts(1.0); add(sfx, (np.sin(2 * np.pi * mtof(m) * x) + .5 * np.sin(2 * np.pi * mtof(m + 7) * x)) * np.exp(-x * 5), t, g)
# 1) panique : ostinato qui accélère + sonneries
t = 0.; k = 0; seq = [72, 76, 79, 76, 74, 77, 81, 77]
while t < 4.0:
    bpm = 140 + 45 * t / 4; st = 60 / bpm / 2
    add(mus, mallet(seq[k % 8] + (2 if t > 2 else 0)), t, .35, -.3 if k % 2 else .3)
    if k % 2 == 0: kick(t, .35)
    if k % 4 == 2: clap(t, .2)
    t += st; k += 1
for a in [.2, .6, 1.0, 1.4, 1.8]: pop(a, .35, 700 + a * 300)
for r in range(6): x = ts(.06); add(sfx, np.sign(np.sin(2 * np.pi * 1400 * x)) * .3 * np.exp(-x * 10), .25 + r * .12 + (r // 3) * .3, .12)   # sonnerie
x = ts(4); add(mus, lp(np.sign(np.sin(2 * np.pi * mtof(36) * x)), .05) * .4 * (x / 4) ** 1.5, 0, .25)
# 2) chute : sifflet descendant, petit fracas ; la mascotte saute (sifflet montant) puis BOING
slide(4.0, .5, 1400, 300, .3)
x = ts(.4); add(sfx, lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 10), 4.45, .25)
slide(4.5, .42, 300, 1300, .22)
boing(4.95, .55); pop(4.97, .4, 600)
# 3) thème joyeux (116 BPM, do majeur)
B = 60 / 116; t0 = 5.0; mel = [76, 79, 84, 79, 81, 79, 76, 72, 74, 77, 81, 77, 79, 76, 74, 72]
bass = [48, 48, 53, 53, 55, 55, 48, 48]; chords = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]
i = 0; t = t0
while t < 12.0:
    kick(t, .4 if i % 2 == 0 else .25)
    if i % 2 == 1: clap(t, .22)
    add(mus, pluck(bass[i % 8] - 12, .3), t, .45)
    add(mus, mallet(mel[i % 16], .4), t, .3, .2); add(mus, mallet(mel[(i + 3) % 16] - 12, .3, .5), t + B / 2, .12, -.2)
    if i % 4 == 0: x = ts(B * 4); add(mus, sum(np.sin(2 * np.pi * mtof(m) * x) for m in chords[(i // 4) % 4]) / 3 * np.exp(-x * .8) * np.minimum(1, x / .05), t, .1)
    t += B; i += 1
# 4) boutique : ta-da, clients qui entrent (ding + tiroir-caisse)
for j, m in enumerate([72, 76, 79, 84]): add(sfx, mallet(m, .5), 9.05 + j * .07, .3)
for c in range(8):
    a = 9.35 + c * .3 + 1.0
    if a < 12.0: ding(a, 84 + (c % 3) * 3, .14)
for a in [10.4, 11.4]:
    x = ts(.5); add(sfx, (np.sin(2 * np.pi * 2200 * x) + np.sin(2 * np.pi * 2800 * x)) * np.exp(-x * 9) * .6, a, .18)   # ka-ching
    x = ts(.12); add(sfx, lp(rng.standard_normal(len(x)), .7) * np.exp(-x * 30), a - .05, .2)
# 5) fanfare J-23
x = ts(.3); add(sfx, lp(rng.standard_normal(len(x)), .3) * (x / .3) ** 2 * .8, 12.05, .4)  # roulement
for r in np.arange(12.05, 12.35, .03): x = ts(.04); add(mus, lp(rng.standard_normal(len(x)), .4) * np.exp(-x * 60), r, .25)
x = ts(1.8); hit = np.sin(2 * np.pi * (45 + 80 * np.exp(-x * 12)) * x) * np.exp(-x * 3) + lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 4) * .5
add(sfx, hit, 12.35, .7)
x = ts(2.2); brass = sum(np.sign(np.sin(2 * np.pi * mtof(m) * x)) for m in [60, 64, 67, 72]) / 4
add(mus, lp(brass, .12) * np.exp(-x * 1.1) * np.minimum(1, x / .02), 12.35, .35)
for j, m in enumerate([72, 76, 79, 84, 88]): add(mus, mallet(m, .5), 13.0 + j * .1, .25)
pop(13.6, .4, 800); boing(13.62, .25)
x = ts(1.6); add(mus, lp(sum(np.sign(np.sin(2 * np.pi * mtof(m) * x)) for m in [65, 69, 72, 77]) / 4, .1) * np.exp(-x * 1.4), 14.2, .25)
x = ts(1.5); add(mus, lp(sum(np.sign(np.sin(2 * np.pi * mtof(m) * x)) for m in [60, 64, 67, 72, 76]) / 5, .1) * np.exp(-x * 1.2), 14.9, .3)
# mix
t = ts(1.2); ir = rng.standard_normal(len(t)) * np.exp(-t * 6)
mus = mus + np.stack([fftconvolve(mus[:, c], np.roll(ir, 211 * c))[:n] for c in (0, 1)], 1) * .015
mix = mus / np.abs(mus).max() * .6 + sfx / np.abs(sfx).max() * .7
mix[-int(.5 * sr):] *= np.linspace(1, 0, int(.5 * sr))[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2); mix = mix / np.abs(mix).max() * .95
w = wave.open('sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close(); print('ok')
