// Helpers to read the OpenAPI spec and match real request paths against it.

import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

export const ROOT = new URL('../../', import.meta.url);
export const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export function readText(relPath) {
  return readFileSync(new URL(relPath, ROOT), 'utf8');
}

export function listFiles(relDir, suffix) {
  return readdirSync(new URL(relDir, ROOT)).filter((f) => f.endsWith(suffix)).sort();
}

export const spec = parse(readText('api/openapi.yaml'));

// Every operation as { method, path, op }
export const operations = Object.entries(spec.paths).flatMap(([path, item]) =>
  METHODS.filter((m) => item[m]).map((method) => ({ method, path, op: item[method] })));

// "/crm/v3/objects/contacts/{contactId}" -> regex where each {param} matches one segment
function pathRegex(specPath) {
  const pattern = specPath.split('/')
    .map((seg) => (/^\{.+\}$/.test(seg) ? '[^/]+' : seg.replace(/[.*+?^$()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${pattern}$`);
}

/**
 * Is METHOD + path documented? `path` may contain placeholders like {{contactId}} or {id}
 * and a query string; both are normalized first.
 */
export function findOperation(method, rawPath) {
  const path = rawPath.split('?')[0]
    .replace(/\{\{[^}]+\}\}/g, 'X')   // REST Client variables
    .replace(/\{[^}]+\}/g, 'X');      // roadmap placeholders
  return operations.find((o) => o.method === method.toLowerCase() && pathRegex(o.path).test(path));
}

/** All requests in a REST Client .http file as { method, path, line } */
export function requestsInHttpFile(text) {
  const out = [];
  text.split('\n').forEach((line, i) => {
    const m = line.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)/);
    if (m) out.push({ method: m[1], path: m[2].replace(/^\{\{baseUrl\}\}/, ''), line: i + 1 });
  });
  return out;
}

/** All `METHOD /path` endpoints written in backticks in a markdown file */
export function endpointsInMarkdown(text) {
  return [...text.matchAll(/`(GET|POST|PUT|PATCH|DELETE) (\/[^`\s]+)`/g)]
    .map((m) => ({ method: m[1], path: m[2] }));
}
