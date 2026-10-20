# Bande-son du format court (version Halloween : la mineur, thérémine, stinger, cri) : musique légère (≈ 15-20 % sous la voix), un « pop » sur chaque dépense, la caisse sur chaque gain,
# tampons, scratch (la musique se coupe sur « Attends »), trombone triste. Tout est synthétisé ici (aucune piste sous licence).
# Usage (depuis le dossier du projet) : python3 audio/sound.py voix.wav assets/audio/mix_raw.wav
import sys, json, wave, subprocess, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from instr import *   # noqa: F401,F403  (SR, N, DUR, mus, sfx, add, instruments…)

VO_IN, OUT = sys.argv[1], sys.argv[2]
M = json.load(open('work/montage.json'))

def pluck(m, d=0.5, bright=0.5):   # « ukulélé » par synthèse Karplus-Strong
    f = mtof(m); n = int(d * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.zeros(n); lp = 0.5 + 0.49 * bright
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = lp * buf[i % p] + (1 - lp) * buf[(i + 1) % p]
    return out * env(ts(d), 0.002, r=0.05) * 0.8
def ching():   # caisse enregistreuse : tiroir + cloche + pièces
    x = ts(0.9)
    bellv = bell(96, 0.9, 0.5) * 0.65 + np.concatenate([np.zeros(int(0.06 * SR)), bell(100, 0.84, 0.4)])[:len(x)] * 0.45
    drawer = bp(rng.standard_normal(len(x)), 300, 1800) * np.exp(-x * 30) * 0.35
    coins = np.zeros(len(x))
    for k in range(8):
        i = int((0.05 + k * 0.03) * SR); y = np.sin(2 * np.pi * (4800 + 1400 * rng.random()) * x[:3000]) * np.exp(-x[:3000] * 70)
        coins[i:i + len(y)] += y * 0.22
    return bellv + drawer + coins

# ================================================================= MUSIQUE Halloween (la mineur, 112 BPM : i – VI – iv – V), pizzicati + thérémine
def theremin(notes, t0, g):   # notes = [(midi, durée en temps)] : glissando continu, vibrato, souffle
    fs, n = [], 0
    for m, d in notes: k = int(d * B * SR); fs.append(np.full(k, mtof(m))); n += k
    f = np.concatenate(fs); f = np.convolve(f, np.ones(int(0.06 * SR)) / int(0.06 * SR), 'same')
    x = np.arange(n) / SR; f = f * 2 ** (0.035 * np.sin(2 * np.pi * 5.6 * x) * np.minimum(1, x / 0.3))
    ph = np.cumsum(f) / SR; y = np.sin(2 * np.pi * ph) + 0.18 * np.sin(4 * np.pi * ph)
    y *= np.minimum(1, x / 0.08) * np.clip((x[-1] - x) / 0.25, 0, 1)
    add(mus, y, t0, g, 0.25)
B = 60 / 118
CH = [(45, [57, 60, 64]), (41, [57, 60, 65]), (38, [57, 62, 65]), (40, [56, 59, 64])]
STRUM = [0, 0.5, 1.5, 2, 2.5, 3.5]
TH = [[(76, 1.5), (77, 0.5), (76, 1), (72, 1)], [(74, 1.5), (71, 0.5), (69, 2)], [(76, 1.5), (77, 0.5), (79, 1), (80, 1)], [(81, 2), (76, 2)]]
t = 0.9; bar = 0
while t < DUR - 1.0:
    root, ch = CH[bar % 4]
    for off in STRUM:
        tt = t + off * B
        for k, m in enumerate(ch): add(mus, pluck(m + 12, B * 0.6, 0.3), tt + k * 0.012, 0.1, -0.25 + k * 0.25)
    for bt in range(4):
        tt = t + bt * B
        add(mus, kick(0.8), tt, 0.24 if bt in (0, 2) else 0.0)
        if bt in (1, 3): add(mus, clap(), tt, 0.09, 0.1)
        add(mus, shaker(), tt + B / 2, 0.03, -0.4)
        add(mus, bass(root - 12 + (7 if bt == 3 else 0), B * 0.8), tt, 0.26)
    if bar % 4 >= 2: theremin(TH[bar % 4], t, 0.05)
    bar += 1; t += 4 * B
# petite signature finale (arpège mineur qui descend)
F = DUR - 1.6
for j, m in enumerate([81, 76, 72, 69]): add(mus, marimba(m, 0.9), F + j * 0.09, 0.12, (j - 1.5) * 0.2)

def scare():   # stinger : coup sourd + accord dissonant + souffle
    x = ts(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(np.linspace(90, 38, len(x))) / SR) * np.exp(-x * 3.2)
    cl = sum(saw(mtof(m) * x) for m in (57, 58, 63, 64, 69, 70)) / 6
    cl = lpf(cl, 3200) * np.minimum(1, x / 0.008) * np.exp(-x * 1.9)
    hiss = hpf(rng.standard_normal(len(x)), 2500) * np.exp(-x * 6) * 0.25
    return boom * 0.9 + cl * 0.7 + hiss
def scream():  # cri de dessin animé : voix glottale qui monte puis retombe, formants « A »
    x = ts(0.95); f0 = np.interp(x, [0, 0.12, 0.6, 0.95], [420, 860, 760, 520]) * 2 ** (0.03 * np.sin(2 * np.pi * 7 * x))
    src = saw(np.cumsum(f0) / SR) + 0.15 * rng.standard_normal(len(x))
    y = bp(src, 750, 1250) + 0.6 * bp(src, 1100, 1700) + 0.3 * bp(src, 2500, 3200)
    return y / (np.abs(y).max() + 1e-9) * np.minimum(1, x / 0.04) * np.clip((x[-1] - x) / 0.3, 0, 1)
def splat():   # citrouille qui éclate : coup sourd + éclaboussure humide + craquements
    x = ts(0.7)
    thump = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 45, len(x))) / SR) * np.exp(-x * 14)
    wet = bp(rng.standard_normal(len(x)), 250, 2200) * np.exp(-x * 9) * (1 + 0.6 * np.sin(2 * np.pi * 23 * x))
    crk = np.zeros(len(x))
    for k in range(9): i = int((0.01 + 0.025 * k + 0.01 * rng.random()) * SR); n = int(0.006 * SR); crk[i:i + n] += hpf(rng.standard_normal(n), 2500) * (0.9 - k * 0.08)
    return thump * 1.0 + wet * 0.8 + crk * 0.5
