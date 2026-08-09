# ADR-002: Start Modular Before Extracting Services

## Context

The project is both a product and a system-design learning exercise.

## Decision

Begin with strong logical module boundaries. Extract independently deployed services only when a concrete architectural reason is documented.

## Alternatives considered

Starting with many independently deployed microservices.

## Consequences

The project can learn boundaries before adding distributed-system complexity; service extraction may be deferred even when logical ownership is separate.

## Status

Accepted
