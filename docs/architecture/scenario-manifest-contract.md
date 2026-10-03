# Scenario Descriptor and Lifecycle Contract

**Status:** ROAD-005 design contract complete. Its JSON example remains a
candidate representation, not an implemented schema, lifecycle service, or
runtime adapter. Runtime selection and enforcement proof remain ROAD-006
gates. See the shared
[domain glossary](../../CONTEXT.md), [ROAD-004 safety requirements](../security/lab-safety-requirements.md),
and [ADR-008](../adr/008-executable-lab-safety-baseline.md).

## Ownership

- A **protocol module** owns scenario definitions, protocol/variant semantics,
  exercise-step IDs, verification-check IDs, generated data shape, and
  protocol-specific evidence/redaction metadata.
- The **scenario descriptor** references those module-owned IDs and requests
  bounded platform resources. It contains no protocol state machine or raw
  OAuth/SAML messages.
- The **control plane** validates descriptor/module versions, checks policy,
  creates an authorized per-run grant, serializes lifecycle operations, and
  records audit metadata. Descriptor requests never authorize themselves.
- The **runtime adapter** constructs only policy-approved per-run resources
  from that grant and enforces the ROAD-004 boundary. Only the adapter may
  create or tear down processes, networks, storage, and other isolated runtime
  resources. A protocol module initializes and runs protocol state inside an
  adapter-created run; it cannot create resources or expand the grant.
- The **evidence boundary** applies shared size limits and module-owned
  redaction rules before trace data leaves the isolated run.

ROAD-005 fixes contract meaning and validation behavior. JSON is used for the
checked-in example, but it is not a finalized wire encoding or deployed schema.
Descriptor field names for every future module, actor identity representation,
and lifecycle API transport remain open.

## Candidate descriptor example

The [OAuth descriptor fixture](../../web/src/contracts/scenario-descriptor.oauth.example.json)
is the single checked-in sample; its focused contract assertions are in
[scenario-descriptor.test.ts](../../web/src/contracts/scenario-descriptor.test.ts).
The example's `protocol-simulation-small` resource profile is illustrative,
not a profile currently implemented by the platform.

The sample's `scenarioRef.id` value `missing-pkce` matches the current Go
constant `ScenarioMissingPKCE` in `backend/internal/oauthoidc/flow.go`. The
module ID/version and exercise-step, check, evidence-schema, and redaction
references are illustrative: the current module has no registry or exported
IDs for them. The fixture test checks their shape, not resolution. The example
has no artifact image or network target because it describes a synthetic
trace simulation.

An executable descriptor would additionally include an artifact reference
such as the following; this remains illustrative until ROAD-006 proves the
trusted-source and digest checks:

```yaml
execution:
  mode: executable
  artifactRef:
    id: oauth-lab-target
    version: 1.0.0
    digest: sha256:<content-digest>
```

For `execution.mode: executable`, the descriptor additionally requires an
`artifactRef` with immutable artifact ID/version and content digest. That
reference resolves only through a platform-managed approved-source policy; a
descriptor cannot supply an image URL, registry credential, pull command, or
new trust root. Synthetic mode has no executable artifact. Exact digest
algorithm and source-verification mechanism are adapter-proof details for
ROAD-006.

## Descriptor validation

Before a run is created, validation MUST:

1. recognize `apiVersion` and `kind`, and reject unsupported contract versions;
2. resolve the exact module and version and ask that module to validate the
   scenario, variant, step, evidence-schema, redaction, and check references;
3. require an immutable artifact reference and digest for executable mode,
   resolve it against platform-managed trusted-source policy, and reject an
   artifact whose provenance cannot be verified;
4. reject duplicate/ambiguous IDs, missing required fields, raw credentials,
   unknown free-form executable fields, arbitrary commands/URLs/host paths,
   and unbounded lists/payloads;
5. validate each typed capability request against ROAD-004 and platform policy;
6. produce a bounded validation result with stable error codes and field paths,
   without echoing secret-bearing values;
7. refuse to start when any requested capability is unsupported or cannot be
   enforced. A partial grant is allowed only when the module declares the
   capability optional and the resulting scenario remains valid.

The descriptor is immutable for a run. A change to its content creates a new
descriptor version and is revalidated.

## Capability requests and grants

`capabilityRequests` describe maximum need using typed references, not raw
authority. For executable scenarios, requests can point to module-declared
target/listener IDs, exercise operation IDs, an approved synthetic-data
profile, a bounded scratch profile, and a platform-defined resource profile.
They MUST NOT contain host paths, arbitrary URLs, runtime flags, image-pull
commands, environment secrets, or a user-selected privilege level.

