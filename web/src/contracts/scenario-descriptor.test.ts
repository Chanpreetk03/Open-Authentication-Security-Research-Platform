import { describe, expect, it } from "vitest";
import descriptor from "./scenario-descriptor.oauth.example.json";

describe("candidate scenario descriptor example", () => {
  it("uses the current OAuth scenario ID and candidate reference fields", () => {
    expect(descriptor.apiVersion).toBe("protocol-lab/v1alpha1");
    expect(descriptor.kind).toBe("ScenarioDescriptor");
    expect(descriptor.metadata.id).toBe("oauth.authorization-code.missing-pkce");
    expect(descriptor.module).toEqual({ id: "oauth-oidc", version: "0.1.0" });
    expect(descriptor.scenarioRef).toEqual({ id: "missing-pkce" });
    expect(descriptor.execution.exerciseStepRefs).toEqual(["simulate-authorization-code-flow"]);
    expect(descriptor.execution.verificationCheckRefs).toEqual(["pkce-verifier-required"]);
  });

  it("requests only declared synthetic capabilities and grants no authority", () => {
    expect(descriptor.execution.mode).toBe("synthetic");
    expect(descriptor.execution.dataProfile).toContain("synthetic");
    expect(descriptor.capabilityRequests).toEqual({
      targets: [],
      listeners: [],
      operations: [],
      scratchProfile: "none",
      resourceProfile: "protocol-simulation-small",
    });
    expect(descriptor).not.toHaveProperty("capabilityGrant");
    expect(descriptor.execution).not.toHaveProperty("artifactRef");
  });

  it("does not embed OAuth wire fields, credentials, arbitrary commands, or URLs", () => {
    const serialized = JSON.stringify(descriptor);
    for (const forbidden of [
      "redirect_uri",
      "access_token",
      "client_secret",
      "authorization_request",
      "command",
      "hostPath",
      "https://",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
