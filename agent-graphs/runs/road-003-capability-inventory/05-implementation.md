# D5 — Implementation

## Delivered

- Added a typed, 13-entry runtime catalog in `web/src/capabilities.ts` with
  mode, protocol/format scope, supported behavior, and explicit exclusions.
- Added a Coverage destination under Learn. It displays all records as
  accessible cards with links back to each tool.
- Added an active-tool capability banner to each current tool view with the
  capability mode, protocol/format scope, supported behavior, and a link to the
  full catalog.
- Published `docs/product/capability-inventory.md` and linked it from README,
  product vision, PRD, and roadmap; updated README's OAuth-controls description.
- Explicitly state that no current capability performs cryptographic
  verification, standards/profile validation, or live interoperability;
  roadmap breadth remains planned, not implemented scope.
- Tightened HTTP redaction and HTTP/2 parser boundaries, published exact SAML
  input/count limits, and separated future verification from conformance modes
  in the catalog and inventory after D7 review.
- Marked ROAD-003 and ROAD-101 complete. No protocol parsing/simulation logic
  or network behavior changed.

## Deviations

None from D4.
