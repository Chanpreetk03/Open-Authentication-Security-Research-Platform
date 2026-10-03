# Threat Model

The initial threat model covers replay, man-in-the-middle, CSRF, XSS, SSRF,
session hijacking, token theft, credential stuffing, brute force, privilege
escalation, federation misconfiguration, and key compromise. Analysis follows
the trust boundaries in the architecture model.

For intentionally vulnerable executable labs, the concrete attack assumptions,
control requirements, and verification cases are specified in the
[lab safety requirements](lab-safety-requirements.md). Those requirements are a
future release gate; they do not imply current runtime isolation.
