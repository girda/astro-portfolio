import { onPageReady } from './page-lifecycle';
export function initSiteMotion() {
 onPageReady(() => {

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const SELECTORS = [
    '[data-motion]', '.section-intro', '.section-head', '.section-heading',
    '.pricing-intro', '.pricing-note', '.about-copy > p',
    '.service-grid > *', '.cleaning-service-grid > *', '.benefit-list > *',
    '.trust-strip > *', '.steps > *', '.gallery > figure', '.garden-gallery > *',
    '.contact-layout > *', '.included-layout > *', '.booking-layout > *',
    '.faq-layout > *', '.services > *', '.service-list > article',
  ].join(',');
  const MOTION = {duration: 700, stagger: 65, distance: 20, easing: 'cubic-bezier(.2,.7,.2,1)'};
  const events = new AbortController();
  let observer: IntersectionObserver | undefined;
  const active = new Set<Animation>();
  const targets = [...document.querySelectorAll<HTMLElement>(SELECTORS)].filter(element => {
    // Существующие анимации Pixel, Reveal и автомобильного каталога сохраняют своё управление.
    return !element.closest('.reveal,[data-reveal],dialog,[data-pixel-widget]')
      && !element.querySelector('.reveal,[data-reveal]')
      && !element.parentElement?.closest(SELECTORS);
  });
  if (!reduced.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer?.unobserve(entry.target);
        if (reduced.matches) continue;
        const element = entry.target as HTMLElement;
        const siblings = element.parentElement ? [...element.parentElement.children] : [element];
        const order = Math.max(0, siblings.indexOf(element)) % 4;
        const direction = element.dataset.motion;
        const from = direction === 'left' ? '-36px 0' : direction === 'right' ? '36px 0' : `0 ${MOTION.distance}px`;
        const animation = element.animate([
          {opacity: .16, translate: from},
          {opacity: 1, translate: '0 0'},
        ], {duration: MOTION.duration, delay: order * MOTION.stagger, easing: MOTION.easing});
        active.add(animation);
        animation.onfinish = () => active.delete(animation);
        animation.oncancel = () => active.delete(animation);
      }
    }, {threshold: .08});
    // Первый экран сразу читается, без ожидания и скрытого контента при отключённом JS.
    targets.forEach(element => {
      if (element.getBoundingClientRect().top >= innerHeight * .9) observer?.observe(element);
    });
    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      observer?.disconnect();
      active.forEach(animation => animation.cancel());
      active.clear();
    }, {signal: events.signal});
  }
  document.documentElement.dataset.hirdaMotion = 'ready';

  return () => { events.abort(); observer?.disconnect(); active.forEach(animation => animation.cancel()); active.clear(); };

 });
}
