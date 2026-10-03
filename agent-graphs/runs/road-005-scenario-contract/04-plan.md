# D4 — Selected plan

## Decisions

- Create an implementation-independent contract at
  `docs/architecture/scenario-manifest-contract.md` and a representative
  declarative OAuth sample. Keep the JSON representation explicitly
  **candidate** until a serialization/schema implementation is designed.
- Use a versioned `ScenarioDescriptor` that references (rather than contains)
  protocol-module scenario, variant, step, and verification IDs.
- Require an immutable artifact ID/version/digest reference only for executable
  mode; resolve trust through platform-managed policy, with verification proof
  left to ROAD-006. Synthetic mode has no artifact reference.
- Separate `CapabilityRequest` from policy-produced, run-bound
  `CapabilityGrant`; descriptor data is not authority.
- Model lifecycle on `ScenarioRun`; define operation preconditions, explicit
  states, repeated-call behavior, reset epoch, and terminal destruction.
- Keep resource/security policy data typed and bounded, use symbolic
  scenario-owned target IDs instead of arbitrary URLs, and defer exact numeric
  ceilings and runtime-specific enforcement to ROAD-006.
- Define Evidence and VerificationResult as scoped references to module-owned
  observations/checks, with explicit outcomes that do not claim full protocol
  conformance.
- Add the glossary to `CONTEXT.md`, align the architecture domain model and
  protocol module contract, and update ROAD-005's backlog artifact/status.
- Preserve ROAD-004's synthetic-only, no-durable-retention-by-default,
  fail-closed safety rules.

## Proof plan

- Validate the sample against the field rules by inspection; check that no
  OAuth semantics leaked into the shared control-plane descriptor.
- Check every lifecycle transition and failure path against ROAD-004 cleanup
  and audit requirements.
- Keep the JSON example as one checked-in fixture. Add a Go module test proving
  its scenario ID resolves against the current OAuth module, plus focused
  Vitest assertions for its candidate fields, synthetic-only capability
  request, and lack of embedded protocol messages or authority. These do not
  validate a production descriptor schema or illustrative references.
- Run Go and web test suites, the production build, Markdown links, and
  `git diff --check`; stage only ROAD-005 files.
- Obtain independent skeptic review and five-lens panel before calling ROAD-005
  complete; a single credible critical issue means revise.

## Out of scope

Runtime adapter selection/proof, a deployed schema validator, executable
scenario package, specific numeric resource ceilings, live external targets,
and user-authored arbitrary code.
