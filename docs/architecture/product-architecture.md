# Product Architecture

## Purpose

This document defines the architecture for the authentication protocol workbench and security sandbox. It replaces the earlier proposal for a shared reference identity engine as a product subsystem. The product runs and observes protocol actors; it does not centrally provide IAM for production applications.

The architecture prioritizes:

- protocol-aware request and flow execution;
- accurate, inspectable protocol artifacts and state transitions;
- reusable conformance checks and evidence;
- safe, resettable vulnerable scenarios;
- local workspaces and redacted portable reports.

## Architectural shape

```text
                         Developer / learner / tester
                                      |
                  Workbench: collections, environments, trace UI
                                      |
                Control plane: packs, lifecycle, assertions, reports
                                      |
             +------------------------+-----------------------+
             |                        |                       |
       Protocol packs          Observation/evidence     Local workspace
       OAuth/OIDC, JOSE,        normalize/redact         collections,
       SAML, LDAP, ...          and report               secret references
             |                        |
             +------------ Scenario runner ---------------+
                                      |
                 Secure/vulnerable peers and test targets
                    isolated, synthetic, resettable state
```

The application can begin as a modular monolith. The scenario runner is a narrow boundary because it executes vulnerable targets and must enforce isolation. It may use a local process or container runtime initially and a stronger sandbox only after a threat review. Do not split other modules into services without a demonstrated reason.

## Main experiences

### Workbench

Collections define repeatable protocol tasks. Environments hold endpoint/configuration values and secret references. A task can call a local scenario or a deliberately scoped external test target. Request authoring is specialized around authentication flows; general API-client breadth is not an MVP goal.

### Protocol packs

A protocol pack owns message parsing/serialization, state machines, protocol-specific cryptography and validation, role/profile metadata, attacks, and assertions. Candidate packs include OAuth/OIDC and JOSE, SAML, WebAuthn, LDAP/Active Directory, and Kerberos.

### Observation and evidence

A shared exchange envelope provides event ordering, actors, timestamps, raw/normalized views, redaction labels, assertions, and links to evidence. Protocol-specific fields and decision semantics remain available to the pack and UI.

### Scenario control plane

The control plane creates a versioned run, checks its declared capabilities, starts and stops targets, executes named steps, records evidence, and resets or destroys state. It does not own end-user identity records, production credentials, or a general policy engine.

### Scenario runner

The runner hosts the synthetic IdP/client/RP/directory/KDC/attacker fixtures that a pack requires. It enforces target images, per-run networks, resource/time limits, no-egress defaults, loopback ports, cleanup, and reset.

## Product data

The main entities are protocol packs, collections, environments, scenario definitions, scenario instances, exchanges, assertions, evidence, and reports. Identity-like objects (principal, credential, session, token, group, policy) exist as protocol data or synthetic target state, not as shared platform-owned identity data. See the [domain model](domain-model.md) and [data design](database-design.md).

## Run flows

### Execute a collection

```text
User selects collection/environment
  -> validate pack/profile and target scope
  -> create scenario/run
  -> execute protocol steps
  -> collect raw events
  -> redact and normalize
  -> evaluate assertions
  -> display/export report
  -> reset/destroy run
```

### Run an attack exercise

```text
User chooses named mutation
  -> runner confirms target is an isolated vulnerable fixture
  -> attacker and target interact on scenario-private network
  -> observation captures outcome and evidence
  -> same collection runs against secure fixture
  -> comparison explains control effect
  -> reset removes target state and temporary keys
```

### Test an external system

```text
User selects external test target and authorized scope
  -> show hosts, methods, and test family
  -> apply constrained active checks
  -> capture/redact exchange
  -> stop on scope violation or user request
  -> export report without credentials
```

External testing is deferred until the local safety boundary is mature. Passive artifact import and parsing remain distinct from active network tests.

## Shared platform versus pack-owned behavior

| Shared platform | Protocol pack |
|---|---|
| Collections and environment lifecycle | Wire formats and serializers |
| Scenario create/start/stop/reset/destroy | Protocol state machines and actors |
| Capability/resource enforcement | Protocol cryptography and validation |
| Event ordering and redaction envelope | Attack mechanics and protocol-specific assertions |
| Report/export and audit metadata | Role/profile requirements and limitations |
| Common timeline and evidence UI | Protocol-specific renderers and explanations |

## Safety architecture

Scenario definitions declare an immutable image/version, synthetic seed, ports, internal services, allowed operations, resource/time limits, observation channels, redaction behavior, and reset/destruction policy.

Default posture:

- no Internet or host-network egress from a vulnerable target;
- no host filesystem mount or runtime socket in a target;
- a distinct private network and ephemeral state per run;
- loopback-only published ports;
- bounded CPU, memory, processes, payload size, and run duration;
- synthetic credentials and short-lived keys;
- explicit stop, reset, and destroy controls.

A local container is useful for a single-user development MVP but must not be described as a hardened multi-tenant boundary. Shared-host or hosted hostile workloads require a separate design using a stronger sandbox boundary, network policy, resource controls, monitoring, patching, and abuse response.

## MVP architecture

1. Versioned pack/collection/environment/run/exchange/assertion/report contracts.
2. Local OAuth authorization-code + PKCE client, authorization server, callback, and resource server.
3. OIDC discovery and ID-token validation outcomes.
4. JWT/JWS/JWE inspect/build/verify tasks with explicit key and algorithm policy.
5. One shared, redacted trace/evidence UI.
6. At least one paired OAuth attack/secure scenario and one paired JWT/key-handling scenario.
7. Prebuilt local targets with scenario reset and defined safety limits.

The existing deterministic OAuth and synthetic SAML traces are stepping stones. A synthetic trace is not equivalent to a live local protocol exchange or conformance result.

## Decisions to make against the MVP

- Collection and pack descriptor format.
- Local secret store/reference design.
- Runner compatibility across supported desktop operating systems.
- Exact OAuth/OIDC implementation roles and profile.
- Local run-history storage, if users need it.
- Stronger sandbox requirements before any hosted execution.
