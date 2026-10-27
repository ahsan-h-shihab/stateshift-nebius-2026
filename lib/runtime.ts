import { env } from 'cloudflare:workers';
import { RuntimeError } from './nebius.mjs';
export function runtimeKey() { return env.NEBIUS_API_KEY || process.env.NEBIUS_API_KEY; }
export async function reserveRun(request: Request) {
  if (!runtimeKey()) throw new RuntimeError('NEBIUS_NOT_CONFIGURED', 'The server is waiting for its Nebius credential. Live inference is unavailable.', 503);
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) throw new RuntimeError('ORIGIN_REJECTED', 'Cross-site requests are disabled.', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new RuntimeError('INVALID_CONTENT_TYPE', 'Use application/json.', 415);
  if (!env.DB) throw new RuntimeError('BUDGET_STORE_UNAVAILABLE', 'The inference budget store is unavailable. No model call was made.', 503);
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const day = new Date().toISOString().slice(0, 10);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(day + ':' + ip)))).map(n => n.toString(16).padStart(2, '0')).join('');
  for (const [key, limit] of [[`ip:${day}:${hash}`, 10], [`global:${day}`, 40]] as const) {
    const result = await env.DB.prepare('INSERT INTO usage_windows (key, used) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET used = used + 1 WHERE used < ? RETURNING used').bind(key, limit).first();
    if (!result) throw new RuntimeError('DAILY_BUDGET', 'The public demo has reached its daily inference budget. Run locally with your own Nebius key or try tomorrow.', 429);
  }
}
export function routeError(error: unknown) {
  return Response.json(error instanceof RuntimeError ? { code: error.code, error: error.message } : { code: 'INTERNAL_ERROR', error: 'The run could not be completed. No result was substituted.' }, { status: error instanceof RuntimeError ? error.status : 500, headers: { 'Cache-Control': 'no-store' } });
}
