// Идентификаторы стабильны: подписи и пиктограммы меняются независимо от данных блюда.
export const ALLERGENS = [
 ['gluten','Glutenhaltiges Getreide (z. B. Weizen)','M12 3v18M12 8C5 8 5 3 5 3s7 0 7 5Zm0 6C5 14 5 9 5 9s7 0 7 5Zm0-3c7 0 7-5 7-5s-7 0-7 5Zm0 6c7 0 7-5 7-5s-7 0-7 5Z'],
 ['crustaceans','Krebstiere (z. B. Garnelen)','M6 6c5-5 14 0 12 7-1 5-8 7-11 3L4 19l-2-4 4-1M8 6l1 5m3-5 1 6m3-4-1 5M6 6 3 3m4 2L6 1'],
 ['eggs','Eier','M12 3C7 3 4 12 4 15a8 8 0 0 0 16 0c0-3-3-12-8-12Z'],
 ['fish','Fisch','M3 12s5-7 11-5l7-3v16l-7-3C8 19 3 12 3 12Zm8-4v8M7 11h.01'],
 ['peanuts','Erdnüsse','M8 3c-5 0-6 7-2 9-4 3-2 9 3 9s5-6 7-8c5-4 2-10-2-10-3 0-3 3-6 0ZM8 7l8 10M6 14l5 4'],
 ['soy','Soja','M4 20C1 8 13 0 21 4c2 9-7 20-17 16Zm1-1L19 5M6 14l4 2m0-7 5 2'],
 ['milk','Milch (einschließlich Laktose)','M8 3h8v4l2 3v11H6V10l2-3V3Zm0 4h8M6 11h12M9 15h6'],
 ['nuts','Schalenfrüchte (Nüsse)','M12 3c-5 0-8 6-8 11a8 8 0 0 0 16 0c0-5-3-11-8-11Zm0 1v17M8 8l1 9m7-9-1 9'],
 ['celery','Sellerie','M9 21 7 10m5 11V9m3 12 2-11M7 10C0 10 2 2 7 5c3-5 7-1 5 4 6-7 12-2 5 1M6 21h12'],
 ['mustard','Senf','M12 3v18M12 8l-5-3m5 7 6-4m-6 9-5-3M6 4h1m11 3h1M6 13h1'],
 ['sesame','Sesam','M6 3c-4 3-3 7 0 7s4-4 0-7Zm10 1c-4 3-3 7 0 7s4-4 0-7ZM11 13c-4 3-3 7 0 7s4-4 0-7Z'],
 ['sulphites','Schwefeldioxid und Sulphite','M6 3h12l-2 9c-2 3-6 3-8 0L6 3Zm6 12v6m-4 0h8M7 7h10'],
 ['lupin','Lupinen','M12 21V8m0 5-6-2m6 6 6-2M12 8C4 8 4 0 9 3c3-5 8 1 3 5Zm0 0c7-5 11 2 5 4'],
 ['molluscs','Weichtiere','M3 17C-1 3 25 3 21 17l-9 5-9-5Zm9 5V6M7 8l5 14m5-14-5 14']
].map(([id,label,path])=>({id,label,path}));
export const DEFAULT_SETTINGS=Object.freeze({title:'FRISCH VOM GRILL.',subtitle:'Burger, Fries & gute Zeiten.',logo:'',menuMode:'informational'});
export const getMenuSettings=catalogue=>({...DEFAULT_SETTINGS,...catalogue.settings});
// Только перенос уже записанных сведений; по фото или названию аллергены не определяем.
export function legacyAllergenIds(text=''){
 const t=text.toLocaleLowerCase('de');return [
 ['gluten',/weizen|gluten|roggen|gerste/],['crustaceans',/garnel|krebstier/],['eggs',/\bei\b|eier/],['fish',/fisch/],['peanuts',/erdnuss/],['soy',/soja/],['milk',/milch|laktose/],['nuts',/mandel|haselnuss|walnuss|schalenfr/],['celery',/sellerie/],['mustard',/senf/],['sesame',/sesam/],['sulphites',/sulfit|schwefeldioxid/],['lupin',/lupin/],['molluscs',/weichtier/]
 ].filter(([,pattern])=>pattern.test(t)).map(([id])=>id);
}
export const productOptions=row=>({allergenIds:row.allergenIds??legacyAllergenIds(row.allergens),allergensVerified:row.allergensVerified??false,variants:row.variants??[]});

// Короткие подписи для посетителя; полные названия остаются в редакторе состава.
const allergenLooks={
 gluten:['Gluten','#d7a026','#fff1bc'],crustaceans:['Krebstiere','#dd795c','#ffe0ce'],
 eggs:['Eier','#d8a236','#fffdf3'],fish:['Fisch','#4f9bb9','#dff3fb'],
 peanuts:['Erdnüsse','#b67a45','#f6dfba'],soy:['Soja','#719d52','#e6f1d3'],
 milk:['Milch / Laktose','#78aac2','#edf8ff'],nuts:['Nüsse','#a9794c','#efddc9'],
 celery:['Sellerie','#77a461','#e9f3df'],mustard:['Senf','#c9a025','#fff0ac'],
 sesame:['Sesam','#c39a63','#f9ead5'],sulphites:['Sulphite','#9d78ad','#efe4f4'],
 lupin:['Lupinen','#9b82bc','#eee4f8'],molluscs:['Weichtiere','#b58caa','#f4e5ee']
};
for(const item of ALLERGENS){[item.shortLabel,item.color,item.softColor]=allergenLooks[item.id];}
export function allergenIconMarkup(item){
 const base=`<path d="${item.path}" fill="${item.softColor}" stroke="${item.color}"/>`;
 return base+(item.id==='eggs'?'<circle cx="12" cy="15" r="3.3" fill="#f3bd39" stroke="none"/>':'');
}
