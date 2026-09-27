# Defense in Depth: OAuth State and PKCE

## Learning objectives

- Explain what OAuth `state` correlates and what a PKCE verifier binds.
- Observe why a missing-state callback is not the same failure as a missing
  PKCE challenge.
- Use trace evidence to verify the expected behavior of the secure reference
  flow.

## Learning loop

1. Run the missing-state simulation and predict why the injected code is
   rejected. The trace shows the callback accepted without state, followed by
   token-endpoint rejection because the PKCE verifier does not match.
2. Run the missing-PKCE simulation and predict the attack impact. The trace
   shows an attacker redeeming an intercepted code and reaching a synthetic
   protected resource.
3. Run the secure reference flow. The Academy checks for state, an S256 PKCE
   challenge, client token issuance/resource access, and no scenario finding.

The first two steps reproduce expected teaching evidence; they are not secure
passes. The final step is the mitigation verification.

## Principle

Defense in depth uses distinct controls across related trust transitions.
OAuth `state` lets a client correlate a callback with the browser transaction.
PKCE binds an authorization code to the verifier held by the initiating
client. PKCE can provide CSRF protection when the client has confirmed server
support, but the controls are not interchangeable in purpose or evidence.

## Safety boundary

All traces are deterministic, synthetic API responses. No provider, browser
redirect, attacker host, real credential, or real resource is involved. The
exercise evaluates the existing redacted trace adapter and does not create a
second OAuth implementation.
