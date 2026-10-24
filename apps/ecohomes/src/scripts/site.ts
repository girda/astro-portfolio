const houses: {
  id: string;
  name: string;
  image: string;
  text: string;
  features: string[];
}[] = JSON.parse(document.getElementById("house-data")!.textContent!);
const dialog = document.querySelector<HTMLDialogElement>("#house-dialog")!;
const formDialog = document.querySelector<HTMLDialogElement>("#form-dialog")!;
document
  .querySelectorAll<HTMLButtonElement>("[data-filter]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll<HTMLButtonElement>("[data-filter]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      document
        .querySelectorAll<HTMLElement>("[data-type]")
        .forEach(
          (card) =>
            (card.hidden =
              button.dataset.filter !== "Alle Häuser" &&
              card.dataset.type !== button.dataset.filter),
        );
    }),
  );
document.querySelectorAll<HTMLButtonElement>("[data-house]").forEach((button) =>
  button.addEventListener("click", () => {
    const h = houses[Number(button.dataset.house)];
    document.getElementById("house-title")!.textContent = h.name;
    const img = document.querySelector<HTMLImageElement>(
      "#house-dialog-image",
    )!;
    img.src = h.image;
    img.alt = `KI-Visualisierung ${h.name}`;
    document.getElementById("house-dialog-text")!.textContent = h.text;
    document.getElementById("house-dialog-features")!.replaceChildren(
      ...h.features.map((feature) => {
        const li = document.createElement("li");
        li.textContent = feature;
        return li;
      }),
    );
    document.querySelector<HTMLSelectElement>("[name=house]")!.value = h.name;
    dialog.showModal();
  }),
);
document
  .getElementById("house-inquire")!
  .addEventListener("click", () => dialog.close());
document
  .querySelectorAll<HTMLButtonElement>("[data-close]")
  .forEach((b) =>
    b.addEventListener("click", () => b.closest("dialog")!.close()),
  );
document
  .querySelectorAll<HTMLDialogElement>("dialog:not([data-demo-menu])")
  .forEach((d) =>
    d.addEventListener("click", (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }),
  );
let saved: string[] = [];
try {
  const raw = JSON.parse(localStorage.getItem("eichenhain:saved") || "[]");
  if (Array.isArray(raw)) saved = raw.filter((v) => typeof v === "string");
} catch {
  /* Хранилище может быть отключено. */
}
document
  .querySelectorAll<HTMLButtonElement>("[data-save]")
  .forEach((button) => {
    const id = button.dataset.save!;
    button.setAttribute("aria-pressed", String(saved.includes(id)));
    button.addEventListener("click", () => {
      saved = saved.includes(id)
        ? saved.filter((v) => v !== id)
        : [...saved, id];
      button.setAttribute("aria-pressed", String(saved.includes(id)));
      try {
        localStorage.setItem("eichenhain:saved", JSON.stringify(saved));
      } catch {
        /* Состояние сохраняется в текущей вкладке. */
      }
    });
  });
const tabs = [
  ...document.querySelectorAll<HTMLButtonElement>(".energy-tabs [role=tab]"),
];
function activateEnergy(index: number) {
  tabs.forEach((tab, i) => {
    tab.setAttribute("aria-selected", String(index === i));
    tab.tabIndex = i === index ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")!)!.hidden =
      i !== index;
  });
  document
    .querySelectorAll<HTMLButtonElement>(".energy-pin")
    .forEach((pin, i) => pin.setAttribute("aria-pressed", String(index === i)));
}
document
  .querySelectorAll<HTMLButtonElement>("[data-energy]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      activateEnergy(Number(button.dataset.energy)),
    ),
  );
tabs.forEach((tab, i) =>
  tab.addEventListener("keydown", (e) => {
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    else return;
    e.preventDefault();
    activateEnergy(n);
    tabs[n].focus();
  }),
);
document.getElementById("house-finder")!.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget as HTMLFormElement);
  const index =
    data.get("priority") === "level"
      ? 1
      : data.get("priority") === "compact"
        ? 2
        : 0;
  const h = houses[index];
  const result = document.getElementById("finder-result")!;
  const title = document.createElement("h3");
  title.textContent = `Deine Richtung: ${h.name}`;
  const p = document.createElement("p");
  p.textContent = `${h.text} Das ist ein erster Ausgangspunkt, keine verbindliche Planung. Als Nächstes wären Grundstück und Raumbedarf zu klären.`;
  const a = document.createElement("a");
  a.className = "text-button";
  a.href = "#kontakt";
  a.textContent = "Mit dieser Idee weitergehen";
  a.addEventListener(
    "click",
    () =>
      (document.querySelector<HTMLSelectElement>("[name=house]")!.value =
        h.name),
  );
  result.replaceChildren(title, p, a);
  result.hidden = false;
});
document.getElementById("consultation")!.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const target = document.getElementById("form-summary")!;
  target.replaceChildren(
    ...[
      ["Name", data.get("name")],
      ["E-Mail", data.get("email")],
      ["Hausidee", data.get("house")],
      ["Wünsche", data.get("message") || "Noch offen"],
    ].map(([label, value]) => {
      const div = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = String(label);
      dd.textContent = String(value);
      div.append(dt, dd);
      return div;
    }),
  );
  formDialog.showModal();
});
// Нативный details остаётся доступным и без JavaScript; анимация учитывает отмену.
const reduced = matchMedia("(prefers-reduced-motion:reduce)");
document.querySelectorAll<HTMLDetailsElement>(".faq details").forEach((d) => {
  const summary = d.querySelector("summary")!;
  const answer = d.querySelector<HTMLElement>(".answer")!;
  let animation: Animation | null = null;
  let expanded = d.open;
  const settle = () => {
    animation?.cancel();
    animation = null;
    d.open = expanded;
    d.style.overflow = "";
  };
  summary.addEventListener("click", (e) => {
    if (reduced.matches) return;
    e.preventDefault();
    const from = d.getBoundingClientRect().height;
    expanded = animation ? !expanded : !d.open;
    animation?.cancel();
    d.open = true;
    d.style.overflow = "hidden";
    animation = d.animate(
      {
        height: [
          `${from}px`,
          `${summary.getBoundingClientRect().height + (expanded ? answer.getBoundingClientRect().height : 0)}px`,
        ],
      },
      { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
    animation.onfinish = settle;
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches && animation) settle();
  });
  window.addEventListener("resize", () => {
    if (animation) settle();
  });
});
