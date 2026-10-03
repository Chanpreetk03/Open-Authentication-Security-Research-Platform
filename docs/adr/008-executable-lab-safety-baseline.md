# ADR-008: Fail-closed safety baseline for executable labs

- **Status:** Accepted
- **Date:** 2026-10-03
- **Decision owner:** Product owner

## Context

The product includes synthetic authentication attack exercises and may later
introduce intentionally vulnerable executable scenarios. The repository does
not currently demonstrate a general-purpose isolated execution runtime. The
existing threat model identifies SSRF, privilege escalation, token theft, and
other relevant threats but does not specify testable execution controls.

ROAD-004 requires a safety baseline before ROAD-005 defines a scenario
contract or ROAD-006 selects and proves an execution boundary. Primary-source
guidance is summarized in
[`lab-safety-control-guidance.md`](../research/lab-safety-control-guidance.md).
The normative controls are in
[`lab-safety-requirements.md`](../security/lab-safety-requirements.md).

## Decision

1. **Default deny:** executable scenario code is treated as hostile. The
   runtime grants no host, control-plane, other-run, real-credential, device,
   or general-egress capability by default. The platform may create a private
   read-only scenario root, bounded per-run scratch, and an isolated private
   target network. These are platform-created resources, not host mounts or
   general network access. A missing, malformed, unsupported, or unenforceable
   policy prevents execution.
2. **Local synthetic targets only:** scenarios use synthetic data and
   scenario-owned targets. General internet, host, production, and arbitrary
   user-supplied target access are prohibited. Any future external-target mode
   requires a separate product-owner decision and threat review.
3. **Hard isolation and budgets:** per-run process/security identity, network,
   writable state, secrets, resource ceilings, and wall-clock limits are
   enforced outside scenario code. No scenario can raise its own limits.
4. **Fail closed and quarantine:** enforcement, audit, timeout, reset, or
   cleanup uncertainty stops the run; the worker/runtime is not reused until
   recovery is independently verified. No fallback to host execution or
   unrestricted networking is allowed.
5. **No durable trace retention by default:** collect the minimum needed,
   redact before persistence/export, keep active traces ephemeral, and remove
   run data at destruction. Any future persistence/export policy needs a
   separate decision before implementation.
6. **Proof before enablement:** no executable vulnerable target, user-authored
   lab, or network-enabled scenario ships until the selected adapter maps every
   requirement to a control and repeatable positive, negative, and failure-path
   tests. ROAD-006 owns runtime choice and residual-risk proof; ROAD-005 owns
   descriptor and lifecycle contracts.
7. **No claims from requirements:** documenting controls does not mean they are
   implemented or that the current synthetic labs are isolated runtimes.

The exact global numeric resource ceilings and supported host/runtime matrix
are deliberately deferred to ROAD-006. Every scenario still requires explicit
enforceable hard ceilings; omitted or unsupported ceilings deny startup.

## Consequences

- Current attack exercises remain synthetic and non-executable until the
  ROAD-006 exit gate passes.
- ROAD-005 descriptors must express only the capabilities the runtime can
  enforce; application-level declarations alone are insufficient.
- ROAD-006 must evaluate shared-kernel/container residual risks, failure
  recovery, and platform differences rather than equating a container with a
  complete security boundary.
- This baseline favors containment over convenience and excludes arbitrary
  provider testing, production credentials, and general request replay.
- Real user expectations, demand, and usability remain unknown; the synthetic
  panel is an internal critique only.

## Alternatives considered

- **Select a container runtime now:** rejected; requirements must constrain the
  comparison, and a container alone does not prove isolation.
- **Permit an online mode behind URL validation:** rejected; application-level
  URL checks do not enforce network reachability and can be bypassed by
  redirects or DNS behavior.
- **Allow scenario authors to choose capabilities and limits:** rejected;
  declarations are inputs to enforcement, not enforcement themselves, and
  author control cannot override platform ceilings.
- **Persist traces by default for convenience:** rejected; the project has not
  selected a data-retention purpose or policy, so default retention is zero.

## Implementation record

The normative requirements live in
[`docs/security/lab-safety-requirements.md`](../security/lab-safety-requirements.md).
ROAD-005 and ROAD-006 are the next implementation-independent and runtime-proof
gates. No runtime code is implemented by this ADR.
