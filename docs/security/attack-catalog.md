# Attack Catalog

Attack exercises are named, versioned, and bound to a target and scope. Local synthetic scenarios are the default. External testing is restricted to user-authorized targets and declared operations.

## Protocol attack families

- OAuth/OIDC: state/CSRF, PKCE/code injection, redirect validation, issuer mix-up, nonce, token replay, scope/audience mistakes, metadata/JWKS trust.
- JWT/JOSE: unsigned tokens, algorithm/key confusion, key-selection/header abuse, claim-validation failures, weak key policy, and replay.
- SAML: request correlation, replay, audience/recipient/conditions, signature coverage/wrapping, and subject-confirmation handling.
- LDAP/AD: bind/TLS misconfiguration, filter injection, DN handling, access-control mistakes, and unsafe referrals.
- Kerberos: ticket/realm/SPN configuration, replay, pre-authentication behavior, and constrained synthetic credential-abuse demonstrations.
- WebAuthn/MFA: origin/RP ID/challenge validation, recovery, enrollment, downgrade, replay, and rate limiting.

## Controls

Do not run credential stuffing, brute force, key cracking, token theft, or exploit payloads against arbitrary external systems. Such behavior may appear only in bounded synthetic exercises or explicitly authorized and tightly scoped tests. Every active scenario must define rate/resource limits, stop behavior, and reset/cleanup.
