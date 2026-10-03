import { describe, expect, it } from "vitest";
import { inspectHttpInput } from "./http-inspector";

describe("inspectHttpInput", () => {
  it("leaves an unknown custom credential header visible so the best-effort warning is accurate", () => {
    const result = inspectHttpInput("GET / HTTP/1.1\nX-Internal-Access: demo-secret-value");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.headers).toContainEqual({ name: "X-Internal-Access", value: "demo-secret-value", redacted: false });
  });

  it("parses a request target while masking sensitive query and headers", () => {
    const result = inspectHttpInput([
      "GET /callback?code=auth-code&state=browser-state&scope=openid HTTP/1.1",
      "Host: app.example.test",
      "Authorization: Bearer access-token",
      "Cookie: session=session-secret",
      "Referer: https://idp.example.test/callback?code=referer-code",
    ].join("\r\n"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.kind).toBe("request");
    expect(result.inspection.endpoint).toBe("/callback");
    expect(result.inspection.parameters).toEqual([
      { name: "code", value: "********", redacted: true },
      { name: "state", value: "********", redacted: true },
      { name: "scope", value: "openid", redacted: false },
    ]);
    expect(JSON.stringify(result.inspection)).not.toContain("auth-code");
    expect(JSON.stringify(result.inspection)).not.toContain("browser-state");
    expect(JSON.stringify(result.inspection)).not.toContain("access-token");
    expect(JSON.stringify(result.inspection)).not.toContain("session-secret");
    expect(JSON.stringify(result.inspection)).not.toContain("referer-code");
  });

  it("parses redirect responses, masks Location credentials, and checks cookie flags", () => {
    const result = inspectHttpInput([
      "HTTP/1.1 302 Found",
      "Location: /callback?code=temporary-code&state=temporary-state",
      "Set-Cookie: session=cookie-secret; Path=/; HttpOnly; SameSite=Lax",
    ].join("\n"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.kind).toBe("response");
    expect(result.inspection.endpoint).toBe("/callback");
    expect(result.inspection.headers.find((header) => header.name === "Location")?.value).not.toContain("temporary-code");
    expect(result.inspection.headers.find((header) => header.name === "Set-Cookie")?.value).toContain("session=********");
    expect(result.inspection.findings.map((finding) => finding.title)).toContain("Cookie lacks Secure");
    expect(result.inspection.findings.map((finding) => finding.title)).not.toContain("Cookie lacks HttpOnly");
    expect(JSON.stringify(result.inspection)).not.toContain("cookie-secret");
  });

  it("checks HTTPS URLs without exposing user info, sensitive parameters, or fragments", () => {
    const result = inspectHttpInput("https://user:password@example.test/authorize?client_id=demo&client_secret=shh#access_token=fragment-token");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.endpoint).toBe("https://example.test/authorize");
    expect(JSON.stringify(result.inspection)).not.toContain("password");
    expect(JSON.stringify(result.inspection)).not.toContain("shh");
    expect(JSON.stringify(result.inspection)).not.toContain("fragment-token");
    expect(result.inspection.findings.map((finding) => finding.title)).toContain("URL fragment omitted");
    expect(result.inspection.findings.map((finding) => finding.title)).not.toContain("Destination uses HTTP");
  });

  it("flags cleartext destinations and sensitive URL values without sending a request", () => {
    const result = inspectHttpInput("http://service.example.test/resource?access_token=secret-token");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const titles = result.inspection.findings.map((finding) => finding.title);
    expect(titles).toContain("Destination uses HTTP");
    expect(titles).toContain("Sensitive-looking value is in the URL");
    expect(JSON.stringify(result.inspection)).not.toContain("secret-token");
    expect(titles).toContain("Offline inspection");
  });

  it("omits bodies and identifies redirects without a Location header", () => {
    const result = inspectHttpInput("POST /token HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nclient_secret=body-secret");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.bodyLength).toBeGreaterThan(0);
    expect(JSON.stringify(result.inspection)).not.toContain("body-secret");
    expect(result.inspection.findings.map((finding) => finding.title)).toContain("Message body omitted");

    const redirect = inspectHttpInput("HTTP/1.1 302 Found\nCache-Control: no-store");
    expect(redirect.ok).toBe(true);
    if (!redirect.ok) return;
    expect(redirect.inspection.findings.map((finding) => finding.title)).toContain("Redirect response has no Location header");
  });

  it("rejects unsupported or malformed messages and oversized input", () => {
    expect(inspectHttpInput("").ok).toBe(false);
    expect(inspectHttpInput("ftp://example.test/path").ok).toBe(false);
    expect(inspectHttpInput("garbage input").ok).toBe(false);
    expect(inspectHttpInput("x".repeat(64 * 1024 + 1)).ok).toBe(false);
  });
});
