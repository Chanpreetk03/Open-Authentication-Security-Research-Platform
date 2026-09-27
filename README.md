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
inspector and offline HTTP request/redirect inspector; neither sends user input
to the API. The Cybersecurity Principles Academy includes a guided
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
