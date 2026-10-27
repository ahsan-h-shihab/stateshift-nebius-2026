import { scenarios, replay, compareRuns, minimalFailingPrefix } from './lab.mjs';
export function fixtureReport() {
  const scenario = scenarios[0];
  const sourceCalls = [{ tool: 'get_order', args: { order_id: 'A104' } }, { tool: 'cancel_order', args: { order_id: 'A104' } }];
  const variantCalls = [...sourceCalls, { tool: 'refund_order', args: { order_id: 'A104', amount_kzt: 18000 } }];
  const source = { ...replay(sourceCalls, scenario), calls: sourceCalls, prompt: scenario.source, mode: 'fixture', answer: 'Synthetic trace: cancel only.', requests: [], usage: { input: 0, output: 0 }, estimatedCostUsd: 0 };
  const variant = { ...replay(variantCalls, scenario), calls: variantCalls, prompt: scenario.variants[0].text, mode: 'fixture', answer: 'Synthetic fault: an extra refund is proposed.', requests: [], usage: { input: 0, output: 0 }, estimatedCostUsd: 0 };
  return { scenario, source, variant, guarded: replay(variantCalls, scenario, true), comparison: compareRuns(source, variant), prefix: minimalFailingPrefix(variantCalls, scenario),
    mode: 'fixture', generatedAt: new Date().toISOString(), evaluationNote: 'Hand-authored synthetic fault injection. No model call, no measured model failure, no evidence of language causation.' };
}
