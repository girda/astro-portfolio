/** Пропущенные проекты добавляются в конец; опечатки и дубли не скрываем молча. */
export function resolveProjectOrder(ids: readonly string[], order: readonly string[]): string[] {
  const known = new Set(ids), seen = new Set<string>();
  for (const id of order) {
    if (!known.has(id)) throw new Error(`Unknown project "${id}" in project-order.json`);
    if (seen.has(id)) throw new Error(`Duplicate project "${id}" in project-order.json`);
    seen.add(id);
  }
  return [...order, ...ids.filter(id => !seen.has(id))];
}
