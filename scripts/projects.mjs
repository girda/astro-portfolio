// Единый состав публичной сборки. Черновики не попадают сюда автоматически.
export const DEMO_APPS = Object.freeze([
  'barbershop', 'cleaning', 'autoservice', 'nails', 'lindenhof',
  'ecohomes', 'hausbau', 'khlibnyi', 'streetfood', 'electrical', 'homeservice', 'gardens',
]);
export const BUILD_APPS = Object.freeze(['portfolio', ...DEMO_APPS]);
export const outputPath = app => app === 'portfolio' ? '' : `demos/${app}/`;
