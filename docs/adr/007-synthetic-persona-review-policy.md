# ADR-007: Synthetic persona panel is the internal product review gate

- **Status:** Accepted
- **Date:** 2026-10-03
- **Decision owner:** Product owner

## Context

The project is a solo-developer authentication workbench and attack sandbox.
The roadmap previously depended on recruiting human reviewers and running
participant sessions. The product owner decided that human reviewers will not
be part of the project review process and asked for a reusable agent that
critiques work from the intended product personas. The owner also selected the
tightest threshold for decisions.

The repository already contains a five-lens synthetic persona profile covering
an authentication-focused developer, general application developer,
student/security learner, security engineer, and architect/educator. Synthetic
critique can inspect repository evidence and identify likely blockers, but it
cannot provide actual user behavior, demand, or usability evidence.

## Decision

1. Use the synthetic persona panel as the normal internal review gate for
   product-facing changes and roadmap decisions. Invoke it automatically at
   development graph D7.
2. Require unanimity: all five lenses must find no credible critical blocker
   in their remit and no unresolved safety or evidence-boundary issue. One
   credible blocker means revise. Do not average or waive a failed lens.
3. Treat every panel concern as an inference unless it is directly supported
   by repository evidence. Record observed facts, inferred concerns, and
   unknowns separately, with source paths/symbols.
4. Do not use human reviewers or participant sessions in the project's
   standard review process. Do not contact people or claim user validation.
5. Mark real-world usability, demand, and market fit as unknown unless direct
   evidence is independently collected. A unanimous panel pass permits only
   continued internal product work; it does not prove users can or want to use
   the product.
6. Keep product-owner decisions for material changes to scope, trust boundary,
   or external activity. Routine review and implementation do not wait for a
   human reviewer.

## Consequences

- The graph, review protocol, and roadmap use synthetic critique instead of a
  human-study gate.
- Each product-facing change needs a durable report showing five lens outcomes
  and the unanimous gate result.
- Roadmap prioritization cannot cite demand or usability as observed facts.
- The project accepts that this process will miss real user expectations and
  cannot claim empirical product validation.
- User research remains possible only as a separate future product-owner
  decision; it is not implied by this ADR or required to complete normal work.

## Alternatives considered

- **Keep human sessions as a required gate:** rejected because the owner decided
  not to have human reviewers.
- **Let one assistant reviewer decide alone:** rejected because the five
  persona lenses provide broader, explicit coverage of target concerns.
- **Average persona scores:** rejected because the owner selected the tightest
  threshold; a single credible critical blocker must prevent a pass.
- **Treat panel agreement as validation:** rejected because synthetic output is
  not evidence from actual users.

## Implementation record

The active policy is maintained in
[`docs/research/internal-product-review.md`](../research/internal-product-review.md),
the reviewer profile in
[`agent-graphs/agents/synthetic-persona-panel.md`](../../agent-graphs/agents/synthetic-persona-panel.md),
and the process in
[`agent-graphs/workflows/development.md`](../../agent-graphs/workflows/development.md).
Feature-specific implementation choices and verification are recorded in the
development run artifacts.
