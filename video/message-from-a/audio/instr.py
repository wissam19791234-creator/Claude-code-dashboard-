# Instruments synthétisés (boîte à musique, marimba, cloches, percussions, souffles) partagés par sound.py.
# Aucun échantillon externe : tout est généré ici. Tout est synthétisé ici (aucune piste sous licence).
# Sortie : WAV 48 kHz stéréo, normalisé ensuite à -14 LUFS par ffmpeg (loudnorm).
import numpy as np, wave, json, subprocess, sys
from scipy.signal import fftconvolve, butter, sosfilt

OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_raw.wav'
SR = 48000; DUR = 30.0; N = int(SR * DUR)
rng = np.random.default_rng(11)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vo = np.zeros(N)
ts = lambda d: np.arange(int(d * SR)) / SR
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def add(buf, sig, t, g=1.0, pan=0.0):
    if buf.ndim == 2 and sig.ndim == 1:
        sig = np.stack([sig * np.sqrt(0.5 * (1 - pan)), sig * np.sqrt(0.5 * (1 + pan))], 1) * 1.414
    i = int(round(t * SR)); j = min(N, i + len(sig))
    if i < 0: sig = sig[-i:]; i = 0
    if i < N and j > i: buf[i:j] += sig[:j - i] * g

def env(x, a=0.003, r=None):
    e = np.minimum(1, x / max(a, 1e-4))
    if r is not None: e = e * np.clip((x[-1] - x) / r, 0, 1)
    return e
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lpf(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hpf(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def saw(ph): return 2 * (ph - np.floor(ph + 0.5))
def osc(f, x):  # phase intégrée (f peut varier)
    f = np.broadcast_to(f, x.shape); return np.cumsum(f) / SR

# ---------------------------------------------------------------- instruments
def epiano(m, d=1.0, g=1.0):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 1.6) + 0.32 * np.sin(4 * np.pi * f * x) * np.exp(-x * 3.5)
    s += 0.16 * np.sin(2 * np.pi * f * 7.0 * x) * np.exp(-x * 22)
    return s * (1 + 0.14 * np.sin(2 * np.pi * 4.6 * x)) * env(x, 0.004, r=0.08) * g
def vib(m, d=0.9):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 2.6) + 0.22 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 9)
    return s * (1 + 0.28 * np.sin(2 * np.pi * 5.8 * x)) * env(x, 0.002, r=0.05)
def marimba(m, d=0.5):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 7) + 0.28 * np.sin(2 * np.pi * f * 3.93 * x) * np.exp(-x * 26)
    return s * env(x, 0.0015)
def bell(m, d=1.4, g2=0.5):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 3.2) + g2 * np.sin(2 * np.pi * f * 2.756 * x) * np.exp(-x * 5) + 0.25 * np.sin(2 * np.pi * f * 5.404 * x) * np.exp(-x * 9)
    return s * env(x, 0.001)
def bass(m, d=0.45, pluck=True):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) + 0.25 * np.sin(4 * np.pi * f * x) + 0.08 * np.sin(6 * np.pi * f * x)
    return s * env(x, 0.006, r=0.05) * (np.exp(-x * 3.0) if pluck else 1)
def pad(ms, d, cut=1800, a=0.5, r=0.8):
    x = ts(d); s = np.zeros(len(x))
    for m in ms:
        for det in (-0.08, 0.0, 0.08):
            f = mtof(m + det); s += (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)) * 0.33
    s = lpf(s, cut)
    return s * np.minimum(1, x / a) * np.clip((d - x) / r, 0, 1) / len(ms)
def kick(g=1.0):
    x = ts(0.38); f = 46 + 110 * np.exp(-x * 34)
    return np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 8) * g
def clap():
    x = ts(0.2); n = bp(rng.standard_normal(len(x)), 900, 4200)
    e = np.exp(-x * 30) + 0.6 * np.exp(-np.abs(x - 0.012) * 400) + 0.5 * np.exp(-np.abs(x - 0.024) * 400)
    return n * e * 1.1
