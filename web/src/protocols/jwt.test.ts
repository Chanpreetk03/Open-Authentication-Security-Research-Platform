import { describe, expect, it } from "vitest";
import { inspectCompactJwt } from "./jwt";

const now = Date.UTC(2030, 0, 1);

function segment(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function token(header: unknown, payload: unknown, signature = "c2ln") {
  return `${segment(header)}.${segment(payload)}.${signature}`;
}

describe("inspectCompactJwt", () => {
  it("decodes header, claims, and Unicode without claiming verification", () => {
    const input = token({ alg: "HS256", typ: "JWT" }, { sub: "learner-\u00e5", exp: now / 1000 + 60 });
    const result = inspectCompactJwt(input, now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.payload.sub).toBe("learner-\u00e5");
    expect(result.inspection.claims.find((claim) => claim.name === "exp")?.value).toContain("2030");
    expect(result.inspection.findings[0].title).toBe("Signature not verified");
  });

  it("flags an unsecured algorithm without a redundant missing-signature warning", () => {
    const result = inspectCompactJwt(token({ alg: "none" }, { sub: "demo" }, ""), now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.findings.map((finding) => finding.title)).toContain("Unsecured algorithm declared");
    expect(result.inspection.findings.map((finding) => finding.title)).not.toContain("Signature segment is empty");
  });

  it("flags temporal claim problems without treating the decode as validation", () => {
    const result = inspectCompactJwt(token({ alg: "RS256" }, { exp: now / 1000 - 1, nbf: "tomorrow", iat: now / 1000 + 1 }), now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const titles = result.inspection.findings.map((finding) => finding.title);
    expect(titles).toContain("Token is expired");
    expect(titles).toContain("Invalid nbf claim");
    expect(titles).toContain("Issued-at time is in the future");
  });

  it("warns on critical and token-directed key URL headers without fetching them", () => {
    const result = inspectCompactJwt(token({ alg: "RS256", crit: ["exp"], jku: "https://keys.example.test" }, {}), now);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.inspection.findings.map((finding) => finding.title)).toContain("Critical header parameters need processing");
    expect(result.inspection.findings.map((finding) => finding.title)).toContain("Untrusted jku header parameter");
  });

  it("rejects malformed compact tokens and encrypted JWE input", () => {
    expect(inspectCompactJwt("not-a-token").ok).toBe(false);
    expect(inspectCompactJwt("a.b.c.d.e")).toMatchObject({ ok: false, error: expect.stringContaining("encrypted JWE") });
    expect(inspectCompactJwt(`${segment({ alg: "HS256" })}.@@@.c2ln`).ok).toBe(false);
    expect(inspectCompactJwt("a".repeat(64 * 1024 + 1)).ok).toBe(false);
  });

  it("requires JSON object header and payload with a declared algorithm", () => {
    expect(inspectCompactJwt(`${segment([])}.${segment({})}.c2ln`).ok).toBe(false);
    expect(inspectCompactJwt(token({}, {})).ok).toBe(false);
  });
});
