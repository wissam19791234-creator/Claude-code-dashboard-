# Pub TikTok Scalify — 20 s (1080×1920, 30 i/s)

Fichier final : `scalify-tiktok-20s.mp4` (H.264 + AAC, -14 LUFS).

## Script (voix off FR, `fr-FR-RemyMultilingualNeural`)
Commerçant ? Pas le temps pour Internet ? Scalify s'occupe de tout. Votre site, votre fiche Google,
vos avis, vos posts. Et une IA qui répond à vos clients, 24 heures sur 24. Dès 49 euros par mois,
sans rendez-vous. Les 15 premiers : moins 30 % sur l'annuel. Scalify. Lien en bio !

## Régénérer
1. `python3 tts.py fr-FR-RemyMultilingualNeural +12%` → `vo.mp3` + `words.json` (horodatage mot à mot)
2. Recoller `words.json` dans `index.html` (`const words = …`)
3. `python3 beat.py` → `beat.wav`
4. `node render.js frames 30` → 600 PNG
5. `ffmpeg -framerate 30 -i frames/f%04d.png -i vo.mp3 -i beat.wav -filter_complex "[1:a]adelay=150|150,volume=1.6,apad[v];[2:a]volume=0.22[b];[v][b]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:20[a]" -map 0:v -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t 20 scalify-tiktok-20s.mp4`

Ouvrir `index.html` dans un navigateur pour l'aperçu en boucle.
