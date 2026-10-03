# Open Authentication Protocol Workbench and Security Sandbox

An open, local-first workbench for building, running, inspecting, testing, and
safely attacking authentication protocol exchanges. The goal is a Postman-like
developer experience specialized for OAuth/OIDC, tokens and cryptographic
artifacts, federation protocols, and their security behavior. This is not a
general-purpose IAM provider or production identity service.

The repository is the source of truth for product requirements, architecture,
security decisions, and implementation plans. Start with the [product
vision](docs/product/product-vision.md), [research-backed plan](docs/research/auth-protocol-workbench-and-sandbox.md),
[system overview](docs/architecture/system-overview.md), and [roadmap](docs/roadmap/roadmap.md).

## Current implementation

The current application is an early local prototype, not yet the full
workbench described by the plan. It contains:

- A Go API that returns deterministic synthetic OAuth authorization-code
  traces for secure, missing-state, and missing-PKCE scenarios.
- A React/TypeScript UI for those traces and one defense-in-depth lesson.
- Browser-local JWT decoding, offline HTTP request/redirect inspection, SAML
  assertion viewing, and SAML metadata inspection.
- Synthetic SAML exercises for replay, request correlation, audience,
  recipient, time conditions, signature binding, and subject confirmation.

The OAuth and SAML API exercises emit synthetic traces; they do not run real
identity providers, authenticate users, or accept uploaded SAML messages. The
JWT inspector decodes but does not verify signatures. The SAML viewers parse
locally and do not establish signature or issuer trust. See the [web
guide](web/README.md) for each tool's boundaries.

## Run locally

Start the API from `backend/`:

```sh
go run ./cmd/server
```

Start the web client from `web/` in another terminal:

```sh
npm install
npm run dev
```

See [ADR-006](docs/adr/006-oauth-flow-explorer-mvp.md) for the scope of the
first implemented slice. See [ADR-007](docs/adr/007-auth-protocol-workbench-and-sandbox.md)
for the current product direction.
