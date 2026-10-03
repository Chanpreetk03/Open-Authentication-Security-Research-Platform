# D5 — Implementation record

## Product policy and roadmap

- Added [ADR-007](../../../docs/adr/007-synthetic-persona-review-policy.md):
  the five-lens synthetic persona panel is the normal internal review gate;
  unanimous 5/5 findings are required for a pass; human reviewers are not used
  in the standard process; actual usability and demand remain unknown.
- Replaced the obsolete participant-session guide with an evidence-labeled
  internal review protocol and aligned the roadmap, backlog, graph workflow,
  panel profile, and ADR index.
- Preserved prior ROAD-002 reports as historical artifacts and added the owner
  decision that supersedes their pending-human-session recommendation.

## Product changes

- Grouped the existing 13 tools under Flows, Inspect, Learn, and SAML labs with
  semantic groups and unchanged active tool IDs/components.
- Replaced OAuth preset selection in the explorer with state and PKCE controls,
  defaulting both protections on. Changes clear stale results. Output is
  labeled synthetic and local-only.
- Added `POST /api/flows/oauth/authorization-code`, accepting only required
  `state_enabled` and `pkce_enabled` booleans, rejecting unknown fields,
  trailing JSON, malformed input, and bodies over 1 KiB. CORS now allows POST.
- Added a combined missing-state-and-PKCE trace with findings for both risks.
  Preserved the existing GET scenario routes and mapped the combined scenario
  through GET as well.
- Added focused Go model/API tests and frontend adapter tests.

## Panel-driven correction

The first D7 review found that POST modeled all four combinations, but the
advertised combined GET scenario returned an incomplete flow because its legacy
scenario switch had no case. Added scenario mapping and a route regression test.
The final panel reassessment is recorded separately in `08-final-panel-review.md`.

## Deviations

None from D4.
