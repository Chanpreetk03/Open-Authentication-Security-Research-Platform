import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlRecipientScenarios, runSamlRecipientScenario } from "../protocols/saml-replay";

export function SamlRecipientLab() {
  return <SamlFlowScenarioLab
    title="The bearer confirmation must name this ACS."
    introduction="Compare the SAML bearer SubjectConfirmationData Recipient with the service provider's configured assertion consumer service URL."
    exercise="Recipient validation"
    assumptions="All identities are synthetic. Signature, issuer trust, audience, request correlation, and time conditions are assumed valid to isolate exact Recipient matching. No real SAML messages are processed and no sessions are created."
    loadScenarios={loadSamlRecipientScenarios}
    runScenario={runSamlRecipientScenario}
  />;
}
