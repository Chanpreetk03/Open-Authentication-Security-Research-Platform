# Domain Model

The domain is a **protocol workbench and scenario runner**, not an IAM account system.

## Core concepts

- **Protocol pack:** versioned protocol semantics, parsers, supported profiles, checks, redaction rules, and scenario support.
- **Collection:** saved protocol tasks, requests, assertions, and setup.
- **Environment:** non-secret target/configuration values plus references to locally held secrets.
- **Scenario definition:** immutable target and exercise description, synthetic seed, declared capabilities, limits, variants, and reset policy.
- **Scenario instance:** one ephemeral run with isolated state and endpoints.
- **Exchange:** ordered messages/events with actors, timestamps, raw and normalized forms, and redaction metadata.
- **Assertion:** a named expected property evaluated against a specific exchange or target response.
- **Evidence:** the observed event/result that supports an assertion.
- **Run report:** portable, redacted summary bound to pack and scenario versions.

## Protocol fixture concepts

Identity, principal, credential, claim, session, token, key, directory entry, role, and permission are protocol or target concepts. They belong to the protocol pack or synthetic target that uses them; they are not a shared platform identity engine. A local target may model authorization so a learner can observe an outcome, but the workbench does not centrally manage production identities or policy.

## Result model

Keep these outcomes separate:

1. **Parse:** the input has a recognized structural shape.
2. **Verify:** cryptographic and protocol-specific authenticity checks ran under a stated key/trust policy.
3. **Conform:** a declared profile's requirements passed or failed.
4. **Accept:** the test target made an application-specific decision.

A parse result alone never means a token, assertion, ticket, or identity should be trusted.
