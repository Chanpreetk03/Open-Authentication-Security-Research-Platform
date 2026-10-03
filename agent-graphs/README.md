# Agent graphs

Portable, file-based AI workflows for development, idea evaluation, and debugging. These are graph engineering workflows: named jobs pass explicit artifacts along dependency edges, independent jobs can run in parallel, a skeptic checks the result, and a person owns consequential decisions.

The workflows are deliberately usable by hand in Codex, Claude Code, or another coding assistant. They do not require LangGraph, an API key, or a runtime. Start by running them manually; only automate a workflow after it has produced useful results repeatedly.

## Use in this repo

Ask your coding assistant:

> Use the `development` graph in `agent-graphs/workflows/development.md` for this request.

Use `idea-review` to investigate a product or technical idea, and `debugging` to investigate a failure. The repo-local [graph-workflows skill](../.agents/skills/graph-workflows/SKILL.md) contains execution and handoff instructions.

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
- Pause for human decisions at the gates; the assistant does not approve product scope, risky actions, or external testing on the user's behalf.
- Do not turn a graph into a multi-agent framework unless repeated manual use shows a real need.
