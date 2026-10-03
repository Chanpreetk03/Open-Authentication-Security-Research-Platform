# Product Domain Context

This file is the shared glossary for the authentication protocol workbench and
its local learning sandbox. It defines product concepts without prescribing
runtime implementation.

## Lab concepts

- **Protocol module:** owns one protocol's actors, message semantics, secure
  and vulnerable variants, exercise steps, and verification checks.
- **Scenario definition:** a protocol-module-owned description of one
  teachable setup and its protocol-specific behavior. It contains meaning, not
  platform authority.
- **Scenario descriptor:** a versioned declaration that references a protocol
  module and scenario definition, identifies the intended variant and
  synthetic-data profile, and requests bounded platform capabilities. A
  descriptor requests access; it never grants access.
- **Capability request:** a scenario's statement of the narrowly bounded
  resources or operations it needs. The control plane may reject or constrain
  it.
- **Capability grant:** the platform's policy decision authorizing a subset of
  requested capabilities for one scenario run. The runtime enforces the grant.
- **Scenario run:** one isolated, temporary instance created from a validated
  descriptor. Its state, synthetic secrets, trace, and resource budget are
  scoped to that run.
- **Exercise step:** a protocol-module-defined action a learner may request
  against a running scenario. The control plane checks that the step is
  declared and authorized; the module defines its protocol meaning.
- **Evidence:** bounded, structured observations produced by a scenario or
  module. Evidence describes that run; it is not proof about a real provider or
  production system.
- **Verification result:** a scoped outcome for a named module-defined check,
  linked to evidence. `pass`, `fail`, `inconclusive`, and `error` are distinct;
  a result does not imply full standards conformance unless explicitly tested.
- **Trace:** an ordered set of observations for one run, with sensitive fields
  redacted or omitted before it leaves the run boundary.

## Lifecycle language

- **Start** creates an isolated run from a valid descriptor.
- **Execute** requests one declared exercise step while that run is active.
- **Observe** reads the run's available redacted trace/evidence.
- **Verify** evaluates a declared check and returns a scoped result.
- **Reset** discards run state and provisions a clean run epoch from the same
  scenario definition.
- **Stop** refuses new work, revokes the run grant, and removes run resources,
  traces, evidence, and run-scoped secrets. It retains only bounded descriptor
  and audit metadata until destroy; cleanup uncertainty quarantines the worker.
- **Destroy** terminates and removes the run and its temporary resources.

The scenario run is the lifecycle subject. A descriptor is versioned and
validated separately; resetting a run does not rewrite the descriptor.
