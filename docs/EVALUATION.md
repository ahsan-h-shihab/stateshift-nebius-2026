# Evaluation protocol and actual results

## Falsifiable claim, defined before live evaluation

Within the four explicit order contracts, StateShift can detect incorrect final outcomes and forbidden intermediate state changes in recorded tool trajectories, while preserving enough evidence to reproduce the failure without another model call.

Pass condition: all known faults in the authored test set are identified with no false failures among its valid controls. Compare against (1) checking whether the requested tool name appears, and (2) comparing final state only. This is a limited checker claim. The fixtures are deliberately diagnostic and are not a random sample of production incidents.

## Completed

`node --test tests/*.test.mjs`: **27 passed, 0 failed** at the last recorded run. Network behavior is tested with explicit test doubles; these results do not validate live Nebius inference.

`node scripts/evaluate-fixtures.mjs`: 12 authored traces, 8 faulty and 4 valid.

| Checker | Correct classifications | False passes |
|---|---:|---:|
| Requested tool-name presence | 5/12 | 7 |
| Final state only | 11/12 | 1 |
| Final state plus trajectory | 12/12 | 0 |

The additional trajectory check catches a temporary wrong address that is later replaced with the correct one. The data and full per-case outcomes are in `evidence/fixture-evaluation.json`. These results establish checker behavior on the authored fixtures only. They do not establish statistical superiority, multilingual robustness, or any model failure rate.

The browser-exported synthetic regression was executed and failed at the unauthorized 18,000 KZT refund assertion, as intended. The UI was inspected for the before/after diff and for a blocked refund under fixed-trace contract replay.

## Live protocol

Run `node scripts/probe.mjs` first with a server-side `NEBIUS_API_KEY`. Then `node scripts/evaluate.mjs`; optionally set `EVAL_REPETITIONS=3`. Every trial uses the same model, system prompt and settings, with fresh state for reference and variant. Report completed and failed trials separately; retain all errors. Do not select only successful or dramatic traces for the headline.

Record: exact prompt, model/request IDs, token usage, wall-clock latency, final correctness, trajectory safety, paired divergence, gate replay outcome, and full tool trace. Estimate token cost from the saved catalog rate; actual billing may include failed retries. Repeat failures before attributing them to language, even with temperature zero.

Candidate mutations require semantic review before testing. Author-provided translations have not received independent native-speaker validation. A translation that changes intent invalidates the paired comparison. Treat English as a reference input, not ground truth: the explicit contract defines ground truth.

No completed live evaluation was available when this report was authored. Do not replace this statement until a real saved evaluation supports the update.

## Limits

Only an in-memory order simulator is integrated. There is no payment, mail, production application, external agent adapter, or formal security proof. Hashes, signatures and tamper-proof attestation are not claimed. The gate relies on pre-authored exact permissions. Exported tests replay recorded proposals; they do not reproduce a model's stochastic generation. The earliest unsafe prefix is a prefix reducer, not a globally minimal or semantically equivalent prompt reducer.
