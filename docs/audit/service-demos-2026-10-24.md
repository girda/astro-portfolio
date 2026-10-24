# Четыре сервисных сайта — проверка 24.10.2026

Статус: реализовано локально, передано Артёму на визуальную приёмку. Не опубликовано, commit/push не выполнялись. Проверено текущее рабочее дерево с существующими незакоммиченными изменениями.

## Что сделано

- KLAR: новый светлый дизайн по PureHaven; сохранены калькулятор, скидки, дополнительные услуги, диалог сводки. Фото команды на мобильном отделено от текста.
- VOLTEX: отдельная тёмная тема с жёлтыми акцентами, электрик, шесть услуг, этапы, FAQ, форма.
- FIXORA: светло-синяя тема, десять услуг, макеты телефонов с этапами, FAQ, форма.
- GRÜNWERK: природная зелёная тема, услуги, три оригинальных визуализации, фильтр идей, этапы, FAQ, форма.
- Новые проекты добавлены в общий каталог и DE/RU/EN-подписи, сборку и существующий CI. На страницах новых демо используется немецкий язык.
- Для четырёх карточек обновлены desktop/mobile/tablet превью. Lindenhof и Eichenhain остаются первыми.

## Код

- apps/cleaning/src/pages/index.astro, src/styles/purehaven.css, astro.config.mjs, public/images, favicon.svg.
- apps/electrical, apps/homeservice, apps/gardens — самостоятельные Astro-приложения с typed data/site.ts, public и package-lock.
- packages/ui/TradePage.astro, ServiceQuote.astro, ServiceBrand.astro, trade-types.ts, service-base.css, trade-themes.css, icons.json, fonts/oswald.ttf и лицензия.
- apps/portfolio/src/data/projects.ts, src/i18n/translations.ts, src/components/ProjectCard.astro, public/previews.
- scripts/build.mjs, scripts/check-seo.mjs, .github/workflows/deploy.yml.
- README и архитектура обновлены. Полный каталог файлов новых приложений находится в самих папках, исходники изображений/промпты — docs/SERVICE_DEMOS_MEDIA.md.

## Проверки

| Проверка | Результат |
|---|---|
| npm run build | Пройдено: портфолио + 9 демосайтов, 10 завершённых сборок |
| npm test | Пройдено: 28/28 существующих тестов |
| npm run check:seo | Пройдено: canonical/alternate/sitemap и все 9 адресов демо |
| 320, 390, 768, 1440 px, 4 страницы | Пройдено: нет горизонтального переполнения, битых фото и несуществующих якорей |
| Дополнительно превью 402×760, 820×1040, 1440×950 | Созданы, фото и шрифты загружены |
| Мобильные меню | Пройдено: открытие, Escape, закрытие; нативный modal dialog |
| FAQ | Пройдено: раскрытие на всех 4 страницах; стрелки, reduced-motion CSS |
| Калькулятор KLAR | Пройдено: изменение комнат, частоты, extra; сводка 3 комнаты / 1 ванная / еженедельно / духовка = 99,15 €; Escape закрывает диалог |
| Формы трёх новых демо | Пройдено: выбор услуги из карточки и локальная сводка; required-поля и pattern PLZ |
| Фильтр GRÜNWERK | Пройдено: растения — 1 карточка, террасы/дорожки — 2 |
| Карточки портфолио | 9 карточек, все 27 фотографий-превью доступны |
| Console и базовые доступные имена | При повторной загрузке 4 страниц нет console errors; нет безымянных кнопок, клавиатурный фокус виден |
| Production HTML | У всех 4 демо нет localhost-ссылок и Figma capture script; noindex,follow |
| Шрифты | DM Sans загружается локально, Oswald на VOLTEX. Исправлен Vite403 для packages/ui/fonts |
| Figma | Редактируемый текст/векторы/фото, desktop/mobile и локальные UI-компоненты/токены. Технические захваты трёх новых файлов удалены; предыдущие варианты KLAR сохранены |

Полноценные lint/typecheck не настроены — не заявляются. Lighthouse/CWV, реальный телефон, экранная клавиатура и screen reader не проверялись. Это браузерная эмуляция. Полный security-аудит не проводился.

## Figma и локальная проверка

| Проект | Адрес | Макет |
|---|---|---|
| KLAR | http://localhost:4323/ | https://www.figma.com/design/WZCmrvlXGupy2R1sUWBF21?node-id=10-71 |
| VOLTEX | http://localhost:4329/ | https://www.figma.com/design/rkbbos8jr7oDyruQNgOO84?node-id=7-9 |
| FIXORA | http://localhost:4330/ | https://www.figma.com/design/2xsABUq4i3VEt0ztd14G0q?node-id=5-9 |
| GRÜNWERK | http://localhost:4331/ | https://www.figma.com/design/CegV9hg5zB9xeigKfQIhTA?node-id=5-9 |

У каждого нового файла есть рядом мобильный фрейм и UI Kit. Новые файлы созданы в команде test — Pro по ответу Артёма. KLAR пересобран вручную из редактируемых компонентов; мелкие интервалы Figma могут отличаться от CSS. Сценарии проверяются в браузере, Figma не является действующим backend.

Перезапуск при необходимости: npm run dev --prefix apps/<app> -- --background. Порты заданы в package.json. Новые node_modules сейчас используют локальную ссылку на cleaning, это не часть пакета: в чистом клоне npm ci для каждого приложения; CI уже перечисляет новые приложения.

## Границы

Рейтинги, отзывы, стаж и результаты из чужих скриншотов не перенесены как реальные факты. Формы не отправляют данные, не принимают оплату и не бронируют время. Новые страницы noindex,follow. Pixel, его backend/n8n/SQLite и действующие workflow не изменялись этой задачей; знания действующего n8n отдельно не публиковались.
