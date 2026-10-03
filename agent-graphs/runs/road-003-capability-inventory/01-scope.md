# D1 — Scope

## Goal

Complete ROAD-003 by publishing accurate per-tool capability labels, supported
protocol/format scope, and explicit exclusions. Make the inventory accessible
in the app and show the active tool's classification/scope inline.

## Constraints and invariants

- Classify current behavior only as local inspection, synthetic simulation,
  standards validation, live interoperability, or learning content that uses
  an identified underlying mode.
- No current tool may be labeled standards-validating or live interoperable
  unless source code proves it.
- State supported protocol versions and input formats precisely; do not imply
  standards conformance from targeted parsing or scenario logic.
- Keep the existing synthetic/local-only boundaries and redact sensitive data.
- Keep empirical usability and demand unknown per ADR-007.

## Boundaries

- UI capability metadata and inventory page: `web/src/main.tsx`, a reusable
  capability catalog module/component, and related CSS.
- Published scope and exclusions: new `docs/product/capability-inventory.md`.
- ROAD-003 completion and ROAD-101 status in `docs/roadmap/backlog.md`.
- D1-D7 evidence in this run folder.

## Assumptions and unknowns

- **Observed:** 13 current protocol/learning surfaces exist. See D2.
- **Inferred:** a catalog page plus a compact active-tool banner makes modes
  discoverable without duplicating protocol behavior or changing it.
- **Unknown:** whether users find the labels clear; no human review is planned.

## Next

Map each existing tool to its source-owned behavior and define acceptance.
