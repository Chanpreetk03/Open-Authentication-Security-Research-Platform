# D4 — Plan

**Purpose:** Bound the roadmap change before implementation.

**Inputs:** `01-scope.md`, `02-code-map.md`, `03-acceptance.md`.

## Selected design

- `docs/roadmap/roadmap.md` becomes the canonical phased product roadmap. It will define product outcome, current baseline, sequencing principles, milestones, prerequisites, deliverables, exit criteria, and explicit post-validation deferrals.
- `docs/roadmap/backlog.md` becomes the actionable task inventory grouped by priority and dependency, with completion evidence and gates. Already implemented capabilities are captured as baseline, not duplicated as new work.
- `docs/research/ideas.md` remains the idea register and records disposition plus links to roadmap phases/backlog, avoiding a second competing plan.
- Update the PRD's obsolete question about choosing the first three MVP modules so it matches the roadmap's evidence-selected, one-slice-at-a-time sequence.
- Phases are dependency-ordered and date-free. User validation and safety readiness are gates; exact future protocol order is chosen after evidence.

## Out of scope

- Changing architecture, ADRs, code, or tests.
- Choosing execution runtime technology, target user segment, or next protocol without evidence.
- Committing roadmap changes or making external announcements.

## Proof plan

Compare each idea to its disposition; inspect changed docs for contradictions with PRD and safety boundaries; run whitespace and relative-link checks; skeptic-review for unsupported commitments and scope drift.

**Next:** D5 edits the three roadmap/research docs and records any deviations.
