# D5 — Implementation

## Changes

- Added `CONTEXT.md` as the shared glossary for protocol modules, scenario
  definitions/descriptors, capability requests/grants, runs, exercise steps,
  evidence, traces, and verification results.
- Added `docs/architecture/scenario-manifest-contract.md` as a runtime-neutral
  candidate contract covering descriptor validation rules, executable artifact
  reference constraints, capability requests vs. grants, run lifecycle and
  failure states, evidence, verification scope, compatibility, and failure
  behavior.
- Added a synthetic OAuth JSON fixture, a Go test resolving its scenario ID
  against the module's `Scenarios()` catalog, and focused Vitest assertions.
  The frontend assertions guard candidate field shape, synthetic capability
  requests, and absence of embedded OAuth wire fields, credentials, commands,
  host paths, or URLs. Neither suite is a production schema validator.
- Linked the glossary and candidate contract from the domain, protocol lab, and
  product architecture docs; linked both artifacts from the ROAD-005 backlog.
- Kept scenario/step/check semantics with protocol modules and capability
  authorization with platform policy. The resource profile and module IDs in
  the sample are illustrative except `scenarioRef.id: missing-pkce`, which
  the Go test resolves against the module's current scenario catalog. Step/
  check references are not registered or resolved by the fixture test.
- Aligned `StartScenario` with the control-plane grant and adapter-created run
  seam. Added Stop cleanup semantics and glossary coverage; Stop removes run
  evidence/traces/secrets in line with ROAD-004 LAB-11. The learner view's
  explicit synthetic teaching-value allowance is distinguished from raw
  credential redaction under LAB-07.

## Deviations and limits

- The contract stays a candidate until independent skeptic and persona review.
- No runtime lifecycle, deployed schema validator, module registry, approved
  artifact resolver, or enforcement adapter was implemented. Those proofs and
  exact runtime limits remain ROAD-006 work.
