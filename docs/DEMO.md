# Demo plan — target 2:35

Record only after live runtime and final deployment are verified. Use real model output, including a passing result if no genuine language divergence is observed. Never imply that the synthetic fixture is a model failure.

| Time | Screen / action | Suggested narration |
|---|---|---|
| 0:00–0:20 | Actual live trace with a concrete state diff, or a clearly labeled synthetic fault if no live failure exists | “A support agent can sound right and still change the wrong state. StateShift shows exactly what happened, down to the order, amount and action.” |
| 0:20–0:40 | Show source, language variant and explicit contract | “Here the request permits only one cancellation. No refund. No email. Both requests start from the same state.” |
| 0:40–1:20 | Run the real comparison; show provider status and calls | “NVIDIA Nemotron on Nebius chooses the tools. These are actual sandbox executions. Our checker reads the state, not the agent's confidence.” |
| 1:20–1:45 | Inspect results; show pass or actual failure honestly | “Equivalence and correctness are separate. Even if both versions make the same mistake, the contract catches it.” |
| 1:45–2:05 | Contract replay, then exported regression in terminal | “Replay isolates what the contract gate would block. The exported test reproduces this recorded trace without paying for another model call.” |
| 2:05–2:25 | Actual evaluation table and provenance | “Our authored checker suite contains twelve traces. Here is the measured result, and here are the limits. Live model trials are reported separately.” |
| 2:25–2:35 | App + public repository | “StateShift: change the language, test the consequences.” |

Capture the app operating for at least a minute. Keep keys, environment panels, unrelated browser tabs and private desktop content out of frame. No third-party music or logos needed. If inference is slow, state that a time cut occurred; preserve enough raw recording to substantiate the run.

Before upload: verify audible English narration, readable captions for non-English inputs, duration <180 seconds, public YouTube visibility, and an unauthenticated playback test. Do not upload a slides-only or synthetic-only video as the required live demo.
