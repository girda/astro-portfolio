// При конфликте объединяем только изменённые поля, сохраняя чужие независимые правки.
export function mergeDraft(base, draft, latest) {
  const values = {}, conflicts = [];
  for (const key of Object.keys(draft)) {
    const changed = !Object.is(base[key], draft[key]);
    values[key] = changed ? draft[key] : latest[key];
    if (changed && !Object.is(base[key], latest[key]) && !Object.is(draft[key], latest[key])) conflicts.push(key);
  }
  return {values, conflicts};
}

export function selectProducts(catalogue, {categoryId = '', query = '', availability = 'all', sort = 'order'} = {}) {
  const categories = new Map(catalogue.categories.map(category => [category.id, category]));
  const search = query.trim().toLocaleLowerCase('ru');
  const result = catalogue.products.filter(product => {
    const category = categories.get(product.categoryId);
    const visible = product.available && category?.active;
    return (!categoryId || product.categoryId === categoryId)
      && `${product.name} ${product.description} ${category?.name || ''}`.toLocaleLowerCase('ru').includes(search)
      && (availability === 'all' || (availability === 'visible' ? visible : !visible));
  });
  const nameOrder = (a,b) => a.name.localeCompare(b.name,'de',{sensitivity:'base',numeric:true});
  return result.sort((a,b) => {
    if(sort === 'name') return nameOrder(a,b);
    if(sort === 'price-asc' && a.price !== b.price) return a.price-b.price;
    if(sort === 'price-desc' && a.price !== b.price) return b.price-a.price;
    return a.sortOrder-b.sortOrder || nameOrder(a,b);
  });
}
