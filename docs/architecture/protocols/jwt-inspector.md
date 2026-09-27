# JWT Inspector

## First vertical boundary

The JWT Studio tool is a browser-local inspector for three-segment compact
JWS tokens. It decodes the protected header and payload as untrusted JSON,
shows selected registered claims, and reports structural or temporal
observations. The compact input is held in component memory only; it is not
posted to the API or persisted by the application.

## Security limits

- Decoding does not verify a signature or authenticate an issuer.
- Header values, including `alg`, `kid`, `jku`, and `x5u`, are untrusted input.
- The inspector never retrieves keys from token-provided URLs.
- Claim observations do not establish that an application should trust or
  accept the token; relying-party policy and validation are context-dependent.
- Five-segment encrypted JWE tokens are identified but not decrypted.
- Tokens above 64 KiB and malformed compact encodings are rejected.

This tool is for learning and inspection, not production token validation.
Signature verification, trusted key selection, issuer/audience policy, and
JWE support require separate explicit designs and verification tests.
