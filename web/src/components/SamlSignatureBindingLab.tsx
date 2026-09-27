import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlSignatureBindingScenarios, runSamlSignatureBindingScenario } from "../protocols/saml-replay";

export function SamlSignatureBindingLab() {
  return <SamlFlowScenarioLab
    title="Verify the node you actually consume."
    introduction="Follow a synthetic wrapped response where the signature verifier and identity mapper select different assertion nodes."
    exercise="Signature-to-assertion binding"
    assumptions="The signature value and referenced digest are assumed valid for one synthetic assertion node. This lab models node selection only: it performs no XML parsing, cryptographic verification, or real authentication."
    loadScenarios={loadSamlSignatureBindingScenarios}
    runScenario={runSamlSignatureBindingScenario}
  />;
}
