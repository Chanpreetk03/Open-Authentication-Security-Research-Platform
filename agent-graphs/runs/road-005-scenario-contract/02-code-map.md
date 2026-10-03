# D2 — Codebase map

## Observed architecture and source owners

- `docs/architecture/protocol-lab-architecture.md`, **Protocol module
  contract** already names `Describe`, `CreateScenario`, `StartScenario`,
  `Execute`, `Observe`, `Verify`, `Reset`, and `Destroy`; it is a conceptual
  interface, not implemented shared runtime code.
- `docs/architecture/product-architecture.md`, **Authentication Lab** and
  **Lab safety architecture** assigns scenario lifecycle, capability policy,
  synthetic identity provisioning, event capture/redaction, and audit to the
  platform; protocol semantics remain in modules.
- `docs/security/lab-safety-requirements.md` (ROAD-004) requires declarations
  to be requests only, platform-created per-run resources, default deny,
  lifecycle cleanup, redacted traces, synthetic-only data, artifact identity,
  and fail-closed behavior.
- `backend/internal/oauthoidc/flow.go`: `Scenario` holds ID/name/description/
  secure flag; `Scenarios`, `NewAuthorizationCodeFlowForScenario`, and
  `NewAuthorizationCodeFlowForProtections` own the current OAuth variants and
  simulation semantics. `Flow`/`Event`/`Finding` are protocol-module-owned
  outcomes; there is no generic run lifecycle.
- `backend/internal/saml/replay.go`: `Scenario` and `NewReplayFlow` own the
  SAML replay variants and trace semantics; this is also a synthetic flow,
  without a generic runtime handle.
- `docs/architecture/protocols/oauth-oidc-module.md` states the OAuth slice is
  an in-memory simulator, not a live provider/client/resource server.
- `docs/architecture/modules/audit.md` is only a short concept note; product
  architecture owns the existing audit boundary.
- Root `CONTEXT.md` now defines descriptor/request/grant/run/evidence terms;
  `docs/architecture/domain-model.md` describes broader IAM concepts.

## Reuse and boundary

- Reuse existing protocol scenario IDs, variant mapping, synthetic trace/event
  concepts, and lifecycle method names; do not move protocol rules into the
  shared descriptor.
- Define protocol-neutral references and bounded capability request shapes;
  a protocol module validates module-owned scenario/step/check identifiers.
- Keep exact descriptor field names and lifecycle semantics in the new
  candidate contract until reviewed; do not create production runtime code or
  claim a schema implementation.
