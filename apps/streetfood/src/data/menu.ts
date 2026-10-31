import catalogue from './catalogue.json';
import {createMenuView} from './menu-view.mjs';
export {formatMoney} from './format-money';
// Адаптер сохраняет контракт существующего меню; CMS хранит categoryId.
export const {categories,products,extras}=createMenuView(catalogue,import.meta.env.BASE_URL);
export type MenuData={categories:typeof categories;products:typeof products;extras:typeof extras};
