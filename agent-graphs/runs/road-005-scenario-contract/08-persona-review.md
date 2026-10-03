# D7 — ROAD-005 synthetic persona review

## Final re-review after blocker fixes

**Current strict gate: internal design gate passes (5/5).** This section is the
final outcome after the revisions below. The initial review and its `revise`
recommendation are preserved later in this file as historical evidence; they
describe the earlier version and are superseded by this re-review.

### Rechecked findings

- **Observed — scenario reference:** fixture `scenarioRef.id` is now
  `missing-pkce`. `backend/internal/oauthoidc/flow_test.go`,
  `TestScenarioDescriptorReferencesExistingOAuthScenario`, loads the fixture
  and resolves the ID through `Scenarios()`. D3 says only step/check/evidence/
  redaction references are illustrative because the current module has no
  exported registry IDs. D6 and the contract page state the same boundary.
  The fixture test no longer implies those other references resolve.
- **Observed — stop/evidence semantics:** the `stopped` state now removes run
  resources, evidence, traces, and run-scoped secrets, retaining only bounded
  descriptor/audit metadata until destroy. `Stop` is not an `Observe` state.
  This is consistent with ROAD-004 LAB-11 cleanup requirements and removes the
  prior promise of inaccessible retained evidence.
- **Observed — lifecycle glossary/alignment:** `Stop` now appears in
  `CONTEXT.md`, the protocol-module lifecycle, product architecture, ROAD-005
  contract and backlog. The term has consistent effects: reject new work,
  revoke grant, clean run resources and evidence, quarantine on uncertain
  cleanup.
- **Observed — startup grant boundary:**
  `docs/architecture/scenario-manifest-contract.md` says only the runtime
  adapter creates/tears down isolated resources from the approved grant. The
  protocol module initializes semantics inside an adapter-created run and
  cannot create resources or enlarge the grant. The conceptual
  `StartScenario(definition, grantedRunContext)` interface and explanation in
  `docs/architecture/protocol-lab-architecture.md` now align.
- **Observed — trace teaching exception:** LAB-07 permits only explicitly
  allowlisted synthetic teaching values in a run-scoped learner view. The
  contract distinguishes these from reusable credentials and other secret
  fields, which remain redacted; teaching values do not enter durable traces,
  exports or audit. No implementation claim is made.
- **Observed — evidence boundary:** the candidate remains a design contract,
  not a deployed schema validator, lifecycle, registry, or runtime. D6 reports
  web tests/build and the Go source-reference test, while explicitly stating
  they do not establish runtime isolation or full descriptor reference
  resolution.

### Final five-lens reassessment

- **Authentication-focused developer — pass.** Existing scenario identity is
  linked to the OAuth module catalog by an executable test; unregistered
  module step/check references are expressly illustrative. Protocol behavior
  remains module-owned.
- **General application developer — pass.** Stopping now has a clear outcome:
  execution ends and evidence/traces/secrets are removed. The candidate
  glossary and architecture use the same lifecycle term.
- **Student/security learner — pass.** Observe is limited to active runs, and
  the separate run-scoped view may reveal only safe, allowlisted synthetic
  teaching values. Stop removes evidence rather than leaving it inaccessible.
- **Security engineer — pass.** Modules cannot create runtime resources or
  widen grants; adapter-created `grantedRunContext` is the boundary. Stop
  cleanup is consistent with LAB-11; cleanup uncertainty still quarantines
  resources. Future runtime enforcement remains unproven by design.
- **Architect/educator — pass.** Descriptor, grant, adapter, protocol module,
  run lifecycle, glossary and backlog responsibilities now align. Only
  currently unregistered module reference categories are labeled illustrative.

### Current must-fix / test-next result

**Must-fix before this candidate-contract gate passes:** none found.

