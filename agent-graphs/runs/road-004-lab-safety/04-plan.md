# D4 — Selected plan

## Decisions

- Publish normative, implementation-independent requirements in
  `docs/security/lab-safety-requirements.md`; record the selected project
  defaults and boundaries in ADR-008.
- Align `docs/architecture/trust-boundaries.md`,
  `docs/architecture/product-architecture.md`, and ROAD-004/005/006 in the
  backlog with one source of truth and clear ownership.
- Preserve default-deny host/control-plane/peer access, synthetic-only data,
  no general egress or host-published listeners, platform-created private run
  resources, no durable trace retention by default, and fail-closed behavior
  for enforcement/cleanup failures.
- State quantitative requirements as enforceable configured ceilings, while
  leaving global numeric defaults and the execution technology to ROAD-006.
  No unsupported workload limit will be invented.
- Add primary-source research with citations; label where a requirement is a
  project policy stronger than a source's recommendation.
- Keep ROAD-005's manifest schema/lifecycle API and ROAD-006's adapter choice,
  prototype, and proof out of scope.

## Proof plan

- Cross-check every ROAD-004 topic against the acceptance map and linked
  architecture docs.
- Verify local Markdown references and `git diff --check`.
- Run the independent five-lens synthetic panel at D7; apply the unanimous
  5/5 gate. Record unverified runtime controls as requirements, not proof.
- No code tests are applicable to a documentation-only specification.

## Out of scope

Runtime implementation, container/sandbox selection, numeric product-wide
resource defaults, scenario descriptor schema, executable attack targets, and
any claim that current simulated labs are isolated execution environments.
