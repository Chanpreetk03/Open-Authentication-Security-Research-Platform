import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlConditionsScenarios, runSamlConditionsScenario } from "../protocols/saml-replay";

export function SamlConditionsLab() {
  return <SamlFlowScenarioLab
    title="A signed assertion can still be stale."
    introduction="Inspect the assertion's inclusive NotBefore and exclusive NotOnOrAfter window, then compare strict enforcement with an expired-assertion bypass."
    exercise="Time-condition validation"
    assumptions="All identities are synthetic. This exercise uses a configured 30-second clock-skew allowance, assumes issuer trust/signature/audience/recipient checks pass, and isolates Conditions time-window evaluation. No real SAML is parsed."
    loadScenarios={loadSamlConditionsScenarios}
    runScenario={runSamlConditionsScenario}
  />;
}
