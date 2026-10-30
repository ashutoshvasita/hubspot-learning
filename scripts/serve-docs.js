// Serves Swagger UI for api/openapi.yaml at http://localhost:4000
// and forwards /hubspot/* to https://api.hubapi.com so "Try it out" works
// (HubSpot does not allow direct calls from a browser page).
// Usage: npm run docs   (PORT=5000 npm run docs to change the port)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = new URL('..', import.meta.url);
const HUBSPOT = 'https://api.hubapi.com';

// Headers worth passing back to the browser so you can see them in Swagger
const PASS_BACK = ['content-type', 'retry-after', 'x-hubspot-ratelimit-remaining',
  'x-hubspot-ratelimit-max', 'x-hubspot-ratelimit-interval-milliseconds',
  'x-hubspot-ratelimit-daily-remaining', 'x-hubspot-correlation-id'];

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

async function proxy(req, res) {
  const target = HUBSPOT + req.url.slice('/hubspot'.length);
  const headers = {};
  if (req.headers.authorization) headers.authorization = req.headers.authorization;
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readBody(req);
  const upstream = await fetch(target, { method: req.method, headers, body });

  const out = {};
  for (const name of PASS_BACK) {
    const value = upstream.headers.get(name);
    if (value) out[name] = value;
  }
  res.writeHead(upstream.status, out);
  res.end(Buffer.from(await upstream.arrayBuffer()));
  console.log(`${req.method} ${req.url.slice('/hubspot'.length)} -> ${upstream.status}`);
}

async function sendFile(res, path, type) {
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(await readFile(new URL(path, ROOT)));
}

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/hubspot/')) return await proxy(req, res);
    if (req.url === '/' || req.url === '/index.html') return await sendFile(res, 'docs/swagger.html', 'text/html');
    if (req.url === '/openapi.yaml') return await sendFile(res, 'api/openapi.yaml', 'text/yaml');
    res.writeHead(404).end('Not found');
  } catch (err) {
    console.error(err);
    res.writeHead(502, { 'content-type': 'application/json' })
      .end(JSON.stringify({ status: 'error', message: `Proxy error: ${err.message}` }));
  }
});

// Bind to localhost only: the proxy forwards your token, so it must not be reachable from the network
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Swagger UI: http://localhost:${PORT}  (Ctrl+C to stop)`);
});
