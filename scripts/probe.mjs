import { writeFile, mkdir } from 'node:fs/promises';
import { completion, MODEL } from '../lib/nebius.mjs';
const apiKey = process.env.NEBIUS_API_KEY;
await mkdir('evidence', { recursive: true });
if (!apiKey) { console.error('NEBIUS_API_KEY is absent. No inference attempted.'); process.exitCode = 2; }
else {
  try {
    const result = await completion([{ role: 'system', content: 'This is an API connectivity test. Respond briefly.' }, { role: 'user', content: 'Reply with the word READY.' }], { apiKey, toolset: [] });
    const evidence = { checkedAt: new Date().toISOString(), requestedModel: MODEL, ...result };
    await writeFile('evidence/nebius-probe.json', JSON.stringify(evidence, null, 2));
    console.log(JSON.stringify(evidence, null, 2));
  } catch (error) { console.error(JSON.stringify({ code: error.code ?? 'PROBE_FAILED', message: error.message })); process.exitCode = 1; }
}
