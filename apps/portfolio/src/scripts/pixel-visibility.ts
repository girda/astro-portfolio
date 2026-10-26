import { onPageReady } from '../../../../packages/ui/page-lifecycle';

// Плавающий Pixel встречает на первом экране; ниже доступен из отдельной секции.
onPageReady(() => {
  const root = document.querySelector<HTMLElement>('[data-hirda-cat]');
  const hero = document.querySelector<HTMLElement>('[data-studio]');
  const launcher = root?.querySelector<HTMLButtonElement>('[data-cat-launcher]');
  const bubble = root?.querySelector<HTMLElement>('[data-cat-bubble]');
  if (!root || !hero || !launcher || !('IntersectionObserver' in window)) return;
  let visible = true;
  const sync = () => {
    const hide = !visible && !root.classList.contains('is-open');
    if (root.classList.contains('is-away-from-hero') !== hide) root.classList.toggle('is-away-from-hero', hide);
    launcher.inert = hide;
    if (bubble) bubble.inert = hide;
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    sync();
  });
  observer.observe(hero);
  const state = new MutationObserver(sync);
  state.observe(root, {attributes: true, attributeFilter: ['class']});
  return () => {
    observer.disconnect(); state.disconnect();
    root.classList.remove('is-away-from-hero'); launcher.inert = false;
    if (bubble) bubble.inert = false;
  };
});
