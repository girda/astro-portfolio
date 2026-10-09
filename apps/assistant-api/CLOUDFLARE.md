# Сетевой тест HIRDA CAT

Worker: `hirda-cat-api`, URL `https://hirda-cat-api.hirda-assistant-api.workers.dev/api/chat`.
Сайт: `https://girda.github.io/astro-portfolio/`.

- Cloudflare Secrets: OPENAI_API_KEY и TEST_ACCESS_TOKEN; значения не коммитить.
- Код тестового доступа: локальный файл `.env.test-access` (исключён из Git). Вводится в диалоге браузера перед первой отправкой, хранится только в памяти вкладки.
- Для включения сетевого чата: GitHub repository variable PUBLIC_ASSISTANT_API_URL = URL Worker выше, затем повторная сборка Pages. Без переменной сайт остаётся демо.
- Backend обновляется отдельно: `npx wrangler deploy` из apps/assistant-api. Публикация Pages сама Worker не обновляет.
- Прайс берётся из ../portfolio/src/data/pricing.json. После изменения цен обновлять и сайт, и Worker.
- Лимит Cloudflare 20 запросов/мин на ключ в каждой локации; не является глобальным лимитом расходов. Доступ пока закрыт случайным кодом. Перед публичным доступом нужна отдельная защита от ботов и бюджетная политика.
- Логи/трейсы Cloudflare включены. Код не логирует тексты сообщений или секреты.
