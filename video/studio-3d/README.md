# Scalify — pub « studio 3D brillant » (HyperFrames + three.js)

Pub TikTok de 30,5 s (1080×1920) en psychologie inverse, façon keynote : studio blanc, objets 3D brillants,
typographie Inter Tight. « Surtout… ne laissez pas Scalify travailler à votre place. » — puis tout ce qui se fait
tout seul : site, avis, fiche Google, posts, IA qui répond même à 3 h du matin. « Le risque ? Avoir du temps libre. »

- `scalify-studio-3d-9x16.mp4` : TikTok / Reels / Shorts
- `planche-9x16.jpg` : planche contact

## Déroulé

| Temps | Voix | 3D |
| --- | --- | --- |
| 0 – 3,8 s | « Surtout… ne laissez pas Scalify travailler à votre place. » | interrupteur éteint… qui s'allume tout seul |
| 3,8 – 6,7 s | « Votre site ? Il se met à jour tout seul. » | téléphone ; le site se construit, des blocs viennent s'y ranger |
| 6,7 – 9,1 s | « Vos avis ? Une réponse à chacun. » | étoiles dorées en orbite, bulle cochée |
| 9,1 – 11,9 s | « Votre fiche Google ? Toujours à jour. » | épingle qui tombe et rebondit, ondes au sol |
| 11,9 – 14,4 s | « Vos posts ? Publiés pour vous. » | publications qui s'envolent du téléphone, cœurs |
| 14,4 – 17,8 s | « Et une IA répond à vos clients… même à trois heures du matin. » | bulles de conversation, horloge sur 3 h |
| 17,8 – 21,4 s | « Le risque ? Avoir du temps libre. Beaucoup. » | tasse fumante, ballon de plage |
| 21,4 – 25,7 s | « Dès 49 € par mois. Moins 30 % pour les 15 premiers. » | pièce « € » qui se retourne en « −30 % sur l'annuel », 15 places |
| 25,7 – 30,5 s | « Si ce risque ne vous fait pas peur… c'est le lien en bio. » | interrupteur allumé, bouton « Lien en bio » pressé, logo + J-16 |

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | composition racine : canevas 3D, trois couches de texte, piste audio, typographie partagée |
| `src/kit3d.js` | rendu physique (environnement de studio, tone mapping neutre), matières brillantes, formes extrudées, ombres de contact |
| `src/world.js` | tous les objets 3D, leur animation et la caméra, en fonction pure du temps |
| `src/screen.js` | l'écran du téléphone (canvas 2D redessiné à chaque image) |
| `src/timeline.js` | minutage calé sur la voix off |
| `src/tx.js` + `compositions/textes-*.html` | titres animés mot à mot (fondu net, sortie floutée) |
| `audio/` | `tts.py` + `trim.py` (voix edge-tts), `instr.py` + `sound.py` (musique et bruitages synthétisés, mixage) |

## Refaire le rendu

```bash
cd audio && python3 tts.py && python3 trim.py && python3 sound.py mix_raw.wav \
  && ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 ../assets/audio/mix.wav
cd .. && npx hyperframes check
npx hyperframes render --quality delivery --workers 3 --output renders/scalify-studio-3d-9x16.mp4
```

Changer le compte à rebours : `JOURS` dans `src/timeline.js` (référence) et « J-16 » dans `compositions/textes-3.html`.
