# I2 — User and problem evidence

**Purpose:** Separate evidence for the product problem from assumptions about demand.

**Inputs:** `01-idea-frame.md`, product/research docs, README, and current frontend/backend inventory.

## Findings

### Direct evidence in this repository

- `docs/product/personas.md` describes students, developers, security engineers, and architects/educators. These are documented target personas, not independently validated customers.
- `docs/product/PRD.md` says users should be able to visualize flows, inspect failing exchanges, and reproduce an attack, mitigation, and verification in a lab.
- `README.md` describes an implemented OAuth authorization-code explorer, browser-local JWT/HTTP/SAML inspectors, and synthetic SAML security labs.
- `docs/academy/defense-in-depth-oauth.md` gives a concrete exercise that connects attack scenarios with a secure-flow verification.
- The user's stated direction is a Postman-like tool for authentication protocols/algorithms combined with an attack sandbox. That establishes product intent, not market validation.

### What this supports

- **Observed:** the problem statement is internally coherent across the user's goal, product vision, requirements, architecture, and existing vertical slices.
- **Observed:** the repository's implementations demonstrate a plausible interaction pattern: synthetic protocol events, explanation, a vulnerable scenario, and a secure comparison.
- **Inferred:** users may value having inspection and controlled attack exercises in one product because the current product loop connects them.

### Gaps

- No interviews, issue history, adoption metrics, task-completion evidence, or competitor/user comparison was found in the reviewed repo files.
- No evidence identifies the highest-priority persona or which protocol breadth is necessary for an initial useful product.
- No evidence establishes that users want general-purpose live interception/replay. Existing HTTP inspection is deliberately offline, and existing SAML replay is synthetic.

**Confidence in demand:** low to moderate. Internal product coherence is strong; external demand evidence is absent.

**Evidence locations:** `docs/product/personas.md`, `docs/product/PRD.md`, `docs/product/product-vision.md`, `README.md`, `docs/academy/defense-in-depth-oauth.md`, `docs/architecture/protocols/http-inspector.md`, `docs/architecture/protocols/saml-replay-lab.md`.

**Next node:** I5 will challenge whether internal coherence is enough to justify more breadth.