The control plane computes a separate `CapabilityGrant` for one run after
descriptor and platform policy validation. The grant records the approved
subset, policy version, descriptor digest, expiry/limits, and target identities.
The descriptor cannot edit or reuse another run's grant. Runtime setup fails
closed if it cannot enforce the whole required grant. Exact numeric budgets,
target identity representation, digest algorithm, and adapter verification
mechanism are assigned to ROAD-006/implementation design.

## Scenario run lifecycle

The lifecycle subject is a `ScenarioRun`, identified by an opaque run ID and
bound to one descriptor version, grant, and reset epoch.

| State | Meaning |
|---|---|
| `provisioning` | Policy-approved resources are being created; no learner operation is accepted. |
| `ready` | Per-run controls are established; execution, observation, verification, reset, stop, and destroy may be requested subject to authorization. |
| `executing` | One declared step is in progress; observe may read a consistent trace snapshot. |
| `resetting` | Existing run state/secrets are being discarded and a clean epoch is created. |
| `stopping` | New operations are refused while active work and resources are terminated. |
| `stopped` | Execution and run resources are stopped and cleaned; run evidence, traces, and run-scoped secrets are erased. Descriptor and bounded audit metadata may remain until destroy. |
| `destroying` | All remaining run resources and ephemeral evidence are being removed. |
| `destroyed` | Terminal state; repeat destroy succeeds idempotently and other operations fail. |
| `failed` | Operation failed and cleanup was verified; run cannot resume. |
| `cleanup_unknown` | Cleanup could not be verified; worker/resources are quarantined and cannot be reassigned. |

Allowed operations and outcomes:

- **Start:** accepts a validated descriptor and policy decision; provisions a
  fresh isolated run. Success is `ready`; any partial provisioning is torn
  down. Uncertain teardown yields `cleanup_unknown` and blocks reuse.
- **Execute:** requires `ready` and a module-declared step. It binds inputs to
  the run, applies size/type constraints, and returns to `ready` on completion.
  Invalid or unauthorized steps are rejected without partial execution.
- **Observe:** reads a bounded snapshot by opaque cursor from
  `ready`/`executing`; it does not mutate protocol state. A module may return
  explicitly allowlisted synthetic teaching values in the run-scoped learner
  view permitted by LAB-07. Credentials and other secret fields remain
  redacted; teaching values never enter durable storage, exports, or audit.
- **Verify:** invokes a module-declared check against current run state/evidence
  and returns a result in the same run scope. It does not turn a synthetic
  simulation into a protocol-conformance claim.
- **Reset:** from `ready` or `stopped`, enters `resetting`; destroys prior
  mutable state and credentials and creates a clean epoch from the same
  descriptor. Success returns to `ready` with new per-run secrets. A failed or
  uncertain cleanup cannot return to `ready`.
- **Stop:** from `ready`/`executing`, refuses new work, terminates active
  children, revokes grants, and removes run resources, evidence, traces, and
  run-scoped secrets before `stopped`, consistent with LAB-11. Descriptor and
  bounded audit metadata may remain until destroy. Failure to prove cleanup
  yields `cleanup_unknown`.
- **Destroy:** from any nonterminal state, tears down resources and erases
  ephemeral state. It is idempotent for `destroyed`; cleanup uncertainty
  remains `cleanup_unknown` and blocks worker reuse.

Calls that conflict with the current state are rejected with a stable
state-conflict result. Lifecycle/control requests are authorized and audited
under ROAD-004. Exact actor/principal schema, concurrent request policy, and
remote API shape remain design details for later work.

## Evidence and verification results

Module evidence is bounded and addressed by opaque identifiers. A protocol-
neutral envelope contains run ID/epoch, module and schema versions, event
sequence, event type, time, and module-defined typed fields. The envelope does
not reinterpret OAuth, SAML, LDAP, or cryptographic semantics. Redaction occurs
before evidence is observable outside the run; credential fields are omitted
or represented by redaction metadata. The separate run-scoped learner view may
show only explicit synthetic teaching values allowlisted under LAB-07. Those
values are not reusable credentials and cannot enter traces, durable storage,
exports, or audit.

A verification result contains:

- check ID and check version owned by the module;
- run ID/epoch and evidence references;
- outcome: `pass`, `fail`, `inconclusive`, or `error`;
- a bounded, redacted explanation and optional stable finding IDs.

The result scope is only the named check against the referenced synthetic run.
It does not claim complete protocol validation, real-provider interoperability,
or security outside that run.

## Compatibility and failure rules

- Contract, module, descriptor, evidence, and check versions are explicit; an
  unsupported required version refuses start rather than silently coercing.
- Optional fields may be ignored only when the contract marks them optional
  and doing so cannot weaken policy or change the meaning of the exercise.
- No unknown capability is ignored or granted. No schema fallback bypasses
  ROAD-004.
- Audit, policy, redaction, resource enforcement, and cleanup failures fail
  closed. Current synthetic simulations may return module errors, but they do
  not claim the runtime failure states are implemented.
