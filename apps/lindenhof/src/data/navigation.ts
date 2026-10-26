export interface MenuItem { label: string; path?: string; children?: MenuItem[] }
export const menuItems: MenuItem[] = [
 {label:'Fahrzeuge',path:'#fahrzeuge',children:[{label:'Alle Modelle',path:'#fahrzeuge'},{label:'Marken',children:[{label:'Mazda',path:'fahrzeuge/mazda/'},{label:'BMW',path:'fahrzeuge/bmw/'},{label:'Porsche',path:'fahrzeuge/porsche/'},{label:'Peugeot',path:'fahrzeuge/peugeot/'},{label:'Volkswagen',path:'fahrzeuge/volkswagen/'}]},{label:'Elektro & Hybrid',children:[{label:'Antrieb kennenlernen'},{label:'Laden im Alltag'}]}]},
 {label:'Finanzierung',path:'finanzierung/',children:[{label:'Kauf & Finanzierung',path:'finanzierung/'},{label:'Dein Angebot',children:[{label:'Möglichkeiten besprechen',path:'#kontakt'},{label:'Finanzierungsrechner'}]}]},
 {label:'Leasing',path:'#erwerb',children:[{label:'Leasing entdecken',path:'#erwerb'},{label:'Für dein Business',children:[{label:'Gewerbeleasing'},{label:'Flottenberatung'}]}]},
 {label:'Service',path:'service/',children:[{label:'Service im Überblick',path:'service/'},{label:'Für dein Auto',children:[{label:'Wartung & Inspektion',path:'service/'},{label:'Räder & Reifen',path:'service/'},{label:'Zubehör entdecken'}]}]},
 {label:'Über uns',path:'#ueber-uns'}, {label:'Standorte',path:'#standorte'}, {label:'Kontakt',path:'#kontakt'}
];
export const menuHref=(path:string,base:string)=>path.startsWith('#')?base+path:base+path;
