# Open Authentication and Cybersecurity Principles Platform

## Product Requirements Document

### Version 0.2 — Focused direction

## 1. Product thesis

Build an open platform for understanding, testing, visualizing, attacking, and
securing authentication protocols and foundational cybersecurity principles.

The platform is primarily an educational, developer, and security-research
product. It is not initially positioned as a replacement for enterprise IAM,
access governance, or application-connectivity products.

The core learning loop is:

**Understand → Implement → Visualize → Attack → Secure → Integrate**

## 2. Product goals

- Teach authentication and cybersecurity from first principles.
- Make protocol behavior observable rather than hiding it behind black boxes.
- Provide safe vulnerable and secure implementations for comparison.
- Help developers debug and validate authentication integrations.
- Help security engineers study common weaknesses and mitigations.
- Build a modular reference implementation that can grow over time.

## 3. Product boundaries

### In scope

- Authentication protocols and mechanisms.
- OAuth 2.0, OpenID Connect, JWT, SAML, LDAP, Kerberos, MFA, and passkeys.
- Sessions, cookies, tokens, credentials, claims, and trust boundaries.
- Cybersecurity principles such as least privilege, defense in depth, secure
  defaults, threat modeling, cryptographic hygiene, input validation, secrets
  management, auditability, and failure handling.
- Protocol visualization, request inspection, attack simulation, and secure
  reference implementations.
- Local and self-hosted learning environments.

### Explicitly deferred

- Enterprise application-connectivity marketplaces.
- Access governance and certification workflows.
- Full enterprise provisioning and lifecycle management.
- Production multi-tenant IAM as the initial commercial focus.
- Broad enterprise connector libraries.
- Mobile authentication hardware and push infrastructure.

These areas may be reconsidered later only if they support the product thesis
without turning the project into a general enterprise IAM competitor.

## 4. Product experiences

### Authentication Lab

Safe, isolated labs containing simplified vulnerable and secure versions of
authentication flows and cybersecurity scenarios.

Example topics:

- Replay attacks and session fixation.
- CSRF, token theft, and session hijacking.
- JWT and OAuth misconfiguration.
- LDAP injection.
- Kerberoasting and controlled ticket-abuse simulations.
- Secure password handling, MFA, passkeys, and key rotation.

### Protocol Studio

A developer workspace for inspecting and understanding authentication flows.

Initial tools:

- OAuth/OIDC flow explorer.
- JWT and token inspector.
- SAML assertion viewer.
- LDAP explorer.
- Kerberos ticket-flow explorer.
- Request and redirect inspector.
- Configuration and integration generator.
- Protocol test-case generator.

### Cybersecurity Principles Academy

Structured modules that connect security principles to working examples,
attacks, and mitigations.

Initial principles:

- Least privilege.
- Defense in depth.
- Secure by default.
- Fail securely.
- Complete mediation.
- Separation of duties.
- Zero trust and explicit trust boundaries.
- Threat modeling.
- Cryptographic key and secret management.
- Input validation and output encoding.
- Auditability and incident readiness.
- Availability, resilience, and safe failure modes.

Each module should include an explanation, a small implementation, a failure or
attack scenario, a secure variant, and verification exercises.

### Reference Identity Engine

A small modular identity engine used by the labs and Studio. It is a teaching
and testing reference implementation, not the initial product centerpiece for
enterprise deployment.

## 5. Audiences

- **Students:** learn protocols, security principles, and system design.
- **Developers:** debug integrations, inspect flows, and generate test cases.
- **Security engineers:** reproduce weaknesses and validate mitigations.
- **Architects:** compare trust boundaries, tradeoffs, and failure modes.
- **Educators and teams:** run repeatable self-hosted labs and exercises.

## 6. Product principles

### Learn deeply

Explain protocol and security behavior from first principles.

### Implement responsibly

Simplified implementations may be built for learning. Production security
paths must use mature, reviewed libraries where appropriate. Educational code
must be clearly marked and isolated from secure reference code.

### Visualize everything

Make redirects, messages, claims, tickets, tokens, signatures, and trust
boundaries observable.

### Break safely

Demonstrate attacks only in isolated, controlled environments with clear
guardrails and resettable state.

### Secure and explain

Every vulnerable scenario should have a secure variant and an explanation of
why the mitigation works.

## 7. Initial technical direction

- Backend: Go
- Frontend: React and TypeScript
- Database: PostgreSQL where persistence is required
- Cache: Redis only when a demonstrated need exists
- Architecture: modular monolith initially
- Deployment: local-first and self-hosted before hosted enterprise service

## 8. Initial success criteria

- A learner can follow and visualize a complete OAuth/OIDC flow.
- A developer can inspect a failing authentication exchange and identify the
  relevant protocol state.
- A security engineer can run a vulnerable lab, reproduce an attack, apply a
  mitigation, and verify the secure behavior.
- Each completed module connects a cybersecurity principle to code and tests.
- The platform does not require enterprise application connectors to provide
  its core value.

## 9. Open questions

- Product name and licensing model.
- First three protocol/security modules for the MVP.
- Lab isolation and reset mechanism.
- Plugin model for adding protocols and scenarios.
- Scope of the reference identity engine.
- Whether hosted environments are needed after the local-first MVP.
- How to keep educational vulnerable code separated from secure paths.