The remaining unimplemented schema validator, module registry, artifact
resolver, authorization representation, runtime adapter, and numeric resource
limits are explicitly out of scope for ROAD-005 or owned by later work. They
are not represented as implemented and do not block this contract-design gate.
ROAD-006 still owns adapter proof before any executable lab can be enabled.
No user validation or demand claim is made.

**Final strict result: 5/5 pass.** All five lenses find no unresolved critical
contract, safety, or evidence-boundary issue in the revised candidate.

---

## Initial review before fixes (historical)

## Purpose and scope

Review the current ROAD-005 candidate scenario contract, OAuth descriptor
fixture and tests, shared glossary, linked architecture/backlog, and D1–D5 run
artifacts. This is an internal synthetic five-lens critique, not feedback from
real users, security validation, or proof that a runtime exists.

**Recommendation: revise.** The contract has a strong request/grant boundary,
clear runtime-neutral scope, and useful fail-closed states. Two credible
contract blockers remain: the sample/test do not meet D3's acceptance that
module-owned references be existing references, and the `stopped` state retains
evidence without allowing `Observe` there. The new `Stop` operation also needs
to be aligned with the shared glossary and lifecycle ownership docs.

## Evidence inspected

- `docs/architecture/scenario-manifest-contract.md`: ownership, example,
  artifact reference, descriptor validation, capability request/grant, states,
  operations, evidence/results, compatibility and failure behavior.
- `web/src/contracts/scenario-descriptor.oauth.example.json` and
  `web/src/contracts/scenario-descriptor.test.ts`.
- `CONTEXT.md` and `docs/architecture/domain-model.md`.
- `docs/architecture/protocol-lab-architecture.md`,
  `docs/architecture/product-architecture.md`,
  `docs/architecture/modules/audit.md`, and
  `docs/architecture/protocols/oauth-oidc-module.md`.
- `docs/security/lab-safety-requirements.md` and ADR-008.
- ROAD-005/backlog and roadmap sections in `docs/roadmap/backlog.md` and
  `docs/roadmap/roadmap.md`.
- Graph artifacts `01-scope.md` through `05-implementation.md`.
- Current protocol owner `backend/internal/oauthoidc/flow.go`, especially
  `Scenarios`, `Scenario*` constants, `NewAuthorizationCodeFlowForScenario`,
  and Academy's trace-evidence adapter in
  `web/src/academy/defense-in-depth.ts`.

## Cross-cutting findings

- **Observed:** the candidate explicitly says it is not an implemented schema,
  lifecycle service, or adapter. ROAD-006 owns adapter/runtime proof; the
  current OAuth and SAML implementations remain synthetic simulations.
- **Observed:** descriptors request bounded capability references; the control
  plane calculates a distinct run-bound grant. Arbitrary commands, host paths,
  URLs, runtime flags, image-pull commands, and credentials are excluded.
- **Observed:** the sample is synthetic mode and contains no artifact, target,
  protocol wire fields, credentials, or authority grant. Its resource profile
  and module references are described as illustrative in the architecture doc.
- **Observed:** the fixture test checks JSON shape and forbidden strings. It
  does not load or validate referenced IDs against a protocol module. The D3
  acceptance artifact nevertheless requires existing module scenario,
  verification, and step references. The OAuth implementation exposes
  scenario IDs `secure`, `missing-state`, `missing-pkce`, and
  `missing-state-and-pkce`; it has no `authorization-code` scenario ID or
  module-defined `pkce-verifier-required` / `simulate-authorization-code-flow`
  IDs in the checked-in implementation.
- **Observed:** contract state `stopped` says evidence remains available under
  an ephemeral policy, while `Observe` is specified only for `ready` and
  `executing`. No operation is defined for retrieving that stopped-run evidence.
- **Observed:** `Stop` and `stopped` appear in the contract but are absent from
  `CONTEXT.md`'s lifecycle terms and the earlier conceptual
  `ProtocolModule` method list. Product architecture describes pause/reset/
  destroy, and backlog ROAD-005 lists start/observe/execute/reset/destroy.
  This can be aligned without choosing an API transport.
