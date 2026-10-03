# D3 — Acceptance and risk map

## Acceptance

1. The catalog enumerates every current tool exactly once; no active capability
   is omitted or duplicated.
2. Every entry states its mode, protocol/format and version scope, what the app
   actually does, and what it does not establish.
3. No current feature is described as cryptographic verification,
   standards/profile validation, or live interoperability. Explicitly state
   that these distinct modes are not implemented.
4. Every current tool's active view displays its mode and supported scope; the
   app exposes a complete, keyboard-accessible catalog view.
5. Academy is classified as learning content and identifies the OAuth traces
   it reuses; it is not counted as a separate protocol engine.
6. Catalog limits match implementation limits (for example input size,
   supported message shapes, redaction, and assumptions) and detailed docs.
   HTTP wording discloses that redaction is best-effort and that an HTTP/2
   token is accepted only as simplified text; SAML bounds are explicit.
7. Update ROAD-003 status and mark the prior ROAD-101 internal remediation
   complete, without asserting real user validation.

## Risks and boundaries

- **Overclaiming:** use “inspects,” “models,” and “simulates”; avoid “validates”
  except where naming a modeled rule, and qualify that it is synthetic.
- **Version ambiguity:** name the protocol and input version/format but state
  where no conformance profile/version is claimed.
- **Staleness:** one typed catalog object drives both visible UI presentations;
  data test checks IDs/modes/content.
- **Disclosure:** scope text never asks users to paste real secrets or send
  traces externally.

## Proof

Focused catalog data tests, web test suite, production build, Markdown link and
diff checks, then independent five-lens D7 review.
