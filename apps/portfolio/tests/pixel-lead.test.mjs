import test from 'node:test';
import assert from 'node:assert/strict';
import { enquiryText } from '../src/scripts/pixel-lead.ts';

test('заявка содержит только сообщения посетителя, без предложений и выдуманных цен модели', () => {
  const messages = [{ role: 'user', content: 'Ich brauche eine Website für Gartenpflege.' }, { role: 'assistant', content: 'Budget 800 Euro, morgen fertig.' }, { role: 'user', content: 'Mit einer Kontaktseite.' }];
  assert.equal(enquiryText(messages), 'Ich brauche eine Website für Gartenpflege.\n\nMit einer Kontaktseite.');
  assert.equal(enquiryText([]), '');
  assert.equal(enquiryText([{ role: 'user', content: 'x'.repeat(1501) }]), '');
});
