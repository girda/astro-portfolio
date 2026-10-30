import {DEMO_APPS} from './projects.mjs';
const currentPreviews = new Set(DEMO_APPS.flatMap(id => ['', '-mobile', '-tablet'].map(size => `previews/${id}${size}.png`)));
// Исходники сохраняются; эти материалы не должны попадать в публикуемый dist.
export const excludedPublicAssets = Object.freeze([
  'demos/barbershop/images/cut-01.jpeg',
  'demos/barbershop/images/cut-02.jpeg',
  'demos/barbershop/images/cut-03.jpeg',
  'demos/barbershop/images/cut-04.jpg',
  'demos/barbershop/images/cut-05.jpg',
  'demos/barbershop/images/cut-06.jpg',
  'demos/barbershop/images/barbershop.webp',
  'demos/barbershop/images/celebrities',
]);
export function isPublicAssetAllowed(path) {
  const normalized = path.replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+/g, '/');
  if (normalized.startsWith('previews/') && !currentPreviews.has(normalized)) return false;
  return !excludedPublicAssets.some(blocked => normalized === blocked || normalized.startsWith(blocked + '/'));
}
