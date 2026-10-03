# Current Capability Inventory

This inventory describes behavior present in the repository today. It is not a
promise of roadmap coverage. The in-app **Coverage** view uses the corresponding
typed records in [`web/src/capabilities.ts`](../../web/src/capabilities.ts).
Detailed processing and security boundaries are linked per surface below.

## Capability labels

- **Local inspection:** parses or decodes input in the browser. It does not
  authenticate a person, verify trust, or send data to a remote service.
- **Synthetic simulation:** generates a modeled trace or decision using
  synthetic values. It is not an exchange with a real provider.
- **Learning content:** teaches through another listed capability and does not
  implement a second protocol engine.
- **Cryptographic verification:** cryptographically checks signatures, proofs,
  or related primitives. **No current feature has this label.**
- **Standards/profile validation:** checks protocol behavior against a declared
  normative standard or profile. **No current feature has this label.**
- **Live interoperability:** a real exchange with a provider or target.
  **No current feature has this label.**

An explicitly modeled rule (for example, SAML audience-group matching) is not
itself full standards validation. Unless an entry says otherwise, no standard
conformance suite or interoperability claim is made.

## Implemented surfaces

| Surface | Label | Protocol / version basis | Implemented scope | Explicit exclusions |
|---|---|---|---|---|
| OAuth flow | Synthetic simulation | OAuth 2.0 authorization-code flow; no conformance profile claimed | Redacted event traces for state/PKCE S256 enabled and disabled combinations. | No real authorization server, provider redirect, credentials, external request, or interoperable token issuance. See [OAuth module](../architecture/protocols/oauth-oidc-module.md). |
| JWT inspector | Local inspection | Three-segment compact JWS JWT structure and selected registered claims | Decodes untrusted header/payload JSON, shows selected registered claims, reports temporal observations, recognizes five-segment JWE shape; input max 64 KiB. | No signature verification, key selection, issuer/audience policy, key URL fetch, JWE decryption, or identity decision. See [JWT inspector](../architecture/protocols/jwt-inspector.md). |
| Request inspector | Local inspection | Absolute HTTP(S) URLs and a simplified textual request/response line parser accepting HTTP/1.0, HTTP/1.1, or an HTTP/2 version token; this is not HTTP/2 message support. | Inspects targets, selected headers and parameters; best-effort masks values matching built-in sensitive-name patterns and explicit rules, and omits bodies; input max 64 KiB/200 headers. | Unrecognized custom credential names may remain visible; sanitize input before pasting. No body parsing, request sending/replay, redirect following, endpoint execution, HTTP/2 frames/wire format, or full HTTP conformance. See [HTTP inspector](../architecture/protocols/http-inspector.md). |
| Defense in Depth Academy | Learning content | OAuth 2.0 authorization-code traces | Teaches state, PKCE, and secure-flow evidence by reusing the OAuth scenarios. | No separate OAuth implementation, real identity authentication, or provider integration. See [lesson](../academy/defense-in-depth-oauth.md). |
| SAML viewer | Local inspection | Selected fields from SAML 2.0 Response/Assertion XML | Browser-local raw XML or Base64 `SAMLResponse` parsing; max 256 KiB, 20 assertions, 100 attributes per assertion, 20 values per attribute, and 500 displayed characters per value. Sensitive values are initially masked. | No XML signature/trust validation, decryption, complete relying-party policy validation, or authentication. See [SAML viewer](../architecture/protocols/saml-assertion-viewer.md). |
| SAML metadata | Local inspection | SAML 2.0 `EntityDescriptor` and `EntitiesDescriptor` shapes | Summarizes entities, roles, endpoints, NameID formats, validity dates, and declared certificate uses; max 1 MiB, 50 entities, 100 endpoints per role, 50 NameID formats per role, and 20 certificate entries per role. | No metadata/endpoint fetch, XML signature or certificate verification, import, or federation trust decision. See [metadata inspector](../architecture/protocols/saml-metadata-inspector.md). |
| SAML replay lab | Synthetic simulation | SAML 2.0 synthetic HTTP-POST browser-SSO trace | Models duplicate assertion acceptance versus an assertion-ID replay cache. | No XML processing or real ACS; issuer trust, signature, and surrounding assertion checks are assumed. See [replay lab](../architecture/protocols/saml-replay-lab.md). |
| SAML request binding lab | Synthetic simulation | SAML 2.0 SP-initiated Response `InResponseTo` correlation | Models required request correlation versus ignoring the response correlation value. | No real messages, XML, ACS, or sessions; other trust and assertion checks are assumed. See [correlation lab](../architecture/protocols/saml-correlation-lab.md). |
| SAML audience lab | Synthetic simulation | SAML 2.0 `AudienceRestriction` group matching | Models whether the relying party is present in each required alternative group. | No XML or sessions; issuer trust, signature, recipient, and time checks are assumed. See [audience lab](../architecture/protocols/saml-audience-lab.md). |
| SAML recipient lab | Synthetic simulation | SAML 2.0 bearer `SubjectConfirmationData.Recipient` | Models exact comparison to a configured ACS URL. | No URL normalization or XML; signature, issuer, audience, correlation, and time checks are assumed. See [recipient lab](../architecture/protocols/saml-recipient-lab.md). |
| SAML time conditions lab | Synthetic simulation | SAML 2.0 `Conditions.NotBefore` / `NotOnOrAfter` | Models an inclusive lower bound, exclusive upper bound, and configured 30-second clock-skew allowance. | No XML; signature, issuer, audience, and recipient checks are assumed. See [time-condition lab](../architecture/protocols/saml-conditions-lab.md). |
| SAML signature binding lab | Synthetic simulation | XML Signature verified-node to identity-mapper binding invariant | Models whether identity processing uses the same assertion node selected as verified. | No XML parsing, digest/signature cryptography, certificate trust, or real authentication; cryptographic validity is assumed. See [signature-binding lab](../architecture/protocols/saml-signature-binding-lab.md). |
| SAML confirmation candidates lab | Synthetic simulation | SAML 2.0 bearer `SubjectConfirmation` candidates | Evaluates method, recipient, expiry, and request correlation independently per candidate. | No XML, signature validation, issuer trust, or user authentication; assertion/signature validity is assumed. See [subject-confirmation lab](../architecture/protocols/saml-subject-confirmation-lab.md). |

## Not implemented

- Cryptographic verification and standards/profile conformance validation for
  OAuth/OIDC/JWT or complete SAML response acceptance.
- Live interoperability with identity providers, service providers, or other
  external targets.
- LDAP, Kerberos, MFA/TOTP, WebAuthn/passkeys, or PKI/key lifecycle tools.
- An isolated executable attack-lab runtime. Current attack exercises remain
  synthetic and non-executable.

## Maintenance rule

When a capability changes, update this inventory, its typed UI record, and the
feature's detailed architecture boundary in the same change. Keep the label tied
to demonstrated behavior, not to roadmap intent or a protocol name displayed by
an input.
