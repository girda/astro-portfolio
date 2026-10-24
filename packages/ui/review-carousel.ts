import { onPageReady } from './page-lifecycle';

export function initReviewCarousels() {
  onPageReady(() => {
    const events = new AbortController();
    const observers: ResizeObserver[] = [];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    for (const root of document.querySelectorAll<HTMLElement>('[data-review-carousel]')) {
      const track = root.querySelector<HTMLElement>('.review-track');
      const prev = root.querySelector<HTMLButtonElement>('[data-review-prev]');
      const next = root.querySelector<HTMLButtonElement>('[data-review-next]');
      const controls = root.querySelector<HTMLElement>('.review-controls');
      if (!track || !prev || !next || !controls) continue;
      const sync = () => {
        const max = track.scrollWidth - track.clientWidth;
        controls.hidden = max < 3;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max - 2;
      };
      const step = (direction: number) => {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const width = track.firstElementChild?.getBoundingClientRect().width ?? track.clientWidth;
        track.scrollBy({left: direction * (width + gap), behavior: reduced.matches ? 'instant' : 'smooth'});
      };
      const options = {signal: events.signal};
      prev.addEventListener('click', () => step(-1), options);
      next.addEventListener('click', () => step(1), options);
      track.addEventListener('scroll', sync, {...options, passive: true});
      track.addEventListener('keydown', event => {
        if (event.target !== track) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);
        }
      }, options);
      const observer = new ResizeObserver(sync);
      observer.observe(track); observers.push(observer); sync();
    }
    return () => { events.abort(); observers.forEach(observer => observer.disconnect()); };
  });
}
