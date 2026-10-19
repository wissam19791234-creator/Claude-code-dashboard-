# Aligne le script (captions.txt, mot pour mot) sur la voix : Whisper donne l'heure des mots entendus,
# on recopie ces heures sur les mots EXACTS du script (orthographe, chiffres, couleurs conservés).
# Les deux côtés sont comparés « à l'oral » : 45 000 → quarante cinq mille, 5 % → cinq pour cent, 2,5 → deux virgule cinq.
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

U = 'zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize'.split()
D = {2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante'}
def lt100(n):
    if n < 17: return U[n]
    if n < 20: return 'dix ' + U[n - 10]
    if n < 70: return D[n // 10] + ('' if n % 10 == 0 else ' et un' if n % 10 == 1 else ' ' + U[n % 10])
    if n < 80: return 'soixante ' + ('et onze' if n == 71 else lt100(n - 60))
    return 'quatre vingt' + ('' if n == 80 else ' ' + lt100(n - 80))
def lt1000(n):
    c, r = divmod(n, 100)
    h = '' if c == 0 else 'cent' if c == 1 else U[c] + ' cent'
    return (h + (' ' + lt100(r) if r else '')).strip() if n else ''
def fr(n):
    if n == 0: return 'zéro'
    m, r = divmod(n, 1_000_000); k, u = divmod(r, 1000)
    out = []
    if m: out.append(lt1000(m) + ' millions')
    if k: out.append('mille' if k == 1 else lt1000(k) + ' mille')
    if u: out.append(lt1000(u))
    return ' '.join(out)

def plain(w):
    w = unicodedata.normalize('NFD', w.lower().replace('’', "'"))
    return ''.join(c for c in w if unicodedata.category(c) != 'Mn')
def spoken(w):
    """mot (ou nombre fusionné) → liste de mots prononcés, normalisés"""
    w = plain(w).replace('€', ' euros ').replace('%', ' pour cent ')
    m = re.fullmatch(r'\W*(\d+)[,.](\d+)\W*', w.replace(' ', ''))
    if m and not re.search(r'[a-z]', w): return fr(int(m.group(1))).split() + ['virgule'] + fr(int(m.group(2))).split()
    w = re.sub(r'\d+', lambda x: ' ' + fr(int(x.group())) + ' ', w)
    out = []
    for p in re.split(r"[\s\-]+", w):
        p = re.sub(r"[^a-z0-9']", '', p)
        if not p: continue
        if p.startswith('mcdo') or p.startswith('macdo') or p == 'mcdot': p = 'mcdo'
        if p in ('amsterdam', 'hamsterdam'): p = 'hamsterdam'
        p = {'cents': 'cent', 'vingts': 'vingt', 'million': 'millions', 'entree': 'entrer', "d'entree": "d'entrer"}.get(p, p)
        out.append(p)
    return out

# fusionne les groupes de chiffres (« 45 000 » → « 45000 ») avant de les dire
def groups(words):
    out, i = [], 0
    while i < len(words):
        j = i + 1; k = words[i].strip()
        while re.fullmatch(r'\d+', k) and j < len(words) and re.fullmatch(r'\d{3}[.,]?', words[j].strip()):
            k += words[j].strip().rstrip('.,'); j += 1
        out.append((k, i, j)); i = j
    return out

model = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = model.transcribe(VO, language='fr', word_timestamps=True)
heard = []
for w in (w for s in segs for w in s.words if w.word.strip()):
    t = w.word.strip()
    if heard and t.startswith("'"): heard[-1] = (heard[-1][0] + t, heard[-1][1], w.end)   # « d » + « 'avoir »
    else: heard.append((t, w.start, w.end))

# côté script : mots prononcés → indice du jeton
s_sub, s_ref = [], []
for k, i, j in groups([t['w'] for t in toks]):
    for p in spoken(k): s_sub.append(p); s_ref.append((i, j))
# côté voix : mots prononcés → heure (un nombre dit en un bloc est réparti sur ses mots)
h_sub, h_time = [], []
for k, i, j in groups([h[0] for h in heard]):
    ps = spoken(k); t0, t1 = heard[i][1], heard[j - 1][2]
    for q, p in enumerate(ps):
        h_sub.append(p); h_time.append((t0 + (t1 - t0) * q / len(ps), t0 + (t1 - t0) * (q + 1) / len(ps)))

sm = difflib.SequenceMatcher(None, s_sub, h_sub, autojunk=False)
span = {}
for a, b, n in sm.get_matching_blocks():
    for d in range(n):
        ref = s_ref[a + d]; t0, t1 = h_time[b + d]
        lo, hi = span.get(ref, (t0, t1)); span[ref] = (min(lo, t0), max(hi, t1))
for (i, j), (t0, t1) in span.items():
    for q in range(i, j):   # un nombre fusionné (« 45 000 ») : on répartit son temps sur ses morceaux
        toks[q]['start'] = round(t0 + (t1 - t0) * (q - i) / (j - i), 3)
        toks[q]['end'] = round(t0 + (t1 - t0) * (q - i + 1) / (j - i), 3)
known = [i for i, t in enumerate(toks) if 'start' in t]
for i in known: toks[i]['ok'] = 1
# mots non reconnus : interpolation entre voisins
for i, t in enumerate(toks):
    if 'start' in t: continue
    prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
    a = toks[prev]['end'] if prev is not None else 0.0
    b = toks[nxt]['start'] if nxt is not None else a + 0.4
    gap_n = (nxt if nxt is not None else len(toks)) - (prev if prev is not None else -1)
    k = i - (prev if prev is not None else -1)
    t['start'] = round(a + (b - a) * (k - 1) / gap_n, 3); t['end'] = round(a + (b - a) * k / gap_n, 3)
matched = len(known) / len(toks)
end = heard[-1][2] if heard else 0
json.dump({'tokens': toks, 'matched': round(matched, 3), 'duration': end}, open(OUT, 'w'), ensure_ascii=False, indent=0)
open(OUT + '.heard', 'w').write(' '.join(h[0] for h in heard))
print(f'{len(toks)} mots, {matched:.0%} retrouvés dans la voix, fin de voix à {end:.2f} s')
miss = [toks[i]['w'] for i in range(len(toks)) if i not in known]
if miss: print('non retrouvés :', ' · '.join(miss))
