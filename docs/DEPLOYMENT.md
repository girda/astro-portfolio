# Сборка, SEO и окружения

Обновлено23.10.2026. Студия остаётся Astro. Семь приложений собираются в единый Pages artifact текущим `scripts/build.mjs`; Pixel Worker публикуется отдельно. Хостинг/DNS в этом этапе не менялись.

## Текущий GitHub Pages

- `SITE_URL=https://girda.github.io` — только публичный HTTPS origin, без pathname.
- `PAGES_BASE=/astro-portfolio/` — база общего artifact. Сборщик задаёт SITE_BASE каждому приложению и сохраняет `/demos/<app>/`.
- `PUBLIC_ASSISTANT_API_URL` — публичный URL Worker из GitHub Actions variable; это не секрет OpenAI.
- Node24, установка зависимостей каждого сайта через npm ci.
- `npm test` → `npm run build` → `npm run check:seo`.
- Проверки охватывают URL, метаданные, sitemap, лабораторию и наличие шести demo links.

## Origin и base

`createSiteConfig` и SEO helpers не допускают localhost в canonical. В BaseLayout используется pathname текущей страницы, query/hash не входят в canonical. BASE_URL добавляется один раз. DE остаётся `/`, EN — `/en/`, legacy `/de/` redirect сохранён.

Sitemap генерируется из реально существующих локализованных routes в `src/config/site.ts`; лаборатория, redirect и demo не включены. При добавлении страницы её metadata и URL нужно проверить отдельно, а перевод регистрировать только после появления страницы.

## Preview и custom domain

```sh
SITE_URL=https://preview.example SITE_INDEXABLE=false npm run build --prefix apps/portfolio
```

Это пример конфигурации, не существующий домен. Preview не содержит индексируемых страниц в sitemap, BaseLayout выдаёт noindex. Это политика студии; standalone демосайты сейчас имеют собственные head и требуют своей staging policy. Noindex не защищает конфиденциальные данные: для закрытых материалов нужен доступ с авторизацией.

Для будущего root deployment указываются подтверждённый `SITE_URL` и `PAGES_BASE=/`. Домены и redirect сейчас не настраиваются. Helper-тесты проверяют и root, и subpath; полный output check запускается с теми же env, что и build:

```sh
SITE_URL=https://studio.example PAGES_BASE=/ npm run build
SITE_URL=https://studio.example PAGES_BASE=/ npm run check:seo
```

## Robots: важное ограничение Pages

Crawler читает `/robots.txt` у корня origin. Файл `/astro-portfolio/robots.txt` не управляет `girda.github.io`. Поэтому subpath-вариант содержит пояснение и Sitemap, без host-wide Allow/Disallow. Для размещения в корне генерируется полноценная группа правил. Индексация отдельных страниц управляется meta robots; не закрывать доступ crawler к странице, от которой ожидается чтение noindex.

Для preview на собственном root можно использовать noindex + crawler policy; это не инструмент гарантированного удаления уже индексированных URL. Search Console и управление host-root — отдельный этап после доступа/выбора домена.

## Секреты и backend

`OPENAI_API_KEY`, Turnstile secret и остальные server secrets не попадают в PUBLIC_* и frontend. Local n8n URL находится в игнорируемом `.env.local` и применяется только DEV. Переменная SITE_INDEXABLE не является секретом. API/n8n UI в SEO-этапе не изменены.

## Проверки и rollback

Перед публикацией: `npm test`, production build, `npm run check:seo`, визуальный smoke320/390/768/1440. lint/typecheck пока отдельная задача, не выдавать Astro build за их выполнение. Существующие незакоммиченные работы включать в release только после проверки diff; push автоматически запускает Pages deploy.

Источники: [Astro endpoints](https://docs.astro.build/en/guides/endpoints/), [Astro routing](https://docs.astro.build/en/guides/routing/), [Google robots location](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).
