# Проверка оформлений меню — 7 ноября 2026

Локальная CMS: http://127.0.0.1:8794, изолированная SQLite :memory:.

- Пройдено: Astro build всех трёх страниц, CMS tests 15/15, Worker dry-run (без публикации), git diff --check.
- Пройдено: браузерная эмуляция 320, 390, 768, 1440 px для трёх меню и галереи CMS; нет горизонтального переполнения.
- Пройдено: мобильный hero скрыт; корзина, категории, пустое избранное, продуктовый диалог и Escape на трёх оформлениях.
- Пройдено: выбор Pizzeria сохраняется после reload; все три снимка загружены.
- Пройдено: отдельный тест редактирует продукт в SQLite и проверяет актуальные экранированные данные во всех оформлениях.
- Снимки меню: apps/menu-cms/public/appearance-previews/.
- Не проверено: реальные iPhone/Android; сетевой вход и D1 после deploy; Lighthouse и полное соответствие WCAG.
- Не опубликовано: новая версия Worker. Выбор дизайна пока локальный для браузера, не настройка публикации.
- Для теста appearances.test.mjs предварительно требуется сборка apps/streetfood.

## Reference fidelity revision

Rebuilt Diner chalk texture, shield prices, stretchable illustrated active tab, uneven dividers, logo ornaments and burger contact shadow. Added transparent burger images and pizzeria pizza/botanical cutouts; retained live text and controls. Updated pizzeria oven/flame mark, paper texture, checker strip and dessert prompt. Mobile intentionally starts with categories, as requested, rather than reproducing the reference hero.

Shared demo seed now includes Pizza, Antipasti and Dolci (28 products total); existing persistent CMS databases are not reset or reseeded. New catalogue entries appear in fresh installations and the isolated review preview. Cloudflare publication and migration of existing D1 catalogue remain separate from this code revision.

Validation: Astro build; 15 CMS tests; browser checks of all three themes at 320, 390, 768, 1024 and 1440 px (no document overflow); categories, product dialog, cart addition and Escape. No broken sourced images. Local screenshots refreshed in CMS appearance gallery. Real-device testing not performed. The result follows the approved composition but is not claimed as a pixel-identical reproduction of the generated artwork.
