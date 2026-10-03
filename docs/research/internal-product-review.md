# Internal Product Review Protocol

**Status:** Active. Human reviewers and participant sessions are not part of the project's review process.
**Decision record:** [ADR-007](../adr/007-synthetic-persona-review-policy.md)
**Roadmap item:** [ROAD-001](../roadmap/backlog.md#road-001--define-the-synthetic-review-rubric)
**Next item:** [ROAD-002](../roadmap/backlog.md#road-002--run-the-synthetic-persona-panel)

## Purpose and limits

Use the reusable [synthetic persona panel](../../agent-graphs/agents/synthetic-persona-panel.md) to critique product-facing changes and roadmap decisions from five target-role perspectives. It is the normal internal review gate. It does not involve actual users and cannot establish usability, demand, market fit, or real-world trust.

Keep those empirical claims marked **unknown**. Do not invent participant behavior, quotes, task completion, confidence, preference, or adoption evidence. This process does not authorize live-provider connectivity, arbitrary request replay, executable vulnerable targets, hosted labs, or production IAM scope.

## Five review lenses

1. Authentication-focused developer: integration debugging, actionable state/errors, protocol limits.
2. General application developer: discoverability, setup, terminology, safe examples.
3. Student/security learner: progressive explanations, practice, mitigation evidence.
4. Security engineer: faithful security semantics, reproducibility, redaction, containment.
5. Architect/educator: trust boundaries, protocol tradeoffs, repeatable teaching, accurate coverage.

## Evidence record

For each product-facing review, record:

- change reviewed and exact files/symbols inspected;
- **Observed** repository facts with source locations;
- **Inferred** persona concerns, clearly labeled as hypotheses;
- **Unknown** real-user behavior and unsupported product claims;
- each lens's goal, value, friction/blocker, and evidence;
- cross-cutting protocol, algorithm, learning, and sandbox coverage gaps;
- must-fix items, test-next items, recommendation, and follow-up checks.

Keep observations separate from interpretation. A persona must not be described as actually using the application.

## Strict internal decision threshold

A design gate passes only when **all five lenses** find no credible critical blocker in their remit and no safety or evidence-boundary issue remains unresolved. Any one credible critical blocker means revise. Do not average findings. A pass means only that internal critique found no blocker; it does not mean the product is validated or that users want it.

## Safety and data handling

Use repository-provided synthetic examples. Never include credentials, live tokens, private keys, customer traces, personally identifying data, or unredacted authentication material in review artifacts. Do not contact people or external services as part of this review.

## Decision template

```text
Change/review ID:
Date:
Files and symbols inspected:
Observed facts (with sources):
Inferred concerns:
Unknowns:
Lens findings (5/5):
Cross-cutting gaps:
Must fix:
Test next:
Unanimous internal gate: pass / revise
Why:
Follow-up and verification:
```

No human study or external validation has been performed by this process.
