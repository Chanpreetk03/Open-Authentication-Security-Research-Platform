# D1 — Scope

**Observable goal:** Specify a versioned scenario descriptor and a protocol-
neutral lifecycle/evidence contract, with a sample synthetic OAuth scenario
that refers to protocol-owned semantics instead of copying them into the shared
control plane.

**Constraints and invariants**

- ROAD-004's safety semantics are normative input. Descriptors request
  capabilities and never grant them; the control plane and runtime policy
  validate and enforce the allowed subset.
- Runtime technology and adapter proof belong to ROAD-006. The contract must
  remain runtime-neutral and must not imply current isolation implementation.
- Protocol semantics, variants, step meanings, and verification checks remain
  in protocol modules; the shared control plane handles validation, policy,
  lifecycle, audit, and redacted evidence routing.
- Current OAuth/SAML simulations remain the demonstrated behavior. Any sample
  must say whether it is synthetic/non-executable or an executable descriptor
  awaiting ROAD-006 proof.
- Lifecycle actions include start, execute, observe, verify, reset, and
  destroy; failure states and cleanup outcomes are explicit.
- Synthetic values only; no raw secrets in descriptors or durable traces.
- Record the domain terms in root `CONTEXT.md` and keep the spec, roadmap, and
  workflow run aligned. No user-validation claims.

**Touched boundaries:** `CONTEXT.md`, `docs/architecture/domain-model.md`,
`docs/architecture/scenario-manifest-contract.md`,
`docs/architecture/protocol-lab-architecture.md`, `docs/roadmap/backlog.md`, and
`agent-graphs/runs/road-005-scenario-contract/`.

**Proof obligations:** the candidate contract specifies validation behavior
and fail-closed outcomes; it defines lifecycle operation preconditions and
terminal states; a focused fixture test protects the synthetic example's
module references and absence of embedded authority or protocol messages. No
deployed schema validator or runtime lifecycle is claimed.

**Unknowns:** exact wire/schema encoding, actor/principal representation for
the solo local product, learner-to-private-target mediation UX, and descriptor
compatibility policy. The candidate resolves artifact reference fields while
leaving trusted-source enforcement and digest verification proof to ROAD-006.
