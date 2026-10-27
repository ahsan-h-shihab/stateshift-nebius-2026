import { writeFile, mkdir } from 'node:fs/promises';
import { completion, MODEL, ENDPOINT } from '../lib/nebius.mjs';
const apiKey = process.env.NEBIUS_API_KEY;
await mkdir('evidence', { recursive: true });
const evidence = { checkedAt: new Date().toISOString(), provider: 'Nebius Token Factory', requestedModel: MODEL, endpoint: ENDPOINT, requestAttempted: false, verified: false, latencyMs: null, usage: null, error: null };
if (!apiKey) {
  evidence.status = 'blocked';
  evidence.error = { code: 'NEBIUS_NOT_CONFIGURED', message: 'NEBIUS_API_KEY is absent. No inference attempted.' };
  process.exitCode = 2;
}
else {
  const started = Date.now();
  evidence.requestAttempted = true;
  try {
    const result = await completion([{ role: 'system', content: 'This is an API connectivity test. Respond briefly.' }, { role: 'user', content: 'Reply with the word READY.' }], { apiKey, toolset: [] });
    Object.assign(evidence, { model: result.model, requestId: result.requestId, latencyMs: result.latencyMs, usage: result.usage, attempts: result.attempts });
    evidence.verified = /^READY[.!]?$/.test(String(result.message.content ?? '').trim());
    evidence.status = evidence.verified ? 'passed' : 'unexpected_response';
    evidence.responseCheck = evidence.verified ? 'Expected READY received' : 'A response was received but did not match READY';
    if (!evidence.verified) process.exitCode = 1;
  } catch (error) {
    evidence.status = 'failed';
    evidence.latencyMs = Date.now() - started;
    evidence.error = { code: error.code ?? 'PROBE_FAILED', message: error.code ? error.message : 'Probe failed. No result was substituted.' };
    process.exitCode = 1;
  }
}
const filename = `evidence/nebius-probe-${Date.now()}.json`;
await writeFile(filename, JSON.stringify(evidence, null, 2));
if (evidence.verified) await writeFile('evidence/nebius-probe.json', JSON.stringify(evidence, null, 2));
console.log(JSON.stringify({ file: filename, ...evidence }, null, 2));