- **Observed:** `Reset` creates a clean epoch, `Destroy` removes ephemeral
  state, uncertain cleanup yields `cleanup_unknown`, and control/audit/policy/
  redaction/resource/cleanup failures fail closed in the candidate and ROAD-004.
- **Unknown:** the eventual authorization principal model, concurrent request
  semantics, API transport, exact compatibility policy, registry, resource
  profiles, artifact resolver, numeric budgets, and target mediation UX remain
  explicitly deferred. No deployed validator or runtime exists.
- **Unknown:** human comprehension, usefulness, demand, and task success. No
  human review or validation is part of this process.

## Five persona lenses

### 1. Authentication-focused developer — revise

- **Goal:** reference protocol-owned scenario and check behavior without
  duplicating OAuth/OIDC, JWT, SAML, or future protocol semantics in the shared
  control plane.
- **Likely value — Observed:** `ProtocolModule` owns scenario, variant, step,
  check, evidence schema, and redaction semantics; the descriptor carries
  references rather than wire messages.
- **Critical blocker — Observed:** the D3 acceptance criterion says the sample
  references existing module scenario/step/check IDs, but the fixture uses
  `authorization-code`, `simulate-authorization-code-flow`, and
  `pkce-verifier-required`, none of which are registered in current code. The
  contract page admits those refs are illustrative; the fixture test asserts
  only their string values. This means the claimed reference validity has no
  evidence. Either supply module-owned IDs that exist, or revise acceptance to
  explicitly allow illustrative references and add a real module-owned
  reference test for the IDs that are claimed as current.
- **Inferred:** because this is a candidate contract, changing acceptance to
  distinguish `scenarioRef.id` from a module's current variant constant may be
  less disruptive than inventing a runtime registry.
- **Unknown:** whether the protocol module's long-term ID model will use a
  stable scenario family plus variant or a single scenario ID.

### 2. General application developer — revise

- **Goal:** know which operations are permitted for a run and whether a
  stopped run can still be inspected or needs to be destroyed.
- **Likely value — Observed:** lifecycle states and rejected state-conflicting
  operations make invalid transitions visible; error fields are bounded and
  do not echo secrets.
- **Critical blocker — Observed:** `stopped` promises evidence remains
  available, but `Observe` is not allowed in `stopped`. The candidate leaves
  users without a specified route to that evidence. Define `Observe` for
  stopped runs under the ephemeral policy, or define that stopping deletes
  evidence and remove the promise.
- **Inferred:** keeping `Stop` distinct from `Destroy` is useful when a learner
  should inspect evidence after ending execution; that distinction needs
  consistent glossary and architecture language.
- **Unknown:** actual learner-to-private-target mediation UX and failure-message
  clarity.

### 3. Student/security learner — revise

- **Goal:** run a declared step, inspect evidence, verify a scoped outcome, and
  reset safely without mistaking the result for real protocol validation.
- **Likely value — Observed:** `VerificationResult` is scoped to one named
  module check and run/epoch; outcomes distinguish `pass`, `fail`,
  `inconclusive`, and `error`. The contract explicitly rejects a full
  conformance or live-provider claim.
- **Critical blocker — Observed:** the stopped-run evidence ambiguity directly
  affects the learn/inspect loop; the protocol reference IDs in the sample are
  not backed by existing module-owned IDs despite the acceptance criterion.
- **Inferred:** synthetic allowlisted teaching values from ROAD-004 may be
  useful, but ROAD-005 currently says Observe is redacted and omits raw secret
  fields. Module redaction profiles could express the safe exception, but the
  contract does not demonstrate it. Add a fixture example/test if teaching
  values must be visible; otherwise state the stricter behavior is intentional.
- **Unknown:** whether future lesson evidence makes the current redaction level
  pedagogically adequate.

### 4. Security engineer — revise

- **Goal:** ensure untrusted descriptors cannot grant authority, leak secrets,
  persist traces, or leave tainted resources available for reuse.
