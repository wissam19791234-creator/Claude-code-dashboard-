# Bande-son « studio 3D » : arrangement, bruitages calés sur les objets 3D, voix, mixage.
# Instruments dans instr.py (tout est synthétisé, aucune piste sous licence). Sortie : WAV 48 kHz stéréo.
import sys, json, wave, subprocess
import numpy as np
from instr import *   # noqa: F401,F403  (SR, N, DUR, mus, sfx, vo, add, instruments…)

OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_raw.wav'

def chime(t, notes, g=0.1, gap=0.05, pan=0.0):
    for k, m in enumerate(notes): add(sfx, bell(m, 0.9, 0.35), t + k * gap, g, pan)
def glass(m=96, g=0.12, pan=0.0):
    x = ts(1.2); f = mtof(m)
    return (np.sin(2 * np.pi * f * x) * np.exp(-x * 4) + 0.4 * np.sin(2 * np.pi * f * 2.01 * x) * np.exp(-x * 7)) * env(x, 0.001) * g
def clink():
    x = ts(0.6); s = sum(np.sin(2 * np.pi * f * x) * np.exp(-x * d) for f, d in ((2350, 9), (3710, 12), (5230, 16)))
    return s * env(x, 0.0008) * 0.5
def bloop(f0=500, f1=1100):
    x = ts(0.14); f = f0 + (f1 - f0) * np.clip(x / 0.07, 0, 1)
    return np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 26) * env(x, 0.002)
def soft_thud(g=1.0):
    x = ts(0.3); return (np.sin(2 * np.pi * osc(70 + 90 * np.exp(-x * 30), x)) * np.exp(-x * 14) + lpf(rng.standard_normal(len(x)), 600) * np.exp(-x * 40) * 0.3) * g
def switch_click():
    x = ts(0.06); c = hpf(rng.standard_normal(len(x)), 1800) * np.exp(-x * 220) + np.sin(2 * np.pi * 1900 * x) * np.exp(-x * 160) * 0.6
    out = np.zeros(int(0.12 * SR)); out[:len(c)] += c; out[int(0.045 * SR):int(0.045 * SR) + len(c)] += c * 0.7; return out
def rise_swell(d, m0, m1):
    x = ts(d); f = mtof(m0) * (mtof(m1) / mtof(m0)) ** (x / d)
    return (np.sin(2 * np.pi * osc(f, x)) * 0.4 + whoosh(d, 500, 6000, 0.6)[:len(x)]) * (x / d) ** 2

# ================================================================= MUSIQUE
B = 60 / 112; G0 = 3.8                       # le groove part avec le téléphone
CH = [(48, [64, 67, 71, 74]), (45, [64, 67, 72, 76]), (41, [64, 67, 69, 72]), (43, [62, 67, 71, 74])]   # Cmaj9 Am9 Fmaj9 G6
ARP = [0, 2, 1, 3, 2, 1, 3, 0]
MEL = [79, None, 76, 79, 81, None, 79, 76, 74, None, 76, 72, 74, 76, None, None]
LIBRE = (17.75, 21.4)                        # « temps libre » : demi-tempo, feutré
FIN = 28.9                                   # signature

# --- accroche : pulsation sourde, tic-tac, montée, déclic de l'interrupteur
add(mus, pad([36, 43, 48], 3.9, cut=600, a=0.6, r=0.4), 0.0, 0.5)
t = 0.15
while t < 2.9: add(mus, tick(3000), t, 0.05, 0.3); add(mus, kick(0.5), t, 0.18); t += B
add(sfx, rise_swell(0.8, 60, 84), 2.15, 0.12)
add(sfx, switch_click(), 2.96, 0.45)
for k, m in enumerate([72, 76, 79, 84, 88]): add(sfx, marimba(m, 0.6), 3.02 + k * 0.035, 0.16, -0.4 + k * 0.2)
add(mus, pad([60, 64, 67, 71, 74], 1.0, cut=3000, a=0.05, r=0.6), 3.0, 0.3)

