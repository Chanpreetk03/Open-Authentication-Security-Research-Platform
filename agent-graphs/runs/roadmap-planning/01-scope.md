# D1 — Scope: make the product roadmap actionable

**Purpose:** Translate the completed idea review into one complete, sequenced product roadmap and a maintainable execution backlog.

**Observable goal:** Replace the short roadmap/backlog with a dependency-based plan that reflects current implementation, defines phase outcomes and exit gates, classifies every idea in `docs/research/ideas.md`, and preserves the product boundary: a protocol workbench plus safe attack sandbox, not a full IAM service.

**Constraints and invariants:**

- Local-first, modular monolith; prioritize developer, learner, educator, and security-research workflows.
- Do not claim synthetic scenarios are protocol implementations or real-world validation.
- No general executable vulnerable-code runtime until isolation requirements are specified and verified.
- No speculative dates, staffing estimates, enterprise connector work, access governance, or hosted multi-tenancy commitments.
- Preserve unrelated working-tree changes.

**Touched docs:** `docs/roadmap/roadmap.md`, `docs/roadmap/backlog.md`, `docs/research/ideas.md`, and the stale module-selection question in `docs/product/PRD.md`; this run's artifacts.

**Unknowns:** available capacity and release cadence; validated top persona; whether controlled real-provider testing is required; exact runtime/isolation technology. Record these as gates, not assumed answers.

**Next:** D2 maps current implementation and D3 defines acceptance and risk criteria.
