export function sqliteBinding(sqlite){
 function prepare(sql,args=[]){return {sql,args,bind(...values){return prepare(sql,values)},async first(){return sqlite.prepare(sql).get(...args)??null},async all(){return {results:sqlite.prepare(sql).all(...args)}},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}}}};}
 return {prepare,async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const results=statements.map(({sql,args})=>({meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}}));sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
}
