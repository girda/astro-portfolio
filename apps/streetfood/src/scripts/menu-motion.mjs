// Координаты привязаны к viewport: сначала подброс к центру, затем падение в корзину.
export function cartFlight(from,to,viewportHeight){
 const startX=from.left+from.width/2;
 const startY=Math.max(52,Math.min(viewportHeight-100,from.top+from.height/2));
 const x=to.left+to.width/2-startX,y=to.top+to.height/2-startY;
 const peak=Math.max(38,Math.min(startY,to.top)-105)-startY;
 return {left:startX-32,top:startY-32,keyframes:[
  {transform:'translate(0,0) scale(1)',opacity:1,easing:'cubic-bezier(.2,.65,.3,1)'},
  {transform:`translate(${x*.72}px,${peak}px) scale(.95)`,opacity:1,offset:.45},
  {transform:`translate(${x}px,${peak+12}px) scale(.8)`,opacity:1,offset:.62,easing:'cubic-bezier(.55,0,.85,.45)'},
  {transform:`translate(${x}px,${y}px) scale(.12)`,opacity:0}
 ]};
}
