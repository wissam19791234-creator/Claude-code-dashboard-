# Bande-son de la promo Scalify : musique électronique chaleureuse et énergique (la mineur, 124 BPM), montée avant la démo,
# « drop » quand le site apparaît, cassure sur le téléphone qui se brise, impact sur « 200 € », et bruitages calés sur l'image.
# Tout est synthétisé ici (aucune piste ni échantillon sous licence). Usage : python3 audio/sound.py voix.wav sortie.wav
import sys, json, wave, subprocess, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from instr import *   # noqa: F401,F403  (SR, N, DUR, mus, sfx, add, env, lpf, hpf, bp, saw, osc, kick, clap, hat, pop, whoosh, bell…)

VO_IN, OUT = sys.argv[1], sys.argv[2]
M = json.load(open('work/montage.json'))
T200, TAP = M['t200'], M['tap']
BPM = 124; B = 60 / BPM; BAR = 4 * B

def supersaw(m, d, cut=2400, g=1.0, a=0.005, r=0.08):
    x = ts(d); s = np.zeros(len(x))
    for det in (-0.12, -0.05, 0, 0.05, 0.12): s += saw(osc(mtof(m + det), x))
    return lpf(s / 5, cut) * env(x, a, r=r) * g
def stab(ms, d=0.22, cut=3200):
    return sum(supersaw(m, d, cut, 1 / len(ms), 0.003, 0.06) for m in ms) * np.exp(-ts(d) * 6)
def sub(m, d):
    x = ts(d); return np.sin(2 * np.pi * mtof(m) * x) * env(x, 0.01, r=0.05)
def bassline(m, d):
    x = ts(d); f = mtof(m)
    s = saw(osc(f, x)) * 0.5 + np.sin(2 * np.pi * f * x)
    k = np.exp(-x * 12); return (lpf(s, 900) * (1 - k) + lpf(s, 2300) * k) * env(x, 0.004, r=0.04) * 0.6
def pluck(m, d=0.3):
    x = ts(d); s = saw(osc(mtof(m), x)) + 0.5 * np.sin(2 * np.pi * mtof(m + 12) * x); k = np.exp(-x * 20)
    return (lpf(s, 1800) * (1 - k) + lpf(s, 5300) * k) * np.exp(-x * 9) * env(x, 0.002)
def snare():
    x = ts(0.25); return (bp(rng.standard_normal(len(x)), 900, 7000) * np.exp(-x * 18) * 0.8 + np.sin(2 * np.pi * 190 * x) * np.exp(-x * 30) * 0.6)
def impact(g=1.0, d=2.2):
    x = ts(d); f = 55 + 120 * np.exp(-x * 10)
    boom = np.sin(2 * np.pi * osc(f, x)) * np.exp(-x * 2.2)
    noise = lpf(rng.standard_normal(len(x)), 2500) * np.exp(-x * 5) * 0.5
    crash = hpf(rng.standard_normal(len(x)), 4500) * np.exp(-x * 2.6) * 0.18
    return (boom + noise + crash) * g
def riser(d, f0=200, f1=6000, g=1.0):
    x = ts(d); f = f0 * (f1 / f0) ** (x / d)
    n = rng.standard_normal(len(x)); out = np.zeros(len(x)); step = 2400
    for i in range(0, len(x), step):
        seg = n[i:i + step + 400]; fc = f[min(i, len(f) - 1)]
        y = bp(seg, max(80, fc * 0.7), min(20000, fc * 1.3)); out[i:i + step] += y[:len(out[i:i + step])]
    tone = np.sin(2 * np.pi * osc(f * 0.25, x)) * 0.25
    return (out * 0.8 + tone) * (x / d) ** 2 * g
def glass():
    x = ts(1.4); s = hpf(rng.standard_normal(len(x)), 2500) * np.exp(-x * 9) * 0.7
    for k in range(26):
        t0 = rng.random() * 0.6; fr = 2500 + rng.random() * 6000; xi = ts(0.25)
        y = np.sin(2 * np.pi * fr * xi) * np.exp(-xi * (25 + rng.random() * 30))
        i = int(t0 * SR); s[i:i + len(y)] += y * (0.35 - t0 * 0.3)
    return s
def crack():
    x = ts(0.18); return hpf(rng.standard_normal(len(x)), 1800) * np.exp(-x * 40) * 0.9
def ding():
    return bell(88, 0.9, 0.35) * 0.8 + bell(95, 0.9, 0.3) * 0.35
