# D2 — Code and documentation map

**Purpose:** Ground the roadmap in the current repository state and identify reuse.

**Inputs:** `01-scope.md`, prior `agent-graphs/runs/idea-evaluation/` review, current repo docs and implementation inventory.

## Observed current state

- OAuth authorization-code simulation with secure, missing-state, and missing-PKCE scenarios: `backend/internal/oauthoidc/flow.go`, `backend/internal/oauthoidc/flow_test.go`; UI integration via `web/src/protocols/oauth.ts` and components in `web/src/`.
- Local browser tools: JWT, HTTP request/redirect, SAML assertion, and federation metadata inspectors under `web/src/components/`, with adapters/tests under `web/src/protocols/`. `docs/architecture/protocols/http-inspector.md` explicitly excludes network send/replay.
- Synthetic SAML scenarios and Go tests exist in `backend/internal/saml/`: replay, correlation, audience, recipient, conditions, signature binding, and subject confirmation. Related UI components exist under `web/src/components/`.
- One Academy exercise joins existing OAuth scenarios to a secure verification: `web/src/academy/defense-in-depth.ts`, its test, and `docs/academy/defense-in-depth-oauth.md`.
- Product direction and safety constraints are defined in `docs/product/PRD.md`, `docs/product/product-vision.md`, `docs/architecture/product-architecture.md`, `docs/architecture/protocol-lab-architecture.md`, and `docs/architecture/trust-boundaries.md`.
- Roadmap and backlog are currently short unordered lists: `docs/roadmap/roadmap.md`, `docs/roadmap/backlog.md`.
- Future idea list mixes features, safety foundations, protocol families, architecture mechanisms, and explicit deferrals: `docs/research/ideas.md`.

## Inferred / unknown

- Current frontend/backend tests suggest synthetic behavior is testable; this roadmap does not infer production readiness from tests.
- No general scenario lifecycle/isolation runtime, LDAP/Kerberos/WebAuthn implementation, or third-party plugin system was observed in the listed implementation inventory.
- Dates and capacity are unknown; milestones are ordered by dependency and exit criteria only.

**Next:** D3 defines acceptance gates and material risks.
