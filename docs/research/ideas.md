# Idea Register

This file records the disposition of ideas gathered during product exploration.
It is an idea register, not a second roadmap. Sequencing, dependencies, and exit
gates live in the [product roadmap](../roadmap/roadmap.md); actionable work is
in the [backlog](../roadmap/backlog.md).

The dispositions below follow the review in
[`agent-graphs/runs/idea-evaluation/`](../../agent-graphs/runs/idea-evaluation/).
They are provisional product recommendations, not proof of user demand. No
external user validation was found in the repository.

| Idea | Disposition | Rationale / next step |
|---|---|---|
| Protocol visualization | **Continue — core** | Already present in OAuth events/timeline and SAML traces. Improve from Phase 0 task evidence; maintain explicit coverage and limitation labels. |
| Cyber-range isolation | **Gate — safety prerequisite** | Architecture describes the intended boundary; a general isolated vulnerable-code runtime is not demonstrated. Specify and prove isolation before executable vulnerable labs (ROAD-004–006). |
| Security-principle learning paths | **Continue — core loop** | One OAuth defense-in-depth Academy lesson exists. Define a reusable lesson contract and add one evidence-selected lesson (ROAD-103–104). |
| Attack replay | **Narrow — synthetic only initially** | SAML replay is currently a deterministic synthetic trace. Add repeatable synthetic replay/reset first; live traffic replay needs a separate threat model and decision (ROAD-105, ROAD-303). |
| Secure-coding exercises | **Continue as a lab format** | Pair an observed failure with secure behavior and verification; keep secure and intentionally vulnerable execution separate. This is a content pattern, not a separate platform subsystem (ROAD-103–104). |
| PKI | **Later — evidence-selected** | Useful cross-cutting topic for signatures and trust, but large scope. Teach selected certificate/trust cases using synthetic artifacts (ROAD-201, ROAD-207). |
| Key management | **Narrow — educational lifecycle only** | Teach algorithm choice, key use, rotation, expiry, and revocation with synthetic artifacts. Do not build a production secret/key manager (ROAD-207, ROAD-403). |
| WebAuthn/passkeys | **Conditional protocol expansion** | Strong candidate after user validation; requires origin/RP ID, authenticator, and recovery boundaries. Begin with a deterministic local ceremony (ROAD-201, ROAD-204). |
| SAML | **Continue existing work; deepen selectively** | Several synthetic acceptance lessons and local inspectors exist, but they are not full parsing/signature validation. Choose targeted lessons or a standards-backed validator only after scoping (ROAD-203). |
| LDAP | **Later — synthetic first** | No implementation was found in the current source inventory. Start with directory, bind, search/filter, TLS, and injection concepts using synthetic data (ROAD-205). |
| Kerberos | **Later — higher complexity** | No implementation was found. Begin with synthetic AS/TGS/ticket traces only if user evidence supports it; executable realm work has higher operational cost (ROAD-206). |
| Plugin model | **Defer public plugins** | Prove the internal protocol seam with another first-party module first. Reassess trust, compatibility, and capability enforcement at that point (ROAD-301–302). |
| Enterprise connectors | **Deferred / outside current scope** | Not required to validate the protocol workbench and sandbox; revisit only through the separate evidence gate in Phase 6. |
| Access governance | **Deferred / outside current scope** | Would move the product toward an enterprise IAM suite and is not supported by the current product thesis. |
| Hosted multi-tenancy | **Deferred / separate decision** | Adds tenant isolation, abuse, privacy, operations, and cost obligations. Reassess only if validated users need hosted collaboration or execution (ROAD-304). |

## Product coverage rule

“All authentication protocols and algorithms” is an aspiration, not an
acceptance criterion. For each selected protocol, standard, and version, the
product must say whether it supports local inspection, synthetic simulation,
cryptographic verification, standards/profile validation, or live interoperability. The roadmap
tracks the sequence and gates; the coverage catalog should track actual
implemented behavior.
