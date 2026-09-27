package saml

import (
	"errors"
	"testing"
	"time"
)

func TestIsWithinConditionWindowBoundaries(t *testing.T) {
	now := time.Date(2026, 9, 27, 12, 0, 0, 0, time.UTC)
	skew := 30 * time.Second
	tests := []struct {
		name         string
		notBefore    time.Time
		notOnOrAfter time.Time
		now          time.Time
		skew         time.Duration
		want         bool
	}{
		{name: "inside interval", notBefore: now.Add(-time.Minute), notOnOrAfter: now.Add(time.Minute), now: now, skew: 0, want: true},
		{name: "NotBefore is inclusive", notBefore: now, notOnOrAfter: now.Add(time.Minute), now: now, skew: 0, want: true},
		{name: "NotOnOrAfter is exclusive", notBefore: now.Add(-time.Minute), notOnOrAfter: now, now: now, skew: 0, want: false},
		{name: "start accepted at skew boundary", notBefore: now, notOnOrAfter: now.Add(time.Minute), now: now.Add(-skew), skew: skew, want: true},
		{name: "start rejected beyond skew", notBefore: now, notOnOrAfter: now.Add(time.Minute), now: now.Add(-skew - time.Nanosecond), skew: skew, want: false},
		{name: "end tolerated within skew", notBefore: now.Add(-time.Minute), notOnOrAfter: now, now: now.Add(skew - time.Nanosecond), skew: skew, want: true},
		{name: "end rejected at skew boundary", notBefore: now.Add(-time.Minute), notOnOrAfter: now, now: now.Add(skew), skew: skew, want: false},
		{name: "impossible interval", notBefore: now, notOnOrAfter: now, now: now, skew: skew, want: false},
		{name: "negative skew rejected", notBefore: now.Add(-time.Minute), notOnOrAfter: now.Add(time.Minute), now: now, skew: -time.Second, want: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := IsWithinConditionWindow(test.notBefore, test.notOnOrAfter, test.now, test.skew); got != test.want {
				t.Errorf("IsWithinConditionWindow() = %t, want %t", got, test.want)
			}
		})
	}
}

func TestConditionsEnforcedFlowRejectsExpiredAssertion(t *testing.T) {
	flow, err := NewConditionsFlow(ScenarioConditionsEnforced, replayTestTime)
	if err != nil {
		t.Fatalf("create conditions-enforced flow: %v", err)
	}
	if flow.Status != "expired_rejected" || !flow.Scenario.Secure || len(flow.Events) != 7 || len(flow.Findings) != 0 {
		t.Fatalf("unexpected conditions-enforced flow: %#v", flow)
	}
	if flow.Events[4].Outcome != "within condition window = false" || flow.Events[5].Type != "response_rejected" || flow.Events[6].Parameters[0] != "sessions_created=0" {
		t.Fatalf("trace does not prove time-window enforcement: %#v", flow.Events)
	}
}

func TestConditionsIgnoredFlowShowsExpiredAssertionBypass(t *testing.T) {
	flow, err := NewConditionsFlow(ScenarioConditionsIgnored, replayTestTime)
	if err != nil {
		t.Fatalf("create conditions-ignored flow: %v", err)
	}
	if flow.Status != "expired_accepted" || flow.Scenario.Secure || len(flow.Findings) != 1 || flow.Findings[0].Severity != "high" {
		t.Fatalf("unexpected conditions-ignored flow: %#v", flow)
	}
	if flow.Events[4].Outcome != "within condition window = false" || flow.Events[5].Type != "response_accepted" {
		t.Fatalf("trace does not demonstrate expired-condition bypass: %#v", flow.Events)
	}
}

func TestUnsupportedConditionsScenario(t *testing.T) {
	if _, err := NewConditionsFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}
