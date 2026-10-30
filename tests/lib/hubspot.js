// Tiny HubSpot client for the live tests.
// Reads the token from HUBSPOT_TOKEN env var or requests/.env (never prints it).

import { existsSync, readFileSync } from 'node:fs';

export const BASE_URL = 'https://api.hubapi.com';
const ENV_FILE = new URL('../../requests/.env', import.meta.url);

function loadToken() {
  if (process.env.HUBSPOT_TOKEN) return process.env.HUBSPOT_TOKEN.trim();
  if (!existsSync(ENV_FILE)) return null;
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const match = line.match(/^\s*HUBSPOT_TOKEN\s*=\s*(.+?)\s*$/);
    if (match) return match[1].replace(/^["']|["']$/g, '');
  }
  return null;
}

export const token = loadToken();

// Pass as the `skip` option of a test: false when a token exists, otherwise the reason
export const skipLive = token ? false : 'no HUBSPOT_TOKEN in requests/.env (see docs/02-setup.md)';

/**
 * Send one request. Returns { status, headers, body } and never throws on HTTP errors,
 * so tests can assert on 4xx codes the same way you check them by hand.
 */
export async function hs(method, path, body, { auth = token } = {}) {
  const headers = { Authorization: `Bearer ${auth}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, headers: res.headers, body: data };
}

// Unique practice email following the naming rule in docs/02-setup.md
export function testEmail(day, tag = 'test') {
  return `hslearn+d${String(day).padStart(2, '0')}-${tag}-${Date.now()}@example.com`;
}

// Short readable string for assertion messages
export function describe(res) {
  const msg = res.body && typeof res.body === 'object' ? res.body.message : res.body;
  return `HTTP ${res.status}${msg ? `: ${String(msg).slice(0, 200)}` : ''}`;
}
