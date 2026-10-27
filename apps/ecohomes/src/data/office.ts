// Демонстрационная точка города; реальный офис пока не подтверждён.
export const office = {
 label: 'Landshut · Standortidee',
 email: 'hallo@eichenhain.example',
 lat: 48.5361,
 lon: 12.1516,
 note: 'Demonstrationsstandort in Landshut. Hier befindet sich kein bestätigtes Eichenhain-Büro.',
};
export const officeMaps = {
 embed: `https://www.openstreetmap.org/export/embed.html?bbox=${office.lon-.016}%2C${office.lat-.009}%2C${office.lon+.016}%2C${office.lat+.009}&layer=mapnik&marker=${office.lat}%2C${office.lon}`,
 place: `https://www.google.com/maps/search/?api=1&query=${office.lat}%2C${office.lon}`,
 directions: `https://www.google.com/maps/dir/?api=1&destination=${office.lat}%2C${office.lon}`,
};
