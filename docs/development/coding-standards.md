# Coding Standards

- Keep protocol semantics and validation in the owning protocol pack; keep lifecycle, trace envelope, redaction, reports, and UI primitives shared.
- Preserve protocol-specific fields and errors through normalization.
- Make the result type distinguish parse, verify, conformance, and target acceptance.
- Use explicit names for security checks and attack variants; avoid generic insecure switches.
- Use reviewed cryptographic libraries for signing, verification, encryption, key parsing, and password hashing.
- Validate and bound untrusted protocol inputs before parsing or rendering.
- Classify sensitive values and redact before persistence, logs, and exports.
- Keep vulnerable implementations in separate targets/scenarios and label them clearly.
- Make run/reset behavior deterministic where feasible and test negative cases as well as the happy path.
- Update the owning product, architecture, security, and protocol docs when behavior or boundaries change.