def rim():
    x = ts(0.06); return (np.sin(2 * np.pi * 1750 * x) * 0.7 + bp(rng.standard_normal(len(x)), 1500, 5000) * 0.5) * np.exp(-x * 90)
def shaker():
    x = ts(0.07); return hpf(rng.standard_normal(len(x)), 6500) * np.exp(-x * 70) * 0.7
def hat():
    x = ts(0.05); return hpf(rng.standard_normal(len(x)), 8000) * np.exp(-x * 110)
def tick(f=3200):
    x = ts(0.05); return (np.sin(2 * np.pi * f * x) * 0.6 + hpf(rng.standard_normal(len(x)), 3000) * 0.4) * np.exp(-x * 120)
def wood(m=79, d=0.2):
    x = ts(d); f = mtof(m)
    return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.3 * x)) * np.exp(-x * 34) * env(x, 0.0008)
def thud(f0=120, g=1.0, d=0.5):
    x = ts(d); f = f0 * 0.45 + f0 * np.exp(-x * 22)
    return (np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 9) + lpf(rng.standard_normal(len(x)), 900) * np.exp(-x * 28) * 0.5) * g
def stamp():
    x = ts(0.4); return thud(85, 1.0, 0.4) + bp(rng.standard_normal(len(x)), 250, 2600) * np.exp(-x * 28) * 0.6
def pop(f=900, g=1.0):
    x = ts(0.09); return np.sin(2 * np.pi * (f + f * 1.1 * np.exp(-x * 70)) * x) * np.exp(-x * 42) * env(x, 0.001) * g
def whoosh(d, f0=300, f1=4000, g=1.0):
    n = int(d * SR); x = np.arange(n) / SR; noise = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        fc = f0 * (f1 / f0) ** (i / n); seg = noise[max(0, i - 2048):i + blk]
        y = bp(seg, max(60, fc * 0.6), min(SR / 2 - 100, fc * 1.6)); out[i:i + blk] = y[-len(out[i:i + blk]):]
    return out * np.sin(np.pi * np.clip(x / d, 0, 1)) ** 1.5 * g
def swish():  # page de papier qui glisse
    return whoosh(0.34, 900, 5200, 1.0) * 0.8 + hpf(rng.standard_normal(int(0.34 * SR)), 4000) * np.exp(-ts(0.34) * 9) * 0.25
def whistle(notes, t0):  # le bonhomme siffle (notes = [(midi, durée)])
    t = t0
    for m, d in notes:
        x = ts(d); f = mtof(m) * (1 + 0.012 * np.sin(2 * np.pi * 6 * x))
        s = np.sin(2 * np.pi * osc(f, x)) + hpf(rng.standard_normal(len(x)), 3000) * 0.04
        add(sfx, s * env(x, 0.03, r=0.05), t, 0.11, -0.3); t += d
def boing():
    x = ts(0.6); f = 230 + 160 * np.sin(2 * np.pi * 7.5 * x) * np.exp(-x * 5) + 60 * np.exp(-x * 8)
    return np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 4.5) * env(x, 0.004)
def modem(d=0.9):
    x = ts(d); f = np.where((x * 9).astype(int) % 2, 1200, 2100) * (1 + 0.003 * np.sin(2 * np.pi * 40 * x))
    s = np.sin(2 * np.pi * osc(f, x)) * 0.5 + bp(rng.standard_normal(len(x)), 900, 3200) * (x > d * 0.55) * 0.5
    return s * env(x, 0.01, r=0.08)
def blip(m=84, d=0.12):
    x = ts(d); return np.sign(np.sin(2 * np.pi * mtof(m) * x)) * 0.35 * np.exp(-x * 18)
def cricket(t0, n=3):
    for k in range(n):
        x = ts(0.045); s = np.sin(2 * np.pi * 4700 * x) * np.sin(np.pi * x / 0.045) ** 2
        add(sfx, s, t0 + k * 0.065, 0.09, 0.45)
def rustle(d):
    x = ts(d); return lpf(hpf(rng.standard_normal(len(x)), 400), 2500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * x))) * env(x, 0.05, r=0.2)
