# D4 — Selected plan

## Decisions

- Replace the obsolete human-study gate with a synthetic internal review
  policy. Record it as ADR-007 and update ROAD-001/002 and the roadmap. Keep
  empirical usability and demand explicitly unknown.
- Group the 13 existing tools under Flow, Inspect, Learn, and SAML labs, without
  changing IDs or component behavior.
- Add state/PKCE checkboxes to OAuth explorer and a local POST simulation API
  for their four combinations. Preserve preset GET APIs for existing Academy
  content and callers.
- Use default-secure controls (both enabled). The UI describes output as a
  synthetic simulation and clears prior results when controls change.
- Validate request body strictly: both booleans required, reject unknown JSON
  fields/trailing JSON/oversized body; no arbitrary request data or network
  target is accepted.

## Files and proof plan

- Docs/process: ADR-007, ADR index, `docs/research/internal-product-review.md`,
  roadmap/backlog, graph workflow/profile.
- UI/API: `web/src/main.tsx`, `web/src/styles.css`, OAuth adapter, Go OAuth flow
  package and API handler.
- Tests: focused backend and frontend tests; run existing web suite/build and
  backend suite; inspect diff, links, and whitespace.
- D7: invoke five-lens synthetic panel independently. Any credible critical
  blocker prevents internal gate pass and must be fixed or reported.

## Out of scope

Human studies, market/demand claims, OIDC discovery, real provider connections,
arbitrary HTTP execution, additional protocols, full OAuth conformance, and
changing unrelated worktree files.
