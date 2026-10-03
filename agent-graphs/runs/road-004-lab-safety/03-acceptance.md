# D3 — Acceptance and risk map

## Acceptance

1. Requirements cover every ROAD-004 topic and define the default as no host,
   control-plane, sibling-run, real-credential, general-egress, or
   host-published inbound capability. The platform may create only private,
   bounded per-run root/scratch/network resources needed by a declared lab.
2. Every capability request is validated by the control plane and enforced
   outside untrusted code. Inbound and outbound endpoint allow rules identify
   protocol/port and scenario peers; denied host, unlisted, redirect, DNS
   rebinding, and unauthorized listener probes have explicit pass outcomes.
3. Data requirements prohibit real credentials and production identities,
   define synthetic per-run values, and prevent raw sensitive values from
   entering traces, audit events, logs, or persisted storage by default.
4. CPU, memory, process count, writable storage, output, concurrency, and wall
   time have enforceable per-run and aggregate caps. Tests record measured
   values and adapter tolerances below/at/above each configured limit. Exact
   platform maxima remain a ROAD-006 input; missing or unenforceable caps block
   start.
5. Scenario isolation covers process, network, filesystem, identity/secrets,
   writable state, and resource allocations. Cross-run probes fail; an
   unauthorized run cannot consume another run's allocated quota.
6. Trace retention defaults to no durable retention. Restart terminates active
   ephemeral runs and deletes their data. Redaction occurs before persistence/
   export; an owning run may display only allowlisted synthetic teaching values.
7. Lifecycle actions and policy decisions have ordered, auditable metadata
   without secrets. Audit failure refuses/stops execution. Reset is
   deterministic and isolated; destroy and cleanup are idempotent and bounded.
8. Startup, policy, timeout, crash, reset, and cleanup failures fail closed:
   no fallback to host execution or unrestricted networking; uncertain cleanup
   taints the runtime and blocks reuse.
9. Requirements include provenance/integrity checks for executable artifacts;
   unknown tag, changed digest, missing provenance, and unapproved source fail
   before start without requiring an unspecified signature format.
10. Requirements cite sources or record explicit project-policy rationale,
    distinguish policy semantics from ROAD-005 descriptor/lifecycle details,
    and link ROAD-006 adapter/proof ownership. ROAD-004 does not choose a
    runtime or claim a safety proof.

## Risks and response

- **Container confidence without isolation proof:** require negative tests and
  document residual risk, including shared-kernel concerns; leave final adapter
  selection to ROAD-006.
- **SSRF and name resolution bypass:** enforce target policy at a controlled
  network boundary after resolution; test disallowed addresses and redirects.
- **Secret leakage through traces or audit:** minimize collected fields, apply
  protocol-aware redaction before persistence, and test sentinel secrets across
  all output paths.
- **Reset/cleanup failure contaminates later runs:** treat uncertain state as
  poisoned and refuse reuse; make cleanup repeatable and observable.
- **Unmeasured limits:** require hard configured ceilings and resource tests;
  select numeric platform defaults against the chosen runtime and scenario in
  ROAD-006 rather than inventing workload values here.
- **False validation claims:** current labs remain synthetic; do not promote
  them to executable until ROAD-006's isolation and lifecycle exit gate passes.

## Evidence

Repository facts are mapped in `02-code-map.md`. External primary-source
guidance and any source-derived recommendations are recorded in
`docs/research/lab-safety-control-guidance.md`.
