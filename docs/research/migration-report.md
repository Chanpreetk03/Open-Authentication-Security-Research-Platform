# IAM Project Migration Report

## Scope and source

Migration completed from `.migration/iam-platform-migration/`. The existing repository remained canonical. The source package was structured project context, not raw implementation code; no source code was changed.

## Files modified

- `README.md`
- `docs/adr/README.md`
- `docs/architecture/domain-model.md`
- `docs/architecture/modules/{audit,authentication,authorization,devices,identity,mfa,policies,protocols,sessions,tokens}.md`
- `docs/architecture/system-overview.md`
- `docs/architecture/trust-boundaries.md`
- `docs/product/{PRD,personas,product-vision}.md`
- `docs/protocols/README.md`
- `docs/research/{ideas,references}.md`
- `docs/roadmap/{backlog,roadmap}.md`
- `docs/security/{attack-catalog,security-principles,threat-model}.md`

## Files created

- `docs/adr/001-repository-as-source-of-truth.md`
- `docs/adr/002-modular-before-services.md`
- `docs/adr/003-separate-authentication-authorization.md`
- `docs/adr/004-keep-architecture-documentation-updated.md`
- `docs/research/migration-report.md`
- `docs/architecture/database-design.md`
- `docs/architecture/api-design.md`
- `docs/research/system-design-learning.md`

## Decisions recovered

- The repository is the project source of truth.
- Start with modular boundaries before extracting services.
- Keep authentication and authorization separate.
- Keep architecture documentation current.
- Product direction includes Student, Developer, and Enterprise tiers.
- The platform should address broad IAM capabilities, not only login.

## Conflicts

No substantive conflicts were found. The canonical repository contained only placeholder documents and no contrary decisions, requirements, or code.

## Unresolved questions

- MVP scope and product-tier feature matrix
- Tenant isolation model and immutable identifiers
- Service boundaries and deployment target
- Database, messaging, consistency, and key-management architecture
- Token storage, revocation, audit retention, and indexing
- API contracts and implementation order for authentication protocols

## Discarded information

- No source code was migrated because none was present in the migration package.
- Hypothetical designs and “candidate” components were recorded as direction, research, or open questions rather than commitments.
- Duplicate migration instructions and historical process notes were not copied into canonical product documentation.

## Recommended next steps

1. Decide the MVP and tier boundaries.
2. Turn the domain model into reviewed schema and API proposals.
3. Define the first modular implementation slice and its security tests.
4. Add authoritative protocol and security references as research proceeds.

## Product-direction amendment

After the initial migration, the product direction was narrowed to an open
Authentication and Cybersecurity Principles platform. ADR-005 records the
decision to prioritize protocol learning, visualization, developer tooling,
isolated attack-and-defense labs, and secure reference implementations while
deferring enterprise application connectivity and access governance.
