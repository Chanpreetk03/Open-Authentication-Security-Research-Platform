# Product Architecture

## Purpose

This document defines the first product-level architecture for the platform.
It explains how Authentication Lab, Protocol Studio, Cybersecurity Principles
Academy, and the Reference Identity Engine fit together in a local-first
modular monolith.

The Authentication Lab is specifically a protocol workbench. Its architecture
for adding OAuth/OIDC, SAML, LDAP, Kerberos, MFA, and passkeys is described in
the [protocol lab architecture](protocol-lab-architecture.md).

The architecture optimizes for four things:

- observable protocol behavior;
- safe, resettable attack exercises;
- reusable identity and security concepts;
- a clear path from learning experience to executable verification.

It does not define a production multi-tenant IAM architecture.

## Architectural shape

The initial product is one deployable application with explicit internal
modules and a separate lab execution surface:

```text
                         Learner / Developer / Educator
                                      |
                         Web application and Studio UI
                                      |
                         Platform application interface
                                      |
       +----------------+-------------+------------------+
       |                |                                |
  Learning         Protocol                         Lab control
  experience       observation                      and safety
       |                |                                |
       +----------------+-------------+------------------+
                                      |
                         Reference identity engine
                                      |
                     PostgreSQL / local durable state

                    controlled execution seam
                                      |
                         Lab runtime / scenario
                         vulnerable or secure target
```

The application owns orchestration, learning content, protocol traces,
identity-domain behavior, and audit records. A lab is an execution unit with
its own state and capabilities; it is not allowed to become an alternate path
into the host or the application database.

## Product slices

### Authentication Lab

The Lab is responsible for protocol learning, scenario lifecycle, and safe
execution:

- create a scenario from a versioned definition;
- provision synthetic identities, keys, clients, and target applications;
- start, pause, reset, and destroy a scenario;
- expose only declared scenario endpoints and observations;
- run attack and verification steps against the scenario;
- return redacted traces and evidence to the learning interface.

Each protocol is a first-class module with concepts, readable implementation,
wire observation, secure and vulnerable variants, attack exercises, and
verification. The Lab control plane uses a protocol-neutral interface so new
protocols do not require redesigning scenario lifecycle or trace storage.

The Lab does not own general identity policy. It consumes the Reference
Identity Engine through a narrow scenario adapter and may replace that adapter
with a deliberately vulnerable implementation inside an isolated scenario.

### Protocol Studio

Studio is an observation and explanation surface. Its core interface is a
normalized protocol exchange rather than protocol-specific UI code:

```text
ProtocolExchange {
  exchange_id
  protocol
  participants
  messages[]
  security_claims[]
  redactions[]
  timestamps
  outcome
}
```

Protocol adapters translate OAuth/OIDC, JWT, SAML, LDAP, and Kerberos events
into this model. The adapter owns parsing and protocol-specific details; the
Studio interface owns ordering, filtering, redaction display, and explanation.

This is a deep module: callers should not need to understand every wire
format to render a flow, compare a vulnerable and secure exchange, or attach a
verification result.

### Cybersecurity Principles Academy

Academy content is executable learning material, not merely documentation. A
module consists of:

- principle and learning objectives;
- conceptual explanation;
- runnable example;
- vulnerable or failed behavior;
- secure implementation or mitigation;
- verification exercise;
- explanation of the observed evidence.

Academy modules invoke Lab scenarios and Studio observations through stable
interfaces. They do not directly manipulate scenario containers, credentials,
or database records.

### Reference Identity Engine

The Engine provides reusable sandbox identity capabilities:

- principals, identities, credentials, groups, and external identities;
- authentication and credential verification;
- sessions and token metadata;
- roles, permissions, policies, and authorization decisions;
- federation configuration;
- audit events.

Authentication and authorization remain separate modules. Authentication may
establish a principal and issue a session or token; authorization answers
whether that principal can perform an action on a resource in context.

The Engine is a reference implementation behind the Lab and Studio. Its
interface must remain small enough that a scenario can substitute a secure or
vulnerable adapter without changing the learning experience.

## Internal modules and seams

The first implementation should use these internal modules:

