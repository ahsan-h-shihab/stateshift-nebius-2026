# StateShift

**Change the language. Test the consequences.**

A multilingual agent regression lab: paired requests, isolated state, deterministic checks, and executable evidence.

## Current status

The [public preview](https://stateshift-agent-lab.kind-cocoa-2388.chatgpt.site/) and [source repository](https://github.com/ahsan-h-shihab/stateshift-nebius-2026) are available. The server-only Nebius integration is awaiting a credential and authenticated validation. Do not treat the labeled synthetic example as a model result. This is **not submission-ready** until the live runtime, evaluation and video are verified. See `docs/STATUS.md` and `docs/COMPLIANCE.md`.

## What it does

1. Choose one of four order-management contracts.
2. Review an English request and a Kazakh–English, Bangla–English or Russian–English variant. You can edit the variant or ask Nemotron to propose one; semantic review is required.
3. Run both requests through NVIDIA Nemotron on Nebius against independently reset stores.
4. Inspect tool calls, before/after state, unauthorized transitions, and missing required actions.
5. Re-execute the exact variant trace with an explicit contract gate. This is a fixed-trace counterfactual, not a separate adaptive-agent trial.
6. Download the evidence JSON and a Node regression test.

No real email, payment or customer data is used. Read-only cases require actual order reads; an empty trace does not pass them. Equivalent final states can both be wrong. A temporary unauthorized write remains a trajectory failure even if the final state is corrected.

## Run the deterministic core (no dependencies or key)

Requires Node.js 22.13 or newer; developed with Node 24.16.

```sh
node --test tests/*.test.mjs
node scripts/evaluate-fixtures.mjs
```

The 12-trace fixture evaluation is reproducible and explicitly synthetic. `regression.mjs` is the browser-exported synthetic failing trace: `node regression.mjs` is expected to exit nonzero on the unauthorized refund. It is excluded from the passing test suite.

## Start the application

```sh
npm ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_plain_vertigo.sql
npm run dev -- --host 127.0.0.1 --port 4187
```

Apply the initial migration only once per fresh local database. The local preview is at the URL printed by the server. Docker, WSL, GPU downloads and model weights are not required. Without a key, you can inspect the synthetic example; live controls remain disabled.

For local Workers inference, set the server key in an ignored `.dev.vars` file containing `NEBIUS_API_KEY=...`, or supply it through your runtime's environment injection. Use `.env.example` only as the key-name reference; never commit a real key or put it in a `NEXT_PUBLIC_` variable. Restart the preview after changing runtime secrets.

For CLI probes and evaluation, supply `NEBIUS_API_KEY` in the process environment:

```sh
node scripts/probe.mjs
node scripts/evaluate.mjs
```

The probe and evaluation create files under `evidence/`. Evaluation defaults to one repetition of twelve source/variant pairs; `EVAL_REPETITIONS=3` permits three. It refuses to run without the required credential. Inspect the probe before spending credits on the full evaluation.

## Nebius and NVIDIA

Fixed endpoint: `https://api.tokenfactory.nebius.com/v1/chat/completions`.

Model: `nvidia/Nemotron-3_5-Lightning`. The exact ID, active status, OpenMDW 1.1 license link and catalog prices were retrieved from Nebius's official public model catalog on 2026-10-28 (local time); see `evidence/nebius-catalog.json`. A catalog listing does not prove the entrant's authenticated access.

The NVIDIA model performs the actual tool-selection loop and optional candidate mutation. Tool results are returned to the model before its next decision. The five tools are `get_order`, `cancel_order`, `refund_order`, `set_address`, and `send_email` (simulated outbox only). All inference stays on Nebius; there is no substitute provider or silent fixture fallback.

Limits: six turns, twelve tool calls and 1,536 output tokens per call; 25-second request timeout; one retry only for selected transient HTTP statuses. Unknown network outcomes are not retried. Public inference is protected by persistent daily reservations (40 operations globally, 10 per daily-hashed IP). Both source and variant together use one reservation. Failed runs consume their reservation. Metered cost shown in reports is an estimate; failed requests and retries may add charges.

## Architecture

```text
React lab → server route → Nebius / NVIDIA Nemotron
                              ↕ tool-call loop
                         isolated order state
                              ↓
              exact contract + trajectory assertions
                              ↓
             paired diff → fixed-trace gate replay
                              ↓
                 JSON evidence + Node regression
```

`lib/lab.mjs` contains the pure simulator, contracts, state differ and regression export. `lib/nebius.mjs` contains the bounded model loop. `app/api/` exposes streaming comparison, candidate mutation and configuration status. D1 stores only quota counters, not prompts or credentials. Live evidence is held in the browser session until downloaded.

## Deployment

The provided Sites manifest and Worker entrypoint support Cloudflare deployment through the Sites workflow. Production `NEBIUS_API_KEY` must be configured as a runtime secret. The local and hosted environment are separate. A reusable test build can also be run using `npm start -- --port 4188` after building and applying the local database migration.

A public page with no credential is an honest preview, **not** a qualifying live hackathon demo. Maintain a working, free judge-access path through the end of judging; the public daily quota must not be the only available path.

## Evidence and limits

See `docs/EVALUATION.md` for actual tests and baseline results, `docs/DECISIONS.md` for prior art and concept selection, `docs/SUBMISSION.md` for the English submission draft, and `docs/DEMO.md` for the video script. The pilot translations have not been independently reviewed by native speakers. Do not claim population-level model superiority, universal safety, cryptographic attestation, or production integration.

## License

Original application code: MIT. Supplied Sites/Vinext scaffolding and vendored assets retain their license notices. Hosted model usage follows the model/provider terms; no model weights are redistributed.
