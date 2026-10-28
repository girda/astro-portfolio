import {onPageReady} from '../../../../packages/ui/page-lifecycle';
import {vehicles} from '../data/site';
import {comparisonIds, toggleCompared, MAX_COMPARED_VEHICLES} from '../data/comparison';

export function initVehicleComparison() {
  onPageReady(() => {
    const bar = document.querySelector<HTMLElement>('[data-vehicle-comparison]');
    const dialog = document.querySelector<HTMLDialogElement>('#vehicle-comparison-dialog');
    if (!bar || !dialog) return;
    const events = new AbortController();
    const options = {signal: events.signal};
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-vehicle-compare]')];
    const output = dialog.querySelector<HTMLElement>('[data-vehicle-compare-output]')!;
    const status = bar.querySelector<HTMLElement>('[data-vehicle-compare-status]')!;
    const label = bar.querySelector<HTMLElement>('[data-vehicle-compare-label]')!;
    const help = dialog.querySelector<HTMLElement>('[data-vehicle-compare-help]')!;
    const opener = bar.querySelector<HTMLButtonElement>('[data-vehicle-compare-open]')!;
    const storageKey = 'lindenhof:comparison';
    let selected: string[] = [];
    try {selected = comparisonIds(JSON.parse(sessionStorage.getItem(storageKey) || '[]'));} catch { /* Недоступное хранилище не мешает выбору. */ }
    let oldOverflow = '';
    let returnFocus: HTMLElement = opener;
    function close() {if (dialog!.open) dialog!.close();}
    function sync(message?: string) {
      bar!.hidden = selected.length === 0;
      status.textContent = message ?? (selected.length === 1 ? 'Ein Modell ausgewählt. Ergänze ein zweites zum Vergleich.' : `${selected.length} Modelle ausgewählt.`);
      label.textContent = `Vergleichen (${selected.length}/${MAX_COMPARED_VEHICLES})`;
      buttons.forEach(button => button.setAttribute('aria-pressed',String(selected.includes(button.dataset.vehicleCompare!))));
      try {sessionStorage.setItem(storageKey,JSON.stringify(selected));} catch { /* Выбор остаётся доступен в текущей вкладке. */ }
    }
    function render() {
      output.replaceChildren();
      output.style.setProperty('--vehicle-compare-count', String(selected.length));
      help.textContent = selected.length < 2 ? 'Füge über die Waage in den Fahrzeugkarten ein weiteres Modell hinzu.' : 'Die Angaben dienen der Orientierung. Verfügbarkeit und verbindliche Details bestätigt das Autohaus.';
      for (const id of selected) {
        const vehicle = vehicles.find(item => item.id === id)!;
        const article = document.createElement('article');
        const image = document.createElement('img'); image.src = `${bar!.dataset.base}assets/${vehicle.image}`; image.alt = vehicle.name; image.width = 464; image.height = 310;
        const title = document.createElement('h3'); title.textContent = vehicle.name;
        const facts = document.createElement('dl');
        for (const [heading,value] of [['Marke',vehicle.brand],['Karosserie',vehicle.features[0][1]],['Platzangebot',vehicle.features[1][1]],['Charakter',vehicle.description]]) {
          const row = document.createElement('div'), term = document.createElement('dt'), definition = document.createElement('dd'); term.textContent = heading; definition.textContent = value; row.append(term,definition); facts.append(row);
        }
        const actions = document.createElement('div'); actions.className = 'vehicle-compare-actions';
        const detail = document.createElement('a'); detail.className = 'button secondary'; detail.href = `${bar!.dataset.base}fahrzeuge/${id}/`; detail.textContent = 'Modell entdecken';
        const request = document.createElement('a'); request.className = 'button'; request.href = '#kontakt'; request.textContent = 'Probefahrt anfragen';
        request.addEventListener('click',event => {
          event.preventDefault(); const input = document.querySelector<HTMLInputElement>('#test-drive-form [name=vehicle]'); if(input) input.value = vehicle.name;
          returnFocus = input ?? opener; close(); document.getElementById('kontakt')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'});
        },options);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'text-link'; remove.textContent = 'Aus Vergleich entfernen'; remove.setAttribute('aria-label',`${vehicle.name} aus Vergleich entfernen`);
        remove.addEventListener('click',() => {selected = selected.filter(value => value !== id);sync();if(!selected.length){close();buttons.find(button=>button.dataset.vehicleCompare===id)?.focus();}else{render();output.querySelector<HTMLElement>('button')?.focus();}},options);
        actions.append(detail,request,remove);article.append(image,title,facts,actions);output.append(article);
      }
    }
    buttons.forEach(button => button.addEventListener('click',() => {
      const next = toggleCompared(selected,button.dataset.vehicleCompare!);selected = next.ids;
      sync(next.limited ? `Bis zu ${MAX_COMPARED_VEHICLES} Modelle. Entferne zuerst ein Modell aus deiner Auswahl.` : undefined);
    },options));
    opener.addEventListener('click',() => {if(!selected.length||dialog.open)return;render();returnFocus=opener;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();},options);
    bar.querySelector('[data-vehicle-compare-clear]')!.addEventListener('click',()=>{selected=[];sync();buttons[0]?.focus();},options);
    dialog.querySelector('[data-vehicle-compare-close]')!.addEventListener('click',close,options);
    dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;if(returnFocus.isConnected&&returnFocus.getClientRects().length>0)returnFocus.focus({preventScroll:true});},options);
    sync();
    return()=>{if(dialog.open){dialog.close();document.body.style.overflow=oldOverflow;}events.abort();};
  });
}
