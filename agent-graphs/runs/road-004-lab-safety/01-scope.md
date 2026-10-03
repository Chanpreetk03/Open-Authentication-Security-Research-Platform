# D1 — Scope

**Observable goal:** Convert ROAD-004 into testable security requirements for
future executable authentication-protocol labs, covering host/network/filesystem
access, destination allowlists, synthetic data, resource/time bounds,
cross-scenario isolation, redaction, trace retention, audit, reset, cleanup,
and failure behavior.

**Constraints and invariants**

- Current attack exercises remain synthetic and non-executable. ROAD-004 must
  not imply that the repository has an isolated vulnerable-code runtime.
- Requirements apply before any executable vulnerable target, user-authored
  lab, or network-enabled scenario is enabled.
- Default-deny is the baseline for host/control-plane/peer access, real
  credentials, general egress, and inbound host exposure. The platform may
  create private per-run resources; failure to establish a control blocks
  execution.
- Use synthetic identities, credentials, tokens, keys, and target data only.
- Do not select a process, container, or sandbox technology here; ROAD-006 owns
  comparison and proof. Do not define a versioned manifest or lifecycle API;
  ROAD-005 owns that contract.
- Keep protocol semantics in protocol modules and the enforcement boundary in
  the runtime/control plane.
- Decisions and residual unknowns must be recorded in architecture/security
  documentation and an ADR. No human reviewer or user validation is claimed.

**Touched boundaries:** `docs/security/`, `docs/research/`, `docs/adr/`,
`docs/architecture/trust-boundaries.md`,
`docs/architecture/product-architecture.md`, `docs/roadmap/backlog.md`, and a
durable graph run under `agent-graphs/runs/road-004-lab-safety/`.

**Proof obligations:** each requirement has an enforcement owner, fail-closed
behavior, and a testable acceptance signal; denial cases include host,
unlisted/external network, filesystem, credential, neighboring scenario, and
resource access; cleanup and trace behavior cover normal and abnormal exit.

**Unknowns:** runtime technology and its isolation strength; numeric global
resource ceilings; whether any future persisted trace/export mode is needed.
Resolve technology and prove residual risk in ROAD-006, not by assumption here.
