#!/usr/bin/env python3
"""Génère la composition HyperFrames (9:16 ou 16:9) dans un dossier projet :
index.html (monde 3D + audio), compositions/titres.html (titres cinétiques), compositions/fin.html (carton final).
Usage : python3 build_html.py portrait|landscape [dossier]"""
import json, sys, html, os

MODE = sys.argv[1] if len(sys.argv) > 1 else 'portrait'
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
P = MODE == 'portrait'
W, H = (1080, 1920) if P else (1920, 1080)
DUR = 32.6
FIN_START = 28.95

COL = {'ember': '#fb4903', 'mint': '#55db9c', 'sun': '#f6b431', 'yellow': '#ffd731', 'lav': '#e9ccff',
       'blue': '#4da2ff', 'violet': '#5c4ade', 'sky': '#dceeff'}
DARK = {'ember', 'violet'}

# (id, début, fin, lignes, classe)
HL = [
    ('h1', 0.22, 2.12, [['Vos', 'clients', 'vous'], ['cherchent', 'en', 'ligne…']], ''),
    ('h2', 2.12, 4.38, [['…mais', 'le', 'chemin'], ['est', ('coupé.', 'ember')]], ''),
    ('h3', 4.45, 8.5, [[('Scalify', 'mint'), 'relie'], ['vos', 'clients', 'à'], ['votre', 'commerce.']], ''),
    ('h4', 9.78, 17.2, [['On', 'gère']], ''),
    ('h4a', 9.85, 11.72, [[('votre site', 'sun')]], 'tok'),
    ('h4b', 11.75, 13.57, [[('votre fiche', 'mint')], [('Google', 'mint')]], 'tok'),
    ('h4c', 13.6, 15.37, [[('vos avis', 'lav')]], 'tok'),
    ('h4d', 15.4, 17.2, [[('vos posts', 'blue')]], 'tok'),
    ('h5', 17.25, 19.55, [['Et', 'une', 'IA', 'qui'], ['répond', ('24/7', 'violet')]], ''),
    ('h6', 19.6, 20.92, [['Tout'], [('en un.', 'yellow')]], 'big'),
    ('h7', 20.98, 23.62, [['Le', 'tout,', 'dès'], [('49 €/mois', 'ember')]], ''),
    ('h8', 23.85, 25.45, [['Lancement', 'le'], [('2 novembre', 'yellow')]], ''),
    ('h9', 25.5, 28.38, [[('−30 %', 'violet'), 'sur'], ["l'annuel", 'pour'], ['les', '15', 'premiers.']], ''),
    ('h10', 28.45, DUR, [['Réservez'], ['votre', ('place.', 'yellow')]], ''),
]


def word(w):
    return f'<span class="w" data-layout-allow-overflow data-layout-allow-occlusion><b>{html.escape(w)}</b></span>'


def token(tok):
    if isinstance(tok, tuple):
        text, c = tok
        dark = ' dk' if c in DARK else ''
        inner = ' '.join(word(x) for x in text.split(' '))
        return f'<span class="mk{dark}" style="--c:{COL[c]}"><i></i>{inner}</span>'
    return word(tok)


def headline(i, hid, a, b, lines, cls):
    body = ''.join('<span class="ln">' + ' '.join(token(t) for t in ln) + '</span>' for ln in lines)
    return (f'<div id="t-{hid}" class="hl {cls} clip" data-start="{a}" data-duration="{round(b - a, 3)}" '
            f'data-track-index="{1 + i % 5}">{body}</div>')


LOGO_SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
            '<circle cx="16" cy="16" r="15.2" fill="#fff" stroke="#161311" stroke-width="1.4"/>'
            '<path d="M21 10.8H13.9a2.85 2.85 0 0 0 0 5.7h4.3a2.85 2.85 0 0 1 0 5.7H11" fill="none" stroke="#161311" '
            'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
            '<circle cx="22.4" cy="21.8" r="2" fill="#4da2ff" stroke="#161311" stroke-width=".8"/></svg>')

FONTS = """
@font-face { font-family: "Anton"; src: url("%(p)sassets/fonts/Anton-400.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "JBM"; src: url("%(p)sassets/fonts/JetBrainsMono-500.woff2") format("woff2"); font-weight: 500; }
"""

TITLES_CSS = """
#root { position: absolute; inset: 0; pointer-events: none; }
.hl { position: absolute; font-family: "Anton"; color: #161311; text-transform: uppercase; line-height: 1.02; letter-spacing: 0.004em; }
.ln { display: block; white-space: nowrap; }
.w { display: inline-block; overflow: hidden; vertical-align: top; padding: 0.04em 0.05em 0.08em; margin: -0.04em -0.05em -0.08em; }
.w > b { display: inline-block; font-weight: 400; }
.mk { position: relative; display: inline-block; padding: 0 0.14em; margin: 0.04em 0; }
.mk > i { position: absolute; left: 0; right: 0; top: 0.06em; bottom: 0; background: var(--c); border: 5px solid #161311; border-radius: 12px; transform-origin: 0 50%; display: block; }
.mk > .w { position: relative; }
.mk.dk { color: #fffaf1; }
""" + ("""
.hl { left: 74px; right: 74px; top: 236px; font-size: 118px; }
.hl.tok { top: calc(236px + 118px * 1.02); }
.hl.big { font-size: 190px; top: 220px; }
""" if P else """
.hl { left: 108px; width: 760px; top: 250px; font-size: 112px; }
.hl.tok { top: calc(250px + 112px * 1.02); }
.hl.big { font-size: 180px; top: 230px; }
""")

