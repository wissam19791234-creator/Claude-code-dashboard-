# Scalify : promo « landing page premium » (TikTok / Reels, 1080×1920, 37 s)

La vidéo présente Scalify comme agence web. Au milieu, le site 3D de démonstration **Maison Tison**
(restaurant imaginaire) défile dans un téléphone, comme une vraie démo.

- Site de démonstration : https://claude.ai/artifact/7EnQoDXckSgERxNEC3pwhp (source : `site/maison-tison/`)
- Offre montrée : landing page premium 200 €, livrée en 5 jours, maquette offerte, sans engagement.
- Appel à l'action : « Écris SITE en message privé ».

## Légende TikTok

Ton commerce mérite un site qui donne envie de réserver. Landing page premium à 200 €, livrée en 5 jours, maquette offerte. Écris SITE en message privé.

#siteinternet #commercelocal #webdesign #restaurateur #entrepreneur

## Fabrication (tout est gratuit, rien n'est sous licence payante)

1. **Capture du site** : `site/maison-tison/capture.cjs` (Playwright, 390×844 à ×2,5, 30 i/s, temps piloté par `gsap.updateRoot`) → `assets/video/site.mp4`
   (`ffmpeg -framerate 30 -i cap/f%04d.jpg -vf "pad=976:2110,tpad=stop_mode=clone:stop_duration=6" -crf 15 …`).
2. **Voix** : edge-tts Rémy, phrase par phrase posée à l'heure prévue (`script.txt` « heure|texte ») :
   `python3 voix/build_vo.py fr-FR-RemyMultilingualNeural +8% assets/audio/vo.wav work/vo.json 37.0`, puis `python3 align.py` (faster-whisper, heure des mots).
3. **Données de montage** : `python3 build.py` → `src/data.js` (pages de sous-titres, heure du « 200 », du clic).
4. **Son** : `python3 audio/sound.py assets/audio/vo.wav assets/audio/mix_raw.wav` puis `loudnorm=I=-14:TP=-1.5`.
5. **Image** : HyperFrames 0.8.169 (`index.html` + `src/world.js` three.js : étincelle, rue de commerces, téléphone qui se brise, braises).
   `npx hyperframes@0.8.169 render --quality delivery --workers 3 --output renders/raw.mp4`, puis `bash ../hf/encode.sh`.

Aucune vraie marque à l'écran : commerces génériques, moteur de recherche générique, téléphone sans logo, restaurant fictif.
Photos du site : Unsplash (licence Unsplash). Polices : Cabinet Grotesk (Fontshare), Bodoni Moda et Martian Mono (Google Fonts, OFL).
