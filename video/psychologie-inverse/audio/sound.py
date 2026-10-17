# Bande-son de la pub « psychologie inverse » : bossa d'ascenseur (la notice), gags sonores calés image,
# trombone triste, puis groove lumineux au retournement. Tout est synthétisé ici (aucune piste sous licence).
# Sortie : WAV 48 kHz stéréo, normalisé ensuite à -14 LUFS par ffmpeg (loudnorm).
import numpy as np, wave, json, subprocess, sys
from scipy.signal import fftconvolve, butter, sosfilt

OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_raw.wav'
SR = 48000; DUR = 33.0; N = int(SR * DUR)
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

# ================================================================= MUSIQUE 1 : bossa d'ascenseur (0 → 18,45 s)
B = 60 / 116; END1 = 18.45
CH = [(48, [64, 67, 71, 74]), (45, [60, 64, 67, 72]), (50, [65, 69, 72, 76]), (43, [65, 67, 71, 74])]   # Cmaj7 Am7 Dm7 G7
MEL = [(76, 1.5), (79, 0.5), (81, 1.0), (79, 1.0), (76, 1.5), (74, 0.5), (72, 2.0), (74, 1.5), (76, 0.5), (77, 1.0), (76, 1.0), (74, 1.5), (71, 0.5), (72, 2.0)]
quiet = lambda t: 13.1 <= t < 15.42          # étape 4 : « ne postez rien » → la musique se tait (criquets)
bar = 0; t = 0.0
while t < END1 - 0.05:
    root, ch = CH[bar % 4]
    for off, nn in ((0, root), (1.5, root + 7), (2, root), (3.5, root + 7)):
        tt = t + off * B
        if tt < END1 and not quiet(tt): add(mus, bass(nn - 12, B * 1.2), tt, 0.4)
    for off in (0, 1.5, 3):
        tt = t + off * B
        if tt < END1 and not quiet(tt):
            for k, m in enumerate(ch): add(mus, epiano(m, B * 1.4), tt + k * 0.008, 0.07, -0.3 + k * 0.2)
    for off in ((0, 1.5, 3) if bar % 2 == 0 else (1, 2.5)):
        tt = t + off * B
        if tt < END1 and not quiet(tt): add(mus, rim(), tt, 0.12, 0.25)
    for e in range(8):
        tt = t + e * B / 2
        if tt < END1 and not quiet(tt): add(mus, shaker(), tt, 0.035 + 0.02 * (e % 2), -0.4)
    bar += 1; t += 4 * B
t = 2 * 4 * B; k = 0      # la mélodie de vibraphone entre à la 3e mesure
while t < END1 - 0.3:
    m, d = MEL[k % len(MEL)]
    if not quiet(t): add(mus, vib(m, d * B + 0.4), t, 0.085, 0.2)
    t += d * B; k += 1
# fin de la bossa : coupure nette (disque rayé) sur « Bravo »
add(sfx, scratch(), 18.3, 0.22)

