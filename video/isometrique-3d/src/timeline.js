// Source unique de vérité pour le minutage (secondes). La voix off cale tout.
export const DUR = 32.6;

export const VO = {
  v1: 0.30,   // « Vos clients vous cherchent en ligne… mais le chemin jusqu'à vous est coupé. »
  v2: 4.45,   // « Scalifaï relie vos clients à votre commerce. »
  v3a: 9.85,  // « On gère votre site. »
  v3b: 11.75, // « Votre fiche Google. »
  v3c: 13.6,  // « Vos avis. »
  v3d: 15.4,  // « Vos posts. »
  v4: 17.25,  // « Et une IA répond à vos clients, jour et nuit. »
  v5: 20.95,  // « Le tout, dès 49 euros par mois. »
  v6: 23.85,  // « Lancement le 2 novembre : moins 30 % sur l'annuel pour les 15 premiers. »
  v7: 28.45,  // « Scalifaï. Réservez votre place. »
};

export const T = {
  // A — accroche : la recherche ne mène nulle part
  type: [0.2, 1.25], noResult: 1.5, walk1: [0.95, 2.35], ask: 2.45,
  // B — l'illusion : la caméra tourne, le chemin impossible se connecte
  coin: 3.85, pulse: 4.3, orbit: [4.4, 6.35], align: 6.35, wave: [6.35, 7.05], found: 6.5,
  walk2: [6.7, 8.3], lights: 8.3, notif: 8.35, zoom: [8.55, 9.6], CUT: 9.6,
  // C — la pile de services (une plaque par phrase)
  P: [9.6, 11.6, 13.45, 15.25, 17.1], overview: [19.5, 20.25], pack: [20.15, 20.45], collapse: [20.45, 20.95],
  // D — le prix
  price: 21.2,
  // E — l'offre fondateurs
  pull: [23.55, 25.0], calendar: 23.95, off30: 25.5, plots: [26.7, 27.6],
  // F — appel à l'action
  ctaCoin: 28.55, miniShop: 29.35, end: 32.6,
};
