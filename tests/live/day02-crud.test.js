// Day 2, steps 7 to 12: create, read, update, duplicate, archive one contact.
// Uses a fresh hslearn+d02-...@example.com email each run and archives it at the end.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hs, skipLive, testEmail, describe } from '../lib/hubspot.js';

test('Day 2 basic CRUD', { skip: skipLive }, async (t) => {
  const email = testEmail(2, 'crud');
  let id;

  t.after(async () => {
    // Safety net if a step failed before step 12
    if (id) await hs('DELETE', `/crm/v3/objects/contacts/${id}`);
  });

  await t.test('step 7: create contact -> 201 with an id', async () => {
    const res = await hs('POST', '/crm/v3/objects/contacts', {
      properties: { email, firstname: 'Test', lastname: 'Tester HSLearn' },
    });
    assert.equal(res.status, 201, describe(res));
    assert.match(res.body.id, /^\d+$/);
    assert.equal(res.body.properties.email, email);
    id = res.body.id;
  });

  await t.test('step 8: read by id with chosen properties -> 200', async () => {
    const res = await hs('GET', `/crm/v3/objects/contacts/${id}?properties=email,firstname,phone`);
    assert.equal(res.status, 200, describe(res));
    assert.equal(res.body.properties.firstname, 'Test');
    assert.ok('phone' in res.body.properties, 'asked-for properties come back, even when empty');
    assert.ok(!('lastname' in res.body.properties), 'properties you did not ask for are left out');
  });

  await t.test('step 9: read by email with idProperty=email -> 200, same id', async () => {
    // A brand new email can take a moment to become readable by email, so allow a few tries
    let res;
    for (let attempt = 0; attempt < 5; attempt++) {
      res = await hs('GET', `/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`);
      if (res.status !== 404) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    assert.equal(res.status, 200, describe(res));
    assert.equal(res.body.id, id);
  });

  await t.test('step 10: update only firstname -> 200, lastname unchanged', async () => {
    const res = await hs('PATCH', `/crm/v3/objects/contacts/${id}`, {
      properties: { firstname: 'Updated' },
    });
    assert.equal(res.status, 200, describe(res));
    assert.equal(res.body.properties.firstname, 'Updated');

    const check = await hs('GET', `/crm/v3/objects/contacts/${id}?properties=firstname,lastname`);
    assert.equal(check.body.properties.lastname, 'Tester HSLearn');
  });

  await t.test('step 11: create the same email again -> 409 with Existing ID', async () => {
    const res = await hs('POST', '/crm/v3/objects/contacts', { properties: { email } });
    assert.equal(res.status, 409, describe(res));
    assert.match(res.body.message, new RegExp(`Existing ID: ${id}`));
  });

  await t.test('step 12: archive -> 204, then reading it -> 404', async () => {
    const res = await hs('DELETE', `/crm/v3/objects/contacts/${id}`);
    assert.equal(res.status, 204, describe(res));

    const gone = await hs('GET', `/crm/v3/objects/contacts/${id}`);
    assert.equal(gone.status, 404, describe(gone));
    id = undefined;
  });
});
