# Немецкие бренды, тексты и фото — 24.10.2026

Статус: готово локально, проверки выполнены. Push и публикация не поручались в этой задаче и не выполнялись. Исходные пользовательские эксперименты сохранены.

## Что изменено
- Постоянное правило в /Users/artemgirda/Desktop/CODEX/AGENTS.md: отдельный локальный коммит после каждой завершённой объёмной задачи; проверки перед коммитом. Push/merge/deploy требуют отдельного поручения.
- VOLTEX → Stromwerk; FIXORA → Hauswerk. ID electrical/homeservice, порты и URL сохранены. KANT, KLAR, STILL, WERKRAUM, Lindenhof, Eichenhain, Grünwerk уже имеют немецкое прочтение и оставлены.
- У всех девяти демосайтов уже были фирменные знаки. Старый F-знак домашнего сервиса заменён SVG-домом с H; favicon и Figma соответствуют новому бренду.
- На всех девяти демосайтах расширены описания услуг, процесса или выбора: предметная информация вместо дополнительных общих лозунгов. У Stromwerk/Hauswerk/Grünwerk добавлен практический вопрос FAQ.
- У STILL расширено описание концепции на DE/RU/EN; у WERKRAUM уточнены описания обслуживания на DE/RU. Дизайн, цены и сценарии форм сохранены.
- Видимые подписи о генерации убраны. Alt описывает содержание; demo-статус и ограничения форм сохраняются. Атрибуция стороннего видео Pexels в Lindenhof не удалена. Происхождение изображений остаётся в документации.
- Lindenhof: две новые фотографии с понятными подписями в блоке о салоне — консультация и передача ключей. Оптимизированный WebP: около 211/198 KB. Точные промпты и происхождение в [LINDENHOF_MEDIA.md](../LINDENHOF_MEDIA.md).
- В портфолио изменены только необходимые названия каталога и превью; основной текст/дизайн не менялся. Пересняты 27 responsive-превью. Часть идентичных изображений не образует Git diff.
- Источник знаний Pixel использует новые названия. Действующий n8n workflow и Cloudflare backend не публиковались.

## Figma
Тексты/логотип Hauswerk/фото Lindenhof обновлены в существующих редактируемых слоях, старые варианты сохранены. Исправлена высота контейнеров после расширения текста; декоративная молния Stromwerk возвращена в абсолютный слой поверх фото. Обновлены изображения внутри устройств портфолио. Это ручная синхронизация, не автоматический Code Connect.
- [Stromwerk](https://www.figma.com/design/rkbbos8jr7oDyruQNgOO84?node-id=7-9)
- [Hauswerk](https://www.figma.com/design/2xsABUq4i3VEt0ztd14G0q?node-id=5-9)
- [Grünwerk](https://www.figma.com/design/CegV9hg5zB9xeigKfQIhTA?node-id=5-9)
- [KLAR](https://www.figma.com/design/WZCmrvlXGupy2R1sUWBF21?node-id=10-71)
- [STILL](https://www.figma.com/design/f7Mt1Ko4MQOXOtV6K1NK9I?node-id=24-109)
- [WERKRAUM](https://www.figma.com/design/xopHlEHZND6dB6J9oYRZUR?node-id=10-75)
- [KANT](https://www.figma.com/design/ANuoq1eztxc8nSw5VzJoSc?node-id=42-8)
- [Eichenhain](https://www.figma.com/design/rFe5BO7jxtv9upJk9z35C5?node-id=4-2)
- [Lindenhof](https://www.figma.com/design/W1hr1gX3N9f9kOHab5SniS?node-id=4-302)
- [Портфолио](https://www.figma.com/design/WDIgPgIwZD1ypSXCHQYnIC?node-id=19-2)

## Проверки
- npm run build: 10 приложений завершены. Дополнительно сборка apps/portfolio после обновления превью — пройдена.
- npm test: 28/28.
- npm run check:seo: PASS.
- Браузерная эмуляция production dist: 9 сайтов × 320/390/768/1440 px = 36 случаев без горизонтального переполнения и pageerror.
- Новые вопросы FAQ и mobile menu Stromwerk/Hauswerk/Grünwerk: раскрытие, открытие, Escape и закрытие пройдены.
- 27 preview capture: 200, без видимых подписей о генерации. Все 9 сайтов имеют SVG/векторный знак.
- Два новых фото Lindenhof загружаются с naturalWidth 1672. На стабильном Node HTTP preview нет сетевых ошибок. Прежний Python HTTP preview давал случайные ERR_SOCKET_NOT_CONNECTED; итоговая проверка выполнена на Node-сервере, это не исправление кода сайта.
- Git diff --check пройден. .env, локальные заявки и пользовательские незавершённые файлы не включены.
- Реальный телефон, screen reader, Lighthouse и полный аудит доступности не выполнялись. Новые названия — названия демоконцептов, не результат проверки товарных знаков.

## Локально
Существующие порты: portfolio4321, KANT4322, KLAR4323, WERKRAUM4324, STILL4325, Lindenhof4326, Eichenhain4328, Stromwerk4329, Hauswerk4330, Grünwerk4331. При необходимости: npm run dev --prefix apps/<app> -- --background.

## Коммиты по завершённым частям
- c025506 — refactor(ui): simplify demo image captions without changing demo status
- fb4675b — Rename Voltex to Stromwerk and expand electrical service copy
- a6471fa — Rename Fixora to Hauswerk and add the house emblem
- 6b18028 — Expand Gruenwerk garden planning and service guidance
- 80e4e0d — Clarify Klar cleaning services and remove generation captions
- 4de1abc — Expand Still salon copy across languages and simplify image credits
- a8598bb — Clarify Werkraum maintenance and diagnostic services
- ffa1ea5 — Expand Kant haircut and grooming guidance
- ae2714a — Expand Eichenhain home planning and energy concept copy
- 2b8d236 — Add Lindenhof showroom photographs and ownership guidance

Обновление каталога, README, знаний Pixel и этого отчёта — отдельный завершающий коммит. Все коммиты пока локальные.
