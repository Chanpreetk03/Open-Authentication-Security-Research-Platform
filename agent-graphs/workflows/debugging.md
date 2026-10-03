# Debugging graph

**Outcome:** a supported root-cause explanation and a focused fix or a precise statement of what evidence is still missing.

```text
Symptom -> B1 Triage -> [B2 Reproduce || B3 Trace code path]
                     -> B4 Hypotheses -> B5 Discriminating check
                     -> B6 Fix -> [B7 Verification || B8 Skeptic]
                                -> Human handoff
```

## Nodes

### B1 — Triage

- **Input:** symptom, expected/actual behavior, environment, recent changes, and logs with secrets removed.
- **Output:** `01-triage.md`: impact, exact failure, reproduction status, constraints, and unknowns.
- **Done when:** failure boundaries and safe diagnostic limits are clear.

### B2 — Reproduce (parallel)

- **Input:** triage.
- **Output:** `02-reproduction.md`: minimal steps/fixture, expected vs actual result, and whether it is deterministic.
- **Done when:** the failure is reproduced or blockers are recorded. Avoid destructive or unauthorized actions.

### B3 — Trace code path (parallel)

- **Input:** triage and repository guidance.
- **Output:** `03-code-path.md`: entry point, relevant decisions/state/external boundaries, candidate owner, and locations. Label observed/inferred/unknown.
- **Done when:** the smallest plausible behavior path is mapped.

### B4 — Hypotheses

- **Input:** artifacts 01–03.
- **Output:** `04-hypotheses.md`: ranked causes, evidence for/against each, and predicted observations.
- **Done when:** hypotheses are distinct and falsifiable; do not patch based on a guess alone.

### B5 — Discriminating check

- **Input:** hypotheses.
- **Output:** `05-check.md`: smallest safe check that distinguishes the leading causes and its result.
- **Done when:** a cause is supported, or the missing evidence is identified. Ask the user only when access/input is required.

### B6 — Focused fix

- **Input:** supported cause, reproduction, and repo conventions.
- **Output:** minimal fix and `06-fix.md` describing causal link, invariant preserved, and regression scenario.
- **Done when:** fix addresses the supported cause without unrelated behavior changes.

### B7 — Verification (parallel with B8)

- **Input:** fix and reproduction.
- **Output:** `07-verification.md`: regression check, relevant checks and results, and unverified cases.
- **Done when:** reproduction no longer fails and relevant behavior is checked, or proof gaps are explicit.

### B8 — Skeptic review (parallel with B7)

- **Input:** diff and artifacts 01–07.
- **Output:** `08-review.md`: alternative cause, masked failure, regression, unsafe diagnostic, or scope issue.
- **Done when:** findings are addressed or surfaced; changed behavior is rechecked.

### B9 — Human handoff

- **Input:** evidence, diff, verification, and review.
- **Output:** concise root cause, fix, proof, limitations, and next action.
- **Done when:** user can judge the result and any remaining uncertainty.

**Parallelism:** B2 and B3 can run concurrently; B7 and B8 can overlap after the fix. **Stop condition:** root cause and confidence are supported by evidence, or the next required evidence is clearly named.
