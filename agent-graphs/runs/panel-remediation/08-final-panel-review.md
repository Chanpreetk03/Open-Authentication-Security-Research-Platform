# D7 â€” Final synthetic persona panel reassessment

**Date:** 2026-10-03
**Change:** Final review of grouped navigation, configurable synthetic OAuth
state/PKCE flow, four protection combinations, local POST boundary, and
synthetic internal review policy.
**Recommendation:** **Internal design gate passes** under the strict
unanimity threshold. No lens found a credible critical blocker in its remit.
This is internal critique only and does not establish actual usability,
demand, or market fit.

## Evidence inspected

- `web/src/main.tsx`: grouped tool navigation and `OAuthExplorer` protection
  controls / run behavior.
- `web/src/styles.css`: navigation groups and protection-control styling.
- `web/src/protocols/oauth.ts` and `web/src/protocols/oauth.test.ts`:
  configuration POST and flow mapping.
- `backend/internal/oauthoidc/flow.go`: `Scenarios`,
  `NewAuthorizationCodeFlowForScenario`,
  `NewAuthorizationCodeFlowForProtections`, and trace builders;
  `backend/internal/oauthoidc/flow_test.go`.
- `backend/cmd/server/main.go`: OAuth GET and POST handlers, size/JSON
  validation, loopback bind, and CORS; `backend/cmd/server/main_test.go`:
  POST validation and GET complete-flow regression tests.
- D5/D6 records in this run, ADR-007, the current internal review protocol,
  roadmap/backlog, and historical ROAD-002 artifacts plus its superseding
  owner decision.

## Trace-path confirmation

- **Observed:** GET scenarios are enumerated as secure, missing state, missing
  PKCE, and missing both (`Scenarios`). The GET handler dispatches each ID to
  `NewAuthorizationCodeFlowForScenario`; all four have complete flows there,
  including explicit mapping of `ScenarioMissingBoth` to
  `newFlowWithoutStateOrPKCE`. Route tests now exercise all four IDs and check
  successful responses for scenario, events, status, and learning outcome.
- **Observed:** POST accepts the two protection booleans and calls
  `NewAuthorizationCodeFlowForProtections`. Its truth table maps all four
  combinations to the corresponding scenario builder. Route tests now exercise
  all four combinations and assert the expected scenario plus nonempty events,
  status, and learning outcome. Model tests also assert expected findings and
  final events.
- **Inferred:** both GET and POST can produce complete modeled traces for all
  four combinations, with full route-level matrix coverage now in place.
- **Unknown:** equivalence to real OAuth/OIDC provider behavior or
  standards-level conformance. These are local synthetic traces.

## Five lens findings

### 1. Authentication-focused developer

- **Observed:** controls default to state and PKCE enabled, and each change
  clears stale output. Both APIs have paths for all four combinations. Secure,
  missing-state, missing-PKCE, and combined traces distinguish callback state
  checks from code-verifier checks and report findings for the omitted
  protections.
- **Inferred â€” value:** a developer can compare specific protection changes
  without configuring a real provider or changing an external application.
- **Unknown:** whether trace detail is sufficient for real integration
  debugging and supported provider/version coverage.
- **Blocker:** none found in this feature's remit.

### 2. General application developer

- **Observed:** the 13 existing tools appear under visible Flow, Inspect,
  Learn, and SAML labs labels. Each group uses `role="group"` with an
  `aria-label`, and active selection retains `aria-current="page"`
  (`web/src/main.tsx`). The OAuth copy identifies the run as synthetic and
  says no provider is contacted.
- **Inferred â€” value:** categorization gives a first-pass map of the existing
  surfaces without removing tools.
- **Inferred â€” test next:** a browser or accessibility check could confirm
  that assistive technology announces the named groups and their buttons in a
  useful order.
- **Unknown:** whether these categories match actual developersâ€™ mental models
  or improve discoverability.
- **Blocker:** none found; accessibility semantics are a follow-up check, not
  a critical obstacle evidenced by this diff.

### 3. Student/security learner

- **Observed:** learners can toggle each protection, rerun the simulation,
  inspect a timeline, see findings/mitigations, and compare the resulting
  modeled outcomes. D6 records `npm test` passing with 7 files/41 tests and
  `npm run build` passing.
- **Inferred â€” value:** direct changes to protections provide a clearer
  mitigation loop than fixed preset selection.
- **Unknown:** whether learners understand the trace, achieve learning goals,
  or can use it independently; there was no browser-driven or participant
  evaluation.
- **Blocker:** none found in the code-backed learning loop. No learner outcome
  claim is made.

### 4. Security engineer

- **Observed:** POST accepts only the two required booleans, limits bodies to
  1 KiB, rejects unknown fields and multiple JSON values, and emits a
  synthetic trace. The server binds to loopback; CORS is limited to the local
  Vite origin. Trace tokens/codes are masked. D6 records `go test ./...`
  passing for server, OAuth/OIDC, and SAML packages.
- **Inferred â€” value:** this is a constrained local teaching simulation, not
  arbitrary request replay or a live-provider test tool.
- **Unknown:** conformance, real-server security outcomes, and deployment
  behavior if host binding or CORS policy changes.
- **Blocker:** none found after the combined GET builder fix and regression
  test.

### 5. Architect/educator

- **Observed:** ADR-007 makes the panel the normal internal review gate,
  requires no credible blocker from all five lenses, excludes human reviewers
  and participant sessions from the standard process, and leaves real-world
  usability/demand unknown. Current roadmap separates inspection, simulation,
  standards validation, and live interoperability.
- **Observed:** prior ROAD-002 artifacts retain their original
  pending-human-session text as historical record, and now carry a banner
  pointing to ADR-007 and `09-owner-decision.md`, which supersede that
  recommendation. ADR-007 is designated the authoritative policy. Current
  roadmap/backlog and review protocol reflect the synthetic-only internal
  gate.
- **Inferred â€” value:** ADR-007 and the current protocol create a repeatable
  internal critique process while preserving uncertainty about actual users.
- **Unknown:** whether the five written personas represent real usersâ€™ needs.
- **Blocker:** none found in active policy. Historical contradictory
  recommendations are explicitly superseded by the durable decision record.

## Cross-topic coverage gaps

- **Observed:** the remediation covers OAuth authorization-code state and
  PKCE only. Existing workbench scope includes browser-local JWT/HTTP/SAML
  inspectors and synthetic SAML labs.
- **Observed:** OIDC discovery/ID-token validation, LDAP, Kerberos, MFA/TOTP,
  WebAuthn/passkeys, broad PKI/key lifecycle, and algorithm coverage remain
  separate roadmap work. The change does not claim them as implemented.
- **Inferred:** grouping is an incremental navigation improvement, not a
  cross-protocol authoring/comparison workbench or broad algorithm sandbox.
- **Unknown:** real-world coverage priorities and comparative usability.

## Test next

1. **Inferred:** verify screen-reader announcements and keyboard navigation
   for the labeled groups and protection controls; code now declares group
   roles and names, but no rendered accessibility check is recorded in D6.
2. **Unknown:** actual discoverability and learning outcomes remain unknown
   under the no-human-review policy; do not label the panel pass as validation.

## Strict unanimity result

**Internal design gate passes: 5/5 lenses found no credible critical blocker.**
The initial incomplete combined GET path was fixed, and GET/POST route tests
now cover all four combinations with complete-flow assertions. D6 records the
test suites and build passing. The remaining accessibility check is not a
blocker to continuing internal product work. No human review or participant
session occurred. Real-world usability, demand, and market fit remain unknown.
