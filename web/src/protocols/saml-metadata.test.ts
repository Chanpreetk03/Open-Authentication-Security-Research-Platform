// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { inspectSamlMetadata } from "./saml-metadata";

const metadata = `<md:EntitiesDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" validUntil="2030-01-01T00:00:00Z">
  <md:EntityDescriptor entityID="https://idp.example.test/metadata">
    <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
      <md:SingleSignOnService Binding="redirect" Location="https://idp.example.test/sso?ticket=secret"/>
      <md:KeyDescriptor use="signing"><ds:KeyInfo><ds:X509Data><ds:X509Certificate>cHVibGljLWRhdGE=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor>
      <saml:NameIDFormat>urn:test:email</saml:NameIDFormat>
    </md:IDPSSODescriptor>
    <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
      <md:AssertionConsumerService Binding="post" Location="https://user:password@sp.example.test/consume#secret" index="1" isDefault="true"/>
    </md:SPSSODescriptor>
  </md:EntityDescriptor>
</md:EntitiesDescriptor>`;

describe("inspectSamlMetadata", () => {
  it("extracts entities, IdP/SP endpoints, formats, and key usage without returning certificate data", () => {
    const result = inspectSamlMetadata(metadata, Date.parse("2029-01-01T00:00:00Z"));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.rootType).toBe("EntitiesDescriptor");
    expect(result.report.entities).toHaveLength(1);
    expect(result.report.entities[0]).toMatchObject({ entityId: "https://idp.example.test/metadata", validity: "valid" });
    expect(result.report.entities[0].roles.map((role) => role.kind)).toEqual(["Identity Provider", "Service Provider"]);
    expect(result.report.entities[0].roles[0].certificates).toEqual([{ use: "signing", count: 1 }]);
    expect(result.report.entities[0].roles[0].nameIdFormats).toEqual(["urn:test:email"]);
    const output = JSON.stringify(result.report);
    expect(output).not.toContain("cHVibGljLWRhdGE=");
    expect(output).not.toContain("ticket=secret");
    expect(output).not.toContain("password");
    expect(output).not.toContain("#secret");
  });

  it("checks expiry and inherits the aggregate validUntil value", () => {
    const expired = inspectSamlMetadata(metadata, Date.parse("2031-01-01T00:00:00Z"));
    expect(expired.ok && expired.report.entities[0].validity).toBe("expired");
    expect(expired.ok && expired.report.findings.map((finding) => finding.title)).toContain("Metadata validity window expired");

    const nested = `<md:EntitiesDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" validUntil="2035-01-01T00:00:00Z"><md:EntitiesDescriptor validUntil="2030-01-01T00:00:00Z"><md:EntityDescriptor entityID="urn:test:nested"/></md:EntitiesDescriptor></md:EntitiesDescriptor>`;
    const nestedResult = inspectSamlMetadata(nested, Date.parse("2031-01-01T00:00:00Z"));
    expect(nestedResult.ok && nestedResult.report.entities[0].validity).toBe("expired");
  });

  it("accepts one EntityDescriptor as the document root", () => {
    const single = `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="urn:test:entity"><md:AttributeAuthorityDescriptor/></md:EntityDescriptor>`;
    const result = inspectSamlMetadata(single);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.report.entities[0].roles[0].kind).toBe("Other SAML role");
  });

  it("rejects DTD/entity declarations, malformed XML, unsupported roots, and oversized input", () => {
    expect(inspectSamlMetadata(`<!DOCTYPE x [<!ENTITY y SYSTEM "file:///secret">]>${metadata}`).ok).toBe(false);
    expect(inspectSamlMetadata("<md:EntityDescriptor>").ok).toBe(false);
    expect(inspectSamlMetadata("<root xmlns='urn:other'/>").ok).toBe(false);
    expect(inspectSamlMetadata("x".repeat(1024 * 1024 + 1)).ok).toBe(false);
  });

  it("bounds entity count and clearly warns when metadata trust is unknown", () => {
    const many = `<md:EntitiesDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">${"<md:EntityDescriptor entityID='urn:test'/>".repeat(51)}</md:EntitiesDescriptor>`;
    expect(inspectSamlMetadata(many)).toMatchObject({ ok: false, error: expect.stringContaining("Too many entities") });
    const unsigned = inspectSamlMetadata("<md:EntityDescriptor xmlns:md='urn:oasis:names:tc:SAML:2.0:metadata' entityID='urn:test'/>");
    expect(unsigned.ok && unsigned.report.findings.map((finding) => finding.title)).toContain("Metadata trust not established");
    expect(unsigned.ok && unsigned.report.findings.map((finding) => finding.title)).toContain("No XML signature element found");
  });
});
