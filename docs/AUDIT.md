# Аудит HIRDA Astro Portfolio

Дата: 23.10.2026. Репозиторий: `girda/astro-portfolio`, локальный каталог `/Users/artemgirda/Desktop/projects/astro-portfolio`. Последний локальный commit: `7565b82` (Lindenhof). Это обследование фактического рабочего дерева, а не только HEAD.

## Вывод

Рабочая основа есть: Astro, шесть демосайтов, статический сборщик, UI-пакет, отдельный Worker API и проверяемая интеграция n8n. Переписывать всё на Next.js не требуется. Основные пробелы — коммерческая структура сайта студии, SEO-покрытие, юридические/контактные страницы, воспроизводимость изменений и единый контракт контента/API. Новая версия KANT пока находится отдельно в дизайн-превью, а не в действующем Astro-приложении.

## 1. Методика и границы

- Прочитаны master brief, пользовательские инструкции, применимые инструкции приложений, manifests/lockfiles, роуты, сборка/CI, SEO layout, компоненты студии, API, n8n-клиент, общие UI, данные и стили демо.
- Собраны семь сайтов, проанализированы 22 HTML-страницы и локальные ссылки/ресурсы. У этих проверенных ссылок и ресурсов отсутствующих файлов не обнаружено. Не проверены все внешние ссылки и CSS URL.
- В браузере: студия 390×844 и 320×568, меню, Escape, Pixel без отправки платных запросов; шесть демо на 390 px. На проверенных ширинах горизонтального переполнения нет. На телефоне hero студии равен 100dvh; панель чата на 320×568 находится внутри viewport.
- Осмотрены мобильные первые экраны, а не каждый экран каждого сценария. Полный accessibility audit, реальный iPhone/Safari/виртуальная клавиатура, все формы и стабильность на всех браузерах ещё требуют отдельного QA.
- Lighthouse/DevTools tracing недоступны среди подключённых инструментов. Метрики LCP/CLS/INP и полевые CWV НЕ измерены. Анализ размеров файлов — не замена измерению скорости.
- Производственный Worker, Cloudflare secrets/billing, GitHub Actions history и Search Console в аккаунтах не проверялись. Реальные обращения к OpenAI не выполнялись.
- Значения секретов не выводились. Проверены имена env и игнорирование Git; поиск характерных OpenAI-ключей в отслеживаемых текстовых файлах текущего дерева совпадений не дал. Это не forensic-проверка всей Git-истории.

## 2. Инвентарь

| Часть | Фактическое состояние |
|---|---|
| Runtime | Node 24.21.0 в проверке; root engines >=24 |
| Сайты | Astro 7.3.5 в lockfiles семи собираемых приложений |
| Сборщик | `scripts/build.mjs`, последовательная сборка и копирование в root `dist` |
| Portfolio | `apps/portfolio`, DE `/`, EN `/en/`, `/de/` статический redirect, `/cat-lab/` |
| KANT | `apps/barbershop`, Embla 8.6, галерея, демо-запись, FAQ, контакты |
| KLAR | `apps/cleaning`, калькулятор уборки |
| WERKRAUM | `apps/autoservice`, DE/RU, сервисный запрос |
| STILL | `apps/nails`, 12 маршрутов: 4 страницы × DE/RU/EN |
| Lindenhof | `apps/lindenhof`, подбор/фильтрация авто, сравнение, демонстрационные сценарии, формы |
| Eichenhain | `apps/ecohomes`, дома/энергия, подбор, форма; пока untracked |
| Эксперимент | `apps/vyra` (Astro 7.3.8), не включён в root build; `cat-lab` — включён |
| Shared UI | `packages/ui`: Lucide SVG, DemoMenu, foundations, локальные DM Sans и лицензии; пока untracked |
| Pixel UI | `apps/portfolio/src/components/AIAssistantWidget.astro` (~57 KB исходника) |
| Local n8n | `src/scripts/pixel-n8n.ts`, 6 тестов, UUID/sessionStorage, timeout, object/array output |
| AI backend | `apps/assistant-api`: local Node HTTP + Cloudflare Worker; Responses API; model configurable |
| Деплой | GitHub Actions, Node 24, семь npm ci + root build + Pages artifact |
| Workspace | Нет root npm workspaces, pnpm workspace, Turborepo; у приложений отдельные lockfiles |

