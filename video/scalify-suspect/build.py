# Données de montage : pages du bandeau (sous-titres), heures des scènes, des flashs et des tampons.
import json
W = json.load(open('work/words.json')); V = json.load(open('work/vo.json'))
L = lambda li: [w for w in W if w['line'] == li]
END = round(V[-1]['end'] + 1.2, 2)
SPLIT = {0: [5], 1: [5, 5], 2: [2, 4, 2, 4], 3: [4, 3], 4: [4, 4, 1], 5: [2, 3], 6: [2, 1], 7: [4, 3, 4, 2]}
pages = []
for li, sp in SPLIT.items():
    ws = L(li); assert sum(sp) == len(ws), (li, len(ws)); k = 0
    for n in sp: pages.append({'line': li, 'w': [[w['w'], w['start'], w['end']] for w in ws[k:k + n]]}); k += n
for i, p in enumerate(pages):
    p['a'] = round(p['w'][0][1] - .06, 3)
    nxt = pages[i + 1]['w'][0][1] - .08 if i + 1 < len(pages) else None
    end = V[p['line']]['end'] + .5
    p['b'] = round(min(end, nxt) if nxt and pages[i + 1]['line'] == p['line'] else min(end, nxt or end), 3)
t = lambda li, k: L(li)[k]['start']
D = {'end': END, 'pages': pages, 'words': [[w['w'], w['start'], w['end'], w['line']] for w in W], 'vo': V,
     'freeze': [t(0, 4) - .02, t(0, 4) + .55], 'cam2': 2.12, 'board': 5.15, 'lineup': 15.75, 'dossier': 20.45, 'poster': 24.78,
     'flashes': [t(5, 0), t(5, 4) + .1, t(6, 2)],
     'tally': t(2, 8), 'faux': t(3, 6), 'introuvable': t(4, 8), 'site': t(1, 9),
     'dossierT': [t(7, 1), t(7, 5), t(7, 7), t(7, 11)], 'cta': [t(8, 0), t(8, 4), t(8, 5)]}
open('src/data.js', 'w').write('window.SUSPECT = ' + json.dumps(D, ensure_ascii=False) + ';\n')
json.dump(D, open('work/montage.json', 'w'), ensure_ascii=False, indent=1)
print('fin', END, {k: D[k] for k in ['freeze', 'flashes', 'tally', 'faux', 'introuvable', 'site', 'dossierT', 'cta']})
for p in pages: print(p['a'], p['b'], ' '.join(w[0] for w in p['w']))
