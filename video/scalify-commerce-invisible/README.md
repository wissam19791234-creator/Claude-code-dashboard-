# Scalify — « Combien coûte un commerce invisible ? » (54 s)

Pub Scalify au format des vidéos « Combien ça rapporte » : Hamsterdam fait le calcul avec les gros chiffres rouges
et verts, les sous-titres karaoké, « Attends. » et « l'astuce de pro ». Les objets sont en **vraie 3D** (three.js),
comme dans la vidéo des colis perdus.

L'accroche : « Cette boulangerie perd 20 000 euros par an. Et le patron ne le sait même pas. » Puis le calcul :
- fiche Google pas à jour : 2 clients par jour vont chez le voisin, 15 € le panier, soit **900 €/mois** ;
- avis sans réponse : 1 client par jour qui part, soit **450 €/mois** ;
- personne ne répond aux messages après 19 h : **300 €/mois** de réservations perdues.

Total : **1 650 €/mois, presque 20 000 €/an**. « Je ferme boutique. » « Attends. » L'astuce de pro, c'est Scalify :
site, fiche Google, avis, posts et une IA qui répond aux clients 24 h/24, pour **49 €/mois**. Il suffit de 4 clients
par mois pour le rentabiliser. « Un commerce invisible, c'est pas un commerce. C'est un secret. »
Fin : lancement le 2 novembre, −30 % sur l'annuel pour les 15 premiers, « Abonne-toi pour ne pas le rater ».

- `scalify-commerce-invisible-9x16.mp4` : la vidéo (1080×1920, 54 s)
- `planche-9x16.jpg` : planche contact

Les montants sont un **exemple** affiché comme tel à l'écran (panier à 15 €). Seuls les faits de l'offre sont réels :
49 €/mois, −30 % sur l'annuel pour les 15 premiers, lancement le 2 novembre. Aucun logo ni couleur Google n'apparaît
(barre de recherche et carte génériques).

## Fabrication

Même chaîne que `../combien-rapporte-colis-perdus/` (voix Rémy gratuite, « Scalify » écrit « Scalifaï » pour la
prononciation, alignement Whisper, sous-titres karaoké, musique et bruitages synthétisés) :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : boulangerie (vitrine, store, rideau métallique qui tombe, mode « invisible » transparent), boutique du voisin, passants, épingles, téléphone (recherche, avis, tableau de bord Scalify), pièces, trou, horloge, bulles, balance, logo Scalify en relief |
| `src/art/scalify.js` | la couche 2D : Hamsterdam en boulanger (toque ajoutée dans `kit.js`), chiffres, étiquettes, tampons, logo et bouton « Abonne-toi » |
| `scenes.json` | les 16 plans calés sur la voix, les bruitages |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` puis `audio/sound.py` (voir le README de la vidéo McDo).

## Description TikTok

```
Ta boulangerie perd peut-être 20 000 € par an… sans que tu le saches 🥖💸
Fiche Google pas à jour, avis sans réponse, messages ignorés après 19 h : j'ai fait le calcul.
Scalify s'occupe de tout dès 49 €/mois. Lancement le 2 novembre, −30 % sur l'annuel pour les 15 premiers 👀
Abonne-toi pour ne pas le rater 🔔
(chiffres d'exemple)

#scalify #commercant #boulangerie #commercelocal #entrepreneur #business #pourtoi
```

Commentaire à épingler : `Ton dernier avis Google, tu y as répondu quand ? 😅 Lancement le 2 novembre 🐹`
