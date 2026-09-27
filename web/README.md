# Protocol Studio

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The Studio currently includes an OAuth/OIDC flow explorer, a browser-only JWT
inspector, and an offline HTTP request/redirect inspector. The Vite development
server proxies OAuth `/api` requests to the Go API at `http://localhost:8080`;
the JWT and HTTP inspectors do not call the API.

The JWT inspector only decodes three-part compact JWS tokens. It does not
verify signatures, establish issuer trust, or decrypt five-part JWE tokens.
Avoid pasting production credentials into a learning or development tool.

The HTTP inspector accepts HTTP(S) URLs and raw HTTP/1.x requests/responses. It
does not send, replay, or follow requests. Query credentials and sensitive
headers are masked, and message bodies are omitted from output.

Run the frontend unit tests and production build with:

```sh
npm test
npm run build
```
