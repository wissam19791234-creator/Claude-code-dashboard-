# Données de montage : heures des mots, pages de titres karaoké, repères des cartes, du retournement et de l'appel.
import json
W = json.load(open('work/words.json')); V = json.load(open('work/vo.json'))
L = lambda li: [w for w in W if w['line'] == li]
END = round(V[-1]['end'] + 1.55, 2)
cards = []
for i in range(4):
    li = i + 1; swoop = round(V[li]['end'] + .14, 3)
    cards.append({'in': round(V[li]['start'] - .13, 3), 'swoop': swoop, 'tray': round(swoop + .6, 3), 'num': L(li)[0]['start']})
pages = []
for li in range(1, 9):
    ws = L(li)[1:] if li <= 4 else L(li)
    pages.append({'line': li, 'a': round(ws[0]['start'] - .08 if li > 4 else L(li)[0]['start'] - .05, 3), 'w': [[w['w'], w['start'], w['end']] for w in ws]})
for i, p in enumerate(pages):
    nxt = pages[i + 1]['a'] if i + 1 < len(pages) else None
    end = V[p['line']]['end'] + .25
    if p['line'] <= 4: end = cards[p['line'] - 1]['tray'] + .05
    if p['line'] == 5: end = 16.85
    if p['line'] == 6: end = L(7)[0]['start'] - .06
    if p['line'] == 8: end = 22.3
    if p['line'] == 7: end = L(8)[0]['start'] - .06
    p['b'] = round(min(end, nxt - .02) if nxt else end, 3)
D = {'end': END, 'cards': cards, 'pages': pages, 'words': [[w['w'], w['start'], w['end'], w['line']] for w in W],
     'twist': V[5]['start'], 'proof': round(V[6]['start'] - .05, 3), 'grid': round(V[7]['start'] - .05, 3), 'cta': round(V[9]['start'] - .2, 3),
     'flips': [round(V[7]['start'] + .28, 3), round(V[7]['start'] + .42, 3), round(L(7)[2]['start'] + .08, 3), round(L(8)[4]['start'] - .02, 3)],
     't200': L(6)[5]['start'], 'vo': V}
D['shakes'] = [L(0)[6]['start']] + [c['swoop'] + .22 for c in cards] + [D['t200']]
open('src/data.js', 'w').write('window.GHOST = ' + json.dumps(D, ensure_ascii=False) + ';\n')
json.dump(D, open('work/montage.json', 'w'), ensure_ascii=False, indent=1)
print('fin', END); print(json.dumps({k: D[k] for k in ['cards', 'twist', 'proof', 'grid', 'cta', 'flips', 't200', 'shakes']}))
for p in pages: print(p['a'], p['b'], ' '.join(w[0] for w in p['w']))
