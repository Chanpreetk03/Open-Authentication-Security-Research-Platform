import { useState, type FormEvent } from "react";
import { inspectSaml, type SamlInspectionResult } from "../protocols/saml";

const EXAMPLE_SAML = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" ID="_response-demo" Version="2.0" IssueInstant="2030-01-01T12:00:00Z" Destination="https://app.example.test/sso/consume" InResponseTo="_request-demo">
  <saml:Issuer>https://idp.example.test/metadata</saml:Issuer>
  <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
  <saml:Assertion ID="_assertion-demo" Version="2.0" IssueInstant="2030-01-01T12:00:00Z">
    <saml:Issuer>https://idp.example.test/metadata</saml:Issuer>
    <ds:Signature><ds:SignedInfo/></ds:Signature>
    <saml:Subject><saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">learner@example.test</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData Recipient="https://app.example.test/sso/consume" InResponseTo="_request-demo" NotOnOrAfter="2030-01-01T12:05:00Z"/></saml:SubjectConfirmation></saml:Subject>
    <saml:Conditions NotBefore="2030-01-01T11:55:00Z" NotOnOrAfter="2030-01-01T12:05:00Z"><saml:AudienceRestriction><saml:Audience>https://app.example.test/sp</saml:Audience></saml:AudienceRestriction></saml:Conditions>
    <saml:AuthnStatement AuthnInstant="2030-01-01T11:59:00Z" SessionIndex="_session-demo"><saml:AuthnContext><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></saml:AuthnContext></saml:AuthnStatement>
    <saml:AttributeStatement><saml:Attribute Name="department"><saml:AttributeValue>research</saml:AttributeValue></saml:Attribute><saml:Attribute Name="role"><saml:AttributeValue>learner</saml:AttributeValue></saml:Attribute></saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;

export function SamlAssertionViewer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SamlInspectionResult | null>(null);
  const [revealValues, setRevealValues] = useState(false);

  function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRevealValues(false);
    setResult(inspectSaml(input));
  }

  function loadExample() {
    setInput(EXAMPLE_SAML);
    setResult(null);
    setRevealValues(false);
  }

  return <>
    <header className="hero saml-hero">
      <p className="eyebrow">Protocol Studio / SAML 2.0</p>
      <h1>Read the assertion. Don’t mistake it for trust.</h1>
      <p className="intro">Inspect SAML response and assertion structure locally. This viewer surfaces claims and signature presence, but it does not validate the XML signature or authenticate the issuer.</p>
    </header>

    <section className="saml-workbench" aria-label="SAML assertion viewer">
      <div className="saml-boundary" role="note">
        <strong>Local XML inspection only</strong>
        <span>Input stays in this browser. DTD/entity declarations are rejected; no external resources are fetched. Signature and relying-party validation are not performed.</span>
      </div>
      <form onSubmit={inspect}>
        <label className="saml-label" htmlFor="saml-input">Raw SAML XML or Base64 SAMLResponse</label>
        <textarea
          id="saml-input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={input}
          onChange={(event) => { setInput(event.target.value); setResult(null); }}
          placeholder="Paste raw SAML XML or Base64 SAMLResponse..."
          rows={9}
        />
        <div className="saml-actions">
          <button className="run-button" type="submit">Inspect assertion</button>
          <button className="example-button" onClick={loadExample} type="button">Load synthetic example</button>
        </div>
      </form>

      {result && <div className="saml-result" aria-live="polite">
        {result.ok ? <SamlReportView report={result.report} revealValues={revealValues} onRevealChange={setRevealValues} /> : <p className="saml-error" role="alert">{result.error}</p>}
      </div>}
    </section>
  </>;
}

