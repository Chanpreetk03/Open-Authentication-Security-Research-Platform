import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSamlCorrelationScenarios, loadSamlReplayScenarios, runSamlCorrelationScenario, runSamlReplayScenario } from "./saml-replay";

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
});
