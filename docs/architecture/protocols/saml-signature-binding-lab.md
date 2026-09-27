# SAML XML Signature Binding Lab

## Purpose

The synthetic lesson models an XML-signature-wrapping failure: a signature
verifier resolves and validates one assertion node, while application logic
independently selects a different node and consumes its claims. The secure
scenario requires identity processing to use the exact parsed node returned by
the verifier; the vulnerable scenario ignores that binding.

The Go helper `ConsumesVerifiedAssertion` compares object identity, not only
assertion ID strings. Duplicate IDs or a second document lookup must not make a
different node appear to be the verified object. A real signature integration
must also reject ambiguous ID resolution and handle only the validated
reference target.

## Standards boundary

W3C XML Signature core validation requires both validation of the signature
over `SignedInfo` and validation of each referenced digest ([XML Signature 1.1, core validation](https://www.w3.org/TR/xmldsig-core/#sec-CoreValidation)).
The [XML Signature Best Practices](https://www.w3.org/TR/xmldsig-bestpractices/)
recommend retaining the verified referenced content for application use.
Cryptographic validation and signer trust are distinct from the node-binding
decision modeled here.

## Simulation boundary

All nodes and subjects are synthetic. The trace assumes signature value and
reference digest checks succeeded for one node, but performs no cryptography,
XML parsing, authentication, session creation, or network access. It teaches
the integration invariant; it does not certify an XML Signature library or
constitute a complete SAML validator.

## Verification

Go tests prove that the same object is accepted, distinct objects with the same
ID are rejected, and nil nodes fail closed. Scenario and API tests distinguish
secure rejection from vulnerable consumption; frontend tests cover the trace
contract.
