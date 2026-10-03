# Data and Persistence Design

The product is local-first and does not need an identity database to deliver its core value. Start with portable collection, environment, scenario, and report files. Add local run-history persistence only when the workbench needs it; SQLite is a candidate. PostgreSQL is a later choice for a demonstrated hosted/team requirement. Redis is deferred absent a measured need.

## Product data

- Protocol-pack descriptors and versions.
- Collections, environment configuration, and secret references.
- Scenario definitions and per-run ephemeral state.
- Normalized event envelopes with protocol-specific payloads.
- Assertions, outcomes, and evidence references.
- Redacted run reports and local audit events.

## Data rules

- Do not model users, credentials, groups, roles, federation configuration, refresh-token families, or production sessions as platform-owned identity data. These may exist only as synthetic target state inside a scenario.
- Keep secrets outside ordinary collection/report files; use local secret references and explicit export rules.
- Redact before persistence and verify exports cannot contain private keys, passwords, codes, tokens, cookies, or secret-bearing URL parameters.
- Make run retention and deletion explicit; destroying a scenario destroys its target state and ephemeral keys.
- Bind every result to protocol-pack, scenario, and target versions for reproducibility.

Schema and storage decisions should follow the MVP run/report workflow rather than a hypothetical multi-tenant identity engine.
