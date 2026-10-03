# D6 — Verification

## Checks run

- `go test ./...` (`backend/`): passed for server, OAuth/OIDC, and SAML
  packages, including resolution of the checked-in fixture's scenario ID
  against the current module scenario catalog.
- `npm test` (`web/`): passed; 9 test files and 49 tests.
- `npm run build` (`web/`): passed; TypeScript project build and Vite production
  build completed.
- Markdown relative-link check over `docs/` and `agent-graphs/`: passed.
- `git diff --check`: passed.
- Focused fixture assertions: included in the Vitest run; protect illustrative
  descriptor structure and safety boundaries. This does not prove that a
  runtime schema validator, policy engine, lifecycle, or isolation adapter
  exists.

## Acceptance coverage

- The contract specifies a versioned descriptor, module-owned semantic
  references, typed capability requests separate from grants, executable
  artifact reference requirements, validation/error behavior, lifecycle
  preconditions and cleanup states, and bounded evidence/result semantics.
- The sample is synthetic, references the existing `missing-pkce` OAuth
  scenario ID, includes no artifact or target, and has no embedded OAuth wire
  fields or credentials. Step/check/evidence/redaction references remain
  illustrative and are not registry-validated. A focused test guards the
  fixture's structure and declared synthetic boundaries.
- Stop removes run resources, evidence, traces, and secrets under LAB-11; the
  conceptual module startup operation is explicitly downstream of
  control-plane grant creation and adapter resource setup.
- Architecture, glossary, and backlog links resolve and use the candidate
  contract language.

## Remaining proof

- The example's module registry IDs and resource profile are illustrative;
  the fixture test does not resolve them against a registry.
- Lifecycle transitions, cleanup guarantees, artifact provenance, digest
  verification, and resource ceilings remain design requirements pending
  ROAD-006 implementation and runtime tests.
- Independent skeptic and five-lens panel reviews are recorded separately in
  `07-review.md` and `08-persona-review.md` before the roadmap item is marked
  complete.
