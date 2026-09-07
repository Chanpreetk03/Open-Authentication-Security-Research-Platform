import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Event = {
  sequence: number;
  actor: string;
  type: string;
  method: string;
  uri: string;
  parameters?: string[];
  security_properties: string[];
  outcome: string;
};

type Flow = { id: string; protocol: string; grant_type: string; status: string; events: Event[] };

function App() {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runFlow() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/flows/oauth/authorization-code");
      if (!response.ok) throw new Error("The explorer API is unavailable.");
      setFlow(await response.json() as Flow);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run the flow.");
    } finally {
      setLoading(false);
    }
  }

  return <main>
    <header className="hero">
      <p className="eyebrow">Protocol Studio / first module</p>
      <h1>See OAuth authorization code flow in motion.</h1>
      <p className="intro">A redacted, local-first walkthrough of redirects, consent, code exchange, and token issuance.</p>
      <button onClick={runFlow} disabled={loading}>{loading ? "Running flow..." : "Run authorization flow"}</button>
      {error && <p className="error">{error} Start the Go API with <code>go run ./cmd/server</code>.</p>}
    </header>
    {flow && <section className="workspace" aria-live="polite">
      <div className="summary"><span>{flow.protocol}</span><strong>authorization_code</strong><span className="complete">● {flow.status}</span></div>
      <div className="timeline">{flow.events.map((event) => <article className="event" key={event.sequence}>
        <div className="marker">{String(event.sequence).padStart(2, "0")}</div>
        <div className="event-body"><div className="event-head"><div><span className="actor">{event.actor.replace(/_/g, " ")}</span><h2>{event.type.replace(/_/g, " ")}</h2></div><code>{event.method} {event.uri}</code></div>
          <p>{event.outcome}</p>
          {event.parameters && <div className="parameters">{event.parameters.map((parameter) => <code key={parameter}>{parameter}</code>)}</div>}
          <div className="properties">{event.security_properties.map((property) => <span key={property}>{property}</span>)}</div>
        </div>
      </article>)}</div>
    </section>}
  </main>;
}

import { useState } from "react";
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
