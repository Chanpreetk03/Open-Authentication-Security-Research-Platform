export type CapabilityMode =
  | "Local inspection"
  | "Synthetic simulation"
  | "Learning content"
  | "Cryptographic verification"
  | "Standards/profile validation"
  | "Live interoperability";

type CapabilityRecord = {
  id: string;
  name: string;
  mode: CapabilityMode;
  protocolScope: string;
  supported: string;
  exclusions: string;
};

export const CAPABILITY_CATALOG = [
  {
    id: "oauth",
    name: "OAuth flow",
    mode: "Synthetic simulation",
    protocolScope: "OAuth 2.0 authorization-code flow; no standards-conformance profile is claimed.",
    supported: "Generates redacted traces for state and PKCE S256 enabled/disabled combinations.",
    exclusions: "No real authorization server, provider redirect, credentials, network exchange, or interoperable token issuance.",
  },
  {
    id: "jwt",
    name: "JWT inspector",
    mode: "Local inspection",
    protocolScope: "Three-segment compact JWS JWT structure and selected registered claims; no RFC conformance claim.",
    supported: "Decodes untrusted header/payload JSON, reports selected claim timing observations, detects a five-segment JWE shape, and limits input to 64 KiB.",
    exclusions: "No signature verification, trusted-key selection, issuer/audience policy, remote key fetch, JWE decryption, or identity decision.",
  },
  {
    id: "http",
    name: "Request inspector",
    mode: "Local inspection",
    protocolScope: "Absolute HTTP(S) URLs and a simplified textual request/response line parser that accepts HTTP/1.0, HTTP/1.1, or an HTTP/2 version token; this is not HTTP/2 message support.",
    supported: "Inspects target, headers, and selected parameters; masks values matching built-in sensitive-name patterns and explicit rules; omits bodies. Limits input to 64 KiB and 200 headers.",
    exclusions: "Redaction is best-effort: unrecognized custom credential names may remain visible, so sanitize pasted input first. Does not parse bodies, send/replay traffic, follow redirects, parse HTTP/2 frames or wire format, or establish endpoint behavior or full HTTP conformance.",
  },
  {
    id: "academy",
    name: "Defense in Depth Academy",
    mode: "Learning content",
    protocolScope: "OAuth 2.0 authorization-code teaching scenarios, reusing the OAuth flow traces.",
    supported: "Teaches with synthetic traces: the distinct evidence for missing state, missing PKCE, and the secure reference scenario.",
    exclusions: "Not a separate protocol engine, real-provider test, user-authentication flow, or standards validator.",
  },
  {
    id: "saml",
    name: "SAML viewer",
    mode: "Local inspection",
    protocolScope: "Selected fields from SAML 2.0 Response and Assertion XML; raw XML or Base64 SAMLResponse input.",
    supported: "Browser-local structural extraction with DTD/entity rejection; input max 256 KiB, 20 assertions, 100 attributes per assertion, 20 values per attribute, and 500 displayed characters per value. Sensitive values are initially hidden.",
    exclusions: "No XML signature verification, signer trust, decryption, complete policy validation, user authentication, or service-provider conformance.",
  },
  {
    id: "metadata",
    name: "SAML metadata",
    mode: "Local inspection",
    protocolScope: "SAML 2.0 EntityDescriptor and EntitiesDescriptor metadata shapes.",
    supported: "Summarizes entities, roles, endpoints, NameID formats, validity dates, and declared certificate uses; input max 1 MiB, 50 entities, 100 endpoints per role, 50 NameID formats per role, and 20 certificate entries per role.",
    exclusions: "Does not fetch metadata or endpoints, verify signatures/certificates, import configuration, or establish federation trust.",
  },
  {
    id: "saml-replay",
    name: "SAML replay lab",
    mode: "Synthetic simulation",
    protocolScope: "SAML 2.0 synthetic HTTP-POST browser-SSO trace; replay-cache behavior only.",
    supported: "Compares duplicate assertion acceptance with an assertion-ID replay cache.",
    exclusions: "No XML processing or real ACS; issuer trust, signature, and surrounding assertion checks are assumed.",
  },
  {
    id: "saml-correlation",
    name: "SAML request binding lab",
    mode: "Synthetic simulation",
    protocolScope: "SAML 2.0 Response InResponseTo correlation in an SP-initiated synthetic trace.",
    supported: "Compares required request correlation with a scenario that ignores the response correlation value.",
    exclusions: "No real messages, XML, ACS, or sessions; issuer, signature, audience, recipient, and time checks are assumed.",
  },
  {
    id: "saml-audience",
    name: "SAML audience lab",
    mode: "Synthetic simulation",
    protocolScope: "SAML 2.0 AudienceRestriction group-matching rule.",
    supported: "Models whether the relying party appears in each required alternative group.",
    exclusions: "No real XML or sessions; issuer trust, signature, recipient, and time checks are assumed.",
  },
  {
    id: "saml-recipient",
    name: "SAML recipient lab",
    mode: "Synthetic simulation",
    protocolScope: "SAML 2.0 bearer SubjectConfirmationData Recipient comparison.",
    supported: "Models exact configured ACS URL matching for a recipient value.",
    exclusions: "No URL normalization or real XML; signature, issuer, audience, correlation, and time checks are assumed.",
  },
  {
    id: "saml-conditions",
    name: "SAML time conditions lab",
    mode: "Synthetic simulation",
    protocolScope: "SAML 2.0 Conditions NotBefore/NotOnOrAfter time-window evaluation.",
    supported: "Models inclusive NotBefore, exclusive NotOnOrAfter, and a configured 30-second clock-skew allowance.",
    exclusions: "No real XML; signature, issuer, audience, and recipient checks are assumed.",
  },
  {
    id: "saml-signature-binding",
    name: "SAML signature binding lab",
    mode: "Synthetic simulation",
    protocolScope: "Synthetic XML Signature verified-node to identity-mapper binding invariant.",
    supported: "Models whether identity processing consumes the exact node selected as verified.",
    exclusions: "No XML parsing, digest/signature cryptography, certificate trust, or real authentication; cryptographic validity is assumed.",
  },
  {
    id: "saml-subject-confirmation",
    name: "SAML confirmation candidates lab",
    mode: "Synthetic simulation",
    protocolScope: "SAML 2.0 bearer SubjectConfirmation candidate evaluation.",
    supported: "Evaluates method, recipient, expiry, and request correlation independently for each candidate.",
    exclusions: "No real XML, signature validation, issuer trust, or user authentication; assertion/signature validity is assumed.",
  },
] as const satisfies readonly CapabilityRecord[];

export type CapabilityId = (typeof CAPABILITY_CATALOG)[number]["id"];
