# ROAD-004 synthetic persona review: initial review and final reassessment

## Final reassessment after skeptic revisions

**Current strict gate: internal design gate passes (5/5).** This is the final
decision on the revised requirements baseline. The initial review below is
preserved as history; it reviewed LAB-01–LAB-13 before the skeptic fixes and
must not be read as the final disposition of the revised baseline.

### Explicit recheck of skeptic findings

- **Private run resources — corrected.** Revised LAB-01 distinguishes denied
  host/control-plane/sibling access from platform-created private read-only
  roots, bounded run scratch, and a private target network. The control plane
  validates requests and the adapter constructs resources; declarations do
  not grant authority. ROAD-005 owns descriptor/API field shape. ADR-008 and
  product architecture repeat this boundary.
- **Inbound targets — corrected.** Revised LAB-03 forbids host-published
  listeners, limits inbound/outbound access to scenario-owned target tuples
  and permitted peers, and requires network-boundary enforcement. Acceptance
  probes cover access from host and unrelated runs, permitted in-scenario
  peers, and absence of host port publication. A learner-facing mediated
  operation path remains a ROAD-005/API design detail; direct host access is
  intentionally disallowed.
- **Artifact integrity — corrected.** LAB-14 requires immutable identities,
  verified digests from an approved source, and rejection of unknown, mutable,
  unverifiable artifacts or artifacts missing provenance before code starts.
  It does not prescribe a signature format. The
  executed digest must match the approved descriptor and audit event. Research
  maps LAB-14 to NIST image guidance and assigns source policy/descriptor and
  adapter details to ROAD-005/006. ROAD-006 backlog explicitly includes
  artifact provenance tests.
- **Trace behavior — clarified.** LAB-07 allows the owning run's learner view
  to render only explicitly allowlisted synthetic teaching values. Fields
  outside that allowlist remain omitted/ephemeral; anything leaving the
  runtime boundary, persisted, exported, logged, or audited must not contain
  raw sentinels. LAB-08 states active ephemeral runs terminate and their data
  is deleted on restart. LAB-09 makes audit unavailable => refuse/stop and
  cleanup, with an out-of-band health signal. These are testable boundaries,
  not claims of implemented trace handling.
- **Resource/failure gates — strengthened.** LAB-05 now requires per-run and
  aggregate hard caps, measurable adapter tolerances, and measured tests below,
  at, and above limits. LAB-06 covers cross-run quota theft. LAB-12 explicitly
  taints workers and blocks reassignment when cleanup is uncertain.
- **Synthetic release gate — aligned.** The requirements release gate requires
  a final synthetic security/persona panel with no unresolved critical blocker
  and states that the panel is not security proof or user validation. ROAD-006
  and the Phase 2 roadmap exit gate require test results, residual risks, and
  unsupported platforms to be recorded and reviewed by the same synthetic
  gate. Current attacks remain synthetic/non-executable until those runtime
  tests pass.
- **Source mapping and ROAD ownership — improved.** Research now provides a
  LAB-01–LAB-14 source/policy table. The spec says ROAD-004 fixes policy
  semantics and evidence only; ROAD-005 owns manifest/API fields, state
  transitions, actor representation, and UI/API shape; ROAD-006 owns adapter
  mapping and proof. No runtime or field schema was selected.

### Five-lens final reassessment

- **Authentication-focused developer — pass.** Inferred concern about whether
  the learner can reach an isolated target is addressed as an explicit design
  boundary: only a permitted same-scenario peer can connect; a mediated
  operation path is left to ROAD-005. Protocol-specific exercises and checks
  remain future module work, not a safety-baseline claim.
- **General application developer — pass.** Private platform-created resources
  enable local exercises without granting host or arbitrary target access;
  host-published listeners remain prohibited. Clear mediated UX/errors remain
  a ROAD-005 follow-up.
