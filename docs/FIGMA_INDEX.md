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
- В Food: отдельные Screens и UI Kit для Khlibnyi и Street Food; четыре страницы Khlibnyi в desktop/mobile, меню Street Food из 24 позиций и мобильные категории. Прототип Street Food содержит фиксированные состояния заказа и закреплённую корзину.

## Осталось синхронизировать
- Финальная сверка остальных секций Eichenhain с актуальной вёрсткой.
- Финальная сверка реальных рамок устройств Portfolio с текущим CSS; число проектов и порядок синхронизированы.
- Проверить все UI Kit визуально, дополнить недостающие состояния и привязки.

Первоначальный неполный захват Street Food исправлен 28.10: фотографии и полное меню перенесены; подробности — в разделах ниже.

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

## Street Food — состояния, 27.10
- Screens 5:23: Kaffee 5:24; детали Cappuccino 12:76; корзина 12:93; пустая корзина 12:115.
- Навигация дополнена SVG-иконками меню и поиска, восемью иконками категорий; карточки содержат время приготовления и избранное.
- Тексты и элементы управления редактируемые; иконки категорий — отдельные растровые изображения. Header, категории, карточка, детали и корзина проверены визуально.
- Полное меню из 24 позиций и desktop ещё не синхронизированы. Перенос оригинальных фото khlebniy.com.ua остановился на сетевом таймауте; пустые технические слои удалены.
- Анимации и действующая корзина находятся в коде; Figma содержит статические состояния.

## Khlibnyi — внутренние страницы, 28.10
- Страница UI Kit 21:16; Screens 21:17. Меню 23:16 / 25:267, история 25:676 / 25:786, контакты 25:895 / 25:1024.
- Созданы компоненты header/footer, продуктовой и информационной карточки, CTA Default/Hover с Label; цвета связаны с CSS-токенами, шрифты Manrope/Oswald сохранены.
- Внутренние страницы синхронизированы; главная Khlibnyi ещё не перенесена. [Проверки и ограничения](audit/khlibnyi-figma-2026-10-28.md).

## Street Food — полное меню и прототип, 28.10
- Фото перенесены: прежний сетевой блок обходится через полностью загруженные изображения в браузере. Пустых карточек в новых меню нет.
- 24 позиции в mobile 32:91 и desktop 32:464; категории и примеры выбора добавок/корзины синхронизированы.
- Страница `05 — Street Food / Prototype` (38:1333), старт 38:1334: категории, прокрутка, закреплённая корзина и фиксированный пример заказа 16,40 €.
- [Состав, проверки и ограничения](audit/streetfood-figma-2026-10-28.md).

## Khlibnyi — главная, 28.10
- Desktop 1512: 50:19; mobile 390: 50:498. История, меню и контакты остаются в той же странице Screens 21:17.
- Фото истории и кафе перенесены; компоненты header/footer и карточек добавлены в UI Kit. Все восемь экранов Khlibnyi доступны для редактирования.
- [Проверки и уборка](audit/khlibnyi-home-figma-2026-10-28.md).

## Portfolio и Falkenried — 28.10, каталог и единые карточки
- Portfolio: [каталог desktop](https://www.figma.com/design/PuicLapgF9vnSyRn8xofU8?node-id=41-3052), [mobile](https://www.figma.com/design/PuicLapgF9vnSyRn8xofU8?node-id=41-3236), рядом вторые страницы с переходами. Главная — 6 проектов, новые фильтры, Pixel и редакция текстов; состояния управления в UI Kit.
- Falkenried: единый HouseCard 55:26, 30 экземпляров на актуальных экранах; [план desktop](https://www.figma.com/design/rFe5BO7jxtv9upJk9z35C5?node-id=57-1202), [mobile](https://www.figma.com/design/rFe5BO7jxtv9upJk9z35C5?node-id=57-1345), состояния модального окна 3D.
- Отчёты: `audit/portfolio-catalogue-2026-10-28.md`, `audit/falkenried-cards-plan-2026-10-28.md`. Рамки устройств старых Figma-карточек Portfolio остаются отдельным пунктом сверки.
