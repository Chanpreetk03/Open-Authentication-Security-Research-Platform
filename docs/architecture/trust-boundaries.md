# Trust Boundaries

Trust boundaries are central to both the platform architecture and the
Cybersecurity Principles Academy. Every lab and protocol visualization should
make its boundaries and trust assumptions visible.

## Core boundaries

- **Learner or operator:** controls a lab or observes a protocol flow but must
  not gain unintended access to platform or host resources.
- **Learning interface:** web UI, Studio tools, and Academy content that accept
  user input and display protocol data.
- **Lab runtime:** isolated vulnerable or secure scenarios with resettable
  state and intentionally constrained capabilities.
- **Reference identity engine:** sandbox identities, credentials, sessions,
  tokens, policies, and audit records used by the platform.
- **Platform control plane:** scenario creation, lifecycle, permissions,
  telemetry, content, and reset operations.
- **External protocol target:** test applications, OAuth/OIDC providers, SAML
  IdPs/SPs, LDAP/Active Directory, and Kerberos systems used for integration
  exercises.
- **Host and infrastructure:** the developer machine, containers, networks,
  databases, caches, and deployment environment running the platform.

## Security rules

- A vulnerable lab must not be able to affect the host, other labs, or real
  external systems.
- Lab credentials, tokens, keys, and identities must be isolated from any real
  user or production credential.
- Attack simulations must use synthetic data and controlled targets.
- Protocol traces must avoid exposing secrets and must define retention and
  redaction behavior.
- Platform control operations require explicit authorization and must be
  auditable.
- Secure reference implementations and vulnerable examples must have separate
  execution paths and clear labeling.

## Boundary analysis

Each new module should document:

1. What crosses the boundary.
2. Which party initiates the exchange.
3. What is trusted, authenticated, or untrusted.
4. Which secrets or security claims are transferred.
5. What happens when the other side is compromised or unavailable.
