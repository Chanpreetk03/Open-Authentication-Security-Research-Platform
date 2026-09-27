import { describe, expect, it } from "vitest";
import type { ProtocolExchange, ProtocolMessage } from "../protocols/oauth";
import { assessDefenseInDepthEvidence } from "./defense-in-depth";

function message(label: string, participant: string, fields: string[] = []): ProtocolMessage {
  return {
    sequence: 1,
    participant,
    label,
    method: "POST",
    target: "/test",
    fields,
    securityClaims: [],
    outcome: "synthetic",
    explanation: { heading: "", what_happened: "", why_it_matters: "" },
    timestamp: "2030-01-01T00:00:00Z",
  };
}

function exchange(messages: ProtocolMessage[], findings: ProtocolExchange["findings"] = []): ProtocolExchange {
  return {
    exchangeId: "test-exchange",
    protocol: "OAuth 2.0",
    participants: [],
    messages,
    securityClaims: [],
    redactions: [],
    timestamps: [],
    outcome: "synthetic",
    status: "completed",
    scenario: { id: "test", name: "test", description: "test", secure: false },
    findings,
    learningOutcome: "test",
  };
}

describe("assessDefenseInDepthEvidence", () => {
  it("recognizes missing state with PKCE blocking the injected code", () => {
    const result = assessDefenseInDepthEvidence(exchange([
      message("authorization_requested", "client", ["code_challenge=********", "code_challenge_method=S256"]),
      message("callback_accepted_without_state", "client"),
      message("code_redemption_rejected", "authorization_server"),
    ]), "missing-state");

    expect(result.reproduced).toBe(true);
    expect(result.checks.every((check) => check.passed)).toBe(true);
  });

  it("recognizes missing PKCE when the attacker reaches the resource", () => {
    const result = assessDefenseInDepthEvidence(exchange([
      message("authorization_requested", "client", ["state=********"]),
      message("intercepted_code_redeemed", "attacker"),
      message("access_token_issued", "authorization_server"),
      message("protected_resource_requested", "attacker"),
    ]), "missing-pkce");

    expect(result.reproduced).toBe(true);
  });

  it("requires state, S256, complete resource access, and no findings for secure verification", () => {
    const secureTrace = exchange([
      message("authorization_requested", "client", ["state=********", "code_challenge=********", "code_challenge_method=S256"]),
      message("code_redeemed", "client"),
      message("access_token_issued", "authorization_server"),
      message("protected_resource_requested", "client"),
    ]);
    expect(assessDefenseInDepthEvidence(secureTrace, "secure").reproduced).toBe(true);

    const finding = { severity: "low", title: "unexpected", description: "unexpected", mitigation: "mitigate" };
    expect(assessDefenseInDepthEvidence(exchange(secureTrace.messages, [finding]), "secure").reproduced).toBe(false);
  });

  it("does not count an issued token as evidence that missing-state stopped the flow", () => {
    const result = assessDefenseInDepthEvidence(exchange([
      message("callback_accepted_without_state", "client"),
      message("code_redemption_rejected", "authorization_server"),
      message("access_token_issued", "authorization_server"),
    ]), "missing-state");

    expect(result.reproduced).toBe(false);
    expect(result.checks[2].passed).toBe(false);
  });

  it("requires attack evidence in protocol order", () => {
    const outOfOrder = assessDefenseInDepthEvidence(exchange([
      message("code_redemption_rejected", "authorization_server"),
      message("callback_accepted_without_state", "client"),
    ]), "missing-state");

    expect(outOfOrder.reproduced).toBe(false);
    expect(outOfOrder.checks[1].passed).toBe(false);
  });
});
