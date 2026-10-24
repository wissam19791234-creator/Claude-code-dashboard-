# Scalify : « 4 trucs que ton commerce doit ghoster avant Halloween » (TikTok / Reels, 1080×1920, 27 s)

Tendances utilisées (octobre 2026) : le format « Things you should definitely ghost » (liste de trucs à « ghoster ») et
l'esthétique Halloween « mignon qui fait peur ». Un petit fantôme 3D ghoste les quatre freins d'un commerçant, puis chaque
frein se retourne en avantage Scalify :

| Truc ghosté | Version Scalify |
|---|---|
| Le site fait par ton neveu en 2012 | Design premium (exemple : le site Maison Tison) |
| Les devis à 3 000 € | Landing page premium à 200 € |
| Attendre 2 mois pour être en ligne | Livrée en 5 jours |
| Payer avant d'avoir vu quoi que ce soit | Maquette offerte avant de payer |

Appel à l'action : « Écris SITE en message privé ».

- `scalify-ghost-9x16.mp4` : version complète (voix + musique + bruitages).
- `scalify-ghost-9x16-sans-musique.mp4` : voix + bruitages seulement, pour ajouter un son tendance dans TikTok (volume bas sous la voix).

## Légende TikTok

Ton commerce mérite mieux qu'un site de 2012. Landing page premium à 200 €, en ligne en 5 jours, et tu vois ta maquette avant de payer. Écris SITE en message privé.

#halloween #siteinternet #commercelocal #petitcommerce #entrepreneur

Commentaire à épingler : « Écris SITE en message privé : on te fait ta maquette gratuitement, tu ne paies que si elle te plaît. »

## Fabrication (gratuit, rien sous licence payante)

1. Voix : edge-tts Vivienne (`fr-FR-VivienneMultilingualNeural`, +12 %), « ghoster » écrit « gausté » pour la prononciation :
   `python3 voix/build_vo.py fr-FR-VivienneMultilingualNeural +12% assets/audio/vo.wav work/vo.json 27.2`, puis `python3 align.py`.
2. Données : `python3 build.py` → `src/data.js` (heures des cartes, passages du fantôme, retournements, appel à l'action).
3. Son : `python3 audio/sound.py assets/audio/vo.wav assets/audio/mix_raw.wav assets/audio/nomus_raw.wav` puis `loudnorm=I=-14:TP=-1.5`.
4. Image : HyperFrames 0.8.169 (`index.html` + `src/world.js` three.js : fantôme en ombrage aplat + contour, cartes recto/verso, citrouilles).
   La preuve à l'écran réutilise la capture du site Maison Tison (`video/scalify-promo-site-3d`, `assets/video/site.mp4`).

Polices : Fredoka, Rubik Wet Paint, Comic Neue (Google Fonts, OFL). Aucune vraie marque à l'écran.
