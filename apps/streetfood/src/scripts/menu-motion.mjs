// Одна квадратичная кривая: непрерывная касательная от подброса до корзины.
export const CART_FLIGHT_DURATION=560;
export function cartFlight(from,to,viewportHeight){
 const startX=from.left+from.width/2;
 const startY=Math.max(52,Math.min(viewportHeight-100,from.top+from.height/2));
 const x=to.left+to.width/2-startX,y=to.top+to.height/2-startY;
 const controlX=x*.5;
 const controlY=Math.max(20,Math.min(startY,to.top)-150)-startY;
 const keyframes=Array.from({length:31},(_,i)=>{
  const t=i/30,u=1-t;
  const px=2*u*t*controlX+t*t*x,py=2*u*t*controlY+t*t*y;
  return {transform:`translate(${px}px,${py}px) scale(${1-.88*t*t})`,opacity:t>.85?(1-t)/.15:1,offset:t};
 });
 return {left:startX-32,top:startY-32,keyframes};
}
