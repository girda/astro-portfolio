import {vehicles} from './site.ts';
export const MAX_COMPARED_VEHICLES = 3;
const knownIds = new Set(vehicles.map(vehicle => vehicle.id));

export function comparisonIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))].slice(0, MAX_COMPARED_VEHICLES);
}
export function toggleCompared(current: readonly string[], id: string) {
  const ids = comparisonIds(current);
  if (!knownIds.has(id)) return {ids, limited: false};
  if (ids.includes(id)) return {ids: ids.filter(value => value !== id), limited: false};
  if (ids.length === MAX_COMPARED_VEHICLES) return {ids, limited: true};
  return {ids: [...ids, id], limited: false};
}
