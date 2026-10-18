# Génère la vidéo HyperFrames « Combien rapporte un McDo ? » à partir de :
#   work/words.json (script aligné mot à mot), scenes.json (19 scènes + compteur), work/vo_r.wav (voix rythmée)
#   et des 19 plans dessinés en SVG dans src/art/ (kit.js = Hamsterdam et accessoires, scenes1.js / scenes2.js = plans).
# Écrit index.html, compositions/*.html, src/montage.js (mots horodatés + bouche) et work/montage.json (ding).
# Usage : python3 build.py
import json, os, re, sys, subprocess

TEST = '--test' in sys.argv
W = json.load(open('work/words_test.json' if TEST else 'work/words.json'))
S = json.load(open('scenes.json'))
toks = W['tokens']
END = round(toks[-1]['end'] + 1.4, 2)          # on laisse le dernier plan respirer

norm = lambda s: re.sub(r"[^a-z0-9àâçéèêëîïôûùüÿœ'%]", '', s.lower())
def find(phrase, after=0):
    """indice du 1er mot de `phrase` dans le script (à partir de `after`)"""
    p = [norm(x) for x in phrase.split()]
    for i in range(after, len(toks) - len(p) + 1):
        if all(norm(toks[i + k]['w']) == p[k] for k in range(len(p))): return i
    raise SystemExit(f'ancre introuvable : {phrase}')

# ---------------------------------------------------------------- scènes (début = 1er mot de l'ancre)
starts, k = [], 0
for sc in S['scenes']:
    k = find(sc['anchor'], k); starts.append(0.0 if sc['n'] == 1 else round(toks[k]['start'] - 0.12, 3))
shots = []
for i, sc in enumerate(S['scenes']):
    b = starts[i + 1] if i + 1 < len(starts) else END
    shots.append({'n': sc['n'], 'a': starts[i], 'b': round(b, 3)})

# ---------------------------------------------------------------- pages de sous-titres (2-4 mots)
pages, cur = [], []
for i, t in enumerate(toks):
    if cur:
        prev = toks[cur[-1]]
        brk = (len(cur) >= 3 and not (t['cls'] and not t.get('grp_start') and toks[cur[-1]]['cls'])) \
            or re.search(r'[.?!…:]$', prev['w']) or (t['start'] - prev['end'] > 0.32) \
            or (t['cls'] and t.get('grp_start') and len(cur) >= 2)
        if t['cls'] and not t.get('grp_start') and prev['cls'] and len(cur) < 6: brk = brk and re.search(r'[.?!…]$', prev['w'])
        if brk: pages.append(cur); cur = []
    cur.append(i)
if cur: pages.append(cur)

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;')
cap_html, cap_js = [], []
for p, idx in enumerate(pages):
    a = toks[idx[0]]['start'] - 0.04
    b = (toks[pages[p + 1][0]]['start'] - 0.04) if p + 1 < len(pages) else END - 0.2
    b = min(b, toks[idx[-1]]['end'] + 0.9) if p + 1 < len(pages) else END - 0.1
    shown = lambda w: re.sub(r'[,.;:]+$', '', w)          # pas de virgules ni de points dans les sous-titres
    ws = ''.join(f'<span class="w {toks[i]["cls"]}" id="w{i}">{esc(shown(toks[i]["w"]))}</span> ' for i in idx)
    cap_html.append(f'<div class="pg" id="pg{p}">{ws.strip()}</div>')
    cap_js.append([p, round(max(0, a), 3), round(b, 3), [[i, round(toks[i]['start'], 3)] for i in idx]])

# ---------------------------------------------------------------- compteur d'argent
C = S['counter']
c0 = find(C['start']); c_end_i = find(C['end'], c0)
cnt = {'a': round(toks[c0]['start'] - 0.1, 3), 'b': round(toks[c_end_i + len(C['end'].split()) - 1]['end'] + 0.6, 3), 'base': C['base'], 'steps': []}
k = c0
for st in C['steps']:
    k = find(st['at'], k); cnt['steps'].append([round(toks[k]['start'], 3), st['value'], st['chip']])

# ---------------------------------------------------------------- moments « ding » (début de chaque groupe de chiffres)
dings, last = [], -9
for t in toks:
    if t['cls'] and t.get('grp_start') and t['start'] - last > 0.45:
        dings.append(round(t['start'] + 0.02, 3)); last = t['start']
json.dump({'dings': dings, 'end': END, 'starts': starts}, open('work/montage.json', 'w'), indent=0)

import numpy as np
SR = 16000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'work/vo_r.wav' if not TEST else 'work/vo_test_r.wav', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = SR // 100
rms = np.array([np.sqrt(np.mean(v[i:i + 2 * hop] ** 2)) for i in range(0, len(v) - 2 * hop, hop)])
rms = np.convolve(rms, np.ones(3) / 3, 'same')
mouth = []                  # une ouverture de bouche par syllabe (pic local de l'enveloppe de la voix)
for i in range(7, len(rms) - 7):
    if rms[i] > 0.04 and rms[i] == rms[i - 7:i + 8].max():
        a0, b0 = round(i / 100 - 0.05, 2), round(i / 100 + 0.08, 2)
        if mouth and a0 < mouth[-1][1] + 0.04: a0 = round(mouth[-1][1] + 0.04, 2)
        if b0 - a0 >= 0.06: mouth.append([a0, b0])
