# Scalify — tendance « Message from A » (HyperFrames)

Pub TikTok de 30 s (1080×1920) sur le format tendance d'octobre 2026 « Message from A » : des messages anonymes
signés « –A », façon Pretty Little Liars, arrivent sur l'écran verrouillé d'un commerçant à 23:47.

1. **A se moque** de ses mauvaises habitudes : avis de Martine sans réponse, fiche Google « fermé » le samedi,
   dernier post il y a 8 mois, client parti chez le concurrent.
2. **Psychologie inverse** : « Alors surtout… ne prenez pas Scalify. Je n'aurais plus rien à vous reprocher. –A »
3. **Les notifications Scalify corrigent tout**, une par une (avis répondu, fiche à jour, post publié, IA qui a
   répondu à 22 h 04, site à jour). A craque : « …arrêtez. –A »
4. « Lancement dans 15 jours. Dès 49 €/mois · −30 % sur l'annuel pour les 15 premiers. » puis
   « Ne vous abonnez surtout pas. –A »
5. Déverrouillage → carte finale : Scalify, lancement dans 15 jours (lundi 2 novembre · J-15),
   « Abonnez-vous pour ne rien rater », « (désolé, A.) ».

Pas de voix off (aucun souci de prononciation) et pas de « lien en bio » : le site n'est pas encore lancé.

- `scalify-message-a-9x16.mp4` : avec musique (boîte à musique inquiétante puis groove au retournement)
- `scalify-message-a-9x16-sans-musique.mp4` : bruitages seuls, pour ajouter un son tendance dans TikTok
- `planche-9x16.jpg` : planche contact

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `src/script.js` | le script : chaque notification, son instant et ses lignes ; `UNLOCK`, `JOURS` |
| `compositions/ecran.html` | l'écran verrouillé (fond d'automne qui s'assombrit avec A puis se réchauffe avec Scalify) |
| `compositions/notifs.html` | la pile de notifications (arrivée, empilement, vibration des messages de A) |
| `compositions/fin.html` | la carte finale « Lancement dans 15 jours » |
| `audio/instr.py`, `audio/sound.py` | instruments et bande-son synthétisés (aucune piste sous licence) |

## Refaire

```bash
cd audio && python3 sound.py mix_raw.wav && ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 ../assets/audio/mix.wav
python3 sound.py sfx_raw.wav --sans-musique   # version sans musique
cd .. && npx hyperframes check && npx hyperframes render --quality delivery --workers 3 --output renders/scalify-message-a-9x16.mp4
```

Le compte à rebours est écrit en dur (« 15 jours », « J-15 ») dans `src/script.js` et `compositions/fin.html` :
il est juste pour une publication le dimanche 18 octobre 2026. À changer si la vidéo sort un autre jour.
