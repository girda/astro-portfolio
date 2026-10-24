export const site = {
 name: 'WERKRAUM', city: 'München', email: 'service@werkraum.example', phone: '+49 000 1234567', address:'Musterstraße 24, 80331 München',
 photo: `${import.meta.env.BASE_URL}images/workshop-v2.webp`,
 services:[
 {name:'Inspektion',category:'WARTUNG',text:'Wartung nach Fahrzeug, Laufleistung und Servicehistorie. Flüssigkeiten, Verschleiß und anstehende Intervalle werden gemeinsam betrachtet.',price:'ab 149 €',detail:'Beispielpreis für die Arbeitsleistung; Teile und Betriebsstoffe separat.',icon:'01'},
 {name:'Ölwechsel',category:'MOTOR',text:'Ölspezifikation und Füllmenge müssen zum Motor passen. Filter und benötigte Betriebsstoffe werden vor dem Wechsel abgestimmt.',price:'ab 89 €',detail:'Beispielpaket inkl. Filter und bis zu 4 Litern Standard-Motoröl.',icon:'02'},
 {name:'Bremsenservice',category:'SICHERHEIT',text:'Scheiben, Beläge und Bremsflüssigkeit im Blick. Reparaturen erst nach Rücksprache.',price:'Nach Prüfung',detail:'Der Umfang richtet sich nach Fahrzeug und Zustand.',icon:'03'},
 {name:'Räderwechsel',category:'SAISON',text:'Sommer oder Winter: Wir wechseln deinen bereits montierten Radsatz.',price:'ab 39 €',detail:'Beispielpreis für vier Kompletträder, ohne Auswuchten.',icon:'04'},
 {name:'Fehlerdiagnose',category:'ELEKTRONIK',text:'Fehlercodes sind ein Anfang, keine fertige Diagnose. Symptome und Auftreten helfen, die Ursache gezielt einzugrenzen.',price:'ab 49 €',detail:'Auslesen des Fehlerspeichers und erste Einschätzung.',icon:'05'},
 ],
 faq:[
 {q:'Kann ich mit jeder Automarke kommen?',a:'Das Werkstattkonzept ist markenoffen. Ob eine konkrete Arbeit möglich wäre, würde anhand von Modell, Baujahr und Motorisierung geprüft.'},
 {q:'Sind die angezeigten Preise verbindlich?',a:'Nein. Alle Preise sind fiktive Demo-Endpreise. Der konkrete Aufwand hängt vom Fahrzeug und den benötigten Teilen ab. Ein echter Betrieb würde vor Beginn ein Angebot abstimmen.'},
 {q:'Ist mein Wunschtermin sofort gebucht?',a:'Nein. Die Formular-Demo erstellt nur eine lokale Zusammenfassung. Es wird keine Anfrage verschickt und kein Termin reserviert.'},
 {q:'Was sollte ich zu einem Termin mitbringen?',a:'Für einen echten Werkstattbesuch wären in der Regel Fahrzeugschein, Fahrzeugschlüssel und vorhandene Wartungsunterlagen hilfreich. Besondere Anforderungen würde die Werkstatt vorher mitteilen.'},
 ],
};

export const siteRu = { ...site, services: [
  {
    "name": "Техобслуживание",
    "category": "ОБСЛУЖИВАНИЕ",
    "text": "Обслуживание с учётом модели, пробега и сервисной истории. Проверяем, какие интервалы, жидкости и изнашиваемые детали требуют внимания.",
    "price": "от 149 €",
    "detail": "Примерная стоимость работ; детали и расходные материалы оплачиваются отдельно.",
    "icon": "01"
  },
  {
    "name": "Замена масла",
    "category": "ДВИГАТЕЛЬ",
    "text": "Спецификация и объём масла должны соответствовать двигателю. Фильтр, материалы и состав работ согласовываются до замены.",
    "price": "от 89 €",
    "detail": "Пример пакета с фильтром и до 4 литров стандартного моторного масла.",
    "icon": "02"
  },
  {
    "name": "Обслуживание тормозов",
    "category": "БЕЗОПАСНОСТЬ",
    "text": "Проверка дисков, колодок и тормозной жидкости. Ремонт — после согласования.",
    "price": "После осмотра",
    "detail": "Объём работ зависит от автомобиля и состояния системы.",
    "icon": "03"
  },
  {
    "name": "Смена колёс",
    "category": "СЕЗОН",
    "text": "Лето или зима: заменим комплект колёс с уже установленными шинами.",
    "price": "от 39 €",
    "detail": "Примерная цена за четыре колеса в сборе, без балансировки.",
    "icon": "04"
  },
  {
    "name": "Диагностика",
    "category": "ЭЛЕКТРОНИКА",
    "text": "Код ошибки — начало проверки, а не готовый диагноз. Симптомы и условия появления помогают последовательно найти причину.",
    "price": "от 49 €",
    "detail": "Считывание кодов ошибок и первичная оценка.",
    "icon": "05"
  }
], faq: [
  {
    "q": "Вы работаете со всеми марками?",
    "a": "Концепт рассчитан на разные марки автомобилей. Возможность конкретной работы уточнялась бы по модели, году выпуска и двигателю."
  },
  {
    "q": "Указанные цены окончательные?",
    "a": "Нет. Это вымышленные итоговые цены для демо. Реальная стоимость зависит от автомобиля и необходимых деталей. Настоящий сервис согласовал бы смету до начала работ."
  },
  {
    "q": "Выбранная дата сразу бронируется?",
    "a": "Нет. Демо-форма создаёт только локальное резюме. Заявка никуда не отправляется, время не резервируется."
  },
  {
    "q": "Что нужно взять с собой?",
    "a": "Для настоящего визита обычно полезны документы на автомобиль, ключи и история обслуживания. Особые требования сервис уточнил бы заранее."
  }
] };
