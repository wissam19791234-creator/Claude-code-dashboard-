# Beat 120 BPM + bruitages, entièrement synthétisés (aucun son sous droits)
import numpy as np, wave
from scipy.signal import lfilter, butter, sosfilt
sr = 48000; T = 17.5; n = int(sr * T); DROP = 7.5; B = .5
rng = np.random.default_rng(11)
mus = np.zeros(n); sfx = np.zeros(n)
ts = lambda d: np.arange(int(d * sr)) / sr
def add(buf, s, t, g=1.):
    i = int(t * sr); j = min(n, i + len(s))
    if 0 <= i < n: buf[i:j] += s[:j - i] * g
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def kick():
    t = ts(.45); return np.sin(2 * np.pi * (45 + 140 * np.exp(-t * 30)) * t) * np.exp(-t * 6) * 1.1 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 300) * .2
def clap():
    t = ts(.3); x = rng.standard_normal(len(t)); env = np.exp(-t * 18) + .6 * np.exp(-(t - .012) ** 2 / 2e-5) + .5 * np.exp(-(t - .024) ** 2 / 2e-5)
    return sosfilt(butter(2, [900, 5000], 'bandpass', fs=sr, output='sos'), x) * env * 1.4
def hat(open_=False):
    t = ts(.25 if open_ else .05); x = rng.standard_normal(len(t))
    return sosfilt(butter(2, 7000, 'highpass', fs=sr, output='sos'), x) * np.exp(-t * (12 if open_ else 80)) * .45
def sub(m, d, glide=0):
    t = ts(d); f = mtof(m) * (1 + glide * np.exp(-t * 8)); ph = 2 * np.pi * np.cumsum(f) / sr
    return np.tanh(np.sin(ph) * 2.2) * .6 * np.minimum(1, t / .005) * np.minimum(1, (d - t) / .03)
def pluck(m, d=.22):
    t = ts(d); f = mtof(m)
    s = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 2, 3)) * np.exp(-t * 14)
    return s * .25
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [52, 55, 59, 64]]  # Am F G Em
roots = [45, 41, 43, 40]
beats = int(T / B)
for b in range(beats):
    t = b * B; bar = (b // 4) % 4; after = t >= DROP
    if t >= 16.5: break
    if not after:
        if b % 2 == 0: add(mus, kick(), t, .7)
        add(mus, hat(), t + B / 2, .5)
    else:
        add(mus, kick(), t, 1.0)
        if b % 2: add(mus, clap(), t, .9)
        add(mus, hat(), t + B / 2, .9); add(mus, hat(), t + B / 4, .35); add(mus, hat(), t + 3 * B / 4, .35)
        add(mus, sub(roots[bar] - 12, B * .9, glide=.6 if b % 4 == 0 else 0), t, .9)
    # arpège
    for k in range(2):
        add(mus, pluck(chords[bar][(b * 2 + k) % 4] + (12 if after else 0)), t + k * B / 2, .8 if after else .55)
# avant le drop : tout est étouffé (passe-bas « sous l'eau »), puis la montée
pre = int(DROP * sr)
mus[:pre] = sosfilt(butter(2, 650, 'lowpass', fs=sr, output='sos'), mus[:pre]) * 1.6
t = ts(1.0); riser = sosfilt(butter(2, 300, 'highpass', fs=sr, output='sos'), rng.standard_normal(len(t))) * (t / 1) ** 3 * .5
add(sfx, riser, DROP - 1.0)
for k in range(16):  # roulement de caisse claire qui accélère
    tt = DROP - 1.0 + 1.0 * (1 - (1 - k / 16) ** 1.6)
    add(sfx, clap(), tt, .25 + .5 * k / 16)
# drop : impact + whoosh de pale
t = ts(1.2); add(sfx, np.sin(2 * np.pi * (35 + 90 * np.exp(-t * 12)) * t) * np.exp(-t * 3), DROP, 1.0)
t = ts(.45); w = sosfilt(butter(2, [300, 3000], 'bandpass', fs=sr, output='sos'), rng.standard_normal(len(t))) * np.sin(np.pi * t / .45) ** 2
add(sfx, w * 1.2, DROP - .22)
# pops sur les apparitions
def popfx():
    t = ts(.1); return np.sin(2 * np.pi * (500 + 900 * np.exp(-t * 50)) * t) * np.exp(-t * 35) * .5
for a in [.05, 2.05, 3.55, 5.05, 7.55, 8.5, 9.5, 10.5]: add(sfx, popfx(), a, .8)
add(sfx, popfx(), 6.5, 1.0)
def ding():
    t = ts(.6); return (np.sin(2 * np.pi * 1568 * t) + np.sin(2 * np.pi * 2093 * np.clip(t - .06, 0, None)) * (t > .06)) * np.exp(-t * 8) * .35
add(sfx, ding(), 11.5); add(sfx, ding(), 12.5)
# GLOW-UP : impact + scintillement
t = ts(1.5); add(sfx, np.sin(2 * np.pi * (40 + 80 * np.exp(-t * 14)) * t) * np.exp(-t * 2.5), 13.75, .9)
sh = sum(np.sin(2 * np.pi * mtof(m) * t) * np.exp(-t * 3) for m in [88, 91, 95, 100]) / 4
add(sfx, sh, 13.78, .35)
# fin : accord tenu + dernier impact
t = ts(2.6); add(mus, sum(np.sin(2 * np.pi * mtof(m) * t) for m in [57, 64, 69, 72, 76]) / 5 * np.minimum(1, t / .05) * np.exp(-t * .9) * .5, 15.0)
add(sfx, np.sin(2 * np.pi * (38 + 70 * np.exp(-ts(1.2) * 12)) * ts(1.2)) * np.exp(-ts(1.2) * 3), 15.0, .7)
fade = np.ones(n); fade[-int(.6 * sr):] = np.linspace(1, 0, int(.6 * sr))
mix = (mus * .75 + sfx * .8) * fade
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * .89
st = np.stack([mix, np.roll(mix, 24)], 1)
f = wave.open('beat.wav', 'wb'); f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr); f.writeframes((st * 32767).astype(np.int16).tobytes()); f.close()
print('ok')
