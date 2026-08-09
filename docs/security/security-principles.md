# Security Principles

- Security is a first-class architectural concern.
- Never store plaintext passwords; use reviewed password-hashing facilities.
- Treat credentials, tokens, signing keys, and private keys as secrets.
- Document acquisition, verification, issuance, expiry, revocation, replay
  protection, and recovery for each authentication flow.
- Use reviewed standard cryptographic libraries in production; custom
  cryptography is limited to isolated learning exercises.
