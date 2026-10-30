// Keeps the repo in sync: every request you can send, every endpoint in the roadmap,
// and every lesson file must be documented in Swagger and the README.
// If one of these fails after you add a lesson, update api/openapi.yaml or README.md.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findOperation, listFiles, readText, requestsInHttpFile, endpointsInMarkdown } from '../lib/spec.js';

const httpFiles = listFiles('requests/', '.http');

test('there is at least one lesson request file', () => {
  assert.ok(httpFiles.length > 0);
});

for (const file of httpFiles) {
  test(`requests/${file}: every request is documented in api/openapi.yaml`, () => {
    const missing = requestsInHttpFile(readText(`requests/${file}`))
      .filter((r) => !findOperation(r.method, r.path))
      .map((r) => `line ${r.line}: ${r.method} ${r.path}`);
    assert.deepEqual(missing, [], 'add these endpoints to api/openapi.yaml');
  });

  test(`requests/${file}: never contains a real token`, () => {
    assert.doesNotMatch(readText(`requests/${file}`), /pat-(na|eu|ap)\d+-[0-9a-f]{8}-/i);
  });
}

test('docs/03-roadmap.md: every endpoint is documented in api/openapi.yaml', () => {
  const missing = endpointsInMarkdown(readText('docs/03-roadmap.md'))
    .filter((e) => !findOperation(e.method, e.path))
    .map((e) => `${e.method} ${e.path}`);
  assert.deepEqual(missing, []);
});

test('README.md links every request file, live test, doc and note', () => {
  const readme = readText('README.md');
  const expected = [
    ...httpFiles.map((f) => `requests/${f}`),
    ...listFiles('tests/live/', '.test.js').map((f) => `tests/live/${f}`),
    ...listFiles('docs/', '.md').map((f) => `docs/${f}`),
    ...listFiles('notes/', '.md').map((f) => `notes/${f}`),
  ];
  const missing = expected.filter((p) => !readme.includes(p));
  assert.deepEqual(missing, [], 'add these to the README lesson table');
});

test('every lesson request file has a matching live test', () => {
  const tests = listFiles('tests/live/', '.test.js');
  const missing = httpFiles
    .map((f) => f.match(/^(\d+)-/)?.[1])
    .filter((day) => day && !tests.some((t) => t.startsWith(`day${day}-`)))
    .map((day) => `tests/live/day${day}-*.test.js`);
  assert.deepEqual(missing, []);
});
