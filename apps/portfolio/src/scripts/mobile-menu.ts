// Изолируем фон открытого меню: Tab и экранный диктор остаются внутри навигации.
const menu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
const trigger = menu?.querySelector<HTMLElement>("summary");
if (menu && trigger) {
  const backgrounds = [
    ...document.querySelectorAll<HTMLElement>(
      "main, body > footer, .hero-copy, .hero-foot, .art-window, .wordmark, .hero-languages",
    ),
  ];
  const previousInert = new Map<HTMLElement, boolean>();
  const english = document.documentElement.lang === "en";
  function sync() {
    if (!menu || !trigger) return;
    document.body.classList.toggle("menu-open", menu.open);
    trigger.setAttribute("aria-expanded", String(menu.open));
    trigger.setAttribute(
      "aria-label",
      menu.open
        ? english
          ? "Close menu"
          : "Menü schließen"
        : english
          ? "Open menu"
          : "Menü öffnen",
    );
    if (menu.open) {
      for (const element of backgrounds) {
        if (!previousInert.has(element))
          previousInert.set(element, element.inert);
        element.inert = true;
      }
    } else {
      for (const [element, inert] of previousInert) element.inert = inert;
      previousInert.clear();
    }
  }
  function close() {
    if (menu) menu.open = false;
    sync();
  }
  menu.addEventListener("toggle", sync);
  menu.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    link.addEventListener("click", () => {
      close();
      // Переносим фокус к выбранной секции, не вызывая повторную прокрутку.
      const section = document.querySelector<HTMLElement>(link.hash);
      if (section) {
        section.setAttribute("tabindex", "-1");
        section.focus({ preventScroll: true });
        section.addEventListener(
          "blur",
          () => section.removeAttribute("tabindex"),
          { once: true },
        );
      }
    });
  });
  document.addEventListener("keydown", (event) => {
    if (!menu.open) return;
    if (event.key === "Escape") {
      close();
      trigger.focus();
    }
    if (event.key === "Tab") {
      const elements = [trigger, ...menu.querySelectorAll<HTMLElement>("a")];
      const last = elements.at(-1)!;
      if (event.shiftKey && document.activeElement === trigger) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        trigger.focus();
      }
    }
  });
  matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) close();
  });
  sync();
}
