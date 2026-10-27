export const MAX_QUANTITY=20;
export function normalizeCart(raw,products,extras){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const row of raw.slice(0,100)){
  if(!row||!products.some(p=>p.id===row.id))continue;
  const extraIds=Array.isArray(row.extras)?[...new Set(row.extras.filter(id=>extras.some(e=>e.id===id)))].sort():[];
  const note=typeof row.note==='string'?row.note.trim().slice(0,180):'';
  const quantity=Number.isInteger(row.quantity)?Math.max(1,Math.min(MAX_QUANTITY,row.quantity)):1;
  const key=JSON.stringify([row.id,extraIds,note]);
  const existing=result.find(item=>item.key===key);
  if(existing)existing.quantity=Math.min(MAX_QUANTITY,existing.quantity+quantity);
  else result.push({id:row.id,extras:extraIds,note,quantity,key});
 }
 return result;
}
export function unitPrice(line,products,extras){const product=products.find(p=>p.id===line.id);return product?product.price+line.extras.reduce((sum,id)=>sum+(extras.find(e=>e.id===id)?.price||0),0):0;}
export const cartTotal=(cart,products,extras)=>cart.reduce((sum,line)=>sum+unitPrice(line,products,extras)*line.quantity,0);
