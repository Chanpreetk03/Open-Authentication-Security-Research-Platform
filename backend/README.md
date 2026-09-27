# OAuth/OIDC Explorer API

Run the local API from this directory:

```sh
go run ./cmd/server
```

The API listens on `127.0.0.1:8080` for local development.

The explorer exposes:

- `GET /api/health`
- `GET /api/flows/oauth/scenarios`
- `GET /api/flows/saml/scenarios`
- `GET /api/flows/saml/replay?scenario=replay-protected|replay-disabled`
- `GET /api/flows/saml/correlation/scenarios`
- `GET /api/flows/saml/correlation?scenario=correlation-required|correlation-ignored`
- `GET /api/flows/oauth/authorization-code?scenario=secure|missing-state|missing-pkce`

The secure reference flow runs from authorization request through a synthetic
protected resource request. Failure scenarios are deterministic simulations;
they do not contact external providers or use real credentials or profile data.
Protocol secrets are redacted or omitted before events are returned to the web
client.
