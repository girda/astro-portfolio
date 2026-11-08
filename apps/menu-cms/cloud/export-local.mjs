import {DatabaseSync} from 'node:sqlite';
import {writeFileSync,chmodSync} from 'node:fs';
import {exportWorkspaceSql} from './export-sql.mjs';
const db=new DatabaseSync(new URL('../.local-data/menu.sqlite',import.meta.url).pathname,{readOnly:true});
try{
 db.exec('BEGIN');const sql=exportWorkspaceSql(db);db.exec('COMMIT');
 const target=new URL('../.local-data/cloud-import.sql',import.meta.url);writeFileSync(target,sql,{mode:0o600});chmodSync(target,0o600);
 console.log('Private restaurant export prepared for a NEW database. Do not import over an existing cloud database.');
}finally{db.close();}
