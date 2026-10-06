# Scalify — « La formule du glow-up » (17,5 s, 1080×1920, 30 i/s)

Format tendance TikTok (oct. 2026) : **Makeover Math** (équation avant → après) + transition **« fan blade »** sur le drop + texte au style natif TikTok. Pas de voix de synthèse.

| Temps | Image |
|---|---|
| 0–2 s | Rue sous la pluie, désaturée · « Pourquoi le commerce d'en face est toujours plein ? 👀 » |
| 2–6,5 s | « La formule du commerce vide : » Fiche Google 3,8 ★ + 12 avis sans réponse + dernier post 2024 |
| 6,5–7,5 s | « = 😬 » + glitch, montée et roulement de caisse claire |
| 7,5 s | DROP : pale de ventilateur qui balaie l'écran |
| 7,5–13,5 s | 12 plans de 0,5 s (latte, barbier, fleuriste, pâtes, « WE'RE OPEN », pain, pizzaiolo…) + une carte par seconde : 4,9 ★, réponse aux avis, posts, site, IA à 23:47, click & collect |
| 13,5–15 s | « = GLOW-UP » |
| 15–17,5 s | Scalify · J-?? · 15 places fondateurs -30 % · Abonnez-vous |

Les chiffres (3,8 ★, 12 avis, 4,9 ★…) sont des exemples illustratifs.

## Fabrication (net, sans pixelisation)
- Vidéos réelles verticales 1440×2560 (Pexels), montées par ffmpeg (`edit.py`) : coupes sur le beat, étalonnage froid / chaud, zooms « punch ».
- Textes et cartes : calque transparent rendu image par image (`index.html` + `overlay.js` → `render.js` en PNG alpha).
- Beat 120 BPM synthétisé (`sound.py`), étouffé avant le drop.
- `bash clips.sh && python3 edit.py && node render.js ov 30 && python3 sound.py && bash encode.sh`
