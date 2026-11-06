import {DatabaseSync} from 'node:sqlite';
import {readFileSync,writeFileSync} from 'node:fs';
import {validateCatalogue} from '../../streetfood/src/data/catalogue-contract.mjs';
const db=new DatabaseSync(new URL('../.local-data/menu.sqlite',import.meta.url).pathname,{readOnly:true});
db.exec('BEGIN');
try{
 const catalogue={schemaVersion:1,categories:db.prepare('SELECT data FROM categories').all().map(r=>JSON.parse(r.data)),products:db.prepare('SELECT data FROM products').all().map(r=>JSON.parse(r.data)),extras:JSON.parse(db.prepare("SELECT value FROM metadata WHERE key='extras'").get().value)};
 validateCatalogue(catalogue);
 const revision=Number(db.prepare("SELECT value FROM metadata WHERE key='revision'").get().value);
 const quote=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'";
 let sql=readFileSync(new URL('schema.sql',import.meta.url),'utf8')+'\n';
 // Только первичное заполнение. Повторный импорт должен завершиться ошибкой, а не затереть сетевые правки.
 sql+=`INSERT INTO catalogue_state VALUES (1,${revision},${quote(catalogue)});\n`;
 for(const row of db.prepare('SELECT * FROM history ORDER BY revision').all()){
  const event={revision:row.revision,kind:row.kind,entityId:row.entity_id,action:row.action,createdAt:row.created_at,before:row.before_data?JSON.parse(row.before_data):null,after:JSON.parse(row.after_data)};
  sql+=`INSERT INTO catalogue_history VALUES (${row.revision},${quote(event)});\n`;
 }
 db.exec('COMMIT');
 writeFileSync(new URL('../.local-data/cloud-import.sql',import.meta.url),sql,{mode:0o600});
 console.log(`Exported revision ${revision}: ${catalogue.categories.length} categories, ${catalogue.products.length} products.`);
}finally{db.close();}
