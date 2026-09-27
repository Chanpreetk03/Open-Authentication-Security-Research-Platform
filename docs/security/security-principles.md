# Security Principles

- Security is a first-class architectural concern.
- Use defense in depth: place distinct, complementary controls at meaningful
  trust transitions rather than relying on one control to cover every failure.
- Never store plaintext passwords; use reviewed password-hashing facilities.
- Treat credentials, tokens, signing keys, and private keys as secrets.
- Document acquisition, verification, issuance, expiry, revocation, replay
  protection, and recovery for each authentication flow.
- Use reviewed standard cryptographic libraries in production; custom
  cryptography is limited to isolated learning exercises.

The first executable learning exercise applies defense in depth to OAuth
callback correlation and authorization-code binding. See the [Academy lesson](../academy/defense-in-depth-oauth.md).
