// Checks that api/openapi.yaml is a well-formed, complete learning reference.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spec, operations } from '../lib/spec.js';

function resolve(ref) {
  assert.match(ref, /^#\//, `only local $refs are allowed: ${ref}`);
  return ref.slice(2).split('/').reduce((node, key) => node?.[key], spec);
}

test('spec is OpenAPI 3 with info, servers and bearer auth', () => {
  assert.match(spec.openapi, /^3\./);
  assert.ok(spec.info?.title && spec.info?.version);
  assert.ok(spec.servers.some((s) => s.url === 'https://api.hubapi.com'));
  assert.equal(spec.components.securitySchemes.bearerAuth.scheme, 'bearer');
});

test('every $ref points to something that exists', () => {
  const broken = [];
  (function walk(node, where) {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${where}[${i}]`));
    if (!node || typeof node !== 'object') return;
    if (typeof node.$ref === 'string' && resolve(node.$ref) === undefined) broken.push(`${where}: ${node.$ref}`);
    for (const [k, v] of Object.entries(node)) walk(v, `${where}.${k}`);
  })(spec, '$');
  assert.deepEqual(broken, []);
});

test('every operation has a unique operationId, summary, known tag, responses and plan steps', () => {
  const tagNames = new Set(spec.tags.map((t) => t.name));
  const seen = new Set();
  for (const { method, path, op } of operations) {
    const where = `${method.toUpperCase()} ${path}`;
    assert.ok(op.operationId, `${where}: missing operationId`);
    assert.ok(!seen.has(op.operationId), `${where}: duplicate operationId ${op.operationId}`);
    seen.add(op.operationId);
    assert.ok(op.summary, `${where}: missing summary`);
    assert.ok(op.tags?.length && op.tags.every((t) => tagNames.has(t)), `${where}: unknown tag`);
    assert.ok(Object.keys(op.responses ?? {}).length, `${where}: no responses`);
    assert.ok(Array.isArray(op['x-plan-steps']) && op['x-plan-steps'].length, `${where}: missing x-plan-steps`);
    assert.ok(op['x-plan-steps'].every((n) => Number.isInteger(n) && n >= 1 && n <= 70),
      `${where}: x-plan-steps must be workbook rows 1 to 70`);
  }
});

test('every API row of the workbook (1 to 70) is covered by some x-plan-steps', () => {
  // Rows that are not API calls: concepts, UI, setup (1-5), reading docs (44, 55), script (67)
  const NOT_API = new Set([1, 2, 3, 4, 5, 44, 55, 67]);
  const covered = new Set(operations.flatMap(({ op }) => op['x-plan-steps']));
  const missing = [];
  for (let row = 1; row <= 70; row++) if (!NOT_API.has(row) && !covered.has(row)) missing.push(row);
  assert.deepEqual(missing, [], 'add these workbook rows to x-plan-steps in api/openapi.yaml');
});

test('every {param} in a path is declared as a path parameter', () => {
  for (const { method, path, op } of operations) {
    const declared = [...(spec.paths[path].parameters ?? []), ...(op.parameters ?? [])]
      .map((p) => (p.$ref ? resolve(p.$ref) : p))
      .filter((p) => p.in === 'path')
      .map((p) => p.name);
    for (const [, name] of path.matchAll(/\{([^}]+)\}/g)) {
      assert.ok(declared.includes(name), `${method.toUpperCase()} ${path}: path param {${name}} not declared`);
    }
  }
});
