import { onPageReady } from './page-lifecycle';

export function initSiteMotion() {
  onPageReady(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const isLindenhof = document.body.dataset.demo === 'lindenhof';
    const selectors = [
      '[data-motion]', '.section-intro', '.section-head', '.section-heading',
      '.pricing-intro', '.pricing-note', '.about-copy > p',
      '.service-grid > *', '.cleaning-service-grid > *', '.benefit-list > *',
      '.trust-strip > *', '.steps > *', '.gallery > figure', '.garden-gallery > *',
      '.contact-layout > *', '.included-layout > *', '.booking-layout > *',
      '.faq-layout > *', '.services > *', '.service-list > article',
    ].join(',');
    const motion = { duration: isLindenhof ? 850 : 700, stagger: 65, distance: 20, easing: 'cubic-bezier(.2,.7,.2,1)' };
    const events = new AbortController();
    let observer: IntersectionObserver | undefined;
    const active = new Set<Animation>();
    const targets = [...document.querySelectorAll<HTMLElement>(selectors)].filter(element => {
      return !element.closest('.reveal,[data-reveal],dialog,[data-pixel-widget]')
        && !element.querySelector('.reveal,[data-reveal]')
        && !element.parentElement?.closest(selectors);
    });
    const stop = () => {
      observer?.disconnect();
      active.forEach(animation => animation.cancel());
      active.clear();
    };

    if (!reduced.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (reduced.matches) continue;
          observer?.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          const siblings = element.parentElement ? [...element.parentElement.children] : [element];
          const order = Math.max(0, siblings.indexOf(element)) % 4;
          const direction = element.dataset.motion;
          const from = direction === 'left' ? '-36px 0' : direction === 'right' ? '36px 0' : `0 ${motion.distance}px`;
          const animation = element.animate([
            { opacity: .16, translate: from }, { opacity: 1, translate: '0 0' },
          ], { duration: motion.duration, delay: isLindenhof ? 0 : order * motion.stagger, easing: motion.easing, fill: isLindenhof ? 'backwards' : 'none' });
          active.add(animation);
          animation.onfinish = animation.oncancel = () => active.delete(animation);

        }
      }, { threshold: isLindenhof ? .1 : .08, rootMargin: isLindenhof ? '0px 0px -16% 0px' : '0px' });
      targets.forEach(element => {
        if (element.getBoundingClientRect().top >= innerHeight * .9) observer?.observe(element);
      });
      reduced.addEventListener('change', () => { if (reduced.matches) stop(); }, { signal: events.signal });
    }
    document.documentElement.dataset.hirdaMotion = 'ready';
    return () => { events.abort(); stop(); };
  });
}
