# I3 — Feasibility and product fit

**Purpose:** Estimate fit, dependencies, safety concerns, and the smallest test for the repository's idea set.

**Inputs:** `01-idea-frame.md`; implementation inventory; PRD; product/protocol architecture; security boundaries; roadmap.

## Current implementation evidence

- **OAuth/OIDC workbench:** Go flow simulation returns ordered, redacted events and explanations (`backend/internal/oauthoidc/flow.go`); README describes the React timeline. It is simulation, not a real provider integration.
- **Inspection tools:** JWT, HTTP, SAML assertion, and SAML metadata inspection components exist under `web/src/components/` with protocol mapping/tests under `web/src/protocols/`. HTTP inspection is offline and non-replaying (`docs/architecture/protocols/http-inspector.md`).
- **Attack exercises:** Go and frontend implementations/tests exist for synthetic SAML replay, request correlation, audience, recipient, time conditions, signature binding, and subject confirmation (`backend/internal/saml/`, `web/src/components/`, `web/src/protocols/`). The replay lab says it does not parse/sign XML, authenticate users, create real sessions, accept uploaded assertions, or contact real targets (`docs/architecture/protocols/saml-replay-lab.md`).
- **Learning path:** one executable Academy exercise joins missing-state/missing-PKCE scenarios to secure-flow verification (`web/src/academy/`, `docs/academy/defense-in-depth-oauth.md`).
- **Runtime isolation:** architecture describes allowed destinations, resource limits, synthetic data, and reset/destruction; product architecture also says local-process/container/sandbox choice and manifest/capability policy remain open. Current attacks are synthetic simulations rather than evidence of an isolated general-purpose runtime.
- **Protocol expansion:** SAML has several synthetic checks; LDAP, Kerberos, WebAuthn, and passkeys appear in docs/roadmap but were not present in the listed implementation files. No stable plugin API is implemented.

## Fit and rough effort/risk

| Idea | Fit | Relative effort | Main dependency or risk | Assessment |
|---|---|---:|---|---|
| Protocol visualization | Core | Low–medium | Normalize protocol-specific events without flattening semantics; redact secrets | Continue deepening the existing exchange/timeline model; validate comprehension and debugging value. |
| Cyber-range isolation | Core safety gate for executable vulnerable labs | High | Runtime boundary, host/network/filesystem isolation, quotas, reset, capability policy | Define an explicit isolation level and prove it before running arbitrary vulnerable code. Synthetic simulations remain the smallest safe baseline. |
| Security-principle learning paths | High | Medium | Curriculum authoring and evidence-based exercises | Expand from the existing OAuth defense-in-depth lesson with a small second lesson after learner feedback. |
| Attack replay | High for repeatability; dangerous if generalized to live targets | Medium | Trace format, deterministic fixtures, target authorization, redaction | Start with save/replay of synthetic traces; keep live proxy/replay out of the first experiment. |
| Secure-coding exercises | High | Medium | Pair each vulnerable example with a secure variant and automated verification | Treat as a format for labs/Academy, not a separate platform subsystem. |
| PKI | Medium–high | High | Trust chains, certificates, revocation, parsing and cryptographic correctness | Scope to explain/inspect synthetic certificate chains and trust failures before broad PKI tooling. |
| Key management | Cross-cutting, high | Medium–high | Secret lifecycle, rotation, storage, redaction, recovery; risk of real key handling | Teach key lifecycle with synthetic keys; do not make a production secret manager. |
| WebAuthn/passkeys | High eventual relevance | High | Browser ceremonies, origins/RP IDs, authenticators, attestation and recovery | Defer until core web/federation concepts and demand are clearer; prototype a deterministic local ceremony. |
| SAML | High and already partially implemented | Medium | Synthetic model is not full parser/validator; XML-signature complexity | Deepen the existing isolated acceptance-check lessons; label simulation boundaries prominently. |
| LDAP | Medium | High | Directory semantics, filters, TLS, target isolation, environment setup | Sequence after a proven lab/runtime pattern; begin with synthetic directory/query exercises. |
| Kerberos | Medium | Very high | Multi-role KDC/client/service model, cryptographic ticket flow, environment complexity | Defer until users confirm need and LDAP/directory foundations exist; start as diagram/trace model. |
| Plugin model | Potential future enabler | High if generalized early | Compatibility, trust in third-party code, versioning, sandboxing | Defer public plugins. First stabilize an internal module descriptor and add another first-party module to test the seam. |
| Enterprise connectors / access governance / hosted multi-tenancy | Low for current thesis | Very high | Moves toward full IAM/SaaS, operational and data-isolation burden | Keep deferred per PRD; reassess only if validated users need them to use the workbench. |

## Smallest useful experiment

Run moderated task sessions with developers/security learners using the current OAuth/JWT/HTTP/SAML surface. Ask them to (1) explain a flow from the trace, (2) diagnose one failure, and (3) select and verify a mitigation. Observe completion and confusion without introducing live network replay. Separately, use a threat-model review to set the minimum isolation bar before promoting synthetic labs to executable vulnerable scenarios.

**Next node:** I5 challenges sequencing and assumptions.
