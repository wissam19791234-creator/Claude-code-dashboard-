// Contenu du site Scalify. Faits réels : lancement le lundi 2 novembre 2026, −30 % sur l'abonnement annuel pour les
// 15 premiers, aucun prix mensuel annoncé avant le lancement.
// Hypothèses (placeholder: true), à remplacer par le propriétaire :
//   - l'adresse e-mail de contact et l'URL de production,
//   - les noms des six commerces de la rue (fictifs, illustratifs),
//   - les étapes « comment ça marche » et les réponses de la FAQ marquées placeholder,
//   - l'échange de 03:12 (exemple d'échange, affiché comme tel).

export const site = {
  name: 'Scalify',
  role: 'Votre commerce, visible sur la carte',
  url: 'https://scalify.fr', // placeholder: URL de production à confirmer
  email: 'contact@scalify.fr', // placeholder: adresse à confirmer
  description:
    "Scalify gère le site, la fiche Google, les avis et les posts des commerces de proximité, avec une IA qui répond aux clients jour et nuit.",
  launch: { iso: '2026-11-02T09:00:00+01:00', label: 'lundi 2 novembre' },
  offer: { seats: 15, discount: 30 },
  socials: [] as { label: string; href: string }[],
};

export type Chapter = { id: string; shop: string; title: string; text: string; tag: string };

// Les cinq services, racontés comme cinq commerces qui s'allument. Les noms des commerces sont fictifs.
export const chapters: Chapter[] = [
  { id: 'site', shop: 'Le Fournil', tag: 'Boulangerie', title: 'Votre site', text: "Un site rapide, à votre image, qui donne envie de pousser la porte. On le crée, on le tient à jour." },
  { id: 'fiche', shop: 'Pétales', tag: 'Fleuriste', title: 'Votre fiche Google', text: 'Horaires justes, photos récentes, le bon numéro. Quand on vous cherche, on vous trouve.' },
  { id: 'avis', shop: 'Le Barbier', tag: 'Barbier', title: 'Vos avis', text: 'Chaque avis reçoit une réponse, les bons comme les moins bons. Vos clients voient que quelqu’un est là.' },
  { id: 'posts', shop: 'Café Lumen', tag: 'Café', title: 'Vos posts', text: 'Des publications régulières sur Google et les réseaux, sans y passer vos soirées.' },
  { id: 'nuit', shop: 'La Page', tag: 'Librairie', title: 'Vos messages, même la nuit', text: 'Une IA répond à vos clients 24 h/24 : horaires, réservations, questions. Vous dormez, la boutique répond.' },
];

export const night = {
  time: '03:12',
  label: "Exemple d'échange",
  lines: [
    { who: 'Client', text: 'Bonsoir, vous ouvrez à quelle heure dimanche ?' },
    { who: 'Scalify, pour La Page', text: 'Bonsoir ! Dimanche, la librairie ouvre de 10 h à 13 h. Je vous mets de côté le livre dont vous parliez ?' },
  ],
};

export const faq = [
  { q: 'Combien coûte Scalify ?', a: 'Les tarifs seront annoncés au lancement, le lundi 2 novembre. Les 15 premiers inscrits auront 30 % de réduction sur l’abonnement annuel.' },
  { q: 'Je n’y connais rien en informatique.', a: 'Vous n’avez rien à installer ni à apprendre : Scalify s’occupe du site, de la fiche Google, des avis, des posts et des messages.', placeholder: true },
  { q: 'Est-ce que je garde la main ?', a: 'Oui. Vous voyez tout ce qui est publié en votre nom, et vous pouvez le modifier quand vous voulez.', placeholder: true },
  { q: 'Comment réserver une des 15 places ?', a: 'Écrivez-nous en indiquant le nom de votre commerce. Les places sont attribuées dans l’ordre d’arrivée.', placeholder: true },
];

export const steps = [
  { title: 'Vous réservez', text: 'Un e-mail avec le nom de votre commerce suffit.' },
  { title: 'On prépare', text: 'Site, fiche Google, avis, posts : on met tout en place avec vous avant le lancement.' },
  { title: 'Ça s’allume', text: 'Lundi 2 novembre, votre commerce apparaît, et il reste allumé.' },
]; // placeholder: déroulé à confirmer