FIN_CSS = """
#root { position: absolute; inset: 0; pointer-events: none; }
.cta { position: absolute; display: flex; align-items: center; gap: 22px; font-family: "JBM"; font-weight: 500; }
.pill { display: block; background: #161311; color: #ffd731; border-radius: 999px; padding: 18px 34px 16px; font-size: 40px; letter-spacing: 0.02em; }
.meta { display: block; color: #161311; font-size: 34px; letter-spacing: 0.04em; }
.lock { position: absolute; display: flex; align-items: center; gap: 22px; }
.lock .mark { display: block; width: 104px; height: 104px; }
.lock .word { display: block; font-family: "Anton"; font-size: 96px; line-height: 1; color: #161311; letter-spacing: 0.01em; }
""" + ("""
.cta { left: 74px; top: 590px; }
.lock { left: 74px; top: 1392px; }
""" if P else """
.cta { left: 108px; top: 600px; flex-direction: column; align-items: flex-start; gap: 18px; }
.lock { left: 108px; top: 860px; }
.lock .mark { width: 92px; height: 92px; }
.lock .word { font-size: 84px; }
""")


def sub(cid, css, body, js):
    return f"""<!doctype html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>{cid}</title></head>
<body>
<template id="{cid}">
<style>{FONTS % {'p': '../'}}{css}</style>
<div id="root" data-composition-id="{cid}" data-width="{W}" data-height="{H}">
{body}
</div>
<script>{js}</script>
</template>
</body>
</html>
"""


def build():
    os.makedirs(os.path.join(OUT, 'compositions'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'assets'), exist_ok=True)
    open(os.path.join(OUT, 'assets/scalify-mark.svg'), 'w').write(LOGO_SVG)

    # --- titres cinétiques
    hls = '\n'.join(headline(i, *h) for i, h in enumerate(HL))
    spec = [{'id': 't-' + h[0], 'a': h[1], 'b': h[2]} for h in HL]
    js_t = """
  const tl = gsap.timeline({ paused: true });
  const SPEC = %(spec)s;
  SPEC.forEach(({ id, a, b }) => {
    const el = document.getElementById(id);
    const ws = el.querySelectorAll('.w > b');
    const mks = el.querySelectorAll('.mk > i');
    const big = el.classList.contains('big');
    tl.fromTo(ws, { yPercent: 125, rotation: 2.5 }, { yPercent: 0, rotation: 0, duration: big ? 0.42 : 0.5, ease: 'power3.out', stagger: 0.045 }, a);
    if (mks.length) tl.fromTo(mks, { scaleX: 0 }, { scaleX: 1, duration: 0.42, ease: 'expo.out', stagger: 0.06 }, a + 0.14);
    if (b < %(dur)s - 0.01) {
      const out = Math.max(a + 0.7, b - 0.36);
      tl.to(ws, { yPercent: -125, duration: 0.22, ease: 'power2.in', stagger: 0.01 }, out);
      if (mks.length) tl.to(mks, { scaleX: 0, transformOrigin: '100%% 50%%', duration: 0.16, ease: 'power2.in' }, out + 0.16);
    }
  });
  window.__timelines["titres"] = tl;
""" % {'spec': json.dumps(spec), 'dur': DUR}
    open(os.path.join(OUT, 'compositions/titres.html'), 'w').write(sub('titres', TITLES_CSS, hls, js_t))

    # --- carton final (temps local : 0 = début du carton)
    body_f = ('<div class="cta"><span id="fin-pill" class="pill">LIEN EN BIO →</span>'
              '<span id="fin-meta" class="meta">J-23 · LUNDI 2 NOVEMBRE</span></div>\n'
              '<div class="lock"><img id="fin-mark" class="mark" src="../assets/scalify-mark.svg" alt="" />'
              '<span id="fin-word" class="word">Scalify</span></div>')
    js_f = """
  const tl = gsap.timeline({ paused: true });
  tl.fromTo('#fin-mark', { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'power3.out' }, 0.05);
  tl.fromTo('#fin-word', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.25);
  tl.fromTo('#fin-pill', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.3);
  tl.fromTo('#fin-meta', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, 0.5);
  window.__timelines["fin"] = tl;
"""
    open(os.path.join(OUT, 'compositions/fin.html'), 'w').write(sub('fin', FIN_CSS, body_f, js_f))

    # --- composition principale
    index = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={W}, height={H}" />
<title>Scalify — pub isométrique</title>
<script src="src/vendor/gsap.min.js"></script>
<script type="importmap">{{ "imports": {{ "three": "./src/vendor/three.module.js", "three/addons/": "./src/vendor/addons/" }} }}</script>
<style>{FONTS % {'p': ''}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #f3eadb; }}
#root {{ width: 100%; height: 100%; position: relative; overflow: hidden; }}
#gl {{ position: absolute; inset: 0; width: 100%; height: 100%; display: block; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="{W}" data-height="{H}">
  <canvas id="gl" class="clip" data-start="0" data-duration="{DUR}" data-track-index="0" width="{W}" height="{H}" data-layout-allow-overflow></canvas>
  <div id="titres" data-composition-id="titres" data-composition-src="compositions/titres.html" data-start="0" data-duration="{DUR}" data-track-index="1" data-width="{W}" data-height="{H}"></div>
  <div id="fin" data-composition-id="fin" data-composition-src="compositions/fin.html" data-start="{FIN_START}" data-duration="{round(DUR - FIN_START, 3)}" data-track-index="2" data-width="{W}" data-height="{H}"></div>
  <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="{DUR}" data-track-index="3" data-volume="1"></audio>
</div>
<script type="module" src="src/main.js"></script>
<script>
  window.__timelines["main"] = gsap.timeline({{ paused: true }});
</script>
</body>
</html>
"""
    open(os.path.join(OUT, 'index.html'), 'w').write(index)
    print('ok', MODE, OUT)


build()
