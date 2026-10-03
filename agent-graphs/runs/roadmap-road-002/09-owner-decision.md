# Owner decision — review process and first blockers

- **Date:** 2026-10-03
- **Decision record:** [ADR-007](../../../docs/adr/007-synthetic-persona-review-policy.md)
- **Scope:** supersedes this run's pending-human-session recommendation and
  ROAD-001/ROAD-002 process state. It does not rewrite the observations in the
  earlier reports, which remain a record of the initial panel run.

## Decisions

1. The project will not use human reviewers or participant sessions as part of
   its standard product review process.
2. Use the reusable five-lens synthetic persona panel for product-facing
   changes. Apply a unanimous threshold: all five lenses must identify no
   credible critical blocker; one blocker means revise.
3. The panel is internal critique only. Actual usability, demand, and market
   fit remain unknown; do not claim validation.
4. Address the first two actionable concerns from report 08: group the flat
   navigation and make OAuth state/PKCE protections editable in the synthetic
   flow so a mitigation can be modeled and inspected.

## Follow-up

The remediation implementation and its separate five-lens critique are
recorded in [`panel-remediation`](../panel-remediation/). ADR-007 is the
authoritative policy decision if any earlier artifact conflicts with it.
