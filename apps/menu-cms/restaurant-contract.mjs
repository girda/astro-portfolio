import {CmsError} from './errors.mjs';
import {DEFAULT_SETTINGS} from '../streetfood/src/data/menu-options.mjs';
export const LEGACY_RESTAURANT_ID='internal-demo';
const RESERVED_SLUGS=new Set(['www','app','api','admin','cms','mail','status','support','preview','internal-demo','billing','static','assets','account','login','register']);
export function restaurantInput(body){
 if(!body||typeof body.name!=='string'||body.name.trim().length<2||body.name.trim().length>100||/[\x00-\x1f]/.test(body.name))throw new CmsError(400,'Название ресторана: от 2 до 100 символов.');
 if(typeof body.slug!=='string'||body.slug.length<3||body.slug.length>63||! /^(?:[a-z0-9]+-)*[a-z0-9]+$/.test(body.slug)||RESERVED_SLUGS.has(body.slug))throw new CmsError(400,'Адрес: 3–63 символа a–z, 0–9 и дефис, без дефиса по краям.');
 return {name:body.name.trim(),slug:body.slug};
}
export function emptyCatalogue(name){return {schemaVersion:1,categories:[],products:[],extras:[],settings:{...DEFAULT_SETTINGS,title:name.slice(0,80),subtitle:'Unsere Speisekarte'}};}
export function requireActive(user){if(user?.status!=='active')throw new CmsError(403,'Нет доступа к рабочему пространству.');}
