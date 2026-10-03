# I4 — Alternatives

**Purpose:** Compare the broad idea portfolio with narrower and no-change options.

**Inputs:** `01-idea-frame.md`; current implementation and repo roadmap.

## Option A — Continue the full breadth list

Add protocol visualization, isolation, courses, replay, secure coding, PKI, key management, WebAuthn, SAML, LDAP, Kerberos, plugins, and possibly deferred enterprise surfaces in parallel.

- **Benefit:** appears to cover the long-term vision.
- **Cost:** high coordination and architecture burden; many incomplete protocol-specific correctness and safety concerns; hard to learn which experience users value.
- **Assessment:** not recommended as the next move. The idea list mixes product outcomes, safety infrastructure, protocol families, implementation techniques, and explicitly deferred business directions.

## Option B — Deepen one end-to-end workbench/lab loop

Keep the workbench local and synthetic. Improve the current protocol exchange/inspection experience, make one exercise repeatable, connect its vulnerable and secure behavior to an Academy lesson, and verify learning/debugging outcomes with target users. Define a runtime isolation gate before executable vulnerable targets.

- **Benefit:** tests the product thesis using existing assets and keeps risk bounded.
- **Cost:** delays protocol breadth; may not answer requirements for real integration testing.
- **Assessment:** best next experiment. It validates the combined “inspect, understand, exercise, verify” loop rather than testing isolated features.

## Option C — Narrow to an inspection-only tool

Focus on pasted/local protocol artifacts and flow traces; avoid attack labs and execution for now.

- **Benefit:** materially lower safety and runtime cost; builds on JWT/HTTP/SAML inspectors.
- **Cost:** weakens the distinctive attack-and-defense sandbox intent and may feel like a collection of parsers rather than a workbench.
- **Assessment:** credible fallback if isolation cannot be made safe or user testing shows debugging/inspection dominates.

## Option D — Build a protocol simulator/teaching lab only

Continue synthetic OAuth/SAML scenarios and educational traces; avoid live external integrations and arbitrary code execution.

- **Benefit:** deterministic and safe; existing code/tests support this style.
- **Cost:** limited realism for integration debugging; may not satisfy users seeking a general Postman-like protocol client.
- **Assessment:** safest initial operating mode and appropriate experiment baseline, but validate perceived usefulness.

## Option E — Do nothing / only maintain current slices

Fix correctness and clarity gaps in the existing OAuth, inspectors, Academy lesson, and synthetic SAML exercises; add no new protocol families until there is user evidence.

- **Benefit:** keeps scope and maintenance manageable.
- **Cost:** does not answer the protocol breadth question.
- **Assessment:** reasonable if the team has no capacity for interviews or cannot yet define isolation requirements.

**Next node:** I5 should test whether the recommended narrow experiment risks overfitting to simulations.
