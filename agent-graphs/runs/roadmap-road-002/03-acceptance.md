# D3 â€” ROAD-002 acceptance and risk map
> **Historical run artifact:** The initial human-session recommendation was superseded by [ADR-007](../../../docs/adr/007-synthetic-persona-review-policy.md) and [the owner decision](09-owner-decision.md). Human reviewers are not part of the active process; actual usability and demand remain unknown.


**Purpose:** Define what evidence completes the user-task sessions and what cannot be inferred.

**Inputs:** `01-scope.md`, `02-code-map.md`, ROAD-002, validation guide.

## Acceptance

1. The strict unanimous continue threshold is recorded; any future human
   session cohort and logistics are settled before recruitment/session execution.
2. Sessions cover the common OAuth tasks and, across the cohort, at least one each of JWT, HTTP, and SAML boundary tasks.
3. Each session uses the standard scorecard and records observations separately from moderator inference.
4. Participants are informed, can stop, and use generated/synthetic inputs only.
5. A synthesis reports outcomes and contradictions without presenting a small qualitative sample as statistical validation.
6. Product owner records continue/revise/pause/inconclusive and selects or rejects a next capability.

## Risks

- Without participant access, the work cannot produce real evidence; do not fabricate results or substitute repository assumptions.
- Unapproved thresholds could bias the decision; do not start sessions until signed off.
- Sensitive tokens or third-party traces may be offered; stop and switch to synthetic fixtures.
- Tool startup failures may skew findings; record setup failures rather than quietly removing participants/tasks.

**Next:** D4 separates the authorized synthetic panel run from human fieldwork.
