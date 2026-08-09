# ADR-003: Separate Authentication and Authorization

## Context

IAM must support multiple authentication mechanisms and shared authorization decisions.

## Decision

Authentication establishes identity. Authorization evaluates permissions as a separate concern.

## Alternatives considered

Embedding authorization decisions in each authentication flow or application.

## Consequences

Multiple authentication mechanisms can feed a common authorization layer; centralized policy evaluation introduces latency and availability tradeoffs.

## Status

Accepted
