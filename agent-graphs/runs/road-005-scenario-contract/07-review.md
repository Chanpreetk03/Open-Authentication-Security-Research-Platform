# ROAD-005 Independent Skeptic Re-review

**Re-review verdict: PASS against the findings in the prior `07-review.md`.** The requested corrections are present and line up with ROAD-004. No remaining contract blocker was found in the fixes reviewed. **ROAD-005 is not ready to be marked complete yet:** the existing synthetic persona report (`08-persona-review.md`) still records the pre-fix candidate as REVISE and must be rerun/refreshed against this revision, as required by `04-plan.md`.

## Prior findings and closure evidence

| Prior finding | Current evidence | Result |
|---|---|---|
| Stop retained evidence contrary to LAB-11 and made it inaccessible. | `docs/architecture/scenario-manifest-contract.md:122,148–152` now says Stop removes resources, evidence, traces, and run secrets before `stopped`; `CONTEXT.md:46–48` and `docs/architecture/product-architecture.md:81–83` match. Observe is limited to ready/executing (`scenario-manifest-contract.md:136–140`), consistent with deletion after Stop. | Resolved |
| Existing module startup could bypass the control-plane grant. | `docs/architecture/protocol-lab-architecture.md:45,59–67` now passes opaque `grantedRunContext`; only the adapter creates runtime resources, and the module cannot create resources, select an artifact, or widen the grant. The contract ownership rules agree at `scenario-manifest-contract.md:17–24`. | Resolved |
| D3 treated illustrative step/check IDs as existing module references. | `03-acceptance.md:8–12` now confirms only the existing `missing-pkce` scenario ID and labels step/check/evidence/redaction refs illustrative. The contract says the same at `scenario-manifest-contract.md:41–46`. The new Go test (`backend/internal/oauthoidc/flow_test.go:16–39`) resolves the fixture ID using `Scenarios()`. Vitest now describes candidate reference fields and checks literal fixture shape (`web/src/contracts/scenario-descriptor.test.ts:5–12`); it does not claim registry resolution. | Resolved |
| ROAD-004 synthetic teaching-value exception was unclear against credential redaction. | LAB-07 remains the governing exception (`docs/security/lab-safety-requirements.md:50`). Contract `scenario-manifest-contract.md:136–140,168–172` now permits explicitly allowlisted synthetic teaching values in a separate run-scoped learner view while credentials remain redacted and teaching values cannot enter traces, durable storage, exports, or audit. | Resolved |
| Profile-name assertions could be mistaken for proving a bounded profile. | Contract `scenario-manifest-contract.md:38–39` says `protocol-simulation-small` is illustrative, not implemented. The test title now says only “declared synthetic capabilities” (`scenario-descriptor.test.ts:15–24`). D5/D6 explicitly say fixture tests are not a production schema validator or profile implementation. | Resolved; retain this distinction in future status claims |
| Scope/staging included unrelated generated or learning files. | The current workspace still has modified `web/tsconfig.tsbuildinfo` and untracked `go-learning/`; both remain outside ROAD-005 and should be excluded when staging. | Scope note; no contract blocker |

## Remaining graph-evidence issue

`agent-graphs/runs/road-005-scenario-contract/08-persona-review.md:10–15` still recommends REVISE based on the old sample IDs and stopped-evidence behavior. Its “must-fix” section (`:177–189`) likewise asks for corrections that are already reflected in the current contract and acceptance file. The review's purpose says it reviewed the pre-fix D1–D5 state (`:5–8`). Refresh this panel artifact against the current files before closing ROAD-005; do not treat its stale result as current approval or current critique.

## Evidence boundary and scope

- This is a pass on the candidate requirements and the prior skeptic findings, not a security proof.
- `scenario-manifest-contract.md:3–7,25–29` identifies a candidate design, not an implemented schema/service/adapter. `05-implementation.md:13–16,26–29` and `06-verification.md:8–12,23–36` state that Go/Vitest checks cover fixture structure and one existing scenario reference, not a runtime schema validator, ID registry, lifecycle, artifact resolver, or enforcement adapter.
- ROAD-006 still owns runtime selection and enforcement proof; the backlog remains in progress pending reviews and schema decisions (`docs/roadmap/backlog.md:101–113`).
- The contract, glossary, aligned architecture, fixture, and focused tests fit ROAD-005 scope. Keep `web/tsconfig.tsbuildinfo` and `go-learning/` out of its commit.

## Evidence checked

- `docs/architecture/scenario-manifest-contract.md` (ownership, fixture claims, lifecycle, evidence)
- `docs/architecture/protocol-lab-architecture.md` (module startup seam)
- `CONTEXT.md` and `docs/architecture/product-architecture.md` (lifecycle alignment)
- `docs/security/lab-safety-requirements.md` (LAB-07/LAB-11)
- `docs/roadmap/backlog.md` (ROAD-005 status and lifecycle)
- `web/src/contracts/scenario-descriptor.oauth.example.json` and `web/src/contracts/scenario-descriptor.test.ts`
- `backend/internal/oauthoidc/flow_test.go` and `backend/internal/oauthoidc/flow.go`
- `agent-graphs/runs/road-005-scenario-contract/03-acceptance.md`, `04-plan.md`, `05-implementation.md`, `06-verification.md`, and the stale `08-persona-review.md`
