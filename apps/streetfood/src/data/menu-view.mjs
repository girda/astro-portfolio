import { validateCatalogue } from './catalogue-contract.mjs';
export function createMenuView(catalogue, base='/') {
  validateCatalogue(catalogue);
  const categories=catalogue.categories.filter(c=>c.active).slice().sort((a,b)=>a.sortOrder-b.sortOrder);
  const visible=new Set(categories.map(c=>c.id));
  return {
    categories:[{id:'all',name:'Alles',symbol:'🍽️'},{id:'favorites',name:'Favoriten',symbol:'❤️'},...categories],
    products:catalogue.products.filter(p=>p.available&&visible.has(p.categoryId)).slice().sort((a,b)=>a.sortOrder-b.sortOrder)
      .map(({categoryId,image,...product})=>({...product,category:categoryId,image:`${base}assets/menu/${image}`})),
    extras:catalogue.extras,
  };
}
