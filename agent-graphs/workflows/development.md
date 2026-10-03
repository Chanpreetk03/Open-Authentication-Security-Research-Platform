# Development graph

**Outcome:** a scoped, implemented change whose behavior and relevant risks have been checked, with a reviewable handoff.

```text
Request -> Planner -> [Codebase map || Acceptance/risk map]
                    -> Scope gate -> Implementation -> Verification
                                                   -> Skeptic review
                                                   -> Synthetic persona panel gate
                                                   -> Owner handoff
```

## Nodes

### D1 — Planner

- **Input:** user request and repository instructions.
- **Output:** `01-scope.md`: observable goal, constraints, touched boundaries, invariants, unknowns, and likely proof obligations.
- **Done when:** the requested behavior and boundaries are concrete. Ask only if an unknown changes the design; otherwise record a reversible assumption.

### D2 — Codebase map (parallel)

- **Input:** `01-scope.md`.
- **Output:** `02-code-map.md`: relevant entry points, behavior owners, nearby tests, reusable code, and precise file/symbol locations. Label observed/inferred/unknown.
- **Done when:** the likely change point and credible reuse candidates are identified.

### D3 — Acceptance and risk map (parallel)

- **Input:** `01-scope.md` and user-visible requirements.
- **Output:** `03-acceptance.md`: happy path, relevant failure/boundary cases, security or data risks, and what evidence would prove the change.
- **Done when:** acceptance conditions are observable and fit the repository's product/security constraints.

### D4 — Scope gate

- **Input:** artifacts 01–03.
- **Output:** `04-plan.md`: selected design, files/boundaries to change, proof plan, and explicit out-of-scope items.
- **Done when:** implementation is bounded and consistent with repo guidance. If materially different options remain, present them for a human decision before implementation.

### D5 — Implementation

- **Input:** approved `04-plan.md` and repository conventions.
- **Output:** code/docs changes plus `05-implementation.md` listing behavior changed and any deviations.
- **Done when:** the planned behavior exists and the diff contains no unrelated edits.

### D6 — Verification

- **Input:** implementation and `03-acceptance.md`.
- **Output:** `06-verification.md`: checks run, outcomes, acceptance cases covered, and gaps. Do not claim tests ran unless they did.
- **Done when:** relevant checks have been run or the unavailable proof is stated plainly.

### D7 — Skeptic review

- **Input:** diff and artifacts 01–06.
- **Output:** `07-review.md`: scope drift, missed reuse, regressions, security/privacy concerns, and unsupported claims. Findings point to exact files/lines. For user-facing product changes, invoke the reusable [synthetic persona panel](../agents/synthetic-persona-panel.md) as an independent review and include its report or a link to it.
- **Done when:** findings are fixed or explicitly surfaced, and impacted verification is rerun.

The synthetic persona panel is the project's default internal product-review
process. Its strict unanimity gate can identify blockers. It cannot establish
real-world usability, user demand, or empirical validation; record those as
unknown unless actual evidence exists.

### D8 — Owner handoff

- **Input:** diff, verification, skeptic findings, and remaining tradeoffs.
- **Output:** concise final handoff for the owner, including panel outcome and
  any unresolved decision that genuinely requires product-owner input.
- **Done when:** result, checks, limitations, and any follow-up are clear. The
  synthetic panel is the normal internal review gate; it is not evidence of
  real user validation. Do not wait for human reviewers or invent user evidence.

**Parallelism:** D2 and D3 can run concurrently. Implementation follows the scope gate. Verification and skeptic review can overlap after implementation, but fixes must be reverified. **Stop condition:** D8 has enough evidence for the user to accept or request changes.
