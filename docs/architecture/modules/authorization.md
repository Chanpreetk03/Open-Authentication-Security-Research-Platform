# Authorization Concepts in Protocol Tests

The workbench is not a central authorization or policy engine. Authorization decisions may be modeled by a synthetic resource server or relying party when a protocol test needs to demonstrate scope, role, audience, or access-control behavior.

Keep those rules in the target/profile that owns them. A trace should show which target made the decision and what evidence it used; do not infer a general authorization decision from successful authentication.
