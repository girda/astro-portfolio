// Загрузка Turnstile и получение одноразового токена — разные этапы.
export function createVerificationGate(timeoutMs = 30_000) {
  let token = '';
  let failed = false;
  let pending: { resolve: (token: string) => void; reject: (error: Error) => void } | undefined;
  const failure = () => new Error('verification_failed');
  return {
    accept(value: string) {
      if (!value.trim()) return;
      failed = false;
      if (pending) {
        const waiter = pending; pending = undefined;
        waiter.resolve(value);
      } else token = value;
    },
    fail() {
      token = ''; failed = true;
      const waiter = pending; pending = undefined;
      waiter?.reject(failure());
    },
    reset() {
      token = ''; failed = false;
      const waiter = pending; pending = undefined;
      waiter?.reject(failure());
    },
    consume(): Promise<string> {
      if (failed || pending) return Promise.reject(failure());
      if (token) {
        const result = token; token = '';
        return Promise.resolve(result);
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending = undefined; reject(failure()); }, timeoutMs);
        pending = {
          resolve: value => { clearTimeout(timer); resolve(value); },
          reject: error => { clearTimeout(timer); reject(error); },
        };
      });
    },
  };
}

// Каждая отправка начинает новую проверку, включая повтор после предыдущей ошибки.
export async function requestVerification(
  gate: ReturnType<typeof createVerificationGate>,
  execute: () => void,
): Promise<string> {
  gate.reset();
  const pending = gate.consume();
  try { execute(); } catch { gate.fail(); }
  return pending;
}
