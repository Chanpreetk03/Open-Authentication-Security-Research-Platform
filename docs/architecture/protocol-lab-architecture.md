# Protocol Lab Architecture

## Product focus

The Authentication Lab is a protocol workbench. Its primary purpose is to
teach how authentication protocols are constructed, implemented, observed,
attacked, and secured.

The platform should therefore be organized around protocol modules rather than
around one identity product. OAuth/OIDC is the first module because it teaches
redirects, clients, authorization, tokens, claims, signatures, and trust
relationships. The same Lab architecture must later support SAML, LDAP,
Kerberos, MFA, and passkeys without redesigning the control plane.

## What a protocol module contains

Every protocol module should provide the same learning surfaces:

1. **Concepts** — terminology, actors, messages, state, and trust assumptions.
2. **Implementation** — a small readable implementation of the protocol.
3. **Wire observation** — requests, responses, redirects, tickets, assertions,
   claims, or challenges rendered as structured events.
4. **Secure implementation** — the recommended validation, cryptography, and
   failure behavior.
5. **Vulnerable implementation** — intentionally flawed code, isolated and
   clearly labeled.
6. **Attack exercises** — controlled demonstrations of protocol weaknesses.
7. **Verification** — tests that prove the secure behavior and expose the
   vulnerable behavior.
8. **Integration examples** — a small client and target that show the protocol
   in use.

This makes “learn the protocol” a complete path from source code to observable
behavior, rather than a collection of documentation pages.

## Protocol module contract

The Lab control plane should interact with each protocol through a small
module interface:

```text
ProtocolModule
- Describe() -> ProtocolDescriptor
- CreateScenario(variant, seed) -> ScenarioDefinition
- StartScenario(definition) -> ScenarioHandle
- Execute(handle, exerciseStep) -> Evidence
- Observe(handle) -> ProtocolExchange[]
- Verify(handle, verification) -> VerificationResult
- Reset(handle)
- Destroy(handle)
```

`ProtocolModule` is a product-level interface. A concrete module may contain
many internal packages for parsers, state machines, cryptography, servers,
clients, and tests, but those details should not leak into the Lab control
plane.

Each `ProtocolDescriptor` declares:

- protocol and version;
- actors and trust relationships;
- message types;
- required capabilities;
- supported secure and vulnerable variants;
- learning objectives;
- available exercises;
- redaction rules;
- verification checks.

## Shared platform versus protocol-specific code

The platform should share infrastructure, not protocol semantics.

### Shared platform capabilities

- scenario lifecycle and reset;
- synthetic seed data;
- capability and resource policy;
- event capture and redaction;
- trace storage;
- exercise orchestration;
- verification result format;
- audit events;
- learning-content metadata;
- UI primitives for timelines, messages, claims, and trust boundaries.

### Protocol-owned capabilities

- wire format parsing and serialization;
- protocol state machines;
- protocol-specific cryptographic rules;
- message validation;
- actor behavior;
- protocol error handling;
- attack mechanics;
- secure and vulnerable implementations;
- protocol-specific explanations and tests.

This division prevents a generic “authentication engine” from flattening the
differences between OAuth redirects, SAML assertions, LDAP binds, Kerberos
tickets, and passkey ceremonies.

## Protocol progression

The protocol curriculum should grow in layers:

### Layer 1: Web and token foundations

- HTTP requests and responses;
- cookies and server-side sessions;
- password authentication;
- OAuth 2.0 authorization code;
- PKCE and state;
- OpenID Connect ID tokens and UserInfo;
- JWT signing and validation.

### Layer 2: Federation and assertion protocols

- SAML browser SSO;
- metadata and trust configuration;
- assertions, signatures, encryption, and replay protection.

### Layer 3: Directory and ticket protocols

- LDAP binds, searches, filters, and TLS;
- Active Directory concepts;
- Kerberos AS, TGS, TGT, service tickets, and replay protection.

### Layer 4: Stronger and phishing-resistant authentication

- MFA enrollment and recovery;
- TOTP and challenge verification;
- WebAuthn and passkeys;
- device and authenticator trust.

The layers are a learning sequence, not a requirement that all protocols share
one implementation. Shared concepts such as identity, trust, replay, key
management, and audit should be compared across modules.

## First protocol module: OAuth/OIDC

The concrete design for this module is documented in the [OAuth/OIDC module
architecture](protocols/oauth-oidc-module.md).

The first module should be split into independently understandable exercises:

1. OAuth authorization-code flow without OIDC.
2. PKCE and public clients.
3. State and CSRF protection.
4. OpenID Connect discovery and issuer validation.
5. ID-token claims, nonce, audience, and signature validation.
6. Refresh tokens, rotation, expiry, and revocation.
7. JWT inspection and common validation mistakes.

Each exercise should have a readable implementation, a secure implementation,
an isolated vulnerable variant where appropriate, an observation trace, and
automated verification.

## Architecture consequence

The Reference Identity Engine is no longer the primary organizing abstraction.
It becomes a reusable implementation toolkit used by protocol modules where
that is pedagogically useful.

For example:

- OAuth/OIDC may use identity, client, consent, token, and signing-key
  primitives.
- SAML may use identity, assertion, metadata, and signing-key primitives.
- LDAP may use directory, bind, DN, attribute, and filter primitives.
- Kerberos may use principal, realm, key, ticket, and replay-cache primitives.

These primitives can be shared when their semantics genuinely match. The
protocol module remains responsible for the protocol state machine and wire
behavior.

## Design rule for future protocols

Adding a protocol should require adding a protocol module and its adapters,
not changing the Lab control plane. If adding SAML or LDAP requires changing
the scenario lifecycle, trace storage, exercise orchestration, or verification
interfaces, the shared interface is too protocol-specific.

## Decisions for the first implementation

The following are proposed, not yet final:

- Protocol modules are first-class product modules.
- The Lab control plane uses a protocol-neutral module contract.
- Protocol implementations own their state machines and wire formats.
- Secure and vulnerable implementations are separate execution paths.
- The first protocol sequence is OAuth 2.0, OIDC, JWT, then SAML, LDAP,
  Kerberos, MFA, and passkeys.
- The first OAuth/OIDC slice is implemented before building generic abstractions
  for every future protocol.
