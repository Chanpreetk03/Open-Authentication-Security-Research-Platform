import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSamlAudienceScenarios, loadSamlConditionsScenarios, loadSamlCorrelationScenarios, loadSamlRecipientScenarios, loadSamlReplayScenarios, loadSamlSignatureBindingScenarios, loadSamlSubjectConfirmationScenarios, runSamlAudienceScenario, runSamlConditionsScenario, runSamlCorrelationScenario, runSamlRecipientScenario, runSamlReplayScenario, runSamlSignatureBindingScenario, runSamlSubjectConfirmationScenario } from "./saml-replay";

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

  it("uses the conditions API contract and maps the clock-window decision", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "conditions-enforced", name: "Enforce time window", description: "Reject expired assertions", secure: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: "saml_conditions_demo", protocol: "SAML 2.0", status: "expired_rejected",
        scenario: { id: "conditions-enforced", name: "Enforce time window", description: "Reject expired assertions", secure: true },
        events: [{ sequence: 1, actor: "service_provider", type: "conditions_evaluated", method: "INTERNAL", uri: "ACS time policy", parameters: ["allowed_skew=30s"], security_properties: ["NotBefore inclusive", "NotOnOrAfter exclusive"], outcome: "within condition window = false", explanation: { heading: "Evaluate time", what_happened: "Expired", why_it_matters: "Reject stale assertions." }, timestamp: "2026-09-27T12:00:00Z" }],
        findings: [], learning_outcome: "Expired response rejected.",
      }) });
    vi.stubGlobal("fetch", fetchMock);

    const scenarios = await loadSamlConditionsScenarios();
    const exchange = await runSamlConditionsScenario("conditions-enforced");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/flows/saml/conditions/scenarios");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/flows/saml/conditions?scenario=conditions-enforced");
    expect(scenarios[0].secure).toBe(true);
    expect(exchange.messages[0].outcome).toBe("within condition window = false");
    expect(exchange.messages[0].securityClaims).toContain("NotOnOrAfter exclusive");
  });

  it("uses the signature-binding API and maps verified-node evidence", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "signature-binding-enforced", name: "Consume verified node", description: "Bind to verifier result", secure: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: "saml_signature_binding_demo", protocol: "SAML 2.0", status: "unverified_node_rejected",
        scenario: { id: "signature-binding-enforced", name: "Consume verified node", description: "Bind to verifier result", secure: true },
        events: [{ sequence: 1, actor: "service_provider", type: "signature_binding_evaluated", method: "INTERNAL", uri: "verified object binding", parameters: ["verified_node=_signed", "consumed_node=_injected"], security_properties: ["object identity comparison"], outcome: "consumes verified node = false", explanation: { heading: "Bind the node", what_happened: "Different nodes", why_it_matters: "Consume only verified data." }, timestamp: "2026-09-27T12:00:00Z" }],
        findings: [], learning_outcome: "Unverified node rejected.",
      }) });
    vi.stubGlobal("fetch", fetchMock);

    const scenarios = await loadSamlSignatureBindingScenarios();
    const exchange = await runSamlSignatureBindingScenario("signature-binding-enforced");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/flows/saml/signature-binding/scenarios");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/flows/saml/signature-binding?scenario=signature-binding-enforced");
    expect(scenarios[0].secure).toBe(true);
    expect(exchange.messages[0].outcome).toBe("consumes verified node = false");
  });

  it("uses the subject-confirmation API and maps whole-candidate evidence", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "subject-confirmation-enforced", name: "Validate one complete confirmation", description: "Evaluate per candidate", secure: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        id: "saml_subject_confirmation_demo", protocol: "SAML 2.0", status: "no_valid_confirmation_rejected",
        scenario: { id: "subject-confirmation-enforced", name: "Validate one complete confirmation", description: "Evaluate per candidate", secure: true },
        events: [{ sequence: 1, actor: "service_provider", type: "candidate_evaluation_completed", method: "INTERNAL", uri: "ACS bearer confirmation policy", parameters: ["candidate_1_valid=false", "candidate_2_valid=false"], security_properties: ["all fields checked per candidate"], outcome: "complete-candidate result = false", explanation: { heading: "Evaluate candidates independently", what_happened: "No candidate passes all checks", why_it_matters: "Do not combine fields across alternatives." }, timestamp: "2026-09-27T12:00:00Z" }],
        findings: [], learning_outcome: "No complete candidate passed.",
      }) });
    vi.stubGlobal("fetch", fetchMock);

    const scenarios = await loadSamlSubjectConfirmationScenarios();
    const exchange = await runSamlSubjectConfirmationScenario("subject-confirmation-enforced");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/flows/saml/subject-confirmation/scenarios");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/flows/saml/subject-confirmation?scenario=subject-confirmation-enforced");
    expect(scenarios[0].secure).toBe(true);
    expect(exchange.messages[0].outcome).toBe("complete-candidate result = false");
  });
});
