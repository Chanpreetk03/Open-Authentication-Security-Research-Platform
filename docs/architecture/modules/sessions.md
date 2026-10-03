# Session Concepts in Test Targets

Session state may be part of an OAuth/OIDC, SAML, browser, or WebAuthn target. It belongs to that protocol scenario and is synthetic and ephemeral; this document does not define a platform session service.

Scenarios can teach cookie flags, state binding, expiry, revocation, fixation, hijacking, or replay. Reset/destroy must remove session state and invalidate any associated test credentials.
