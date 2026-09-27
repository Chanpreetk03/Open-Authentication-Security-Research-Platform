# HTTP Request and Redirect Inspector

## First vertical boundary

The Studio tool accepts a pasted HTTP(S) URL or raw HTTP/1.x request/response.
It parses locally and displays a sanitized endpoint, URL parameters, headers,
and basic cookie attributes. It never sends or replays the message, follows a
redirect, accesses the network, or persists input.

## Redaction and limits

- Credential-shaped query parameters, authorization/cookie headers,
  `Location`, and `Referer` values are masked before display.
- Message bodies are measured but omitted because they may contain secrets or
  personal data.
- URLs are limited to HTTP(S); raw messages are capped at 64 KiB and 200
  headers.
- Only HTTP/1.x and HTTP/2-style start lines are summarized; this is not a full
  HTTP parser, proxy, packet capture tool, or protocol conformance validator.
- A finding is an observation from the pasted text, not proof of exploitability
  or a complete security assessment.

The local-only boundary is deliberate for this first slice. Live traffic
capture, proxying, request replay, and body inspection require separate threat
modeling and explicit user decisions.
