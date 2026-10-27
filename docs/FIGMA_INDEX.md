# Figma — навигация по макетам

Обновлено 27.10.2026. Структура: **01 — Screens**, **02 — UI Kit**, **99 — Archive** (если были прежние версии). Архив хранит старые варианты отдельно от рабочей области.

| Проект | Файл |
|---|---|
| Portfolio | https://www.figma.com/design/PuicLapgF9vnSyRn8xofU8 |
| Lindenhof | https://www.figma.com/design/W1hr1gX3N9f9kOHab5SniS |
| Eichenhain / Falkenried | https://www.figma.com/design/rFe5BO7jxtv9upJk9z35C5 |
| KANT | https://www.figma.com/design/ANuoq1eztxc8nSw5VzJoSc |
| KLAR | https://www.figma.com/design/WZCmrvlXGupy2R1sUWBF21 |
| WERKRAUM | https://www.figma.com/design/xopHlEHZND6dB6J9oYRZUR |
| STILL | https://www.figma.com/design/f7Mt1Ko4MQOXOtV6K1NK9I |
| STROMWERK | https://www.figma.com/design/rkbbos8jr7oDyruQNgOO84 |
| HAUSWERK | https://www.figma.com/design/2xsABUq4i3VEt0ztd14G0q |
| GRÜNWERK | https://www.figma.com/design/CegV9hg5zB9xeigKfQIhTA |
| Food — черновик | https://www.figma.com/design/NJ5DPxF2Ftw67mjtdKr8PF |

## Точное состояние
- В семи сервисных файлах существующие наборы вынесены на страницу UI Kit; старые варианты KANT, KLAR, WERKRAUM и STILL перенесены в Archive.
- В Lindenhof и файле домов созданы базовые переиспользуемые компоненты из существующих элементов. Это начальный набор, не полная библиотека всех состояний.
- В Portfolio страница Components переименована в UI Kit.
- В Food: локальные цветовые переменные, состояния основной кнопки, кнопка добавления, карточка блюда и редактируемый мобильный черновик категории кофе. Страница содержит WIP в названии: навигация и полный набор экранов ещё не перенесены. Технический захват удалён; слой интерфейса не является скриншотом.

## Осталось синхронизировать
- Финальная сверка остальных секций Eichenhain с актуальной вёрсткой.
- Финальная сверка реальных рамок устройств Portfolio с текущим CSS; число проектов и порядок синхронизированы.
- Немецкие страницы Khlibnyi; полный Street Food, категории и состояния корзины.
- Проверить все UI Kit визуально, дополнить недостающие состояния и привязки.

Захват Street Food не перенёс часть внешних фотографий. Не считать созданный черновик готовой копией сайта.

## Eichenhain — синхронизация 27.10
- Обновлён знак логотипа и основные CTA на существующих desktop/mobile экранах.
- Страница `03 — Eichenhain / Grundrisse` (39:2): редактируемые векторные планы двух этажей.
- Страница `04 — Eichenhain / Kontakt` (40:2): desktop 40:3, mobile 40:81, форма и карта демонстрационной точки Landshut. Карта — растровый снимок OSM; интерфейс и текст редактируемые.
- Контакты проверены визуально; карта не интерактивна в Figma, действующая карта находится на сайте.

## Falkenried и каталог Portfolio — 27.10
- Страница `05 — Falkenried / 3D-Raumidee` (44:2), desktop 44:3 / mobile 44:11: исходная 3D-иллюстрация и редактируемые тексты. Изображение показано целиком; это пример интерьера, не план конкретной модели дома.
- Portfolio: 12 карточек на desktop и mobile, порядок совпадает с `project-order.json`; немецкие названия, категории, описания и CTA синхронизированы.
- Добавлены Khlibnyi, Street Food, Stromwerk, Hauswerk, Grünwerk с отдельными превью трёх устройств. Размеры карточек одинаковы: desktop 592×648, mobile 354×465.
- Проверены визуально 3D-блок и новые карточки; технические слои загрузки превью удалены.
