# Bande-son de la pub isométrique : musique (la mineur → do majeur), bruitages calés image, voix off.
# Tout est synthétisé ici (aucune piste sous licence). Sortie : mix.wav 48 kHz stéréo.
import numpy as np, wave, json, subprocess, sys
from scipy.signal import lfilter, fftconvolve, butter, sosfilt

OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix.wav'
SR = 48000; DUR = 32.6; N = int(SR * DUR)
rng = np.random.default_rng(7)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vo = np.zeros(N)
ts = lambda d: np.arange(int(d * SR)) / SR
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def add(buf, sig, t, g=1.0, pan=0.0):
    if buf.ndim == 2 and sig.ndim == 1:
        sig = np.stack([sig * np.sqrt(0.5 * (1 - pan)), sig * np.sqrt(0.5 * (1 + pan))], 1) * 1.414
    i = int(round(t * SR)); j = min(N, i + len(sig))
    if i < 0: sig = sig[-i:]; i = 0
    if i < N and j > i: buf[i:j] += sig[:j - i] * g

def env(x, a=0.003, r=None, d=None):
    e = np.minimum(1, x / max(a, 1e-4))
    if d is not None: e = e * np.exp(-x * d)
    if r is not None: e = e * np.clip((x[-1] - x) / r, 0, 1)
    return e

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)
def lpf(x, f, order=2): return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hpf(x, f, order=2): return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)

# ---------------------------------------------------------------- instruments
def marimba(m, d=0.6, b=1.0):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 7) + 0.28 * b * np.sin(2 * np.pi * f * 3.93 * x) * np.exp(-x * 26)
    s += 0.12 * np.sin(2 * np.pi * f * 9.2 * x) * np.exp(-x * 60)
    return s * env(x, 0.0015)
def bell(m, d=1.6, g2=0.5):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 3.2) + g2 * np.sin(2 * np.pi * f * 2.756 * x) * np.exp(-x * 5) + 0.25 * np.sin(2 * np.pi * f * 5.404 * x) * np.exp(-x * 9)
    return s * env(x, 0.001)
def bass(m, d=0.5):
    x = ts(d); f = mtof(m)
    s = np.sin(2 * np.pi * f * x) + 0.22 * np.sin(4 * np.pi * f * x) + 0.08 * np.sin(6 * np.pi * f * x)
    return s * env(x, 0.006, r=0.06) * np.exp(-x * 1.6)
def pad(ms, d, cut=1800, a=0.6, r=0.8):
    x = ts(d); s = np.zeros(len(x))
    for m in ms:
        for det in (-0.07, 0.0, 0.07):
            f = mtof(m + det)
            s += (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x) + 0.12 * np.sin(6 * np.pi * f * x)) * 0.33
    s = lpf(s, cut, 2)
    e = np.minimum(1, x / a) * np.clip((d - x) / r, 0, 1)
    return s * e / len(ms)
def kick(g=1.0):
    x = ts(0.42); f = 46 + 110 * np.exp(-x * 34)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7.5) * g
def snap():
    x = ts(0.16); n = rng.standard_normal(len(x))
    return bp(n, 1200, 5200) * np.exp(-x * 38) * 1.6
def shaker():
    x = ts(0.07); return hpf(rng.standard_normal(len(x)), 6500) * np.exp(-x * 70) * 0.7
def tick(f=3200):
    x = ts(0.05); return (np.sin(2 * np.pi * f * x) * 0.6 + hpf(rng.standard_normal(len(x)), 3000) * 0.4) * np.exp(-x * 120)
def wood(m=79, d=0.22):
    x = ts(d); f = mtof(m)
    return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.3 * x)) * np.exp(-x * 34) * env(x, 0.0008)
def thud(f0=120, g=1.0, d=0.5):
    x = ts(d); f = f0 * 0.45 + f0 * np.exp(-x * 22)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9) + lpf(rng.standard_normal(len(x)), 900) * np.exp(-x * 28) * 0.5
    return s * g
