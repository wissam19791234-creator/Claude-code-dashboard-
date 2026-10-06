# Beat + bruitages d'interface, entièrement synthétisés (aucun son sous droits)
import numpy as np, wave
from scipy.signal import butter, sosfilt
sr = 48000; T = 20.0; n = int(sr * T); B = .5
rng = np.random.default_rng(5)
mus = np.zeros(n); sfx = np.zeros(n)
ts = lambda d: np.arange(int(d * sr)) / sr
bp = lambda x, lo, hi: sosfilt(butter(2, [lo, hi], 'bandpass', fs=sr, output='sos'), x)
lpf = lambda x, f: sosfilt(butter(2, f, 'lowpass', fs=sr, output='sos'), x)
hpf = lambda x, f: sosfilt(butter(2, f, 'highpass', fs=sr, output='sos'), x)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(buf, s, t, g=1.):
    i = int(t * sr); j = min(n, i + len(s))
    if 0 <= i < n: buf[i:j] += s[:j - i] * g
def kick(): t = ts(.4); return np.sin(2 * np.pi * (48 + 120 * np.exp(-t * 28)) * t) * np.exp(-t * 7)
def snap(): t = ts(.2); return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 30) * 1.3
def hat(): t = ts(.05); return hpf(rng.standard_normal(len(t)), 7000) * np.exp(-t * 90) * .4
def keys(m, d): t = ts(d); f = mtof(m); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t) + .15 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 3) * np.minimum(1, t / .01) * .2
def bass(m, d): t = ts(d); return np.tanh(np.sin(2 * np.pi * mtof(m) * t) * 1.8) * .45 * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .03)
prog_ = [([62, 66, 69, 73], 38), ([59, 62, 66, 69], 35), ([55, 59, 62, 66], 31), ([57, 61, 64, 69], 33)]  # D maj7, Bm7, Gmaj7, A
for b in range(int(15.75 / B)):
    t = b * B; ch, root = prog_[(b // 4) % 4]
    add(mus, kick(), t, .9 if b % 2 == 0 else .55)
    if b % 2: add(mus, snap(), t, .7)
    add(mus, hat(), t + B / 2, .8)
    if b % 4 == 0:
        for k, m in enumerate(ch): add(mus, keys(m, 2.0), t + k * .02, 1)
    add(mus, bass(root, B * .85), t, .8)
# pendant l'appel raté : musique étouffée
a, b_ = int(4.0 * sr), int(6.5 * sr)
mus[a:b_] = lpf(mus[a:b_], 500) * .6
# fin : accord + impact
t = ts(4.2); add(mus, sum(np.sin(2 * np.pi * mtof(m) * t) for m in [50, 57, 62, 66, 69, 74]) / 6 * np.exp(-t * .7) * np.minimum(1, t / .02) * .7, 15.75)
# bruitages
def click(): t = ts(.03); return hpf(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .5
for k in range(16): add(sfx, click(), .7 + k * .05 + rng.random() * .01)
for k in range(33): add(sfx, click(), 8.55 + k * .018)
def tapfx(): t = ts(.06); return np.sin(2 * np.pi * 900 * t) * np.exp(-t * 90) * .5
for a in [3.55, 6.75, 8.1]: add(sfx, tapfx(), a, .9)
def swoosh(d=.3): t = ts(d); return bp(rng.standard_normal(len(t)), 400, 4000) * np.sin(np.pi * t / d) ** 2 * .9
for a in [1.65, 4.0, 7.0, 8.4, 13.3]: add(sfx, swoosh(), a - .1, .6)
add(sfx, swoosh(.45), 10.95, 1.0)
# tonalité d'appel qui sonne dans le vide (440 Hz)
for a in [4.15, 4.95]:
    t = ts(.6); add(sfx, np.sin(2 * np.pi * 440 * t) * np.minimum(1, t / .01) * np.minimum(1, (.6 - t) / .02) * .35, a)
# échec (trois tons)
for k, f in enumerate([950, 1400, 1800]):
    t = ts(.28); add(sfx, np.sin(2 * np.pi * f * t) * np.minimum(1, (.28 - t) / .02) * .3, 5.35 + k * .3)
# message envoyé / reçu
t = ts(.18); add(sfx, np.sin(2 * np.pi * (600 + 900 * t / .18) * t) * np.exp(-t * 14) * .5, 9.25)
t = ts(.35); add(sfx, (np.sin(2 * np.pi * 1320 * t) + np.sin(2 * np.pi * 1760 * np.clip(t - .07, 0, None)) * (t > .07)) * np.exp(-t * 10) * .35, 10.15)
def ding(): t = ts(.7); return (np.sin(2 * np.pi * 1568 * t) + .6 * np.sin(2 * np.pi * 2349 * t)) * np.exp(-t * 7) * .3
for a in [11.6, 12.2, 12.8]: add(sfx, ding(), a)
for a, g in [(14.85, .9), (15.75, 1.0)]:
    t = ts(1.2); add(sfx, np.sin(2 * np.pi * (38 + 80 * np.exp(-t * 14)) * t) * np.exp(-t * 3), a, g)
fade = np.ones(n); fade[-int(.7 * sr):] = np.linspace(1, 0, int(.7 * sr))
mix = (mus * .7 + sfx) * fade
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.2) * .89
st = np.stack([mix, np.roll(mix, 30)], 1)
f = wave.open('sound.wav', 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr); f.writeframes((st * 32767).astype(np.int16).tobytes()); f.close()
print('ok')
