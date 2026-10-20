# « Combien ça rapporte une maison hantée pour Halloween ? » (52 s)

Épisode Halloween de « Combien ça rapporte », avec Hamsterdam en chapeau de sorcier et les objets en **vraie 3D**
(three.js), sur un fond violet de nuit d'Halloween.

**Les 3 premières secondes** sont faites pour arrêter le pouce :
- 0 s : un fantôme jaillit de la porte de la maison hantée et fonce sur l'écran, avec « BOUH ! », un coup sourd,
  un accord dissonant, la caméra qui tremble et Hamsterdam qui sursaute ;
- 0,7 s : la voix dit « Ils paient 20 €… pour avoir peur » ;
- 2,3 s : « Et ils font 2 heures de queue. »

Puis le calcul :
- entrepôt pour octobre −4 000 €, décors −3 000 €, 10 étudiants déguisés en zombies −9 000 € ;
- 12 soirs × 300 visiteurs × 20 € = **72 000 €** ;
- « Je m'achète un manoir. » « Attends. » Moins la TVA, l'entrepôt, les décors, les zombies et la sécurité :
  **≈ 40 000 € pour un mois**.

L'astuce de pro, c'est **la file d'attente** : plus elle est longue, plus ça rapporte.
- Le pass VIP sans attente à 10 € est pris par 1 visiteur sur 3 : **+12 000 €**.
- À la sortie, la photo de ton cri à 8 € est achetée par 1 visiteur sur 2 : **+14 000 €**.

Chute : « Le vrai monstre de la maison hantée ? C'est la file d'attente. »

- `maison-hantee-9x16.mp4` : la vidéo (1080×1920, 52 s)
- `planche-9x16.jpg` : planche contact

Chiffres : ordres de grandeur avant impôts sur le revenu, pour une maison hantée éphémère de 12 soirs.

## Fabrication

Même chaîne que `../combien-rapporte-colis-perdus/`, avec trois ajouts :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : maison hantée (tour, fenêtres allumées, panneau), lune, fantôme, citrouilles-lanternes, chauves-souris qui battent des ailes, brume, zombies, visiteurs en file, pass VIP doré, photo du cri avec flash, pièces (1 pièce = 4 000 €) |
| `src/art/halloween.js` | la couche 2D : « BOUH ! », Hamsterdam en chapeau de sorcier (ajouté dans `kit.js`), chiffres, étiquettes à contour sombre lisibles sur le violet |
| `audio/sound.py` | musique Halloween (la mineur, pizzicati et thérémine) et nouveaux bruitages : stinger de frayeur, cri, déclic photo |
| `scenes.json` | les 13 plans calés sur la voix et les bruitages (le stinger est placé à 0 s ; la voix commence à 0,7 s) |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` (puis un décalage de 0,7 s avec
`ffmpeg -af adelay=700:all=1`) et `audio/sound.py`.

## Description TikTok

```
Ils paient 20 € pour avoir peur… et ils font 2 h de queue 👻🎃
J'ai calculé combien rapporte une maison hantée pour Halloween. L'astuce de pro va te choquer 👀
Tu paierais le pass VIP ? 👇
(chiffres estimés)

#halloween #maisonhantee #business #argent #entrepreneur #combiencarapporte #pourtoi
```

Commentaire à épingler : `Tu achètes la photo de ton cri ou pas ? 😱 Moi je l'encadre 🐹🎃`
