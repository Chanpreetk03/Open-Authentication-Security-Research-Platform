# SAML Audience Validation Lab

## Purpose

The lab demonstrates SAML 2.0 `AudienceRestriction` evaluation for a service
provider entity ID. The secure trace enforces each restriction; the vulnerable
trace deliberately ignores the computed mismatch and models acceptance by the
wrong relying party.

The protocol-owned helper `SatisfiesAudienceRestrictions` applies OR within a
single restriction and AND across separate restrictions. An empty set of
restrictions, an empty group, or an empty configured SP entity ID fails closed.

## Simulation boundary

All identities and assertions are synthetic. Signature, issuer trust, recipient,
and time checks are assumed to pass so the lab isolates audience evaluation.
The API emits a trace; it does not parse XML, authenticate users, create
sessions, or contact a real IdP or ACS. The helper does not replace complete
SAML response and assertion validation.

## Verification

Go unit tests cover OR-within/AND-across semantics, empty policy fail-closed
cases, secure rejection where one restriction fails, vulnerable acceptance, and
unsupported scenarios. HTTP handler tests cover the scenario catalog and both
trace variants; frontend tests verify API mapping and the evaluated result.
