package saml

import (
	"errors"
	"testing"
	"time"
)

var replayTestTime = time.Date(2026, 9, 27, 12, 0, 0, 0, time.UTC)

func TestReplayProtectedFlowRejectsDuplicateBeforeSecondSession(t *testing.T) {
	flow, err := NewReplayFlow(ScenarioReplayProtected, replayTestTime)
	if err != nil {
		t.Fatalf("create protected replay flow: %v", err)
	}
	if flow.Protocol != "SAML 2.0" || flow.Status != "replay_rejected" || len(flow.Events) != 8 {
		t.Fatalf("unexpected protected flow: protocol=%q status=%q events=%d", flow.Protocol, flow.Status, len(flow.Events))
	}
	if got := flow.Events[6].Type; got != "replay_rejected" {
		t.Fatalf("replay event = %q, want replay_rejected", got)
	}
	if got := flow.Events[4].Parameters[1]; got != "cache_entry=recorded" {
		t.Fatalf("first acceptance = %q, want replay cache insert evidence", got)
	}
	if got := flow.Events[7].Parameters[0]; got != "sessions_created=1" {
		t.Fatalf("resource outcome = %q, want one session", got)
	}
	if flow.Scenario.Secure != true || len(flow.Findings) != 0 {
		t.Fatalf("secure scenario has wrong classification or findings: %#v", flow)
	}
}

func TestReplayDisabledFlowShowsSecondSessionAndFinding(t *testing.T) {
	flow, err := NewReplayFlow(ScenarioReplayDisabled, replayTestTime)
	if err != nil {
		t.Fatalf("create unprotected replay flow: %v", err)
	}
	if flow.Status != "replay_accepted" || flow.Scenario.Secure || len(flow.Findings) != 1 {
		t.Fatalf("unexpected replay-disabled flow: status=%q scenario=%#v findings=%d", flow.Status, flow.Scenario, len(flow.Findings))
	}
	if got := flow.Events[6].Type; got != "assertion_accepted" {
		t.Fatalf("replay outcome = %q, want assertion_accepted", got)
	}
	if got := flow.Events[4].Parameters[1]; got != "replay_cache=disabled" {
		t.Fatalf("first acceptance = %q, want disabled replay cache evidence", got)
	}
	if got := flow.Events[7].Parameters[0]; got != "sessions_created=2" {
		t.Fatalf("resource outcome = %q, want two sessions", got)
	}
	if flow.Findings[0].Severity != "high" || flow.Findings[0].Mitigation == "" {
		t.Fatalf("finding lacks severity or mitigation: %#v", flow.Findings[0])
	}
}

func TestReplayTraceUsesOnlySyntheticRedactedValuesAndOrderedTime(t *testing.T) {
	for _, scenario := range Scenarios() {
		flow, err := NewReplayFlow(scenario.ID, replayTestTime)
		if err != nil {
			t.Fatalf("create %s flow: %v", scenario.ID, err)
		}
		for index, event := range flow.Events {
			if event.Sequence != index+1 || event.Explanation.WhyItMatters == "" {
				t.Errorf("event %d is unordered or lacks explanation: %#v", index, event)
			}
			if !eventTimeMatches(t, event.Timestamp, replayTestTime.Add(time.Duration(index)*time.Second)) {
				t.Errorf("event %d has unexpected timestamp %q", event.Sequence, event.Timestamp)
			}
			for _, parameter := range event.Parameters {
				if parameter == "SAMLResponse=<real-value>" || parameter == "Assertion=<real-value>" {
					t.Errorf("event %d exposes a non-synthetic credential", event.Sequence)
				}
			}
		}
	}
}

func TestUnsupportedReplayScenario(t *testing.T) {
	if _, err := NewReplayFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}

func eventTimeMatches(t *testing.T, value string, expected time.Time) bool {
	t.Helper()
	parsed, err := time.Parse(time.RFC3339, value)
	return err == nil && parsed.Equal(expected)
}
