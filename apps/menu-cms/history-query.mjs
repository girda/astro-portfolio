// Один контракт фильтров для SQLite и D1. Имена SQL-полей выбираются только из белых списков.
export function historyQuery(input={}){
 const p={q:input.q||'',kind:input.kind||'',action:input.action||'',actor:input.actor||'',field:input.field||'',from:input.from||'',to:input.to||'',sort:input.sort||'newest',page:Number(input.page??1),pageSize:Number(input.pageSize??20),anchor:input.anchor===undefined?Number.MAX_SAFE_INTEGER:Number(input.anchor)};
 if([p.q,p.kind,p.action,p.actor,p.field,p.from,p.to,p.sort].some(v=>typeof v!=='string')||p.q.length>200||p.actor.length>100||!['','products','categories','settings'].includes(p.kind)||!['','create','update'].includes(p.action)||!['','price','available','active','categoryId','allergenIds','variants','showPrices','menuMode','title','name','image'].includes(p.field)||!['newest','oldest','name'].includes(p.sort)||!Number.isSafeInteger(p.page)||p.page<1||p.page>100000||![10,20,50].includes(p.pageSize)||!Number.isSafeInteger(p.anchor)||p.anchor<1)throw new Error('Некорректные фильтры истории.');
 for(const day of [p.from,p.to])if(day&&(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day))throw new Error('Некорректная дата истории.');
 if(p.from&&p.to&&p.from>p.to)throw new Error('Дата начала позже даты окончания.');
 return p;
}
export function historySql(p,cloud=false){
 const before=cloud?"json_extract(data,'$.before')":'before_data',after=cloud?"json_extract(data,'$.after')":'after_data';
 const kind=cloud?"json_extract(data,'$.kind')":'kind',action=cloud?"json_extract(data,'$.action')":'action',date=cloud?"json_extract(data,'$.createdAt')":'created_at',actor=cloud?"COALESCE(json_extract(data,'$.actor.name'),'Local CMS')":"'Local CMS'";
 const name=`COALESCE(json_extract(${after},'$.name'),json_extract(${after},'$.title'),'')`;
 const where=['revision <= ?'],params=[p.anchor];
 for(const [value,column]of [[p.kind,kind],[p.action,action]])if(value){where.push(column+' = ?');params.push(value);}
 if(p.from){where.push(date+' >= ?');params.push(p.from+'T00:00:00.000Z');}
 if(p.to){where.push(date+' < ?');params.push(new Date(Date.parse(p.to)+86400000).toISOString());}
 if(['локальная cms','lokale cms'].includes(p.actor.toLowerCase()))p.actor='Local CMS';
 if(p.actor){where.push(`instr(lower(${actor}),lower(?)) > 0`);params.push(p.actor);}
 if(p.q){where.push(`instr(lower(${name} || ' ' || COALESCE(json_extract(${before},'$.name'),json_extract(${before},'$.title'),'') || ' ' || COALESCE(json_extract(${after},'$.description'),'') || ' ' || ${actor} || ' ' || revision),lower(?)) > 0`);params.push(p.q);}
 if(p.field){where.push(`json_extract(${before},'$.${p.field}') IS NOT json_extract(${after},'$.${p.field}')`);}
 const order=p.sort==='oldest'?'revision ASC':p.sort==='name'?`${name} COLLATE NOCASE ASC, revision DESC`:'revision DESC';
 return {where:where.join(' AND '),params,order};
}
