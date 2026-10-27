import { scenarios, replay, compareRuns, minimalFailingPrefix } from '../../../lib/lab.mjs';
import { runAgent, RuntimeError } from '../../../lib/nebius.mjs';
import { runtimeKey, reserveRun, routeError } from '../../../lib/runtime';
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 4000) throw new RuntimeError('INPUT_TOO_LONG', 'The request is too long.', 413);
    let body;
    try { body = JSON.parse(text); } catch { throw new RuntimeError('INVALID_JSON', 'The request must contain valid JSON.', 400); }
    const scenario = scenarios.find(s => s.id === body.scenarioId);
    if (!scenario || typeof body.variant !== 'string' || body.variant.trim().length < 8 || body.variant.length > 1600) throw new RuntimeError('INVALID_INPUT', 'Choose a scenario and enter a variant between 8 and 1,600 characters.', 400);
    if (body.equivalenceConfirmed !== true) throw new RuntimeError('REVIEW_REQUIRED', 'Confirm the variant preserves the source request and explicit contract.', 400);
    await reserveRun(request);
    const encoder = new TextEncoder(); const apiKey = runtimeKey();
    const stream = new ReadableStream({ async start(controller) {
      let connected = true;
      const emit = (event: unknown) => { if (connected) try { controller.enqueue(encoder.encode(JSON.stringify(event) + '\n')); } catch { connected = false; } };
      try {
        emit({ type: 'stage', stage: 'source', message: 'Running the English request against a fresh store…' });
        const source = await runAgent(scenario.source, scenario, { apiKey }); emit({ type: 'source', run: source });
        if (!connected) return;
        emit({ type: 'stage', stage: 'variant', message: 'Resetting the store and running the language variant…' });
        const variant = await runAgent(body.variant.trim(), scenario, { apiKey }); emit({ type: 'variant', run: variant });
        const guarded = replay(variant.calls, scenario, true);
        emit({ type: 'complete', report: { scenario, source, variant, guarded, comparison: compareRuns(source, variant),
          prefix: minimalFailingPrefix(variant.calls, scenario), generatedAt: new Date().toISOString(), mode: 'live',
          evaluationNote: 'The contract replay re-executes the same proposed tool calls. It is not a second adaptive agent run. Translations are author-created pilot inputs; confirm equivalence before running.' } });
      } catch (error) { emit({ type: 'error', code: error instanceof RuntimeError ? error.code : 'RUN_FAILED', message: error instanceof RuntimeError ? error.message : 'The run failed. No result was substituted.', partial: error instanceof RuntimeError ? error.partial : null }); }
      finally { if (connected) controller.close(); }
    } });
    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) { return routeError(error); }
}
