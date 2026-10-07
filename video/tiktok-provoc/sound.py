# Bande-son synthétisée : beat 110 BPM, impacts sur les coupes, silence avant la bascule, drop final
import numpy as np, wave, json
from scipy.signal import lfilter, fftconvolve
TL = json.load(open('timeline.json')); B = TL['B']; C = TL['cuts']; T = TL['end'] + .4
sr = 48000; n = int(sr * T); rng = np.random.default_rng(11); out = np.zeros((n, 2))
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, a):
    if np.isscalar(a): return lfilter([a], [1, a - 1], x)
    y = np.empty_like(x); zi = np.zeros(1)
    for i in range(0, len(x), 256):
        c = float(np.mean(a[i:i + 256])); y[i:i + 256], zi = lfilter([c], [1, c - 1], x[i:i + 256], zi=zi)
    return y
def add(sig, t, g=1., pan=0.):
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n: out[i:j] += sig[:j - i] * g
kick = lambda: (lambda x: np.tanh(np.sin(2 * np.pi * (45 + 120 * np.exp(-x * 30)) * x) * np.exp(-x * 7) * 2.5))(ts(.4))
clap = lambda: (lambda x: lp(rng.standard_normal(len(x)), .5) * (np.exp(-x * 25) + .5 * np.exp(-((x - .012) % .01) * 400) * (x < .03)))(ts(.25))
hat = lambda: (lambda x: np.diff(np.r_[0, rng.standard_normal(len(x))]) * np.exp(-x * 90))(ts(.05))
def bass808(m, d):
    x = ts(d); return np.tanh(np.sin(2 * np.pi * mtof(m) * x * (1 + .5 * np.exp(-x * 40))) * 1.8) * np.minimum(1, (d - x) / .03)
def beat(a, b, notes):
    t = a; i = 0
    while t < b - 1e-3:
        add(kick(), t, .9)
        if i % 2 == 1: add(clap(), t, .45)
        add(hat(), t + B / 2, .18, .3); add(hat(), t, .1, -.3)
        add(bass808(notes[i % len(notes)], min(B * .95, b - t)), t, .35)
        t += B; i += 1
beat(0, C[6], [33, 33, 36, 31])        # couplet sombre jusqu'au noir
beat(C[8], C[9], [38, 38, 41])         # reprise sur « Votre commerce répond »
# impacts sur chaque coupe (et sur « est mort »)
for c in [0, .545] + C[1:6]:
    x = ts(.6); add(np.sin(2 * np.pi * (38 + 90 * np.exp(-x * 20)) * x) * np.exp(-x * 6) + lp(rng.standard_normal(len(x)), .3) * np.exp(-x * 25) * .5, c, .6)
x = ts(1.5); add(np.sin(2 * np.pi * (30 + 60 * np.exp(-x * 8)) * x) * np.exp(-x * 2), .545, .5)   # sub sur « est mort »
# noir : coupure sèche puis souffle qui monte pendant la bascule CLOSE → OPEN
d = C[8] - C[7]; x = ts(d)
add(lp(rng.standard_normal(len(x)), .01 + .35 * (x / d) ** 2) * (x / d) ** 2 * 3 + np.sin(2 * np.pi * (200 * x + 900 * x ** 2 / d)) * (x / d) ** 3 * .25, C[7], .4)
x = ts(.3); add(np.sin(2 * np.pi * 1800 * x) * np.exp(-x * 40), C[7] + .7, .12)   # « clic » de la pancarte
# final : gros impact + accord
x = ts(2.2); add(np.sin(2 * np.pi * (28 + 80 * np.exp(-x * 9)) * x) * np.exp(-x * 1.7) * 1.3 + lp(rng.standard_normal(len(x)), .25) * np.exp(-x * 8) * .6, C[9], .9)
d = T - C[9]; x = ts(d)
add(sum(np.sin(2 * np.pi * mtof(m) * x) for m in [50, 57, 62, 66, 69]) / 5 * np.minimum(1, x / .05) * np.exp(-x * .6), C[9], .35)
for k, a in enumerate([.27, .545, .82]):
    y = ts(.4); add(np.sin(2 * np.pi * (60 + 60 * np.exp(-y * 25)) * y) * np.exp(-y * 9), C[9] + a, .5)
t = ts(1.6); ir = rng.standard_normal(len(t)) * np.exp(-t * 4); irs = [ir, np.roll(ir, 311)]
wet = np.stack([fftconvolve(out[:, c], irs[c])[:n] for c in (0, 1)], 1)
out = out + wet / np.abs(wet).max() * np.abs(out).max() * .25
out[-int(.4 * sr):] *= np.linspace(1, 0, int(.4 * sr))[:, None]
out = np.tanh(out / np.abs(out).max() * 1.4) * .9
w = wave.open('sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
