import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlSubjectConfirmationScenarios, runSamlSubjectConfirmationScenario } from "../protocols/saml-replay";

export function SamlSubjectConfirmationLab() {
  return <SamlFlowScenarioLab
    title="One complete confirmation, not a composite."
    introduction="Compare independent bearer confirmation candidates and see why their fields cannot be mixed."
    exercise="SAML bearer confirmation evaluation"
    assumptions="The assertion and signature are synthetic and assumed valid. This lab evaluates bearer method, recipient, expiry, and request correlation per candidate; it does not parse XML or authenticate a user."
    loadScenarios={loadSamlSubjectConfirmationScenarios}
    runScenario={runSamlSubjectConfirmationScenario}
  />;
}
