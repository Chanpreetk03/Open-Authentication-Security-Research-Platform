import type { ProtocolExchange, ProtocolMessage, ScenarioDescriptor } from "./oauth";

type SAMLFlowEvent = {
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

type SAMLFlowResponse = {
  id: string;
  protocol: string;
  status: string;
  scenario: ScenarioDescriptor;
  events: SAMLFlowEvent[];
  findings: ProtocolExchange["findings"];
  learning_outcome: string;
};

export async function loadSamlReplayScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/scenarios", "SAML replay lab");
}

export async function runSamlReplayScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/replay", scenarioId, "SAML replay");
}

export async function loadSamlCorrelationScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/correlation/scenarios", "SAML correlation lab");
}

export async function runSamlCorrelationScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/correlation", scenarioId, "SAML correlation");
}

export async function loadSamlAudienceScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/audience/scenarios", "SAML audience lab");
}

export async function runSamlAudienceScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/audience", scenarioId, "SAML audience");
}

export async function loadSamlRecipientScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/recipient/scenarios", "SAML recipient lab");
}

export async function runSamlRecipientScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/recipient", scenarioId, "SAML recipient");
}

export async function loadSamlConditionsScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/conditions/scenarios", "SAML conditions lab");
}

export async function runSamlConditionsScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/conditions", scenarioId, "SAML conditions");
}

export async function loadSamlSignatureBindingScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/signature-binding/scenarios", "SAML signature-binding lab");
}

export async function runSamlSignatureBindingScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/signature-binding", scenarioId, "SAML signature-binding");
}

export async function loadSamlSubjectConfirmationScenarios(): Promise<ScenarioDescriptor[]> {
  return loadScenarios("/api/flows/saml/subject-confirmation/scenarios", "SAML subject-confirmation lab");
}

export async function runSamlSubjectConfirmationScenario(scenarioId: string): Promise<ProtocolExchange> {
  return runSamlScenario("/api/flows/saml/subject-confirmation", scenarioId, "SAML subject-confirmation");
}

async function loadScenarios(endpoint: string, label: string): Promise<ScenarioDescriptor[]> {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`The ${label} API is unavailable.`);
  return (await response.json()) as ScenarioDescriptor[];
}

async function runSamlScenario(endpoint: string, scenarioId: string, label: string): Promise<ProtocolExchange> {
  const response = await fetch(`${endpoint}?scenario=${encodeURIComponent(scenarioId)}`);
  if (!response.ok) throw new Error(`The selected ${label} scenario could not be run.`);
  const flow = (await response.json()) as SAMLFlowResponse;
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
