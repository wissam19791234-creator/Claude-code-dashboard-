# Resserre les silences internes (détection par énergie), garde quelques temps morts comiques.
import json, subprocess, numpy as np, wave
SR = 48000; HOP = int(0.01 * SR)
D = json.load(open('vo/lines.json'))
KEEP = {'v01': 0.42, 'v07': 0.34}   # pause max après le 1er mot (temps mort)
GAP = 0.24                                                     # pause max ailleurs
out = {}
for k, v in D.items():
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'vo/{k}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    n = len(a) // HOP
    rms = np.array([np.sqrt((a[i * HOP:(i + 1) * HOP] ** 2).mean() + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms + 1e-9); thr = db.max() - 38
    voiced = db > thr
    # bornes de parole
    idx = np.where(voiced)[0]; first, last = idx[0], idx[-1]
    # runs de silence internes
    cuts = []  # (start_s, end_s) à supprimer
    i = first
    w1 = v['words'][1]['t'] if len(v['words']) > 1 else 1e9
    while i <= last:
        if not voiced[i]:
            j = i
            while j <= last and not voiced[j]: j += 1
            L = (j - i) * HOP / SR; s = i * HOP / SR; e = j * HOP / SR
            mg = KEEP.get(k, GAP) if (k in KEEP and s < w1 + 0.05 and e > w1 - 0.6) else GAP
            if L > mg: cuts.append((s + mg / 2, e - mg / 2))
            i = j
        else: i += 1
    start = max(0, first * HOP / SR - 0.03); end = min(len(a) / SR, (last + 1) * HOP / SR + 0.12)
    keep = []; cur = start
    for s, e in cuts: keep.append((cur, s)); cur = e
    keep.append((cur, end))
    fade = int(0.006 * SR); pieces = []
    for s, e in keep:
        p = a[int(s * SR):int(e * SR)].copy()
        if len(p) > 2 * fade: p[:fade] *= np.linspace(0, 1, fade); p[-fade:] *= np.linspace(1, 0, fade)
        pieces.append(p)
    y = np.concatenate(pieces)
    def remap(t):
        acc = 0.0
        for s, e in keep:
            if t < e: return acc + max(0.0, t - s)
            acc += e - s
        return acc
    out[k] = {'text': v['text'], 'dur': round(len(y) / SR, 3), 'words': [{'w': w['w'], 't': round(remap(w['t']), 3)} for w in v['words']]}
    with wave.open(f'vo_trim/{k}.wav', 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(out, open('vo_trim/lines.json', 'w'), ensure_ascii=False, indent=0)
for k, v in out.items(): print(k, v['dur'], ' '.join(f"{w['w']}@{w['t']}" for w in v['words']))
print('total', round(sum(v['dur'] for v in out.values()), 2))
