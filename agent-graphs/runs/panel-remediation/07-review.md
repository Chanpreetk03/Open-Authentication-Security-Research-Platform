# D7 â€” Synthetic persona panel review

**Date:** 2026-10-03
**Change:** Grouped tool navigation, editable OAuth state/PKCE protections and
four modeled combinations, strict local POST simulation boundary, and adoption
of synthetic internal critique instead of human review sessions.
**Outcome:** **Revise â€” unanimous internal design gate does not pass.** A
published OAuth scenario path is incomplete. This is repository-based
synthetic critique, not user validation.

## Evidence inspected

- `web/src/main.tsx`: `App`, `toolButton`, `OAuthExplorer`, protection
  controls, and `runFlow`.
- `web/src/styles.css`: `.tool-switcher`, `.tool-group`, and
  `.protection-controls`.
- `web/src/protocols/oauth.ts`: `runOAuthConfiguration`,
  `runOAuthScenario`, and response mapping; `web/src/protocols/oauth.test.ts`.
- `backend/cmd/server/main.go`: OAuth GET/POST handlers and `withCORS`;
  `backend/cmd/server/main_test.go`: POST request validation cases.
- `backend/internal/oauthoidc/flow.go`: `Scenarios`,
  `NewAuthorizationCodeFlowForScenario`,
  `NewAuthorizationCodeFlowForProtections`, and the combined trace;
  `backend/internal/oauthoidc/flow_test.go`.
- `docs/adr/007-synthetic-persona-review-policy.md`,
  `docs/research/internal-product-review.md`, roadmap/backlog, and
  `agent-graphs/agents/synthetic-persona-panel.md`.
- D1â€“D4 artifacts in this run. No D5/D6 implementation or verification
  artifact was present during this review; test execution results therefore
  remain **Unknown** here.

## Five lens findings

### 1. Authentication-focused developer

- **Observed:** OAuth offers default-on state and PKCE checkboxes, clears a
  prior result when either changes, and POSTs only the two booleans to the
  local API (`web/src/main.tsx`, `runOAuthConfiguration`). The handler bounds
  the body to 1,024 bytes, rejects unknown fields, requires both boolean
  pointers, rejects extra JSON values, and generates an in-memory modeled flow
  (`backend/cmd/server/main.go`).
- **Inferred â€” value:** directly comparing the four protection combinations
  should make this focused OAuth lesson more useful for understanding which
  check changed the result.
- **Observed â€” blocker:** `Scenarios()` advertises
  `missing-state-and-pkce`, and the README lists it as a supported GET scenario,
  but `NewAuthorizationCodeFlowForScenario` has no switch case for
  `ScenarioMissingBoth`. A GET using that advertised ID returns HTTP 200 with
  the scenario populated but empty status, events, and learning outcome;
  only the new POST path reaches `newFlowWithoutStateOrPKCE`.
- **Unknown:** behavior against real authorization servers and compatibility
  with OAuth/OIDC implementations are not established by these synthetic
  traces.

### 2. General application developer

- **Observed:** all 13 tool buttons remain available under four visible labels
  (Flows, Inspect, Learn, SAML labs); the current button retains
  `aria-current="page"` (`web/src/main.tsx`).
- **Inferred â€” value:** visible grouping should reduce the effort of scanning
  the previous flat tool row. The OAuth page states that the run is synthetic
  and no provider is contacted.
- **Inferred â€” friction:** `.tool-group` uses a generic `div` with
  `aria-label`; generic containers do not provide a named navigation group to
  assistive technology. The visible labels remain in reading order, but
  semantic grouping should be checked rather than assumed.
- **Unknown:** whether the labels and categories match developersâ€™ mental
  models or improve time to first useful result.

### 3. Student/security learner

- **Observed:** controls default to both protections enabled; turning either
  off removes the previous trace. Findings include mitigations, and traces
  explain state binding, PKCE verifier mismatch, and the combined failure.
  Tests encode the four POST-generated outcomes (`flow_test.go`).
- **Inferred â€” value:** learners can alter the protections and rerun without
  being asked to modify an external application.
