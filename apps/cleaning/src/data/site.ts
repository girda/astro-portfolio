export const site = {
  name: 'klar', city: 'München', email: 'hallo@klar.example',
  photo: 'https://images.unsplash.com/photo-1588089262539-d6506afd1f28?auto=format&fit=crop&w=1800&q=85',
  pricing: { base: 59, room: 20, bathroom: 15 },
  extras: [ {id:'oven',name:'Backofen innen',price:15}, {id:'fridge',name:'Kühlschrank innen',price:15}, {id:'windows',name:'Fenster · 2 Stück',price:24} ],
  services: [
    {icon:'home',title:'Wohnungsreinigung',text:'Ein frischer Start für Wohnzimmer, Küche und Bad.',price:'ab 59 €',link:'#rechner'},
    {icon:'window',title:'Fensterreinigung',text:'Klare Sicht. Saubere Scheiben, Rahmen und Fensterbänke.',price:'als Extra ab 24 €',link:'#extras'},
    {icon:'office',title:'Büroreinigung',text:'Ein gepflegter Arbeitsplatz, an dem man gerne ankommt.',price:'Individuelles Angebot',link:'#kontakt'},
  ],
  rooms: [
    { name:'Wohnräume',items:['Staub auf erreichbaren Flächen entfernen','Böden saugen und wischen','Spiegel und Fensterbänke reinigen','Mülleimer leeren'] },
    { name:'Küche',items:['Arbeitsflächen und Spüle reinigen','Herd und Küchenfronten abwischen','Geräte von außen reinigen','Boden saugen und wischen'] },
    { name:'Bad',items:['Waschbecken und Armaturen reinigen','Dusche oder Badewanne reinigen','WC und Spiegel reinigen','Boden wischen und Abfall entsorgen'] },
  ],
  faq:[
    {q:'Was ist im Beispielpreis enthalten?',a:'Der Rechner umfasst die gewählten Wohnräume und Bäder sowie eine Küche und einen Flur. Innenreinigung von Geräten und Fenster sind separat wählbar. Alle Beträge auf dieser Website sind unverbindliche Demo-Endpreise.'},
    {q:'Muss ich Reinigungsmittel bereitstellen?',a:'Für dieses Servicekonzept sind übliche Reinigungsmittel eingeplant. Besondere Oberflächen und benötigte Geräte würden vor einem echten Termin persönlich abgestimmt.'},
    {q:'Kann ich eine regelmäßige Reinigung wählen?',a:'Ja. Im Rechner kannst du zwischen einmalig, alle zwei Wochen und wöchentlich wechseln. Die Demo zeigt dazu unterschiedliche Beispielpreise; es wird kein Abonnement abgeschlossen.'},
    {q:'In welchen Stadtteilen wäre der Service verfügbar?',a:'Das Konzept ist auf München ausgerichtet, etwa Schwabing, Maxvorstadt, Haidhausen und Sendling. Eine tatsächliche Verfügbarkeit wird auf dieser Demo nicht geprüft.'},
    {q:'Kann ich hier eine echte Reinigung buchen?',a:'Nein. KLAR ist ein Portfolio-Konzept von HIRDA. Der Rechner und die Zusammenfassung lassen sich ausprobieren, aber es werden keine Aufträge, Zahlungen oder persönlichen Daten übermittelt.'},
  ]
};
