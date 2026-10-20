# « Combien ça rapporte de louer des costumes gonflables ? » (50 s)

Épisode Halloween de « Combien ça rapporte » : Hamsterdam en chapeau de sorcier, nuit violette, objets en
**vraie 3D** (three.js).

**L'accroche (0-4 s)** : un T-Rex gonflable posé à plat au sol se gonfle d'un coup (« PFFFT ! »), tremblote,
puis se met à danser en jean et baskets. La voix dit : « Ce T-Rex gonflable coûte 40 €… et il rapporte 1 200 €
par an. »

Puis le calcul :
- 60 costumes (T-Rex, fantômes, citrouilles géantes) à 40 € pièce : −2 400 € ;
- location 25 € la soirée ;
- semaine d'Halloween : chaque costume part 6 soirs, soit 360 locations et **9 000 €** ;
- « Je m'achète un vrai dinosaure. » « Attends. » Moins les costumes, la TVA, le nettoyage et les piles des
  ventilateurs : **4 000 € en une semaine**.

L'astuce de pro : après Halloween, les costumes ne dorment pas au placard. Enterrements de vie de garçon,
anniversaires, carnaval : un T-Rex se loue toute l'année. Loué chaque week-end, il rapporte **1 200 € par an**
pour un costume à 40 €. « Ce T-Rex, c'est pas un déguisement. C'est un employé. »

- `costumes-gonflables-9x16.mp4` : la vidéo (1080×1920, 50 s)
- `planche-9x16.jpg` : planche contact

Chiffres : ordres de grandeur avant impôts sur le revenu (25 € × 48 week-ends = 1 200 €).

## Fabrication

Même chaîne que `../combien-rapporte-maison-hantee/` :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : T-Rex gonflable (gonflage, danse, tremblement), fantôme et citrouille gonflables, boule à facettes et spots, vrai dinosaure, pièces, placard, écharpe « FUTUR MARIÉ », chapeau d'anniversaire, ballons, confettis, cravate et badge « EMPLOYÉ DU MOIS » |
| `src/art/gonflables.js` | la couche 2D : « PFFFT ! », chiffres, calendrier des 6 soirs, étiquettes, tampons, Hamsterdam |
| `audio/sound.py` | musique Halloween et bruitages, dont le gonflage et le rugissement du dinosaure |
| `scenes.json` | les 12 plans calés sur la voix et les bruitages (la voix commence à 0,45 s, après le gonflage) |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` (puis un décalage de 0,45 s avec
`ffmpeg -af adelay=450:all=1`) et `audio/sound.py`.

`hyperframes check` dépasse son délai sur la vidéo entière, à cause des scènes avec 12 à 15 costumes en 3D.
Lancé par tranches (`--range=0,13`, `13,26`, `26,39`, `39,50.3`), il passe.

## Description TikTok

```
Ce T-Rex gonflable coûte 40 €… et il rapporte 1 200 € par an 🦖💸
J'ai calculé combien rapporte la location de costumes gonflables. Halloween, c'est que le début 👀
Tu louerais quel costume ? 👇
(chiffres estimés)

#halloween #costume #trex #business #argent #idee #combiencarapporte #pourtoi
```

Commentaire à épingler : `T-Rex, fantôme ou citrouille géante ? 🦖👻🎃 Le meilleur costume gagne 🐹`
