// Pilote du concept : UNE variable, la position dans l'histoire `s`, calculée depuis le défilement et les sections
// [data-story], alimente la rue 3D, l'étiquette « Vous êtes ici » et l'état de la page. Une page peut figer l'état
// avec <main data-state="8">. Sans WebGL ou en mouvement réduit, la rue n'est pas chargée : le décor statique prend
// le relais (CSS). Tout tourne sur gsap.ticker.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onPage, scrollState, prefersReducedMotion } from '../engine';
import { idle } from './idle';
import { chapters } from '../data/site';

type Street = ReturnType<typeof import('../scene/street').createStreet>;
export const story = { s: 0, intro: 0, ready: false };
let street: Street | null = null;
let sections: { top: number; h: number }[] = [];
let pinned: number | null = null;
let label: HTMLElement | null = null;

function measure() {
  sections = [...document.querySelectorAll<HTMLElement>('[data-story]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + scrollY, h: Math.max(1, r.height) };
  });
}
function storyAt(y: number) {
  for (let i = sections.length - 1; i >= 0; i--) if (y >= sections[i].top - 1) return i + Math.min(1, (y - sections[i].top) / sections[i].h);
  return 0;
}
function here(s: number) {
  if (s < 0.6) return 'Rue éteinte';
  if (s < 5.6) { const c = chapters[Math.min(4, Math.round(s) - 1)]; return `${c.shop}, ${c.title.toLowerCase()}`; }
  if (s < 6.6) return '03:12, La Page';
  if (s < 7.6) return 'Votre commerce';
  return 'Toute la rue';
}

function glOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

function tick() {
  if (!street || document.hidden) return;
  if (!document.documentElement.classList.contains('is-loaded') && story.intro === 0) return; // rien à montrer sous le loader
  const target = pinned ?? storyAt(scrollState().y);
  story.s += (target - story.s) * (pinned == null ? 0.18 : 0.08);
  if (Math.abs(target - story.s) < 0.0005) story.s = target;
  const txt = here(story.s);
  if (label && label.textContent !== txt) label.textContent = txt;
  street.frame(story.s, story.intro, idle);
}

export function startStreet() {
  if (prefersReducedMotion() || !glOk()) return;
  const host = document.getElementById('gl');
  if (!host) return;
  const q = new URLSearchParams(location.search);
  const dpr = q.has('dpr') ? +q.get('dpr')! : 2;
  document.fonts.ready
    .then(() => import('../scene/street'))
    .then((m) => {
      street = m.createStreet(host, dpr);
      street.frame(0, 0, idle); // compile les shaders pendant le loader : pas d'à-coup à la passation
      story.ready = true;
      document.documentElement.classList.add('gl-on');
      measure();
      addEventListener('resize', () => { street?.resize(); measure(); });
      ScrollTrigger.addEventListener('refresh', measure);
      gsap.ticker.add(tick);
      (window as any).__story = story;
    });
}

// À chaque page : état figé éventuel, étiquette, mesure, et la chute du point bleu dans l'intro.
export function streetPage() {
  onPage(({ intro }) => {
    const st = document.querySelector<HTMLElement>('[data-state]')?.dataset.state;
    pinned = st != null ? +st : null;
    label = document.querySelector('[data-here]');
    measure();
    if (pinned != null && story.s === 0) story.s = pinned;
    if (prefersReducedMotion()) { story.intro = 1; return; }
    if (story.intro < 1) intro.add(gsap.to(story, { intro: 1, duration: 1.3, ease: 'none' }), 0);
  });
}