README перечисляет четыре демо и пять сайтов, фактическая сборка — шесть демо и студия. Root package имеет только `build`; lint/typecheck отсутствуют. Astro build генерирует типы, но это не полноценный typecheck исходников.

### Состояние Git и сохранность

Рабочее дерево содержит изменения workflow, API, Pixel, портфолио, демо и новые каталоги/ассеты. Не использовать `git reset/clean`, не заменять всё одним копированием. Сначала сверить diff и отделить исходники от экспериментов. Обнаружены `apps/barbershop/src/src`, вложенные package/config в `src`, `apps/portfolio/src/files`, `copy.py`, `edit.py`, `protected.json`, `render` и резервные копии. Они НЕ объявлены мусором: проверить импорты, назначение, владельца и историю перед отдельным архивированием.

Код источников в `packages/ui` сейчас не отслеживается, хотя импортируется демо. Слепой commit только файлов приложений может дать CI, который не воспроизводит локальный результат. Eichenhain и связанные previews/build workflow также нужно переносить согласованным набором.

## 3. Локальная и публичная версии

23.10.2026 опубликованная главная `https://girda.github.io/astro-portfolio/` содержит пять демо: barbershop, cleaning, autoservice, nails, lindenhof. В локальном каталоге проектов шесть, первым Lindenhof, затем Eichenhain. Это не одна и та же ревизия. Публичная главная отдаёт корректный canonical текущего URL; правовые ссылки отсутствуют. Публикация в аудите НЕ выполнялась.

## 4. Студия, компоненты и контент

Сохранить Astro layout, устройство карточек, бренд [H]IRDA, две языковые версии, изображения, Pixel, работающие URL и формы/сценарии демо. Не переименовывать `apps/portfolio` сейчас: имя папки не мешает продавать студию, а переименование затронет сборку и API imports.

Рефакторить постепенно:
- Позиционирование пока личное: «Deine Idee. Mein Code. Läuft.»; главная выводит проекты раньше коммерческого оффера. В ТЗ нужен понятный сайт услуг для малого немецкого бизнеса.
- Нет страниц услуг, отраслей, проектов с описанием задачи/решения, процесса, FAQ студии и отдельного контакта.
- `data/projects.ts` и `translations.ts` делят идентичность проекта и текст; карточки ищут проект по id без общей схемы. Лучше типизированный каталог с локализованным контентом и явным порядком.
- Стили hero/typography/rhythm/refinement наслаиваются глобальными селекторами. Свести к токенам и области компонента, сохраняя до/после screenshots.
- `config/site.ts` пуст; подходит для будущего единого источника origin/base/brand/indexability.
- Текущий прайс: 490/790/1290 и AI от790; ТЗ предлагает тестовые Starter590/Business990/Premium1490+. Это изменение коммерческого контента, а не техническая правка: оформить единым решением для сайта и знаний Pixel, не менять выборочно.

## 5. SEO — P0

| Наблюдение | Действие |
|---|---|
| У DE/EN главной есть title, description, canonical и OG/Twitter | Сохранить, сделать canonical от текущего route, а не только языка |
| BaseLayout строит canonical только `/` либо `/en/` | До добавления страниц передать pathname/explicit SEO props; иначе новые страницы канонизируются на главную |
| Sitemap XML и robots.txt не обнаружены в сборке | Sitemap только индексируемых страниц; robots под реальный origin и возможность управления корнем host |
| У студии нет hreflang | Связать DE/EN + x-default с правильным base |
| Нет JSON-LD | Добавить только проверенные Organization/ProfessionalService; без вымышленных отзывов и адреса |
| `/cat-lab/` не содержит noindex | Закрыть эксперимент от индексации, не включать в sitemap |
| KANT noindex, остальные демо не содержат явного noindex | Согласовать политику демо. Рекомендация: индексировать содержательные кейсы студии, демосалоны с вымышленными данными — noindex |
| `/de/` уже имеет noindex и redirect | Сохранить URL и redirect; на Pages это не полноценный HTTP 301 |
| Нет Impressum/Datenschutz, адреса/правовой формы и email в конфиге студии | Запросить подтверждённые данные для коммерческого запуска; не выдумывать |
| Нет отраслевых посадочных | Handwerker/Gastronomie с уникальным полезным содержанием, без массовой подстановки городов |

