# Executable Lab Safety Requirements

**Status:** approved requirements baseline for future design; no runtime is
selected or proven. These controls gate any executable vulnerable target,
user-authored lab, or network-enabled scenario. Current SAML labs remain
synthetic simulations as recorded in the [capability inventory](../product/capability-inventory.md).

This document is the implementation-independent source of truth for ROAD-004.
The selected project policy is recorded in [ADR-008](../adr/008-executable-lab-safety-baseline.md).
Primary-source guidance and source-to-policy mapping are in
[`lab-safety-control-guidance.md`](../research/lab-safety-control-guidance.md).
Scenario declarations and lifecycle details belong to ROAD-005; runtime
selection, quantitative defaults, prototype, and isolation proof belong to
ROAD-006.

## Scope and threat boundary

Treat scenario code, scenario inputs, protocol messages, and vulnerable targets
as hostile. A scenario may be intentionally exploitable and may be compromised
by the learner. The security objective is to confine that compromise to one
synthetic scenario and protect the host, control plane, other scenarios, stored
data, and unapproved network targets.

The attacker may control crafted protocol messages, exercise choices, and any
vulnerable target code exposed by a lab. The design must account for SSRF,
redirect and DNS-rebinding bypasses, path traversal, privilege escalation,
resource exhaustion, secret exfiltration, trace/log injection, and failure to
clean up. This extends the repository's [threat model](threat-model.md) and
[trust boundaries](../architecture/trust-boundaries.md).

The runtime is a separate trust boundary. A manifest declaration is not itself
an enforcement control. Enforcement must be outside untrusted scenario code,
default-deny, and testable through denied-path probes.

## Normative project requirements

“MUST”, “MUST NOT”, and “SHOULD” describe this project's required baseline.
An exception to a MUST requires a recorded product-owner decision, an explicit
scope/risk assessment, and a new verification plan before implementation; it
does not silently widen the default runtime.

