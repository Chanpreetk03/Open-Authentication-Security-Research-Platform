export type ScenarioDescriptor = {
  id: string;
  name: string;
  description: string;
  secure: boolean;
};

export type LearningExplanation = {
  heading: string;
  what_happened: string;
  why_it_matters: string;
};

type OAuthEventDTO = {
  sequence: number;
  actor: string;
  type: string;
  method: string;
  uri: string;
  parameters?: string[];
  security_properties: string[];
  outcome: string;
  explanation: LearningExplanation;
  timestamp: string;
};

type OAuthFlowDTO = {
  id: string;
  protocol: string;
  grant_type: string;
  status: string;
  scenario: ScenarioDescriptor;
  events: OAuthEventDTO[];
  findings: SecurityFinding[];
  learning_outcome: string;
};

export type SecurityFinding = {
  severity: string;
  title: string;
  description: string;
  mitigation: string;
};

export type OAuthProtectionConfiguration = {
  stateEnabled: boolean;
  pkceEnabled: boolean;
};

export type ProtocolMessage = {
  sequence: number;
  participant: string;
  label: string;
  method: string;
  target: string;
  fields: string[];
  securityClaims: string[];
  outcome: string;
  explanation: LearningExplanation;
  timestamp: string;
};

export type ProtocolExchange = {
  exchangeId: string;
  protocol: string;
  participants: string[];
  messages: ProtocolMessage[];
  securityClaims: string[];
  redactions: string[];
  timestamps: string[];
  outcome: string;
  status: string;
  scenario: ScenarioDescriptor;
  findings: SecurityFinding[];
  learningOutcome: string;
};

export async function loadOAuthScenarios(): Promise<ScenarioDescriptor[]> {
  const response = await fetch("/api/flows/oauth/scenarios");
  if (!response.ok) throw new Error("The explorer API is unavailable.");
  return (await response.json()) as ScenarioDescriptor[];
}

export async function runOAuthScenario(scenarioId: string): Promise<ProtocolExchange> {
  const response = await fetch(`/api/flows/oauth/authorization-code?scenario=${encodeURIComponent(scenarioId)}`);
  if (!response.ok) throw new Error("The selected scenario could not be run.");

  const flow = (await response.json()) as OAuthFlowDTO;
  return toProtocolExchange(flow);
}

export async function runOAuthConfiguration(configuration: OAuthProtectionConfiguration): Promise<ProtocolExchange> {
  const response = await fetch("/api/flows/oauth/authorization-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state_enabled: configuration.stateEnabled,
      pkce_enabled: configuration.pkceEnabled,
    }),
  });
  if (!response.ok) throw new Error("The configured flow could not be run.");
  const flow = (await response.json()) as OAuthFlowDTO;
  return toProtocolExchange(flow);
}

function toProtocolExchange(flow: OAuthFlowDTO): ProtocolExchange {
  const messages = flow.events.map((event) => ({
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
    redactions: [...new Set(messages.flatMap((message) => message.fields)
      .filter((field) => field.includes("********") || field.endsWith("=omitted")))],
    timestamps: messages.map((message) => message.timestamp),
    outcome: messages[messages.length - 1]?.outcome ?? flow.status,
    status: flow.status,
    scenario: flow.scenario,
    findings: flow.findings,
    learningOutcome: flow.learning_outcome,
  };
}
