import type { ProtocolExchange } from "../protocols/oauth";

export type DefenseInDepthScenario = "missing-state" | "missing-pkce" | "secure";

export type EvidenceCheck = {
  label: string;
  passed: boolean;
  evidence: string;
};

export type EvidenceAssessment = {
  scenario: DefenseInDepthScenario;
  reproduced: boolean;
  checks: EvidenceCheck[];
};

export function assessDefenseInDepthEvidence(
  exchange: ProtocolExchange,
  scenario: DefenseInDepthScenario,
): EvidenceAssessment {
  const messages = exchange.messages;
  const labels = messages.map((message) => message.label);
  const authRequest = messages[0];
  const authFields = authRequest?.fields ?? [];

  if (scenario === "missing-state") {
    const callbackIndex = labels.indexOf("callback_accepted_without_state");
    const rejectionIndex = labels.indexOf("code_redemption_rejected");
    const callbackAccepted = callbackIndex >= 0;
    const codeRejected = rejectionIndex > callbackIndex;
    const tokenOrResourceGranted = labels.some((label) => label === "access_token_issued" || label === "protected_resource_requested");
    return {
      scenario,
      reproduced: callbackAccepted && codeRejected && !tokenOrResourceGranted,
      checks: [
        { label: "Callback arrived without state validation", passed: callbackAccepted, evidence: callbackAccepted ? "The client accepted the callback without comparing state." : "No unvalidated callback was observed." },
        { label: "PKCE rejected the injected code", passed: codeRejected, evidence: codeRejected ? "The token endpoint rejected redemption because the verifier did not match the code." : "No PKCE verifier rejection was observed." },
        { label: "No token or resource access followed", passed: !tokenOrResourceGranted, evidence: tokenOrResourceGranted ? "The trace unexpectedly issued a token or accessed the resource." : "No access token or protected-resource event appears in this trace." },
      ],
    };
  }

  if (scenario === "missing-pkce") {
    const challengeMissing = !authFields.some((field) => field.startsWith("code_challenge="));
    const redemptionIndex = messages.findIndex((message) => message.participant === "attacker" && message.label === "intercepted_code_redeemed");
    const tokenIndex = messages.findIndex((message) => message.participant === "authorization_server" && message.label === "access_token_issued");
    const resourceIndex = messages.findIndex((message) => message.participant === "attacker" && message.label === "protected_resource_requested");
    const attackerRedeemed = redemptionIndex >= 0;
    const attackerReceivedToken = tokenIndex > redemptionIndex;
    const attackerReachedResource = resourceIndex > tokenIndex;
    return {
      scenario,
      reproduced: challengeMissing && attackerRedeemed && attackerReachedResource,
      checks: [
        { label: "Authorization request omitted a PKCE challenge", passed: challengeMissing, evidence: challengeMissing ? "No code_challenge was sent in the authorization request." : "A code_challenge was present." },
        { label: "Attacker simulation redeemed the code", passed: attackerRedeemed, evidence: attackerRedeemed ? "The trace records the intercepted code accepted without a verifier." : "No attacker redemption event was observed." },
        { label: "Authorization server issued a token after redemption", passed: attackerReceivedToken, evidence: attackerReceivedToken ? "The authorization server issued an access token after accepting the intercepted code." : "No subsequent attacker token issuance was observed." },
        { label: "Attacker reached the synthetic resource", passed: attackerReachedResource, evidence: attackerReachedResource ? "The attacker simulation used its token at the protected resource." : "No attacker resource-access event was observed." },
      ],
    };
  }

  const statePresent = authFields.some((field) => field.startsWith("state=") && field !== "state=missing");
  const s256Present = authFields.includes("code_challenge_method=S256") && authFields.some((field) => field.startsWith("code_challenge="));
  const codeRedeemed = labels.includes("code_redeemed");
  const tokenIssued = labels.includes("access_token_issued");
  const clientReachedResource = messages.some((message) => message.participant === "client" && message.label === "protected_resource_requested");
  const noFindings = exchange.findings.length === 0;
  return {
    scenario,
    reproduced: statePresent && s256Present && codeRedeemed && tokenIssued && clientReachedResource && noFindings,
    checks: [
      { label: "State is included in the authorization request", passed: statePresent, evidence: statePresent ? "The client sent a state value for callback correlation." : "The authorization request has no state value." },
      { label: "PKCE S256 binds the authorization code", passed: s256Present, evidence: s256Present ? "The request contains a code challenge using S256." : "An S256 challenge is missing." },
      { label: "The code is redeemed and the client reaches the resource", passed: codeRedeemed && tokenIssued && clientReachedResource, evidence: codeRedeemed && tokenIssued && clientReachedResource ? "The authorization server accepts the code, issues a token, and the client accesses the synthetic resource." : "The expected code-redemption, token, or client-resource events are incomplete." },
      { label: "No security finding is reported", passed: noFindings, evidence: noFindings ? "The secure reference trace reports no scenario finding." : `${exchange.findings.length} finding(s) were reported.` },
    ],
  };
}
