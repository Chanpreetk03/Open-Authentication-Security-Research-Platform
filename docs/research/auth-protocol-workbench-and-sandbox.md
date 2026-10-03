# Authentication Protocol Workbench and Sandbox: Research and Plan

**Prepared:** 2026-10-03
**Status:** Accepted product direction; staged execution plan
**Purpose:** Define the product as a Postman-like workbench for authentication protocols and cryptographic artifacts, paired with safe, resettable attack labs.

## Executive summary

The product is an **authentication protocol workbench**, not a general-purpose identity provider. A user should configure a flow, run it against a local lab or explicitly selected test system, inspect messages and artifacts, check protocol/security properties, mutate a scenario to reproduce a weakness, compare secure behavior, and reset it.

The market has strong tools for pieces of this workflow. Postman organizes API requests into collections and environments and has OAuth authorization support. Curity OAuth.tools focuses on OAuth/OIDC flows and JWT inspection/creation. The OpenID Foundation Conformance Suite provides role/profile-oriented implementation tests. PortSwigger Web Security Academy and OWASP WebGoat provide deliberate vulnerability education and practice. AgID's SPID SAML Check combines SAML request/metadata inspection, test IdP, custom responses, and conformance checks. These examples support a product opportunity in connecting those jobs in one protocol-specific, local-first workflow; they do not prove that no overlapping products exist.

The core loop is **configure → execute → observe → validate → attack → compare → reset**. The current repository is a starting point: a synthetic OAuth flow, local JWT/HTTP/SAML inspectors, synthetic SAML policy labs, and one defense-in-depth lesson. The product step is to make selected flows executable and repeatable, not to grow a shared identity engine.

## Product definition

### One sentence

An open, local-first workbench for building, running, inspecting, testing, and safely attacking authentication protocol exchanges.

### What “Postman for auth” means

| API-client idea | Authentication-specific capability |
|---|---|
| Collection | Versioned protocol requests/flows, actors, prerequisites, assertions, and lab steps |
| Environment | Issuer, client, redirect, RP/SP, key, and endpoint settings plus references to local secrets |
| Request | HTTP request, redirect, assertion, challenge, ticket, token, or authenticator ceremony |
| Response | Raw artifact and structured, redacted interpretation |
| Test | Conformance requirement or security invariant linked to exchange evidence |
| Mock server | Local synthetic IdP, authorization server, RP/SP, resource server, directory, or KDC |
| Runner | Protocol-aware execution with browser/network observation captured into one trace |
| Attack case | Named bounded mutation against an isolated target, paired with secure behavior |

The shared UI can normalize order, participants, time, redaction state, and results, but must retain protocol-specific semantics. OAuth redirects, SAML XML, LDAP BER messages, Kerberos tickets, and WebAuthn ceremonies are not the same type of exchange.

### Four user modes

1. **Inspect:** paste/import an artifact or capture a flow; parse locally, redact secrets, explain fields, and state which validation did not run.
2. **Compose and run:** configure a request/flow, connect to a local lab or explicitly selected test system, execute, and inspect each hop.
3. **Conformance test:** choose an implementation role/profile, run positive/negative tests, and export reproducible evidence.
4. **Attack lab:** run a prebuilt vulnerable target, perform one named mutation, observe impact, compare the secure target, then reset.

Keep these modes distinguishable. Decoding a token is not verifying it; a successful request is not proof of conformance; a synthetic attack trace is not an attack on a deployment.

## Research findings and implications

### Request workbenches

Postman collections group requests and can include auth, parameters, headers, bodies, tests, settings, and saved responses; environments select hosts and variable values. This offers a familiar shell for saved protocol work. OAuth.tools demonstrates a focused OAuth/OIDC interaction with multiple flows, environments, JWT inspection/creation, and browser-local storage. The MVP should adopt collections/environments only as deeply as protocol work requires; it should not recreate all general API-client features such as GraphQL, gRPC, collaboration, cloud workspaces, or monitoring.

