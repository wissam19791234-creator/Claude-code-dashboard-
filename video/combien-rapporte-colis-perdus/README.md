# « Ce magasin revend TES colis perdus » (53 s)

Série « business pas très éthique (mais légal) ». Première vidéo de la chaîne avec les objets en **vraie 3D** :
l'entrepôt, les cartons, les palettes, le camion, les piles de pièces et le téléphone sont modélisés en three.js
(lumières, ombres, matières brillantes), et Hamsterdam, les chiffres et les sous-titres restent dessinés par-dessus en 2D.

L'accroche : ton colis perdu, quelqu'un l'a racheté et te le revend 20 € sans l'ouvrir. Puis le calcul au format court :
entrepôt à 3 000 €/mois, une palette de 200 colis jamais livrés pour 1 500 €, revendus fermés 20 € pièce (4 000 € la palette),
8 palettes par mois = 32 000 €. « Attends » : TVA, palettes, loyer et 2 salariés, il reste ≈ 6 000 €/mois.
L'astuce de pro : des coques et des câbles… mais de temps en temps un téléphone. Une vidéo d'ouverture fait 2 millions de vues,
tout le monde vient tenter sa chance, 16 palettes par mois, ≈ 18 000 €/mois sans payer une pub.
Le colis à 20 €, c'est un ticket de loto.

- `colis-perdus-9x16.mp4` : la vidéo (1080×1920, 53 s)
- `planche-9x16.jpg` : planche contact

Chiffres : ordres de grandeur (palettes de retours / colis non réclamés vendues au lot, revente « colis mystère »).

## Fabrication

Même chaîne que `../combien-ca-rapporte-mcdo-court/` (voix Rémy gratuite, alignement Whisper, sous-titres karaoké,
musique et bruitages synthétisés), avec en plus une couche 3D :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : entrepôt en tôle, cartons (scotch, étiquette « ? », rabats qui s'ouvrent), palettes, rayonnages, camion « COLIS PERDUS », piles de pièces (1 pièce = 1 000 €), téléphone qui filme ; un plan 3D et une caméra par scène |
| `src/kit3d.js`, `src/vendor/` | rendu three.js (moteur local, aucun service en ligne) |
| `src/main.js` | rend l'image 3D exacte de chaque instant pendant le rendu HyperFrames |
| `src/art/colis.js` | la couche 2D transparente : Hamsterdam, chiffres rouges/verts, étiquettes, tampons |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` puis `audio/sound.py` (voir le README de la vidéo McDo).

## Description TikTok

```
Ton colis perdu ? Quelqu'un te le revend 20 € 📦👀
J'ai fait le calcul… c'est pas très éthique, mais c'est légal
T'achèterais un colis mystère à 20 € ? 👇
(chiffres estimés)

#colisperdus #colismystere #business #argent #entrepreneur #combiencarapporte #pourtoi
```

Commentaire à épingler : `T'as déjà perdu un colis ? Il est peut-être en vente quelque part 😅📦 🐹`