open('src/montage.js', 'w').write('// généré par build.py : mots horodatés, débuts des plans, bouche de Hamsterdam\nwindow.MCDO = ' +
    json.dumps({'words': [[t['w'], t['start'], t['end']] for t in toks], 'starts': starts, 'end': END, 'mouth': mouth}, ensure_ascii=False, separators=(',', ':')) + ';\n')

# ================================================================ HTML
FF = '@font-face { font-family: "Luckiest Guy"; src: url("assets/fonts/LuckiestGuy.woff2") format("woff2"); font-weight: 400; }'
scene_divs = '\n'.join(f'  <div class="sc" id="s{x["n"]}"><div class="kb" id="k{x["n"]}"><svg class="art" id="g{x["n"]}" viewBox="0 0 1080 1920" width="1080" height="1920"></svg></div></div>' for x in shots)
scene_js = [[x['n'], x['a'], x['b']] for x in shots]
scenes_html = f'''<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><title>scenes</title></head><body>
<template id="scenes">
<style>
.sc {{ position: absolute; inset: 0; overflow: hidden; opacity: 0; }}
.kb {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }}
.art {{ position: absolute; left: 0; top: 0; overflow: hidden; }}
</style>
<div id="root" data-composition-id="scenes" data-width="1080" data-height="1920">
  <!-- les 19 plans dessinés (src/art) dans l'ordre du script ; chacun s'anime, la caméra recadre toutes les 3-5 s -->
{scene_divs}
</div>
<script>
(function () {{
  var SC = {json.dumps(scene_js)};
  var tl = gsap.timeline({{ paused: true }});
  ART.buildScenes(tl, SC);
  window.__timelines["scenes"] = tl;
}})();
</script>
</template></body></html>
'''

subs_html = f'''<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><title>soustitres</title></head><body>
<template id="soustitres">
<style>
{FF}
.pg {{ position: absolute; left: 70px; right: 70px; top: 470px; text-align: center; font-family: "Luckiest Guy", sans-serif; font-size: 104px;
  line-height: 1.08; color: #ffffff; text-transform: uppercase; opacity: 0; }}
.w {{ display: inline-block; margin: 0 0.1em; -webkit-text-stroke: 14px #000000; paint-order: stroke fill; text-shadow: 0 10px 0 rgba(0,0,0,0.85); transform-origin: 50% 70%; }}
.w.y {{ color: #ffd60a; }}
.w.r {{ color: #ff3b30; }}
</style>
<div id="root" data-composition-id="soustitres" data-width="1080" data-height="1920">
  <!-- sous-titres mot par mot (texte exact du script) : chiffres en jaune, dépenses en rouge -->
{chr(10).join('  ' + h for h in cap_html)}
</div>
<script>
(function () {{
  var P = {json.dumps(cap_js)};
  var tl = gsap.timeline({{ paused: true }});
  var ft = function (t, a, b, at) {{ b.immediateRender = false; tl.fromTo(t, a, b, at); }};
  P.forEach(function (p) {{
    var el = '#pg' + p[0];
    gsap.set(el, {{ opacity: 0 }});
    ft(el, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.01 }}, p[1]);
    ft(el, {{ opacity: 1 }}, {{ opacity: 0, duration: 0.01 }}, p[2]);
    p[3].forEach(function (w) {{
      var we = '#w' + w[0];
      gsap.set(we, {{ opacity: 0, scale: 0.55 }});
      ft(we, {{ opacity: 0, scale: 0.55, y: 18 }}, {{ opacity: 1, scale: 1.14, y: 0, duration: 0.1, ease: 'power2.out' }}, Math.max(p[1], w[1] - 0.03));
      ft(we, {{ scale: 1.14 }}, {{ scale: 1, duration: 0.14, ease: 'power2.inOut' }}, Math.max(p[1], w[1] - 0.03) + 0.1);
    }});
  }});
  window.__timelines["soustitres"] = tl;
}})();
</script>
</template></body></html>
'''

