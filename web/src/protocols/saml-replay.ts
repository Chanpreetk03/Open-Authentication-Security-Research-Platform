import type { ProtocolExchange, ProtocolMessage, ScenarioDescriptor } from "./oauth";

type SAMLReplayEvent = {
  sequence: number;
  actor: string;
  type: string;
  method: string;
  uri: string;
  parameters?: string[];
  security_properties: string[];
  outcome: string;
  explanation: ProtocolMessage["explanation"];
  timestamp: string;
};

type SAMLReplayFlow = {
  id: string;
  protocol: string;
  status: string;
  scenario: ScenarioDescriptor;
  events: SAMLReplayEvent[];
  findings: ProtocolExchange["findings"];
  learning_outcome: string;
};

export async function loadSamlReplayScenarios(): Promise<ScenarioDescriptor[]> {
  const response = await fetch("/api/flows/saml/scenarios");
  if (!response.ok) throw new Error("The SAML replay lab API is unavailable.");
  return (await response.json()) as ScenarioDescriptor[];
}

export async function runSamlReplayScenario(scenarioId: string): Promise<ProtocolExchange> {
  const response = await fetch(`/api/flows/saml/replay?scenario=${encodeURIComponent(scenarioId)}`);
  if (!response.ok) throw new Error("The selected SAML replay scenario could not be run.");
  const flow = (await response.json()) as SAMLReplayFlow;
  const messages: ProtocolMessage[] = flow.events.map((event) => ({
    sequence: event.sequence,
    participant: event.actor,
    label: event.type,
    method: event.method,
    target: event.uri,
    fields: event.parameters ?? [],
    securityClaims: event.security_properties,
    outcome: event.outcome,
    explanation: event.explanation,
    timestamp: event.timestamp,
  }));

  return {
    exchangeId: flow.id,
    protocol: flow.protocol,
    participants: [...new Set(messages.map((message) => message.participant))],
    messages,
    securityClaims: [...new Set(messages.flatMap((message) => message.securityClaims))],
    redactions: [...new Set(messages.flatMap((message) => message.fields).filter((field) => field.includes("********")))],
    timestamps: messages.map((message) => message.timestamp),
    outcome: messages[messages.length - 1]?.outcome ?? flow.status,
    status: flow.status,
    scenario: flow.scenario,
    findings: flow.findings,
    learningOutcome: flow.learning_outcome,
  };
}
