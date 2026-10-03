# Run Audit and Evidence

The workbench records security-relevant control-plane operations and run evidence: scenario creation, external target selection, active checks, stop/reset/destroy, and report export.

This is not an enterprise identity audit service. Keep logs local by default, redact secrets before persistence/export, define retention, and bind evidence to pack/scenario versions. Target-side protocol events belong to the exchange trace; control-plane lifecycle events belong to the local run audit.
