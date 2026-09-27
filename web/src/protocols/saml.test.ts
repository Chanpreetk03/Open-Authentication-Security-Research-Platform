// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { inspectSaml } from "./saml";

const assertionXml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" ID="_response" Version="2.0" IssueInstant="2030-01-01T12:00:00Z" Destination="https://sp.example.test/consume" InResponseTo="_request">
  <saml:Issuer>https://idp.example.test/metadata</saml:Issuer>
  <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/><samlp:StatusMessage>Authenticated</samlp:StatusMessage></samlp:Status>
  <ds:Signature><ds:SignedInfo/></ds:Signature>
  <saml:Assertion ID="_assertion" Version="2.0" IssueInstant="2030-01-01T12:00:00Z">
    <saml:Issuer>https://idp.example.test/metadata</saml:Issuer>
    <saml:Subject><saml:NameID Format="email">learner@example.test</saml:NameID><saml:SubjectConfirmation Method="bearer"><saml:SubjectConfirmationData Recipient="https://sp.example.test/consume" InResponseTo="_request" NotOnOrAfter="2030-01-01T12:05:00Z"/></saml:SubjectConfirmation></saml:Subject>
    <saml:Conditions NotBefore="2030-01-01T11:55:00Z" NotOnOrAfter="2030-01-01T12:05:00Z"><saml:AudienceRestriction><saml:Audience>https://sp.example.test/entity</saml:Audience></saml:AudienceRestriction></saml:Conditions>
    <saml:AuthnStatement AuthnInstant="2030-01-01T11:59:00Z" SessionIndex="_session"><saml:AuthnContext><saml:AuthnContextClassRef>urn:test:password</saml:AuthnContextClassRef></saml:AuthnContext></saml:AuthnStatement>
    <saml:AttributeStatement><saml:Attribute Name="role"><saml:AttributeValue>learner</saml:AttributeValue></saml:Attribute></saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

describe("inspectSaml", () => {
  it("extracts response, assertion, conditions, confirmation, authn, and attributes", () => {
    const result = inspectSaml(assertionXml);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.rootType).toBe("Response");
    expect(result.report.response).toMatchObject({
      id: "_response",
      issuer: "https://idp.example.test/metadata",
      statusCode: "urn:oasis:names:tc:SAML:2.0:status:Success",
      signed: true,
    });
    expect(result.report.assertions[0]).toMatchObject({
      id: "_assertion",
      nameId: "learner@example.test",
      conditions: { audiences: ["https://sp.example.test/entity"] },
      subjectConfirmations: [{ method: "bearer", recipient: "https://sp.example.test/consume", inResponseTo: "_request" }],
      authentication: [{ authnInstant: "2030-01-01T11:59:00Z", sessionIndex: "_session", contextClass: "urn:test:password" }],
      attributes: [{ name: "role", format: "", values: ["learner"] }],
    });
    expect(result.report.assertions[0].signed).toBe(false);
    expect(result.report.findings.map((finding) => finding.title)).toContain("XML signature not validated");
  });

  it("decodes Base64 SAMLResponse form values with UTF-8 safely", () => {
    const form = new URLSearchParams({ SAMLResponse: toBase64(assertionXml) }).toString();
    const result = inspectSaml(form);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.inputEncoding).toBe("Base64 XML");
    expect(result.report.assertions[0].nameId).toBe("learner@example.test");
  });

  it("redacts endpoint credentials and query values from report output", () => {
    const xml = assertionXml.split("https://sp.example.test/consume").join("https://user:secret@sp.example.test/consume?ticket=private");
    const result = inspectSaml(xml);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const output = JSON.stringify(result.report);
    expect(output).not.toContain("secret");
    expect(output).not.toContain("ticket=private");
    expect(result.report.response?.destination).toContain("?[query omitted]");
  });

  it("accepts standalone SAML Assertion roots", () => {
    const standalone = assertionXml.slice(assertionXml.indexOf("<saml:Assertion"), assertionXml.indexOf("</saml:Assertion>") + "</saml:Assertion>".length)
      .replace("<saml:Assertion", '<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"');
    const result = inspectSaml(standalone);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.report.rootType).toBe("Assertion");
  });

  it("rejects DTD and entity declarations before XML parsing", () => {
    const dtd = `<!DOCTYPE samlp:Response [<!ENTITY xxe SYSTEM "file:///secret">]>${assertionXml}`;
    expect(inspectSaml(dtd)).toMatchObject({ ok: false, error: expect.stringContaining("DOCTYPE and entity") });
  });

  it("rejects malformed XML, unsupported roots, and invalid Base64", () => {
    expect(inspectSaml("<saml:Response>").ok).toBe(false);
    expect(inspectSaml("<root xmlns='urn:other'/>").ok).toBe(false);
    expect(inspectSaml("%%%not-base64%%%").ok).toBe(false);
    expect(inspectSaml(" ").ok).toBe(false);
  });

  it("reports missing signatures and opaque encrypted assertions without claiming validation", () => {
    const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:EncryptedAssertion/></samlp:Response>`;
    const result = inspectSaml(xml);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.encryptedAssertionCount).toBe(1);
    expect(result.report.findings.map((finding) => finding.title)).toContain("Encrypted assertion not decrypted");
    expect(result.report.findings.map((finding) => finding.title)).not.toContain("No XML signature element found");
  });

  it("enforces size and assertion-count limits", () => {
    expect(inspectSaml("x".repeat(256 * 1024 + 1)).ok).toBe(false);
    const tooMany = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${"<saml:Assertion/>".repeat(21)}</samlp:Response>`;
    expect(inspectSaml(tooMany)).toMatchObject({ ok: false, error: expect.stringContaining("Too many assertions") });
  });
});
