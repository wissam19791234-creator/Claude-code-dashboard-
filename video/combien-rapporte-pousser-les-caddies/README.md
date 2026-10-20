# « Combien ça rapporte de pousser les caddies des autres ? » (54 s)

Épisode « technique entre potes » de « Combien ça rapporte » : deux potes en gilet fluo portent les courses et
ramènent les caddies sur un parking de supermarché. Hamsterdam porte une casquette et un gilet fluo. Les objets
sont en **vraie 3D** (three.js).

**L'accroche (0-5 s)** : un caddie fou plein de packs d'eau fonce vers l'écran, une mamie court derrière, et un
pote en gilet fluo plonge pour l'arrêter (« STOP ! », la caméra tremble). La voix dit : « Toi et ton pote, même à
14 ans, vous pouvez vous faire 120 euros chaque samedi… sur un parking de supermarché. »

Puis la méthode et le calcul :
- d'abord, demander au directeur du magasin, qui dit oui parce que ses caddies sont rangés gratuitement ;
- deux gilets fluo et une pancarte « On charge votre coffre : 2 € » ;
- ton pote pousse le caddie, toi tu charges le coffre, puis vous ramenez le caddie ;
- la pièce de 1 € dans le caddie : « Gardez-la, les jeunes. » À chaque fois ;
- un client toutes les 12 minutes de 10 h à 18 h, soit 40 clients à 3 € : **120 €** ;
- « Je m'achète un caddie en or. » « Attends. » Vous êtes deux. Moins les gilets, la pancarte et le goûter :
  **55 € chacun en une journée**.

L'astuce de pro : quand il pleut, sortez le parapluie géant. Personne ne veut courir sous la pluie avec un pack
d'eau, et les pourboires doublent. Chute : « Votre meilleur commercial ? Le pack d'eau de 9 kilos. »

- `pousser-les-caddies-9x16.mp4` : la vidéo (1080×1920, 54 s)
- `planche-9x16.jpg` : planche contact

Chiffres : ordres de grandeur pour un samedi (40 clients × (2 € + la pièce de 1 €) = 120 €, partagés en deux, moins
5 € de frais chacun). Toujours avec l'accord du magasin.

## Fabrication

Même chaîne que `../combien-rapporte-costumes-gonflables/` :

| Fichier | Rôle |
| --- | --- |
| `src/world.js` | le monde 3D : parking, supermarché, caddies (grille, poignée, monnayeur) et train de caddies, voitures au coffre qui s'ouvre, potes en gilet fluo, directeur, mamie, pièce de 1 €, caddie en or, piles de pièces (1 pièce = 5 €), pluie, ciel d'orage, parapluie géant, pack d'eau « TOP VENDEUR » |
| `src/art/caddies.js` | la couche 2D : « STOP ! », chiffres, étiquettes, bulle « Gardez-la, les jeunes ! », tampons, Hamsterdam en casquette et gilet fluo (ajouté dans `kit.js`) |
| `audio/sound.py` | musique au ukulélé et bruitages, dont la pluie |
| `scenes.json` | les 13 plans calés sur la voix et les bruitages (la voix commence à 0,5 s, après le coup d'arrêt du caddie) |

`assets/audio/` n'est pas versionné : le régénérer avec `voix/build_vo.py` (puis un décalage de 0,5 s avec
`ffmpeg -af adelay=500:all=1`) et `audio/sound.py`.

`hyperframes check` dépasse son délai sur la vidéo entière, à cause des scènes avec beaucoup de caddies en 3D.
Lancé par tranches (`--range=0,3.2`, `3.2,6.5`, `6.5,13`, `13,19.5`, `19.5,26`, `26,39`, `39,53.96`), il passe.

## Description TikTok

```
Toi et ton pote, 120 € chaque samedi… sur un parking de supermarché 🛒💸
J'ai calculé combien ça rapporte de pousser les caddies des autres. L'astuce de pro quand il pleut 👀☔
Tag le pote qui pousse le caddie 👇
(chiffres estimés, toujours avec l'accord du magasin)

#argent #business #ado #idee #pote #supermarche #combiencarapporte #pourtoi
```

Commentaire à épingler : `Tu pousses le caddie ou tu charges le coffre ? 🛒💪 Tag ton pote 🐹`
