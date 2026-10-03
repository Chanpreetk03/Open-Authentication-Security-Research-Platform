# Product Roadmap

This roadmap turns the evaluated idea portfolio into a dependency-ordered plan
for an authentication protocol workbench and safe attack sandbox. It is
outcome-based rather than date-based because delivery capacity and user demand
have not yet been validated.

The actionable task list is in the [backlog](backlog.md); the disposition of
each brainstormed idea is in the [idea register](../research/ideas.md). The
supporting assessment is in
[`agent-graphs/runs/idea-evaluation/`](../../agent-graphs/runs/idea-evaluation/).

## Product outcome

Help developers, learners, educators, and security researchers inspect
authentication behavior, understand failures, run controlled attack-and-defense
exercises, and verify mitigations. The core loop is:

**Inspect → Understand → Exercise → Mitigate → Verify**

The product is a Postman-like workbench for selected authentication protocols
and cryptographic artifacts, paired with a local-first sandbox. “Postman-like”
describes an interactive protocol workbench; it does not imply arbitrary
production traffic replay or a general request proxy.

Protocol and algorithm coverage will be explicit by standard, version, and
supported operation. “All protocols and algorithms” is not a feasible or
verifiable completion claim; the product should publish a versioned coverage
catalog and clearly state whether each feature inspects, simulates, validates,
or executes an exchange.

## Product guardrails

- Keep the reference identity engine small and subordinate to the workbench and
  labs. Do not build a full IAM service, access governance system, or enterprise
  connector marketplace as the core product.
- Stay local-first and synthetic by default. Any future real-provider or live
  network operation requires a separate threat model, explicit target
  authorization, credential handling rules, and user controls.
- Keep offline inspection, synthetic simulation, cryptographic validation,
  and real protocol interoperability distinct in the UI and documentation.
- Do not run executable intentionally vulnerable code outside a defined,
  verified isolation boundary with constrained capabilities, reset, and
  destruction behavior.
- Keep protocol semantics in protocol-owned modules. Share lifecycle,
  observation, redaction, and verification infrastructure only where the
  semantics genuinely match.
- Defer third-party plugins until a second first-party protocol module proves
  the internal module seam and the execution trust boundary is established.

## Current baseline

The following is observed in the repository and is not a claim of production
readiness or standards conformance:

| Capability | Current state |
|---|---|
| OAuth 2.0 authorization-code flow | Deterministic Go simulation with secure, missing-state, and missing-PKCE scenarios and redacted explanatory events. |
| Protocol inspection | Browser-local JWT, HTTP request/redirect, SAML assertion, and SAML metadata inspectors. The HTTP inspector does not send or replay requests. |
| SAML security exercises | Synthetic replay, request-correlation, audience, recipient, time-condition, signature-binding, and subject-confirmation scenarios with backend/frontend tests. These are targeted models, not a complete SAML parser or validator. |
| Learning content | One Academy defense-in-depth lesson links OAuth scenarios to secure-flow verification. |
| General isolated lab runtime | Not demonstrated by the current implementation inventory. Runtime adapter, capability manifest, and isolation verification remain design work. |
| LDAP, Kerberos, WebAuthn/passkeys, PKI/key lifecycle | Future areas in docs; no corresponding implementation was found in the reviewed source inventory. |
| External integrations and plugins | Not part of the current implementation; intentionally gated/deferred below. |

Source map: `backend/internal/oauthoidc/`, `backend/internal/saml/`,
`web/src/components/`, `web/src/protocols/`, and `web/src/academy/`.

## Roadmap phases

Phases are ordered by dependency. A phase can be refined after its gate; future
protocols are not pre-approved merely because they appear in the curriculum.

### Phase 0 — Validate the workbench problem

**Outcome:** establish which users and tasks the current product should optimize
for before expanding protocol breadth.

**Work:**

- Run moderated task sessions with developers and security learners using the
  current OAuth/JWT/HTTP/SAML experience.
- Ask participants to explain a trace, diagnose a failure, and identify the
  evidence that would verify a mitigation.
- Before sessions, define a short rubric for task completion, coaching needed,
  correct interpretation of simulation limits, and the participant’s requested
  next capability.
- Record which persona, tool, and next protocol or integration need recurs;
  separate observed requests from interpretation.

