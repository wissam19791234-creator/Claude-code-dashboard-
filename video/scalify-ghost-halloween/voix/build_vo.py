# Voix off gratuite (edge-tts, Vivienne) : une phrase par ligne de script.txt (« heure|texte »), posée à l'heure prévue
# ou juste après la phrase précédente si elle déborde. Usage : python3 voix/build_vo.py voix débit sortie.wav sortie.json durée
import asyncio, sys, os, json, subprocess, hashlib
import numpy as np, wave
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import say
VOICE, RATE, OUT, OUTJ, DUR = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5])
SR = 48000
lines = []
for l in open('script.txt').read().strip().split('\n'):
    t, txt = l.split('|', 1); lines.append({'at': float(t), 'text': txt.strip()})
# prononciation seulement (le texte affiché ne change pas)
def spoken(s):
    for a, b in [('ghoster', 'gausté'), ('3 000 €', 'trois mille euros'), ('200 €', 'deux cents euros'), ('2 mois', 'deux mois'), ('5 jours', 'cinq jours'), ('SITE', 'site'), ('2012', 'deux mille douze')]:
        s = s.replace(a, b)
    return s
os.makedirs('cache', exist_ok=True)
def path(s): return 'cache/' + hashlib.md5(f'{VOICE}|{RATE}|{spoken(s)}'.encode()).hexdigest()[:12] + '.mp3'
async def main():
    sem = asyncio.Semaphore(4)
    async def one(s):
        async with sem:
            if not os.path.exists(path(s['text'])): await say(VOICE, RATE, spoken(s['text']), path(s['text']))
    await asyncio.gather(*[one(s) for s in lines])
asyncio.run(main())
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def trim(a):
    env = np.convolve(np.abs(a), np.ones(240) / 240, 'same')
    i0 = max(0, np.where(env > 0.012)[0][0] - int(0.06 * SR)); i1 = min(len(a), np.where(env > 0.004)[0][-1] + int(0.08 * SR))
    return a[i0:i1]
y = np.zeros(int(DUR * SR), np.float32); prev = 0
os.makedirs('work/lines', exist_ok=True)
for k, s in enumerate(lines):
    a = trim(load(path(s['text'])))
    st = max(s['at'], prev + 0.22)
    i = int(st * SR); y[i:i + len(a)] += a[:len(y) - i]
    s['start'] = round(st, 3); s['end'] = round(st + len(a) / SR, 3); prev = s['end']
    with wave.open(f"work/lines/{k:02d}.wav", 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((a / max(1e-6, np.abs(a).max()) * 0.9 * 32767).astype(np.int16).tobytes())
y = y / max(1e-6, np.abs(y).max()) * 0.89
with wave.open(OUT, 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((y * 32767).astype(np.int16).tobytes())
json.dump(lines, open(OUTJ, 'w'), ensure_ascii=False, indent=1)
for s in lines: print(f"{s['start']:6.2f} → {s['end']:6.2f}  {s['text']}")
