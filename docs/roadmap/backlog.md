# Backlog

## Product contract

- [ ] Define MVP user journeys and first OAuth/OIDC role/profile.
- [ ] Specify protocol-pack, collection, environment, exchange, assertion, and report schemas.
- [ ] Define local secret references, redaction, retention, and export rules.
- [ ] Write scenario-runner threat model and safety acceptance criteria.

## Workbench foundation

- [ ] Add a shared protocol-neutral event and evidence model.
- [ ] Consolidate OAuth and SAML trace presentation around that model without erasing protocol-specific fields.
- [ ] Add portable local collections and environment import/export.
- [ ] Add deterministic run replay/reset for existing synthetic scenarios.

## OAuth/OIDC and JOSE MVP

- [ ] Implement local authorization-code + PKCE actors and browser callback.
- [ ] Add local resource-server request using the acquired synthetic token.
- [ ] Add OIDC discovery and explicit ID-token checks for issuer, audience, signature/key, time, and nonce.
- [ ] Add JWT/JWS/JWE workbench tasks that separate decode, build, and verify.
- [ ] Add selected algorithm/key negative cases with secure paired outcomes.
- [ ] Export reproducible redacted run reports.

## Safe local labs

- [ ] Build digest-pinned prebuilt targets with per-run networks and cleanup.
- [ ] Default to no egress, loopback-only published ports, bounded resources, no host mounts, and no runtime socket inside targets.
- [ ] Add stop, reset, and automatic destruction controls.
- [ ] Verify traces and exports contain no reusable secrets.

## Protocol expansion

- [ ] Upgrade SAML from synthetic traces to local IdP/SP messages and profile checks.
- [ ] Design a WebAuthn/passkey test target and ceremony inspector.
- [ ] Design an LDAP/AD fixture and bind/search/filter test pack.
- [ ] Design a Kerberos realm/KDC fixture and ticket-flow test pack.
- [ ] Publish supported versions, profiles, and maturity for every pack.

## Later, gated on the safety review

- [ ] Add scoped external integration tests for explicitly authorized systems.
- [ ] Add rate limits, exact target display, active-test confirmation, and a stop control.
- [ ] Define pack contribution and image review process.
- [ ] Reassess hosted/team execution only after an isolation and operations review.

## Not planned

- Production identity-provider/IAM service.
- Access governance and broad enterprise connectors.
- Public arbitrary-target scanning or arbitrary user-code execution.
- Hosted multi-tenant vulnerable labs before a separate isolation review.
