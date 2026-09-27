import { StrictMode, useEffect, useState } from "react";
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
import { loadOAuthScenarios, runOAuthScenario, type ProtocolExchange, type ScenarioDescriptor } from "./protocols/oauth";
import "./styles.css";

function displayName(value: string) {
  return value.replace(/_/g, " ");
}

function App() {
  const [activeTool, setActiveTool] = useState<"oauth" | "jwt" | "http" | "academy" | "saml" | "metadata" | "saml-replay" | "saml-correlation" | "saml-audience" | "saml-recipient" | "saml-conditions">("oauth");
  return <main className="studio-shell">
    <nav className="tool-switcher" aria-label="Protocol Studio tools">
      <button type="button" aria-current={activeTool === "oauth" ? "page" : undefined} onClick={() => setActiveTool("oauth")}>OAuth flow</button>
      <button type="button" aria-current={activeTool === "jwt" ? "page" : undefined} onClick={() => setActiveTool("jwt")}>JWT inspector</button>
      <button type="button" aria-current={activeTool === "http" ? "page" : undefined} onClick={() => setActiveTool("http")}>Request inspector</button>
      <button type="button" aria-current={activeTool === "academy" ? "page" : undefined} onClick={() => setActiveTool("academy")}>Academy</button>
      <button type="button" aria-current={activeTool === "saml" ? "page" : undefined} onClick={() => setActiveTool("saml")}>SAML viewer</button>
      <button type="button" aria-current={activeTool === "metadata" ? "page" : undefined} onClick={() => setActiveTool("metadata")}>SAML metadata</button>
      <button type="button" aria-current={activeTool === "saml-replay" ? "page" : undefined} onClick={() => setActiveTool("saml-replay")}>SAML replay lab</button>
      <button type="button" aria-current={activeTool === "saml-correlation" ? "page" : undefined} onClick={() => setActiveTool("saml-correlation")}>SAML request binding</button>
      <button type="button" aria-current={activeTool === "saml-audience" ? "page" : undefined} onClick={() => setActiveTool("saml-audience")}>SAML audience</button>
      <button type="button" aria-current={activeTool === "saml-recipient" ? "page" : undefined} onClick={() => setActiveTool("saml-recipient")}>SAML recipient</button>
      <button type="button" aria-current={activeTool === "saml-conditions" ? "page" : undefined} onClick={() => setActiveTool("saml-conditions")}>SAML time conditions</button>
    </nav>
    {activeTool === "oauth" ? <OAuthExplorer /> : activeTool === "jwt" ? <JwtInspector /> : activeTool === "http" ? <RequestInspector /> : activeTool === "academy" ? <DefenseInDepthLesson /> : activeTool === "saml" ? <SamlAssertionViewer /> : activeTool === "metadata" ? <SamlMetadataInspector /> : activeTool === "saml-replay" ? <SamlReplayLab /> : activeTool === "saml-correlation" ? <SamlCorrelationLab /> : activeTool === "saml-audience" ? <SamlAudienceLab /> : activeTool === "saml-recipient" ? <SamlRecipientLab /> : <SamlConditionsLab />}
  </main>;
}

function OAuthExplorer() {
  const [flow, setFlow] = useState<ProtocolExchange | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioDescriptor[]>([]);
  const [selectedScenario, setSelectedScenario] = useState("secure");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScenarios() {
      try {
        setScenarios(await loadOAuthScenarios());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load scenarios.");
      }
    }
    void loadScenarios();
  }, []);

  async function runFlow() {
    setLoading(true);
    setError("");
    const scenarioId = selectedScenario;
    try {
      const nextFlow = await runOAuthScenario(scenarioId);
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
      <p className="intro">Choose a safe simulation, then select an exchange to see what happened and why the security property matters.</p>

      <div className="scenario-picker" aria-label="OAuth teaching scenarios">
        {scenarios.map((scenario) => <button
          className={`scenario ${selectedScenario === scenario.id ? "selected" : ""}`}
          key={scenario.id}
          aria-pressed={selectedScenario === scenario.id}
          disabled={loading}
          onClick={() => {
            setSelectedScenario(scenario.id);
            setFlow(null);
            setSelectedEvent(null);
          }}
          type="button"
        >
          <span>{scenario.secure ? "Reference" : "Failure simulation"}</span>
          <strong>{scenario.name}</strong>
          <small>{scenario.description}</small>
        </button>)}
      </div>

      <button className="run-button" onClick={runFlow} disabled={loading || scenarios.length === 0} type="button">
        {loading ? "Running flow..." : "Run selected flow"}
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
