# Scalify : « Le suspect » (TikTok / Reels, 1080×1920, 29 s)

Tendance utilisée (octobre 2026) : **« Suspect »**. On décrit quelqu'un comme un suspect, au ralenti, avec des détails
ultra précis et drôles. Ici le suspect est un commerçant sans site, traqué par la « Brigade des commerces invisibles ».

1. **Caméra de surveillance** : rue de nuit, gyrophares, projecteur d'hélicoptère ; le suspect (visage flouté) court au ralenti.
   Arrêt sur image + cercle rouge au mot « commerçant ». « Super boutique ✓ / Site internet : aucun ✗ ».
2. **Tableau de preuves** : signe distinctif (il répète ses horaires au téléphone, 15 bâtons), « Le bouche-à-oreille, ça suffit » (FAUX),
   recherche « épicerie fine près de moi » : 0 résultat (INTROUVABLE).
3. **Séance d'identification** : « Bonne nouvelle : on l'a retrouvé » (pancarte RETROUVÉ · EN LIGNE), profil, puis le complice : Scalify.
4. **Dossier classé** : landing page premium, 200 €, 5 jours, maquette offerte ; pièce à conviction : le site Maison Tison (exemple).
5. **Avis de recherche** : « Tu connais ce suspect ? Ou c'est toi ? Récompense : maquette offerte. Écris SITE en message privé. »

- `scalify-suspect-9x16.mp4` : version complète (voix + musique + bruitages).
- `scalify-suspect-9x16-sans-musique.mp4` : voix + bruitages, pour poser le son tendance dans TikTok (volume bas sous la voix).

## Légende TikTok

Le suspect a une super boutique… mais toujours pas de site. Landing page premium à 200 €, livrée en 5 jours, maquette offerte. Tu le reconnais ? Écris SITE en message privé.

#suspect #commercelocal #siteinternet #petitcommerce #entrepreneur

Commentaire à épingler : « Tague un commerçant qui doit voir ça 👀 (ou écris SITE en message privé pour ta maquette gratuite) »

## Fabrication (gratuit, rien sous licence payante)

1. Voix : edge-tts Henri (`fr-FR-HenriNeural`, +8 %), « Scalify » prononcé « Scalifaï » :
   `python3 voix/build_vo.py fr-FR-HenriNeural +8% assets/audio/vo.wav work/vo.json 28.6`, puis `python3 align.py`.
2. Données : `python3 build.py` → `src/data.js` (pages du bandeau, arrêt sur image, flashs, tampons).
3. Son : `python3 audio/sound.py assets/audio/vo.wav assets/audio/mix_raw.wav assets/audio/nomus_raw.wav` puis `loudnorm=I=-14:TP=-1.5`.
4. Image : HyperFrames 0.8.169 (`index.html` + `src/world.js` three.js : rue de nuit, mannequin articulé qui court, toise).
   Après l'encodage, la piste son est remplacée par `mix.wav` (crête propre à -3,6 dBFS).

Polices : Anton, Special Elite, Permanent Marker (Google Fonts, OFL). Aucune vraie marque ni vrai logo de police à l'écran.
