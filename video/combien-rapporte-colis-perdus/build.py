# Génère la vidéo HyperFrames « Ce magasin revend tes colis perdus » (format court, objets en 3D)
# à partir de work/words.json (script aligné mot à mot), scenes.json (13 plans, bruitages), work/vo_r.wav
# du monde 3D src/world.js (three.js : cartons, palettes, entrepôt, camion…) et du calque 2D src/art/colis.js (titres, chiffres, Hamsterdam).
# Écrit index.html, compositions/*.html, src/montage.js (mots horodatés + bouche) et work/montage.json (bruitages).
# Usage : python3 build.py
import json, re, subprocess
import numpy as np

W = json.load(open('work/words.json'))
S = json.load(open('scenes.json'))
toks = W['tokens']
END = round(toks[-1]['end'] + 1.3, 2)          # on laisse le dernier plan respirer

norm = lambda s: re.sub(r"[^a-z0-9àâçéèêëîïôûùüÿœ'%]", '', s.lower())
def find(phrase, after=0):
    """indice du 1er mot de `phrase` dans le script (à partir de `after`)"""
    p = [norm(x) for x in phrase.split()]
    for i in range(after, len(toks) - len(p) + 1):
        if all(norm(toks[i + k]['w']) == p[k] for k in range(len(p))): return i
    raise SystemExit(f'ancre introuvable : {phrase}')

# ---------------------------------------------------------------- plans (début = 1er mot de l'ancre)
starts, k = [], 0
for sc in S['scenes']:
    k = find(sc['anchor'], k); starts.append(0.0 if sc['n'] == 1 else round(toks[k]['start'] - 0.1, 3))
shots = [{'n': sc['n'], 'a': starts[i], 'b': round(starts[i + 1] if i + 1 < len(starts) else END, 3)} for i, sc in enumerate(S['scenes'])]

# ---------------------------------------------------------------- sous-titres karaoké (1 à 3 mots, le mot dit en rose)
pages, cur = [], []
for i, t in enumerate(toks):
    if cur:
        prev = toks[cur[-1]]
        brk = len(cur) >= 3 or re.search(r'[.?!…:,]$', prev['w']) or (t['start'] - prev['end'] > 0.3)
        if t['cls'] and not t.get('grp_start') and prev['cls'] and len(cur) < 5 and not re.search(r'[.?!…:,]$', prev['w']): brk = False
        if brk: pages.append(cur); cur = []
    cur.append(i)
if cur: pages.append(cur)
esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;')
shown = lambda w: re.sub(r'[,.;:]+$', '', w)
cap_html, cap_js = [], []
for p, idx in enumerate(pages):
    a = max(0, toks[idx[0]]['start'] - 0.03)
    b = (toks[pages[p + 1][0]]['start'] - 0.03) if p + 1 < len(pages) else END - 0.1
    if p + 1 < len(pages): b = min(b, toks[idx[-1]]['end'] + 0.8)
    ws = ''.join(f'<span class="w" id="w{i}">{esc(shown(toks[i]["w"]))}</span> ' for i in idx)
    cap_html.append(f'<div class="pg" id="pg{p}">{ws.strip()}</div>')
    cap_js.append([p, round(a, 3), round(b, 3), [[i, round(toks[i]['start'], 3), round(toks[i + 1]['start'] if i + 1 < len(toks) else END, 3)] for i in idx]])

# ---------------------------------------------------------------- compteurs (dépenses avant d'ouvrir, charges par mois)
counters = []
for C in S['counters']:
    a = toks[find(C['start'])]['start'] - 0.05; e = toks[find(C['end'])]['start'] - 0.15
    steps, k = [], 0
    for st in C['steps']:
        k = find(st['at'], k); steps.append([round(toks[k]['start'], 3), st['value']])
    counters.append({'label': C['label'], 'a': round(a, 3), 'b': round(e, 3), 'steps': steps})

# ---------------------------------------------------------------- bruitages : un « pop » à chaque chiffre (caisse pour les gains)
sfx, last = [], -9
for t in toks:
    if t['cls'] and t.get('grp_start') and t['start'] - last > 0.4:
        sfx.append([round(t['start'] + 0.02, 3), 'cash' if t['cls'] == 'y' else 'pop']); last = t['start']
for e in S.get('sfx', []):
    sfx.append([round(toks[find(e['at'])]['start'] + e.get('off', 0), 3), e['kind']])
json.dump({'sfx': sorted(sfx), 'end': END, 'starts': starts}, open('work/montage.json', 'w'), indent=0)

