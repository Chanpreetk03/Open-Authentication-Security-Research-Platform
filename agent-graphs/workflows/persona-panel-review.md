# Synthetic persona panel review

**Outcome:** a traceable, multi-perspective design critique of a user-facing
product change. This is internal analysis, not customer validation.

```text
Product change -> Read persona-panel agent -> Inspect repo evidence -> Review five lenses
                -> Strict unanimity check -> Findings and internal recommendation
```

## Run it

Use the reusable reviewer profile at
[`agent-graphs/agents/synthetic-persona-panel.md`](../agents/synthetic-persona-panel.md).
When sub-agents are available, invoke it as an independent reviewer after
implementation and before closing a product-facing feature. Otherwise, follow
the profile directly. Save outputs with the relevant development graph run.

## Rules

- Inspect the current changed feature and its actual boundaries, not only its
  marketing description.
- Review all five perspectives and the product topics listed in the profile.
- Cite repository evidence and separate observed facts, inferences, and unknowns.
- Use the strict unanimity rule: one credible critical blocker prevents a
  simulated design-gate pass.
- Do not invent user quotes, test outcomes, preferences, or adoption evidence.
- Never treat a panel run as completing ROAD-002 or proving product demand.

## Completion condition

The report names the reviewed change, all five perspective findings, cross-cutting
gaps, must-fix items, and whether the next step is revision or an internal design
gate pass. The panel never claims user validation and does not establish demand.
