# Bande-son « Marc » : voix off + musique cartoon + bruitages calés sur timeline.json
import numpy as np, wave, json, subprocess
from scipy.signal import lfilter, fftconvolve
TL = json.load(open('timeline.json')); L = TL['lines']; T = TL['end']
sr = 48000; n = int(sr * T); rng = np.random.default_rng(3)
mus = np.zeros((n, 2)); sfx = np.zeros((n, 2)); vo = np.zeros(n)
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, a: lfilter([a], [1, a - 1], x)
w = lambda k, i: L[k]['words'][i]['t']
def add(buf, sig, t, g=1., pan=0.):
    if buf.ndim == 2 and sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n and j > i: buf[i:j] += sig[:j - i] * g
def mallet(m, d=.35, b=1.):
    x = ts(d); f = mtof(m); return (np.sin(2 * np.pi * f * x) + .35 * b * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 30)) * np.exp(-x * 9) * np.minimum(1, x / .002)
def pluck(m, d=.3):
    x = ts(d); f = mtof(m); return sum(np.sin(2 * np.pi * f * h * x) / h for h in (1, 2, 3)) * np.exp(-x * 10) * np.minimum(1, x / .003)
def kick(t, g=.4): x = ts(.3); add(mus, np.sin(2 * np.pi * (50 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 9), t, g)
def clap(t, g=.2): x = ts(.12); add(mus, lp(rng.standard_normal(len(x)), .6) * np.exp(-x * 40), t, g)
def pop(t, g=.35, f=800): x = ts(.08); add(sfx, np.sin(2 * np.pi * (f + 900 * np.exp(-x * 60)) * x) * np.exp(-x * 45), t, g)
def slide(t0, d, f0, f1, g=.3):
    x = ts(d); f = f0 * (f1 / f0) ** (x / d); ph = 2 * np.pi * np.cumsum(f) / sr
    add(sfx, (np.sin(ph) + .2 * np.sin(2 * ph)) * (1 + .1 * np.sin(2 * np.pi * 6 * x)) * np.minimum(1, x / .02) * np.minimum(1, (d - x) / .05), t0, g)
def boing(t, g=.5):
    x = ts(.7); f = 180 + 160 * np.exp(-x * 4) * np.cos(2 * np.pi * 9 * x); add(sfx, np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-x * 4), t, g)
def ding(t, m=88, g=.2): x = ts(1.0); add(sfx, (np.sin(2 * np.pi * mtof(m) * x) + .5 * np.sin(2 * np.pi * mtof(m + 7) * x)) * np.exp(-x * 5), t, g)
tCrash = L['l3']['end'] + .05; tLand = w('l4', 4); t5, t6, t7 = L['l5']['start'], L['l6']['start'], L['l7']['start']
# 1) intro légère puis ostinato qui s'emballe jusqu'à la chute
t = .0; k = 0; seq = [72, 76, 79, 76, 74, 77, 81, 77]
while t < tCrash:
    s = max(0, (t - L['l2']['start']) / (tCrash - L['l2']['start'])) if t > L['l2']['start'] else 0
    bpm = 112 + 70 * s; st = 60 / bpm / 2
    add(mus, mallet(seq[k % 8] + (2 if s > .6 else 0)), t, .3, -.3 if k % 2 else .3)
    if k % 2 == 0: kick(t, .3 + .1 * s)
    if k % 4 == 2: clap(t, .15 + .1 * s)
    if k % 4 == 0: add(mus, pluck([48, 53, 55, 48][(k // 4) % 4] - 12), t, .35)
    t += st; k += 1
for i, a in enumerate([w('l2', j) for j in (1, 4, 6, 7, 9)]): pop(a, .4, 600 + i * 120)
# 2) chute
slide(tCrash, .55, 1400, 260, .32)
x = ts(.5); add(sfx, lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 9), tCrash + .45, .3)
for j in range(4): x = ts(.15); add(sfx, np.sin(2 * np.pi * (500 + j * 170) * x) * np.exp(-x * 25), tCrash + .5 + j * .07, .12)
# 3) Scalify arrive
slide(tLand - .55, .5, 300, 1300, .2); boing(tLand, .55); pop(tLand + .02, .35, 600)
# 4) thème joyeux jusqu'à la fin
B = 60 / 116; mel = [76, 79, 84, 79, 81, 79, 76, 72, 74, 77, 81, 77, 79, 76, 74, 72]; bass = [48, 48, 53, 53, 55, 55, 48, 48]
t = tLand + .2; i = 0
while t < T - .8:
    kick(t, .32 if i % 2 == 0 else .2)
    if i % 2 == 1: clap(t, .18)
    add(mus, pluck(bass[i % 8] - 12), t, .38); add(mus, mallet(mel[i % 16], .4), t, .24, .2)
    t += B; i += 1
for i in range(5): ding(t5 + .35 + i * .42, 84 + i * 2, .16)                       # coches
for i in range(5): ding(t6 + .3 + i * .32 + .75, 88 - (i % 2) * 3, .12)          # clients
x = ts(.5); add(sfx, (np.sin(2 * np.pi * 2200 * x) + np.sin(2 * np.pi * 2800 * x)) * np.exp(-x * 9) * .6, t6 + 1.2, .18)  # ka-ching
# 5) carton final
slide(t7 - .35, .35, 500, 1500, .2)
x = ts(1.8); add(sfx, np.sin(2 * np.pi * (45 + 80 * np.exp(-x * 12)) * x) * np.exp(-x * 3) + lp(rng.standard_normal(len(x)), .5) * np.exp(-x * 4) * .4, w('l7', 3), .6)
x = ts(2.2); add(mus, lp(sum(np.sign(np.sin(2 * np.pi * mtof(m) * x)) for m in [60, 64, 67, 72]) / 4, .12) * np.exp(-x * 1.1), w('l7', 3), .3)
for a in [w('l7', 0), w('l7', 1), w('l7', 8), L['l7']['end'] + .05]: pop(a, .35, 900)
for j, m in enumerate([72, 76, 79, 84, 88]): add(mus, mallet(m, .5), L['l7']['end'] + .1 + j * .09, .22)
# voix
for k in L:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'vo/{k}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True).stdout
    add(vo, np.frombuffer(raw, np.int16) / 32768., L[k]['start'])
ev = np.convolve(np.abs(vo), np.ones(4800) / 4800, 'same'); duck = 1 - .55 * np.clip(ev / (ev.max() * .2 + 1e-9), 0, 1)
mix = (mus / np.abs(mus).max() * .5 + sfx / np.abs(sfx).max() * .55) * duck[:, None] + np.stack([vo, vo], 1) / np.abs(vo).max() * .85
mix[-int(.5 * sr):] *= np.linspace(1, 0, int(.5 * sr))[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix = mix / np.abs(mix).max() * .95
f = wave.open('sound_marc.wav', 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr); f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close(); print('ok', T)
