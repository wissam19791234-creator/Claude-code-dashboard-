# Musique + sound design synthétisés (aucun son sous droits) — calés sur words.json
import numpy as np, wave, json
sr = 44100; T = 27.6; n = int(sr * T)
w = json.load(open('words.json')); W = lambda i: w[i]['t'] + .10
mus = np.zeros(n); sfx = np.zeros(n); rng = np.random.default_rng(7)
def add(buf, sig, t, g=1.0):
    i = int(t * sr)
    if i < 0 or i >= n: return
    j = min(n, i + len(sig)); buf[i:j] += sig[:j - i] * g
def ts(d): return np.arange(int(d * sr)) / sr
def lp(x, a):
    a = np.broadcast_to(np.asarray(a, float), x.shape); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc += a[i] * (x[i] - acc); y[i] = acc
    return y
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

# instants clés (identiques à main.js)
DROP = W(10)                       # « bosse »
S2 = 3.95
TOOLS = [19, 21, 23, 24, 26, 31, 33, 37, 39, 40, 43, 44, 47, 49]
TT = [W(i) - .08 for i in TOOLS]
S4 = W(52) - .1; S5 = W(59) - .15; S6 = W(63) - .15; S7 = W(71) - .2
NOTIF = [.12, .55, .98, 1.38, 1.78] + [2.08 + k * .13 for k in range(9)]

bpm = 124; beat = 60 / bpm
t = ts(.4); kick = np.sin(2 * np.pi * (45 + 110 * np.exp(-t * 28)) * t) * np.exp(-t * 7)
t = ts(.06); hat = np.diff(np.r_[0, rng.standard_normal(len(t))]) * np.exp(-t * 70) * .3
t = ts(.25); clap = rng.standard_normal(len(t)) * np.exp(-t * 22) * .45
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
# nuit : nappe douce + battement sourd avant le drop
tt = ts(DROP); pad = sum(np.sin(2 * np.pi * mtof(m) * tt) for m in [45, 52, 57, 64]) / 4
add(mus, pad * np.minimum(1, tt / .4) * .25, 0)
for k in range(int(DROP / (beat * 2))): add(mus, kick, k * beat * 2, .35)
# après le drop : grille calée sur DROP
b = 0
while DROP + b * beat < T - .8:
    tb = DROP + b * beat; ch = chords[(b // 4) % 4]
    calm = win = (S4 <= tb < S5)  # respiration sur « 2 minutes par semaine »
    add(mus, kick, tb, .6 if calm else 1.0)
    if not calm:
        add(mus, hat, tb + beat / 2)
        if b % 2: add(mus, clap, tb, .8)
    bt = ts(beat); f = mtof(ch[0] - 24); env = np.minimum(1, bt / .08) * np.exp(-bt * 1.5)
    add(mus, (np.sin(2 * np.pi * f * bt) + .3 * np.sin(4 * np.pi * f * bt)) * env * .45, tb)
    if b % 4 == 0:
        bt = ts(beat * 4); pd = sum(np.sin(2 * np.pi * mtof(m) * bt) for m in ch) / 3
        add(mus, pd * np.minimum(1, bt / .2) * np.minimum(1, (beat * 4 - bt) / .2) * .16, tb)
    b += 1
# arpège pendant la liste
k = 0
while TT[0] + k * beat / 2 < S4:
    tb = TT[0] + k * beat / 2; ch = chords[int((tb - DROP) / beat // 4) % 4]
    bt = ts(.16); add(mus, np.sin(2 * np.pi * mtof(ch[k % 3] + 12) * bt) * np.exp(-bt * 18) * .16, tb); k += 1

# SFX
def chime():  # sonnerie de notification (originale)
    bt = ts(.5); s = np.zeros(len(bt))
    for f, d in [(1568, 0), (2093, .07)]:
        x = ts(.43); e = np.exp(-x * 9); sig = (np.sin(2 * np.pi * f * x) + .3 * np.sin(4 * np.pi * f * x)) * e
        i = int(d * sr); s[i:i + len(sig)] += sig[:len(s) - i]
    return s * .5
def whoosh(d=.35):
    bt = ts(d); return lp(rng.standard_normal(len(bt)), .05 + .25 * bt / d) * np.sin(np.pi * bt / d) ** 2 * 1.4
def impact():
    bt = ts(.9); return np.sin(2 * np.pi * (38 + 60 * np.exp(-bt * 12)) * bt) * np.exp(-bt * 4) * 1.2 + lp(rng.standard_normal(len(bt)), .2) * np.exp(-bt * 14) * .9
def tick():
    bt = ts(.09); return np.sin(2 * np.pi * (1200 + 800 * np.exp(-bt * 60)) * bt) * np.exp(-bt * 45) * .55
def riser(d):
    bt = ts(d); return (lp(rng.standard_normal(len(bt)), .02) * 3 + np.sin(2 * np.pi * (200 * bt + 900 * bt ** 2 / d)) * .25) * (bt / d) ** 2
def pop():
    bt = ts(.12); return np.sin(2 * np.pi * (700 + 900 * np.exp(-bt * 40)) * bt) * np.exp(-bt * 30) * .5
def buzz():  # vibration du téléphone
    bt = ts(.14); return np.sign(np.sin(2 * np.pi * 150 * bt)) * lp(rng.standard_normal(len(bt)), .05) * 0 + np.sin(2 * np.pi * 150 * bt) * np.exp(-bt * 8) * .35
for i, t0 in enumerate(NOTIF): add(sfx, chime(), t0, .9 if i < 5 else .55); add(sfx, buzz(), t0, .6)
add(sfx, riser(1.0), DROP - 1.0, .45)
for t0 in [DROP, 4.15, W(54), W(60), W(65), W(70), S7]: add(sfx, impact(), t0, .9)
for t0 in TT: add(sfx, whoosh(.25), t0 - .15, .45); add(sfx, tick(), t0, .9)
for t0 in [S2, S4, S5, S6]: add(sfx, whoosh(), t0 - .2, .55)
add(sfx, riser(.9), S6 - .9, .4)
for t0 in [W(12), W(55), W(57), W(61), S6 + .05, S7 + .3, S7 + .45] + [W(67) + i * .035 for i in range(15)]: add(sfx, pop(), t0, .5 if t0 < W(67) or t0 > W(67) + .6 else .2)

def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * .9
    f = wave.open(name, 'wb'); f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr); f.writeframes((x * 32767).astype(np.int16).tobytes()); f.close()
fade = np.ones(n); fade[-int(1.2 * sr):] = np.linspace(1, 0, int(1.2 * sr))
save('music.wav', mus * fade); save('sfx.wav', sfx)
