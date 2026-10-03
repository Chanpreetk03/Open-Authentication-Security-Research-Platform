---
name: graph-workflows
description: Run the repository's explicit, artifact-based AI graphs for feature development, idea evaluation, and debugging. Use when the user asks to use a graph workflow or when a complex multi-step task benefits from planned dependencies, parallel evidence gathering, checking, and durable handoffs.
---

# Graph workflows

Treat the selected graph under `agent-graphs/workflows/` as the workflow contract. The root is `agent-graphs/`; if this skill has been copied without that directory, ask the user where its graphs are.

## Execution

1. Select the requested graph (`development`, `idea-review`, or `debugging`). If not specified, infer from the task. Do not use a graph for a trivial one-step request.
2. Read the graph and its referenced repository guidance. Create `agent-graphs/runs/<short-name>/` if the task is complex enough to benefit from a durable paper trail; otherwise keep the named artifacts in working context and write only the final decision or plan where it belongs.
3. Execute nodes in dependency order. Independent nodes may be researched concurrently when the available environment supports it. Each node must use its declared input and produce its declared output before downstream work proceeds.
4. Record source locations for repo claims, URLs for external claims, and label facts as observed, inferred, or unknown. Never fabricate evidence to fill a node.
5. Run the skeptic node independently from the synthesis where practical. It must challenge the outputs, not merely polish them. Feed valid corrections back to the owner node, then rerun affected downstream nodes.
6. Stop at a human gate and present the concrete options/evidence when the graph says a decision belongs to the user. Continue independent, non-dependent work while awaiting a decision, but do not cross the gate.
7. Stop when the graph's completion condition is met. Do not add agents or stages just to make the graph larger.

## General handoff format

Each node artifact should state: purpose, inputs, findings/output, evidence or file locations, assumptions/unknowns, and the next node. Keep secrets and sensitive authentication material out of artifacts. Prefer concise Markdown so future runs and humans can inspect and reuse it.
