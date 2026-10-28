# Street Food — собственные изображения меню

28.10.2026. Созданы встроенным imagegen, без внешнего API-ключа. Для демонстрации меню; не фотографии реальных блюд клиента. Существующая подпись приложения о примерных рецептурах и изображениях сохранена.

Локальные assets: apps/streetfood/public/assets/menu/. Восемь WebP, 960×640, quality 82, 35–90 КБ каждый, суммарно 554900 байт. В Figma загружены PNG-копии тех же изображений, поскольку WebP upload принимался сервером, но не отображался рендерером. PNG не добавлены в публичный frontend.

## Промпты
Общий запрос для beef/double/plate/sweet/fries/croissant/coffee:

Use case: product-mockup. Asset type: standalone website food-menu photograph. Photorealistic [SUBJECT]. Food fully visible centered with comfortable margins on a bright warm white tabletop, three-quarter close view slightly above, wide 3:2 composition, soft natural daylight, premium casual restaurant food photography, delicious believable food texture. No text, logo, watermark, people, hands, frames or collage. This is a single product image.

SUBJECT:
- beef: a classic beef cheeseburger with ONE thick grilled beef patty, cheddar, lettuce, sliced red onion, pickle, tomato, toasted sesame brioche
- double: a double cheeseburger with TWO clearly visible grilled beef patties, two layers of melted cheddar, pickles, onion, glossy sesame brioche
- plate: a white ceramic plate with tender grilled chicken cutlet, creamy mashed potatoes, a few fresh dill sprigs and light pan sauce
- sweet: a small white ceramic bowl filled with crispy orange sweet potato fries, with a small side ramekin of dip
- fries: a small white ceramic bowl filled with golden thin potato fries, lightly salted, with a small side ramekin of ketchup
- croissant: one golden flaky butter croissant, with visible delicate laminated layers, on a small plain white ceramic plate
- coffee: a white ceramic cup containing a cappuccino with beautiful simple leaf latte art, on a white saucer

Chicken prompt:
Use case: product-mockup. Asset type: website food menu product photograph. Create a photorealistic appetizing chicken cheddar burger: one golden brioche bun with sesame seeds, grilled chicken patty, melted cheddar, lettuce, tomato and pickle, light BBQ sauce, sitting on plain white parchment on a bright warm white tabletop. Three-quarter close view slightly above, burger fully visible in center with comfortable space around all edges, wide 3:2 composition. Soft daylight, natural rich food textures, premium casual restaurant menu photography. No text, logo, watermark, hands, utensils, frames or collage.

## Ограничения
Сохраняется прежнее соотношение: восемь изображений используются в 24 позициях. Это не отдельные точные фотографии каждой рецептуры. Перед реальными заказами нужны фотографии и составы конкретного заведения. Нет зависимости меню от khlebniy.com.ua или Unsplash.
