import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validateCatalogue } from '../streetfood/src/data/catalogue-contract.mjs';
const initialCatalogue = JSON.parse(readFileSync(new URL('../streetfood/src/data/catalogue.json',import.meta.url),'utf8'));
export const menuImages=Object.freeze([...new Set(initialCatalogue.products.map(p=>p.image))]);
export class CmsError extends Error {
  constructor(status, message) { super(message);this.status=status; }
}
export function createMenuStore(path, seed=initialCatalogue) {
  const db=new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS categories(id TEXT PRIMARY KEY, data TEXT NOT NULL CHECK(json_valid(data)));
    CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,data TEXT NOT NULL CHECK(json_valid(data)));
    CREATE INDEX IF NOT EXISTS products_category ON products(category_id);
    CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
  if(!db.prepare("SELECT value FROM metadata WHERE key='revision'").get()) {
    validateCatalogue(seed);db.exec('BEGIN IMMEDIATE');
    try {
      for(const row of seed.categories)db.prepare('INSERT INTO categories VALUES (?,?)').run(row.id,JSON.stringify(row));
      for(const row of seed.products)db.prepare('INSERT INTO products VALUES (?,?,?)').run(row.id,row.categoryId,JSON.stringify(row));
      db.prepare('INSERT INTO metadata VALUES (?,?)').run('extras',JSON.stringify(seed.extras));
      db.prepare('INSERT INTO metadata VALUES (?,?)').run('revision','1');db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');db.close();throw error;}
  }
  function read(){
    const catalogue={schemaVersion:1,categories:db.prepare('SELECT data FROM categories').all().map(r=>JSON.parse(r.data)),products:db.prepare('SELECT data FROM products').all().map(r=>JSON.parse(r.data)),extras:JSON.parse(db.prepare("SELECT value FROM metadata WHERE key='extras'").get().value)};
    for(const rows of [catalogue.categories,catalogue.products])rows.sort((a,b)=>a.sortOrder-b.sortOrder||a.id.localeCompare(b.id));
    return {catalogue,revision:Number(db.prepare("SELECT value FROM metadata WHERE key='revision'").get().value)};
  }
  function save(kind, body, {id,revision}={}){
    if(!body||typeof body!=='object'||Array.isArray(body))throw new CmsError(400,'Нужен объект данных.');
    if(!Number.isSafeInteger(revision))throw new CmsError(428,'Обнови данные перед сохранением.');
    if(kind==='products'&&!menuImages.includes(body.image))throw new CmsError(400,'Выбери фото из локальной библиотеки.');
    const key=kind==='categories'?'categories':'products';
    db.exec('BEGIN IMMEDIATE');
    try{
      const state=read();
      if(state.revision!==revision)throw new CmsError(409,'Данные изменились в другой вкладке. Обнови список перед сохранением.');
      if(id&&!state.catalogue[key].some(r=>r.id===id))throw new CmsError(404,'Запись не найдена.');
      const nextId=id||`${kind==='categories'?'category':'product'}-${randomUUID()}`;
      const fields=kind==='categories'?['name','symbol','sortOrder','active']:['name','categoryId','description','price','image','allergens','time','sortOrder','available'];
      const row={id:nextId,...Object.fromEntries(fields.map(k=>[k,body[k]]))};
      state.catalogue[key]=id?state.catalogue[key].map(r=>r.id===id?row:r):[...state.catalogue[key],row];
      try{validateCatalogue(state.catalogue);}catch(error){throw new CmsError(400,error.message);}
      if(kind==='categories')db.prepare('INSERT INTO categories VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(nextId,JSON.stringify(row));
      else db.prepare('INSERT INTO products VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET category_id=excluded.category_id,data=excluded.data').run(nextId,row.categoryId,JSON.stringify(row));
      db.prepare("UPDATE metadata SET value=? WHERE key='revision'").run(String(state.revision+1));db.exec('COMMIT');
      return read();
    }catch(error){db.exec('ROLLBACK');throw error;}
  }
  return {read,saveCategory:(body,options)=>save('categories',body,options),saveProduct:(body,options)=>save('products',body,options),close:()=>db.close()};
}
