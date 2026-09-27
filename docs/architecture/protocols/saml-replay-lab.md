# SAML Replay Lab

## Purpose

Protocol Studio provides two deterministic traces that isolate assertion
replay behavior during a synthetic SAML HTTP-POST browser SSO flow:

- `replay-protected`: the ACS records an accepted assertion ID and rejects its
  second use before creating another session.
- `replay-disabled`: the ACS has no replay cache and accepts the same modeled
  assertion again, producing a second synthetic session and a high-severity
  finding.

The Go `internal/saml` package owns scenario semantics and emits redacted events;
the web client selects scenarios, renders the trace, and explains one selected
event. The API receives only a scenario identifier.

## Simulation assumptions and boundary

This is a teaching trace, not an SAML implementation. Every value is synthetic.
The exercise assumes configured issuer trust and a valid signature, and models
time, audience, recipient, and other baseline assertion checks as successful
for both deliveries. It does not parse or sign XML, authenticate users, create
real sessions, accept uploaded assertions, or contact an IdP or ACS. The trace
isolates whether a previously accepted assertion ID is remembered.

## Security behavior shown

An assertion can be otherwise valid when replayed; signature validation alone
does not provide one-time use. A relying party should atomically check and
record assertion IDs, keyed in the context of the issuer, for at least as long
as the assertion could still be accepted. Distributed ACS instances need a
shared replay store. This control complements signature/issuer trust, time,
audience, recipient, and request-correlation checks; it does not replace them.

## Verification

Go tests establish ordered events, the single-session secure outcome, the
two-session replay-disabled outcome, finding/mitigation presence, deterministic
timestamps, and rejection of unsupported scenarios. Frontend contract tests
cover mapping of the API trace into the shared Protocol Studio event model.
