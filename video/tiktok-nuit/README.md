# « 23 h 47 » — teaser cinéma 10 s (TikTok 9:16, 24 i/s)

Quatre plans réels 4K (pluie, ville dans le brouillard, visage éclairé par un écran, enseigne OPEN), étalonnage commun,
titres serif en mise au point, son 100 % synthétisé, fin sur SCALIFY · J-27.

    bash clips.sh && bash edit.sh                                   # rushes → base.mp4
    for k in 0 1 2; do SHARD=$k/3 node render.js ov 24 & done; wait # titres (calque alpha)
    python3 sound.py && bash encode.sh                              # → scalify-nuit.mp4

Changer le compte à rebours : modifier « J-27 » dans index.html puis relancer le rendu des titres et encode.sh.
