# Product Vision

Build an open, local-first **authentication protocol workbench and security
sandbox**. Developers and security learners use it to configure authentication
flows, run them against controlled targets, inspect protocol messages and
artifacts, verify security properties, reproduce weaknesses, compare secure
behavior, and reset the scenario.

The product combines the familiar request, collection, and environment model
of an API client with protocol-aware state visualization, conformance checks,
artifact inspection, and isolated attack exercises. Its core loop is:

**Configure → Execute → Observe → Validate → Attack → Compare → Reset**

The first product depth is OAuth 2.0, OpenID Connect, JWT/JWS/JWE, and HTTP
behavior. SAML follows, then WebAuthn/passkeys, LDAP, Kerberos, and additional
authentication mechanisms as complete protocol packs. “All protocols and
algorithms” is a long-term coverage ambition, not a promise that every module
will ship at once.

This is not a general-purpose IAM service, identity provider, access governance
suite, or enterprise connector marketplace. Identity providers, directories,
and relying parties exist as local fixtures or user-selected test targets for
protocol work. Production IAM capabilities are outside the product goal.

The product is local-first. Vulnerable targets use synthetic data and isolated,
resettable scenarios. Active testing of external systems is a separate,
explicitly scoped mode for systems the user is authorized to test.
