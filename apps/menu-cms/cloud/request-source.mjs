// Возврат из Access — внешняя навигация, а не запрос изменения данных.
export function isAllowedRequestSource(request) {
  const origin = request.headers.get('origin');
  if (origin !== null && origin !== new URL(request.url).origin) return false;
  if (request.headers.get('sec-fetch-site') !== 'cross-site') return true;
  return request.method === 'GET'
    && request.headers.get('sec-fetch-mode') === 'navigate'
    && request.headers.get('sec-fetch-dest') === 'document'
    && !new URL(request.url).pathname.startsWith('/api/');
}
