import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSamlAudienceScenarios, loadSamlCorrelationScenarios, loadSamlRecipientScenarios, loadSamlReplayScenarios, runSamlAudienceScenario, runSamlCorrelationScenario, runSamlRecipientScenario, runSamlReplayScenario } from "./saml-replay";

afterEach(() => vi.unstubAllGlobals());

describe("SAML replay API adapter", () => {
  it("loads the replay scenario descriptors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "replay-protected", name: "Replay cache enabled", description: "Reject duplicates", secure: true }],
    }));

    await expect(loadSamlReplayScenarios()).resolves.toEqual([
      { id: "replay-protected", name: "Replay cache enabled", description: "Reject duplicates", secure: true },
    ]);
  });

  it("maps a redacted Go trace into the shared exchange model", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "saml_replay_demo",
        protocol: "SAML 2.0",
        status: "replay_rejected",
        scenario: { id: "replay-protected", name: "Replay cache enabled", description: "Reject duplicates", secure: true },
        events: [{
          sequence: 1,
          actor: "service_provider",
          type: "replay_rejected",
          method: "INTERNAL",
          uri: "replay cache",
          parameters: ["assertion_id=_assertion-demo", "SAMLResponse=********"],
          security_properties: ["duplicate rejected"],
          outcome: "no second session",
          explanation: { heading: "Replay blocked", what_happened: "Duplicate rejected", why_it_matters: "Assertions are one-use." },
          timestamp: "2026-09-27T12:00:00Z",
        }],
        findings: [],
        learning_outcome: "A duplicate was blocked.",
      }),
    }));

    const exchange = await runSamlReplayScenario("replay-protected");
    expect(exchange.protocol).toBe("SAML 2.0");
    expect(exchange.scenario.secure).toBe(true);
    expect(exchange.messages[0]).toMatchObject({
      participant: "service_provider",
      label: "replay_rejected",
      fields: ["assertion_id=_assertion-demo", "SAMLResponse=********"],
    });
    expect(exchange.redactions).toContain("SAMLResponse=********");
    expect(exchange.learningOutcome).toContain("duplicate");
  });

  it("surfaces API errors rather than rendering an empty trace", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    await expect(runSamlReplayScenario("not-a-scenario")).rejects.toThrow("selected SAML replay scenario");
  });

  it("uses the request-correlation API contract and shared event mapping", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "correlation-required", name: "Require correlation", description: "Reject mismatch", secure: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: "saml_correlation_demo", protocol: "SAML 2.0", status: "mismatch_rejected",
        scenario: { id: "correlation-required", name: "Require correlation", description: "Reject mismatch", secure: true },
        events: [{ sequence: 1, actor: "service_provider", type: "response_rejected", method: "INTERNAL", uri: "ACS policy", parameters: ["received=_request-attacker"], security_properties: ["mismatch rejected"], outcome: "no session", explanation: { heading: "Mismatch", what_happened: "Rejected", why_it_matters: "Binds the response to the request." }, timestamp: "2026-09-27T12:00:00Z" }],
        findings: [], learning_outcome: "The mismatch was blocked.",
      }) });
    vi.stubGlobal("fetch", fetchMock);

    const scenarios = await loadSamlCorrelationScenarios();
    const exchange = await runSamlCorrelationScenario("correlation-required");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/flows/saml/correlation/scenarios");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/flows/saml/correlation?scenario=correlation-required");
    expect(scenarios[0].secure).toBe(true);
    expect(exchange.status).toBe("mismatch_rejected");
    expect(exchange.messages[0].label).toBe("response_rejected");
  });

  it("uses the audience API contract and exposes the group-evaluation result", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "audience-enforced", name: "Enforce", description: "Check restrictions", secure: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: "saml_audience_demo", protocol: "SAML 2.0", status: "audience_rejected",
        scenario: { id: "audience-enforced", name: "Enforce", description: "Check restrictions", secure: true },
        events: [{ sequence: 1, actor: "service_provider", type: "audience_restrictions_evaluated", method: "INTERNAL", uri: "ACS audience policy", parameters: ["restriction_1=OR(sp | shared)", "restriction_2=OR(other-sp)"], security_properties: ["OR within each group", "AND across groups"], outcome: "audience match = false", explanation: { heading: "Evaluate groups", what_happened: "A group missed", why_it_matters: "Every group must match." }, timestamp: "2026-09-27T12:00:00Z" }],
        findings: [], learning_outcome: "A restriction failed.",
      }) });
    vi.stubGlobal("fetch", fetchMock);

    const scenarios = await loadSamlAudienceScenarios();
    const exchange = await runSamlAudienceScenario("audience-enforced");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/flows/saml/audience/scenarios");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/flows/saml/audience?scenario=audience-enforced");
    expect(scenarios[0].secure).toBe(true);
    expect(exchange.messages[0].outcome).toBe("audience match = false");
    expect(exchange.messages[0].securityClaims).toContain("AND across groups");
  });

  it("uses the recipient API contract and maps ACS comparison evidence", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "recipient-enforced", name: "Require recipient", description: "Exact ACS match", secure: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: "saml_recipient_demo", protocol: "SAML 2.0", status: "recipient_rejected",
        scenario: { id: "recipient-enforced", name: "Require recipient", description: "Exact ACS match", secure: true },
        events: [{ sequence: 1, actor: "service_provider", type: "recipient_evaluated", method: "INTERNAL", uri: "ACS recipient policy", parameters: ["expected=https://sp.test/acs", "received=https://sp.test/other"], security_properties: ["exact Recipient comparison"], outcome: "recipient match = false", explanation: { heading: "Compare recipient", what_happened: "URLs differ", why_it_matters: "The confirmation names the consuming ACS." }, timestamp: "2026-09-27T12:00:00Z" }],
        findings: [], learning_outcome: "Mismatch rejected.",
      }) });
    vi.stubGlobal("fetch", fetchMock);

    const scenarios = await loadSamlRecipientScenarios();
    const exchange = await runSamlRecipientScenario("recipient-enforced");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/flows/saml/recipient/scenarios");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/flows/saml/recipient?scenario=recipient-enforced");
    expect(scenarios[0].secure).toBe(true);
    expect(exchange.messages[0].label).toBe("recipient_evaluated");
    expect(exchange.messages[0].outcome).toBe("recipient match = false");
  });
});