def zip_(d=0.35):
    x = ts(d); f = 30 + 25 * np.sin(np.pi * x / d)
    return bp(rng.standard_normal(len(x)), 1200, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * osc(f, x)))) * np.sin(np.pi * x / d) * 0.5
def key():
    x = ts(0.04); return (hpf(rng.standard_normal(len(x)), 2500) * np.exp(-x * 160) + np.sin(2 * np.pi * 2200 * x) * np.exp(-x * 200) * 0.4)

# ================================================================= MUSIQUE
PROG = [(57, [69, 72, 76]), (53, [69, 72, 77]), (48, [67, 72, 76]), (55, [67, 71, 74])]   # la m – fa – do – sol
ARP = [0, 2, 1, 2, 0, 2, 1, 2]
def groove(t0, t1, level=1.0, drums=True, hats=True, stabs=True, arp=True, kick_g=0.9, filt=None):
    t = t0; bar = int(round(t0 / BAR))
    while t < t1 - 1e-6:
        root, ch = PROG[bar % 4]
        for b in range(4):
            tb = t + b * B
            if tb >= t1: break
            if drums: add(mus, kick(kick_g), tb, 0.55 * level)
            if drums and b in (1, 3): add(mus, clap(), tb, 0.22 * level, 0.05)
            if hats:
                add(mus, hat(), tb + B / 2, 0.12 * level, 0.35); add(mus, hat(), tb + B * 0.25, 0.05 * level, -0.3); add(mus, hat(), tb + B * 0.75, 0.05 * level, -0.3)
            bl = bassline(root - 12 + (12 if b == 2 else 0), B * 0.45)
            add(mus, bl, tb + B / 2, 0.38 * level)
            if stabs and b in (1, 3): add(mus, stab(ch, 0.2), tb + B / 2, 0.16 * level)
        if arp:
            for k in range(8):
                tk = t + k * B / 2
                if tk >= t1: break
                add(mus, pluck(ch[ARP[k]] + 12, 0.26), tk, 0.07 * level, -0.4 + 0.8 * (k % 2))
        bar += 1; t += BAR

# 0–0,45 : l'étincelle monte
add(sfx, whoosh(0.45, 400, 7000, 1.0), 0.02, 0.35)
add(sfx, riser(0.45, 300, 9000, 1.0), 0.0, 0.25)
# 0,45 : explosion qui révèle le logo
add(sfx, impact(1.0, 2.4), 0.45, 0.5)
for k in range(6): add(sfx, bell(96 + k * 2, 0.5, 0.3), 0.5 + k * 0.07, 0.05, -0.5 + k * 0.2)
add(mus, pad([57, 64, 69, 72], 2.6, 1400, 0.3, 0.5), 0.45, 0.22)
add(mus, sub(33, 2.4), 0.45, 0.35)
for k in range(5): add(mus, lpf(kick(0.8), 600), 0.45 + 0.48 + k * B, 0.3)       # pouls étouffé sous l'accroche
add(sfx, impact(0.6, 1.0), 1.49, 0.22)                                         # « site ? »
add(sfx, whoosh(0.35, 2500, 300, 1.0), 2.66, 0.3)
# 3 → 6,66 : le rythme démarre sur les commerces
groove(3.0, 6.66, 0.85)
for tw in (3.48, 4.03): add(sfx, whoosh(0.18, 600, 6000, 1.0), tw, 0.45)       # coups de fouet entre les vitrines
add(sfx, whoosh(0.5, 200, 2200, 1.0), 4.45, 0.3)                                # le téléphone monte
for i in range(len('restaurant ce soir')): add(sfx, key(), 4.75 + i * 0.8 / 18 + rng.random() * 0.01, 0.16, 0.2)
add(sfx, pop(1200, 1.0), 5.6, 0.18)
add(sfx, thud(70, 1.0, 0.5), 5.93, 0.45)                                         # « aucun site trouvé »
add(sfx, crack(), 6.42, 0.6); add(sfx, crack(), 6.52, 0.45)
add(sfx, glass(), 6.66, 0.85); add(sfx, impact(0.7, 1.2), 6.66, 0.5)
# 7,3 → 10,22 : montée vers la démo
add(mus, pad([57, 64, 69, 72, 76], 3.1, 2200, 1.2, 0.2), 7.3, 0.26)
add(mus, sub(33, 2.9), 7.3, 0.25)
add(sfx, whoosh(0.9, 300, 3000, 1.0), 7.3, 0.35)
add(sfx, riser(1.5, 250, 9000, 1.0), 8.72, 0.5)
add(sfx, whoosh(1.1, 200, 5000, 1.0), 8.75, 0.35)                               # plongée dans le téléphone
t = 8.72; k = 0
while t < 10.2:
    add(mus, snare(), t, 0.08 + 0.18 * (t - 8.72) / 1.5, 0.1); k += 1; t += B / (2 if t < 9.45 else 4)