- **Student/security learner — pass.** Synthetic teaching values can be shown
  through a run-scoped allowlist while trace exports/storage remain redacted or
  absent. The release gate prevents exposure of executable labs before proof.
- **Security engineer — pass.** Inbound/outbound controls, resource quotas,
  artifact identity, trace boundaries, restart, audit failure, and uncertain
  cleanup now have explicit denials and acceptance signals. Runtime feasibility
  is unknown by design and still must be demonstrated per platform in ROAD-006.
- **Architect/educator — pass.** Authority is separated across ROAD-004 policy,
  ROAD-005 schema/lifecycle, and ROAD-006 adapter proof. Artifact provenance,
  network rules, and trace policy have explicit ownership and no current
  implementation claim.

### Current blockers and follow-ups

**Must-fix before this requirements-baseline gate:** none found. The revised
spec closes the skeptic's critical and high findings and keeps execution gated
on evidence.

**Still unknown / test next:**

- ROAD-005 must define how learner actions are mediated to a declared in-scenario
  peer without publishing a host listener, and the authorization checks for
  each lifecycle action.
- ROAD-005/006 must choose the approved artifact-source/provenance policy and
  verification mechanism; current requirements define digest/provenance
  rejection behavior but intentionally defer concrete fields and mechanisms.
- ROAD-006 must prove private-root/scratch permissions, allowed in-scenario
  listener reachability, denied host/unrelated access, artifact verification,
  aggregate resource enforcement, trace sentinels, audit-failure stop, restart
  deletion, and cleanup/taint behavior on every supported platform.
- No human usability, security-performance, or demand evidence exists. The
  synthetic panel does not supply it.

---

## Initial review before skeptic revisions (historical)

The decision below was the initial review, before LAB-14 and the revised
network, trace, aggregate-resource, ownership, and synthetic release-gate
wording. It is preserved for traceability and superseded by the reassessment
above.

## Purpose and scope

Review the ROAD-004 normative executable-lab safety baseline, ADR-008, its
primary-source guidance, and linked threat/trust/product architecture documents
as an independent internal design gate. The five lenses are synthetic
perspectives from the repository profile, not real reviewers. No runtime code
or implemented isolation is being assessed or claimed.

**Recommendation: internal design gate passes (5/5).** The specification
establishes a conservative fail-closed release gate, distinguishes requirements
from proof, and assigns implementation and runtime-proof work to ROAD-005/006.
I found no unresolved critical safety or evidence-boundary blocker for this
requirements baseline. It does not authorize executable labs today.

## Evidence inspected

- `docs/security/lab-safety-requirements.md` — LAB-01 through LAB-13, release
  gate, and deferred decisions.
- `docs/adr/008-executable-lab-safety-baseline.md` — accepted project policies,
  alternatives, consequences, and no-runtime-claim decision.
- `docs/research/lab-safety-control-guidance.md` — source-to-policy rationale,
  proposed tests, and explicit research boundary.
- `docs/security/threat-model.md` and `docs/security/security-principles.md`.
- `docs/architecture/trust-boundaries.md`,
  `docs/architecture/product-architecture.md` (“Lab safety architecture”),
  and `docs/architecture/protocol-lab-architecture.md`.
- `docs/roadmap/backlog.md` ROAD-004 through ROAD-006; ROAD-004 remains marked
  in progress pending this panel and runtime proof remains gated on ROAD-006.
- Current capability boundary: `docs/product/capability-inventory.md` and
  `web/src/capabilities.ts` describe present SAML attack labs as synthetic.

## Cross-cutting observations

- **Observed:** the baseline treats scenario code, inputs, protocol messages,
  and vulnerable targets as hostile. It names SSRF, redirects/DNS rebinding,
  path traversal, privilege escalation, resource exhaustion, secret
  exfiltration, trace injection, and cleanup failure.
- **Observed:** policy declarations are expressly not enforcement. Controls
  must live outside untrusted scenario code, default deny, and have negative
  acceptance probes. The release gate also requires positive and
  failure-path evidence before enablement.
