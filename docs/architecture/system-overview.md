# System Overview

The platform is a local-first, modular Authentication and Cybersecurity
Principles platform. It combines educational labs, protocol inspection tools,
security exercises, and a small reference identity engine.

The initial architecture is a modular monolith. Boundaries should be explicit,
but independently deployed services are deferred until a concrete scaling,
security, reliability, or ownership need is demonstrated.

## Product components

### Authentication Lab

Runs isolated vulnerable and secure protocol scenarios with resettable state,
controlled attack conditions, and verification tests.

### Protocol Studio

Provides flow visualization and inspection for redirects, requests, claims,
tokens, assertions, tickets, signatures, and other protocol messages.

### Cybersecurity Principles Academy

Connects principles such as least privilege, secure defaults, defense in depth,
threat modeling, secrets management, and safe failure to executable examples,
attacks, mitigations, and exercises.

### Reference Identity Engine

Provides reusable sandbox capabilities for identities, credentials,
authentication, authorization, sessions, tokens, MFA, federation, and audit.
It supports the labs and Studio; it is not initially a general enterprise IAM
deployment platform.

### Lab and scenario runtime

Creates, isolates, seeds, observes, resets, and safely destroys learning
scenarios. Vulnerable educational implementations must remain separated from
secure reference implementations.

### Learning and observation layer

Stores module content, scenario metadata, event traces, explanations, and
verification results without treating sensitive lab data as production
identity data.

## External integration targets

OAuth/OIDC providers, SAML identity providers and service providers, LDAP and
Active Directory directories, Kerberos realms, and test applications are
controlled protocol targets for learning and integration testing. They are not
an initial connector marketplace or access-governance surface.

## Architectural rule

For every proposed boundary or service split, document the improvement in
independent scaling, security isolation, deployment independence, ownership,
reliability, data isolation, or lab safety. Avoid distributed complexity that
does not improve the learning or security outcomes.
