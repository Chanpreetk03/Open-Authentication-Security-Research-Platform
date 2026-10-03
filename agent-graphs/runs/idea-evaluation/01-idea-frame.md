# I1 — Idea frame: evaluate the repository ideas

**Purpose:** Define which candidate ideas should be tested, advanced, sequenced, or deferred for the authentication protocol workbench and safe attack sandbox.

**Inputs:** User direction from the conversation; `docs/research/ideas.md`; product, architecture, security, roadmap, and current implementation files.

## Target users and problem

- **Target users:** developers debugging authentication integrations; students and educators learning protocols; security engineers validating protocol behavior and mitigations.
- **Problem hypothesis:** protocol behavior and security failures are hard to inspect and reproduce safely when tools are fragmented or hide protocol details. Users need a workbench that makes exchanges observable and a controlled sandbox for repeatable attack-and-defense exercises.
- **Proposed product:** a Postman-like protocol workbench spanning authentication protocols and cryptographic artifacts, plus isolated, resettable attack labs. The product is a learning, debugging, and security-research tool, not a full IAM service.
- **Expected outcome:** users can inspect/understand an exchange, reproduce a bounded failure against synthetic or explicitly controlled targets, apply a mitigation, and verify the result.

## Ideas under evaluation

The source list in `docs/research/ideas.md` names protocol visualization, cyber-range isolation, security-principle learning paths, attack replay, secure-coding exercises, PKI, key management, WebAuthn, SAML, LDAP, Kerberos, and a plugin model. It also explicitly defers enterprise connectors, access governance, and hosted multi-tenancy.

## Decision to make

Which ideas should shape the next small, reversible experiment and near-term sequencing, given that some are already partially implemented and the target user demand has not been validated in the repository?

## Assumptions and unknowns

- **Observed:** the code and docs already contain OAuth simulation, local inspectors, Academy content, and synthetic SAML labs.
- **Inferred:** the existing direction addresses a meaningful developer/learner problem; no interviews, usage data, or external user validation were found in the reviewed product/research files.
- **Unknown:** which user segment has the most urgent need; whether users prefer local synthetic labs, real-provider test integrations, or both; which protocol beyond OAuth/OIDC should be deepened next.
- **Unknown:** the acceptable isolation level and deployment environment for intentionally vulnerable, executable scenarios.

**Next node:** I2–I4 gather problem evidence, feasibility, and alternatives.
