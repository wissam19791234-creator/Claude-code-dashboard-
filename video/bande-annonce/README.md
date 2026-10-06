# Scalify — bande-annonce cinéma (36,8 s, 1080×1920, 30 i/s)

Fichier final : `scalify-bande-annonce.mp4` (H.264 niveau 4.1, AAC stéréo 48 kHz, -14 LUFS).

## Déroulé
| Temps | Voix (fr-FR-HenriNeural, -6 %, grave) | Image |
|---|---|---|
| 0–1,5 s | — | « SCALIFY PRÉSENTE », bandes noires qui s'ouvrent |
| 1,5–7,6 s | « Chaque matin, ils lèvent le rideau. Chaque soir, ils le baissent. Épuisés. » | boulanger à l'aube, caissière de nuit (étalonnage froid) |
| 8,1–13,5 s | « Les avis sans réponse. Les posts oubliés. Les clients qui partent ailleurs. » | 3 plans désaturés + textes d'interface, tic-tac qui accélère |
| 13,6–13,9 s | silence | noir |
| 13,9 s | BRAAM | « ET SI… » |
| 15,3–17,1 s | « Et si quelqu'un s'occupait de tout ? » | rayons de lumière, poussière |
| 17,5–24,6 s | « Votre site. Votre fiche Google. Vos avis. Vos réseaux. Une IA, jour et nuit. » | montage rythmé, un mot géant par plan (étalonnage chaud) |
| 25,1–28,1 s | « Bientôt, votre commerce ne dormira plus jamais. » | pizzeria éclairée la nuit, flare anamorphique |
| 28,6 s | « Scalify. » | pièce 3D au logo, rayons, « SCALIFY » |
| 30,7–33,8 s | « Lancement imminent. Quinze places fondateurs. » | « J-?? » 3D en machine à sous qui se bloque sur « ?? » |
| 34,4 s | « Abonnez-vous. » | « PROCHAINEMENT » + bouton |

« J-?? » est volontaire : la vidéo reste valable quel que soit le jour de publication.
« Scalify » est écrit « Scalifaï » dans le texte de la voix pour la prononciation.

## Régénérer
`npm i three@0.170.0 playwright` · `python3 tts_lines.py` · `python3 timeline.py` · `python3 sound.py` ·
`node render.js frames 30` (ou `SHARD=k/3` en parallèle) · `bash encode.sh`

Photos : Pexels (licence libre), voir `ph/`.
