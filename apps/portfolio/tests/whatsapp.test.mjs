import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWhatsAppUrl } from '../src/scripts/whatsapp.ts';

test('WhatsApp preserves Cyrillic, multiline text and punctuation in the prepared message', () => {
  const url = new URL(buildWhatsAppUrl('+49 123 456', ' Анна ', 'Новый сайт', 'Каталог & запись\nДля салона', 'ru'));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/49123456');
  assert.equal(url.searchParams.get('text'), 'Привет, Артём! Меня зовут Анна.\n\nТема: Новый сайт\n\nКаталог & запись\nДля салона');
});

test('WhatsApp keeps existing German and English messages', () => {
  for (const [locale, greeting] of [['de', 'Hallo Artem, ich bin'], ['en', 'Hi Artem, I’m']]) {
    const url = new URL(buildWhatsAppUrl('49123456', 'Alex', 'Website', 'Hello', locale));
    assert.ok(url.searchParams.get('text').startsWith(`${greeting} Alex.`));
  }
});
