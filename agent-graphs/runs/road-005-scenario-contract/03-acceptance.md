# D3 — Acceptance and risk map

## Acceptance

1. A descriptor has an explicit contract version, immutable scenario identity
   and content version, module identity/version, module-owned scenario/variant
   references, data profile, bounded capability requests, and resource profile.
2. The sample OAuth descriptor references the existing `missing-pkce` module
   scenario ID and contains no OAuth request/response semantics that belong to
   the module. Step/check/evidence/redaction references are clearly marked
   illustrative because the current module has no exported IDs or registry;
   tests must not claim those references resolve.
3. Descriptors contain no credentials, raw protocol messages, arbitrary shell
   commands, arbitrary host paths, or unrestricted URLs. Capability requests
   name scenario-owned resource/target IDs and bounded ports/operations.
4. Validation rejects unsupported contract/module versions, missing required
   references, unknown steps/checks, duplicate IDs, malformed limits, and
   capability requests exceeding ROAD-004 policy. The result identifies
   errors without echoing secret-bearing inputs.
   Executable mode requires an immutable artifact ID/version/digest resolved
   through platform-managed approved-source policy; synthetic mode has no
   executable artifact.
5. A requested capability and an authorized grant are distinct values. The
   control plane computes grants from policy; descriptor content cannot
   escalate them. Grant denial blocks start or the affected operation.
6. The lifecycle defines operation preconditions, run states, repeated-call
   behavior, reset epoch semantics, stop cleanup, terminal destruction, and
   failure/cleanup outcomes for start/execute/observe/verify/reset/stop/destroy.
7. Evidence and verification results are versioned, scoped to a run/module
   check, bounded, and linked by opaque references. Results are `pass`, `fail`,
   `inconclusive`, or `error`; they do not claim full protocol validation.
8. Redaction policy is owned by the module for protocol semantics and applied
   before data crosses the run boundary; shared infrastructure owns enforcement
   and output bounds.
9. Root glossary, architecture, and backlog use the same terms. ROAD-005 does
   not select runtime technology or claim that ROAD-004 requirements are
   implemented.

## Risks

- **Schema overreach:** too many generic protocol fields flatten semantics;
  keep protocol-owned identifiers opaque to control plane.
- **Capability confused with grant:** a descriptor could become self-authority;
  keep request/grant separate and bind grants to one run.
- **Lifecycle ambiguity:** reset/stop/destroy can leak run state; specify
  preconditions, cleanup result, idempotence, and poisoned-run behavior.
- **Unbounded extensibility:** arbitrary command, URL, path, or module-defined
  free-form fields bypass ROAD-004; descriptors allow only typed bounded
  references.
- **Evidence overclaim:** verification may be mistaken for standards or real
  provider validation; make module/check scope explicit.
