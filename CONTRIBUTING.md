# Contributing

Contributions should improve the authentication protocol workbench or its safe, resettable scenario packs. See the [product vision](docs/product/product-vision.md), [coding standards](docs/development/coding-standards.md), [testing strategy](docs/development/testing-strategy.md), and [security policy](SECURITY.md).

## Protocol pack contributions

- Identify the protocol/version, implementation role, profile, and capability level.
- Link normative behavior to an authoritative specification or best-practice document.
- Keep protocol parsing, state, verification, and attacks in the owning pack.
- Include positive, negative, boundary, redaction, and reset cases for supported behavior.
- Label whether the feature parses, cryptographically verifies, tests conformance, or models target acceptance.
- Use reviewed libraries for security-sensitive cryptography; do not add custom production crypto.

## Scenario safety

- Use synthetic users, credentials, keys, and services.
- Keep vulnerable targets separate from the control plane and secure target.
- Declare network/filesystem capabilities, resource/time limits, cleanup, and reset behavior.
- Deny external egress by default. Never add a scenario that attacks a real third-party system.
- Do not include secrets in fixtures, traces, test snapshots, or exported examples.

## Documentation

Update the product/architecture/security/protocol docs when scope or trust boundaries change. Mark historical decisions as superseded instead of silently rewriting their history.