def pop(f=900, g=1.0):
    x = ts(0.09); return np.sin(2 * np.pi * (f + f * 1.1 * np.exp(-x * 70)) * x) * np.exp(-x * 42) * env(x, 0.001) * g
def click():
    x = ts(0.025); return hpf(rng.standard_normal(len(x)), 2500) * np.exp(-x * 260) * (0.6 + 0.4 * rng.random())
def whoosh(d, f0=300, f1=4000, g=1.0, rev=False):
    n = int(d * SR); x = np.arange(n) / SR
    noise = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        u = (i / n); fc = f0 * (f1 / f0) ** u
        seg = noise[max(0, i - 2048):i + blk]
        y = bp(seg, max(60, fc * 0.6), min(SR / 2 - 100, fc * 1.6))
        out[i:i + blk] = y[-len(out[i:i + blk]):]
    e = np.sin(np.pi * np.clip(x / d, 0, 1)) ** (1.5 if not rev else 0.7)
    if rev: e = (x / d) ** 2.2 * np.clip((d - x) / 0.03, 0, 1)
    return out * e * g
def riser(d, m0=57, m1=81, g=1.0):
    x = ts(d); f = mtof(m0) * (mtof(m1) / mtof(m0)) ** (x / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.25
    return (tone * (x / d) ** 2 + whoosh(d, 400, 7000, 0.8, rev=True)[:len(x)]) * g
def coin():
    return bell(96, 1.4, 0.7) * 0.6 + bell(91, 1.4, 0.4) * 0.4
def stamp():
    x = ts(0.35); return thud(90, 1.0, 0.35) + bp(rng.standard_normal(len(x)), 300, 2500) * np.exp(-x * 30) * 0.5

# ---------------------------------------------------------------- réverbération légère
def reverb(buf, rt=1.4, mixv=0.18):
    n = int(rt * SR); x = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-x * 6.9 / rt)[:, None]
    ir[:, 0] = lpf(ir[:, 0], 5000); ir[:, 1] = lpf(ir[:, 1], 5000)
    ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([fftconvolve(buf[:, c], ir[:, c])[:N] for c in range(2)], 1)
    return buf + wet * mixv

# ---------------------------------------------------------------- minutage (repris de timeline.js)
TL = json.load(open('timeline.json'))
T, VO = TL['T'], TL['VO']
CUT = T['CUT']; P = T['P']

# ================================================================= MUSIQUE
BPM = 112; B = 60 / BPM
# 1) problème : nappe la mineur, pulsation discrète, tic-tac de recherche
A_END = T['align']
add(mus, pad([45, 52, 55, 59, 60], A_END + 0.3, cut=1100, a=1.2, r=0.4), 0.0, 0.55)
t = 0.15; k = 0
while t < A_END - 0.05:
    add(mus, tick(2600 if k % 2 else 3300), t, 0.05 + 0.04 * (t > 2.0), -0.4 if k % 2 else 0.4)
    if k % 4 == 0: add(mus, kick(0.5), t, 0.35)
    t += B / 2; k += 1
add(mus, riser(T['orbit'][1] - T['orbit'][0] + 0.05, 57, 81, 1.0), T['orbit'][0], 0.32)
# 2) solution : groove do majeur (I–vi–IV–V)
prog = [(48, [60, 64, 67, 71]), (45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (43, [59, 62, 67, 74])]
arp = [0, 1, 2, 3, 2, 1, 3, 2]
mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 84, 83, 81, 79, 77, 76]
STOP0, STOP1 = T['collapse'][1] - 0.02, T['price'] + 0.05   # silence dramatique autour du choc
t = A_END; i = 0
while t < DUR - 1.6:
    beat = i % 4; bar = i // 4
    root, ch = prog[bar % 4]
    if not (STOP0 <= t < STOP1):
        if beat in (0, 2): add(mus, kick(1.0), t, 0.42)
        if beat in (1, 3): add(mus, snap(), t, 0.16, 0.15)
        add(mus, bass(root - 12 + (12 if beat == 3 else 0), B * 0.9), t, 0.36)
        for h in range(2):
            n = ch[arp[(i * 2 + h) % 8]]
            add(mus, marimba(n + 12, 0.5), t + h * B / 2, 0.15, -0.35 if h else 0.35)
            add(mus, shaker(), t + h * B / 2 + B / 4, 0.05, 0.5)
        if bar >= 2 and t > P[0]:
            add(mus, bell(mel[(i) % 16] + 12, 0.9, 0.3), t, 0.045, 0.2)
        add(mus, pad(ch, B * 1.02, cut=2400, a=0.05, r=0.2), t, 0.22)
    t += B; i += 1
