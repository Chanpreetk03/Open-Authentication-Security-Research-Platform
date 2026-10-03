# ADR-007: Authentication Protocol Workbench and Security Sandbox

## Status

Accepted

## Context

The project previously described a broad educational platform with a reference identity engine and a future path toward production-oriented identity capabilities. The clarified product goal is a Postman-like workbench for authentication protocols and algorithms, paired with a sandbox for controlled attacks and verification.

Existing tools demonstrate separate parts of this need: API clients organize requests and environments; OAuth tools specialize in OAuth/OIDC and JWT; conformance suites test role/profile requirements; security academies provide deliberate vulnerable targets. The product should connect configuration, execution, observation, validation, attack, comparison, and reset in one local-first workflow.

## Decision

Make the product an open, local-first authentication protocol workbench and security sandbox. The product is not a general-purpose IAM service, production identity provider, access-governance suite, or enterprise connector marketplace.

The first deep product slice is executable OAuth 2.0/OpenID Connect and JWT/JOSE work. SAML follows, then WebAuthn/passkeys, LDAP/Active Directory, Kerberos, and further packs as complete, tested modules.

The shared platform owns collections, environment/secret references, scenario lifecycle, resource/capability policy, trace envelopes, redaction, assertions, reports, and reset. Protocol packs own their wire formats, state machines, validation, cryptographic rules, attacks, profiles, and explanations.

Attack exercises use synthetic, prebuilt, resettable local targets by default. Active external testing is a separately scoped mode for systems the user is authorized to test. Arbitrary public-target attacks, arbitrary user-code execution, and hosted multi-tenant vulnerable labs are deferred.

## Alternatives considered

- Build a production identity provider or general-purpose IAM service.
- Keep the product as separate protocol inspectors, an Academy, and a reference identity engine.
- Reproduce the full feature set of a general API client before specializing for authentication.
- Offer hosted arbitrary vulnerable targets before establishing the isolation and operations model.

## Consequences

- The current OAuth simulator, JWT/HTTP/SAML inspectors, synthetic SAML labs, and defense-in-depth lesson are a starting point, not the complete workbench.
- Product success depends on real local protocol flows, clear verification evidence, portable collections/reports, and safe scenario lifecycle—not on implementing account management.
- Protocol breadth is incremental. A pack is only called supported at the capability level it actually implements.
- The runner is a security boundary and must remain replaceable from the product control plane.
- Existing product, architecture, security, roadmap, and developer docs are aligned to this decision. Historical ADR-005 and migration notes remain available as superseded context.

## Reference plan

See the [research-backed workbench and sandbox plan](../research/auth-protocol-workbench-and-sandbox.md) for product scope, market/tool research, architecture, execution phases, MVP acceptance criteria, and safety risks.
