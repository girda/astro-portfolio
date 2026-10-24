import {services} from './site';
export const languages = ["de", "ru", "en"] as const;
export type Language = typeof languages[number];
export const pages = ["home", "services", "gallery", "studio"] as const;
export type Page = typeof pages[number];
export const pathFor = (lang: Language, page: Page) => (lang === "de" ? "/" : `/${lang}/`) + (page === "home" ? "" : `${page}/`);
const content = {
  "de": {
    "home": "Startseite",
    "services": "Behandlungen & Preise",
    "gallery": "Inspiration",
    "studio": "Salon & Kontakt",
    "demo": "Demo von HIRDA. · Kein echtes Studio · Beispielpreise",
    "book": "Termin wählen",
    "skip": "Zum Inhalt",
    "language": "Sprache wählen",
    "hero1": "Dein Moment.",
    "hero2": "Ganz bei dir.",
    "intro": "Haare, Nägel und kleine Auszeiten. Entdecke Beauty und Wohlbefinden, die zu dir passen.",
    "viewServices": "Behandlungen entdecken",
    "signature": "Schönheit hat viele Seiten.",
    "serviceIntro": "Haare, Nägel, Massage und Spa: Entdecke deine Auswahl. Alle Preise und Termine sind unverbindliche Demo-Beispiele.",
    "priceNote": "Unverbindliche Demo-Endpreise. Länge, Material, Zusatzleistungen und Eignung würden vor einem echten Termin persönlich abgestimmt.",
    "choose": "Auswählen",
    "minutes": "Minuten",
    "consult": "Beratung",
    "date": "Wunschdatum",
    "time": "Tageszeit",
    "morning": "Vormittags",
    "afternoon": "Nachmittags",
    "flexible": "Flexibel",
    "preview": "Vorschau ansehen",
    "edit": "Auswahl bearbeiten",
    "close": "Schließen",
    "bookingNote": "Keine echte Buchung. Diese Auswahl bleibt im Browser; nichts wird gesendet oder reserviert.",
    "summary": "Deine Auswahl",
    "galleryIntro": "Ein Gefühl für STILL.",
    "galleryNote": "KI-generierte Inspirationen für dieses Salonkonzept. Keine echten Kundenarbeiten oder Mitarbeiterinnen.",
    "all": "Alle",
    "color": "Looks",
    "care": "Spa & Pflege",
    "studioIntro": "Ein Ort. Viele gute Momente.",
    "studioText": "Vom präzisen Schnitt bis zum ruhigen Spa-Ritual: STILL verbindet Beauty und Wohlbefinden in einer klaren, persönlichen Salonidee. Ein Designkonzept von HIRDA, kein echter Salon.",
    "address": "Adresse",
    "contact": "Kontakt",
    "hours": "Öffnungszeiten",
    "hoursText": "Di–Fr 10–19 Uhr · Sa 10–16 Uhr · Termine nach Vereinbarung",
    "contactNote": "Fiktive Adresse und Kontaktdaten. Nicht erreichbar.",
    "faqTitle": "Gut zu wissen.",
    "q1": "Welche Behandlung passt zu mir?",
    "a1": "Wähle eine Richtung oder starte mit Beratung. Bei einem echten Termin würden Wünsche und passende Pflege persönlich besprochen.",
    "q2": "Kann ich mehrere Behandlungen kombinieren?",
    "a2": "Das wäre nach persönlicher Abstimmung möglich. Die Demo zeigt zunächst eine einzelne Auswahl und bestätigt keine Kombination oder Verfügbarkeit.",
    "q3": "Was sollte ich vor einem Termin mitteilen?",
    "a3": "Wünsche, vorhandenes Material und besondere Unverträglichkeiten würden vertraulich mit dem Salon abgestimmt. Bitte keine Gesundheitsdaten in diese Demo eingeben.",
    "q4": "Wird mein Termin verbindlich gebucht?",
    "a4": "Nein. Die Auswahl erzeugt nur eine lokale Vorschau, ohne Zahlung oder Datenübermittlung.",
    "formTitle": "Zeit für dich. Was darf es sein?",
    "select": "Bitte auswählen",
    "duration": "Dauer",
    "price": "Beispielpreis",
    "unsure": "Nach Absprache",
    "inspiration": "Inspiration ansehen",
    "footer": "STILL Beauty & Spa · Ein Designkonzept von HIRDA",
    "back": "Zurück nach oben",
    "step1": "Wunsch besprechen",
    "step2": "Behandlung abstimmen",
    "step3": "Den Moment genießen",
    "treatments": [
      {
        "name": "Schnitt & Styling",
        "text": "Ein Schnitt, der zu dir passt, mit Pflege und persönlichem Styling."
      },
      {
        "name": "Farbe & Glanz",
        "text": "Farbwunsch und Haarzustand gemeinsam besprechen. Materialumfang nach Beratung."
      },
      {
        "name": "Classic Maniküre",
        "text": "Nägel formen, Nagelhaut pflegen und ein natürliches Finish."
      },
      {
        "name": "Maniküre mit Gel-Lack",
        "text": "Sorgfältige Maniküre und deine Wunschfarbe. Entfernung separat abstimmen."
      },
      {
        "name": "Wellness-Massage",
        "text": "Eine ruhige Auszeit für deinen Alltag. Wellness, keine medizinische Behandlung."
      },
      {
        "name": "Spa-Ritual",
        "text": "Wärme, Pflege und ein entspannter Moment nur für dich."
      },
      {
        "name": "Gesichtspflege",
        "text": "Sanfte Reinigung und Pflege, abgestimmt auf deine Wünsche."
      },
      {
        "name": "Pediküre",
        "text": "Gepflegte Füße mit einem natürlichen Finish. Kosmetische Behandlung."
      }
    ],
    "ritualLine": "Haare · Nägel · Massage · Spa · Beauty",
    "categories": [
      "Haare & Styling",
      "Maniküre",
      "Massage",
      "Spa-Rituale",
      "Beauty & Pflege"
    ]
  },
  "ru": {
    "home": "Главная",
    "services": "Услуги и цены",
    "gallery": "Вдохновение",
    "studio": "Салон и контакты",
    "demo": "Демо от HIRDA. · Не настоящая студия · Примерные цены",
    "book": "Выбрать дату",
    "skip": "К содержимому",
    "language": "Выбор языка",
    "hero1": "Твой момент.",
    "hero2": "Для себя.",
    "intro": "Волосы, ногти и время для отдыха. Уход и красота с вниманием к твоим пожеланиям.",
    "viewServices": "Посмотреть услуги",
    "signature": "У красоты много сторон.",
    "serviceIntro": "Стрижки, маникюр, массаж и SPA. Цены и даты приведены для демонстрации.",
    "priceNote": "Демонстрационные цены. Длина волос, материалы, дополнительные услуги и подходящий уход уточняются до настоящего визита.",
    "choose": "Выбрать",
    "minutes": "минут",
    "consult": "Консультация",
    "date": "Желаемая дата",
    "time": "Время дня",
    "morning": "До обеда",
    "afternoon": "После обеда",
    "flexible": "Любое время",
    "preview": "Посмотреть заявку",
    "edit": "Изменить выбор",
    "close": "Закрыть",
    "bookingNote": "Это не настоящая запись. Выбор остаётся в браузере; ничего не отправляется и не бронируется.",
    "summary": "Твой выбор",
    "galleryIntro": "Атмосфера STILL.",
    "galleryNote": "ИИ-изображения для концепции салона. Это не реальные работы, клиенты или сотрудники.",
    "all": "Все",
    "color": "Образы",
    "care": "SPA и уход",
    "studioIntro": "Одно место. Много приятных моментов.",
    "studioText": "От точной стрижки до спокойного SPA-ритуала: STILL объединяет красоту и уход в концепции персонального салона. Демо-проект HIRDA, не настоящий салон.",
    "address": "Адрес",
    "contact": "Контакты",
    "hours": "Часы работы",
    "hoursText": "Вт–Пт 10–19 · Сб 10–16 · По предварительной записи",
    "contactNote": "Вымышленные адрес и контакты. Не для связи.",
    "faqTitle": "Полезно знать.",
    "q1": "Как выбрать процедуру?",
    "a1": "Выбери направление или консультацию. В настоящем салоне пожелания и уход обсуждают лично.",
    "q2": "Можно совместить несколько процедур?",
    "a2": "После индивидуального согласования. Демо показывает одну услугу и не подтверждает свободное время.",
    "q3": "Что сообщить перед визитом?",
    "a3": "Пожелания, покрытие и индивидуальные особенности обсуждают с салоном конфиденциально. Не вводи медицинские данные в демо.",
    "q4": "Выбранная дата сразу бронируется?",
    "a4": "Нет. Форма создаёт только локальную карточку, без оплаты и отправки данных.",
    "formTitle": "Время для себя. Что выберешь?",
    "select": "Выбери процедуру",
    "duration": "Длительность",
    "price": "Примерная цена",
    "unsure": "По согласованию",
    "inspiration": "Посмотреть идеи",
    "footer": "STILL Beauty & Spa · Демо-проект HIRDA",
    "back": "Наверх",
    "step1": "Обсудить пожелания",
    "step2": "Подобрать процедуру",
    "step3": "Насладиться моментом",
    "treatments": [
      {
        "name": "Стрижка и укладка",
        "text": "Стрижка с уходом и укладкой, подходящая твоему образу."
      },
      {
        "name": "Окрашивание и блеск",
        "text": "Обсудим цвет и состояние волос. Объём материалов уточняется на консультации."
      },
      {
        "name": "Классический маникюр",
        "text": "Форма ногтей, уход за кутикулой и естественное покрытие."
      },
      {
        "name": "Маникюр с гель-лаком",
        "text": "Аккуратный маникюр и выбранный цвет. Снятие покрытия согласуется отдельно."
      },
      {
        "name": "Расслабляющий массаж",
        "text": "Спокойная пауза в твоём дне. Wellness, не медицинская процедура."
      },
      {
        "name": "SPA-ритуал",
        "text": "Тепло, уход и расслабляющий ритуал только для тебя."
      },
      {
        "name": "Уход за лицом",
        "text": "Бережное очищение и уход с учётом твоих пожеланий."
      },
      {
        "name": "Педикюр",
        "text": "Уход за стопами и естественное покрытие. Косметическая процедура."
      }
    ],
    "ritualLine": "Волосы · Ногти · Массаж · SPA · Уход",
    "categories": [
      "Стрижки и укладки",
      "Маникюр",
      "Массаж",
      "SPA-ритуалы",
      "Красота и уход"
    ]
  },
  "en": {
    "home": "Home",
    "services": "Treatments & prices",
    "gallery": "Inspiration",
    "studio": "Salon & contact",
    "demo": "Demo by HIRDA. · Not a real studio · Example prices",
    "book": "Choose a date",
    "skip": "Skip to content",
    "language": "Choose language",
    "hero1": "Your moment.",
    "hero2": "All for you.",
    "intro": "Hair, nails and a little time out. Discover beauty and wellbeing shaped around you.",
    "viewServices": "Explore treatments",
    "signature": "Beauty has many sides.",
    "serviceIntro": "Hair, nails, massage and spa. All prices and appointment choices are illustrative demos.",
    "priceNote": "Illustrative demo prices. Hair length, materials, extras and suitability would be agreed before a real appointment.",
    "choose": "Choose",
    "minutes": "minutes",
    "consult": "Consultation",
    "date": "Preferred date",
    "time": "Time of day",
    "morning": "Morning",
    "afternoon": "Afternoon",
    "flexible": "Flexible",
    "preview": "View preview",
    "edit": "Edit selection",
    "close": "Close",
    "bookingNote": "This is not a real booking. Your selection stays in this browser; nothing is sent or reserved.",
    "summary": "Your selection",
    "galleryIntro": "A feeling for STILL.",
    "galleryNote": "AI-generated inspiration for this salon concept. Not real client work or staff.",
    "all": "All",
    "color": "Looks",
    "care": "Spa & care",
    "studioIntro": "One place. Many good moments.",
    "studioText": "From a precise cut to a quiet spa ritual, STILL brings beauty and wellbeing together in a personal salon concept. A HIRDA design demo, not a real salon.",
    "address": "Address",
    "contact": "Contact",
    "hours": "Opening hours",
    "hoursText": "Tue–Fri 10–19 · Sat 10–16 · By appointment",
    "contactNote": "Fictional address and contact details. Not reachable.",
    "faqTitle": "Good to know.",
    "q1": "Which treatment suits me?",
    "a1": "Choose a direction or start with a consultation. Preferences and care would be discussed personally.",
    "q2": "Can I combine treatments?",
    "a2": "After individual agreement. This demo shows one choice and does not confirm availability or combined appointments.",
    "q3": "What should I mention beforehand?",
    "a3": "Preferences, existing products and sensitivities would be discussed privately with the salon. Do not enter health information in this demo.",
    "q4": "Is my selected date booked immediately?",
    "a4": "No. The form creates a local preview only, with no payment or data submission.",
    "formTitle": "Time for you. What would you like?",
    "select": "Please choose",
    "duration": "Duration",
    "price": "Example price",
    "unsure": "By arrangement",
    "inspiration": "Explore inspiration",
    "footer": "STILL Beauty & Spa · A HIRDA design concept",
    "back": "Back to top",
    "step1": "Share your wishes",
    "step2": "Agree your treatment",
    "step3": "Enjoy the moment",
    "treatments": [
      {
        "name": "Cut & styling",
        "text": "A personal haircut with care and styling to suit your look."
      },
      {
        "name": "Colour & shine",
        "text": "Discuss your colour and hair condition. Materials are scoped during consultation."
      },
      {
        "name": "Classic manicure",
        "text": "Nail shaping, cuticle care and a natural finish."
      },
      {
        "name": "Gel polish manicure",
        "text": "Careful manicure and your preferred colour. Removal agreed separately."
      },
      {
        "name": "Wellness massage",
        "text": "A quiet break in your day. Wellness, not medical treatment."
      },
      {
        "name": "Spa ritual",
        "text": "Warmth, care and a relaxing moment just for you."
      },
      {
        "name": "Facial care",
        "text": "Gentle cleansing and care matched to your wishes."
      },
      {
        "name": "Pedicure",
        "text": "Foot care and a natural finish. A cosmetic treatment."
      }
    ],
    "ritualLine": "Hair · Nails · Massage · Spa · Beauty",
    "categories": [
      "Hair & styling",
      "Manicure",
      "Massage",
      "Spa rituals",
      "Beauty & care"
    ]
  }
};
function localize(lang: Language) { return {...content[lang], treatments: services.map((service,index)=>({...service,...content[lang].treatments[index]}))}; }
export const copy = {de:localize('de'),ru:localize('ru'),en:localize('en')};
