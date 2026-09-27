package saml

import (
	"errors"
	"testing"
)

func TestMatchesBearerRecipientRequiresExactNonEmptyURL(t *testing.T) {
	const acs = "https://sp.example.test/saml/acs"
	tests := []struct {
		name      string
		recipient string
		acs       string
		want      bool
	}{
		{name: "exact URL", recipient: acs, acs: acs, want: true},
		{name: "alternate path", recipient: "https://sp.example.test/saml/other", acs: acs, want: false},
		{name: "trailing slash is not equivalent", recipient: acs + "/", acs: acs, want: false},
		{name: "empty recipient", recipient: "", acs: acs, want: false},
		{name: "empty ACS configuration", recipient: acs, acs: "", want: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := MatchesBearerRecipient(test.recipient, test.acs); got != test.want {
				t.Errorf("MatchesBearerRecipient() = %t, want %t", got, test.want)
			}
		})
	}
}

func TestRecipientEnforcedFlowRejectsMismatchedConfirmation(t *testing.T) {
	flow, err := NewRecipientFlow(ScenarioRecipientEnforced, replayTestTime)
	if err != nil {
		t.Fatalf("create recipient-enforced flow: %v", err)
	}
	if flow.Status != "recipient_rejected" || !flow.Scenario.Secure || len(flow.Events) != 7 || len(flow.Findings) != 0 {
		t.Fatalf("unexpected recipient-enforced flow: %#v", flow)
	}
	if flow.Events[4].Outcome != "recipient match = false" || flow.Events[5].Type != "response_rejected" || flow.Events[6].Parameters[0] != "sessions_created=0" {
		t.Fatalf("trace does not prove fail-closed recipient check: %#v", flow.Events)
	}
}

func TestRecipientIgnoredFlowShowsBypass(t *testing.T) {
	flow, err := NewRecipientFlow(ScenarioRecipientIgnored, replayTestTime)
	if err != nil {
		t.Fatalf("create recipient-ignored flow: %v", err)
	}
	if flow.Status != "recipient_accepted" || flow.Scenario.Secure || len(flow.Findings) != 1 || flow.Findings[0].Severity != "high" {
		t.Fatalf("unexpected recipient-ignored flow: %#v", flow)
	}
	if flow.Events[4].Outcome != "recipient match = false" || flow.Events[5].Type != "response_accepted" {
		t.Fatalf("trace does not expose recipient bypass: %#v", flow.Events)
	}
}

func TestUnsupportedRecipientScenario(t *testing.T) {
	if _, err := NewRecipientFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}
