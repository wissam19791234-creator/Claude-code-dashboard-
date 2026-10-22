# Scalify : site de lancement

## Phase 0 : brief

- **Sujet** : Scalify, un service pour les commerces de proximité (boulangeries, fleuristes, barbiers, cafés,
  librairies…). Il gère le site, la fiche Google, les avis, les posts, et une IA qui répond aux clients 24 h/24.
- **Public** : commerçants indépendants, sur téléphone le plus souvent, peu de temps, méfiants envers « le digital ».
- **Rôle du site** : lancer le service et faire réserver une des 15 places de l'offre fondateurs.
- **Faits réels (seuls chiffres affichés)** : lancement le lundi 2 novembre 2026 ; −30 % sur l'abonnement annuel pour
  les 15 premiers ; aucun prix mensuel annoncé avant le lancement.
- **Langue** : français. **Contrainte** : le site est filmé image par image (capture verticale 1080×1920) pour une
  vidéo TikTok : la version téléphone est la vitrine principale.
- **Hypothèses (placeholder: true dans `src/data/site.ts`)** : adresse e-mail de contact `contact@scalify.fr`,
  URL de production `https://scalify.fr`, noms des six commerces de la rue (fictifs, illustratifs).

## Phase 1 : concepts

| | A. Le point bleu (identité) | B. Le rideau de fer (matière du métier) | C. Ouvert 24 h/24 (système formel) |
|---|---|---|---|
| Idée | Le point bleu du logo est le « vous êtes ici » de la carte : là où il passe, la rue s'allume | Le site est une boutique qui ouvre le matin : un rideau métallique se lève sur chaque section | Le site est une journée de 24 h : défiler fait tourner l'horloge, et l'IA répond encore à 3 h |
| Ancre | le point bleu du logo Scalify + la promesse « rendre visible sur la carte » + la campagne « commerce invisible » | les rideaux de fer des commerces français, le lancement un lundi matin | la réponse 24 h/24 de l'IA, « personne ne répond après 19 h » |
| Signature | rue de nuit en 3D : chaque vitrine s'allume au passage du point (rideau qui monte, enseigne qui grésille, épingle qui sort) | rideau 3D ondulé qui s'enroule au défilement | ciel scrubé de l'aube à la nuit |
| Capture d'écran | la rue entière allumée, épingles au-dessus, point bleu qui pulse | le rideau à mi-hauteur, la lumière qui passe dessous | la boutique à 03:12 avec une bulle de réponse |
| O / F / Fe / P | 4 / 5 / 3 / 2 | 4 / 4 / 4 / 3 | 3 / 4 / 4 / 3 |

**Retenu : A.** C'est le seul qui part de la marque elle-même (le point bleu du logo) et de sa promesse ; il donne
la 3D « wow » demandée. Emprunts : à B, le rideau de fer pour la transition de page et la 404 ; à C, la scène de
nuit (03:12) pour l'IA.

## Concept Card

```
Idea:        Le point bleu du logo Scalify, c'est votre commerce sur la carte : là où il passe, la rue s'allume.
Metaphor:    une rue commerçante la nuit, vue comme une carte (épingles, « vous êtes ici »).
Signature:   la rue 3D (three.js) en sticky stage : le défilement fait avancer le point bleu le long du trottoir,
             chaque commerce s'allume (rideau qui monte, vitrine chaude, enseigne qui grésille, épingle + étoiles).
             Fin : l'enseigne « Scalify » s'allume sur le toit d'en face.
Emotion:     d'une rue éteinte et inquiète à une rue vivante, en 3 secondes.
Motion verb: s'allumer comme une enseigne : un grésillement court (2 ou 3 battements), puis la lumière tient.
Screenshot:  la rue entière allumée, six épingles chaudes, le point bleu au premier plan.
```

## Phase 2 : système

### Palette (une rue de nuit, deux lumières : le point et la vitrine)

| Rôle | Hex | Usage |
|---|---|---|
| ground | `#07090f` | nuit, fond de page |
| ink | `#eef2f7` | texte |
| muted | `#8f99ad` | texte secondaire (AA sur ground) |
| line | `rgb(238 242 247 / 0.14)` | filets |
| accent (point) | `#4da2ff` | le point bleu du logo : focus, « vous êtes ici », liens actifs |
| light (vitrine) | `#ffc46b` | lumière des commerces : boutons au survol, chiffres de l'offre |
| curtain | `#232833` + nervures | rideau de fer (transition de page) |

Noir + un seul accent est une facilité d'IA : ici, le noir est la nuit de la rue et les deux couleurs sont deux
sources de lumière réelles de la scène (le point de la carte, l'ampoule de la vitrine). Pas de dégradé violet.

### Typographie

- **Display** : Cabinet Grotesk 800 (lettrage d'enseigne, gras, serré) ; 500 pour les sous-titres.
  `--t-mega` jusqu'à 11rem, interlignage 0.88, approche -0.035em.
- **Texte et UI** : Switzer 400/500/600, 16–18 px, interlignage 1.5 ; méta en 13 px, chiffres tabulaires.

### Grille et rythme

12 colonnes desktop (gouttière fluide), 4 colonnes téléphone. Trois lignes d'accroche : col 1, col 5, col 9.
Rythmes : héros plein écran (sticky), chapitres pinnés (100svh chacun), section offre aérée (28u), finale plein écran.

### Forme et mouvement

- Un seul rayon : `999px` pour les pastilles (comme le point et les épingles), `0` partout ailleurs.
- Eases du moteur (expo.out / expo.inOut / power3.out). Le verbe « s'allumer » : opacité 0 → 1 → 0.35 → 1
  en 0,28 s, puis lueur qui s'installe (0,8 s). Les rideaux montent en `expo.inOut` 0,9 s.
- Survols : bouton principal = la lumière de la vitrine monte du bas (fill en clip-path depuis le bas, `light`) ;
  liens de navigation = filet néon qui se dessine (accent) ; liens utilitaires = couleur.
- Repos : la scène respire (grésillement aléatoire d'une enseigne, pulsation du point, légère dérive de caméra
  avec le pointeur ; sur téléphone, la vitesse de défilement).

### Composition (une famille par section)

```
HERO (scene + statement, sticky 180svh)      CHAPITRES (sticky narrative ×5)        OFFRE (data / facts)
┌──────────────────────────────┐             ┌──────────────────────────────┐       ┌──────────────────────────────┐
│Scalify            Fondateurs │             │                    [3D rue]  │       │ 15        −30 %     02.11    │
│                              │             │  02 / 05                     │       │ places    sur       lundi    │
│  [rue 3D éteinte, point bleu]│             │  Vos avis                    │       │           l'annuel           │
│                              │             │  texte 2 lignes              │       │  ligne de compte à rebours   │
│ Allumez votre commerce       │             └──────────────────────────────┘       └──────────────────────────────┘
│ sur la carte.        [CTA]   │             NUIT (statement + dialogue)            FINALE (footer as finale)
│ lundi 2 novembre             │             « 03:12 » géant, échange en texte      enseigne SCALIFY + CTA + liens
└──────────────────────────────┘
```

### Test de banalité

- Un générique aurait fait « héros centré sur un blob + trois cartes de fonctionnalités ». Remplacé par : la rue 3D,
  les services racontés comme des commerces qui s'allument un par un, aucune carte.
- Un générique aurait mis une capture de téléphone factice pour l'IA. Remplacé par : un échange en vraie typographie
  daté 03:12, dans la scène de nuit.
- Un générique aurait un loader « Loading… ». Remplacé par : le logo qui se dessine, le point bleu qui tombe dans la rue.
