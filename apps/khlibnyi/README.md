# ХЛІБНИЙ — неофициальный концепт

Перенесён из khlibnyi-codex-package 27.10.2026. Дизайн, украинские тексты, SVG, стили и анимации сохранены. Это не официальный сайт и не заказ бренда.

## Запуск и правки

Node >=24, Astro 7.x. `npm ci --prefix apps/khlibnyi`, затем `npm run dev --prefix apps/khlibnyi`. Адрес http://localhost:4333/ (4332 уже занят Falkenried). Preview использует тот же 4333.

- `src/components/Homepage.astro` — вся композиция и контент.
- `src/pages/index.astro` — SEO, шрифты, BASE_URL и подключение ресурсов.
- `public/styles.css` — исходный дизайн, responsive и CSS-анимации.
- `public/app.js` — загрузчик, параллакс, reveal, мобильное меню и фильтры.
- `public/assets/` — локальные SVG-иллюстрации и favicon, используемые при недоступности фотографий.

Внешние фотографии Unsplash и Village оставлены hotlink, не скачивались. Их права и разрешение на использование не подтверждены; это сторонние материалы исходного пакета. Перед коммерческой публикацией заменить согласованными изображениями. Шрифты Manrope и Oswald загружаются через Google Fonts.

Меню содержит демонстрационные позиции. Примечание о неофициальном концепте сохранено. В public нет preview.html, чтобы не публиковать второй дубликат сайта. Исходный пакет в Downloads не изменён.

## Сборка

`npm run build --prefix apps/khlibnyi` — отдельная сборка на /. Корневая `npm run build` задаёт `/astro-portfolio/demos/khlibnyi/` и включает приложение через scripts/projects.mjs. Все локальные src/href/data-fallback учитывают BASE_URL.

После отдельного разрешения на push и успешной публикации: https://girda.github.io/astro-portfolio/demos/khlibnyi/ . Проект относится к группе food, подписи карточек переведены на DE/EN/RU. Порядок задаётся apps/portfolio/src/data/project-order.json.