| ID | Requirement | Enforcement and acceptance evidence |
|---|---|---|
| LAB-01 | **Default deny with platform-created private resources.** A scenario MUST receive no host, control-plane, other-run, device, real-credential, or general-egress capability. The platform MAY create a private read-only root and bounded per-run scratch storage; it MAY create an isolated network containing only scenario-owned targets. Those resources are not host mounts or general network access. A scenario declaration requests capabilities but cannot grant authority; the control plane validates it and the adapter constructs the permitted resources. ROAD-004 defines these policy semantics only; ROAD-005 chooses descriptor fields and lifecycle/API shape. Missing, malformed, unsupported, or unenforceable policy MUST prevent start. | Start the minimal local scenario with only its platform-created root and scratch. Confirm no host path, control-plane resource, sibling state, or undeclared destination is reachable. A malformed/unsupported request is rejected before scenario code starts. |
| LAB-02 | **Host and control-plane isolation.** Scenario code MUST NOT access host files, host processes, host credentials/environment, container/runtime sockets, device nodes, platform databases, control-plane credentials, or management APIs. Host filesystem mounts MUST NOT be writable by a scenario; default policy is no host mounts at all. | Place unique canary files/secrets outside the scenario; attempt reads, writes, process inspection, socket access, and control API access. Every attempt is denied and canaries remain unchanged. |
| LAB-03 | **Network allowlists and inbound isolation.** A scenario MUST have no general host or internet egress and no host-published listener. The platform MAY create a private scenario network. An outbound destination or inbound listener MUST name a scenario-owned target, exact protocol/port, and permitted scenario peers; the runtime/network boundary enforces both directions. Resolve and validate destinations at connection time; redirects, alternate IP encodings, DNS changes, and rebinding MUST NOT escape the declared set. Host, control-plane, metadata-service, link-local, and unlisted destinations are always denied. Loopback is allowed only inside the isolated namespace for a declared target. No arbitrary URL or production target is permitted. | From the scenario, attempt unlisted ports/hosts, redirect escape, DNS rebinding, alternate address forms, host/control-plane/metadata addresses, and internet egress; all fail. From the host and an unrelated run, attempt every declared listener; all fail. From an authorized peer in the same scenario network, only the declared target tuple succeeds. Confirm no host port is published and policy cannot be bypassed by scenario code. |
| LAB-04 | **Synthetic data and credentials.** Identities, passwords, tokens, assertions, keys, certificates, and protocol messages MUST be generated for the scenario and MUST NOT reuse production/user credentials or host environment values. Secrets MUST be unique per run, scoped to that run, and invalidated at teardown. | Seed synthetic sentinel values; assert no host environment or real credential source is mounted/read. Start two runs and verify secret/state separation; after teardown, old credentials cannot access a later run. |
| LAB-05 | **Resource and time ceilings.** Every runnable scenario MUST have enforceable hard per-run and aggregate ceilings for CPU, memory, process/thread count, writable bytes, output/trace bytes, concurrency, and wall-clock duration. The scenario MUST NOT be able to raise its own ceilings. If a limit is absent, unsupported, or cannot be enforced, start is denied. Numeric global maxima and per-platform enforcement tolerances are selected in ROAD-006 and MUST be bounded by a documented workload and host-risk rationale. | For each dimension, run below, at, and above the configured limit; above-limit work is throttled or terminated within the documented enforcement tolerance and grace period. Record the measured value and adapter resolution for each dimension. Verify aggregate concurrency is capped, a timed-out run's child work is terminated, and allocated capacity is released. |
| LAB-06 | **Per-run isolation.** Every execution MUST have separate process/security identity, network scope, writable state, temporary secrets, and trace ownership. A scenario MUST NOT read, write, signal, attach to, or exceed its allocated resource share at the cost of another scenario or the control plane's writable state. No shared writable workspace is allowed between runs. | Run concurrent scenarios with unique canaries; probe cross-read, cross-write, process signaling/attachment, cross-network access, and attempts to exceed per-run/aggregate quotas. All unauthorized cross-run probes fail; stopping one run does not alter another. |
| LAB-07 | **Trace minimization and redaction.** Collect only fields needed for the learning objective. Redaction MUST occur before durable persistence, export, or access outside the runtime boundary. Protocol-aware rules MUST cover credentials, tokens, cookies, assertions, private keys, and configured secret fields. Unknown or unclassified sensitive payloads MUST be omitted or kept ephemeral; name-pattern detection alone is insufficient. Audit records MUST NOT contain raw secret material. A scenario MAY deliberately render its own synthetic teaching value only through an explicit, run-scoped learner view; this is not permission to persist or export it. | Put unique secret sentinels in headers, query parameters, bodies, assertions, environment values, and errors. Verify the owning isolated scenario can display only explicitly allowlisted synthetic teaching fields, while traces leaving that boundary, durable storage, exports, logs, and audit records contain no raw sentinels. Unknown fields are omitted by default. |
| LAB-08 | **Retention and deletion.** Trace and scenario data MUST remain ephemeral and in-memory by default and MUST be removed when a run is destroyed or its bounded retention period expires. Durable server-side trace retention is off by default. Any future persistence or export mode requires a separate explicit policy covering authorization, purpose, encryption, TTL, deletion, and audit before implementation. Under this baseline, a runtime/control-plane restart terminates active ephemeral runs and deletes their run data; restart does not silently convert ephemeral data to durable storage. | Verify no durable trace exists after destroy, expiry, restart, or failure cleanup, and the restarted service reports the run terminated rather than resumed. For any later approved persistence mode, test authorization, TTL expiry, deletion, and backup/cache coverage before enabling it. |
| LAB-09 | **Audit.** The control plane MUST record scenario creation/start/stop/reset/destroy, capability grants/denials, policy version, scenario/runtime version, actor or initiating service, timestamps, and outcome. Audit storage MUST be outside scenario control and protected from scenario modification. Records MUST be bounded and MUST exclude raw credentials, tokens, private keys, message bodies, and unredacted traces. Events for one run MUST have a monotonic sequence or equivalent ordering field. Audit unavailability MUST prevent start or stop an active run and trigger cleanup. | Verify allowed and denied actions produce run ID, sequence, timestamp, policy/version, action, and outcome. Attempt scenario mutation/deletion; inject oversized/malformed event data; confirm bounded protected records contain no sentinels. Inject audit-store failure before and during execution; start is refused or the run is stopped and cleaned up, with an out-of-band health failure signal. |
| LAB-10 | **Reset.** Reset MUST restore the declared initial state deterministically, rotate run-scoped secrets, remove generated state and prior trace data, and prevent reuse of stale sessions/caches. Reinitialization from a clean scenario image/state is preferred over best-effort in-place cleanup. Reset failure MUST destroy or quarantine the run, never report it as clean. | Run the same declared scenario twice from clean state and compare deterministic baseline evidence; verify old session/token/state fails after reset. Inject reset failure and verify the run cannot be reused. |
| LAB-11 | **Destroy and cleanup.** Destruction and cleanup MUST be idempotent, bounded, and applied on normal completion, explicit stop, timeout, crash, policy violation, and control-plane restart. Cleanup MUST remove processes, network attachments, temporary storage, secrets, and scenario-owned traces. | Invoke destroy repeatedly and at each termination path; verify resources are absent within the configured cleanup deadline. Restart the control plane during a run and verify orphan detection and teardown. |
| LAB-12 | **Failure behavior.** Startup uncertainty, policy service failure, resource monitor failure, audit failure, timeout, crash, or incomplete cleanup MUST fail closed. The system MUST stop or refuse the run, revoke its capabilities, and MUST NOT fall back to host execution, unrestricted networking, or an unisolated mode. Cleanup uncertainty taints the worker/adapter and blocks reassignment until independently recovered and verified. | Inject each failure at startup, during execution, and teardown; verify no scenario continues with reduced controls, no replacement is assigned before cleanup proof, and the failure is auditable without secrets. |
| LAB-13 | **Separation and labeling.** Secure reference code and intentionally vulnerable code MUST use separate execution paths and explicit scenario labels. Vulnerable code MUST NOT be imported into or run with control-plane privileges. | Build/import checks reject cross-imports; runtime identity/capability comparison shows vulnerable and control-plane processes have no shared privilege boundary. UI/API metadata identifies vulnerable scenarios before start. |
| LAB-14 | **Executable artifact integrity.** Before execution, scenario images/binaries MUST have immutable version identities and verified digests from an approved source. The runtime MUST reject unknown, mutable, or unverifiable artifacts and MUST NOT fetch executable code from an unapproved source at scenario start. Provenance fields and trusted-source policy are defined by ROAD-005/006; exact signature format is not fixed here. | Attempt to start an unknown tag, changed digest, missing provenance, or unapproved source; each is rejected before code starts. Verify the executed artifact digest matches the approved descriptor and recorded audit event. |

