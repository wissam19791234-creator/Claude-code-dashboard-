# SCALIFY — trailer de lancement (40 s, 16:9 + 9:16)

Chaos de données → impulsion → logo → dashboard vivant (caméra 3D, profondeur de champ) → copilote IA
→ voix off « Vos données vous parlent déjà. Il est temps de les écouter. » → révélation → LANCEMENT DANS 26 JOURS.

Tout est rendu image par image (HTML/CSS/canvas, `seek(t)` déterministe) ; son 100 % synthétisé, voix edge-tts.
Les chiffres du dashboard sont marqués « Données de démonstration ».

    npm i playwright                                   # ou PW=<chemin de playwright>
    for k in 0 1 2 3; do SHARD=$k/4 node render.js frames & done; wait            # 16:9
    for k in 0 1 2 3; do VERT=1 SHARD=$k/4 node render.js framesv & done; wait    # 9:16
    python3 tts.py && python3 sound.py && bash encode.sh

Aperçu en direct : servir le dossier et ouvrir index.html (ajouter `?v` pour la version verticale).
Changer le compte à rebours : « 26 » dans index.html (#num, #fin .b).
