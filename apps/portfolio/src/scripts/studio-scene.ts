import * as T from 'three';

export function mountStudio(host: HTMLElement) {
 const root=host.closest<HTMLElement>('[data-studio]')!;
 const toggle=root.querySelector<HTMLButtonElement>('[data-scene-toggle]')!;
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width:760px)').matches?1:1.5));
 renderer.setClearColor(0,0);
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(36,1,.1,60);
 camera.position.set(4.2,3.2,6.7);camera.lookAt(0,1.15,0);
 const materials=new Map<number,T.MeshStandardMaterial>();
 const geometries:T.BufferGeometry[]=[];
 const mat=(color:number)=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.7}));return materials.get(color)!;};
 function mesh(geometry:T.BufferGeometry,color:number,parent:T.Object3D,x=0,y=0,z=0){
  geometries.push(geometry);const m=new T.Mesh(geometry,mat(color));m.position.set(x,y,z);parent.add(m);return m;
 }
 function box(w:number,h:number,d:number,c:number,p:T.Object3D,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),c,p,x,y,z);}
 function ball(w:number,h:number,d:number,c:number,p:T.Object3D,x=0,y=0,z=0){const m=mesh(new T.SphereGeometry(1,16,12),c,p,x,y,z);m.scale.set(w,h,d);return m;}
 function limb(a:T.Vector3,b:T.Vector3,r:number,c:number,p:T.Object3D){const m=mesh(new T.CylinderGeometry(r,r,a.distanceTo(b),10),c,p);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return m;}
 const oak=0x805e43,skin=0xc99776,shirt=0x536357,dark=0x262d2c;
 // Простая геометрия без текстур, теневых карт и внешних моделей.
 box(4.4,.16,2.1,oak,scene,0,.9,.25);
 for(const x of [-1.8,1.8])for(const z of [-.5,1])box(.1,.9,.1,dark,scene,x,.4,z);
 box(1,.9,.15,dark,scene,0,1.25,-.8);
 const person=new T.Group();scene.add(person);
 ball(.48,.62,.3,shirt,person,0,1.35,-.35);
 mesh(new T.CylinderGeometry(.13,.15,.23,12),skin,person,0,1.96,-.32);
 const head=new T.Group();head.position.set(0,2.27,-.3);person.add(head);
 ball(.31,.37,.29,skin,head);
 ball(.275,.17,.15,0x534037,head,0,-.19,.19);
 ball(.11,.09,.1,skin,head,0,-.07,.29);
 for(const x of [-.115,.115]){ball(.035,.023,.012,0x222525,head,x,.05,.274);ball(.045,.075,.045,skin,head,x<0?-.31:.31,0,0);}
 ball(.33,.19,.3,dark,head,0,.28,-.015);
 box(.5,.035,.35,dark,head,0,.22,.28);
 // Локти и кисти двигаются к клавиатуре, чашка закреплена на правой кисти.
 const leftHand=ball(.1,.07,.13,skin,person,-.32,1.07,.58);
 const rightHand=ball(.1,.07,.13,skin,person,.35,1.07,.58);
 const shoulderL=new T.Vector3(-.4,1.68,-.25),shoulderR=new T.Vector3(.4,1.68,-.25);
 const armL=limb(shoulderL,leftHand.position,.115,shirt,person);
 const armR=limb(shoulderR,rightHand.position,.115,shirt,person);
 const originalArmLength=shoulderR.distanceTo(rightHand.position);
 const laptop=new T.Group();laptop.position.set(0,1,.75);scene.add(laptop);
 box(1.08,.055,.7,0x777e7b,laptop);
 const screen=new T.Group();screen.position.set(0,.35,.25);screen.rotation.x=-.13;laptop.add(screen);
 box(1.08,.68,.045,0x828987,screen);
 box(.97,.57,.012,0x192f32,screen,0,0,-.029);
 for(let i=0;i<7;i++)box(.32+(i%3)*.14,.012,.008,i%2?0xb2c899:0xe6ad76,screen,-.12,.2-i*.058,-.04);
 for(let i=0;i<4;i++)for(let j=0;j<9;j++)box(.07,.009,.045,0x333c3b,laptop,-.39+j*.095,.034,-.16+i*.085);
 const cup=new T.Group();scene.add(cup);
 mesh(new T.CylinderGeometry(.12,.1,.23,16),0xe5d6bd,cup,0,.11,0);
 mesh(new T.CylinderGeometry(.105,.105,.008,16),0x34271f,cup,0,.23,0);
 const handle=mesh(new T.TorusGeometry(.085,.025,8,16),0xe5d6bd,cup,.13,.13,0);handle.rotation.y=Math.PI/2;
 const cupRest=new T.Vector3(.95,.99,.75);cup.position.copy(cupRest);
 // Лампа и растения задают знакомую тёплую палитру.
 mesh(new T.CylinderGeometry(.23,.25,.055,16),dark,scene,1.55,1,-.35);
 limb(new T.Vector3(1.55,1,-.35),new T.Vector3(1.55,2.35,-.35),.035,dark,scene);
 const shade=mesh(new T.ConeGeometry(.3,.35,16,1,true),0xc09261,scene,1.42,2.35,-.3);shade.rotation.z=-.3;
 for(let i=0;i<3;i++)box(.5,.07,.38,[0x9b927c,0x434f4b,0xbb885a][i],scene,-1.42,1.01+i*.08,.6);
 mesh(new T.CylinderGeometry(.18,.14,.28,12),0xa39175,scene,-1.7,1.1,-.35);
 for(let i=0;i<5;i++){const leaf=ball(.08,.3,.07,0x516449,scene,-1.7+Math.sin(i)*.13,1.42,-.35+Math.cos(i)*.12);leaf.rotation.z=Math.sin(i)*.55;}
 const cat=new T.Group();scene.add(cat);
 ball(.28,.16,.14,0xb98c62,cat,0,.18,0);
 ball(.15,.16,.14,0xc29a72,cat,.25,.29,0);
 for(const z of [-.085,.085]){
  mesh(new T.ConeGeometry(.065,.15,4),0xb98c62,cat,.25,.46,z);
  ball(.016,.022,.014,0x202725,cat,.37,.31,z);
 }
 const legs:T.Mesh[]=[];
 for(const x of [-.17,.17])for(const z of [-.08,.08])legs.push(mesh(new T.CylinderGeometry(.035,.028,.17,8),0xb98c62,cat,x,.075,z));
 const tail=mesh(new T.TorusGeometry(.18,.04,8,16,Math.PI*1.3),0xb98c62,cat,-.34,.25,0);tail.rotation.y=Math.PI/2;
 scene.add(new T.HemisphereLight(0xffead0,0x394a47,3));
 const key=new T.DirectionalLight(0xffc78d,3);key.position.set(1,5,4);scene.add(key);
 const rim=new T.DirectionalLight(0xb3cdc9,2);rim.position.set(-4,3,-2);scene.add(rim);
 let visible=true,paused=false,disposed=false,frame=0,last=0,time=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const smooth=(v:number)=>{v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
 function pose(t:number){
  const cycle=t%15;
  // Кофе — между шестой и десятой секундами; движение имеет плавные края.
  const drink=smooth((cycle-5.8)/1.1)*(1-smooth((cycle-8.5)/1.1));
  const handRest=new T.Vector3(.35,1.07,.58),handDrink=new T.Vector3(.25,2.07,.04);
  rightHand.position.copy(handRest).lerp(handDrink,drink);
  rightHand.position.y+=(1-drink)*Math.sin(t*13)*.022;
  leftHand.position.y=1.07+Math.sin(t*13+1)*.023;
  armR.position.copy(shoulderR).add(rightHand.position).multiplyScalar(.5);
  armR.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),rightHand.position.clone().sub(shoulderR).normalize());
  armR.scale.y=shoulderR.distanceTo(rightHand.position)/originalArmLength;
  armL.rotation.z=Math.sin(t*13)*.018;
  cup.position.copy(cupRest).lerp(new T.Vector3(.19,2.08,.18),drink);cup.rotation.z=drink*.32;
  head.rotation.x=.09-drink*.14;head.rotation.y=Math.sin(t*.6)*.025;
  // Кот: пробежка по столу → плечо → стол → уход. Пауза скрывает шов цикла.
  cat.visible=cycle>1&&cycle<13;
  let x=-2.8,y=.99,z=.7;
  if(cycle<3){x=T.MathUtils.lerp(-2.8,-.9,smooth((cycle-1)/2));}
  else if(cycle<4.3){const u=smooth((cycle-3)/1.3);x=T.MathUtils.lerp(-.9,-.38,u);y=T.MathUtils.lerp(.99,1.76,u)+Math.sin(u*Math.PI)*.55;z=T.MathUtils.lerp(.7,-.3,u);}
  else if(cycle<7){x=-.38;y=1.76;z=-.3;}
  else if(cycle<8.3){const u=smooth((cycle-7)/1.3);x=T.MathUtils.lerp(-.38,.9,u);y=T.MathUtils.lerp(1.76,.99,u)+Math.sin(u*Math.PI)*.45;z=T.MathUtils.lerp(-.3,.7,u);}
  else{x=T.MathUtils.lerp(.9,3,smooth((cycle-8.3)/3));}
  cat.position.set(x,y,z);legs.forEach((leg,i)=>leg.rotation.z=(cycle<3||cycle>8.3)?Math.sin(t*18+i*Math.PI)*.45:0);tail.rotation.z=Math.sin(t*3)*.12;
 }
 function draw(){pose(time);renderer.render(scene,camera);}
 function tick(now:number){
  frame=0;if(disposed||!visible||paused||document.hidden||reduce.matches)return;
  if(!last)last=now;
  if(now-last>=1000/30){time+=Math.min((now-last)/1000,.1);last=now;draw();}
  frame=requestAnimationFrame(tick);
 }
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(!disposed&&visible&&!paused&&!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);}
 const resize=()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();draw();};
 const ro=new ResizeObserver(resize);
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.08});
 const onToggle=()=>{paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?toggle.dataset.play!:toggle.dataset.pause!);toggle.textContent=paused?'▷':'Ⅱ';sync();};
 const onReduced=()=>{root.classList.toggle('scene-ready',!reduce.matches);host.hidden=reduce.matches;toggle.hidden=reduce.matches;sync();};
 const cleanup=()=>{if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',sync);reduce.removeEventListener('change',onReduced);toggle.removeEventListener('click',onToggle);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();root.classList.remove('scene-ready');toggle.hidden=true;};
 renderer.domElement.addEventListener('webglcontextlost',cleanup,{once:true});
 host.append(renderer.domElement);resize();root.classList.add('scene-ready');toggle.hidden=false;
 ro.observe(host);io.observe(host);toggle.addEventListener('click',onToggle);document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',onReduced);document.addEventListener('astro:before-swap',cleanup,{once:true});sync();
}
