# Protocol Catalog

Protocol coverage grows as versioned packs with declared roles, profiles, capabilities, and maturity. A pack is not considered supported merely because the UI can parse one artifact.

## Current prototype

- **OAuth 2.0:** deterministic authorization-code event simulator with secure, missing-state, and missing-PKCE scenarios.
- **JWT/JWS:** browser-local structural decoder; no signature verification or trusted-key resolution.
- **HTTP:** offline URL and HTTP/1.x request/response inspector; no sending, replay, or capture.
- **SAML:** browser-local assertion/metadata viewers and synthetic policy traces; no end-to-end SAML implementation.

## Planned workbench sequence

1. HTTP, OAuth 2.0, OpenID Connect, JWT/JWS/JWE.
2. SAML browser SSO and metadata/conformance tests.
3. WebAuthn/passkeys.
4. LDAP/Active Directory.
5. Kerberos.
6. Additional MFA, federation, provisioning, and cryptographic profiles as justified.

For each pack, the goal is an inspectable exchange, explicit trust/validation status, positive and negative checks, safe local target, evidence, and reset. See the [product vision](../product/product-vision.md) and [roadmap](../roadmap/roadmap.md).
