const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reservedCategoryIds = new Set(['all', 'favorites']);
const fail = message => { throw new Error(`Invalid menu catalogue: ${message}`); };
const text = (value, label, max) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(label);
};
const integer = (value, label, max) => {
  if (!Number.isSafeInteger(value) || value < 0 || value > max) fail(label);
};
function ids(rows, label) {
  if (!Array.isArray(rows)) fail(label);
  const result = new Set();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || row.id.length > 80 || !idPattern.test(row.id) || result.has(row.id)) fail(`${label}: invalid or duplicate id`);
    result.add(row.id);
  }
  return result;
}

// Общая граница данных для текущего меню и будущего хранилища CMS.
export function validateCatalogue(catalogue) {
  if (!catalogue || catalogue.schemaVersion !== 1) fail('schemaVersion');
  const categoryIds = ids(catalogue.categories, 'categories');
  ids(catalogue.products, 'products');
  ids(catalogue.extras, 'extras');
  for (const category of catalogue.categories) {
    if (reservedCategoryIds.has(category.id)) fail('virtual filters cannot be categories');
    text(category.name, 'category name', 100);
    text(category.symbol, 'category symbol', 24);
    integer(category.sortOrder, 'category sortOrder', 100000);
    if (typeof category.active !== 'boolean') fail('category active');
  }
  for (const product of catalogue.products) {
    if (!categoryIds.has(product.categoryId)) fail(`unknown category for ${product.id}`);
    text(product.name, 'product name', 160);
    text(product.description, 'product description', 3000);
    text(product.allergens, 'product allergens', 1000);
    // Цены — целые евроценты: дробное число не должно попасть в расчёт корзины.
    integer(product.price, 'product price in cents', 10000000);
    integer(product.time, 'preparation time', 1440);
    integer(product.sortOrder, 'product sortOrder', 100000);
    if (typeof product.available !== 'boolean') fail('product available');
    // На первом этапе используются только локальные изображения меню, без произвольных URL.
    if (typeof product.image !== 'string' || !/^[a-z0-9][a-z0-9-]*\.webp$/.test(product.image)) fail('product image filename');
  }
  for (const extra of catalogue.extras) {
    text(extra.name, 'extra name', 100);
    integer(extra.price, 'extra price in cents', 10000000);
  }
  return catalogue;
}