**Exit gate:** the product owner reviews the evidence and selects the primary
initial user/task, confirms or revises the combined workbench-and-lab thesis,
and chooses one next slice. If participants consistently prefer offline
inspection or demand live integration, revise scope before implementation.

### Phase 1 — Make the existing workbench clear and dependable

**Prerequisite:** Phase 0 confirms at least one current workflow is useful, or
provides specific revisions to test.

**Outcome:** users can recognize what each tool does and does not prove, and
complete the chosen inspect/understand task without confusing a synthetic trace
with a real protocol exchange.

**Work:**

- Improve navigation and shared presentation across the current OAuth, JWT,
  HTTP, and SAML surfaces based on task evidence.
- Make coverage status visible: local parsing/inspection, synthetic simulation,
  standards validation, or live interoperability.
- Keep redaction behavior, input limits, parser errors, and local-only behavior
  explicit for pasted artifacts.
- Maintain contract and behavior tests for backend events and frontend
  adapters; preserve protocol-specific details in their modules.
- Add only the OAuth/OIDC or algorithm inspection gaps identified by user
  evidence, with bounded standard/version coverage.

**Exit gate:** selected tasks pass the agreed usability rubric; traces and
inspectors accurately label their evidence and limitations; supported
operations and versions are documented.

### Phase 2 — Define and prove the lab safety boundary

**Prerequisite:** before any executable vulnerable target, user-authored lab,
or network-enabled scenario is introduced.

**Outcome:** a testable design for scenario creation and destruction that
constrains capabilities and protects the host, other scenarios, credentials,
and external systems.

**Work:**

- Specify a versioned scenario manifest: protocol module, variant, synthetic
  seed, allowed destinations, exposed ports, resource limits, timeouts,
  observation channels, and reset/destruction behavior.
- Define default-deny access to host network/filesystem, real credentials,
  unrelated scenarios, and undeclared capabilities.
- Specify data minimization, secret redaction, trace retention, audit events,
  and cleanup after normal exit and failure.
- Compare local-process, container, and sandbox-runtime options against the
  threat model; choose only after the constraints and required proof are clear.
- Prototype an intentionally constrained scenario and test that prohibited
  host/network access is denied, limits are enforced, and state is reset or
  destroyed.
- Keep existing synthetic traces available while executable isolation is
  unproven; label them as simulations.

**Exit gate:** the chosen runtime passes documented isolation and lifecycle
tests, including failure/cleanup paths, and a security review accepts the
residual risk. Until then, no arbitrary vulnerable code or live-target attack
is enabled.

### Phase 3 — Complete one attack-to-verification learning loop

**Prerequisite:** Phase 1 user/task evidence; Phase 2 safety design for any
executable target. Synthetic scenarios may continue under their documented
local-only boundary.

**Outcome:** at least one learning module guides a user from protocol behavior
through a failure and mitigation to evidence that the secure behavior holds.

**Work:**

- Use the OAuth state/PKCE Academy lesson and existing synthetic SAML exercises
  as the first examples; remove duplicated protocol logic between content and
  scenarios.
- Add a constrained protocol flow composer/runner for the selected local
  scenario so users can adjust declared inputs, execute a flow, inspect the
  request/response trace, compare secure and modeled failure outcomes, and
  reset. This is the first Postman-like interaction; it targets declared
  sandbox endpoints, not arbitrary URLs or production systems.
- Define a reusable lesson contract: learning objective, prerequisites,
  scenario, expected observations, safe/vulnerable label, mitigation, and
  verification evidence.
- Add a second lesson only after validating the contract; prioritize a security
  principle that maps to current protocol evidence.
- Support deterministic synthetic trace replay/reset for repeatability. Do not
  add live HTTP replay in this phase.
- Keep secure and vulnerable execution paths separate and clearly labeled.

**Exit gate:** learners can state the trust assumption, reproduce the modeled
failure, apply the mitigation, and interpret the verification evidence; tests
cover both expected vulnerable evidence and secure rejection. The flow runner
rejects undeclared inputs/targets and supports deterministic reset.

### Phase 4 — Deepen core protocol and cryptographic coverage

**Prerequisite:** user evidence names the next protocol or cryptographic task;
the Phase 2 safety gate applies to executable labs.

