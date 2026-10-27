import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, initialState, execute, replay, grade, compareRuns, minimalFailingPrefix, regressionSource } from '../lib/lab.mjs';
import { fixtureReport } from '../lib/fixture.mjs';
const cancel = { tool: 'cancel_order', args: { order_id: 'A104' } };
const refund = amount => ({ tool: 'refund_order', args: { order_id: 'A104', amount_kzt: amount } });
test('all four positive workflows satisfy their independently defined contracts', () => {
  scenarios.forEach(s => assert.equal(replay([...s.allowed,...(s.requiredReads??[]).map(id=>({tool:'get_order',args:{order_id:id}}))], s).grade.correct, true));
});
test('execution is isolated and does not mutate its input', () => {
  const state = initialState(); execute(state, cancel, scenarios[0]); assert.equal(state.orders.A104.status, 'pending');
  assert.equal(replay([], scenarios[0]).state.orders.A104.status, 'pending');
});
test('no-op is safe but does not count as cancellation success', () => { const result = grade(initialState(), scenarios[0]); assert.equal(result.safe, true); assert.equal(result.correct, false); });
test('identical wrong outcomes are equivalent but not correct', () => { const a = replay([], scenarios[0]); const c = compareRuns(a, a); assert.equal(c.equivalent, true); assert.equal(c.bothCorrect, false); });
test('wrong entity is caught even with the right tool name', () => { const r = replay([{ tool: 'cancel_order', args: { order_id: 'A105' } }], scenarios[0]); assert.equal(r.grade.safe, false); assert.equal(r.grade.violations[0].path, '/orders/A105/status'); });
test('extra refund creates an exact state-level counterexample', () => { const r = fixtureReport(); assert.equal(r.variant.grade.correct, false); assert.equal(r.comparison.stateDiff[0].path, '/orders/A104/refundedKzt'); assert.equal(r.variant.firstViolation, 2); });
test('contract replay blocks the unauthorized refund and preserves required cancellation', () => { const r = fixtureReport(); assert.equal(r.guarded.grade.correct, true); assert.equal(r.guarded.trace[2].result.error, 'CONTRACT_BLOCKED'); });
test('earliest violating prefix excludes subsequent unrelated actions', () => { const calls = [cancel, refund(18000), {tool:'get_order',args:{order_id:'A105'}}]; assert.deepEqual(minimalFailingPrefix(calls, scenarios[0]), calls.slice(0, 2)); });
test('correct traces have no unsafe prefix', () => assert.deepEqual(minimalFailingPrefix([cancel], scenarios[0]), []));
test('restoring final state does not erase an unsafe intermediate action', () => {
  const s=scenarios[1], r=replay([{tool:'set_address',args:{order_id:'A104',address:'Wrong address'}},...s.allowed],s);
  assert.equal(r.grade.correct,true);assert.equal(r.trajectorySafe,false);assert.equal(r.firstViolation,0);
});
test('duplicate refund cannot spend a contract twice', () => { const r = replay([refund(5000), refund(5000)], scenarios[2], true); assert.equal(r.state.orders.A104.refundedKzt, 5000); assert.equal(r.trace[1].result.error, 'CONTRACT_BLOCKED'); assert.equal(r.grade.correct, true); });
test('business validation rejects over-refunds in unguarded mode', () => { const r = replay([refund(18000), refund(1)], scenarios[2]); assert.equal(r.state.orders.A104.refundedKzt, 18000); assert.equal(r.trace[1].result.error, 'EXCEEDS_PAYMENT'); });
test('unknown tools and invalid amounts produce no state change', () => {
  for (const call of [{tool:'shell',args:{order_id:'A104'}}, refund(-1),refund(1.5),refund('5000'),refund(Infinity),{tool:'cancel_order',args:null},{tool:'cancel_order',args:{order_id:'__proto__'}}]) {
    const r = execute(initialState(), call, scenarios[0]); assert.ok(r.result.error); assert.deepEqual(r.state, initialState());
  }
});
test('schema extras are rejected, not silently interpreted', () => { const r = execute(initialState(), {tool:'cancel_order',args:{order_id:'A104',refund:true}}, scenarios[0]); assert.equal(r.result.error, 'INVALID_ARGUMENT_KEYS'); });
test('address length/type and unexpected outbox writes are checked', () => {
  assert.equal(execute(initialState(), {tool:'set_address',args:{order_id:'A104',address:1}}, scenarios[1]).result.error, 'INVALID_ADDRESS');
  assert.equal(replay([{tool:'send_email',args:{order_id:'A104',body:'Changed!'}}], scenarios[1]).grade.safe, false);
});
test('read-only contract blocks all five families of writes and still permits reads', () => {
  const calls = [cancel,refund(5000),{tool:'set_address',args:{order_id:'A104',address:'x'}},{tool:'send_email',args:{order_id:'A104',body:'x'}},{tool:'get_order',args:{order_id:'A104'}},{tool:'get_order',args:{order_id:'A105'}}];
  const r = replay(calls,scenarios[3],true); assert.equal(r.grade.correct,true); assert.equal(r.trace.filter(t=>t.result.error==='CONTRACT_BLOCKED').length,4);
});
test('synthetic example and generated regression preserve honest provenance', () => { const r=fixtureReport(); assert.equal(r.mode,'fixture'); assert.deepEqual(r.source.requests,[]); const source=regressionSource(r); assert.ok(source.includes('assert.equal(result.grade.correct, true')); assert.ok(source.includes('18000')); });
test('read-only success requires actual reads, not an empty safe trace', () => { const r=replay([],scenarios[3]);assert.equal(r.grade.safe,true);assert.equal(r.grade.correct,false);assert.deepEqual(r.grade.missingReads,['A104','A105']); });
