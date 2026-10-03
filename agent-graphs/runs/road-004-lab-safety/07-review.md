# ROAD-004 Skeptic Re-review

**Final recommendation: PASS for the ROAD-004 documentation baseline.** All previously reported documentation findings are resolved in the current files. This pass confirms specification quality and alignment only; it does not prove runtime isolation or authorize executable labs. Those remain gated on ROAD-006 prototype and test evidence plus its synthetic security/persona panel.

## Initial findings and resolution evidence

| Initial finding | Current resolution | Result |
|---|---|---|
| LAB-01 appeared to deny the private filesystem/network needed to run a lab. | `docs/security/lab-safety-requirements.md`, LAB-01 explicitly permits a platform-created private read-only root, bounded per-run scratch, and optional isolated scenario network while denying host/control-plane/peer access and general egress. Its acceptance test starts the minimal local case and probes host/sibling/undeclared access. ADR-008 Decision 1 matches. | Resolved |
| LAB-01–13 policy claims lacked requirement-level source mapping. | `docs/research/lab-safety-control-guidance.md`, “Requirement-level evidence and policy rationale,” maps LAB-01–14 to source basis and labels stronger project policy/ownership. The synthetic-only target and zero durable trace defaults are stated as selected project policy; future external access/persistence are explicitly separate decisions. | Resolved |
| Acceptance tests were ambiguous around resource bounds, synthetic-secret display, restart, cross-run quotas, and audit failure. | LAB-05 defines below/at/above checks, measurements, adapter tolerance/grace periods, aggregate caps, child termination, and capacity release. LAB-06 tests quota overrun. LAB-07 limits visible values to allowlisted synthetic fields in the owning run and checks persistence/export/log/audit sinks. LAB-08 specifies restart termination/deletion. LAB-09 specifies ordered fields and stop/refuse behavior on audit-store failure. `03-acceptance.md` reflects these outcomes. | Resolved; numeric limits remain properly assigned to ROAD-006 |
| Inbound listener exposure and artifact integrity were missing. | LAB-03 denies host-published listeners and tests host/unrelated-run denial plus authorized same-scenario access. LAB-14 requires immutable version identity and approved-source digest verification; its test checks missing provenance, changed digest, and unapproved sources without requiring an unspecified signature. The release gate and ROAD-006 backlog include inbound and provenance proofs. | Resolved |
| ROAD-004 risked fixing ROAD-005 schema/lifecycle details. | Requirements’ deferred-decisions section assigns policy semantics/evidence to ROAD-004 and descriptor fields, transitions, actor representation, and UI/API shape to ROAD-005. LAB-01 reflects that division. | Resolved |
| ROAD-006 required an undefined human security review despite the no-human-review decision. | `docs/roadmap/backlog.md`, ROAD-006 requires the strict synthetic security/persona panel against the test and residual-risk evidence, explicitly says the panel is not proof of isolation, and keeps vulnerable scenarios non-executable until the gate passes. | Resolved |
| Source citations and graph-run counts were stale. | The LAB-03 mapping in `docs/research/lab-safety-control-guidance.md` now cites NIST SP 800-190 §4.4.2 for egress controls and §4.4.4 for listener/destination anomaly controls. `05-implementation.md` and `06-verification.md` now reference all 14 controls; D6 records the LAB-14 check and confirms no signature assumption. | Resolved |

## Scope and remaining proof

- ROAD-005 owns descriptor and lifecycle representation; ROAD-006 owns runtime selection, numeric limits/tolerances, adapter enforcement, and isolation proof. No runtime was selected here.
- Requirements, ADR, research, backlog, and run records consistently distinguish the current synthetic exercises from a proven executable sandbox.
- Runtime enforcement, platform coverage, artifact trust configuration, crash recovery, and residual risk remain unverified until ROAD-006. These are planned proof obligations, not ROAD-004 documentation blockers.

## Evidence checked

- `docs/security/lab-safety-requirements.md` (LAB-01–14, release gate, deferred decisions)
- `docs/research/lab-safety-control-guidance.md` (source status, requirement mapping, decisions)
- `docs/adr/008-executable-lab-safety-baseline.md` (default-deny policy and gate)
- `docs/roadmap/backlog.md` (ROAD-004–006)
- `agent-graphs/runs/road-004-lab-safety/03-acceptance.md`, `05-implementation.md`, and `06-verification.md`
- [NIST SP 800-190](https://doi.org/10.6028/NIST.SP.800-190), §§4.4.2 and 4.4.4
