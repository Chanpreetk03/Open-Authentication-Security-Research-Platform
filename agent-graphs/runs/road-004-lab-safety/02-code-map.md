# D2 — Codebase map

## Observed sources of current requirements

- `docs/roadmap/backlog.md`, ROAD-004 through ROAD-006: ROAD-004 defines the
  required topics; ROAD-005 owns scenario manifest/lifecycle; ROAD-006 compares
  and tests execution boundaries. It explicitly says executable scenarios
  remain gated on isolation proof.
- `docs/architecture/trust-boundaries.md`, **Core boundaries** and **Security
  rules**: separates learner/UI, lab runtime, control plane, external targets,
  and host; requires no host, neighboring-lab, or real-system impact and
  synthetic data.
- `docs/architecture/product-architecture.md`, **Lab safety architecture**:
  names allowed destinations, ports, synthetic seed data, resource/time limits,
  operations, observations, reset/destruction; says undeclared capabilities
  must be refused.
- `docs/architecture/protocol-lab-architecture.md`, **Protocol module
  contract**: protocol descriptors own protocol semantics; control plane owns
  shared lifecycle, capabilities, capture/redaction, traces, and audit.
- `docs/security/threat-model.md`: lists SSRF, XSS, token theft, privilege
  escalation, and other in-scope threats, but has no lab-runtime attack tree or
  testable controls yet.
- `docs/security/security-principles.md`: treats credentials, tokens, and keys
  as secrets; limits custom cryptography to isolated learning exercises.
- `docs/security/attack-catalog.md`: includes SSRF, replay, MITM, token theft,
  and key compromise, but does not define runtime containment.
- `docs/development/testing-strategy.md`: currently has no substantive test
  requirements.

## Observed implementation boundary

- `web/src/capabilities.ts` and `docs/product/capability-inventory.md` label
  existing attack labs as synthetic simulations.
- Existing Go SAML lab packages under `backend/internal/saml/` model selected
  rules and return traces; the repository inventory does not demonstrate a
  general-purpose executable vulnerable-code runtime.
- The current ROAD-003 catalog makes no executable runtime capability claim.

## Reuse and ownership

- Extend `docs/security/lab-safety-requirements.md` as the normative,
  implementation-independent control checklist; align the trust-boundary and
  product-architecture summaries with it.
- Keep runtime selection and proof in ROAD-006, scenario manifest/lifecycle in
  ROAD-005, and protocol-specific inputs/semantics in protocol modules.
- **Unknown:** exact runtime mechanisms and achievable isolation level until
  ROAD-006 compares candidates against these requirements.
