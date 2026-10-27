(() => {
  'use strict';
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep the demo fully usable without network access (locally drawn fallbacks).
  $$('img[data-fallback]').forEach(img => {
    const fallback = img.dataset.fallback;
    img.addEventListener('error', () => {
      if (img.dataset.isFallback) return;
      img.dataset.isFallback = 'true';
      // Supports the Astro root path and file:// standalone preview.
      img.src = fallback;
    }, { once: true });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  });

  const loader = $('#pageIntro');
  const dismissLoader = () => {
    if (loader) loader.classList.add('is-done');
  };
  if (reducedMotion) dismissLoader();
  else window.setTimeout(dismissLoader, 1120);

  // Header changes as the visitor moves down the page.
  const header = $('#header');
  const onScroll = () => {
    if (header) header.classList.toggle('is-fixed', window.scrollY > 100);
    if (!reducedMotion) {
      const stage = $('#heroStage');
      if (stage && window.scrollY < window.innerHeight * 1.5) {
        const y = Math.min(window.scrollY * .12, 70);
        stage.style.setProperty('--img-y', `${y}px`);
      }
    }
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Intersection-driven content reveal. Initial content is always visible for reduced motion.
  const revealNodes = $$('.reveal, .reveal-image');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .08, rootMargin:'0px 0px -35px 0px'});
    revealNodes.forEach(node => observer.observe(node));
  } else revealNodes.forEach(node => node.classList.add('is-visible'));

  // Keyboard-accessible mobile navigation with focus return.
  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobileNav');
  let menuOpen = false;
  const setMenu = (open) => {
    menuOpen = open;
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    mobileNav.setAttribute('aria-hidden', String(!open));
    mobileNav.inert = !open;
    mobileNav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    if (open) {
      $('.mobile-nav a')?.focus();
    } else {
      menuButton.focus({preventScroll:true});
    }
  };
  menuButton?.addEventListener('click', () => setMenu(!menuOpen));
  $$('[data-mobile-link]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && menuOpen) setMenu(false);
    if (ev.key !== 'Tab' || !menuOpen || !mobileNav) return;
    const focusable = [menuButton, ...$$('a', mobileNav)];
    const index = focusable.indexOf(document.activeElement);
    if (ev.shiftKey && index === 0) {ev.preventDefault();focusable[focusable.length - 1].focus();}
    else if (!ev.shiftKey && index === focusable.length - 1) {ev.preventDefault();focusable[0].focus();}
  });
  window.addEventListener('resize', () => {
    if (menuOpen && window.innerWidth > 760) setMenu(false);
  });

  // Working menu-category filtering, not a decorative control.
  const filters = $$('.filter-button');
  const products = $$('.product-card');
  filters.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.filter;
      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      products.forEach((card) => {
        const visible = target === 'all' || card.dataset.category === target;
        card.hidden = !visible;
        if (visible) card.classList.add('is-visible');
      });
    });
  });
})();
