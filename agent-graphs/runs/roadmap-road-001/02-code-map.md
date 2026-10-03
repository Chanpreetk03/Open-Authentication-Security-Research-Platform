# D2 — Product and code map

**Purpose:** Base the session guide on workflows that currently exist.

**Inputs:** `01-scope.md`, ROAD-001/002, app entry point and feature docs.

## Observed workflows

- Tool navigation and available surfaces are in `web/src/main.tsx`: OAuth flow, JWT inspector, HTTP request inspector, Academy, SAML viewer/metadata, and synthetic SAML labs.
- OAuth UI (`web/src/main.tsx`, `web/src/protocols/oauth.ts`) lets a participant select secure, missing-state, or missing-PKCE scenarios, run one, inspect ordered events and explanations, and see findings/mitigations.
- JWT UI (`web/src/components/JwtInspector.tsx`) accepts a compact token or generated synthetic example and explicitly says it decodes locally without signature verification.
- HTTP UI (`web/src/components/RequestInspector.tsx`) accepts a pasted message/URL or synthetic example, inspects locally, masks credentials, and does not send or replay.
- SAML replay UI (`web/src/components/SamlReplayLab.tsx`) presents synthetic traces and disclaims real ACS behavior. Other SAML lab components are registered in `web/src/main.tsx`.
- The Academy lesson in `docs/academy/defense-in-depth-oauth.md` walks missing-state, missing-PKCE, and secure-flow verification.
- Existing persona statements are in `docs/product/personas.md`; session participants are hypothesized targets, not validated users.

## Reuse and limitations

- Reuse existing synthetic samples and task flows; do not invent a new prototype or add network behavior for the research session.
- Across the participant set, rotate a focused JWT, HTTP, or SAML task so all tool families are sampled without overloading each session.
- **Unknown:** whether tool copy, APIs, and test setup remain stable at session time. Facilitator should check current `README.md` and app before each session.

**Next:** D3 defines observable acceptance, ethics, and security constraints.
