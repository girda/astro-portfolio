type Cleanup = () => void;

/** Повторная инициализация после перехода Astro без накопления слушателей. */
export function onPageReady(setup: () => Cleanup | void) {
  let cleanup: Cleanup | void;
  const dispose = () => { cleanup?.(); cleanup = undefined; };
  const start = () => { dispose(); cleanup = setup(); };
  document.addEventListener('astro:before-swap', dispose);
  document.addEventListener('astro:page-load', start);
  start();
}
