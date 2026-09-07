# ADR-006: Start implementation with the OAuth authorization-code explorer

## Status

Accepted

## Context

The first implementation must create a useful vertical slice without committing
the project to a generalized IAM product. The product requirements identify the
OAuth/OIDC flow explorer as the first Protocol Studio capability.

## Decision

The first executable slice is a local OAuth 2.0 authorization-code flow using
one demo client and one local authorization server. The API emits ordered,
redacted protocol events and the web application renders them as a timeline.
The first slice does not include persistence, external providers, OIDC ID
tokens, attack variants, or production deployment.

## Consequences

- Learners can observe the core OAuth exchange before OIDC identity semantics
  are introduced.
- Redaction is part of the API response boundary from the beginning.
- The implementation can later add explicit state-machine and verification
  packages without changing the explorer's basic result shape.
- Running the slice requires Go for the API and Node.js for the web client.
