import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Explanation = {
  heading: string;
  what_happened: string;
  why_it_matters: string;
};

type FlowEvent = {
  sequence: number;
  actor: string;
  type: string;
  method: string;
  uri: string;
  parameters?: string[];
  security_properties: string[];
  outcome: string;
  explanation: Explanation;
};

type Scenario = {
  id: string;
  name: string;
  description: string;
  secure: boolean;
};

type Finding = {
  severity: string;
  title: string;
  description: string;
  mitigation: string;
};

type Flow = {
  id: string;
  protocol: string;
  grant_type: string;
  status: string;
  scenario: Scenario;
  events: FlowEvent[];
  findings: Finding[];
  learning_outcome: string;
};

function displayName(value: string) {
  return value.replace(/_/g, " ");
}

function App() {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState("secure");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScenarios() {
      try {
        const response = await fetch("/api/flows/oauth/scenarios");
        if (!response.ok) throw new Error("The explorer API is unavailable.");
        setScenarios((await response.json()) as Scenario[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load scenarios.");
      }
    }
    void loadScenarios();
  }, []);

  async function runFlow() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/flows/oauth/authorization-code?scenario=${encodeURIComponent(selectedScenario)}`);
      if (!response.ok) throw new Error("The selected scenario could not be run.");
      const nextFlow = (await response.json()) as Flow;
      setFlow(nextFlow);
      setSelectedEvent(nextFlow.events[0]?.sequence ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run the flow.");
    } finally {
      setLoading(false);
    }
  }

  const activeEvent = flow?.events.find((event) => event.sequence === selectedEvent);

  return <main>
    <header className="hero">
      <p className="eyebrow">Protocol Studio / OAuth 2.0</p>
      <h1>See the flow. Inspect the decision. Learn the defense.</h1>
      <p className="intro">Choose a safe simulation, then select an exchange to see what happened and why the security property matters.</p>

      <div className="scenario-picker" aria-label="OAuth teaching scenarios">
        {scenarios.map((scenario) => <button
          className={`scenario ${selectedScenario === scenario.id ? "selected" : ""}`}
          key={scenario.id}
          onClick={() => setSelectedScenario(scenario.id)}
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
        <strong>{flow.grant_type}</strong>
        <span className={`status ${flow.scenario.secure ? "secure" : "warning"}`}>{flow.status.replace(/_/g, " ")}</span>
      </div>

      {flow.findings.length > 0 && <section className="findings" aria-label="Scenario findings">
        {flow.findings.map((finding) => <article key={finding.title}>
          <span>{finding.severity}</span>
          <div><h2>{finding.title}</h2><p>{finding.description}</p><p><strong>Mitigation:</strong> {finding.mitigation}</p></div>
        </article>)}
      </section>}

      <p className="learning-outcome"><strong>Learning outcome:</strong> {flow.learning_outcome}</p>

      <div className="explorer-grid">
        <div className="timeline" aria-label="Protocol event timeline">
          {flow.events.map((event) => <button
            className={`event ${selectedEvent === event.sequence ? "active" : ""}`}
            key={event.sequence}
            onClick={() => setSelectedEvent(event.sequence)}
            type="button"
          >
            <span className="marker">{String(event.sequence).padStart(2, "0")}</span>
            <span className="event-body">
              <span className="event-head"><span><span className="actor">{displayName(event.actor)}</span><strong>{displayName(event.type)}</strong></span><code>{event.method} {event.uri}</code></span>
              <span className="event-outcome">{event.outcome}</span>
              <span className="properties">{event.security_properties.map((property) => <span key={property}>{property}</span>)}</span>
            </span>
          </button>)}
        </div>

        {activeEvent && <aside className="explanation" aria-label="Selected exchange explanation">
          <p className="eyebrow">Exchange {String(activeEvent.sequence).padStart(2, "0")}</p>
          <h2>{activeEvent.explanation.heading}</h2>
          <section><h3>What happened</h3><p>{activeEvent.explanation.what_happened}</p></section>
          <section><h3>Why it matters</h3><p>{activeEvent.explanation.why_it_matters}</p></section>
          {activeEvent.parameters && <section><h3>Visible parameters</h3><div className="parameters">{activeEvent.parameters.map((parameter) => <code key={parameter}>{parameter}</code>)}</div></section>}
        </aside>}
      </div>
    </section>}
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
