# « Vous fermez à 19 h ? » — TikTok 16 s avec voix off et sous-titres mot à mot

Message compris en 3 s : voix off + gros sous-titres (mot prononcé en jaune), plans de ~2 s,
pancarte CLOSE → OPEN sur « Avec Scalify », carton final Site / Google / Avis / Réservations, J-26.

    bash clips.sh && python3 tts.py && python3 build.py             # voix → timeline → base.mp4
    for k in 0 1 2; do SHARD=$k/3 node render.js ov 24 & done; wait # sous-titres + carton (alpha)
    python3 sound.py && bash encode.sh                              # → scalify-19h.mp4
