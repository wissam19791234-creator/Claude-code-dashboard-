# Bande-son : musique légère et entraînante (≈ 15-20 % sous la voix, jamais par-dessus), « ding » de caisse
# enregistreuse sur chaque chiffre important, voix rythmée. Tout est synthétisé ici (aucune piste sous licence).
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

# ================================================================= MUSIQUE (do majeur, 112 BPM : I – V – vi – IV)
B = 60 / 112
CH = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]
STRUM = [0, 0.5, 1.5, 2, 2.5, 3.5]
MEL = [76, 79, 81, 79, 76, 74, 72, 74]
t = 0.0; bar = 0
while t < DUR - 1.0:
    root, ch = CH[bar % 4]
    for off in STRUM:
        tt = t + off * B
        for k, m in enumerate(ch): add(mus, pluck(m + 12, B * 0.9, 0.45), tt + k * 0.012, 0.11, -0.25 + k * 0.25)
    for bt in range(4):
        tt = t + bt * B
        add(mus, kick(0.8), tt, 0.24 if bt in (0, 2) else 0.0)
        if bt in (1, 3): add(mus, clap(), tt, 0.1, 0.1)
        add(mus, shaker(), tt + B / 2, 0.035, -0.4)
        add(mus, bass(root - 12 + (7 if bt == 3 else 0), B * 0.8), tt, 0.26)
    if bar % 2 == 1:
        for j in range(4): add(mus, marimba(MEL[(bar * 2 + j) % 8] + 12, 0.4), t + j * B, 0.05, 0.3)
    bar += 1; t += 4 * B
# petite signature finale
F = DUR - 1.6
for j, m in enumerate([72, 76, 79, 84]): add(mus, marimba(m, 0.9), F + j * 0.08, 0.12, (j - 1.5) * 0.2)

# ================================================================= DING sur chaque chiffre
for td in M['dings']: add(sfx, ching(), td, 0.32, 0.15)

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
mix = mus_r * duck[:, None] + reverb(sfx, 0.6, 0.08) * 0.8 + np.stack([vo, vo], 1)
fo = int(0.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.3
mix = mix / (np.abs(mix).max() + 1e-9) * 0.92
f = wave.open(OUT, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close()
print('ok', OUT, round(DUR, 2), 's', len(M['dings']), 'ding')
