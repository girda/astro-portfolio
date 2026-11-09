# Сборка, SEO и окружения

Портфолио и демо собираются в один артефакт GitHub Pages. Pixel Worker публикуется отдельно.

## Конфигурация сборки

| Режим | `SITE_URL` | `PAGES_BASE` |
| --- | --- | --- |
| Project Pages | `https://girda.github.io` | `/astro-portfolio/` |
| Кастомный домен | `https://hirdalabs.de` | `/` |

Workflow получает origin и base из `actions/configure-pages`. Сборка и проверки используют одинаковые значения. При локальном запуске без переменных используются значения Project Pages. Сборщик передаёт каждому Astro-приложению свой `SITE_BASE`. Для портфолио он равен `PAGES_BASE`, для Street Food на новом домене он равен `/demos/streetfood/`. `SITE_URL` содержит только публичный HTTPS origin.

`PUBLIC_ASSISTANT_API_URL` берётся из переменных GitHub Actions. Зависимости устанавливаются через `scripts/install.mjs` под Node 24. Push в `main` запускает сборку и публикацию с текущими настройками Pages. [Configure Pages](https://github.com/actions/configure-pages/blob/v5/action.yml)

## Origin и base

`createSiteConfig` и SEO helpers не допускают localhost в canonical. В BaseLayout используется pathname текущей страницы, query/hash не входят в canonical. BASE_URL добавляется один раз. DE остаётся `/`, EN — `/en/`, legacy `/de/` redirect сохранён.

Sitemap генерируется из реально существующих локализованных routes в `src/config/site.ts`; лаборатория, redirect и demo не включены. При добавлении страницы её metadata и URL нужно проверить отдельно, а перевод регистрировать только после появления страницы.

## Проверка сборки для hirdalabs.de

```sh
export SITE_URL=https://hirdalabs.de PAGES_BASE=/
npm run build
npm test
npm run check:seo
npm run check:legal
npm run check:public
npm run check:media
```

Для проверки старого режима повтори команды с `SITE_URL=https://girda.github.io PAGES_BASE=/astro-portfolio/`. Для отдельного preview можно задать `SITE_INDEXABLE=false`. Политика preview распространяется на портфолио. Демо сохраняют собственные метаданные.

## Переключение после подтверждения DNS

1. Подготовь Pixel до смены адреса. Добавь `hirdalabs.de` в Hostname Management существующего виджета Turnstile, сохрани `girda.github.io` и опубликуй Worker с подготовленным списком origin. [Turnstile Hostname Management](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)
2. Подтверди владение доменом в GitHub. В `girda/astro-portfolio` выбери Settings → Pages → Custom domain и сохрани `hirdalabs.de`. Для публикации через Actions настройку домена хранит GitHub Pages. [Настройка домена GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
3. После отдельного подтверждения настрой DNS для apex-домена по инструкции GitHub. Когда проверка DNS и выпуск сертификата завершатся, включи Enforce HTTPS.
4. Запусти workflow **Publish portfolio and demos** через Run workflow. Проверь главную, языковые версии, вложенные демо, `/robots.txt`, `/sitemap.xml` и Pixel на новом адресе.

## Старые ссылки

До переключения прежний адрес обслуживает сборку Project Pages. После переключения проверь фактический ответ GitHub для старой главной и нескольких вложенных ссылок, например `/astro-portfolio/en/arbeiten/` и `/astro-portfolio/demos/streetfood/bunhafen/`. Сверь конечный адрес и HTTP-статус через `curl -IL`. Дополнительно проверь параметры и якоря в браузере.

Если GitHub направляет запросы на новый домен с сохранённым префиксом, добавь к новой сборке HTML-редиректы для существующих страниц под `/astro-portfolio/`. Например, `/astro-portfolio/demos/streetfood/bunhafen/` должен вести на `/demos/streetfood/bunhafen/`. Используй canonical на конечную страницу, запасную ссылку и сохраняй query и hash при браузерном переходе. Оставь эти URL за пределами sitemap. Если GitHub не пересылает вложенные запросы, проверь сохранение старого хоста в отдельной схеме размещения до переключения.

Для отката верни прежнюю настройку Pages и запусти workflow повторно, чтобы восстановить сборку с `/astro-portfolio/`.

## Robots: важное ограничение Pages

Crawler читает `/robots.txt` у корня origin. Файл `/astro-portfolio/robots.txt` не управляет `girda.github.io`. Поэтому subpath-вариант содержит пояснение и Sitemap, без host-wide Allow/Disallow. Для размещения в корне генерируется полноценная группа правил. Индексация отдельных страниц управляется meta robots; не закрывать доступ crawler к странице, от которой ожидается чтение noindex.

Для preview на собственном root можно использовать noindex + crawler policy; это не инструмент гарантированного удаления уже индексированных URL. Search Console и управление host-root — отдельный этап после доступа/выбора домена.

## Секреты и backend

`OPENAI_API_KEY`, Turnstile secret и остальные server secrets не попадают в PUBLIC_* и frontend. Local n8n URL находится в игнорируемом `.env.local` и применяется только DEV. Переменная SITE_INDEXABLE не является секретом. API/n8n UI в SEO-этапе не изменены.

## Проверки и rollback

Перед публикацией запусти production build, затем `npm test` и `npm run check:seo`. Тесты CMS используют собранный Street Food. Визуальная проверка охватывает 320, 390, 768 и 1440 px. lint/typecheck пока отдельная задача, не выдавать Astro build за их выполнение. Существующие незакоммиченные работы включать в release только после проверки diff; push автоматически запускает Pages deploy.

Источники: [Astro endpoints](https://docs.astro.build/en/guides/endpoints/), [Astro routing](https://docs.astro.build/en/guides/routing/), [Google robots location](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).
