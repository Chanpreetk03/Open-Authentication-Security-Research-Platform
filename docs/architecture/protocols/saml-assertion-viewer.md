# SAML Assertion Viewer

## Purpose

Protocol Studio includes a browser-local viewer for inspecting the structure of
synthetic or user-provided SAML 2.0 responses and assertions. It accepts raw XML
or Base64-encoded UTF-8 `SAMLResponse` values, including the form parameter
representation used by the HTTP-POST binding.

## Processing boundary

- Parsing runs in the web client. Input is not sent to the API, persisted, or
  used to make network requests.
- XML is parsed as `application/xml`; DTD and entity declarations are rejected.
- Parsing is namespace-aware and only extracts selected response/assertion
  fields. Unrecognized content is ignored.
- Input, assertion, attribute, and attribute-value counts are bounded.
- Subject identifiers and attribute values are hidden in the interface until
  the user explicitly reveals them. HTTP(S) destination and recipient values
  omit URL userinfo, query values, and fragments.

## What it does not establish

This is an inspection aid, not an identity provider or service provider, SAML
validator, or conformance checker. Detecting a `ds:Signature` element does not
verify cryptographic integrity, signature coverage, certificate/key trust, or
issuer identity. The viewer does not decrypt encrypted assertions or determine
whether conditions, audience, destination, recipient, request correlation,
replay, or service-provider policy permit acceptance. No report from this tool
should be used to authenticate a user or authorize access.

## Verification

Unit tests cover raw XML and Base64 input, namespace-aware field extraction,
standalone assertions, malformed and unsupported XML, DTD/entity rejection,
encrypted assertions, output limits, and endpoint-value redaction.
