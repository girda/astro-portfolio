// Проверка одноразового токена: ошибка сети никогда не разрешает доступ.
export async function verifyTurnstile(token, { secret, hostname, ip, fetchImpl = fetch }) {
  if (!secret || !hostname || typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && result.action === 'pixel_chat' && result.hostname === hostname;
  } catch { return false; }
}
