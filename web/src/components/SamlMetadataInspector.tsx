import { useState, type FormEvent } from "react";
import { inspectSamlMetadata, type MetadataInspectionResult } from "../protocols/saml-metadata";

const EXAMPLE_METADATA = `<md:EntitiesDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" validUntil="2030-01-01T00:00:00Z">
  <md:EntityDescriptor entityID="https://idp.example.test/metadata">
    <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
      <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.test/sso?tenant=demo"/>
      <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.test/logout"/>
      <md:KeyDescriptor use="signing"><ds:KeyInfo><ds:X509Data><ds:X509Certificate>c3ludGhldGljLWNlcnRpZmljYXRl</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor>
      <saml:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</saml:NameIDFormat>
    </md:IDPSSODescriptor>
  </md:EntityDescriptor>
  <md:EntityDescriptor entityID="https://app.example.test/metadata">
    <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol" AuthnRequestsSigned="false" WantAssertionsSigned="true">
      <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://app.example.test/saml/consume" index="0" isDefault="true"/>
      <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://app.example.test/saml/logout"/>
    </md:SPSSODescriptor>
  </md:EntityDescriptor>
</md:EntitiesDescriptor>`;

export function SamlMetadataInspector() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<MetadataInspectionResult | null>(null);

  function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(inspectSamlMetadata(input));
  }

  function loadExample() {
    setInput(EXAMPLE_METADATA);
    setResult(null);
  }

  return <>
    <header className="hero metadata-hero">
      <p className="eyebrow">Protocol Studio / SAML 2.0</p>
      <h1>Read the metadata. Verify trust elsewhere.</h1>
      <p className="intro">Map federation entities, roles, endpoints, and key descriptors from XML without contacting any identity provider.</p>
    </header>
    <section className="metadata-workbench" aria-label="SAML metadata inspector">
      <div className="metadata-boundary" role="note">
        <strong>Local metadata inspection only</strong>
        <span>XML stays in this browser. DTD/entity declarations are rejected; no URLs are fetched. Signature and certificate trust are not verified.</span>
      </div>
      <form onSubmit={inspect}>
        <label className="metadata-label" htmlFor="metadata-input">SAML metadata XML</label>
        <textarea id="metadata-input" autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} value={input} onChange={(event) => { setInput(event.target.value); setResult(null); }} placeholder="Paste EntityDescriptor or EntitiesDescriptor XML..." rows={10} />
        <div className="metadata-actions">
          <button className="run-button" type="submit">Inspect metadata</button>
          <button className="example-button" onClick={loadExample} type="button">Load synthetic example</button>
        </div>
      </form>
      {result && <div className="metadata-result" aria-live="polite">
        {result.ok ? <MetadataReport report={result.report} /> : <p className="metadata-error" role="alert">{result.error}</p>}
      </div>}
    </section>
  </>;
}

function MetadataReport({ report }: { report: Extract<MetadataInspectionResult, { ok: true }>["report"] }) {
  return <>
    <div className="metadata-summary">
      <div><span>Document</span><strong>{report.rootType}</strong></div>
      <div><span>Entities</span><strong>{report.entities.length}</strong></div>
      <div><span>XML signature</span><strong>{report.signaturePresent ? "Present, not verified" : "Not present"}</strong></div>
    </div>
    <section className="metadata-findings" aria-label="Metadata trust observations">
      <h2>Trust observations</h2>
      {report.findings.map((finding, index) => <article className={`metadata-finding ${finding.severity}`} key={`${finding.title}-${index}`}>
        <span>{finding.severity}</span><div><h3>{finding.title}</h3><p>{finding.description}</p></div>
      </article>)}
    </section>
    <section className="metadata-entities" aria-label="Metadata entities">
      {report.entities.map((entity, entityIndex) => <article className="metadata-entity" key={`${entity.entityId}-${entityIndex}`}>
        <p className="metadata-kicker">Entity {entityIndex + 1} / {entity.validity === "expired" ? "Expired" : entity.validity === "valid" ? "Within validUntil" : "Validity unknown"}</p>
        <h2>{entity.entityId || "(entityID missing)"}</h2>
        <dl className="metadata-fields">
          <div><dt>Valid until</dt><dd>{entity.validUntil || "(not declared)"}</dd></div>
          <div><dt>Cache duration</dt><dd>{entity.cacheDuration || "(not declared)"}</dd></div>
          <div><dt>XML ID</dt><dd>{entity.id || "(not declared)"}</dd></div>
        </dl>
        {entity.roles.map((role, roleIndex) => <section className="metadata-role" key={`${role.kind}-${roleIndex}`}>
          <h3>{role.kind}</h3>
          <p className="metadata-protocol">{role.protocolSupport || "Protocol support not declared"}</p>
          <div className="metadata-role-summary"><span>{role.endpoints.length} endpoint(s)</span><span>{role.certificates.reduce((sum, cert) => sum + cert.count, 0)} KeyDescriptor certificate(s), not validated</span></div>
          {role.nameIdFormats.length > 0 && <div className="metadata-formats"><strong>NameID formats</strong>{role.nameIdFormats.map((format, index) => <code key={index}>{format}</code>)}</div>}
          {role.certificates.length > 0 && <div className="metadata-formats"><strong>Certificate uses</strong>{role.certificates.map((certificate) => <code key={certificate.use}>{certificate.use}: {certificate.count}</code>)}</div>}
          {role.endpoints.length > 0 && <div className="metadata-endpoints">
            {role.endpoints.map((endpoint, endpointIndex) => <div className="metadata-endpoint" key={`${endpoint.kind}-${endpointIndex}`}>
              <strong>{endpoint.kind}</strong><span>{endpoint.location || "(Location missing)"}</span><small>{endpoint.binding || "Binding not declared"}{endpoint.index ? ` / index ${endpoint.index}` : ""}{endpoint.isDefault ? ` / default ${endpoint.isDefault}` : ""}</small>
            </div>)}
          </div>}
        </section>)}
        {entity.roles.length === 0 && <p className="metadata-empty">No role descriptors found.</p>}
      </article>)}
    </section>
  </>;
}
