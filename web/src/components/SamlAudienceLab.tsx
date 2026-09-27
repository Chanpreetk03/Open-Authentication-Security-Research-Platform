import { SamlFlowScenarioLab } from "./SamlFlowScenarioLab";
import { loadSamlAudienceScenarios, runSamlAudienceScenario } from "../protocols/saml-replay";

export function SamlAudienceLab() {
  return <SamlFlowScenarioLab
    title="Every audience restriction must pass."
    introduction="Evaluate the SAML AudienceRestriction groups for a relying party. The synthetic assertion includes the SP in one alternative group but names another SP in a separate, unsatisfied group."
    exercise="Audience validation"
    assumptions="All identities are synthetic. Issuer trust, signature, recipient, and time checks are assumed successful to isolate audience evaluation. The lab implements the group-matching rule, but it does not parse real SAML or create sessions."
    loadScenarios={loadSamlAudienceScenarios}
    runScenario={runSamlAudienceScenario}
  />;
}
