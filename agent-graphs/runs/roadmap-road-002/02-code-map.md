# D2 â€” ROAD-002 materials map
> **Historical run artifact:** The initial human-session recommendation was superseded by [ADR-007](../../../docs/adr/007-synthetic-persona-review-policy.md) and [the owner decision](09-owner-decision.md). Human reviewers are not part of the active process; actual usability and demand remain unknown.


**Purpose:** Identify the existing assets required to run the study without duplicating work.

**Inputs:** `01-scope.md`, ROAD-001 output, application source.

## Reusable assets

- Canonical facilitator script, task prompts, consent/safety instructions,
  per-participant scorecard, and synthesis template:
  `docs/research/user-task-validation.md`.
- Current app surfaces and navigation: `web/src/main.tsx`.
- OAuth scenario execution and event inspection: OAuth tool in
  `web/src/main.tsx` and adapter in `web/src/protocols/oauth.ts`.
- Boundary-specific tasks: `web/src/components/JwtInspector.tsx`,
  `web/src/components/RequestInspector.tsx`, and
  `web/src/components/SamlReplayLab.tsx`.
- Participant target personas: `docs/product/personas.md`.

## State

- **Observed:** ROAD-001 guide is committed in `719013f`; no participant
  results exist.
- **Observed:** user-task guide requires a human participant cohort for ROAD-002.
- **Observed:** the product owner selected the strict unanimous threshold and
  asked for an agent to simulate the persona perspectives.
- **Unknown:** who will participate in any later human sessions and when they
  can be run.

**Next:** D3 defines the completion gate for ROAD-002.
