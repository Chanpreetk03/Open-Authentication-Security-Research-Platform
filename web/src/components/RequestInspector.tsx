import { useState, type FormEvent } from "react";
import { inspectHttpInput, type HttpInspectionResult } from "../protocols/http-inspector";

const EXAMPLES = {
  callback: "GET /callback?code=demo-auth-code&state=demo-state&scope=openid%20profile HTTP/1.1\nHost: app.example.test\nAuthorization: Bearer demo-access-token\nCookie: session=demo-session",
  redirect: "HTTP/1.1 302 Found\nLocation: https://app.example.test/callback?code=demo-auth-code&state=demo-state\nSet-Cookie: session=demo-session; Path=/; Secure; HttpOnly; SameSite=Lax",
};

export function RequestInspector() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<HttpInspectionResult | null>(null);

  function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(inspectHttpInput(input));
  }

  function loadExample(example: keyof typeof EXAMPLES) {
    setInput(EXAMPLES[example]);
    setResult(null);
  }

  return <>
    <header className="hero request-hero">
      <p className="eyebrow">Protocol Studio / HTTP</p>
      <h1>Inspect the exchange. Keep the traffic local.</h1>
      <p className="intro">Paste a redirect URL or raw HTTP request/response to examine its target, headers, and query parameters without sending or replaying it.</p>
    </header>

    <section className="request-workbench" aria-label="HTTP request and redirect inspector">
      <div className="request-boundary" role="note">
        <strong>Offline by design</strong>
        <span>Input stays in this browser. No request is sent, no redirect is followed, and message bodies are omitted. Redaction is best-effort: built-in name patterns and explicit rules mask selected values, but custom credential names may pass through. Sanitize input before pasting.</span>
      </div>
      <form onSubmit={inspect}>
        <label className="request-label" htmlFor="http-input">HTTP message or redirect URL</label>
        <textarea
          id="http-input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
          }}
          placeholder={'GET /callback?code=... HTTP/1.1\nHost: app.example.test'}
          rows={7}
        />
        <div className="request-actions">
          <button className="run-button" type="submit">Inspect message</button>
          <button className="example-button" onClick={() => loadExample("callback")} type="button">Load callback example</button>
          <button className="example-button" onClick={() => loadExample("redirect")} type="button">Load redirect example</button>
        </div>
      </form>

      {result && <div className="request-result" aria-live="polite">
        {result.ok ? <InspectionResult result={result} /> : <p className="request-error" role="alert">{result.error}</p>}
      </div>}
    </section>
  </>;
}

function InspectionResult({ result }: { result: Extract<HttpInspectionResult, { ok: true }> }) {
  const { inspection } = result;
  return <>
    <div className="request-summary">
      <div><span className="request-kicker">Message</span><strong>{inspection.summary}</strong></div>
      <div><span className="request-kicker">Endpoint</span><code>{inspection.endpoint}</code></div>
      <div><span className="request-kicker">Body</span><strong>{inspection.bodyLength ? `${inspection.bodyLength} bytes omitted` : "None"}</strong></div>
    </div>

    <section className="request-findings" aria-label="Inspection findings">
      <h2>Observations</h2>
      {inspection.findings.map((finding, index) => <article className={`request-finding ${finding.severity}`} key={`${finding.title}-${index}`}>
        <span>{finding.severity}</span>
        <div><h3>{finding.title}</h3><p>{finding.description}</p></div>
      </article>)}
    </section>

    {inspection.parameters.length > 0 && <section className="request-data-section">
      <h2>{inspection.kind === "response" || inspection.kind === "url" ? "Redirect / URL parameters" : "Request target parameters"}</h2>
      <div className="request-parameter-list">
        {inspection.parameters.map((parameter, index) => <div className="request-parameter" key={`${parameter.name}-${index}`}>
          <code>{parameter.name}</code><span className={parameter.redacted ? "is-redacted" : ""}>{parameter.value}</span>
          {parameter.redacted && <small>masked</small>}
        </div>)}
      </div>
    </section>}

    {inspection.headers.length > 0 && <section className="request-data-section">
      <h2>Headers</h2>
      <div className="request-header-list">
        {inspection.headers.map((header, index) => <div className="request-header" key={`${header.name}-${index}`}>
          <code>{header.name}</code><span className={header.redacted ? "is-redacted" : ""}>{header.value}</span>
          {header.redacted && <small>masked</small>}
        </div>)}
      </div>
    </section>}
  </>;
}