- **Observed:** network exceptions are scenario-owned, exact protocol/port
  targets and enforced at egress; host, control plane, metadata services,
  link-local and unlisted destinations remain denied. The ADR prohibits
  general internet, production and arbitrary user-target access.
- **Observed:** secret handling, traces, logs, audit and retention are treated
  separately. Trace minimization/redaction must precede persistence or export;
  default durable retention is off; audit omits raw secret material.
- **Observed:** LAB-05 requires enforceable per-scenario hard ceilings and
  refuses start when limits are absent/unsupported. It requires a bounded
  global maximum rationale but defers exact platform-wide values to ROAD-006.
- **Observed:** reset, destruction, worker taint, restart/crash recovery and
  uncertain cleanup all have fail-closed requirements. Requirements explicitly
  say they do not demonstrate runtime isolation; the current attack labs remain
  synthetic and non-executable.
- **Observed:** research caveats containers' shared-kernel limits and does not
  select a technology. Product/trust architecture docs point back to the
  normative baseline and state declarations do not enforce themselves.
- **Inferred:** this is a suitable policy-level gate for moving to ROAD-005's
  scenario contract and ROAD-006's adapter comparison. ROAD-006 still must
  prove every selected platform and expose unsupported platforms as disabled.
- **Unknown:** runtime technology, supported platform matrix, achievable
  isolation, exact numeric ceilings, persistent trace/export policy, and
  required global concurrency ceilings are not decided or proven here.
- **Unknown:** real users' safety expectations, comprehension, or demand. No
  human sessions or reviewer feedback are represented by this panel.

## Five persona lenses

### 1. Authentication-focused developer — pass

- **Goal:** learn from realistic protocol attacks while knowing what the
  simulation can and cannot establish.
- **Observed value:** LAB-13 requires secure and vulnerable paths to be
  separate and clearly labeled; the existing capability inventory retains
  current synthetic-only scope. LAB-07 and LAB-09 separate protocol-aware
  trace redaction from secret-free audit metadata.
- **Observed friction:** this document is deliberately protocol-neutral; it
  does not define OAuth/OIDC, JWT, SAML, LDAP, Kerberos, MFA or passkey-specific
  fixtures and checks. ROAD-005 and protocol modules own those details.
- **Inferred:** keeping the shared control plane protocol-neutral while
  requiring per-protocol secret sentinels avoids encoding incomplete
  protocol-specific redaction into a generic policy.
- **Unknown:** whether future scenario profiles will model protocol-specific
  credentials and trust boundaries correctly; no executable scenario is
  reviewed here.

### 2. General application developer — pass

- **Goal:** run a useful exercise without accidental access to the machine,
  production credentials, or external systems.
- **Observed value:** default deny, local scenario-owned targets, synthetic
  per-run identities/secrets, hard ceilings, and refusal on missing or
  unenforceable policy are clearly stated.
- **Observed friction:** the baseline offers no live provider or arbitrary
  target testing. This is an intentional accepted boundary in ADR-008, not an
  undocumented capability.
- **Inferred:** local developers may need clear failure explanations when
  platform limits or controls prevent start; the requirements specify
  fail-closed outcomes but do not prescribe end-user error wording.
- **Unknown:** whether the unavailable external-testing mode conflicts with
  actual developer workflows; no human workflow evidence exists.

### 3. Student/security learner — pass

- **Goal:** perform attack exercises safely and see reproducible evidence that
  a mitigation works.
- **Observed value:** synthetic identities and credentials, isolated runs,
  deterministic reset, secure/vulnerable path separation, and explicit
  verification requirements form a coherent future exercise lifecycle.
- **Observed friction:** ROAD-004 specifies requirements but cannot yet provide
  a runnable secure/vulnerable lab. It says so explicitly and gates
  enablement on ROAD-006 proof.
- **Inferred:** learners need visible labeling of vulnerable targets before
  start; LAB-13 explicitly requires that label in UI/API metadata.
