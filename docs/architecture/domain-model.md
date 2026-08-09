# Domain Model

Core concepts include principal, identity, credential, claim, application,
client, session, token, role, permission, policy, group, federation
configuration, external identity, and audit event.

Authorization can be expressed as `Can principal P perform action A on resource
R in context C?`. The initial RBAC relationship is `User -> Role -> Permission`.

Core concepts include principal, identity, credential, claim, application,
client, session, token, role, permission, policy, group, federation
configuration, external identity, and audit event.

Authorization can be expressed as:

`Can principal P perform action A on resource R in context C?`

The initial RBAC relationship is `User -> Role -> Permission`. A later
policy-based model combines subject attributes, resource attributes, action,
and environment to produce a decision.
