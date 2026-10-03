# I5 — Skeptic challenge

**Purpose:** Identify the strongest case against the preliminary recommendation and define a disconfirming test.

**Inputs:** `01-idea-frame.md` through `04-alternatives.md`; independently checked against README, current implementation, and architecture boundaries.

## Strongest counterargument

The product may be trying to serve three different jobs: learning protocol concepts, debugging real integrations, and safely practicing offensive security. Synthetic, deterministic scenarios serve learning well but may not resemble the broken providers and deployment-specific configurations developers need to debug. Conversely, live integrations/replay make a more Postman-like product but raise SSRF, credential handling, target authorization, and data-retention risks. A combined workbench could become a broad collection of partial tools before any one job is excellent.

## Weak assumptions

1. Users value one product combining inspectors and attack labs rather than separate tools.
2. Users will accept synthetic labs as valuable before live provider integration exists.
3. A normalized exchange/event model can support OAuth, XML-based SAML, directory protocols, Kerberos tickets, and browser-mediated WebAuthn without losing protocol-specific meaning.
4. The team can define and enforce a safe execution boundary before adding real vulnerable code or user-controlled targets.
5. Listing many standards in the roadmap translates into user value; the repo has no demand evidence proving that.

## Contradictory or limiting evidence

- The product intent is broad, but the implemented tool surface is currently mostly offline/local inspection and simulation, not a general protocol client or live integration debugger (`README.md`, `docs/architecture/protocols/http-inspector.md`, `docs/architecture/protocols/saml-replay-lab.md`).
- The architecture treats lab runtime isolation as a strong boundary but leaves its adapter and capability manifest open (`docs/architecture/product-architecture.md`).
- Several modules document synthetic traces and expressly disclaim protocol validation, meaning apparent breadth must not be confused with protocol implementation coverage.
- The roadmap lists multiple future protocol families without evidence establishing their order (`docs/roadmap/roadmap.md`).

## Disconfirming test

In at least five task sessions across developers and security learners, ask participants to use the current tool to explain a trace, diagnose a failure, and state a verified mitigation. Afterward ask which next step they would actually use: another synthetic lab, a real test-provider connection, live request/replay, or a protocol-specific course. The preliminary thesis is weakened if users cannot complete the tasks without extensive coaching, do not trust the synthetic evidence, or consistently prefer a narrow inspection tool over the combined loop.

**Safety boundary:** do not test with production credentials, third-party targets, live interception, or uncontrolled network destinations.

**Next node:** I6 incorporates this challenge into the recommendation.
