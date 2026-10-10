# Scalify — pub isométrique 3D (HyperFrames)

Pub motion design de 32,6 s : un petit monde isométrique en « ligne claire » où Scalify rend possible
le chemin impossible entre vos clients et votre commerce (illusion à la Monument Valley / Escher).

- `scalify-isometrique-9x16.mp4` : TikTok / Reels / Shorts (1080×1920)
- `scalify-isometrique-16x9.mp4` : portfolio, YouTube, site (1920×1080)

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | composition racine : canevas 3D, sous-compositions, piste audio |
| `compositions/titres.html` | titres cinétiques (Anton) et leur timeline GSAP |
| `compositions/fin.html` | carton final (lien en bio, J-23, logo) |
| `src/engine.js` | rendu cel-shading + contours encre + papier pointillé multi-échelle |
| `src/world.js` | tout le monde 3D, la caméra (cadrage calculé) et l'animation, fonction pure du temps |
| `src/kit.js` | primitives (îles, personnage, croissant, pièce Scalify, cartes, texte 3D) |
| `src/timeline.js` | minutage unique, calé sur la voix off |
| `audio/` | `tts.py` (voix edge-tts), `sound.py` (musique + bruitages + mixage), puis `ffmpeg -af loudnorm=I=-14:TP=-1.5` → `assets/audio/mix.wav` |
| `build_html.py` | génère `index.html` et les sous-compositions en 9:16 ou 16:9 |

## L'illusion

L'île « en ligne » du client est décalée de `KD·(1,1,1)` (KD = -5) : exactement le long de l'axe de vue
isométrique. Vue en biais, le chemin est coupé ; en vue isométrique exacte (caméra orthographique), les deux
morceaux se superposent parfaitement et le personnage passe d'une île à l'autre sans que l'œil le voie.

## Refaire le rendu

```bash
npx hyperframes check
npx hyperframes render --quality delivery --output renders/scalify-isometrique-9x16.mp4
# version 16:9 : copier le dossier, puis
python3 build_html.py landscape . && npx hyperframes render --quality delivery --output renders/scalify-isometrique-16x9.mp4
```

Changer le compte à rebours : `J-23` apparaît dans `src/world.js` (étiquette du calendrier) et dans
`build_html.py` (carton final).