| Module | Owns | External interface |
|---|---|---|
| Scenario catalog | Definitions, versions, capabilities, learning metadata | Get scenario definition and prerequisites |
| Scenario lifecycle | Provision, start, reset, stop, destroy | Operate on a scenario handle |
| Scenario execution | Controlled commands, attack steps, verification | Run a declared step and return evidence |
| Protocol observation | Capture, normalize, redact, order traces | Record and query protocol exchanges |
| Identity engine | Identity, credentials, sessions, tokens | Authenticate, authorize, inspect sandbox state |
| Learning catalog | Principles, lessons, exercises, explanations | Resolve learning content and progress |
| Audit | Security-relevant and control-plane events | Append and query audit events |

Each row is a module, not necessarily a process. A seam is justified when the
implementation can vary, such as secure versus vulnerable scenario targets or
one protocol parser versus another. A seam should not be introduced only to
mirror a future microservice.

## Data ownership

PostgreSQL is the initial durable store where persistence is needed. Ownership
is logical even while tables share one database:

- Identity Engine owns sandbox identities, credentials, sessions, tokens,
  policies, and federation configuration.
- Scenario modules own scenario definitions, instances, seed versions, and
  reset state.
- Protocol observation owns traces, normalized exchanges, redaction metadata,
  and verification evidence.
- Learning catalog owns principles, lessons, exercises, and content versions.
- Audit owns append-only security and control-plane events.

Modules access another module through its interface rather than shared model
objects. Database-level separation can be added when a concrete isolation or
ownership need appears.

Sensitive values are minimized. Passwords, private keys, bearer tokens, and
raw credentials are never returned as ordinary trace fields. Trace retention,
redaction, and scenario destruction are explicit policies rather than UI
behavior.

## Main flows

### Run a learning exercise

```text
Learner
  -> Learning catalog: select exercise
  -> Scenario lifecycle: create from versioned definition
  -> Scenario execution: run learner/attack step
  -> Protocol observation: capture and redact exchanges
  -> Verification: evaluate expected evidence
  -> Learning catalog: show explanation and next step
```

### Inspect an authentication flow

```text
Protocol target
  -> Protocol adapter: parse protocol events
  -> Protocol observation: normalize and redact
  -> Studio: render exchange and trust assumptions
  -> Learner: inspect claims, messages, failures, and evidence
```

### Make a control-plane change

```text
UI/API -> authorization -> lifecycle or catalog module
     -> audit append -> result
```

All scenario lifecycle and administrative operations are authorized and
audited. A trace is evidence about a scenario, not proof that a real external
identity or production system was changed.

## Lab safety architecture

The lab execution seam is the strongest isolation seam in the product.
Scenario definitions declare:

- allowed network destinations;
- exposed ports and protocol targets;
- synthetic seed data;
- resource limits and timeouts;
- permitted attack operations;
- observation channels;
- reset and destruction behavior.

The default posture is no access to the host network, host filesystem, real
credentials, or unrelated scenarios. Secure and vulnerable targets use
different execution paths and are labeled in scenario metadata. The platform
must refuse an undeclared capability rather than relying on the lesson author
to behave safely.

## MVP architecture

The first vertical slice should include:

1. scenario catalog and lifecycle with deterministic reset;
2. one OAuth/OIDC scenario with secure and vulnerable variants;
3. normalized protocol exchanges with redaction;
4. JWT inspection as a Studio tool;
5. one Academy exercise connecting an attack, mitigation, and verification;
6. the smallest identity-engine capabilities required by those flows;
7. auditable control-plane operations.

The MVP should not include a general connector marketplace, hosted multi-
tenancy, enterprise provisioning, or a broad policy engine.

## Decisions still required

- Choose the first execution adapter: local process, container, or sandbox
  runtime.
- Define the scenario manifest format and capability policy.
- Decide whether traces are event-sourced, stored as exchange documents, or a
  combination of both.
- Define the first public application interface between the web layer and
  internal modules.
- Specify the secure/vulnerable implementation packaging and build checks that
  prevent accidental cross-imports.

These decisions should be made against the first OAuth/OIDC vertical slice,
not in isolation.
