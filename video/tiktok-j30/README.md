# Teaser TikTok Scalify — lancement J-30 (21 s, 1080×1920, 30 i/s)

Fichier final : `scalify-tiktok-j30.mp4` (H.264 + AAC, -14 LUFS).
Variante sans voix (pour poser un son tendance TikTok) : `scalify-tiktok-j30-sans-voix.mp4`.

## Script voix off (fr-FR-RemyMultilingualNeural, +15 %)
| Temps | Voix | Image |
|---|---|---|
| 0–1,1 s | « Votre commerce… » | 4 photos de commerçants en coupes rapides (zoom punch + secousse) |
| 1,1–2,6 s | « …invisible sur Google ? » | la boutique se désature et s'éteint, épingle 3D qui clignote et disparaît, glitch RGB |
| 2,6–4,4 s | « Dans 30 jours, c'est fini. » | drop musical + « J-30 » 3D qui s'écrase vers la caméra, vrille en speed ramp |
| 4,4–5,9 s | « Scalify arrive. » | pièce 3D au logo qui tourne, light leak |
| 5,9–9,3 s | « Site, fiche Google, avis, posts : on gère tout. » | téléphone 3D, 4 écrans synchronisés, whip pans sur photos |
| 9,3–11,9 s | « Et notre IA répond à vos clients, jour et nuit. » | conversation, passage jour → nuit (14:02 → 23:47) |
| 11,9–14,5 s | « Dès 49 € par mois, sans rendez-vous. » | « 49€ » en 3D, tampon |
| 14,5–17,3 s | « Les 15 premiers : moins 30 % sur l'annuel. » | « -30% » 3D, 15 places |
| 17,3–21 s | « Lancement dans 30 jours. Abonnez-vous ! » | photo « WE ARE OPEN », puis logo + « J-30 » 3D + bouton |

## Photos
Pexels (licence Pexels : usage commercial gratuit, sans attribution obligatoire) :
1836983 (barbier), 2544829 (chef), 37970775 (croissants), 3933017 (fleuriste), 7309930 (commerçante qui photographie),
4473496 (caisse), 4473398 (« Welcome, we are open »), 16239806 / 5251019 (écrans du téléphone).
URL : `https://www.pexels.com/photo/<id>/`

## Régénérer
1. `npm i three@0.170.0 playwright` puis `python3 tts.py fr-FR-RemyMultilingualNeural +15%` (voix + `words.json`)
2. `python3 sound.py` → `music.wav`, `sfx.wav` (musique et bruitages synthétisés, sans droits)
3. `node render.js frames 30` (ou en parallèle : `SHARD=0/3 node render.js frames 30 &` … `SHARD=2/3`)
4. `bash encode.sh`

Aperçu en direct : servir le dossier en HTTP (`npx serve .`) et ouvrir `index.html`.
