# Product Backlog

This is the actionable companion to the [product roadmap](roadmap.md). Items
are ordered by dependency and priority, not calendar date. A priority describes
sequence, not an automatic implementation commitment. Phase exit gates and
product-owner decisions are in the roadmap.

## Priority key

- **P0 — Foundation/gate:** needed to validate product direction or make a
  later activity safe.
- **P1 — Core loop:** needed to make the selected workbench and learning loop
  useful and verifiable.
- **P2 — Conditional expansion:** start only when user evidence selects it and
  prerequisite safety/design gates pass.
- **P3 — Reassess later:** preserve as a future option; no current delivery
  commitment.
- **Deferred:** outside the current product direction unless a separate
  evidence-backed decision changes scope.

## Current baseline — already implemented, maintain rather than duplicate

- OAuth 2.0 authorization-code simulation with secure, missing-state, and
  missing-PKCE paths and redacted event explanations.
- Browser-local JWT, HTTP request/redirect, SAML assertion, and SAML metadata
  inspection surfaces.
- Synthetic SAML exercises for replay, request correlation, audience,
  recipient, time conditions, signature binding, and subject confirmation.
- One Academy defense-in-depth OAuth lesson connected to secure-flow evidence.

These are bounded product slices. Maintain their tests and clearly state their
simulation/validation limits. See the current-state table in the
[roadmap](roadmap.md#current-baseline).

## P0 — Validate direction and establish safety gates

### ROAD-001 — Define the user-task validation rubric

- **Roadmap phase:** 0
- **Depends on:** none
- **Work:** define tasks and capture fields for explaining a trace, diagnosing a
  failure, identifying mitigation evidence, coaching needed, and desired next
  capability. Set decision thresholds before sessions rather than selecting
  them after seeing results.
- **Artifact:** draft [user-task validation guide](../research/user-task-validation.md)
  with session prompts, scorecard, safety rules, and proposed thresholds.
- **Status:** drafted; product-owner review and threshold signoff are pending.
- **Done when:** a short session guide and decision rubric are reviewed and
  record observed behavior separately from interpretation.

### ROAD-002 — Run workbench task sessions

- **Roadmap phase:** 0
- **Depends on:** ROAD-001
- **Work:** test the current OAuth/JWT/HTTP/SAML surfaces with developers and
  security learners. Do not use production credentials, third-party targets,
  or live traffic.
- **Done when:** findings identify the strongest initial persona/task, whether
  synthetic evidence is understood/trusted, and which next capability users
  request. The product owner makes an explicit continue/revise decision.

### ROAD-003 — Publish capability labels and coverage inventory

- **Roadmap phase:** 1
- **Depends on:** ROAD-001; can draft using current behavior
- **Work:** label each feature as local inspection, synthetic simulation,
  cryptographic/standards validation, or live interoperability; name supported
  versions and exclusions.
- **Done when:** each current feature has a visible/documented scope and users
  are not led to mistake decoding or modeled traces for full validation.

### ROAD-004 — Specify lab safety requirements

- **Roadmap phase:** 2
- **Depends on:** existing threat model and trust-boundary docs
- **Work:** define default-deny host/network/filesystem access, target allowlists,
  synthetic data, resource/time limits, per-scenario isolation, redaction,
  trace retention, audit, reset, cleanup, and failure behavior.
- **Done when:** requirements are testable and reviewed before choosing or
  implementing an executable vulnerable-code runtime.

### ROAD-005 — Define the scenario manifest and lifecycle contract

- **Roadmap phase:** 2
- **Depends on:** ROAD-004
- **Work:** specify versioned scenario descriptors, declared capabilities,
  start/observe/execute/reset/destroy lifecycle, verification results, and
  redaction rules.
- **Done when:** a sample synthetic OAuth scenario can be represented without
  embedding protocol semantics in the shared control plane.

### ROAD-006 — Select and prove the local execution boundary

- **Roadmap phase:** 2
- **Depends on:** ROAD-004 and ROAD-005
- **Work:** compare local process, container, and sandbox options; build a
  constrained prototype; test denied host/network access, resource limits,
  cleanup, reset, and cross-scenario isolation.
- **Done when:** documented tests pass and security review accepts residual
  risk. Until then, keep vulnerable scenarios synthetic and non-executable.

## P1 — Improve the current workbench and learning loop

### ROAD-101 — Refine core workflow from validation findings

- **Roadmap phase:** 1
- **Depends on:** ROAD-002
- **Work:** resolve the highest-impact navigation, explanation, or interaction
  problem observed in the chosen user task; preserve local-only boundaries and
  protocol-specific meaning.
- **Done when:** the selected task meets the preregistered usability rubric and
  protocol data/limitations are represented accurately.

### ROAD-102 — Maintain protocol adapter contracts

- **Roadmap phase:** 1
- **Depends on:** current OAuth and SAML adapter behavior
- **Work:** retain test coverage for event ordering, redaction, failure states,
  and mapping to the shared observation UI; document where adapters intentionally
  preserve protocol-specific fields.
- **Done when:** changes to an adapter cannot silently drop security-relevant
  meaning or expose secret values.

### ROAD-103 — Define the reusable Academy lesson contract

- **Roadmap phase:** 3
- **Depends on:** ROAD-002 and ROAD-004 for executable scenarios; synthetic
  lessons may proceed under existing boundaries
- **Work:** standardize objective, prerequisite, scenario, expected observation,
  safe/vulnerable label, mitigation, and verification evidence.
- **Done when:** the existing OAuth lesson follows the contract without
  duplicating scenario logic, and a second lesson can reuse it.

### ROAD-104 — Add one validated security-principle lesson

- **Roadmap phase:** 3
- **Depends on:** ROAD-103; user evidence chooses topic
- **Work:** implement one lesson tied to an existing protocol scenario, such as
  replay protection, trust validation, secure defaults, or least privilege.
- **Done when:** learner can reproduce the modeled failure, explain its trust
  assumption, apply mitigation, and interpret secure verification; tests cover
  expected outcomes.

### ROAD-105 — Add deterministic synthetic trace replay/reset

- **Roadmap phase:** 3
- **Depends on:** ROAD-005; may be implemented over current synthetic SAML/OAuth
  traces without a runtime
- **Work:** make selected synthetic exercises repeatable and resettable with
  predictable seed and event sequence.
- **Done when:** repeated runs produce equivalent evidence, reset removes
  scenario state, and the UI identifies traces as synthetic.

### ROAD-106 — Build a constrained protocol flow composer/runner

- **Roadmap phase:** 3
- **Depends on:** ROAD-005 and a selected local/synthetic protocol scenario;
  executable target behavior also depends on ROAD-006
- **Work:** let users adjust only declared scenario inputs, execute the flow
  against its local sandbox target, inspect normalized request/response events,
  compare secure and modeled failure outcomes, and reset the scenario.
- **Done when:** undeclared inputs and destinations are rejected; traces are
  redacted and labeled as simulation or validation accurately; execution is
  deterministic where designed and reset removes scenario state.
- **Safety boundary:** no arbitrary URL, production credential, third-party
  target, or unrestricted proxy/replay.

## P2 — Protocol and cryptographic expansion (choose one bounded slice)

### ROAD-201 — Select the next protocol slice from user evidence

- **Roadmap phase:** 4
- **Depends on:** ROAD-002, ROAD-003
- **Work:** compare deeper OAuth/OIDC, SAML validation, WebAuthn/passkeys, LDAP,
  Kerberos, and PKI/key lifecycle against user requests, implementation risk,
  and safety dependencies.
- **Done when:** product owner selects one protocol/version/use case with clear
  exclusions and acceptance evidence.

### ROAD-202 — Complete one OAuth/OIDC/JWT learning path

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects OAuth/OIDC gaps
- **Work:** fill selected gaps across authorization code, PKCE/state,
  discovery/issuer, ID-token validation, signatures/claims, and token lifecycle.
- **Done when:** published coverage names versions and operations; tests prove
  selected secure checks; decoder-only tools are distinguished from validation.

### ROAD-203 — Extend SAML beyond targeted synthetic checks

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects SAML; library/standards review and scope plan
- **Work:** choose between continuing synthetic acceptance lessons and building
  a real parser/validator. For real validation, define trusted-key and
  signature-reference handling, verified-node binding, issuer, audience,
  recipient, time conditions, correlation, replay, and malformed-input behavior.
- **Done when:** selected behavior has standards-backed fixtures, negative
  tests, explicit trust configuration, limitations, and clear separation from
  synthetic labs.

### ROAD-204 — Prototype a local WebAuthn/passkey ceremony

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects WebAuthn; origin/RP ID/recovery threat model
- **Work:** model the browser, relying party, and authenticator; start with a
  deterministic local ceremony before requiring real authenticators.
- **Done when:** origin/RP ID and challenge checks are observable and tested;
  attestation and recovery boundaries are documented.

### ROAD-205 — Add a synthetic LDAP learning module

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects LDAP; scenario safety contract
- **Work:** cover directory entries, bind/search/filter/TLS concepts, least
  privilege, and safe injection exercises against synthetic data.
- **Done when:** secure/vulnerable behavior is bounded, query semantics are
  tested, and external directories are not contacted by default.

### ROAD-206 — Add a synthetic Kerberos trace module

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects Kerberos; directory foundations and resource
  feasibility review
- **Work:** model AS/TGS/service-ticket actors and selected ticket/replay
  concepts before running an executable realm.
- **Done when:** trace assumptions are explicit and reviewers distinguish the
  model from real KDC behavior.

### ROAD-207 — Teach PKI and key lifecycle with synthetic artifacts

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects the topic
- **Work:** cover trust chains, algorithm choice, signing/verification,
  expiration, rotation, and revocation with generated non-production artifacts.
- **Done when:** exercises test expected trust decisions and never store or
  manage production user secrets.

### ROAD-208 — Extend MFA/TOTP concepts

- **Roadmap phase:** 4
- **Depends on:** ROAD-201 selects MFA; recovery and secret-handling review
- **Work:** model enrollment, challenge verification, replay, rate limits, and
  recovery using synthetic seed values.
- **Done when:** secure checks and failure cases are verified without real
  account enrollment or reusable real secrets.

## P3 — Reassess after core use is validated

### ROAD-301 — Prove the internal module seam with a second first-party module

- **Roadmap phase:** 5
- **Depends on:** two modules selected/built, ROAD-005
- **Work:** add a module through the descriptor/adapter contract and record
  whether shared lifecycle, observation, and verification remain protocol-neutral.
- **Done when:** the module can be added without changing unrelated control-plane
  behavior and capability declarations are enforced.

### ROAD-302 — Evaluate a third-party plugin model

- **Roadmap phase:** 5
- **Depends on:** ROAD-301 plus validated user demand and plugin threat model
- **Work:** assess trust, signing, compatibility/versioning, capabilities,
  review, distribution, and runtime isolation. Do not allow plugins to bypass
  sandbox policy.
- **Done when:** a separate product decision is made from evidence; no public
  plugin promise is implied before then.

### ROAD-303 — Reassess controlled real-provider or live integration testing

- **Roadmap phase:** 6
- **Depends on:** user evidence showing synthetic-only workflows are
  insufficient; target authorization and credential/data threat model
- **Work:** evaluate explicit test-provider setup, SSRF protections, consent and
  allowlists, secret redaction, audit, and retention.
- **Done when:** separate proposal establishes bounded targets, safeguards, and
  measurable user value before any live network feature is built.

### ROAD-304 — Reassess hosted execution and multi-user sharing

- **Roadmap phase:** 6
- **Depends on:** validated need for hosted/shared workflows and operations,
  tenancy, abuse, privacy, and incident-response plan
- **Work:** assess isolation per tenant/scenario, operations, retention, quotas,
  secrets, and cost.
- **Done when:** product owner accepts a separate proposal and risk review.

## Deferred / out of scope

- ROAD-401 — Full IAM product, enterprise provisioning, connector marketplace,
  and access governance: deferred; revisit only through Phase 6 evidence.
- ROAD-402 — Unrestricted proxy, live capture, and arbitrary-target replay:
  out of scope absent separate authorization, threat model, and product decision.
- ROAD-403 — Production key/secret management service: out of scope; PKI/key
  lifecycle learning uses synthetic artifacts only.
