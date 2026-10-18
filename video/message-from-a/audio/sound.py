# Bande-son « Message from A » : vibrations à chaque message de A, « ding » à chaque notification Scalify,
# boîte à musique inquiétante (A) puis groove lumineux (Scalify), signature sur la carte finale.
# Usage : python3 sound.py sortie.wav [--sans-musique]   (la version sans musique laisse la place à un son tendance TikTok)
import sys, json, wave, re
import numpy as np
from instr import *   # noqa: F401,F403  (SR, N, DUR, mus, sfx, add, instruments…)

OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_raw.wav'
NO_MUSIC = '--sans-musique' in sys.argv

# minutage repris de src/script.js (source unique)
src = open('../src/script.js').read()
MSG = [(float(t), w) for t, w in re.findall(r"\{ t: ([\d.]+), who: '([AS])'", src)]
UNLOCK = float(re.search(r'UNLOCK = ([\d.]+)', src).group(1))
A_END, S0 = 13.45, 13.6

def musicbox(m, d=1.4):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 3.5) + 0.45 * np.sin(2 * np.pi * f * 4.02 * x) * np.exp(-x * 9) + 0.2 * np.sin(2 * np.pi * f * 6.9 * x) * np.exp(-x * 16)
    return s * env(x, 0.0008)
def buzz():   # vibration du téléphone posé sur une table : deux impulsions
    x = ts(0.36); f = 152 + 6 * np.sin(2 * np.pi * 31 * x)
    tone = np.sign(np.sin(2 * np.pi * osc(f, x))) * 0.5 + np.sin(2 * np.pi * osc(f, x)) * 0.5
    gate = ((x < 0.13) | ((x > 0.2) & (x < 0.33))).astype(float)
    gate = np.convolve(gate, np.ones(240) / 240, 'same')
    rattle = bp(rng.standard_normal(len(x)), 1800, 5200) * 0.25
    return lpf(tone + rattle, 2400) * gate * 0.7
def ding():   # notification Scalify (deux notes claires)
    return bell(88, 0.9, 0.3) * 0.7 + np.concatenate([np.zeros(int(0.075 * SR)), bell(95, 0.9, 0.3)])[:int(0.9 * SR)] * 0.6

# ================================================================= MUSIQUE
if not NO_MUSIC:
    # A : valse de boîte à musique en la mineur, bourdon grave, tic-tac de 23:47
    B = 60 / 84; MB = [(69, 1), (72, 1), (76, 1), (74, 1), (72, 1), (71, 1), (69, 1.5), (64, 0.5), (65, 1), (64, 1), (62, 1), (64, 3),
                       (69, 1), (72, 1), (76, 1), (77, 1), (76, 1), (74, 1), (72, 1.5), (71, 0.5), (69, 1), (68, 3)]
    t = 0.3; k = 0
    while t < A_END - 0.2:
        m, d = MB[k % len(MB)]; add(mus, musicbox(m + 12, d * B + 0.9), t, 0.16, 0.25); t += d * B; k += 1
    add(mus, pad([45, 52, 57], A_END + 0.3, cut=500, a=1.0, r=0.2), 0.0, 0.42)
    t = 0.3
    while t < A_END - 0.1:
        add(mus, tick(3400 if int(t / B) % 2 else 2700), t, 0.04, -0.45)
        if t > 8.0: add(mus, kick(0.6), t, 0.22 * min(1, (t - 8.0) / 4))   # le cœur s'accélère vers la fin
        t += B
    # Scalify : groove lumineux (do – sol – la m – fa), qui retient son souffle sur « …arrêtez »
    B2 = 60 / 118; CH = [(48, [64, 67, 72]), (43, [62, 67, 71]), (45, [64, 69, 72]), (41, [65, 69, 72])]
    ARP = [0, 1, 2, 1, 2, 0, 1, 2]; MEL = [84, 79, 83, 84, 86, 84, 79, 76]
    t = S0; i = 0
    while t < UNLOCK + 0.1:
        root, ch = CH[(i // 4) % 4]; beat = i % 4; hush = 19.6 <= t < 20.35
        if hush:
            if beat == 0: add(mus, pad(ch, 0.8, cut=700, a=0.1, r=0.3), t, 0.18)
        else:
            add(mus, kick(1.0), t, 0.36)
            if beat in (1, 3): add(mus, clap(), t, 0.12, 0.1)
            add(mus, hat(), t + B2 / 2, 0.05, 0.35); add(mus, shaker(), t + B2 / 4, 0.03, -0.4)
            add(mus, bass(root - 12, B2 * 0.45), t, 0.3); add(mus, bass(root - 12, B2 * 0.35), t + B2 / 2, 0.2)
            for h in range(2): add(mus, marimba(ch[ARP[(i * 2 + h) % 8]] + 12, 0.42), t + h * B2 / 2, 0.1, -0.35 if h else 0.35)
            if beat == 0: add(mus, pad(ch, 4 * B2 + 0.1, cut=2600, a=0.06, r=0.3), t, 0.16)
            if i >= 8 and beat in (0, 2): add(mus, bell(MEL[(i // 2) % 8], 0.7, 0.3), t, 0.04, 0.2)
        t += B2; i += 1
    # signature : accord final sur la carte « Lancement dans 15 jours »
    F = UNLOCK + 0.3
    add(mus, pad([48, 55, 60, 64, 67, 72], DUR - F, cut=3200, a=0.05, r=1.0), F, 0.42)
    add(mus, bass(36, 1.8, pluck=False), F, 0.3); add(mus, kick(1.0), F, 0.45)
    for j, m in enumerate([72, 76, 79, 84, 88, 91]): add(mus, marimba(m, 0.9), F + j * 0.05, 0.16, (j - 2.5) * 0.18)
    add(mus, bell(84, 2.4, 0.4), F + 0.02, 0.12)

# ================================================================= BRUITAGES
for t, who in MSG:
    if who == 'A': add(sfx, buzz(), t, 0.55, -0.1)
    else: add(sfx, ding(), t, 0.3, 0.15)
add(sfx, whoosh(0.18, 600, 2400, 0.8), A_END - 0.05, 0.12)                    # bascule de l'ambiance
add(sfx, tick(2600), UNLOCK - 0.3, 0.12); add(sfx, whoosh(0.55, 500, 4200, 1.0), UNLOCK, 0.18)   # déverrouillage
for k, tt in enumerate([26.55, 26.68, 26.85, 26.97, 27.25, 27.45, 27.7]): add(sfx, pop(700 + k * 90, 0.7), tt, 0.1, -0.3 + k * 0.1)

# ================================================================= MIX
M = reverb(mus, 1.5, 0.24); S = reverb(sfx, 0.8, 0.1)
mix = M * 0.6 + S * 0.9
fo = int(0.8 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.4
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
mix = np.tanh(mix * 0.9) / np.tanh(0.9); mix = mix / np.abs(mix).max() * 0.9
f = wave.open(OUT, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close()
print('ok', OUT, DUR, 'sans musique' if NO_MUSIC else 'avec musique', len(MSG), 'notifications')
