# Product Requirements Document

## Version 1.0 — Authentication protocol workbench and sandbox

## 1. Product thesis

Build an open, local-first workbench for configuring, running, inspecting, and
testing authentication protocol exchanges, paired with safe, resettable labs
for reproducing protocol weaknesses.

The core user loop is:

**Configure → Execute → Observe → Validate → Attack → Compare → Reset**

The product is specialized for identity and authentication protocols. It is
not an attempt to reproduce every general API-client feature or to operate a
production identity service.

## 2. Product goals

- Help developers run and debug authentication integrations.
- Make protocol messages, actors, state transitions, trust assumptions, and
  security decisions observable.
- Provide protocol-specific conformance and security checks with evidence.
- Let learners reproduce attacks against isolated, synthetic targets and
  compare the result with secure behavior.
- Save and share collections and redacted reports for repeatable local and CI
  workflows.
- Grow protocol coverage through independently versioned protocol packs.

## 3. Product boundaries

### In scope

- A request, collection, and environment workspace specialized for auth flows.
- OAuth 2.0 and OpenID Connect, JWT/JWS/JWE, SAML, HTTP/cookies, WebAuthn and
  passkeys, LDAP/Active Directory, Kerberos, and related algorithms and
  mechanisms as protocol packs mature.
- Local test issuers, clients, relying parties, resource servers, directories,
  KDCs, and authenticators where useful to run flows safely.
- Inspection and validation of protocol messages, configuration, tokens,
  assertions, metadata, keys, challenges, and tickets.
- Conformance profiles, negative tests, attack simulations, evidence, and
  replayable reports.
- Explicitly authorized integration tests against user-selected external
  systems, after the local safety boundary is established.

### Out of scope

- A general-purpose production IAM service or hosted identity provider.
- Access governance, certification workflows for enterprise identities, and
  enterprise application-connectivity marketplaces.
- Broad enterprise provisioning or connector libraries.
- Public multi-tenant execution of arbitrary vulnerable code or arbitrary
  attack payloads.
- Unrestricted scanning or attack traffic against third-party systems.
- Reimplementing cryptographic primitives for production use.

## 4. Product experiences

### Authentication Workbench

- Collections contain related requests, flow configuration, assertions, and
  reproducible setup.
- Environments select issuers, endpoints, client/RP settings, and local secret
  references.
- A protocol-aware runner executes local scenarios or explicitly scoped test
  connections.
- A trace view presents raw and normalized messages, participants, state
  transitions, artifacts, redactions, and results.
- Collections and run reports can be exported without reusable secrets.

### Protocol inspection and conformance

- Parse and explain messages and artifacts without implying that parsing
  proves authenticity.
- Separate decoding, structural checks, cryptographic verification,
  conformance checks, and application-policy decisions.
- Use implementation roles and profiles to select relevant tests.
- Report each result with its source event, expectation, observed behavior,
  and protocol-pack version.

### Security sandbox

- Run versioned, prebuilt, synthetic secure and vulnerable targets.
- Apply named mutations such as missing state, incorrect PKCE handling,
  issuer/audience/nonce errors, signature/key confusion, replay, or SAML
  validation failures.
- Keep each scenario resettable, bounded, and isolated from the host, other
  runs, real credentials, and the public Internet by default.
- Make the target, mutation, network scope, and cleanup behavior visible.

### Learning content

Lessons explain protocol behavior and connect it to attack and verification
evidence. Lessons are content attached to protocol packs and scenarios; a
separate general-purpose Academy or reference identity engine is not required
for the product to provide its core value.

## 5. Audiences

- Authentication developers debugging OAuth/OIDC and federation integrations.
- Security engineers testing authorized implementations.
- Students and practitioners learning protocol and cryptographic behavior.
- Protocol implementers validating role/profile conformance.
- Educators and teams sharing repeatable, local exercises.

## 6. Product principles

### Protocol semantics stay explicit

Share the workbench shell and trace format, but preserve protocol-specific
message formats, states, validation rules, and errors.

### Inspecting is not validating

Every result states whether data was merely parsed, structurally checked,
cryptographically verified, compared with a profile, or accepted under an
application policy.

### Break safely

Attack exercises target only synthetic local scenarios by default. Secure and
vulnerable targets are separate, clearly named, and resettable.

### Minimize secrets

Use synthetic credentials by default. Keep real secrets local, avoid storing
them in collections and traces, redact before persistence/export, and make
retention explicit.

### Prefer reviewed cryptography

Use mature, reviewed libraries for security-sensitive operations. Custom
cryptography is limited to isolated explanations and must not be presented as
a production implementation.

### Local-first and reproducible

Core workflows work without a hosted account. Packs, collections, and reports
are versioned and portable.

## 7. Initial technical direction

- Product API and protocol packs: Go.
- Workbench UI: React and TypeScript.
- Architecture: modular monolith with a replaceable scenario-runner boundary.
- Persistence: local files first; add SQLite if durable local run history
  becomes necessary. Consider PostgreSQL only for a demonstrated hosted/team
  requirement. Redis is deferred absent a concrete need.
- Execution: prebuilt local scenarios first; stronger isolation is required
  before shared-host or hosted hostile workloads.
- Deployment: local-first before any hosted service.

## 8. MVP

The MVP focuses on an executable OAuth/OIDC and JWT/JOSE workbench with a
small, safe local scenario runner.

It includes:

- A local authorization-code + PKCE flow with a client, browser callback,
  authorization server, and resource server.
- OIDC discovery and ID-token validation outcomes for issuer, audience,
  signature/key, time, and nonce.
- JWT/JWS/JWE inspection and selected build/verification exercises with
  explicit algorithm and key policy.
- HTTP request and redirect observation, redaction, event timeline, and
  exportable reports.
- At least one OAuth attack and one JWT/key-validation attack, each paired with
  a secure scenario and reset.
- Collections/environments sufficient to repeat the flows; local secrets are
  not exported as ordinary values.
- Prebuilt local targets, synthetic users/keys, resource limits, and default
  no-egress scenario networking.

SAML is the first expansion after the MVP and should use a local test IdP/SP
and real messages before the platform claims SAML conformance coverage.

## 9. Success criteria

- A developer can run a complete local OAuth/OIDC flow and identify the exact
  event and check that explains a failure.
- A learner can reproduce a named weakness against a local vulnerable target,
  compare the secure target, and reset the scenario.
- A run report is reproducible and contains no reusable credentials, tokens,
  or private keys.
- The UI distinguishes parsing, verification, conformance, and policy outcomes.
- Each supported protocol pack has declared versions/profiles, positive and
  negative checks, clear limitations, and automated verification.
- The product's attack surface is scoped to local fixtures or explicitly
  authorized external targets.

## 10. Open decisions

- Collection and protocol-pack serialization format.
- Local secret-reference mechanism and report-retention defaults.
- Scenario runner for each supported desktop platform.
- First OAuth/OIDC role/profile and exact negative-test set.
- Threat model and isolation bar for any future hosted execution.
- Contribution/review model for protocol packs and scenario images.
