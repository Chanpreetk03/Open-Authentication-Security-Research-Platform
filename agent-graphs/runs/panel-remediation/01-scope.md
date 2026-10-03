# D1 — Scope

## Goal

Resolve the actionable findings from the prior synthetic panel: the 13 tools
are presented in one flat switcher, and OAuth failures are fixed presets so a
learner cannot change a protection and rerun the model. Establish the decision
policy that synthetic persona review is the normal internal review gate and
that the project does not use human reviewers.

## Constraints and invariants

- Preserve local-only and synthetic behavior; do not send provider traffic.
- Preserve existing GET scenario APIs because the Academy and current adapters
  use them.
- Never call synthetic critique user validation or evidence of demand.
- Internal design gate passes only with no credible critical blocker from all
  five lenses; one blocker means revise.
- Preserve existing tool functionality and labels; improve grouping only.

## Boundaries

- UI: `web/src/main.tsx`, `web/src/styles.css`.
- OAuth model/API: `backend/internal/oauthoidc/flow.go`,
  `backend/cmd/server/main.go`, frontend adapter and focused tests.
- Durable decisions: ADR-007, internal review protocol, roadmap/backlog, and
  this run folder.

## Assumptions and unknowns

- **Observed:** the current UI has 13 flat buttons; OAuth exposes three fixed
  scenarios. See D2.
- **Inferred:** grouping and direct protection controls should address the
  panel's discoverability and mitigation mismatch concerns.
- **Unknown:** whether actual users find either change useful. This project
  does not use human reviewers or sessions.

## Next

Map existing UI/API contracts and define acceptance/risk cases.
