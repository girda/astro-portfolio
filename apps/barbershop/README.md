# KANT · Ink & Paper

Демонстрационный сайт вымышленного барбершопа: Astro, TypeScript в клиентских сценариях, CSS, Embla Carousel. Два локальных семейства шрифтов — Oswald и Arimo.

## Запуск

Из этой папки:

```sh
npm run dev -- --background --host 127.0.0.1 --port 4322
npm run build
```

Управление сервером: `npm run astro -- dev status`, `npm run astro -- dev logs`, `npm run astro -- dev stop`.

## Где менять

- `src/pages/index.astro`: композиция страницы и metadata.
- `src/data/site.ts`: услуги, цены, FAQ, контакты, навигация и витрина ухода.
- `src/data/lookbook.json`: шесть снимков галереи и известные источники.
- `src/components/`: меню, услуги, галерея, уход, FAQ, контакты и demo-диалоги.
- `src/styles/approved-paper.css`: утверждённая основа первого экрана/услуг.
- `src/styles/paper.css`: общая тема и адаптивность остальных секций.
- `src/assets/fonts/`: локальные WOFF2 и OFL.
- `public/brand/`, `public/images/`: логотип, SVG и фотографии.

Стили прежней версии сохранены для истории, но `index.astro` подключает бумажную тему. Бронирование и подбор ухода демонстрационные: нет backend, оплаты или отправки персональных данных. Карта Google загружается по отдельному нажатию; координаты относятся к примеру, а не к реальному салону.

## Макеты и проверка

- [Figma desktop](https://www.figma.com/design/ANuoq1eztxc8nSw5VzJoSc?node-id=42-8)
- [Figma mobile](https://www.figma.com/design/ANuoq1eztxc8nSw5VzJoSc?node-id=42-211)
- [Отчёт проверки](../../docs/audit/kant-2026-10-23.md)
- [Медиа и лицензии](docs/MEDIA.md)

Для production используются `SITE_URL` и `SITE_BASE`; base должен включать путь сайта на GitHub Pages. Сайт намеренно имеет noindex/nofollow как demo-концепт. Перед публикацией требуется подтвердить происхождение первых трёх старых фотографий галереи. См. отчёт.
