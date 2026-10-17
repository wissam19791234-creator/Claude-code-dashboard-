// Écran du téléphone (canvas 2D redessiné à chaque image, fonction pure du temps).
import { COL, FONT, rr, E, u, cl } from './kit3d.js';

export const SW = 576, SH = 1248;
const ANIM = (t, t0, d = 0.32) => E.o3(u(t, t0, t0 + d));

function txt(ctx, s, x, y, size, weight, color, align) {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
function stars(ctx, x, y, n, size, on) {
  for (let i = 0; i < n; i++) {
    const cx = x + i * size * 1.15, cy = y; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? size * 0.22 : size * 0.5; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = i < on ? '#f6b512' : '#e2e2e7'; ctx.fill();
  }
}
function check(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.32, y); ctx.lineTo(x - s * 0.08, y + s * 0.24); ctx.lineTo(x + s * 0.34, y - s * 0.24); ctx.stroke();
}
function toast(ctx, t, t0, label) {
  const k = ANIM(t, t0, 0.4); if (k <= 0) return;
  const y = -70 + k * 160, w = 330;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rr(ctx, (SW - w) / 2, y, w, 72, 36); ctx.fillStyle = COL.ink; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc((SW - w) / 2 + 40, y + 36, 19, 0, Math.PI * 2); ctx.fillStyle = COL.mint; ctx.fill();
  check(ctx, (SW - w) / 2 + 40, y + 36, 24, '#ffffff');
  txt(ctx, label, (SW - w) / 2 + 72, y + 46, 27, 700, '#ffffff');
}
// apparition d'un bloc : opacité + glissement
function rise(ctx, t, t0, draw) {
  const k = ANIM(t, t0, 0.36); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 40); draw(); ctx.restore();
}

