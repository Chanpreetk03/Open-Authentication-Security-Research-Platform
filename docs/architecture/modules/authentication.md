# Authentication Protocol Concepts

This note does not define a shared authentication service. Authentication behavior belongs to the protocol pack or test target that implements the relevant flow: password exchange, OAuth/OIDC, SAML, LDAP bind, Kerberos, MFA, or WebAuthn.

Each pack documents credential handling, challenges, verification, expiry, replay, failure, and recovery semantics for that protocol. Use reviewed libraries for security-sensitive operations. Targets use synthetic users and credentials and are destroyed or reset with the scenario.
