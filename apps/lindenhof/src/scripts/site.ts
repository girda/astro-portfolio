const $ = <T extends Element = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) =>
  Array.from(document.querySelectorAll<T>(selector));
import {showDevelopment} from './navigation';
import { initOwnershipTabs } from './ownership-tabs';
const carousel = $(".vehicle-carousel");
const cards = $$<HTMLElement>(".vehicle-card");
function visibleCards() {
  return cards.filter((card) => !card.hidden);
}
function updateCarouselControls() {
 const max=carousel.scrollWidth-carousel.clientWidth;
 document.querySelector<HTMLButtonElement>('[data-slide="-1"]')?.toggleAttribute('disabled',carousel.scrollLeft<=2);
 document.querySelector<HTMLButtonElement>('[data-slide="1"]')?.toggleAttribute('disabled',carousel.scrollLeft>=max-2);
}
$$<HTMLButtonElement>("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    cards.forEach(
      (card) =>
        (card.hidden =
          button.dataset.filter !== "Alle Modelle" &&
          card.dataset.category !== button.dataset.filter),
    );
    carousel.scrollLeft = 0;
    updateCarouselControls();
  }),
);
$$<HTMLButtonElement>("[data-slide]").forEach((button) =>
  button.addEventListener("click", () => {
    const visible = visibleCards();
    if (!visible.length) return;
    const step = visible[0].getBoundingClientRect().width + 24;
    const max = carousel.scrollWidth - carousel.clientWidth;
    const direction = Number(button.dataset.slide);
    const next = carousel.scrollLeft + direction * step;
    carousel.scrollTo({
      left:
        direction > 0 && carousel.scrollLeft >= max - 2
          ? 0
          : direction < 0 && carousel.scrollLeft <= 2
            ? max
            : Math.min(max, Math.max(0, next)),
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "instant"
        : "smooth",
    });
  }),
);
// На телефоне работает нативный свайп; мышью добавляем перетаскивание без захвата кликов кнопок.
let drag: { x: number; left: number; active: boolean } | null = null;
carousel.addEventListener("pointerdown", (event) => {
  if (
    event.pointerType !== "mouse" ||
    (event.target as HTMLElement).closest("button,a")
  )
    return;
  drag = { x: event.clientX, left: carousel.scrollLeft, active: false };
});
window.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const delta = event.clientX - drag.x;
  if (Math.abs(delta) > 5) {
    drag.active = true;
    carousel.classList.add("dragging");
    carousel.scrollLeft = drag.left - delta;
  }
});
window.addEventListener("pointerup", () => {
  drag = null;
  carousel.classList.remove("dragging");
});
carousel.addEventListener("scroll", updateCarouselControls, { passive: true });
let favorites: string[] = [];
try {
  const raw = JSON.parse(localStorage.getItem("lindenhof:favorites") || "[]");
  if (Array.isArray(raw))
    favorites = raw.filter((v: unknown): v is string => typeof v === "string");
} catch {
  /* Локальное хранилище может быть недоступно. */
}
$$<HTMLButtonElement>("[data-save]").forEach((button) => {
  const id = button.dataset.save!;
  button.setAttribute("aria-pressed", String(favorites.includes(id)));
  button.addEventListener("click", () => {
    const saved = !favorites.includes(id);
    favorites = saved
      ? [...favorites, id]
      : favorites.filter((item) => item !== id);
    button.setAttribute("aria-pressed", String(saved));
    try {
      localStorage.setItem("lindenhof:favorites", JSON.stringify(favorites));
    } catch {
      /* Избранное продолжает работать до закрытия вкладки. */
    }
  });
});
initOwnershipTabs();
$$<HTMLAnchorElement>("[data-interest]").forEach((button) =>
  button.addEventListener("click", () => {
    $<HTMLInputElement>("input[name=vehicle]").value =
      button.dataset.interest || "";
  }),
);
$("#test-drive-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  if (!form.reportValidity()) return;
  showDevelopment(
    "Deine Angaben sind vorbereitet. Der Versand ist noch in Entwicklung; deine Anfrage wurde nicht übermittelt.",
  );
});
// Это локальная подборка по трём демомоделям, без имитации ответа подключённого ИИ.
function advise(wish: string) {
  const result = $("#advice-result");
  const value = wish.toLowerCase();
  let text =
    "Für deinen Alltag lohnt sich ein Blick auf den Mazda3: ein kompakter Einstieg in unsere Auswahl.";
  if (/famil|platz|kind|koffer|komfort|bmw/.test(value))
    text =
      "Wenn Platz und Komfort wichtig sind, wäre die BMW Limousine ein guter Ausgangspunkt. Prüfe bei einer Probefahrt, wie sich Sitzposition und Innenraum für dich anfühlen.";
  else if (
    /spaß|spass|spass|roadster|porsche|wochenende|sport|cabrio/.test(value)
  )
    text =
      "Für offene Fahrten zu zweit passt der Porsche Roadster zu deiner Suche. Wie viel Alltagstauglichkeit du brauchst, lässt sich am besten bei einer Probefahrt klären.";
  result.replaceChildren();
  const p = document.createElement("p");
  p.textContent = text;
  const a = document.createElement("a");
  a.href = "#kontakt";
  a.textContent = "Probefahrt anfragen";
  result.append(p, a);
  result.hidden = false;
}
$$<HTMLButtonElement>("[data-advice]").forEach((button) =>
  button.addEventListener("click", () => advise(button.dataset.advice!)),
);
$("#advice-start").addEventListener("click", () => {
  $<HTMLInputElement>("#advice-input").focus();
});
$(".assistant-input").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $<HTMLInputElement>("#advice-input");
  if (input.value.trim()) advise(input.value);
});
const video = $<HTMLVideoElement>("#driving-film");
const film = $(".film");
const play = $<HTMLButtonElement>(".film-play");
const pause = $<HTMLButtonElement>(".film-pause");
let manualPause = false;
function loadVideo() {
  if (!video.getAttribute("src")) video.src = video.dataset.src!;
}
async function startVideo() {
  loadVideo();
  try {
    await video.play();
    film.classList.add("playing");
    pause.hidden = false;
  } catch {
    film.classList.remove("playing");
    pause.hidden = true;
  }
}
function stopVideo() {
  video.pause();
  film.classList.remove("playing");
  pause.hidden = true;
}
play.addEventListener("click", () => {
  manualPause = false;
  video.controls = false;
  void startVideo();
});
pause.addEventListener("click", () => {
  manualPause = true;
  stopVideo();
});
video.addEventListener("pause", () => {
  film.classList.remove("playing");
  pause.hidden = true;
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) stopVideo();
        else if (
          matchMedia("(min-width:761px)").matches &&
          !matchMedia("(prefers-reduced-motion:reduce)").matches &&
          !manualPause
        )
          void startVideo();
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(video);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopVideo();
});

new ResizeObserver(updateCarouselControls).observe(carousel);updateCarouselControls();
