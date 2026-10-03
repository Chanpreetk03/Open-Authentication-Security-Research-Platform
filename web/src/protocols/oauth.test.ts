import { afterEach, describe, expect, it, vi } from "vitest";
import { runOAuthConfiguration } from "./oauth";

const flowResponse = {
  id: "flow_demo",
  protocol: "OAuth 2.0",
  grant_type: "authorization_code",
  status: "completed",
  scenario: { id: "secure", name: "Secure reference flow", description: "Secure", secure: true },
  events: [{
    sequence: 1,
    actor: "client",
    type: "authorization_requested",
    method: "GET",
    uri: "/authorize",
    parameters: ["state=********"],
    security_properties: ["state", "PKCE S256"],
    outcome: "request accepted",
    explanation: { heading: "Start", what_happened: "Started", why_it_matters: "Binding" },
    timestamp: "2026-10-03T00:00:00Z",
  }],
  findings: [],
  learning_outcome: "State and PKCE protect the flow.",
};

afterEach(() => vi.unstubAllGlobals());

describe("runOAuthConfiguration", () => {
  it("posts only the selected protections and maps the synthetic flow", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => flowResponse });
    vi.stubGlobal("fetch", fetchMock);

    const exchange = await runOAuthConfiguration({ stateEnabled: false, pkceEnabled: true });

    expect(fetchMock).toHaveBeenCalledWith("/api/flows/oauth/authorization-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state_enabled: false, pkce_enabled: true }),
    });
    expect(exchange.scenario.id).toBe("secure");
    expect(exchange.messages[0]?.securityClaims).toEqual(["state", "PKCE S256"]);
  });

  it("surfaces API errors without trying to map a response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(runOAuthConfiguration({ stateEnabled: true, pkceEnabled: false }))
      .rejects.toThrow("The configured flow could not be run.");
  });
});