fmt = lambda v: f'{int(round(v)):,}'.replace(',', ' ') + ' €'
counter_html = f'''<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><title>compteur</title></head><body>
<template id="compteur">
<style>
{FF}
#cn {{ position: absolute; left: 0; right: 0; top: 176px; margin: 0 auto; width: 800px; height: 210px; opacity: 0; font-family: "Luckiest Guy", sans-serif; text-align: center; }}
#cn .box {{ position: absolute; inset: 0; border-radius: 40px; background: #111111; border: 8px solid #ffd60a; box-shadow: 0 14px 0 rgba(0,0,0,0.35); }}
#cn .lb {{ position: absolute; left: 0; right: 0; top: 22px; font-size: 40px; color: #ffd60a; letter-spacing: 0.04em; }}
#cn .val {{ position: absolute; left: 0; right: 0; top: 72px; font-size: 112px; line-height: 1; color: #ffffff; }}
.chip {{ position: absolute; left: 0; right: 0; top: 368px; margin: 0 auto; width: max-content; padding: 6px 26px; border-radius: 24px; background: #ff3b30;
  border: 6px solid #000; font-family: "Luckiest Guy", sans-serif; font-size: 50px; line-height: 1.1; color: #fff; opacity: 0; white-space: nowrap; }}
</style>
<div id="root" data-composition-id="compteur" data-width="1080" data-height="1920">
  <!-- compteur d'argent : le chiffre d'affaires fond à chaque prélèvement de McDo -->
  <div id="cn"><div class="box"></div><div class="lb">CHIFFRE D'AFFAIRES</div><div class="val" id="cv">{fmt(cnt["base"])}</div></div>
{chr(10).join(f'  <div class="chip" id="ch{i}">{esc(st[2])}</div>' for i, st in enumerate(cnt["steps"]))}
</div>
<script>
(function () {{
  var C = {json.dumps(cnt)};
  var tl = gsap.timeline({{ paused: true }});
  var ft = function (t, a, b, at) {{ b.immediateRender = false; tl.fromTo(t, a, b, at); }};
  var el = document.getElementById('cv');
  var fmt = function (v) {{ return Math.round(v).toString().replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, '\\u202f') + ' €'; }};
  // valeur affichée = propriété-fonction tweenée (rendue même quand la runtime cherche la timeline sans événements)
  var box = {{ v: C.base, val: function (x) {{ if (arguments.length) {{ this.v = x; el.textContent = fmt(x); }} return this.v; }} }};
  gsap.set('#cn', {{ opacity: 0, y: -40 }});
  ft('#cn', {{ opacity: 0, y: -40, scale: 0.9 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)' }}, C.a);
  var prev = C.base;
  C.steps.forEach(function (s, i) {{
    if (s[1] !== prev) ft(box, {{ val: prev }}, {{ val: s[1], duration: 0.7, ease: 'power2.out' }}, s[0]);
    ft('#cn', {{ x: 0 }}, {{ x: -14, duration: 0.05, ease: 'none', yoyo: true, repeat: 3 }}, s[0]);
    gsap.set('#ch' + i, {{ opacity: 0 }});
    ft('#ch' + i, {{ opacity: 0, y: -60, scale: 0.6 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'back.out(2.5)' }}, s[0]);
    var nxt = i + 1 < C.steps.length ? C.steps[i + 1][0] : C.b;
    ft('#ch' + i, {{ opacity: 1, y: 0 }}, {{ opacity: 0, y: 60, duration: 0.25, ease: 'power2.in' }}, Math.min(nxt - 0.05, s[0] + 1.6));
    prev = s[1];
  }});
  ft('#cn', {{ opacity: 1, y: 0 }}, {{ opacity: 0, y: -40, duration: 0.3, ease: 'power2.in' }}, C.b);
  window.__timelines["compteur"] = tl;
}})();
</script>
</template></body></html>
'''

index_html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Combien rapporte un McDo ?</title>
<script src="src/vendor/gsap.min.js"></script>\n<script src="src/montage.js"></script>\n<script src="src/art/kit.js"></script>\n<script src="src/art/scenes1.js"></script>\n<script src="src/art/scenes2.js"></script>\n<script src="src/art/build.js"></script>
<style>
{FF}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #ff8c1a; }}
#root {{ width: 100%; height: 100%; position: relative; overflow: hidden; }}
.clip {{ position: absolute; inset: 0; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1080" data-height="1920">
  <div id="scenes" class="clip" style="z-index: 1" data-composition-id="scenes" data-composition-src="compositions/scenes.html" data-start="0" data-duration="{END}" data-track-index="0" data-width="1080" data-height="1920"></div>
  <div id="compteur" class="clip" style="z-index: 2" data-composition-id="compteur" data-composition-src="compositions/compteur.html" data-start="0" data-duration="{END}" data-track-index="1" data-width="1080" data-height="1920"></div>
  <div id="soustitres" class="clip" style="z-index: 3" data-composition-id="soustitres" data-composition-src="compositions/soustitres.html" data-start="0" data-duration="{END}" data-track-index="2" data-width="1080" data-height="1920"></div>
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="{END}" data-track-index="5" data-volume="1"></audio>
</div>
<script>
  window.__timelines["main"] = gsap.timeline({{ paused: true }});
</script>
</body>
</html>
'''
open('compositions/scenes.html', 'w').write(scenes_html)
open('compositions/soustitres.html', 'w').write(subs_html)
open('compositions/compteur.html', 'w').write(counter_html)
open('index.html', 'w').write(index_html)
lens = [round(x['b'] - x['a'], 2) for x in shots]
print(f'durée {END} s · {len(pages)} pages de sous-titres · {len(dings)} ding · plans (s) : {lens}')
