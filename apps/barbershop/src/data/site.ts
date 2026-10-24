export const site = {
  name: "KANT",
  subtitle: "BARBERSHOP",
  description:
    "Das Konzept für deinen nächsten Schnitt. Klare Linien, präzise Konturen und Zeit für deinen Stil.",

  services: [
    {
      number: "01",
      title: "Haarschnitt",
      description:
        "Von den ersten Ideen bis zum Finish: Haarstruktur, Wirbel und dein tägliches Styling geben dem Schnitt seine Richtung.",
      duration: "45 Min.",
      price: "35 €",
    },
    {
      number: "02",
      title: "Bartpflege",
      description: "Länge, Form und Konturen gemeinsam festlegen. Dazu ein Pflege-Finish und Tipps, mit denen dein Bart auch zu Hause in Form bleibt.",
      duration: "30 Min.",
      price: "25 €",
    },
    {
      number: "03",
      title: "Schnitt & Bart",
      description: "Schnitt und Bart als ein stimmiger Look. Übergänge, Proportionen und Finish werden in einem Besuch aufeinander abgestimmt.",
      duration: "75 Min.",
      price: "55 €",
    },
  ],
  faq: [
  {
    question: "Kann ich hier einen Termin buchen?",
    answer:
      "Diese Website ist ein Demo-Projekt für einen fiktiven Barbershop. Du kannst die Auswahl einer Leistung ausprobieren, aber keinen echten Termin buchen.",
  },
  {
    question: "Welche Leistungen werden angeboten?",
    answer:
      "Das Beispielangebot umfasst Haarschnitte, Bartpflege und ein kombiniertes Paket. Die Leistungen können für einen echten Salon individuell angepasst werden.",
  },
  {
    question: "Wie lange dauert ein Termin?",
    answer:
      "Im Demo-Angebot sind 45 Minuten für einen Haarschnitt, 30 Minuten für die Bartpflege und 75 Minuten für das kombinierte Paket vorgesehen.",
  },
  {
    question: "Sind die angegebenen Preise verbindlich?",
    answer:
      "Nein. Alle Preise dienen ausschließlich zur Veranschaulichung dieses Website-Konzepts und gehören nicht zu einem echten Salon.",
  },
  {
    question: "Werden bei der Demo persönliche Daten übermittelt?",
    answer:
      "Der Termin-Dialog fragt keine Kontaktdaten ab und sendet keine Buchungsanfrage. Die Auswahl einer Leistung bleibt in deinem Browser und wird beim erneuten Öffnen des Dialogs zurückgesetzt.",
  },
],
};

// Общие ссылки используют шапка, мобильное меню и футер.
export const navigation = [
  { label: 'Leistungen & Preise', href: '#leistungen', desktop: true },
  { label: 'Der Salon', href: '#studio', desktop: true },
  { label: 'Looks & Inspiration', href: '#einblicke', desktop: false },
  { label: 'Pflege', href: '#pflege', desktop: true },
  { label: 'Dein Besuch', href: '#ablauf', desktop: false },
  { label: 'Fragen & Antworten', href: '#fragen', desktop: false },
  { label: 'Kontakt', href: '#kontakt', desktop: true },
];

// Демонстрационная витрина без корзины, оплаты и заявлений о составе.
export const careProducts = [
  { category: 'STYLING', title: 'Styling Clay', description: 'Für Form und Struktur. Welches Finish zu deinem Haar passt, klärt der Barber mit dir.' },
  { category: 'BARTPFLEGE', title: 'Beard Oil', description: 'Pflege für deinen Bart. Besprich deine Wünsche und Hautverträglichkeit mit dem Barber.' },
  { category: 'REINIGUNG', title: 'Hair Wash', description: 'Die Grundlage deiner Pflegeroutine. Gemeinsam findet ihr eine passende Reinigung.' },
];
