// Переносим локальные пути артефакта Street Food, сохраняя абсолютные canonical и правовые ссылки.
export function rewriteBuiltMenuBase(source, target) {
  return source.replace(/(?<![\w/])\/(?:astro-portfolio\/)?demos\/streetfood\//g, target);
}
