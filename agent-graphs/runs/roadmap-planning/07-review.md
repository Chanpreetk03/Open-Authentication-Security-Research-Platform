# D7 — Skeptic review

**Purpose:** Independently challenge the roadmap for scope drift, unsupported claims, missed product requirements, and risk gaps.

**Inputs:** D1–D6, changed documentation, current product/security docs.

## Findings

1. **Universal coverage can become an unfinishable promise.** Addressed: roadmap and idea register require explicit protocol, standard/version, and operation coverage and reject “all” as an acceptance criterion.
2. **A Postman-like goal could be reduced to passive visualization.** Addressed: Phase 3 and ROAD-106 include a constrained flow composer/runner that executes against declared local sandbox scenarios and returns inspectable traces.
3. **“Attack sandbox” can be read as permission for real targets or arbitrary code.** Addressed: Phase 2 is a gate for executable vulnerable targets; current simulations remain labeled; arbitrary URLs, production credentials, and unrestricted replay are excluded.
4. **The proposed next protocols could accidentally become a promised fixed sequence.** Addressed: Phase 4 now labels the list a candidate curriculum, requires selecting one slice at a time based on evidence, and leaves exact scope open.
5. **The roadmap does not contain dates or estimates.** Accepted limitation: team capacity and release cadence are unknown. Adding dates now would invent a schedule; dependency and exit gates still establish an execution order.
6. **The roadmap depends on user validation that has not happened.** Surfaced as a human-owned Phase 0 gate; evidence is not fabricated and later breadth is conditional.

## Remaining tradeoffs

- Phase 0 currently targets developers and security learners because those are the clearest near-term users for the existing implementation. Educator and security-engineer needs remain candidates until validation.
- Phase 2 states safety properties before selecting a local runtime. This postpones executable vulnerable-code labs but avoids choosing infrastructure before defining what it must protect.
- “All protocols and algorithms” is represented as an explicit, versioned coverage catalog rather than literal exhaustive coverage.

No blocking contradiction found. No changes to user code or unrequested product behavior were introduced.

**Next:** D8 handoff for human acceptance.
