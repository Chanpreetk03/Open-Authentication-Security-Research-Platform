import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlReplayScenarios, runSamlReplayScenario } from "../protocols/saml-replay";

export function SamlReplayLab() {
  return <SamlFlowScenarioLab
    title="One assertion. One acceptance."
    introduction="Trace a synthetic SAML response from the browser to the ACS, then replay it. Compare duplicate acceptance with an assertion-ID replay cache."
    exercise="Assertion replay"
    assumptions="All identities and assertion values are synthetic. The trace assumes preconfigured IdP trust and a valid signature, and models the other required assertion checks as passing so replay-cache behavior is isolated. It does not implement SAML or test a real ACS."
    loadScenarios={loadSamlReplayScenarios}
    runScenario={runSamlReplayScenario}
  />;
}