def oink():    # deux grognements de cochon
    out = np.zeros(int(0.75 * SR))
    for t0, d, f in ((0.0, 0.22, 190), (0.32, 0.3, 160)):
        x = ts(d); src = saw(np.cumsum(np.full(len(x), f) * (1 + 0.15 * np.sin(2 * np.pi * 31 * x))) / SR)
        y = bp(src, 450, 900) + 0.6 * bp(src, 1100, 1600); y *= np.minimum(1, x / 0.02) * np.clip((x[-1] - x) / 0.08, 0, 1)
        i = int(t0 * SR); out[i:i + len(y)] += y / (np.abs(y).max() + 1e-9)
    return out
def inflate():   # gonflage : souffle qui monte + couinement de plastique
    x = ts(0.6)
    air = bp(rng.standard_normal(len(x)), 600, 5000) * np.minimum(1, x / 0.05) * np.clip((0.6 - x) / 0.1, 0, 1)
    sweep = np.sin(2 * np.pi * np.cumsum(np.interp(x, [0, 0.45, 0.6], [220, 900, 1200])) / SR) * 0.35 * np.minimum(1, x / 0.1) * np.clip((0.6 - x) / 0.08, 0, 1)
    return air * 0.6 + sweep
def roar():      # rugissement de dinosaure : grondement grave + formants + souffle
    x = ts(1.3); f0 = np.interp(x, [0, 0.2, 0.9, 1.3], [70, 110, 95, 60]) * (1 + 0.08 * np.sin(2 * np.pi * 9 * x))
    src = saw(np.cumsum(f0) / SR) + 0.6 * rng.standard_normal(len(x))
    y = bp(src, 150, 600) + 0.7 * bp(src, 700, 1300) + 0.25 * bp(src, 2000, 3500)
    return y / (np.abs(y).max() + 1e-9) * np.minimum(1, x / 0.08) * np.clip((x[-1] - x) / 0.4, 0, 1)
