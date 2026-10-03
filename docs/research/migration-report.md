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

## Historical migration context

The migration package described a broad IAM platform, enterprise tiers, and a reference identity engine. That direction was first narrowed by ADR-005 and has now been superseded by ADR-007. Those migration statements are retained as historical context, not current requirements.

## Current product direction

The current product is an authentication protocol workbench and security sandbox. Protocol actors such as identity providers, clients, resource servers, service providers, directories, and KDCs are local fixtures or explicitly scoped test targets; they are not a platform-owned production identity service.

Current architecture and requirements are maintained in the [product vision](../product/product-vision.md), [PRD](../product/PRD.md), [product architecture](../architecture/product-architecture.md), and [workbench/sandbox plan](auth-protocol-workbench-and-sandbox.md).
