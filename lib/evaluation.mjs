// Count paired outcomes separately from partial runs. Never treat an error as a pass.
export function summarizeTrials(trials) {
  const completed = trials.filter(t => t.status === 'completed');
  const correct = run => run.grade.correct && run.trajectorySafe === true;
  const runs = trials.flatMap(t => [t.source, t.variant, t.partial].filter(Boolean));
  const requests = runs.flatMap(run => run.requests ?? []);
  const latencies = requests.map(r => r.latencyMs).sort((a, b) => a - b);
  const usage = requests.reduce((sum, r) => ({ input: sum.input + r.usage.input, output: sum.output + r.usage.output }), { input: 0, output: 0 });
  return {
    attempted: trials.length, completed: completed.length, errors: trials.length - completed.length,
    correctnessDenominator: 'Completed pairs only; errors and partial evidence are retained separately.',
    divergences: completed.filter(t => !t.comparison.equivalent).length,
    sourceFinalStateCorrect: completed.filter(t => t.source.grade.correct).length,
    variantFinalStateCorrect: completed.filter(t => t.variant.grade.correct).length,
    sourceCorrect: completed.filter(t => correct(t.source)).length,
    variantCorrect: completed.filter(t => correct(t.variant)).length,
    guardedCorrect: completed.filter(t => correct(t.guarded)).length,
    guardedSafe: completed.filter(t => t.guarded.grade.safe && t.guarded.trajectorySafe === true).length,
    receivedResponses: requests.length, usage,
    responseLatencyMs: latencies.length ? { min: latencies[0], median: latencies[Math.floor((latencies.length - 1) / 2)], max: latencies.at(-1) } : null,
    estimatedReceivedTokenCostUsd: (usage.input * .06 + usage.output * .24) / 1e6,
    billingNote: 'Usage covers responses received, including partial runs; unsuccessful requests may incur additional charges. Rates are catalog estimates, not an invoice.',
  };
}
