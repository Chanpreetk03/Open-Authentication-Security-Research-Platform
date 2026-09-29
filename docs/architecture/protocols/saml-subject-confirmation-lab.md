# SAML Bearer SubjectConfirmation Candidate Lab

## Purpose

The lab models validation of multiple bearer `SubjectConfirmation` alternatives.
Each candidate is evaluated as a complete unit: bearer method, exact ACS
recipient, future `NotOnOrAfter`, and matching `InResponseTo` for a solicited
response. One complete valid candidate is sufficient; fields cannot be mixed
across candidates.

The backend policy helpers `MatchesBearerConfirmation` and
`HasValidBearerConfirmation` own these decisions. Expiry is exclusive: a
candidate is invalid at `NotOnOrAfter`. This lab intentionally has no clock
skew allowance for the confirmation expiry check.

## Standards boundary

The OASIS SAML Profiles specification says multiple bearer confirmations may
be present and successful evaluation of a single one is sufficient
([SAML V2.0 Profiles, assertion processing](https://docs.oasis-open.org/security/saml/v2.0/saml-profiles-2.0-os.pdf)).
The approved errata specifies the bearer profile's `Recipient`,
`NotOnOrAfter`, and conditional `InResponseTo` checks ([SAML 2.0 approved errata](https://docs.oasis-open.org/security/saml/v2.0/sstc-saml-approved-errata-2.0-cd-02.html)).

## Simulation boundary

The trace uses synthetic candidates. It does not parse SAML XML, validate
signatures or issuer trust, create a real session, or contact an identity
provider. Those checks are assumed or intentionally outside this policy slice.

## Verification

Go tests cover a passing candidate, alternatives, cross-candidate field
mixing, wrong method, request mismatch, empty candidates, and the exclusive
expiry boundary. HTTP and frontend contract tests cover the scenario API and
trace mapping.