Локальная сборка выполнена без SITE_URL; поэтому canonical Lindenhof, зависящий от Astro.site, в ней отсутствует. Workflow задаёт SITE_URL, и это не доказательство отсутствия canonical в deployed Lindenhof. В CI нужно проверять обе конфигурации: root/custom domain и Pages base. Robots.txt в подпапке `/astro-portfolio/` не управляет корнем `girda.github.io`: управление host-root надо решать отдельно; noindex и sitemap не подменять robots-запретом обхода.

## 6. Mobile / UX / accessibility

Подтверждено: hero студии 390×844 имеет высоту844, ширина документа390; на320×568 ширина320. Чат на320: left11/right309/top16/bottom560, поле внутри панели. Меню открывается, Escape работает. Есть label полей, aria-live чата и статусы, reduced-motion в нескольких компонентах. Шесть демо не имеют горизонтального переполнения на390.

Проблемы/дальнейший QA: keyboard/focus при запуске чата из разных точек; экранная клавиатура и safe-area на реальном телефоне; меню на низком landscape; навигация/цены при увеличении текста200%; контраст медного текста/кнопок в состояниях; слишком длительная побуквенная анимация и видимость без JS; формы и сообщения об ошибках. Не объявлять существующие контраст/CLS багами без измерения.

У Eichenhain и STILL есть пустые img в скрытых диалогах до выбора. Автоматический naturalWidth-check их отмечает, но отсутствие src в таком placeholder само по себе не означает сломанную фотографию. Проверять после открытия конкретного диалога.

## 7. Производительность

Измеренные размеры на диске (НЕ transfer/CWV):
- hero `studio-sharp.png`: 1,809,687 bytes; mobile:1,792,374 bytes. Сейчас используются напрямую из public, без srcset по ширинам кроме выбора mobile/desktop.
- preview Eichenhain:1,775,086 bytes; KANT:1,407,533 bytes. Нужны WebP/AVIF и ограниченные размеры, сохраняя читаемость устройств.
- JS Pixel в сборке:19,003 bytes, gzip7,724. Размер исходника57KB — проблема поддержки, не57KB сетевого JS.
- Three.js chunk567,152 bytes, gzip140,519; build предупреждает >500KB. `BrandSculpture` использует dynamic import при IntersectionObserver; chunk НЕ подключён eager modulepreload на главной. Не удалять Three.js и не приписывать весь вес первому экрану без trace.
- public Lindenhof~50.97MB, в том числе видео15.83MB и несколько PNG2.3–2.7MB; public portfolio~19.48MB. Это объём deployment, не обязательная загрузка за посещение. Проверить использование/duplicates до очистки; видео — poster/preload/visibility policy.

Порядок: замер mobile production → hero/previews оптимизация → видео policy → проверка observer/dynamic imports. Lighthouse/CWV надо дополнить после выбора инструмента и реальной сетевой конфигурации; здесь оценки не выдумываются.

## 8. Pixel / backend / безопасность

Хорошая основа: OpenAI Responses endpoint вызывается server-side; ключ в Authorization upstream, `store:false`; validate входа/ролей/длины; лимит24KB; таймауты; Origin allowlist; rate limit10/60s; Turnstile Siteverify с hostname/action; persistent Durable Object budget200 запросов/день; no-store. CORS не является аутентификацией: его недостаточно без остальных мер.

Local n8n использует `PUBLIC_N8N_CHAT_URL` только при `import.meta.env.DEV`, отправляет `{action,sessionId,chatInput}`, поддерживает output объект/массив. `.env.local` игнорируется. Публичная сборка не использует локальный n8n. Локальная память и UI истории не равны серверному долговременному хранению.