def shutter():
    x = ts(0.18); y = np.zeros(len(x))
    for t0 in (0.0, 0.07): i = int(t0 * SR); n = int(0.025 * SR); y[i:i + n] += hpf(rng.standard_normal(n), 1800) * np.exp(-np.arange(n) / SR * 120)
    return y

# ================================================================= BRUITAGES (work/montage.json « sfx »)
mute = []
for e in M['sfx']:
    td, kind, gx = e[0], e[1], (e[2] if len(e) > 2 else 1.0)
    if kind == 'pop': add(sfx, pop(620, 1.0) + pop(1240, 0.4), td, 0.42, 0.1)
    elif kind == 'cash': add(sfx, ching(), td, 0.3, 0.15)
    elif kind == 'stamp': add(sfx, stamp(), td, 0.55, -0.1)
    elif kind == 'boing': add(sfx, boing(), td, 0.22, 0.2)
    elif kind == 'whoosh': add(sfx, whoosh(1.1, 250, 3200, 1.0), td, 0.3, 0.4)
    elif kind == 'scratch': add(sfx, scratch(), td - 0.08, 0.5, 0.0); mute.append((td - 0.05, td + 0.75))
    elif kind == 'sparkle': sparkle(td, 0.16)
    elif kind == 'scare': add(sfx, scare(), td, 0.75 * gx, 0.0)
    elif kind == 'scream': add(sfx, scream(), td, 0.5 * gx, -0.2)
    elif kind == 'splat': add(sfx, splat(), td, 0.6 * gx, 0.05)
    elif kind == 'oink': add(sfx, oink(), td, 0.4 * gx, 0.2)
    elif kind == 'inflate': add(sfx, inflate(), td, 0.45 * gx, -0.1)
    elif kind == 'roar': add(sfx, roar(), td, 0.55 * gx, 0.0)
    elif kind == 'shutter': add(sfx, shutter(), td, 0.6 * gx, 0.2)
    elif kind == 'trombone': trombone([(62, 0.28, 0), (61, 0.28, 0), (60, 0.28, 0), (59, 0.75, 1)], td + 0.1, 0.2)

# ================================================================= VOIX
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VO_IN, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
vo = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
vo = vo[:N] if len(vo) > N else np.concatenate([vo, np.zeros(N - len(vo), np.float32)])
vo = hpf(vo, 80)

# ================================================================= MIX : musique ≈ 15-20 % de la voix, baissée pendant qu'elle parle
mus_r = reverb(mus, 1.2, 0.15)
rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
vrms = rms(vo[np.abs(vo) > 0.01]) if np.any(np.abs(vo) > 0.01) else 0.1
mus_r *= (0.18 * vrms) / (rms(mus_r[:, 0]) + 1e-9)
evn = np.convolve(np.abs(vo), np.ones(int(0.05 * SR)) / int(0.05 * SR), 'same')
ref = np.percentile(evn[evn > 1e-4], 80); sm = np.zeros_like(evn); acc = 0.0; a = np.exp(-1 / (0.25 * SR))
for n_ in range(0, len(evn), 64):
    acc = max(min(1.0, evn[n_] / ref), acc * a ** 64); sm[n_:n_ + 64] = acc
duck = 1 - 0.35 * sm                       # 18 % → ~12 % pendant la parole
for m0, m1 in mute:                        # « Attends. » : la musique s'arrête net, puis revient
    i0, i1 = int(m0 * SR), int(m1 * SR); duck[i0:i1] = 0; duck[i1:i1 + int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:len(duck[i1:i1 + int(0.3 * SR)])]
mix = mus_r * duck[:, None] + reverb(sfx, 0.6, 0.08) * 0.8 + np.stack([vo, vo], 1)
fo = int(0.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.3
mix = mix / (np.abs(mix).max() + 1e-9) * 0.92
f = wave.open(OUT, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close()
print('ok', OUT, round(DUR, 2), 's', len(M['sfx']), 'bruitages')