- **Likely value — Observed:** requests and grants are separate; grants are
  bound to a descriptor digest, policy version, expiry, limits, and target
  identities. Unsupported versions/capabilities and enforcement failures
  reject or stop execution. `cleanup_unknown` quarantines resources.
- **Critical blocker — Observed:** lifecycle/evidence states must agree so
  retained evidence is neither inaccessible nor accidentally retained after
  destroy. `stopped` currently has the first ambiguity. The candidate says
  destroy erases ephemeral evidence, which is consistent with ROAD-004.
- **Inferred:** an explicit synthetic teaching-value allowlist should be
  surfaced as module redaction metadata and tested at the run boundary, not
  treated as a generic trace exemption.
- **Unknown:** the exact trust root, digest verification mechanism, run
  authorization model, and race behavior for concurrent Stop/Observe/Destroy
  calls are deferred; they must be tested in implementation design.

### 5. Architect/educator — revise

- **Goal:** preserve protocol-specific meaning while establishing consistent
  lifecycle/evidence vocabulary across future OAuth/OIDC, JWT, SAML, LDAP,
  Kerberos, MFA/TOTP, WebAuthn/passkey, and PKI modules.
- **Likely value — Observed:** the glossary separates module definition,
  descriptor, capability request/grant, run, evidence, and scoped verification
  result. Architecture assigns validation/policy/lifecycle to platform and
  semantics to modules.
- **Critical blocker — Observed:** `Stop` and `stopped` are introduced in the
  scenario contract but not in the shared glossary or conceptual protocol
  module lifecycle; `Observe` does not permit the stopped state even though
  the state retains evidence. The ownership docs/backlog and state machine
  need one lifecycle contract.
- **Inferred:** compatibility behavior for major/minor versions and whether
  unknown optional fields survive round trips should be pinned before a
  production schema validator is designed; current failure-closed rules are
  sufficient for this candidate stage.
- **Unknown:** how many first-party modules will reuse these abstractions and
  whether capability taxonomies remain protocol-neutral in practice.

## Must-fix before the candidate contract gate passes

1. Resolve D3/sample mismatch: make sample references validate against existing
   module-owned IDs, or change D3 to distinguish existing identifiers from
   explicitly illustrative references. Tests must substantiate whichever
   claims the contract makes; do not label illustrative strings as validated
   module references.
2. Resolve stopped-run evidence semantics: either allow bounded/redacted
   `Observe` in `stopped` while evidence remains under ephemeral retention, or
   delete/deny evidence at Stop and update the state description.
3. Align `Stop` / `stopped` across `CONTEXT.md`, the protocol module lifecycle
   summary, product architecture, and ROAD-005 backlog. Keep runtime and API
   transport unspecified.

## Test next

- Add state-machine table tests for every allowed/denied operation by state,
  repeated Stop/Reset/Destroy, reset epochs, and cleanup-unknown transitions.
- Add an assertion that every sample scenario/variant/step/check reference
  resolves through a module-owned registry or explicitly marked illustrative
  fixture source.
- Add trace tests for observed fields in ready/executing/stopped states,
  allowlisted synthetic teaching values, redaction before leaving the run,
  destroy deletion, and bounded error output without sentinel echo.
- Add tampered artifact, digest mismatch, unknown source, and stale descriptor
  version cases when the trusted source resolver is specified; no such runtime
  exists yet.
- Verify glossary links and architecture terms stay aligned when the lifecycle
  table is changed.
- No human usability/demand test is implied or claimed.

## Strict unanimity result

**Revise.** The authentication-focused developer and architect lenses identify
an evidence-backed reference/acceptance mismatch; the general developer,
student, security engineer, and architect lenses identify the unresolved
stopped-run evidence/lifecycle contradiction. These are credible blockers in a
scenario contract, not usability opinions. The remaining five-lens concerns
are inferred or unknown and do not substitute for runtime proof or user
validation.
