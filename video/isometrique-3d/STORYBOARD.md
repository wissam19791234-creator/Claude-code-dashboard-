---
workflow: general-video
mode: autonomous
message: "Scalify relie vos clients à votre commerce : site, fiche Google, avis, posts et IA 24/7, dès 49 €/mois."
audience: "Commerçants et indépendants locaux"
duration: 32.6
aspect: 1080x1920 (+ déclinaison 1920x1080)
concept: "Un petit monde isométrique en ligne claire où Scalify rend possible le chemin impossible entre vos clients et votre commerce."
fonts: "Anton (titres) + JetBrains Mono (interfaces, étiquettes)"
palette: "papier #f3eadb, encre #161311, mint #55db9c, ember #fb4903, sun #f6b431, violet #5c4ade, blue #4da2ff, lavender #e9ccff"
---

Cette vidéo dit aux commerçants locaux que Scalify relie leurs clients à leur commerce, dès 49 €/mois.

Rendu : une seule scène Three.js (caméra orthographique isométrique, cel-shading, contours encre en post-process,
papier pointillé multi-échelle) pilotée par `hf-seek`, plus deux sous-compositions DOM (`titres`, `fin`) et une piste audio.

## Frame 1
status: built
src: index.html (scène 3D) + compositions/titres.html
beat: 0.0–4.4 s · accroche
shape: rules `multi-phase-camera` (lente poussée) + `spring-pop-entrance`
on_screen: « Vos clients vous cherchent en ligne… / …mais le chemin est coupé. » ; le client tape « boulangerie près de moi », « Aucun résultat », le chemin s'arrête au bord du vide.
why: pose la douleur en langage client dès la 1re seconde.

## Frame 2
status: built
src: index.html + compositions/titres.html
beat: 4.4–9.6 s · l'illusion
shape: blueprint `camera-journey` (orbite → alignement → poussée → plongée)
on_screen: la pièce Scalify tombe, la caméra pivote et le chemin impossible (deux îles à des profondeurs différentes, alignées sur l'axe de vue) se raccorde ; le client traverse, la boutique s'allume, « Nouveau client ! » ; zoom à travers la vitrine.
why: la promesse (« Scalify relie… ») devient littéralement visible.

## Frame 3
status: built
src: index.html + compositions/titres.html
beat: 9.6–20.9 s · les cinq services
shape: blueprint `spatial-pan-stations` (verticales) + rules `spring-pop-entrance`, `particle-burst`
on_screen: raccord couleur vitrine → plaque ; cinq plaques tombent une par une (site, fiche Google, avis, posts, IA 24/7) avec leur micro-scène ; vue éclatée « Tout en un » puis effondrement en bloc.
why: preuve concrète de ce qui est géré, une phrase par plaque.

## Frame 4
status: built
src: index.html + compositions/titres.html
beat: 20.9–23.6 s · le prix
shape: rule `kinetic-beat-slam` (titre) + chute 3D
on_screen: « 49€ » en 3D tombe sur le bloc ; « Le tout, dès 49 €/mois ».

## Frame 5
status: built
src: index.html + compositions/titres.html
beat: 23.6–28.4 s · offre fondateurs
shape: blueprint `zoom-out-workspace-reveal`
on_screen: recul : le bloc devient un monument sur l'île des fondateurs ; calendrier « lundi 2 novembre », « J-23 », « -30 % », 15 places numérotées qui surgissent en vague.

## Frame 6
status: built
src: index.html + compositions/fin.html
beat: 28.4–32.6 s · appel à l'action
shape: blueprint `logo-assemble-lockup`
on_screen: la pièce Scalify tombe sur la place n°1, une mini-boulangerie s'y pose (« Votre place ») ; « Réservez votre place. », « Lien en bio → », « J-23 · lundi 2 novembre », logo Scalify.
