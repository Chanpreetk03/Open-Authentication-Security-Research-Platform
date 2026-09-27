import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlCorrelationScenarios, runSamlCorrelationScenario } from "../protocols/saml-replay";

export function SamlCorrelationLab() {
  return <SamlFlowScenarioLab
    title="Bind the response to its request."
    introduction="Follow an SP-initiated request, then observe what happens when a response for the attacker's transaction is relayed into the victim's browser."
    exercise="Request correlation"
    assumptions="All values are synthetic. Issuer trust, signature validity, audience, recipient, and time checks are assumed to pass so the lab isolates Response InResponseTo correlation. It does not process real messages or create sessions. Unsolicited IdP-initiated SSO requires a separate explicit policy, not an implicit correlation bypass."
    loadScenarios={loadSamlCorrelationScenarios}
    runScenario={runSamlCorrelationScenario}
  />;
}
