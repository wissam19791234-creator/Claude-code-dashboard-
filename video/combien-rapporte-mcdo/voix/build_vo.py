# Voix off gratuite (edge-tts) phrase par phrase, puis montage avec des silences maîtrisés :
# courts entre deux phrases, un peu plus longs entre deux idées, un temps « pince-sans-rire » avant les chutes.
# Usage : python3 build_vo.py voix rate sortie.wav sortie.json
import asyncio, re, sys, os, json, subprocess, hashlib
import numpy as np, wave
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import say
VOICE, RATE, OUT, OUTJ = sys.argv[1:5]
SR = 48000
lines = [l.strip() for l in open(os.path.join(os.path.dirname(__file__), '../script.txt')).read().strip().split('\n') if l.strip()]
CHUTES = ["J'ai sorti mon plus beau costard.", "Juste pour avoir le droit d'entrer.", "Moi, j'ai douze graines de tournesol.",
          "Là, je suis riche.", "Avant même d'avoir acheté un seul steak.", "Par jour.", "Même le dimanche.", "Pas de clients, pas de frites."]
spoken = lambda s: s.replace('McDo', 'Macdo')          # « McDo » est épelé par la voix, « Macdo » est bien dit
sents = []
for li, l in enumerate(lines):
    for k, s in enumerate(re.findall(r'.+?(?:[.?!](?=\s|$)|$)', l)):
        s = s.strip()
        if s: sents.append({'line': li, 'first': k == 0, 'text': s})
os.makedirs('cache', exist_ok=True)
def path(s): return 'cache/' + hashlib.md5(f'{VOICE}|{RATE}|{spoken(s)}'.encode()).hexdigest()[:12] + '.mp3'
async def main():
    sem = asyncio.Semaphore(4)
    async def one(s):
        async with sem:
            if not os.path.exists(path(s['text'])): await say(VOICE, RATE, spoken(s['text']), path(s['text']))
    await asyncio.gather(*[one(s) for s in sents])
asyncio.run(main())

def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def trim(a):
    env = np.convolve(np.abs(a), np.ones(240) / 240, 'same')
    i0 = max(0, np.where(env > 0.012)[0][0] - int(0.03 * SR))
    i1 = min(len(a), np.where(env > 0.004)[0][-1] + int(0.1 * SR))   # on garde la consonne finale (« steak », « marque »)
    return a[i0:i1]
out, t = [], 0.0
for i, s in enumerate(sents):
    a = trim(load(path(s['text'])))
    if i:
        gap = 0.34 if s['first'] else 0.13
        if s['text'] in CHUTES: gap = 0.46
        out.append(np.zeros(int(gap * SR), np.float32)); t += gap
    s['start'] = round(t, 3); out.append(a); t += len(a) / SR; s['end'] = round(t, 3)
y = np.concatenate(out); y = y / max(1e-6, np.abs(y).max()) * 0.89
with wave.open(OUT, 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((y * 32767).astype(np.int16).tobytes())
json.dump(sents, open(OUTJ, 'w'), ensure_ascii=False, indent=0)
print(f'{len(sents)} phrases, voix {len(y) / SR:.2f} s')
