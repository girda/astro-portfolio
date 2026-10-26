import { onPageReady } from '../../../../packages/ui/page-lifecycle';

const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
const desktopHover = () => matchMedia('(min-width:1025px) and (hover:hover) and (pointer:fine)').matches;

export function showDevelopment(custom?: string) {
  const dialog = document.querySelector<HTMLDialogElement>('#development-dialog');
  if (!dialog) return;
  const title = dialog.querySelector('#dialog-title');
  const message = dialog.querySelector('#dialog-message');
  if (title) title.textContent = custom ? 'Dein nächster Schritt.' : 'Hier entsteht etwas Neues.';
  if (message) message.textContent = custom ?? 'Dieser Bereich ist noch in Entwicklung. Entdecke inzwischen unsere Fahrzeuge oder stelle uns deine Fragen direkt.';
  if (!dialog.open) dialog.showModal();
}

export function initNavigation() {
  onPageReady(() => {
    const events = new AbortController();
    const options = { signal: events.signal };
    const menu = document.querySelector<HTMLDialogElement>('#navigation-dialog');
    const trigger = document.querySelector<HTMLButtonElement>('.menu-trigger');
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!menu || !trigger || !header) return;

    let closePending: Promise<void> | undefined;
    let oldOverflow = '';
    const closeMenu = (): Promise<void> => {
      if (closePending) return closePending;
      if (!menu.open) return Promise.resolve();
      menu.classList.add('is-closing');
      const animation = reduced() ? Promise.resolve() : menu.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }],
        { duration: 240, easing: 'cubic-bezier(.4,0,1,1)' },
      ).finished;
      closePending = animation.catch(() => {}).then(() => {
        menu.close();
        menu.classList.remove('is-closing');
        closePending = undefined;
      });
      return closePending;
    };

    trigger.addEventListener('click', () => {
      oldOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      menu.showModal();
      trigger.setAttribute('aria-expanded', 'true');
    }, options);
    menu.addEventListener('cancel', event => {
      event.preventDefault();
      void closeMenu();
    }, options);
    menu.addEventListener('close', () => {
      document.body.style.overflow = oldOverflow;
      trigger.setAttribute('aria-expanded', 'false');
    }, options);
    menu.addEventListener('click', event => {
      if (event.target !== menu) return;
      const rect = menu.getBoundingClientRect();
      if (event.clientX > rect.right || event.clientX < rect.left) void closeMenu();
    }, options);
    document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
      dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
        if (dialog === menu) void closeMenu();
        else dialog.close();
      }, options));
    });
    document.querySelectorAll<HTMLElement>('[data-development]').forEach(button => {
      button.addEventListener('click', () => {
        if (menu.open) menu.close();
        showDevelopment();
      }, options);
    });

    const dropdowns = [...header.querySelectorAll<HTMLDetailsElement>('.header-nav details')];
    const timers = new Map<HTMLDetailsElement, ReturnType<typeof setTimeout>>();
    const closeDropdowns = () => dropdowns.forEach(details => { details.open = false; });
    for (const details of dropdowns) {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        const siblings = details.parentElement?.parentElement?.querySelectorAll<HTMLDetailsElement>(':scope > li > details');
        siblings?.forEach(other => { if (other !== details) other.open = false; });
      }, options);
      details.addEventListener('pointerenter', () => {
        if (!desktopHover()) return;
        clearTimeout(timers.get(details));
        details.open = true;
      }, options);
      details.addEventListener('pointerleave', () => {
        if (!desktopHover()) return;
        timers.set(details, setTimeout(() => {
          const focused = document.activeElement;
          if (focused instanceof HTMLElement && details.contains(focused) && focused.matches(':focus-visible')) return;
          details.open = false;
        }, 180));
      }, options);
    }
    header.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const active = document.activeElement?.closest('details');
      if (active instanceof HTMLDetailsElement && active.open) {
        active.open = false;
        active.querySelector('summary')?.focus();
      } else closeDropdowns();
    }, options);

    document.addEventListener('click', async event => {
      if (!header.contains(event.target as Node)) closeDropdowns();
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); }
      catch { return; }
      if (!target) return;
      event.preventDefault();
      closeDropdowns();
      // Прокручиваем после возврата фокуса и разблокировки фона, иначе dialog сбивает якорь.
      await closeMenu();
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
      target.scrollIntoView({ block: 'start', behavior: reduced() ? 'instant' : 'smooth' });
    }, options);

    const sentinel = document.querySelector('.header-sentinel');
    const observer = new IntersectionObserver(entries => {
      header.classList.toggle('is-compact', !entries[0].isIntersecting);
    });
    if (sentinel) observer.observe(sentinel);

    return () => {
      events.abort();
      observer.disconnect();
      timers.forEach(clearTimeout);
      if (menu.open) menu.close();
      document.body.style.overflow = oldOverflow;
    };
  });
}