Sources: [Postman elements](https://learning.postman.com/docs/getting-started/basics/postman-elements), [Postman OAuth 2.0](https://learning.postman.com/docs/use/send-requests/authorization/oauth-20), [Curity OAuth.tools](https://curity.io/oauth-tools/).

### Conformance and security learning

The OpenID Foundation suite separates implementation roles and profiles, supports OP/RP plans, and provides local Docker installation. Its 2026 guided mode asks for ecosystem and role and recommends test plans; this is a useful pattern for protocol breadth. PortSwigger's Academy emphasizes guided learning, realistic vulnerable targets, attack practice, and progress. Its JWT coverage includes signature verification errors, algorithm confusion, and header/key-selection attacks. OWASP WebGoat warns about exposure while running and defaults to localhost binding in Docker instructions.

Implication: model role/profile and conformance tests separately from attack-training scenarios. Both should share run, trace, and evidence infrastructure. Use guided discovery to help users find profiles rather than one undifferentiated checklist.

Sources: [OpenID suite overview](https://openid.net/certification/about-conformance-suite/), [refreshed suite](https://openid.net/using-the-new-openid-conformance-suite/), [OP testing](https://openid.net/certification/connect_op_testing/), [RP testing](https://openid.net/certification/connect_rp_testing/), [PortSwigger JWT labs](https://portswigger.net/web-security/jwt), [OWASP WebGoat](https://github.com/WebGoat/WebGoat).

### Protocol truth and algorithms

Protocol packs must derive behavior from current standards and reviewed implementations. RFC 9700 is the OAuth 2.0 Security Best Current Practice; it updates earlier guidance and covers redirect handling, code injection, token replay, and related threats. RFC 7636 defines PKCE. RFC 8725 requires callers to constrain accepted JWT algorithms and gives current JWT implementation guidance. OpenID Connect Core requires checks including issuer, audience, signature/key, time, and nonce when present. DPoP (RFC 9449) shows how an algorithmic proof binds an HTTP method/URI, time, nonce/ID, and token hash to a key.

SAML, LDAP, Kerberos, and WebAuthn have distinct wire models and trust boundaries. Their normative sources include OASIS SAML 2.0, LDAP RFC 4511, Kerberos RFC 4120, and W3C WebAuthn Level 3.

Implication: each pack owns parsers, state, validation, cryptography, errors, attacks, and profile requirements. Share orchestration, traces, redaction, scenario lifecycle, evidence, and UI primitives—not protocol semantics. Use reviewed cryptographic libraries for real signing/verification; teach algorithms in explicit policy/key context instead of presenting an unbounded “crypto playground.”

Sources: [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700), [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636.html), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html), [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725.html), [RFC 9449](https://www.rfc-editor.org/rfc/rfc9449.html), [OASIS SAML 2.0](https://www.oasis-open.org/standard/saml/), [LDAP RFC 4511](https://www.rfc-editor.org/rfc/rfc4511.html), [Kerberos RFC 4120](https://www.rfc-editor.org/rfc/rfc4120.html), [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/).

### Sandbox isolation

A vulnerable target is an execution boundary, not a UI feature. Docker rootless mode reduces risk from daemon/runtime vulnerabilities, and seccomp limits available syscalls. gVisor adds a userspace application-kernel boundary but documents reliance on host resource controls and network policy. These are layers, not a guarantee that a container is safe for public multi-tenant hostile workloads.

Implication: start with prebuilt local targets, synthetic data, per-run private networks, no egress by default, no host mounts or runtime socket, bounded CPU/memory/process/time, loopback-only exposed ports, automatic cleanup, and deterministic reset. Shared-host/hosted execution needs a separate threat model, stronger isolation, network policy, monitoring, patching, and abuse response.

Sources: [Docker rootless](https://docs.docker.com/engine/security/rootless/), [Docker seccomp](https://docs.docker.com/engine/security/seccomp), [gVisor security model](https://gvisor.dev/docs/architecture_guide/security/), [gVisor overview](https://gvisor.dev/docs/architecture_guide/intro/).

## Recommended product scope

### Core workflow

1. Select protocol, implementation role, and version/profile.
2. Configure a collection/environment or start a synthetic scenario.
3. Run the exchange or conformance tests.
4. Inspect raw and normalized messages, state, artifacts, and trust assumptions.
5. Evaluate assertions with evidence.
6. Apply a named attack mutation in the isolated lab.
7. Compare vulnerable and secure outcomes.
8. Reset, export, or save a reproducible collection.

### Core data model

- **Protocol pack:** versioned semantics, roles/profiles, parsers, supported assertions, redaction, and scenarios.
- **Collection:** saved requests/flows, setup, and assertions.
- **Environment:** non-secret configuration plus local secret references.
- **Scenario definition:** immutable targets/config, synthetic seed, declared capabilities, limits, attack variants, and reset policy.
- **Scenario instance:** one disposable execution and state boundary.
- **Exchange:** common event envelope plus protocol-native payload and redaction labels.
- **Assertion/evidence:** named requirement and the observed event that supports its result.
- **Run report:** portable, redacted, version-bound result with reproduction steps.

Use versioned JSON contracts initially. Keep project/collection data in local files; use SQLite only if durable local run history is needed. Consider PostgreSQL for a demonstrated hosted/team requirement; defer Redis absent a concrete need.

### Explicit boundaries

- Not a general production IAM service, identity provider, access governance system, or connector marketplace.
- “All protocols and algorithms” is a long-term catalog objective, not the MVP.
- Synthetic credentials/keys are the default. Real secrets stay local, do not enter traces, and are excluded from exports by default.
- Active external testing requires an explicitly selected user-authorized target and visible operation scope. Attack labs default to owned isolated targets.
- Do not fetch arbitrary issuer metadata, JWKS, SAML metadata, `jku`, or `x5u` URLs from the backend without SSRF-safe policy. Start with local parsing or explicit safe fetch behavior.
- Secure and vulnerable code use separate targets and clear labels; never add a production endpoint switch into a vulnerable mode.

## Protocol and algorithm sequence

| Stage | Pack | First useful depth |
|---|---|---|
| 1 | HTTP, OAuth 2.0, OIDC | Local authorization-code + PKCE flow; issuer, redirect, state, nonce, token, and resource events |
| 1 | JWT/JWS/JWE | Decode vs verify, algorithm/key compatibility, signed/encrypted artifacts, controlled negative cases |
| 2 | SAML 2.0 | Local IdP/SP, real message capture, metadata/assertion validation profiles, replay and signature-binding cases |
| 3 | WebAuthn/passkeys | Registration/authentication ceremonies, challenge/origin/RP ID checks, authenticator data |
| 4 | LDAP/AD | Local directory bind/search/StartTLS/SASL, filter escaping and access checks |
| 5 | Kerberos | Local realm, AS/TGS/TGT/service-ticket trace, realm/SPN/time/replay behavior |
| Later | MFA, SCIM, federation extensions, advanced crypto | Add based on user demand, standards maturity, and safe reproducibility |

The first release must prove depth in OAuth/OIDC and JOSE before claiming cross-protocol breadth. Do not write production cryptography from scratch.

## Architecture recommendation

Keep Go and React/TypeScript and use a modular monolith for collections, catalog, API, trace normalization/redaction, evidence, and UI. Create a narrow, replaceable **scenario runner** interface because vulnerable targets require independent execution and resource/network controls.

A scenario manifest declares image digest/version, services/ports, synthetic data, network policy, CPU/memory/process/time limits, permitted operations, observation/redaction channels, and reset/destruction. The control plane must not mount the host filesystem or runtime socket into a target. Each run has a distinct private network and disposable state. Deny egress by default; use explicit allowlists for later external integration.

Use a straightforward local single-user runner first. Before shared-host or hosted execution, evaluate gVisor or a microVM boundary, worker separation, strict egress, per-tenant resource controls, monitoring, patching, and incident response. A protocol pack contract can start as statically linked Go packages and JSON descriptors; defer dynamic third-party plugins until versioning and review are mature.

## Execution plan

Milestones are gated by a runnable demonstration and evidence, not by adding an inspector screen alone.

### Phase 0 — Product contract and safety

- Align product and architecture docs; define three user journeys: developer OAuth debugging, protocol conformance, and local attack/defense.
- Define first roles/profile, pack versioning, collection/report format, secret/retention rules, external-target authorization, and local sandbox threat model.
- Choose an execution model for the first local OAuth peers.

**Exit:** one agreed MVP, explicit trust boundaries, and measurable safety/acceptance criteria.

### Phase 1 — Workbench foundation

- Add versioned pack, collection, environment, run, exchange, assertion, and report contracts.
- Reuse the trace/evidence surface for OAuth and SAML while retaining native payloads.
- Add portable local import/export and secret references.
- Redact before persistence/export; add leak tests and deterministic reset for existing scenarios.

**Exit:** existing OAuth and SAML exercises use a shared shell and can be repeated/reset without loss of protocol-specific meaning.

### Phase 2 — OAuth/OIDC + JOSE MVP

- Implement local authorization server, public client, browser callback, and resource server for authorization-code + PKCE.
- Add issuer discovery and explicit OIDC ID-token checks for issuer, audience, signature/key, time, nonce, and errors.
- Add JWT/JWS/JWE inspect/build/verify tasks with declared algorithm and key policy.
- Add paired secure/weak scenarios: state/PKCE, redirect validation, issuer/audience/nonce, algorithm/key confusion.
- Add collections, local secret references, real resource request, and redacted report export.

**Exit:** a user completes a local flow, identifies an exact failure, reproduces one OAuth and one JWT weakness only in the local vulnerable targets, compares secure behavior, exports safely, and resets.

### Phase 3 — Safe scenario runner

- Run digest-pinned prebuilt images with per-run networks, no egress by default, no host mounts/runtime socket, limits, loopback ports, cleanup, and reset.
- Distinguish simulations, real local protocol peers, and external authorized tests in UI/report.
- Review escape, SSRF, malicious parsers, resource exhaustion, supply chain, and trace leakage.

**Exit:** a compromised vulnerable target cannot reach host services, other runs, or the public Internet by default; tests prove stop/reset and secret-free output.

### Phase 4 — SAML workbench

- Add local IdP/SP fixtures and real SAML Redirect/POST messages.
- Add role/profile-based metadata, request/response, signature, issuer, destination, audience, conditions, correlation, and replay checks.
- Add safe message mutation, CI invocation, and evidence export.
- Keep current synthetic labs clearly labeled as simulations.

**Exit:** one successful local SSO flow and a negative suite whose outcomes link each failed check to evidence; reset is repeatable.

### Phase 5 — WebAuthn, LDAP, Kerberos

Implement one pack at a time with a local authenticator/test browser, directory, or KDC. Require one end-to-end flow and one paired secure/negative case before expanding. Do not perform account attacks against real users or brute-force external services.

### Phase 6 — External test systems and pack contributions

After local isolation and secret handling mature, add explicitly scoped user-owned targets, exact host/method display, rate limits, stop control, audit evidence, and SSRF-safe fetch rules. Add a reviewed, signed/versioned pack contribution process. Reassess hosted execution only after a separate security and operations review.

## MVP acceptance criteria

1. Run a complete local OAuth authorization-code + PKCE flow without external credentials.
2. Show actors, redirects, state, token exchange, validation decisions, and result in a trace.
3. Keep local and user-selected test target configuration separate; secrets stay local.
4. Separate JWT decode and verify and show exact OIDC validation failures.
5. Reproduce one OAuth and one JWT/key attack only in isolated vulnerable targets; compare paired secure results.
6. Reset every scenario and export versioned evidence without reusable credentials, tokens, or private keys.
7. Default local targets to loopback-only ports, no egress, bounded resources, no host mounts/runtime socket.
8. Explain why each result passed or failed and link it to observed evidence.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Breadth ships before depth | Publish a maturity matrix; require end-to-end execution, tests, evidence, and docs before calling a pack supported |
| Vulnerable target compromises its host | Separate runner, private per-run network, no mounts/socket, limits, reset, and no public hosted arbitrary execution in MVP |
| Parse is mistaken for trust | Label parse, cryptographic verify, conformance, and target acceptance separately |
| External tests are unauthorized or disruptive | Local targets by default; explicit authorized scope, rate limit, and stop control for active tests |
| Secrets leak into collections or traces | Local secret references, pre-storage redaction, export deny-by-default, and automated leak tests |
| Shared abstraction erases protocol semantics | Share lifecycle/trace envelope only; pack owns protocol-specific checks and behavior |
| Platform sandbox support diverges | Document runtime/platform matrix and fail closed when required controls are absent |

## Decisions recommended and now adopted

1. Product category: protocol workbench + safe attack sandbox.
2. First release: OAuth 2.0/OIDC + JWT/JOSE with executable local flows.
3. Local-first data/workflows; no cloud account required for core use.
4. Prebuilt local targets first; no arbitrary user code or unbounded external attacks.
5. Go/React modular monolith plus replaceable runner boundary.
6. Defer production IAM, enterprise connectivity/governance, hosted multi-tenant attacks, and broad protocol coverage.

## Sources

### Product and adjacent tools

- [Postman OAuth 2.0 authorization](https://learning.postman.com/docs/use/send-requests/authorization/oauth-20)
- [Postman collections, requests, environments, and flows](https://learning.postman.com/docs/getting-started/basics/postman-elements)
- [Curity OAuth.tools](https://curity.io/oauth-tools/)
- [OpenID Foundation conformance suite](https://openid.net/certification/about-conformance-suite/)
- [OpenID Foundation refreshed suite](https://openid.net/using-the-new-openid-conformance-suite/)
- [OpenID Foundation OP testing](https://openid.net/certification/connect_op_testing/)
- [OpenID Foundation RP testing](https://openid.net/certification/connect_rp_testing/)
- [PortSwigger Academy](https://portswigger.net/web-security/)
- [PortSwigger JWT attacks](https://portswigger.net/web-security/jwt)
- [OWASP WebGoat](https://github.com/WebGoat/WebGoat)
- [AgID SPID SAML Check](https://github.com/italia/spid-saml-check)

### Protocol and security foundations

- [RFC 9700 — OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700)
- [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636.html)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [RFC 8725 — JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)
- [RFC 9449 — OAuth DPoP](https://www.rfc-editor.org/rfc/rfc9449.html)
- [OASIS SAML 2.0](https://www.oasis-open.org/standard/saml/)
- [RFC 4511 — LDAP](https://www.rfc-editor.org/rfc/rfc4511.html)
- [RFC 4120 — Kerberos V5](https://www.rfc-editor.org/rfc/rfc4120.html)
- [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)

### Isolation foundations

- [Docker rootless mode](https://docs.docker.com/engine/security/rootless/)
- [Docker seccomp profiles](https://docs.docker.com/engine/security/seccomp)
- [gVisor security model](https://gvisor.dev/docs/architecture_guide/security/)
- [gVisor security introduction](https://gvisor.dev/docs/architecture_guide/intro/)

## Relationship to other documentation

Product requirements are in [`docs/product/PRD.md`](../product/PRD.md), current decisions in [ADR-007](../adr/007-auth-protocol-workbench-and-sandbox.md), architecture in `docs/architecture/`, and implementation sequence in `docs/roadmap/`. Historical migration material and superseded ADRs are marked as such.
