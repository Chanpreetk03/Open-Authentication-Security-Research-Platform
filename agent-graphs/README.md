# Agent graphs

Portable, file-based AI workflows for development, idea evaluation, and debugging. These are graph engineering workflows: named jobs pass explicit artifacts along dependency edges, independent jobs can run in parallel, and a synthetic persona panel checks product-facing work using a strict unanimity threshold. The product owner remains responsible for consequential scope decisions.

The workflows are deliberately usable by hand in Codex, Claude Code, or another coding assistant. They do not require LangGraph, an API key, or a runtime. Start by running them manually; only automate a workflow after it has produced useful results repeatedly.

## Use in this repo

Ask your coding assistant:

> Use the `development` graph in `agent-graphs/workflows/development.md` for this request.

Use `idea-review` to investigate a product or technical idea, and `debugging` to investigate a failure. The repo-local [graph-workflows skill](../.agents/skills/graph-workflows/SKILL.md) contains execution and handoff instructions.

For product-facing changes, the `development` graph's skeptic node invokes the
[synthetic persona panel](agents/synthetic-persona-panel.md). It reviews work
from developer, learner, security engineer, and architect/educator perspectives
and uses a strict unanimity rule. This is internal critique only; it never
counts as human user validation. See the
[persona panel workflow](workflows/persona-panel-review.md).

## Copy to another repo

Copy the `agent-graphs/` directory and `.agents/skills/graph-workflows/` into the target repository. If it already has `.agents/skills/`, merge the `graph-workflows` directory into it. Then ask the assistant to use the graph you need. Graphs use Markdown and shell-agnostic instructions; adapt repository-specific references in the target repo's local copy.

## Run artifacts

For a run worth keeping, create `agent-graphs/runs/<short-name>/` and save each node's output there using the filenames named in that workflow. Keep evidence and decisions that will help later runs; omit sensitive values, credentials, tokens, and unredacted traces. Runs are optional and are not automatically committed.

## Design rules

- Keep each node's job, input, output, and completion condition explicit.
- Run independent research nodes in parallel; wait for their artifacts before synthesis.
- Keep evidence separate from assumptions and recommendations.
- Let a skeptic challenge evidence and look for missing cases.
- Stop when the workflow's completion condition is met.
- Pause only for consequential product-owner decisions or external actions that require authorization. Routine product-facing changes use the synthetic persona panel; its output is internal critique, never user validation.
- Do not turn a graph into a multi-agent framework unless repeated manual use shows a real need.
