# Protocol Studio

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The Studio currently includes an OAuth/OIDC flow explorer, a browser-only JWT
inspector, and an offline HTTP request/redirect inspector. The Vite development
server proxies OAuth `/api` requests to the Go API at `http://localhost:8080`;
the JWT, HTTP, and SAML tools do not call the API. The Academy's OAuth lesson
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

Run the frontend unit tests and production build with:

```sh
npm test
npm run build
```
