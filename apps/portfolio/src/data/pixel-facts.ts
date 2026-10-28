import pricing from './pricing.json' with { type: 'json' };
import { projects } from './projects.ts';
import type { Language } from '../i18n/translations';

// Резервные ответы и серверный агент используют общий прайс и каталог.
// Статические ответы доступны, когда публичный API не настроен.
export function pixelBusinessFacts(lang: Language) {
  const names = Object.values(projects).map(project => project.name).join(', ');
  const packages = pricing[lang].map(([name, price]) => `${name}: ${price}`).join('; ');
  const count = Object.keys(projects).length;
  const copy = {
    de: {
      projects: `Im Portfolio findest du ${count} Demo-Projekte: ${names}. Du kannst die Websites öffnen und ihre Funktionen ausprobieren. Es sind eigene Konzepte, keine Kundenaufträge.`,
      pricing: `${packages}. Das sind Einstiegspreise; den genauen Umfang und Preis vereinbarst du vor Beginn mit Artem.`,
    },
    en: {
      projects: `The portfolio has ${count} demo projects: ${names}. Open the websites and try their features. These are self-initiated concepts, not client commissions.`,
      pricing: `${packages}. These are starting prices; you agree the exact scope and price with Artem before work begins.`,
    },
    ru: {
      projects: `В портфолио ${count} демопроектов: ${names}. Открывай сайты и пробуй их функции. Это собственные концепты, а не клиентские заказы.`,
      pricing: `${packages}. Это начальные цены. Точный объём работы и стоимость согласуешь с Артёмом до старта.`,
    },
  };
  return copy[lang];
}
