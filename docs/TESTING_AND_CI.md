# Проверки и CI/CD

## Сейчас локально
- `npm test`: Node test runner, API и n8n helpers, заявки, SEO helpers, реестр сборки, фильтры домов и корзина Street Food. На27.10.2026:38тестов.
- `npm run build`: production-сборка13приложений, включая все страницы. Сборка не заменяет полный TypeScript typecheck.
- `npm run check:seo`: проверка готового HTML, canonical/base/robots и ссылок демосайтов.
- Браузерная проверка Playwright: действия, console/runtime errors,320/390/768/1024/1440px, снимки важных экранов. Это эмуляция, не реальные устройства.

## GitHub
Отложено по просьбе пользователя: черновик `docs/drafts/quality-workflow.yml.txt`, не подключён к GitHub Actions. Планируемые проверки pull request и ручной запуск, без публикации. Отчёт доступен в Actions → Quality report → Summary; текстовые логи скачиваются из artifact quality-report14дней. Скрипты сохраняют настоящий код возврата через pipefail.

`deploy.yml`: существующая цепочка при pushmain — тесты → сборка → SEO → GitHub Pages. Неуспешная проверка блокирует публикацию.

Для почтовых уведомлений об Actions можно использовать настройки уведомлений GitHub пользователя. Telegram требует согласованного канала, отдельного бота и GitHub Secrets; токен нельзя помещать в репозиторий. Внешняя отправка сейчас не настроена.

Новый workflow отложен: не находится в .github/workflows и не запустится при push.
