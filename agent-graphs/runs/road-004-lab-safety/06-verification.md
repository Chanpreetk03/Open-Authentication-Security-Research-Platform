# D6 — Verification

## Checks

- `git diff --check`: passed.
- Relative Markdown links under `docs/` and `agent-graphs/`: passed.
- Cross-checked the 14 requirement IDs against ROAD-004's requested topics and
  the acceptance cases in `03-acceptance.md`: all topics have a stated owner,
  enforcement boundary, and verification signal.
- Cross-checked research claims against the inline primary-source links and
  requirement-level source/project-policy mapping in
  `docs/research/lab-safety-control-guidance.md`.
- Cross-checked LAB-14's test against its digest/provenance requirement; it
  does not assume an unselected signature format.
- No code tests apply: this change only specifies requirements and updates
  architecture/security documentation; it does not implement or claim runtime
  controls.

## Gaps and deferred proof

- No runtime exists here to execute isolation probes. ROAD-006 must choose an
  adapter and demonstrate denied host/network/filesystem access, resource
  limits, cross-run isolation, reset, cleanup, and failure recovery.
- Product-wide numeric ceilings, supported platform matrix, and any persistent
  trace/export policy remain open. Defaults fail closed until selected and
  enforced.
- Real users have not evaluated this specification; no usability or demand
  claim is made.
