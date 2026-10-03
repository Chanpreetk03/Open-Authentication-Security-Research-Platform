# Idea review graph

**Outcome:** an evidence-backed recommendation to test, revise, defer, or drop an idea. The assistant recommends; the human decides.

```text
Idea -> I1 Frame -> [I2 User/problem evidence || I3 Feasibility/fit || I4 Alternatives]
                 -> I5 Skeptic -> I6 Merge/recommendation -> Human experiment gate
```

## Nodes

### I1 — Frame the idea

- **Input:** rough idea and repo/product context.
- **Output:** `01-idea-frame.md`: target user, problem, proposed change, expected outcome, key assumptions, and decision to make.
- **Done when:** the idea can be evaluated against a specific user problem and a decision.

### I2 — User/problem evidence (parallel)

- **Input:** frame.
- **Output:** `02-problem-evidence.md`: evidence available in repository research, user feedback, or cited sources; distinguish direct evidence from inference and gaps.
- **Done when:** strongest support and strongest uncertainty are clear. Do not invent customer validation.

### I3 — Feasibility and product fit (parallel)

- **Input:** frame and repo docs/code.
- **Output:** `03-feasibility.md`: architectural fit, likely owners/dependencies, security/safety implications, rough cost, and smallest experiment.
- **Done when:** feasibility and material risks are grounded in repo evidence.

### I4 — Alternatives (parallel)

- **Input:** frame.
- **Output:** `04-alternatives.md`: credible smaller solution, current workaround, and reasons to do nothing now.
- **Done when:** the proposal is compared against real options rather than accepted by default.

### I5 — Skeptic

- **Input:** artifacts 01–04.
- **Output:** `05-challenge.md`: weakest assumptions, contradictory evidence, missing users/cases, and what would falsify the idea.
- **Done when:** strongest counterargument and one disconfirming test are explicit.

### I6 — Merge and recommendation

- **Input:** artifacts 01–05.
- **Output:** `06-recommendation.md`: test/revise/defer/drop recommendation, evidence, confidence, proposed reversible experiment, success/failure signal, and unresolved questions.
- **Done when:** recommendation is traceable to evidence and does not present assumptions as facts.

### I7 — Human experiment gate

- **Input:** recommendation.
- **Output:** human decision to run, change, or reject the experiment.
- **Done when:** user has a clear low-cost next step or a clear reason to stop.

**Parallelism:** I2–I4 can run concurrently. **Stop condition:** I7 has decision-ready evidence; do not autonomously commit the product to a roadmap based on speculative idea analysis.
