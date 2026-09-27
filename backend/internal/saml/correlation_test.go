package saml

import (
	"errors"
	"testing"
	"time"
)

func TestCorrelationRequiredRejectsMismatchAndPreservesPendingRequest(t *testing.T) {
	flow, err := NewCorrelationFlow(ScenarioCorrelationRequired, replayTestTime)
	if err != nil {
		t.Fatalf("create correlation-protected flow: %v", err)
	}
	if flow.Status != "mismatch_rejected" || !flow.Scenario.Secure || len(flow.Events) != 7 {
		t.Fatalf("unexpected protected correlation trace: %#v", flow)
	}
	if flow.Events[5].Type != "response_rejected" || flow.Events[5].Parameters[2] != "pending_request=preserved" {
		t.Fatalf("mismatch event does not prove safe pending-request behavior: %#v", flow.Events[5])
	}
	if flow.Events[6].Parameters[0] != "sessions_created=0" || len(flow.Findings) != 0 {
		t.Fatalf("mismatched response created a session or finding: %#v", flow)
	}
}

func TestCorrelationIgnoredDemonstratesAccountSubstitution(t *testing.T) {
	flow, err := NewCorrelationFlow(ScenarioCorrelationIgnored, replayTestTime)
	if err != nil {
		t.Fatalf("create correlation-disabled flow: %v", err)
	}
	if flow.Status != "mismatch_accepted" || flow.Scenario.Secure || len(flow.Findings) != 1 || flow.Findings[0].Severity != "high" {
		t.Fatalf("unexpected vulnerable correlation trace: %#v", flow)
	}
	if flow.Events[6].Parameters[0] != "session_subject=_user-attacker" || flow.Events[6].Parameters[1] != "browser=victim" {
		t.Fatalf("trace does not demonstrate account substitution: %#v", flow.Events[6])
	}
}

func TestUnsupportedCorrelationScenario(t *testing.T) {
	if _, err := NewCorrelationFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}

func TestCorrelationTraceIsOrderedAndOnlyUsesSyntheticValues(t *testing.T) {
	for _, scenario := range CorrelationScenarios() {
		flow, err := NewCorrelationFlow(scenario.ID, replayTestTime)
		if err != nil {
			t.Fatalf("create %s flow: %v", scenario.ID, err)
		}
		for index, event := range flow.Events {
			if event.Sequence != index+1 || event.Explanation.WhyItMatters == "" {
				t.Errorf("unordered or unexplained event: %#v", event)
			}
			if parsed, err := time.Parse(time.RFC3339, event.Timestamp); err != nil || !parsed.Equal(replayTestTime.Add(time.Duration(index)*time.Second)) {
				t.Errorf("unexpected event timestamp: %q", event.Timestamp)
			}
			for _, field := range event.Parameters {
				if field == "SAMLResponse=<real-value>" || field == "password=<real-value>" {
					t.Errorf("unexpected credential-shaped data in trace: %q", field)
				}
			}
		}
	}
}