# accord final + cloche
END_T = 29.0
add(mus, pad([48, 55, 60, 64, 67, 74], DUR - END_T, cut=2600, a=0.08, r=1.4), END_T, 0.5)
for j, m in enumerate([72, 76, 79, 84, 88]): add(mus, marimba(m, 0.9), END_T + j * 0.07, 0.2, (j - 2) * 0.2)
add(mus, bell(84, 3.0, 0.4), END_T, 0.12)

# ================================================================= BRUITAGES
# frappe de la recherche
q = 'boulangerie près de moi'
for c in range(1, len(q) + 1):
    tc = T['type'][0] + (c - 0.5) / len(q) * (T['type'][1] - T['type'][0])
    add(sfx, click(), tc, 0.25, 0.2)
# « aucun résultat » : deux notes qui descendent
add(sfx, marimba(76, 0.4), T['noResult'], 0.18); add(sfx, marimba(72, 0.5), T['noResult'] + 0.12, 0.18)
add(sfx, pop(700), T['ask'], 0.3)
# pas du client (phase de marche identique au rendu)
def io2(x): return 2 * x * x if x < 0.5 else 1 - (-2 * x + 2) ** 2 / 2
def steps(t0, t1, d0, L):
    out = []; prev = None
    for tt in np.arange(t0, t1, 1 / 600):
        u = io2(min(1, max(0, (tt - t0) / (t1 - t0)))); ph = (d0 + u * L) * 5.2 / np.pi
        if prev is not None and int(ph) != int(prev): out.append(tt)
        prev = ph
    return out
for s in steps(*T['walk1'], 0, 3.65): add(sfx, wood(86, 0.08), s, 0.07, -0.2)
for s in steps(*T['walk2'], 3.65, 5.9): add(sfx, wood(86, 0.08), s, 0.07, 0.2)
# pièce Scalify : chute, atterrissage, onde
add(sfx, whoosh(0.32, 2500, 400, 1.0), T['coin'], 0.25)
add(sfx, coin(), T['coin'] + 0.3, 0.5)
add(sfx, whoosh(0.7, 500, 3000, 0.6), T['pulse'], 0.12)
# alignement : clac + accord lumineux + vague sur les dalles
add(sfx, wood(91, 0.3), T['align'], 0.6); add(sfx, thud(140, 0.8, 0.4), T['align'], 0.35)
add(sfx, bell(84, 2.0, 0.5), T['align'] + 0.02, 0.22); add(sfx, bell(91, 2.0, 0.5), T['align'] + 0.05, 0.14)
penta = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96]
for j in range(11): add(sfx, marimba(penta[j], 0.4), T['wave'][0] + j * 0.055, 0.1, -0.6 + j * 0.12)
add(sfx, bell(88, 0.8, 0.3), T['found'], 0.14); add(sfx, bell(93, 0.9, 0.3), T['found'] + 0.11, 0.14)
# clochette de la porte, lumières, notification, confettis
add(sfx, bell(88, 0.6, 0.35), T['walk2'][1] - 0.15, 0.22); add(sfx, bell(84, 1.3, 0.35), T['walk2'][1] + 0.1, 0.2)
add(sfx, pop(1200), T['lights'], 0.25)
add(sfx, bell(91, 0.5, 0.2), T['notif'], 0.15); add(sfx, bell(96, 0.7, 0.2), T['notif'] + 0.09, 0.15)
for j in range(6): add(sfx, tick(4000 + j * 300), T['lights'] + 0.05 + j * 0.06, 0.06, (j % 2) * 0.6 - 0.3)
# plongée dans la vitrine
add(sfx, riser(T['zoom'][1] - T['zoom'][0], 60, 96, 0.9), T['zoom'][0], 0.3)
add(sfx, thud(70, 1.0, 0.9), CUT, 0.45); add(sfx, whoosh(0.5, 4000, 300, 0.8), CUT, 0.15)
# plaques : chaque arrivée sonne une note de plus haut
plate_notes = [60, 62, 64, 67, 69]
for i in range(1, 5):
    add(sfx, whoosh(0.3, 2000, 500, 0.7), P[i], 0.12)
    land = P[i] + 0.33
    add(sfx, thud(110, 0.9, 0.45), land, 0.4); add(sfx, wood(plate_notes[i] + 12, 0.25), land, 0.25)