// ---------------------------------------------------------------- 1. le site se construit
function site(ctx, t) {
  rise(ctx, t, 4.4, () => {
    ctx.beginPath(); ctx.arc(66, 128, 26, 0, Math.PI * 2); ctx.fillStyle = COL.ember; ctx.fill();
    txt(ctx, 'Maison Lucie', 106, 140, 34, 800, COL.ink);
    for (let i = 0; i < 3; i++) { rr(ctx, 488, 112 + i * 13, 44, 6, 3); ctx.fillStyle = COL.ink; ctx.fill(); }
  });
  rise(ctx, t, 4.7, () => {
    const g = ctx.createLinearGradient(0, 180, SW, 560); g.addColorStop(0, '#ffb36b'); g.addColorStop(1, '#fb4903');
    rr(ctx, 30, 180, SW - 60, 380, 34); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(430, 300, 88, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
    txt(ctx, 'Pâtisserie', 64, 410, 50, 800, '#ffffff'); txt(ctx, 'artisanale', 64, 462, 50, 800, '#ffffff');
    rr(ctx, 64, 492, 200, 50, 25); ctx.fillStyle = '#ffffff'; ctx.fill(); txt(ctx, 'Commander', 164, 526, 24, 700, COL.ember, 'center');
  });
  const card = (x, t0, col, name) => rise(ctx, t, t0, () => {
    rr(ctx, x, 590, 248, 270, 28); ctx.fillStyle = '#f5f5f7'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 124, 690, 70, 52, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    txt(ctx, name, x + 24, 810, 28, 700, COL.ink); txt(ctx, 'Voir', x + 24, 842, 22, 600, COL.grey);
  });
  card(30, 5.2, '#ffd731', 'Croissant'); card(298, 5.45, '#e9ccff', 'Tarte');
  rise(ctx, t, 5.7, () => {
    rr(ctx, 30, 890, SW - 60, 150, 28); ctx.fillStyle = '#f5f5f7'; ctx.fill();
    txt(ctx, 'Horaires', 60, 948, 28, 800, COL.ink);
    ctx.beginPath(); ctx.arc(70, 990, 9, 0, Math.PI * 2); ctx.fillStyle = COL.mint; ctx.fill();
    txt(ctx, 'Ouvert · 7 h – 19 h', 90, 999, 26, 600, '#2a9d64');
  });
  toast(ctx, t, 5.85, 'Site mis à jour');
}

// ---------------------------------------------------------------- 2. une réponse à chaque avis
function avis(ctx, t) {
  txt(ctx, 'Avis', 36, 150, 56, 800, COL.ink); txt(ctx, 'Google', 168, 150, 30, 600, COL.grey);
  stars(ctx, 54, 196, 5, 34, 5);
  const P = [['C', 'Camille', COL.violet, 7.6], ['J', 'Julien', COL.blue, 7.9], ['S', 'Sarah', COL.ember, 8.25]];
  P.forEach(([ini, name, col, tr], i) => {
    const y = 250 + i * 320;
    rr(ctx, 30, y, SW - 60, 296, 28); ctx.fillStyle = '#f5f5f7'; ctx.fill();
    ctx.beginPath(); ctx.arc(80, y + 52, 26, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    txt(ctx, ini, 80, y + 62, 28, 800, '#ffffff', 'center'); txt(ctx, name, 120, y + 62, 28, 700, COL.ink);
    stars(ctx, 400, y + 52, 5, 22, 5);
    rr(ctx, 54, y + 100, 420, 14, 7); ctx.fillStyle = '#dcdce1'; ctx.fill(); rr(ctx, 54, y + 126, 300, 14, 7); ctx.fill();
    const k = ANIM(t, tr, 0.35); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 60, 0);
    rr(ctx, 54, y + 162, SW - 108, 108, 20); ctx.fillStyle = '#e7f8ef'; ctx.fill();
    rr(ctx, 54, y + 162, 8, 108, 4); ctx.fillStyle = COL.mint; ctx.fill();
    txt(ctx, 'Merci beaucoup, à bientôt !', 80, y + 206, 25, 600, COL.ink);
    rr(ctx, 80, y + 224, 150, 34, 17); ctx.fillStyle = COL.mint; ctx.fill();
    check(ctx, 102, y + 241, 18, '#ffffff'); txt(ctx, 'Répondu', 120, y + 249, 20, 700, '#ffffff');
    ctx.restore();
  });
}

// ---------------------------------------------------------------- 3. la fiche toujours à jour
function fiche(ctx, t) {
  ctx.save(); rr(ctx, 0, 0, SW, 600, 0); ctx.clip();
  ctx.fillStyle = '#eceef2'; ctx.fillRect(0, 0, SW, 600);
  ctx.fillStyle = '#d5efd9'; rr(ctx, 360, 90, 200, 170, 30); ctx.fill();
  ctx.fillStyle = '#cfe5fb'; rr(ctx, -40, 420, 260, 220, 40); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 26; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, 300); ctx.lineTo(600, 250); ctx.moveTo(250, -20); ctx.lineTo(300, 620); ctx.moveTo(-20, 560); ctx.lineTo(600, 420); ctx.stroke();
  const pk = 0.5 + 0.5 * Math.sin(t * 5); ctx.beginPath(); ctx.arc(288, 280, 40 + pk * 16, 0, Math.PI * 2); ctx.fillStyle = `rgba(251,73,3,${0.18 - pk * 0.1})`; ctx.fill();
  ctx.beginPath(); ctx.arc(288, 250, 30, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(288, 306); ctx.closePath(); ctx.fillStyle = COL.ember; ctx.fill();
  ctx.beginPath(); ctx.arc(288, 250, 11, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 30; rr(ctx, 0, 540, SW, SH - 540, 40); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
  rr(ctx, SW / 2 - 40, 560, 80, 8, 4); ctx.fillStyle = '#d1d1d6'; ctx.fill();
  txt(ctx, 'Maison Lucie', 40, 650, 46, 800, COL.ink);
  txt(ctx, 'Pâtisserie', 40, 694, 26, 600, COL.grey); stars(ctx, 190, 686, 5, 24, 5);
  ctx.beginPath(); ctx.arc(50, 734, 9, 0, Math.PI * 2); ctx.fillStyle = COL.mint; ctx.fill();
  txt(ctx, 'Ouvert · 7 h – 19 h', 70, 744, 26, 700, '#2a9d64');
  ['Itinéraire', 'Appeler', 'Site'].forEach((l, i) => {
    const x = 40 + i * 172; rr(ctx, x, 784, 152, 96, 24); ctx.fillStyle = '#eef4ff'; ctx.fill();
    ctx.beginPath(); ctx.arc(x + 76, 818, 14, 0, Math.PI * 2); ctx.fillStyle = COL.blue; ctx.fill();
    txt(ctx, l, x + 76, 862, 21, 700, '#2b6fd6', 'center');
  });
  ['#ffd731', '#e9ccff', '#ffb36b'].forEach((c, i) => { rr(ctx, 40 + i * 172, 904, 152, 152, 22); ctx.fillStyle = c; ctx.fill(); });
  const k = ANIM(t, 10.6, 0.4);
  if (k > 0) {
    ctx.save(); ctx.globalAlpha = k; const s = 0.8 + 0.2 * E.back(u(t, 10.6, 10.95));
    ctx.translate(SW / 2, 1120); ctx.scale(s, s);
    rr(ctx, -200, -36, 400, 72, 36); ctx.fillStyle = COL.mint; ctx.fill();
    check(ctx, -160, 0, 26, '#ffffff'); txt(ctx, "Mis à jour aujourd'hui", 22, 10, 26, 800, '#ffffff', 'center');
    ctx.restore();
  }
}

// ---------------------------------------------------------------- 4. les posts se publient
const THUMBS = [['#ffb36b', '#fb4903'], ['#e9ccff', '#5c4ade'], ['#ffd731', '#ff9f1c'], ['#dceeff', '#4da2ff'], ['#c9f2dd', '#38d38a'],
  ['#ffd0c2', '#fb4903'], ['#fff1b8', '#ffd731'], ['#e6e0ff', '#5c4ade'], ['#ffd9b8', '#ff7a45']];
export function thumb(ctx, x, y, s, i) {
  const [a, b] = THUMBS[i % THUMBS.length], g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, a); g.addColorStop(1, b); rr(ctx, x, y, s, s, s * 0.1); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  if (i % 3 === 0) { ctx.beginPath(); ctx.arc(x + s * 0.5, y + s * 0.55, s * 0.26, 0, Math.PI * 2); ctx.fill(); }
  else if (i % 3 === 1) { rr(ctx, x + s * 0.22, y + s * 0.3, s * 0.56, s * 0.44, s * 0.08); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(x + s * 0.18, y + s * 0.78); ctx.lineTo(x + s * 0.45, y + s * 0.35); ctx.lineTo(x + s * 0.82, y + s * 0.78); ctx.fill(); }
}
function posts(ctx, t) {
  const g = ctx.createLinearGradient(40, 110, 160, 230); g.addColorStop(0, '#ffd731'); g.addColorStop(0.5, COL.ember); g.addColorStop(1, COL.violet);
  ctx.beginPath(); ctx.arc(100, 170, 60, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(100, 170, 52, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath(); ctx.arc(100, 170, 46, 0, Math.PI * 2); ctx.fillStyle = COL.ember; ctx.fill();
  txt(ctx, 'maison.lucie', 186, 160, 34, 800, COL.ink); txt(ctx, 'Pâtisserie artisanale', 186, 200, 24, 600, COL.grey);
  rr(ctx, 30, 262, SW - 60, 56, 16); ctx.fillStyle = '#f2f2f7'; ctx.fill(); txt(ctx, 'Publications', SW / 2, 299, 24, 700, COL.ink, 'center');
  const s = 166;
  for (let i = 0; i < 9; i++) {
    const k = E.back(u(t, 12.32 + i * 0.07, 12.62 + i * 0.07)); if (k <= 0) continue;
    const x = 30 + (i % 3) * (s + 7), y = 342 + Math.floor(i / 3) * (s + 7);
    ctx.save(); ctx.translate(x + s / 2, y + s / 2); ctx.scale(k, k); thumb(ctx, -s / 2, -s / 2, s, i); ctx.restore();
  }
  toast(ctx, t, 13.1, 'Publié pour vous');
}

// ---------------------------------------------------------------- 5. l'IA répond, même à 3 h
export const CHAT = [
  { who: 'c', t: 14.95, l: ['Vous êtes ouverts', 'demain ?'] },
  { who: 'ia', t: 15.35, l: ['Oui, dès 7 h !', 'À demain.'] },
  { who: 'c', t: 15.75, l: ['Je peux réserver', 'une tarte ?'] },
  { who: 'ia', t: 16.15, l: ["C'est noté", 'pour 10 h.'] },
];
function chat(ctx, t) {
  ctx.fillStyle = '#f5f5f7'; ctx.fillRect(0, 70, SW, 120);
  ctx.beginPath(); ctx.arc(76, 130, 32, 0, Math.PI * 2); ctx.fillStyle = COL.mint; ctx.fill();
  txt(ctx, 'IA', 76, 141, 28, 800, '#ffffff', 'center');
  txt(ctx, 'Maison Lucie', 124, 124, 30, 800, COL.ink);
  ctx.beginPath(); ctx.arc(132, 152, 7, 0, Math.PI * 2); ctx.fillStyle = COL.mint; ctx.fill(); txt(ctx, 'Assistant · en ligne', 148, 160, 22, 600, COL.grey);
  CHAT.forEach((m, i) => {
    const k = ANIM(t, m.t, 0.3); if (k <= 0) return;
    const y = 240 + i * 190, w = 380, x = m.who === 'c' ? 30 : SW - 30 - w;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30);
    rr(ctx, x, y, w, 150, 34); ctx.fillStyle = m.who === 'c' ? '#e9e9eb' : COL.mint; ctx.fill();
    m.l.forEach((s, j) => txt(ctx, s, x + 28, y + 62 + j * 40, 30, 700, m.who === 'c' ? COL.ink : '#ffffff'));
    ctx.restore();
  });
}

// ---------------------------------------------------------------- composition de l'écran
const SCREENS = [[3.7, site], [6.7, avis], [9.1, fiche], [11.85, posts], [14.4, chat]];
export function drawScreen(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, SW, SH);
  let i = 0; for (let k = 0; k < SCREENS.length; k++) if (t >= SCREENS[k][0]) i = k;
  const p = i > 0 ? E.io3(u(t, SCREENS[i][0], SCREENS[i][0] + 0.42)) : 1;
  if (p < 1 && i > 0) { ctx.save(); ctx.translate(-p * SW * 0.3, 0); ctx.globalAlpha = 1 - p * 0.5; SCREENS[i - 1][1](ctx, t); ctx.restore(); }
  ctx.save(); ctx.translate((1 - p) * SW, 0);
  if (p < 1) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, SW, SH); }
  SCREENS[i][1](ctx, t); ctx.restore();
  // barre d'état (l'heure passe à 3:00 sur « trois heures du matin »)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(0, 0, SW, 64);
  const late = t >= 16.3, hk = E.back3(u(t, 16.3, 16.6));
  if (late) { ctx.save(); ctx.translate(86, 40); ctx.scale(0.7 + 0.3 * hk, 0.7 + 0.3 * hk); rr(ctx, -62, -28, 124, 44, 22); ctx.fillStyle = COL.ember; ctx.fill(); txt(ctx, '3:00', 0, 4, 28, 800, '#ffffff', 'center'); ctx.restore(); }
  else txt(ctx, '9:41', 86, 46, 28, 800, COL.ink, 'center');
  for (let b = 0; b < 4; b++) { rr(ctx, 400 + b * 11, 36 - b * 5, 7, 10 + b * 5, 2); ctx.fillStyle = COL.ink; ctx.fill(); }
  rr(ctx, 458, 24, 52, 24, 7); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.5; ctx.stroke(); rr(ctx, 462, 28, 38, 16, 4); ctx.fillStyle = COL.ink; ctx.fill();
  void cl;
}
