# Prépare les données de montage (mots, pages de sous-titres, heures clés) pour la composition et la bande-son.
import json
W = json.load(open('work/words.json'))
M = json.load(open('cap/meta.json'))
END = 37.0
VSTART = 7.4                       # la capture du site commence à 7,4 s dans la vidéo
CAP_LINES = {1, 2, 3, 4, 5, 6}     # sous-titres classiques (l'accroche, l'offre et l'appel ont leur propre typographie)
pages = []
for li in sorted(CAP_LINES):
    ws = [w for w in W if w['line'] == li]
    SPLIT = {1: [1, 2, 2, 3], 2: [3, 2], 3: [1, 4, 2], 4: [3, 1, 2], 5: [2, 2], 6: [3, 2, 1, 2]}[li]
    assert sum(SPLIT) == len(ws), (li, len(ws))
    k = 0
    for n in SPLIT: pages.append(ws[k:k + n]); k += n
P = []
for i, pg in enumerate(pages):
    a = pg[0]['start'] - .06
    nxt = pages[i + 1][0]['start'] - .06 if i + 1 < len(pages) and pages[i + 1][0]['line'] == pg[0]['line'] else pg[-1]['end'] + .45
    if i + 1 < len(pages): nxt = min(nxt, pages[i + 1][0]['start'] - .06)
    P.append({'a': round(a, 3), 'b': round(min(nxt, pg[-1]['end'] + .9), 3), 'w': [[x['w'], x['start'], x['end']] for x in pg]})
t = lambda li, k: [w for w in W if w['line'] == li][k]['start']
D = {'end': END, 'vstart': VSTART, 'tap': round(VSTART + M['tap'], 3), 'btn': M['button'], 'pages': P,
     'words': [[w['w'], w['start'], w['end'], w['line']] for w in W],
     't200': t(7, 4), 'tsite': t(10, 1)}
open('src/data.js', 'w').write('window.PROMO = ' + json.dumps(D, ensure_ascii=False) + ';\n')
json.dump(D, open('work/montage.json', 'w'), ensure_ascii=False, indent=1)
for p in P: print(f"{p['a']:6.2f}-{p['b']:6.2f}  {' '.join(w[0] for w in p['w'])}")
print('t200', D['t200'], 'tap', D['tap'])
