import { onPageReady } from '../../../../packages/ui/page-lifecycle';

// На телефоне кот уступает место форме; открытый пользователем чат остаётся доступен.
onPageReady(() => {
  const root = document.querySelector<HTMLElement>('[data-hirda-cat]');
  const form = document.querySelector<HTMLElement>('[data-whatsapp-form]');
  const launcher = root?.querySelector<HTMLButtonElement>('[data-cat-launcher]');
  const bubble = root?.querySelector<HTMLElement>('[data-cat-bubble]');
  if (!root || !form || !launcher || !('IntersectionObserver' in window)) return;
  const mobile = matchMedia('(max-width: 600px)');
  let visible = false;
  const sync = () => {
    const hide = mobile.matches && visible && !root.classList.contains('is-open');
    if (root.classList.contains('is-near-contact') !== hide) root.classList.toggle('is-near-contact', hide);
    launcher.inert = hide;
    if (bubble) bubble.inert = hide;
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    sync();
  });
  observer.observe(form);
  const state = new MutationObserver(sync);
  state.observe(root, {attributes: true, attributeFilter: ['class']});
  mobile.addEventListener('change', sync);
  return () => {
    observer.disconnect(); state.disconnect(); mobile.removeEventListener('change', sync);
    root.classList.remove('is-near-contact'); launcher.inert = false;
    if (bubble) bubble.inert = false;
  };
});
