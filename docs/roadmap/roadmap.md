# Roadmap

This roadmap follows the [research-backed workbench and sandbox plan](../research/auth-protocol-workbench-and-sandbox.md). It describes product stages, not a promise that every listed protocol will ship on a fixed date.

## Phase 0 — Product contract and safety

- Align requirements and architecture around an authentication protocol workbench and isolated attack sandbox.
- Define the first user journeys, protocol roles/profiles, pack versioning, secret policy, report format, and authorized-target rules.
- Threat-model local scenario execution and define its acceptance bar.

## Phase 1 — Workbench foundation

- Add versioned protocol-pack, collection, environment, run, exchange, assertion, and report models.
- Reuse one trace/evidence UI for OAuth and synthetic SAML exchanges while preserving protocol-specific payloads.
- Add local import/export, redaction-before-storage, run history as needed, and deterministic reset for existing scenarios.

## Phase 2 — OAuth/OIDC and JWT/JOSE MVP

- Turn the OAuth simulator into a real local flow with client, browser callback, authorization server, and resource server.
- Add OIDC discovery and ID-token verification outcomes.
- Expand JWT support from decoding into explicit inspect/build/verify tasks with deliberate algorithm and key policies.
- Pair selected OAuth/JWT attacks with secure scenarios and evidence.
- Add collections and local secret references sufficient to reproduce runs.

## Phase 3 — Local attack runner

- Run prebuilt scenario targets with per-run network isolation, resource/time limits, loopback-only published ports, cleanup, and reset.
- Ensure targets have no host mounts or runtime socket access and no Internet egress by default.
- Separate deterministic simulations, local protocol peers, and external authorized testing in the product UX.

## Phase 4 — SAML workbench

- Add a local test IdP/SP and real SAML request/response capture.
- Add profile-based positive and negative tests for metadata, signatures, audience, recipient, conditions, correlation, and replay.
- Keep existing synthetic SAML policy labs labeled as simulations.

## Phase 5 — Additional protocol packs

Add WebAuthn/passkeys, LDAP/Active Directory, and Kerberos one at a time. Each pack needs a local target, an inspectable end-to-end flow, a secure and negative case, repeatable evidence, explicit limitations, and reset before broader coverage is added.

## Phase 6 — Authorized external testing and extensibility

- Add scoped connections to user-owned test systems with explicit target and operation confirmation.
- Add rate limits, stop controls, audit evidence, and safe fetch policy.
- Define versioned, reviewed protocol-pack contributions.
- Reassess hosted/team execution only after a separate isolation and operations review.

## Deferred

Production IAM/provider functionality, access governance, enterprise connectivity marketplaces, arbitrary public attack targets, arbitrary user code execution, and hosted multi-tenant vulnerable labs are not on the current roadmap.