## Release gate

No executable vulnerable target, user-authored code, or general network-enabled
scenario may ship until all of the following hold:

1. A selected runtime maps every LAB requirement to an enforcing control and a
   repeatable test, including negative and failure-path cases.
2. ROAD-006 prototypes prove host/network/filesystem and inbound-listener
   denial, artifact provenance checks, resource limits, cross-run isolation,
   reset, teardown, and cleanup after failure on every supported platform.
3. Residual risks and unsupported platforms are explicit; any inability to
   enforce a MUST disables execution on that platform.
4. A final synthetic security/persona panel finds no unresolved critical
   blocker. Its result is internal critique, not proof of security or user
   validation.

Until this gate passes, current attack labs remain synthetic and
non-executable. ROAD-004 defines requirements; it does not demonstrate that
the current application enforces them.

## Decisions deferred

- Runtime adapter and host hardening mechanism: ROAD-006.
- Product-wide numeric ceilings and supported-platform matrix: ROAD-006,
  informed by a representative scenario and explicit host-risk budget.
- Versioned scenario manifest, capability declaration fields, and lifecycle
  API, including descriptor fields and state transitions: ROAD-005. ROAD-004
  fixes policy semantics and required evidence only; it does not prescribe
  field names, lifecycle choreography, actor representation, or UI/API shape.
- Any external/production target capability or durable trace retention:
  separate product-owner decision and new threat review; neither is enabled by
  this baseline.
