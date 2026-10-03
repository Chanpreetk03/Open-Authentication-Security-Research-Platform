# Security Principles

- Keep trust boundaries explicit between the UI, control plane, runner, scenario targets, external systems, and host.
- Use defense in depth; no one container flag or UI confirmation is a complete isolation boundary.
- Treat pasted artifacts, metadata, endpoint values, and external-target configuration as untrusted input.
- Treat credentials, access/refresh tokens, cookies, assertions, signing keys, and private keys as secrets.
- Redact before traces are persisted or exported; minimize retention and use synthetic secrets by default.
- Use reviewed libraries for production-relevant cryptographic operations. Teaching examples must be isolated and must not be presented as secure implementations.
- Separate parse, cryptographic verify, conformance, and relying-party acceptance outcomes.
- Vulnerable scenarios use synthetic data, per-run isolation, bounded resources, explicit reset, and no egress by default.
- Active external tests require explicit authorization and a visible target/operation scope.

The current defense-in-depth OAuth lesson is one learning module using synthetic traces. See the [lesson](../academy/defense-in-depth-oauth.md) and [threat model](threat-model.md).
