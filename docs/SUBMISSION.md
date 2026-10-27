# Devpost draft — pending live validation

**Project:** StateShift

**Tagline:** Change the language. Catch the change in what your agent does.

**Track:** Coding and Agentic Engineering (developer testing tool). Confirm this classification against final functionality; Best Apps and Agents is the fallback if organizers construe the coding track as requiring a code-writing agent.

## Inspiration

An agent can sound helpful while changing the wrong record, refunding the wrong amount, or doing something the user explicitly prohibited. Mixed-language requests add another place for intent and execution to diverge. We wanted developers to inspect consequences rather than trust a fluent answer.

## What it does

StateShift runs an English reference and a reviewed code-switched variant against fresh copies of a small order-management store. It shows every tool call, each state transition, and whether the result matches an explicit contract. Developers can inspect the first unauthorized change, replay the proposals through a deterministic contract gate, and export an executable regression test.

## How we built it

The interface uses React and Vinext. A server-only client targets NVIDIA Nemotron 3.5 Lightning through Nebius Token Factory. The agent has five tools: read an order, cancel it, refund an amount, change its address, and append to a simulated outbox. A shared JavaScript engine executes and grades the state transitions. Cloudflare D1 keeps atomic public inference-budget reservations. The deterministic core also runs directly in Node.

The model is responsible for choosing actions from language, not scoring itself. Nebius is the required live inference runtime. Synthetic fixtures are explicitly labeled and cannot silently substitute for a failed live call.

## Validation and accomplishments

At the time of drafting: 29 automated tests pass. On 12 authored diagnostic traces, state-and-trajectory checks classify 12 correctly, compared with 5 for tool-name presence and 11 for final-state-only checks. This is a checker evaluation, not a claim about Nemotron's multilingual performance.

**Before submission:** replace this paragraph with a concise factual account of completed live experiments, including failures, the exact model ID and the measured latency/cost range. Link the saved evidence. Do not submit with this instruction or with missing evidence.

## Challenges and lessons

Two requests can produce identical states and still both be wrong. A safe refusal can also fail the requested task. We score equivalence, completion and unauthorized changes separately. A final-state check alone can miss a temporary unauthorized write, so the inspector retains the full trajectory.

## Limits and next steps

This is a four-workflow synthetic sandbox pilot. Native-speaker review, external application adapters, repeated trials and broader benchmarks remain future work. We build on established multilingual agent evaluation and attack-testing work; our focus is the debugging and regression workflow.

## Required final fields

- Public repository URL: https://github.com/ahsan-h-shihab/stateshift-nebius-2026
- Hosted preview URL: https://stateshift-agent-lab.kind-cocoa-2388.chatgpt.site/ — publicly verified, but live inference is still blocked. Do not represent the preview as a qualifying completed demo yet.
- Public YouTube URL, duration under 3 minutes: PENDING RECORDING/UPLOAD.
- Team/entrant details: complete from the entrant's actual account.
- NVIDIA/Nebius feedback: describe only real integration observations after the probe and runs.
- New project: created during the submission period; no pre-existing research project represented as new.
