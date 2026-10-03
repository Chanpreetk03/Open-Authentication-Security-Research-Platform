# Open Authentication & Security Research Platform

An open Authentication and Cybersecurity Principles platform for learning,
visualizing, testing, attacking, and securing identity protocols and security
designs.

The repository is the source of truth for product requirements, architecture,
security decisions, and implementation plans. Start with [the product vision](docs/product/product-vision.md),
[the system overview](docs/architecture/system-overview.md), and [the roadmap](docs/roadmap/roadmap.md).

## First implementation

The first vertical slice is a simulated OAuth 2.0 authorization-code flow
explorer. It follows the authorization request through access to a synthetic
protected resource, with selectable state and PKCE failure scenarios. The Go
API returns redacted events and per-exchange explanations to the React and
TypeScript web client. Protocol Studio also includes a browser-local JWT
inspector, offline HTTP request/redirect inspector, and local SAML assertion
viewer; none sends user input to the API. The SAML viewer parses raw XML or a
Base64 `SAMLResponse`, masks subject/attribute values initially, and does not
validate signatures, issuer trust, or relying-party acceptance. A separate
local metadata inspector lists federation entities and endpoints without
verifying their trust, while a synthetic SAML replay lab demonstrates
assertion-ID replay-cache behavior and a request-correlation lab demonstrates
account substitution risk. Audience, recipient, time-condition, and
signature-binding and subject-confirmation labs exercise separate relying-party checks. These labs use
synthetic traces, not real SAML
messages. The
Cybersecurity Principles Academy includes a guided
defense-in-depth exercise based on the synthetic OAuth scenarios.

Start the API from `backend/`:

```sh
go run ./cmd/server
```

Start the web client from `web/` in a second terminal:

```sh
npm install
npm run dev
```

See [ADR-006](docs/adr/006-oauth-flow-explorer-mvp.md) for the agreed scope of
this first slice.

## AI development workflows

Reusable, file-based AI graphs for feature development, idea evaluation, and
debugging are in [`agent-graphs/`](agent-graphs/README.md). Copy that directory
and `.agents/skills/graph-workflows/` into another repository to reuse them.
