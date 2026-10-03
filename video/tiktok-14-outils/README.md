# Pub TikTok Scalify — « 14 outils » (27,6 s, 1080×1920, 30 i/s)

Fichier final : `scalify-tiktok-14-outils.mp4` · sans voix (pour un son tendance) : `scalify-tiktok-14-outils-sans-voix.mp4`.

## Structure
| Temps | Voix | Image |
|---|---|---|
| 0–3,9 s | « 3 heures du matin. Vous dormez, et votre commerce, lui, bosse. » | écran verrouillé 03:12 qui se remplit de notifications (réservation, avis, IA, commande, appel), vibrations, compteur « +N pendant la nuit » ; drop musical sur « bosse » |
| 3,9–5,5 s | « Voici tout ce que Scalify fait pour vous » | pièce 3D au logo + « 14 outils pour votre commerce » |
| 5,5–17,9 s | les 14 outils | compteur 01/14 → 14/14, barre de progression, carte 3D par outil avec badge Inclus / Dès Pro / Dès Premium / Option, photo de commerce différente à chaque outil |
| 17,9–20,8 s | « Vous ? Deux minutes par semaine, sur WhatsApp. » | mur des 14 icônes en 3D, « 2 MIN » en relief |
| 20,8–22,4 s | « Dès 49 € par mois. » | « 49€ » en 3D + « selon l’offre · options à la carte » |
| 22,4–25,4 s | « Lancement dans 30 jours : les 15 premiers ont -30 %. » | « J-30 » en 3D, 15 places, bandeau offre |
| 25,4–27,6 s | « Abonnez-vous ! » | logo + J-30 + bouton |

Les 14 outils et leurs badges reprennent le site : inclus partout (site, fiche Google, avis, réseaux), dès Pro (assistant IA, relances),
dès Premium (pub Google & Instagram), options à la carte (standard IA, devis, commande en ligne, réservation avec acompte, fidélité, vidéos, e-commerce).

## Photos
Pexels (licence Pexels, usage commercial libre) : voir `ph/`, nom de fichier = identifiant (`https://www.pexels.com/photo/<id>/`).

## Régénérer
`npm i` · `python3 tts.py fr-FR-RemyMultilingualNeural +24%` · `python3 sound.py` · `node render.js frames 30` (ou `SHARD=k/3`) · `bash encode.sh`