def snore(d=0.7):
    x = ts(d); return lpf(rng.standard_normal(len(x)), 500) * np.sin(np.pi * x / d) ** 2 * (1 + 0.5 * np.sin(2 * np.pi * 32 * x))
def scratch():
    x = ts(0.32); f = 900 + 1600 * np.sin(np.pi * x / 0.32)
    return bp(rng.standard_normal(len(x)), 500, 3500) * 0.5 + saw(osc(f * 0.25, x)) * 0.25 * np.sin(np.pi * x / 0.32)
def party_horn():
    x = ts(0.62); f = 420 + 160 * np.clip(x / 0.18, 0, 1) + 8 * np.sin(2 * np.pi * 14 * x)
    s = np.tanh(saw(osc(f, x)) * 3) + 0.4 * np.tanh(saw(osc(f * 1.5, x)) * 3)
    return lpf(s, 3200) * env(x, 0.02, r=0.12) * 0.6
def kazoo(m, d):
    x = ts(d); f = mtof(m) * (1 + 0.01 * np.sin(2 * np.pi * 5.5 * x))
    return lpf(np.tanh(saw(osc(f, x)) * 2.5), 2400) * env(x, 0.02, r=0.06) * 0.5
def trombone(notes, t0, g=0.3):  # « wah wah… waaah »
    t = t0
    for m, d, wob in notes:
        x = ts(d); f = mtof(m) * (1 + (0.025 * np.sin(2 * np.pi * 6 * x) * np.clip((x - 0.25) / 0.2, 0, 1) if wob else 0))
        raw = saw(osc(f, x)); w = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 0.7   # « wah » : fondu sombre → clair → sombre
        s = lpf(raw, 480) * (1 - w) + lpf(raw, 1900) * w
        add(sfx, s * env(x, 0.03, r=0.08), t, g, 0.1); t += d
def ching():  # caisse enregistreuse
    s = bell(96, 1.2, 0.6) * 0.7 + bell(100, 1.2, 0.4) * 0.4
    x = ts(0.25); jing = np.zeros(len(s))
    for k in range(9):
        i = int((0.02 + k * 0.022) * SR); y = np.sin(2 * np.pi * (5200 + 900 * rng.random()) * x[:4000]) * np.exp(-x[:4000] * 60)
        jing[i:i + len(y)] += y * 0.3
    return s + jing
def mclick():
    x = ts(0.02); c = hpf(rng.standard_normal(len(x)), 2000) * np.exp(-x * 400) + np.sin(2 * np.pi * 3100 * x) * np.exp(-x * 300) * 0.5
    out = np.zeros(int(0.1 * SR)); out[:len(c)] += c; out[int(0.07 * SR):int(0.07 * SR) + len(c)] += c * 0.6; return out
def buzz(d):  # la mouche
    x = ts(d); f = 210 + 30 * np.sin(2 * np.pi * 1.3 * x) + 15 * np.sin(2 * np.pi * 3.7 * x)
    return lpf(saw(osc(f, x)), 1500) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.1 * x)) * env(x, 0.15, r=0.2)
def sparkle(t, g=0.12):
    for k, m in enumerate([96, 100, 103]): add(sfx, bell(m, 0.6, 0.3), t + k * 0.04, g, 0.3 - k * 0.3)
def steps(t0, t1, every, g=0.05, pan=0.3):
    t = t0; k = 0
    while t < t1: add(sfx, wood(88 + (k % 2) * 3, 0.06), t, g, pan); t += every; k += 1

def reverb(buf, rt=1.2, mixv=0.18):
    n = int(rt * SR); x = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-x * 6.9 / rt)[:, None]
    ir[:, 0] = lpf(ir[:, 0], 5000); ir[:, 1] = lpf(ir[:, 1], 5000); ir /= np.sqrt((ir ** 2).sum(0))
    return buf + np.stack([fftconvolve(buf[:, c], ir[:, c])[:N] for c in range(2)], 1) * mixv

