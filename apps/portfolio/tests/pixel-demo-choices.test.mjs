import test from 'node:test';
import assert from 'node:assert/strict';
import {localizeDemoChoice} from '../src/scripts/pixel-demo-choices.ts';
test('draft actions use the page language even when the model sends another language', () => {
  assert.equal(localizeDemoChoice(' Entwurf passt ', 'ru'), 'Всё верно');
  assert.equal(localizeDemoChoice('Ändern', 'ru'), 'Изменить');
  assert.equal(localizeDemoChoice('Всё верно', 'en'), 'Draft looks good');
  assert.equal(localizeDemoChoice('Change', 'de'), 'Ändern');
});
test('specific product and task choices keep their original meaning', () => {
  assert.equal(localizeDemoChoice(' Touring за 28 900 € ', 'ru'), 'Touring за 28 900 €');
  assert.equal(localizeDemoChoice('Изменить выбор блюда', 'ru'), 'Изменить выбор блюда');
});
