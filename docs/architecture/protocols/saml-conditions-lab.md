# SAML Conditions Time-Window Lab

## Purpose

The lab compares enforcement and deliberate bypass of SAML assertion time
conditions. The Go helper `IsWithinConditionWindow` applies an inclusive
`NotBefore` start and exclusive `NotOnOrAfter` end with an explicitly configured
clock-skew allowance. The trace uses a 30-second tolerance and an assertion
expired beyond that tolerance.

The interval semantics are specified by [OASIS SAML Core, section 2.5.1.2](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf).
The selected skew allowance is relying-party policy, not a value supplied by
the assertion or a universal SAML default.

## Simulation boundary

All values are synthetic. Issuer trust, signature, audience, and recipient are
assumed valid so the exercise isolates time evaluation. It does not parse XML,
authenticate users, create sessions, or contact an IdP or ACS. The helper
expects a complete interval; missing/malformed timestamp parsing is outside
this simulation helper and must be handled by a real assertion parser.

## Verification

Go tests cover inclusive/exclusive endpoints, tolerance edges, impossible
windows, negative skew, secure rejection, and deliberate bypass. API and
frontend contract tests cover routing and event mapping.
