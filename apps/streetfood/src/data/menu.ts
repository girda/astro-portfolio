const menuAssets = `${import.meta.env.BASE_URL}assets/menu/`;
export const categories=[
 {id:'all',name:'Alles',symbol:'🍽️'}, {id:'favorites',name:'Favoriten',symbol:'❤️'},
 {id:'burgers',name:'Burger',symbol:'🍔'}, {id:'breakfast',name:'Frühstück',symbol:'🍳'},
 {id:'bakery',name:'Backstube',symbol:'🥐'}, {id:'salads',name:'Bowls',symbol:'🥗'},
 {id:'sides',name:'Beilagen',symbol:'🍟'}, {id:'coffee',name:'Kaffee',symbol:'☕'},
];
const photos={burger:menuAssets+'chicken.webp',beef:menuAssets+'beef.webp',double:menuAssets+'double.webp',plate:menuAssets+'plate.webp',sweet:menuAssets+'sweet.webp',fries:menuAssets+'fries.webp',croissant:menuAssets+'croissant.webp',coffee:menuAssets+'coffee.webp'};
const rows=[
 ['chicken','Chicken & Cheddar','burgers',1190,'burger','Brioche, Hähnchen, Cheddar, Tomate, Gurke und BBQ-Sauce.','Weizen, Milch, Ei, Senf'],
 ['beef','Classic Beef Burger','burgers',1390,'beef','Rindfleisch, knackiger Salat, rote Zwiebel und Burgersauce.','Weizen, Milch, Ei, Senf'],
 ['double','Double Cheeseburger','burgers',1690,'double','Zwei Patties, doppelter Cheddar und Gewürzgurken im Brioche.','Weizen, Milch, Ei, Senf'],
 ['bbq','Smoky BBQ Burger','burgers',1490,'beef','Rindfleisch, BBQ-Sauce, Cheddar und Röstzwiebeln.','Weizen, Milch, Senf'],
 ['crispy','Crispy Chicken','burgers',1290,'burger','Knuspriges Hähnchen, Coleslaw und cremige Kräutersauce.','Weizen, Milch, Ei'],
 ['chili','Chili Cheese Burger','burgers',1390,'double','Rindfleisch, Cheddar und Jalapeños. Angenehm pikant.','Weizen, Milch, Ei'],
 ['breakfast','Herzhaftes Frühstück','breakfast',1090,'plate','Warme herzhafte Frühstücksidee mit Kartoffeln und Kräutern.','Milch, Ei'],
 ['brunch','Chicken Brunch','breakfast',1290,'plate','Hähnchen mit cremigem Kartoffelpüree und frischen Kräutern.','Milch, Weizen'],
 ['morning','Morning Plate','breakfast',990,'plate','Ein warmer Teller für einen entspannten Start.','Milch, Ei'],
 ['croissant','Buttercroissant','bakery',290,'croissant','Blättriges Buttergebäck mit goldener Kruste.','Weizen, Milch'],
 ['almond','Mandelcroissant','bakery',390,'croissant','Buttergebäck mit Mandelcreme.','Weizen, Milch, Ei, Mandeln'],
 ['bakery-set','Croissant & Kaffee','bakery',590,'croissant','Ein Buttercroissant mit einer Tasse Filterkaffee.','Weizen, Milch'],
 ['green','Green Lunch Bowl','salads',1090,'plate','Beispiel einer saisonalen Bowl; Rezeptur beim Betrieb erfragen.','Rezeptur noch offen'],
 ['chicken-bowl','Chicken Bowl','salads',1290,'plate','Warme Hähnchen-Bowl als Beispielgericht.','Milch, Senf'],
 ['sweet','Süßkartoffel-Pommes','sides',490,'sweet','Knusprige Süßkartoffelstreifen mit leichter Würzung.','Mögliche Kreuzkontakte erfragen'],
 ['fries','Pommes Frites','sides',390,'fries','Goldene Kartoffelpommes mit einer Prise Salz.','Mögliche Kreuzkontakte erfragen'],
 ['loaded','Loaded Fries','sides',690,'fries','Pommes mit Cheddarsauce und Frühlingszwiebeln.','Milch'],
 ['duo','Pommes-Duo','sides',790,'sweet','Kartoffel- und Süßkartoffelpommes zum Teilen.','Mögliche Kreuzkontakte erfragen'],
 ['cappuccino','Cappuccino','coffee',350,'coffee','Espresso mit fein aufgeschäumter Milch.','Milch'],
 ['latte','Iced Latte','coffee',420,'coffee','Espresso und Milch auf Eis.','Milch'],
 ['flat-white','Flat White','coffee',390,'coffee','Doppelter Espresso mit samtiger Milch.','Milch'],
 ['filter','Filterkaffee','coffee',280,'coffee','Frisch aufgebrühter Kaffee ohne Milch.','Keine Rezepturallergene vorgesehen'],
 ['oat','Oat Latte','coffee',440,'coffee','Espresso mit Haferdrink.','Hafer'],
 ['espresso','Espresso','coffee',240,'coffee','Klein, kräftig und aromatisch.','Keine Rezepturallergene vorgesehen'],
] as const;
export const products=rows.map(([id,name,category,price,image,description,allergens])=>({id,name,category,price,image:photos[image],description,allergens,time:category==='coffee'?5:category==='bakery'?3:15}));
export const extras=[{id:'cheddar',name:'Extra Cheddar',price:100},{id:'tomato',name:'Extra Tomate',price:60},{id:'sauce',name:'BBQ-Sauce',price:80}];
export const formatMoney=(cents:number)=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100);
