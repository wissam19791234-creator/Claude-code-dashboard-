# « Marc, le boulanger débordé » — cartoon raconté 28 s, J-23 (9:16 + 16:9)

Voix off + sous-titres TikTok. Marc jongle avec son site, Google, ses avis, Insta et ses messages → tout tombe →
la mascotte Scalify rattrape tout (✓ sur chaque objet) → Marc sert enfin ses clients → « J-23 », « -30 % les 15 premiers ».

    python3 tts.py && python3 build.py            # voix + timeline.json
    for k in 0 1 2 3; do VERT=1 SHARD=$k/4 node render_marc.js mv & done; wait
    for k in 0 1 2 3; do SHARD=$k/4 node render_marc.js mh & done; wait
    python3 sound_marc.py                          # puis ffmpeg images + son

Compte à rebours : `JOURS` dans marc.js et la phrase l7 dans tts.py.
