# HIRDA CAT — Astro AI Widget (демо-версия)

## Что внутри

- `apps/portfolio/src/components/AIAssistantWidget.astro` — UI, стили и логика демо-чата.
- `apps/portfolio/public/ai/robot-cat.webp` — кот на прозрачном фоне (~70 КБ).
- `apps/portfolio/public/ai/face-{default,happy,curious,wink}.webp` — выражения лица для следующих анимаций.
- `INTEGRATION.patch` — пример изменения одного файла `PortfolioPage.astro`.

## Установка

1. Распакуй `hirda-ai-widget.zip` **в корень проекта** `astro-portfolio`, чтобы новые файлы легли в `apps/portfolio/`. Существующие файлы заменять не требуется.
2. Открой `apps/portfolio/src/components/PortfolioPage.astro`.
3. В самом начале блока `---` с импортами добавь:

```astro
import AIAssistantWidget from "./AIAssistantWidget.astro";
```

4. Внизу компонента, сразу после `<SiteFooter lang={lang} />` и до `</BaseLayout>`, добавь:

```astro
<AIAssistantWidget lang={lang} />
```

Получится:

```astro
  </main>
  <SiteFooter lang={lang} />
  <AIAssistantWidget lang={lang} />
</BaseLayout>
```

5. Из корня репозитория запусти:

```bash
npm ci --prefix apps/portfolio
npm run dev --prefix apps/portfolio
```

Открой локальный адрес из терминала (обычно http://localhost:4321/).

## Проверка

- Через ~3 секунды появляется подсказка.
- Кот плавно двигается (при настройке `prefers-reduced-motion` анимации отключены).
- Тап/клик по коту открывает чат.
- Кнопки «Проекты», «Цены», «Услуги», «Контакт» дают демо-ответы и переходы к соответствующим секциям.
- На мобильном чат занимает весь экран; можно закрыть крестиком и клавишей Esc.
- На англоязычной и русскоязычной версиях меняются тексты.
- **OpenAI API здесь не подключён**; это интерактивная демо-оболочка, которая не расходует баланс.

## Перед публикацией

В корне проекта можно собрать все демо и портфолио:

```bash
npm run build
```

После успешной проверки коммитить и публиковать через привычный GitHub Actions workflow.

## Следующий этап

Подключить отдельный защищённый серверный endpoint (Cloudflare Worker / Vercel), знания о проектах и услугах, лимиты запросов, защиту от спама и информирование посетителей об обработке данных. **Никогда не вставлять OpenAI API key в Astro-код страницы.**
