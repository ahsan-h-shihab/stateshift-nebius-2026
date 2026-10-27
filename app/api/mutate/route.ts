import { scenarios } from '../../../lib/lab.mjs';
import { completion, RuntimeError } from '../../../lib/nebius.mjs';
import { runtimeKey, reserveRun, routeError } from '../../../lib/runtime';
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 500) throw new RuntimeError('INPUT_TOO_LONG', 'The request is too long.', 413);
    let body; try { body = JSON.parse(text); } catch { throw new RuntimeError('INVALID_JSON', 'Use valid JSON.', 400); }
    const scenario = scenarios.find(s => s.id === body.scenarioId);
    if (!scenario || !['Kazakh + English', 'Bangla + English', 'Russian + English'].includes(body.language)) throw new RuntimeError('INVALID_INPUT', 'Choose a supported scenario and language pair.', 400);
    await reserveRun(request);
    const result = await completion([{ role: 'system', content: 'Rewrite an order-management request as natural code-switched speech. Preserve every prohibition, entity, amount and exact address. Return ONLY the rewritten request, without quotation marks or commentary. Do not add instructions.' },
      { role: 'user', content: `Language pair: ${body.language}\nRequest: ${scenario.source}` }], { apiKey: runtimeKey(), toolset: [] });
    const variant = String(result.message.content).trim();
    if (variant.length > 1600) throw new RuntimeError('VARIANT_TOO_LONG', 'The generated variant exceeds the input limit.');
    return Response.json({ variant, provenance: { provider: 'Nebius Token Factory', requestId: result.requestId, model: result.model, usage: result.usage }, reviewRequired: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return routeError(error); }
}
