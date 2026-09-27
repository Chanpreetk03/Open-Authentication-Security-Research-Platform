package oauthoidc

import (
	"errors"
	"testing"
	"time"
)

var testTime = time.Date(2026, 9, 20, 0, 0, 0, 0, time.UTC)

func TestAuthorizationCodeFlowIsRedactedAndOrdered(t *testing.T) {
	flow, err := NewAuthorizationCodeFlow(testTime)
	if err != nil {
		t.Fatalf("create flow: %v", err)
	}
	if flow.Status != "completed" || flow.Scenario.ID != ScenarioSecure || len(flow.Events) != 6 {
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
			if parameter == "code=demo-code" || parameter == "access_token=demo-token" {
				t.Errorf("event %d contains an unredacted secret: %s", index+1, parameter)
			}
		}
	}
}

func TestMissingStateBlocksCallbackBeforeTokenExchange(t *testing.T) {
	flow, err := NewAuthorizationCodeFlowForScenario(ScenarioMissingState, testTime)
	if err != nil {
		t.Fatalf("create missing-state flow: %v", err)
	}
	if flow.Status != "blocked" || len(flow.Events) != 5 {
		t.Fatalf("unexpected missing-state flow: status=%q events=%d", flow.Status, len(flow.Events))
	}
	if last := flow.Events[len(flow.Events)-1]; last.Type != "callback_rejected" {
		t.Errorf("last event = %q, want callback_rejected", last.Type)
	}
	for _, event := range flow.Events {
		if event.Type == "code_redeemed" || event.Type == "access_token_issued" {
			t.Errorf("unexpected token exchange event %q", event.Type)
		}
	}
}

func TestMissingPKCEShowsInterceptedCodeRedemption(t *testing.T) {
	flow, err := NewAuthorizationCodeFlowForScenario(ScenarioMissingPKCE, testTime)
	if err != nil {
		t.Fatalf("create missing-pkce flow: %v", err)
	}
	if flow.Status != "completed_with_finding" || len(flow.Findings) != 1 {
		t.Fatalf("unexpected missing-pkce flow: status=%q findings=%d", flow.Status, len(flow.Findings))
	}
	if event := flow.Events[4]; event.Actor != "attacker" || event.Type != "intercepted_code_redeemed" {
		t.Errorf("unexpected interception event: %#v", event)
	}
}

func TestUnsupportedScenarioIsRejected(t *testing.T) {
	_, err := NewAuthorizationCodeFlowForScenario("unknown", testTime)
	if !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want unsupported scenario", err)
	}
}
