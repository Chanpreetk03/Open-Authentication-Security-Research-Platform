# API Design

The API serves the workbench and scenario control plane; it is not an enterprise IAM API. It coordinates protocol packs and scenario runs without owning a general user directory, token service, policy engine, or identity provider.

## Product resources

- Protocol pack and supported role/profile/version descriptors.
- Collections and environment configuration.
- Scenario definitions and ephemeral scenario instances.
- Run lifecycle actions: create, start, execute step, observe, reset, stop, destroy.
- Exchanges, assertions, verification results, and redacted run reports.

Protocol-specific request/response structures belong to the owning pack. The shared API envelope should include pack/version, scenario/run IDs, event order, participant, timestamps, redaction labels, result status, and evidence links.

## API requirements

- Validate every lifecycle transition and reject operations on destroyed or unauthorized runs.
- Bind each active operation to a scenario and declared capability set.
- Make start/execute/reset/stop behavior idempotent where retries are possible.
- Bound payload size, execution time, concurrency, and response size.
- Return errors that distinguish invalid protocol input, policy rejection, unavailable target, timeout, and runner failure without exposing secrets.
- Redact before data crosses the runner/control-plane boundary or is stored.
- Audit scenario creation, external target selection, active checks, reset, export, and destruction.
- Version protocol-pack and report contracts; do not normalize away protocol errors or fields.

External target configuration must not become an SSRF primitive. Require an explicit target scope and apply safe DNS/IP resolution, redirect, port, and egress policy before backend fetches or active tests are introduced.
