export const pixelScenarios = ['cafe', 'auto', 'handwerker'] as const;
export type PixelScenario = typeof pixelScenarios[number];
export const pixelShowcase = {
  "cases": {
    "ru": [
      {
        "name": "Кафе",
        "messages": [
          [
            "customer",
            "Капучино и круассан, пожалуйста."
          ],
          [
            "assistant",
            "Капучино и круассан. Добавить этот выбор в демо-корзину?"
          ],
          [
            "customer",
            "Да, добавить в демо-корзину."
          ]
        ],
        "result": "Демокорзина: капучино и круассан. Посетитель проверяет выбор перед завершением.",
        "benefit": "Помогает выбрать блюда и проверить состав заказа перед подтверждением.",
        "id": "cafe"
      },
      {
        "name": "Автосалон",
        "messages": [
          [
            "customer",
            "Нужен семейный автомат до 35 000 €. Что выбрать?"
          ],
          [
            "assistant",
            "В демокаталоге Touring — универсал за 28 900 €, Family — SUV за 34 900 €. Оба с автоматом и 5 местами. Touring дешевле на 6 000 €. Сравним варианты или подготовим тест-драйв?"
          ],
          [
            "customer",
            "Touring, хочу тест-драйв и узнать про лизинг."
          ]
        ],
        "result": "Черновик: Touring · автомат · до 35 000 € · тест-драйв и консультация по лизингу. Менеджер проверит наличие, время и условия.",
        "benefit": "Клиент понимает разницу между вариантами, менеджер получает конкретный запрос вместо «расскажите о машинах».",
        "id": "auto"
      },
      {
        "name": "Мастер по дому",
        "messages": [
          [
            "customer",
            "Нужно повесить телевизор на стену."
          ],
          [
            "assistant",
            "Помогу подготовить заявку. Какая стена: бетон, кирпич или гипсокартон? Если не знаешь — так и напиши."
          ],
          [
            "customer",
            "Бетон, телевизор 55 дюймов."
          ]
        ],
        "result": "Черновик: монтаж телевизора 55″ на бетонную стену. Крепление, стоимость и время мастер уточнит перед работой.",
        "benefit": "Мастер получает понятную задачу и важные детали до первого звонка.",
        "id": "handwerker"
      }
    ],
    "de": [
      {
        "name": "Café",
        "messages": [
          [
            "customer",
            "Einen Cappuccino und ein Croissant, bitte."
          ],
          [
            "assistant",
            "Cappuccino + Croissant. In den Demo-Warenkorb legen?"
          ],
          [
            "customer",
            "Ja, zum Demo-Warenkorb hinzufügen."
          ]
        ],
        "result": "Demo-Warenkorb: Cappuccino und Croissant. Der Gast prüft seine Auswahl vor dem Abschluss.",
        "benefit": "Hilft bei der Auswahl und lässt die wichtige Rückfrage nicht aus.",
        "id": "cafe"
      },
      {
        "name": "Autohaus",
        "messages": [
          [
            "customer",
            "Ein Familienauto mit Automatik bis 35.000 €. Was passt?"
          ],
          [
            "assistant",
            "Im Demo-Katalog: Touring als Kombi für 28.900 €, Family als SUV für 34.900 €. Beide mit Automatik und 5 Sitzen. Der Touring kostet 6.000 € weniger. Vergleichen oder Probefahrt anfragen?"
          ],
          [
            "customer",
            "Touring: Probefahrt und Infos zum Leasing, bitte."
          ]
        ],
        "result": "Entwurf: Touring · Automatik · bis 35.000 € · Probefahrt und Leasingberatung. Bestand, Termin und Konditionen prüft der Händler.",
        "benefit": "Der Kunde kennt die Unterschiede. Der Händler erhält eine konkrete Anfrage statt einer offenen Einstiegsfrage.",
        "id": "auto"
      },
      {
        "name": "Handwerker",
        "messages": [
          [
            "customer",
            "Ich möchte einen Fernseher an der Wand befestigen lassen."
          ],
          [
            "assistant",
            "Ich bereite die Anfrage vor. Ist die Wand aus Beton, Ziegel oder Gipskarton? Falls du es nicht weißt, ist das auch okay."
          ],
          [
            "customer",
            "Beton, der Fernseher hat 55 Zoll."
          ]
        ],
        "result": "Anfrage-Entwurf: 55-Zoll-TV an einer Betonwand montieren. Befestigung, Preis und Termin klärt der Betrieb vor der Arbeit.",
        "benefit": "Der Betrieb kennt die Aufgabe und wichtige Details schon vor dem ersten Anruf.",
        "id": "handwerker"
      }
    ],
    "en": [
      {
        "name": "Café",
        "messages": [
          [
            "customer",
            "A cappuccino and a croissant, please."
          ],
          [
            "assistant",
            "Cappuccino and croissant. Add this selection to your demo cart?"
          ],
          [
            "customer",
            "Yes, add them to the demo cart."
          ]
        ],
        "result": "Demo basket: cappuccino and croissant. The guest reviews the selection before finishing.",
        "benefit": "Helps choose and prepare an order without skipping an important question.",
        "id": "cafe"
      },
      {
        "name": "Car dealership",
        "messages": [
          [
            "customer",
            "A family automatic under €35,000. What would suit me?"
          ],
          [
            "assistant",
            "In the demo catalogue: Touring estate at €28,900 or Family SUV at €34,900. Both are automatic with 5 seats. Touring costs €6,000 less. Compare them or request a test drive?"
          ],
          [
            "customer",
            "Touring, please. A test drive and leasing information."
          ]
        ],
        "result": "Draft: Touring · automatic · up to €35,000 · test drive and leasing consultation. The dealer checks availability, time and terms.",
        "benefit": "Customers understand the difference. The dealer receives a specific enquiry instead of a vague opening question.",
        "id": "auto"
      },
      {
        "name": "Home services",
        "messages": [
          [
            "customer",
            "I need a television mounted on the wall."
          ],
          [
            "assistant",
            "I can prepare an enquiry. Is the wall concrete, brick or plasterboard? It is okay if you do not know."
          ],
          [
            "customer",
            "Concrete, a 55-inch television."
          ]
        ],
        "result": "Draft: mount a 55-inch TV on a concrete wall. The professional checks the fixing, price and time before work.",
        "benefit": "The professional receives a clear task and relevant details before the first call.",
        "id": "handwerker"
      }
    ]
  },
  "copy": {
    "ru": {
      "eyebrow": "PIXEL · ИИ-АГЕНТ АРТЁМА",
      "headline": "Мой помощник — Pixel.\nТвой будет своим.",
      "intro": "Pixel показывает, как ИИ-агент может помогать твоим клиентам. Для твоего бизнеса создадим отдельного помощника: со своим именем, оформлением, знаниями и задачами.",
      "benefits": [
        "Помнит твой каталог, услуги и правила",
        "Помогает выбрать и довести задачу до результата",
        "Передаёт сотруднику то, что требует его решения"
      ],
      "business": "Хочу такого помощника",
      "introNote": "Агента настраиваем на твои материалы и подключаем к нужным системам. Сложные вопросы и исключения оставляем человеку.",
      "subtitle": "ИИ-агент Артёма · примеры для бизнеса",
      "mark": "ДЕМО",
      "label": "ПРИМЕР ДИАЛОГА · ВЫМЫШЛЕННЫЕ ДАННЫЕ",
      "customer": "Посетитель",
      "assistant": "Pixel",
      "result": "ЧТО ПОЛУЧИЛОСЬ",
      "demo": "Попробовать самому",
      "note": "Живое демо открывается в чате. Без реальных заказов и записей."
    },
    "de": {
      "eyebrow": "PIXEL · ARTEMS KI-AGENT",
      "headline": "Mein Assistent heißt Pixel.\nDeiner passt zu dir.",
      "intro": "Pixel zeigt, wie ein KI-Agent deinen Kunden helfen kann. Für deinen Betrieb entwickeln wir einen eigenen Assistenten: mit deinem Auftritt, Wissen und Aufgaben.",
      "benefits": [
        "Kennt deinen Katalog, Leistungen und Regeln",
        "Hilft von der Auswahl bis zum nächsten Schritt",
        "Übergibt Entscheidungen an dein Team, wenn es nötig ist"
      ],
      "business": "Für mein Business besprechen",
      "introNote": "Wir konfigurieren den Agenten mit deinen Inhalten und verbinden passende Systeme. Sonderfälle und schwierige Entscheidungen bleiben beim Menschen.",
      "subtitle": "Artems KI-Agent · Beispiele für Betriebe",
      "mark": "DEMO",
      "label": "BEISPIELDIALOG · FIKTIVE ANGABEN",
      "customer": "Besucher",
      "assistant": "Pixel",
      "result": "DAS ERGEBNIS",
      "demo": "Selbst ausprobieren",
      "note": "Die Live-Demo öffnet sich im Chat. Keine echten Bestellungen oder Termine."
    },
    "en": {
      "eyebrow": "PIXEL · ARTEM’S AI AGENT",
      "headline": "My assistant is Pixel.\nYours will be your own.",
      "intro": "Pixel shows how an AI agent could help your customers. We build a separate assistant for your business, with your identity, knowledge and tasks.",
      "benefits": [
        "Uses your catalogue, services and rules",
        "Helps customers choose and take the next step",
        "Hands decisions to your team when needed"
      ],
      "business": "Discuss an assistant for my business",
      "introNote": "We configure the agent with your content and connect the relevant systems. Exceptions and difficult decisions stay with people.",
      "subtitle": "Artem’s AI agent · business examples",
      "mark": "DEMO",
      "label": "SAMPLE CONVERSATION · FICTIONAL DATA",
      "customer": "Visitor",
      "assistant": "Pixel",
      "result": "THE RESULT",
      "demo": "Try it yourself",
      "note": "The live demo opens in the chat. No real orders or appointments are created."
    }
  }
} as const;
