# « Combien ça rapporte d'être propriétaire d'un McDo ? » — version courte (1 min 17)

Même format que les vidéos de référence (« … d'une station-essence ? », « … d'un Tasty Crousty ? ») :
question d'accroche en gros titre, dépenses avant d'ouvrir qui s'additionnent dans un cadre, crédit, charges par mois,
ouverture et « on est riche… attends », TVA, ce qui reste, puis l'« astuce de pro » (le soda) et le net par mois.
Hamsterdam en mascotte, fond clair avec ligne de sol, gros chiffres (rouge = dépense, vert = gain), étiquettes manuscrites,
plans « réaction » sur fond rayonnant, sous-titres karaoké en bas (le mot dit passe en rose).

- `combien-ca-rapporte-mcdo-court-9x16.mp4` : la vidéo (1080×1920, 1 min 17)
- `planche-9x16.jpg` : planche contact
- `script.txt` : le texte lu ; `captions.txt` : le même, chiffres annotés (`{r:…}` dépense, `{y:…}` gain)

Chiffres : ordres de grandeur pour un restaurant à ~2,5 M€ de chiffre d'affaires annuel (≈ 210 000 €/mois TTC),
redevance 5 %, pub 5 %, loyer 10 %, personnel ≈ 28 %, matières et emballages ≈ 31 % du CA HT ; soda ≈ 0,25 € de coût pour 2,50 €.

## Fabrication (sans crédits)

```bash
GAP_LINE=0.24 GAP_SENT=0.09 GAP_CHUTE=0.34 python3 voix/build_vo.py fr-FR-RemyMultilingualNeural +30% assets/audio/vo.wav work/phrases.json
python3 align.py assets/audio/vo.wav work/words_raw.json
python3 rythme.py assets/audio/vo.wav work/words_raw.json work/vo_r.wav work/words.json
python3 build.py
python3 audio/sound.py work/vo_r.wav assets/audio/mix_raw.wav
ffmpeg -i assets/audio/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 assets/audio/mix.wav
npx hyperframes check && npx hyperframes render --quality delivery --workers 3 --output renders/combien-ca-rapporte-mcdo-court.mp4
```

Pour un autre business : réécrire `captions.txt` et les ancres de `scenes.json`, puis adapter les plans dans `src/art/court.js`.
