# Protocol Studio

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The Studio currently includes an OAuth/OIDC flow explorer, a browser-only JWT
inspector, and an offline HTTP request/redirect inspector. The Vite development
server proxies OAuth `/api` requests to the Go API at `http://localhost:8080`;
the JWT, HTTP, SAML assertion, and SAML metadata tools do not call the API. The
SAML replay, request-correlation, audience, and recipient labs use synthetic traces from the Go API.
The Academy's OAuth lesson
uses the API's synthetic OAuth scenarios to provide attack and verification
evidence.

The JWT inspector only decodes three-part compact JWS tokens. It does not
verify signatures, establish issuer trust, or decrypt five-part JWE tokens.
Avoid pasting production credentials into a learning or development tool.

The HTTP inspector accepts HTTP(S) URLs and raw HTTP/1.x requests/responses. It
does not send, replay, or follow requests. Query credentials and sensitive
headers are masked, and message bodies are omitted from output.

The SAML viewer parses raw XML or Base64 `SAMLResponse` data in the browser. It
rejects DTD/entity declarations, performs no external lookups, and masks
subject/attribute values by default. It is not a SAML validator: XML signatures,
issuer trust, conditions, audience, replay protection, and service-provider
acceptance are not verified.

The SAML metadata inspector lists entities, role descriptors, selected protocol
endpoints, and certificate presence/use declarations from pasted XML. It does
not fetch metadata, verify XML signatures or X.509 certificates, authenticate
the source, or create trusted federation configuration.

The SAML replay lab compares repeated acceptance with a replay-cache-protected
ACS simulation. It assumes configured issuer trust and a valid signature and
models all assertion checks as passing; it does not process real SAML messages,
create real sessions, or test a deployed service provider.

The SAML request-correlation lab demonstrates how an ACS binds
`Response.InResponseTo` to the pending SP request for a browser transaction. Its
vulnerable trace illustrates login CSRF/account substitution when that match is
ignored. It assumes the other assertion checks pass and does not process real
SAML.

The SAML audience lab exercises the AudienceRestriction matching rule: at least
one audience in each restriction must match the SP entity ID. It uses a
synthetic assertion and assumes all other checks pass.

The SAML recipient lab compares the bearer confirmation's `Recipient` with the
configured ACS URL. It assumes all other assertion checks and validity windows
pass and is not an SAML validator.

Run the frontend unit tests and production build with:

```sh
npm test
npm run build
```