- **Unknown:** whether the eventual exercises will teach a given protocol
  concept effectively or whether learners will understand its trust
  assumptions.

### 4. Security engineer — pass

- **Goal:** contain intentionally compromised scenario code and obtain
  reproducible evidence for denied paths and cleanup.
- **Observed value:** LAB-02/03/05/06/07/08/09/10/11/12 cover host, control-plane,
  network, filesystem, resource, inter-run, trace, retention, audit, reset,
  destroy and failure paths with concrete negative tests. LAB-12 quarantines
  uncertain workers; LAB-07 forbids relying on name patterns alone.
- **Observed friction:** no selected runtime or numeric ceilings exist, so none
  of the controls can be relied on operationally. The baseline is explicit
  that those are ROAD-006 proof obligations, not current implementation.
- **Inferred:** ROAD-006 should include a hostile scenario attempting to access
  runtime artifacts/images or influence scenario selection in addition to the
  listed host/control-plane probes; LAB-01/02/13 strongly constrain this, but
  no dedicated supply-chain or scenario-artifact immutability test is named.
  This is a test refinement, not a current policy blocker because start is
  gated on external enforcement and compromised code is in the threat model.
- **Unknown:** whether any chosen local runtime can satisfy these constraints
  on each intended host OS, especially after abrupt host failure.

### 5. Architect/educator — pass

- **Goal:** build a reusable lab platform that supports future protocols and
  compares them without weakening safety or flattening their semantics.
- **Observed value:** ROAD-004 owns shared safety; ROAD-005 owns descriptors
  and lifecycle; ROAD-006 owns adapter selection and proof; protocol modules
  keep protocol-specific meaning. The docs repeat this ownership split.
- **Observed friction:** requirements do not yet identify concrete ownership
  for authorization of create/start/reset/destroy operations beyond stating
  control-plane boundaries and requiring an actor/initiating service in audit.
  Product architecture separately says lifecycle operations are authorized
  and audited.
- **Inferred:** ROAD-005 should bind each lifecycle operation to an explicit
  authorization decision and include unauthorized-operation negative cases.
  Given the architecture rule and runtime/API boundary, this is a necessary
  contract detail but is not a blocker to a runtime-neutral ROAD-004 baseline.
- **Unknown:** what local identity/authorization model is appropriate for a
  single-developer local product versus future hosted use.

## Coverage gaps and next work

### Must-fix before this requirements gate

None identified. Every ROAD-004 topic has a normative control, an enforcement
boundary, and acceptance evidence. The release gate prohibits enabling labs
without runtime mapping, negative/failure-path tests, residual risk disclosure,
and an internal panel pass.

### Test/design next

- In ROAD-005, define authorization checks for every lifecycle/admin operation,
  including denial audit behavior and local identity assumptions.
- In ROAD-006, add probes for scenario artifact selection, image/fixture
  immutability and provenance, runtime socket/API exposure, and scenario code
  tampering; bind results to exact runtime/image versions.
- Resolve whether the global resource/concurrency budget is per process,
  adapter, and host, and test aggregate exhaustion across concurrent scenarios.
- Define supported OS/runtime combinations; fail closed or disable executable
  labs where a requirement cannot be enforced.
- Test trace-redaction sentinels across protocol-specific encodings and all
  observable sinks, including malformed events and crash paths.
- Reassess the intentional exclusion of all external/production targets in a
  separate product decision only if the owner later asks to change it; no such
  access is currently specified or enabled.

## Strict unanimity result

**5/5 synthetic lenses pass.** The authentication-focused developer, general
developer, learner, security engineer, and architect/educator lenses found no
critical blocker in the requirements as a design artifact. The policy keeps all
material runtime unknowns visible and makes proof a release prerequisite.
Proceeding to ROAD-005/ROAD-006 is an internal planning decision, not evidence
of implementation, complete isolation, user validation, or demand.
