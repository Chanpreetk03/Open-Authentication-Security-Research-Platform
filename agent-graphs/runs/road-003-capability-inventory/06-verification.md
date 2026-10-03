# D6 — Verification

## Checks run

- `npm test` in `web`: **passed**, 8 files and 46 tests.
- `npm run build` in `web`: **passed**, TypeScript build and Vite production
  bundle.
- `git diff --check`: **passed**; relative Markdown links under `docs/` and
  `agent-graphs/` resolve.
- Catalog contract tests verify all 13 current tool IDs are present exactly
  once, every record has scope/support/exclusions, only implemented modes are
  assigned, Academy is identified as learning content using synthetic traces,
  and HTTP/SAML limits are present. A focused HTTP test verifies an unrecognized
  custom credential header remains visible, matching the best-effort warning.
- The final five-lens reassessment passed 5/5; see
  `08-final-panel-review.md`.

## Gaps

- No browser-driven or assistive-technology test was run for the Coverage page.
- Real users have not evaluated the labels; their clarity and demand remain
  unknown under ADR-007.
