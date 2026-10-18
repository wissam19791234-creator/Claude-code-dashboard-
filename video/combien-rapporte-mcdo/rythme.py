# Petites pauses avant chaque chiffre (rythme « youtubeur ») : insère un court silence juste avant chaque groupe
# de chiffres quand la voix enchaîne trop vite, puis décale l'horodatage des mots en conséquence.
# Usage : python3 rythme.py voix.wav mots.json voix_rythmee.wav mots_rythmes.json
import sys, json, subprocess
import numpy as np, wave

SR = 48000
src, wj, out_wav, out_j = sys.argv[1:5]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
W = json.load(open(wj)); toks = W['tokens']
TARGET = 0.16   # silence visé avant un chiffre (s)

cuts = []      # (instant d'insertion, durée)
for i, t in enumerate(toks):
    if not (t['cls'] and t.get('grp_start')) or i == 0: continue
    gap = t['start'] - toks[i - 1]['end']
    if gap < TARGET: cuts.append((t['start'] - 0.015, TARGET - max(0.0, gap)))

pieces, pos = [], 0
fade = int(0.004 * SR)
for at, d in cuts:
    k = int(at * SR)
    seg = a[pos:k].copy()
    if len(seg) > fade: seg[-fade:] *= np.linspace(1, 0, fade)
    pieces.append(seg); pieces.append(np.zeros(int(d * SR), np.float32))
    pos = k
    if pos + fade < len(a): a[pos:pos + fade] *= np.linspace(0, 1, fade)
pieces.append(a[pos:])
y = np.concatenate(pieces)

def shift(t):
    return t + sum(d for at, d in cuts if at <= t)
for t in toks:
    t['start'] = round(shift(t['start']), 3); t['end'] = round(shift(t['end']), 3)
W['duration'] = round(len(y) / SR, 3)
json.dump(W, open(out_j, 'w'), ensure_ascii=False, indent=0)
with wave.open(out_wav, 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
print(f'{len(cuts)} pauses ajoutées (+{sum(d for _, d in cuts):.2f} s), voix : {len(y) / SR:.2f} s')