Риски/границы:
- UI, состояния, сценарии, fallback-copy, transport и styling смешаны в одном большом Astro-компоненте. Выделить transport/state/scenarios/view без замены интерфейса.
- Знания API напрямую импортируют JSON/TS из `apps/portfolio`; значит backend не автономен при переносе/сборке. Выделить небольшой нейтральный content contract.
- Fallback-тексты виджета всё ещё говорят о четырёх проектах и старых тарифах; API читает реальный каталог, поэтому ответы могут расходиться между режимами.
- В конфиге Worker жёсткие origin/hostname и общий дневной счётчик для одного сайта. Это НЕ multi-tenant backend. Для клиентов сначала отдельные deployment/secrets, затем, при спросе, серверный tenant registry и отдельные бюджеты/знания/доступы.
- Лимит200 — число вызовов, не гарантированный денежный потолок; дополнительно контролировать модель, tokens, расход и alerting на стороне провайдера.
- Нет подтверждённого email/CRM lead endpoint. Контакт сейчас открывает WhatsApp с черновиком, посетитель отправляет сам; не выдавать за принятую заявку.
- Понятное уведомление до отправки переписки внешнему AI не найдено в просмотренной UI-разметке; определить UX/правовые тексты перед коммерческим запуском.
- Реальные интеграции n8n/CRM не объявлять существующими. Защита от prompt injection требует тестов, а не обещания абсолютной безопасности.

## 9. Деплой и коммерческое использование

CI сейчас делает только install/build/deploy; не запускает13 уже имеющихся тестов, lint/typecheck, link/SEO checks. Все семь сайтов публикуются единым artifact; ошибка любого демо блокирует весь релиз. Для10–20 production клиентов это плохая граница отказа. В workflow передаётся PUBLIC_ASSISTANT_API_URL из GitHub variable; её наличие/работоспособность на production не подтверждены в аудите.

GitHub Pages имеет ограничения для online business/коммерческих транзакций; это не платформа для клиентской SaaS/динамики. Существующие портфолио-демо не переносить внезапно. Для коммерческой студии обсудить свой домен и managed static hosting; Cloudflare Workers Static Assets — реалистичный кандидат, не утверждённая миграция. Vercel Hobby ограничен личным некоммерческим использованием. Тарифы/выбранные сервисы не изменялись.

## 10. Проверки и результаты

| Проверка | Результат |
|---|---|
| `npm run build` root | PASS, семь приложений,22 HTML, warning Three.js chunk |
| `npm test --prefix apps/assistant-api` | PASS7/7; первый sandbox-run не смог listen EPERM, повтор с доступом к временному порту PASS |
| `node --test apps/portfolio/tests/pixel-n8n.test.mjs` | PASS6/6 |
| Статические internal links/assets |0 отсутствующих файлов в проверенном наборе |
| Current tracked text OpenAI key pattern |0 совпадений; env values не раскрывались |
| lint/typecheck | Скрипты отсутствуют, НЕ пройдены |
| dependency advisories/latest versions | Не проверялись, обновления не выполнялись |
| Lighthouse / field CWV / deployed AI request | Не выполнялись |

## 11. Сохранить / рефакторить / разделить / отложить

- **Сохранить:** Astro, текущие маршруты/языки, демо, бренд/ассеты, Pixel/его UI, тесты, контакты и работающий Pages deployment до согласованного переноса.
- **Рефакторить:** SEO config/layout, каталог/цены, общие токены, объёмные UI-компоненты, CI и документацию.
- **Разделить:** deploy клиента/студии/экспериментов; Pixel UI/transport; backend knowledge и сайт; бизнес-контент и визуальную тему.
- **Отложить:** миграцию всего в Next.js, Turborepo, общий SaaS/admin, CMS для каждого лендинга, 3D-кота и production n8n на Mac.

## Источники, проверенные 23.10.2026

- [Astro: Pages deploy, site/base](https://docs.astro.build/en/guides/deploy/github/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: robots и отличие noindex](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [GitHub Pages usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Vercel Hobby](https://vercel.com/docs/plans/hobby)

Исходное ТЗ: `briefs/WEB_STUDIO_CODEX_HANDOFF_RU.md`. Не копировать личный профиль пользователя в публичный сайт.
