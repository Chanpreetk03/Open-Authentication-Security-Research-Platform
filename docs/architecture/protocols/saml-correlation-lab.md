# SAML Request-Correlation Lab

## Purpose

Two synthetic SAML browser-SSO traces show how a service provider correlates a
response to an SP-initiated request:

- `correlation-required`: the ACS compares the response-level `InResponseTo`
  value with request state held for the initiating browser and rejects a
  mismatch.
- `correlation-ignored`: the ACS ignores that mismatch and demonstrates account
  substitution when an attacker-controlled response is delivered in another
  browser's transaction.

The protocol-owned Go package emits the traces; the web client consumes them
through the shared SAML trace renderer. The API accepts only a scenario ID.

## Simulation boundary

All identities, request IDs, and assertions are synthetic. The exercise assumes
trusted issuer configuration, a valid signature, and successful audience,
recipient, and time checks so it isolates response correlation. It does not
parse or sign SAML XML, authenticate anyone, create sessions, or contact a real
IdP or ACS. The secure trace preserves an unrelated pending request when the
mismatch is rejected; a real implementation should consume the matching
transaction atomically only on successful acceptance.

Unsolicited IdP-initiated SSO is not treated as an implicit exception. A
deployment that supports it needs a separately defined and tested acceptance
policy rather than bypassing SP-initiated correlation.

## Verification

Go tests cover mismatch rejection, preservation of the pending request,
no-session outcome, vulnerable account substitution, unsupported scenarios,
ordered synthetic traces, and route status/JSON behavior. Frontend contract
tests cover correlation API URLs and conversion into the shared event model.
