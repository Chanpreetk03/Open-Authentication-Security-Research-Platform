import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { JwtInspector } from "./components/JwtInspector";
import { RequestInspector } from "./components/RequestInspector";
import { DefenseInDepthLesson } from "./components/DefenseInDepthLesson";
import { SamlAssertionViewer } from "./components/SamlAssertionViewer";
import { SamlMetadataInspector } from "./components/SamlMetadataInspector";
import { SamlReplayLab } from "./components/SamlReplayLab";
import { SamlCorrelationLab } from "./components/SamlCorrelationLab";
import { SamlAudienceLab } from "./components/SamlAudienceLab";
import { SamlRecipientLab } from "./components/SamlRecipientLab";
import { SamlConditionsLab } from "./components/SamlConditionsLab";
import { SamlSignatureBindingLab } from "./components/SamlSignatureBindingLab";
import { SamlSubjectConfirmationLab } from "./components/SamlSubjectConfirmationLab";
import { runOAuthConfiguration, type ProtocolExchange } from "./protocols/oauth";
import "./styles.css";

function displayName(value: string) {
  return value.replace(/_/g, " ");
}

function App() {
  const [activeTool, setActiveTool] = useState<"oauth" | "jwt" | "http" | "academy" | "saml" | "metadata" | "saml-replay" | "saml-correlation" | "saml-audience" | "saml-recipient" | "saml-conditions" | "saml-signature-binding" | "saml-subject-confirmation">("oauth");
  const toolButton = (tool: typeof activeTool, label: string) => <button type="button" aria-current={activeTool === tool ? "page" : undefined} onClick={() => setActiveTool(tool)}>{label}</button>;
  return <main className="studio-shell">
    <nav className="tool-switcher" aria-label="Protocol Studio tools">
      <div className="tool-group" role="group" aria-label="Flows"><span>Flows</span>{toolButton("oauth", "OAuth flow")}</div>
      <div className="tool-group" role="group" aria-label="Inspectors"><span>Inspect</span>{toolButton("jwt", "JWT inspector")}{toolButton("http", "Request inspector")}{toolButton("saml", "SAML viewer")}{toolButton("metadata", "SAML metadata")}</div>
      <div className="tool-group" role="group" aria-label="Learning"><span>Learn</span>{toolButton("academy", "Academy")}</div>
      <div className="tool-group" role="group" aria-label="SAML labs"><span>SAML labs</span>{toolButton("saml-replay", "Replay")}{toolButton("saml-correlation", "Request binding")}{toolButton("saml-audience", "Audience")}{toolButton("saml-recipient", "Recipient")}{toolButton("saml-conditions", "Time conditions")}{toolButton("saml-signature-binding", "Signature binding")}{toolButton("saml-subject-confirmation", "Confirmation candidates")}</div>
    </nav>
    {activeTool === "oauth" ? <OAuthExplorer /> : activeTool === "jwt" ? <JwtInspector /> : activeTool === "http" ? <RequestInspector /> : activeTool === "academy" ? <DefenseInDepthLesson /> : activeTool === "saml" ? <SamlAssertionViewer /> : activeTool === "metadata" ? <SamlMetadataInspector /> : activeTool === "saml-replay" ? <SamlReplayLab /> : activeTool === "saml-correlation" ? <SamlCorrelationLab /> : activeTool === "saml-audience" ? <SamlAudienceLab /> : activeTool === "saml-recipient" ? <SamlRecipientLab /> : activeTool === "saml-conditions" ? <SamlConditionsLab /> : activeTool === "saml-signature-binding" ? <SamlSignatureBindingLab /> : <SamlSubjectConfirmationLab />}
  </main>;
}

