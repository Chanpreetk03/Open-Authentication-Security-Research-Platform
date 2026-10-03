# Token and Key Concepts in Test Targets

Tokens, signing keys, API keys, and refresh-token families are protocol artifacts or synthetic target state, not platform-managed production credentials.

Token packs distinguish decoding, construction, cryptographic verification, key selection, claim policy, expiry, revocation, and replay checks. Use reviewed cryptographic libraries for actual signing/verification. Keep private keys and reusable token values out of traces and exports; reset destroys scenario keys and token state.