# ================================================================= MUSIQUE 2 : groove lumineux (21,4 → 33 s)
B2 = 0.5; T2 = 21.4
CH2 = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]   # C G Am F
ARP = [0, 1, 2, 1, 2, 0, 1, 2]
MEL2 = [79, 76, 79, 81, 79, 76, 74, 76, 79, 81, 84, 83, 81, 79, 76, 74]
tension = lambda t: 29.2 <= t < 31.56          # « Et surtout… ne cliquez pas » : le groove retient son souffle
FINAL = 31.82
t = T2; i = 0
while t < FINAL - 0.01:
    root, ch = CH2[(i // 4) % 4]; beat = i % 4
    if tension(t):
        add(mus, hat(), t, 0.05, 0.3); add(mus, hat(), t + B2 / 2, 0.03, -0.3)
        if beat == 0: add(mus, pad([48, 55, 62], 4 * B2 + 0.2, cut=700, a=0.3, r=0.3), t, 0.25)
    else:
        add(mus, kick(1.0), t, 0.4)
        if beat in (1, 3): add(mus, clap(), t, 0.15, 0.1)
        add(mus, hat(), t + B2 / 2, 0.06, 0.35)
        add(mus, bass(root - 12, B2 * 0.45), t, 0.32); add(mus, bass(root - 12, B2 * 0.4), t + B2 / 2, 0.22)
        for h in range(2):
            add(mus, marimba(ch[ARP[(i * 2 + h) % 8]] + 12, 0.45), t + h * B2 / 2, 0.12, -0.35 if h else 0.35)
        if beat == 0: add(mus, pad(ch, 4 * B2 + 0.1, cut=2600, a=0.05, r=0.3), t, 0.2)
        if i >= 8: add(mus, bell(MEL2[i % 16] + 12, 0.8, 0.3), t, 0.04, 0.2)
    t += B2; i += 1
# accord final (logo) puis fondu
add(mus, pad([48, 55, 60, 64, 67, 72], DUR - FINAL, cut=3000, a=0.05, r=1.0), FINAL, 0.5)
add(mus, bass(36, 1.6, pluck=False), FINAL, 0.35); add(mus, kick(1.0), FINAL, 0.5)
for j, m in enumerate([72, 76, 79, 84, 88]): add(mus, marimba(m, 0.9), FINAL + j * 0.06, 0.2, (j - 2) * 0.2)
add(mus, bell(84, 2.6, 0.4), FINAL + 0.02, 0.14)

# ================================================================= BRUITAGES
# --- accroche
add(sfx, pop(650), 0.06, 0.22)
add(sfx, thud(140, 0.8, 0.35), 1.12, 0.28)
add(sfx, whoosh(0.18, 600, 3000, 0.8), 1.3, 0.14); add(sfx, stamp(), 1.47, 0.6)
add(sfx, thud(120, 0.9, 0.4), 1.66, 0.3)
add(sfx, whoosh(0.5, 2500, 600, 0.8), 2.3, 0.1)
add(sfx, swish(), 3.5, 0.18)
add(sfx, pop(1100), 4.36, 0.16); sparkle(4.56, 0.08)
x = ts(0.42); add(sfx, bp(rng.standard_normal(len(x)), 2500, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * x)) * env(x, 0.02, r=0.08), 4.95, 0.07)  # feutre
# --- les 5 pages : glissé de papier + « toc » du numéro
PAGES = [6.0, 8.2, 10.4, 13.05, 15.45]
for k, p in enumerate(PAGES):
    add(sfx, swish(), p - 0.08 if k else 5.84, 0.2)
    add(sfx, wood(72 + k * 2, 0.22), p + 0.2, 0.22)
# 1 : il siffle, toiles, araignée, « FERMÉ ? »
whistle([(84, 0.18), (88, 0.32), (84, 0.16), (81, 0.36), (83, 0.18), (84, 0.4)], 6.35)
add(sfx, boing(), 7.18, 0.32)
add(sfx, stamp(), 7.79, 0.5)
# 2 : les bulles d'avis s'empilent
for k in range(6): add(sfx, pop(620 + k * 120), 8.64 + k * 0.22, 0.24, -0.5 + k * 0.2)
x = ts(1.6); add(sfx, hpf(np.sin(2 * np.pi * 660 * x) * np.sin(2 * np.pi * 1.6 * x) ** 2, 500) * 0.3, 8.5, 0.05, -0.6)   # musique qui fuit du casque
# 3 : modem, étincelles, compteur
add(sfx, modem(0.9), 10.6, 0.06, 0.3)
add(sfx, pop(900), 11.0, 0.14); sparkle(11.3, 0.07)
add(sfx, blip(84, 0.08), 12.22, 0.12); add(sfx, blip(91, 0.14), 12.3, 0.12)
# 4 : silence, criquets, virevoltant
for c in [13.45, 13.95, 14.35, 14.85, 15.2]: cricket(c)
add(sfx, rustle(2.0), 13.4, 0.12, 0.3)
for k in range(4): add(sfx, thud(200, 0.5, 0.2), 13.65 + k * 0.5, 0.12, 0.5 - k * 0.3)
add(sfx, pop(500), 14.03, 0.15)
# 5 : ronflement, message, horloge qui s'emballe, pas du client, réveil, réponse
add(sfx, snore(0.6), 15.7, 0.1, -0.4); add(sfx, snore(0.6), 16.35, 0.08, -0.4)
add(sfx, pop(800), 16.2, 0.22); add(sfx, pop(1150), 16.27, 0.16)
tt = 16.32; gap = 0.16
while tt < 17.6: add(sfx, tick(2900 if int(tt * 50) % 2 else 2300), tt, 0.09, -0.5); tt += gap; gap = max(0.045, gap * 0.86)
steps(17.0, 17.65, 0.17, 0.06, 0.6)
add(sfx, bell(91, 0.4, 0.2), 17.6, 0.12); add(sfx, bell(96, 0.5, 0.2), 17.66, 0.1)
add(sfx, whoosh(0.18, 1200, 4000, 0.7), 17.68, 0.1); add(sfx, pop(1300), 17.74, 0.24)
add(sfx, swish(), 18.02, 0.2)
# --- bravo : langue de belle-mère, confettis, petite fanfare ironique, mouche, pas, trombone triste
add(sfx, party_horn(), 18.5, 0.32, -0.3)
for k in range(10): add(sfx, pop(1500 + 300 * (k % 4), 0.7), 18.52 + k * 0.025, 0.08, (k % 3 - 1) * 0.6)
for j, (m, d) in enumerate([(72, 0.12), (72, 0.12), (79, 0.45)]): add(sfx, kazoo(m, d), 18.62 + [0, 0.14, 0.28][j], 0.12, 0.2)
add(sfx, buzz(2.6), 18.6, 0.05, -0.5)
steps(19.05, 20.6, 0.2, 0.04, 0.3)
trombone([(58, 0.32, False), (57, 0.32, False), (56, 0.32, False), (55, 0.9, True)], 20.36, 0.2)
# --- retournement
add(sfx, whoosh(0.4, 400, 4500, 1.0), 21.08, 0.28)
add(sfx, thud(90, 0.9, 0.4), 21.42, 0.25); sparkle(21.42, 0.1)
add(sfx, pop(700), 22.0, 0.2); add(sfx, bell(88, 0.8, 0.3), 22.04, 0.12)
add(sfx, swish(), 22.5, 0.16)
for k in range(5): add(sfx, bell(84 + [0, 2, 4, 7, 9][k], 0.6, 0.35), 23.2 + k * 0.12, 0.13, -0.4 + k * 0.2)
add(sfx, whoosh(0.2, 2000, 5000, 0.7), 23.66, 0.08); add(sfx, pop(1200), 24.57, 0.15)
# --- offre
add(sfx, swish(), 25.37, 0.2)
for k in range(5): add(sfx, pop(700 + k * 140), 25.66 + k * 0.07, 0.15, -0.5 + k * 0.25)
add(sfx, ching(), 25.74, 0.3); add(sfx, thud(110, 0.8, 0.35), 25.78, 0.25)
add(sfx, whoosh(0.2, 700, 2500, 0.8), 27.1, 0.12); add(sfx, stamp(), 27.29, 0.62)
x = ts(0.5); add(sfx, bp(rng.standard_normal(len(x)), 2000, 5500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * x))) * env(x, 0.02, r=0.1), 28.5, 0.07)  # stylo
add(sfx, whoosh(0.3, 900, 3500, 0.7), 28.6, 0.08)
# --- fin : avertissement, curseur qui hésite… et clique
add(sfx, swish(), 29.07, 0.2)
add(sfx, thud(130, 0.8, 0.35), 30.4, 0.3)
add(sfx, whoosh(0.4, 3000, 800, 0.6), 30.44, 0.08)
add(sfx, tick(2600), 30.95, 0.05); add(sfx, tick(2400), 31.15, 0.05)
add(sfx, mclick(), 31.56, 0.5); add(sfx, thud(160, 0.7, 0.3), 31.58, 0.3); add(sfx, pop(520), 31.6, 0.2)
add(sfx, whoosh(0.5, 500, 3500, 0.6), 31.62, 0.08)

