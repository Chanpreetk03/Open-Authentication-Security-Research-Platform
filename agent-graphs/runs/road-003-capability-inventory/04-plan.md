# D4 — Selected plan

## Decisions

- Use one typed `CAPABILITY_CATALOG` in the web source as the runtime source of
  truth. The active-tool banner and Coverage page render the same records.
- Add an accessible Coverage view to the Learn group. Each card names mode,
  protocol/format/version basis, supported behavior, and exclusions.
- Show a compact capability banner above each current tool. It links users to
  the full inventory for exact limits.
- Publish a Markdown inventory with the same 13 current surfaces, current
  modes, standards/version basis, and detailed architecture links. Explicitly
  mark cryptographic verification, standards/profile validation, and live
  interoperability as distinct and not currently implemented.
- Keep all input parsing, simulation, and security behavior unchanged.
- Mark ROAD-003 complete and ROAD-101 complete; leave demand/usability unknown.

## Proof plan

- Compare catalog IDs against navigation IDs; test uniqueness, mode taxonomy,
  completeness, and explicit future-mode absence.
- Run `npm test`, `npm run build`, `git diff --check`, and relative Markdown
  links; inspect actual changed-file diff.
- Invoke the reusable five-lens panel under its strict unanimous gate.

## Out of scope

New protocol support, signature verification, SAML validation, real providers,
live traffic, Academy lessons, workflow redesign, and claims of user validation.
