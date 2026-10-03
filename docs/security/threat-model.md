# Threat Model

## Assets

- Host and other scenario runs.
- Local collection/environment files and secret references.
- Protocol artifacts and credentials in memory, traces, and exports.
- Control-plane authority to start, stop, reset, and target scenarios.
- Integrity of protocol checks, pack versions, and run evidence.

## Threat actors and inputs

- Malicious or malformed user-supplied XML, tokens, URLs, headers, certificates, and protocol messages.
- A compromised intentionally vulnerable target.
- A malicious or compromised protocol-pack image/dependency.
- Accidental selection of an unauthorized external target.
- Resource exhaustion through oversized payloads, loops, or high-volume operations.

## Core threats

Replay, CSRF, code injection, redirect abuse, issuer/audience/nonce confusion, JWT algorithm/key confusion, SAML signature wrapping and assertion misuse, LDAP filter/DN injection, Kerberos ticket misuse, WebAuthn origin/challenge failures, SSRF, XSS, secret leakage, lab escape, cross-run access, egress, denial of service, and misleading verification results.

## Required controls

- Treat inputs as untrusted and apply size/depth/count limits to parsers.
- Do not fetch attacker-controlled metadata/JWKS URLs without SSRF-safe policy.
- Use synthetic targets and data; keep external test scope opt-in and visible.
- Isolate runs, deny egress by default, omit host mounts/runtime sockets, and bound resources/time.
- Redact before persistence/export and test for secret leakage.
- Pin and review runner images and protocol-pack dependencies.
- Provide stop, reset, cleanup, and run audit behavior.
- Distinguish parsing from cryptographic verification, conformance, and target acceptance.

Hosted or shared-host execution of vulnerable targets requires a separate threat model and stronger isolation review. See [trust boundaries](../architecture/trust-boundaries.md) and the [research-backed plan](../research/auth-protocol-workbench-and-sandbox.md).
