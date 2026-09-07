# OAuth/OIDC Explorer API

Run the local API from this directory:

```sh
go run ./cmd/server
```

The first slice exposes:

- `GET /api/health`
- `GET /api/flows/oauth/authorization-code`

Protocol secrets are redacted or omitted before events are returned to the
web client.
