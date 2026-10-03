# Musique + sound design synthétisés (aucun son sous droits)
import numpy as np, wave
sr = 44100; T = 21.0; n = int(sr * T)
mus = np.zeros(n); sfx = np.zeros(n)
rng = np.random.default_rng(7)
def add(buf, sig, t, g=1.0):
    i = int(t * sr)
    if i >= n: return
    j = min(n, i + len(sig)); buf[i:j] += sig[:j - i] * g
def ts(d): return np.arange(int(d * sr)) / sr
def lp(x, a):  # filtre passe-bas 1 pôle
    a = np.broadcast_to(np.asarray(a, float), x.shape)
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc += a[i] * (x[i] - acc); y[i] = acc
    return y

bpm = 122; beat = 60 / bpm
t = ts(.4); kick = np.sin(2 * np.pi * (45 + 110 * np.exp(-t * 28)) * t) * np.exp(-t * 7)
t = ts(.06); hat = np.diff(np.r_[0, rng.standard_normal(len(t))]) * np.exp(-t * 70) * .3
t = ts(.25); clap = rng.standard_normal(len(t)) * np.exp(-t * 22) * .45
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
# accroche (0-2.6 s) : pulsation sourde sans batterie complète, la musique "drop" sur J-30
drop = 2.82
b = 0
while b * beat < T - .8:
    tb = b * beat; bar = int(b // 4); ch = chords[bar % 4]
    if tb < drop:
        add(mus, kick, tb, .55 if b % 2 == 0 else 0)
    else:
        add(mus, kick, tb, 1.0)
        add(mus, hat, tb + beat / 2, 1.0)
        if b % 2 == 1: add(mus, clap, tb, .8)
        # basse sidechain
        tt = ts(beat); f = mtof(ch[0] - 24)
        env = np.minimum(1, tt / .08) * np.exp(-tt * 1.5)
        add(mus, (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env * .45, tb)
    # nappe d'accords (toujours), assourdie en accroche
    if b % 4 == 0:
        tt = ts(beat * 4); pad = sum(np.sin(2 * np.pi * mtof(m) * tt + np.sin(2 * np.pi * .3 * tt)) for m in ch) / 3
        env = np.minimum(1, tt / .3) * np.minimum(1, (beat * 4 - tt) / .3)
        add(mus, pad * env * (.12 if tb < drop else .2), tb)
    b += 1
# arpège pendant l'offre
for k in range(int((17.3 - 11.9) / (beat / 2))):
    tb = 11.9 + k * beat / 2; ch = chords[int(tb / beat // 4) % 4]
    tt = ts(.18); add(mus, np.sin(2 * np.pi * mtof(ch[k % 3] + 12) * tt) * np.exp(-tt * 18) * .18, tb)

# SFX
def whoosh(d=.35, up=True):
    tt = ts(d); x = rng.standard_normal(len(tt))
    env = np.sin(np.pi * tt / d) ** 2
    return lp(x, .05 + .25 * (tt / d if up else 1 - tt / d)) * env * 1.4
def impact():
    tt = ts(.9); boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-tt * 12)) * tt) * np.exp(-tt * 4)
    nz = lp(rng.standard_normal(len(tt)), .2) * np.exp(-tt * 14)
    return boom * 1.2 + nz * .9
def riser(d):
    tt = ts(d); x = lp(rng.standard_normal(len(tt)), .02) * 3
    sweep = np.sin(2 * np.pi * (200 * tt + 900 * tt ** 2 / d)) * .25
    return (x + sweep) * (tt / d) ** 2
def pop():
    tt = ts(.12); return np.sin(2 * np.pi * (700 + 900 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 30) * .5
def glitch():
    tt = ts(.18); return np.sign(np.sin(2 * np.pi * 180 * tt)) * (rng.random(len(tt)) > .5) * np.exp(-tt * 10) * .25
for w in [0.27, 0.55, 0.82, 4.42, 5.85, 6.55, 7.40, 7.95, 9.35, 11.88, 14.5, 17.30, 18.98]: add(sfx, whoosh(), w - .2, .5)
for i in [2.85, 4.55, 12.12, 15.8, 19.0]: add(sfx, impact(), i, .9)
for i in [0.0, 17.38]: add(sfx, impact(), i, .6)
add(sfx, riser(1.2), 2.85 - 1.2, .5); add(sfx, riser(.9), 17.3 - .9, .4)
for p in [5.93, 6.62, 7.45, 7.99, 8.6, 9.55, 10.05, 11.0, 12.78, 13.62, 14.55, 16.5, 19.35, 19.55] + [14.75 + i * .045 for i in range(15)]: add(sfx, pop(), p, .55 if p < 14.7 or p > 15.5 else .25)
for g in [1.62, 1.95, 2.3]: add(sfx, glitch(), g, 1)
add(sfx, whoosh(.5, False), 3.62, .6)  # vrille du J-30

def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * .9
    w = wave.open(name, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
fade = np.ones(n); fade[-int(1.2 * sr):] = np.linspace(1, 0, int(1.2 * sr))
save('music.wav', mus * fade); save('sfx.wav', sfx)
