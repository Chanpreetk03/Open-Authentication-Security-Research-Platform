# SAML Bearer Recipient Lab

## Purpose

The lab demonstrates that a SAML bearer `SubjectConfirmationData` recipient
must match the service provider's configured assertion consumer service (ACS)
URL. The secure trace rejects an alternate endpoint; the vulnerable trace
deliberately bypasses the check and models acceptance.

The protocol-owned helper `MatchesBearerRecipient` performs an exact,
non-empty comparison. This lab does not normalize URLs or equate alternate
paths, trailing slashes, or other spellings with the configured endpoint.

## Simulation boundary

All values are synthetic. Issuer trust, signature, audience, request
correlation, and time conditions are assumed valid to isolate recipient
matching. The API emits a teaching trace and does not parse real XML,
authenticate users, create sessions, or contact an ACS.

The trace concerns bearer `SubjectConfirmationData.Recipient`; it does not
replace validation of the Response `Destination`, assertion conditions, issuer,
signature, expiration, replay, or request correlation. If an assertion has
multiple subject confirmations, each candidate must be evaluated as a complete
confirmation rather than mixing fields across candidates.

## Verification

Go tests cover exact URL matching, mismatch, empty values, secure rejection,
vulnerable acceptance, and unsupported scenarios. HTTP route and frontend
contract tests cover the API catalog and shared trace mapping.
