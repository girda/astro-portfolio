// Исходники сохраняются; эти материалы не должны попадать в публикуемый dist.
export const excludedPublicAssets = Object.freeze([
  'demos/barbershop/images/cut-01.jpeg',
  'demos/barbershop/images/cut-02.jpeg',
  'demos/barbershop/images/cut-03.jpeg',
  'demos/barbershop/images/celebrities',
]);
export function isPublicAssetAllowed(path) {
  const normalized = path.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+/g, '/');
  return !excludedPublicAssets.some(blocked => normalized === blocked || normalized.startsWith(blocked + '/'));
}
