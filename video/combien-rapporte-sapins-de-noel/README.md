# « Combien ça rapporte de louer des sapins de Noël ? » (48 s)

Nouvelle série : **une méthode 100 % légale** pour gagner de l'argent, avec une idée originale. Même format que les
vidéos « Combien ça rapporte » (Hamsterdam, cette fois en bonnet de Noël), objets en **vraie 3D** (three.js).

L'accroche : « Ce gars loue le même sapin de Noël à la même famille. Chaque année. » Puis le calcul :
- 300 sapins en pot à 25 € : **7 500 €** ;
- loués 45 € pour décembre, livrés chez les gens et repris en janvier : 300 × 45 = **13 500 €** ;
- « Je m'achète un traîneau. » « Attends. » Moins les sapins, la camionnette et l'essence : **4 000 € pour un mois**.

L'astuce de pro : en janvier on ne jette rien, on replante les sapins dans un champ et ils grandissent. L'année
d'après, on reloue les mêmes et on n'a presque rien à racheter : **plus de 10 000 €, toujours pour un mois**. Et les
familles redemandent le même sapin, elles lui donnent même un prénom (« Gérard »). « Le sapin à 45 €, c'est pas un
sapin. C'est un abonnement. »

- `sapins-de-noel-9x16.mp4` : la vidéo (1080×1920, 48 s)
- `planche-9x16.jpg` : planche contact

Chiffres : ordres de grandeur avant impôts (sapin en pot ≈ 25 €, location ≈ 45 € livraison et reprise comprises,
camionnette louée un mois, quelques sapins perdus à remplacer). La location de sapins en pot existe déjà dans
plusieurs villes : c'est une activité légale (micro-entreprise), et en plus aucun sapin n'est coupé.

## Fabrication

Même chaîne que `../combien-rapporte-colis-perdus/` :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : sapins en pot (boules, étoile), maison dont la fenêtre s'allume, village, camionnette « SAPINS À LOUER », traîneau, champ qui passe de la neige à l'herbe, pièces (1 pièce = 1 000 €), étiquette « Gérard », neige |
| `src/art/sapins.js` | la couche 2D : Hamsterdam en bonnet de Noël (ajouté dans `kit.js`), chiffres, étiquettes, tampons, fin « Dis-le en commentaire » |
| `scenes.json` | les 12 plans calés sur la voix, les bruitages |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` puis `audio/sound.py` (voir le README de la vidéo McDo).

## Description TikTok

```
Il loue le même sapin à la même famille… chaque année 🎄💸
J'ai fait le calcul : 100 % légal, et ça rapporte de plus en plus chaque Noël 👀
Tu louerais ton sapin ? 👇
(chiffres estimés)

#noel #sapindenoel #business #argent #idee #entrepreneur #combiencarapporte #pourtoi
```

Commentaire à épingler : `Vous l'appelleriez comment, votre sapin ? 🎄 Moi je vote Gérard 🐹`
