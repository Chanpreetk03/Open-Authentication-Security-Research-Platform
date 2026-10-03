# Testing Strategy

Every protocol pack should test the exact behavior it claims to support. A green test suite does not establish support for untested profiles or real-world interoperability.

## Evidence layers

1. **Parser tests:** valid, malformed, boundary-size, hostile-depth, and secret-redaction cases.
2. **Protocol tests:** positive/negative state transitions, cryptographic verification, and protocol errors.
3. **Profile/conformance tests:** named profile requirements with evidence linked to an exchange.
4. **Scenario tests:** secure and vulnerable paired outcomes, deterministic seed, reset/re-run behavior.
5. **Isolation tests:** network, filesystem, process/resource limits, stop, cleanup, and cross-run separation.
6. **End-to-end tests:** a complete local actor flow through the UI and report/export path.
7. **External interoperability tests:** explicitly scoped and authorized; kept separate from deterministic unit/scenario tests.

Redaction tests must check API responses, logs, persisted records, UI models, and exports for credentials, tokens, cookies, codes, assertions, and private keys. Scenario tests must prove that a vulnerable behavior occurs only in its isolated target and that the secure path rejects it.
