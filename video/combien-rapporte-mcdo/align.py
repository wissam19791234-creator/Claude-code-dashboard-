# Aligne le script (captions.txt, mot pour mot) sur la voix : Whisper donne l'heure des mots entendus,
# on recopie ces heures sur les mots EXACTS du script (orthographe, chiffres, couleurs conservés).
# Usage : python3 align.py voix.wav sortie.json
import re, sys, json, difflib, unicodedata
from faster_whisper import WhisperModel

VO, OUT = sys.argv[1], sys.argv[2]
cap = open('captions.txt').read()

# ---- jetons du script, avec leur couleur (y = chiffre, r = dépense) et leur ligne
toks = []
for li, line in enumerate(cap.strip().split('\n')):
    for m in re.finditer(r'\{([yr]):([^}]*)\}|(\S+)', line):
        if m.group(3):
            if re.fullmatch(r'[,.;:!?…]+', m.group(3)) and toks:   # ponctuation collée au mot précédent
                toks[-1]['w'] += m.group(3); continue
            toks.append({'w': m.group(3), 'cls': '', 'line': li})
        else:
            for k, w in enumerate(m.group(2).split()):
                toks.append({'w': w, 'cls': m.group(1), 'line': li, 'grp_start': k == 0})

def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    w = w.replace('%', 'pourcent').replace('’', "'").replace('€', 'euros')
    w = re.sub(r"[^a-z0-9']", '', w)
    if w.startswith('mcdo') or w.startswith('macdo'): w = 'mcdo'
    if w in ('amsterdam', 'hamsterdam', "hamster'dam"): w = 'hamsterdam'
    return w

# découpe/fusionne les mots entendus comme le script : « c » + « 'est », « 3 » + « ,5 », « 10€ » → « 10 » « euros »
def clean_heard(ws):
    out = []
    for w in ws:
        t = w.word.strip()
        if not t: continue
        if out and (t.startswith("'") or re.fullmatch(r',\d+', t)):
            out[-1] = (out[-1][0] + t, out[-1][1], w.end); continue
        m = re.fullmatch(r'(\d[\d,.]*)(€|%)([.,!?]*)', t)
        if m:
            mid = (w.start + w.end) / 2
            out.append((m.group(1), w.start, mid)); out.append((m.group(2), mid, w.end)); continue
        out.append((t, w.start, w.end))
    return out

# fusionne les groupes de chiffres (« 45 000 » → « 45000 ») des deux côtés pour comparer
def keys(words):
    out, idx = [], []
    i = 0
    while i < len(words):
        k = norm(words[i]); j = i + 1
        while k.isdigit() and j < len(words) and re.fullmatch(r'\d{3}[.,]?', words[j].strip()):
            k += norm(words[j]); j += 1
        out.append(k.replace(',', '')); idx.append((i, j)); i = j
    return out, idx

model = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = model.transcribe(VO, language='fr', word_timestamps=True)
class H:
    def __init__(s, w, a, b): s.word, s.start, s.end = w, a, b
heard = [H(*x) for x in clean_heard([w for s in segs for w in s.words])]
hk, hidx = keys([w.word for w in heard])
sk, sidx = keys([t['w'] for t in toks])

sm = difflib.SequenceMatcher(None, sk, hk, autojunk=False)
for a, b, n in sm.get_matching_blocks():
    for d in range(n):
        si, sj = sidx[a + d]; hi, hj = hidx[b + d]
        t0, t1 = heard[hi].start, heard[hj - 1].end
        span = sj - si
        for q in range(si, sj):   # un nombre fusionné : on répartit son temps sur ses morceaux
            toks[q]['start'] = round(t0 + (t1 - t0) * (q - si) / span, 3)
            toks[q]['end'] = round(t0 + (t1 - t0) * (q - si + 1) / span, 3)
# mots non reconnus : interpolation entre voisins
known = [i for i, t in enumerate(toks) if 'start' in t]
for i, t in enumerate(toks):
    if 'start' in t: continue
    prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
    a = toks[prev]['end'] if prev is not None else 0.0
    b = toks[nxt]['start'] if nxt is not None else a + 0.4
    gap_n = (nxt if nxt is not None else len(toks)) - (prev if prev is not None else -1)
    k = i - (prev if prev is not None else -1)
    t['start'] = round(a + (b - a) * (k - 1) / gap_n, 3); t['end'] = round(a + (b - a) * k / gap_n, 3)
matched = len(known) / len(toks)
json.dump({'tokens': toks, 'matched': round(matched, 3), 'duration': heard[-1].end if heard else 0}, open(OUT, 'w'), ensure_ascii=False, indent=0)
print(f'{len(toks)} mots, {matched:.0%} retrouvés dans la voix, fin de voix à {heard[-1].end:.2f} s')
