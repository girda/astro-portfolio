
import * as THREE from "three";
import { onPageReady } from "../../../../packages/ui/page-lifecycle";
  onPageReady(() => {
  const mount = document.getElementById("sculpture");
  const canvas = document.getElementById("sculpture-canvas") as HTMLCanvasElement | null;
  if (mount && canvas) {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    let visible = true;
    const events = new AbortController();
    let cleanup = () => { events.abort(); renderer?.dispose(); };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let renderer: THREE.WebGLRenderer | undefined;
    let raf = 0;
    let stopped = false;
    const pointer = new THREE.Vector2(0, 0);
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse, powerPreference: coarse ? "low-power" : "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.3 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
      camera.position.z = 7;
      const uniforms = {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2(0,0) },
        uScroll: { value: 0 }
      };
      const geometry = new THREE.IcosahedronGeometry(1.95, coarse ? 32 : 48);
      const material = new THREE.ShaderMaterial({
        uniforms, transparent: true,
        vertexShader: `
          uniform float uTime; uniform vec2 uPointer; uniform float uScroll;
          varying vec3 vNormal; varying vec3 vPosition;
          void main(){
            vec3 p=position;
            float wave=sin(p.x*2.8+uTime*.65)*sin(p.y*2.1-uTime*.47)*sin(p.z*2.4+uTime*.29);
            float ripple=sin(p.y*5.1+p.x*2.7+uTime*.5)*.08;
            p+=normal*(wave*.31+ripple);
            p.x+=sin(p.y*1.4+uTime*.23)*.12+uPointer.x*.08;
            p.y+=cos(p.x*1.2+uTime*.27)*.1-uScroll*.08;
            vNormal=normalize(normalMatrix*normal);
            vec4 mv=modelViewMatrix*vec4(p,1.0);
            vPosition=mv.xyz;
            gl_Position=projectionMatrix*mv;
          }`,
        fragmentShader: `
          precision highp float;
          varying vec3 vNormal; varying vec3 vPosition;
          uniform float uTime;
          void main(){
            vec3 n=normalize(vNormal);
            vec3 viewDir=normalize(-vPosition);
            float rim=pow(1.0-max(dot(n,viewDir),0.0),2.5);
            float flow=sin(n.x*8.0+n.y*4.0+uTime*.42);
            float sheen=smoothstep(-.25,.85,flow+rim*.95);
            vec3 base=mix(vec3(.018,.024,.052),vec3(.28,.13,.52),sheen);
            base=mix(base,vec3(.75,1.0,.47),pow(rim,2.0)*.85);
            base+=vec3(.38,.22,.7)*pow(max(dot(n,normalize(vec3(-.3,.85,1.0))),0.0),7.0);
            float light=.45+.55*max(dot(n,normalize(vec3(-.6,.8,1.0))),0.0);
            gl_FragColor=vec4(base*light+rim*vec3(.06,.15,.22),1.0);
          }`
      });
      const sculpture = new THREE.Mesh(geometry, material);
      sculpture.rotation.set(.2, -.3, .25);
      scene.add(sculpture);
      const resize = () => {
        if (!renderer) return;
        const rect = mount.getBoundingClientRect();
        const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
        camera.aspect = w/h; camera.updateProjectionMatrix();
        renderer.setSize(w,h,false);
        renderer.render(scene,camera);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(mount);
      resize();
      mount.classList.add("is-ready");
      const onPointer = (event: PointerEvent) => {
        if (coarse) return;
        pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
      };
      let scrollProgress = 0;
      const onScroll = () => { scrollProgress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight)); };
      window.addEventListener("pointermove", onPointer, { passive: true, signal: events.signal });
      window.addEventListener("scroll", onScroll, { passive: true, signal: events.signal });
      const timer = new THREE.Clock();
      const tick = () => {
        raf = 0;
        if (stopped || !renderer || !visible || document.hidden) return;
        const elapsed = reduced ? 0 : timer.getElapsedTime();
        uniforms.uTime.value = elapsed;
        uniforms.uPointer.value.lerp(pointer,.03);
        uniforms.uScroll.value += (scrollProgress - uniforms.uScroll.value)*.04;
        sculpture.rotation.y += (pointer.x*.27 + elapsed*.07 - sculpture.rotation.y)*.015;
        sculpture.rotation.x += (-pointer.y*.17 + .22 - sculpture.rotation.x)*.015;
        renderer.render(scene,camera);
        if (!reduced) raf=window.requestAnimationFrame(tick);
      };
      const pause = () => { cancelAnimationFrame(raf); raf = 0; };
      const resume = () => {
        if (!stopped && visible && !document.hidden && !raf) raf = requestAnimationFrame(tick);
      };
      const observer = new IntersectionObserver(entries => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) resume(); else pause();
      });
      observer.observe(mount);
      document.addEventListener("visibilitychange", () => document.hidden ? pause() : resume(), {signal: events.signal});
      motion.addEventListener("change", () => {
        reduced = motion.matches; pause(); resume();
      }, {signal: events.signal});
      // bfcache сохраняет сцену: при возвращении отрисовка должна возобновиться.
      window.addEventListener("pagehide", pause, {signal: events.signal});
      window.addEventListener("pageshow", resume, {signal: events.signal});
      cleanup = () => {
        stopped = true; pause(); events.abort(); ro.disconnect(); observer.disconnect();
        geometry.dispose(); material.dispose(); renderer?.dispose();
        mount.classList.remove("is-ready");
      };
      onScroll();
      tick();
    } catch(e) {
      console.warn("WebGL unavailable; showing visual fallback.",e);
      cleanup();
      mount.classList.remove("is-ready");
    }
    return cleanup;
  }

  });
