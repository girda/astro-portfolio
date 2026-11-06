import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isAllowedRequestSource} from '../cloud/request-source.mjs';
test('Access redirect navigation is allowed while cross-site APIs and writes stay blocked', () => {
  const headers = {'sec-fetch-site':'cross-site','sec-fetch-mode':'navigate','sec-fetch-dest':'document'};
  const request = (path='/', method='GET', extra={}) => new Request('https://cms.example'+path, {method,headers:{...headers,...extra}});
  assert.equal(isAllowedRequestSource(request()),true);
  assert.equal(isAllowedRequestSource(request('/account.html')),true);
  for(const method of ['POST','PUT','PATCH','DELETE']) assert.equal(isAllowedRequestSource(request('/',method)),false);
  assert.equal(isAllowedRequestSource(request('/api/me')),false);
  assert.equal(isAllowedRequestSource(request('/', 'GET', {'sec-fetch-mode':'cors'})),false);
  assert.equal(isAllowedRequestSource(request('/', 'GET', {'sec-fetch-dest':'iframe'})),false);
  assert.equal(isAllowedRequestSource(request('/', 'GET', {origin:'https://other.example'})),false);
  assert.equal(isAllowedRequestSource(request('/api/me','PUT',{'sec-fetch-site':'same-origin',origin:'https://cms.example'})),true);
});