- **Inferred â€” friction:** UI-to-trace feedback depends on actually running
  the app; no component-level test or D6 evidence was available in the review
  artifacts to establish that checkbox changes, loading, errors, and reruns
  work in the rendered workflow.
- **Unknown:** learnersâ€™ comprehension, task success, or confidence after use.

### 4. Security engineer

- **Observed:** the POST accepts only the two booleans, caps request size,
  rejects malformed/missing/wrong-type/unknown/trailing values in listed
  handler tests, and CORS names the local Vite origin. The server binds to
  `127.0.0.1`; attack values and tokens in generated traces are masked.
- **Inferred â€” value:** the constrained input surface avoids turning this
  control into arbitrary URL replay or provider traffic. The insecure branches
  expose modeled impact and findings.
- **Observed â€” blocker:** a second public API path for the newly advertised
  combined scenario is incomplete as described above; the current route tests
  cover POST validation but not OAuth GET scenario execution.
- **Unknown:** broader deployment safety if the server bind/CORS configuration
  changes, and standards-level conformance or behavior of real systems.

### 5. Architect/educator

- **Observed:** ADR-007 says no human reviewers or participant sessions are
  part of the standard review process, requires unanimity across five lenses,
  and marks real-world usability/demand unknown. The research protocol and
  roadmap repeat that boundary. The panel profile names OAuth/OIDC, JWT,
  SAML, LDAP, Kerberos, MFA/TOTP, WebAuthn/passkeys, PKI, algorithms, and
  sandbox concerns as coverage prompts.
- **Inferred â€” value:** a durable ADR and repeatable review artifact format
  gives a solo developer an auditable internal critique process.
- **Inferred â€” friction:** current feature scope remains a narrow OAuth model
  beside existing SAML labs and inspectors; this change does not create a
  cross-protocol composer or comparable algorithm/key workflows. This is a
  roadmap gap, not a reason to expand this remediation.
- **Unknown:** whether the five written lenses represent actual educator,
  architect, or developer needs. The process cannot provide empirical
  agreement or demand evidence.

## Cross-topic coverage gaps

- **Observed:** the feature changes OAuth state/PKCE only. Existing repository
  surfaces include JWT/HTTP/SAML inspectors and synthetic SAML labs, while
  ADR-007 and the panel profile explicitly distinguish synthetic critique from
  empirical validation.
- **Observed:** no new coverage is added here for OIDC discovery/ID-token
  verification, cryptographic algorithm selection, PKI/key lifecycle,
  LDAP, Kerberos, MFA/TOTP, or WebAuthn/passkeys. Those remain roadmap topics.
- **Inferred:** the grouped navigation is an incremental organization of the
  current suite, not evidence of broad protocol or algorithm coverage.
- **Unknown:** actual discoverability, teaching effectiveness, and whether the
  current set of protocol groups is the right information architecture.

## Must-fix

1. **Observed blocker:** make
   `NewAuthorizationCodeFlowForScenario(ScenarioMissingBoth, ...)` return the
   same complete trace as `NewAuthorizationCodeFlowForProtections(false,
   false, ...)`, or remove the combined ID from the GET scenario catalog and
   README if it is intentionally POST-only. Keep the API contract and docs
   consistent. Add a GET route test that checks nonempty status/events/findings
   and expected final event.

## Test next

- **Inferred:** add a rendered/component test or focused browser check covering
  the four combinations, result clearing on edits, running/loading/error
  states, and accessible names/current selection for grouped navigation.
- **Unknown:** whether visible labels improve discoverability. No empirical
  claim should be made under the current no-human-review policy.
- **Observed gap:** run and record the planned Go tests, web tests, and build in
  D6 before closing the implementation; this reviewer did not observe their
  execution output.

## Strict unanimity result

**Revise.** The combined OAuth scenario is listed as supported but its GET
builder emits an incomplete flow, which is a credible correctness blocker for
the authentication developer and security engineer lenses. Under the strict
threshold, one blocker is sufficient to fail the internal gate. No human
review or participant session was conducted or is implied; real-world
usability, demand, and market fit remain unknown.
