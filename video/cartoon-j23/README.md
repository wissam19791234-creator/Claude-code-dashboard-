# « Le commerçant jongleur » — cartoon 16 s, J-23 (9:16 + 16:9)

Un commerçant jongle avec tout (téléphone, site, Google, Insta, messages) → tout tombe → BOING : la mascotte Scalify
rattrape tout et jongle à sa place → boutique pleine de clients → « J-23 ». SVG animé image par image, son synthétisé.

Changer le compte à rebours : constante `JOURS` en haut de cartoon.js.

    for k in 0 1 2 3; do VERT=1 SHARD=$k/4 node render.js fv & done; wait   # 9:16
    for k in 0 1 2 3; do SHARD=$k/4 node render.js fh & done; wait          # 16:9
    python3 sound.py   # puis ffmpeg images + son
