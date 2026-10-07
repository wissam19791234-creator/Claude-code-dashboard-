# SCALIFY — film de lancement, direction « Matière & lumière » (33 s, 16:9 + 9:16)

Chaos de notifications en verre → aspiration → logo chromé → 4 panneaux en verre (avis, messages de nuit,
site + fiche Google, croissance en barres chromées) → voix off → « 26 » chromé en 3D → carton final.

Three.js (rendu WebGL image par image, `seek(t)` déterministe), bloom, grain ; son 100 % synthétisé.

    npm i three@0.170 playwright
    for k in 0 1 2 3; do SHARD=$k/4 node render.js frames & done; wait            # 16:9
    for k in 0 1 2 3; do VERT=1 SHARD=$k/4 node render.js framesv & done; wait    # 9:16
    python3 sound.py   # puis ffmpeg (voir l'encodage dans l'historique du dépôt)

Aperçu : servir le dossier, ouvrir film.html (ajouter `?v` pour la version verticale).