# ================================================================= VOIX
lines = json.load(open('vo_trim/lines.json'))
START = {'v01': 0.12, 'v02': 2.45, 'v03': 6.10, 'v04': 8.30, 'v05': 10.50, 'v06': 13.15, 'v07': 15.55, 'v08': 18.50, 'v09': 21.35, 'v10': 25.55, 'v12': 29.25}
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16) / 32768.0
for k, t0 in START.items(): add(vo, load(f'vo_trim/{k}.wav'), t0)
vo = hpf(vo, 90); vo = np.tanh(vo * 2.0) / np.tanh(2.0)

# ================================================================= MIX
mus = reverb(mus, 1.4, 0.2); sfx = reverb(sfx, 0.9, 0.12)
evn = np.convolve(np.abs(vo), np.ones(int(0.04 * SR)) / int(0.04 * SR), 'same')
a = np.exp(-1 / (0.18 * SR)); sm = np.zeros_like(evn); acc = 0.0      # relâchement doux (180 ms)
ref = np.percentile(evn[evn > 1e-4], 85) + 1e-9
for n_ in range(0, len(evn), 64):
    v = min(1.0, evn[n_] / ref); acc = max(v, acc * a ** 64); sm[n_:n_ + 64] = acc
duck = 1 - 0.55 * sm
mix = mus * 0.55 * duck[:, None] + sfx * 0.85 * (0.8 + 0.2 * duck[:, None]) + np.stack([vo, vo], 1) * 1.0
fo = int(0.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.4
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
mix = np.tanh(mix * 0.9) / np.tanh(0.9); mix = mix / np.abs(mix).max() * 0.9
f = wave.open(OUT, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close()
print('ok', OUT, DUR)
