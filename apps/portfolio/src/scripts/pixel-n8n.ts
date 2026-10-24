type ChatStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type SessionScope = 'consult' | 'demo';
type ClientOptions = {
  getStorage?: () => ChatStorage;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

const sessionKey = 'hirda.pixel.n8n.session';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readN8nOutput(payload: unknown): string {
  // Chat Trigger возвращает объект либо массив результатов выполнения workflow.
  const items = Array.isArray(payload) ? payload : [payload];
  const output = items.find((item): item is { output: string } =>
    item !== null && typeof item === 'object' && 'output' in item &&
    typeof item.output === 'string' && Boolean(item.output.trim()),
  )?.output;

  if (!output || output.length > 4000) throw new Error('invalid_response');
  return output;
}

export function createN8nChatClient(endpoint: string, options: ClientOptions = {}) {
  const getStorage = options.getStorage ?? (() => window.sessionStorage);
  const fetcher = options.fetcher ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 60000;
  const sessions = new Map<SessionScope, string>();

  function getSessionId(scope: SessionScope): string {
    const cached = sessions.get(scope);
    if (cached) return cached;

    const key = `${sessionKey}.${scope}`;
    let stored: string | null = null;
    try { stored = getStorage().getItem(key); } catch { /* Хранилище может быть запрещено браузером. */ }
    const id = stored && uuidPattern.test(stored) ? stored : crypto.randomUUID();
    sessions.set(scope, id);
    try { getStorage().setItem(key, id); } catch { /* В этом случае сессия живёт до перезагрузки страницы. */ }
    return id;
  }

  return {
    getSessionId,
    resetSession(scope: SessionScope) {
      sessions.delete(scope);
      try { getStorage().removeItem(`${sessionKey}.${scope}`); } catch { /* Сброс памяти остаётся доступен. */ }
    },

    async send(chatInput: string, scope: SessionScope): Promise<{ text: string }> {
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify({ action: 'sendMessage', sessionId: getSessionId(scope), chatInput }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'rate_limited' : 'unavailable');

      let payload: unknown;
      try { payload = await response.json(); } catch { throw new Error('invalid_response'); }
      return { text: readN8nOutput(payload) };
    },
  };
}
