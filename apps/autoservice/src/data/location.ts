// Центр города — ориентир демо, а не адрес мастерской.
const point = {lat:48.1374,lon:11.5755};
export const workshopMap = {
 embed:`https://www.openstreetmap.org/export/embed.html?bbox=${point.lon-.11}%2C${point.lat-.055}%2C${point.lon+.11}%2C${point.lat+.055}&layer=mapnik`,
 directions:`https://www.google.com/maps/dir/?api=1&destination=${point.lat}%2C${point.lon}`,
};
