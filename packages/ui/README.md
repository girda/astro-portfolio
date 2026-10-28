# Общие UI-паттерны демосайтов

`Icon.astro` — исходные SVG Lucide из lucide-static 1.61.0 (ISC), без клиентского JavaScript. `icons.json` содержит только используемый набор. Профильные инструменты барбершопа остаются Tabler.

`foundations.css` — DM Sans, адаптивные поля контейнера 20–72 px, секционные интервалы 56–104 px, заголовки 32–52 px, контент 15–16 px, основные кнопки 48 px, единые поля и клавиатурный фокус. Стили ограничены `body[data-demo]` и не затрагивают Pixel или портфолио.

`DemoMenu.astro` — нативный dialog с Escape, фокусом, закрытием по ссылке и смене размера. Брендовые палитры и отдельные декоративные шрифты задаются в приложениях.

На каждом демосайте есть `src/styles/refinement.css`; старые данные, языки, калькуляторы и формы сохранены. Lindenhof остаётся исходным образцом композиции.


## Сервисные страницы — 24.10.2026

- `ServiceBrand.astro`: четыре SVG-знака.
- `TradePage.astro` + `trade-types.ts`: типизированные секции VOLTEX/FIXORA/GRÜNWERK, контент в app/data.
- `ServiceQuote.astro`: локальная demo-сводка, без сети/хранения.
- `service-base.css`: отдельная база, DM Sans и responsive-паттерны новых страниц.
- `trade-themes.css`: три палитры через custom properties, разные сетки и оформление.
- KLAR сохраняет калькулятор и собственную тему. Прежний foundations.css остаётся другим демо.
- Figma capture script загружается только в DEV при специальном figmacapture hash. В production его нет.

[Медиа и лицензии](../../docs/SERVICE_DEMOS_MEDIA.md).

## Bewegung und Menüs

SiteMotion.astro: IntersectionObserver/WAAPI für Sektionen, Hover für Karten/Bilder/Pfeile. Keine versteckten Inhalte ohne JavaScript; reduced motion cancelt Effekte. Vorhandene Reveal und Pixel werden nicht doppelt animiert.

demo-menu.css enthält nur das native mobile DemoMenu; service-base.css importiert es. STILL/WERKRAUM können es ohne die alte Designbasis nutzen.

## Мобильная лента до краёв экрана
`edge-carousel.css` + `data-edge-carousel` на существующей прокручиваемой ленте (или viewport Embla). Использовать внутри центрированного контейнера: на ширине до 700 px область обрезки расширяется до viewport, внутренние поля сохраняют выравнивание первого/последнего слайда. `--carousel-edge` задаёт snap-поле под конкретный контейнер. Карточки не превращаются в сетку; клавиатура, свайп, reduced motion и существующие кнопки сохраняются. Проверять first / middle / last, overflow страницы и повторять при resize. Не применять к обычным сеткам, modal и вертикальным спискам.
