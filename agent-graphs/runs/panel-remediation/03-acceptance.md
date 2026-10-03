# D3 — Acceptance and risk map

## Acceptance

1. The 13 tools remain available and become visibly grouped into clear
   categories; current tool selection and accessible current-page state work.
2. OAuth exposes editable state and PKCE choices, defaulting to both enabled.
3. All four combinations produce honest synthetic traces/findings:
   state+PKCE, state only, PKCE only, neither. The insecure cases identify
   the relevant modeled risk; secrets stay redacted.
4. A user can rerun after changing either protection and see the new result.
5. The new request remains local simulation. Existing GET routes and Academy
   behavior continue to work.
6. Invalid JSON, missing/non-boolean required values, unknown fields, and an
   oversized body receive a client error without producing a flow.
7. ADR, roadmap, and review docs consistently state no human reviewers, the
   five-lens unanimous internal threshold, and the unknown status of real-user
   usability/demand.

## Risks / boundaries

- **Protocol fidelity:** model only the educational distinctions already
  represented; do not imply complete OAuth/OIDC conformance.
- **Input boundary:** accept two booleans only; do not accept arbitrary trace
  fields, endpoints, redirects, or target URLs.
- **No live effects:** endpoint constructs synthetic in-memory traces only.
- **Compatibility:** keep current GET APIs unchanged for existing callers.
- **Evidence claim:** synthetic review is internal critique, not user evidence.

## Proof

Focused Go tests for all protection combinations and POST validation; focused
frontend adapter/component tests; project web tests/build; `go test ./...`; D7
synthetic panel report with a five-lens unanimity result.