# ---------------------------------------------------------------- bouche de Hamsterdam : une ouverture par syllabe
SR = 16000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'work/vo_r.wav', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = SR // 100
rms = np.array([np.sqrt(np.mean(v[i:i + 2 * hop] ** 2)) for i in range(0, len(v) - 2 * hop, hop)])
rms = np.convolve(rms, np.ones(3) / 3, 'same')
mouth = []
for i in range(6, len(rms) - 6):
    if rms[i] > 0.04 and rms[i] == rms[i - 6:i + 7].max():
        a0, b0 = round(i / 100 - 0.04, 2), round(i / 100 + 0.07, 2)
        if mouth and a0 < mouth[-1][1] + 0.04: a0 = round(mouth[-1][1] + 0.04, 2)
        if b0 - a0 >= 0.05: mouth.append([a0, b0])
open('src/montage.js', 'w').write('// généré par build.py : mots horodatés, débuts des plans, bouche de Hamsterdam\nwindow.MCDO = ' +
    json.dumps({'words': [[t['w'], t['start'], t['end']] for t in toks], 'starts': starts, 'end': END, 'mouth': mouth}, ensure_ascii=False, separators=(',', ':')) + ';\n')

# ================================================================ HTML
FF = ('@font-face { font-family: "Luckiest Guy"; src: url("assets/fonts/LuckiestGuy.woff2") format("woff2"); font-weight: 400; }\n'
      '@font-face { font-family: "Patrick Hand"; src: url("assets/fonts/PatrickHand.woff2") format("woff2"); font-weight: 400; }')
scene_divs = '\n'.join(f'  <div class="sc" id="s{x["n"]}"><div class="kb" id="k{x["n"]}"><svg class="art" id="g{x["n"]}" viewBox="0 0 1080 1920" width="1080" height="1920"></svg></div></div>' for x in shots)
scenes_html = f'''<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><title>scenes</title></head><body>
<template id="scenes">
<style>
{FF}
.sc {{ position: absolute; inset: 0; overflow: hidden; opacity: 0; }}
.kb {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }}
.art {{ position: absolute; left: 0; top: 0; overflow: hidden; }}
</style>
<div id="root" data-composition-id="scenes" data-width="1080" data-height="1920">
  <!-- calque 2D des 13 plans (src/art/colis.js) posé sur le monde 3D : titres, gros chiffres, étiquettes, Hamsterdam -->
{scene_divs}
</div>
<script>
(function () {{
  var SC = {json.dumps([[x['n'], x['a'], x['b']] for x in shots])};
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
.pg {{ position: absolute; left: 60px; right: 60px; top: 1600px; text-align: center; font-family: "Luckiest Guy", sans-serif; font-size: 92px;
  line-height: 1.1; color: #ffffff; text-transform: uppercase; opacity: 0; }}
.w {{ display: inline-block; margin: 0 0.08em; -webkit-text-stroke: 13px #111111; paint-order: stroke fill; text-shadow: 0 8px 0 rgba(0,0,0,0.25); transform-origin: 50% 70%; }}
</style>
<div id="root" data-composition-id="soustitres" data-width="1080" data-height="1920">
  <!-- sous-titres karaoké en bas (texte exact du script) : le mot prononcé passe en rose -->
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
      var we = '#w' + w[0], t0 = Math.max(p[1], w[1] - 0.03);
      gsap.set(we, {{ opacity: 0, scale: 0.6, color: '#ffffff' }});
      ft(we, {{ opacity: 0, scale: 0.6 }}, {{ opacity: 1, scale: 1.12, duration: 0.08, ease: 'power2.out' }}, t0);
      ft(we, {{ scale: 1.12 }}, {{ scale: 1, duration: 0.12, ease: 'power2.inOut' }}, t0 + 0.08);
      tl.set(we, {{ color: '#ff4fa8' }}, t0);
      tl.set(we, {{ color: '#ffffff' }}, Math.min(p[2], w[2] - 0.03));
    }});
  }});
  window.__timelines["soustitres"] = tl;
}})();
</script>
</template></body></html>
'''