# 10,22 : DROP
add(sfx, impact(1.0, 2.2), 10.22, 0.6)
groove(10.22, 24.95, 1.0)
add(mus, supersaw(81, B * 1.5, 3500, 1.0), 10.22, 0.06)
for tt in (13.4, 17.35, 19.55, 23.15):                                          # relances
    add(sfx, whoosh(0.4, 400, 6000, 1.0), tt - 0.35, 0.22); add(mus, snare(), tt - B / 2, 0.15); add(mus, snare(), tt - B / 4, 0.18)
for tc in (10.75, 14.45, 15.35, 17.5, 19.7, 21.6): add(sfx, pop(950 + 120 * (tc % 3), 1.0), tc, 0.2)   # encadrés
add(sfx, mclick(), TAP - 0.02, 0.5); add(sfx, pop(1500, 1.0), TAP, 0.25)
add(sfx, zip_(0.4), TAP + 0.05, 0.22)                                            # le ticket sort
add(sfx, ding(), TAP + 0.35, 0.2)
# 24,95 → 26,22 : coupure et montée vers le prix
add(sfx, whoosh(0.7, 3000, 300, 1.0), 24.95, 0.35)
add(mus, pad([57, 64, 69, 72], 1.4, 900, 0.3, 0.3), 24.95, 0.22)
add(sfx, riser(1.25, 300, 8000, 1.0), T200 - 1.25, 0.45)
add(sfx, impact(1.0, 2.6), T200, 0.7)
for k in range(8): add(sfx, bell(93 + (k % 4) * 3, 0.6, 0.3), T200 + 0.08 + k * 0.05, 0.06, -0.6 + k * 0.17)
groove(T200, 30.82, 0.85, stabs=True)
for tc in (M['words'][[w[3] for w in M['words']].index(8)][1], 29.7, 30.3): add(sfx, pop(1300, 1.0), tc, 0.22); add(sfx, bell(91, 0.4, 0.3), tc + 0.02, 0.06)
# 30,8 → fin : appel à l'action
add(sfx, whoosh(0.4, 600, 7000, 1.0), 30.8, 0.3)
add(sfx, impact(0.8, 1.8), 31.15, 0.55)
groove(31.15, 35.9, 0.95)
add(mus, pad([57, 64, 69, 72, 76], 5.8, 2600, 0.6, 1.2), 31.15, 0.16)
add(sfx, impact(0.7, 1.4), 31.54, 0.25)                                          # « SITE »
add(sfx, whoosh(0.35, 800, 6000, 1.0), 32.35, 0.2)
for i in range(4): add(sfx, key(), 32.45 + i * 0.07, 0.12)
add(sfx, whoosh(0.25, 1500, 7000, 1.0), 32.72, 0.3); add(sfx, pop(1700, 1.0), 32.78, 0.2)   # message envoyé
add(sfx, ding(), 33.42, 0.28)                                                    # réponse reçue
add(sfx, impact(0.8, 2.4), 35.9, 0.5)
add(mus, stab([69, 72, 76, 81], 1.2, 2600), 35.9, 0.25)
add(mus, sub(33, 1.1), 35.9, 0.3)

# ================================================================= VOIX + mixage (la musique s'efface sous la voix)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VO_IN, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; vo[:min(N, len(v))] = v[:N]
e = np.convolve(np.abs(vo), np.ones(2400) / 2400, 'same'); e = np.convolve((e > 0.01).astype(float), np.ones(9600) / 9600, 'same')
duck = 1 - 0.58 * np.clip(e * 1.4, 0, 1)
musr = reverb(mus, 1.1, 0.12)
fade = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1)
sduck = 1 - 0.35 * np.clip(e * 1.4, 0, 1)
out = musr * duck[:, None] * 0.62 + reverb(sfx, 0.9, 0.1) * sduck[:, None] * 0.7 + np.stack([vo, vo], 1) * 1.7
out *= fade[:, None]
out = np.tanh(out * 1.1) / np.tanh(1.1)
with wave.open(OUT, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(out / max(1e-6, np.abs(out).max()) * 0.95, -1, 1) * 32767).astype(np.int16).tobytes())
print('mix', OUT, f'{DUR:.2f} s')