# P1 : blocs du site
for j, tt in enumerate([10.125, 10.275, 10.425, 10.555, 10.625, 10.695, 10.775, 10.875, 10.955, 11.035]):
    add(sfx, wood(79 + (j % 5) * 2, 0.12), tt, 0.16, -0.4 + (j % 5) * 0.2)
add(sfx, pop(1500), P[0] + 1.62, 0.3); add(sfx, tick(5000), P[0] + 1.62, 0.1)
# P2 : carte, épingle, ondulation, fiche
add(sfx, wood(74, 0.15), P[1] + 0.55, 0.15)
for j in range(5): add(sfx, pop(700 + j * 90), P[1] + 0.45 + j * 0.06, 0.12)
add(sfx, whoosh(0.3, 3000, 600, 0.6), P[1] + 0.65, 0.12); add(sfx, thud(160, 0.9, 0.4), P[1] + 0.95, 0.35)
add(sfx, marimba(79, 0.6), P[1] + 1.05, 0.12); add(sfx, pop(1100), P[1] + 1.05, 0.25)
# P3 : étoiles + avis + réponse
for j in range(5): add(sfx, bell(84 + [0, 2, 4, 7, 9][j], 0.7, 0.4), P[2] + 0.4 + j * 0.1, 0.1, -0.4 + j * 0.2)
add(sfx, pop(950), P[2] + 0.95, 0.25); add(sfx, pop(1250), P[2] + 1.4, 0.25)
# P4 : publications + cœurs
add(sfx, whoosh(0.35, 800, 3000, 0.6), P[3] + 0.4, 0.12)
for j in range(3): add(sfx, pop(800 + j * 150), P[3] + 0.42 + j * 0.05, 0.22)
for j in range(7): add(sfx, pop(1500 + (j % 3) * 220, 0.8), P[3] + 1.0 + j * 0.12, 0.12, (j % 3 - 1) * 0.5)
# P5 : cadran, question, points, réponse
add(sfx, pop(700), P[4] + 0.15, 0.2); add(sfx, pop(1000), P[4] + 0.3, 0.25)
for j in range(3): add(sfx, tick(2400 + j * 200), P[4] + 0.75 + j * 0.13, 0.06)
add(sfx, bell(88, 0.6, 0.3), P[4] + 1.1, 0.15); add(sfx, bell(93, 0.7, 0.3), P[4] + 1.2, 0.15)
# vue éclatée, rangement, effondrement, choc
add(sfx, whoosh(0.7, 400, 2500, 0.8), T['overview'][0], 0.14)
for j in range(5): add(sfx, tick(3000 + j * 250), T['overview'][0] + 0.12 + j * 0.07, 0.07)
add(sfx, whoosh(0.5, 3000, 300, 1.0), T['collapse'][0], 0.25)
x = ts(1.6); boom = np.sin(2 * np.pi * np.cumsum(36 + 95 * np.exp(-x * 16)) / SR) * np.exp(-x * 2.4)
crash = hpf(rng.standard_normal(len(x)), 2800) * np.exp(-x * 3.6) * 0.17
add(sfx, boom + crash, T['collapse'][1], 0.65); add(sfx, kick(1.0), T['collapse'][1], 0.5)
# prix
add(sfx, whoosh(0.3, 2500, 400, 0.8), T['price'], 0.2)
add(sfx, thud(95, 1.0, 0.7), T['price'] + 0.3, 0.55)
x = ts(0.9); add(sfx, (np.sin(2 * np.pi * 2300 * x) + np.sin(2 * np.pi * 2950 * x) + 0.5 * np.sin(2 * np.pi * 4100 * x)) * np.exp(-x * 7) * 0.4, T['price'] + 0.45, 0.2)
# recul, calendrier, -30 %, places
add(sfx, whoosh(1.3, 3500, 250, 0.9), T['pull'][0], 0.2)
add(sfx, thud(130, 0.9, 0.45), T['calendar'] + 0.3, 0.35); add(sfx, pop(1000), T['calendar'] + 0.55, 0.22)
add(sfx, stamp(), T['off30'] + 0.3, 0.5)
run = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93]
for j in range(15): add(sfx, marimba(run[j], 0.45), T['plots'][0] + j * 0.055, 0.13, -0.5 + j / 14)
# appel à l'action
add(sfx, whoosh(0.35, 2800, 400, 0.8), T['ctaCoin'], 0.2); add(sfx, coin(), T['ctaCoin'] + 0.33, 0.45)
add(sfx, pop(900), T['miniShop'], 0.3); add(sfx, pop(1300), T['miniShop'] + 0.35, 0.22)
add(sfx, whoosh(0.6, 600, 3000, 0.6), 28.95, 0.12)
# respiration des titres (froissé de papier très léger)
for h in [0.22, 2.12, 4.45, 9.78, 17.25, 19.6, 20.98, 23.85, 25.5, 28.45]:
    add(sfx, whoosh(0.28, 1500, 5000, 0.5), h, 0.05)

