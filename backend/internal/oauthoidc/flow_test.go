package oauthoidc

import (
	"errors"
	"strings"
	"testing"
	"time"
)

var testTime = time.Date(2026, 9, 20, 0, 0, 0, 0, time.UTC)

func TestAuthorizationCodeFlowIsRedactedAndOrdered(t *testing.T) {
	flow, err := NewAuthorizationCodeFlow(testTime)
	if err != nil {
		t.Fatalf("create flow: %v", err)
	}
	if flow.Status != "completed" || flow.Scenario.ID != ScenarioSecure || len(flow.Events) != 7 {
		t.Fatalf("unexpected secure flow: status=%q scenario=%q events=%d", flow.Status, flow.Scenario.ID, len(flow.Events))
	}
	for index, event := range flow.Events {
		if event.Sequence != index+1 {
			t.Errorf("event %d has sequence %d", index, event.Sequence)
		}
		if event.Explanation.WhyItMatters == "" {
			t.Errorf("event %d has no learner explanation", event.Sequence)
		}
		for _, parameter := range event.Parameters {
			parts := strings.SplitN(parameter, "=", 2)
			if len(parts) != 2 {
				continue
			}
			var expected string
			switch parts[0] {
			case "code", "state", "code_challenge", "access_token":
				expected = "********"
			case "code_verifier":
				expected = "omitted"
			case "Authorization":
				expected = "Bearer ********"
			}
			if expected != "" && parts[1] != expected {
				t.Errorf("event %d has unredacted %s value %q", index+1, parts[0], parts[1])
			}
		}
	}
}

func TestMissingStateAcceptsCallbackButPKCEBlocksInjectedCode(t *testing.T) {
	flow, err := NewAuthorizationCodeFlowForScenario(ScenarioMissingState, testTime)
	if err != nil {
		t.Fatalf("create missing-state flow: %v", err)
	}
	if flow.Status != "blocked_with_finding" || len(flow.Events) != 6 {
		t.Fatalf("unexpected missing-state flow: status=%q events=%d", flow.Status, len(flow.Events))
	}
	if callback := flow.Events[4]; callback.Type != "callback_accepted_without_state" {
		t.Errorf("callback event = %q, want callback_accepted_without_state", callback.Type)
	}
	if last := flow.Events[len(flow.Events)-1]; last.Type != "code_redemption_rejected" {
		t.Errorf("last event = %q, want code_redemption_rejected", last.Type)
	}
	for _, event := range flow.Events {
		if event.Type == "access_token_issued" || event.Type == "protected_resource_requested" {
			t.Errorf("unexpected successful event %q after PKCE verifier mismatch", event.Type)
		}
	}
}

func TestMissingPKCEShowsInterceptedCodeRedemption(t *testing.T) {
	flow, err := NewAuthorizationCodeFlowForScenario(ScenarioMissingPKCE, testTime)
	if err != nil {
		t.Fatalf("create missing-pkce flow: %v", err)
	}
	if flow.Status != "completed_with_finding" || len(flow.Findings) != 1 || len(flow.Events) != 7 {
		t.Fatalf("unexpected missing-pkce flow: status=%q findings=%d", flow.Status, len(flow.Findings))
	}
	if event := flow.Events[4]; event.Actor != "attacker" || event.Type != "intercepted_code_redeemed" {
		t.Errorf("unexpected interception event: %#v", event)
	}
	if last := flow.Events[len(flow.Events)-1]; last.Type != "protected_resource_requested" {
		t.Errorf("last event = %q, want protected_resource_requested", last.Type)
	}
}

func TestUnsupportedScenarioIsRejected(t *testing.T) {
	_, err := NewAuthorizationCodeFlowForScenario("unknown", testTime)
	if !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want unsupported scenario", err)
	}
}

func TestAuthorizationCodeFlowForProtectionsModelsAllCombinations(t *testing.T) {
	tests := []struct {
		name           string
		stateEnabled   bool
		pkceEnabled    bool
		wantScenario   string
		wantFindings   int
		wantFinalEvent string
	}{
		{name: "state and PKCE", stateEnabled: true, pkceEnabled: true, wantScenario: ScenarioSecure, wantFinalEvent: "protected_resource_requested"},
		{name: "state only", stateEnabled: true, pkceEnabled: false, wantScenario: ScenarioMissingPKCE, wantFindings: 1, wantFinalEvent: "protected_resource_requested"},
		{name: "PKCE only", stateEnabled: false, pkceEnabled: true, wantScenario: ScenarioMissingState, wantFindings: 1, wantFinalEvent: "code_redemption_rejected"},
		{name: "neither", stateEnabled: false, pkceEnabled: false, wantScenario: ScenarioMissingBoth, wantFindings: 2, wantFinalEvent: "protected_resource_requested"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			flow, err := NewAuthorizationCodeFlowForProtections(test.stateEnabled, test.pkceEnabled, testTime)
			if err != nil {
				t.Fatalf("create flow: %v", err)
			}
			if flow.Scenario.ID != test.wantScenario || len(flow.Findings) != test.wantFindings {
				t.Fatalf("scenario=%q findings=%d, want scenario=%q findings=%d", flow.Scenario.ID, len(flow.Findings), test.wantScenario, test.wantFindings)
			}
			if got := flow.Events[len(flow.Events)-1].Type; got != test.wantFinalEvent {
				t.Errorf("final event = %q, want %q", got, test.wantFinalEvent)
			}
			encoded := strings.Join(func() []string {
				values := []string{}
				for _, event := range flow.Events {
					values = append(values, event.Parameters...)
				}
				return values
			}(), " ")
			if strings.Contains(encoded, "code=synthetic") || strings.Contains(encoded, "access_token=token") {
				t.Errorf("flow contains an unredacted credential: %s", encoded)
			}
		})
	}
}
