# « Combien ça rapporte de repêcher les balles de golf ? » (44 s)

Épisode « méthode originale » de « Combien ça rapporte » : un plongeur récupère les balles de golf au fond des lacs
des parcours et les revend. Hamsterdam porte un masque de plongée et un tuba. Les objets sont en **vraie 3D**
(three.js).

**L'accroche (0-5 s)** : un plongeur en plein vol plonge tête la première dans un lac de golf (« PLOUF ! »), puis
ressort d'un coup en brandissant un filet plein de balles. La voix dit : « Il plonge dans un lac de golf… et il
ressort avec 3 000 balles. » Puis, détaché syllabe par syllabe : « Lit-té-ra-le-ment. » Au même moment, il
pleut des centaines de balles de golf sur tout l'écran. (« Balles » veut aussi dire « euros » en argot, d'où la blague.)

Puis la méthode et le calcul :
- sous l'eau, un tapis de milliers de balles : un seul lac de golf en avale jusqu'à 50 000 par an ;
- signer un contrat avec le golf, à qui on reverse 10 centimes par balle ;
- combinaison, bouteille et filet : −1 500 € ;
- en une plongée, 3 000 balles, lavées puis revendues 1 € pièce : **3 000 €** ;
- « Je m'achète un golf » (voiturette en or), puis « Attends. » : moins la part du golf (300 €), les balles abîmées
  (700 €) et l'essence (100 €), il reste **1 900 € en une journée**.

L'astuce de pro : plonger devant le trou le plus dur du parcours (un green sur une île), là où tout le monde rate
et où il y a dix fois plus de balles. Chute : « Le pire joueur du club ? C'est ton meilleur fournisseur. »

- `balles-de-golf-9x16.mp4` : la vidéo (1080×1920, 44 s)
- `planche-9x16.jpg` : planche contact

Chiffres : ordres de grandeur pour une journée de plongée (3 000 balles × 1 € = 3 000 €, moins 1 100 € de frais).
Il faut un contrat avec le golf et être plongeur certifié.

## Fabrication

Même chaîne que `../combien-rapporte-pousser-les-caddies/` :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : parcours (gazon tondu, lacs, drapeaux, arbres), plongeur (masque, tuba, bouteille, palmes), filet plein de balles, gerbes d'eau, pluie de balles qui rebondissent, fond du lac avec des milliers de balles, algues, poissons et bulles (brouillard sous l'eau), contrat signé, matériel, bac de lavage et plateaux de balles, voiturette en or, piles de pièces (1 pièce = 100 €), green sur une île, golfeur maladroit |
| `src/art/golf.js` | la couche 2D : « PLOUF ! », titres, chiffres, étiquettes, tampons « LITTÉRALEMENT » et « TON MEILLEUR FOURNISSEUR » |
| `src/art/kit.js` | Hamsterdam avec un masque de plongée et un tuba (nouvelle option `hat: 'plongee'`) |
| `audio/sound.py` | musique au ukulélé et nouveaux bruitages : plongeon, plouf, bulles, pluie de balles, swing de golf |
| `scenes.json` | les 13 plans calés sur la voix et les bruitages (la voix commence à 0,4 s, après le plongeon) |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` (puis un décalage de 0,4 s avec
`ffmpeg -af adelay=400:all=1`) et `audio/sound.py`.

`hyperframes check` se lance par tranches (`--range=0,5`, `5,10.6`, `10.6,17.5`, `17.5,22.9`, `22.9,31.6`,
`31.6,37.4`, `37.4,44.38`). Les seules alertes restantes portent sur le contraste des gros titres (« 3 000 BALLES »,
« COMBIEN ÇA RAPPORTE », « LE PIRE JOUEUR », « DU CLUB ? », « ? »). L'outil ne tient pas compte de leur contour
noir épais, qui les rend lisibles.

## Description TikTok

```
Il plonge dans un lac de golf… et il ressort avec 3 000 balles. Littéralement 🏌️‍♂️🤿💸
J'ai calculé combien ça rapporte de repêcher les balles de golf. L'astuce de pro est géniale 👀
Tu savais que ce métier existait ? 👇
(chiffres estimés, contrat avec le golf et plongeur certifié obligatoires)

#golf #plongee #business #argent #metier #idee #combiencarapporte #pourtoi
```

Commentaire à épingler : `Le pire joueur de ton club, c'est qui ? 😂⛳ Tag-le, il finance des plongeurs 🐹🤿`