# ================================================================= VOIX
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16) / 32768.0
def fade(x, ms=12):
    k = int(ms / 1000 * SR); x = x.copy(); x[:k] *= np.linspace(0, 1, k); x[-k:] *= np.linspace(1, 0, k); return x
for key in ['v1', 'v2', 'v4', 'v5', 'v6', 'v7']: add(vo, load(f'vo/{key}.mp3'), VO[key])
v3 = load('vo/v3.mp3')
for key, (a, b) in zip(['v3a', 'v3b', 'v3c', 'v3d'], [(0.0, 1.25), (1.25, 2.80), (2.80, 3.70), (3.70, len(v3) / SR)]):
    add(vo, fade(v3[int(a * SR):int(b * SR)]), VO[key])
# voix : légère compression + présence
vo = hpf(vo, 90); vo = np.tanh(vo * 2.2) / np.tanh(2.2)

# ================================================================= MIX
mus = reverb(mus, 1.6, 0.22); sfx = reverb(sfx, 1.1, 0.15)
evn = np.convolve(np.abs(vo), np.ones(int(0.03 * SR)) / int(0.03 * SR), 'same')
evn = lfilter([0.002], [1, -0.998], evn)              # relâchement doux
duck = 1 - 0.5 * np.clip(evn / (np.percentile(evn[evn > 1e-4], 90) + 1e-9), 0, 1)
mix = mus * 0.62 * duck[:, None] + sfx * 0.8 * (0.75 + 0.25 * duck[:, None]) + np.stack([vo, vo], 1) * 0.95
mix[-int(0.9 * SR):] *= np.linspace(1, 0, int(0.9 * SR))[:, None] ** 1.5
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]
mix = np.tanh(mix * 0.9) / np.tanh(0.9)
mix = mix / np.abs(mix).max() * 0.9
f = wave.open(OUT, 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
f.writeframes((mix * 32767).astype(np.int16).tobytes()); f.close()
print('ok', OUT, DUR)
