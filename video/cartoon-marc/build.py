# Place les répliques sur la timeline (avec les silences voulus) → timeline.json
import json
L = json.load(open('vo/lines.json'))
GAP = {'l1': .25, 'l2': .3, 'l3': 1.15, 'l4': .35, 'l5': .4, 'l6': .9, 'l7': 1.1}
t = .3; out = {}
for k, v in L.items():
    w = v['words']; end = w[-1]['t'] + w[-1]['d']
    out[k] = {'start': t, 'end': t + end, 'words': [{'w': x['w'], 't': t + x['t'], 'e': t + x['t'] + x['d']} for x in w]}
    t += end + GAP[k]
json.dump({'lines': out, 'end': round(t, 2)}, open('timeline.json', 'w'), ensure_ascii=False)
print('durée', round(t, 2), {k: round(v['start'], 2) for k, v in out.items()})
