import type {MenuData} from '../data/menu';
import {formatMoney} from '../data/format-money';
// Локальный CMS-предпросмотр использует настоящие карточки и анимации меню.
export function renderPreview(data:MenuData) {
  if(!document.documentElement.hasAttribute('data-menu-preview'))return;
  const grid=document.querySelector<HTMLElement>('.dish-grid')!;
  const template=grid.querySelector<HTMLElement>('[data-product]')!;
  const cards=document.createDocumentFragment();
  for(const p of data.products){
    const card=template.cloneNode(true) as HTMLElement;
    card.dataset.product=p.id;card.dataset.category=p.category;
    const open=card.querySelector<HTMLButtonElement>('[data-open]')!;
    open.dataset.open=p.id;open.setAttribute('aria-label',`${p.name}, ${formatMoney(p.price)}, Details und Extras`);
    const img=card.querySelector<HTMLImageElement>('img')!;img.src=p.image;img.alt=p.name;
    card.querySelector('h2')!.textContent=p.name;card.querySelector('strong')!.textContent=formatMoney(p.price);
    card.querySelector('.prep-time')!.textContent=`${p.time} MIN.`;
    const favorite=card.querySelector<HTMLButtonElement>('[data-favorite]')!;
    favorite.dataset.favorite=p.id;favorite.setAttribute('aria-label',`${p.name} merken`);
    const add=card.querySelector<HTMLButtonElement>('[data-add]')!;
    add.dataset.add=p.id;add.setAttribute('aria-label',`${p.name} zum Warenkorb hinzufügen`);
    cards.append(card);
  }
  grid.replaceChildren(cards);
  const nav=document.querySelector('.categories')!;
  const category=nav.querySelector<HTMLButtonElement>('button')!;
  const categories=document.createDocumentFragment();
  for(const c of data.categories){
    const button=category.cloneNode(true) as HTMLButtonElement;
    button.dataset.categorySelect=c.id;button.setAttribute('aria-pressed',String(c.id==='all'));
    const span=document.createElement('span');span.setAttribute('aria-hidden','true');span.textContent=c.symbol;
    button.replaceChildren(span,document.createTextNode(c.name));categories.append(button);
  }
  nav.replaceChildren(categories);
}
