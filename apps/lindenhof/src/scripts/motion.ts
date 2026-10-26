import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onPageReady } from '../../../../packages/ui/page-lifecycle';

gsap.registerPlugin(ScrollTrigger);

export const motion = {
  revealDuration: 0.55,
  revealDistance: 16,
  drawerDuration: 0.32,
  tabDuration: 0.3,
  ease: 'power2.out',
} as const;

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initLindenhofMotion() {
  onPageReady(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Двигаем небольшие текстовые блоки, а не секции с картой, видео и формами.
      const targets = document.querySelectorAll<HTMLElement>([
        '[data-motion] > h2',
        '[data-motion] > p',
        '[data-motion] > .section-heading',
        '[data-motion] > .perspectives-heading',
        '[data-motion] > .advice-copy',
        '[data-motion] > .about-copy',
      ].join(','));
      targets.forEach(element => {
        // Уже видимый текст никогда не прячем после загрузки JS или возврата по якорю.
        if (element.getBoundingClientRect().top < innerHeight) return;
        gsap.fromTo(element, { opacity: 0, y: motion.revealDistance }, {
          opacity: 1,
          y: 0,
          duration: motion.revealDuration,
          ease: motion.ease,
          clearProps: 'opacity,transform',
          scrollTrigger: { trigger: element, start: 'top 98%', once: true },
        });
      });
    });
    return () => media.revert();
  });
}
