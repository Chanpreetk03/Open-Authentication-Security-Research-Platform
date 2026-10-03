# D7 — Synthetic capability inventory review

## Purpose and scope

Run the five persona lenses against ROAD-003's uncommitted capability catalog,
in-app Coverage page, published inventory, roadmap/backlog status, and the
source modules that own each listed behavior. This is internal critique, not
human review, user validation, or evidence of demand.

**Recommendation: revise.** Two safety/evidence-boundary issues need correction
before the strict internal design gate passes: the HTTP inspector's redaction
claim is broader than its heuristic, and the Coverage headline implies that
tools prove outcomes despite repeated limitations saying they do not. Also
resolve the HTTP/2 wording ambiguity and the omitted explicit input bounds in
the UI catalog.

## Evidence inspected

- Catalog data and contract test: `web/src/capabilities.ts`,
  `web/src/capabilities.test.ts`.
- Navigation, active-tool summary and Coverage page: `web/src/main.tsx`,
  `web/src/components/CapabilityCatalog.tsx`.
- Published inventory and completion claims: `docs/product/capability-inventory.md`,
  `docs/roadmap/backlog.md`, `docs/roadmap/roadmap.md`, `README.md`.
- Behavior owners: `web/src/protocols/{oauth,jwt,http-inspector,saml,saml-metadata}.ts`,
  `backend/internal/oauthoidc/flow.go`, `backend/internal/saml/*.go`,
  `web/src/academy/defense-in-depth.ts`.
- Boundary docs: `docs/architecture/protocols/{oauth-oidc-module,jwt-inspector,http-inspector,saml-assertion-viewer,saml-metadata-inspector,saml-*-lab}.md`.

## Cross-check of catalog claims

- **Observed:** the 13 catalog IDs correspond to the current 13 capability
  navigation surfaces. `coverage` is a catalog destination rather than a
  separate protocol capability. The test checks exact ID equality and unique
  IDs, but it does not verify every prose claim against implementation.
- **Observed:** OAuth is generated from local backend traces. The four state /
  PKCE combinations map to synthetic scenarios in
  `backend/internal/oauthoidc/flow.go`; no external provider is called.
- **Observed:** JWT decoding accepts a three-segment compact token and reports a
  five-segment JWE shape as unsupported. It does not verify signatures, select
  trusted keys, fetch remote keys, decrypt JWE, or make identity decisions.
  `web/src/protocols/jwt.ts` sets a 64 KiB input maximum.
- **Observed:** HTTP inspection parses absolute HTTP(S) URLs and text start-line
  forms, masks selected values using `SENSITIVE_NAME` and explicit header rules,
  omits bodies, and enforces 64 KiB / 200-header limits. The heuristic cannot
  know whether arbitrary unrecognized text is a secret. The parser accepts a
  textual `HTTP/2` start-line form; it does not parse HTTP/2 frames, HPACK, or
  wire traffic.
- **Observed:** SAML assertion parsing is browser-local, namespace-aware,
  selected-field extraction; it rejects DTD/entity declarations and bounds
  input/counts. It does not validate signatures, trust, policy, or authentication.
- **Observed:** SAML metadata parsing extracts selected metadata fields and
  declared certificate-use counts, rejects DTD/entity declarations, and checks
  `validUntil` against the local clock. It does not authenticate metadata,
  verify certificates/signatures, fetch endpoints, or establish trust.
- **Observed:** all seven SAML labs create synthetic traces that isolate one
  rule while holding other trust/assertion checks assumed successful. They do
  not parse real SAML XML or operate a real ACS. Source owners include
  `backend/internal/saml/replay.go`, `correlation.go`, `audience.go`,
  `recipient.go`, `conditions.go`, `signature.go`, and
  `subject_confirmation.go`.
- **Observed:** Academy's evidence checker consumes OAuth trace labels and
  fields; it is learning content over existing traces, not another protocol
  implementation (`web/src/academy/defense-in-depth.ts`).
- **Observed:** none of the 13 records is assigned `Standards validation` or
  `Live interoperability`; the Markdown inventory also states those modes are
  absent. Planned LDAP, Kerberos, MFA/TOTP, WebAuthn/passkeys and PKI/key tools
  remain explicitly unimplemented.
- **Unknown:** real users' understanding of these labels, task success, adoption
  or demand. This panel provides no evidence on those questions.

## Persona lenses

### 1. Authentication-focused developer

- **Goal:** identify exactly which exchanges and formats can be inspected and
  what a result does not validate.
- **Likely value — Observed:** the per-surface exclusions are concrete for JWT,
  SAML, OAuth, and the individual SAML labs; the inventory separates local
  inspection from synthetic traces.
- **Friction/blocker — Observed:** `web/src/capabilities.ts` says the HTTP
  inspector accepts HTTP/2 request/response “start lines.” HTTP/2 has no
  textual start line; the source regex accepts a text shorthand only. The
  detailed HTTP doc's “HTTP/2-style start lines” is closer, but the inventory
  and UI wording can still be read as HTTP/2 message support.
- **Friction/blocker — Observed:** the HTTP catalog record says sensitive
  values are masked, while `http-inspector.ts` relies partly on a finite name
  heuristic. Custom credential headers/parameters with unrecognized names can
  remain visible. The UI does not state that redaction is best-effort.
