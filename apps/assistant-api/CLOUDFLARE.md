# Pixel: публичный чат

Worker: `hirda-cat-api`, endpoint: `https://hirda-cat-api.hirda-assistant-api.workers.dev/api/chat`.
Сайт: `https://girda.github.io/astro-portfolio/`.

- Секреты Cloudflare: `OPENAI_API_KEY`, `TURNSTILE_SECRET`. Значения никогда не добавлять в Git.
- Публичный sitekey: `0x4AAAAAAFS3zEwm2KejbU1v`. Виджет Managed, action `pixel_chat`.
- Worker требует успешный Siteverify с точными hostname `girda.github.io` и action `pixel_chat`. Локальные hostname в production не допускаются.
- Токен одноразовый: после каждой попытки отправки виджет сбрасывается. При ошибке проверки запрос к OpenAI не выполняется.
- Старый `TEST_ACCESS_TOKEN` больше не используется и не даёт доступа. Пароль в браузере не запрашивается.
- Лимит IP: 10 попыток в минуту в каждой локации Cloudflare. Это не глобальный лимит.
- Общий лимит сайта: 200 допущенных обращений к OpenAI в день UTC, включая завершившиеся ошибкой. Durable Object хранит только дату и счётчик. Лимит не равен фиксированной сумме в евро; размер истории и ответа также ограничен кодом.
- При недоступности проверки или счётчика Worker отказывает в запросе.
- `PUBLIC_ASSISTANT_API_URL` в GitHub repository variables задаёт endpoint при сборке Pages.
- Backend публикуется отдельно от Pages через Wrangler. Изменение прайса требует обновления обеих частей.
- Локальный Node-сервер доступен только по loopback и сохраняет свои ограничения; production-проверка Turnstile выполняется в Worker.