**Outcome:** versioned, reviewable protocol modules that support the product
loop without pretending every format or algorithm has been implemented.

**Candidate curriculum (not a fixed delivery schedule; select one slice at a time from user evidence):**

1. **OAuth 2.0 / OpenID Connect / JWT:** complete the chosen authorization
   code, PKCE/state, discovery/issuer, ID-token claims/signature, and token
   lifecycle learning path. Distinguish JWT decoding from signature and claim
   validation. Use reviewed libraries for security-sensitive production paths.
2. **SAML:** build on current local inspectors and synthetic relying-party
   checks. If real XML parsing/signature validation is added, define trusted
   key, reference/node binding, issuer, audience, recipient, time, correlation,
   replay, and error behavior, then validate against authoritative test cases.
   Synthetic labs remain explicitly separate from actual validation.
3. **WebAuthn/passkeys and MFA:** model browser/client/RP/authenticator
   boundaries, origin and RP ID checks, enrollment, verification, recovery, and
   failure cases. Start with a deterministic local ceremony before considering
   real authenticators.
4. **LDAP/directory protocols:** start with synthetic directory entries,
   bind/search/filter/TLS concepts, and injection/least-privilege lessons.
   External directory targets require explicit local test-environment setup.
5. **Kerberos:** begin with AS/TGS/service-ticket actors and synthetic traces;
   only add an executable realm lab after directory/runtime requirements and
   user demand justify its higher operational complexity.
6. **PKI and key lifecycle:** teach certificate chains, trust anchors, signing
   and verification, algorithm choice, rotation, expiry, and revocation using
   synthetic artifacts. Do not turn the product into a production secret or
   key-management service.

For every selected module, define exact standard/version coverage, supported
operations, trust assumptions, limitations, secure/vulnerable variants where
appropriate, and verification sources before implementation.

**Exit gate:** a module adds a complete bounded learning/debugging slice,
maintains protocol-specific semantics, has tests/verification and safety
boundaries, and users can distinguish simulation from validation/interoperability.

### Phase 5 — Prove modular extensibility and local adoption

**Prerequisite:** at least two first-party protocol modules have used the shared
descriptor/observation/verification seam successfully.

**Outcome:** adding a protocol does not require redesigning shared lifecycle or
trace presentation, while security-sensitive protocol behavior remains owned by
the protocol module.

**Work:**

- Stabilize the internal protocol/scenario descriptor from real module use.
- Document compatibility, versioning, redaction, capability declarations, and
  verification requirements.
- Improve local/self-hosted setup and reproducible synthetic scenarios based on
  user evidence.
- Evaluate an external plugin model only if first-party module friction and
  user demand justify it; a plugin must not bypass sandbox policy.

**Exit gate:** a new first-party module can be added without changing unrelated
control-plane behavior; security review confirms declared capabilities and
module lifecycle are enforced.

### Phase 6 — Reassess external integrations and hosting

**Prerequisite:** evidence from Phases 0–5 demonstrates a user need that local
synthetic work cannot meet, and a threat/operations review defines the added
responsibilities.

**Outcome:** a deliberate decision to keep local-first, add controlled
integration testing, or evaluate hosted execution.

**Decision topics:** real-provider connections, live request/replay, external
directory realms, user-authored labs, plugin distribution, persistence,
multi-user sharing, hosted isolation, secrets, abuse controls, audit and
retention. Each requires its own scope and approval; none is implied by this
roadmap.

**Exit gate:** product owner accepts a separate proposal with validated user
need, explicit threat model, operational cost, and measurable success criteria.

## Deferred / out of current product scope

- Full production IAM service, broad enterprise provisioning, access
  governance/certification, and connector marketplace.
- Hosted multi-tenant service or remote execution of vulnerable labs.
- Arbitrary third-party plugins or user-supplied code before the Phase 2 and
  Phase 5 gates.
- Unrestricted proxying, live traffic capture, or replay against arbitrary
  targets.
- Claims of supporting every authentication protocol or cryptographic
  algorithm. Coverage must be explicitly scoped and verifiable.

These can be reconsidered only through the Phase 6 decision gate, except that
the safety and module-seam gates apply earlier to their related work.