# --- groove
t = G0; i = 0
while t < DUR - 0.6:
    root, ch = CH[(i // 4) % 4]; beat = i % 4; libre = LIBRE[0] <= t < LIBRE[1]
    if t >= FIN:
        break
    if libre:
        if beat == 0: add(mus, kick(0.7), t, 0.3); add(mus, pad(ch, 4 * B + 0.2, cut=1200, a=0.3, r=0.5), t, 0.3)
        if beat == 2: add(mus, rim(), t, 0.06, 0.3)
        add(mus, epiano(ch[ARP[i % 8]], B * 1.6), t, 0.05, 0.25)
        if beat in (0, 2): add(mus, bass(root - 12, B * 1.6, pluck=False), t, 0.22)
    else:
        add(mus, kick(1.0), t, 0.36)
        if beat in (1, 3): add(mus, clap(), t, 0.11, 0.1)
        add(mus, hat(), t + B / 2, 0.05, 0.35); add(mus, shaker(), t + B / 4, 0.03, -0.4); add(mus, shaker(), t + 3 * B / 4, 0.03, -0.4)
        add(mus, bass(root - 12, B * 0.45), t, 0.3); add(mus, bass(root - 12 + (7 if beat == 3 else 0), B * 0.35), t + B / 2, 0.2)
        for h in range(2): add(mus, marimba(ch[ARP[(i * 2 + h) % 8]] + 12, 0.42), t + h * B / 2, 0.09, -0.35 if h else 0.35)
        if beat == 0: add(mus, pad(ch, 4 * B + 0.1, cut=2600, a=0.08, r=0.3), t, 0.16)
        m = MEL[i % 16]
        if m and i >= 8: add(mus, bell(m + 12, 0.7, 0.3), t, 0.035, 0.2)
    t += B; i += 1
# signature finale (logo) puis fondu
add(mus, pad([48, 55, 60, 64, 67, 74], DUR - FIN, cut=3200, a=0.05, r=1.0), FIN, 0.45)
add(mus, bass(36, 1.6, pluck=False), FIN, 0.3); add(mus, kick(1.0), FIN, 0.45)
for j, m in enumerate([72, 76, 79, 84, 88, 91]): add(mus, marimba(m, 0.9), FIN + j * 0.05, 0.17, (j - 2.5) * 0.18)
add(mus, bell(84, 2.4, 0.4), FIN + 0.02, 0.12)

# ================================================================= BRUITAGES (calés sur world.js)
add(sfx, pop(520), 0.18, 0.12)                                           # l'interrupteur apparaît
add(sfx, whoosh(0.45, 2500, 500, 0.8), 3.6, 0.1)                         # il s'éloigne
add(sfx, whoosh(0.55, 400, 3500, 0.9), 3.72, 0.14)                       # le téléphone monte
for k in range(3): add(sfx, bloop(500 + k * 160, 1000 + k * 220), 5.25 + k * 0.25, 0.2, -0.3 + k * 0.3)   # blocs rangés
chime(5.85, [88, 93], 0.1)                                               # « site mis à jour »
for k in range(5): add(sfx, glass(91 + [0, 2, 4, 7, 9][k]), 7.0 + k * 0.08, 0.9, -0.5 + k * 0.25)          # étoiles
add(sfx, pop(1000), 7.58, 0.18); add(sfx, bloop(700, 1400), 7.78, 0.14)  # bulle cochée
for k in range(3): add(sfx, pop(1300 + k * 120, 0.6), 7.6 + k * 0.3, 0.07, 0.4)
add(sfx, whoosh(0.3, 3000, 600, 0.9), 9.6, 0.12)                         # l'épingle tombe
for k, tt in enumerate([9.875, 10.129, 10.256, 10.32]): add(sfx, soft_thud(1.0 - k * 0.25), tt, 0.35, 0.3)
for tt in (9.88, 10.62): add(sfx, glass(84, 0.1), tt, 0.7, 0.3)          # ondes
chime(10.6, [91, 96], 0.08)                                              # « mis à jour aujourd'hui »
for k in range(5): add(sfx, whoosh(0.32, 1200, 4500, 0.7), 12.26 + k * 0.08, 0.06, -0.5 + k * 0.2)   # posts qui s'envolent
for k in range(5): add(sfx, pop(1500 + k * 140, 0.8), 13.06 + k * 0.07, 0.12, -0.4)                   # cœurs
chime(13.1, [88, 93], 0.07)
for k, m in enumerate([(600, 1100), (800, 1500), (600, 1100), (800, 1500)]): add(sfx, bloop(*m), [14.95, 15.35, 15.75, 16.15][k], 0.2, -0.4 if k % 2 == 0 else 0.4)
tt = 16.3; gap = 0.09                                                    # l'horloge file jusqu'à 3 h
while tt < 16.95: add(sfx, tick(3200), tt, 0.05, -0.4); tt += gap; gap = gap * 1.12
add(sfx, glass(96, 0.12), 16.95, 1.0, -0.4)
add(sfx, whoosh(0.5, 3000, 300, 0.9), 17.6, 0.12)                        # tout s'en va
for k, tt in enumerate([19.15, 19.35, 19.45]): add(sfx, clink(), tt, 0.32 - k * 0.1, -0.1)               # la tasse se pose
for tt in (20.31, 20.67, 20.85): add(sfx, soft_thud(0.6), tt, 0.28, 0.4); add(sfx, bloop(300, 220), tt, 0.08, 0.4)   # ballon
add(sfx, whoosh(0.4, 2500, 500, 0.8), 21.12, 0.1)
add(sfx, glass(88, 0.12), 21.8, 1.0); add(sfx, glass(95, 0.1), 21.84, 1.0)                              # la pièce
add(sfx, whoosh(0.6, 600, 5000, 1.0), 23.12, 0.14); chime(23.62, [84, 88, 91, 96], 0.09, 0.04)          # elle se retourne
for k in range(15): add(sfx, pop(900 + k * 60, 0.7), 24.42 + k * 0.035, 0.09, -0.5 + (k % 5) * 0.25)   # 15 places
add(sfx, whoosh(0.4, 2500, 500, 0.8), 25.45, 0.1)
add(sfx, pop(520), 25.78, 0.12); add(sfx, switch_click(), 26.0, 0.25)                                 # l'interrupteur revient
add(sfx, pop(700), 27.66, 0.18)                                                                        # le bouton apparaît
add(sfx, switch_click(), 28.12, 0.5); add(sfx, soft_thud(0.8), 28.14, 0.3); add(sfx, glass(96, 0.1), 28.18, 1.0)   # clic « bio »

# ================================================================= VOIX
START = {'v01': 0.15, 'v02': 4.0, 'v03': 6.85, 'v04': 9.3, 'v05': 12.0, 'v06': 14.6, 'v07': 18.1, 'v08': 21.6, 'v09': 25.9}
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16) / 32768.0
for k, t0 in START.items(): add(vo, load(f'vo_trim/{k}.wav'), t0)
voc = hpf(vo, 90); voc = np.tanh(voc * 2.0) / np.tanh(2.0)

# ================================================================= MIX
M = reverb(mus, 1.5, 0.22); S = reverb(sfx, 1.0, 0.14)
evn = np.convolve(np.abs(voc), np.ones(int(0.04 * SR)) / int(0.04 * SR), 'same')
ref = np.percentile(evn[evn > 1e-4], 85) + 1e-9; a = np.exp(-1 / (0.2 * SR)); sm = np.zeros_like(evn); acc = 0.0
for n_ in range(0, len(evn), 64):
    acc = max(min(1.0, evn[n_] / ref), acc * a ** 64); sm[n_:n_ + 64] = acc
duck = 1 - 0.5 * sm
mix = M * 0.55 * duck[:, None] + S * 0.85 * (0.8 + 0.2 * duck[:, None]) + np.stack([voc, voc], 1) * 1.0
fo = int(0.7 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.4
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
mix = np.tanh(mix * 0.9) / np.tanh(0.9); mix = mix / np.abs(mix).max() * 0.9
f = wave.open(OUT, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close()
print('ok', OUT, DUR)
