import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onPageReady } from '../../../../packages/ui/page-lifecycle';
import type { House } from '../data/catalogue';
import { emptyFilters, selectHouses } from '../data/catalogue';
gsap.registerPlugin(ScrollTrigger);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSite() {
  onPageReady(() => {
    const events = new AbortController();
    const options = { signal: events.signal };
    const houses: House[] = JSON.parse(document.getElementById('house-data')!.textContent!);
    const base = document.querySelector<HTMLAnchorElement>('.site-header .brand')!.getAttribute('href')!;
    const menus = [...document.querySelectorAll<HTMLDetailsElement>('.desktop-nav details')];
    const tweens = new Set<gsap.core.Tween>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const tween = (target: gsap.TweenTarget, vars: gsap.TweenVars) => {
      let result: gsap.core.Tween | undefined;
      result = gsap.to(target, { ...vars, duration: reduced() ? 0 : vars.duration, overwrite: true,
        onComplete: () => { if (result) tweens.delete(result); vars.onComplete?.(); },
      });
      if (result.progress() < 1) tweens.add(result);
      return result;
    };
    const toast = (message: string) => {
      const node = document.querySelector<HTMLElement>('[data-toast]')!;
      node.textContent = message; node.hidden = false;
      timers.forEach(clearTimeout); timers.clear();
      const timer = setTimeout(() => { node.hidden = true; timers.delete(timer); }, 3500);
      timers.add(timer);
    };
    const menu = document.querySelector<HTMLDialogElement>('#navigation-dialog')!;
    const menuTrigger = document.querySelector<HTMLButtonElement>('[data-open-menu]')!;
    let overflow = '';
    let closing = false;
    function openDialog(dialog: HTMLDialogElement) {
      if (dialog.open) return;
      if (!document.querySelector('dialog[open]')) overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    }
    function closeDialog(dialog: HTMLDialogElement) {
      if (!dialog.open || (dialog === menu && closing)) return;
      if (dialog === menu && !reduced()) {
        closing = true;
        tween(dialog, { xPercent: -100, duration: .28, ease: 'power2.out', onComplete: () => {
          dialog.close(); closing = false; gsap.set(dialog, { clearProps: 'transform' });
        } });
      } else dialog.close();
    }
    menuTrigger.addEventListener('click', () => {
      if (menu.open || closing) return;
      openDialog(menu); menuTrigger.setAttribute('aria-expanded', 'true');
      if (!reduced()) {
        gsap.set(menu, { xPercent: -100 });
        tween(menu, { xPercent: 0, duration: .32, ease: 'power2.out', clearProps: 'transform' });
      }
    }, options);
    document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
      dialog.addEventListener('close', () => {
        if (!document.querySelector('dialog[open]')) document.body.style.overflow = overflow;
        if (dialog === menu) menuTrigger.setAttribute('aria-expanded', 'false');
      }, options);
      dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); }, options);
      dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(dialog), options));
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
      }, options);
    });
    menu.querySelectorAll<HTMLAnchorElement>('a').forEach(link => link.addEventListener('click', event => {
      if (!link.hash || new URL(link.href).pathname !== location.pathname) return;
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      menu.close(); gsap.killTweensOf(menu); closing = false; gsap.set(menu, { clearProps: 'transform' });
      history.pushState(null, '', link.hash);
      target.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth' });
    }, options));
    const leaveTimers = new Map<HTMLDetailsElement, ReturnType<typeof setTimeout>>();
    menus.forEach(details => {
      details.addEventListener('pointerenter', () => {
        if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
        clearTimeout(leaveTimers.get(details));
        menus.forEach(other => { if (other !== details) other.open = false; });
        details.open = true;
      }, options);
      details.addEventListener('pointerleave', () => {
        leaveTimers.set(details, setTimeout(() => {
          if (!details.contains(document.activeElement)) details.open = false;
        }, 160));
      }, options);
      details.addEventListener('keydown', event => {
        if (event.key === 'Escape') { details.open = false; details.querySelector('summary')?.focus(); }
      }, options);
    });
    document.addEventListener('click', event => menus.forEach(details => {
      if (!details.contains(event.target as Node)) details.open = false;
    }), options);
    const header = document.querySelector('.site-header')!;
    const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 30);
    window.addEventListener('scroll', updateHeader, { ...options, passive: true }); updateHeader();

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
        if (element.getBoundingClientRect().top < innerHeight) return;
        gsap.fromTo(element, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .55, ease: 'power2.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: element, start: 'top 98%', once: true } });
      });
    });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
      if (event.matches) tweens.forEach(t => t.progress(1));
    }, options);
    function readSelection(key: string): string[] {
      try {
        const raw = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(raw) ? [...new Set(raw.filter(id => houses.some(h => h.id === id)))] : [];
      } catch { return []; }
    }
    let compared = readSelection('falkenried:compared').slice(0,3);
    let favorites = readSelection('falkenried:favorites');
    function syncSelection() {
      document.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach(b => b.setAttribute('aria-pressed', String(compared.includes(b.dataset.compare!))));
      document.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach(b => b.setAttribute('aria-pressed', String(favorites.includes(b.dataset.favorite!))));
      document.querySelectorAll<HTMLElement>('[data-compare-count]').forEach(node => { node.hidden = !compared.length; node.textContent = String(compared.length); });
      try { localStorage.setItem('falkenried:compared', JSON.stringify(compared)); localStorage.setItem('falkenried:favorites', JSON.stringify(favorites)); } catch { /* Выбор работает и без доступа к хранилищу. */ }
    }
    document.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.compare!;
      if (!compared.includes(id) && compared.length >= 3) { toast('Du kannst bis zu drei Häuser gleichzeitig vergleichen.'); return; }
      compared = compared.includes(id) ? compared.filter(value => value !== id) : [...compared, id];
      syncSelection(); toast(compared.includes(id) ? 'Haus zum Vergleich hinzugefügt.' : 'Haus aus dem Vergleich entfernt.');
    }, options));
    document.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.favorite!;
      favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id]; syncSelection();
    }, options)); syncSelection();
    const comparison = document.querySelector<HTMLDialogElement>('#compare-dialog')!;
    document.querySelector('[data-open-compare]')!.addEventListener('click', () => {
      const output = comparison.querySelector('[data-comparison-output]')!; output.replaceChildren();
      if (!compared.length) {
        const p = document.createElement('p'); p.textContent = 'Wähle im Katalog bis zu drei Häuser über das Vergleichssymbol aus.'; output.append(p);
        const link = document.createElement('a'); link.href = base+'katalog/'; link.className = 'button'; link.textContent = 'Häuser entdecken'; output.append(link);
      } else {
        const grid = document.createElement('div'); grid.className = 'comparison-grid'; grid.style.setProperty('--compare-columns', String(compared.length));
        for (const id of compared) {
          const house = houses.find(h => h.id === id)!;
          const article = document.createElement('article');
          const img = document.createElement('img'); img.src = base+'images/'+house.image+'.webp'; img.alt = house.name;
          const title = document.createElement('h3'); title.textContent = house.name;
          const dl = document.createElement('dl');
          for (const [label,value] of [['Wohnfläche',house.area+' m²'],['Geschosse',house.floors],['Schlafzimmer',house.bedrooms],['Bäder',house.bathrooms],['Bauweise',house.material],['Dach',house.roof]]) {
            const row = document.createElement('div'),dt = document.createElement('dt'),dd = document.createElement('dd');dt.textContent = String(label); dd.textContent = String(value);row.append(dt,dd);dl.append(row);
          }
          const link = document.createElement('a');link.href = base+'haeuser/'+id+'/';link.className = 'button';link.textContent = 'Haus ansehen';
          const remove = document.createElement('button');remove.type = 'button';remove.className = 'text-link';remove.textContent = 'Aus Vergleich entfernen';
          remove.addEventListener('click', () => { compared = compared.filter(value => value !== id); syncSelection(); comparison.close(); }, {once:true});
          article.append(img,title,dl,link,remove);grid.append(article);
        } output.append(grid);
      } openDialog(comparison);
    }, options);
    document.querySelectorAll<HTMLElement>('[data-carousel]').forEach(carousel => {
      const track=carousel.querySelector<HTMLElement>('[data-carousel-track]')!;
      const prev=carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]')!;
      const next=carousel.querySelector<HTMLButtonElement>('[data-carousel-next]')!;
      const sync=()=>{prev.disabled=track.scrollLeft<3;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3;};
      const move=(direction:number)=>track.scrollBy({left:direction*((track.firstElementChild?.getBoundingClientRect().width||track.clientWidth)+parseFloat(getComputedStyle(track).gap||'0')),behavior:reduced()?'instant':'smooth'});
      prev.addEventListener('click',()=>move(-1),options);next.addEventListener('click',()=>move(1),options);
      track.addEventListener('scroll',sync,{...options,passive:true});
      track.addEventListener('keydown',event=>{if(event.target!==track)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}},options);
      const observer=new ResizeObserver(sync);observer.observe(track);events.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});sync();
    });
    const consult = document.querySelector<HTMLDialogElement>('#consult-dialog')!;
    document.querySelectorAll<HTMLElement>('[data-consult]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.houseName) consult.querySelector<HTMLTextAreaElement>('textarea')!.value = `Ich interessiere mich für ${button.dataset.houseName}.`;
      openDialog(consult);
    }, options));
    document.querySelectorAll<HTMLFormElement>('.consult-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      const data = new FormData(form), review = document.createElement('div'); review.className = 'enquiry-review';review.setAttribute('role','status');
      const title = document.createElement('h3');title.textContent = 'Deine Anfrage ist vorbereitet.';review.append(title);
      for (const [name,label] of [['name','Name'],['contact','Kontakt'],['message','Deine Wünsche']]) { const p = document.createElement('p');p.textContent = `${label}: ${data.get(name) || 'Noch offen'}`;review.append(p); }
      const note = document.createElement('p');note.className = 'small muted';note.textContent = 'Lokale Demo: Deine Angaben wurden nicht versendet oder gespeichert.';
      const edit = document.createElement('button');edit.type='button';edit.className='button';edit.textContent='Angaben bearbeiten';edit.addEventListener('click',()=>{review.remove();form.hidden=false;form.querySelector<HTMLInputElement>('input')?.focus();},{once:true});
      review.append(note,edit);form.hidden=true;form.after(review);edit.focus();
    }, options));
    const quiz = document.querySelector<HTMLFormElement>('[data-quiz]');
    if (quiz) {
      let step = 0;
      const steps = [...quiz.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
      const back = quiz.querySelector<HTMLButtonElement>('[data-quiz-back]')!;
      const submit = quiz.querySelector<HTMLButtonElement>('[type=submit]')!;
      const result = quiz.querySelector<HTMLElement>('[data-quiz-result]')!;
      function displayStep() {
        steps.forEach((node,i) => node.hidden = i !== step);
        back.hidden = step === 0;
        quiz!.querySelector('[data-quiz-step]')!.textContent = `${step+1} / 4`;
        quiz!.querySelector<HTMLElement>('.quiz-progress i')!.style.width = `${(step+1)*25}%`;
        submit.textContent = step === 3 ? 'Hausideen entdecken' : 'Weiter';
      }
      back.addEventListener('click', () => { step = Math.max(0,step-1);displayStep(); }, options);
      quiz.addEventListener('submit', event => {
        event.preventDefault();
        if (step < 3) { step++;displayStep();return; }
        const data = new FormData(quiz), filters = emptyFilters();
        filters.materials = data.get('material') ? [String(data.get('material'))] : [];
        filters.floors = data.get('floors') ? [Number(data.get('floors'))] : [];
        [filters.min,filters.max] = data.get('size') === 'compact' ? [0,140] : data.get('size') === 'family' ? [140,200] : [200,400];
        const matches = selectHouses(houses,filters);
        const suggestions = matches.length ? matches : houses.filter(h => h.area >= filters.min && h.area <= filters.max).slice(0,2);
        steps.forEach(s => s.hidden=true);quiz.querySelector<HTMLElement>('.quiz-controls')!.hidden=true;result.hidden=false;result.replaceChildren();
        const title = document.createElement('h3');title.textContent = matches.length ? 'Diese Ideen passen zu deiner Auswahl.' : 'Ein erster Ausgangspunkt für dein Gespräch.';
        const message = document.createElement('p');message.textContent = (matches.length ? '' : 'Kein Entwurf erfüllt alle gewählten Kriterien. Diese Häuser passen zumindest zur gewünschten Größe. ') + (data.get('stage') === 'Grundstück vorhanden' ? 'Als Nächstes: Bebaubarkeit, Ausrichtung und Raumprogramm gemeinsam prüfen.' : data.get('stage') === 'Grundstückssuche' ? 'Als Nächstes: Anforderungen an Grundstück, Lage und Hausgröße festhalten.' : 'Als Nächstes: Wünsche sammeln und verschiedene Wohnkonzepte vergleichen.');
        result.append(title,message);
        for(const h of suggestions){const link=document.createElement('a');link.href=base+'haeuser/'+h.id+'/';link.textContent=`${h.name} · ${h.area} m² · ${h.material} →`;result.append(link);}
        const button=document.createElement('button');button.type='button';button.className='button';button.textContent='Mit diesen Wünschen weiter';button.addEventListener('click',()=>{consult.querySelector<HTMLTextAreaElement>('textarea')!.value=`Bauweise: ${data.get('material')||'Noch offen'}\nFläche: ${filters.min}–${filters.max} m²\nGeschosse: ${data.get('floors')||'Noch offen'}\nStand: ${data.get('stage')}`;openDialog(consult);},options);
        const reset=document.createElement('button');reset.type='button';reset.className='text-link';reset.textContent='Auswahl ändern';reset.addEventListener('click',()=>{result.hidden=true;quiz.querySelector<HTMLElement>('.quiz-controls')!.hidden=false;step=0;displayStep();},{once:true});result.append(button,reset);
      }, options);
    }
    const serviceImage = document.querySelector<HTMLImageElement>('.service-image img');
    let serviceVersion = 0;
    document.querySelectorAll<HTMLButtonElement>('[data-service]').forEach(button => button.addEventListener('click', async () => {
      const version = ++serviceVersion;
      document.querySelectorAll('[data-service]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const names = ['steinbach','auenblick','lichtung','hain','wiesenblick','tannengrund'];
      const src = base+'images/'+names[Number(button.dataset.service)]+'.webp';
      const preloaded = new Image();preloaded.src=src;try {await preloaded.decode();}catch{return;}
      if(events.signal.aborted||version!==serviceVersion||!serviceImage)return;
      serviceImage.src=src;serviceImage.alt=button.querySelector('strong')!.textContent!;
      document.querySelector('[data-service-caption]')!.textContent=button.querySelector('strong')!.textContent;
      if(!reduced()){gsap.set(serviceImage,{opacity:.6});tween(serviceImage,{opacity:1,duration:.3,clearProps:'opacity'});}
    }, options));
    document.querySelectorAll<HTMLButtonElement>('[data-open-plan]').forEach(button => button.addEventListener('click', () => {
      openDialog(document.querySelector<HTMLDialogElement>('#plan-dialog')!);
    }, options));
    document.querySelectorAll<HTMLButtonElement>('[data-floor]').forEach(button => button.addEventListener('click', () => {
      const root = button.closest<HTMLElement>('.living-plan')!;
      root.querySelectorAll('[data-floor]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      root.querySelectorAll<HTMLElement>('[data-plan-floor]').forEach(floor => floor.hidden = floor.dataset.planFloor !== button.dataset.floor);
    }, options));
    return () => {events.abort();media.revert();tweens.forEach(t=>t.kill());timers.forEach(clearTimeout);leaveTimers.forEach(clearTimeout);document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(d=>d.close());document.body.style.overflow=overflow;};
  });
}
