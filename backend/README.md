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
- `GET /api/flows/oauth/authorization-code?scenario=secure|missing-state|missing-pkce|missing-state-and-pkce`
- `POST /api/flows/oauth/authorization-code` with `{"state_enabled":boolean,"pkce_enabled":boolean}` to generate a local synthetic trace for the selected protections.

The secure reference flow runs from authorization request through a synthetic
protected resource request. Failure scenarios are deterministic simulations;
they do not contact external providers or use real credentials or profile data.
Protocol secrets are redacted or omitted before events are returned to the web
client.
