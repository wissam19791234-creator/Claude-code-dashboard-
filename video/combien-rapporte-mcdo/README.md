# « Combien rapporte un McDo ? » — chaîne « Combien rapporte… » (Hamsterdam)

Vidéo TikTok 9:16 (1080×1920), 1 min 58, présentée par Hamsterdam, le hamster en costard.
Tout est fabriqué sans crédits : personnages et décors dessinés en code (SVG animé), voix française gratuite, musique et bruitages synthétisés.

- `combien-rapporte-mcdo-9x16.mp4` : la vidéo finale
- `planche-9x16.jpg` : planche contact
- `voix-remy.mp3` / `voix-henri.mp3` : les deux voix françaises gratuites comparées sur l'accroche (Rémy est utilisée)

## Chaîne de fabrication

| Étape | Fichier | Rôle |
| --- | --- | --- |
| 1 | `voix/build_vo.py` | voix off edge-tts phrase par phrase (« McDo » écrit « Macdo » pour qu'il ne soit pas épelé), silences courts, pause avant chaque chute |
| 2 | `captions.txt` | le script mot pour mot, annoté : `{y:…}` chiffre (jaune), `{r:…}` dépense (rouge) |
| 3 | `align.py` | Whisper (local) donne l'heure de chaque mot entendu ; comparaison « à l'oral » (45 000 = quarante cinq mille) puis recopie sur les mots exacts du script |
| 4 | `rythme.py` | ajoute une petite pause avant chaque chiffre si la voix enchaîne trop vite |
| 5 | `src/art/kit.js` | Hamsterdam (12 expressions, bras articulés, bouche qui parle, clignements) et accessoires |
| 6 | `src/art/scenes1.js`, `scenes2.js` | les 19 plans dessinés et leurs animations calées sur les mots de la voix |
| 7 | `build.py` | composition HyperFrames : plans, caméra qui recadre toutes les 3-5 s, sous-titres mot par mot, compteur d'argent, bouche synchronisée |
| 8 | `audio/sound.py` | musique synthétisée ≈ 15-20 % sous la voix (baissée pendant qu'elle parle), « ding » de caisse sur chaque chiffre |

## Commandes

```bash
python3 voix/build_vo.py fr-FR-RemyMultilingualNeural +10% assets/audio/vo.wav work/phrases.json
python3 align.py assets/audio/vo.wav work/words_raw.json
python3 rythme.py assets/audio/vo.wav work/words_raw.json work/vo_r.wav work/words.json
python3 build.py
python3 audio/sound.py work/vo_r.wav assets/audio/mix_raw.wav
ffmpeg -i assets/audio/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 assets/audio/mix.wav
npx hyperframes check && npx hyperframes render --quality delivery --workers 3 --output renders/combien-rapporte-mcdo.mp4
```

Pour changer de voix (ElevenLabs, votre propre voix…) : remplacer `assets/audio/vo.wav`, puis relancer à partir de `align.py` ; les dessins, la bouche, les sous-titres et le compteur se recalent tout seuls.

Règle de marque : aucun logo ni couleur officielle McDonald's à l'image (fast-food générique orange et blanc).
