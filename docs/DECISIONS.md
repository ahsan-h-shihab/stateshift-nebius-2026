# StateShift decision log

2026-10-28, Asia/Qyzylorda. New project; no existing research code reused.

## Selection

Initial research was bounded to the first approximately 45 minutes; implementation of the provider-independent harness began while the runtime credential was pending. The final feasibility gate remains an authenticated Nebius tool-call run. Do not describe that gate as passed until evidence exists.

Eight concepts considered across all four tracks:

| Concept | Track | Decision |
|---|---|---|
| StateShift: mixed-language requests → state counterexamples → regression tests | Coding & Agentic Engineering | Selected provisionally: fits evaluation strengths; small executable domain; observable outcome |
| Evidence receipts for personal-agent actions | Personal AI | Reject broad form: strong overlap with audit/approval products and AEGIS |
| Dataset leakage investigator with reproducible split repair | Coding & Agentic Engineering | Shortlist: measurable, but weak live-demo immediacy and novelty risk |
| Multilingual support-workflow contract compiler | Best Apps & Agents | Shortlist: concrete audience, but semantic contract extraction is difficult to validate quickly |
| Citation-and-number verifier for research manuscripts | Best Apps & Agents | Reject: crowded verification category; source coverage bottleneck |
| Private memory contradiction resolver | Personal AI | Reject: persistent-memory agents are common; limited measurable benefit in two days |
| Robot instruction consequence inspector | Physical AI | Reject: simulator setup and credible control evaluation exceed available proof time |
| Edge maintenance evidence agent | Physical AI | Reject: no verified sensor/robot stream; high risk of a staged demonstration |

Prospective scores, **not judge scores or measured outcomes**. Equal weighting, 1–5:

| Finalist | Implementation | Design | Impact | Idea | Mean |
|---|---:|---:|---:|---:|---:|
| StateShift | 4.3 | 4.4 | 4.0 | 4.0 | 4.175 |
| Dataset leakage investigator | 4.1 | 3.5 | 4.1 | 3.5 | 3.80 |
| Multilingual workflow contract compiler | 3.5 | 4.1 | 4.2 | 3.6 | 3.85 |

StateShift's advantage is a narrow debugging workflow, not a claim to invent multilingual evaluation. Feasibility is high for a controlled sandbox; external-agent integrations and universal safety certification are out of scope. NVIDIA's model is the actual tool-using agent under test and can generate candidate variants. Removing the real Nebius inference removes the live experiment. A single prompt cannot execute paired isolated tool loops, inspect every transition, apply a fixed-trace counterfactual gate, and emit a replayable regression artifact.

## Prior art and competitive evidence

- [Official gallery](https://nebiusglobalaihackathon.devpost.com/project-gallery): unpublished when checked. No comprehensive competitor census is claimed.
- [AEGIS](https://devpost.com/software/aegis-secure-ai-agent-cockpit): published entry describes memory, tool-call interception, and human approval. This rules out presenting an approval cockpit as our novelty. We did not independently test its implementation.
- [VeritasAI](https://devpost.com/software/veritasai-autonomous-truth-intelligence): published entry describes web-grounded claim decomposition and an evidence dossier. We did not verify its performance claims.
- [τ-bench](https://github.com/sierra-research/tau2-bench): already evaluates stateful tool-agent interactions and multilingual tasks. State-based scoring and multilingual evaluation are established prior art.
- [AgentDojo](https://github.com/ethz-spylab/agentdojo): dynamic environments for prompt-injection attack/defense evaluation. Agent traces and executable environments are established.
- [MLCL / Lost in Execution](https://arxiv.org/abs/2601.05366): identifies multilingual parameter-value execution mismatches. This supports testing tool effects, but does not establish a defect in the model used here.
- [Code-Switching Red-Teaming](https://arxiv.org/abs/2406.15481): code-switching attacks predate this project. We cannot claim discovery of that risk.

Gap hypothesis: small teams need an approachable inspector that connects reviewed mixed-language inputs to exact state diffs and a regression file. This is an inference from the reviewed sources, not an exhaustive novelty proof or validated customer demand.

## Engineering choices

- Browser → server-only Nebius client → allowlisted sandbox tools → deterministic assertions.
- One NVIDIA model, no routing to alternative providers. Fixed official API host; redirects rejected.
- Four authored workflows and three mixed-language variants each. Native-speaker validation remains pending.
- The optional gate gets an explicit human-defined contract, not a model-derived permission claim.
- Fixed-trace replay isolates the gate's effect. It is not an adaptive guarded-agent benchmark.
- No hidden live-to-fixture fallback. Fixture labels remain visible and fixture results never enter the live evidence shelf.
- Per-call timeout 25 seconds, at most one transient HTTP retry, six turns and twelve tool calls per agent run.
- Public inference reservations in D1: 40 operations/day globally and 10/day per daily-hashed IP. A custom unrestricted judge build can run with the judge's or entrant's key; keep it available through judging.
- Runtime secrets belong in environment configuration. Source, evidence and browser assets contain no key.

## Inspection

The parent workspace was empty and was not a Git repository. E: had about 11.7 GB available. Python 3.12.1 and Node 24.16.0 were available. The Docker executable existed but no working server was confirmed; no Docker or WSL dependency was introduced. A new isolated application lives under `stateshift/app-site`. A parent Git repository was initialized during setup; it contains no prior projects.

Nebius catalog metadata was retrieved from the official public endpoint. Authenticated access, latency and request compatibility must be established by `scripts/probe.mjs` and live evidence, not inferred from catalog availability.
