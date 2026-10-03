# Authentication Protocol Workbench UI

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The UI is an early prototype. It currently provides:

- Synthetic OAuth authorization-code scenario traces and a defense-in-depth lesson.
- A browser-local JWT decoder for three-part compact JWS tokens. It does not verify signatures, resolve trusted keys, or decrypt JWE.
- An offline HTTP URL/request/response inspector. It does not send, replay, or follow messages; it masks selected sensitive fields and omits bodies.
- A browser-local SAML assertion viewer and metadata inspector. They reject DTD/entity declarations and do not authenticate sources, verify signatures, or establish federation trust.
- Synthetic SAML replay, correlation, audience, recipient, time-condition, signature-binding, and subject-confirmation traces returned by the local API.

The OAuth and SAML trace labs do not run real protocol actors, process uploaded SAML messages, contact providers, authenticate people, or create production sessions. Parsing or decoding output is not a validation result. Avoid pasting production secrets into the prototype.

The Vite development server proxies `/api` requests to the Go API at `http://localhost:8080`. Browser-local inspectors do not call that API.

Run frontend checks with:

```sh
npm test
npm run build
```

The planned product and staged implementation are documented in the [workbench and sandbox plan](../docs/research/auth-protocol-workbench-and-sandbox.md).
