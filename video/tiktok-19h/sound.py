# Voix off placée sur la timeline + musique synthétisée (sombre → bascule → lumineuse)
import numpy as np, wave, json, subprocess
from scipy.signal import lfilter, fftconvolve
TL = json.load(open('timeline.json')); C = TL['cuts']; T = TL['end']; LN = TL['lines']
sr = 48000; n = int(sr * T); rng = np.random.default_rng(5)
mus = np.zeros((n, 2)); vo = np.zeros(n)
ts = lambda d: np.arange(int(d * sr)) / sr
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, a: lfilter([a], [1, a - 1], x)
def add(buf, sig, t, g=1., pan=0.):
    if buf.ndim == 2 and sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    i = int(t * sr); j = min(n, i + len(sig))
    if i < n: buf[i:j] += sig[:j - i] * g
for k, L in LN.items():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'vo/{k}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True).stdout
    add(vo, np.frombuffer(raw, np.int16) / 32768., L['start'])
B = 60 / 100
kick = lambda: (lambda x: np.tanh(np.sin(2 * np.pi * (45 + 110 * np.exp(-x * 30)) * x) * np.exp(-x * 7) * 2))(ts(.4))
hat = lambda: (lambda x: np.diff(np.r_[0, rng.standard_normal(len(x))]) * np.exp(-x * 90))(ts(.05))
def bed(a, b, notes, bright):
    t = a; i = 0
    while t < b - 1e-3:
        add(mus, kick(), t, .7)
        add(mus, hat(), t + B / 2, .12, .3)
        if bright: add(mus, hat(), t + B / 4, .06, -.3); add(mus, hat(), t + 3 * B / 4, .06, -.3)
        d = min(B, b - t); x = ts(d)
        add(mus, np.tanh(np.sin(2 * np.pi * mtof(notes[i % len(notes)]) * x) * 1.6) * np.minimum(1, (d - x) / .03), t, .3)
        t += B; i += 1
    d = b - a; x = ts(d)
    chord = [45, 52, 55, 60] if not bright else [50, 57, 62, 66, 69]
    add(mus, sum(np.sin(2 * np.pi * mtof(m) * x + .3 * np.sin(2 * np.pi * .3 * x)) for m in chord) / len(chord) * np.minimum(1, x / .4) * np.minimum(1, (d - x) / .2), a, .22)
flip = C[3]
bed(0, flip - .02, [33, 33, 36, 31], False)
# bascule : petit silence + montée pendant que la pancarte se retourne
x = ts(1.2); add(mus, lp(rng.standard_normal(len(x)), .02) * (x / 1.2) ** 2 * 2.5, flip, .25)
bed(flip + 1.2, T - .6, [38, 38, 41, 43], True)
for c in C[1:]:
    x = ts(.5); add(mus, np.sin(2 * np.pi * (40 + 80 * np.exp(-x * 20)) * x) * np.exp(-x * 6), c, .5)
x = ts(2); add(mus, np.sin(2 * np.pi * (30 + 70 * np.exp(-x * 9)) * x) * np.exp(-x * 1.8), C[-1], .8)
t = ts(1.4); ir = rng.standard_normal(len(t)) * np.exp(-t * 4)
mus = mus + np.stack([fftconvolve(mus[:, c], np.roll(ir, 200 * c))[:n] for c in (0, 1)], 1) * .02
# ducking de la musique sous la voix
envv = np.convolve(np.abs(vo), np.ones(2400) / 2400, 'same'); duck = 1 - .55 * np.clip(envv / (envv.max() * .25), 0, 1)
mus = mus / np.abs(mus).max() * .55 * duck[:, None]
vo = vo / np.abs(vo).max() * .95
mix = mus + vo[:, None]; mix[-int(.5 * sr):] *= np.linspace(1, 0, int(.5 * sr))[:, None]
mix = mix / np.abs(mix).max() * .9
w = wave.open('sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
