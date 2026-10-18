# « Combien rapporte un McDo ? » — chaîne « Combien rapporte… » (Hamsterdam)

Vidéo TikTok 9:16 (1080×1920), 1 min 50 à 2 min, présentée par Hamsterdam, le hamster en costard.
Le montage est entièrement automatisé ; il ne manque que les médias générés (voix + 19 images, animations en option).

## Chaîne de fabrication

| Étape | Fichier | Rôle |
| --- | --- | --- |
| 1 | `scenes.json` | 19 scènes (ancre dans le script + prompt image), description de Hamsterdam, style, compteur d'argent |
| 2 | `captions.txt` | le script mot pour mot, annoté : `{y:…}` chiffre (jaune), `{r:…}` dépense (rouge) |
| 3 | `align.py` | Whisper (local) donne l'heure de chaque mot entendu, recopiée sur les mots exacts du script |
| 4 | `rythme.py` | ajoute une petite pause avant chaque chiffre si la voix enchaîne trop vite |
| 5 | `build.py` | génère la composition HyperFrames : plans animés (zoom / caméra, recadrage toutes les 3-5 s, ou clip image-vers-vidéo), sous-titres mot par mot, compteur d'argent |
| 6 | `audio/sound.py` | musique synthétisée ≈ 15-20 % sous la voix (baissée pendant qu'elle parle), « ding » de caisse sur chaque chiffre |

## Commandes

```bash
python3 align.py assets/audio/vo.wav work/words_raw.json
python3 rythme.py assets/audio/vo.wav work/words_raw.json work/vo_r.wav work/words.json
python3 build.py
python3 audio/sound.py work/vo_r.wav assets/audio/mix_raw.wav
ffmpeg -i assets/audio/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 assets/audio/mix.wav
npx hyperframes check && npx hyperframes render --quality delivery --workers 3 --output renders/combien-rapporte-mcdo.mp4
```

Images attendues : `assets/images/scene_01.png` … `scene_19.png` ; clips facultatifs : `assets/clips/scene_XX.mp4`.
Règle de marque : aucun logo ni couleur officielle McDonald's à l'image (fast-food générique orange et blanc).
