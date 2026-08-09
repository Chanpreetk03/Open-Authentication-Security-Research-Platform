# ADR-005: Focus on Authentication and Cybersecurity Learning

## Context

The original product direction could become similar to enterprise IAM and
access-governance products. The project needs a distinct, useful scope that
also supports its system-design learning objective.

## Decision

Make the primary product an open Authentication and Cybersecurity Principles
platform. Prioritize protocol education, visualization, developer tooling,
isolated attack-and-defense labs, secure reference implementations, and
self-hosted experimentation. Defer enterprise application connectivity, access
governance, broad connector libraries, and hosted multi-tenant IAM.

## Alternatives considered

- Build a general-purpose enterprise IAM platform with application connectors.
- Build a production identity provider first and add learning features later.
- Keep the scope as a broad collection of unrelated cybersecurity tools.

## Consequences

The product has a clearer distinction from enterprise IAM vendors and can
deliver value without a large connector ecosystem. Enterprise deployment
features are deferred, and lab isolation plus the separation of vulnerable and
secure code become critical architectural concerns.

## Status

Accepted
