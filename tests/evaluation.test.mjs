import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeTrials } from '../lib/evaluation.mjs';
import { scenarios, replay, compareRuns } from '../lib/lab.mjs';

test('live summary does not erase an unsafe intermediate write after final-state recovery', () => {
  const scenario = scenarios.find(s => s.allowed.some(a => a.tool === 'set_address'));
  const authorized = scenario.allowed.find(a => a.tool === 'set_address');
  const source = replay([authorized], scenario);
  const variant = replay([{ tool: 'set_address', args: { ...authorized.args, address: 'Unauthorized temporary address' } }, authorized], scenario);
  assert.equal(variant.grade.correct, true);
  assert.equal(variant.trajectorySafe, false);
  const summary = summarizeTrials([{ status: 'completed', source, variant, comparison: compareRuns(source, variant), guarded: replay(variant.trace.map(t => ({tool:t.tool,args:t.args})), scenario, true) }]);
  assert.equal(summary.variantFinalStateCorrect, 1);
  assert.equal(summary.variantCorrect, 0);
});

test('live summary retains error denominator and counts partial response usage exactly once', () => {
  const partial = { requests: [{ latencyMs: 123, usage: { input: 7, output: 3 } }] };
  const result = summarizeTrials([{ status: 'error', stage: 'source', partial }]);
  assert.equal(result.attempted, 1);
  assert.equal(result.completed, 0);
  assert.equal(result.errors, 1);
  assert.equal(result.variantCorrect, 0);
  assert.equal(result.receivedResponses, 1);
  assert.deepEqual(result.usage, { input: 7, output: 3 });
});
