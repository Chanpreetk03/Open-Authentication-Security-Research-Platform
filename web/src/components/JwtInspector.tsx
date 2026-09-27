import { useState, type FormEvent } from "react";
import { inspectCompactJwt, type JwtInspectionResult } from "../protocols/jwt";

const DEMO_HEADER = { alg: "HS256", typ: "JWT", kid: "demo-key-01" };

function encodeBase64Url(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function syntheticToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://issuer.example.test",
    sub: "learner-01",
    aud: "demo-api",
    iat: now,
    exp: now + 3600,
    scope: "profile:read",
  };
  return `${encodeBase64Url(DEMO_HEADER)}.${encodeBase64Url(payload)}.ZGVtby1ub3QtYS1yZWFsLXNpZ25hdHVyZQ`;
}

export function JwtInspector() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<JwtInspectionResult | null>(null);

  function inspect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(inspectCompactJwt(token));
  }

  function loadExample() {
    setToken(syntheticToken());
    setResult(null);
  }

  return <>
    <header className="hero jwt-hero">
      <p className="eyebrow">Protocol Studio / JWT</p>
      <h1>Read the token. Don’t trust the token.</h1>
      <p className="intro">Inspect the visible structure and registered claims of a compact JWT. Decoding is not signature verification, and claims are not proof of identity.</p>
    </header>

    <section className="jwt-workbench" aria-label="JWT inspection tool">
      <div className="jwt-boundary" role="note">
        <strong>Local-only inspection</strong>
        <span>Your token is decoded in this browser and is not sent to the API or saved. The signature is never verified.</span>
      </div>

      <form onSubmit={inspect}>
        <label className="jwt-label" htmlFor="jwt-input">Compact JWT</label>
        <textarea
          id="jwt-input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setResult(null);
          }}
          placeholder="Paste a three-segment compact JWT..."
          rows={5}
        />
        <div className="jwt-actions">
          <button className="run-button" type="submit">Inspect token</button>
          <button className="example-button" onClick={loadExample} type="button">Load synthetic example</button>
        </div>
      </form>

      {result && <div className="jwt-result" aria-live="polite">
        {result.ok ? <InspectionResult result={result} /> : <p className="jwt-error" role="alert">{result.error}</p>}
      </div>}
    </section>
  </>;
}

function InspectionResult({ result }: { result: Extract<JwtInspectionResult, { ok: true }> }) {
  const { inspection } = result;
  return <>
    <div className="jwt-summary">
      <div><span className="jwt-kicker">Declared algorithm</span><strong>{inspection.algorithm}</strong></div>
      <div><span className="jwt-kicker">Signature bytes</span><strong>{inspection.signatureSegment ? "Present (unverified)" : "Empty"}</strong></div>
      <div><span className="jwt-kicker">Registered claims</span><strong>{inspection.claims.length}</strong></div>
    </div>

    <section className="jwt-findings" aria-label="Inspection findings">
      <h2>What this inspection can tell you</h2>
      {inspection.findings.map((finding, index) => <article className={`jwt-finding ${finding.severity}`} key={`${finding.title}-${index}`}>
        <span>{finding.severity}</span>
        <div><h3>{finding.title}</h3><p>{finding.description}</p></div>
      </article>)}
    </section>

    <div className="jwt-data-grid">
      <section className="jwt-data-panel">
        <p className="jwt-kicker">Base64url JSON / untrusted input</p>
        <h2>Protected header</h2>
        <pre>{JSON.stringify(inspection.header, null, 2)}</pre>
      </section>
      <section className="jwt-data-panel">
        <p className="jwt-kicker">Base64url JSON / untrusted input</p>
        <h2>Payload</h2>
        <pre>{JSON.stringify(inspection.payload, null, 2)}</pre>
      </section>
    </div>

    {inspection.claims.length > 0 && <section className="jwt-claims">
      <h2>Registered claims</h2>
      <div className="claim-table" role="table" aria-label="Registered JWT claims">
        {inspection.claims.map((claim) => <div className="claim-row" role="row" key={claim.name}>
          <code role="cell">{claim.name}</code>
          <span role="cell">{claim.value}</span>
          <small role="cell">{claim.meaning}</small>
        </div>)}
      </div>
    </section>}
  </>;
}
