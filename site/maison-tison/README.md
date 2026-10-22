# Maison Tison : site 3D de démonstration (Scalify)

Restaurant **imaginaire** au feu de bois, créé pour montrer le savoir-faire de Scalify.
Le site est un seul fichier HTML autonome : `maison-tison.html` (photos intégrées en base64).

- En ligne : https://claude.ai/artifact/7EnQoDXckSgERxNEC3pwhp
- Source lisible : `src.html` ; photos dans `img/` ; `python3 build.py` produit `dist/maison-tison.html` (photos intégrées).
- 3D : Three.js 0.170 (foyer, bûches, flammes, braises, photos qui « sortent du feu »), GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (bureau seulement).
- Concept : le défilement suit une soirée au restaurant (19:00 allumage → 23:40 cendres chaudes), la caméra tourne autour d'un seul foyer.
- `capture.cjs` : capture image par image du site au format téléphone (pour la vidéo promo), temps piloté par `gsap.updateRoot`.

Photos : Unsplash (licence Unsplash, usage commercial autorisé), à remplacer par les vraies photos d'un client.
Adresse, numéro (plage réservée à la fiction), avis et prix sont fictifs.
