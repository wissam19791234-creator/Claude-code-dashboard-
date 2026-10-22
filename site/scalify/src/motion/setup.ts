// Mouvement global du site : une seule fois côté client, avant la première page.
import { gsap } from 'gsap';
import { setLoaderFormat, setLoaderExit, setTransition, onPage, onScroll, ease, isTouch, prefersReducedMotion } from '../engine';
import { startIdle } from './idle';
import { startStreet, streetPage } from './street';
import { site } from '../data/site';

export function setupMotion() {
  // Loader : le « S » du logo se trace avec le vrai chargement, puis le point bleu tombe dans la rue.
  setLoaderFormat((p) => {
    const path = document.querySelector<SVGPathElement>('#loader [data-loader-s]');
    if (path) path.style.strokeDashoffset = String(1 - p / 100);
    return String(Math.round(p)).padStart(3, '0');
  });
  setLoaderExit((root) => gsap.timeline()
    .to(root.querySelector('[data-loader-dot]'), { y: () => innerHeight, duration: 0.7, ease: 'power2.in' })
    .to(root.querySelectorAll('[data-loader-out]'), { autoAlpha: 0, duration: 0.35, ease: ease.soft }, '<0.1')
    .to(root, { autoAlpha: 0, duration: 0.5, ease: ease.inOut }, '<0.15'));

  // Transition de page : le rideau de fer descend, puis remonte sur la page suivante.
  setTransition({
    leave: (c) => gsap.timeline()
      .set(c, { autoAlpha: 1 })
      .fromTo(c.querySelector('.curtain__panel'), { yPercent: -100 }, { yPercent: 0, duration: 0.75, ease: ease.inOut }),
    enter: (c) => gsap.timeline()
      .to(c.querySelector('.curtain__panel'), { yPercent: -100, duration: 0.9, ease: ease.inOut, delay: 0.05 })
      .set(c, { autoAlpha: 0 }),
  });

  startIdle();
  startStreet();
  streetPage();
  lightFill();
  countdown();

  // Le cadre s'écarte quand on descend, revient quand on remonte (patterns.md, « Frame that steps aside »).
  let last = 0;
  onScroll(({ y }) => {
    if (Math.abs(y - last) < 4) return;
    document.documentElement.classList.toggle('frame-away', y > 160 && y > last);
    last = y;
  });
}

// Bouton principal : la lumière de vitrine monte du bas (un rideau qui s'ouvre), depuis le côté du pointeur.
function lightFill() {
  onPage(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const off: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>('[data-fill]').forEach((btn) => {
      const fill = btn.querySelector<HTMLElement>('.btn__fill');
      if (!fill) return;
      const open = () => { btn.classList.add('is-filled'); gsap.to(fill, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: ease.soft, overwrite: true }); };
      const close = () => { btn.classList.remove('is-filled'); gsap.to(fill, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.4, ease: ease.soft, overwrite: true }); };
      const focus = () => btn.matches(':focus-visible') && open();
      btn.addEventListener('pointerenter', open); btn.addEventListener('pointerleave', close);
      btn.addEventListener('focus', focus); btn.addEventListener('blur', close);
      off.push(() => { btn.removeEventListener('pointerenter', open); btn.removeEventListener('pointerleave', close); btn.removeEventListener('focus', focus); btn.removeEventListener('blur', close); });
    });
    return () => off.forEach((f) => f());
  });
}

// Compte à rebours réel jusqu'au lancement (J-n) ; le HTML statique affiche la date.
function countdown() {
  onPage(() => {
    const days = Math.ceil((new Date(site.launch.iso).getTime() - Date.now()) / 864e5);
    document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
      el.textContent = days > 1 ? `J-${days}` : days === 1 ? 'Demain' : 'Ouvert';
    });
    document.querySelectorAll<HTMLElement>('[data-countdown-long]').forEach((el) => {
      el.textContent = days > 1 ? `Lancement dans ${days} jours, le ${site.launch.label}.` : days === 1 ? `Lancement demain, ${site.launch.label}.` : 'Scalify est lancé.';
    });
  });
}
