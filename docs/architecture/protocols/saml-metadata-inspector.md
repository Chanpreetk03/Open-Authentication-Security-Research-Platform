# SAML Metadata Inspector

## Purpose

Protocol Studio can inspect pasted SAML 2.0 `EntityDescriptor` and
`EntitiesDescriptor` XML to make federation topology easier to understand. It
summarizes entity IDs, IdP/SP role descriptors, selected SSO/SLO/ACS endpoints,
NameID formats, metadata validity dates, and certificate presence/use declared
inside key descriptors.

## Processing boundary

- Parsing runs in the browser. The tool does not fetch metadata or endpoint
  URLs, call the API, persist input, import configuration, or expose certificate
  contents in its report.
- DTD/entity declarations are rejected; the XML document and number of entities,
  endpoints, and certificate entries are bounded.
- HTTP(S) endpoint display removes URL userinfo, query values, and fragments.
- `validUntil` is compared with the current local clock; container-level
  `validUntil` is used when an entity does not declare its own. `cacheDuration`
  is displayed only and is not interpreted as a trust or freshness guarantee.

## Trust limitations

The tool does not verify XML signatures, signature coverage, X.509 validity,
key usage, signer identity, metadata source authenticity, or whether an entity
should be trusted. A detected certificate is only evidence that certificate
material was declared under a `KeyDescriptor`. Do not use this report to
establish a federation or authorize users.

## Verification

Tests cover aggregate and single-entity documents, IdP/SP roles, endpoint and
key-use extraction, inherited validity dates, expired metadata, sensitive URL
redaction, malformed/unsupported XML, declaration rejection, and size/count
limits.
