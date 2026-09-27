# Protocol Studio

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The Studio currently includes an OAuth/OIDC flow explorer and a browser-only
JWT inspector. The Vite development server proxies OAuth `/api` requests to the
Go API at `http://localhost:8080`; JWT inspection does not call the API.

The JWT inspector only decodes three-part compact JWS tokens. It does not
verify signatures, establish issuer trust, or decrypt five-part JWE tokens.
Avoid pasting production credentials into a learning or development tool.

Run the frontend unit tests and production build with:

```sh
npm test
npm run build
```