counter_divs = '\n'.join(f'  <div class="cb" id="cb{i}"><div class="lb">{esc(c["label"])}</div><div class="val" id="cv{i}">0 €</div></div>' for i, c in enumerate(counters))
counter_html = f'''<!doctype html>
<html lang="fr"><head><meta charset="UTF-8" /><title>compteur</title></head><body>
<template id="compteur">
<style>
{FF}
.cb {{ position: absolute; left: 0; right: 0; top: 96px; margin: 0 auto; width: 640px; height: 186px; background: #ffffff; border: 7px solid #111111;
  border-radius: 10px; box-shadow: 8px 10px 0 rgba(0,0,0,0.18); text-align: center; opacity: 0; transform: rotate(-1.2deg); }}
.cb .lb {{ position: absolute; left: 0; right: 0; top: 16px; font-family: "Luckiest Guy", sans-serif; font-size: 30px; letter-spacing: 0.04em; color: #111111; }}
.cb .val {{ position: absolute; left: 0; right: 0; top: 56px; font-family: "Luckiest Guy", sans-serif; font-size: 104px; line-height: 1; color: #ff3b30;
  -webkit-text-stroke: 10px #111111; paint-order: stroke fill; }}
</style>
<div id="root" data-composition-id="compteur" data-width="1080" data-height="1920">
  <!-- cadres « dépenses avant d'ouvrir » puis « charges par mois » : le total grimpe à chaque dépense -->
{counter_divs}
</div>
<script>
(function () {{
  var CS = {json.dumps(counters)};
  var tl = gsap.timeline({{ paused: true }});
  var ft = function (t, a, b, at) {{ b.immediateRender = false; tl.fromTo(t, a, b, at); }};
  var fmt = function (v) {{ return (v < 0 ? '\\u2212' : '') + Math.round(Math.abs(v)).toString().replace(/\\B(?=(\\d{{3}})+(?!\\d))/g, '\\u202f') + '\\u202f€'; }};
  CS.forEach(function (c, i) {{
    var el = document.getElementById('cv' + i), box = '#cb' + i;
    el.textContent = fmt(c.steps[0][1]);
    // valeur affichée = propriété-fonction tweenée (rendue même quand la runtime cherche la timeline sans événements)
    var px = {{ v: c.steps[0][1], val: function (x) {{ if (arguments.length) {{ this.v = x; el.textContent = fmt(x); }} return this.v; }} }};
    gsap.set(box, {{ opacity: 0, y: -60 }});
    ft(box, {{ opacity: 0, y: -60, scale: 0.85 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }}, c.a);
    var prev = c.steps[0][1];
    c.steps.forEach(function (s, k) {{
      if (k) ft(px, {{ val: prev }}, {{ val: s[1], duration: 0.55, ease: 'power2.out' }}, s[0]);
      ft(box, {{ scale: 1 }}, {{ scale: 1.08, duration: 0.09, ease: 'power2.out', yoyo: true, repeat: 1 }}, s[0]);
      ft(box, {{ x: 0 }}, {{ x: -10, duration: 0.04, ease: 'none', yoyo: true, repeat: 3 }}, s[0] + 0.05);
      prev = s[1];
    }});
    ft(box, {{ opacity: 1, y: 0 }}, {{ opacity: 0, y: -60, duration: 0.25, ease: 'power2.in' }}, c.b);
  }});
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
<title>Ce magasin revend tes colis perdus</title>
<script src="src/vendor/gsap.min.js"></script>
<script src="src/montage.js"></script>
<script src="src/art/kit.js"></script>
<script src="src/art/colis.js"></script>
<script src="src/art/build.js"></script>
<script type="importmap">{{ "imports": {{ "three": "./src/vendor/three.module.js", "three/addons/": "./src/vendor/addons/" }} }}</script>
<style>
{FF}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #fff4e6; }}
#root {{ width: 100%; height: 100%; position: relative; overflow: hidden;
  background: radial-gradient(80% 50% at 50% 62%, #fffdf8 0%, #fff4e6 55%, #f6e3c9 100%); }}
#gl {{ width: 100%; height: 100%; display: block; }}
.clip {{ position: absolute; inset: 0; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1080" data-height="1920">
  <canvas id="gl" class="clip" data-start="0" data-duration="{END}" data-track-index="4" width="1080" height="1920" data-layout-allow-overflow style="z-index: 0"></canvas>
  <div id="scenes" class="clip" style="z-index: 1" data-composition-id="scenes" data-composition-src="compositions/scenes.html" data-start="0" data-duration="{END}" data-track-index="0" data-width="1080" data-height="1920"></div>
  <div id="compteur" class="clip" style="z-index: 2" data-composition-id="compteur" data-composition-src="compositions/compteur.html" data-start="0" data-duration="{END}" data-track-index="1" data-width="1080" data-height="1920"></div>
  <div id="soustitres" class="clip" style="z-index: 3" data-composition-id="soustitres" data-composition-src="compositions/soustitres.html" data-start="0" data-duration="{END}" data-track-index="2" data-width="1080" data-height="1920"></div>
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="{END}" data-track-index="5" data-volume="1"></audio>
</div>
<script type="module" src="src/main.js"></script>
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
print(f'durée {END} s · {len(pages)} pages de sous-titres · {len(sfx)} bruitages · plans (s) : {[round(x["b"] - x["a"], 2) for x in shots]}')
