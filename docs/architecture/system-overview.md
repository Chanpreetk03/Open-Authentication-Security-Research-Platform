# System Overview

The product is an authentication protocol workbench paired with a safe, resettable attack sandbox. It helps users configure flows, run them against local or explicitly authorized targets, inspect messages, verify protocol properties, and compare vulnerable and secure behavior.

It is not a general-purpose identity provider or IAM service. Identity providers, clients, resource servers, relying parties, directories, and KDCs are protocol actors hosted as test fixtures or selected external targets.

## Product components

### Workbench

Collections and environments organize protocol flows, endpoint settings, assertions, and local secret references. The runner executes a saved task and returns a redacted, versioned run report.

### Protocol packs

Each pack owns its wire formats, state machine, security checks, errors, version/profile metadata, parsers, and attack variants. The first product depth is OAuth 2.0, OpenID Connect, JWT/JWS/JWE, and HTTP. SAML follows, then WebAuthn/passkeys, LDAP/Active Directory, Kerberos, and additional mechanisms.

### Trace and evidence layer

The shared layer orders messages, identifies participants, records timestamps, redaction state, checks, and evidence links. It preserves protocol-specific payloads and never treats parsing as proof of authenticity.

### Scenario control plane

The control plane selects a versioned scenario, provisions synthetic data, starts and stops a run, applies a named exercise step, collects evidence, and resets or destroys the scenario.

### Scenario runner

The runner executes local test peers and vulnerable fixtures behind a narrow isolation boundary. It enforces network, filesystem, resource, time, cleanup, and reset policies. It is replaceable independently from protocol packs.

## Main run path

```text
User -> collection/environment -> protocol pack -> scenario runner
     -> local peers or authorized test target -> observation/redaction
     -> assertions and evidence -> report -> reset/export
```

## Trust boundaries

- User-supplied protocol messages and target configuration are untrusted input.
- The control plane owns scenario authorization and lifecycle.
- The runner and each scenario are isolation boundaries.
- Traces and exports are sensitive data until redacted.
- External targets are reachable only in explicitly scoped integration mode.
- The host and other runs must remain inaccessible from a vulnerable target.

See [trust boundaries](trust-boundaries.md), [product architecture](product-architecture.md), and the [research-backed plan](../research/auth-protocol-workbench-and-sandbox.md).

## Architectural rule

Share lifecycle, resource policy, trace envelope, redaction, assertions, and reporting. Keep protocol parsing, state, validation, cryptography, and attack semantics in their protocol pack. Do not add a platform identity engine or split services unless a concrete execution or isolation need requires it.
