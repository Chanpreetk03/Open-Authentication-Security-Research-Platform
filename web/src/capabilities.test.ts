import { describe, expect, it } from "vitest";
import { CAPABILITY_CATALOG } from "./capabilities";

const navigationCapabilities = [
  "oauth",
  "jwt",
  "http",
  "academy",
  "saml",
  "metadata",
  "saml-replay",
  "saml-correlation",
  "saml-audience",
  "saml-recipient",
  "saml-conditions",
  "saml-signature-binding",
  "saml-subject-confirmation",
];

describe("capability inventory", () => {
  it("covers every current protocol and learning surface exactly once", () => {
    const ids = CAPABILITY_CATALOG.map((capability) => capability.id);
    expect(ids).toHaveLength(navigationCapabilities.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...navigationCapabilities].sort());
  });

  it("labels current behavior without claiming validation or live interoperability", () => {
    for (const capability of CAPABILITY_CATALOG) {
      expect(capability.protocolScope.trim()).not.toBe("");
      expect(capability.supported.trim()).not.toBe("");
      expect(capability.exclusions.trim()).not.toBe("");
      expect(["Local inspection", "Synthetic simulation", "Learning content"])
        .toContain(capability.mode);
    }
  });

  it("classifies the Academy separately while disclosing its synthetic OAuth evidence", () => {
    const academy = CAPABILITY_CATALOG.find((capability) => capability.id === "academy");
    expect(academy?.mode).toBe("Learning content");
    expect(academy?.supported).toContain("synthetic");
    expect(academy?.exclusions).toContain("separate protocol engine");
  });

  it("publishes HTTP parser/redaction limits and exact SAML input bounds", () => {
    const byId = Object.fromEntries(CAPABILITY_CATALOG.map((capability) => [capability.id, capability]));
    expect(byId.http?.protocolScope).toContain("not HTTP/2 message support");
    expect(byId.http?.exclusions).toContain("unrecognized custom credential names may remain visible");
    expect(byId.saml?.supported).toContain("20 assertions");
    expect(byId.saml?.supported).toContain("100 attributes per assertion");
    expect(byId.metadata?.supported).toContain("1 MiB");
    expect(byId.metadata?.supported).toContain("100 endpoints per role");
    const assignedModes: string[] = CAPABILITY_CATALOG.map((capability) => capability.mode);
    expect(assignedModes).not.toContain("Cryptographic verification");
    expect(assignedModes).not.toContain("Standards/profile validation");
  });
});
