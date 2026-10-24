export const services = [
  {
    "name": "Schnitt & Styling",
    "text": "Ein Schnitt, der zu dir passt, mit Pflege und persönlichem Styling.",
    "time": 60,
    "price": 65,
    "icon": "scissors"
  },
  {
    "name": "Farbe & Glanz",
    "text": "Farbwunsch und Haarzustand gemeinsam besprechen. Materialumfang nach Beratung.",
    "time": 90,
    "price": 89,
    "icon": "sparkles"
  },
  {
    "name": "Classic Maniküre",
    "text": "Nägel formen, Nagelhaut pflegen und ein natürliches Finish.",
    "time": 40,
    "price": 35,
    "icon": "hand"
  },
  {
    "name": "Maniküre mit Gel-Lack",
    "text": "Sorgfältige Maniküre und deine Wunschfarbe. Entfernung separat abstimmen.",
    "time": 60,
    "price": 49,
    "icon": "paintbrush"
  },
  {
    "name": "Wellness-Massage",
    "text": "Eine ruhige Auszeit für deinen Alltag. Wellness, keine medizinische Behandlung.",
    "time": 50,
    "price": 69,
    "icon": "flower-2"
  },
  {
    "name": "Spa-Ritual",
    "text": "Wärme, Pflege und ein entspannter Moment nur für dich.",
    "time": 75,
    "price": 95,
    "icon": "leaf"
  },
  {
    "name": "Gesichtspflege",
    "text": "Sanfte Reinigung und Pflege, abgestimmt auf deine Wünsche.",
    "time": 60,
    "price": 75,
    "icon": "sparkles"
  },
  {
    "name": "Pediküre",
    "text": "Gepflegte Füße mit einem natürlichen Finish. Kosmetische Behandlung.",
    "time": 50,
    "price": 45,
    "icon": "footprints"
  }
];
const image=(file:string)=>`${import.meta.env.BASE_URL}images/${file}`;
export const photos = [
 {src:image('beauty-hero.webp'),alt:'KI-Visualisierung: Hairstyling in einem hellen Beauty-Salon',author:'HIRDA',url:'https://girda.github.io/astro-portfolio/',caption:'Haare & Styling'},
 {src:image('spa-room.webp'),alt:'KI-Visualisierung: ruhiger Spa- und Massageraum',author:'HIRDA',url:'https://girda.github.io/astro-portfolio/',caption:'Spa & Pflege'},
 {src:image('manicure-v2.webp'),alt:'KI-Visualisierung: sorgfältige Maniküre in Bordeaux',author:'HIRDA',url:'https://girda.github.io/astro-portfolio/',caption:'Nägel & Farbe'},
];
