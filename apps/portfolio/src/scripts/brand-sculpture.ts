import * as THREE from 'three';

export function mountSculpture(host: HTMLButtonElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 8;
  const group = new THREE.Group();
  scene.add(group);
  const amber = new THREE.MeshStandardMaterial({ color: 0xc78a59, metalness: .55, roughness: .4 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x616c69, metalness: .4, roughness: .55 });
  // Те же контуры, что в SVG: геометрия не зависит от загрузки шрифтов.
  const outlines = [
    [[10,24],[33,24],[33,34],[20,34],[20,94],[33,94],[33,104],[10,104]],
    [[95,24],[118,24],[118,104],[95,104],[95,94],[108,94],[108,34],[95,34]],
    [[43,34],[54,34],[54,58],[74,58],[74,34],[85,34],[85,94],[74,94],[74,69],[54,69],[54,94],[43,94]],
  ];
  const geometries: THREE.ExtrudeGeometry[] = [];
  outlines.forEach((points,index) => {
    const shape = new THREE.Shape();
    points.forEach(([x,y],i) => i ? shape.lineTo((x-64)*.035,(64-y)*.035) : shape.moveTo((x-64)*.035,(64-y)*.035));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1});
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry,index<2?amber:graphite);
    mesh.position.z=-.12; group.add(mesh);
  });
  scene.add(new THREE.HemisphereLight(0xffeee0,0x2b3535,2.5));
  const key = new THREE.DirectionalLight(0xffbf84,4); key.position.set(3,4,5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc6e0dc,3); rim.position.set(-4,1,2); scene.add(rim);
  group.rotation.set(-.1,-.22,0);
  let visible=true, disposed=false;
  // Нет постоянного цикла: рисуем лишь при взаимодействии и изменении размера.
  const render=()=>{if(visible&&!disposed&&!document.hidden)renderer.render(scene,camera);};
  const resize=()=>{
    const {width,height}=host.getBoundingClientRect();
    if(!width||!height)return;
    renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix(); render();
  };
  const resizeObserver=new ResizeObserver(resize);
  const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;render();});
  const onMove=(event:PointerEvent)=>{
    if(reduced.matches)return;
    const rect=host.getBoundingClientRect();
    group.rotation.y=(event.clientX-rect.left)/rect.width*.7-.35;
    group.rotation.x=((event.clientY-rect.top)/rect.height-.5)*.35;
    render();
  };
  const onClick=()=>{if(!reduced.matches){group.rotation.y=group.rotation.y>0?-.3:.3;render();}};
  const onLeave=()=>{group.rotation.set(-.1,-.22,0);render();};
  const onMotion=()=>{onLeave();};
  const cleanup=()=>{
    if(disposed)return; disposed=true;
    resizeObserver.disconnect(); visibilityObserver.disconnect();
    host.removeEventListener('pointermove',onMove);host.removeEventListener('pointerleave',onLeave);host.removeEventListener('click',onClick);
    document.removeEventListener('visibilitychange',render);reduced.removeEventListener('change',onMotion);
    geometries.forEach(g=>g.dispose());amber.dispose();graphite.dispose();renderer.dispose();
    renderer.domElement.remove();host.classList.remove('is-ready');
  };
  renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost',cleanup,{once:true});
  host.append(renderer.domElement);resize();host.classList.add('is-ready');
  resizeObserver.observe(host);visibilityObserver.observe(host);
  host.addEventListener('pointermove',onMove);host.addEventListener('pointerleave',onLeave);host.addEventListener('click',onClick);
  document.addEventListener('visibilitychange',render);reduced.addEventListener('change',onMotion);
  document.addEventListener('astro:before-swap',cleanup,{once:true});
}
