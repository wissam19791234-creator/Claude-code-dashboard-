// Le script de la vidéo : chaque notification, son instant d'arrivée (s) et ses lignes (coupures fixes).
// « A » se moque des mauvaises habitudes du commerçant… puis les notifications Scalify corrigent tout, une par une.
window.MSG = [
  { t: 0.35, who: 'A', l: ["Je sais que vous n'avez toujours pas", "répondu à l'avis de Martine. –A"] },
  { t: 2.95, who: 'A', l: ['Votre fiche Google dit « fermé » le', 'samedi. Vous êtes ouverts. –A'] },
  { t: 5.55, who: 'A', l: ['Votre dernier post ? Il y a 8 mois.', 'Vos clients vous croient fermés. –A'] },
  { t: 8.15, who: 'A', l: ['Un client vous a écrit à 22 h. Ce matin,', 'il était chez le concurrent. –A'] },
  { t: 10.75, who: 'A', l: ['Alors surtout… ne prenez pas Scalify.', "Je n'aurais plus rien à vous reprocher. –A"] },
  { t: 13.6, who: 'S', l: ['Nouvel avis 5 étoiles de Martine.', 'Réponse envoyée.'] },
  { t: 14.75, who: 'S', l: ['Fiche Google à jour : ouvert le samedi.'] },
  { t: 15.9, who: 'S', l: ['Votre post de la semaine est publié.'] },
  { t: 17.05, who: 'S', l: ["L'IA a répondu à un client à 22 h 04."] },
  { t: 18.2, who: 'S', l: ['Votre site est à jour.'] },
  { t: 19.65, who: 'A', l: ['…arrêtez. –A'] },
  { t: 21.3, who: 'S', l: ['Lancement dans 15 jours.', "Dès 49 €/mois · −30 % sur l'annuel", 'pour les 15 premiers.'] },
  { t: 23.85, who: 'A', l: ['Ne vous abonnez surtout pas.', 'Je vous surveille. –A'] },
];
window.UNLOCK = 26.3;   // le téléphone se déverrouille sur la carte finale
window.END = 30.0;
window.JOURS = 15;      // lancement le lundi 2 novembre 2026, publication le 18 octobre
