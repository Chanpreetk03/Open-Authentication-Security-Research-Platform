# HTTP Request and Redirect Inspector

## First vertical boundary

The Studio tool accepts a pasted HTTP(S) URL or raw textual request/response.
Its simplified line parser accepts HTTP/1.0, HTTP/1.1, and an HTTP/2 version
token, but does not parse HTTP/2 messages. It parses locally and displays a
sanitized endpoint, URL parameters, headers, and basic cookie attributes. It
never sends or replays the message, follows a redirect, accesses the network,
or persists input.

## Redaction and limits

- Built-in sensitive-name patterns and explicit rules mask selected query
  parameters and headers, including authorization/cookie headers, `Location`,
  and `Referer` values. This is best-effort redaction: a custom credential name
  that does not match a rule may remain visible. Sanitize input before pasting.
- Message bodies are measured but omitted because they may contain secrets or
  personal data.
- URLs are limited to HTTP(S); raw messages are capped at 64 KiB and 200
  headers.
- The simplified textual line parser accepts HTTP/1.0, HTTP/1.1, or an HTTP/2
  version token. It does not parse HTTP/2 messages, frames, or wire format and
  is not a full HTTP parser, proxy, packet capture tool, or conformance validator.
- A finding is an observation from the pasted text, not proof of exploitability
  or a complete security assessment.

The local-only boundary is deliberate for this first slice. Live traffic
capture, proxying, request replay, and body inspection require separate threat
modeling and explicit user decisions.
