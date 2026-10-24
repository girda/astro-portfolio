# Карта архитектуры HIRDA

Обновлено 24.10.2026 по рабочему дереву. **Сплошные связи ниже — текущая реализация; будущая архитектура вынесена отдельно.** Схемы не синхронизируются автоматически: обновляем при изменении модулей, маршрутов, API и деплоя. На GitHub Mermaid отображается диаграммой.

## 1. Как всё устроено сейчас

```mermaid
flowchart TD
  Repo["astro-portfolio: рабочее дерево; публикация отдельно"] --> Build["scripts/build.mjs"]
  Repo --> CI["CI: npm test, build, check:seo"]
  SEO["portfolio: config/site.ts и lib/seo.ts"] --> Studio
  SEO --> Endpoints["sitemap.xml и robots.txt"]
  Endpoints --> Output
  Build --> Studio["apps/portfolio: студия DE и EN"]
  Build --> Demos["9 демо: KANT, KLAR, WERKRAUM, STILL, Lindenhof, Eichenhain, VOLTEX, FIXORA, GRÜNWERK"]
  Studio --> Output["Общий статический dist"]
  Demos --> Output
  Output --> Pages["GitHub Pages: /astro-portfolio/"]
  UI["packages/ui: компоненты, SVG, стили"] --> Demos
  Repo --> Experiments["VYRA: вне общей сборки; cat-lab: маршрут студии"]
  Repo --> API["apps/assistant-api: отдельный Worker"]
  Studio --> Pixel["Интерфейс Pixel"]
  Pixel -->|"production API при настройке"| API
  Pixel -->|"только DEV"| N8n["Локальный n8n Chat Trigger"]
```

Локально собираются 10 сайтов (портфолио и 9 демо). Публичная версия отдельно; новые локальные изменения этой задачи не публиковались. Незакоммиченные файлы не означают, что они уже есть на GitHub/CI.

## 2. Карта существующих проектов

| Проект | Код | Данные/логика | Связь с сервером |
|---|---|---|---|
| HIRDA | `apps/portfolio` | `src/data`, `i18n`, config; секции в components | Pixel → API; контакт → подготовленный WhatsApp |
| KANT | `apps/barbershop` | `data/site.ts`, `contact.ts`; Embla/диалоги/FAQ | Демо, не настоящая запись |
| KLAR | `apps/cleaning` | `data/site.ts`, калькулятор | Демо |
| WERKRAUM | `apps/autoservice` | `data/site.ts`, DE/RU, ServicePage | Демо-запрос |
| STILL | `apps/nails` | локали и данные,4 страницы ×3 языка | Демо-запрос |
| Lindenhof | `apps/lindenhof` | авто в data, фильтры/сравнение в scripts | Демо, не реальный inventory API |
| Eichenhain | `apps/ecohomes` | подбор домов/энергии и формы | Демо |
| Pixel API | `apps/assistant-api` | validate, knowledge, scenarios, budget | OpenAI Responses, Turnstile, Durable Object |
| VOLTEX | `apps/electrical` | `data/site.ts`, TradePage, electrical theme | Локальная demo-сводка |
| FIXORA | `apps/homeservice` | `data/site.ts`, TradePage, homeservice theme | Локальная demo-сводка |
| GRÜNWERK | `apps/gardens` | `data/site.ts`, TradePage, фильтр идей | Локальная demo-сводка |
| Restaurant | Ещё нет отдельного app | Сценарий кафе в Pixel не является сайтом ресторана | Не реализовано |

## 3. Pixel: текущий публичный путь

```mermaid
sequenceDiagram
  participant Visitor as Посетитель
  participant Pixel as Pixel в браузере
  participant Guard as Turnstile
  participant Worker as Worker API
  participant Budget as Дневной счётчик
  participant OpenAI as OpenAI Responses
  Visitor->>Pixel: Отправляет вопрос
  Pixel->>Guard: Получает токен проверки
  Pixel->>Worker: POST /api/chat с вопросом и токеном
  Worker->>Worker: Origin, размер, формат и rate limit
  Worker->>Guard: Серверная проверка токена
  Worker->>Budget: Проверка и расход лимита
  Worker->>OpenAI: Запрос с ключом только на сервере
  OpenAI-->>Worker: Ответ
  Worker-->>Pixel: Проверенный JSON или безопасная ошибка
  Pixel-->>Visitor: Сообщение и доступные действия
```