- **Unknown:** whether protocol engineers consider these boundaries sufficiently
  discoverable in actual debugging work.

### 2. General application developer

- **Goal:** find a useful tool quickly and distinguish decoding from a security
  decision.
- **Likely value — Observed:** Coverage groups each card into mode, scope,
  behavior, and exclusions; cards link back to the tool.
- **Friction/blocker — Observed:** the page headline says “See what each tool
  does and proves.” This overstates evidence for tools that explicitly do not
  verify, validate, or establish trust. For the HTTP inspector in particular,
  the general redaction promise can encourage a false assumption that any
  secret-looking value is hidden.
- **Inferred:** a short global warning that pasted data is not guaranteed to be
  fully redacted would help users decide what they can safely inspect.
- **Unknown:** label comprehension and discoverability without human evaluation.

### 3. Student/security learner

- **Goal:** understand what a modeled check demonstrates and avoid treating a
  lesson trace as proof about a real deployment.
- **Likely value — Observed:** Academy is explicitly classified as learning
  content and identifies the reused OAuth traces. SAML labs name isolated
  checks and enumerate assumptions.
- **Friction/blocker — Observed:** “proves” conflicts with the stated boundary
  that modeled traces are synthetic and surrounding checks are assumed. The
  content teaches a modeled decision, not successful mitigation in a real
  system.
- **Friction/blocker — Inferred:** the mode taxonomy groups “cryptographic or
  normative conformance checks” under “Standards validation.” Cryptographic
  verification and standards/profile conformance are different claims; future
  users may conflate signature validity with complete protocol acceptance.
- **Unknown:** whether learners can independently explain these distinctions.

### 4. Security engineer

- **Goal:** understand redaction limits, modeled assumptions, reproducibility,
  and containment.
- **Likely value — Observed:** synthetic scenarios are labeled as such, source
  traces use synthetic values, and no live target or traffic capability is
  claimed. The inventory says current attack exercises are non-executable.
- **Friction/blocker — Observed:** the HTTP redaction statement is not bounded
  to the detector's actual behavior. A user may paste a custom credential value
  and see it rendered unmasked. This is a safety/evidence-boundary blocker.
- **Friction/blocker — Observed:** inventory entries for SAML assertion and
  metadata inspection omit explicit size/count limits that implementation and
  architecture docs enforce (assertion viewer: 256 KiB and count limits;
  metadata: 1 MiB, 50 entities, 100 endpoints per role, and 20 certificate
  entries). D3 acceptance requires limits to match implementation. The cards
  currently say “bounded” only in general language or omit bounds.
- **Unknown:** browser/assistive-tech behavior is not verified by this review;
  D6 explicitly records no browser-driven or assistive-technology test.

### 5. Architect/educator

- **Goal:** compare coverage without flattening protocol-specific semantics and
  distinguish implemented tools from roadmap intent.
- **Likely value — Observed:** the inventory separates OAuth, JWT, HTTP,
  SAML inspection, synthetic SAML labs, and Academy; unimplemented protocol
  families are named explicitly.
- **Friction/blocker — Observed:** HTTP/2 shorthand wording blurs a textual
  parser with wire-protocol support. The mode definition also combines
  cryptographic verification and normative conformance under one future label.
- **Inferred:** adding a protocol/format coverage matrix (including “not
  implemented”) may make broad protocol gaps easier to scan than the prose
  exclusions, but it is not required to accurately describe these 13 entries.
- **Unknown:** whether educators need this matrix or would prefer the current
  entry-by-entry view.

## Must-fix before an internal design-gate pass

1. Narrow HTTP inspector copy to say it masks values matching named heuristics
   and explicit rules, and warn that pasted data may still contain visible
   secrets. Keep “best effort” language in both the catalog and inspector UI.
2. Change the Coverage heading from “does and proves” to a wording that promises
   scope and limits, not proof; for example, “See what each tool supports and
   where it stops.”
3. Describe HTTP/2 as a supported textual shorthand/start-line form only, and
   explicitly state that the tool does not parse HTTP/2 frames or wire format.
4. Include concrete input/count bounds in the capability records/cards for
   SAML assertion and metadata inspection, or link each card directly to the
   detailed boundary docs that state them. D3 says catalog limits should match
   implementation limits.
5. Separate future cryptographic verification from standards/profile
   conformance in taxonomy wording; neither is implemented, but they are
   distinct outcomes.

## Test next (after corrections)

- Add catalog contract checks for the wording above and for bounds/doc links so
  the catalog test detects prose drift, not only ID/mode omissions.
- Add an HTTP-inspector test with a credential in an arbitrary custom header or
  parameter to prove the warning accurately describes incomplete detection.
- Run browser keyboard and screen-reader checks on catalog grouping, card
  controls, and navigation back to tools; current evidence only confirms
  semantic sections/buttons in source, not assistive-tech behavior.
- Re-run source-claim cross-check and the strict 5/5 synthetic panel after edits.

## Strict gate result

**Revise.** At least the security-engineer lens identifies a credible blocker:
the broad redaction promise exceeds the name-based implementation. The
“proves” headline and HTTP/2 ambiguity are additional cross-lens evidence
problems. A 5/5 gate pass is not warranted. All factual claims above are
repository observations unless marked inferred or unknown; no human validation
or demand claim is made.
