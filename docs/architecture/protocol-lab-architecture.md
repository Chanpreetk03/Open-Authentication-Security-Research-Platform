# Protocol Pack and Lab Architecture

## Product focus

The product is an authentication protocol workbench with an isolated attack sandbox. It helps users construct and run flows, observe protocol messages, validate behavior, and reproduce controlled weaknesses. The product is organized around protocol packs, not around a shared production identity engine.

OAuth/OIDC and JWT/JOSE are the first deep work area. SAML follows, then WebAuthn/passkeys, LDAP/Active Directory, Kerberos, and other mechanisms as complete packs.

## What a protocol pack contains

A mature pack should provide:

1. **Descriptor:** protocol/version, roles, profiles, actors, trust assumptions, dependencies, capabilities, and maturity.
2. **Artifacts:** parsers, serializers, and protocol-specific message views.
3. **Execution:** local actor fixtures and supported run steps.
4. **Validation:** protocol checks, conformance assertions, and evidence format.
5. **Security scenarios:** named secure and vulnerable variants with explicit preconditions and reset behavior.
6. **Observation:** protocol-specific trace details adapted to the shared exchange envelope.
7. **Learning content:** concise explanation of messages, trust decisions, attacks, and mitigations.
8. **Verification:** automated positive, negative, redaction, and isolation checks.

A pack may initially support inspection only. Do not call it executable, verified, or conformant until those capabilities exist and are documented.

## Pack contract

The control plane should use a narrow, versioned contract such as:

```text
ProtocolPack
- Describe() -> ProtocolDescriptor
- CreateScenario(profile, variant, seed) -> ScenarioDefinition
- Execute(handle, step) -> Evidence
- Observe(handle) -> ProtocolExchange[]
- Verify(handle, assertion) -> VerificationResult
- Reset(handle)
- Destroy(handle)
```

The contract is a product boundary, not a reason to create a plugin runtime immediately. Start with statically linked Go packages and shared JSON schemas; consider third-party packs only after trust, versioning, and review rules are established.

Each descriptor declares supported versions/profiles, actor roles, network/filesystem needs, resource limits, secrets, redaction rules, secure/vulnerable variants, and verification checks.

## Shared platform versus protocol-specific code

### Shared capabilities

- collections, environments, and local secret references;
- scenario lifecycle, budgets, capability checks, and reset;
- event capture, ordering, redaction, reports, and audit metadata;
- conformance/evidence result envelope;
- common request, trace, artifact, and comparison UI.

### Pack-owned capabilities

- wire encoding and parsing;
- protocol state and actor behavior;
- algorithm and key validation;
- protocol-specific error handling and trust semantics;
- attack mutations and secure behavior;
- test vectors, profiles, and explanations.

The workbench must not flatten OAuth redirects, XML assertions, LDAP BER operations, Kerberos tickets, and WebAuthn ceremonies into one generic authentication state machine.

## Protocol progression

1. **Web/token:** HTTP, OAuth 2.0, OIDC, JWT/JWS/JWE, keys, cookies, and sessions.
2. **Federation:** SAML exchanges, metadata, assertions, signatures, encryption, and replay.
3. **Public-key browser authentication:** WebAuthn/passkeys and authenticator behavior.
4. **Directory/ticket protocols:** LDAP/AD and Kerberos.
5. **Extensions:** MFA methods, SCIM and federation extensions, additional JOSE algorithms, and advanced profiles based on demand.

The ordering is a product recommendation, not a requirement that all packs share an implementation.

## First work area: OAuth/OIDC and JOSE

The current code is a deterministic, in-memory OAuth simulator plus browser-local inspectors and synthetic SAML traces. The target MVP is an executable local flow with a client, browser callback, authorization server, and resource server; OIDC discovery and token checks; JWT/JOSE inspect/build/verify workflows; paired attack and secure scenarios; and a redacted report.

See [OAuth/OIDC pack design](protocols/oauth-oidc-module.md), [JWT inspector boundary](protocols/jwt-inspector.md), and [HTTP inspector boundary](protocols/http-inspector.md).

## Safety and isolation contract

A scenario declares target image digest/version, seed data, internal endpoints, allowed capabilities, resource/time budgets, observation channels, redaction, and reset/destruction rules. Vulnerable targets run separately from the control plane and from one another, on private per-run networks, with no egress by default. The runner exposes only declared loopback ports and no host mount/runtime socket.

Active external integration is a distinct mode. It requires explicit authorized target scope and is not used as the attack-lab execution environment.

## Product direction

The product direction is recorded in [ADR-007](../adr/007-auth-protocol-workbench-and-sandbox.md) and the [workbench/sandbox plan](../research/auth-protocol-workbench-and-sandbox.md). A shared reference identity engine and production IAM service are not product requirements.
