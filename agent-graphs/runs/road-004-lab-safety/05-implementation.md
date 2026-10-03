# D5 — Implementation

## Delivered

- Added the normative 14-control requirement set in
  `docs/security/lab-safety-requirements.md`, with enforcement and acceptance
  evidence for each control. It includes inbound-listener isolation, artifact
  provenance, aggregate resource ceilings, and measurable test tolerances.
- Added primary-source research in
  `docs/research/lab-safety-control-guidance.md`, covering NIST SP 800-190,
  OWASP SSRF/logging/secrets guidance, and official Docker documentation.
- Recorded the fail-closed, local-synthetic-target, no-retention-by-default
  policy and rejected alternatives in ADR-008.
- Linked the baseline from the threat model, trust boundaries, product
  architecture, security principles, ADR index, research references, and
  ROAD-004 backlog item.
- Kept runtime selection and numeric global ceilings in ROAD-006, and scenario
  schema/lifecycle details in ROAD-005. No runtime code or current lab behavior
  changed.
- Applied the D7 skeptic's revisions: distinguish platform-created private
  resources from host access, map every requirement to source or explicit
  project policy, define probe outcomes, and replace the human review wording
  in the roadmap with the strict synthetic panel gate.

## Deviations

None from D4. The project policy is deliberately stricter than a technology
guide: it prohibits general internet/host/production targets and durable trace
retention by default. No exception capability is implemented by this spec.
