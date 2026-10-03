# Synthetic persona-panel review: ROAD-001 and ROAD-002
> **Historical run artifact:** The initial human-session recommendation was superseded by [ADR-007](../../../docs/adr/007-synthetic-persona-review-policy.md) and [the owner decision](09-owner-decision.md). Human reviewers are not part of the active process; actual usability and demand remain unknown.


**Agent:** [`synthetic-persona-panel.md`](../../agents/synthetic-persona-panel.md)
**Recommendation:** **Revise the research workflow; use this output as internal critique only.** It is not user research, does not establish task completion, and cannot clear ROAD-002.

## Evidence reviewed

- **Observed:** the validation guide includes OAuth flow explanation, failure diagnosis, and a JWT/HTTP/SAML boundary task. Its human-study decision threshold now requires unanimous success.
- **Observed:** the application provides OAuth simulations, local JWT/HTTP inspection, SAML viewing and metadata, synthetic SAML labs, and one OAuth Academy lesson. The tool switcher is in `web/src/main.tsx`; boundaries are described in `web/src/components/JwtInspector.tsx`, `RequestInspector.tsx`, and `SamlReplayLab.tsx`.
- **Observed:** current materials explicitly limit some tools to decoding, offline inspection, or synthetic simulation. They do not establish complete protocol validation or broad interoperability.
- **Unknown:** whether real people can discover tools, complete tasks independently, understand limitations, or value the combined workflow. There are no participant results.

## Persona lenses

### Authentication-focused developer

- **Observed value:** OAuth event timelines, explanations, and bounded JWT/HTTP tools support protocol debugging and expose their limits.
- **Inferred blocker:** predefined scenarios may not let a developer change flow inputs or test an integration configuration.
- **Unknown:** whether the current trace answers common real integration-debugging questions or covers expected versions.

### General application developer

- **Observed value:** synthetic examples and human-readable findings reduce setup risk; the HTTP inspector does not send pasted requests.
- **Inferred blocker:** the long tool switcher may make the first useful task hard to find. The guide originally handed participants a tool name, hiding discoverability.
- **Unknown:** setup time and whether unfamiliar protocol terms can be understood without help.

### Student/security learner

- **Observed value:** OAuth explanations and the Academy lesson connect protocol events to defenses; SAML labs isolate modeled checks.
- **Inferred blocker:** the UI has predefined failure/reference scenarios; it does not let learners edit a configuration and apply a mitigation.
- **Unknown:** whether learners understand trust assumptions and how secure evidence supports the lesson.

### Security engineer

- **Observed value:** targeted synthetic SAML labs make modeled replay and validation checks inspectable; JWT boundaries state that signatures are not verified.
- **Inferred blocker:** synthetic traces cannot prove real ACS behavior, conformance, or target security.
- **Unknown:** whether redaction, errors, and scenario fidelity meet practitioners' needs beyond the documented cases.

### Architect/educator

- **Observed value:** the roadmap distinguishes inspection, simulation, validation, and interoperability and aims to preserve protocol-specific semantics.
- **Inferred blocker:** coverage across protocols is uneven. That's acceptable for a bounded early product but must not be presented as broad support.
- **Unknown:** whether comparisons explain trust boundaries and tradeoffs well enough for teaching or architecture review.

## Cross-topic coverage

| Topic | Repository evidence | Assessment |
|---|---|---|
| OAuth 2.0 | Authorization-code simulations and Academy lesson | **Observed:** implemented bounded slice. |
| OIDC | Planned discovery/issuer/ID-token learning path | **Unknown:** no complete implementation established by reviewed evidence. |
| JWT | Browser-local structure/claims inspector | **Observed:** decoding only; signature not verified. |
| SAML | Viewer, metadata, and synthetic targeted labs | **Observed:** not a complete parser/validator. |
| LDAP/Kerberos | Roadmap and backlog candidates | **Observed:** future areas; implementation not found in reviewed inventory. |
| MFA/TOTP/WebAuthn/passkeys | Roadmap candidates | **Observed:** future areas; implementation not found in reviewed inventory. |
| PKI/keys/algorithms | Synthetic educational proposal; JWT shows declared algorithm | **Observed:** no broad algorithm validation or production key management. |
| Workbench/attack sandbox | Local inspection and synthetic scenarios | **Observed:** general isolated execution runtime not demonstrated. |
| Learning | One OAuth lesson and scenario explanations | **Observed:** learning coverage is currently narrow. |
| Usability and demand | No sessions or results | **Unknown:** requires human evidence. |

## Must-fix changes made to the guide

1. Task A now starts from the product's landing/tool-selection view to expose discoverability.
2. Task B now asks for a recommended mitigation and comparison with the existing secure reference scenario. It explicitly says participants cannot modify protocol configuration or apply a change in the current tool; score the diagnosis and evidence interpretation only.
3. The guide links to this synthetic panel but says its output does not count as a participant or contribute to human-study thresholds.
4. Human â€œcontinueâ€ now requires 5/5 participants to complete Tasks A and B independently, correctly explain tool boundaries, and identify repeatable value. Any missed criterion means revise; a safety misunderstanding must be corrected before continuation.

## Strict-threshold result

**No synthetic persona can pass as a participant.** The five lenses surfaced credible blockers or unknowns, so the internal recommendation is **revise/test**, not continue. Even unanimous synthetic approval would only support proceeding to human evaluation; it would not show users succeeded or wanted the product.

**Next:** human ROAD-002 fieldwork remains pending actual participants and session logistics. The current owner can use the agent for repeated design critiques while the product is refined.
