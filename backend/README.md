# Local Protocol Scenario API

This Go API currently returns synthetic, deterministic OAuth and SAML scenario traces. It is not an identity provider, service provider, conformance server, or attack runner.

Run locally from this directory:

```sh
go run ./cmd/server
```

The API binds to `127.0.0.1:8080`. Endpoints and scenario IDs are listed below. Responses contain synthetic event data and omit or redact protocol secrets.

- `GET /api/health`
- `GET /api/flows/oauth/scenarios`
- `GET /api/flows/oauth/authorization-code?scenario=secure|missing-state|missing-pkce`
- `GET /api/flows/saml/scenarios`
- `GET /api/flows/saml/replay?scenario=replay-protected|replay-disabled`
- `GET /api/flows/saml/correlation/scenarios`
- `GET /api/flows/saml/correlation?scenario=correlation-required|correlation-ignored`
- `GET /api/flows/saml/audience/scenarios`
- `GET /api/flows/saml/audience?scenario=audience-enforced|audience-ignored`
- `GET /api/flows/saml/recipient/scenarios`
- `GET /api/flows/saml/recipient?scenario=recipient-enforced|recipient-ignored`
- `GET /api/flows/saml/conditions/scenarios`
- `GET /api/flows/saml/conditions?scenario=conditions-enforced|conditions-ignored`
- `GET /api/flows/saml/signature-binding/scenarios`
- `GET /api/flows/saml/signature-binding?scenario=signature-binding-enforced|signature-binding-ignored`
- `GET /api/flows/saml/subject-confirmation/scenarios`
- `GET /api/flows/saml/subject-confirmation?scenario=subject-confirmation-enforced|subject-confirmation-mixed`

See the root [product plan](../docs/research/auth-protocol-workbench-and-sandbox.md) for the target workbench and runner architecture.
