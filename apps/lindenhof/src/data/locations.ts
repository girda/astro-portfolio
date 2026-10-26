export const locations = [
 {id:'nord',name:'München Nord',place:'BMW Welt · Orientierungspunkt',address:'Am Olympiapark 1, 80809 München',lat:48.1771,lng:11.5585},
 {id:'west',name:'München West',place:'Schloss Nymphenburg · Orientierungspunkt',address:'Schloss Nymphenburg 1, 80638 München',lat:48.1583,lng:11.5033},
 {id:'ost',name:'München Ost',place:'Messe München · Orientierungspunkt',address:'Am Messesee 2, 81829 München',lat:48.1355,lng:11.6923},
] as const;
export const routeUrl=(lat:number,lng:number)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
