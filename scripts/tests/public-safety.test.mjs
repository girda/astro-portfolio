import test from 'node:test';
import assert from 'node:assert/strict';
import { htmlSafetyIssues } from '../public-safety.mjs';
test('demo forms have no network fallback when JavaScript is absent', () => {
  assert.deepEqual(htmlSafetyIssues('<form method="dialog"><button type="submit">Preview</button></form>'), []);
  assert.deepEqual(htmlSafetyIssues("<form method='dialog'><button formmethod='get'>Send</button></form>"), ['network_form_override']);
  assert.deepEqual(htmlSafetyIssues('<form><input name="contact"></form>'), ['network_form_submission']);
  assert.deepEqual(htmlSafetyIssues('<form method="post">'), ['network_form_submission']);
});
test('generated pages do not reintroduce Google font connections or visit timestamps', () => {
  assert.deepEqual(htmlSafetyIssues('<link href="https://fonts.googleapis.com/css2?family=Manrope"><script>localStorage.setItem("hirda:last-visit",0)</script>'), ['external_google_fonts', 'unrequested_visit_storage']);
  assert.deepEqual(htmlSafetyIssues('<link href="/fonts/fonts.css">'), []);
});

import {isPublicAssetAllowed} from '../public-assets.mjs';
test('public build excludes only the uncleared originals, keeping replacement media and similar names',()=>{
 assert.equal(isPublicAssetAllowed('demos/barbershop/images/cut-01.jpeg'),false);
 assert.equal(isPublicAssetAllowed('demos/barbershop/images/cut-04.jpg'),false);
 assert.equal(isPublicAssetAllowed('demos/barbershop/images/barbershop.webp'),false);
 assert.equal(isPublicAssetAllowed('previews/barbershop.jpg'),false);
 assert.equal(isPublicAssetAllowed('previews/barbershop-2026.png'),false);
 assert.equal(isPublicAssetAllowed('previews/barbershop.png'),true);
 assert.equal(isPublicAssetAllowed('previews/barbershop-mobile.png'),true);
 assert.equal(isPublicAssetAllowed('demos/barbershop//images/cut-01.jpeg'),false);
 assert.equal(isPublicAssetAllowed('demos/barbershop/images/celebrities/a.jpg'),false);
 assert.equal(isPublicAssetAllowed('demos/barbershop/images/celebrities-other/a.jpg'),true);
 assert.equal(isPublicAssetAllowed('demos/barbershop/images/barber-fade-2026.webp'),true);
 assert.equal(isPublicAssetAllowed('demos/khlibnyi/assets/bakery-counter-2026.webp'),true);
});