Production-доступность конкретного Worker и secret-конфигурация в аудите не проверялись платным запросом. UI и backend существуют; это не гарантия доступности24/7. Общий бюджет — число запросов, не точный лимит евро.

В DEV может использоваться n8n вместо Worker: браузер отправляет `{ action: 'sendMessage', sessionId, chatInput }`; UUID хранится в sessionStorage. Окружения не должны смешиваться. Контактная форма пока открывает WhatsApp — не отправляет email.

## Локальные заявки Pixel — этап 24.10.2026

```mermaid
flowchart LR
  Chat["Pixel: консультация"] --> N8n["n8n: текстовый ответ"]
  Chat --> Card["Редактируемая карточка: слова посетителя"]
  Card -->|"Проверить поля"| Draft["Node localhost:8788: хеш + токен черновика"]
  Card -->|"Явное подтверждение"| Check["Проверка полей, сессии, токена, срока"]
  Check --> Tx["SQLite transaction + UNIQUE draft_id"]
  Tx --> DB[".local-data/pixel-leads.sqlite"]
  DB -->|"Реальный id или тот же id повтора"| Card
```

Сервис и форма реализованы и проверены локально. **24.10.2026 применён локальный Publish: прямой Save Lead у модели отключён; активный чат и сохранение id=3 проверены.** Старая таблица HIRDA Leads сохранена и не синхронизируется с новой SQLite. Production Worker не менялся. [Подробности и ограничения](audit/pixel-confirmation-2026-10-24.md).

## 4. Направление роста, согласованное пользователем

```mermaid
flowchart TD
  Shared["Версионированные UI, SEO, config и формы"] --> Studio["Студия: свой deploy"]
  Shared --> ClientA["Клиент A: свой repo, домен, deploy"]
  Shared --> ClientB["Клиент B: свой repo, домен, deploy"]
  ClientA -.->|"если нужно"| ApiA["API A: свои secrets, лимиты и знания"]
  ClientB -.->|"если нужно"| ApiB["API B: свои secrets, лимиты и знания"]
  ClientA -.->|"если редактор нужен клиенту"| CMSA["Изолированный CMS space A"]
  ClientB -.->|"если редактор нужен клиенту"| CMSB["Изолированный CMS space B"]
  ApiA -.-> Integrations["Email, CRM, OpenAI, n8n по задаче"]
  ApiB -.-> Integrations
```

Это целевая схема, ещё не текущая система. Сначала Astro и небольшие изменения, затем модули по потребности. Next.js — только для приложения, которому действительно нужны его server features. Не нужен общий монолит или обязательный VPS для20 статических сайтов.

## Что обновлять вместе со схемой

Добавление app → таблица проектов + build/deploy. Новая интеграция → API-схема + границы данных. Новый клиент → отдельный repo/deploy/access, не секреты в этой документации. Архитектурное решение → `ARCHITECTURE_PROPOSAL.md` либо отдельный ADR с датой и причиной.

## SEO-основа PR-01

Реализована локально23.10.2026: единые canonical и DE/EN alternate, noindex для cat-lab и preview, sitemap только для зарегистрированных страниц. При размещении в подкаталоге robots.txt не задаёт правила для всего чужого host; фактический noindex находится в HTML. Проверки добавлены в CI, но удалённый workflow не запускался — push не выполнялся. Инструкции: [DEPLOYMENT.md](DEPLOYMENT.md).

## Сервисные демо — 24.10.2026

`packages/ui/TradePage.astro` принимает типизированный `TradeSite`; данные бизнеса — `apps/<app>/src/data/site.ts`. `ServiceQuote.astro` управляет локальной формой. Общая база `service-base.css`, отраслевые темы `trade-themes.css`; они не импортируют прежний foundations.css, чтобы не перебивать согласованный дизайн. KLAR использует `purehaven.css` и сохранённый калькулятор. Цвета темы — CSS custom properties в одном месте. [QA и Figma](audit/service-demos-2026-10-24.md).