function OAuthExplorer() {
  const [flow, setFlow] = useState<ProtocolExchange | null>(null);
  const [stateEnabled, setStateEnabled] = useState(true);
  const [pkceEnabled, setPkceEnabled] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runFlow() {
    setLoading(true);
    setError("");
    try {
      const nextFlow = await runOAuthConfiguration({ stateEnabled, pkceEnabled });
      setFlow(nextFlow);
      setSelectedEvent(nextFlow.messages[0]?.sequence ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run the flow.");
    } finally {
      setLoading(false);
    }
  }

  const activeEvent = flow?.messages.find((message) => message.sequence === selectedEvent);

  return <>
    <header className="hero">
      <p className="eyebrow">Protocol Studio / OAuth 2.0</p>
      <h1>See the flow. Inspect the decision. Learn the defense.</h1>
      <p className="intro">Choose protections for a local synthetic simulation, then inspect what happened and what the trace demonstrates.</p>

      <fieldset className="protection-controls" disabled={loading}>
        <legend>Authorization flow protections</legend>
        <label><input type="checkbox" checked={stateEnabled} onChange={(event) => {
            setStateEnabled(event.target.checked);
            setFlow(null);
            setSelectedEvent(null);
            setError("");
          }} /> Validate OAuth state against the browser session</label>
        <label><input type="checkbox" checked={pkceEnabled} onChange={(event) => {
            setPkceEnabled(event.target.checked);
            setFlow(null);
            setSelectedEvent(null);
            setError("");
          }} /> Require PKCE with S256</label>
        <small>Both protections are enabled by default. Turning one off models a failure; all output is synthetic and no provider is contacted.</small>
      </fieldset>

      <button className="run-button" onClick={runFlow} disabled={loading} type="button">
        {loading ? "Running flow..." : "Run configured flow"}
      </button>
      {error && <p className="error">{error} Start the Go API with <code>go run ./cmd/server</code>.</p>}
    </header>

    {flow && <section className="workspace" aria-live="polite">
      <div className="summary">
        <span>{flow.protocol}</span>
        <strong>authorization_code</strong>
        <span className={`status ${flow.scenario.secure ? "secure" : "warning"}`}>{flow.status.replace(/_/g, " ")}</span>
      </div>

      {flow.findings.length > 0 && <section className="findings" aria-label="Scenario findings">
        {flow.findings.map((finding) => <article key={finding.title}>
          <span>{finding.severity}</span>
          <div><h2>{finding.title}</h2><p>{finding.description}</p><p><strong>Mitigation:</strong> {finding.mitigation}</p></div>
        </article>)}
      </section>}

      <p className="learning-outcome"><strong>Learning outcome:</strong> {flow.learningOutcome}</p>

      <div className="explorer-grid">
        <div className="timeline" aria-label="Protocol event timeline">
          {flow.messages.map((event) => <button
            className={`event ${selectedEvent === event.sequence ? "active" : ""}`}
            key={event.sequence}
            onClick={() => setSelectedEvent(event.sequence)}
            type="button"
          >
            <span className="marker">{String(event.sequence).padStart(2, "0")}</span>
            <span className="event-body">
              <span className="event-head"><span><span className="actor">{displayName(event.participant)}</span><strong>{displayName(event.label)}</strong></span><code>{event.method} {event.target}</code></span>
              <span className="event-outcome">{event.outcome}</span>
              <span className="properties">{event.securityClaims.map((property) => <span key={property}>{property}</span>)}</span>
            </span>
          </button>)}
        </div>

        {activeEvent && <aside className="explanation" aria-label="Selected exchange explanation">
          <p className="eyebrow">Exchange {String(activeEvent.sequence).padStart(2, "0")}</p>
          <h2>{activeEvent.explanation.heading}</h2>
          <section><h3>What happened</h3><p>{activeEvent.explanation.what_happened}</p></section>
          <section><h3>Why it matters</h3><p>{activeEvent.explanation.why_it_matters}</p></section>
          {activeEvent.fields.length > 0 && <section><h3>Visible fields</h3><div className="parameters">{activeEvent.fields.map((field) => <code key={field}>{field}</code>)}</div></section>}
        </aside>}
      </div>
    </section>}
  </>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
