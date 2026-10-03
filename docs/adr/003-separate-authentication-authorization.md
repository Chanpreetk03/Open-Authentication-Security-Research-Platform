# ADR-003: Keep Authentication and Authorization Distinct in Protocol Models

## Status

Accepted as a modeling principle for protocol packs and test targets. It does not require a platform authentication service or centralized policy engine.

## Context

Protocol tests often need to distinguish proof of an identity or possession of a credential from a target's decision to grant access. Conflating them hides important protocol and application behavior.

## Decision

Model authentication outcomes and authorization outcomes separately whenever a pack or target uses both. Show which actor made each decision and which protocol evidence or local policy it used.

## Alternatives considered

- Treat any successful login/token validation as proof that access is authorized.
- Add a shared platform policy engine to own all authorization decisions.

## Consequences

Protocol traces can teach the distinction without turning the workbench into a general IAM service. A synthetic resource server may model policy locally to the scenario.