function SamlReportView({ report, revealValues, onRevealChange }: {
  report: Extract<SamlInspectionResult, { ok: true }>['report'];
  revealValues: boolean;
  onRevealChange: (value: boolean) => void;
}) {
  return <>
    <div className="saml-summary">
      <div><span className="saml-kicker">Input</span><strong>{report.inputEncoding}</strong></div>
      <div><span className="saml-kicker">Root element</span><strong>{report.rootType}</strong></div>
      <div><span className="saml-kicker">Assertions</span><strong>{report.assertions.length}</strong></div>
      <div><span className="saml-kicker">Encryption</span><strong>{report.encryptedAssertionCount ? `${report.encryptedAssertionCount} encrypted` : "None detected"}</strong></div>
    </div>

    <section className="saml-findings" aria-label="SAML inspection findings">
      <h2>Trust and validation observations</h2>
      {report.findings.map((finding, index) => <article className={`saml-finding ${finding.severity}`} key={`${finding.title}-${index}`}>
        <span>{finding.severity}</span><div><h3>{finding.title}</h3><p>{finding.description}</p></div>
      </article>)}
    </section>

    {report.response && <section className="saml-data-section">
      <h2>Protocol response</h2>
      <dl className="saml-fields">
        <Field label="Response ID" value={report.response.id} />
        <Field label="Issuer" value={report.response.issuer} />
        <Field label="Version / Issue instant" value={`${report.response.version} / ${report.response.issueInstant}`} />
        <Field label="Destination" value={report.response.destination} />
        <Field label="In response to" value={report.response.inResponseTo} />
        <Field label="Status code" value={report.response.statusCode} />
        <Field label="Status message" value={report.response.statusMessage} />
        <Field label="Signature element" value={report.response.signed ? "Present, not verified" : "Not present on response"} />
      </dl>
    </section>}

    {report.assertions.length > 0 && <section className="saml-data-section">
      <div className="saml-assertions-heading"><h2>Assertions</h2><label><input type="checkbox" checked={revealValues} onChange={(event) => onRevealChange(event.target.checked)} /> Reveal subject and attribute values</label></div>
      {report.assertions.map((assertion, index) => <article className="saml-assertion" key={`${assertion.id}-${index}`}>
        <h3>Assertion {index + 1}</h3>
        <dl className="saml-fields">
          <Field label="ID" value={assertion.id} />
          <Field label="Issuer" value={assertion.issuer} />
          <Field label="Version / Issue instant" value={`${assertion.version} / ${assertion.issueInstant}`} />
          <Field label="Subject NameID" value={revealValues ? assertion.nameId : assertion.nameId ? "(hidden)" : "(not present)"} />
          <Field label="NameID format" value={assertion.nameIdFormat} />
          <Field label="Signature element" value={assertion.signed ? "Present, not verified" : "Not present"} />
          <Field label="Not before" value={assertion.conditions.notBefore} />
          <Field label="Not on or after" value={assertion.conditions.notOnOrAfter} />
          <Field label="Audience" value={assertion.conditions.audiences.join(", ")} />
          <Field label="Authentication context" value={assertion.authentication.map((item) => item.contextClass).filter(Boolean).join(", ")} />
          <Field label="Subject confirmations" value={assertion.subjectConfirmations.map((item) => [item.method, item.recipient, item.inResponseTo, item.notOnOrAfter].filter(Boolean).join(" / ")).join("; ")} />
        </dl>
        {assertion.attributes.length > 0 && <div className="saml-attributes">
          <h4>Attributes</h4>
          {assertion.attributes.map((attribute, attributeIndex) => <div className="saml-attribute" key={`${attribute.name}-${attributeIndex}`}>
            <code>{attribute.name}</code><span>{attribute.format || "(no format declared)"}</span>
            <div>{attribute.values.length === 0 ? "(no values)" : attribute.values.map((value, valueIndex) => <code key={valueIndex}>{revealValues ? value : "(hidden)"}</code>)}</div>
          </div>)}
        </div>}
      </article>)}
    </section>}
  </>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value || "(not present)"}</dd></div>;
}
