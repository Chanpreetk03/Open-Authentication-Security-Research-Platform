# ADR-005: Focus on Authentication and Cybersecurity Learning

## Status

Superseded by [ADR-007](007-auth-protocol-workbench-and-sandbox.md).

## Context

The original product direction risked becoming an enterprise IAM and access-governance platform. A narrower authentication and security-learning focus was chosen to create a distinct, useful project.

## Historical decision

Prioritize protocol education, visualization, developer tooling, isolated attack-and-defense labs, secure reference implementations, and self-hosted experimentation. Defer enterprise application connectivity, access governance, broad connector libraries, and hosted multi-tenant IAM.

## Alternatives considered

- Build a general-purpose enterprise IAM platform with application connectors.
- Build a production identity provider first and add learning features later.
- Keep the scope as a broad collection of unrelated cybersecurity tools.

## Historical consequences

This established protocol and security work as the project's domain and deferred enterprise IAM. ADR-007 narrows the product further to an authentication protocol workbench and attack sandbox; education is now a capability within those workflows rather than a separate top-level platform.
