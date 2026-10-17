# Scalify — pub « psychologie inverse » (HyperFrames)

Pub TikTok de 33 s (1080×1920). Une voix pince-sans-rire déconseille Scalify et propose à la place une
**notice de montage façon meuble en kit : « Comment perdre vos clients en 5 étapes »**. Un petit bonhomme
pictogramme fait tout de travers. Puis la notice se retourne (face jaune : « Comment GARDER vos clients ») et
Scalify coche tout. Fin ironique : « Et surtout… ne cliquez pas sur le lien en bio » — le curseur clique quand même.

- `scalify-psy-inverse-9x16.mp4` : TikTok / Reels / Shorts
- `planche-9x16.jpg` : planche contact

## Déroulé (calé sur la voix off)

| Temps | Scène | Fichier |
| --- | --- | --- |
| 0 – 6,3 s | « Surtout… ne prenez pas Scalify. » (logo barré) · « Gardez votre méthode… pour perdre des clients. » | `compositions/accroche.html` |
| 6 – 18,4 s | Les 5 pages de la notice : fiche Google poussiéreuse, avis ignorés, site de 2009, aucun post, réponse le lendemain | `compositions/etape-1.html` … `etape-5.html`, `entete.html` |
| 18,2 – 21,4 s | « Bravo. Vos clients sont chez le concurrent. » | `compositions/bravo.html` |
| 21,2 – 26 s | La notice se retourne : Scalify s'occupe de tout (5 cases cochées, IA 24/7) | `compositions/retournement.html` |
| 25,45 – 29,6 s | Contenu du kit · dès 49 €/mois · −30 % sur l'annuel pour les 15 premiers · J-16 | `compositions/offre.html` |
| 29,15 – 33 s | « Ne cliquez pas » · bouton LIEN EN BIO · logo + lancement lundi 2 novembre | `compositions/fin.html` |

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | composition racine : papier, sous-compositions, piste audio, styles partagés des pages |
| `src/sk.js` | boîte à outils : bonhomme pictogramme, « boil » dessin animé, tampons, mots calés sur la voix, pilotage par le temps |
| `audio/tts.py`, `audio/trim.py` | voix off (edge-tts, « Scalify » prononcé « Scalifaï ») et resserrage des silences |
| `audio/sound.py` | musique et bruitages synthétisés (aucune piste sous licence) + mixage → `assets/audio/mix.wav` |

Note technique : la runtime cherche les timelines avec `suppressEvents`, donc les `onUpdate` ne partent pas au
rendu. Tout ce qui dépend du temps passe par `SK.drive` (une propriété-fonction tweenée, toujours rendue), et les
pivots SVG sont posés une seule fois avec `SK.piv` avant toute transformation (sinon GSAP décale l'élément).

## Refaire le rendu

```bash
cd audio && python3 sound.py mix_raw.wav && ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 ../assets/audio/mix.wav
cd .. && npx hyperframes check
npx hyperframes render --quality delivery --workers 3 --output renders/scalify-psy-inverse-9x16.mp4
```

Changer le compte à rebours : « J-16 » dans `compositions/offre.html` et `compositions/fin.html`.
