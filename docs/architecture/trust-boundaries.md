# Trust Boundaries

The workbench handles untrusted protocol artifacts and deliberately vulnerable targets. Every pack and scenario must state what it trusts, what it executes, what data crosses a boundary, and how the user can stop and reset it.

## Core boundaries

- **User and workspace:** provides collections, environment configuration, pasted artifacts, and authorization for external test targets.
- **Workbench UI:** displays protocol data and accepts user input; it must distinguish parse, verification, conformance, and target decisions.
- **Control plane:** validates requested actions, target scope, capabilities, lifecycle, budgets, and audit events.
- **Scenario runner:** executes local peers/targets and enforces network, filesystem, resource, time, and cleanup policies.
- **Scenario target:** secure or intentionally vulnerable protocol actor with synthetic identities, credentials, keys, and state.
- **External test system:** a user-selected, authorized issuer, RP/SP, directory, or API; it is outside the platform's ownership.
- **Host and other runs:** must not be reachable from a vulnerable scenario.
- **Trace and export:** potentially sensitive until redaction has been applied.

## Safety rules

- Local vulnerable labs use synthetic data and resettable per-run state.
- No target receives host filesystem mounts or access to the container runtime socket.
- Scenario networks are isolated; Internet egress is denied by default.
- Published lab ports bind to loopback and resources/time are bounded.
- Active external tests require explicit target and operation scope and an authorization confirmation.
- A stop action must terminate the run; reset/destroy must remove its state and temporary credentials.
- Trace redaction occurs before persistence/export; secrets never appear as normal event fields.
- Shared or hosted hostile workloads require a stronger, separately reviewed isolation design.

## Boundary review for every pack

Document:

1. Target and initiator for each exchange.
2. Trust assumptions and validation performed.
3. Secrets, artifacts, and claims that cross boundaries.
4. Network destinations and allowed operations.
5. Resource limits, stop/reset behavior, and failure modes.
6. What happens if a target is compromised or unavailable.
