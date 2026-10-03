# D3 — Acceptance and risk map

**Purpose:** Define what makes the roadmap complete, coherent, and safe to execute.

**Inputs:** `01-scope.md`, user request, product/security documentation.

## Acceptance conditions

1. Roadmap phases are ordered by dependencies and each has a goal, concrete outputs, and an observable exit gate.
2. Current implementation is labeled as current baseline, not future work or a complete feature claim.
3. Research ideas each have a status/disposition: continue, gate, later, defer, or out of scope.
4. Backlog items have priority, dependency, completion evidence, and safety notes where relevant.
5. The plan keeps the core product as a protocol workbench and safe sandbox; it does not expand into full IAM.
6. Unknowns are represented as decision gates. No dates or capacity claims are invented.
7. PRD open questions do not contradict the evidence-selected module sequence.
8. Relative links resolve; whitespace check is clean; existing user changes remain untouched.

## Risk and boundary cases

- Protocol simulators and synthetic traces can be mistaken for standards conformance or exploitability proof; roadmap must require explicit labeling and scope.
- Live HTTP request/replay or external provider access may create SSRF, credential exposure, unauthorized testing, or retention risks; keep out of baseline until separately threat-modeled and approved.
- Intentionally vulnerable code can affect host or neighboring scenarios; runtime isolation and capability controls gate executable labs.
- Shared protocol abstractions can flatten different protocol semantics; add first-party modules before public plugin extensibility.
- Broad standards breadth can outrun validated user need and correctness review; roadmap must make next-protocol choice conditional on evidence.

## Proof

Review all idea dispositions against `docs/research/ideas.md`; map phases/backlog to current implementation and architecture; run `git diff --check` and a relative Markdown-link check. No product tests are needed for documentation-only changes.

**Next:** D4 selects the structure and scope for the roadmap rewrite.
