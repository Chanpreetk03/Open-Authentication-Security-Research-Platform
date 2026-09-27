import { useEffect, useState } from "react";
import type { ProtocolExchange, ProtocolMessage, ScenarioDescriptor } from "../protocols/oauth";

export function SamlFlowScenarioLab({
  title,
  introduction,
  exercise,
  assumptions,
  loadScenarios,
  runScenario,
}: {
  title: string;
  introduction: string;
  exercise: string;
  assumptions: string;
  loadScenarios: () => Promise<ScenarioDescriptor[]>;
  runScenario: (id: string) => Promise<ProtocolExchange>;
}) {
  const [scenarios, setScenarios] = useState<ScenarioDescriptor[]>([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [flow, setFlow] = useState<ProtocolExchange | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void loadScenarios().then((items) => {
      if (!active) return;
      setScenarios(items);
      setSelectedScenario(items[0]?.id ?? "");
    }).catch((caught: unknown) => {
      if (active) setError(caught instanceof Error ? caught.message : "Unable to load SAML scenarios.");
    });
    return () => { active = false; };
  }, [loadScenarios]);

  async function runSelectedScenario() {
    setLoading(true);
    setError("");
    setFlow(null);
    setSelectedEvent(null);
    try {
      const exchange = await runScenario(selectedScenario);
      setFlow(exchange);
      setSelectedEvent(exchange.messages[0]?.sequence ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to run the SAML scenario.");
    } finally {
      setLoading(false);
    }
  }

  const activeEvent = flow?.messages.find((message) => message.sequence === selectedEvent);
  return <>
    <header className="hero saml-replay-hero">
      <p className="eyebrow">Protocol Studio / SAML Browser SSO / {exercise}</p>
      <h1>{title}</h1>
      <p className="intro">{introduction}</p>
      <div className="scenario-picker" aria-label={`${exercise} scenarios`}>
        {scenarios.map((scenario) => <button className={`scenario ${selectedScenario === scenario.id ? "selected" : ""}`} key={scenario.id} type="button" aria-pressed={selectedScenario === scenario.id} disabled={loading} onClick={() => { setSelectedScenario(scenario.id); setFlow(null); setSelectedEvent(null); }}>
          <span>{scenario.secure ? "Reference" : "Failure simulation"}</span><strong>{scenario.name}</strong><small>{scenario.description}</small>
        </button>)}
      </div>
      <button className="run-button" type="button" disabled={loading || !selectedScenario} onClick={runSelectedScenario}>{loading ? "Running simulation..." : `Run ${exercise} scenario`}</button>
      {error && <p className="error">{error} Start the Go API with <code>go run ./cmd/server</code>.</p>}
    </header>

    {flow && <section className="workspace" aria-live="polite">
      <div className="summary"><span>{flow.protocol}</span><strong>{exercise}</strong><span className={`status ${flow.scenario.secure ? "secure" : "warning"}`}>{flow.status.replace(/_/g, " ")}</span></div>
      {flow.findings.length > 0 && <section className="findings" aria-label={`${exercise} findings`}>
        {flow.findings.map((finding) => <article key={finding.title}><span>{finding.severity}</span><div><h2>{finding.title}</h2><p>{finding.description}</p><p><strong>Mitigation:</strong> {finding.mitigation}</p></div></article>)}
      </section>}
      <p className="learning-outcome"><strong>Learning outcome:</strong> {flow.learningOutcome}</p>
      <div className="explorer-grid">
        <div className="timeline" aria-label={`${exercise} event timeline`}>
          {flow.messages.map((event) => <button className={`event ${selectedEvent === event.sequence ? "active" : ""}`} key={event.sequence} onClick={() => setSelectedEvent(event.sequence)} type="button">
            <span className="marker">{String(event.sequence).padStart(2, "0")}</span>
            <span className="event-body">
              <span className="event-head"><span><span className="actor">{event.participant.replace(/_/g, " ")}</span><strong>{event.label.replace(/_/g, " ")}</strong></span><code>{event.method} {event.target}</code></span>
              <span className="event-outcome">{event.outcome}</span>
              <span className="properties">{event.securityClaims.map((claim) => <span key={claim}>{claim}</span>)}</span>
            </span>
          </button>)}
        </div>
        {activeEvent && <ScenarioExplanation event={activeEvent} />}
      </div>
      <aside className="saml-replay-assumptions"><strong>Simulation boundary</strong><p>{assumptions}</p></aside>
    </section>}
  </>;
}

function ScenarioExplanation({ event }: { event: ProtocolMessage }) {
  return <aside className="explanation" aria-label="Selected SAML event explanation">
    <p className="eyebrow">Exchange {String(event.sequence).padStart(2, "0")}</p><h2>{event.explanation.heading}</h2>
    <section><h3>What happened</h3><p>{event.explanation.what_happened}</p></section>
    <section><h3>Why it matters</h3><p>{event.explanation.why_it_matters}</p></section>
    {event.fields.length > 0 && <section><h3>Visible fields</h3><div className="parameters">{event.fields.map((field) => <code key={field}>{field}</code>)}</div></section>}
  </aside>;
}
