# D7 reassessment — ROAD-003 capability inventory

## Purpose and decision

Reassess the original ROAD-003 panel findings against the corrected runtime
catalog, Coverage page, HTTP inspector boundary, published Markdown inventory,
roadmap/backlog, and source behavior owners. Apply the five-lens strict
unanimity rule. This is synthetic internal critique only; it is not human
review, user validation, or demand evidence.

**Recommendation: internal design gate passes (5/5).** All five lenses find the
previously identified critical blockers corrected in the current text. The
inventory remains bounded to observed current behavior, and explicit unknowns
and test follow-ups remain recorded below.

## Initial blocker recheck

1. **HTTP redaction overclaim — corrected.** `web/src/capabilities.ts` and
   `docs/product/capability-inventory.md` now describe best-effort masking,
   built-in sensitive-name patterns and explicit rules, the possibility that
   custom credential names remain visible, and the need to sanitize before
   pasting. `web/src/components/RequestInspector.tsx` repeats the warning in
   the active tool. The implementation remains heuristic, but copy no longer
   promises comprehensive secret detection.
2. **“Does and proves” headline — corrected.**
   `web/src/components/CapabilityCatalog.tsx` says “See what each tool supports
   and where it stops.” Individual cards use “Does not establish,” and the
   page says no current tool performs cryptographic verification,
   standards/profile validation, or live interoperability.
3. **HTTP/2 wording — corrected.** Catalog and detailed docs specify a
   simplified textual request/response line parser accepting an HTTP/2 version
   token and explicitly exclude HTTP/2 messages, frames, and wire format.
   `web/src/protocols/http-inspector.ts` confirms that it parses text with a
   start-line regex; it is not a frame or wire parser.
4. **SAML inspection limits — corrected.** The catalog and Markdown inventory
   disclose the assertion viewer's 256 KiB input, assertion/attribute/value
   counts and displayed-value length, and the metadata viewer's 1 MiB input,
   entity/endpoint/NameID/certificate counts. These values agree with
   `web/src/protocols/saml.ts` and `web/src/protocols/saml-metadata.ts` constants.
5. **Cryptography versus conformance taxonomy — corrected.** Runtime and docs
   now describe `Cryptographic verification` and
   `Standards/profile validation` as distinct modes, with both explicitly
   unimplemented. Current tools are not assigned either mode.

## Source and documentation cross-check

- **Observed:** `web/src/capabilities.test.ts` checks exact coverage of the 13
  current capability IDs, mode limitations, Academy classification, and
  corrected HTTP/SAML scope phrases and bounds. `coverage` is a destination,
  not another protocol capability.
- **Observed:** `web/src/main.tsx` drives active capability summaries from the
  typed catalog; `CapabilityCatalog` renders the same records as cards with
  keyboard-operable buttons. The catalog is accessible through the Learn
  navigation group.
- **Observed:** source-backed scopes remain consistent: OAuth traces are
  synthetic (`backend/internal/oauthoidc/flow.go`); JWT is untrusted local
  decode without signature verification or JWE decryption
  (`web/src/protocols/jwt.ts`); SAML and metadata are browser-local selected
  extraction without signature/trust validation; the seven SAML labs model
  isolated rules and assume surrounding checks; Academy consumes the OAuth
  traces rather than implementing another engine.
- **Observed:** no catalog entry claims standards/profile validation or live
  interoperability. The Markdown inventory explicitly names absent LDAP,
  Kerberos, MFA/TOTP, WebAuthn/passkeys, PKI/key lifecycle, and executable
  attack-lab runtime capabilities. ROAD-003 status is complete in
  `docs/roadmap/backlog.md` and does not assert empirical usability or demand.
- **Unknown:** whether real developers, students, engineers, or educators find
  the taxonomy and cards understandable. No human review or study is part of
  this product process; this panel provides no empirical evidence.

## Five persona lenses

### Authentication-focused developer — pass

- **Goal:** see exactly what exchanges/formats are handled and what a result
  does not validate.
- **Observed value:** the per-tool scope and exclusion fields distinguish local
  parsing, synthetic trace generation, and learning content. JWT, SAML,
  metadata, and each synthetic lab state their trust and validation limits.
- **Observed friction resolved:** HTTP/2 is constrained to a textual version
  token; the inventory explicitly says it is not HTTP/2 message support and
  excludes frames/wire parsing. HTTP redaction limits are explicit.
- **Unknown:** actual usefulness during real integration debugging.

### General application developer — pass

- **Goal:** quickly identify a suitable tool and avoid confusing a decoded or
  modeled result with a security decision.
- **Observed value:** the Coverage headline now promises scope and boundaries;
  cards label mode, protocol/format, behavior, and what the feature does not
  establish. The HTTP tool warns users to sanitize before pasting.
- **Observed friction resolved:** neither the headline nor redaction copy
  implies proof or complete secret detection.
- **Unknown:** discoverability and comprehension for people outside the team.

### Student/security learner — pass

- **Goal:** understand what the synthetic exercises teach without treating a
  modeled outcome as real deployment evidence.
- **Observed value:** Academy is called learning content and names its reused
  OAuth evidence; the synthetic labs state their assumptions. Cryptographic
  verification and standards/profile validation are separately named.
- **Observed friction resolved:** “proves” language is removed; modeled checks
  are not conflated with cryptographic or normative validation.
- **Unknown:** whether learners can transfer these distinctions to real
  systems.

### Security engineer — pass

- **Goal:** understand detector limits, safety boundaries, synthetic
  assumptions, and operational scope.
- **Observed value:** the HTTP inspector warns of best-effort redaction and
  local-only processing; limits and body omission are documented. SAML
  inspection bounds are exposed in the catalog. Synthetic labs do not claim
  real ACS, XML, or trust validation.
- **Observed friction resolved:** copy no longer promises all secrets will be
  masked and no longer implies HTTP/2 wire support.
- **Unknown:** browser/assistive-technology behavior has not been exercised;
  this is recorded as a follow-up, not a product-scope blocker.

### Architect/educator — pass

- **Goal:** compare coverage while preserving protocol distinctions and keeping
  planned scope separate from current behavior.
- **Observed value:** the 13 entries retain their own protocol and mode; missing
  protocol families and future lab runtime are named as not implemented.
  Cryptographic checks and standards/profile checks have separate labels.
- **Observed friction resolved:** textual HTTP shorthand is not represented as
  HTTP/2 message support, and future validation modes are distinguished.
- **Unknown:** whether a separate protocol matrix would improve comprehension;
  no evidence makes that necessary for accurate current-state coverage.

## Test next (not blocking this internal gate)

- Consider a browser keyboard and screen-reader pass over the Coverage view and
  navigation. Source semantics use sections, labels, `dl`, and buttons, but no
  assistive-technology run is recorded.
- Expand catalog contract tests to compare selected per-tool boundaries or
  architecture links, reducing risk of prose drift. The current test covers
  IDs, modes, corrected HTTP claims, key SAML limits, and the custom credential
  header behavior, but not every catalog sentence.

## Strict unanimity result

**5/5 lenses pass.** The initial credible issues are corrected, no new critical
overclaim or unsafe boundary was found in the reviewed catalog, and remaining
items are verification improvements rather than blockers. This allows the
internal ROAD-003 design gate to close; it does not establish human usability,
actual task performance, or product demand.
