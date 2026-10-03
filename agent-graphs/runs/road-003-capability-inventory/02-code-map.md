# D2 — Codebase map

## Observed behavior owners

- `web/src/main.tsx` owns 13 tool IDs, grouped navigation, and active content
  selection. Add `coverage` as a catalog view, not a protocol capability.
- OAuth behavior and boundary: `backend/internal/oauthoidc/flow.go`,
  `web/src/protocols/oauth.ts`; preset traces are synthetic and the configurable
  explorer uses only local API calls.
- JWT behavior: `web/src/protocols/jwt.ts`,
  `web/src/components/JwtInspector.tsx`,
  `docs/architecture/protocols/jwt-inspector.md`. It decodes three-segment
  compact JWS input, temporal/registered-claim observations, max 64 KiB; never
  verifies signatures or decrypts JWE.
- HTTP behavior: `web/src/protocols/http-inspector.ts`,
  `web/src/components/RequestInspector.tsx`,
  `docs/architecture/protocols/http-inspector.md`. Supports URL and raw HTTP
  request/response starts for HTTP/1.0, HTTP/1.1, HTTP/2; 64 KiB/200 headers;
  no send, replay, redirect follow, or displayed body.
- SAML assertion/metadata inspection: `web/src/protocols/saml.ts`,
  `web/src/protocols/saml-metadata.ts` and matching components/architecture
  docs. Both parse locally; selected fields only, no signature/trust validation.
- Synthetic SAML labs: seven `Saml*Lab.tsx` components and corresponding
  `backend/internal/saml/` constructors/docs. Each models one named decision
  and assumes surrounding trust/validation checks; no real SAML exchanges.
- Academy: `web/src/components/DefenseInDepthLesson.tsx`,
  `web/src/academy/defense-in-depth.ts`, and its docs. Reuses three existing
  OAuth synthetic traces; it is learning content, not a second protocol engine.

## Reuse leads

- Keep one catalog data module consumed by both active-tool badge and catalog
  view. Do not reimplement protocol behavior or infer claims from component
  display strings.
- Keep component-specific boundary notes; inventory summarizes their actual
  contracts and links to existing detailed architecture docs.
- Use existing CSS card patterns and accessible semantic sections.

## Unknowns

- No source claims standards conformance or live-provider interoperability.
- Exact intended future coverage remains roadmap work. Do not label future
  plans as current implementation.

## Next

Define observable completeness, security, and accessibility acceptance.
