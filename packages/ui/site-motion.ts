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
    const motion = { duration: isLindenhof ? 850 : 700, stagger: 65, distance: 20, delay: 260, settle: 160, easing: 'cubic-bezier(.2,.7,.2,1)' };
    const events = new AbortController();
    let observer: IntersectionObserver | undefined;
    let lastScroll = 0;
    const active = new Set<Animation>();
    const pending = new Map<Element, { animation: Animation; timer?: ReturnType<typeof setTimeout> }>();
    const targets = [...document.querySelectorAll<HTMLElement>(selectors)].filter(element => {
      return !element.closest('.reveal,[data-reveal],dialog,[data-pixel-widget]')
        && !element.querySelector('.reveal,[data-reveal]')
        && !element.parentElement?.closest(selectors);
    });
    const cancelPending = (element: Element) => {
      const item = pending.get(element);
      if (!item) return;
      clearTimeout(item.timer);
      item.animation.cancel();
      pending.delete(element);
    };
    const stop = () => {
      observer?.disconnect();
      pending.forEach(item => clearTimeout(item.timer));
      pending.clear();
      active.forEach(animation => animation.cancel());
      active.clear();
    };

    if (!reduced.matches && 'IntersectionObserver' in window) {
      if (isLindenhof) window.addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true, signal: events.signal });
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) { cancelPending(entry.target); continue; }
          if (reduced.matches || pending.has(entry.target)) continue;
          const element = entry.target as HTMLElement;
          const siblings = element.parentElement ? [...element.parentElement.children] : [element];
          const order = Math.max(0, siblings.indexOf(element)) % 4;
          const direction = element.dataset.motion;
          const from = direction === 'left' ? '-36px 0' : direction === 'right' ? '36px 0' : `0 ${motion.distance}px`;
          const animation = element.animate([
            { opacity: .16, translate: from }, { opacity: 1, translate: '0 0' },
          ], { duration: motion.duration, delay: (isLindenhof ? motion.delay : 0) + order * motion.stagger, easing: motion.easing, fill: isLindenhof ? 'backwards' : 'none' });
          active.add(animation);
          animation.onfinish = animation.oncancel = () => active.delete(animation);
          if (!isLindenhof) { observer?.unobserve(element); continue; }

          // Не проигрываем появление, пока посетитель ещё прокручивает страницу к блоку.
          animation.pause();
          const item: { animation: Animation; timer?: ReturnType<typeof setTimeout> } = { animation };
          pending.set(element, item);
          const startAfterScroll = () => {
            if (reduced.matches) { cancelPending(element); return; }
            const wait = motion.settle - (performance.now() - lastScroll);
            if (wait > 0) { item.timer = setTimeout(startAfterScroll, wait); return; }
            pending.delete(element);
            observer?.unobserve(element);
            animation.play();
          };
          item.timer = setTimeout(startAfterScroll, motion.settle);
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
