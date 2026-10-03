# D2 — Codebase map

## Findings

- **Observed:** `web/src/main.tsx` owns active-tool selection and renders 13
  buttons in one `.tool-switcher`; each tool renders in a conditional body.
- **Observed:** `web/src/styles.css` styles `.tool-switcher` as one flex-wrapped
  row. Group containers can be introduced without changing component state or
  tool implementations.
- **Observed:** `web/src/protocols/oauth.ts` exports `runOAuthScenario`, which
  calls `GET /api/flows/oauth/authorization-code?scenario=...` and maps the
  common flow DTO to `ProtocolExchange`.
- **Observed:** Academy uses existing OAuth scenarios, so retain their GET API.
- **Observed:** `backend/cmd/server/main.go` defines OAuth GET routes and wraps
  the mux with CORS allowing GET/OPTIONS.
- **Observed:** `backend/internal/oauthoidc/flow.go` owns scenario semantics,
  trace generation, findings, and redaction. Secure, missing-state, and
  missing-PKCE traces already exist.
- **Observed:** backend tests cover scenario semantics; frontend uses Vitest.

## Reuse and change points

- Reuse `ProtocolExchange` DTO mapping by extracting a shared response mapper
  for GET and POST calls.
- Add a config constructor in the OAuth protocol package, preserving existing
  preset constructor as a mapping to config values.
- Add a strict JSON POST endpoint with required boolean fields, bounded body,
  unknown-field rejection, and no change to existing GET behavior.
- Group navigation into Flow, Inspect, Learn, and SAML labs. Keep all active
  tool IDs and component render paths unchanged.

## Sources

`web/src/main.tsx`, `web/src/styles.css`, `web/src/protocols/oauth.ts`,
`backend/cmd/server/main.go`, `backend/internal/oauthoidc/flow.go`, and nearby
backend/frontend tests.

## Next

Set acceptance/risk criteria before implementing.
