export interface House {
  id: string; name: string; area: number; floors: number; bedrooms: number;
  bathrooms: number; material: string; style: string; roof: string; image: string; description: string;
}
export interface Filters {
  materials: string[]; floors: number[]; bedrooms: number[]; styles: string[];
  roofs: string[]; min: number; max: number; query: string;
}
export const emptyFilters = (): Filters => ({ materials: [], floors: [], bedrooms: [], styles: [], roofs: [], min: 0, max: 400, query: '' });
export function selectHouses(houses: readonly House[], filters: Filters, sort = 'recommended'): House[] {
  const query = filters.query.trim().toLocaleLowerCase('de');
  const match = <T>(selection: T[], value: T) => !selection.length || selection.includes(value);
  const result = houses.filter(house =>
    match(filters.materials, house.material) && match(filters.floors, house.floors) &&
    match(filters.bedrooms, house.bedrooms) && match(filters.styles, house.style) && match(filters.roofs, house.roof) &&
    house.area >= filters.min && house.area <= filters.max &&
    (!query || `${house.name} ${house.material} ${house.style}`.toLocaleLowerCase('de').includes(query)));
  if (sort === 'area-asc') result.sort((a,b) => a.area-b.area);
  if (sort === 'area-desc') result.sort((a,b) => b.area-a.area);
  if (sort === 'name') result.sort((a,b) => a.name.localeCompare(b.name, 'de'));
  return result;
}
