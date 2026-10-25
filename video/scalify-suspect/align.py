# Heures des mots : faster-whisper sur chaque phrase (horodatage mot à mot), recopiées sur les mots EXACTS du script.
# Si le nombre de mots diffère (3D, 200 €), répartition proportionnelle à la longueur des mots sur la durée entendue.
import json, re, sys
from faster_whisper import WhisperModel
L = json.load(open('work/vo.json'))
m = WhisperModel('small', device='cpu', compute_type='int8')
words = []
for i, s in enumerate(L):
    segs, _ = m.transcribe(f'work/lines/{i:02d}.wav', language='fr', word_timestamps=True, beam_size=5)
    raw = [w for sg in segs for w in sg.words]
    heard = []
    for w in raw:
        if heard and w.word.strip().startswith("'"):
            h = heard[-1]; heard[-1] = type('W', (), {'word': h.word + w.word.strip(), 'start': h.start, 'end': w.end})()
        else: heard.append(w)
    toks = [t for t in re.findall(r"\S+", s['text']) if not re.fullmatch(r'[?:!.,]', t)]
    # ponctuation isolée rattachée au mot précédent
    disp = []
    for t in re.findall(r"\S+", s['text']):
        if re.fullmatch(r'[?:!.,€]', t) and disp: disp[-1] += ' ' + t
        else: disp.append(t)
    off = s['start']
    print(i, '|', ' '.join(w.word.strip() for w in heard))
    if len(heard) == len(disp):
        for d, w in zip(disp, heard): words.append({'w': d, 'start': round(off + w.start, 3), 'end': round(off + w.end, 3), 'line': i})
    else:
        a = off + (heard[0].start if heard else 0); b = off + (heard[-1].end if heard else s['end'] - s['start'])
        tot = sum(len(d) + 2 for d in disp); t = a
        for d in disp:
            dd = (b - a) * (len(d) + 2) / tot; words.append({'w': d, 'start': round(t, 3), 'end': round(t + dd, 3), 'line': i}); t += dd
        print('   (réparti)', disp)
json.dump(words, open('work/words.json', 'w'), ensure_ascii=False, indent=0)
