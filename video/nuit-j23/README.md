# « Cette nuit, dans votre commerce… » — 16 s, J-23 (9:16 + 16:9)

Nuit bleutée → aube cuivrée. Quatre cartes en verre s'empilent : 3 avis répondus (23:47), 2 réservations (00:32),
1 post publié (06:00), fiche Google à jour (06:30). « Vous, vous avez dormi. / Scalify, non. » → « 23 » chromé → fin.

Changer le compte à rebours : constante `JOURS` en haut de nuit.js (lancement le 2 novembre).

    for k in 0 1 2 3; do VERT=1 SHARD=$k/4 node render_nuit.js nfv & done; wait
    for k in 0 1 2 3; do SHARD=$k/4 node render_nuit.js nf & done; wait
    python3 sound_nuit.py   # puis ffmpeg images + son
