// Day 1, steps 5 and 6: the token works and has every scope the course needs.
// Read only: creates nothing in HubSpot.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hs, skipLive, describe } from '../lib/hubspot.js';

test('Day 1 setup', { skip: skipLive }, async (t) => {
  await t.test('step 6: token works (GET contacts, limit 1) -> 200', async () => {
    const res = await hs('GET', '/crm/v3/objects/contacts?limit=1');
    assert.equal(res.status, 200, describe(res));
    assert.ok(Array.isArray(res.body.results));
  });

  await t.test('account details return the Hub ID -> 200', async () => {
    const res = await hs('GET', '/account-info/v3/details');
    assert.equal(res.status, 200, describe(res));
    assert.equal(typeof res.body.portalId, 'number');
  });

  await t.test('wrong token -> 401', async () => {
    const res = await hs('GET', '/crm/v3/objects/contacts?limit=1', undefined, { auth: 'wrong-token-123' });
    assert.equal(res.status, 401, describe(res));
  });

  // 403 here means the private app is missing that scope (docs/02-setup.md, step 5)
  await t.test('scope crm.objects.companies.read -> 200', async () => {
    const res = await hs('GET', '/crm/v3/objects/companies?limit=1');
    assert.equal(res.status, 200, describe(res));
  });

  await t.test('scope crm.schemas.contacts.read -> 200', async () => {
    const res = await hs('GET', '/crm/v3/properties/contacts/groups');
    assert.equal(res.status, 200, describe(res));
  });

  await t.test('scope crm.schemas.companies.read -> 200', async () => {
    const res = await hs('GET', '/crm/v3/properties/companies/groups');
    assert.equal(res.status, 200, describe(res));
  });
});
